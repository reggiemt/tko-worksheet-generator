import { Redis } from "@upstash/redis";
import type { RateLimitResult } from "./types";

// Vercel KV auto-sets these env vars (same as Upstash)
const isRedisConfigured = !!(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
) || !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = isRedisConfigured
  ? new Redis({
      url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL)!,
      token: (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN)!,
    })
  : null;

// ── Tier definitions ──────────────────────────────────────────────
export type SubscriptionTier = "free" | "starter" | "pro";

interface TierLimits {
  maxGenerations: number;
  period: "total" | "month";
  label: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { maxGenerations: 3, period: "total", label: "Free" },
  starter: { maxGenerations: 30, period: "month", label: "Starter" },
  pro: { maxGenerations: 100, period: "month", label: "Pro" },
};

// ── Free tier tracking (no login required) ────────────────────────

function getFreeKey(ip: string): string {
  return `worksheet:free:${ip}`;
}

export async function checkFreeRateLimit(ip: string): Promise<RateLimitResult> {
  if (!redis) {
    console.warn("Rate limiting disabled: Redis not configured");
    return { success: true, remaining: 999, reset: 0 };
  }

  const key = getFreeKey(ip);
  const count = (await redis.get<number>(key)) || 0;
  const limit = TIER_LIMITS.free.maxGenerations;

  if (count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: 0, // No reset — 3 total forever
    };
  }

  return {
    success: true,
    remaining: limit - count,
    reset: 0,
  };
}

export async function incrementFreeUsage(ip: string): Promise<void> {
  if (!redis) return;
  const key = getFreeKey(ip);
  await redis.incr(key);
  // No expiry — "3 total ever"
}

// ── Paid tier tracking (requires userId) ──────────────────────────

function getPaidKey(userId: string): string {
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  return `worksheet:user:${userId}:${month}`;
}

export async function checkPaidRateLimit(
  userId: string,
  tier: SubscriptionTier
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, remaining: 999, reset: 0 };
  }

  if (tier === "free") {
    // Shouldn't happen for logged-in users, but handle gracefully
    return { success: false, remaining: 0, reset: 0 };
  }

  const key = getPaidKey(userId);
  const count = (await redis.get<number>(key)) || 0;
  const limit = TIER_LIMITS[tier].maxGenerations;

  // Reset timestamp = end of current month
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  if (count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: endOfMonth.getTime(),
    };
  }

  return {
    success: true,
    remaining: limit - count,
    reset: endOfMonth.getTime(),
  };
}

export async function incrementPaidUsage(userId: string): Promise<void> {
  if (!redis) return;
  const key = getPaidKey(userId);
  const exists = await redis.exists(key);
  await redis.incr(key);

  if (!exists) {
    // Set expiry to end of month + 1 day buffer
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
    const ttlSeconds = Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000);
    await redis.expire(key, ttlSeconds);
  }
}

// ── Screenshot analysis (generous limit for all users) ────────────

export async function checkAnalyzeRateLimit(ip: string): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const key = `worksheet:analyze:${ip}`;
  const count = (await redis.get<number>(key)) || 0;

  if (count >= 10) {
    return { success: false, remaining: 0, reset: 0 };
  }

  // Increment and set 24h TTL
  await redis.incr(key);
  if (count === 0) {
    await redis.expire(key, 86400);
  }

  return { success: true, remaining: 10 - count, reset: 0 };
}

// ── Usage info (for UI display) ───────────────────────────────────

export interface UsageInfo {
  tier: SubscriptionTier;
  used: number;
  limit: number;
  remaining: number;
  period: "total" | "month";
}

export async function getUsageInfo(
  ip: string,
  userId?: string,
  tier?: SubscriptionTier
): Promise<UsageInfo> {
  if (!redis) {
    return { tier: "free", used: 0, limit: 3, remaining: 3, period: "total" };
  }

  const effectiveTier = tier || "free";

  if (userId && effectiveTier !== "free") {
    const key = getPaidKey(userId);
    const count = (await redis.get<number>(key)) || 0;
    const limit = TIER_LIMITS[effectiveTier].maxGenerations;
    return {
      tier: effectiveTier,
      used: count,
      limit,
      remaining: Math.max(0, limit - count),
      period: "month",
    };
  }

  // Free tier
  const key = getFreeKey(ip);
  const count = (await redis.get<number>(key)) || 0;
  const limit = TIER_LIMITS.free.maxGenerations;
  return {
    tier: "free",
    used: count,
    limit,
    remaining: Math.max(0, limit - count),
    period: "total",
  };
}

// ── Helpers ───────────────────────────────────────────────────────

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) return vercelIp.split(",")[0].trim();

  return "anonymous";
}
