import { NextRequest, NextResponse } from "next/server";
import { generateProblems, verifyProblems, validateAnswerChoices, regenerateFailedProblems } from "@/lib/claude-client";
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
import type { GenerateResponse, GenerateStreamEvent } from "@/lib/types";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
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
      const rateLimitResult = await checkFreeRateLimit(ip);
      if (!rateLimitResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: "You've used all 3 free worksheets! Upgrade to Starter ($5/mo) for 30 worksheets/month, or Pro ($25/mo) for 100.",
          },
          { status: 429 }
        );
      }
    }

    // 4. Verify server API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable. Please try again later." },
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

    // All validation passed — start streaming response
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: GenerateStreamEvent) => {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        };

        try {
          // 6. Generate problems via Claude
          const activeModifiers = modifiers
            ? Object.entries(modifiers)
                .filter(([, v]) => v)
                .map(([k]) => k)
            : [];

          const effectiveTopics = topics && topics.length > 1 ? topics : undefined;
          const topicCount = effectiveTopics?.length || 1;

          send({
            type: "progress",
            step: "generating",
            message: effectiveTopics
              ? `Generating ${questionCount} problems across ${topicCount} topics...`
              : `Generating ${questionCount} ${difficulty} problems...`,
            percent: 10,
          });

          console.log(
            effectiveTopics
              ? `Generating ${questionCount} ${difficulty} mixed-topic problems for ${effectiveTopics.map((t) => `${t.category}.${t.subcategory}`).join(", ")}${activeModifiers.length ? ` [modifiers: ${activeModifiers.join(", ")}]` : ""}`
              : `Generating ${questionCount} ${difficulty} problems for ${category}.${subcategory}${activeModifiers.length ? ` [modifiers: ${activeModifiers.join(", ")}]` : ""}`
          );

          let worksheet;
          const maxRetries = 2;
          for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
              worksheet = await generateProblems({
                category,
                subcategory,
                difficulty,
                questionCount,
                modifiers,
                topics: effectiveTopics,
              });
              break; // Success — exit retry loop
            } catch (genError) {
              if (genError instanceof Error && genError.message.includes("parse") && attempt <= maxRetries) {
                console.log(`Generation attempt ${attempt} failed to parse: ${genError.message}. Retrying...`);
                send({
                  type: "progress",
                  step: "retrying",
                  message: `AI response had formatting issues — retrying (attempt ${attempt + 1})...`,
                  percent: 15 + attempt * 5,
                });
              } else {
                throw genError;
              }
            }
          }

          send({
            type: "progress",
            step: "validating",
            message: "Checking answer choices...",
            percent: 30,
          });

          // 6.5a Quick structural validation
          const choiceIssues = validateAnswerChoices(worksheet.problems, worksheet.answers);
          if (choiceIssues.length > 0) {
            console.log(`Answer-choice validation issues: ${choiceIssues.join("; ")}`);
          }

          // 6.5b Blind verification
          send({
            type: "progress",
            step: "verifying",
            message: "Verifying answers are correct...",
            percent: 40,
          });

          const verification = await verifyProblems(worksheet.problems, worksheet.answers);
          if (!verification.passed) {
            const failedNumbers = verification.problemResults
              .filter((r) => !r.passed)
              .map((r) => r.number);
            const failCount = failedNumbers.length;
            console.log(
              `Verification failed for ${failCount} problem(s): ${verification.problemResults
                .filter((r) => !r.passed)
                .map((r) => `#${r.number} (expected ${r.expectedAnswer}, got ${r.verifiedAnswer})`)
                .join(", ")}. Regenerating failed problems only…`
            );

            send({
              type: "progress",
              step: "regenerating",
              message: `Fixing ${failCount} problem${failCount > 1 ? "s" : ""} with answer issues...`,
              percent: 55,
            });

            // Targeted retry — only regenerate the failed problems
            worksheet = await regenerateFailedProblems(
              worksheet,
              failedNumbers,
              { category, subcategory, difficulty, questionCount, modifiers, topics: effectiveTopics }
            );

            send({
              type: "progress",
              step: "reverifying",
              message: "Re-verifying fixed problems...",
              percent: 65,
            });

            const recheck = await verifyProblems(worksheet.problems, worksheet.answers);
            if (!recheck.passed) {
              const stillFailed = recheck.problemResults.filter((r) => !r.passed).length;
              console.log(
                `Verification still failed for ${stillFailed} problem(s) after targeted retry. Proceeding with best effort.`
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

                if (logoData) {
                  additionalResources = [{ path: "customlogo.png", file: logoData }];
                  console.log("Custom branding: logo + org name included");
                } else {
                  console.log("Custom branding: org name only");
                }
              }
            }
          }

          // 8. Build LaTeX documents
          send({
            type: "progress",
            step: "building",
            message: "Building worksheet PDF...",
            percent: 75,
          });

          console.log("Building LaTeX documents...");
          const worksheetLatex = buildWorksheetLatex(worksheet, customBranding);
          const isFree = tier === "free";
          const answerKeyLatex = isFree ? null : buildAnswerKeyLatex(worksheet, customBranding);

          // 9. Compile to PDF
          send({
            type: "progress",
            step: "compiling",
            message: "Compiling PDF (this may take a moment)...",
            percent: 85,
          });

          console.log("Compiling LaTeX to PDF...");
          // Compile worksheet + answer key in parallel for speed
          const [worksheetPdf, answerKeyPdf] = await Promise.all([
            compileLaTeX(worksheetLatex, { additionalResources }),
            answerKeyLatex
              ? compileLaTeX(answerKeyLatex, { additionalResources })
              : Promise.resolve(null),
          ]);

          // 10. Increment usage
          if (userId && tier !== "free") {
            await incrementPaidUsage(userId);
          } else {
            await incrementFreeUsage(ip);
          }

          // 10.5 Track analytics stats
          try {
            const redis = getRedisClient();
            if (redis && userEmail) {
              const now = new Date();
              const month = now.toISOString().slice(0, 7);
              const day = now.toISOString().slice(0, 10);
              const topicKey = category ? `${category}.${subcategory}` : "unknown";

              await Promise.all([
                redis.hincrby(`worksheet:stats:${userEmail}:topics:${month}`, topicKey, 1),
                redis.hincrby(`worksheet:stats:${userEmail}:difficulty:${month}`, difficulty, 1),
                redis.incr(`worksheet:stats:${userEmail}:daily:${day}`),
              ]);

              const TTL_90_DAYS = 7776000;
              await Promise.all([
                redis.expire(`worksheet:stats:${userEmail}:topics:${month}`, TTL_90_DAYS),
                redis.expire(`worksheet:stats:${userEmail}:difficulty:${month}`, TTL_90_DAYS),
                redis.expire(`worksheet:stats:${userEmail}:daily:${day}`, TTL_90_DAYS),
              ]);
            }
          } catch (statsError) {
            console.error("Analytics stats tracking error:", statsError);
          }

          // 11. For free tier, store worksheet data for email-gated unlock
          let worksheetId: string | undefined;
          if (isFree) {
            const redis = getRedisClient();
            if (redis) {
              worksheetId = crypto.randomUUID();
              await redis.set(`worksheet:temp:${worksheetId}`, JSON.stringify(worksheet), {
                ex: 3600,
              });
            }
          }

          // 12. Send complete response
          send({
            type: "progress",
            step: "done",
            message: "Done!",
            percent: 100,
          });

          console.log("Generation complete!");
          const responseData: GenerateResponse = {
            success: true,
            worksheetPdf: worksheetPdf.toString("base64"),
            ...(answerKeyPdf ? { answerKeyPdf: answerKeyPdf.toString("base64") } : {}),
            ...(worksheetId ? { worksheetId } : {}),
            metadata: worksheet.metadata,
          };

          send({ type: "complete", data: responseData });
        } catch (error) {
          console.error("Generation error:", error);

          let errorMessage = "An unexpected error occurred. Please try again.";
          if (error instanceof Error) {
            if (error.message.includes("API key") || error.message.includes("not configured")) {
              errorMessage = "Service temporarily unavailable. Please try again later.";
            } else if (error.message.includes("rate") || error.message.includes("limit")) {
              errorMessage = "Service is busy. Please try again in a few minutes.";
            } else if (error.message.includes("LaTeX")) {
              // Include attempt details for debugging
              console.error("LaTeX failure details:", error.message);
              // Show a more helpful error with attempt info
              const attemptInfo = error.message.includes("Errors:")
                ? ` Debug: ${error.message.substring(error.message.indexOf("Errors:"))}`
                : "";
              errorMessage =
                `PDF generation failed. The AI-generated content may have formatting issues. Please try again.${attemptInfo}`;
            } else if (error.message.includes("parse") || error.message.includes("JSON")) {
              errorMessage = "Failed to parse AI response. Please try again.";
            }
          }

          send({ type: "error", error: errorMessage });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    // Handle errors that occur before streaming starts (e.g. JSON parse failure)
    console.error("Pre-stream error:", error);
    return NextResponse.json(
      { success: false, error: "Invalid request." },
      { status: 400 }
    );
  }
}
