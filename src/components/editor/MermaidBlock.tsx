import React, { useEffect, useState, useRef } from 'react';
import { useThemeStore } from '../../stores/useThemeStore';
import { GitBranch, AlertCircle, Copy, Check, Loader2 } from 'lucide-react';

interface MermaidBlockProps {
  chart: string;
  forceTheme?: 'light' | 'dark';
}

// Module-level cache to ensure identical diagrams are compiled at most ONCE per session
const mermaidSvgCache = new Map<string, string>();

let mermaidModulePromise: Promise<any> | null = null;
const getMermaid = async () => {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import('mermaid').then((m) => m.default);
  }
  return mermaidModulePromise;
};

// Clean up any stray error elements Mermaid injects into document.body on parse errors
const cleanupMermaidArtifacts = () => {
  try {
    const errorContainers = document.querySelectorAll('div[id^="dmermaid"], svg[id^="mermaid-"]');
    errorContainers.forEach((el) => {
      if (el.parentNode && el.parentNode === document.body) {
        el.parentNode.removeChild(el);
      }
    });
  } catch {
    // Ignore DOM cleanup errors
  }
};

const MermaidBlockComponent: React.FC<MermaidBlockProps> = ({ chart, forceTheme }) => {
  const { isDark } = useThemeStore();
  const effectiveIsDark = forceTheme ? forceTheme === 'dark' : isDark;
  const trimmedChart = chart.trim();
  const cacheKey = `${effectiveIsDark ? 'dark' : 'light'}::${trimmedChart}`;

  // Initialize immediately from cache if available (0ms latency, zero compilation)
  const [svgContent, setSvgContent] = useState<string>(() => mermaidSvgCache.get(cacheKey) || '');
  const [isDebouncing, setIsDebouncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const chartIdRef = useRef(`mermaid_${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // 1. If already in cache for this theme, set immediately and exit
    const cached = mermaidSvgCache.get(cacheKey);
    if (cached) {
      setSvgContent(cached);
      setError(null);
      setIsDebouncing(false);
      return;
    }

    if (!trimmedChart) {
      setSvgContent('');
      setError(null);
      return;
    }

    // 2. Debounce compilation by 350ms to prevent compiling on every keystroke
    setIsDebouncing(true);
    let isCancelled = false;

    const timeoutId = setTimeout(async () => {
      try {
        const mermaid = await getMermaid();
        mermaid.initialize({
          startOnLoad: false,
          theme: effectiveIsDark ? 'dark' : 'default',
          themeVariables: effectiveIsDark ? {
            darkMode: true,
            background: 'transparent',
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#64748b',
            lineColor: '#cbd5e1',
            secondaryColor: '#1e1b4b',
            tertiaryColor: '#1e293b',
            mainBkg: '#1e293b',
            nodeBorder: '#64748b',
            clusterBkg: '#0f172a',
            clusterBorder: '#334155',
            defaultLinkColor: '#cbd5e1',
            titleColor: '#f8fafc',
            edgeLabelBackground: '#1e293b',
            nodeTextColor: '#f8fafc',
            actorTextColor: '#f8fafc',
            actorBkg: '#1e293b',
            actorBorder: '#64748b',
            signalColor: '#cbd5e1',
            signalTextColor: '#f8fafc',
          } : {
            darkMode: false,
            background: 'transparent',
            primaryColor: '#ffffff',
            primaryTextColor: '#0f172a',
            primaryBorderColor: '#94a3b8',
            lineColor: '#475569',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#ffffff',
            mainBkg: '#ffffff',
            nodeBorder: '#94a3b8',
            clusterBkg: '#f8fafc',
            clusterBorder: '#cbd5e1',
            defaultLinkColor: '#475569',
            titleColor: '#0f172a',
            edgeLabelBackground: '#ffffff',
            nodeTextColor: '#0f172a',
            actorTextColor: '#0f172a',
            actorBkg: '#ffffff',
            actorBorder: '#94a3b8',
            signalColor: '#334155',
            signalTextColor: '#0f172a',
          },
          securityLevel: 'strict',
          fontFamily: 'inherit',
          suppressErrorRendering: true,
          flowchart: {
            htmlLabels: true,
            useMaxWidth: true,
          },
        });

        // Unique render ID
        const renderId = `svg_${chartIdRef.current}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, trimmedChart);

        if (!isCancelled) {
          mermaidSvgCache.set(cacheKey, svg);
          setSvgContent(svg);
          setError(null);
          setIsDebouncing(false);
        }
      } catch (err: any) {
        cleanupMermaidArtifacts();
        if (!isCancelled) {
          // If we already have a working SVG, keep showing it while typing instead of breaking the UI
          if (!svgContent) {
            setError(err?.message || 'Mermaid diagram syntax error. Continue typing...');
          }
          setIsDebouncing(false);
        }
      }
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [cacheKey, trimmedChart, effectiveIsDark, svgContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // If there is an error and no previous valid SVG to display
  if (error && !svgContent) {
    return (
      <div className="my-4 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20 text-xs select-none">
        <div className="flex items-center justify-between gap-2 mb-2 text-red-700 dark:text-red-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>Mermaid Syntax Warning</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer flex items-center gap-1"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy code'}</span>
          </button>
        </div>
        <pre className="p-3 rounded-lg bg-white dark:bg-neutral-900 border border-red-200/60 dark:border-red-900/30 overflow-x-auto text-[11px] font-mono-code text-red-600 dark:text-red-300">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="my-4 rounded-2xl border border-current/15 bg-current/[0.03] text-inherit p-4 sm:p-6 overflow-hidden flex flex-col items-center group relative shadow-2xs transition-colors select-none">
      {/* Header Bar with Live Status */}
      <div className="w-full flex items-center justify-between text-[11px] opacity-75 mb-3 pb-2 border-b border-current/10 no-print">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-inherit">
          <GitBranch className="w-3.5 h-3.5 text-indigo-500" />
          <span>Interactive Flowchart</span>
          {isDebouncing && (
            <span className="flex items-center gap-1 text-[9px] text-amber-500 font-sans normal-case">
              <Loader2 className="w-2.5 h-2.5 animate-spin" />
              <span>Updating...</span>
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
          title="Copy Mermaid source"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          <span className="text-[10px]">{copied ? 'Copied' : 'Source'}</span>
        </button>
      </div>

      {/* Render Area */}
      {!svgContent ? (
        <div className="w-full flex items-center justify-center py-8 text-neutral-400 gap-2 text-xs font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Rendering diagram...</span>
        </div>
      ) : (
        <div 
          className="mermaid-render-container w-full overflow-x-auto flex justify-center py-2 [&>svg]:max-w-full [&>svg]:h-auto transition-opacity duration-150"
          style={{ opacity: isDebouncing ? 0.75 : 1 }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};

// Strict React.memo comparison: if chart string & forceTheme are identical, SKIP re-rendering completely
export const MermaidBlock = React.memo(
  MermaidBlockComponent,
  (prev, next) => prev.chart.trim() === next.chart.trim() && prev.forceTheme === next.forceTheme
);
