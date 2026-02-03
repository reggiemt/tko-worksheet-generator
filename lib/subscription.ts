import { Redis } from "@upstash/redis";
import type { SubscriptionTier } from "./rate-limit";

function getRedisConfig(): { url: string; token: string } | null {
  const restUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const restToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (restUrl && restToken) {
    return { url: restUrl, token: restToken };
  }
  const redisUrl = process.env.REDIS_URL || process.env.KV_URL;
  if (redisUrl) {
    try {
      const parsed = new URL(redisUrl);
      if (parsed.hostname && parsed.password) {
        return { url: `https://${parsed.hostname}`, token: parsed.password };
      }
    } catch { /* ignore */ }
  }
  return null;
}

let _subRedis: Redis | null | undefined = undefined;

function getRedis(): Redis | null {
  if (_subRedis !== undefined) return _subRedis;
  const config = getRedisConfig();
  if (config) {
    try {
      _subRedis = new Redis(config);
    } catch {
      _subRedis = null;
    }
  } else {
    _subRedis = null;
  }
  return _subRedis;
}

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
  if (!getRedis()) return null;
  const data = await getRedis()!.get<UserSubscription>(getSubKey(email));
  return data || null;
}

export async function setSubscription(sub: UserSubscription): Promise<void> {
  if (!getRedis()) return;
  await getRedis()!.set(getSubKey(sub.email), sub);
}

export async function deleteSubscription(email: string): Promise<void> {
  if (!getRedis()) return;
  await getRedis()!.del(getSubKey(email));
}

export async function getSubscriptionByCustomerId(customerId: string): Promise<UserSubscription | null> {
  if (!getRedis()) return null;
  // Store a reverse lookup: customerId → email
  const email = await getRedis()!.get<string>(`worksheet:customer:${customerId}`);
  if (!email) return null;
  return getSubscription(email);
}

export async function setCustomerEmail(customerId: string, email: string): Promise<void> {
  if (!getRedis()) return;
  await getRedis()!.set(`worksheet:customer:${customerId}`, email.toLowerCase().trim());
}

export async function getTierForEmail(email: string): Promise<SubscriptionTier> {
  const sub = await getSubscription(email);
  if (!sub) return "free";
  if (sub.status !== "active") return "free";
  if (sub.currentPeriodEnd < Date.now() / 1000) return "free";
  return sub.tier;
}
