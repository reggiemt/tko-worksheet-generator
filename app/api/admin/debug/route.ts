import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET;
  const authHeader = request.headers.get("authorization");
  const providedSecret = authHeader?.replace("Bearer ", "");

  if (!adminSecret || providedSecret !== adminSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const envCheck = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: !!process.env.REDIS_URL,
    KV_URL: !!process.env.KV_URL,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    ADMIN_SECRET: !!process.env.ADMIN_SECRET,
  };

  // Try Redis connection
  let redisStatus = "not configured";
  try {
    const { Redis } = await import("@upstash/redis");
    const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (restUrl && restToken) {
      const redis = new Redis({ url: restUrl, token: restToken });
      await redis.ping();
      redisStatus = "connected";
    } else {
      redisStatus = "no credentials found";
    }
  } catch (error) {
    redisStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
  }

  return NextResponse.json({ envCheck, redisStatus });
}
