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
      title: 'Faster & Smoother Experience',
      tag: 'Speed & Reliability',
      items: [
        'Documents and folders load noticeably faster',
        'Instant search response across all your notes and titles',
        'Smooth, stutter-free scrolling even in lengthy articles',
        'Significantly lower memory and battery usage on your device',
        'Quick, fluid transitions between all views',
      ],
    },
    {
      id: 'workspace',
      title: 'Refined Workspace',
      tag: 'Clean Design',
      items: [
        'A spacious, clutter-free document vault with more room to breathe',
        'Simplified toolbar keeping the tools you need within easy reach',
        'Flexible document lists with customizable page sizes (6, 12, 24)',
        'Clearer tags and notebook organization across all screen sizes',
      ],
    },
    {
      id: 'search',
      title: 'Instant Search & Tag Filtering',
      tag: 'Quick Retrieval',
      items: [
        'Find any word or heading in your notes without typing delay',
        'Clicking tags filters matching notebooks instantly',
        'Effortless page navigation so you spend less time searching',
      ],
    },
    {
      id: 'storage',
      title: 'Storage & Memory Management',
      tag: 'Full Control',
      items: [
        'Simple storage overview inside Preferences to see what uses space',
        'One-click cache cleanup to easily free up storage on your device',
        'Transparent breakdown of local documents and image attachments',
      ],
    },
    {
      id: 'sync',
      title: 'Reliable Multi-Device Sync',
      tag: 'Cloud Sync',
      items: [
        'Your notes stay in sync across your laptop, desktop, and phone',
        'Automatic protection ensures recent edits are safely preserved',
        'Silent background updates that never interrupt your writing',
      ],
    },
    {
      id: 'mimo',
      title: 'Mimo Writing Companion',
      tag: 'AI Partner',
      items: [
        'Friendly floating mascot helper located quietly at the corner of your screen',
        'One-click cards to summarize notes, fix grammar, or format tables with instant undo',
        'Understands the context of your current open document as you write',
        'Renders clear math formulas and clean formatting right in the chat',
        'Quickly open or hide anytime with the keyboard shortcut Ctrl+J',
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
              Explore {APP_VERSION_LABEL}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
