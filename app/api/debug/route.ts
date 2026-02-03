import { NextResponse } from "next/server";

export async function GET() {
  // Only show in non-production or with a secret param
  // Shows which env vars exist (not their values)
  const envCheck = {
    KV_REST_API_URL: !!process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    KV_URL: !!process.env.KV_URL,
    UPSTASH_REDIS_REST_URL: !!process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: !!process.env.UPSTASH_REDIS_REST_TOKEN,
    REDIS_URL: !!process.env.REDIS_URL,
    REDIS_TOKEN: !!process.env.REDIS_TOKEN,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: !!process.env.STRIPE_WEBHOOK_SECRET,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
  };

  // List all env vars that start with KV_ or UPSTASH_ or REDIS_ (names only)
  const kvRelated = Object.keys(process.env).filter(
    (k) => k.startsWith("KV_") || k.startsWith("UPSTASH_") || k.startsWith("REDIS_")
  );

  return NextResponse.json({
    envCheck,
    kvRelatedEnvVars: kvRelated,
    redisConnected: !!(
      process.env.KV_REST_API_URL ||
      process.env.KV_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      process.env.REDIS_URL
    ),
  });
}
