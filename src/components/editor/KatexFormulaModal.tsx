import React, { useState, useMemo, useCallback } from 'react';
import { 
  X, 
  Search, 
  Copy, 
  Check, 
  Plus, 
  Sigma, 
  Sparkles, 
  BookOpen, 
  Wand2, 
  RotateCcw
} from 'lucide-react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { KATEX_FORMULAS, KatexFormula, FormulaCategory } from '../../data/katexFormulas';

interface KatexFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula?: (latexSnippet: string) => void;
}

const CATEGORIES: { id: FormulaCategory; label: string }[] = [
  { id: 'all', label: 'All Formulas' },
  { id: 'calculus', label: 'Calculus' },
  { id: 'algebra', label: 'Linear Algebra' },
  { id: 'physics', label: 'Physics' },
  { id: 'stats', label: 'Statistics' },
  { id: 'discrete', label: 'Discrete & Logic' },
];

interface PaletteItem {
  label: string;
  latex: string;
  category: 'core' | 'calculus' | 'greek' | 'symbols' | 'matrices';
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Core & Fractions
  { label: 'a/b', latex: '\\frac{a}{b}', category: 'core' },
  { label: '√x', latex: '\\sqrt{x}', category: 'core' },
  { label: 'ⁿ√x', latex: '\\sqrt[n]{x}', category: 'core' },
  { label: 'xⁿ', latex: 'x^{n}', category: 'core' },
  { label: 'xᵢ', latex: 'x_{i}', category: 'core' },
  { label: 'xⁿᵢ', latex: 'x_{i}^{n}', category: 'core' },

  // Calculus & Limits
  { label: '∫ f(x) dx', latex: '\\int_{a}^{b} f(x) \\, dx', category: 'calculus' },
  { label: '∑ xᵢ', latex: '\\sum_{i=1}^{n} x_i', category: 'calculus' },
  { label: '∏ xᵢ', latex: '\\prod_{i=1}^{n} x_i', category: 'calculus' },
  { label: 'lim', latex: '\\lim_{x \\to \\infty} f(x)', category: 'calculus' },
  { label: 'df/dx', latex: '\\frac{df}{dx}', category: 'calculus' },
  { label: '∂f/∂x', latex: '\\frac{\\partial f}{\\partial x}', category: 'calculus' },

  // Greek Letters
  { label: 'α', latex: '\\alpha', category: 'greek' },
  { label: 'β', latex: '\\beta', category: 'greek' },
  { label: 'γ', latex: '\\gamma', category: 'greek' },
  { label: 'θ', latex: '\\theta', category: 'greek' },
  { label: 'λ', latex: '\\lambda', category: 'greek' },
  { label: 'μ', latex: '\\mu', category: 'greek' },
  { label: 'π', latex: '\\pi', category: 'greek' },
  { label: 'σ', latex: '\\sigma', category: 'greek' },
  { label: 'ω', latex: '\\omega', category: 'greek' },
  { label: 'Δ', latex: '\\Delta', category: 'greek' },
  { label: 'Σ', latex: '\\Sigma', category: 'greek' },
  { label: 'Ω', latex: '\\Omega', category: 'greek' },

  // Symbols & Logic
  { label: '±', latex: '\\pm', category: 'symbols' },
  { label: '≤', latex: '\\le', category: 'symbols' },
  { label: '≥', latex: '\\ge', category: 'symbols' },
  { label: '≠', latex: '\\neq', category: 'symbols' },
  { label: '≈', latex: '\\approx', category: 'symbols' },
  { label: '∈', latex: '\\in', category: 'symbols' },
  { label: '∉', latex: '\\notin', category: 'symbols' },
  { label: '⊂', latex: '\\subset', category: 'symbols' },
  { label: '∞', latex: '\\infty', category: 'symbols' },
  { label: '→', latex: '\\to', category: 'symbols' },
  { label: '⇒', latex: '\\implies', category: 'symbols' },
  { label: '⇔', latex: '\\iff', category: 'symbols' },

  // Matrices & Delimiters
  { label: '( · )', latex: '\\left( x \\right)', category: 'matrices' },
  { label: '[ · ]', latex: '\\left[ x \\right]', category: 'matrices' },
  { label: '{ · }', latex: '\\left\\{ x \\right\\}', category: 'matrices' },
  { label: '| · |', latex: '\\left| x \\right|', category: 'matrices' },
  { label: '2×2 Mat', latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', category: 'matrices' },
  { label: '3×3 Mat', latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}', category: 'matrices' },
];

/**
 * Converts quick natural text shorthand into valid LaTeX syntax
 */
function convertShorthandToLatex(text: string): string {
  let res = text;
  // Replace sqrt(...) -> \sqrt{...}
  res = res.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');

  // Replace fractions like (a)/(b) or numbers/identifiers like 1/2 or x/y
  res = res.replace(/([a-zA-Z0-9_]+)\/([a-zA-Z0-9_]+)/g, '\\frac{$1}{$2}');

  // Common symbol keywords
  const keywordMap: Record<string, string> = {
    '<=': '\\le',
    '>=': '\\ge',
    '!=': '\\neq',
    '~=': '\\approx',
    '+-': '\\pm',
    '->': '\\to',
    '<-': '\\leftarrow',
    '<->': '\\leftrightarrow',
    '=>': '\\implies',
    '<=>': '\\iff',
    'inf': '\\infty',
    'infinity': '\\infty',
    'alpha': '\\alpha',
    'beta': '\\beta',
    'gamma': '\\gamma',
    'theta': '\\theta',
    'lambda': '\\lambda',
    'mu': '\\mu',
    'pi': '\\pi',
    'sigma': '\\sigma',
    'omega': '\\omega',
    'Delta': '\\Delta',
    'Sigma': '\\Sigma',
    'Omega': '\\Omega',
  };

  for (const [key, val] of Object.entries(keywordMap)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    res = res.replace(new RegExp(`(^|\\s)${escaped}(\\s|$)`, 'g'), `$1${val}$2`);
  }

  return res;
}

export const KatexFormulaModal: React.FC<KatexFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
}) => {
  // Mode: 'builder' (visual equation studio) or 'library' (curated formulas)
  const [activeTab, setActiveTab] = useState<'builder' | 'library'>('builder');

  // Builder State
  const [builderInput, setBuilderInput] = useState('\\int_{0}^{\\infty} e^{-x^2} \\, dx = \\frac{\\sqrt{\\pi}}{2}');
  const [paletteCategory, setPaletteCategory] = useState<'all' | 'core' | 'calculus' | 'greek' | 'symbols' | 'matrices'>('all');
  const [isCopied, setIsCopied] = useState(false);

  // Library State
  const [selectedCategory, setSelectedCategory] = useState<FormulaCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter formulas in library
  const filteredFormulas = useMemo(() => {
    return KATEX_FORMULAS.filter((f) => {
      const matchCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchSearch =
        !searchQuery.trim() ||
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.latex.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Filter palette items in builder
  const filteredPalette = useMemo(() => {
    if (paletteCategory === 'all') return PALETTE_ITEMS;
    return PALETTE_ITEMS.filter((p) => p.category === paletteCategory);
  }, [paletteCategory]);

  // Render KaTeX HTML safely
  const renderFormulaHtml = useCallback((latex: string, displayMode = true) => {
    try {
      return {
        html: katex.renderToString(latex.trim() || 'f(x)', {
          displayMode,
          throwOnError: false,
        }),
        error: null,
      };
    } catch (err: any) {
      return {
        html: '',
        error: err?.message || 'Invalid LaTeX syntax',
      };
    }
  }, []);

  // Builder: Insert palette snippet into current input
  const handleInsertPaletteItem = (latexSnippet: string) => {
    setBuilderInput((prev) => {
      if (!prev.trim()) return latexSnippet;
      return `${prev} ${latexSnippet}`;
    });
  };

  // Builder: Auto shorthand conversion
  const handleApplyShorthand = () => {
    setBuilderInput((prev) => convertShorthandToLatex(prev));
  };

  // Builder: Copy or Insert
  const handleCopyBuilderLatex = (asInline = false) => {
    const formatted = asInline ? `$${builderInput.trim()}$` : `$$\n${builderInput.trim()}\n$$`;
    navigator.clipboard.writeText(formatted);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertBuilder = (asInline = false) => {
    const formatted = asInline ? `$${builderInput.trim()}$` : `$$\n${builderInput.trim()}\n$$\n`;
    if (onInsertFormula) {
      onInsertFormula(formatted);
      onClose();
    } else {
      handleCopyBuilderLatex(asInline);
    }
  };

  // Library: Copy & Insert
  const handleCopyLatex = useCallback((formula: KatexFormula) => {
    const formatted = `$$\n${formula.latex}\n$$`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(formula.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleInsertLibrary = useCallback(
    (formula: KatexFormula) => {
      const formatted = `$$\n${formula.latex}\n$$\n`;
      if (onInsertFormula) {
        onInsertFormula(formatted);
        onClose();
      } else {
        handleCopyLatex(formula);
      }
    },
    [onInsertFormula, onClose, handleCopyLatex]
  );

  if (!isOpen) return null;

  const previewResult = renderFormulaHtml(builderInput);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#141415] border border-neutral-200/80 dark:border-neutral-800/80 rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-neutral-950/25 flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Sigma className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                  Unified Math Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  KaTeX &amp; Easy Math
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Visual equation palette, natural shorthand converter &amp; curated formula blueprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Primary Tab Switcher */}
            <div className="flex items-center bg-neutral-200/70 dark:bg-neutral-800/70 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('builder')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'builder'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Visual Builder</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('library')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'library'
                    ? 'bg-white dark:bg-neutral-900 text-neutral-950 dark:text-white shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                <span>Formula Blueprints</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB 1: VISUAL BUILDER & SHORTHAND CONVERTER */}
        {activeTab === 'builder' && (
          <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-5">
            {/* Live Rendered Canvas */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Live Equation Preview
                </span>
                <span className="text-[10px] font-mono text-neutral-400">
                  Real-time KaTeX
                </span>
              </div>
              <div className="p-6 rounded-2xl bg-neutral-50/70 dark:bg-neutral-950/60 border border-neutral-200/80 dark:border-neutral-800/80 text-neutral-950 dark:text-white text-center flex items-center justify-center min-h-[90px] overflow-x-auto shadow-inner">
                {previewResult.error ? (
                  <span className="text-xs text-rose-500 font-mono">
                    {previewResult.error}
                  </span>
                ) : (
                  <div
                    className="text-lg sm:text-xl py-1"
                    dangerouslySetInnerHTML={{ __html: previewResult.html }}
                  />
                )}
              </div>
            </div>

            {/* Input & Shorthand Conversion Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  LaTeX / Natural Shorthand Input
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyShorthand}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    title="Convert expressions like a/b or sqrt(x) into \frac and \sqrt"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Expand Shorthand (e.g. a/b &rarr; \frac)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderInput('')}
                    className="text-[11px] text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
              <textarea
                rows={2}
                value={builderInput}
                onChange={(e) => setBuilderInput(e.target.value)}
                placeholder="Type LaTeX or shorthand (e.g. \frac{a}{b}, sqrt(x), \alpha, \int...)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>

            {/* Clickable Visual Symbol & Operator Palette */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Quick Symbol &amp; Operator Palette
                </span>
                {/* Palette category filter */}
                <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-medium">
                  {(['all', 'core', 'calculus', 'greek', 'symbols', 'matrices'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPaletteCategory(cat)}
                      className={`px-2 py-0.5 rounded-lg capitalize cursor-pointer transition-colors ${
                        paletteCategory === cat
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold'
                          : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1.5 p-3 rounded-2xl bg-neutral-50/50 dark:bg-neutral-950/40 border border-neutral-200/60 dark:border-neutral-800/60 max-h-48 overflow-y-auto">
                {filteredPalette.map((item, idx) => (
                  <button
                    key={`${item.latex}-${idx}`}
                    type="button"
                    onClick={() => handleInsertPaletteItem(item.latex)}
                    className="p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 hover:border-indigo-500/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-xs font-mono flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-2xs group"
                    title={`Insert ${item.latex}`}
                  >
                    <span className="font-semibold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyBuilderLatex(false)}
                  className="px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied LaTeX!' : 'Copy LaTeX'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertBuilder(true)}
                  className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-medium cursor-pointer transition-colors"
                  title="Insert as inline $math$"
                >
                  <span>Insert Inline ($)</span>
                </button>
              </div>

              {onInsertFormula && (
                <button
                  type="button"
                  onClick={() => handleInsertBuilder(false)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert into Document ($$)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: FORMULA BLUEPRINTS LIBRARY */}
        {activeTab === 'library' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Filter Bar: Search & Category Pills */}
            <div className="px-6 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search formulas, symbols..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Category Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Formula Cards Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFormulas.map((formula) => {
                const isFormulaCopied = copiedId === formula.id;
                const rendered = renderFormulaHtml(formula.latex);
                return (
                  <div
                    key={formula.id}
                    className="group p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-950/40 hover:bg-white dark:hover:bg-neutral-900 transition-all hover:shadow-md hover:border-indigo-500/40 flex flex-col justify-between gap-3"
                  >
                    {/* Card Top Title & Badge */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h3 className="text-xs font-bold text-neutral-950 dark:text-white">
                          {formula.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 shrink-0">
                          {formula.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-tight">
                        {formula.description}
                      </p>
                    </div>

                    {/* Rendered Math Canvas */}
                    <div
                      className="py-3 px-4 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-800/60 overflow-x-auto text-neutral-900 dark:text-white text-center flex items-center justify-center min-h-[60px]"
                      dangerouslySetInnerHTML={{ __html: rendered.html }}
                    />

                    {/* Raw Code Snippet */}
                    <div className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100/70 dark:bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-200/40 dark:border-neutral-800/40 truncate select-all">
                      {formula.latex}
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-neutral-200/50 dark:border-neutral-800/50">
                      <button
                        onClick={() => handleCopyLatex(formula)}
                        className="flex-1 py-1.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {isFormulaCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-neutral-500" />
                            <span>Copy LaTeX</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setBuilderInput(formula.latex);
                          setActiveTab('builder');
                        }}
                        className="py-1.5 px-3 rounded-xl border border-indigo-200 dark:border-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold flex items-center gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
                        title="Load into visual builder"
                      >
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {onInsertFormula && (
                        <button
                          onClick={() => handleInsertLibrary(formula)}
                          className="py-1.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-all hover:shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Insert</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredFormulas.length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-neutral-400">
                  <BookOpen className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs font-medium">No formulas found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer Tip */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between text-[11px] text-neutral-500 shrink-0 font-mono">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Tip: Type <kbd className="bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">/math</kbd> inside the editor to open this studio instantly</span>
          </div>
          <span>{activeTab === 'builder' ? 'Visual Builder Active' : `${filteredFormulas.length} formulas`}</span>
        </div>
      </div>
    </div>
  );
};
