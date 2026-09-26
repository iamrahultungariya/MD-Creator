import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShieldCheck, FileText } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'terms';
}

export const LegalModal: React.FC<LegalModalProps> = ({ 
  isOpen, 
  onClose,
  defaultTab = 'privacy' 
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col text-neutral-900 dark:text-neutral-100 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:px-7 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activeTab === 'privacy' ? (
              <ShieldCheck className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            ) : (
              <FileText className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            )}
            <h2 className="text-base font-bold text-neutral-950 dark:text-white">
              Legal Documentation
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 sm:px-7 pt-3 pb-1 border-b border-neutral-100 dark:border-neutral-800 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Terms of Service
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  1. Local-First Privacy Architecture
                </h3>
                <p>
                  MD Writer is engineered under a local-first paradigm. By default, all documents, scratchpads, and configuration settings are stored locally on your device via client-side IndexedDB. No draft text is transmitted to our servers unless you explicitly sign in and initiate cloud synchronization.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  2. Optional Cloud Synchronization
                </h3>
                <p>
                  When you authenticate to enable multi-device sync, your documents are securely stored in isolated PostgreSQL tables protected by Row-Level Security (RLS) policies. Only your authenticated user session can read or write your files.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  3. Zero Advertising &amp; No Data Brokering
                </h3>
                <p>
                  We never sell, rent, or monetize your personal documents, browsing patterns, or email addresses. We do not embed behavioral third-party advertising SDKs or data brokers into the application.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  4. Data Deletion
                </h3>
                <p>
                  You have full autonomy over your data. You may clear your browser storage at any time to purge local records, or request complete account and cloud database record deletion from within your profile settings.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  1. Terms &amp; Acceptance
                </h3>
                <p>
                  By creating an account or using MD Writer via the web or progressive web application (PWA), you agree to be bound by these Terms of Service.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  2. Complete Intellectual Property Ownership
                </h3>
                <p>
                  You retain 100% ownership and copyright over all documents, markdown files, technical notes, and exported PDFs created using MD Writer. We claim zero rights or licenses over your creative or technical work.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  3. Service Availability &amp; Backups
                </h3>
                <p>
                  While MD Writer is built with resilient local persistence and offline fault-tolerance, software is provided &quot;as is&quot;. We recommend maintaining routine local exports (.md or .zip) for mission-critical documents.
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white">
                  4. Fair Use of Cloud Infrastructure
                </h3>
                <p>
                  Free and promotional Pro access granted to all users is intended for standard technical writing, documentation, and research. Abuse of sync endpoints or attempts to disrupt service for other users will result in account suspension.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between shrink-0 text-xs">
          <span className="text-neutral-400">Effective Date: October 2026 • v0.9.0 Beta</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-bold transition-colors cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
