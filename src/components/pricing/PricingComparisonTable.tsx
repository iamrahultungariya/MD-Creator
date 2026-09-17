import React from 'react';
import { Check, Minus } from 'lucide-react';
import { COMPARISON_ROWS } from './pricingData';

export const PricingComparisonTable: React.FC = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-neutral-100 dark:border-neutral-800/80">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-black text-neutral-950 dark:text-white tracking-tight mb-2">
          Compare Plan Features
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Detailed breakdown of features across all MD Writer tiers.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-bold uppercase text-[11px]">
            <tr>
              <th className="p-4 sm:px-6">Feature</th>
              <th className="p-4 text-center w-28">Starter</th>
              <th className="p-4 text-center w-28 bg-neutral-100/50 dark:bg-neutral-800/50">Pro Writer</th>
              <th className="p-4 text-center w-28">Team</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-950">
            {COMPARISON_ROWS.map((row, idx) => (
              <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors">
                <td className="p-4 sm:px-6 font-medium text-neutral-800 dark:text-neutral-200">
                  {row.feature}
                </td>
                <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                  {typeof row.free === 'boolean' ? (
                    row.free ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    )
                  ) : (
                    <span className="font-semibold">{row.free}</span>
                  )}
                </td>
                <td className="p-4 text-center bg-neutral-100/30 dark:bg-neutral-800/30 text-neutral-800 dark:text-neutral-200">
                  {typeof row.pro === 'boolean' ? (
                    row.pro ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto stroke-[2.5]" />
                    ) : (
                      <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    )
                  ) : (
                    <span className="font-bold text-neutral-900 dark:text-white">{row.pro}</span>
                  )}
                </td>
                <td className="p-4 text-center text-neutral-600 dark:text-neutral-400">
                  {typeof row.team === 'boolean' ? (
                    row.team ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                    )
                  ) : (
                    <span className="font-semibold">{row.team}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
