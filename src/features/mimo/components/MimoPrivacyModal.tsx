import React from 'react';
import { createPortal } from 'react-dom';
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl p-6 overflow-hidden space-y-4">
        {/* Header Icon & Title */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-700 dark:text-neutral-300 shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">
              Privacy &amp; Local Vault Notice
            </h3>
            <p className="text-xs text-neutral-500">
              Before activating Mimo AI Assistant
            </p>
          </div>
        </div>

        {/* Core Principles */}
        <div className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
            <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Offline-First Core Editor</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Your documents, local vault files, and note databases remain 100% in your browser. Nothing is ever sent to AI without your explicit request.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
            <div className="font-medium text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-violet-500" />
              <span>Processing &amp; BYOK</span>
            </div>
            <p className="text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
              Requests are processed securely via Google Gemini. Connect your personal free Gemini API key (BYOK) for direct client-to-Google communication and unlimited capacity.
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
            className="text-neutral-900 dark:text-neutral-100 font-medium underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
          >
            <span>Learn more</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={onAccept}
            className="w-full py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-white text-xs font-semibold transition-colors cursor-pointer text-center shadow-2xs"
          >
            Enable Mimo
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenByok}
              className="flex-1 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-950 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer text-center"
            >
              Add My Free Key (BYOK)
            </button>
            <button
              onClick={onDecline}
              className="px-3 py-1.5 rounded-lg text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
