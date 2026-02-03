import { Redis } from "@upstash/redis";
import type { SubscriptionTier } from "./rate-limit";

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

export interface UserSubscription {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  tier: SubscriptionTier;
  status: "active" | "canceled" | "past_due" | "unpaid";
  currentPeriodEnd: number; // unix timestamp
}

function getSubKey(email: string): string {
  return `worksheet:sub:${email.toLowerCase().trim()}`;
}

export async function getSubscription(email: string): Promise<UserSubscription | null> {
  if (!redis) return null;
  const data = await redis.get<UserSubscription>(getSubKey(email));
  return data || null;
}

export async function setSubscription(sub: UserSubscription): Promise<void> {
  if (!redis) return;
  await redis.set(getSubKey(sub.email), sub);
}

export async function deleteSubscription(email: string): Promise<void> {
  if (!redis) return;
  await redis.del(getSubKey(email));
}

export async function getSubscriptionByCustomerId(customerId: string): Promise<UserSubscription | null> {
  if (!redis) return null;
  // Store a reverse lookup: customerId → email
  const email = await redis.get<string>(`worksheet:customer:${customerId}`);
  if (!email) return null;
  return getSubscription(email);
}

export async function setCustomerEmail(customerId: string, email: string): Promise<void> {
  if (!redis) return;
  await redis.set(`worksheet:customer:${customerId}`, email.toLowerCase().trim());
}

export async function getTierForEmail(email: string): Promise<SubscriptionTier> {
  const sub = await getSubscription(email);
  if (!sub) return "free";
  if (sub.status !== "active") return "free";
  if (sub.currentPeriodEnd < Date.now() / 1000) return "free";
  return sub.tier;
}
