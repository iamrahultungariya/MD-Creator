import React from 'react';
import { Key } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';

export const MimoQuotaRing: React.FC = () => {
  const quota = useMimoStore((s) => s.quota);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);

  const envApiKey = (
    (import.meta.env.VITE_GEMINI_API_KEY as string) ||
    (import.meta.env.GEMINI_API_KEY as string) ||
    ''
  ).trim();
  const isByokActive = Boolean(
    quota.userApiKey?.trim() ||
    (envApiKey && !envApiKey.includes('your_gemini'))
  );

  if (isByokActive) {
    const requests = quota.requestsToday || 0;
    const latency = quota.liveLatencyMs || quota.lastRequestLatencyMs || 0;
    const isThrottled = quota.liveApiStatus === 'THROTTLED';

    return (
      <button
        onClick={() => setIsKeyModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-semibold transition-all cursor-pointer shadow-2xs ${
          isThrottled
            ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-200/80 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
            : 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80'
        }`}
        title={`Google Gemini API Key Active • ${requests} requests today • ${latency > 0 ? `${latency}ms latency` : 'Connected'} • Click for key details`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isThrottled ? 'bg-amber-400' : 'bg-emerald-400'}`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isThrottled ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        </span>
        <span className="flex items-center gap-1">
          <Key className="w-2.5 h-2.5" />
          <span>{requests > 0 ? `${requests} reqs` : latency > 0 ? `${latency}ms` : 'Key Active'}</span>
        </span>
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
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-all text-[10px] font-sans cursor-pointer"
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
                : 'stroke-neutral-800 dark:stroke-neutral-200'
            } transition-all duration-300`}
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>
      </div>
      <span className="font-mono text-[10px]">{percent}%</span>
    </button>
  );
};
