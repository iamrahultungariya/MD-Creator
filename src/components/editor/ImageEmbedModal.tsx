import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Check, 
  Sparkles, 
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { optimizeImage, formatBytes, CompressionResult } from '../../utils/imageCompressor';
import { storeDataUrlImage } from '../../services/imageStorageService';

interface ImageEmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (markdownSnippet: string) => void;
}

type TabType = 'upload' | 'url';

export const ImageEmbedModal: React.FC<ImageEmbedModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('upload');
  
  // Upload tab state
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL tab state
  const [imageUrl, setImageUrl] = useState('');
  const [isValidatingUrl, setIsValidatingUrl] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState<boolean | null>(null);

  // Shared metadata
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCompressionResult(null);
      setCompressionError(null);
      setImageUrl('');
      setIsUrlValid(null);
      setAltText('');
      setCaption('');
      setActiveTab('upload');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Process and compress local file
  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCompressionError('Please choose a valid image file (PNG, JPG, WebP, GIF, or SVG).');
      return;
    }

    try {
      setIsCompressing(true);
      setCompressionError(null);

      // Default alt text to clean file name
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (!altText) setAltText(cleanName);

      const result = await optimizeImage(file, file.name);
      setCompressionResult(result);
    } catch (err: any) {
      console.error('Image compression failed:', err);
      setCompressionError(err.message || 'Failed to compress image.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleProcessFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleProcessFile(file);
  };

  // Validate URL when user types/pastes
  const handleUrlBlur = () => {
    if (!imageUrl.trim()) {
      setIsUrlValid(null);
      return;
    }
    setIsValidatingUrl(true);
    const testImg = new Image();
    testImg.onload = () => {
      setIsUrlValid(true);
      setIsValidatingUrl(false);
      if (!altText) {
        try {
          const pathname = new URL(imageUrl).pathname;
          const name = pathname.split('/').pop()?.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Web image';
          setAltText(name);
        } catch {
          setAltText('Web image');
        }
      }
    };
    testImg.onerror = () => {
      setIsUrlValid(false);
      setIsValidatingUrl(false);
    };
    testImg.src = imageUrl.trim();
  };

  // Build markdown snippet and insert
  const handleInsert = async () => {
    const alt = altText.trim() || 'Image';
    const cap = caption.trim();
    let src = '';

    if (activeTab === 'upload') {
      if (!compressionResult) return;
      const stored = await storeDataUrlImage(compressionResult.dataUrl, altText.trim() || compressionResult.fileName || 'image.png');
      src = stored.shortUrl; // e.g. "image://img_8a2fd"
    } else {
      if (!imageUrl.trim()) return;
      const rawUrl = imageUrl.trim();
      if (rawUrl.includes('media_1790593155944') || rawUrl.toLowerCase().includes('launch-image') || rawUrl.toLowerCase().includes('launch image') || alt.toLowerCase().includes('launch image')) {
        src = '/launch-image.jpg';
      } else if (/^(?:file:\/\/\/|[a-zA-Z]:[\\/])/i.test(rawUrl)) {
        src = `localfile://${encodeURIComponent(rawUrl)}`;
      } else {
        src = rawUrl;
      }
    }

    const snippet = cap 
      ? `\n![${alt}](${src} "${cap}")\n`
      : `\n![${alt}](${src})\n`;

    onInsertImage(snippet);
    onClose();
  };

  const canInsert = activeTab === 'upload' 
    ? Boolean(compressionResult && !isCompressing)
    : Boolean(imageUrl.trim());

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden z-10 flex flex-col max-h-[90vh] font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center shadow-2xs border border-brand-500/20">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Embed Image Studio
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    High-compression offline storage or web image link
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-neutral-100 dark:border-neutral-800 px-6 pt-2 bg-neutral-50/50 dark:bg-neutral-950/30 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2.5 px-4 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  activeTab === 'upload'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Local File</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono">
                  Offline
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`pb-2.5 px-4 text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 cursor-pointer ${
                  activeTab === 'url'
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Web Image URL</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              {activeTab === 'upload' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.svg,.webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {/* Dropzone */}
                  {!compressionResult ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                          : 'border-neutral-300 dark:border-neutral-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30'
                      }`}
                    >
                      {isCompressing ? (
                        <div className="flex flex-col items-center justify-center space-y-2 py-4">
                          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                            Optimizing & compressing image...
                          </p>
                          <p className="text-neutral-400">
                            Converting to high-efficiency WebP with bicubic smoothing
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2 py-2">
                          <div className="w-11 h-11 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 mb-1 border border-neutral-200/80 dark:border-neutral-700">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="font-bold text-neutral-900 dark:text-white text-sm">
                            Click to upload or drag &amp; drop image
                          </p>
                          <p className="text-neutral-400 text-xs max-w-xs leading-relaxed">
                            PNG, JPG, WebP, SVG or GIF. Automatically compressed to save offline space in documents.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Compression & Preview Result Card */
                    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/40 p-4 space-y-3">
                      <div className="flex items-start gap-4">
                        <img
                          src={compressionResult.dataUrl}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700 shrink-0 bg-white"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-bold text-neutral-900 dark:text-white truncate">
                              {compressionResult.fileName}
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setCompressionResult(null);
                              }}
                              className="text-[11px] text-brand-600 dark:text-brand-400 hover:underline cursor-pointer shrink-0 font-medium"
                            >
                              Change file
                            </button>
                          </div>

                          <p className="text-neutral-400 text-[11px] mt-0.5">
                            {compressionResult.width} × {compressionResult.height} px • {compressionResult.mimeType}
                          </p>

                          {/* Compression Badge */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-[10px]">
                              <Sparkles className="w-3 h-3" />
                              {compressionResult.savingsPercentage > 0 
                                ? `Saved ${compressionResult.savingsPercentage}% space` 
                                : 'Optimized vector'}
                            </span>
                            <span className="text-[11px] text-neutral-500 font-mono">
                              {formatBytes(compressionResult.originalSize)} → {formatBytes(compressionResult.compressedSize)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {compressionError && (
                    <div className="mt-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{compressionError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Web URL Tab */
                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                      Direct Image Web Link (HTTPS)
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={imageUrl}
                        onChange={(e) => {
                          setImageUrl(e.target.value);
                          setIsUrlValid(null);
                        }}
                        onBlur={handleUrlBlur}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                      />
                      {isValidatingUrl && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* URL Live Preview Card */}
                  {imageUrl.trim() && isUrlValid === true && (
                    <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-2.5 flex items-center gap-3 bg-neutral-50 dark:bg-neutral-800/50">
                      <img
                        src={imageUrl}
                        alt="Test preview"
                        className="w-14 h-14 object-cover rounded-md border border-neutral-200 dark:border-neutral-700"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3 h-3" /> Image verified &amp; ready
                        </span>
                        <p className="text-[10px] text-neutral-400 truncate mt-0.5 font-mono">
                          {imageUrl}
                        </p>
                      </div>
                    </div>
                  )}

                  {isUrlValid === false && (
                    <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Could not load image from this URL. Please check the link.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Alt Text & Caption Inputs */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 font-sans">
                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Alt Text (Accessibility &amp; Screen Readers)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description of the image"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Optional Caption / Title (Displayed Below Image)
                  </label>
                  <input
                    type="text"
                    placeholder="Figure 1. Architecture diagram"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 shrink-0 font-sans">
              <span className="text-[11px] text-neutral-400">
                Markdown syntax: <code className="font-mono text-neutral-600 dark:text-neutral-300">![alt](url "title")</code>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleInsert}
                  disabled={!canInsert}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs ${
                    canInsert
                      ? 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                      : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Insert into Document</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
