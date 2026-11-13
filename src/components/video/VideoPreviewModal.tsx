import React from 'react';
import { Player } from '@remotion/player';
import { ModalPortal } from '../common/ModalPortal';
import { MDWriterTeaser } from '../../video/compositions/MDWriterTeaser';
import { X, Play, Sparkles } from 'lucide-react';

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VideoPreviewModal: React.FC<VideoPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <ModalPortal isOpen={isOpen} onClose={onClose}>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-5xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="flex h-14 items-center justify-between border-b border-neutral-800/80 px-6 bg-neutral-900/60 select-none">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600/30 text-brand-400 border border-brand-500/30">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                  MD Writer 2.3 — Product Launch Teaser
                  <span className="rounded bg-brand-500/20 px-2 py-0.5 text-[10px] font-mono text-brand-300 border border-brand-500/30">
                    60 FPS 4K
                  </span>
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Video Player Container */}
          <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
            <Player
              component={MDWriterTeaser}
              durationInFrames={2400}
              fps={60}
              compositionWidth={1920}
              compositionHeight={1080}
              style={{
                width: '100%',
                height: '100%',
              }}
              controls
              autoPlay
              loop
            />
          </div>

          {/* Footer Metadata */}
          <div className="flex items-center justify-between border-t border-neutral-800/80 px-6 py-3 bg-neutral-900/40 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <Play size={12} className="text-brand-400" />
              <span>Remotion In-Browser Realtime Player Engine</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Duration: 40s (2400 frames)</span>
              <span>•</span>
              <span className="text-emerald-400">Deterministically Renderable to MP4</span>
            </div>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
