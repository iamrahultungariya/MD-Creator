import React, { useState } from 'react';
import { Sparkles, Code2, Eye, Copy, Check } from 'lucide-react';
import { MarkdownPreview } from '../editor/MarkdownPreview';

const INITIAL_SNIPPET = `# Quantum Wavefunction ✦
The time-dependent Schrödinger equation:
$$i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

> [!TIP]
> 100% offline capability with zero cloud latency.

- [x] Local-first IndexedDB persistence
- [x] Direct Google Gemini 3.x BYOK
- [ ] Launch v2.3.0 officially
`;

export const InteractiveMarkdownSandbox: React.FC = () => {
  const [content, setContent] = useState(INITIAL_SNIPPET);
  const [isCopied, setIsCopied] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertFormula = () => {
    setContent((prev) => `${prev}\n\n### Euler's Identity\n$$e^{i\\pi} + 1 = 0$$\n`);
  };

  const handleInsertAlert = () => {
    setContent(
      (prev) =>
        `${prev}\n\n> [!NOTE]\n> MD Writer auto-saves every keystroke to your local device.\n`
    );
  };

  const handleSimulateMimo = () => {
    setIsPolishing(true);
    setTimeout(() => {
      setContent(
        `# Quantum Wavefunction ✦ [Polished by Mimo]
The time-dependent Schrödinger equation governs dynamic state evolution:
$$i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)$$

> [!NOTE]
> Mimo 2.3 AST Section Surgeon applied non-destructive polish without altering math expressions.

| Parameter | Description | Domain |
| :--- | :--- | :--- |
| $\\hbar$ | Reduced Planck Constant | Fundamental |
| $\\Psi$ | State Vector | Hilbert Space |

- [x] Local-first IndexedDB persistence
- [x] Direct Google Gemini 3.x BYOK
- [x] Launch v2.3.0 officially 🚀
`
      );
      setIsPolishing(false);
    }, 600);
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl overflow-hidden font-sans text-left">
      {/* Sandbox Header */}
      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/60 flex flex-wrap items-center justify-between gap-3">
        {/* Mac-style Window Dots + Document Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 select-none">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
            quantum-notes.md <span className="text-emerald-500 font-semibold">• Live Sandbox</span>
          </span>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleInsertFormula}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            + Formula
          </button>
          <button
            type="button"
            onClick={handleInsertAlert}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-100 hover:bg-neutral-200/70 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
          >
            + Alert
          </button>
          <button
            type="button"
            onClick={handleSimulateMimo}
            disabled={isPolishing}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 border border-brand-500/20 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3" />
            <span>{isPolishing ? 'Mimo Polishing...' : 'Ask Mimo to Polish'}</span>
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer"
            title="Copy Markdown"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 min-h-[340px] max-h-[460px]">
        {/* Left: Interactive Markdown Input */}
        <div className="p-4 flex flex-col bg-neutral-50/30 dark:bg-neutral-950/40">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-400">
            <span className="flex items-center gap-1"><Code2 className="w-3 h-3" /> Markdown Source</span>
            <span>Editable</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full flex-1 resize-none bg-transparent font-mono text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed focus:outline-none border-0 selection:bg-brand-500/30"
            spellCheck={false}
            aria-label="Interactive Markdown Source Editor"
          />
        </div>

        {/* Right: Real-time Formatted Render */}
        <div className="p-4 flex flex-col bg-white dark:bg-neutral-900 overflow-y-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 text-[10px] font-mono uppercase text-neutral-400">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> Live Formatted Preview</span>
            <span className="text-emerald-500 font-semibold">0ms KaTeX Math</span>
          </div>
          <div className="flex-1 text-xs">
            <MarkdownPreview content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};
