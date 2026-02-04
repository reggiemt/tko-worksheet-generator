import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { buildAnswerKeyLatex } from "@/lib/latex-templates";
import { compileLaTeX } from "@/lib/latex-client";
import type { GeneratedWorksheet } from "@/lib/types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadData {
  email: string;
  firstSeen: string;
  lastSeen: string;
  unlockCount: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, worksheetId } = body as { email?: string; worksheetId?: string };

    // Validate inputs
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!worksheetId || typeof worksheetId !== "string") {
      return NextResponse.json(
        { success: false, error: "Worksheet ID is required." },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { success: false, error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }

    // Check monthly unlock limit
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const unlockFlagKey = `worksheet:lead-unlock:${normalizedEmail}:${monthKey}`;

    const alreadyUnlocked = await redis.get<string>(unlockFlagKey);
    if (alreadyUnlocked) {
      return NextResponse.json(
        {
          success: false,
          error: "already_used",
          message: "You've already used your free answer key this month.",
        },
        { status: 429 }
      );
    }

    // Look up worksheet data
    const worksheetDataRaw = await redis.get<string>(`worksheet:temp:${worksheetId}`);
    if (!worksheetDataRaw) {
      return NextResponse.json(
        {
          success: false,
          error: "expired",
          message: "This worksheet has expired. Please generate a new one to unlock the answer key.",
        },
        { status: 410 }
      );
    }

    // Parse worksheet data — Redis may return parsed object or string
    let worksheet: GeneratedWorksheet;
    if (typeof worksheetDataRaw === "string") {
      worksheet = JSON.parse(worksheetDataRaw) as GeneratedWorksheet;
    } else {
      worksheet = worksheetDataRaw as unknown as GeneratedWorksheet;
    }

    // Store/update lead data
    const leadKey = `worksheet:leads:${normalizedEmail}`;
    const existingLead = await redis.get<LeadData>(leadKey);
    const leadData: LeadData = {
      email: normalizedEmail,
      firstSeen: existingLead?.firstSeen || now.toISOString(),
      lastSeen: now.toISOString(),
      unlockCount: (existingLead?.unlockCount || 0) + 1,
    };
    await redis.set(leadKey, JSON.stringify(leadData));

    // Set monthly unlock flag (45-day TTL)
    await redis.set(unlockFlagKey, "1", { ex: 45 * 24 * 60 * 60 });

    // Generate the answer key PDF
    console.log(`Generating answer key for lead: ${normalizedEmail}`);
    const answerKeyLatex = buildAnswerKeyLatex(worksheet);
    const answerKeyPdf = await compileLaTeX(answerKeyLatex);

    // Clean up the temporary worksheet data (optional — let TTL handle it)
    // await redis.del(`worksheet:temp:${worksheetId}`);

    return NextResponse.json({
      success: true,
      answerKeyPdf: answerKeyPdf.toString("base64"),
    });
  } catch (error) {
    console.error("Unlock answer key error:", error);

    if (error instanceof Error && error.message.includes("LaTeX")) {
      return NextResponse.json(
        {
          success: false,
          error: "pdf_failed",
          message: "Failed to generate the answer key PDF. Please try again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
