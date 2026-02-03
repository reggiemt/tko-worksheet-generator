import { NextRequest, NextResponse } from "next/server";
import { getUsageInfo, getClientIp, TIER_LIMITS } from "@/lib/rate-limit";
import { getTierForEmail } from "@/lib/subscription";
import { auth } from "@/auth";

const DEFAULT_RESPONSE = {
  tier: "free" as const,
  used: 0,
  limit: TIER_LIMITS.free.maxGenerations,
  remaining: TIER_LIMITS.free.maxGenerations,
  period: "month" as const,
  authenticated: false,
  email: null as string | null,
};

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check auth with timeout (2 seconds max)
    const session = await withTimeout(
      auth().catch(() => null),
      2000,
      null
    );

    const userEmail = session?.user?.email || null;
    const authenticated = !!session?.user;

    // Check tier with timeout (2 seconds max)
    let tier: "free" | "starter" | "pro" = "free";
    if (userEmail) {
      tier = await withTimeout(
        getTierForEmail(userEmail).catch(() => "free" as const),
        2000,
        "free" as const
      );
    }

    const userId = userEmail && tier !== "free" ? userEmail : null;

    // Get usage with timeout (2 seconds max)
    const usage = await withTimeout(
      getUsageInfo(ip, userId || undefined, tier).catch(() => ({
        ...DEFAULT_RESPONSE,
        tier,
      })),
      2000,
      { ...DEFAULT_RESPONSE, tier }
    );

    return NextResponse.json({
      ...usage,
      authenticated,
      email: userEmail,
    });
  } catch (error) {
    console.error("Usage API error:", error);
    return NextResponse.json(DEFAULT_RESPONSE);
  }
}
