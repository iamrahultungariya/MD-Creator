import React, { useRef, useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Sparkles, 
  FileText, 
  Clock, 
  Calendar,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';

interface SocialCardGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  slug?: string;
  authorName?: string;
  onToast?: (message: string) => void;
}

export const SocialCardGeneratorModal: React.FC<SocialCardGeneratorModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  slug,
  authorName = 'MD Writer Author',
  onToast,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  if (!isOpen) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));
  const publishDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const publicUrl = slug
    ? `${window.location.origin}/p/${slug}`
    : window.location.href;

  const displayTitle = title.replace(/\.md$/i, '') || 'Untitled Document';

  // 1. Download 1200x630 PNG
  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2, // High DPI (2400x1260)
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.download = `${slug || 'md-writer-card'}-preview.png`;
      link.href = dataUrl;
      link.click();
      onToast?.('🖼️ Social Card downloaded successfully!');
    } catch (err) {
      console.error('Failed to export social card image:', err);
      onToast?.('Failed to generate image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // 2. Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    setIsCopyingImage(true);
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      if (blob && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        onToast?.('📋 Social Card image copied to clipboard!');
      } else {
        onToast?.('Image clipboard copying not supported on this browser.');
      }
    } catch (err) {
      console.error('Failed to copy card image to clipboard:', err);
      onToast?.('Could not copy image. Try downloading instead.');
    } finally {
      setIsCopyingImage(false);
    }
  };

  // 3. Share to Twitter / X
  const handleShareTwitter = () => {
    const tweetText = `Just wrote "${displayTitle}" using MD Writer! ✍️\n\n`;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(publicUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // 4. Share to LinkedIn
  const handleShareLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  // 5. Copy Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setIsLinkCopied(true);
    onToast?.('🔗 Link copied to clipboard!');
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-2">
            {/* Mac Traffic Lights */}
            <div className="flex items-center gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
            </div>
            <Sparkles className="w-4 h-4 text-[#8257F5]" />
            <h2 className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100">
              Branded Social Share Card
            </h2>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/20">
              1200 × 630 OG
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Generate an Apple &amp; Linear-grade 1200x630 social preview card for Twitter, LinkedIn, and Discord.
          </p>

          {/* PREVIEW CONTAINER (Scales smoothly to fit card) */}
          <div className="w-full flex items-center justify-center p-2 rounded-xl bg-neutral-100 dark:bg-black/40 border border-neutral-200/80 dark:border-neutral-800/80 overflow-hidden shadow-inner">
            {/* The actual 1200x630 Card to capture */}
            <div
              ref={cardRef}
              style={{
                width: '600px',
                height: '315px',
                aspectRatio: '1200 / 630',
              }}
              className="relative shrink-0 rounded-xl overflow-hidden bg-[#0D0B14] text-white p-7 flex flex-col justify-between select-none shadow-2xl border border-[#2D2640]"
            >
              {/* Radial Glow Gradient */}
              <div 
                className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none opacity-40 blur-3xl"
                style={{ background: 'radial-gradient(circle, #8257F5 0%, transparent 70%)' }}
              />
              <div 
                className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full pointer-events-none opacity-30 blur-3xl"
                style={{ background: 'radial-gradient(circle, #4F46E5 0%, transparent 70%)' }}
              />

              {/* Card Header: Brand Logo & Traffic Lights */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo.png" 
                    alt="MD Writer Logo" 
                    className="w-8 h-8 rounded-lg object-contain shadow-md shadow-brand-500/20" 
                  />
                  <div>
                    <span className="font-bold text-xs tracking-tight text-white/95">
                      MD Writer Studio
                    </span>
                    <span className="block text-[9px] font-mono text-[#A892FF] opacity-90">
                      The Modern Markdown Studio
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-300 backdrop-blur-sm">
                  <Calendar className="w-3 h-3 text-[#A892FF]" />
                  <span>{publishDate}</span>
                </div>
              </div>

              {/* Card Center: Title & Excerpt */}
              <div className="relative z-10 my-auto py-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white leading-tight line-clamp-2 drop-shadow-md">
                  {displayTitle}
                </h1>
                <p className="mt-2 text-xs text-neutral-300/90 font-normal line-clamp-2 leading-relaxed">
                  {content.replace(/[#*`_~[\]()-]/g, '').trim().slice(0, 160) || 'An expressive, distraction-free document written in MD Writer.'}
                </p>
              </div>

              {/* Card Footer: Metadata & Pill Badges */}
              <div className="relative z-10 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-300">
                    <Clock className="w-3.5 h-3.5 text-[#A892FF]" />
                    <span>{readingTime} min read</span>
                  </div>
                  <span className="text-white/20">•</span>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-neutral-300">
                    <FileText className="w-3.5 h-3.5 text-[#A892FF]" />
                    <span>{wordCount.toLocaleString()} words</span>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-md bg-[#8257F5]/20 border border-[#8257F5]/40 text-[10px] font-mono font-bold text-[#C7B5FF] tracking-wide">
                  {authorName}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadImage}
              className="py-2.5 px-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>Download PNG</span>
            </button>

            <button
              type="button"
              disabled={isCopyingImage}
              onClick={handleCopyImage}
              className="py-2.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80 disabled:opacity-50"
            >
              {isCopyingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>Copy Image</span>
            </button>

            <button
              type="button"
              onClick={handleShareTwitter}
              className="py-2.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-500" />
              <span>Share on X</span>
            </button>

            <button
              type="button"
              onClick={handleShareLinkedIn}
              className="py-2.5 px-3 rounded-lg bg-neutral-100 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700/80"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>LinkedIn</span>
            </button>
          </div>

          {/* Copy Link Option */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200/70 dark:border-neutral-800 text-xs">
            <span className="font-mono text-[11px] text-neutral-500 truncate max-w-[340px]">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-neutral-200/70 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              {isLinkCopied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{isLinkCopied ? 'Copied' : 'Copy URL'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
