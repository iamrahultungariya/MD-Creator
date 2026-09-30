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
  { id: 1, title: 'Silky Theme Switching', desc: 'Switching between Light and Dark mode is now fluid and easy on your eyes.' },
  { id: 2, title: 'Smart Table Paste', desc: 'Copy data from Excel, Google Sheets, or websites and paste directly into neat tables.' },
  { id: 3, title: 'Flawless PDF & Print', desc: 'Clean paper export with vibrant code colors, no double boxes, and wide tables that fit.' },
  { id: 4, title: 'Crystal-Clear Diagrams', desc: 'Flowcharts and diagrams are sharp and easy to read in dark mode, matching your paper.' },
  { id: 5, title: 'Instant Link Previews', desc: 'Hover over any link in preview to see a helpful card with website icon and platform info.' },
  { id: 6, title: 'Clean Writing Canvas', desc: 'Enjoy a pure, distraction-free writing space without overlapping buttons or clutter.' },
  { id: 7, title: 'Refined Callouts & Notes', desc: 'Tips, warnings, and notes look elegant on screen and print cleanly on paper.' },
  { id: 8, title: 'Fluid Document Cards', desc: 'Browsing and opening documents from your library is smooth and responsive.' },
];

const DETAILED_NOTES = [
  {
    category: 'Visuals & Atmosphere',
    items: [
      {
        title: 'Smooth Theme Switching',
        detail: 'Switching between Light and Dark mode is now seamless and comfortable, with no harsh flashes or sudden jumps.'
      },
      {
        title: 'Readable Diagrams in Any Light',
        detail: 'Flowcharts, mind maps, and diagrams automatically match your reading paper tone and remain crystal clear in dark mode.'
      },
      {
        title: 'Refined Notes & Callouts',
        detail: 'Important tips, notes, and warnings now feature soft, balanced colors that look great on screen and print beautifully on paper.'
      }
    ]
  },
  {
    category: 'Writing & Productivity',
    items: [
      {
        title: 'Smart Table Paste',
        detail: 'Paste data directly from Excel, Google Sheets, or websites. It instantly formats into a tidy table, and you can undo with a single click if needed.'
      },
      {
        title: 'Instant Link Previews',
        detail: 'Hover over any link in your preview to view a neat card showing the website icon and recognized platform badge.'
      },
      {
        title: 'Distraction-Free Writing Canvas',
        detail: 'A clean, uncluttered writing canvas with smooth navigation so you can focus entirely on your words.'
      }
    ]
  },
  {
    category: 'Export & Publishing',
    items: [
      {
        title: 'Clean PDF & Print Export',
        detail: 'Export your documents with pure paper backgrounds, no dark boxes behind code snippets, and full color highlights.'
      },
      {
        title: 'Scroll-Free Print Tables',
        detail: 'Wide and long tables wrap naturally onto the page when exporting to PDF or printing, without unwanted scrollbars.'
      },
      {
        title: 'Fluid Library Cards',
        detail: 'Navigating your document library feels faster and smoother, with gentle highlights on the document you are focusing on.'
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
                  Smooth themes, smart tables, and flawless publishing
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
