import React, { useState, useRef, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Maximize2, Code, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BentoHeroCardProps {
  onOpenTemplates?: () => void;
}

const DEFAULT_MARKDOWN = `# Ideas that matter
Small steps create big changes.

- Write
- Learn
- Build
- Repeat

> Progress over perfection.`;

const CODE_SNIPPET = `\`\`\`typescript
interface Note {
  title: string;
  isFocused: boolean;
}

const doc: Note = {
  title: "Deep Work Sprint",
  isFocused: true
};
\`\`\``;

export const BentoHeroCard: React.FC<BentoHeroCardProps> = ({ onOpenTemplates }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'split'>('split');
  const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
  ];

  // Dynamic metrics from user typing
  const lineCount = useMemo(() => markdown.split('\n').length, [markdown]);
  const wordCount = useMemo(() => {
    const trimmed = markdown.trim();
    return trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  }, [markdown]);

  const handleCursorUpdate = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      line: lines.length,
      col: (lines[lines.length - 1]?.length || 0) + 1,
    });
  };

  const handleToggleCodeSnippet = () => {
    startTransition(() => {
      if (markdown.includes('```typescript')) {
        setMarkdown(DEFAULT_MARKDOWN);
      } else {
        setMarkdown((prev) => `${prev}\n\n${CODE_SNIPPET}`);
      }
    });
  };

  const handleReset = () => {
    startTransition(() => {
      setMarkdown(DEFAULT_MARKDOWN);
    });
  };

  return (
    <div className="lg:col-span-8 p-4 sm:p-6 lg:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-between relative overflow-hidden transition-all group">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
        {/* Left Text & CTA Content */}
        <div className="xl:col-span-6 flex flex-col justify-between z-10">
          <div>
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/60 text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-5">
              <span>Write</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>Format</span>
              <span className="text-amber-500 font-bold">•</span>
              <span>Export</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] mb-4">
              <span className="text-neutral-950 dark:text-white block">Write Markdown.</span>
              <span className="text-neutral-400 dark:text-neutral-500 block">Without Distractions.</span>
            </h2>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-md mb-6">
              A clean, fast and powerful Markdown editor to turn your ideas into beautiful documents — notes, reports, resumes and more.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => navigate('/editor')}
                className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer group/btn"
              >
                <span>Start Writing</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onOpenTemplates}
                className="px-5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-neutral-800 dark:text-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Explore Templates
              </button>
            </div>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2 overflow-hidden">
              {avatars.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt="User avatar"
                  className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-neutral-900 object-cover"
                />
              ))}
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Loved by <span className="font-bold text-neutral-900 dark:text-white">10,000+</span> creators, students and professionals.
            </p>
          </div>
        </div>

        {/* Right Interactive macOS Window Mockup */}
        <div className="xl:col-span-6 z-10">
          <div className={`rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl overflow-hidden text-xs transition-all ${
            isExpanded ? 'ring-2 ring-neutral-400 dark:ring-neutral-600' : ''
          }`}>
            {/* Window Topbar */}
            <div className="px-3.5 py-2.5 bg-neutral-50/90 dark:bg-neutral-900/90 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between">
              {/* Traffic Light Dots */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleReset}
                  title="Reset content"
                  className="w-2.5 h-2.5 rounded-full bg-[#ef4444] hover:opacity-80 cursor-pointer"
                />
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" />
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title="Toggle frame highlight"
                  className="w-2.5 h-2.5 rounded-full bg-[#10b981] hover:opacity-80 cursor-pointer"
                />
              </div>

              {/* Interactive Mode Segmented Tabs */}
              <div className="flex items-center bg-neutral-200/60 dark:bg-neutral-800/80 p-0.5 rounded-lg text-[11px] font-medium">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'edit'
                      ? 'bg-neutral-950 text-white dark:bg-neutral-700 shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                  title="Show Editor Only"
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-neutral-950 text-white dark:bg-neutral-700 shadow-2xs font-semibold'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
                  }`}
                  title="Show Live Preview Only"
                >
                  Preview
                </button>
              </div>

              {/* Right View Controls */}
              <div className="flex items-center gap-2 text-neutral-400 dark:text-neutral-500">
                <button
                  onClick={() => setActiveTab('split')}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'split'
                      ? 'bg-neutral-950 text-white dark:bg-neutral-700 font-semibold'
                      : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300/80'
                  }`}
                  title="Split View (Side-by-Side)"
                >
                  Split
                </button>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title="Expand / Minimize editor height"
                  className="p-1 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Maximize2 className={`w-3 h-3 ${isExpanded ? 'text-emerald-500' : ''}`} />
                </button>
                <button
                  onClick={handleToggleCodeSnippet}
                  title={markdown.includes('```typescript') ? 'Remove Code Block' : 'Insert Code Block'}
                  className="p-1 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <Code className={`w-3.5 h-3.5 ${markdown.includes('```typescript') ? 'text-brand-500' : ''}`} />
                </button>
                <button
                  onClick={handleReset}
                  title="Reset to default text"
                  className="p-1 hover:text-neutral-800 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Split Window Body */}
            <div className={`p-3 sm:p-4 min-h-[220px] max-h-[300px] overflow-auto ${
              activeTab === 'split'
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-0 sm:divide-x divide-neutral-200/80 dark:divide-neutral-800/80'
                : 'block'
            }`}>
              {/* Left Pane: Interactive Live Textarea with Line Numbers */}
              {(activeTab === 'edit' || activeTab === 'split') && (
                <div className={`flex ${activeTab === 'split' ? 'sm:pr-3' : 'w-full'}`}>
                  {/* Dynamic Line Numbers */}
                  <div className="select-none text-neutral-400 dark:text-neutral-600 pr-2.5 space-y-1 text-right text-[10.5px] font-mono shrink-0">
                    {Array.from({ length: Math.max(lineCount, 6) }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Real Editable Textarea */}
                  <textarea
                    ref={textareaRef}
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    onKeyUp={handleCursorUpdate}
                    onClick={handleCursorUpdate}
                    className="w-full bg-transparent resize-none border-none outline-none font-mono-code text-[11px] text-neutral-800 dark:text-neutral-200 leading-relaxed p-0 focus:ring-0"
                    rows={Math.max(lineCount, 8)}
                    placeholder="Type markdown here..."
                    title="Interactive Editor: Type here to see live preview"
                    spellCheck={false}
                  />
                </div>
              )}

              {/* Right Pane: Rendered Live Preview */}
              {(activeTab === 'preview' || activeTab === 'split') && (
                <div className={`font-sans text-neutral-900 dark:text-neutral-100 overflow-y-auto ${
                  activeTab === 'split' ? 'pl-3' : 'w-full px-2'
                }`}>
                  <div className="prose prose-neutral dark:prose-invert prose-xs max-w-none text-[11px] leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ ...props }) => (
                          <h1 className="text-xs font-bold text-neutral-950 dark:text-white mt-0 mb-1.5 tracking-tight" {...props} />
                        ),
                        p: ({ ...props }) => (
                          <p className="text-[10.5px] text-neutral-600 dark:text-neutral-300 my-1 leading-snug" {...props} />
                        ),
                        ul: ({ ...props }) => (
                          <ul className="text-[10.5px] text-neutral-700 dark:text-neutral-300 my-1 list-disc pl-3.5 space-y-0.5" {...props} />
                        ),
                        blockquote: ({ ...props }) => (
                          <blockquote className="my-1.5 pl-2 border-l-2 border-neutral-300 dark:border-neutral-700 text-[10px] text-neutral-500 dark:text-neutral-400 italic" {...props} />
                        ),
                        pre: ({ ...props }) => (
                          <pre className="my-1.5 p-2 rounded-lg bg-neutral-100 dark:bg-neutral-900 text-[10px] font-mono text-neutral-800 dark:text-neutral-200 overflow-x-auto border border-neutral-200/80 dark:border-neutral-800" {...props} />
                        ),
                        code: ({ ...props }) => (
                          <code className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-800 dark:text-neutral-200" {...props} />
                        ),
                      }}
                    >
                      {markdown}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>

            {/* Window Footer Status Bar */}
            <div className="px-3.5 py-1.5 bg-neutral-50/80 dark:bg-neutral-900/80 border-t border-neutral-200/80 dark:border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between font-mono select-none">
              <div className="flex items-center gap-3">
                <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
                <span>Markdown</span>
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-emerald-500 font-sans font-medium">● Live Sync</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
