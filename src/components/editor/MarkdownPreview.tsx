import React, { useState, useMemo, useDeferredValue, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import { sanitizeMarkdownForPreview } from '../../utils/markdownSanitizer';
import { Copy, Check, X, ChevronRight } from 'lucide-react';
import { MermaidBlock } from './MermaidBlock';
import { replaceRichIconsInReactNode } from '../../utils/richIcons';
import { FrontmatterCard } from './FrontmatterCard';
import { extractTextFromReactNode, toHeadingSlug, extractAlertInfo } from './markdownAlerts';
import { MarkdownImage } from './MarkdownImage';
import { findAllTablesInDocument, replaceTableInDocument, ParsedTable } from '../../utils/markdownTable';
import { InteractiveTableOverlay } from './InteractiveTableOverlay';

interface MarkdownPreviewProps {
  content: string;
  onToggleTask?: (taskIndex: number, currentChecked: boolean) => void;
  onUpdateContent?: (newContent: string) => void;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = React.memo(({ content, onToggleTask, onUpdateContent, className }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ src: string; alt?: string; title?: string } | null>(null);

  // React 18/19 interruptible deferred value: markdown AST & KaTeX processing runs in background transitions
  // and will yield immediately to keystrokes and typing
  const deferredContent = useDeferredValue(content);

  // Parse opening YAML front matter if present
  const frontmatterMatch = deferredContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const rawFrontmatter = frontmatterMatch ? frontmatterMatch[1] : null;
  const rawMarkdownBody = frontmatterMatch ? deferredContent.slice(frontmatterMatch[0].length) : deferredContent;

  // Sanitize math comparisons & unescaped tokens for rehype-raw
  const sanitizedMarkdownBody = useMemo(() => {
    return sanitizeMarkdownForPreview(rawMarkdownBody);
  }, [rawMarkdownBody]);

  // Locate Markdown tables for interactive inline editing
  const locatedTables = useMemo(() => {
    return findAllTablesInDocument(rawMarkdownBody);
  }, [rawMarkdownBody]);

  const tableRenderCounterRef = useRef(0);
  tableRenderCounterRef.current = 0;

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div 
      data-markdown-preview="true" 
      className={`w-full max-w-full leading-relaxed select-text break-words prose-container ${className || 'text-neutral-800 dark:text-neutral-200 text-sm'}`}
    >
      {rawFrontmatter && <FrontmatterCard rawYaml={rawFrontmatter} />}
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
        components={{
          // Headings with stable IDs and scroll-margin for outline synchronization
          h1: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h1 id={id} data-heading="true" data-heading-text={plainText} className="text-2xl sm:text-3xl font-black text-inherit mt-6 mb-3 tracking-tight pb-1.5 border-b border-current/15 scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h1>
            );
          },
          h2: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h2 id={id} data-heading="true" data-heading-text={plainText} className="text-xl sm:text-2xl font-bold text-inherit mt-5 mb-2.5 tracking-tight scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h2>
            );
          },
          h3: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h3 id={id} data-heading="true" data-heading-text={plainText} className="text-lg font-bold text-inherit mt-4 mb-2 scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h3>
            );
          },
          h4: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h4 id={id} data-heading="true" data-heading-text={plainText} className="text-base font-semibold text-inherit mt-3 mb-1.5 scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h4>
            );
          },
          h5: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h5 id={id} data-heading="true" data-heading-text={plainText} className="text-sm font-semibold text-inherit mt-2.5 mb-1 scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h5>
            );
          },
          h6: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h6 id={id} data-heading="true" data-heading-text={plainText} className="text-xs font-semibold text-inherit opacity-75 uppercase tracking-wider mt-2 mb-1 scroll-mt-6 transition-all duration-300">
                {replaceRichIconsInReactNode(children)}
              </h6>
            );
          },

          // Paragraphs: Balanced vertical rhythm with first/last constraints
          p: ({ children }) => (
            <p className="my-2.5 leading-relaxed text-inherit opacity-95 first:mt-0 last:mb-0">
              {replaceRichIconsInReactNode(children)}
            </p>
          ),

          // Unordered Lists: Clean marker alignment, proportional nesting
          ul: ({ children }) => (
            <ul className="my-2.5 pl-6 space-y-1.5 list-disc marker:text-current marker:opacity-50 [&_ul]:my-1 [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:pl-5">
              {children}
            </ul>
          ),

          // Ordered Lists: Precise tabular mono numbers, aligned baseline
          ol: ({ children }) => (
            <ol className="my-2.5 pl-6 space-y-1.5 list-decimal marker:text-current marker:opacity-60 marker:font-mono marker:text-xs marker:font-semibold [&_ol]:my-1 [&_ol]:pl-5 [&_ul]:my-1 [&_ul]:pl-5">
              {children}
            </ol>
          ),

          // List Items: Prevents awkward paragraph margins inside <li>, clean hierarchy
          li: ({ children }) => (
            <li className="leading-relaxed text-inherit opacity-95 pl-1 marker:leading-relaxed [&>p]:inline [&>p]:m-0 [&>p+p]:block [&>p+p]:mt-1.5 [&>ul]:mt-1.5 [&>ol]:mt-1.5">
              {replaceRichIconsInReactNode(children)}
            </li>
          ),

          // Interactive Checkboxes
          input: ({ type, checked, disabled: _disabled, node: _node, ...props }: any) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={Boolean(checked)}
                  onChange={(e) => {
                    if (onToggleTask) {
                      const root = e.currentTarget.closest('[data-markdown-preview="true"]') || e.currentTarget.closest('.preview-pane-container');
                      const allCheckboxes = root ? Array.from(root.querySelectorAll('input[type="checkbox"]')) : [];
                      const taskIndex = allCheckboxes.indexOf(e.currentTarget);
                      if (taskIndex !== -1) {
                        onToggleTask(taskIndex, Boolean(checked));
                      }
                    }
                  }}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0 mr-2 align-middle cursor-pointer accent-neutral-900 dark:accent-white"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },

          // Blockquotes & Callout Alerts
          blockquote: ({ children }) => {
            const alertData = extractAlertInfo(children);

            if (alertData) {
              const { config, content: alertContent } = alertData;
              const IconComp = config.icon;

              return (
                <div 
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: config.borderColor,
                    backgroundColor: config.backgroundColor,
                  }}
                  className={`my-4 p-4 rounded-r-2xl border-y border-r border-neutral-200/50 dark:border-neutral-800/50 shadow-xs transition-all ${config.containerClass}`}
                >
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <div 
                      style={{
                        backgroundColor: config.badgeBg,
                        color: config.badgeColor,
                      }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider uppercase shadow-2xs ${config.badgeClass}`}
                    >
                      <IconComp className={`w-3.5 h-3.5 shrink-0 ${config.iconClass}`} />
                      <span>{config.title}</span>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed font-normal opacity-95">
                    {replaceRichIconsInReactNode(alertContent)}
                  </div>
                </div>
              );
            }

            // Standard Quote
            return (
              <blockquote className="border-l-4 border-current/25 bg-current/5 p-4 my-3.5 rounded-r-2xl text-inherit italic shadow-2xs">
                {replaceRichIconsInReactNode(children)}
              </blockquote>
            );
          },

          // Collapsible Accordion (details & summary)
          details: ({ children, ...props }: any) => (
            <details 
              className="my-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-900/40 overflow-hidden transition-all group open:bg-white dark:open:bg-neutral-900 shadow-2xs"
              {...props}
            >
              {children}
            </details>
          ),
          summary: ({ children, ...props }: any) => (
            <summary 
              className="px-4 py-3 font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white cursor-pointer select-none hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60 transition-colors flex items-center gap-2 list-none marker:hidden"
              {...props}
            >
              <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-open:rotate-90 transition-transform duration-150 shrink-0" />
              <span className="flex-1">{children}</span>
            </summary>
          ),

          // Keyboard Badges (<kbd>)
          kbd: ({ children, ...props }: any) => (
            <kbd 
              className="px-1.5 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 font-mono text-[11px] text-neutral-800 dark:text-neutral-200 shadow-2xs font-semibold inline-block"
              {...props}
            >
              {children}
            </kbd>
          ),

          // Tables (with Interactive Live Table Studio overlay if editable)
          table: ({ children }: any) => {
            const currentTableIndex = tableRenderCounterRef.current++;
            const located = locatedTables[currentTableIndex];

            if (onUpdateContent && located) {
              return (
                <InteractiveTableOverlay
                  table={located.table}
                  isEditable={true}
                  onTableChange={(updatedTable: ParsedTable) => {
                    const newBody = replaceTableInDocument(rawMarkdownBody, currentTableIndex, updatedTable);
                    const finalDoc = frontmatterMatch ? `${frontmatterMatch[0]}${newBody}` : newBody;
                    onUpdateContent(finalDoc);
                  }}
                />
              );
            }

            return (
              <div className="overflow-x-auto my-5 rounded-xl border border-current/20 shadow-2xs max-w-full">
                <table className="min-w-full w-max text-left text-xs divide-y divide-current/15">
                  {children}
                </table>
              </div>
            );
          },
          thead: ({ children }) => (
            <thead className="bg-current/[0.04] text-inherit font-semibold uppercase tracking-wider text-[10px]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-bold border-b border-current/20 whitespace-nowrap text-inherit">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-inherit/90 border-t border-current/10">
              {children}
            </td>
          ),

          // Code blocks, Inline Code & Mermaid Diagrams
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match && typeof children === 'string' && !children.includes('\n');
            const rawCode = extractTextFromReactNode(children).replace(/\n$/, '');
            const codeId = `code_${Math.random().toString(36).substr(2, 6)}`;

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-current/[0.07] text-inherit font-mono-code text-[12px] border border-current/15"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            // Interactive Mermaid Diagram
            if (match && match[1] === 'mermaid') {
              return <MermaidBlock chart={rawCode} />;
            }

            return (
              <div className="relative my-4 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-50/80 dark:bg-[#121215] shadow-2xs group transition-colors">
                {/* Code Header Bar */}
                <div className="flex items-center justify-between px-3.5 py-1.5 bg-neutral-100/90 dark:bg-[#1a1a1f] border-b border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono select-none transition-colors">
                  <span className="text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-[10px] font-semibold">
                    {match ? match[1] : 'code'}
                  </span>
                  <button
                    onClick={() => handleCopyCode(rawCode, codeId)}
                    className="flex items-center gap-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCodeId === codeId ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-600 dark:text-emerald-400 text-[10px]">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Code Body */}
                <pre className="p-4 overflow-x-auto whitespace-pre max-w-full text-[12px] font-mono-code leading-relaxed text-neutral-800 dark:text-neutral-200">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              {children}
            </a>
          ),

          // Custom High-Quality Images & Captions (supports short image:// IndexedDB URLs)
          img: (imgProps: any) => (
            <MarkdownImage {...imgProps} onOpenLightbox={setActiveLightboxImage} />
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-6 border-neutral-200 dark:border-neutral-800" />
          )
        }}
      >
        {sanitizedMarkdownBody}
      </ReactMarkdown>

      {/* Lightbox Zoom Modal */}
      {activeLightboxImage && (
        <div
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 cursor-zoom-out animate-in fade-in duration-150"
        >
          <button
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800/80 text-white hover:bg-neutral-700 transition-colors cursor-pointer"
            title="Close image view (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="max-w-5xl max-h-[90vh] flex flex-col items-center">
            <img
              src={activeLightboxImage.src}
              alt={activeLightboxImage.alt || 'Full size preview'}
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {activeLightboxImage.title && (
              <p className="text-sm text-neutral-300 mt-3 font-medium bg-neutral-900/80 px-4 py-1.5 rounded-full">
                {activeLightboxImage.title}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

MarkdownPreview.displayName = 'MarkdownPreview';

