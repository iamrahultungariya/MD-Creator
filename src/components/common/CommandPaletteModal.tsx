import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Search,
  FileText,
  Plus,
  Sun,
  Moon,
  Printer,
  FileCode,
  FolderOpen,
  Settings,
  Database,
  Eye,
  Type,
  X,
  Sparkles,
} from 'lucide-react';
import { db, DocumentMetadata, createNewDocument } from '../../db';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { StorageDetailsModal } from './StorageDetailsModal';
import { ModalPortal } from './ModalPortal';
import { CommandPaletteTrigger, CommandPaletteOriginRect } from '../../hooks/useCommandPalette';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerType?: CommandPaletteTrigger;
  originRect?: CommandPaletteOriginRect | null;
  onOpenPdfStudio?: () => void;
}

export type ActionCategory = 'Documents' | 'Actions & Navigation';

interface PaletteAction {
  id: string;
  title: string;
  category: ActionCategory;
  description?: string;
  icon: React.ElementType;
  shortcut?: string;
  perform: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  triggerType = 'keyboard',
  originRect = null,
  onOpenPdfStudio,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = useThemeStore((s) => s.isDark);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const typewriterMode = usePreferencesStore((s) => s.typewriterMode);
  const setTypewriterMode = usePreferencesStore((s) => s.setTypewriterMode);
  const focusMode = usePreferencesStore((s) => s.focusMode);
  const setFocusMode = usePreferencesStore((s) => s.setFocusMode);
  const openPreferences = usePreferencesStore((s) => s.openPreferences);

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load recent documents from IndexedDB
  const loadDocuments = useCallback(() => {
    db.documents
      .orderBy('updatedAt')
      .reverse()
      .limit(10)
      .toArray()
      .then((docs) => {
        setDocuments(docs);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (isOpen) {
      import('../../pages/EditorPage').catch(() => {});
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  // Focus input and reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 40);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Build curated actions catalogue
  const allActions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [];

    // 1. Recent Documents from IndexedDB
    documents.forEach((doc) => {
      const formattedDate = new Date(doc.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      });

      list.push({
        id: `doc-${doc.id}`,
        title: doc.title || 'Untitled Document.md',
        category: 'Documents',
        description: `Edited ${formattedDate}`,
        icon: FileText,
        shortcut: 'Open',
        perform: () => {
          navigate(`/editor/${doc.id}`);
          onClose();
        },
      });
    });

    // 2. High-Frequency Actions & Core Navigation
    list.push({
      id: 'action-new-doc',
      title: 'Create New Document',
      category: 'Actions & Navigation',
      description: 'Start a blank Markdown document in your offline vault',
      icon: Plus,
      shortcut: 'New',
      perform: async () => {
        const title = search.trim() ? (search.endsWith('.md') ? search : `${search}.md`) : 'Untitled Document.md';
        const newId = await createNewDocument(title);
        navigate(`/editor/${newId}`);
        onClose();
      },
    });

    list.push({
      id: 'nav-documents',
      title: 'Go to Documents Vault',
      category: 'Actions & Navigation',
      description: 'Browse, manage, and filter all offline notes',
      icon: FolderOpen,
      shortcut: 'Vault',
      perform: () => {
        navigate('/documents');
        onClose();
      },
    });

    list.push({
      id: 'nav-editor',
      title: 'Open Markdown Editor',
      category: 'Actions & Navigation',
      description: 'Return to active writing editor screen',
      icon: FileCode,
      shortcut: 'Editor',
      perform: () => {
        navigate('/editor');
        onClose();
      },
    });

    list.push({
      id: 'action-toggle-theme',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Actions & Navigation',
      description: `Toggle visual theme (${isDark ? 'Dark' : 'Light'} active)`,
      icon: isDark ? Sun : Moon,
      shortcut: 'Theme',
      perform: () => {
        toggleTheme();
        onClose();
      },
    });

    list.push({
      id: 'mode-typewriter',
      title: typewriterMode ? 'Disable Typewriter Mode' : 'Enable Typewriter Mode',
      category: 'Actions & Navigation',
      description: 'Keep current writing line vertically centered',
      icon: Type,
      shortcut: typewriterMode ? 'ON' : 'OFF',
      perform: () => {
        setTypewriterMode(!typewriterMode);
        onClose();
      },
    });

    list.push({
      id: 'mode-focus',
      title: focusMode ? 'Disable Focus Mode' : 'Enable Focus Mode',
      category: 'Actions & Navigation',
      description: 'Dim surrounding paragraphs to highlight active line',
      icon: Eye,
      shortcut: focusMode ? 'ON' : 'OFF',
      perform: () => {
        setFocusMode(!focusMode);
        onClose();
      },
    });

    list.push({
      id: 'action-pdf-export',
      title: 'Export / Print PDF Studio',
      category: 'Actions & Navigation',
      description: 'Vector PDF generation with custom margins',
      icon: Printer,
      shortcut: 'Ctrl+P',
      perform: () => {
        if (onOpenPdfStudio) {
          onOpenPdfStudio();
        } else if (!location.pathname.startsWith('/editor')) {
          navigate('/editor');
        }
        onClose();
      },
    });

    list.push({
      id: 'action-preferences',
      title: 'Studio Preferences',
      category: 'Actions & Navigation',
      description: 'Font choices, tab sizes, backups & AI config',
      icon: Settings,
      shortcut: 'Ctrl+,',
      perform: () => {
        openPreferences();
        onClose();
      },
    });

    list.push({
      id: 'action-storage-details',
      title: 'Local Storage Details',
      category: 'Actions & Navigation',
      description: 'View IndexedDB usage, backup vault & empty trash',
      icon: Database,
      shortcut: 'Storage',
      perform: () => {
        setIsStorageModalOpen(true);
      },
    });

    list.push({
      id: 'action-whats-new',
      title: "Changelog & Release History",
      category: 'Actions & Navigation',
      description: 'Explore the latest features and Mimo updates',
      icon: Sparkles,
      shortcut: 'History',
      perform: () => {
        navigate('/changelog');
        onClose();
      },
    });

    return list;
  }, [
    documents,
    search,
    isDark,
    toggleTheme,
    typewriterMode,
    setTypewriterMode,
    focusMode,
    setFocusMode,
    openPreferences,
    onOpenPdfStudio,
    location.pathname,
    navigate,
    onClose,
  ]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!search.trim()) return allActions;
    const q = search.toLowerCase();
    return allActions.filter((a) => {
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchCategory = a.category.toLowerCase().includes(q);
      const matchDesc = a.description?.toLowerCase().includes(q) || false;
      const matchShortcut = a.shortcut?.toLowerCase().includes(q) || false;
      return matchTitle || matchCategory || matchDesc || matchShortcut;
    });
  }, [allActions, search]);

  // Reset selection index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Scroll active item into view
  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    const activeItem = listEl.querySelector(`[data-index="${selectedIndex}"]`);
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredActions.length ? (prev + 1) % filteredActions.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredActions.length ? (prev - 1 + filteredActions.length) % filteredActions.length : 0
        );
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[selectedIndex]) {
          filteredActions[selectedIndex].perform();
        } else if (search.trim()) {
          const title = search.endsWith('.md') ? search : `${search}.md`;
          createNewDocument(title).then((newId) => {
            navigate(`/editor/${newId}`);
            onClose();
          });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filteredActions, selectedIndex, search, navigate, onClose]
  );

  // Calculate transform origin for click trigger (Gooey morph expansion)
  const transformOriginStyle = useMemo(() => {
    if (triggerType === 'click' && originRect) {
      const x = originRect.x + originRect.width / 2;
      const y = originRect.y + originRect.height / 2;
      return `${x}px ${y}px`;
    }
    return 'top center';
  }, [triggerType, originRect]);

  // Click variant: Gooey bloom expansion from search button
  const clickAnimationVariants: Variants = {
    initial: {
      opacity: 0,
      scale: 0.15,
      borderRadius: 48,
      filter: 'blur(10px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      borderRadius: 16,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 24,
        stiffness: 340,
        mass: 0.75,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.15,
      borderRadius: 48,
      filter: 'blur(8px)',
      transition: {
        duration: 0.2,
        ease: [0.32, 0, 0.67, 0],
      },
    },
  };

  // Keyboard shortcut variant: Smooth slide down from top of page
  const keyboardAnimationVariants: Variants = {
    initial: {
      opacity: 0,
      y: -44,
      scale: 0.96,
      filter: 'blur(4px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 28,
        stiffness: 380,
        mass: 0.7,
      },
    },
    exit: {
      opacity: 0,
      y: -36,
      scale: 0.97,
      filter: 'blur(4px)',
      transition: {
        duration: 0.18,
        ease: [0.32, 0, 0.67, 0],
      },
    },
  };

  const selectedVariants = triggerType === 'click' ? clickAnimationVariants : keyboardAnimationVariants;

  return (
    <>
      <ModalPortal isOpen={isOpen} onClose={onClose}>
        <AnimatePresence>
          {isOpen && (
            <div
              className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4 select-none font-sans"
              role="presentation"
            >
              {/* Backdrop Blur Layer with smooth fade */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/45 dark:bg-black/65 backdrop-blur-xs cursor-pointer"
              />

              {/* Command Palette Card (Dynamic Animated Container) */}
              <motion.div
                key={triggerType}
                style={{ transformOrigin: transformOriginStyle }}
                variants={selectedVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-neutral-900 dark:text-neutral-100 font-sans z-10"
                role="dialog"
                aria-modal="true"
                aria-label="Command Palette"
                onClick={(e) => e.stopPropagation()}
              >
          {/* Mimo-Inspired Clean Search Bar Header */}
          <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 shrink-0" />

            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search documents..."
              className="flex-1 bg-transparent text-sm font-medium text-neutral-950 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/80">
              ESC
            </kbd>
          </div>

          {/* Results Action List (Minimal Mimo / Raycast Style) */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {filteredActions.length > 0 ? (
              filteredActions.map((action, idx) => {
                const isSelected = selectedIndex === idx;
                const Icon = action.icon;

                // Category header logic
                const isFirstOfCategory =
                  idx === 0 || filteredActions[idx - 1].category !== action.category;

                return (
                  <React.Fragment key={action.id}>
                    {isFirstOfCategory && (
                      <div className="px-3 pt-2 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {action.category}
                      </div>
                    )}

                    <button
                      data-index={idx}
                      type="button"
                      onClick={() => action.perform()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isSelected
                              ? 'text-neutral-950 dark:text-white'
                              : 'text-neutral-400 dark:text-neutral-500'
                          }`}
                        />

                        <div className="flex items-baseline gap-2 truncate">
                          <span className="text-xs font-medium truncate text-neutral-950 dark:text-neutral-100">
                            {action.title}
                          </span>

                          {action.description && (
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate hidden sm:inline">
                              {action.description}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right shortcut & enter cue */}
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        {action.shortcut && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                            {action.shortcut}
                          </span>
                        )}

                        {isSelected && (
                          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                            ↵
                          </span>
                        )}
                      </div>
                    </button>
                  </React.Fragment>
                );
              })
            ) : (
              /* Quick-Create Note state when no matches */
              <div className="py-10 px-4 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2.5 text-neutral-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-semibold text-neutral-900 dark:text-white mb-1">
                  No matches for "{search}"
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 max-w-xs mb-3">
                  Create a new document with this title and jump directly into writing.
                </p>
                {search.trim() && (
                  <button
                    type="button"
                    onClick={async () => {
                      const title = search.endsWith('.md') ? search : `${search}.md`;
                      const newId = await createNewDocument(title);
                      navigate(`/editor/${newId}`);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create "{search.endsWith('.md') ? search : `${search}.md`}"</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Palette Footer Status Bar */}
          <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>•</span>
              <span>↵ Select</span>
              <span>•</span>
              <span>Esc Close</span>
            </div>

            <div className="text-[11px] font-mono text-neutral-400">
              {filteredActions.length} item{filteredActions.length === 1 ? '' : 's'}
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
</ModalPortal>

      {/* Storage Breakdown Sub-modal if triggered */}
      {isStorageModalOpen && (
        <StorageDetailsModal
          isOpen={isStorageModalOpen}
          onClose={() => setIsStorageModalOpen(false)}
        />
      )}
    </>
  );
};
