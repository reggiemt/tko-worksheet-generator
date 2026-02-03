import { NextRequest, NextResponse } from "next/server";
import { getUsageInfo, getClientIp } from "@/lib/rate-limit";
import { getTierForEmail } from "@/lib/subscription";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // Check auth for paid tier
  const session = await auth();
  const userEmail = session?.user?.email || null;
  const tier = userEmail ? await getTierForEmail(userEmail) : "free";
  const userId = userEmail && tier !== "free" ? userEmail : null;

  const usage = await getUsageInfo(ip, userId || undefined, tier);

  return NextResponse.json({
    ...usage,
    authenticated: !!session?.user,
    email: userEmail,
  });
}
