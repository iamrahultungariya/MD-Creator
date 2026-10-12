import React from 'react';
import { ShieldCheck, Key, Lock, ExternalLink } from 'lucide-react';

interface MimoPrivacyModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onOpenByok: () => void;
  onDecline: () => void;
}

export const MimoPrivacyModal: React.FC<MimoPrivacyModalProps> = ({
  isOpen,
  onAccept,
  onOpenByok,
  onDecline,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 overflow-hidden space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-800 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-950 dark:text-white">
              Private & Offline-First Transparency
            </h3>
            <p className="text-xs text-neutral-500">
              Before you start using Mimo ✦ AI Companion
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/80 space-y-1">
            <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Offline-First Core Editor</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500">
              Your documents, local vault files, and note databases remain 100% in your browser. Nothing is ever sent to AI without your explicit request.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-violet-50/60 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/40 space-y-1">
            <div className="font-semibold text-violet-950 dark:text-violet-200 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-violet-500" />
              <span>Free Tier Cloud Processing</span>
            </div>
            <p className="text-[11px] leading-relaxed text-violet-800/80 dark:text-violet-300/80">
              When utilizing Mimo&apos;s free shared model, queries are processed via Google Gemini API endpoints.
            </p>
            <p className="text-[11px] leading-relaxed text-violet-800/80 dark:text-violet-300/80 font-medium">
              Want zero data retention? Connect your personal free Gemini API key (BYOK) for direct client-to-Google communication and unlimited capacity.
            </p>
          </div>
        </div>

        {/* Link to AI Studio */}
        <div className="text-[11px] text-neutral-500 flex items-center justify-between">
          <span>Google AI Studio Key is free in 30s</span>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="text-violet-600 dark:text-violet-400 font-semibold hover:underline inline-flex items-center gap-0.5"
          >
            <span>Learn more</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
          >
            I Understand &amp; Enable Mimo
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenByok}
              className="flex-1 py-2 rounded-xl border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/40 text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Add My Free Key (BYOK)
            </button>
            <button
              onClick={onDecline}
              className="px-3 py-2 rounded-xl text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
