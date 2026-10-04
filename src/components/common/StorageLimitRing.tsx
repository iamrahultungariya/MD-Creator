import React, { useEffect, useState } from 'react';
import { db } from '../../db';
import { StorageDetailsModal } from './StorageDetailsModal';

export const SOFT_LIMIT_MB = 300;
export const SOFT_LIMIT_BYTES = SOFT_LIMIT_MB * 1024 * 1024;

interface StorageUsageData {
  usedBytes: number;
  usedMb: number;
  percent: number;
  isLoaded: boolean;
}

export function useWorkspaceStorage(): StorageUsageData {
  const [data, setData] = useState<StorageUsageData>({
    usedBytes: 0,
    usedMb: 0,
    percent: 0,
    isLoaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function calculateUsage() {
      try {
        let bytes = 0;

        // Try native storage estimate first
        if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
          const estimate = await navigator.storage.estimate();
          if (estimate.usage && estimate.usage > 0) {
            bytes = estimate.usage;
          }
        }

        // Fallback or addition from local Dexie IndexedDB documents and images if estimate is 0
        if (bytes === 0) {
          try {
            const docs = await db.documents.toArray();
            let docBytes = 0;
            for (const doc of docs) {
              docBytes += doc.sizeBytes || 0;
            }
            const images = await db.images.toArray();
            let imageBytes = 0;
            for (const img of images) {
              imageBytes += img.sizeBytes || 0;
            }
            bytes = docBytes + imageBytes;
          } catch {
            // In case of DB read error, default to minimal footprint
            bytes = 1024 * 250; // 250 KB
          }
        }

        if (isMounted) {
          const usedMb = Number((bytes / (1024 * 1024)).toFixed(1));
          const percent = Math.min(100, Math.max(0.4, Number(((bytes / SOFT_LIMIT_BYTES) * 100).toFixed(1))));
          setData({
            usedBytes: bytes,
            usedMb,
            percent,
            isLoaded: true,
          });
        }
      } catch {
        if (isMounted) {
          setData({
            usedBytes: 1024 * 512,
            usedMb: 0.5,
            percent: 0.2,
            isLoaded: true,
          });
        }
      }
    }

    calculateUsage();
    return () => {
      isMounted = false;
    };
  }, []);

  return data;
}

interface StorageLimitRingProps {
  variant?: 'compact' | 'card' | 'badge';
  className?: string;
  onClick?: () => void;
}

export const StorageLimitRing: React.FC<StorageLimitRingProps> = ({
  variant = 'compact',
  className = '',
  onClick,
}) => {
  const { usedMb, percent, isLoaded } = useWorkspaceStorage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // SVG circular ring geometry
  const radius = 9;
  const strokeWidth = 2.4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Color thresholding aligned with Electric Violet brand identity
  const ringColor =
    percent > 90 ? '#f43f5e' : percent > 75 ? '#f59e0b' : '#8257F5';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (onClick) {
        onClick();
      } else {
        setIsModalOpen(true);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className={`flex items-center gap-2 text-neutral-400 font-sans text-xs ${className}`}>
        <span className="w-3.5 h-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 animate-spin border-t-transparent" />
        <span className="text-[11px] font-medium">Calculating storage...</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'badge' && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/90 dark:bg-neutral-900/60 hover:border-brand-500/50 hover:bg-neutral-100/90 dark:hover:bg-neutral-800/80 font-sans text-xs font-medium text-neutral-700 dark:text-neutral-300 shadow-2xs select-none cursor-pointer transition-all ${className}`}
          title={`Click to view detailed storage telemetry (${usedMb} MB used of ${SOFT_LIMIT_MB} MB)`}
        >
          <svg className="w-4 h-4 -rotate-90 shrink-0" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-neutral-200 dark:text-neutral-800"
            />
            <circle
              cx="12"
              cy="12"
              r={radius}
              fill="transparent"
              stroke={ringColor}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />
          </svg>
          <span className="font-semibold text-neutral-900 dark:text-neutral-200">
            {usedMb} <span className="font-normal text-neutral-400">/ {SOFT_LIMIT_MB} MB</span>
          </span>
        </div>
      )}

      {variant === 'compact' && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`flex items-center gap-3 font-sans text-xs select-none cursor-pointer hover:opacity-80 transition-opacity ${className}`}
          title={`Click to view storage details (${usedMb} MB used out of ${SOFT_LIMIT_MB} MB)`}
        >
          <div className="relative w-7 h-7 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 -rotate-90" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r={radius}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-neutral-200 dark:text-neutral-800"
              />
              <circle
                cx="12"
                cy="12"
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1 leading-tight">
              <span>{usedMb} MB</span>
              <span className="text-neutral-400 font-normal text-[11px]">/ {SOFT_LIMIT_MB} MB</span>
            </div>
            <div className="text-[10px] text-neutral-400 font-medium">Workspace Soft Limit</div>
          </div>
        </div>
      )}

      {variant === 'card' && (
        <div 
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/80 dark:bg-neutral-900/40 hover:border-brand-500/50 hover:bg-neutral-100/70 dark:hover:bg-neutral-850/60 font-sans text-xs space-y-3 select-none cursor-pointer transition-all group ${className}`}
          title={`Click to view storage breakdown & telemetry (${usedMb} MB used of ${SOFT_LIMIT_MB} MB)`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-neutral-200 dark:text-neutral-800"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r={radius}
                    fill="transparent"
                    stroke={ringColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-neutral-800 dark:text-neutral-200 font-sans">
                  {percent < 1 ? '<1' : Math.round(percent)}%
                </span>
              </div>

              <div className="min-w-0">
                <div className="font-bold text-neutral-900 dark:text-white text-xs group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  Workspace Storage
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                  In-App Soft Limit ({SOFT_LIMIT_MB} MB quota)
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="font-bold text-xs text-neutral-900 dark:text-white">
                {usedMb} MB
              </span>
              <span className="text-[11px] text-neutral-400 font-medium"> / {SOFT_LIMIT_MB} MB</span>
            </div>
          </div>

          <div className="w-full bg-neutral-200/80 dark:bg-neutral-800 rounded-md h-1.5 overflow-hidden">
            <div
              className="h-full rounded-sm transition-all duration-500 ease-out"
              style={{ width: `${percent}%`, backgroundColor: ringColor }}
            />
          </div>
        </div>
      )}

      {/* Storage Details Explaining Modal */}
      <StorageDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
