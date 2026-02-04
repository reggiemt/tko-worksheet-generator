import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTierForEmail } from "@/lib/subscription";
import { getRedisClient } from "@/lib/redis";
import { MATH_CATEGORIES } from "@/lib/categories";

// Build a lookup map for topic ID → human-readable name
function buildTopicNameMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const cat of MATH_CATEGORIES) {
    for (const sub of cat.subcategories) {
      map[`${cat.id}.${sub.id}`] = sub.name;
      // Also map just the category ID
      map[cat.id] = cat.name;
    }
  }
  return map;
}

const TOPIC_NAMES = buildTopicNameMap();

function getTopicDisplayName(topicKey: string): string {
  return TOPIC_NAMES[topicKey] || topicKey;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Check auth
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Check tier — allow Pro, Enterprise, Unlimited
    const tier = await getTierForEmail(userEmail);
    const allowedTiers = ["pro", "enterprise", "unlimited"];

    if (!allowedTiers.includes(tier)) {
      return NextResponse.json(
        { error: "Analytics requires Pro tier or higher", tier },
        { status: 403 }
      );
    }

    // 3. Get month param (default: current month)
    const { searchParams } = new URL(request.url);
    const requestedMonth = searchParams.get("month");

    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);

    // Allow querying up to 6 months back
    const months: string[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toISOString().slice(0, 7));
    }

    const targetMonth = requestedMonth && months.includes(requestedMonth)
      ? requestedMonth
      : currentMonth;

    // 4. Query Redis
    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: "Analytics service unavailable" },
        { status: 503 }
      );
    }

    // Get topic breakdown for target month
    const topicsRaw = await redis.hgetall(
      `worksheet:stats:${userEmail}:topics:${targetMonth}`
    ) as Record<string, string> | null;

    // Get difficulty breakdown for target month
    const difficultyRaw = await redis.hgetall(
      `worksheet:stats:${userEmail}:difficulty:${targetMonth}`
    ) as Record<string, string> | null;

    // Get daily usage for target month
    // Parse the month to get days range
    const [yearStr, monthStr] = targetMonth.split("-");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const daysInMonth = new Date(year, month, 0).getDate();

    const dailyKeys: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${targetMonth}-${String(d).padStart(2, "0")}`;
      dailyKeys.push(`worksheet:stats:${userEmail}:daily:${dayStr}`);
    }

    // Batch fetch daily counts
    const dailyCounts = await Promise.all(
      dailyKeys.map((key) => redis.get<number>(key))
    );

    // Build daily usage array
    const dailyUsage: { date: string; count: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayStr = `${targetMonth}-${String(d).padStart(2, "0")}`;
      const count = dailyCounts[d - 1] || 0;
      dailyUsage.push({ date: dayStr, count });
    }

    // Process topic breakdown with human-readable names
    const topicBreakdown: { topic: string; topicId: string; count: number }[] = [];
    if (topicsRaw) {
      for (const [topicId, countStr] of Object.entries(topicsRaw)) {
        topicBreakdown.push({
          topic: getTopicDisplayName(topicId),
          topicId,
          count: typeof countStr === "number" ? countStr : parseInt(String(countStr)) || 0,
        });
      }
    }
    topicBreakdown.sort((a, b) => b.count - a.count);

    // Process difficulty breakdown
    const difficultyBreakdown: { difficulty: string; count: number }[] = [];
    if (difficultyRaw) {
      for (const [diff, countStr] of Object.entries(difficultyRaw)) {
        difficultyBreakdown.push({
          difficulty: diff,
          count: typeof countStr === "number" ? countStr : parseInt(String(countStr)) || 0,
        });
      }
    }
    // Sort: easy, medium, hard
    const diffOrder: Record<string, number> = { easy: 0, medium: 1, hard: 2 };
    difficultyBreakdown.sort(
      (a, b) => (diffOrder[a.difficulty] ?? 99) - (diffOrder[b.difficulty] ?? 99)
    );

    // Calculate totals
    const totalThisMonth = topicBreakdown.reduce((sum, t) => sum + t.count, 0);
    const daysActive = dailyUsage.filter((d) => d.count > 0).length;

    // Get all-time total (sum across all months we can find)
    let totalAllTime = 0;
    for (const m of months) {
      const mTopics = await redis.hgetall(
        `worksheet:stats:${userEmail}:topics:${m}`
      ) as Record<string, string> | null;
      if (mTopics) {
        for (const countStr of Object.values(mTopics)) {
          totalAllTime += typeof countStr === "number" ? countStr : parseInt(String(countStr)) || 0;
        }
      }
    }

    // Find most popular topic
    const mostPopularTopic = topicBreakdown.length > 0 ? topicBreakdown[0].topic : null;

    // Find favorite difficulty
    const favoriteDifficulty = difficultyBreakdown.length > 0
      ? difficultyBreakdown.reduce((a, b) => (a.count >= b.count ? a : b)).difficulty
      : null;

    return NextResponse.json({
      month: targetMonth,
      availableMonths: months,
      totalThisMonth,
      totalAllTime,
      daysActive,
      mostPopularTopic,
      favoriteDifficulty,
      topicBreakdown,
      difficultyBreakdown,
      dailyUsage,
      tier,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
