import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Printer, 
  Sigma, 
  HardDrive, 
  Terminal, 
  Layers, 
  Check, 
  Copy 
} from 'lucide-react';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';

export type PillarId = 'pdf' | 'math' | 'offline' | 'slash' | 'media';

export const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<PillarId>('pdf');

  // Interactive micro-demo states
  const [mathCategory, setMathCategory] = useState<'calculus' | 'stats' | 'physics'>('calculus');
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [pdfPresetPreview, setPdfPresetPreview] = useState<'editorial' | 'academic' | 'technical'>('editorial');
  const [slashQuery, setSlashQuery] = useState('');

  const scrollToPillar = (pillar: PillarId) => {
    setActivePillar(pillar);
    const element = document.getElementById(`pillar-${pillar}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const sampleFormulas = {
    calculus: {
      latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}',
      title: 'Gaussian Integral',
      useCase: 'Probability & Quantum Mechanics'
    },
    stats: {
      latex: 'f(x) = \\frac{1}{\\sigma \\sqrt{2\\pi}} \\exp\\left(-\\frac{(x - \\mu)^2}{2\\sigma^2}\\right)',
      title: 'Normal Distribution PDF',
      useCase: 'Statistical Inference & Machine Learning'
    },
    physics: {
      latex: 'i\\hbar \\frac{\\partial}{\\partial t} \\Psi(\\mathbf{r}, t) = \\hat{H} \\Psi(\\mathbf{r}, t)',
      title: 'Schrödinger Wave Equation',
      useCase: 'Quantum Mechanical State Systems'
    }
  };

  const slashCommandsList = [
    { cmd: '/h1, /h2, /h3', desc: 'Section headings with automatic outline sync', category: 'Typography' },
    { cmd: '/table', desc: 'Visual interactive rows & columns designer', category: 'Data' },
    { cmd: '/math', desc: '20+ categorized KaTeX formula templates', category: 'STEM' },
    { cmd: '/image', desc: 'Direct WebP offline image embedder', category: 'Media' },
    { cmd: '/exportpdf', desc: 'Publication vector print stylesheet studio', category: 'Publish' },
    { cmd: '/yaml', desc: 'Document metadata frontmatter headers', category: 'Metadata' },
    { cmd: '/callout', desc: 'GitHub-flavored Note, Tip, Caution boxes', category: 'Formatting' },
    { cmd: '/code', desc: 'Syntax-highlighted multi-language blocks', category: 'Code' }
  ].filter(c => !slashQuery || c.cmd.includes(slashQuery) || c.desc.toLowerCase().includes(slashQuery.toLowerCase()));

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Navbar />

      <main className="flex-1">
        {/* Editorial Hero */}
        <section className="pt-16 pb-12 sm:pt-20 sm:pb-16 text-center max-w-5xl mx-auto px-4 sm:px-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-5 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-neutral-500" />
            <span className="font-mono uppercase tracking-wider text-[11px]">v0.9.0 Beta Architecture &amp; Feature Groups</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 dark:text-white tracking-tight mb-5 leading-tight">
            Crafted for writers who refuse<br className="hidden sm:inline" /> to sacrifice speed or typography.
          </h1>

          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore the 5 core engineering pillars powering MD Writer: sandboxed vector print typography, instantaneous KaTeX typesetting, offline-first IndexedDB caching, and distraction-free keyboard workflows.
          </p>

          {/* Jump to Pillar Quick Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {[
              { id: 'pdf' as PillarId, label: 'Publication PDF Studio', icon: Printer },
              { id: 'math' as PillarId, label: 'KaTeX Math Engine', icon: Sigma },
              { id: 'offline' as PillarId, label: 'Offline Dexie DB', icon: HardDrive },
              { id: 'slash' as PillarId, label: 'Slash Commands (/)', icon: Terminal },
              { id: 'media' as PillarId, label: 'WebP Image Studio', icon: Layers }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = activePillar === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => scrollToPillar(p.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-sm scale-102'
                      : 'bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-900 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* 5 Flagship Pillars Showcase */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pb-20">
          
          {/* Pillar 1: PDF Studio */}
          <div
            id="pillar-pdf"
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                  <Printer className="w-3.5 h-3.5 text-blue-600" />
                  <span>Vector Print Engine v2.4</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                  Publication-grade PDFs straight from plain Markdown.
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Generic web editors export ugly browser snapshots with UI chrome. MD Writer's print studio renders directly into an isolated vector print iframe with customizable standalone cover pages, automated H1–H3 table of contents with dot leaders, and crisp page numbering.
                </p>

                <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>5 Editorial typographic pairings (Sans, Academic Serif, Technical Mono)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Dynamic Table of Contents with page break awareness</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Custom brand accent colors, subtitles &amp; organization metadata</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/editor')}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <span>Test PDF Studio in Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive PDF Studio Preset Widget */}
              <div className="lg:col-span-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Interactive Preset Preview
                  </span>
                  <div className="flex gap-1.5">
                    {(['editorial', 'academic', 'technical'] as const).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPdfPresetPreview(p)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                          pdfPresetPreview === p
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated Document Preview Page */}
                <div className="p-6 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 text-neutral-900 dark:text-white space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 border-b border-neutral-200/60 dark:border-neutral-800 pb-2">
                    <span>A4 • 300 DPI VECTOR</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">READY TO EXPORT</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-blue-600 dark:text-blue-400 block">
                      {pdfPresetPreview.toUpperCase()} PRESET
                    </span>
                    <h4 className="text-base font-bold text-neutral-950 dark:text-white mt-0.5">
                      Distributed Systems Architecture RFC-402
                    </h4>
                    <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                      Author: Engineering Architecture Squad • MD Writer Publication Vector Engine
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800 text-[11px] font-mono space-y-1">
                    <div className="text-neutral-400">1. Executive Summary ........................ 02</div>
                    <div className="text-neutral-400">2. Latency Benchmarks (Sub-1ms) .......... 04</div>
                    <div className="text-neutral-400">3. Offline Partition Tolerance ............. 07</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 2: KaTeX Math */}
          <div
            id="pillar-math"
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/50">
                  <Sigma className="w-3.5 h-3.5 text-amber-600" />
                  <span>KaTeX Mathematical Engine</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                  Instant scientific formulas with zero setup.
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Never scour documentation for obscure LaTeX symbols. MD Writer bundles 20+ pre-composed equations across Calculus, Statistics, Linear Algebra, and Quantum Physics with real-time browser typesetting.
                </p>

                <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>0ms client-side KaTeX typesetting — zero network latency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>1-Click insert at cursor with keyboard shortcut <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-[11px]">/math</code></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Support for inline math <code className="font-mono">$x^2$</code> and display blocks <code className="font-mono">$$...$$</code></span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate('/editor')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <span>Launch Math Studio in Editor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive KaTeX Formula Switcher */}
              <div className="lg:col-span-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
                  <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Formula Studio Playground
                  </span>
                  <div className="flex gap-1.5">
                    {(['calculus', 'stats', 'physics'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setMathCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize transition-colors cursor-pointer ${
                          mathCategory === cat
                            ? 'bg-amber-500 text-neutral-950'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-900 dark:text-white">
                      {sampleFormulas[mathCategory].title}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {sampleFormulas[mathCategory].useCase}
                    </span>
                  </div>

                  <div className="p-4 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800 font-mono text-xs text-blue-600 dark:text-blue-400 overflow-x-auto">
                    {sampleFormulas[mathCategory].latex}
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`$$\n${sampleFormulas[mathCategory].latex}\n$$`);
                      setCopiedFormula(true);
                      setTimeout(() => setCopiedFormula(false), 2000);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedFormula ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFormula ? 'LaTeX Copied to Clipboard!' : 'Copy LaTeX Snippet'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 3: Offline Dexie DB & Storage */}
          <div
            id="pillar-offline"
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/50">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dexie.js IndexedDB Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                  Your thoughts live on your machine. Zero cloud lock-in.
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  MD Writer treats your local browser as a first-class database. Every keystroke is saved immediately to IndexedDB via Dexie.js with zero server round-trips. You can close your laptop in an airplane, write for hours, and never lose a character.
                </p>

                <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>0ms Auto-Save with debounced checkpointing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>PWA offline cache with 112 pre-cached static assets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Optional Pro Supabase sync with last-write-wins resolution</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-3 font-mono text-xs">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  Local Storage Telemetry
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">Storage Engine</span>
                    <span className="font-bold text-neutral-900 dark:text-white">Dexie.js / IndexedDB v2</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">Save Latency</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 1ms (Local memory)</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-neutral-100 dark:border-neutral-800/60">
                    <span className="text-neutral-500">Network Requirement</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">Zero (Full Offline Support)</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-neutral-500">Privacy Guarantee</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Client-Side Isolated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 4: Slash Commands */}
          <div
            id="pillar-slash"
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/50">
                  <Terminal className="w-3.5 h-3.5 text-purple-600" />
                  <span>Keyboard-First Slash Palette</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                  Keep your fingers anchored to the home row.
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Type <code className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 font-mono text-xs">/</code> anywhere to trigger instant insertion of headings, callouts, tables, YAML frontmatter, or formulas without touching your mouse.
                </p>

                <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Instant fuzzy-search across all 15+ block types</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Bottom-sheet drawer on mobile to prevent keyboard cover-ups</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Global Command Palette via <code className="font-mono">Ctrl + K / Cmd + K</code></span>
                  </div>
                </div>
              </div>

              {/* Interactive Slash Search Playground */}
              <div className="lg:col-span-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    Interactive Slash Finder
                  </span>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {slashCommandsList.length} Commands Available
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={slashQuery}
                    onChange={(e) => setSlashQuery(e.target.value)}
                    placeholder="Search slash commands (e.g. table, pdf, h1)..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {slashCommandsList.map((cmd, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-neutral-50/70 dark:bg-neutral-900/60 border border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                          {cmd.cmd}
                        </span>
                        <div className="text-[11px] text-neutral-500 mt-0.5">
                          {cmd.desc}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                        {cmd.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pillar 5: WebP Image Studio */}
          <div
            id="pillar-media"
            className="p-6 sm:p-10 rounded-3xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 shadow-sm transition-all"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-6 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/50">
                  <Layers className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Client-Side WebP Compression Studio</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white tracking-tight">
                  Paste screenshots freely. Zero bloated documents.
                </h2>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Pasting raw PNGs quickly inflates documents to dozens of megabytes. MD Writer intercepts clipboard paste (Ctrl+V) and drag-and-drop, downscales on an HTML5 bicubic canvas, and compresses to modern WebP with up to 75% savings before saving to IndexedDB.
                </p>

                <div className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300 font-medium">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Direct clipboard paste (Ctrl+V / Cmd+V)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>100% offline conversion — images never uploaded to foreign cloud servers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Automatic base64 DataURL embedding with Markdown preview</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white dark:bg-neutral-950 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-md space-y-3">
                <div className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider pb-2 border-b border-neutral-100 dark:border-neutral-800">
                  Image Compression Telemetry Example
                </div>
                <div className="p-4 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/30 border border-cyan-200/60 dark:border-cyan-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                    <span>Screenshot_architecture.png</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      -74% Compressed
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
                    <span>Raw Input: 2.8 MB (PNG)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Optimized: 720 KB (WebP)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
