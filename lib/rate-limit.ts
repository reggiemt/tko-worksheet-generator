import { Redis } from "@upstash/redis";
import type { RateLimitResult } from "./types";

// Vercel KV auto-sets these env vars (same as Upstash)
// Parse Redis connection — supports REST API vars or redis:// protocol URL
function getRedisConfig(): { url: string; token: string } | null {
  // Preferred: REST API credentials
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    return { url: restUrl, token: restToken };
  }

  // Fallback: parse redis:// URL (from Vercel KV / Upstash)
  // Format: redis://default:PASSWORD@HOSTNAME:PORT
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      const hostname = parsed.hostname;
      const password = parsed.password;
      if (hostname && password) {
        return {
          url: `https://${hostname}`,
          token: password,
        };
      }
    } catch {
      console.error("Failed to parse REDIS_URL:", redisUrl?.substring(0, 30));
    }
  }

  return null;
}

let _redis: Redis | null | undefined = undefined;

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis;
  const config = getRedisConfig();
  if (config) {
    try {
      _redis = new Redis(config);
    } catch {
      _redis = null;
    }
  } else {
    _redis = null;
  }
  return _redis;
}

// ── Tier definitions ──────────────────────────────────────────────
export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise" | "unlimited";

interface TierLimits {
  maxGenerations: number;
  period: "total" | "month";
  label: string;
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: { maxGenerations: 3, period: "total", label: "Free" },
  starter: { maxGenerations: 30, period: "month", label: "Starter" },
  pro: { maxGenerations: 100, period: "month", label: "Pro" },
  enterprise: { maxGenerations: 500, period: "month", label: "Enterprise" },
  unlimited: { maxGenerations: 999999, period: "month", label: "Unlimited" },
};

// ── Free tier tracking (no login required) ────────────────────────

function getFreeKey(ip: string): string {
  // Lifetime total — no monthly reset
  return `worksheet:free:${ip}:total`;
}

export async function checkFreeRateLimit(ip: string): Promise<RateLimitResult> {
  if (!getRedis()) {
    console.warn("Rate limiting disabled: Redis not configured");
    return { success: true, remaining: 999, reset: 0 };
  }

  const key = getFreeKey(ip);
  const count = (await getRedis()!.get<number>(key)) || 0;
  const limit = TIER_LIMITS.free.maxGenerations;

  if (count >= limit) {
    return {
      success: false,
      remaining: 0,
      reset: 0, // No reset — lifetime limit
    };
  }

  return {
    success: true,
    remaining: limit - count,
    reset: 0,
  };
}

export async function incrementFreeUsage(ip: string): Promise<void> {
  if (!getRedis()) return;
  const key = getFreeKey(ip);
  await getRedis()!.incr(key);
  // No expiry — lifetime limit
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
  if (!getRedis()) {
    return { success: true, remaining: 999, reset: 0 };
  }

  if (tier === "free") {
    // Shouldn't happen for logged-in users, but handle gracefully
    return { success: false, remaining: 0, reset: 0 };
  }

  const key = getPaidKey(userId);
  const count = (await getRedis()!.get<number>(key)) || 0;
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
  if (!getRedis()) return;
  const key = getPaidKey(userId);
  const exists = await getRedis()!.exists(key);
  await getRedis()!.incr(key);

  if (!exists) {
    // Set expiry to end of month + 1 day buffer
    const now = new Date();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 2);
    const ttlSeconds = Math.ceil((endOfMonth.getTime() - now.getTime()) / 1000);
    await getRedis()!.expire(key, ttlSeconds);
  }
}

// ── Screenshot analysis (generous limit for all users) ────────────

export async function checkAnalyzeRateLimit(ip: string): Promise<RateLimitResult> {
  if (!getRedis()) {
    return { success: true, remaining: 999, reset: 0 };
  }

  const key = `worksheet:analyze:${ip}`;
  const count = (await getRedis()!.get<number>(key)) || 0;

  if (count >= 10) {
    return { success: false, remaining: 0, reset: 0 };
  }

  // Increment and set 24h TTL
  await getRedis()!.incr(key);
  if (count === 0) {
    await getRedis()!.expire(key, 86400);
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
  if (!getRedis()) {
    const limit = TIER_LIMITS.free.maxGenerations;
    return { tier: "free", used: 0, limit, remaining: limit, period: "total" };
  }

  const effectiveTier = tier || "free";

  if (userId && effectiveTier !== "free") {
    const key = getPaidKey(userId);
    const count = (await getRedis()!.get<number>(key)) || 0;
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
  const count = (await getRedis()!.get<number>(key)) || 0;
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
