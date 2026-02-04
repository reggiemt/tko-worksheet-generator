import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

export async function GET(request: NextRequest) {
  // Simple admin auth
  const secret = request.headers.get("x-admin-secret") || 
    request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ error: "Redis not configured" }, { status: 503 });
  }

  const limit = parseInt(request.nextUrl.searchParams.get("limit") || "20");
  const logs = await redis.lrange("worksheet:latex-compile-log", 0, limit - 1);
  
  const parsed = logs.map((entry) => {
    try {
      return typeof entry === "string" ? JSON.parse(entry) : entry;
    } catch {
      return entry;
    }
  });

  const stats = {
    total: parsed.length,
    successes: parsed.filter((l: Record<string, unknown>) => l.finalSuccess).length,
    failures: parsed.filter((l: Record<string, unknown>) => !l.finalSuccess).length,
    byStrategy: {} as Record<string, number>,
  };

  for (const log of parsed) {
    if (log.succeededOn) {
      stats.byStrategy[log.succeededOn] = (stats.byStrategy[log.succeededOn] || 0) + 1;
    }
  }

  return NextResponse.json({ stats, logs: parsed });
}
