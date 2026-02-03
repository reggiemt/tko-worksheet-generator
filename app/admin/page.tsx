"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Users, Crown, Zap, User, RefreshCw, TrendingUp, AlertCircle } from "lucide-react";

interface UserData {
  email: string;
  tier: string;
  status: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  currentPeriodEnd: number;
  usedThisMonth: number;
  limit: number;
}

interface AdminData {
  subscribers: UserData[];
  freeUsersThisMonth: number;
  totalSubscribers: number;
  summary: {
    unlimited: number;
    enterprise: number;
    pro: number;
    starter: number;
    active: number;
    canceled: number;
  };
}

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set tier state
  const [setTierEmail, setSetTierEmail] = useState("");
  const [setTierValue, setSetTierValue] = useState("pro");
  const [setTierLoading, setSetTierLoading] = useState(false);
  const [setTierResult, setSetTierResult] = useState<string | null>(null);

  const fetchUsers = useCallback(async (adminSecret: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${adminSecret}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch");
      setData(json);
      setAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret) fetchUsers(secret);
  };

  const handleSetTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setTierEmail) return;
    setSetTierLoading(true);
    setSetTierResult(null);
    try {
      const res = await fetch("/api/admin/set-tier", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: setTierEmail, tier: setTierValue }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      setSetTierResult(json.message);
      setSetTierEmail("");
      // Refresh user list
      fetchUsers(secret);
    } catch (err) {
      setSetTierResult(`Error: ${err instanceof Error ? err.message : "Failed"}`);
    } finally {
      setSetTierLoading(false);
    }
  };

  const tierIcon = (tier: string) => {
    switch (tier) {
      case "unlimited": return <Crown className="h-4 w-4 text-amber-500" />;
      case "enterprise": return <Crown className="h-4 w-4 text-emerald-500" />;
      case "pro": return <Crown className="h-4 w-4 text-purple-500" />;
      case "starter": return <Zap className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const tierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      unlimited: "bg-amber-100 text-amber-700",
      enterprise: "bg-emerald-100 text-emerald-700",
      pro: "bg-purple-100 text-purple-700",
      starter: "bg-blue-100 text-blue-700",
      free: "bg-slate-100 text-slate-600",
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colors[tier] || colors.free}`}>
        {tierIcon(tier)}
        {tier.charAt(0).toUpperCase() + tier.slice(1)}
      </span>
    );
  };

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      canceled: "bg-red-100 text-red-700",
      past_due: "bg-yellow-100 text-yellow-700",
      unpaid: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colors[status] || "bg-slate-100 text-slate-600"}`}>
        {status}
      </span>
    );
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-8 w-8 text-[#1a365d]" />
            <h1 className="text-xl font-bold text-[#1a365d]">Admin Dashboard</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin secret"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20 focus:border-[#1a365d]"
            />
            <button
              type="submit"
              disabled={loading || !secret}
              className="w-full bg-[#1a365d] text-white py-2.5 rounded-lg font-medium hover:bg-[#1a365d]/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "Sign In"}
            </button>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#1a365d]" />
            <h1 className="text-lg font-bold text-[#1a365d]">Test Prep Sheets — Admin</h1>
          </div>
          <button
            onClick={() => fetchUsers(secret)}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#1a365d] transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Users className="h-4 w-4" /> Total Subscribers
              </div>
              <p className="text-2xl font-bold text-[#1a365d]">{data.totalSubscribers}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <TrendingUp className="h-4 w-4" /> Active
              </div>
              <p className="text-2xl font-bold text-green-600">{data.summary.active}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <User className="h-4 w-4" /> Free Users (this month)
              </div>
              <p className="text-2xl font-bold text-slate-600">{data.freeUsersThisMonth}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                <Crown className="h-4 w-4" /> By Tier
              </div>
              <div className="text-xs space-y-0.5 mt-1">
                {data.summary.unlimited > 0 && <p className="text-amber-600">Unlimited: {data.summary.unlimited}</p>}
                {data.summary.enterprise > 0 && <p className="text-emerald-600">Enterprise: {data.summary.enterprise}</p>}
                <p className="text-purple-600">Pro: {data.summary.pro}</p>
                <p className="text-blue-600">Starter: {data.summary.starter}</p>
              </div>
            </div>
          </div>
        )}

        {/* Set Tier */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-sm font-semibold text-[#1a365d] mb-4">Set User Tier</h2>
          <form onSubmit={handleSetTier} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-slate-500 mb-1 block">Email</label>
              <input
                type="email"
                placeholder="user@example.com"
                value={setTierEmail}
                onChange={(e) => setSetTierEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Tier</label>
              <select
                value={setTierValue}
                onChange={(e) => setSetTierValue(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a365d]/20"
              >
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
                <option value="unlimited">Unlimited</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={setTierLoading || !setTierEmail}
              className="px-4 py-2 bg-[#1a365d] text-white text-sm rounded-lg font-medium hover:bg-[#1a365d]/90 disabled:opacity-50"
            >
              {setTierLoading ? "Setting..." : "Set Tier"}
            </button>
            {setTierResult && (
              <p className={`text-xs ${setTierResult.startsWith("Error") ? "text-red-500" : "text-green-600"}`}>
                {setTierResult}
              </p>
            )}
          </form>
        </div>

        {/* User Table */}
        {data && data.subscribers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-[#1a365d]">Subscribers</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Tier</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Usage</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-500 uppercase">Expires</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.subscribers.map((user) => (
                    <tr key={user.email} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-700">{user.email}</td>
                      <td className="px-6 py-3">{tierBadge(user.tier)}</td>
                      <td className="px-6 py-3">{statusBadge(user.status)}</td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                user.limit > 0 && user.usedThisMonth / user.limit > 0.8
                                  ? "bg-red-500"
                                  : "bg-green-500"
                              }`}
                              style={{ width: `${user.limit > 0 ? Math.min(100, (user.usedThisMonth / user.limit) * 100) : 0}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">
                            {user.usedThisMonth}/{user.tier === "unlimited" ? "∞" : user.limit}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-xs text-slate-500">
                        {new Date(user.currentPeriodEnd * 1000).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {data && data.subscribers.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No subscribers yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
