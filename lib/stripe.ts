import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

// Convenience alias
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop];
  },
});

// Price IDs will be set after creating products in Stripe
// For now, we create them dynamically on first use
export const PLAN_CONFIG = {
  starter: {
    name: "Starter",
    price: 500, // $5.00 in cents
    worksheets: 30,
    interval: "month" as const,
    mode: "subscription" as const,
  },
  pro: {
    name: "Pro",
    price: 2500, // $25.00 in cents
    worksheets: 100,
    interval: "month" as const,
    mode: "subscription" as const,
  },
  "pro-annual": {
    name: "Pro Annual",
    price: 20000, // $200.00 in cents
    worksheets: 100,
    interval: "year" as const,
    mode: "subscription" as const,
  },
  enterprise: {
    name: "Enterprise",
    price: 9900, // $99.00 in cents
    worksheets: 500,
    interval: "month" as const,
    mode: "subscription" as const,
  },
};

export type PlanId = keyof typeof PLAN_CONFIG;
