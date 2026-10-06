import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Globe, WifiOff, Loader2 } from 'lucide-react';
import { getLinkPreview, LinkPreviewData, RecognizedPlatform } from '../../services/linkPreviewService';

interface LinkHoverCardProps {
  url: string;
  targetRect: DOMRect | null;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

export const PlatformBadgeIcon: React.FC<{ platform: RecognizedPlatform }> = ({ platform }) => {
  switch (platform) {
    case 'youtube':
      return (
        <svg className="w-3.5 h-3.5 text-red-600 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case 'x':
      return (
        <svg className="w-3 h-3 text-neutral-900 dark:text-white fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      );
    case 'threads':
      return (
        <svg className="w-3 h-3 text-neutral-900 dark:text-white fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.186 24C5.467 24 0 18.533 0 11.814 0 5.094 5.467 0 12.186 0c6.719 0 12.186 5.094 12.186 11.814 0 .545-.04 1.082-.12 1.608h-4.34c.036-.312.054-.628.054-.95 0-4.305-3.485-7.79-7.78-7.79-4.296 0-7.78 3.485-7.78 7.79 0 4.304 3.484 7.789 7.78 7.789 2.502 0 4.708-1.183 6.108-3.003l3.473 2.577C19.743 22.25 16.208 24 12.186 24z"/>
        </svg>
      );
    case 'github':
      return (
        <svg className="w-3.5 h-3.5 text-neutral-900 dark:text-white fill-current shrink-0" viewBox="0 0 24 24">
          <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
        </svg>
      );
    case 'generic':
    default:
      return <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />;
  }
};

export const LinkHoverCard: React.FC<LinkHoverCardProps> = ({
  url,
  targetRect,
  isOpen,
  onMouseEnter,
  onMouseLeave,
  onClose: _onClose,
}) => {
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !url) return;
    let isMounted = true;
    setIsLoading(true);

    getLinkPreview(url).then((resolved) => {
      if (isMounted) {
        setData(resolved);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isOpen, url]);

  if (!isOpen || !targetRect) return null;

  // Position calculation with viewport edge clamping
  const CARD_WIDTH = 300;
  const ESTIMATED_HEIGHT = 160;
  const PADDING = 12;

  let top = targetRect.bottom + 8;
  // If card overflows bottom of viewport, flip to render above the link
  if (top + ESTIMATED_HEIGHT > window.innerHeight - PADDING) {
    top = Math.max(PADDING, targetRect.top - ESTIMATED_HEIGHT - 8);
  }

  let left = targetRect.left;
  // Clamp horizontally so card never bleeds off right or left edge of screen
  if (left + CARD_WIDTH > window.innerWidth - PADDING) {
    left = window.innerWidth - CARD_WIDTH - PADDING;
  }
  if (left < PADDING) {
    left = PADDING;
  }

  const handleOpenLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer,nofollow,ugc');
  };

  return createPortal(
    <div
      ref={cardRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${CARD_WIDTH}px`,
        zIndex: 99999,
      }}
      className="rounded-2xl bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl p-3 text-neutral-900 dark:text-neutral-100 select-none animate-in fade-in zoom-in-95 duration-150 transition-all pointer-events-auto"
    >
      {/* Top Header: Platform Identity & Domain */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800/80">
        <div className="flex items-center gap-1.5 min-w-0">
          <PlatformBadgeIcon platform={data?.platform || 'generic'} />
          <span className="text-[11px] font-semibold truncate text-neutral-700 dark:text-neutral-300">
            {data?.domain || 'Web Link'}
          </span>
          {data?.isOfflineFallback && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 shrink-0">
              <WifiOff className="w-2.5 h-2.5" />
              <span>Offline</span>
            </span>
          )}
        </div>

        <button
          onClick={handleOpenLink}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Body: Live Media Preview or Synthetic Platform Card */}
      {isLoading && !data ? (
        <div className="py-6 flex items-center justify-center gap-2 text-xs text-neutral-400 font-mono">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-500" />
          <span>Fetching preview...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Specialized X Profile Layout vs Standard OpenGraph Banner */}
          {data?.platform === 'x' && data?.image ? (
            <div className="flex items-start gap-3 pt-0.5 pb-1">
              <img
                src={data.image}
                alt={data.title}
                className="w-12 h-12 rounded-full object-cover shrink-0 border border-neutral-200 dark:border-neutral-700 shadow-2xs"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="min-w-0 flex-1">
                <h5 
                  onClick={handleOpenLink}
                  className="text-xs font-bold leading-snug line-clamp-1 text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
                >
                  {data.title}
                </h5>
                {data.description && (
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed mt-1">
                    {data.description}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Optional OpenGraph Banner Image */}
              {data?.image && (
                <div className="w-full h-28 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-700/50">
                  <img
                    src={data.image}
                    alt={data.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget.parentElement as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Title */}
              <h5 
                onClick={handleOpenLink}
                className="text-xs font-bold leading-snug line-clamp-2 text-neutral-900 dark:text-neutral-100 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
              >
                {data?.title || url}
              </h5>

              {/* Description */}
              {data?.description && (
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {data.description}
                </p>
              )}
            </>
          )}

          {/* Footer Action Bar */}
          <div className="pt-1.5 flex items-center justify-between text-[10px] text-neutral-400">
            <span className="truncate max-w-[190px] font-mono opacity-75">
              {url.replace(/^https?:\/\//, '')}
            </span>
            <button
              onClick={handleOpenLink}
              className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
            >
              <span>Visit</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
