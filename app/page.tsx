import { WorksheetForm } from "@/components/worksheet-form";
import { Camera, Sparkles, Download, Star, Check, Zap, Target, Brain, Mail, Globe, Calendar, CreditCard, FileText, Shield, BookOpen } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AuthButton } from "@/components/auth-button";
import { NavUsage } from "@/components/nav-usage";
import { SubscribeButton } from "@/components/subscribe-button";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f0f4f8] to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/tko-logo.png"
              alt="TKO Prep"
              width={36}
              height={44}
              className="h-9 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#1a365d] leading-tight">
                TKO Prep
              </span>
              <span className="text-[10px] text-slate-500 leading-tight -mt-0.5">
                Worksheet Generator
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <NavUsage />
            <AuthButton />
            <Link
              href="/pricing"
              className="text-sm text-[#1a365d] hover:text-[#e53e3e] transition-colors font-medium hidden sm:block"
            >
              Pricing
            </Link>
            <a
              href="https://tkoprep.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-[#e53e3e] text-white px-4 py-1.5 rounded-lg hover:bg-[#c53030] transition-colors font-medium"
            >
              Get a Tutor →
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-[#e53e3e]/10 text-[#e53e3e] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4" />
              AI-Powered SAT Math Practice
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a365d] mb-5">
              Generate{" "}
              <span className="text-[#e53e3e]">Custom SAT Worksheets</span>
              {" "}in Seconds
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-3 max-w-2xl mx-auto">
              Pick a topic or snap a photo of any SAT problem — our AI creates
              a printable PDF worksheet with step-by-step solutions instantly.
            </p>
            <p className="text-sm text-slate-500 mb-2">
              3 free worksheets to try it out. No account needed.
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a365d]/10 mb-3">
                <Camera className="h-6 w-6 text-[#1a365d]" />
              </div>
              <h3 className="font-semibold text-[#1a365d] mb-1">1. Upload or Choose</h3>
              <p className="text-sm text-slate-500">
                Snap a photo of any SAT problem or pick from 23 math topics
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e53e3e]/10 mb-3">
                <Sparkles className="h-6 w-6 text-[#e53e3e]" />
              </div>
              <h3 className="font-semibold text-[#1a365d] mb-1">2. Customize Your Practice</h3>
              <p className="text-sm text-slate-500">
                Set difficulty, question count, and special modifiers like &ldquo;No-Desmos&rdquo; or &ldquo;Fractions Only&rdquo;
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a365d]/10 mb-3">
                <Download className="h-6 w-6 text-[#1a365d]" />
              </div>
              <h3 className="font-semibold text-[#1a365d] mb-1">3. Download &amp; Practice</h3>
              <p className="text-sm text-slate-500">
                Get a professional PDF worksheet with full solutions and answer key
              </p>
            </div>
          </div>
        </section>

        {/* Worksheet Form */}
        <section id="generator" className="container mx-auto px-4 pb-16">
          <WorksheetForm />
        </section>

        {/* Why This Tool */}
        <section className="bg-[#1a365d]/[0.03] py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] text-center mb-10">
              Built by SAT Tutors, for SAT Students
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <Target className="h-8 w-8 text-[#e53e3e] mb-3" />
                <h3 className="font-semibold text-[#1a365d] mb-2">Targeted Practice</h3>
                <p className="text-sm text-slate-500">
                  Drill exactly the topics you struggle with. No more wasting time on problems you already know.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <Brain className="h-8 w-8 text-[#e53e3e] mb-3" />
                <h3 className="font-semibold text-[#1a365d] mb-2">No-Desmos Mode</h3>
                <p className="text-sm text-slate-500">
                  Build real algebraic reasoning skills. Problems that can&rsquo;t be shortcut with a graphing calculator.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <Sparkles className="h-8 w-8 text-[#e53e3e] mb-3" />
                <h3 className="font-semibold text-[#1a365d] mb-2">Verified Answers</h3>
                <p className="text-sm text-slate-500">
                  Every problem is reverse-engineered from the answer. Step-by-step solutions included.
                </p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <Camera className="h-8 w-8 text-[#e53e3e] mb-3" />
                <h3 className="font-semibold text-[#1a365d] mb-2">Screenshot Magic</h3>
                <p className="text-sm text-slate-500">
                  Photo a problem from any practice test. AI identifies the topic and generates similar problems instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600 italic mb-2 text-lg">
              &ldquo;TKO Prep helped me raise my SAT math score by 120 points.
              These practice worksheets are exactly what I needed.&rdquo;
            </p>
            <p className="text-sm text-slate-400">— TKO Prep Student</p>

            <div className="mt-10 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-[#1a365d]">23</p>
                <p className="text-xs text-slate-500 mt-1">SAT Math Topics</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1a365d]">3</p>
                <p className="text-xs text-slate-500 mt-1">Difficulty Levels</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#1a365d]">5</p>
                <p className="text-xs text-slate-500 mt-1">Problem Modifiers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section (inline) */}
        <section id="pricing" className="bg-[#1a365d] py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Simple, Affordable Pricing
              </h2>
              <p className="text-white/70 max-w-xl mx-auto">
                Start free. Upgrade when you need more practice.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {/* Free */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-1">Free</h3>
                <p className="text-white/60 text-sm mb-4">Get started free</p>
                <p className="text-3xl font-bold text-white mb-1">
                  $0<span className="text-sm font-normal text-white/60">/mo</span>
                </p>
                <p className="text-[#e53e3e] text-sm font-medium mb-5">3 free worksheets</p>
                <ul className="space-y-2 mb-6">
                  {["3 free worksheets", "All SAT math topics", "3 difficulty levels", "PDF worksheet download", "Unlock 1 answer key via email", "No account required"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#generator"
                  className="block text-center py-2.5 px-4 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors"
                >
                  Start Generating
                </a>
              </div>

              {/* Starter */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-1">Starter</h3>
                <p className="text-white/60 text-sm mb-4">For regular practice</p>
                <p className="text-3xl font-bold text-white mb-1">
                  $5<span className="text-sm font-normal text-white/60">/mo</span>
                </p>
                <p className="text-[#e53e3e] text-sm font-medium mb-5">30 worksheets/month</p>
                <ul className="space-y-2 mb-6">
                  {["30 worksheets per month", "All topics & difficulty levels", "✅ Answer keys included", "✅ Problem modifiers", "Upload up to 3 screenshots", "Auto-detect topics from photos", "No daily cap"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SubscribeButton
                  planId="starter"
                  label="Get Starter — $5/mo"
                  className="w-full block text-center py-2.5 px-4 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors cursor-pointer"
                />
              </div>

              {/* Pro */}
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-[#e53e3e] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#e53e3e] text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
                <h3 className="text-lg font-bold text-[#1a365d] mb-1">Pro</h3>
                <p className="text-slate-500 text-sm mb-4">Most popular</p>
                <p className="text-3xl font-bold text-[#1a365d] mb-1">
                  $25<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                <p className="text-[#e53e3e] text-sm font-medium mb-5">100 worksheets/month</p>
                <ul className="space-y-2 mb-6">
                  {["100 worksheets per month", "Everything in Starter, plus:", "Upload up to 10 screenshots", "Multi-topic mixed worksheets", "Priority generation", "Best value for serious prep"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SubscribeButton
                  planId="pro"
                  label="Go Pro — $25/mo"
                  className="w-full block text-center py-2.5 px-4 rounded-lg bg-[#1a365d] text-white font-medium text-sm hover:bg-[#1a365d]/90 transition-colors cursor-pointer"
                />
              </div>

              {/* Enterprise */}
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-1">Enterprise</h3>
                <p className="text-white/60 text-sm mb-4">For schools & tutors</p>
                <p className="text-3xl font-bold text-white mb-1">
                  $99<span className="text-sm font-normal text-white/60">/mo</span>
                </p>
                <p className="text-[#e53e3e] text-sm font-medium mb-5">500 worksheets/month</p>
                <ul className="space-y-2 mb-6">
                  {["500 worksheets per month", "Everything in Pro, plus:", "Custom logo on worksheets", "Usage analytics dashboard", "Priority support & invoice billing"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/80">
                      <Check className="h-4 w-4 text-green-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <SubscribeButton
                  planId="enterprise"
                  label="Get Enterprise — $99/mo"
                  className="w-full block text-center py-2.5 px-4 rounded-lg bg-white/20 text-white font-medium text-sm hover:bg-white/30 transition-colors cursor-pointer"
                />
              </div>
            </div>

            {/* Annual upsell */}
            <div className="text-center mt-8">
              <Link href="/pricing" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm transition-colors">
                <span>💡 Save $100/year with Pro Annual →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a365d] mb-4">
            Need More Than Worksheets?
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto mb-6">
            TKO Prep offers personalized 1-on-1 SAT &amp; ACT tutoring with expert instructors.
            Average score improvement: <strong>120+ points</strong>.
          </p>
          <a
            href="https://tkoprep.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#e53e3e] text-white px-8 py-3 rounded-lg hover:bg-[#c53030] transition-colors font-medium text-lg"
          >
            Book a Free Consultation →
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#1a365d] text-white/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/tko-logo.png"
                alt="TKO Prep"
                width={28}
                height={34}
                className="h-7 w-auto opacity-80"
              />
              <div>
                <p className="font-semibold text-white">TKO Prep</p>
                <p className="text-sm text-white/60">SAT &amp; ACT Test Preparation</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm flex-wrap">
              <Link href="/pricing" className="hover:text-white transition-colors inline-flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5" />
                Pricing
              </Link>
              <a
                href="mailto:info@tkoprep.com"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Mail className="h-3.5 w-3.5" />
                info@tkoprep.com
              </a>
              <a
                href="https://tkoprep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                tkoprep.com
              </a>
              <a
                href="https://tkoprep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors inline-flex items-center gap-1.5"
              >
                <Calendar className="h-3.5 w-3.5" />
                Book a Consultation
              </a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-white/50">
            <span>© {new Date().getFullYear()} TKO Prep. SAT is a registered trademark of the College Board, which is not affiliated with TKO Prep.</span>
            <span className="hidden sm:inline">|</span>
            <Link href="/privacy" className="hover:text-white/80 inline-flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-white/80 inline-flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Terms of Service
            </Link>
            <span>|</span>
            <Link href="/refund" className="hover:text-white/80 inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              Refund Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
