import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  setSubscription,
  setCustomerEmail,
  getSubscriptionByCustomerId,
  deleteSubscription,
} from "@/lib/subscription";
import type { SubscriptionTier } from "@/lib/rate-limit";
import Stripe from "stripe";

function getTierFromPlan(planMetadata: string | undefined): SubscriptionTier {
  if (planMetadata === "enterprise") return "enterprise";
  if (planMetadata === "pro" || planMetadata === "pro-annual") return "pro";
  if (planMetadata === "starter") return "starter";
  return "starter"; // default for unknown plans
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.customer && session.subscription) {
          const customerId = typeof session.customer === "string"
            ? session.customer
            : session.customer.id;
          const email = session.customer_details?.email || session.metadata?.email || "";

          if (email) {
            await setCustomerEmail(customerId, email);

            const subscriptionId = typeof session.subscription === "string"
              ? session.subscription
              : session.subscription.id;

            // Get subscription to read metadata
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const tier = getTierFromPlan(subscription.metadata?.plan);

            // Calculate period end as ~30 days from now (safe fallback)
            const periodEnd = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

            await setSubscription({
              email,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              tier,
              status: "active",
              currentPeriodEnd: periodEnd,
            });

            console.log(`Subscription activated: ${email} → ${tier}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        const existing = await getSubscriptionByCustomerId(customerId);
        if (existing) {
          const tier = getTierFromPlan(subscription.metadata?.plan);
          const status = subscription.status === "active"
            ? "active"
            : subscription.status === "past_due"
            ? "past_due"
            : subscription.status === "canceled"
            ? "canceled"
            : "unpaid";

          // Extend period end on renewal
          const periodEnd = status === "active"
            ? Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60
            : existing.currentPeriodEnd;

          await setSubscription({
            ...existing,
            tier,
            status,
            stripeSubscriptionId: subscription.id,
            currentPeriodEnd: periodEnd,
          });

          console.log(`Subscription updated: ${existing.email} → ${tier} (${status})`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

        const existing = await getSubscriptionByCustomerId(customerId);
        if (existing) {
          await setSubscription({
            ...existing,
            status: "canceled",
            tier: "free",
          });
          console.log(`Subscription canceled: ${existing.email}`);
        }
        break;
      }

      default:
        // Unhandled event type
        break;
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
