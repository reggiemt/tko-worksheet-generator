import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Cancellation & Refund Policy | Test Prep Sheets by TKO Prep",
  description:
    "Cancellation and Refund Policy for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={32}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-[#1a365d]">TKO Prep</span>
          </Link>
          <Link href="/" className="text-sm text-[#1a365d] hover:underline">
            &larr; Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
        <h1>Cancellation &amp; Refund Policy</h1>
        <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>

        <h2>Cancellation</h2>
        <p>
          You may cancel your Test Prep Sheets subscription at any time from your account
          settings. No cancellation fees apply.
        </p>
        <p>
          When you cancel, your subscription remains active through the end of your current
          billing period. You will continue to have access to your plan&rsquo;s worksheet
          generation limits until that period ends. After that, your account will revert to
          the free tier (5 worksheets per month).
        </p>

        <h2>Refunds</h2>
        <p>
          Because Test Prep Sheets is a digital service with immediate access upon payment,
          we generally do not offer partial refunds for unused portions of a billing period.
        </p>
        <p>
          However, we want you to be satisfied with our service. If you believe a refund is
          warranted, please reach out to us:
        </p>
        <ul>
          <li>
            <strong>Within 48 hours of a charge:</strong> Refund requests submitted within
            48 hours of being charged will be considered on a case-by-case basis. We aim to
            be fair and reasonable.
          </li>
          <li>
            <strong>After 48 hours:</strong> Refund requests after 48 hours are generally
            not eligible, but we encourage you to contact us if you have extenuating
            circumstances.
          </li>
        </ul>

        <h2>How to Request a Refund</h2>
        <p>
          To request a refund, email us at{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>{" "}
          with the following information:
        </p>
        <ul>
          <li>Your account email address</li>
          <li>The date of the charge</li>
          <li>The reason for your refund request</li>
        </ul>
        <p>We will respond to refund requests within 2 business days.</p>

        <h2>Billing Errors</h2>
        <p>
          If you believe you were charged in error (e.g., charged after cancelling), please
          contact us immediately at{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>
          . We will investigate and correct any billing errors promptly.
        </p>

        <h2>Free Tier</h2>
        <p>
          The free tier of Test Prep Sheets (5 worksheets per month) requires no payment
          and no account. There is nothing to cancel or refund for free tier usage.
        </p>

        <h2>Contact</h2>
        <p>
          For any questions about cancellation, billing, or refunds, contact us at:{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>
        </p>
      </main>
    </div>
  );
}
