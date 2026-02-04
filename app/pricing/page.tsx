import { Check, X, Crown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { SubscribeButton } from "@/components/subscribe-button";
import { PricingToggle } from "@/components/pricing-toggle";

const PLANS = {
  monthly: [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Get started free",
      worksheets: "3 free worksheets",
      features: [
        "3 free worksheets",
        "All SAT math topics",
        "3 difficulty levels",
        "PDF worksheet download",
        "Unlock 1 answer key via email",
        "No account required",
      ],
      planId: null as null,
      cta: "Start Generating",
      ctaHref: "/",
      highlight: false,
    },
    {
      name: "Starter",
      price: "$5",
      period: "/month",
      description: "For regular practice",
      worksheets: "30 worksheets/month",
      features: [
        "30 worksheets per month",
        "All topics & difficulty levels",
        "✅ Answer keys included",
        "✅ Problem modifiers (fractions, no-Desmos, etc.)",
        "Upload up to 3 screenshots",
        "Auto-detect topics from photos",
        "No daily cap",
      ],
      planId: "starter" as const,
      cta: "Get Starter — $5/mo",
      ctaHref: "#",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$25",
      period: "/month",
      description: "Most popular",
      worksheets: "100 worksheets/month",
      features: [
        "100 worksheets per month",
        "Everything in Starter, plus:",
        "Upload up to 10 screenshots",
        "Multi-topic mixed worksheets",
        "Priority generation",
        "Best value for serious prep",
      ],
      planId: "pro" as const,
      cta: "Go Pro — $25/mo",
      ctaHref: "#",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For schools & tutors",
      worksheets: "500 worksheets/month",
      features: [
        "500 worksheets per month",
        "Everything in Pro, plus:",
        "Custom logo on worksheets",
        "Usage analytics dashboard",
        "Priority email support",
        "Invoice/PO billing available",
        "Multi-user team access",
      ],
      planId: "enterprise" as const,
      cta: "Get Enterprise — $99/mo",
      ctaHref: "#",
      highlight: false,
    },
  ],
  annual: [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Get started free",
      worksheets: "3 free worksheets",
      features: [
        "3 free worksheets",
        "All SAT math topics",
        "3 difficulty levels",
        "PDF worksheet download",
        "Unlock 1 answer key via email",
        "No account required",
      ],
      planId: null as null,
      cta: "Start Generating",
      ctaHref: "/",
      highlight: false,
    },
    {
      name: "Starter",
      price: "$5",
      period: "/month",
      description: "For regular practice",
      worksheets: "30 worksheets/month",
      features: [
        "30 worksheets per month",
        "All topics & difficulty levels",
        "✅ Answer keys included",
        "✅ Problem modifiers (fractions, no-Desmos, etc.)",
        "Upload up to 3 screenshots",
        "Auto-detect topics from photos",
        "No daily cap",
      ],
      planId: "starter" as const,
      cta: "Get Starter — $5/mo",
      ctaHref: "#",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$200",
      period: "/year",
      savings: "Save $100",
      description: "Most popular",
      worksheets: "100 worksheets/month",
      features: [
        "100 worksheets per month",
        "Everything in Starter, plus:",
        "Upload up to 10 screenshots",
        "Multi-topic mixed worksheets",
        "Priority generation",
        "Best value for serious prep",
      ],
      planId: "pro-annual" as const,
      cta: "Go Pro — $200/year",
      ctaHref: "#",
      highlight: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For schools & tutors",
      worksheets: "500 worksheets/month",
      features: [
        "500 worksheets per month",
        "Everything in Pro, plus:",
        "Custom logo on worksheets",
        "Usage analytics dashboard",
        "Priority email support",
        "Invoice/PO billing available",
        "Multi-user team access",
      ],
      planId: "enterprise" as const,
      cta: "Get Enterprise — $99/mo",
      ctaHref: "#",
      highlight: false,
    },
  ],
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
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
          <Link
            href="/"
            className="text-sm text-[#1a365d] hover:underline"
          >
            ← Back to Generator
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1a365d] mb-4">
            SAT Practice, Your Way
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-generated worksheets tailored to exactly what you need to practice.
            Choose the plan that fits your prep schedule.
          </p>
        </div>

        {/* Billing Toggle + Cards */}
        <PricingToggle plans={PLANS} />

        {/* Comparison Note */}
        <div className="max-w-2xl mx-auto mt-12 bg-slate-50 dark:bg-gray-900 rounded-xl p-6 border border-slate-200 dark:border-gray-800">
          <h3 className="font-semibold text-[#1a365d] mb-3 text-center">What&apos;s included at every level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" /> All 23 SAT math topics</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" /> 3 difficulty levels</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" /> Printable PDF format</div>
            <div className="flex items-center gap-2"><Check className="h-4 w-4 text-green-600 shrink-0" /> Step-by-step solutions</div>
          </div>
        </div>

        {/* FAQ / Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Need personalized SAT tutoring?{" "}
            <a
              href="https://tkoprep.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1a365d] font-medium hover:underline"
            >
              Visit TKO Prep →
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
