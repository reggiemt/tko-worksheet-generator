import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Test Prep Sheets by TKO Prep",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/tko-logo.png" alt="TKO Prep" width={32} height={40} className="h-8 w-auto" />
            <span className="text-lg font-bold text-[#1a365d]">TKO Prep</span>
          </Link>
          <Link href="/" className="text-sm text-[#1a365d] hover:underline">← Back</Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl prose prose-slate">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-slate-500">Last updated: February 3, 2026</p>

        <h2>Overview</h2>
        <p>
          Test Prep Sheets (&ldquo;testprepsheets.com&rdquo;) is operated by TKO Prep. We take your
          privacy seriously. This policy explains what information we collect, how we use it,
          and your rights regarding your data.
        </p>

        <h2>Information We Collect</h2>

        <h3>Account Information</h3>
        <p>
          When you sign in with Google, we receive your name and email address from Google.
          We use this to manage your account and subscription.
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
          For free users, we use your IP address for rate limiting. This data is stored
          temporarily and automatically expires.
        </p>

        <h3>Generated Content</h3>
        <p>
          Worksheets are generated on-the-fly and delivered directly to your browser.
          We do not store copies of your generated worksheets on our servers.
        </p>

        <h3>Screenshots</h3>
        <p>
          If you upload a screenshot for topic detection, the image is sent to our AI
          provider (Anthropic) for analysis and is not stored after processing.
        </p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide and improve our worksheet generation service</li>
          <li>To manage your account and subscription</li>
          <li>To enforce usage limits based on your plan</li>
          <li>To communicate with you about your account (if necessary)</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Google</strong> — Authentication (OAuth sign-in)</li>
          <li><strong>Stripe</strong> — Payment processing</li>
          <li><strong>Anthropic (Claude)</strong> — AI-powered problem generation</li>
          <li><strong>Vercel</strong> — Hosting and infrastructure</li>
          <li><strong>Upstash</strong> — Usage tracking (Redis database)</li>
        </ul>
        <p>Each of these services has their own privacy policy governing their use of data.</p>

        <h2>Data Retention</h2>
        <p>
          Account data is retained for as long as you have an active account. Usage counters
          reset monthly. If you cancel your subscription, your account data may be retained
          for up to 90 days for billing purposes, after which it is deleted.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request deletion of your account and associated data</li>
          <li>Cancel your subscription at any time</li>
          <li>Opt out of any marketing communications</li>
        </ul>

        <h2>Children&rsquo;s Privacy</h2>
        <p>
          Our service is designed for SAT preparation and may be used by students under 18
          with parental consent. We do not knowingly collect personal information from
          children under 13 without parental consent.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any
          material changes by posting the new policy on this page.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this privacy policy or your data, contact us at:{" "}
          <a href="https://tkoprep.com" target="_blank" rel="noopener noreferrer">
            tkoprep.com
          </a>
        </p>
      </main>
    </div>
  );
}
