"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Crown,
  FileText,
  Flame,
  Lock,
  Target,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface TopicData {
  topic: string;
  topicId: string;
  count: number;
}

interface DifficultyData {
  difficulty: string;
  count: number;
}

interface DailyData {
  date: string;
  count: number;
}

interface AnalyticsData {
  month: string;
  availableMonths: string[];
  totalThisMonth: number;
  totalAllTime: number;
  daysActive: number;
  mostPopularTopic: string | null;
  favoriteDifficulty: string | null;
  topicBreakdown: TopicData[];
  difficultyBreakdown: DifficultyData[];
  dailyUsage: DailyData[];
  tier: string;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; ring: string }> = {
  easy: { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200" },
  medium: { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-200" },
  hard: { bg: "bg-red-500", text: "text-red-600", ring: "ring-red-200" },
};

const TOPIC_COLORS = [
  "bg-[#1a365d]",
  "bg-[#e53e3e]",
  "bg-[#2b6cb0]",
  "bg-[#c53030]",
  "bg-[#2c5282]",
  "bg-[#9b2c2c]",
  "bg-[#2a4365]",
  "bg-[#e53e3e]/80",
  "bg-[#1a365d]/80",
  "bg-[#2b6cb0]/80",
];

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);
  const [unauthenticated, setUnauthenticated] = useState(false);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);

  const fetchAnalytics = useCallback(async (month?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = month ? `/api/analytics?month=${month}` : "/api/analytics";
      const res = await fetch(url);

      if (res.status === 401) {
        setUnauthenticated(true);
        return;
      }
      if (res.status === 403) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleMonthChange = (direction: "prev" | "next") => {
    if (!data) return;
    const newIndex =
      direction === "prev"
        ? Math.min(currentMonthIndex + 1, data.availableMonths.length - 1)
        : Math.max(currentMonthIndex - 1, 0);
    setCurrentMonthIndex(newIndex);
    fetchAnalytics(data.availableMonths[newIndex]);
  };

  // Unauthenticated state
  if (unauthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Lock className="h-16 w-16 text-[#1a365d]/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a365d] mb-2">Sign In Required</h1>
          <p className="text-slate-500 mb-6">
            Please sign in to access your analytics dashboard.
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 bg-[#1a365d] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a4365] transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Unauthorized (wrong tier) state
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white">
        <Nav />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Crown className="h-16 w-16 text-amber-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#1a365d] mb-3">
              Usage Analytics Dashboard
            </h1>
            <p className="text-slate-500 mb-8">
              Track your worksheet generation patterns, see which topics you practice
              most, and monitor your usage over time.
            </p>

            {/* Preview mockup */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="h-8 w-8 text-[#1a365d] mx-auto mb-2" />
                  <p className="text-[#1a365d] font-semibold text-lg">
                    Available on Pro & Enterprise
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {["32 Worksheets", "Quadratics", "Medium", "12 Days"].map((label) => (
                  <div key={label} className="bg-slate-50 rounded-xl p-3">
                    <div className="h-6 bg-slate-200 rounded w-2/3 mx-auto mb-1" />
                    <div className="text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[80, 60, 40, 25].map((w, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-24 h-3 bg-slate-100 rounded" />
                    <div
                      className="h-3 bg-slate-200 rounded"
                      style={{ width: `${w}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-[#e53e3e] text-white px-8 py-3 rounded-lg hover:bg-[#c53030] transition-colors font-medium text-lg"
            >
              Upgrade to Pro — $25/mo →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-8" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-8 bg-slate-200 rounded w-16 mx-auto mb-2" />
                  <div className="h-4 bg-slate-100 rounded w-24 mx-auto" />
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm h-64" />
              <div className="bg-white rounded-xl p-6 shadow-sm h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white">
        <Nav />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchAnalytics()}
            className="bg-[#1a365d] text-white px-4 py-2 rounded-lg hover:bg-[#2a4365] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasData = data.totalThisMonth > 0;
  const maxDailyCount = Math.max(...data.dailyUsage.map((d) => d.count), 1);
  const maxTopicCount = data.topicBreakdown.length > 0 ? data.topicBreakdown[0].count : 1;
  const totalDifficultyCount = data.difficultyBreakdown.reduce((sum, d) => sum + d.count, 0) || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f4f8] to-white">
      <Nav />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Header with Month Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a365d]">
              Usage Analytics
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track your worksheet generation activity
            </p>
          </div>

          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 shadow-sm px-2 py-1.5">
            <button
              onClick={() => handleMonthChange("prev")}
              disabled={currentMonthIndex >= data.availableMonths.length - 1}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <span className="text-sm font-medium text-[#1a365d] min-w-[140px] text-center">
              {formatMonth(data.month)}
            </span>
            <button
              onClick={() => handleMonthChange("next")}
              disabled={currentMonthIndex <= 0}
              className="p-1 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        {!hasData ? (
          <EmptyState month={data.month} />
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={<FileText className="h-5 w-5" />}
                value={String(data.totalThisMonth)}
                label="Worksheets This Month"
                accent="text-[#1a365d]"
              />
              <StatCard
                icon={<Target className="h-5 w-5" />}
                value={data.mostPopularTopic || "—"}
                label="Top Topic"
                accent="text-[#e53e3e]"
                small
              />
              <StatCard
                icon={<Flame className="h-5 w-5" />}
                value={data.favoriteDifficulty ? capitalize(data.favoriteDifficulty) : "—"}
                label="Favorite Difficulty"
                accent="text-amber-600"
              />
              <StatCard
                icon={<Calendar className="h-5 w-5" />}
                value={String(data.daysActive)}
                label="Days Active"
                accent="text-emerald-600"
              />
            </div>

            {/* All-time total */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <TrendingUp className="h-4 w-4" />
                <span>All-time total</span>
              </div>
              <span className="text-lg font-bold text-[#1a365d]">
                {data.totalAllTime} worksheets
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Topic Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart3 className="h-5 w-5 text-[#1a365d]" />
                  <h2 className="text-lg font-semibold text-[#1a365d]">
                    Topics
                  </h2>
                </div>

                {data.topicBreakdown.length === 0 ? (
                  <p className="text-slate-400 text-sm">No topic data yet</p>
                ) : (
                  <div className="space-y-3">
                    {data.topicBreakdown.map((topic, i) => {
                      const pct = Math.round((topic.count / maxTopicCount) * 100);
                      return (
                        <div key={topic.topicId}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-700 truncate max-w-[70%]">
                              {topic.topic}
                            </span>
                            <span className="text-sm font-medium text-slate-500">
                              {topic.count}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${TOPIC_COLORS[i % TOPIC_COLORS.length]}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Difficulty Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Target className="h-5 w-5 text-[#e53e3e]" />
                  <h2 className="text-lg font-semibold text-[#1a365d]">
                    Difficulty Distribution
                  </h2>
                </div>

                {data.difficultyBreakdown.length === 0 ? (
                  <p className="text-slate-400 text-sm">No difficulty data yet</p>
                ) : (
                  <div className="space-y-6">
                    {/* Donut-style display using stacked bar */}
                    <div className="flex rounded-full h-6 overflow-hidden bg-slate-100">
                      {data.difficultyBreakdown.map((d) => {
                        const pct = (d.count / totalDifficultyCount) * 100;
                        const colors = DIFFICULTY_COLORS[d.difficulty] || DIFFICULTY_COLORS.medium;
                        return (
                          <div
                            key={d.difficulty}
                            className={`${colors.bg} transition-all duration-500`}
                            style={{ width: `${pct}%` }}
                            title={`${capitalize(d.difficulty)}: ${d.count} (${Math.round(pct)}%)`}
                          />
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="space-y-3">
                      {data.difficultyBreakdown.map((d) => {
                        const pct = Math.round((d.count / totalDifficultyCount) * 100);
                        const colors = DIFFICULTY_COLORS[d.difficulty] || DIFFICULTY_COLORS.medium;
                        return (
                          <div
                            key={d.difficulty}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${colors.bg}`} />
                              <span className="text-sm font-medium text-slate-700">
                                {capitalize(d.difficulty)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-500">
                                {d.count} worksheet{d.count !== 1 ? "s" : ""}
                              </span>
                              <span
                                className={`text-sm font-semibold ${colors.text} bg-slate-50 px-2 py-0.5 rounded-full`}
                              >
                                {pct}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="h-5 w-5 text-[#1a365d]" />
                <h2 className="text-lg font-semibold text-[#1a365d]">
                  Daily Activity
                </h2>
              </div>

              <div className="flex items-end gap-[2px] h-40">
                {data.dailyUsage.map((day) => {
                  const heightPct = day.count > 0 ? Math.max((day.count / maxDailyCount) * 100, 4) : 0;
                  const dayNum = parseInt(day.date.split("-")[2]);
                  const isToday = day.date === new Date().toISOString().slice(0, 10);

                  return (
                    <div
                      key={day.date}
                      className="flex-1 flex flex-col items-center justify-end h-full group relative"
                    >
                      {/* Tooltip */}
                      {day.count > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a365d] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                          {day.count} worksheet{day.count !== 1 ? "s" : ""}
                        </div>
                      )}
                      <div
                        className={`w-full rounded-t transition-all duration-300 ${
                          day.count > 0
                            ? isToday
                              ? "bg-[#e53e3e]"
                              : "bg-[#1a365d] hover:bg-[#2b6cb0]"
                            : "bg-transparent"
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Day labels (show every 5th day + first and last) */}
              <div className="flex gap-[2px] mt-1">
                {data.dailyUsage.map((day) => {
                  const dayNum = parseInt(day.date.split("-")[2]);
                  const show = dayNum === 1 || dayNum % 5 === 0 || dayNum === data.dailyUsage.length;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 text-center text-[10px] text-slate-400"
                    >
                      {show ? dayNum : ""}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Nav() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={36}
              height={44}
              className="h-9 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1a365d] leading-tight">
                TKO Prep
              </span>
              <span className="text-[10px] text-slate-500 leading-tight -mt-0.5">
                Worksheet Generator
              </span>
            </div>
          </Link>
        </div>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a365d] transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Generator
        </Link>
      </div>
    </nav>
  );
}

function StatCard({
  icon,
  value,
  label,
  accent,
  small,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
  small?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className={`${accent} mb-2`}>{icon}</div>
      <p
        className={`font-bold text-[#1a365d] ${small ? "text-sm" : "text-2xl"} truncate`}
        title={value}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function EmptyState({ month }: { month: string }) {
  return (
    <div className="text-center py-16">
      <BarChart3 className="h-16 w-16 text-slate-200 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-[#1a365d] mb-2">
        No data yet for {formatMonth(month)}
      </h2>
      <p className="text-slate-500 mb-6 max-w-md mx-auto">
        Generate some worksheets and your usage analytics will appear here.
        Track which topics you practice most, your difficulty preferences, and
        daily activity.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-[#1a365d] text-white px-6 py-2.5 rounded-lg hover:bg-[#2a4365] transition-colors font-medium"
      >
        Generate a Worksheet →
      </Link>
    </div>
  );
}
