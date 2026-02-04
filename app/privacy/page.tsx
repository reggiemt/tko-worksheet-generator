import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Test Prep Sheets by TKO Prep",
  description:
    "Privacy Policy for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={32}
              height={40}
              className="h-8 w-auto"
            />
            <span className="text-lg font-bold text-[#1a365d]">TKO Prep</span>
          </Link>
          <Link href="/" className="text-sm text-[#1a365d] hover:underline">
            &larr; Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>

        <h2>Overview</h2>
        <p>
          Test Prep Sheets (&ldquo;testprepsheets.com&rdquo;) is operated by TKO Prep. We take your
          privacy seriously. This policy explains what information we collect, how we use
          it, and your rights regarding your data.
        </p>

        <h2>Information We Collect</h2>

        <h3>Account Information</h3>
        <p>
          When you sign in with Google, we receive your name and email address from Google
          OAuth. We use this to manage your account and subscription.
        </p>

        <h3>Payment Information</h3>
        <p>
          Payment processing is handled entirely by Stripe. We never see, store, or have
          access to your credit card number, CVV, or full card details. Stripe provides us
          only with a confirmation of payment and your subscription status.
        </p>

        <h3>Usage Data</h3>
        <p>
          We track the number of worksheets you generate each month to enforce plan limits.
          For free (unauthenticated) users, we use your IP address for rate limiting. This
          data is stored temporarily in Upstash Redis and automatically expires.
        </p>

        <h3>Generated Content</h3>
        <p>
          Worksheets are generated on-the-fly and delivered directly to your browser. We do
          not store copies of your generated worksheets on our servers.
        </p>

        <h3>Screenshots</h3>
        <p>
          If you upload a screenshot for topic detection, the image is sent to our AI
          provider (Anthropic/Claude) for analysis and is not stored after processing.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>
            <strong>Authentication:</strong> To identify you and manage your account
          </li>
          <li>
            <strong>Usage tracking:</strong> To enforce worksheet generation limits based on
            your plan
          </li>
          <li>
            <strong>Billing:</strong> To process subscription payments through Stripe
          </li>
          <li>
            <strong>Service improvement:</strong> To understand usage patterns and improve
            our worksheet generation
          </li>
          <li>
            <strong>Communication:</strong> To contact you about your account if necessary
          </li>
        </ul>

        <h2>We Do Not Sell Your Data</h2>
        <p>
          We do not sell, rent, or trade your personal information to third parties. Your
          data is used solely to provide and improve the Test Prep Sheets service.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services to operate Test Prep Sheets:</p>
        <ul>
          <li>
            <strong>Google OAuth</strong> — Authentication (sign-in with your Google account)
          </li>
          <li>
            <strong>Stripe</strong> — Payment processing and subscription management
          </li>
          <li>
            <strong>Anthropic (Claude)</strong> — AI-powered problem generation and
            screenshot analysis
          </li>
          <li>
            <strong>Upstash Redis</strong> — Usage tracking and rate limiting
          </li>
          <li>
            <strong>Vercel</strong> — Hosting and infrastructure
          </li>
        </ul>
        <p>
          Each of these services has their own privacy policy governing their handling of
          data. We encourage you to review their respective policies.
        </p>

        <h2>Cookies</h2>
        <p>
          We use cookies strictly for authentication purposes. When you sign in with Google,
          NextAuth.js sets a session cookie to keep you logged in. We do not use advertising
          cookies, tracking pixels, or third-party analytics cookies.
        </p>
        <ul>
          <li>
            <strong>Session cookie (next-auth.session-token):</strong> Required for
            authenticated users to maintain their login session
          </li>
          <li>
            <strong>CSRF token (next-auth.csrf-token):</strong> Security cookie to prevent
            cross-site request forgery
          </li>
        </ul>
        <p>
          You can clear these cookies at any time by signing out or clearing your browser
          data.
        </p>

        <h2>Data Retention</h2>
        <ul>
          <li>
            <strong>Account data:</strong> Retained for as long as you have an active
            account
          </li>
          <li>
            <strong>Usage counters:</strong> Reset monthly and automatically expire
          </li>
          <li>
            <strong>IP-based rate limiting data:</strong> Automatically expires within 30
            days
          </li>
          <li>
            <strong>After cancellation:</strong> Account data may be retained for up to 90
            days for billing and support purposes, after which it is deleted
          </li>
        </ul>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request deletion of your account and associated data</li>
          <li>Cancel your subscription at any time</li>
          <li>Opt out of any marketing communications</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>
          .
        </p>

        <h2>Children&rsquo;s Privacy</h2>
        <p>
          Our service is designed for SAT and ACT preparation and may be used by students
          under 18 with parental consent. We do not knowingly collect personal information
          from children under 13 without verifiable parental consent, in compliance with
          COPPA.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any
          material changes by posting the new policy on this page and updating the &ldquo;Last
          updated&rdquo; date.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy or your data, contact us at:{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>
        </p>
      </main>
    </div>
  );
}
