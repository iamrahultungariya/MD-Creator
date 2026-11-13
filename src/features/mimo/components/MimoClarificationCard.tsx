import React, { useState } from 'react';
import { HelpCircle, Check, Send, CheckCircle2 } from 'lucide-react';
import { MimoClarificationData } from '../types/mimoTypes';

interface MimoClarificationCardProps {
  clarification: MimoClarificationData;
  onSubmit: (formattedResponse: string, answers: Record<string, { selected: string[]; customText?: string }>) => void;
}

export const MimoClarificationCard: React.FC<MimoClarificationCardProps> = ({
  clarification,
  onSubmit,
}) => {
  const [answers, setAnswers] = useState<Record<string, { selected: string[]; customText: string }>>(() => {
    if (clarification.answers) {
      const initial: Record<string, { selected: string[]; customText: string }> = {};
      for (const [k, v] of Object.entries(clarification.answers)) {
        initial[k] = { selected: v.selected || [], customText: v.customText || '' };
      }
      return initial;
    }
    const empty: Record<string, { selected: string[]; customText: string }> = {};
    for (const q of clarification.questions) {
      empty[q.id] = { selected: [], customText: '' };
    }
    return empty;
  });

  const isSubmitted = clarification.isSubmitted;

  const handleSelectOption = (questionId: string, option: string, isMulti = false) => {
    if (isSubmitted) return;
    setAnswers((prev) => {
      const current = prev[questionId] || { selected: [], customText: '' };
      let nextSelected: string[];
      if (isMulti) {
        if (current.selected.includes(option)) {
          nextSelected = current.selected.filter((item) => item !== option);
        } else {
          nextSelected = [...current.selected, option];
        }
      } else {
        // Single select (radio behavior)
        nextSelected = current.selected.includes(option) ? [] : [option];
      }
      return {
        ...prev,
        [questionId]: {
          ...current,
          selected: nextSelected,
        },
      };
    });
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        selected: prev[questionId]?.selected || [],
        customText: text,
      },
    }));
  };

  const hasAnySelection = Object.values(answers).some(
    (a) => a.selected.length > 0 || (a.customText && a.customText.trim().length > 0)
  );

  const handleSubmit = () => {
    if (isSubmitted || !hasAnySelection) return;

    // Compile into human-readable prompt for Mimo
    const lines: string[] = ['[User Clarification & Preferences]:'];
    for (const q of clarification.questions) {
      const ans = answers[q.id];
      const selectedParts = ans?.selected || [];
      const custom = ans?.customText?.trim();

      const parts: string[] = [];
      if (selectedParts.length > 0) {
        parts.push(selectedParts.join(', '));
      }
      if (custom) {
        parts.push(`Custom note: "${custom}"`);
      }

      if (parts.length > 0) {
        lines.push(`• ${q.question}: ${parts.join(' | ')}`);
      }
    }
    lines.push('\nPlease proceed with generating the final output using these exact preferences.');

    onSubmit(lines.join('\n'), answers);
  };

  return (
    <div className="w-full my-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs overflow-hidden text-xs font-sans">
      {/* Card Header */}
      <div className="px-3.5 py-2.5 bg-neutral-50/80 dark:bg-neutral-900/60 border-b border-neutral-200/70 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
              {clarification.title || 'Help Mimo customize your response'}
            </div>
            {clarification.description && (
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {clarification.description}
              </p>
            )}
          </div>
        </div>

        {isSubmitted ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            Submitted
          </span>
        ) : (
          <span className="text-[10px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
            Required
          </span>
        )}
      </div>

      {/* Questions List */}
      <div className="p-3.5 space-y-4">
        {clarification.questions.map((q, qIndex) => {
          const isMulti = q.type === 'multi';
          const qAnswer = answers[q.id] || { selected: [], customText: '' };

          return (
            <div key={q.id} className="space-y-2">
              <div className="flex items-center gap-1.5 font-medium text-neutral-900 dark:text-neutral-100 text-xs">
                <span className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[10px] flex items-center justify-center font-mono text-neutral-500 shrink-0">
                  {qIndex + 1}
                </span>
                <span>{q.question}</span>
                {isMulti && (
                  <span className="text-[10px] text-neutral-400 font-normal">
                    (select multiple)
                  </span>
                )}
              </div>

              {/* 3 Preset Options */}
              <div className="grid grid-cols-1 gap-1.5 pl-5">
                {q.options.map((opt, optIndex) => {
                  const isSelected = qAnswer.selected.includes(opt);

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      disabled={isSubmitted}
                      onClick={() => handleSelectOption(q.id, opt, isMulti)}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-colors duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-950 font-medium shadow-2xs'
                          : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 hover:border-neutral-300 dark:hover:border-neutral-700'
                      } ${isSubmitted ? 'opacity-85 cursor-default' : ''}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Radio or Checkbox icon */}
                        <div
                          className={`w-3.5 h-3.5 rounded-${isMulti ? 'sm' : 'full'} border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-white bg-white text-neutral-950 dark:border-neutral-950 dark:bg-neutral-950 dark:text-white'
                              : 'border-neutral-300 dark:border-neutral-600 bg-transparent'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="truncate">{opt}</span>
                      </div>
                    </button>
                  );
                })}

                {/* 4th Field: Custom Free Write Field */}
                {(q.allowCustom ?? true) && (
                  <div className="mt-1">
                    <input
                      type="text"
                      disabled={isSubmitted}
                      value={qAnswer.customText}
                      onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                      placeholder="Other / Custom specification..."
                      className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-900/30 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!isSubmitted && (
        <div className="px-3.5 py-2.5 bg-neutral-50/70 dark:bg-neutral-900/50 border-t border-neutral-200/70 dark:border-neutral-800 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnySelection}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 text-xs font-semibold cursor-pointer hover:opacity-90 active:scale-98 transition-colors duration-150 flex items-center gap-1.5 shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Continue &amp; Generate</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
