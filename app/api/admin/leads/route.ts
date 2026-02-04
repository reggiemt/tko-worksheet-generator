import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

interface LeadData {
  email: string;
  firstSeen: string;
  lastSeen: string;
  unlockCount: number;
}

export async function GET(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");
    if (providedSecret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json({ error: "Redis not connected" }, { status: 500 });
    }

    // Scan for all lead keys
    const leads: LeadData[] = [];
    let cursor = "0";

    do {
      const [nextCursor, keys] = (await redis.scan(Number(cursor), {
        match: "worksheet:leads:*",
        count: 100,
      })) as [string, string[]];
      cursor = String(nextCursor);

      for (const key of keys) {
        const data = await redis.get<LeadData>(key);
        if (data) {
          // Handle both parsed and string forms
          const lead = typeof data === "string" ? (JSON.parse(data) as LeadData) : data;
          leads.push(lead);
        }
      }
    } while (cursor !== "0");

    // Sort by lastSeen descending (most recent first)
    leads.sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );

    return NextResponse.json({
      leads,
      totalLeads: leads.length,
      summary: {
        totalUnlocks: leads.reduce((sum, l) => sum + l.unlockCount, 0),
        thisMonth: leads.filter((l) => {
          const now = new Date();
          const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
          return l.lastSeen.startsWith(monthKey);
        }).length,
      },
    });
  } catch (error) {
    console.error("Admin leads error:", error);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 }
    );
  }
}
