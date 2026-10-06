import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Tag, 
  Plus, 
  BookOpen, 
  Calendar, 
  Cpu, 
  Layers 
} from 'lucide-react';
import { saveDocument } from '../../db';
import { MARKDOWN_TEMPLATES } from '../../data/templates';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderTag?: string;
}

interface TemplateOption {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  content: string;
}

const STARTER_TEMPLATES: TemplateOption[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    desc: 'Clean, distraction-free markdown canvas',
    icon: FileText,
    content: '# Untitled Note\n\nStart typing with Markdown...',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    desc: 'Agenda, attendees, key decisions & action items',
    icon: Calendar,
    content: `# Meeting Notes: [Topic]
**Date**: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  
**Attendees**: @alex, @jordan, @taylor  

---

## 🎯 Objectives
- Review roadmap priorities for the upcoming cycle
- Identify technical blockers and owner assignments

## 📝 Discussion Summary
- Discussed offline synchronization trade-offs with IndexedDB.
- Decided to adopt CRDT resolution strategy.

## ✅ Action Items
- [ ] @alex to draft architecture proposal by Friday
- [ ] @jordan to benchmark client bundle size
- [ ] @taylor to update API specification
`,
  },
  {
    id: 'rfc',
    name: 'Engineering RFC',
    desc: 'System architecture, API design & technical specifications',
    icon: Cpu,
    content: MARKDOWN_TEMPLATES.find((t) => t.id === 'engineering-rfc')?.content || '# Engineering RFC\n',
  },
  {
    id: 'prd',
    name: 'Product Spec (PRD)',
    desc: 'User stories, acceptance criteria & metrics',
    icon: Layers,
    content: MARKDOWN_TEMPLATES.find((t) => t.id === 'product-prd')?.content || '# Product Requirements\n',
  },
  {
    id: 'weekly',
    name: 'Weekly Review',
    desc: 'Wins, priorities, reflections & habits tracker',
    icon: BookOpen,
    content: `# Weekly Review & Planning
**Week of**: ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}  

---

### 🌟 Key Wins & Highlights
- Completed 0.9.3 release cycle with 0 latency regressions
- Migrated design tokens to subtle squarish standard

### 🎯 Top 3 Priorities for Next Week
1. Polish social card exporter & vector thumbnails
2. Finalize team workspace sharing protocol
3. Expand KaTeX snippet library

### 💡 Learnings & Reflections
- Deep focus blocks in the morning yield 2x velocity.
`,
  },
];

const PRESET_TAGS = ['Personal', 'Engineering', 'Product', 'Ideas', 'Drafts', 'Journal'];

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  defaultFolderTag,
}) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize defaults on open & prefetch editor chunk
  useEffect(() => {
    if (isOpen) {
      // Eagerly prefetch EditorPage so opening the new document is instantaneous
      import('../../pages/EditorPage').catch(() => {});
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      setTitle(`Note ${dateStr}`);
      setSelectedTemplateId('blank');
      setSelectedTags(defaultFolderTag ? [defaultFolderTag] : ['Drafts']);
      setCustomTagInput('');
      setTimeout(() => inputRef.current?.select(), 50);
    }
  }, [isOpen, defaultFolderTag]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const trimmed = customTagInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
      setCustomTagInput('');
    }
  };

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      let finalTitle = title.trim() || 'Untitled Note';
      if (!finalTitle.toLowerCase().endsWith('.md')) {
        finalTitle = `${finalTitle}.md`;
      }

      const chosenTemplate =
        STARTER_TEMPLATES.find((t) => t.id === selectedTemplateId) || STARTER_TEMPLATES[0];

      const newId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? `doc_${crypto.randomUUID()}`
        : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await saveDocument(
        newId,
        finalTitle,
        chosenTemplate.content,
        selectedTags.length > 0 ? selectedTags : ['Drafts']
      );

      onClose();
      navigate(`/editor/${newId}`);
    } catch (err) {
      console.error('Failed to create new document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantBlank = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? `doc_${crypto.randomUUID()}`
        : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await saveDocument(
        newId,
        `Untitled Note ${dateStr}.md`,
        '# Untitled Note\n\n',
        ['Drafts']
      );
      onClose();
      navigate(`/editor/${newId}`);
    } catch (err) {
      console.error('Failed to create instant blank document:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs select-none animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#8257F5]/10 text-[#8257F5] dark:text-[#a07cf8] flex items-center justify-center border border-[#8257F5]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                Create New Document
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Choose a title, starter template, and organizational tags
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleCreate} className="p-5 space-y-4.5 overflow-y-auto max-h-[min(65vh,480px)] text-xs">
          {/* Document Title Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
              Document Name
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Weekly Sprint Planning.md"
                required
                className="w-full pl-3.5 pr-14 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/60 text-xs text-neutral-900 dark:text-white font-medium placeholder-neutral-400 focus:outline-none focus:border-[#8257F5] focus:ring-2 focus:ring-[#8257F5]/20 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-neutral-400">
                .md
              </span>
            </div>
          </div>

          {/* Starter Blueprint Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300">
                Starter Blueprint
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {STARTER_TEMPLATES.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STARTER_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex items-start gap-2.5 relative ${
                      isSelected
                        ? 'border-[#8257F5] bg-[#8257F5]/5 dark:bg-[#8257F5]/15 ring-1 ring-[#8257F5]'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/30 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? 'bg-[#8257F5]/10 text-[#8257F5] border-[#8257F5]/30'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate flex items-center justify-between">
                        <span>{tmpl.name}</span>
                        {isSelected && (
                          <Check className="w-3 h-3 text-[#8257F5] stroke-[3]" />
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {tmpl.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags & Folders */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-2">
              <Tag className="w-3 h-3 text-neutral-400" />
              <span>Workspace Tags</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#8257F5] bg-[#8257F5]/10 text-[#8257F5] dark:text-[#a07cf8] font-bold shadow-2xs'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              {/* Custom Tag Input */}
              <div className="inline-flex items-center gap-1 pl-2">
                <input
                  type="text"
                  placeholder="+ Add tag..."
                  value={customTagInput}
                  onChange={(e) => setCustomTagInput(e.target.value)}
                  onKeyDown={handleAddCustomTag}
                  className="w-24 px-2 py-0.5 rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 bg-transparent text-[11px] placeholder:text-neutral-400 focus:outline-none focus:border-[#8257F5]"
                />
                {customTagInput.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="p-1 rounded bg-[#8257F5] text-white hover:bg-[#7245e6] cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-950/40 shrink-0">
          <button
            type="button"
            onClick={handleInstantBlank}
            disabled={isSubmitting}
            className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-medium disabled:opacity-50"
          >
            <span>Instant Blank Note</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#8257F5] hover:bg-[#7245e6] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create & Open'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
