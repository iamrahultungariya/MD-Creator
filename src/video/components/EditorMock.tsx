import React from 'react';

interface EditorMockProps {
  typedCode?: string;
  showPreview?: boolean;
  activeLine?: number;
  highlightSyntax?: boolean;
}

export const EditorMock: React.FC<EditorMockProps> = ({
  typedCode = '# Q3 Architecture Plan\n\nOptimized for **zero latency** and offline persistence.\n\n$$\\mathcal{L}_{total} = \\lambda_1 \\mathcal{L}_{recon} + \\lambda_2 \\mathcal{L}_{kl}$$\n\n- [x] IndexedDB Dexie Cache (0ms)\n- [x] Gemini 2.5 Flash Lite Streaming\n- [ ] Export to PDF & DOCX',
  showPreview = true,
  activeLine = 5,
}) => {
  const lines = typedCode.split('\n');

  return (
    <div className="flex h-full w-full bg-neutral-950/90 text-neutral-100 font-sans select-none overflow-hidden">
      {/* Left Pane: CodeMirror Markdown Editor */}
      <div className={`${showPreview ? 'w-1/2' : 'w-full'} flex flex-col border-r border-neutral-800/80 bg-neutral-950/80 font-mono text-sm`}>
        {/* Editor Sub-Header */}
        <div className="flex h-9 items-center justify-between border-b border-neutral-800/70 bg-neutral-900/50 px-4 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-200">MARKDOWN</span>
            <span className="text-neutral-600">•</span>
            <span className="text-[11px] text-neutral-400">UTF-8</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-500">Ln {lines.length}, Col 1</span>
            <span className="rounded bg-brand-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-brand-400 border border-brand-500/20">
              VIM: NORMAL
            </span>
          </div>
        </div>

        {/* Code Lines Container */}
        <div className="flex-1 overflow-hidden p-4 space-y-1">
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isCurrent = lineNum === activeLine;

            // Syntax highlighting tokens
            let renderedLine = <span className="text-neutral-300">{line}</span>;
            if (line.startsWith('#')) {
              renderedLine = <span className="font-bold text-brand-400">{line}</span>;
            } else if (line.startsWith('$$') || line.includes('\\lambda') || line.includes('\\mathcal')) {
              renderedLine = <span className="text-emerald-400 font-semibold">{line}</span>;
            } else if (line.startsWith('- [')) {
              renderedLine = (
                <span>
                  <span className="text-sky-400 font-bold">{line.slice(0, 5)}</span>
                  <span className="text-neutral-300">{line.slice(5)}</span>
                </span>
              );
            }

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 leading-relaxed ${
                  isCurrent ? 'bg-neutral-800/40 -mx-4 px-4 rounded-sm' : ''
                }`}
              >
                <span className="w-6 text-right text-xs text-neutral-600 select-none">
                  {lineNum}
                </span>
                <div className="flex-1 whitespace-pre-wrap">{renderedLine}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Live Formatted KaTeX / Typography Preview */}
      {showPreview && (
        <div className="w-1/2 flex flex-col bg-neutral-900/30 p-6 overflow-hidden">
          <div className="flex h-7 items-center justify-between border-b border-neutral-800/40 pb-2 mb-4 text-xs font-mono text-neutral-400">
            <span className="font-medium text-neutral-300">PREVIEW</span>
            <span className="text-[11px] text-emerald-400">● 60 FPS SYNCED</span>
          </div>

          <div className="space-y-4 text-neutral-200">
            <h1 className="text-2xl font-bold tracking-tight text-white border-b border-neutral-800/80 pb-2">
              Q3 Architecture Plan
            </h1>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Optimized for <strong className="text-white font-semibold">zero latency</strong> and offline persistence with native Web Crypto storage.
            </p>

            {/* Simulated KaTeX Math Box */}
            <div className="my-3 rounded-lg border border-neutral-800 bg-neutral-950/70 p-3 text-center shadow-inner">
              <div className="font-serif italic text-base text-brand-300 tracking-wide">
                L<sub className="text-xs">total</sub> = λ₁ L<sub className="text-xs">recon</sub> + λ₂ L<sub className="text-xs">kl</sub>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mt-1">
                KaTeX Real-Time Typeset
              </span>
            </div>

            {/* Checklist items */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  ✓
                </span>
                <span>IndexedDB Dexie Cache (0ms local reads)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-500/20 text-emerald-400 font-bold">
                  ✓
                </span>
                <span>Gemini 2.5 Flash Lite Streaming</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <span className="flex h-4 w-4 items-center justify-center rounded border border-neutral-700 bg-neutral-800/40" />
                <span>Export to PDF & DOCX</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
