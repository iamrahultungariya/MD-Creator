import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Where are my documents saved?',
    answer:
      'All your documents, folders, and preferences are saved locally inside your browser using IndexedDB. You can also connect local directories via the File System Access API (Ctrl+O). MD Writer never uploads or syncs your text to remote servers unless you explicitly sign in to optional cloud backup.',
  },
  {
    question: 'How does the Google Gemini 3.x BYOK connection work?',
    answer:
      'MD Writer connects directly to the Google Gemini API (gemini-3.5-flash-lite, gemini-3.5-flash, gemini-3.8-flash) using your own Google AI Studio API key. Your key is stored in your private browser sandbox. All API requests go directly to Google with zero middleman proxy, zero markup, and zero prompt logging.',
  },
  {
    question: 'Do I need an account to write or use MD Writer?',
    answer:
      'No. You can open MD Writer and start drafting immediately without signing up, entering an email, or creating a password. It operates completely offline.',
  },
  {
    question: 'Does Mimo AI inspect my private notes?',
    answer:
      'Never without your explicit instruction. Mimo includes a client-side Privacy Shield that redacts sensitive tokens before sending prompts, and you can mark any individual document as private or disable AI features entirely.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'You can export to clean Markdown (.md), styled HTML, standalone presentation slides, vector-grade PDF with custom margins, and Microsoft Word (.docx) with formatted KaTeX formulas and tables.',
  },
  {
    question: 'Can I export and take my data with me at any time?',
    answer:
      'Yes. You own 100% of your data. You can perform a full JSON/Markdown vault backup from Preferences (Ctrl+,) with one click at any time. There is zero vendor lock-in.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Everything you need to know.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Straightforward answers about our local-first storage, Gemini BYOK, privacy guarantees, and export formats.
          </p>
        </div>

        {/* Clean Accordion with Hairline Dividers & Global rounded-2xl Container */}
        <div className="max-w-3xl border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden bg-white dark:bg-neutral-950 divide-y divide-neutral-200 dark:divide-neutral-800 shadow-xs">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="transition-colors">
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-neutral-950 dark:text-white">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="faq-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/50 dark:bg-neutral-900/30">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
