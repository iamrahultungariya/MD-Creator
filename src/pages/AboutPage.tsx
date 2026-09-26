import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Feather, 
  ShieldCheck, 
  Cpu, 
  Printer, 
  Terminal, 
  ArrowRight,
  Heart
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { openBuyCoffeeModal } from '../utils/coffeeModalEvents';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-150 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-5 shadow-2xs">
            <Feather className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Mission &amp; Philosophy</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight mb-5 leading-tight">
            Crafting a sanctuary for <br className="hidden sm:inline" />
            thought and technical prose.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed mb-8">
            MD Writer exists to solve a single problem: writing applications have become sluggish, cluttered, and bloated. We believe document writing should be instantaneous, private, and beautifully typeset.
          </p>
        </section>

        {/* Core Principles */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Principle 1 */}
            <div className="p-8 rounded-3xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center mb-5 font-black shadow-xs">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-3">
                  Local-First by Default
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Your thoughts should never wait on an HTTP request. By pairing client-side IndexedDB persistence with optional background sync, typing latency remains at a pristine 0 milliseconds whether you are online or flying at 35,000 feet.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                0ms Keystroke Latency
              </div>
            </div>

            {/* Principle 2 */}
            <div className="p-8 rounded-3xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center mb-5 font-black shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-3">
                  Complete Data Ownership
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Every document you create is stored as pure, standardized GitHub Flavored Markdown (GFM). We never lock your words into proprietary database schemas or unreadable file binaries. Your content is yours forever.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                Open Standard .md
              </div>
            </div>

            {/* Principle 3 */}
            <div className="p-8 rounded-3xl bg-neutral-50/70 dark:bg-neutral-900/50 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center mb-5 font-black shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight mb-3">
                  Publication-Grade Output
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Writing is only complete when it is ready to be shared. MD Writer features curated typography engines, sandboxed vector PDF generation with automatic running footers, and Word (.docx) export for production-ready deliverables.
                </p>
              </div>
              <div className="pt-6 mt-6 border-t border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono text-neutral-500">
                Clean Print Geometry
              </div>
            </div>

          </div>
        </section>

        {/* Feature Deep Dive Section */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="p-8 sm:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs">
            <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight mb-6">
              Built for Technical Writers &amp; Deep Thinkers
            </h2>
            
            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
              <p>
                Modern technical communication requires more than plain paragraphs. It demands mathematical formulas, architectural diagrams, syntax-highlighted code blocks, and structured specifications.
              </p>
              <p>
                MD Writer integrates high-performance KaTeX typesetting for mathematical expressions, responsive Mermaid.js diagrams for architectural workflows, and an instant slash command studio to insert complex visual structures effortlessly.
              </p>
              <p>
                There are no intrusive notification popups, no AI-generated rainbow gradients, and no unsolicited widgets competing for your attention. Just clean typography and a responsive canvas.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <Terminal className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                <span>Version 0.9.0 Beta • Open Web Platform</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={openBuyCoffeeModal}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Support Project</span>
                </button>
                <button
                  onClick={() => navigate('/editor')}
                  className="px-5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Launch Editor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
