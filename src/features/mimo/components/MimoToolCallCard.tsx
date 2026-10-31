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
    switch (name) {
      case 'insert_at_bottom':
        return {
          title: 'Append to Bottom of Document',
          icon: <ArrowDownToLine className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />,
          preview: args.content,
        };
      case 'insert_at_top':
        return {
          title: 'Insert at Document Top',
          icon: <ArrowUpToLine className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />,
          preview: args.content,
        };
      case 'insert_at_cursor':
        return {
          title: 'Insert at Cursor',
          icon: <CornerDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
          preview: args.content,
        };
      case 'generate_table':
        return {
          title: 'Generate Markdown Table',
          icon: <Table className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
          preview: args.content,
        };
      case 'insert_katex_formula':
        return {
          title: 'Insert KaTeX Math Formula',
          icon: <Sigma className="w-3.5 h-3.5 text-fuchsia-600 dark:text-fuchsia-400" />,
          preview: args.displayMode ? `$$\n${args.latex}\n$$` : `$${args.latex}$`,
        };
      case 'set_document_title':
        return {
          title: 'Rename Document',
          icon: <FileEdit className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />,
          preview: `New Title: "${args.title}"`,
        };
      default:
        return {
          title: 'Document Action',
          icon: <Wrench className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />,
          preview: args.content || JSON.stringify(args, null, 2),
        };
    }
  };

  const meta = getToolMeta();

  return (
    <div className="w-full my-2.5 rounded-xl border border-violet-200/90 dark:border-violet-800/80 bg-violet-50/50 dark:bg-violet-950/20 p-3 shadow-xs text-xs font-sans animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-violet-100 dark:border-violet-900/50">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-violet-100 dark:border-violet-900/60 shrink-0">
            {meta.icon}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs truncate">
              {meta.title}
            </div>
            {args.description && (
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                {args.description}
              </div>
            )}
          </div>
        </div>

        <span className="text-[10px] font-mono text-violet-600 dark:text-violet-400 bg-violet-100/70 dark:bg-violet-900/50 px-2 py-0.5 rounded-full shrink-0">
          Tool: {name}
        </span>
      </div>

      {/* Snippet Preview */}
      {meta.preview && (
        <div className="my-2 p-2.5 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-[11px] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap select-text">
          {meta.preview}
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-2 flex items-center justify-between">
        {isApplied ? (
          <div className="flex items-center justify-between w-full">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
              <Check className="w-3.5 h-3.5" />
              Applied to Editor
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
              className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-[11px] font-medium cursor-pointer transition-colors"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={() => onApply(toolCall)}
              className="px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Check className="w-3 h-3" />
              Apply to Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
