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
  Sigma,
  FolderOpen,
  ArrowRight,
  ExternalLink,
  Download,
  MessageSquare,
} from 'lucide-react';
import { db, DocumentMetadata, createNewDocument } from '../../db';
import { useThemeStore } from '../../stores/useThemeStore';
import { usePwaInstall } from '../../hooks/usePwaInstall';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenMathStudio?: () => void;
  onOpenPdfStudio?: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'Documents' | 'Quick Actions' | 'Formulas & Math' | 'Navigation' | 'Community & Support';
  description?: string;
  icon: React.ElementType;
  iconColor: string;
  shortcut?: string;
  perform: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onOpenMathStudio,
  onOpenPdfStudio,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
  const { isInstalled, installApp } = usePwaInstall();

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Load documents from IndexedDB
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    db.documents
      .orderBy('updatedAt')
      .reverse()
      .limit(10)
      .toArray()
      .then((docs) => {
        if (isMounted) setDocuments(docs);
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build static & dynamic action items
  const actions = useMemo<PaletteAction[]>(() => {
    const list: PaletteAction[] = [];

    // 1. Documents from IndexedDB
    documents.forEach((doc) => {
      list.push({
        id: `doc-${doc.id}`,
        title: doc.title,
        category: 'Documents',
        description: `Last edited ${new Date(doc.updatedAt).toLocaleDateString()}`,
        icon: FileText,
        iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50',
        shortcut: 'Open',
        perform: () => {
          navigate(`/editor/${doc.id}`);
          onClose();
        },
      });
    });

    // 2. Quick Actions
    list.push({
      id: 'action-new-doc',
      title: 'Create New Document',
      category: 'Quick Actions',
      description: 'Start a blank Markdown document in IndexedDB',
      icon: Plus,
      iconColor: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/50',
      shortcut: 'New',
      perform: async () => {
        const newId = await createNewDocument('Untitled Document.md');
        navigate(`/editor/${newId}`);
        onClose();
      },
    });

    list.push({
      id: 'action-toggle-theme',
      title: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      category: 'Quick Actions',
      description: 'Toggle application visual theme',
      icon: isDark ? Sun : Moon,
      iconColor: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50',
      shortcut: 'Theme',
      perform: () => {
        toggleTheme();
        onClose();
      },
    });

    if (!isInstalled) {
      list.push({
        id: 'action-install-app',
        title: 'Install MD Writer App',
        category: 'Quick Actions',
        description: 'Install as desktop/offline standalone Progressive Web App',
        icon: Download,
        iconColor: 'text-sky-500 bg-sky-50 dark:bg-sky-950/50',
        shortcut: 'PWA',
        perform: async () => {
          onClose();
          await installApp();
        },
      });
    }

    if (location.pathname.startsWith('/editor') && onOpenPdfStudio) {
      list.push({
        id: 'action-pdf-export',
        title: 'Open PDF Export Studio',
        category: 'Quick Actions',
        description: 'Format, theme & print publication-grade vector PDF',
        icon: Printer,
        iconColor: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/50',
        shortcut: 'Ctrl+P',
        perform: () => {
          onOpenPdfStudio();
          onClose();
        },
      });
    }

    list.push({
      id: 'action-feedback',
      title: 'Submit Feedback & Ideas',
      category: 'Community & Support',
      description: 'Report bugs, suggest features, or share thoughts',
      icon: MessageSquare,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
      shortcut: '/feedback',
      perform: () => {
        onClose();
        navigate('/feedback');
      },
    });

    // 3. Formulas & Math
    list.push({
      id: 'action-math-studio',
      title: 'Open KaTeX Formula Studio',
      category: 'Formulas & Math',
      description: 'Predefined Calculus, Algebra, Physics & Statistics equations',
      icon: Sigma,
      iconColor: 'text-purple-500 bg-purple-50 dark:bg-purple-950/50',
      shortcut: '/math',
      perform: () => {
        if (onOpenMathStudio) {
          onOpenMathStudio();
        } else if (!location.pathname.startsWith('/editor')) {
          navigate('/editor');
        }
        onClose();
      },
    });

    // 4. Navigation
    list.push({
      id: 'nav-documents',
      title: 'Go to Documents Vault',
      category: 'Navigation',
      description: 'Browse all offline documents, tags, and stats',
      icon: FolderOpen,
      iconColor: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50',
      shortcut: 'Vault',
      perform: () => {
        navigate('/documents');
        onClose();
      },
    });

    list.push({
      id: 'nav-home',
      title: 'Go to Home Landing Page',
      category: 'Navigation',
      description: 'Return to MD Writer feature showcase',
      icon: ExternalLink,
      iconColor: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800',
      shortcut: 'Home',
      perform: () => {
        navigate('/');
        onClose();
      },
    });

    return list;
  }, [documents, isDark, toggleTheme, navigate, onClose, onOpenMathStudio, onOpenPdfStudio, location.pathname]);

  // Filter actions based on query
  const filteredActions = useMemo(() => {
    if (!search.trim()) return actions;
    const q = search.toLowerCase();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );
  }, [actions, search]);

  // Reset selected index when query changes
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
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filteredActions, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 text-neutral-900 dark:text-neutral-100">
        {/* Search Bar Input */}
        <div className="px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3 bg-white dark:bg-neutral-900 shrink-0">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, search documents, or insert formulas..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md border border-neutral-200/70 dark:border-neutral-700/70 shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 space-y-1">
          {filteredActions.map((action, idx) => {
            const isSelected = selectedIndex === idx;
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                data-index={idx}
                type="button"
                onClick={() => action.perform()}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full text-left px-3 py-2.5 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${action.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-neutral-950 dark:text-white truncate">
                      {action.title}
                    </div>
                    {action.description && (
                      <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                        {action.description}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-3">
                  <kbd className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60 shadow-2xs">
                    {action.shortcut}
                  </kbd>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
              </button>
            );
          })}

          {filteredActions.length === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-neutral-400">
              <FileCode className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs font-medium">No commands found for "{search}"</p>
            </div>
          )}
        </div>

        {/* Palette Footer Tip */}
        <div className="px-4 py-2.5 border-t border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/50 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Use <kbd className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-2xs">↑</kbd>{' '}
              <kbd className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-2xs">↓</kbd> to navigate
            </span>
            <span>•</span>
            <span>
              <kbd className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/70 dark:border-neutral-700/70 px-1.5 py-0.5 rounded-md text-[10px] font-medium shadow-2xs">↵</kbd> to select
            </span>
          </div>
          <span className="text-[11px] font-medium">{filteredActions.length} actions</span>
        </div>
      </div>
    </div>
  );
};
