import { NextRequest, NextResponse } from "next/server";
import { setSubscription } from "@/lib/subscription";
import type { SubscriptionTier } from "@/lib/rate-limit";

const VALID_TIERS: SubscriptionTier[] = ["free", "starter", "pro"];

export async function POST(request: NextRequest) {
  try {
    // Verify admin secret
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json(
        { error: "Admin endpoint not configured." },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (providedSecret !== adminSecret) {
      return NextResponse.json(
        { error: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, tier } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!tier || !VALID_TIERS.includes(tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${VALID_TIERS.join(", ")}` },
        { status: 400 }
      );
    }

    if (tier === "free") {
      // Setting to free = remove subscription
      const { deleteSubscription } = await import("@/lib/subscription");
      await deleteSubscription(email);
      return NextResponse.json({
        success: true,
        message: `${email} set to free tier (subscription removed).`,
      });
    }

    // Set a manual subscription (no Stripe IDs needed)
    // Give a generous period end — 10 years for manually comped users
    const periodEnd = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60;

    await setSubscription({
      email: email.toLowerCase().trim(),
      stripeCustomerId: "admin_manual",
      stripeSubscriptionId: "admin_manual",
      tier,
      status: "active",
      currentPeriodEnd: periodEnd,
    });

    return NextResponse.json({
      success: true,
      message: `${email} set to ${tier} tier (expires in ~10 years).`,
    });
  } catch (error) {
    console.error("Admin set-tier error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
