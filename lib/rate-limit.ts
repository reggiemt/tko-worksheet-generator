import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { RateLimitResult } from "./types";

// Check if Upstash is configured
const isUpstashConfigured = !!(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

// Create Redis client only if configured
const redis = isUpstashConfigured
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Free tier: 1 worksheet per day per IP
const generateLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(1, "24 h"),
      analytics: true,
      prefix: "sat-generator:generate",
    })
  : null;

// Screenshot analysis: 5 per day per IP (more generous since it's lighter)
const analyzeLimiter = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "24 h"),
      analytics: true,
      prefix: "sat-generator:analyze",
    })
  : null;

export async function checkGenerateRateLimit(ip: string): Promise<RateLimitResult> {
  // If Upstash is not configured, allow all requests (development mode)
  if (!generateLimiter) {
    console.warn("Rate limiting disabled: Upstash not configured");
    return {
      success: true,
      remaining: 999,
      reset: Date.now() + 86400000,
    };
  }

  const identifier = `ip:${ip}`;
  const result = await generateLimiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export async function checkAnalyzeRateLimit(ip: string): Promise<RateLimitResult> {
  if (!analyzeLimiter) {
    console.warn("Rate limiting disabled: Upstash not configured");
    return {
      success: true,
      remaining: 999,
      reset: Date.now() + 86400000,
    };
  }

  const identifier = `ip:${ip}`;
  const result = await analyzeLimiter.limit(identifier);

  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
  };
}

export function getClientIp(request: Request): string {
  // Try various headers that might contain the real IP
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0].trim();
  }

  return "anonymous";
}
