"use client";

import { useEffect, useState } from "react";
import { LogIn, LogOut, User, Settings } from "lucide-react";

interface AuthState {
  authenticated: boolean;
  email: string | null;
}

export function AuthButton() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    fetch("/api/usage")
      .then((r) => r.json())
      .then((data) => {
        setAuth({
          authenticated: data.authenticated,
          email: data.email,
        });
      })
      .catch(() => {});
  }, []);

  if (!auth) {
    // Show sign in while loading
    return (
      <a
        href="/signin"
        className="flex items-center gap-1.5 text-sm text-[#1a365d] hover:text-[#e53e3e] transition-colors font-medium"
      >
        <LogIn className="h-4 w-4" />
        <span className="hidden sm:block">Sign In</span>
      </a>
    );
  }

  if (auth.authenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 hidden sm:block">
          {auth.email}
        </span>
        <a
          href="/settings"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-[#1a365d] transition-colors"
          title="Account Settings"
        >
          <Settings className="h-4 w-4" />
        </a>
        <a
          href="/api/auth/signout"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </a>
      </div>
    );
  }

  return (
    <a
      href="/signin"
      className="flex items-center gap-1.5 text-sm text-[#1a365d] hover:text-[#e53e3e] transition-colors font-medium"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:block">Sign In</span>
    </a>
  );
}
