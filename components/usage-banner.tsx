"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface UsageInfo {
  tier: string;
  used: number;
  limit: number;
  remaining: number;
  period: string;
}

interface UsageBannerProps {
  onLimitReached?: () => void;
  refreshKey?: number; // increment to trigger refresh
}

export function UsageBanner({ onLimitReached, refreshKey }: UsageBannerProps) {
  const [usage, setUsage] = useState<UsageInfo | null>(null);

  const fetchUsage = async () => {
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
        if (data.remaining <= 0 && onLimitReached) {
          onLimitReached();
        }
      }
    } catch {
      // Silently fail — don't block the UI
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [refreshKey]);

  if (!usage) return null;

  const isLow = usage.remaining <= 1 && usage.remaining > 0;
  const isOut = usage.remaining <= 0;
  const periodLabel = usage.period === "total" ? "total" : "this month";

  if (usage.tier !== "free" && !isLow && !isOut) {
    // Paid users with plenty remaining — show subtle counter
    return (
      <div className="text-xs text-center text-muted-foreground">
        {usage.remaining} of {usage.limit} worksheets remaining {periodLabel} •{" "}
        <span className="capitalize">{usage.tier}</span> plan
      </div>
    );
  }

  if (isOut) {
    return (
      <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
        <div className="text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            {usage.tier === "free"
              ? "You've used all 5 free worksheets this month"
              : `You've used all ${usage.limit} worksheets ${periodLabel}`}
          </p>
          {usage.tier === "free" ? (
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              Need more practice? Upgrade to <strong>Starter ($5/mo)</strong> for 30 worksheets/month or{" "}
              <strong>Pro ($25/mo)</strong> for 100.{" "}
              <a href="/pricing" className="underline font-medium">
                View plans →
              </a>
            </p>
          ) : (
            <p className="mt-1 text-amber-700 dark:text-amber-300">
              Your pool resets next month.{" "}
              <a href="/pricing" className="underline font-medium">
                Upgrade your plan →
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isLow) {
    return (
      <div className="text-xs text-center text-amber-600 dark:text-amber-400">
        ⚠️ {usage.remaining} free worksheet{usage.remaining === 1 ? "" : "s"} remaining ({periodLabel})
        {usage.tier === "free" && (
          <>
            {" "}
            •{" "}
            <a href="/pricing" className="underline">
              Upgrade for more
            </a>
          </>
        )}
      </div>
    );
  }

  // Free tier with uses remaining
  return (
    <div className="text-xs text-center text-muted-foreground">
      {usage.remaining} of {usage.limit} free worksheets remaining
    </div>
  );
}
