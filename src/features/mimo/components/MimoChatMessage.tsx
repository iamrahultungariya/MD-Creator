import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { autoBalanceDelimitersAndSanitize } from '../../../utils/markdownSanitizer';
import { extractTextFromReactNode } from '../../../components/editor/markdownAlerts';
import { formatAndDetectCodeBlock } from '../../../utils/codeBlockFormatter';
import { Copy, Check, ArrowDownToLine } from 'lucide-react';
import { MimoMessage, MimoToolCall } from '../types/mimoTypes';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoAvatar } from './MimoAvatar';
import { MimoThoughtBlock } from './MimoThoughtBlock';
import { MimoExecutionTimeline } from './MimoExecutionTimeline';
import { MimoDiffCard } from './MimoDiffCard';
import { MimoToolCallCard } from './MimoToolCallCard';
import { MimoClarificationCard } from './MimoClarificationCard';

interface MimoChatMessageProps {
  message: MimoMessage;
  onApplyDiff?: (hunkId?: string) => void;
  onDiscardDiff?: (hunkId?: string) => void;
  onInsertSnippet?: (snippet: string) => void;
  onApplyToolCall?: (toolCall: MimoToolCall) => void;
  onDiscardToolCall?: (toolCallId: string) => void;
  onUndoToolCall?: (toolCall: MimoToolCall) => void;
  onSubmitClarification?: (formattedPrompt: string, messageId: string, answers: any) => void;
}


// Static plugin arrays to avoid re-constructing the unified AST processor pipeline on every token chunk/render
const STATIC_CHAT_REMARK_PLUGINS: any[] = [remarkGfm, remarkMath, remarkBreaks];
const STATIC_CHAT_REHYPE_PLUGINS: any[] = [
  rehypeRaw,
  [rehypeKatex, { output: 'htmlAndMathml', strict: false, throwOnError: false }],
];

export const MimoChatMessage: React.FC<MimoChatMessageProps> = ({
  message,
  onApplyDiff,
  onDiscardDiff,
  onInsertSnippet,
  onApplyToolCall,
  onDiscardToolCall,
  onUndoToolCall,
  onSubmitClarification,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [insertedCodeIndex, setInsertedCodeIndex] = useState<number | null>(null);
  const showThinking = useMimoStore((s) => s.showThinking);
  const currentStoreMascot = useMimoStore((s) => s.mascotState);

  const isStreamingThis = !message.text || (message.activity && !message.activity.isDone);
  const avatarState =
    message.mascotState ||
    (isStreamingThis
      ? currentStoreMascot
      : message.diffHunk && !message.diffHunk.isDiscarded
      ? 'excited'
      : 'happy');

  const normalizedText = React.useMemo(() => {
    return autoBalanceDelimitersAndSanitize(message.text || '');
  }, [message.text]);

  const handleCopyFullText = () => {
    if (!message.text) return;
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleCopyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIndex(idx);
    setTimeout(() => setCopiedCodeIndex(null), 1800);
  };

  const handleInsertCode = (code: string, idx: number) => {
    onInsertSnippet?.(code);
    setInsertedCodeIndex(idx);
    setTimeout(() => setInsertedCodeIndex(null), 1800);
  };

  if (message.role === 'user') {
    return (
      <div className="flex flex-col items-end my-2 space-y-1">
        {message.hasSelectionContext && (
          <span className="text-[10px] text-neutral-600 dark:text-neutral-400 font-medium px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-850 border border-neutral-200/60 dark:border-neutral-800/60">
            Selected Context
          </span>
        )}
        <div className="max-w-[88%] px-3.5 py-2.5 rounded-2xl rounded-tr-xs bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-950 text-xs font-sans shadow-2xs whitespace-pre-wrap leading-relaxed select-text">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 my-3 select-text font-sans">
      {/* Assistant Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MimoAvatar size="xs" state={avatarState} />
          <span className="font-bold text-xs text-neutral-800 dark:text-neutral-200">
            Mimo
          </span>
        </div>

        {message.text && (
          <button
            onClick={handleCopyFullText}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
            title="Copy full response"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* 3.5 Flash-Lite 5-Step Execution Timeline OR Unified Thought Block */}
      {message.activity?.protocolTimeline ? (
        <MimoExecutionTimeline
          activity={message.activity}
          isStreaming={!message.text && (!message.activity || !message.activity.isDone)}
        />
      ) : (
        showThinking && (
          <MimoThoughtBlock
            activity={message.activity}
            thoughtText={message.thoughtText}
            isStreaming={!message.text && (!message.activity || !message.activity.isDone)}
          />
        )
      )}

      {/* Rich Formatted Markdown Response Body */}
      {message.text && (
        <div className="p-4 rounded-2xl rounded-tl-xs bg-neutral-50/90 dark:bg-neutral-900/70 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed shadow-2xs space-y-2">
          <ReactMarkdown
            remarkPlugins={STATIC_CHAT_REMARK_PLUGINS}
            rehypePlugins={STATIC_CHAT_REHYPE_PLUGINS}
            components={{
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-neutral-950 dark:text-white mt-3 mb-1 border-b border-neutral-200 dark:border-neutral-800 pb-1">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-neutral-950 dark:text-white mt-2.5 mb-1">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-2 mb-0.5">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="my-1.5 leading-relaxed text-neutral-800 dark:text-neutral-200">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside my-1.5 space-y-1 text-neutral-800 dark:text-neutral-200 pl-1">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside my-1.5 space-y-1 text-neutral-800 dark:text-neutral-200 pl-1">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 border-neutral-300 dark:border-neutral-700 pl-3 my-2 text-neutral-600 dark:text-neutral-400 italic bg-neutral-100/50 dark:bg-neutral-850/50 py-1 rounded-r-md">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="my-2.5 overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <table className="w-full text-left text-[11px] divide-y divide-neutral-200 dark:divide-neutral-800">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-neutral-100 dark:bg-neutral-800 font-semibold text-neutral-900 dark:text-white">
                  {children}
                </thead>
              ),
              th: ({ children }) => <th className="p-2">{children}</th>,
              td: ({ children }) => (
                <td className="p-2 border-t border-neutral-100 dark:border-neutral-800/80">
                  {children}
                </td>
              ),
              a: ({ href, children }) => {
                if (href === '#connect-key') {
                  return (
                    <button
                      type="button"
                      onClick={() => useMimoStore.getState().setIsKeyModalOpen(true)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 text-white dark:bg-emerald-600 text-[11px] font-semibold hover:opacity-90 cursor-pointer shadow-2xs my-1"
                    >
                      {children}
                    </button>
                  );
                }
                if (href === '#switch-model-35' || href === '#switch-flash') {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        useMimoStore.getState().setSelectedModel('gemini-3.5-flash');
                        useMimoStore.getState().touchMimoActivity();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-semibold hover:opacity-90 cursor-pointer shadow-2xs my-1"
                    >
                      {children}
                    </button>
                  );
                }
                if (href === '#switch-lite') {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        useMimoStore.getState().setSelectedModel('gemini-3.5-flash-lite');
                        useMimoStore.getState().touchMimoActivity();
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[11px] font-semibold hover:opacity-90 cursor-pointer shadow-2xs my-1"
                    >
                      {children}
                    </button>
                  );
                }
                if (href === '#retry-prompt') {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        const msgs = useMimoStore.getState().messages;
                        const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
                        if (lastUser && onSubmitClarification) {
                          onSubmitClarification(lastUser.text, message.id, {});
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold hover:opacity-90 cursor-pointer shadow-2xs my-1"
                    >
                      {children}
                    </button>
                  );
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neutral-900 dark:text-neutral-100 underline underline-offset-2 hover:opacity-80"
                  >
                    {children}
                  </a>
                );
              },
              code: ({ className, children }) => {
                const isInline = !className;
                const match = /language-(\w+)/.exec(className || '');
                const codeString = extractTextFromReactNode(children).replace(/\n$/, '');

                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-700/50 font-mono text-[11px]">
                      {children}
                    </code>
                  );
                }

                const { formattedCode, detectedLanguage } = formatAndDetectCodeBlock(
                  codeString,
                  match ? match[1] : undefined
                );
                const shouldRenderFormatted = formattedCode !== codeString;
                const codeToCopy = shouldRenderFormatted ? formattedCode : codeString;
                const codeId = Math.abs(codeString.length * 31);
                const displayLang = detectedLanguage ? detectedLanguage.toUpperCase() : (match ? match[1] : 'CODE');

                return (
                  <div className="relative my-2 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950 text-neutral-200 font-mono text-[11px]">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900/90 border-b border-neutral-800 text-[10px] text-neutral-400">
                      <span>{displayLang}</span>
                      <div className="flex items-center gap-2.5">
                        {onInsertSnippet && (
                          <button
                            onClick={() => handleInsertCode(codeToCopy, codeId)}
                            className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                            title="Insert into editor at cursor"
                          >
                            {insertedCodeIndex === codeId ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400 font-semibold">Inserted</span>
                              </>
                            ) : (
                              <>
                                <ArrowDownToLine className="w-3 h-3" />
                                <span>Insert</span>
                              </>
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyCode(codeToCopy, codeId)}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedCodeIndex === codeId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    <pre className="p-3 overflow-x-auto whitespace-pre-wrap break-words max-w-full leading-relaxed font-mono">
                      <code>{shouldRenderFormatted ? formattedCode : children}</code>
                    </pre>
                  </div>
                );
              },
            }}
          >
            {normalizedText}
          </ReactMarkdown>
        </div>
      )}


      {/* Interactive Clarification Question Card if present */}
      {message.clarification && (
        <MimoClarificationCard
          clarification={message.clarification}
          onSubmit={(formattedPrompt, answers) =>
            onSubmitClarification?.(formattedPrompt, message.id, answers)
          }
        />
      )}

      {/* Interactive Tool Call Action Card if present */}
      {message.toolCall && (
        <MimoToolCallCard
          toolCall={message.toolCall}
          onApply={() => onApplyToolCall?.(message.toolCall!)}
          onDiscard={() => onDiscardToolCall?.(message.toolCall!.id)}
          onUndo={onUndoToolCall ? () => onUndoToolCall(message.toolCall!) : undefined}
        />
      )}

      {/* Diff Hunk Card if present */}
      {message.diffHunk && (
        <MimoDiffCard
          hunk={message.diffHunk}
          onApply={() => onApplyDiff?.(message.diffHunk?.id)}
          onDiscard={() => onDiscardDiff?.(message.diffHunk?.id)}
        />
      )}
    </div>
  );
};
