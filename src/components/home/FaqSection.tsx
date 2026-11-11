import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is MD Writer truly 100% offline and local-first?',
    answer:
      'Yes. All your notes, folders, and settings persist directly inside your browser storage (IndexedDB via Dexie) and your local computer filesystem via the File System Access API (Ctrl+O). You can draft on airplanes, subway commutes, or during network outages without losing a single character.',
  },
  {
    question: 'How does the Google Gemini 3.x BYOK (Bring Your Own Key) work?',
    answer:
      'MD Writer is exclusively engineered for the Google Gemini 3.x family (gemini-3.5-flash-lite, gemini-3.5-flash, and gemini-3.8-flash). You can input your personal Google AI Studio API key in Mimo settings. Your key is stored solely in your local browser and communicates directly with Google API servers with zero intermediary proxy and zero platform token markup.',
  },
  {
    question: 'Do I need an account to start writing?',
    answer:
      'No account is required to start writing immediately. However, signing in with an account is recommended if you want to unlock seamless cross-device cloud sync, automatic version snapshots, and encrypted cloud backups so you never lose your drafts across laptops, tablets, and phones.',
  },
  {
    question: 'Does Mimo AI read my private notes or send data without permission?',
    answer:
      'Never. Mimo features a built-in client-side Privacy Shield that automatically detects and redacts passwords, phone numbers, and <private> tags before any prompt reaches the AI. Furthermore, you can toggle AI exclusion on individual sensitive documents in one click.',
  },
  {
    question: 'What export formats are supported?',
    answer:
      'MD Writer supports standard Markdown (.md), clean copy-to-clipboard HTML, and presentation slide decks. The Pro tier features the Studio Export Suite (currently in Beta), which includes publication-grade Vector PDF generation with custom margins and cover pages, and Microsoft Word (.docx) export with styled tables and callout blocks.',
  },
  {
    question: 'Can I cancel or change my plan anytime?',
    answer:
      'Yes. You can manage or cancel your Pro subscription at any time with a single click from your account profile. Your existing local documents will always remain accessible on your device with 100% data sovereignty.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 relative overflow-hidden bg-white dark:bg-neutral-950 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700/80">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Everything you need to know.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Straightforward answers about our offline architecture, Gemini 3.x BYOK, privacy guarantees, and sync infrastructure.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleIndex(idx)}
                  className="w-full py-4 px-5 sm:px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-sm sm:text-base text-neutral-900 dark:text-neutral-100">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-4 pt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-200/40 dark:border-neutral-800/40 bg-white dark:bg-neutral-900/50">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
