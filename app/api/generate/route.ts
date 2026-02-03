import { NextRequest, NextResponse } from "next/server";
import { generateProblems } from "@/lib/claude-client";
import { compileLaTeX } from "@/lib/latex-client";
import { buildWorksheetLatex, buildAnswerKeyLatex } from "@/lib/latex-templates";
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

    const { category, subcategory, difficulty, questionCount, modifiers } = parseResult.data;

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

    // 5. Generate problems via Claude
    const activeModifiers = modifiers
      ? Object.entries(modifiers)
          .filter(([, v]) => v)
          .map(([k]) => k)
      : [];
    console.log(
      `Generating ${questionCount} ${difficulty} problems for ${category}.${subcategory}${activeModifiers.length ? ` [modifiers: ${activeModifiers.join(", ")}]` : ""}`
    );
    const worksheet = await generateProblems({
      category,
      subcategory,
      difficulty,
      questionCount,
      modifiers,
    });

    // 6. Build LaTeX documents
    console.log("Building LaTeX documents...");
    const worksheetLatex = buildWorksheetLatex(worksheet);
    const answerKeyLatex = buildAnswerKeyLatex(worksheet);

    // 7. Compile to PDF via LaTeX-on-HTTP
    console.log("Compiling LaTeX to PDF...");
    const [worksheetPdf, answerKeyPdf] = await Promise.all([
      compileLaTeX(worksheetLatex),
      compileLaTeX(answerKeyLatex),
    ]);

    // 8. Increment usage AFTER successful generation
    if (userId && tier !== "free") {
      await incrementPaidUsage(userId);
    } else {
      await incrementFreeUsage(ip);
    }

    // 9. Return base64-encoded PDFs
    console.log("Generation complete!");
    return NextResponse.json({
      success: true,
      worksheetPdf: worksheetPdf.toString("base64"),
      answerKeyPdf: answerKeyPdf.toString("base64"),
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
