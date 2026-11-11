import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import katex from 'katex';

export type DemoMode = 'specs' | 'math' | 'mimo' | 'export';

interface StudioWorkspaceDemoProps {
  onOpenEditor?: () => void;
}

const MODES: { id: DemoMode; label: string }[] = [
  { id: 'specs', label: 'Technical Specs' },
  { id: 'math', label: 'KaTeX Math' },
  { id: 'mimo', label: 'Mimo AI Diff' },
  { id: 'export', label: 'Print Preview' },
];

const CODE_SNIPPETS: Record<DemoMode, string[]> = {
  specs: [
    '# Distributed Storage Spec v2.3',
    '',
    '| Component   | Protocol       | Latency |',
    '| :---------- | :------------- | :------ |',
    '| Local Store | IndexedDB      | < 12ms  |',
    '| Sync Bus    | CRDT Vector    | 0-conf  |',
    '| Cache       | In-Memory LRU  | < 1ms   |',
    '',
    '- [x] Schema migration v2.3',
    '- [x] Offline write-ahead log',
    '- [ ] WebWorker diff engine',
    '- [ ] KaTeX pre-compilation',
  ],
  math: [
    '## Quantum State & Electrodynamics',
    '',
    "Faraday's Law of Induction:",
    '$$\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}$$',
    '',
    'Time-Independent Schrödinger Equation:',
    '$$\\hat{H} |\\psi\\rangle = E |\\psi\\rangle$$',
    '',
    'Qubit Superposition State:',
    '$$|\\Psi\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle)$$',
  ],
  mimo: [
    '> Mimo Intent: "Optimize buffer allocation and avoid GC pauses"',
    '',
    '// Before (High GC pressure):',
    '- const buffer = new Array(capacity).fill(null);',
    '- const dataView = parsePayload(buffer);',
    '',
    '// After (Zero-copy native memory):',
    '+ const buffer = new Uint8Array(capacity);',
    '+ const dataView = new DataView(buffer.buffer);',
    '',
    'Status: Ready for review',
  ],
  export: [
    '---',
    'title: "Systems Architecture Report"',
    'format: "camera-ready"',
    'margins: "20mm"',
    'dpi: 300',
    '---',
    '',
    '# Production Architecture Audit',
    'Author: Engineering Team',
    'Date: 2026-11-11',
    '',
    'MD Writer delivers vector-sharp PDF,',
    'clean Word DOCX, and raw Markdown.',
  ],
};

export const StudioWorkspaceDemo: React.FC<StudioWorkspaceDemoProps> = ({ onOpenEditor }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<DemoMode>('specs');
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [task1Checked, setTask1Checked] = useState(true);
  const [task2Checked, setTask2Checked] = useState(true);
  const [task3Checked, setTask3Checked] = useState(false);
  const [mimoAccepted, setMimoAccepted] = useState(false);

  const handleLaunch = () => {
    if (onOpenEditor) {
      onOpenEditor();
    } else {
      navigate('/editor');
    }
  };

  const renderMathFormula = (latex: string) => {
    try {
      return { __html: katex.renderToString(latex, { displayMode: true, throwOnError: false }) };
    } catch {
      return { __html: latex };
    }
  };

  return (
    <section className="py-8 sm:py-12 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Console Frame with Global rounded-2xl Token */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 shadow-xs">
        {/* Frame Header Bar */}
        <div className="h-11 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/80 px-4 flex items-center justify-between gap-3">
          {/* Left: Window Controls + Document Name */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 select-none" aria-hidden="true">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            </div>
            <span className="font-mono text-xs text-neutral-600 dark:text-neutral-400 font-medium truncate">
              quantum_notes.md <span className="text-neutral-400 dark:text-neutral-600 text-[11px]">(Saved locally)</span>
            </span>
          </div>

          {/* Center: Mode Tabs */}
          <div className="hidden sm:flex items-center gap-1 p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
            {MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setActiveTab(mode.id);
                  setMimoAccepted(false);
                }}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === mode.id
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Right: Quick Action to open editor */}
          <div className="flex items-center gap-2">
            {/* Mobile View Toggle */}
            <div className="sm:hidden flex items-center border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 text-[11px] font-medium p-0.5">
              <button
                onClick={() => setMobileView('editor')}
                className={`px-2 py-0.5 rounded-md ${
                  mobileView === 'editor'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                    : 'text-neutral-500'
                }`}
              >
                Code
              </button>
              <button
                onClick={() => setMobileView('preview')}
                className={`px-2 py-0.5 rounded-md ${
                  mobileView === 'preview'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                    : 'text-neutral-500'
                }`}
              >
                Preview
              </button>
            </div>

            <button
              onClick={handleLaunch}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Live Workspace</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Mobile Mode Bar */}
        <div className="sm:hidden flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-2 overflow-x-auto gap-1">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setActiveTab(mode.id);
                setMimoAccepted(false);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg whitespace-nowrap font-medium ${
                activeTab === mode.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Dual-Pane Workspace Console */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 min-h-[380px]">
          {/* Left Pane: Editor Syntax Area */}
          <div
            className={`p-4 font-mono text-xs bg-neutral-50/50 dark:bg-neutral-950 select-text overflow-x-auto ${
              mobileView === 'preview' ? 'hidden md:block' : 'block'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-semibold mb-3 flex items-center justify-between">
              <span>Plain Text Input (Markdown)</span>
              <span>UTF-8</span>
            </div>
            <div className="space-y-1">
              {CODE_SNIPPETS[activeTab].map((line, idx) => (
                <div key={idx} className="flex gap-3 leading-relaxed">
                  <span className="w-6 text-right text-neutral-400 dark:text-neutral-600 select-none text-[11px] tabular-nums">
                    {idx + 1}
                  </span>
                  <span
                    className={
                      line.startsWith('+')
                        ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                        : line.startsWith('-')
                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                        : line.startsWith('#')
                        ? 'text-neutral-950 dark:text-white font-semibold'
                        : line.startsWith('|')
                        ? 'text-violet-600 dark:text-violet-400'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }
                  >
                    {line || '\u00A0'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane: Live Rendered Output */}
          <div
            className={`p-5 bg-white dark:bg-neutral-900/40 overflow-y-auto ${
              mobileView === 'editor' ? 'hidden md:block' : 'block'
            }`}
          >
            <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-600 font-semibold mb-3 flex items-center justify-between">
              <span>Live Engine Output</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">0ms Latency</span>
            </div>

            {/* Spec Mode Preview */}
            {activeTab === 'specs' && (
              <div className="space-y-4 text-xs text-neutral-800 dark:text-neutral-200">
                <h3 className="text-base font-semibold text-neutral-950 dark:text-white tracking-tight">
                  Distributed Storage Spec v2.3
                </h3>
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium border-b border-neutral-200 dark:border-neutral-800">
                        <th className="py-2 px-3">Component</th>
                        <th className="py-2 px-3">Protocol</th>
                        <th className="py-2 px-3 tabular-nums">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                      <tr>
                        <td className="py-2 px-3 font-medium">Local Store</td>
                        <td className="py-2 px-3 text-neutral-500 dark:text-neutral-400">IndexedDB</td>
                        <td className="py-2 px-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">&lt; 12ms</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Sync Bus</td>
                        <td className="py-2 px-3 text-neutral-500 dark:text-neutral-400">CRDT Vector</td>
                        <td className="py-2 px-3 font-mono tabular-nums">0-conf</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Cache</td>
                        <td className="py-2 px-3 text-neutral-500 dark:text-neutral-400">In-Memory LRU</td>
                        <td className="py-2 px-3 font-mono tabular-nums text-emerald-600 dark:text-emerald-400">&lt; 1ms</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={task1Checked}
                      onChange={(e) => setTask1Checked(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span className={task1Checked ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                      Schema migration v2.3
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={task2Checked}
                      onChange={(e) => setTask2Checked(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span className={task2Checked ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                      Offline write-ahead log
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={task3Checked}
                      onChange={(e) => setTask3Checked(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-700 text-brand-600 focus:ring-brand-500"
                    />
                    <span className={task3Checked ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}>
                      WebWorker diff engine
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Math Mode Preview */}
            {activeTab === 'math' && (
              <div className="space-y-5 text-neutral-800 dark:text-neutral-200">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white mb-1.5">
                    Faraday's Law of Induction
                  </h3>
                  <div
                    className="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 overflow-x-auto text-neutral-900 dark:text-neutral-100"
                    dangerouslySetInnerHTML={renderMathFormula('\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}')}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-950 dark:text-white mb-1.5">
                    Hamiltonian Energy Eigenstates
                  </h3>
                  <div
                    className="p-3.5 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 overflow-x-auto text-neutral-900 dark:text-neutral-100"
                    dangerouslySetInnerHTML={renderMathFormula('\\hat{H} |\\psi\\rangle = E |\\psi\\rangle')}
                  />
                </div>
              </div>
            )}

            {/* Mimo AI Diff Mode Preview */}
            {activeTab === 'mimo' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-neutral-950 dark:text-white">
                    Mimo Diff: Buffer Optimization
                  </div>
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/80 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                    Gemini 3.x Flash
                  </span>
                </div>

                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden font-mono text-[11px] leading-relaxed">
                  {!mimoAccepted ? (
                    <>
                      <div className="p-3 bg-rose-50/80 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-b border-rose-200 dark:border-rose-900/40">
                        - const buffer = new Array(capacity).fill(null); // High GC churn
                      </div>
                      <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                        + const buffer = new Uint8Array(capacity); // Zero-alloc direct buffer
                      </div>
                    </>
                  ) : (
                    <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 flex items-center justify-between">
                      <span>const buffer = new Uint8Array(capacity);</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        Applied
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {!mimoAccepted ? (
                    <button
                      onClick={() => setMimoAccepted(true)}
                      className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs active:translate-y-[1px] transition-colors cursor-pointer shadow-xs"
                    >
                      Accept Diff (Tab)
                    </button>
                  ) : (
                    <button
                      onClick={() => setMimoAccepted(false)}
                      className="px-3.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 text-xs transition-colors cursor-pointer"
                    >
                      Revert Change
                    </button>
                  )}
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    Direct BYOK API key execution
                  </span>
                </div>
              </div>
            )}

            {/* Print Export Preview */}
            {activeTab === 'export' && (
              <div className="space-y-3">
                <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 shadow-2xs font-serif text-xs leading-relaxed">
                  <div className="border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-3 flex items-center justify-between font-sans text-[10px] text-neutral-400 uppercase tracking-widest">
                    <span>MD Writer • Camera-Ready Preview</span>
                    <span>300 DPI</span>
                  </div>
                  <h4 className="text-sm font-semibold tracking-tight font-sans mb-1 text-neutral-950 dark:text-white">
                    Production Architecture Audit
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans mb-3">
                    Engineering Team • 2026-11-11
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300">
                    MD Writer produces vector-accurate PDF documents with embedded KaTeX formulas,
                    styled tables, and pagination boundaries for publication.
                  </p>
                  <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between font-sans text-[10px] text-neutral-400">
                    <span>Margins: 20mm</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLaunch}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-medium cursor-pointer shadow-xs"
                  >
                    Open in PDF Print Engine
                  </button>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    Zero remote server conversion
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Console Bottom Status Bar */}
        <div className="h-8 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 px-4 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span>UTF-8</span>
            <span>•</span>
            <span>Markdown</span>
            <span>•</span>
            <span className="tabular-nums">412 words</span>
          </div>
          <div className="hidden sm:block text-[11px] text-neutral-400 dark:text-neutral-500">
            Press <kbd className="px-1.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 font-mono text-[10px]">/</kbd> for Slash Commands
          </div>
        </div>
      </div>
    </section>
  );
};
