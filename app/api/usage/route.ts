import { NextRequest, NextResponse } from "next/server";
import { getUsageInfo, getClientIp, TIER_LIMITS } from "@/lib/rate-limit";
import { getTierForEmail } from "@/lib/subscription";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check auth for paid tier
    let session = null;
    try {
      session = await auth();
    } catch {
      // Auth might fail — continue as unauthenticated
    }

    const userEmail = session?.user?.email || null;
    let tier: "free" | "starter" | "pro" = "free";

    if (userEmail) {
      try {
        tier = await getTierForEmail(userEmail);
      } catch {
        // Redis might fail — default to free
      }
    }

    const userId = userEmail && tier !== "free" ? userEmail : null;

    let usage;
    try {
      usage = await getUsageInfo(ip, userId || undefined, tier);
    } catch {
      // Redis failed — return defaults
      const limit = TIER_LIMITS.free.maxGenerations;
      usage = { tier: "free" as const, used: 0, limit, remaining: limit, period: "month" as const };
    }

    return NextResponse.json({
      ...usage,
      authenticated: !!session?.user,
      email: userEmail,
    });
  } catch (error) {
    console.error("Usage API error:", error);
    // Always return something useful
    return NextResponse.json({
      tier: "free",
      used: 0,
      limit: 5,
      remaining: 5,
      period: "month",
      authenticated: false,
      email: null,
    });
  }
}
