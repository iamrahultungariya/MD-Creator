import React from 'react';
import {
  ArrowDownToLine,
  ArrowUpToLine,
  CornerDownLeft,
  Table,
  Sigma,
  Wrench,
  Check,
  X,
  Undo2,
  FileEdit,
} from 'lucide-react';
import { MimoToolCall } from '../types/mimoTypes';

interface MimoToolCallCardProps {
  toolCall: MimoToolCall;
  onApply: (toolCall: MimoToolCall) => void;
  onDiscard: (toolCallId: string) => void;
  onUndo?: (toolCall: MimoToolCall) => void;
}

export const MimoToolCallCard: React.FC<MimoToolCallCardProps> = ({
  toolCall,
  onApply,
  onDiscard,
  onUndo,
}) => {
  const { name, arguments: args, isApplied, isDiscarded } = toolCall;

  const getToolMeta = () => {
    const iconClass = "w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300";
    switch (name) {
      case 'insert_at_bottom':
        return {
          title: 'Append to bottom',
          icon: <ArrowDownToLine className={iconClass} />,
          preview: args.content,
        };
      case 'insert_at_top':
        return {
          title: 'Insert at top',
          icon: <ArrowUpToLine className={iconClass} />,
          preview: args.content,
        };
      case 'insert_at_cursor':
        return {
          title: 'Insert at cursor',
          icon: <CornerDownLeft className={iconClass} />,
          preview: args.content,
        };
      case 'generate_table':
        return {
          title: 'Markdown table',
          icon: <Table className={iconClass} />,
          preview: args.content,
        };
      case 'insert_katex_formula':
        return {
          title: 'KaTeX formula',
          icon: <Sigma className={iconClass} />,
          preview: args.displayMode ? `$$\n${args.latex}\n$$` : `$${args.latex}$`,
        };
      case 'set_document_title':
        return {
          title: 'Rename document',
          icon: <FileEdit className={iconClass} />,
          preview: `New Title: "${args.title}"`,
        };
      default:
        return {
          title: 'Document action',
          icon: <Wrench className={iconClass} />,
          preview: args.content || JSON.stringify(args, null, 2),
        };
    }
  };

  const meta = getToolMeta();

  return (
    <div className="w-full my-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/40 p-3 text-xs font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-800">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shrink-0">
            {meta.icon}
          </div>
          <div className="min-w-0">
            <div className="font-medium text-neutral-900 dark:text-neutral-100 text-xs truncate">
              {meta.title}
            </div>
            {args.description && (
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                {args.description}
              </div>
            )}
          </div>
        </div>

        <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded shrink-0">
          {name}
        </span>
      </div>

      {/* Snippet Preview */}
      {meta.preview && (
        <div className="my-2 p-2.5 rounded-lg bg-neutral-950 text-neutral-200 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-text border border-neutral-800/80">
          {meta.preview}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        {isApplied ? (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
              <Check className="w-3.5 h-3.5" />
              Applied to document
            </span>
            {onUndo && (
              <button
                type="button"
                onClick={() => onUndo(toolCall)}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline cursor-pointer flex items-center gap-1 transition-colors"
              >
                <Undo2 className="w-3 h-3" />
                Undo
              </button>
            )}
          </div>
        ) : isDiscarded ? (
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 italic">
            <X className="w-3 h-3" />
            Action discarded
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 w-full">
            <button
              type="button"
              onClick={() => onDiscard(toolCall.id)}
              className="px-2.5 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[11px] font-medium cursor-pointer transition-colors"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={() => onApply(toolCall)}
              className="px-3 py-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <Check className="w-3 h-3" />
              Apply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
