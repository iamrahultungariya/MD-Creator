import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { APP_VERSION, APP_VERSION_LABEL, getUpdateStorageKey } from '../../config/version';
import { useNavigate } from 'react-router-dom';

interface UpdateChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORT_HIGHLIGHTS = [
  { id: 1, title: 'Updated Social Links', desc: 'Direct link to the creator on X (@rahultungariya_) with clean handles.' },
  { id: 2, title: 'Expanded Review Cards', desc: 'Hovering over a review card smoothly expands it so you can read the full feedback.' },
  { id: 3, title: 'Card Focus on Hover', desc: 'Hovering over any document highlights it while softening adjacent cards.' },
  { id: 4, title: 'Smoother Pinning', desc: 'Pinned documents now glide smoothly into position instead of jumping abruptly.' },
  { id: 5, title: 'Seamless Transitions', desc: 'Opening and closing documents transitions naturally between your library and editor.' },
  { id: 6, title: 'Flicker-Free Navigation', desc: 'Moving between pages is instant and smooth, keeping editor typing completely lag-free.' },
  { id: 7, title: 'Distraction-Free Canvas', desc: 'Removed donation buttons and popups for a clean, uninterrupted writing experience.' },
  { id: 8, title: 'Fluid Drawers & FAQ', desc: 'Collapsible menus, sidebars, and FAQs expand and collapse with natural motion.' },
  { id: 9, title: 'Refined Profile Menu', desc: 'Clean, modern account dropdown with quick storage status and simple icons.' },
  { id: 10, title: 'Duplicate Documents', desc: 'Quickly create a copy of any document right from your library and open it right away.' },
  { id: 11, title: 'Clear Text Selection', desc: 'Selected text is now crisp and easy to read in both light and dark modes.' },
  { id: 12, title: 'Release Notifications', desc: 'A subtle, quiet notice lets you know whenever a new release is available.' },
];

const DETAILED_NOTES = [
  {
    category: 'Visual Design & Reading',
    items: [
      {
        title: 'High-Contrast Text Selection',
        detail: 'Selected text now consistently renders with crisp contrast across both light and dark themes, making highlighting and editing much easier on the eyes.'
      },
      {
        title: 'Minimal Account Dropdown',
        detail: 'Redesigned the profile dropdown with a clean, cohesive monochrome palette and clear storage indicators.'
      },
      {
        title: 'Document Card Focus',
        detail: 'Hovering over any document card highlights it while gently softening surrounding items for effortless browsing.'
      },
      {
        title: 'Expandable Review Cards',
        detail: 'Review cards expand on hover with comfortable padding and clear typography so you can read full testimonials without cramped text.'
      }
    ]
  },
  {
    category: 'Motion & Responsiveness',
    items: [
      {
        title: 'Smooth Document Pinning',
        detail: 'Pinning and unpinning documents now animates smoothly into place in both list and grid views.'
      },
      {
        title: 'Fluid Drawers & Accordions',
        detail: 'FAQ sections, metadata drawers, and panels open and close with silky smooth transitions.'
      },
      {
        title: 'Instant, Flicker-Free Navigation',
        detail: 'Switching between pages feels instant with zero blank flashes, while writing in the editor remains completely lag-free.'
      }
    ]
  },
  {
    category: 'Workflows & Features',
    items: [
      {
        title: 'In-Library Document Duplication',
        detail: 'Duplicate documents directly from your library with a single click, keeping your workflow quick and organized.'
      },
      {
        title: 'Distraction-Free Workspace',
        detail: 'Removed donation prompts and extra popups to give you a clean, focused markdown writing environment.'
      },
      {
        title: 'Quiet Update Notices',
        detail: 'Receive gentle, non-intrusive notifications whenever an update is available so you stay current without interruptions.'
      },
      {
        title: 'Creator Social Links',
        detail: 'Easily connect with the creator on X (@rahultungariya_) for discussions, feedback, and updates.'
      }
    ]
  }
];

export const UpdateChangelogModal: React.FC<UpdateChangelogModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'highlights' | 'detailed'>('highlights');
  const navigate = useNavigate();

  const handleAcknowledge = () => {
    try {
      localStorage.setItem(getUpdateStorageKey(APP_VERSION), 'true');
    } catch {
      // Ignore storage errors in private browsing
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        onClick={handleAcknowledge}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto"
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[82vh] my-auto bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden text-neutral-900 dark:text-neutral-100"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/70 dark:bg-neutral-950/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white">
                    What's New in {APP_VERSION_LABEL}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                    Latest
                  </span>
                </div>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Smoother animations, refined contrast, and design polish
                </p>
              </div>
            </div>

            <button
              onClick={handleAcknowledge}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close update dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="px-6 pt-3 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2 shrink-0 bg-white dark:bg-neutral-900">
            <button
              onClick={() => setActiveTab('highlights')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'highlights'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Highlights
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'detailed'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              Detailed Overview
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
            {activeTab === 'highlights' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {SHORT_HIGHLIGHTS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-start gap-3 hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 dark:text-white text-xs mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {DETAILED_NOTES.map((section, idx) => (
                  <div key={idx} className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-neutral-400 dark:text-neutral-500">
                      {section.category}
                    </h3>
                    <div className="space-y-3">
                      {section.items.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-50/40 dark:bg-neutral-900/40"
                        >
                          <div className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white mb-1.5 flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{item.title}</span>
                          </div>
                          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">Fast &amp; Responsive • 100% Local-First</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => {
                  handleAcknowledge();
                  navigate('/editor');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Launch Editor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleAcknowledge}
                className="px-5 py-2 rounded-xl bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors cursor-pointer shadow-xs"
              >
                Got It
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
