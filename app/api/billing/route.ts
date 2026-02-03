import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Find the Stripe customer
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length === 0) {
      return NextResponse.json(
        { error: "No subscription found." },
        { status: 404 }
      );
    }

    const customerId = existingCustomers.data[0].id;

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Billing portal error:", error);
    return NextResponse.json(
      { error: "Failed to open billing portal." },
      { status: 500 }
    );
  }
}
