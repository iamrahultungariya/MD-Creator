import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { APP_VERSION_LABEL } from '../../config/version';
import { useUpdateModalStore } from '../../stores/useUpdateModalStore';

interface UpdateSection {
  id: string;
  title: string;
  tag?: string;
  items: string[];
  actionLink?: {
    label: string;
    onClick: () => void;
  };
}

export const UpdateAvailableModal: React.FC = () => {
  const { isUpdateOpen, closeUpdate, openMimoIntro } = useUpdateModalStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  // Close on Escape & trap scroll
  useEffect(() => {
    if (!isUpdateOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeUpdate();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isUpdateOpen, closeUpdate]);

  if (!isUpdateOpen) return null;

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const sections: UpdateSection[] = [
    {
      id: 'performance',
      title: 'Groundbreaking Performance',
      tag: 'Speed & Memory',
      items: [
        '~75% faster initial document library loading speed',
        '~85% faster search and file filtering response',
        '~70% lighter page DOM footprint for fluid, stutter-free scrolling',
        '~65% reduction in browser memory usage on large document collections',
        'Silky-smooth 60 FPS transitions across all views and interactions',
      ],
    },
    {
      id: 'workspace',
      title: 'Refined Workspace',
      tag: 'UI & Ergonomics',
      items: [
        'Cleaner document vault layout with significantly less clutter and more breathing space',
        'Streamlined action toolbar consolidating secondary tools into a unified menu',
        'Upgraded pagination with custom page sizes (6, 12, 24)',
        'Improved tag pills, document counters, and visual hierarchy across all screen sizes',
      ],
    },
    {
      id: 'search',
      title: 'Instant Search & Filtering',
      tag: 'Fast Retrieval',
      items: [
        'Instantaneous document search matching with zero input latency',
        'Indexed tag switching delivers immediate notebook filtering across large vaults',
        'Fast page navigation ensures effortless browsing without lag',
      ],
    },
    {
      id: 'storage',
      title: 'Cache & Local Storage Management',
      tag: 'User Control',
      items: [
        'Direct control over application cache and storage in the Preferences dialog',
        'One-click cache cleanup to free up device space immediately',
        'Transparent breakdown of storage quotas, attachments, and document sizes',
      ],
    },
    {
      id: 'sync',
      title: 'Seamless Multi-Device Sync',
      tag: 'Cloud Sync',
      items: [
        'Multi-device synchronization is significantly more robust and accurate',
        'Intelligent conflict resolution guarantees your latest edits are always preserved',
        'Silent background sync transfers changes without interrupting your typing',
      ],
    },
    {
      id: 'mimo',
      title: 'Mimo 2.0.0 Co-Pilot',
      tag: 'AI Writing Partner',
      items: [
        'Ambient floating mascot widget always within reach at the bottom-right corner',
        '1-click action cards to insert footers, tables, and KaTeX math formulas with instant ↺ Undo',
        '10-turn conversation memory and focused text selection targeting',
        'Publication-grade KaTeX mathematical formulas and truth tables rendered live in chat',
        'Lightning-fast ~1.2s first token response powered by Gemini 2.0 architecture',
        'Quick toggle anytime with keyboard shortcut Ctrl+J',
      ],
    },
    {
      id: 'polish',
      title: 'Quality of Life & Accessibility',
      tag: 'Refinements',
      items: [
        'Polished modal dialogs with smooth keyboard navigation, tab cycling, and focus trapping',
        'Enhanced accessibility and screen-reader semantics across all buttons and menus',
        'Crisp visual contrast refinements across both dark and light themes',
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback & Bug Reporting',
      tag: 'Community',
      items: [
        'Found a bug or have an idea? Share your thoughts on our Feedback page to shape future updates!',
        'Exciting new writing workflows and tools are actively in development',
      ],
      actionLink: {
        label: 'Open Feedback Page →',
        onClick: () => {
          closeUpdate();
          navigate('/feedback');
        },
      },
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/60 backdrop-blur-[2px] animate-in fade-in duration-150"
      onClick={closeUpdate}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0 space-y-3">
          {/* Heartfelt Thank You Banner */}
          <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent border border-brand-500/20 flex items-start gap-2.5">
            <span className="text-base select-none mt-0.5">❤️</span>
            <div className="text-xs leading-relaxed">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                Thank you for creating with MD Writer!
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                Your support and feedback shaped this milestone release. We've supercharged performance, decluttered your workspace, and rebuilt Mimo into a true agentic writing partner.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2
                  id="update-modal-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950 dark:text-white"
                >
                  Update Available
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30">
                  {APP_VERSION_LABEL}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                A new version is ready to install with unmatched speed and focused writing enhancements.
              </p>
            </div>

            <button
              onClick={closeUpdate}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              title="Close update dialog"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body - 2-Column Section Layout */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs sm:text-sm">
          {sections.map((section) => {
            const isExpanded = !!expandedSections[section.id];
            const visibleItems = isExpanded ? section.items : section.items.slice(0, 3);
            const hasMore = section.items.length > 3;

            return (
              <div
                key={section.id}
                className="p-4 rounded-2xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-800 flex flex-col sm:flex-row-reverse sm:items-start justify-between gap-3 sm:gap-6"
              >
                {/* Right Side: Improve or change things name */}
                <div className="sm:w-48 sm:text-right shrink-0 space-y-1">
                  <h3 className="font-bold text-neutral-900 dark:text-white text-xs sm:text-sm tracking-tight">
                    {section.title}
                  </h3>
                  {section.tag && (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                      {section.tag}
                    </span>
                  )}
                </div>

                {/* Left Side: Show only 1-3 things related to it + Read more */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <ul className="space-y-1 text-neutral-600 dark:text-neutral-400 text-xs sm:text-[13px] pl-4 list-disc marker:text-brand-500">
                    {visibleItems.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>

                  {hasMore && (
                    <div className="pl-4 pt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:underline cursor-pointer"
                      >
                        {isExpanded ? 'Show less ↑' : `+ Read more (${section.items.length - 3} more) ↓`}
                      </button>
                    </div>
                  )}

                  {section.actionLink && (
                    <div className="pl-4 pt-1">
                      <button
                        type="button"
                        onClick={section.actionLink.onClick}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        {section.actionLink.label}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 shrink-0 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              closeUpdate();
              openMimoIntro();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-brand-700 dark:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/25 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Meet Mimo 2.0.0 ✦
          </button>

          <div className="w-full sm:w-auto flex items-center justify-end gap-2.5">
            <button
              onClick={closeUpdate}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Later
            </button>
            <button
              onClick={closeUpdate}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.98] shadow-md shadow-brand-500/25 transition-all cursor-pointer"
            >
              Explore v3.0.0
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
