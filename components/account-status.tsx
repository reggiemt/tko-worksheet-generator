"use client";

import { useEffect, useState } from "react";
import { User, Crown, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface UsageData {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
  authenticated: boolean;
  email: string | null;
}

export function AccountStatus() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
  }, []);

  if (!usage || !usage.authenticated) return null;

  const tierIcon = usage.tier === "unlimited" ? Crown : usage.tier === "pro" ? Crown : usage.tier === "starter" ? Zap : User;
  const TierIcon = tierIcon;
  const tierLabel = usage.tier === "unlimited" ? "Unlimited" : usage.tier === "pro" ? "Pro" : usage.tier === "starter" ? "Starter" : "Free";
  const tierColor = usage.tier === "unlimited" ? "text-amber-600" : usage.tier === "pro" ? "text-purple-600" : usage.tier === "starter" ? "text-blue-600" : "text-slate-500";
  const isUnlimited = usage.tier === "unlimited";
  const progressPct = usage.limit > 0 ? Math.round((usage.used / usage.limit) * 100) : 0;
  const periodLabel = usage.period === "total" ? "" : "this month";

  return (
    <div className="w-full max-w-2xl mx-auto mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 ${tierColor}`}>
            <TierIcon className="h-4 w-4" />
            <span className="text-sm font-semibold">{tierLabel}</span>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-sm text-slate-600">
            {isUnlimited ? "Unlimited worksheets" : `${usage.remaining} of ${usage.limit} worksheets left ${periodLabel}`}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-2 px-4 py-4 rounded-lg bg-white border border-slate-200 shadow-sm space-y-4">
          {/* User info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">{usage.email}</p>
              <p className={`text-xs font-semibold ${tierColor}`}>{tierLabel} Plan</p>
            </div>
            {usage.tier === "free" && (
              <a
                href="/pricing"
                className="text-xs bg-[#1a365d] text-white px-3 py-1.5 rounded-lg hover:bg-[#1a365d]/90 transition-colors font-medium"
              >
                Upgrade
              </a>
            )}
          </div>

          {/* Usage bar */}
          <div>
            {isUnlimited ? (
              <div className="flex items-center gap-2 py-1">
                <div className="h-2 bg-amber-200 rounded-full overflow-hidden flex-1">
                  <div className="h-full rounded-full bg-amber-500 w-full" />
                </div>
                <span className="text-xs text-amber-600 font-medium">∞ Unlimited</span>
              </div>
            ) : (
              <>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{usage.used} used</span>
                  <span>{usage.limit} total</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      progressPct > 80 ? "bg-red-500" : progressPct > 50 ? "bg-amber-500" : "bg-green-500"
                    }`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {usage.remaining} remaining {periodLabel}
                  {usage.period === "month" && " • Resets next month"}
                </p>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            {usage.tier !== "free" && (
              <a
                href="/pricing"
                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
              >
                Manage subscription
              </a>
            )}
            <a
              href="/api/auth/signout"
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors ml-auto"
            >
              Sign out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
