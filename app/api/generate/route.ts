import { NextRequest, NextResponse } from "next/server";
import { generateProblems, verifyProblems, validateAnswerChoices } from "@/lib/claude-client";
import { compileLaTeX } from "@/lib/latex-client";
import type { LatexResource } from "@/lib/latex-client";
import { buildWorksheetLatex, buildAnswerKeyLatex } from "@/lib/latex-templates";
import type { CustomBranding } from "@/lib/latex-templates";
import {
  checkFreeRateLimit,
  incrementFreeUsage,
  checkPaidRateLimit,
  incrementPaidUsage,
  getClientIp,
} from "@/lib/rate-limit";
import { getTierForEmail } from "@/lib/subscription";
import { auth } from "@/auth";
import { generateRequestSchema } from "@/lib/validators";
import { getRedisClient } from "@/lib/redis";
import type { GenerateResponse } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse<GenerateResponse>> {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate request
    const parseResult = generateRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${parseResult.error.issues.map((e) => e.message).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { category, subcategory, difficulty, questionCount, modifiers, topics } = parseResult.data;

    // 3. Check rate limit based on auth status
    const ip = getClientIp(request);

    // Check auth session for paid tier
    const session = await auth();
    const userEmail = session?.user?.email || null;
    const tier = userEmail ? await getTierForEmail(userEmail) : "free";
    const userId = userEmail && tier !== "free" ? userEmail : null;

    if (userId && tier !== "free") {
      // Paid user — check monthly pool
      const rateLimitResult = await checkPaidRateLimit(userId, tier);
      if (!rateLimitResult.success) {
        const daysRemaining = rateLimitResult.reset
          ? Math.ceil((rateLimitResult.reset - Date.now()) / 1000 / 60 / 60 / 24)
          : 0;
        return NextResponse.json(
          {
            success: false,
            error: `You've used all your worksheets for this month. Your pool resets in ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""}. Upgrade your plan for more at /pricing.`,
          },
          { status: 429 }
        );
      }
    } else {
      // Free user — check 3-total limit
      const rateLimitResult = await checkFreeRateLimit(ip);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "You've used all 5 free worksheets this month! Upgrade to Starter ($5/mo) for 30 worksheets/month, or Pro ($25/mo) for 100.",
          },
          { status: 429 }
        );
      }
    }

    // 4. Verify server API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    // 5. Validate multi-topic is only used by paid users
    if (topics && topics.length > 1) {
      if (tier === "free") {
        return NextResponse.json(
          {
            success: false,
            error: "Multi-screenshot worksheets require a paid plan. Upgrade at /pricing.",
          },
          { status: 403 }
        );
      }
    }

    // 6. Generate problems via Claude
    const activeModifiers = modifiers
      ? Object.entries(modifiers)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];

    const effectiveTopics = topics && topics.length > 1 ? topics : undefined;
    console.log(
      effectiveTopics
        ? `Generating ${questionCount} ${difficulty} mixed-topic problems for ${effectiveTopics.map((t) => `${t.category}.${t.subcategory}`).join(", ")}${activeModifiers.length ? ` [modifiers: ${activeModifiers.join(", ")}]` : ""}`
        : `Generating ${questionCount} ${difficulty} problems for ${category}.${subcategory}${activeModifiers.length ? ` [modifiers: ${activeModifiers.join(", ")}]` : ""}`
    );
    let worksheet = await generateProblems({
      category,
      subcategory,
      difficulty,
      questionCount,
      modifiers,
      topics: effectiveTopics,
    });

    // 6.5a  Quick structural validation (no API call)
    const choiceIssues = validateAnswerChoices(worksheet.problems, worksheet.answers);
    if (choiceIssues.length > 0) {
      console.log(`Answer-choice validation issues: ${choiceIssues.join("; ")}`);
    }

    // 6.5b  Blind verification — have Claude re-solve and compare
    const verification = await verifyProblems(worksheet.problems, worksheet.answers);
    if (!verification.passed) {
      const failCount = verification.problemResults.filter((r) => !r.passed).length;
      console.log(
        `Verification failed for ${failCount} problem(s): ${verification.problemResults
          .filter((r) => !r.passed)
          .map((r) => `#${r.number} (expected ${r.expectedAnswer}, got ${r.verifiedAnswer})`)
          .join(", ")}. Regenerating…`
      );

      // Retry ONCE
      worksheet = await generateProblems({
        category,
        subcategory,
        difficulty,
        questionCount,
        modifiers,
        topics: effectiveTopics,
      });

      const recheck = await verifyProblems(worksheet.problems, worksheet.answers);
      if (!recheck.passed) {
        const stillFailed = recheck.problemResults.filter((r) => !r.passed).length;
        console.log(
          `Verification still failed for ${stillFailed} problem(s) after retry. Proceeding with best effort.`
        );
      }
    }

    // 7. Look up custom branding for Enterprise/Unlimited users
    let customBranding: CustomBranding | undefined;
    let additionalResources: LatexResource[] | undefined;

    if (userEmail && (tier === "enterprise" || tier === "unlimited")) {
      const redis = getRedisClient();
      if (redis) {
        const [logoData, brandingData] = await Promise.all([
          redis.get<string>(`worksheet:logo:${userEmail.toLowerCase().trim()}`),
          redis.get<{ orgName: string; mimeType: string }>(
            `worksheet:branding:${userEmail.toLowerCase().trim()}`
          ),
        ]);

        if (logoData || brandingData?.orgName) {
          customBranding = {
            orgName: brandingData?.orgName || undefined,
            logoBase64: logoData || undefined,
            logoMimeType: brandingData?.mimeType || undefined,
          };

          // If there's a logo image, add it as a resource for the LaTeX compiler
          if (logoData) {
            additionalResources = [
              {
                path: "customlogo.png",
                file: logoData,
              },
            ];
            console.log("Custom branding: logo + org name included");
          } else {
            console.log("Custom branding: org name only");
          }
        }
      }
    }

    // 8. Build LaTeX documents
    console.log("Building LaTeX documents...");
    const worksheetLatex = buildWorksheetLatex(worksheet, customBranding);

    // Skip answer key for free tier to save compilation costs
    const isFree = tier === "free";
    const answerKeyLatex = isFree ? null : buildAnswerKeyLatex(worksheet, customBranding);

    // 9. Compile to PDF via LaTeX-on-HTTP
    console.log("Compiling LaTeX to PDF...");
    const worksheetPdf = await compileLaTeX(worksheetLatex, { additionalResources });
    const answerKeyPdf = answerKeyLatex ? await compileLaTeX(answerKeyLatex, { additionalResources }) : null;

    // 10. Increment usage AFTER successful generation
    if (userId && tier !== "free") {
      await incrementPaidUsage(userId);
    } else {
      await incrementFreeUsage(ip);
    }

    // 9.5 Track analytics stats for dashboard
    try {
      const redis = getRedisClient();
      if (redis && userEmail) {
        const now = new Date();
        const month = now.toISOString().slice(0, 7); // YYYY-MM
        const day = now.toISOString().slice(0, 10); // YYYY-MM-DD
        const topicKey = category ? `${category}.${subcategory}` : "unknown";

        await Promise.all([
          redis.hincrby(`worksheet:stats:${userEmail}:topics:${month}`, topicKey, 1),
          redis.hincrby(`worksheet:stats:${userEmail}:difficulty:${month}`, difficulty, 1),
          redis.incr(`worksheet:stats:${userEmail}:daily:${day}`),
        ]);

        // Set TTL on stats keys (90 days = 7776000 seconds)
        const TTL_90_DAYS = 7776000;
        await Promise.all([
          redis.expire(`worksheet:stats:${userEmail}:topics:${month}`, TTL_90_DAYS),
          redis.expire(`worksheet:stats:${userEmail}:difficulty:${month}`, TTL_90_DAYS),
          redis.expire(`worksheet:stats:${userEmail}:daily:${day}`, TTL_90_DAYS),
        ]);
      }
    } catch (statsError) {
      // Don't fail the request if stats tracking fails
      console.error("Analytics stats tracking error:", statsError);
    }

    // 11. For free tier, store worksheet data in Redis for email-gated unlock
    let worksheetId: string | undefined;
    if (isFree) {
      const redis = getRedisClient();
      if (redis) {
        worksheetId = crypto.randomUUID();
        await redis.set(
          `worksheet:temp:${worksheetId}`,
          JSON.stringify(worksheet),
          { ex: 3600 } // 1 hour TTL
        );
      }
    }

    // 12. Return base64-encoded PDFs
    console.log("Generation complete!");
    return NextResponse.json({
      success: true,
      worksheetPdf: worksheetPdf.toString("base64"),
      ...(answerKeyPdf ? { answerKeyPdf: answerKeyPdf.toString("base64") } : {}),
      ...(worksheetId ? { worksheetId } : {}),
      metadata: worksheet.metadata,
    });
  } catch (error) {
    console.error("Generation error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("not configured")) {
        return NextResponse.json(
          { success: false, error: "Service temporarily unavailable. Please try again later." },
          { status: 503 }
        );
      }
      if (error.message.includes("rate") || error.message.includes("limit")) {
        return NextResponse.json(
          { success: false, error: "Service is busy. Please try again in a few minutes." },
          { status: 429 }
        );
      }
      if (error.message.includes("LaTeX")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "PDF generation failed. The AI-generated content may have formatting issues. Please try again.",
          },
          { status: 500 }
        );
      }
      if (error.message.includes("parse") || error.message.includes("JSON")) {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse AI response. Please try again.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
