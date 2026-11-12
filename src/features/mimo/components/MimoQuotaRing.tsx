import React from 'react';
import { useMimoStore } from '../stores/useMimoStore';

export const MimoQuotaRing: React.FC = () => {
  const quota = useMimoStore((s) => s.quota);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);

  const envApiKey = (
    (import.meta.env?.VITE_GEMINI_API_KEY as string) ||
    (import.meta.env?.GEMINI_API_KEY as string) ||
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
        type="button"
        onClick={() => setIsKeyModalOpen(true)}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium tabular-nums transition-colors cursor-pointer ${
          isThrottled
            ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
            : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
        }`}
        title={`Personal Gemini API Key Active • ${requests} requests today • ${latency > 0 ? `${latency}ms latency` : 'Connected'}`}
      >
        <span
          className={`inline-block rounded-full h-1.5 w-1.5 ${
            isThrottled ? 'bg-amber-500' : 'bg-emerald-500'
          }`}
        />
        <span>{requests > 0 ? `${requests} req` : latency > 0 ? `${latency}ms` : 'API Ready'}</span>
      </button>
    );
  }

  const percent = Math.min(100, Math.round(quota.dailyUsagePercent || 0));

  // Stealth rule: Keep telemetry hidden until >= 50% capacity is used
  if (percent < 50) {
    return null;
  }

  const isCritical = percent >= 90;

  return (
    <button
      type="button"
      onClick={() => setIsKeyModalOpen(true)}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono tabular-nums transition-colors cursor-pointer ${
        isCritical
          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
          : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }`}
      title={`Daily Shared AI Capacity: ${percent}% used`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full ${
          isCritical ? 'bg-amber-500' : 'bg-neutral-700 dark:bg-neutral-300'
        }`}
      />
      <span>{percent}% cap</span>
    </button>
  );
};
