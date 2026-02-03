import { NextRequest, NextResponse } from "next/server";
import { generateProblems } from "@/lib/claude-client";
import { compileLaTeX } from "@/lib/latex-client";
import { buildWorksheetLatex, buildAnswerKeyLatex } from "@/lib/latex-templates";
import { checkGenerateRateLimit, getClientIp } from "@/lib/rate-limit";
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

    const { category, subcategory, difficulty, questionCount } = parseResult.data;

    // 3. Check rate limit
    const ip = getClientIp(request);
    const rateLimitResult = await checkGenerateRateLimit(ip);

    if (!rateLimitResult.success) {
      const hoursRemaining = Math.ceil((rateLimitResult.reset - Date.now()) / 1000 / 60 / 60);
      return NextResponse.json(
        {
          success: false,
          error: `You've used your free worksheet for today. Come back in ${hoursRemaining} hour${hoursRemaining !== 1 ? "s" : ""} for another one! Need more practice? Visit tkoprep.com for personalized tutoring.`,
        },
        { status: 429 }
      );
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
    console.log(`Generating ${questionCount} ${difficulty} problems for ${category}.${subcategory}`);
    const worksheet = await generateProblems({
      category,
      subcategory,
      difficulty,
      questionCount,
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

    // 8. Return base64-encoded PDFs
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
            error: "PDF generation failed. The AI-generated content may have formatting issues. Please try again.",
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
