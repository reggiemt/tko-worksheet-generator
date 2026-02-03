import { NextRequest, NextResponse } from "next/server";
import { getUsageInfo, getClientIp } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);

  // TODO: Once auth is added, get userId and tier from session
  const usage = await getUsageInfo(ip);

  return NextResponse.json(usage);
}
