"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SubscribeButtonProps {
  planId: "starter" | "pro" | "pro-annual" | "enterprise";
  label: string;
  className?: string;
}

export function SubscribeButton({ planId, label, className }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();

      if (data.error) {
        if (res.status === 401) {
          // Not signed in — redirect to sign in
          window.location.href = "/api/auth/signin?callbackUrl=/pricing";
          return;
        }
        alert(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading...
        </span>
      ) : (
        label
      )}
    </button>
  );
}
