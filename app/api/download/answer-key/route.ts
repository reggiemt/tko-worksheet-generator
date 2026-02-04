import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(
      `<!DOCTYPE html>
<html><head><title>Missing Token</title></head>
<body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center">
<h2>🔗 Missing download link</h2>
<p>Please use the link from your email to download the answer key.</p>
<a href="https://testprepsheets.com" style="color:#1a365d">← Back to Test Prep Sheets</a>
</body></html>`,
      { status: 400, headers: { "Content-Type": "text/html" } }
    );
  }

  const redis = getRedisClient();
  if (!redis) {
    return new NextResponse("Service unavailable", { status: 503 });
  }

  const pdfBase64 = await redis.get<string>(`worksheet:download:${token}`);

  if (!pdfBase64) {
    return new NextResponse(
      `<!DOCTYPE html>
<html><head><title>Link Expired</title></head>
<body style="font-family:system-ui;max-width:500px;margin:80px auto;text-align:center">
<h2>⏰ This link has expired</h2>
<p>Download links are valid for 24 hours. Generate a new worksheet to get a fresh answer key.</p>
<a href="https://testprepsheets.com" style="color:#1a365d;font-weight:600">← Generate New Worksheet</a>
</body></html>`,
      { status: 410, headers: { "Content-Type": "text/html" } }
    );
  }

  // Convert base64 to buffer
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=\"SAT_Answer_Key.pdf\"",
      "Content-Length": String(pdfBuffer.length),
    },
  });
}
