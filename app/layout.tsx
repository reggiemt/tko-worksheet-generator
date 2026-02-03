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
  title: "Free SAT Math Worksheet Generator | AI-Powered Practice | TKO Prep",
  description:
    "Generate custom SAT math practice worksheets instantly. Upload a problem screenshot or choose from 23 topics. Get printable PDFs with step-by-step answer keys. Free — no account required.",
  keywords: [
    "SAT practice worksheets",
    "SAT math practice",
    "SAT worksheet generator",
    "free SAT prep",
    "SAT math problems",
    "SAT test preparation",
    "SAT practice test",
    "SAT math tutor",
    "digital SAT practice",
    "SAT algebra practice",
    "SAT geometry practice",
    "College Board SAT prep",
    "TKO Prep",
    "AI SAT tutor",
    "printable SAT worksheets",
    "SAT answer key",
    "SAT score improvement",
    "ACT math practice",
  ],
  openGraph: {
    title: "Free SAT Math Worksheet Generator — Instant Custom Practice",
    description:
      "Stop searching for SAT practice problems. Generate custom worksheets with verified answers in seconds. 23 topics, 3 difficulty levels, printable PDFs. Free from TKO Prep.",
    type: "website",
    siteName: "TKO Prep Worksheet Generator",
    url: "https://testprepsheets.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SAT Math Worksheet Generator — Instant Custom Practice",
    description:
      "Generate custom SAT math worksheets with verified answers in seconds. Upload a screenshot or choose a topic. Free from TKO Prep.",
  },
  alternates: {
    canonical: "https://testprepsheets.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
