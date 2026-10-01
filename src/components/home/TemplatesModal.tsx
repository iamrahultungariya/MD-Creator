import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  Copy, 
  Check, 
  Layers, 
  FileText,
  Eye,
  Code2,
  Terminal,
  Compass,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MARKDOWN_TEMPLATES, MarkdownTemplate } from '../../data/templates';
import { useCreateDocument } from '../../hooks/useDocuments';
import { MarkdownPreview } from '../editor/MarkdownPreview';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: MarkdownTemplate, action: 'insert' | 'replace') => void;
  currentDocTitle?: string;
  hasExistingContent?: boolean;
}

interface TemplateSelectorCardProps {
  template: MarkdownTemplate;
  isSelected: boolean;
  isDimmed: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const TemplateSelectorCard: React.FC<TemplateSelectorCardProps> = ({
  template,
  isSelected,
  isDimmed,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top } = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - left);
    mouseY.set(e.clientY - top);
  };

  const isEngineering = template.category === 'Engineering';
  const accentGlow = isEngineering ? 'rgba(59, 130, 246, 0.45)' : 'rgba(168, 85, 247, 0.45)';
  const surfaceGlow = isEngineering ? 'rgba(59, 130, 246, 0.08)' : 'rgba(168, 85, 247, 0.08)';

  const borderBackground = useMotionTemplate`
    radial-gradient(
      280px circle at ${mouseX}px ${mouseY}px,
      ${accentGlow},
      transparent 80%
    )
  `;

  const surfaceBackground = useMotionTemplate`
    radial-gradient(
      320px circle at ${mouseX}px ${mouseY}px,
      ${surfaceGlow},
      transparent 75%
    )
  `;

  const wordCount = template.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl p-4 transition-all duration-200 cursor-pointer select-none text-left ${
        isDimmed ? 'opacity-55 scale-[0.99]' : 'opacity-100'
      } ${
        isSelected
          ? 'bg-neutral-50/90 dark:bg-neutral-800/80 shadow-md ring-2 ring-brand-500/80 dark:ring-brand-400/80'
          : 'bg-white/80 dark:bg-neutral-900/80 hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50 border border-neutral-200/90 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
      }`}
    >
      {/* Raycast Mouse-Following Border Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: borderBackground,
          maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1.5px',
        }}
      />

      {/* Raycast Ambient Surface Glow */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: surfaceBackground }}
      />

      <div className="relative z-10 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${
              isEngineering 
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20' 
                : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
            }`}>
              {isEngineering ? <Terminal className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
            </div>
            <span className={`text-[10px] font-bold tracking-wider uppercase font-mono px-2 py-0.5 rounded-full ${
              isEngineering
                ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/60 dark:border-brand-900/40'
                : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/40'
            }`}>
              {template.badge || template.category}
            </span>
          </div>

          {isSelected && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Selected
            </span>
          )}
        </div>

        <div>
          <h4 className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {template.title}
          </h4>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-1 leading-relaxed">
            {template.desc}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 dark:border-neutral-800/80 text-[10px] text-neutral-400 font-mono">
          <span>{wordCount} words</span>
          <span>~{readingTime} min read</span>
        </div>
      </div>
    </div>
  );
};

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectTemplate,
  hasExistingContent = false
}) => {
  const navigate = useNavigate();
  const createDocMutation = useCreateDocument();
  const [selectedTemplate, setSelectedTemplate] = useState<MarkdownTemplate>(MARKDOWN_TEMPLATES[0]);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [activeTemplateForAction, setActiveTemplateForAction] = useState<MarkdownTemplate | null>(null);
  const [viewTab, setViewTab] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isEditorMode = Boolean(onSelectTemplate);
  const currentTemplate = selectedTemplate || MARKDOWN_TEMPLATES[0];
  const wordCount = currentTemplate.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleUseTemplate = async (template: MarkdownTemplate) => {
    if (isEditorMode) {
      if (hasExistingContent) {
        setActiveTemplateForAction(template);
      } else {
        onSelectTemplate!(template, 'replace');
        onClose();
      }
    } else {
      const docId = await createDocMutation.mutateAsync({
        title: template.title,
        content: template.content
      });
      onClose();
      navigate(`/editor/${docId}`);
    }
  };

  const handleConfirmAction = (action: 'insert' | 'replace') => {
    if (activeTemplateForAction && onSelectTemplate) {
      onSelectTemplate(activeTemplateForAction, action);
      setActiveTemplateForAction(null);
      onClose();
    }
  };

  const handleCopyMarkdown = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div 
        className="relative w-full max-w-5xl bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[780px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-neutral-950 dark:text-white">
                  Markdown Blueprint Studio
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold border border-brand-200/50 dark:border-brand-900/40">
                  {MARKDOWN_TEMPLATES.length} Flagship Standards
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {isEditorMode 
                  ? 'Apply production-ready technical architecture or PRD blueprints directly into your active workspace'
                  : 'Start writing immediately with structured engineering specs, system architecture, and product documents'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Workspace: Left Selector + Right Preview */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-neutral-200/80 dark:divide-neutral-800">
          
          {/* Left Pane: Blueprint Cards & Standards Guarantee (4 cols) */}
          <div className="md:col-span-4 flex flex-col h-full bg-neutral-50/40 dark:bg-neutral-900/40 p-4 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-1">
              <span>SELECT BLUEPRINT</span>
              <span className="font-mono text-[10px]">v0.9.2 Verified</span>
            </div>

            {/* Curated Flagship Cards */}
            <div className="space-y-3">
              {MARKDOWN_TEMPLATES.map((tmpl) => (
                <TemplateSelectorCard
                  key={tmpl.id}
                  template={tmpl}
                  isSelected={currentTemplate.id === tmpl.id}
                  isDimmed={Boolean(hoveredCardId && hoveredCardId !== tmpl.id)}
                  onClick={() => setSelectedTemplate(tmpl)}
                  onMouseEnter={() => setHoveredCardId(tmpl.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                />
              ))}
            </div>

            {/* Quality & Spec Guarantee Box */}
            <div className="mt-auto pt-4 border-t border-neutral-200/60 dark:border-neutral-800/80 space-y-2.5">
              <div className="text-[11px] font-bold text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>Blueprint Guarantees</span>
              </div>
              <ul className="text-[11px] text-neutral-500 dark:text-neutral-400 space-y-1.5 font-medium">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>GFM tables, KaTeX, & Mermaid validated</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>100% offline-ready with local IndexedDB</span>
                </li>
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Reversible with auto-revision snapshot</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Pane: Live Rich Preview / Raw Source Studio (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-neutral-950 overflow-hidden">
            {/* Preview Toolbar */}
            <div className="px-6 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/30 dark:bg-neutral-900/30 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-brand-500 shrink-0" />
                <div className="truncate">
                  <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white truncate">
                    {currentTemplate.title}
                  </span>
                  <span className="text-[11px] text-neutral-400 ml-2 font-mono">
                    • ~{readingTime} min read
                  </span>
                </div>
              </div>

              {/* View Mode Switcher & Copy Button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center p-0.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80">
                  <button
                    onClick={() => setViewTab('preview')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewTab === 'preview'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => setViewTab('source')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewTab === 'source'
                        ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Code2 className="w-3 h-3" />
                    <span>Source</span>
                  </button>
                </div>

                <button
                  onClick={() => handleCopyMarkdown(currentTemplate.content)}
                  className="px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Copy raw markdown to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Document Content Scrollable Canvas */}
            <div className="flex-1 overflow-y-auto p-6 select-text">
              {viewTab === 'preview' ? (
                <div className="max-w-none prose prose-sm dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-500">
                  <MarkdownPreview content={currentTemplate.content} />
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 p-4 overflow-x-auto">
                  <pre className="font-mono text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {currentTemplate.content}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 px-6 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/60 flex items-center justify-between gap-4 shrink-0">
              <div className="text-xs text-neutral-500 dark:text-neutral-400 hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Ready to customize & publish</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUseTemplate(currentTemplate)}
                  disabled={createDocMutation.isPending}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow cursor-pointer disabled:opacity-50"
                >
                  {createDocMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Document...</span>
                    </>
                  ) : (
                    <>
                      <span>{isEditorMode ? 'Insert into Document' : 'Create Document with Blueprint'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Existing Content Overwrite / Append Choice Dialog */}
        <AnimatePresence>
          {activeTemplateForAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900 dark:text-white">
                      Apply Blueprint
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono">
                      Target: Current Document
                    </p>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Your document already contains content. Choose how you would like to apply this blueprint:
                </p>
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleConfirmAction('insert')}
                    className="w-full py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Append at Cursor Position</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                  <button
                    onClick={() => handleConfirmAction('replace')}
                    className="w-full py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-between"
                  >
                    <span>Replace All Content</span>
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setActiveTemplateForAction(null)}
                    className="w-full py-2 text-xs font-medium text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
