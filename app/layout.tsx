import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SAT Worksheet Generator | Powered by TKO Prep",
  description:
    "Free AI-powered SAT math worksheet generator. Upload a screenshot of any SAT problem or choose a topic — get a professional practice worksheet with verified answers and detailed solutions. Powered by TKO Prep.",
  keywords: [
    "SAT practice",
    "SAT math",
    "SAT worksheet",
    "SAT prep",
    "math practice",
    "test preparation",
    "TKO Prep",
    "free SAT worksheets",
    "SAT tutor",
  ],
  openGraph: {
    title: "Free SAT Practice Worksheet Generator | TKO Prep",
    description:
      "Upload a screenshot or choose a topic. Get a professional SAT math practice worksheet with verified answers in seconds.",
    type: "website",
    siteName: "TKO Prep",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SAT Practice Worksheet Generator | TKO Prep",
    description:
      "Upload a screenshot or choose a topic. Get a professional SAT math practice worksheet with verified answers in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
