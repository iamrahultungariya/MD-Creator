import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './pricingData';

export const PricingFaqSection: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-100 dark:border-neutral-800/80">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Got questions? We have answers to help you get writing smoothly.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaqIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900/40 transition-colors"
            >
              <button
                onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-neutral-900 dark:text-white cursor-pointer select-none"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed border-t border-neutral-100 dark:border-neutral-800/60 pt-3 animate-in fade-in duration-150">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
