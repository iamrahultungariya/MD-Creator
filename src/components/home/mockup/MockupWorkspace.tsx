import React, { useRef } from 'react';
import { 
  Columns, 
  FileCode, 
  PenTool, 
  Eye, 
  FolderOpen,
  FileText,
  ChevronRight
} from 'lucide-react';
import { SAMPLE_DOCS, SampleDoc, SparkParticle, ViewMode, SideTab } from './mockupData';

const MarkdownPreview = React.lazy(() =>
  import('../../editor/MarkdownPreview').then((m) => ({ default: m.MarkdownPreview }))
);

interface MockupWorkspaceProps {
  mockupTheme: 'dark' | 'light';
  setMockupTheme: React.Dispatch<React.SetStateAction<'dark' | 'light'>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  activeSideTab: SideTab;
  setActiveSideTab: React.Dispatch<React.SetStateAction<SideTab>>;
  activeDocId: string;
  currentDoc: SampleDoc;
  content: string;
  setContent: (val: string) => void;
  stats: { lines: number; words: number; chars: number };
  sparks: SparkParticle[];
  isAutoTyping: boolean;
  emitSparks: () => void;
  handleSelectDoc: (id: string) => void;
  handleToggleTask: (idx: number, currentChecked: boolean) => void;
  handleInsertSnippet: (snippet: string) => void;
  startAutoType: () => void;
  stopAutoType: () => void;
  onOpenInFullApp: () => void;
}

export const MockupWorkspace: React.FC<MockupWorkspaceProps> = ({
  mockupTheme,
  setMockupTheme: _setMockupTheme,
  viewMode,
  setViewMode,
  activeSideTab,
  setActiveSideTab,
  activeDocId,
  currentDoc,
  content,
  setContent,
  stats,
  sparks,
  isAutoTyping,
  emitSparks,
  handleSelectDoc,
  handleToggleTask,
  handleInsertSnippet: _handleInsertSnippet,
  startAutoType: _startAutoType,
  stopAutoType,
  onOpenInFullApp,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <>
      {/* High-Resolution Screen Window */}
      <div className={`rounded-xl overflow-hidden ${mockupTheme === 'dark' ? 'bg-[#121216] text-neutral-200' : 'bg-white text-neutral-800'} border border-neutral-800/80 flex flex-col h-[400px] sm:h-[450px] text-xs transition-colors duration-200 relative`}>
        {/* macOS Chrome / Top App Bar */}
        <div className={`px-3.5 py-2 border-b ${mockupTheme === 'dark' ? 'bg-[#1a1a22] border-neutral-800' : 'bg-neutral-100 border-neutral-200'} flex items-center justify-between z-20 shrink-0`}>
          {/* Left: Traffic Lights & Document Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
            {/* Traffic Lights */}
            <div className="flex items-center gap-1.5 shrink-0 pr-1">
              <button 
                onClick={() => setContent(currentDoc.content)}
                title="Reset to default"
                className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] hover:brightness-110 cursor-pointer transition-transform hover:scale-110"
              />
              <button 
                onClick={() => setViewMode(prev => prev === 'split' ? 'preview' : 'split')}
                title="Toggle Split / Preview"
                className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] hover:brightness-110 cursor-pointer transition-transform hover:scale-110"
              />
              <button 
                onClick={onOpenInFullApp}
                title="Open in Full App"
                className="w-2.5 h-2.5 rounded-full bg-[#27c93f] hover:brightness-110 cursor-pointer transition-transform hover:scale-110"
              />
            </div>

            {/* Single Active Document Tab */}
            <div className="flex items-center gap-1">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                  mockupTheme === 'dark'
                    ? 'bg-[#242430] text-white shadow-xs'
                    : 'bg-white text-neutral-900 shadow-xs'
                }`}
              >
                <FileCode className="w-3 h-3 text-sky-400" />
                <span>QuickStart.md</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>
            </div>
          </div>

          {/* Right: View Mode Segmented Pill Only */}
          <div className="flex items-center gap-2 shrink-0">
            <div className={`hidden sm:flex items-center p-0.5 rounded-lg border ${mockupTheme === 'dark' ? 'bg-neutral-900/90 border-neutral-800' : 'bg-neutral-200/80 border-neutral-300'}`}>
              <button
                onClick={() => setViewMode('split')}
                title="Side-by-Side Split"
                className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === 'split' 
                    ? mockupTheme === 'dark' ? 'bg-neutral-800 text-white shadow-2xs' : 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Columns className="w-2.5 h-2.5" />
                <span>Split</span>
              </button>
              <button
                onClick={() => setViewMode('code')}
                title="Editor Only"
                className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === 'code' 
                    ? mockupTheme === 'dark' ? 'bg-neutral-800 text-white shadow-2xs' : 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <PenTool className="w-2.5 h-2.5" />
                <span>Writing</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                title="Live Preview Only"
                className={`px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors flex items-center gap-1 ${
                  viewMode === 'preview' 
                    ? mockupTheme === 'dark' ? 'bg-neutral-800 text-white shadow-2xs' : 'bg-white text-neutral-900 shadow-2xs'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Eye className="w-2.5 h-2.5" />
                <span>Preview</span>
              </button>
            </div>
          </div>
        </div>

        {/* Screen Content Engine (Supports 4 Modes: Write, Organize, Create, Export) */}
        <div className="flex-1 relative overflow-hidden flex">
          {/* MODE: ORGANIZE */}
          {activeSideTab === 'organize' && (
            <div className={`absolute inset-0 z-30 ${mockupTheme === 'dark' ? 'bg-[#121216]/98 text-neutral-200' : 'bg-white/98 text-neutral-800'} backdrop-blur-md p-4 sm:p-5 flex flex-col justify-between animate-in fade-in duration-150`}>
              <div className="overflow-y-auto space-y-4">
                <div className={`flex items-center justify-between pb-3 border-b ${mockupTheme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'}`}>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-brand-500" />
                    <span className="font-semibold text-xs tracking-tight">Workspace</span>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${mockupTheme === 'dark' ? 'bg-neutral-800/80 text-neutral-400' : 'bg-neutral-100 text-neutral-600'}`}>
                    Local IndexedDB
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-[10.5px] uppercase font-mono tracking-wider text-neutral-400 font-medium px-1 mb-1.5">
                      <ChevronRight className="w-3 h-3 text-neutral-500" />
                      <span>Workspace Files</span>
                    </div>
                    <div className="space-y-1 pl-2">
                      {SAMPLE_DOCS.map(doc => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            handleSelectDoc(doc.id);
                            setActiveSideTab('write');
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            activeDocId === doc.id
                              ? mockupTheme === 'dark'
                                ? 'bg-neutral-800/80 text-white font-medium border border-neutral-700/60'
                                : 'bg-neutral-100 text-neutral-900 font-medium border border-neutral-200'
                              : mockupTheme === 'dark'
                                ? 'hover:bg-neutral-800/40 text-neutral-300'
                                : 'hover:bg-neutral-50 text-neutral-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-3.5 h-3.5 text-brand-500" />
                            <span>{doc.title}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                            <span>{doc.status}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                        </button>
                      ))}
                      <div className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between opacity-50 ${mockupTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-600'}`}>
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-3.5 h-3.5 text-neutral-400" />
                          <span>security_audit.md</span>
                        </div>
                        <span className="text-[10px] font-mono">Offline</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`pt-3 border-t ${mockupTheme === 'dark' ? 'border-neutral-800' : 'border-neutral-200'} flex items-center justify-between text-[11px] text-neutral-400`}>
                <span>Private local vault • 0 network footprint</span>
                <button
                  onClick={() => setActiveSideTab('write')}
                  className="text-brand-500 hover:text-brand-400 font-semibold cursor-pointer"
                >
                  Return to Writing →
                </button>
              </div>
            </div>
          )}

          {/* MODE: EXPORT */}
          {activeSideTab === 'export' && (
            <div className={`absolute inset-0 z-30 ${mockupTheme === 'dark' ? 'bg-neutral-950/90' : 'bg-neutral-900/60'} backdrop-blur-md p-4 overflow-y-auto flex flex-col items-center justify-between animate-in fade-in duration-150`}>
              <div className={`w-full max-w-md ${mockupTheme === 'dark' ? 'bg-[#18181f] text-neutral-100 border-neutral-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)]' : 'bg-white text-neutral-900 border-neutral-200 shadow-xl'} rounded-xl p-6 flex flex-col justify-between min-h-[310px] text-left border font-sans`}>
                <div>
                  <div className={`border-b ${mockupTheme === 'dark' ? 'border-neutral-800 text-neutral-400' : 'border-neutral-200 text-neutral-500'} pb-2 mb-4 flex items-center justify-between text-[9px] uppercase tracking-wider font-mono`}>
                    <span>MD WRITER • SPECIFICATION</span>
                    <span className="text-brand-500 font-bold">VERSION 0.9.1 BETA</span>
                  </div>

                  <h2 className={`text-lg font-bold tracking-tight mb-1 ${mockupTheme === 'dark' ? 'text-white' : 'text-neutral-950'}`}>
                    High-Performance Markdown Platform
                  </h2>
                  <p className={`text-[10px] mb-3 ${mockupTheme === 'dark' ? 'text-neutral-400' : 'text-neutral-500'}`}>
                    Prepared by: Core Engineering • Status: Verified • Date: September 2026
                  </p>

                  <div className={`space-y-2 text-[11px] leading-relaxed border-l-2 border-brand-500 pl-3 py-1 rounded-r ${
                    mockupTheme === 'dark' ? 'bg-neutral-800/40 text-neutral-300' : 'bg-brand-50/50 text-neutral-700'
                  }`}>
                    <p className={`font-semibold text-xs ${mockupTheme === 'dark' ? 'text-white' : 'text-neutral-900'}`}>
                      Publication-Grade Vector Typography
                    </p>
                    <p className="text-[10.5px]">
                      MD Writer decouples typing latency from cloud network roundtrips. Documents compile with precision margins, running headers, and clean vector output.
                    </p>
                  </div>
                </div>

                <div className={`border-t ${mockupTheme === 'dark' ? 'border-neutral-800 text-neutral-500' : 'border-neutral-200 text-neutral-400'} pt-3 mt-4 flex items-center justify-between text-[9px] font-mono`}>
                  <span>CONFIDENTIAL • FOR PEER REVIEW</span>
                  <span>PAGE 1 OF 1</span>
                </div>
              </div>

              <div className="w-full max-w-md mt-3 flex items-center justify-between text-xs text-neutral-300">
                <span>Vector PDF Print Engine</span>
                <button
                  onClick={() => setActiveSideTab('write')}
                  className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  Return to Writing →
                </button>
              </div>
            </div>
          )}

          {/* DUAL PANE / SINGLE PANE MAIN VIEW */}
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-neutral-800/80 overflow-hidden">
              {/* LEFT PANE */}
              {(viewMode === 'split' || viewMode === 'code') && (
                <div className={`relative flex flex-col h-full overflow-hidden ${mockupTheme === 'dark' ? 'bg-[#15151b]' : 'bg-neutral-50'} ${viewMode === 'code' ? 'col-span-1 lg:col-span-2' : ''}`}>
                  <div className="flex-1 flex overflow-hidden relative">
                    {/* Line Numbers */}
                    <div className={`w-8 shrink-0 py-3 pr-2 text-right select-none font-mono text-[10.5px] leading-relaxed ${mockupTheme === 'dark' ? 'text-neutral-600 bg-[#131318]' : 'text-neutral-400 bg-neutral-100/70'} border-r ${mockupTheme === 'dark' ? 'border-neutral-800/60' : 'border-neutral-200/60'}`}>
                      {Array.from({ length: Math.max(stats.lines, 12) }).map((_, idx) => (
                        <div key={idx} className="h-[19px]">{idx + 1}</div>
                      ))}
                    </div>

                    {/* Textarea */}
                    <div className="flex-1 relative overflow-hidden">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => {
                          setContent(e.target.value);
                          emitSparks();
                          if (isAutoTyping) stopAutoType();
                        }}
                        placeholder="Type markdown here..."
                        className={`w-full h-full resize-none p-3 font-mono-code text-[11px] leading-[19px] bg-transparent outline-none select-text ${
                          mockupTheme === 'dark' ? 'text-neutral-200 selection:bg-brand-600/40' : 'text-neutral-800 selection:bg-brand-200'
                        }`}
                        spellCheck={false}
                      />

                      {/* Spark Particles */}
                      {sparks.map((s) => (
                        <div
                          key={s.id}
                          className="absolute pointer-events-none rounded-full animate-ping"
                          style={{
                            left: `${s.x}%`,
                            top: `${s.y}%`,
                            width: s.size,
                            height: s.size,
                            backgroundColor: s.color,
                            boxShadow: `0 0 8px ${s.color}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT PANE: Markdown Preview */}
              {(viewMode === 'split' || viewMode === 'preview') && (
                <div className={`h-full overflow-y-auto p-4 select-text ${mockupTheme === 'dark' ? 'bg-[#16161f] text-neutral-100' : 'bg-white text-neutral-900'} ${viewMode === 'preview' ? 'col-span-1 lg:col-span-2' : ''}`}>
                  <div className={`max-w-none prose prose-sm ${mockupTheme === 'dark' ? 'prose-invert text-neutral-200' : 'text-neutral-900'} prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-600`}>
                    <React.Suspense fallback={
                      <div className="space-y-3 py-2 animate-pulse">
                        <div className="h-5 bg-neutral-200/40 dark:bg-neutral-800/60 rounded w-3/4" />
                        <div className="h-3.5 bg-neutral-200/30 dark:bg-neutral-800/40 rounded w-full" />
                        <div className="h-3.5 bg-neutral-200/30 dark:bg-neutral-800/40 rounded w-5/6" />
                        <div className="h-12 bg-neutral-200/20 dark:bg-neutral-800/30 rounded-xl mt-4" />
                      </div>
                    }>
                      <MarkdownPreview 
                        content={content} 
                        onToggleTask={handleToggleTask} 
                      />
                    </React.Suspense>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Tabs on Right Edge */}
      <div className="absolute left-full top-12 -ml-1 flex flex-col gap-1.5 z-20">
        {[
          { id: 'write', label: 'Write' },
          { id: 'organize', label: 'Organize' },
          { id: 'export', label: 'Export' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSideTab(tab.id as SideTab)}
            title={`Switch to ${tab.label} mode`}
            className={`px-3 py-1.5 rounded-r-md text-[10.5px] sm:text-[11.5px] font-semibold tracking-wide shadow-xs transition-all cursor-pointer whitespace-nowrap border-y border-r border-l-0 ${
              activeSideTab === tab.id
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 translate-x-1 shadow-sm'
                : 'bg-white/95 dark:bg-neutral-800/95 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:translate-x-0.5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </>
  );
};
