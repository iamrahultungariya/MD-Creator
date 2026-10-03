import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ArrowRight, 
  Search, 
  FileText, 
  Code2, 
  Compass, 
  Check, 
  Zap, 
  Loader2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MARKDOWN_TEMPLATES, MarkdownTemplate } from '../../data/templates';
import { useCreateDocument } from '../../hooks/useDocuments';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: MarkdownTemplate, action: 'insert' | 'replace') => void;
  currentDocTitle?: string;
  hasExistingContent?: boolean;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  hasExistingContent = false,
}) => {
  const navigate = useNavigate();
  const createDocumentMutation = useCreateDocument();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Engineering' | 'Product'>('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MARKDOWN_TEMPLATES[0].id);
  const [activeTemplateForAction, setActiveTemplateForAction] = useState<MarkdownTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const isEditorMode = Boolean(onSelectTemplate);

  const filteredTemplates = useMemo(() => {
    return MARKDOWN_TEMPLATES.filter((tpl) => {
      const matchesCategory = selectedCategory === 'All' || tpl.category === selectedCategory;
      const matchesSearch = 
        tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const activeTemplate = useMemo(() => {
    return filteredTemplates.find((t) => t.id === selectedTemplateId) || filteredTemplates[0] || MARKDOWN_TEMPLATES[0];
  }, [filteredTemplates, selectedTemplateId]);

  if (!isOpen) return null;

  const handleApplyTemplate = async (template: MarkdownTemplate) => {
    if (isEditorMode) {
      if (hasExistingContent) {
        setActiveTemplateForAction(template);
      } else {
        onSelectTemplate?.(template, 'replace');
        onClose();
      }
      return;
    }

    try {
      setIsCreating(true);
      const cleanTitle = template.title.replace(/\.md$/i, '');
      const docId = await createDocumentMutation.mutateAsync({
        title: cleanTitle,
        content: template.content,
      });
      onClose();
      navigate(`/editor/${docId}`);
    } catch (err) {
      console.error('Failed to create document from blueprint:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmAction = (action: 'insert' | 'replace') => {
    if (!activeTemplateForAction) return;
    onSelectTemplate?.(activeTemplateForAction, action);
    setActiveTemplateForAction(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm select-none">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-4xl bg-white dark:bg-[#121216] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40">
          <div>
            <h3 className="font-semibold text-base text-neutral-950 dark:text-white tracking-tight flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Document Templates &amp; Blueprints</span>
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Choose a starter structure or kickstart technical specs with verified formatting.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-neutral-200/60 dark:border-neutral-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Engineering', 'Product'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: 2-Column Notion Layout */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden min-h-0">
          {/* Left Column: Template Cards List */}
          <div className="md:col-span-5 p-4 space-y-2 overflow-y-auto border-r border-neutral-200/60 dark:border-neutral-800/80">
            {filteredTemplates.map((template) => {
              const isSelected = activeTemplate?.id === template.id;
              const isEngineering = template.category === 'Engineering';

              return (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 shadow-xs'
                      : 'border-neutral-200/80 dark:border-neutral-800/80 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        isEngineering 
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' 
                          : 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                      }`}>
                        {isEngineering ? <Code2 className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-semibold text-xs text-neutral-900 dark:text-white tracking-tight line-clamp-1">
                        {template.title.replace(/\.md$/i, '')}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 shrink-0">
                      {template.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {template.desc}
                  </p>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="py-12 text-center text-xs text-neutral-400">
                No templates found matching &ldquo;{searchQuery}&rdquo;.
              </div>
            )}
          </div>

          {/* Right Column: Template Preview & Action */}
          <div className="md:col-span-7 flex flex-col p-5 overflow-hidden bg-neutral-50/40 dark:bg-[#0c0c0f]">
            {activeTemplate ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 dark:border-neutral-800/80">
                  <div>
                    <h4 className="font-bold text-sm text-neutral-950 dark:text-white">
                      {activeTemplate.title}
                    </h4>
                    <p className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      Category: {activeTemplate.category} • Pre-formatted Markdown
                    </p>
                  </div>
                  <button
                    onClick={() => handleApplyTemplate(activeTemplate)}
                    disabled={isCreating}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isCreating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>{isEditorMode ? 'Use in Editor' : 'Use Blueprint'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto mt-3 p-3.5 rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 font-mono text-[11px] text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap select-text">
                  {activeTemplate.content.slice(0, 1800)}
                  {activeTemplate.content.length > 1800 && '\n\n... [Full blueprint includes complete structure & diagrams]'}
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Existing Content Conflict Confirmation */}
        <AnimatePresence>
          {activeTemplateForAction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            >
              <div className="w-full max-w-sm bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 space-y-4 text-left">
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
                  Your document already contains content. Choose how you would like to apply this template:
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
