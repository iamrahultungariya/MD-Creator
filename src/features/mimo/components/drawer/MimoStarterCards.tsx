import React from 'react';
import { PenLine, BookOpen, Languages, Sparkles } from 'lucide-react';
import { MimoAvatar } from '../MimoAvatar';
import { MascotState, MimoQuickAction } from '../../types/mimoTypes';

export interface MimoStarterCardsProps {
  title: string;
  mascotState: MascotState;
  isGenerating: boolean;
  isAiExcluded?: boolean;
  onQuickAction: (action: MimoQuickAction) => void;
}

interface ActionCardConfig {
  action: MimoQuickAction;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    action: 'improve',
    title: 'Improve writing',
    description: 'Review clarity, fix grammar, and propose non-destructive diffs.',
    icon: PenLine,
  },
  {
    action: 'summarize',
    title: 'Summarize',
    description: 'Extract key takeaways and core arguments in structured bullets.',
    icon: BookOpen,
  },
  {
    action: 'translate',
    title: 'Explain in Hinglish',
    description: 'Translate technical nuances into natural Hinglish explanations.',
    icon: Languages,
  },
  {
    action: 'write',
    title: 'Draft next section',
    description: 'Synthesize the next logical headings, arguments, and notes.',
    icon: Sparkles,
  },
];

export const MimoStarterCards: React.FC<MimoStarterCardsProps> = ({
  title,
  mascotState,
  isGenerating,
  isAiExcluded = false,
  onQuickAction,
}) => {
  const disabled = isGenerating || isAiExcluded;

  return (
    <div className="py-8 px-2 flex flex-col items-center text-center space-y-6">
      <div className="relative flex items-center justify-center">
        <MimoAvatar size="hero" state={mascotState} />
      </div>

      <div className="space-y-1.5 max-w-sm">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight">
          How can Mimo assist?
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
          Connected to{' '}
          <span className="font-medium text-neutral-700 dark:text-neutral-300">
            {title || 'Untitled Document'}
          </span>
        </p>
      </div>

      {/* Suggested Actions Grid - Unified Minimal Aesthetic */}
      <div className="w-full space-y-2 text-left pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ACTION_CARDS.map(({ action, title: cardTitle, description, icon: Icon }) => (
            <button
              key={action}
              onClick={() => onQuickAction(action)}
              disabled={disabled}
              className="p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/80 dark:hover:bg-neutral-850/80 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all text-left group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors" />
                <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                  {cardTitle}
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
