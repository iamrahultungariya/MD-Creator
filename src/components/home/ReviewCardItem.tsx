import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { UserReview } from '../../services/reviewsStorage';

export interface ReviewCardItemProps {
  rev: UserReview;
  idx: number;
  isMine: boolean;
  isEditLocked: boolean;
  remainingMinutes: number;
  openModalForReview: () => void;
  handleDeleteMyReview: () => void;
}

export const ReviewCardItem: React.FC<ReviewCardItemProps> = ({
  rev,
  idx,
  isMine,
  isEditLocked,
  remainingMinutes,
  openModalForReview,
  handleDeleteMyReview,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className={`relative ${idx === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
      <motion.div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{
          scale: isHovered ? 1.035 : 1,
          y: isHovered ? -5 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 24,
          mass: 0.6,
        }}
        style={{
          zIndex: isHovered ? 30 : 1,
          transformOrigin: 'center center',
        }}
        className={`relative h-full p-6 sm:p-7 rounded-2xl bg-white dark:bg-neutral-900 border flex flex-col justify-between break-words transition-shadow duration-300 ${
          isHovered
            ? 'shadow-2xl shadow-neutral-950/15 dark:shadow-black/75 border-neutral-300 dark:border-neutral-700 ring-1 ring-neutral-950/5 dark:ring-white/10'
            : 'shadow-xs border-neutral-200/90 dark:border-neutral-800'
        } ${
          isMine
            ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white'
            : ''
        }`}
      >
        {/* Top Section: Rating, Badges & Full Review Quote */}
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < rev.rating
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]'
                      : 'text-neutral-300 dark:text-neutral-700'
                  }`}
                />
              ))}
              <span className="ml-1 text-xs font-bold text-neutral-900 dark:text-white font-mono">
                {rev.rating}.0
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isMine && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold border border-neutral-200 dark:border-neutral-700">
                  Your Review
                </span>
              )}
              {rev.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified Writer</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal break-words mb-5">
            &ldquo;{rev.content}&rdquo;
          </p>
        </div>

        {/* Bottom Section: Author Info & Controls */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold text-xs flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-2xs shrink-0">
              {rev.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-950 dark:text-white">
                {rev.name}
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {rev.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-neutral-400 font-mono">
              {rev.date}
            </span>
            {isMine && (
              <div className="flex items-center gap-1">
                {!isEditLocked && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openModalForReview();
                    }}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                    title={`Edit your review (${remainingMinutes}m remaining)`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteMyReview();
                  }}
                  className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors"
                  title="Delete your review permanently"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
