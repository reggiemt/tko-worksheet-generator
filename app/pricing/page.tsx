import { Check } from "lucide-react";
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
      description: "Try it out",
      worksheets: "5 worksheets/month",
      features: [
        "5 worksheets per month",
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "No account required",
      ],
      planId: null as null,
      cta: "Get Started",
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
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Use anytime — no daily cap",
      ],
      planId: "starter" as const,
      cta: "Subscribe — $5/mo",
      ctaHref: "#",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$25",
      period: "/month",
      description: "For serious prep",
      worksheets: "100 worksheets/month",
      features: [
        "100 worksheets per month",
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Priority generation",
      ],
      planId: "pro" as const,
      cta: "Subscribe — $25/mo",
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
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Priority generation",
        "Ideal for tutoring companies",
      ],
      planId: "enterprise" as const,
      cta: "Subscribe — $99/mo",
      ctaHref: "#",
      highlight: false,
    },
  ],
  annual: [
    {
      name: "Free",
      price: "$0",
      period: "",
      description: "Try it out",
      worksheets: "5 worksheets/month",
      features: [
        "5 worksheets per month",
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "No account required",
      ],
      planId: null as null,
      cta: "Get Started",
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
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Use anytime — no daily cap",
      ],
      planId: "starter" as const,
      cta: "Subscribe — $5/mo",
      ctaHref: "#",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$200",
      period: "/year",
      savings: "Save $100",
      description: "For serious prep",
      worksheets: "100 worksheets/month",
      features: [
        "100 worksheets per month",
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Priority generation",
      ],
      planId: "pro-annual" as const,
      cta: "Subscribe — $200/year",
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
        "All topics & difficulty levels",
        "Problem modifiers",
        "PDF worksheet + answer key",
        "Screenshot upload & auto-detect",
        "Multi-screenshot worksheets",
        "Priority generation",
        "Ideal for tutoring companies",
      ],
      planId: "enterprise" as const,
      cta: "Subscribe — $99/mo",
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
            Choose a plan that fits your prep schedule.
          </p>
        </div>

        {/* Billing Toggle + Cards */}
        <PricingToggle plans={PLANS} />

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
