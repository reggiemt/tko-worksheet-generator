import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import type { SubscriptionTier } from "@/lib/rate-limit";
import { TIER_LIMITS } from "@/lib/rate-limit";

interface UserSubscription {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodEnd: number;
}

interface UserWithUsage extends UserSubscription {
  usedThisMonth: number;
  limit: number;
}

function getRedis(): Redis | null {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    return new Redis({ url: restUrl, token: restToken });
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    if (providedSecret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Redis not connected" }, { status: 500 });
    }

    // Scan for all subscription keys
    const users: UserWithUsage[] = [];
    let cursor = "0";
    const month = new Date().toISOString().slice(0, 7);

    do {
      const [nextCursor, keys] = await redis.scan(Number(cursor), { match: "worksheet:sub:*", count: 100 }) as [string, string[]];
      cursor = String(nextCursor);

      for (const key of keys) {
        const sub = await redis.get<UserSubscription>(key);
        if (sub) {
          // Get usage for this month
          const usageKey = `worksheet:user:${sub.email}:${month}`;
          const used = (await redis.get<number>(usageKey)) || 0;
          const limit = TIER_LIMITS[sub.tier]?.maxGenerations || 0;

          users.push({
            ...sub,
            usedThisMonth: used,
            limit,
          });
        }
      }
    } while (cursor !== "0");

    // Also get free tier usage (IP-based)
    let freeUsers = 0;
    let freeCursor = "0";
    do {
      const [nextFreeCursor, freeKeys] = await redis.scan(Number(freeCursor), { match: `worksheet:free:*:${month}`, count: 100 }) as [string, string[]];
      freeCursor = String(nextFreeCursor);
      freeUsers += freeKeys.length;
    } while (freeCursor !== "0");

    // Sort by tier (unlimited first, then enterprise, pro, starter)
    const tierOrder: Record<string, number> = { unlimited: 0, enterprise: 1, pro: 2, starter: 3, free: 4 };
    users.sort((a, b) => (tierOrder[a.tier] || 99) - (tierOrder[b.tier] || 99));

    return NextResponse.json({
      subscribers: users,
      freeUsersThisMonth: freeUsers,
      totalSubscribers: users.length,
      summary: {
        unlimited: users.filter(u => u.tier === "unlimited").length,
        enterprise: users.filter(u => u.tier === "enterprise").length,
        pro: users.filter(u => u.tier === "pro").length,
        starter: users.filter(u => u.tier === "starter").length,
        active: users.filter(u => u.status === "active").length,
        canceled: users.filter(u => u.status === "canceled").length,
      },
    });
  } catch (error) {
    console.error("Admin users error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Internal server error", details: message }, { status: 500 });
  }
}
