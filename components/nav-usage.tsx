"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Zap, User } from "lucide-react";

interface UsageData {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
  authenticated: boolean;
  email: string | null;
}

export function NavUsage() {
  const [usage, setUsage] = useState<UsageData | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage) return null;

  const tier = usage.tier || "free";
  const isFree = tier === "free";
  const isUnlimited = tier === "unlimited";

  // Tier colors matching AccountStatus
  const tierColor =
    tier === "unlimited"
      ? "text-amber-600"
      : tier === "enterprise"
        ? "text-emerald-600"
        : tier === "pro"
          ? "text-purple-600"
          : tier === "starter"
            ? "text-blue-600"
            : "text-slate-500";

  const tierLabel =
    tier === "unlimited"
      ? "Unlimited"
      : tier === "enterprise"
        ? "Enterprise"
        : tier === "pro"
          ? "Pro"
          : tier === "starter"
            ? "Starter"
            : "";

  // Tier icon
  const TierIcon =
    tier === "unlimited" || tier === "enterprise" || tier === "pro"
      ? Crown
      : tier === "starter"
        ? Zap
        : User;

  // Compact display text
  let displayText: string;
  if (isUnlimited) {
    displayText = "∞ Unlimited";
  } else if (isFree) {
    displayText = `${usage.remaining}/${usage.limit} free`;
  } else {
    displayText = `${usage.remaining}/${usage.limit}`;
  }

  const isLow = !isUnlimited && usage.remaining <= 1;

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs">
      {!isFree && (
        <TierIcon className={`h-3.5 w-3.5 ${tierColor}`} />
      )}
      <span
        className={`font-medium ${
          isLow ? "text-amber-600" : isFree ? "text-slate-500" : tierColor
        }`}
      >
        {displayText}
      </span>
      {!isFree && tierLabel && (
        <span className={`font-semibold ${tierColor}`}>
          · {tierLabel}
        </span>
      )}
      {isFree && (
        <Link
          href="/pricing"
          className="ml-1 text-[#e53e3e] hover:text-[#c53030] font-semibold transition-colors"
        >
          Upgrade
        </Link>
      )}
    </div>
  );
}
