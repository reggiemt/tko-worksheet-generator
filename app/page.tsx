import { WorksheetForm } from "@/components/worksheet-form";
import { Camera, Sparkles, Download, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f0f4f8] to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#1a365d]">TKO Prep</span>
            <span className="text-xs bg-[#e53e3e] text-white px-2 py-0.5 rounded-full font-medium">
              FREE
            </span>
          </div>
          <a
            href="https://tkoprep.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1a365d] hover:text-[#e53e3e] transition-colors font-medium"
          >
            tkoprep.com →
          </a>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-12 pb-8 md:pt-20 md:pb-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1a365d] mb-4">
              Free SAT Practice{" "}
              <span className="text-[#e53e3e]">Worksheet Generator</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-2 max-w-2xl mx-auto">
              Upload a screenshot of any SAT math problem or choose a topic.
              Get a professional practice worksheet with verified answers in seconds.
            </p>
            <p className="text-sm text-slate-500">
              Powered by{" "}
              <a
                href="https://tkoprep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#e53e3e] hover:underline font-medium"
              >
                TKO Prep
              </a>{" "}
              — Expert SAT &amp; ACT Tutoring
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
                Snap a photo of an SAT problem or pick a topic from our catalog
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#e53e3e]/10 mb-3">
                <Sparkles className="h-6 w-6 text-[#e53e3e]" />
              </div>
              <h3 className="font-semibold text-[#1a365d] mb-1">2. AI Generates Problems</h3>
              <p className="text-sm text-slate-500">
                Our AI creates authentic, difficulty-matched problems with verified answers
              </p>
            </div>
            <div className="text-center p-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#1a365d]/10 mb-3">
                <Download className="h-6 w-6 text-[#1a365d]" />
              </div>
              <h3 className="font-semibold text-[#1a365d] mb-1">3. Download &amp; Practice</h3>
              <p className="text-sm text-slate-500">
                Get a professional PDF worksheet with answer key and step-by-step solutions
              </p>
            </div>
          </div>
        </section>

        {/* Worksheet Form */}
        <section className="container mx-auto px-4 pb-12">
          <WorksheetForm />
        </section>

        {/* Social Proof / Trust */}
        <section className="container mx-auto px-4 pb-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-slate-600 italic mb-2">
              &ldquo;TKO Prep helped me raise my SAT math score by 120 points.
              These practice worksheets are exactly what I needed.&rdquo;
            </p>
            <p className="text-sm text-slate-400">— TKO Prep Student</p>

            <div className="mt-8 grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-[#1a365d]">1,000+</p>
                <p className="text-xs text-slate-500">Worksheets Generated</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a365d]">23</p>
                <p className="text-xs text-slate-500">Math Topics</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1a365d]">100%</p>
                <p className="text-xs text-slate-500">Free to Use</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#1a365d] text-white/80">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="font-semibold text-white">TKO Prep</p>
              <p className="text-sm">Free SAT &amp; ACT Test Preparation Resources</p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <a
                href="https://tkoprep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                tkoprep.com
              </a>
              <a
                href="https://tkoprep.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                Book a Free Consultation
              </a>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/50">
            © {new Date().getFullYear()} TKO Prep | Free SAT &amp; ACT Test Preparation Resources |{" "}
            <a
              href="https://tkoprep.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/80"
            >
              tkoprep.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
