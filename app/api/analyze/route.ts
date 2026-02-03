import { NextRequest, NextResponse } from "next/server";
import { analyzeScreenshot } from "@/lib/claude-client";
import { checkAnalyzeRateLimit, getClientIp } from "@/lib/rate-limit";
import { analyzeRequestSchema, MAX_IMAGE_BASE64_LENGTH } from "@/lib/validators";
import type { AnalyzeResponse } from "@/lib/types";

export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Validate request
    const parseResult = analyzeRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request: ${parseResult.error.issues.map((e) => e.message).join(", ")}`,
        },
        { status: 400 }
      );
    }

    const { image } = parseResult.data;

    // 3. Check image size (10MB limit)
    if (image.length > MAX_IMAGE_BASE64_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: "Image is too large. Maximum size is 10MB.",
        },
        { status: 400 }
      );
    }

    // 4. Check rate limit
    const ip = getClientIp(request);
    const rateLimitResult = await checkAnalyzeRateLimit(ip);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "You've used all your screenshot analyses for today. Try again tomorrow or choose a topic manually.",
        },
        { status: 429 }
      );
    }

    // 5. Verify server API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Service temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      );
    }

    // 6. Detect media type from base64 header or default to jpeg
    let mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" = "image/jpeg";
    let imageData = image;

    // Handle data URL format
    if (image.startsWith("data:")) {
      const match = image.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
      if (match) {
        mediaType = match[1] as typeof mediaType;
        imageData = match[2];
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Unsupported image format. Please use JPG, PNG, or WebP.",
          },
          { status: 400 }
        );
      }
    }

    // 7. Analyze with Claude Vision
    console.log("Analyzing screenshot...");
    const result = await analyzeScreenshot(imageData, mediaType);

    console.log(`Analysis complete: ${result.category}.${result.subcategory} (${result.difficulty})`);
    return NextResponse.json({
      success: true,
      category: result.category,
      subcategory: result.subcategory,
      difficulty: result.difficulty,
      description: result.description,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key") || error.message.includes("not configured")) {
        return NextResponse.json(
          { success: false, error: "Service temporarily unavailable." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to analyze screenshot. Please try again or choose a topic manually." },
      { status: 500 }
    );
  }
}
