import React from 'react';
import { Key } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';

export const MimoQuotaRing: React.FC = () => {
  const quota = useMimoStore((s) => s.quota);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);

  const isByokActive = Boolean(quota.userApiKey?.trim());

  if (isByokActive) {
    return (
      <button
        onClick={() => setIsKeyModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 text-[10px] font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/80 transition-colors cursor-pointer"
        title="Personal Gemini Key Active"
      >
        <span>BYOK Active</span>
      </button>
    );
  }

  // Percentage capacity tracking
  const percent = Math.min(100, Math.round(quota.dailyUsagePercent || 0));

  // Stealth rule: Do NOT render anything until >= 50% capacity is reached!
  if (percent < 50) {
    return null;
  }

  const isCritical = percent >= 90;

  // SVG circular ring calculations
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <button
      onClick={() => setIsKeyModalOpen(true)}
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700/80 transition-colors text-[10px] font-sans text-neutral-600 dark:text-neutral-300 cursor-pointer"
      title={`Daily AI Capacity: ${percent}% used.`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <svg className="w-4 h-4 -rotate-90" viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r={radius}
            className="stroke-neutral-300 dark:stroke-neutral-700"
            strokeWidth="2.5"
            fill="transparent"
          />
          <circle
            cx="12"
            cy="12"
            r={radius}
            className={`${
              isCritical
                ? 'stroke-amber-500 dark:stroke-amber-400'
                : 'stroke-neutral-800 dark:stroke-neutral-300'
            } transition-all duration-300`}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
      </div>

      <span className="font-mono font-medium">{percent}%</span>

      {isCritical && (
        <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
          <Key className="w-2.5 h-2.5" />
          Add Key
        </span>
      )}
    </button>
  );
};
