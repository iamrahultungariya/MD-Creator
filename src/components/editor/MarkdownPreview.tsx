import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';
import { resolveImageSrc, getCachedImageSrc } from '../../services/imageStorageService';
import { sanitizeMarkdownForPreview } from '../../utils/markdownSanitizer';
import { 
  Copy, 
  Check, 
  Info, 
  Lightbulb, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { MermaidBlock } from './MermaidBlock';
import { replaceEmojisInReactNode } from '../../utils/appleEmoji';
import { FrontmatterCard } from './FrontmatterCard';

interface MarkdownPreviewProps {
  content: string;
  onToggleTask?: (taskIndex: number, currentChecked: boolean) => void;
}

// Helper to recursively extract plain text from React elements/AST
const extractTextFromReactNode = (node: React.ReactNode): string => {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(extractTextFromReactNode).join('');
  }
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    return props?.children ? extractTextFromReactNode(props.children) : '';
  }
  return '';
};

// Convert heading plain text to slug for outline jump synchronization
const toHeadingSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');
};

interface AlertCalloutConfig {
  type: 'note' | 'tip' | 'warning' | 'important' | 'caution';
  title: string;
  icon: React.ElementType;
  borderColor: string;
  backgroundColor: string;
  darkBackgroundColor: string;
  badgeBg: string;
  badgeColor: string;
  containerClass: string;
  badgeClass: string;
  titleClass: string;
  iconClass: string;
}

const ALERT_CONFIGS: Record<string, AlertCalloutConfig> = {
  note: {
    type: 'note',
    title: 'Note',
    icon: Info,
    borderColor: '#2563eb',
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    darkBackgroundColor: 'rgba(30, 58, 138, 0.25)',
    badgeBg: 'rgba(37, 99, 235, 0.15)',
    badgeColor: '#1d4ed8',
    containerClass: 'callout-alert-note text-blue-950 dark:text-blue-100',
    badgeClass: 'border border-blue-300/80 dark:border-blue-700/60',
    titleClass: 'text-blue-800 dark:text-blue-300 font-bold',
    iconClass: 'text-blue-600 dark:text-blue-400'
  },
  tip: {
    type: 'tip',
    title: 'Tip',
    icon: Lightbulb,
    borderColor: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.08)',
    darkBackgroundColor: 'rgba(6, 78, 59, 0.25)',
    badgeBg: 'rgba(5, 150, 105, 0.15)',
    badgeColor: '#047857',
    containerClass: 'callout-alert-tip text-emerald-950 dark:text-emerald-100',
    badgeClass: 'border border-emerald-300/80 dark:border-emerald-700/60',
    titleClass: 'text-emerald-800 dark:text-emerald-300 font-bold',
    iconClass: 'text-emerald-600 dark:text-emerald-400'
  },
  warning: {
    type: 'warning',
    title: 'Warning',
    icon: AlertTriangle,
    borderColor: '#d97706',
    backgroundColor: 'rgba(217, 119, 6, 0.08)',
    darkBackgroundColor: 'rgba(120, 53, 15, 0.25)',
    badgeBg: 'rgba(217, 119, 6, 0.15)',
    badgeColor: '#b45309',
    containerClass: 'callout-alert-warning text-amber-950 dark:text-amber-100',
    badgeClass: 'border border-amber-300/80 dark:border-amber-700/60',
    titleClass: 'text-amber-800 dark:text-amber-300 font-bold',
    iconClass: 'text-amber-600 dark:text-amber-400'
  },
  important: {
    type: 'important',
    title: 'Important',
    icon: Sparkles,
    borderColor: '#7c3aed',
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    darkBackgroundColor: 'rgba(76, 29, 149, 0.25)',
    badgeBg: 'rgba(124, 58, 237, 0.15)',
    badgeColor: '#6d28d9',
    containerClass: 'callout-alert-important text-purple-950 dark:text-purple-100',
    badgeClass: 'border border-purple-300/80 dark:border-purple-700/60',
    titleClass: 'text-purple-800 dark:text-purple-300 font-bold',
    iconClass: 'text-purple-600 dark:text-purple-400'
  },
  caution: {
    type: 'caution',
    title: 'Caution',
    icon: ShieldAlert,
    borderColor: '#e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.08)',
    darkBackgroundColor: 'rgba(136, 19, 55, 0.25)',
    badgeBg: 'rgba(225, 29, 72, 0.15)',
    badgeColor: '#be123c',
    containerClass: 'callout-alert-caution text-rose-950 dark:text-rose-100',
    badgeClass: 'border border-rose-300/80 dark:border-rose-700/60',
    titleClass: 'text-rose-800 dark:text-rose-300 font-bold',
    iconClass: 'text-rose-600 dark:text-rose-400'
  }
};

/**
 * Inspects blockquote children to find [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
 * Tolerates leading whitespace, newlines, and nested elements.
 */
const extractAlertInfo = (children: React.ReactNode): { config: AlertCalloutConfig; content: React.ReactNode } | null => {
  const childrenArray = React.Children.toArray(children);
  if (childrenArray.length === 0) return null;

  // Find the first meaningful child (skipping empty whitespace / newlines)
  let targetChildIndex = -1;
  for (let i = 0; i < childrenArray.length; i++) {
    const c = childrenArray[i];
    if (React.isValidElement(c)) {
      targetChildIndex = i;
      break;
    }
    if (typeof c === 'string' && c.trim().length > 0) {
      targetChildIndex = i;
      break;
    }
  }

  if (targetChildIndex === -1) return null;

  const targetChild = childrenArray[targetChildIndex];
  const innerText = React.isValidElement(targetChild)
    ? extractTextFromReactNode((targetChild.props as any)?.children).trimStart()
    : String(targetChild).trimStart();

  const match = innerText.match(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
  if (!match) return null;

  const alertType = match[1].toLowerCase();
  const config = ALERT_CONFIGS[alertType];
  if (!config) return null;

  // Strip "[!NOTE]" prefix from text
  const textWithoutMarker = innerText.replace(/^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i, '');

  let remainingTargetChild: React.ReactNode = null;
  if (textWithoutMarker.length > 0) {
    if (React.isValidElement(targetChild)) {
      remainingTargetChild = React.cloneElement(targetChild as React.ReactElement<any>, {
        children: textWithoutMarker
      });
    } else {
      remainingTargetChild = textWithoutMarker;
    }
  }

  const remainingChildren = [
    ...childrenArray.slice(0, targetChildIndex),
    remainingTargetChild,
    ...childrenArray.slice(targetChildIndex + 1)
  ].filter(Boolean);

  return { config, content: remainingChildren };
};

const MarkdownImage: React.FC<{
  src?: string;
  alt?: string;
  title?: string;
  onOpenLightbox: (data: { src: string; alt?: string; title?: string }) => void;
  [key: string]: any;
}> = ({ src = '', alt, title, onOpenLightbox, ...props }) => {
  // Pass through Apple iOS emoji images generated by replaceEmojisInReactNode
  if (props.className?.includes('apple-emoji')) {
    return <img src={src} alt={alt} {...props} />;
  }

  const [resolvedSrc, setResolvedSrc] = useState<string>(() => {
    return getCachedImageSrc(src) || src;
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (src.startsWith('image://') || src.startsWith('img_')) {
      return !getCachedImageSrc(src);
    }
    return false;
  });

  useEffect(() => {
    if (!src) return;
    if (src.startsWith('image://') || src.startsWith('img_')) {
      let isMounted = true;
      resolveImageSrc(src).then((res) => {
        if (isMounted) {
          setResolvedSrc(res);
          setIsLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    } else {
      setResolvedSrc(src);
      setIsLoading(false);
    }
  }, [src]);

  if (isLoading) {
    return (
      <figure className="my-5 inline-block max-w-full">
        <div className="w-64 h-36 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse flex items-center justify-center text-xs text-neutral-400 border border-neutral-200 dark:border-neutral-800">
          Loading image...
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-5 inline-block max-w-full">
      <img
        src={resolvedSrc}
        alt={alt || 'Embedded Markdown image'}
        title={title}
        loading="lazy"
        onClick={() => onOpenLightbox({ src: resolvedSrc, alt, title })}
        className="rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-sm max-w-full h-auto max-h-[550px] object-contain cursor-zoom-in hover:opacity-95 transition-all bg-neutral-50 dark:bg-neutral-900"
        onError={(e) => {
          const target = e.currentTarget;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent && !parent.querySelector('.img-error-fallback')) {
            const fallback = document.createElement('div');
            fallback.className = 'img-error-fallback p-3 rounded-xl border border-dashed border-rose-300 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2';
            fallback.innerHTML = `<span>⚠️ Could not load image: ${alt || src}</span>`;
            parent.appendChild(fallback);
          }
        }}
        {...props}
      />
      {title && (
        <figcaption className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-2 italic">
          {title}
        </figcaption>
      )}
    </figure>
  );
};

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, onToggleTask }) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [activeLightboxImage, setActiveLightboxImage] = useState<{ src: string; alt?: string; title?: string } | null>(null);

  // Parse opening YAML front matter if present
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const rawFrontmatter = frontmatterMatch ? frontmatterMatch[1] : null;
  const rawMarkdownBody = frontmatterMatch ? content.slice(frontmatterMatch[0].length) : content;

  // Sanitize math comparisons & unescaped tokens for rehype-raw
  const sanitizedMarkdownBody = useMemo(() => {
    return sanitizeMarkdownForPreview(rawMarkdownBody);
  }, [rawMarkdownBody]);

  const handleCopyCode = (codeText: string, id: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div data-markdown-preview="true" className="w-full text-neutral-800 dark:text-neutral-200 leading-relaxed text-sm select-text">
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
              <h1 id={id} data-heading="true" data-heading-text={plainText} className="text-2xl sm:text-3xl font-black text-neutral-950 dark:text-white mt-6 mb-3 tracking-tight pb-1.5 border-b border-neutral-100 dark:border-neutral-800 scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h1>
            );
          },
          h2: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h2 id={id} data-heading="true" data-heading-text={plainText} className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 mt-5 mb-2.5 tracking-tight scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h2>
            );
          },
          h3: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h3 id={id} data-heading="true" data-heading-text={plainText} className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-4 mb-2 scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h3>
            );
          },
          h4: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h4 id={id} data-heading="true" data-heading-text={plainText} className="text-base font-semibold text-neutral-900 dark:text-neutral-200 mt-3 mb-1.5 scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h4>
            );
          },
          h5: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h5 id={id} data-heading="true" data-heading-text={plainText} className="text-sm font-semibold text-neutral-800 dark:text-neutral-300 mt-2.5 mb-1 scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h5>
            );
          },
          h6: ({ children }) => {
            const plainText = extractTextFromReactNode(children);
            const id = toHeadingSlug(plainText);
            return (
              <h6 id={id} data-heading="true" data-heading-text={plainText} className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mt-2 mb-1 scroll-mt-6 transition-all duration-300">
                {replaceEmojisInReactNode(children)}
              </h6>
            );
          },

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3 text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {replaceEmojisInReactNode(children)}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-neutral-400 dark:marker:text-neutral-600">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-neutral-400 dark:marker:text-neutral-600">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {replaceEmojisInReactNode(children)}
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
                    {replaceEmojisInReactNode(alertContent)}
                  </div>
                </div>
              );
            }

            // Standard Quote
            return (
              <blockquote className="border-l-4 border-neutral-300 dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-900/40 p-4 my-3.5 rounded-r-2xl text-neutral-700 dark:text-neutral-300 italic shadow-2xs">
                {replaceEmojisInReactNode(children)}
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

          // Tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              <table className="w-full text-left text-xs divide-y divide-neutral-200 dark:divide-neutral-800">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-neutral-50 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold uppercase tracking-wider text-[10px]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-bold border-b border-neutral-200 dark:border-neutral-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/60">
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
                  className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-amber-300 font-mono-code text-[12px] border border-neutral-200 dark:border-neutral-700/60"
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
                <pre className="p-4 overflow-x-auto text-[12px] font-mono-code leading-relaxed text-neutral-800 dark:text-neutral-200">
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
              rel="noreferrer"
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
};
