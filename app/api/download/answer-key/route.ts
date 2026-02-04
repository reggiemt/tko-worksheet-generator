import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis";

const EXPIRED_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Link Expired — TKO Prep</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f8fafc; color: #1a365d;
    }
    .card {
      text-align: center; max-width: 480px; padding: 48px 32px;
      background: white; border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { color: #64748b; margin-bottom: 24px; line-height: 1.6; }
    a.btn {
      display: inline-block; padding: 12px 24px;
      background: #1a365d; color: white; text-decoration: none;
      border-radius: 8px; font-weight: 600; font-size: 14px;
    }
    a.btn:hover { background: #2d4a7a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">⏰</div>
    <h1>This link has expired</h1>
    <p>Download links are valid for 24 hours. Generate a new worksheet to get a fresh answer key.</p>
    <a class="btn" href="https://www.testprepsheets.com">Generate a New Worksheet →</a>
  </div>
</body>
</html>`;

const MISSING_TOKEN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Missing Link — TKO Prep</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f8fafc; color: #1a365d;
    }
    .card {
      text-align: center; max-width: 480px; padding: 48px 32px;
      background: white; border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { color: #64748b; margin-bottom: 24px; line-height: 1.6; }
    a.btn {
      display: inline-block; padding: 12px 24px;
      background: #1a365d; color: white; text-decoration: none;
      border-radius: 8px; font-weight: 600; font-size: 14px;
    }
    a.btn:hover { background: #2d4a7a; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">🔗</div>
    <h1>Missing download link</h1>
    <p>Please use the link from your email to download the answer key.</p>
    <a class="btn" href="https://www.testprepsheets.com">← Back to Test Prep Sheets</a>
  </div>
</body>
</html>`;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(MISSING_TOKEN_HTML, {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const redis = getRedisClient();
  if (!redis) {
    return new NextResponse(EXPIRED_HTML, {
      status: 503,
      headers: { "Content-Type": "text/html" },
    });
  }

  const pdfBase64 = await redis.get<string>(`worksheet:download:${token}`);

  if (!pdfBase64) {
    return new NextResponse(EXPIRED_HTML, {
      status: 410,
      headers: { "Content-Type": "text/html" },
    });
  }

  // Convert base64 to binary and serve as PDF download
  const pdfBuffer = Buffer.from(pdfBase64, "base64");

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="SAT_Answer_Key.pdf"',
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
