import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getRedisClient } from "@/lib/redis";

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = (credentials?.email as string)?.toLowerCase()?.trim();
        const password = credentials?.password as string;

        if (!email || !password) return null;

        const redis = getRedisClient();
        if (!redis) return null;

        try {
          const userData = await redis.get(`user:credentials:${email}`) as {
            email: string;
            passwordHash: string;
            name?: string;
            createdAt: string;
          } | null;

          if (!userData) return null;

          const isValid = await bcrypt.compare(password, userData.passwordHash);
          if (!isValid) return null;

          return {
            id: email,
            email: userData.email,
            name: userData.name || null,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow relative URLs and same-origin URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async session({ session }) {
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
});
