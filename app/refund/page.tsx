import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const metadata = {
  title: "Cancellation & Refund Policy | Test Prep Sheets by TKO Prep",
  description:
    "Cancellation and Refund Policy for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={32}
              height={40}
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1a365d] leading-tight">TKO Prep</span>
              <span className="text-[10px] text-slate-500 leading-tight -mt-0.5">Worksheet Generator</span>
            </div>
          </Link>
          <Link href="/" className="text-sm text-[#1a365d] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#1a365d] mb-4">
            <BookOpen className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wide">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-2">Cancellation &amp; Refund Policy</h1>
          <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Cancellation</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You may cancel your Test Prep Sheets subscription at any time from your account
              settings. No cancellation fees apply.
            </p>
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong>What happens when you cancel:</strong> Your subscription remains active through the end
                of your current billing period. You&rsquo;ll continue to have full access to your plan&rsquo;s features
                until that period ends. After that, your account reverts to the free tier (5 worksheets
                per month, no answer keys, no modifiers).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Refunds</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Because Test Prep Sheets is a digital service with immediate access upon payment,
              we generally do not offer partial refunds for unused portions of a billing period.
              However, we want you to be satisfied with our service.
            </p>

            <div className="space-y-3">
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <h3 className="font-semibold text-green-800 text-sm mb-1">Within 48 hours of a charge</h3>
                <p className="text-sm text-green-700">
                  Refund requests submitted within 48 hours of being charged will be considered on a
                  case-by-case basis. We aim to be fair and reasonable.
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                <h3 className="font-semibold text-amber-800 text-sm mb-1">After 48 hours</h3>
                <p className="text-sm text-amber-700">
                  Refund requests after 48 hours are generally not eligible, but we encourage you
                  to contact us if you have extenuating circumstances.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">How to Request a Refund</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              To request a refund, email us at{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>{" "}
              with the following information:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-2">
              <li>Your account email address</li>
              <li>The date of the charge</li>
              <li>The reason for your refund request</li>
            </ol>
            <p className="text-slate-600 leading-relaxed mt-3">
              We will respond to refund requests within <strong>2 business days</strong>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Billing Errors</h2>
            <p className="text-slate-600 leading-relaxed">
              If you believe you were charged in error (e.g., charged after cancelling), please
              contact us immediately at{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>.
              We will investigate and correct any billing errors promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Free Tier</h2>
            <p className="text-slate-600 leading-relaxed">
              The free tier of Test Prep Sheets (5 worksheets per month) requires no payment
              and no account. There is nothing to cancel or refund for free tier usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For any questions about cancellation, billing, or refunds, contact us at:{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>
            </p>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-[#1a365d] underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:text-[#1a365d] underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#1a365d] underline">Back to Generator</Link>
        </div>
      </main>
    </div>
  );
}
