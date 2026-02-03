import { NextRequest, NextResponse } from "next/server";
import { stripe, PLAN_CONFIG, type PlanId } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to subscribe." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const planId = body.planId as PlanId;

    if (!planId || !PLAN_CONFIG[planId]) {
      return NextResponse.json(
        { error: "Invalid plan." },
        { status: 400 }
      );
    }

    const plan = PLAN_CONFIG[planId];
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Create or retrieve Stripe customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: session.user.email,
        name: session.user.name || undefined,
        metadata: { plan: planId },
      });
      customerId = customer.id;
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Test Prep Sheets — ${plan.name} Plan`,
              description: `${plan.worksheets} SAT worksheets per month`,
            },
            unit_amount: plan.price,
            recurring: {
              interval: plan.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/?subscribed=${planId}`,
      cancel_url: `${baseUrl}/pricing`,
      subscription_data: {
        metadata: {
          plan: planId,
          email: session.user.email,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
