import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Layers,
  ChevronDown
} from 'lucide-react';
import { saveDocument } from '../../db';
import { useAllDocumentTags } from '../../hooks/useDocuments';
import { MARKDOWN_TEMPLATES } from '../../data/templates';

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFolderTag?: string;
}

interface StarterBlueprint {
  id: string;
  name: string;
  desc: string;
  badge: string;
  icon: React.ElementType;
}

const STARTER_BLUEPRINTS: StarterBlueprint[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    desc: 'Clean, distraction-free markdown canvas',
    badge: 'Default',
    icon: FileText,
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    desc: 'Agenda, attendees, key decisions & action items',
    badge: 'Collab',
    icon: Calendar,
  },
  {
    id: 'rfc',
    name: 'Engineering RFC',
    desc: 'Technical proposal, architecture & API contracts',
    badge: 'Tech',
    icon: Cpu,
  },
  {
    id: 'prd',
    name: 'Product Spec (PRD)',
    desc: 'User stories, acceptance criteria & rollout plan',
    badge: 'Product',
    icon: Layers,
  },
  {
    id: 'weekly',
    name: 'Weekly Review',
    desc: 'Wins, priorities, reflections & habit tracker',
    badge: 'Planning',
    icon: BookOpen,
  },
];

const PRESET_TAGS = ['Personal', 'Engineering', 'Product', 'Ideas', 'Drafts', 'Journal'];

/**
 * Lazy template content resolver: prevents allocating full markdown text strings
 * for every template until the user actually instantiates one.
 */
function resolveTemplateContent(templateId: string): string {
  switch (templateId) {
    case 'meeting':
      return `# Meeting Notes: [Topic]
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
`;
    case 'rfc':
      return MARKDOWN_TEMPLATES.find((t) => t.id === 'engineering-rfc')?.content || '# Engineering RFC\n';
    case 'prd':
      return MARKDOWN_TEMPLATES.find((t) => t.id === 'product-prd')?.content || '# Product Requirements\n';
    case 'weekly':
      return `# Weekly Review & Planning
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
`;
    case 'blank':
    default:
      return '# Untitled Note\n\nStart typing with Markdown...';
  }
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = React.memo(({
  isOpen,
  onClose,
  defaultFolderTag,
}) => {
  const navigate = useNavigate();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const customTagInputRef = useRef<HTMLInputElement>(null);

  // Fetch all existing workspace tags to suggest in the modal (only active when modal is mounted)
  const { data: dbTags = [] } = useAllDocumentTags();

  const [title, setTitle] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('blank');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTags, setCustomTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState('');
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute union of all displayable tags (presets + workspace tags + custom added tags)
  const allAvailableTags = useMemo(() => {
    const workspaceTags = dbTags.filter((t) => t && t !== 'All');
    return Array.from(new Set([...PRESET_TAGS, ...workspaceTags, ...customTags, ...selectedTags]));
  }, [dbTags, customTags, selectedTags]);

  // Initialize defaults on open & prefetch editor chunk
  useEffect(() => {
    if (isOpen) {
      import('../../pages/EditorPage').catch(() => {});
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      setTitle(`Note ${dateStr}`);
      setSelectedTemplateId('blank');
      // Set initial tags
      const initialTag = defaultFolderTag && defaultFolderTag !== 'All' ? defaultFolderTag : 'Drafts';
      setSelectedTags([initialTag]);
      setCustomTags(defaultFolderTag && !PRESET_TAGS.includes(defaultFolderTag) ? [defaultFolderTag] : []);
      setCustomTagInput('');
      setIsTagsExpanded(Boolean(defaultFolderTag && defaultFolderTag !== 'All'));
      setTimeout(() => inputRef.current?.select(), 60);
    }
  }, [isOpen, defaultFolderTag]);

  // Keyboard navigation & accessibility focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap cycling with Tab / Shift+Tab
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'input, button, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
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

  const handleAddCustomTag = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && e.key !== 'Enter' && e.key !== ',') return;
    if (e) e.preventDefault();

    const trimmed = customTagInput.trim().replace(/^#+/, '').replace(/,+$/, '');
    if (trimmed) {
      if (!selectedTags.includes(trimmed)) {
        setSelectedTags((prev) => [...prev, trimmed]);
      }
      if (!customTags.includes(trimmed)) {
        setCustomTags((prev) => [...prev, trimmed]);
      }
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

      // Auto-commit any pending custom tag typed in the input
      let finalTags = [...selectedTags];
      const pendingTag = customTagInput.trim().replace(/^#+/, '').replace(/,+$/, '');
      if (pendingTag && !finalTags.includes(pendingTag)) {
        finalTags.push(pendingTag);
      }
      if (finalTags.length === 0) {
        finalTags = ['Drafts'];
      }

      const content = resolveTemplateContent(selectedTemplateId);

      const newId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? `doc_${crypto.randomUUID()}`
        : `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      await saveDocument(
        newId,
        finalTitle,
        content,
        finalTags
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm select-none font-sans animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="w-full max-w-xl bg-white dark:bg-[#141419] rounded-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title & Close */}
        <div className="px-6 py-4.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#8257F5]/10 text-[#8257F5] dark:text-[#a07cf8] flex items-center justify-center border border-[#8257F5]/25 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 id="modal-title" className="text-sm font-bold text-neutral-950 dark:text-white tracking-tight">
                Create New Document
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Choose a title, starter blueprint, and workspace tags
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

        {/* Form Body: Step 1 (Title + Blueprint) & Step 2 (Tags) */}
        <form onSubmit={handleCreate} className="p-6 space-y-5 overflow-y-auto max-h-[min(65vh,520px)] text-xs scrollbar-thin">
          {/* Step 1A: Document Title Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5 font-sans">
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
                className="w-full pl-3.5 pr-14 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700/80 bg-neutral-50/60 dark:bg-neutral-900/60 text-xs text-neutral-900 dark:text-white font-medium placeholder-neutral-400 focus:outline-none focus:border-[#8257F5] focus:ring-2 focus:ring-[#8257F5]/20 transition-all font-sans"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold text-neutral-400">
                .md
              </span>
            </div>
          </div>

          {/* Step 1B: Starter Blueprint Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 font-sans">
                Starter Blueprint
              </label>
              <span className="text-[10px] text-neutral-400 font-mono">
                {STARTER_BLUEPRINTS.length} Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STARTER_BLUEPRINTS.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                const Icon = tmpl.icon;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(tmpl.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 relative font-sans ${
                      isSelected
                        ? 'border-[#8257F5] bg-[#8257F5]/8 dark:bg-[#8257F5]/15 ring-2 ring-[#8257F5]/30 shadow-xs'
                        : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                        isSelected
                          ? 'bg-[#8257F5] text-white border-[#8257F5]'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200/80 dark:border-neutral-700/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate flex items-center justify-between">
                        <span>{tmpl.name}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-[#8257F5] dark:text-[#a07cf8] stroke-[3]" />
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

          {/* Step 2: Progressive Disclosure for Workspace Tags */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={() => setIsTagsExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 py-1 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer font-sans"
            >
              <div className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#8257F5]" />
                <span>Workspace Tags</span>
                <span className="text-[10px] font-normal normal-case text-neutral-400">
                  ({selectedTags.length} selected)
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-normal normal-case text-neutral-500">
                <span>{isTagsExpanded ? 'Hide' : 'Add tags'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isTagsExpanded ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Collapsible Tags Section */}
            {isTagsExpanded && (
              <div className="mt-2.5 p-3 rounded-xl bg-neutral-50/60 dark:bg-neutral-900/50 border border-neutral-200/70 dark:border-neutral-800 space-y-2 animate-in fade-in duration-150">
                <div className="flex flex-wrap items-center gap-1.5">
                  {allAvailableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`group px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer border flex items-center gap-1.5 font-sans ${
                          isSelected
                            ? 'border-[#8257F5] bg-[#8257F5]/10 text-[#8257F5] dark:text-[#a07cf8] font-bold shadow-2xs'
                            : 'border-neutral-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <span>#{tag}</span>
                        {isSelected && (
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTag(tag);
                            }}
                            className="opacity-60 group-hover:opacity-100 hover:text-rose-500 transition-opacity"
                            title="Remove tag"
                          >
                            <X className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}

                  {/* Inline Custom Tag Input */}
                  <div className="inline-flex items-center gap-1 pl-1">
                    <input
                      ref={customTagInputRef}
                      type="text"
                      placeholder="+ Custom tag..."
                      value={customTagInput}
                      onChange={(e) => setCustomTagInput(e.target.value)}
                      onKeyDown={handleAddCustomTag}
                      className="w-28 px-2 py-1 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-[11px] placeholder:text-neutral-400 focus:outline-none focus:border-[#8257F5] text-neutral-900 dark:text-white font-sans"
                    />
                    {customTagInput.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAddCustomTag()}
                        className="p-1 rounded-lg bg-[#8257F5] text-white hover:bg-[#7245e6] cursor-pointer transition-colors shadow-2xs"
                        title="Add tag"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-900/40 shrink-0 font-sans">
          <button
            type="button"
            onClick={handleInstantBlank}
            disabled={isSubmitting}
            className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1 font-semibold disabled:opacity-50"
          >
            <span>Instant Blank Note</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#8257F5] hover:bg-[#7245e6] active:bg-[#6335e0] text-white font-bold text-xs transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Creating...' : 'Create Note'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

CreateDocumentModal.displayName = 'CreateDocumentModal';
