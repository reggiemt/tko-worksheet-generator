import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getRedisClient } from "@/lib/redis";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email: rawEmail, password, name } = body;

    // Validate email
    const email = rawEmail?.toLowerCase()?.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Validate password
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const redis = getRedisClient();
    if (!redis) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // Check if user already exists
    const existing = await redis.get(`user:credentials:${email}`);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Store user
    await redis.set(`user:credentials:${email}`, {
      email,
      passwordHash,
      name: name?.trim() || null,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
