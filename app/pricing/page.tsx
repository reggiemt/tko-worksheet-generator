import { Check } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Try it out",
    worksheets: "3 worksheets total",
    features: [
      "3 worksheets — ever",
      "All topics & difficulty levels",
      "Problem modifiers",
      "PDF worksheet + answer key",
      "No account required",
    ],
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
      "Usage dashboard",
    ],
    cta: "Subscribe",
    ctaHref: "#", // TODO: Stripe checkout link
    highlight: true,
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
      "Usage dashboard",
      "Priority generation",
    ],
    cta: "Subscribe",
    ctaHref: "#", // TODO: Stripe checkout link
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1a365d]">
              TKO<span className="text-[#e53e3e]"> Prep</span>
            </span>
            <span className="text-sm text-muted-foreground">Worksheet Generator</span>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#1a365d] mb-4">
            SAT Practice, Your Way
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-generated worksheets tailored to exactly what you need to practice.
            Choose a plan that fits your prep schedule.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative rounded-2xl p-8 flex flex-col
                ${plan.highlight
                  ? "bg-[#1a365d] text-white shadow-xl scale-105 border-2 border-[#e53e3e]"
                  : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md"
                }
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#e53e3e] text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className={`text-xl font-bold ${plan.highlight ? "text-white" : "text-[#1a365d]"}`}>
                  {plan.name}
                </h2>
                <p className={`text-sm mt-1 ${plan.highlight ? "text-gray-300" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : "text-[#1a365d]"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? "text-gray-300" : "text-muted-foreground"}`}>
                  {plan.period}
                </span>
              </div>

              <p className={`text-sm font-medium mb-4 ${plan.highlight ? "text-[#e53e3e]" : "text-[#e53e3e]"}`}>
                {plan.worksheets}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-green-400" : "text-green-600"}`} />
                    <span className={`text-sm ${plan.highlight ? "text-gray-200" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={plan.ctaHref}
                className={`
                  block text-center py-3 px-6 rounded-lg font-medium text-sm transition-all
                  ${plan.highlight
                    ? "bg-white text-[#1a365d] hover:bg-gray-100"
                    : "bg-[#1a365d] text-white hover:bg-[#1a365d]/90"
                  }
                `}
              >
                {plan.cta}
              </a>
            </div>
          ))}
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
