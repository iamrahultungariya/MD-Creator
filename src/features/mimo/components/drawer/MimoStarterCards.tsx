import React, { useState, useEffect } from 'react';
import { MimoAvatar } from '../MimoAvatar';
import { MascotState } from '../../types/mimoTypes';
import { getDocumentContextSuggestions } from '../../services/mimoScoreboardService';

export interface MimoStarterCardsProps {
  title: string;
  docContent?: string;
  mascotState: MascotState;
  isGenerating: boolean;
  isAiExcluded?: boolean;
  onSendPrompt: (prompt: string) => void;
}

export const MimoStarterCards: React.FC<MimoStarterCardsProps> = ({
  title,
  docContent = '',
  mascotState,
  isGenerating,
  isAiExcluded = false,
  onSendPrompt,
}) => {
  const [suggestions, setSuggestions] = useState<Array<{ id: string; label: string; prompt: string }>>([]);
  const disabled = isGenerating || isAiExcluded;

  useEffect(() => {
    let cancelled = false;
    getDocumentContextSuggestions(title, docContent).then((suggs) => {
      if (!cancelled) setSuggestions(suggs);
    });
    return () => {
      cancelled = true;
    };
  }, [title, docContent]);

  return (
    <div className="py-6 px-2 flex flex-col items-center text-center space-y-5 select-none">
      <div className="relative flex items-center justify-center">
        <MimoAvatar size="hero" state={mascotState} />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          How can Mimo assist?
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Connected to{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {title || 'Untitled Document'}
          </span>
        </p>
      </div>

      {/* Row-Wise Dynamic Suggestions (Exactly 3 based on doc content & scoreboard) */}
      <div className="w-full space-y-2 text-left pt-1">
        <div className="px-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Suggested Actions
        </div>

        {suggestions.map((sugg) => (
          <button
            key={sugg.id}
            type="button"
            disabled={disabled}
            onClick={() => onSendPrompt(sugg.prompt)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-left flex items-center justify-between transition-colors cursor-pointer disabled:opacity-40 active:translate-y-[1px] shadow-2xs group"
          >
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-neutral-950 dark:group-hover:text-white truncate">
              {sugg.label}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-700 dark:group-hover:text-neutral-300 shrink-0 ml-2">
              Run ↵
            </span>
          </button>
        ))}

        {/* Quick Slash Commands Tip Bar */}
        <div className="pt-2 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-neutral-400 font-mono">Commands:</span>
          {['/compact', '/clean-md', '/action-items', '/trim', '/review'].map((cmd) => (
            <span
              key={cmd}
              className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 text-[10px] font-mono text-neutral-600 dark:text-neutral-400 font-medium"
            >
              {cmd}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
