import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata = {
  title: "Terms of Service | Test Prep Sheets by TKO Prep",
  description:
    "Terms of Service for Test Prep Sheets, the AI-powered SAT & ACT math worksheet generator by TKO Prep.",
};

export default function TermsPage() {
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
            <FileText className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wide">Legal</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a365d] mb-2">Terms of Service</h1>
          <p className="text-sm text-slate-500">Last updated: February 4, 2026</p>
        </div>

        {/* Table of Contents */}
        <nav className="bg-slate-50 rounded-xl border border-slate-200 p-6 mb-10">
          <h2 className="text-sm font-semibold text-[#1a365d] uppercase tracking-wide mb-3">Contents</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-600 list-decimal list-inside">
            <li><a href="#acceptance" className="hover:text-[#1a365d] hover:underline">Acceptance of Terms</a></li>
            <li><a href="#description" className="hover:text-[#1a365d] hover:underline">Description of Service</a></li>
            <li><a href="#account" className="hover:text-[#1a365d] hover:underline">Account Registration</a></li>
            <li><a href="#billing" className="hover:text-[#1a365d] hover:underline">Subscription Plans &amp; Billing</a></li>
            <li><a href="#usage-limits" className="hover:text-[#1a365d] hover:underline">Usage Limits</a></li>
            <li><a href="#acceptable-use" className="hover:text-[#1a365d] hover:underline">Acceptable Use</a></li>
            <li><a href="#ip" className="hover:text-[#1a365d] hover:underline">Intellectual Property</a></li>
            <li><a href="#accuracy" className="hover:text-[#1a365d] hover:underline">Generated Content &amp; Accuracy</a></li>
            <li><a href="#no-affiliation" className="hover:text-[#1a365d] hover:underline">Disclaimer — No Affiliation</a></li>
            <li><a href="#warranties" className="hover:text-[#1a365d] hover:underline">Disclaimer of Warranties</a></li>
            <li><a href="#liability" className="hover:text-[#1a365d] hover:underline">Limitation of Liability</a></li>
            <li><a href="#changes" className="hover:text-[#1a365d] hover:underline">Changes to Terms</a></li>
            <li><a href="#governing-law" className="hover:text-[#1a365d] hover:underline">Governing Law</a></li>
            <li><a href="#contact" className="hover:text-[#1a365d] hover:underline">Contact</a></li>
          </ol>
        </nav>

        {/* Content */}
        <div className="space-y-10">
          <section id="acceptance">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using Test Prep Sheets (&ldquo;testprepsheets.com&rdquo;), operated by
              TKO Prep, you agree to be bound by these Terms of Service. If you do not agree
              to these terms, please do not use our service.
            </p>
          </section>

          <section id="description">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Test Prep Sheets is an AI-powered worksheet generator for SAT and ACT math
              practice. The service generates practice problems, answer keys, and step-by-step
              solutions in PDF format based on your selected topic, difficulty, and preferences.
            </p>
          </section>

          <section id="account">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">3. Account Registration</h2>
            <p className="text-slate-600 leading-relaxed">
              Free users may use the service without an account, subject to usage limits. Paid
              subscriptions require signing in with a Google account via Google OAuth. You are
              responsible for maintaining the security of your account and for all activity that
              occurs under it.
            </p>
          </section>

          <section id="billing">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">4. Subscription Plans &amp; Billing</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Test Prep Sheets offers the following plans:
            </p>

            {/* Tier Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-1">Free — $0/month</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 5 worksheets per month</li>
                  <li>• No account required</li>
                  <li>• Answer keys <strong>not included</strong> (unlock 1/month via email)</li>
                  <li>• Problem modifiers not available</li>
                  <li>• 1 screenshot upload</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-1">Starter — $5/month</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 30 worksheets per month</li>
                  <li>• Answer keys included</li>
                  <li>• All problem modifiers</li>
                  <li>• Up to 3 screenshot uploads</li>
                </ul>
              </div>
              <div className="bg-[#1a365d]/5 rounded-lg border border-[#1a365d]/20 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-1">Pro — $25/month or $200/year</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 100 worksheets per month</li>
                  <li>• Everything in Starter</li>
                  <li>• Up to 10 screenshot uploads</li>
                  <li>• Priority generation</li>
                  <li>• Annual plan saves $100/year</li>
                </ul>
              </div>
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                <h3 className="font-semibold text-[#1a365d] mb-1">Enterprise — $99/month</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• 500 worksheets per month</li>
                  <li>• Everything in Pro</li>
                  <li>• Custom logo on worksheets</li>
                  <li>• Usage analytics dashboard</li>
                  <li>• Priority support &amp; invoice billing</li>
                  <li>• Multi-user team access</li>
                </ul>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed mb-3">
              Paid subscriptions are billed monthly (or annually for Pro Annual) through Stripe.
              You may cancel at any time from your account settings. Cancellation takes effect
              at the end of your current billing period. Unused worksheets do not roll over to
              the next month.
            </p>
            <p className="text-slate-600 leading-relaxed">
              For details on refunds, please see our{" "}
              <Link href="/refund" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                Cancellation &amp; Refund Policy
              </Link>.
            </p>
          </section>

          <section id="usage-limits">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">5. Usage Limits</h2>
            <p className="text-slate-600 leading-relaxed">
              Each plan has a monthly worksheet generation limit. Limits reset at the beginning
              of each calendar month. We reserve the right to modify plan limits with reasonable
              notice to subscribers.
            </p>
          </section>

          <section id="acceptable-use">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">6. Acceptable Use</h2>
            <p className="text-slate-600 leading-relaxed mb-3">You agree not to:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-600 pl-2">
              <li>Circumvent or attempt to circumvent usage limits</li>
              <li>Use automated tools, scripts, or bots to generate worksheets</li>
              <li>Resell or redistribute generated worksheets as a competing service</li>
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, hack, or compromise the service</li>
              <li>Share your account credentials or allow others to access your subscription</li>
            </ol>
          </section>

          <section id="ip">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">7. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The Test Prep Sheets service, including its design, branding, and underlying
              technology, is owned by TKO Prep. You may use generated worksheets for personal
              study, classroom instruction, or tutoring. Generated content is not exclusive —
              other users may receive similar problems on the same topics.
            </p>
            <p className="text-slate-600 leading-relaxed">
              You may not resell generated worksheets, rebrand them as your own product, or use
              them to build a competing service.
            </p>
          </section>

          <section id="accuracy">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">8. Generated Content &amp; Accuracy</h2>
            <p className="text-slate-600 leading-relaxed">
              Worksheets are created by AI and are provided for educational practice purposes.
              While we strive for accuracy, we do not guarantee that all problems or solutions
              are error-free. Users should verify answers independently for high-stakes purposes.
            </p>
          </section>

          <section id="no-affiliation">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">9. Disclaimer — No Affiliation</h2>
            <p className="text-slate-600 leading-relaxed">
              SAT is a registered trademark of the College Board. ACT is a registered trademark
              of ACT, Inc. Test Prep Sheets and TKO Prep are not affiliated with, endorsed by,
              or sponsored by the College Board or ACT, Inc.
            </p>
          </section>

          <section id="warranties">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">10. Disclaimer of Warranties</h2>
            <p className="text-slate-600 leading-relaxed">
              The service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any
              kind, either express or implied, including but not limited to implied warranties of
              merchantability, fitness for a particular purpose, or non-infringement. We do not
              warrant that the service will be uninterrupted, error-free, or that generated
              content will be perfectly accurate.
            </p>
          </section>

          <section id="liability">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">11. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, TKO Prep and its owners, employees, and
              affiliates shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages resulting from your use of or inability to use
              the service, including but not limited to loss of data, revenue, or anticipated
              savings.
            </p>
          </section>

          <section id="changes">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">12. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these terms at any time. Material changes will be
              communicated through the service or via email. Continued use after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section id="governing-law">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">13. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These terms shall be governed by and construed in accordance with the laws of the
              State of New York, without regard to its conflict of law provisions.
            </p>
          </section>

          <section id="contact">
            <h2 className="text-xl font-bold text-[#1a365d] mb-3 pb-2 border-b border-slate-200">14. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these terms, contact us at:{" "}
              <a href="mailto:info@tkoprep.com" className="text-[#1a365d] font-medium underline hover:text-[#e53e3e]">
                info@tkoprep.com
              </a>
            </p>
          </section>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <Link href="/privacy" className="hover:text-[#1a365d] underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/refund" className="hover:text-[#1a365d] underline">Refund Policy</Link>
          <span>•</span>
          <Link href="/" className="hover:text-[#1a365d] underline">Back to Generator</Link>
        </div>
      </main>
    </div>
  );
}
