import React from 'react';
import { X, Trash2, ShieldCheck, FileText } from 'lucide-react';
import { MimoAvatar } from '../MimoAvatar';
import { MimoQuotaRing } from '../MimoQuotaRing';
import { MascotState } from '../../types/mimoTypes';

export interface MimoDrawerHeaderProps {
  title: string;
  mascotState: MascotState;
  onClearMessages: () => void;
  onClose: () => void;
}

export const MimoDrawerHeader: React.FC<MimoDrawerHeaderProps> = ({
  title,
  mascotState,
  onClearMessages,
  onClose,
}) => {
  return (
    <div className="px-4 py-3 border-b border-neutral-200/80 dark:border-neutral-800/80 flex items-center justify-between bg-white dark:bg-neutral-950 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <MimoAvatar
          size="sm"
          state={mascotState}
          className="w-8 h-8 shrink-0"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 tracking-tight shrink-0">
              Mimo
            </span>
            <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-850 px-2 py-0.5 rounded-md border border-neutral-200/60 dark:border-neutral-800/60 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-2.5 h-2.5 text-neutral-500" />
              Private
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            <FileText className="w-3 h-3 text-neutral-400 shrink-0" />
            <p
              className="truncate max-w-[220px]"
              title={`Active Document: ${title || 'Untitled Document'}`}
            >
              {title || 'Untitled Document'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <MimoQuotaRing />

        <button
          onClick={onClearMessages}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors cursor-pointer"
          title="Clear chat history"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-850 transition-colors cursor-pointer ml-0.5"
          title="Close (Ctrl+J)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
