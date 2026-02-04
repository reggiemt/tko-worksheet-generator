import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";
import { buildAnswerKeyLatex } from "@/lib/latex-templates";
import { compileLaTeX } from "@/lib/latex-client";
import type { GeneratedWorksheet } from "@/lib/types";
import { randomUUID } from "crypto";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LeadData {
  email: string;
  firstSeen: string;
  lastSeen: string;
  unlockCount: number;
}

async function sendAnswerKeyEmail(email: string, downloadUrl: string): Promise<boolean> {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.warn("AGENTMAIL_API_KEY not configured — cannot send email");
    return false;
  }

  try {
    const response = await fetch(
      "https://api.agentmail.to/v0/inboxes/clawd-tko%40agentmail.to/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: [email],
          subject: "Your SAT Worksheet Answer Key 📝",
          text: `Here's the answer key for your SAT practice worksheet!\n\nDownload your answer key:\n${downloadUrl}\n\nThis link expires in 24 hours.\n\n---\n\nWant unlimited answer keys + advanced problem modifiers?\nUpgrade your plan: https://www.testprepsheets.com/pricing\n\nHappy studying! 🥊\n— TKO Prep\nhttps://testprepsheets.com`,
        }),
      }
    );

    if (!response.ok) {
      console.error("AgentMail send failed:", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("AgentMail send error:", error);
    return false;
  }
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

    // Store PDF with a download token (24hr TTL)
    const downloadToken = randomUUID();
    await redis.set(
      `worksheet:download:${downloadToken}`,
      answerKeyPdf.toString("base64"),
      { ex: 86400 }
    );

    // Build download URL
    const baseUrl = process.env.NEXTAUTH_URL || "https://www.testprepsheets.com";
    const downloadUrl = `${baseUrl}/api/download/answer-key?token=${downloadToken}`;

    // Send email with download link
    const emailSent = await sendAnswerKeyEmail(normalizedEmail, downloadUrl);

    if (emailSent) {
      return NextResponse.json({
        success: true,
        delivered: "email",
        message: `Answer key sent to ${normalizedEmail}! Check your inbox.`,
      });
    } else {
      // Fallback: return PDF directly if email fails
      console.warn("Email failed — falling back to direct download");
      return NextResponse.json({
        success: true,
        delivered: "direct",
        answerKeyPdf: answerKeyPdf.toString("base64"),
        message: "Answer key ready for download.",
      });
    }
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
