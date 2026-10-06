import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ExternalLink, Link2, WifiOff, Loader2, Play, Globe } from 'lucide-react';
import { getLinkPreview, LinkPreviewData } from '../../services/linkPreviewService';

interface LinkHoverCardProps {
  url: string;
  targetRect: DOMRect | null;
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

/**
 * Twitter / X Blue Verified Checkmark Badge
 */
const VerifiedBadge: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={`${className} text-[#1D9BF0] fill-current shrink-0 inline-block align-middle`}
    viewBox="0 0 24 24"
    aria-label="Verified account"
  >
    <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.79-4-4-4-.495 0-.965.084-1.4.238C14.55 2.475 13.18 1.6 11.6 1.6c-1.58 0-2.95.875-3.6 2.148-.435-.154-.905-.238-1.4-.238-2.21 0-4 1.79-4 4 0 .495.084.965.238 1.4C1.575 9.55.7 10.92.7 12.5c0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.79 4 4 4 .495 0 .965-.084 1.4-.238.65 1.273 2.02 2.148 3.6 2.148 1.58 0 2.95-.875 3.6-2.148.435.154.905.238 1.4.238 2.21 0 4-1.79 4-4 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.02 4.08l-3.56-3.56 1.41-1.41 2.15 2.15 5.56-5.56 1.41 1.41-6.97 6.97z" />
  </svg>
);

/**
 * YouTube SVG Icon
 */
const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={`${className} text-[#FF0000] fill-current shrink-0`} viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

/**
 * Helper to produce a clean URL display string (e.g. x.com/username)
 */
function getDisplayUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname !== '/' ? parsed.pathname : '';
    return `${domain}${path}`;
  } catch {
    return url.replace(/^https?:\/\//, '');
  }
}

/**
 * X (formerly Twitter) Profile Card (Image 1 UX: banner, overlapping avatar, handle, bio, url pill + button)
 */
const XProfileCard: React.FC<{
  data: LinkPreviewData;
  url: string;
  onOpen: (e: React.MouseEvent) => void;
}> = ({ data, url, onOpen }) => {
  const [bannerFailed, setBannerFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayUrl = getDisplayUrl(url);
  const handle = data.handle || `@${data.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`;
  const displayName = data.name || data.title.split('(')[0].trim() || 'X User';
  const bio = data.description || 'View profile, thoughts, and media on X.';
  const avatarSrc = data.avatar || data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8257F5&color=fff&size=160&bold=true`;

  return (
    <div className="flex flex-col">
      {/* Banner Area */}
      <div className="relative w-full h-28 bg-neutral-900 overflow-hidden">
        {data.banner && !bannerFailed ? (
          <img
            src={data.banner}
            alt="Profile banner"
            onError={() => setBannerFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* Confirmed Aesthetic Fallback Banner (twilight sunset gradient atmosphere) */
          <div className="w-full h-full bg-gradient-to-r from-[#3b2d71] via-[#63489e] to-[#c87974] relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-200 via-purple-300 to-transparent" />
            <div className="absolute right-4 top-3 text-[11px] font-mono text-white/50 tracking-wider">
              ✦ ✦
            </div>
          </div>
        )}
      </div>

      {/* Profile Header Row (Avatar overlapping banner bottom left + Name/Handle on right) */}
      <div className="px-5 relative flex items-start gap-3.5">
        {/* Overlapping Circular Avatar */}
        <div className="-mt-9 shrink-0 relative z-10">
          <img
            src={!avatarFailed ? avatarSrc : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8257F5&color=fff&size=160&bold=true`}
            alt={displayName}
            onError={() => setAvatarFailed(true)}
            className="w-[68px] h-[68px] rounded-full object-cover border-[3.5px] border-white dark:border-[#18181c] shadow-md bg-neutral-100 dark:bg-neutral-800"
          />
        </div>

        {/* Name, Verified Badge & Handle */}
        <div className="pt-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={onOpen}
              className="font-bold text-[16px] text-neutral-900 dark:text-white truncate leading-tight hover:text-brand-500 cursor-pointer transition-colors"
            >
              {displayName}
            </h4>
            <VerifiedBadge className="w-4 h-4" />
          </div>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium truncate leading-snug mt-0.5">
            {handle}
          </p>
        </div>
      </div>

      {/* Bio / Description */}
      <div className="px-5 pt-3 pb-3">
        <p className="text-[12.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-3">
          {bio}
        </p>
      </div>

      {/* Bottom Action Area (Left: URL Pill | Right: Visit Profile Button) */}
      <div className="px-5 pb-4 pt-1 flex items-center gap-2">
        <div
          onClick={onOpen}
          className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-xl px-3 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2 cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-700/40"
          title={url}
        >
          <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate font-mono text-[11.5px]">{displayUrl}</span>
        </div>

        <button
          onClick={onOpen}
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-[12px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <span>Visit Profile</span>
          <span className="text-[13px] leading-none">→</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Instagram Profile Card (Image 2 UX: centered avatar with sparkles, centered name/handle, full-width pill + button)
 */
const InstagramProfileCard: React.FC<{
  data: LinkPreviewData;
  url: string;
  onOpen: (e: React.MouseEvent) => void;
}> = ({ data, url, onOpen }) => {
  const [avatarFailed, setAvatarFailed] = useState(false);

  const displayUrl = getDisplayUrl(url);
  const handle = data.handle || `@${data.name?.toLowerCase().replace(/\s+/g, '') || 'user'}`;
  const displayName = data.name || data.title.split('(')[0].trim() || 'Instagram User';
  const bio = data.description || 'View photos, reels, and stories shared on Instagram.';
  const avatarSrc = data.avatar || data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8257F5&color=fff&size=160&bold=true`;

  return (
    <div className="flex flex-col items-center px-6 pt-7 pb-5 text-center">
      {/* Centered Avatar with Playful Sparkle Accents */}
      <div className="relative inline-block mb-3">
        {/* Top-left Sparkle Star */}
        <span className="absolute -top-1 -left-3 text-brand-400 dark:text-brand-300 text-sm select-none animate-pulse">
          ✦
        </span>
        {/* Top-right subtle accent lines */}
        <span className="absolute -top-2 -right-2 text-neutral-400 dark:text-neutral-500 text-xs font-mono select-none">
          彡
        </span>
        {/* Bottom-right Sparkle Star */}
        <span className="absolute bottom-2 -right-4 text-brand-400 dark:text-brand-300 text-xs select-none">
          ✦
        </span>

        {/* Circular Avatar */}
        <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 shadow-md">
          <img
            src={!avatarFailed ? avatarSrc : `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8257F5&color=fff&size=160&bold=true`}
            alt={displayName}
            onError={() => setAvatarFailed(true)}
            className="w-full h-full rounded-full object-cover border-2 border-white dark:border-[#18181c] bg-white dark:bg-neutral-800"
          />
        </div>
      </div>

      {/* Centered Name with Verified Badge */}
      <div className="flex items-center justify-center gap-1.5 w-full">
        <h4
          onClick={onOpen}
          className="font-bold text-[17px] text-neutral-900 dark:text-white truncate hover:text-brand-500 cursor-pointer transition-colors"
        >
          {displayName}
        </h4>
        <VerifiedBadge className="w-4 h-4" />
      </div>

      {/* Centered Handle */}
      <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
        {handle}
      </p>

      {/* Centered Bio */}
      <p className="text-[12.5px] text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2.5 px-1 line-clamp-3">
        {bio}
      </p>

      {/* Bottom Action Area: Full-width URL pill, then Full-width Visit Profile button */}
      <div className="w-full mt-4 flex flex-col gap-2.5">
        <div
          onClick={onOpen}
          className="w-full bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-xl px-3.5 py-2.5 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-700/40"
          title={url}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate font-mono text-[11.5px]">{displayUrl}</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0 ml-1.5" />
        </div>

        <button
          onClick={onOpen}
          className="w-full bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white text-[13px] font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
        >
          <span>Visit Profile</span>
          <span className="text-[14px] leading-none">→</span>
        </button>
      </div>
    </div>
  );
};

/**
 * YouTube Video & Channel Card (Rich 16:9 thumbnail, Play overlay, Watch Video action)
 */
const YouTubeCard: React.FC<{
  data: LinkPreviewData;
  url: string;
  onOpen: (e: React.MouseEvent) => void;
}> = ({ data, url, onOpen }) => {
  const [thumbFailed, setThumbFailed] = useState(false);
  const displayUrl = getDisplayUrl(url);
  const isVideo = data.mediaType === 'video';

  if (isVideo) {
    const thumbUrl = data.banner || data.image || `https://i.ytimg.com/vi/default/hqdefault.jpg`;
    return (
      <div className="flex flex-col">
        {/* 16:9 Video Thumbnail with Play Button Overlay */}
        <div
          onClick={onOpen}
          className="relative w-full aspect-video bg-neutral-950 overflow-hidden cursor-pointer group"
        >
          {!thumbFailed ? (
            <img
              src={thumbUrl}
              alt={data.title}
              onError={() => setThumbFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-neutral-900 flex items-center justify-center">
              <YouTubeIcon className="w-12 h-12 opacity-40" />
            </div>
          )}

          {/* YouTube Top Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-sm">
            <YouTubeIcon className="w-3 h-3" />
            <span>YouTube</span>
          </div>

          {/* Translucent Play Overlay Button */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
            <div className="w-11 h-11 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Video Title & Creator */}
        <div className="px-5 pt-3 pb-2">
          <h4
            onClick={onOpen}
            className="font-bold text-[13.5px] text-neutral-900 dark:text-white line-clamp-2 leading-snug hover:text-red-600 dark:hover:text-red-400 cursor-pointer transition-colors"
          >
            {data.title}
          </h4>
          <p className="text-[12px] text-neutral-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 mt-1.5">
            <YouTubeIcon className="w-3.5 h-3.5" />
            <span className="truncate">{data.authorName || 'YouTube Creator'}</span>
          </p>
        </div>

        {/* Action Bar */}
        <div className="px-5 pb-4 pt-1 flex items-center gap-2">
          <div
            onClick={onOpen}
            className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-xl px-3 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2 cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-700/40"
            title={url}
          >
            <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="truncate font-mono text-[11.5px]">{displayUrl}</span>
          </div>

          <button
            onClick={onOpen}
            className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[12px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
          >
            <span>Watch Video</span>
            <span className="text-[13px] leading-none">→</span>
          </button>
        </div>
      </div>
    );
  }

  // YouTube Channel Card
  const channelName = data.name || data.authorName || 'YouTube Channel';
  const handle = data.handle || `@${channelName.toLowerCase().replace(/\s+/g, '')}`;
  const avatarSrc = data.avatar || data.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(channelName)}&background=FF0000&color=fff&size=160&bold=true`;

  return (
    <div className="flex flex-col">
      {/* Header Banner */}
      <div className="w-full h-20 bg-gradient-to-r from-red-600 via-rose-600 to-red-800 relative overflow-hidden flex items-center justify-between px-4">
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full text-white text-[10px] font-semibold">
          <YouTubeIcon className="w-3.5 h-3.5" />
          <span>Channel</span>
        </div>
      </div>

      {/* Channel Avatar & Info */}
      <div className="px-5 relative flex items-start gap-3.5">
        <div className="-mt-7 shrink-0 relative z-10">
          <img
            src={avatarSrc}
            alt={channelName}
            className="w-16 h-16 rounded-full object-cover border-[3.5px] border-white dark:border-[#18181c] shadow-md bg-white dark:bg-neutral-800"
          />
        </div>
        <div className="pt-2 min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4
              onClick={onOpen}
              className="font-bold text-[16px] text-neutral-900 dark:text-white truncate leading-tight hover:text-red-600 cursor-pointer transition-colors"
            >
              {channelName}
            </h4>
            <VerifiedBadge className="w-4 h-4" />
          </div>
          <p className="text-[13px] text-neutral-500 dark:text-neutral-400 font-medium truncate mt-0.5">
            {handle}
          </p>
        </div>
      </div>

      <div className="px-5 pt-3 pb-3">
        <p className="text-[12.5px] text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-2">
          {data.description || 'Watch official videos, music, and streams on YouTube.'}
        </p>
      </div>

      {/* Action Bar */}
      <div className="px-5 pb-4 pt-1 flex items-center gap-2">
        <div
          onClick={onOpen}
          className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-xl px-3 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2 cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-700/40"
          title={url}
        >
          <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate font-mono text-[11.5px]">{displayUrl}</span>
        </div>

        <button
          onClick={onOpen}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white text-[12px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <span>Visit Channel</span>
          <span className="text-[13px] leading-none">→</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Generic Web Card (Modernized fallback layout)
 */
const GenericWebCard: React.FC<{
  data: LinkPreviewData;
  url: string;
  onOpen: (e: React.MouseEvent) => void;
}> = ({ data, url, onOpen }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const displayUrl = getDisplayUrl(url);

  return (
    <div className="flex flex-col">
      {/* Optional Top Media Banner */}
      {data.image && !imageFailed && (
        <div className="w-full h-28 overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={data.image}
            alt={data.title}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="px-5 pt-3.5 pb-2">
        {/* Domain & Favicon */}
        <div className="flex items-center gap-1.5 mb-1.5">
          {data.favicon ? (
            <img src={data.favicon} alt="" className="w-3.5 h-3.5 rounded-xs shrink-0" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          )}
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide truncate">
            {data.domain}
          </span>
        </div>

        {/* Title */}
        <h4
          onClick={onOpen}
          className="font-bold text-[14px] text-neutral-900 dark:text-white line-clamp-2 leading-snug hover:text-brand-500 cursor-pointer transition-colors"
        >
          {data.title || displayUrl}
        </h4>

        {/* Description */}
        {data.description && (
          <p className="text-[12px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed mt-1">
            {data.description}
          </p>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-5 pb-4 pt-1 flex items-center gap-2">
        <div
          onClick={onOpen}
          className="flex-1 min-w-0 bg-neutral-100 dark:bg-neutral-800/80 hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 rounded-xl px-3 py-2 text-[12px] text-neutral-600 dark:text-neutral-300 flex items-center gap-2 cursor-pointer transition-colors border border-neutral-200/40 dark:border-neutral-700/40"
          title={url}
        >
          <Link2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="truncate font-mono text-[11.5px]">{displayUrl}</span>
        </div>

        <button
          onClick={onOpen}
          className="bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-[12px] font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0"
        >
          <span>Visit Site</span>
          <span className="text-[13px] leading-none">→</span>
        </button>
      </div>
    </div>
  );
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

  // Sizing & Positioning calculations with edge clamping
  const CARD_WIDTH = 340;
  const ESTIMATED_HEIGHT = 280;
  const PADDING = 14;

  let top = targetRect.bottom + 10;
  // If card overflows bottom of viewport, flip to render above the link
  if (top + ESTIMATED_HEIGHT > window.innerHeight - PADDING) {
    top = Math.max(PADDING, targetRect.top - ESTIMATED_HEIGHT - 10);
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
      className="rounded-3xl bg-white dark:bg-[#18181c] border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xl overflow-hidden text-neutral-900 dark:text-neutral-100 select-none animate-in fade-in zoom-in-95 duration-150 transition-all pointer-events-auto"
    >
      {/* Offline Status Badge */}
      {data?.isOfflineFallback && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1 flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
          <WifiOff className="w-3 h-3" />
          <span>Offline preview (cached or offline fallback)</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !data ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-xs text-neutral-400 font-mono">
          <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
          <span>Fetching preview...</span>
        </div>
      ) : (
        /* App-Specific Bespoke Card Views */
        <>
          {data?.platform === 'x' ? (
            <XProfileCard data={data} url={url} onOpen={handleOpenLink} />
          ) : data?.platform === 'instagram' ? (
            <InstagramProfileCard data={data} url={url} onOpen={handleOpenLink} />
          ) : data?.platform === 'youtube' ? (
            <YouTubeCard data={data} url={url} onOpen={handleOpenLink} />
          ) : (
            <GenericWebCard data={data || {
              url,
              domain: 'web',
              title: url,
              platform: 'generic',
              isOfflineFallback: false,
              status: 'fallback'
            }} url={url} onOpen={handleOpenLink} />
          )}
        </>
      )}
    </div>,
    document.body
  );
};
