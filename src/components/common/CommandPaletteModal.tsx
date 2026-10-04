import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CornerDownLeft,
  X,
  Command,
} from 'lucide-react';
import { db, DocumentMetadata, createNewDocument } from '../../db';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePreferencesStore } from '../../stores/usePreferencesStore';
import { StorageDetailsModal } from './StorageDetailsModal';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPdfStudio?: () => void;
}

export type ActionCategory = 'Documents' | 'Actions & Navigation';

interface PaletteAction {
  id: string;
  title: string;
  category: ActionCategory;
  description?: string;
  icon: React.ElementType;
  iconColor: string;
  shortcut?: string;
  perform: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenPdfStudio,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();

  const {
    typewriterMode,
    setTypewriterMode,
    focusMode,
    setFocusMode,
    openPreferences,
  } = usePreferencesStore();

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
      loadDocuments();
    }
  }, [isOpen, loadDocuments]);

  // Focus input and reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Build curated actions catalogue: only documents, high-frequency actions & core navigation
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
        description: `Last edited ${formattedDate}`,
        icon: FileText,
        iconColor: 'text-brand-600 bg-brand-500/10 dark:text-brand-400 dark:bg-brand-500/20 border-brand-500/20',
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
      iconColor: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-500/20 border-emerald-500/20',
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
      iconColor: 'text-brand-600 bg-brand-500/10 dark:text-brand-400 dark:bg-brand-500/20 border-brand-500/20',
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
      iconColor: 'text-sky-600 bg-sky-500/10 dark:text-sky-400 dark:bg-sky-500/20 border-sky-500/20',
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
      iconColor: 'text-amber-600 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-500/20 border-amber-500/20',
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
      description: 'Keep the current active writing line vertically centered',
      icon: Type,
      iconColor: typewriterMode
        ? 'text-brand-600 bg-brand-500/20 border-brand-500/30'
        : 'text-neutral-600 bg-neutral-500/10 dark:text-neutral-400 dark:bg-neutral-800 border-neutral-500/20',
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
      description: 'Dim surrounding paragraphs to highlight the current line',
      icon: Eye,
      iconColor: focusMode
        ? 'text-emerald-600 bg-emerald-500/20 border-emerald-500/30'
        : 'text-neutral-600 bg-neutral-500/10 dark:text-neutral-400 dark:bg-neutral-800 border-neutral-500/20',
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
      description: 'Vector PDF generation with themes and cover layout',
      icon: Printer,
      iconColor: 'text-indigo-600 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-500/20 border-indigo-500/20',
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
      title: 'Editor Preferences',
      category: 'Actions & Navigation',
      description: 'Font choices, line height, tab sizes & editor behaviors',
      icon: Settings,
      iconColor: 'text-neutral-600 bg-neutral-500/10 dark:text-neutral-300 dark:bg-neutral-800 border-neutral-500/20',
      shortcut: 'Prefs',
      perform: () => {
        openPreferences();
        onClose();
      },
    });

    list.push({
      id: 'action-storage-details',
      title: 'Storage & 300 MB Limit Telemetry',
      category: 'Actions & Navigation',
      description: 'View IndexedDB usage, local-first safety & purge trash',
      icon: Database,
      iconColor: 'text-brand-600 bg-brand-500/10 dark:text-brand-400 dark:bg-brand-500/20 border-brand-500/20',
      shortcut: '300 MB',
      perform: () => {
        setIsStorageModalOpen(true);
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

  if (!isOpen) return null;

  const selectedAction = filteredActions[selectedIndex];

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-24 px-3 sm:px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none font-sans"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className="w-full max-w-xl bg-white/95 dark:bg-[#121118]/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.3)] dark:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100 font-sans"
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          {/* Subtle Electric Violet Top Sheen */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent shrink-0" />

          {/* Top Window Header: macOS Traffic Lights & Title */}
          <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/60 dark:bg-neutral-950/40 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <Command className="w-3.5 h-3.5 text-brand-500" />
                <span>Quick Commands &amp; Navigation</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60">
                ⌘K / Ctrl+K
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                aria-label="Close Command Palette"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center gap-3 bg-white dark:bg-neutral-900/60 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
              <Search className="w-4 h-4" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search documents or jump to actions..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-hidden"
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

            <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 border border-neutral-200/60 dark:border-neutral-700/60">
              ESC
            </kbd>
          </div>

          {/* Results Action List */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-1">
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
                      <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                        {action.category}
                      </div>
                    )}

                    <button
                      data-index={idx}
                      type="button"
                      onClick={() => action.perform()}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-500/40 text-neutral-950 dark:text-white shadow-2xs'
                          : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${action.iconColor}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>

                        <div className="truncate">
                          <div className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                            {action.title}
                          </div>

                          {action.description && (
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                              {action.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right shortcut & enter cue */}
                      <div className="flex items-center gap-2 shrink-0 pl-2">
                        {action.shortcut && (
                          <kbd
                            className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border shadow-2xs transition-colors ${
                              isSelected
                                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-300 border-brand-500/30'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border-neutral-200/60 dark:border-neutral-700/60'
                            }`}
                          >
                            {action.shortcut}
                          </kbd>
                        )}

                        {isSelected && (
                          <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 flex items-center">
                            <CornerDownLeft className="w-3.5 h-3.5" />
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
                <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-2.5 text-neutral-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-bold text-neutral-900 dark:text-white mb-1">
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
                    className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create "{search.endsWith('.md') ? search : `${search}.md`}"</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Palette Footer Status Bar */}
          <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/50 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 font-mono text-[10px]">
                  ↑↓
                </kbd>
                <span>Navigate</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 font-mono text-[10px]">
                  ↵
                </kbd>
                <span>Select</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 border border-neutral-300/60 dark:border-neutral-700 font-mono text-[10px]">
                  Esc
                </kbd>
                <span>Close</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {selectedAction && (
                <div className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                  <span>↵ {selectedAction.shortcut || 'Select'}</span>
                </div>
              )}
              <span className="text-[11px] font-mono">
                {filteredActions.length} item{filteredActions.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

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
