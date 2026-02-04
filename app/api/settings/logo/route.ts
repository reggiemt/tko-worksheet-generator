import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTierForEmail } from "@/lib/subscription";
import { getRedisClient } from "@/lib/redis";

const MAX_LOGO_SIZE = 500 * 1024; // 500KB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

function getLogoKey(email: string): string {
  return `worksheet:logo:${email.toLowerCase().trim()}`;
}

function getBrandingKey(email: string): string {
  return `worksheet:branding:${email.toLowerCase().trim()}`;
}

// GET — Retrieve current logo and branding
export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const email = session.user.email;
  const [logoData, brandingData] = await Promise.all([
    redis.get<string>(getLogoKey(email)),
    redis.get<{ orgName: string; mimeType: string }>(getBrandingKey(email)),
  ]);

  return NextResponse.json({
    hasLogo: !!logoData,
    logoBase64: logoData || null,
    orgName: brandingData?.orgName || null,
    mimeType: brandingData?.mimeType || null,
  });
}

// POST — Upload logo and/or set org name
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const email = session.user.email;
  const tier = await getTierForEmail(email);

  if (tier !== "enterprise" && tier !== "unlimited") {
    return NextResponse.json(
      { error: "Custom branding is available on Enterprise and Unlimited plans only." },
      { status: 403 }
    );
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { logoBase64, mimeType, orgName } = body as {
      logoBase64?: string;
      mimeType?: string;
      orgName?: string;
    };

    // Validate org name if provided
    if (orgName !== undefined) {
      if (typeof orgName !== "string" || orgName.length > 100) {
        return NextResponse.json(
          { error: "Organization name must be 100 characters or fewer." },
          { status: 400 }
        );
      }
    }

    // Validate and store logo if provided
    if (logoBase64) {
      if (!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: "Invalid file type. Only PNG and JPEG are allowed." },
          { status: 400 }
        );
      }

      // Check base64 size (base64 is ~33% larger than raw binary)
      const rawSize = Math.ceil((logoBase64.length * 3) / 4);
      if (rawSize > MAX_LOGO_SIZE) {
        return NextResponse.json(
          { error: `Logo must be under 500KB. Your file is ${Math.round(rawSize / 1024)}KB.` },
          { status: 400 }
        );
      }

      // Verify it's valid base64
      try {
        Buffer.from(logoBase64, "base64");
      } catch {
        return NextResponse.json(
          { error: "Invalid image data." },
          { status: 400 }
        );
      }

      await redis.set(getLogoKey(email), logoBase64);
    }

    // Store branding metadata (org name + mime type)
    const existingBranding = await redis.get<{ orgName: string; mimeType: string }>(getBrandingKey(email));
    const updatedBranding = {
      orgName: orgName !== undefined ? orgName : (existingBranding?.orgName || ""),
      mimeType: mimeType || existingBranding?.mimeType || "image/png",
    };
    await redis.set(getBrandingKey(email), updatedBranding);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}

// DELETE — Remove logo and/or branding
export async function DELETE(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const redis = getRedisClient();
  if (!redis) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const email = session.user.email;
  await Promise.all([
    redis.del(getLogoKey(email)),
    redis.del(getBrandingKey(email)),
  ]);

  return NextResponse.json({ success: true });
}
