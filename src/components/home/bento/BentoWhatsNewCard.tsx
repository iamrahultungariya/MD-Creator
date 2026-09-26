import React from 'react';
import { ArrowRight } from 'lucide-react';

interface BentoWhatsNewCardProps {
  onOpenUpdates?: () => void;
}

export const BentoWhatsNewCard: React.FC<BentoWhatsNewCardProps> = ({ onOpenUpdates }) => {
  return (
    <div className="lg:col-span-5 rounded-3xl bg-neutral-950 text-white border border-neutral-800 shadow-[0_4px_30px_-6px_rgba(0,0,0,0.3)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden transition-all group">
      {/* Abstract Glowing Mesh Wave Background */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 pointer-events-none opacity-40 group-hover:opacity-60 transition-opacity duration-700">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="100" cy="100" r="60" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <path d="M 20 180 C 80 140, 140 180, 200 120" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
          <path d="M 0 160 C 60 120, 130 150, 200 90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <path d="M 10 130 C 70 90, 150 120, 210 60" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Top Badges */}
      <div className="flex items-center justify-between z-10">
        <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-300 text-[11px] font-mono font-bold">
          v0.9.0 Beta
        </span>
        <button
          onClick={onOpenUpdates}
          className="px-3 py-0.5 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 text-[11px] font-medium border border-neutral-700/60 transition-colors cursor-pointer"
        >
          What&apos;s New?
        </button>
      </div>

      {/* Content */}
      <div className="my-5 z-10">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
          A more focused <br />
          you.
        </h3>
        <p className="text-xs text-neutral-400 leading-relaxed mt-2 max-w-xs">
          New templates, better export options and a faster editor.
        </p>
      </div>

      {/* Action Button */}
      <div className="z-10">
        <button
          onClick={onOpenUpdates}
          className="px-4 py-2 rounded-full bg-white text-neutral-950 hover:bg-neutral-100 text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm group/btn"
        >
          <span>See What&apos;s New</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
