import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Test Prep Sheets by TKO Prep",
  description:
    "Terms of Service for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using Test Prep Sheets (&ldquo;testprepsheets.com&rdquo;), operated by
          TKO Prep, you agree to be bound by these Terms of Service. If you do not agree
          to these terms, please do not use our service.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          Test Prep Sheets is an AI-powered worksheet generator for SAT and ACT math
          practice. The service generates practice problems, answer keys, and step-by-step
          solutions in PDF format based on your selected topic, difficulty, and preferences.
        </p>

        <h2>3. Account Registration</h2>
        <p>
          Free users may use the service without an account, subject to usage limits. Paid
          subscriptions require signing in with a Google account via Google OAuth. You are
          responsible for maintaining the security of your account and for all activity that
          occurs under it.
        </p>

        <h2>4. Subscription Plans &amp; Billing</h2>
        <ul>
          <li>
            <strong>Free:</strong> 5 worksheets per month, no account required
          </li>
          <li>
            <strong>Starter ($5/month):</strong> 30 worksheets per month
          </li>
          <li>
            <strong>Pro ($25/month):</strong> 100 worksheets per month
          </li>
          <li>
            <strong>Enterprise ($99/month):</strong> 500 worksheets per month
          </li>
        </ul>
        <p>
          Paid subscriptions are billed monthly through Stripe. You may cancel at any time
          from your account settings. Cancellation takes effect at the end of your current
          billing period. Unused worksheets do not roll over to the next month. For details
          on refunds, please see our{" "}
          <Link href="/refund" className="text-[#1a365d] underline">
            Cancellation &amp; Refund Policy
          </Link>
          .
        </p>

        <h2>5. Usage Limits</h2>
        <p>
          Each plan has a monthly worksheet generation limit. Limits reset at the beginning
          of each calendar month. We reserve the right to modify plan limits with reasonable
          notice to subscribers.
        </p>

        <h2>6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Circumvent or attempt to circumvent usage limits</li>
          <li>Use automated tools, scripts, or bots to generate worksheets</li>
          <li>Resell or redistribute generated worksheets as a competing service</li>
          <li>Use the service for any unlawful purpose</li>
          <li>Attempt to reverse-engineer, hack, or compromise the service</li>
          <li>
            Share your account credentials or allow others to access your subscription
          </li>
        </ul>

        <h2>7. Intellectual Property</h2>
        <p>
          The Test Prep Sheets service, including its design, branding, and underlying
          technology, is owned by TKO Prep. You may use generated worksheets for personal
          study, classroom instruction, or tutoring. Generated content is not exclusive —
          other users may receive similar problems on the same topics.
        </p>
        <p>
          You may not resell generated worksheets, rebrand them as your own product, or use
          them to build a competing service.
        </p>

        <h2>8. Generated Content &amp; Accuracy</h2>
        <p>
          Worksheets are created by AI and are provided for educational practice purposes.
          While we strive for accuracy, we do not guarantee that all problems or solutions
          are error-free. Users should verify answers independently for high-stakes
          purposes.
        </p>

        <h2>9. Disclaimer — No Affiliation</h2>
        <p>
          SAT is a registered trademark of the College Board. ACT is a registered trademark
          of ACT, Inc. Test Prep Sheets and TKO Prep are not affiliated with, endorsed by,
          or sponsored by the College Board or ACT, Inc.
        </p>

        <h2>10. Disclaimer of Warranties</h2>
        <p>
          The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
          kind, either express or implied, including but not limited to implied warranties of
          merchantability, fitness for a particular purpose, or non-infringement. We do not
          warrant that the service will be uninterrupted, error-free, or that generated
          content will be perfectly accurate.
        </p>

        <h2>11. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, TKO Prep and its owners, employees, and
          affiliates shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages resulting from your use of or inability to use
          the service, including but not limited to loss of data, revenue, or anticipated
          savings.
        </p>

        <h2>12. Changes to Terms</h2>
        <p>
          We reserve the right to modify these terms at any time. Material changes will be
          communicated through the service or via email. Continued use after changes
          constitutes acceptance of the new terms.
        </p>

        <h2>13. Governing Law</h2>
        <p>
          These terms shall be governed by and construed in accordance with the laws of the
          State of New York, without regard to its conflict of law provisions.
        </p>

        <h2>14. Contact</h2>
        <p>
          For questions about these terms, contact us at:{" "}
          <a href="mailto:info@tkoprep.com" className="text-[#1a365d] underline">
            info@tkoprep.com
          </a>
        </p>
      </main>
    </div>
  );
}
