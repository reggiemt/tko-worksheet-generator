import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Test Prep Sheets by TKO Prep",
  description:
    "Privacy Policy for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={32}
              height={40}
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1a365d] leading-tight">TKO Prep</span>
              <span className="text-[10px] text-slate-500 leading-tight -mt-0.5">Worksheet Generator</span>
            </div>
          </Link>
          <Link href="/" className="text-sm text-[#1a365d] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 text-[#1a365d] mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wide">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-2">Privacy Policy</h1>
          <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-10">
          <h2 className="text-sm font-semibold text-[#1a365d] uppercase tracking-wide mb-3">Contents</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-600 list-decimal list-inside">
            <li><a href="#overview" className="hover:text-[#1a365d] hover:underline">Overview</a></li>
            <li><a href="#info-collect" className="hover:text-[#1a365d] hover:underline">Information We Collect</a></li>
            <li><a href="#how-we-use" className="hover:text-[#1a365d] hover:underline">How We Use Your Information</a></li>
            <li><a href="#no-sell" className="hover:text-[#1a365d] hover:underline">We Do Not Sell Your Data</a></li>
            <li><a href="#third-party" className="hover:text-[#1a365d] hover:underline">Third-Party Services</a></li>
            <li><a href="#cookies" className="hover:text-[#1a365d] hover:underline">Cookies</a></li>
            <li><a href="#retention" className="hover:text-[#1a365d] hover:underline">Data Retention</a></li>
            <li><a href="#rights" className="hover:text-[#1a365d] hover:underline">Your Rights</a></li>
            <li><a href="#children" className="hover:text-[#1a365d] hover:underline">Children&rsquo;s Privacy</a></li>
            <li><a href="#policy-changes" className="hover:text-[#1a365d] hover:underline">Changes to This Policy</a></li>
            <li><a href="#contact" className="hover:text-[#1a365d] hover:underline">Contact Us</a></li>
          </ol>
        </nav>

        {/* Content */}
        <div className="space-y-10">
          <section id="overview">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Overview</h2>
            <p className="text-slate-600 leading-relaxed">
              Test Prep Sheets (&ldquo;testprepsheets.com&rdquo;) is operated by TKO Prep. We take your
              privacy seriously. This policy explains what information we collect, how we use
              it, and your rights regarding your data.
            </p>
          </section>

          <section id="info-collect">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Information We Collect</h2>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-2">Account Information</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  When you sign in with Google, we receive your name and email address from Google
                  OAuth. We use this to manage your account and subscription.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-2">Payment Information</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Payment processing is handled entirely by Stripe. We never see, store, or have
                  access to your credit card number, CVV, or full card details. Stripe provides us
                  only with a confirmation of payment and your subscription status.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-2">Usage Data</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We track the number of worksheets you generate each month to enforce plan limits.
                  For free (unauthenticated) users, we use your IP address for rate limiting. This
                  data is stored temporarily in Upstash Redis and automatically expires.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-2">Generated Content</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Worksheets are generated on-the-fly and delivered directly to your browser. We do
                  not store copies of your generated worksheets on our servers.
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-2">Screenshots</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  If you upload a screenshot for topic detection, the image is sent to our AI
                  provider (Anthropic/Claude) for analysis and is not stored after processing.
                </p>
              </div>
            </div>
          </section>

          <section id="how-we-use">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">How We Use Your Information</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Authentication:</strong> To identify you and manage your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Usage tracking:</strong> To enforce worksheet generation limits based on your plan</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Billing:</strong> To process subscription payments through Stripe</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Service improvement:</strong> To understand usage patterns and improve our worksheet generation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Communication:</strong> To contact you about your account if necessary</span>
              </li>
            </ul>
          </section>

          <section id="no-sell">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">We Do Not Sell Your Data</h2>
            <p className="text-slate-600 leading-relaxed">
              We do not sell, rent, or trade your personal information to third parties. Your
              data is used solely to provide and improve the Test Prep Sheets service.
            </p>
          </section>

          <section id="third-party">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use the following third-party services to operate Test Prep Sheets:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-[#1a365d] text-sm">Google OAuth</p>
                <p className="text-xs text-slate-500">Authentication</p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-[#1a365d] text-sm">Stripe</p>
                <p className="text-xs text-slate-500">Payment processing</p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-[#1a365d] text-sm">Anthropic (Claude)</p>
                <p className="text-xs text-slate-500">AI problem generation &amp; screenshot analysis</p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-[#1a365d] text-sm">Upstash Redis</p>
                <p className="text-xs text-slate-500">Usage tracking &amp; rate limiting</p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:col-span-2">
                <p className="font-semibold text-[#1a365d] text-sm">Vercel</p>
                <p className="text-xs text-slate-500">Hosting &amp; infrastructure</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              Each of these services has their own privacy policy governing their handling of
              data. We encourage you to review their respective policies.
            </p>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We use cookies strictly for authentication purposes. When you sign in with Google,
              NextAuth.js sets a session cookie to keep you logged in. We do not use advertising
              cookies, tracking pixels, or third-party analytics cookies.
            </p>
            <div className="space-y-2">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-start gap-3">
                <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5">session-token</code>
                <p className="text-sm text-slate-600">Required for authenticated users to maintain their login session</p>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 flex items-start gap-3">
                <code className="text-xs bg-slate-200 px-1.5 py-0.5 rounded shrink-0 mt-0.5">csrf-token</code>
                <p className="text-sm text-slate-600">Security cookie to prevent cross-site request forgery</p>
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed mt-4">
              You can clear these cookies at any time by signing out or clearing your browser data.
            </p>
          </section>

          <section id="retention">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Data Retention</h2>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Account data:</strong> Retained for as long as you have an active account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>Usage counters:</strong> Reset monthly and automatically expire</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>IP-based rate limiting:</strong> Automatically expires within 30 days</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span><strong>After cancellation:</strong> Account data may be retained for up to 90 days for billing and support, then deleted</span>
              </li>
            </ul>
          </section>

          <section id="rights">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">You have the right to:</p>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span>Access the personal information we hold about you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span>Request deletion of your account and associated data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span>Cancel your subscription at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#1a365d] font-bold mt-0.5">•</span>
                <span>Opt out of any marketing communications</span>
              </li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>.
            </p>
          </section>

          <section id="children">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Children&rsquo;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              Our service is designed for SAT and ACT preparation and may be used by students
              under 18 with parental consent. We do not knowingly collect personal information
              from children under 13 without verifiable parental consent, in compliance with COPPA.
            </p>
          </section>

          <section id="policy-changes">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this privacy policy from time to time. We will notify you of any
              material changes by posting the new policy on this page and updating the &ldquo;Last
              updated&rdquo; date.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this privacy policy or your data, contact us at:{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>
            </p>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <Link href="/terms" className="hover:text-[#1a365d] underline">Terms of Service</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-[#1a365d] underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#1a365d] underline">Back to Generator</Link>
        </div>
      </main>
    </div>
  );
}
