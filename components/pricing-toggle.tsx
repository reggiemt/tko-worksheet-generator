"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { SubscribeButton } from "@/components/subscribe-button";

interface Plan {
  name: string;
  price: string;
  period: string;
  savings?: string;
  description: string;
  worksheets: string;
  features: string[];
  planId: "starter" | "pro" | "pro-annual" | "enterprise" | null;
  cta: string;
  ctaHref: string;
  highlight: boolean;
}

interface PricingToggleProps {
  plans: {
    monthly: Plan[];
    annual: Plan[];
  };
}

export function PricingToggle({ plans }: PricingToggleProps) {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const activePlans = plans[billing];

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-12">
        <span
          className={`text-sm font-medium cursor-pointer ${
            billing === "monthly" ? "text-[#1a365d]" : "text-slate-400"
          }`}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </span>
        <button
          onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            billing === "annual" ? "bg-[#1a365d]" : "bg-slate-300"
          }`}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
              billing === "annual" ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
        <span
          className={`text-sm font-medium cursor-pointer ${
            billing === "annual" ? "text-[#1a365d]" : "text-slate-400"
          }`}
          onClick={() => setBilling("annual")}
        >
          Annual
        </span>
        {billing === "annual" && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Save $100 on Pro
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {activePlans.map((plan) => (
          <div
            key={plan.name}
            className={`
              relative rounded-2xl p-7 flex flex-col
              ${plan.highlight
                ? "bg-[#1a365d] text-white shadow-xl scale-[1.03] border-2 border-[#e53e3e]"
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md"
              }
            `}
          >
            {plan.highlight && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#e53e3e] text-white text-sm font-medium rounded-full whitespace-nowrap">
                Most Popular
              </div>
            )}

            {plan.savings && (
              <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                {plan.savings}
              </div>
            )}

            <div className="mb-5">
              <h2 className={`text-xl font-bold ${plan.highlight ? "text-white" : "text-[#1a365d]"}`}>
                {plan.name}
              </h2>
              <p className={`text-sm mt-1 ${plan.highlight ? "text-gray-300" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
            </div>

            <div className="mb-5">
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

            <ul className="space-y-2.5 mb-7 flex-1">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-green-400" : "text-green-600"}`} />
                  <span className={`text-sm ${plan.highlight ? "text-gray-200" : "text-muted-foreground"}`}>
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            {plan.planId ? (
              <SubscribeButton
                planId={plan.planId}
                label={plan.cta}
                className={`
                  w-full block text-center py-3 px-6 rounded-lg font-medium text-sm transition-all cursor-pointer
                  ${plan.highlight
                    ? "bg-white text-[#1a365d] hover:bg-gray-100"
                    : "bg-[#1a365d] text-white hover:bg-[#1a365d]/90"
                  }
                `}
              />
            ) : (
              <a
                href={plan.ctaHref}
                className={`
                  block text-center py-3 px-6 rounded-lg font-medium text-sm transition-all
                  bg-[#1a365d] text-white hover:bg-[#1a365d]/90
                `}
              >
                {plan.cta}
              </a>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
