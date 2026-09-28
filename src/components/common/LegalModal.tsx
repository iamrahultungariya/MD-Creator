import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Printer, 
  CheckCircle2 
} from 'lucide-react';

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

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-[#121316] rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col text-neutral-900 dark:text-neutral-100 overflow-hidden animate-in zoom-in-95 duration-150 font-sans"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Document Metadata */}
        <div className="p-5 sm:px-8 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/70 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center shadow-xs">
              {activeTab === 'privacy' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                  {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h2>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold hidden sm:inline">
                  v0.9.1 Beta
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {activeTab === 'privacy'
                  ? 'Your content belongs to you. Stored locally on your machine.'
                  : 'Clear, straightforward terms for using MD Writer.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer hidden sm:flex items-center"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 sm:px-8 py-2.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#121316]">
          <div className="flex gap-1.5 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-neutral-950 dark:bg-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'terms'
                  ? 'bg-white text-neutral-950 dark:bg-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Terms of Service
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Local Storage • No Data Selling • Zero Tracking</span>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
          {activeTab === 'privacy' ? (
            <>
              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">1.0</span>
                  <span>Local-First Data Storage</span>
                </h3>
                <p>
                  MD Writer runs locally in your web browser. All your markdown files, drafts, settings, and templates are saved directly onto your device using your browser's IndexedDB storage. Your text never leaves your device unless you choose to sign in and turn on cloud sync.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">2.0</span>
                  <span>Cloud Synchronization Security & Row-Level Security (RLS)</span>
                </h3>
                <p>
                  When you authenticate via Supabase Auth, cloud synchronization is enabled to allow seamless multi-device parity. Synced records are stored in enterprise-grade PostgreSQL clusters protected by cryptographic Row-Level Security (RLS) policies. Only your authenticated session ID (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">auth.uid()</code>) possesses the authorization keys required to read, insert, update, or purge your records.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">3.0</span>
                  <span>Data Sovereignty & Zero Model Training</span>
                </h3>
                <p>
                  We recognize that writers, researchers, engineers, and creators trust MD Writer with intellectual property, proprietary code, novel drafts, and personal notes. We explicitly commit that <strong>we do not use your documents to train machine-learning models</strong>, and no user text, markdown files, exported artifacts, or revisions are ever ingested, scraped, shared, or monetized by third parties.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">4.0</span>
                  <span>Regulatory Compliance: GDPR, CCPA & Data Portability</span>
                </h3>
                <p>
                  In accordance with the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Right to Portability (GDPR Art. 20):</strong> Export your complete document library at any time via Markdown (.md), Word (.docx), or full database JSON/ZIP archives.</li>
                  <li><strong>Right to Erasure (GDPR Art. 17):</strong> Purge your local IndexedDB cache in one click or permanently delete your cloud profile and associated database rows.</li>
                  <li><strong>Zero Commercial Data Brokering:</strong> We do not sell, license, trade, or monetize personal information.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">5.0</span>
                  <span>Third-Party Subprocessors</span>
                </h3>
                <p>
                  Our cloud infrastructure utilizes minimal, SOC-2 compliant subprocessors strictly for core application functionality: Supabase (authentication and database hosting) and modern CDN edge providers (static asset delivery). No third-party marketing or tracking pixels are incorporated.
                </p>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">6.0</span>
                  <span>Beta Tester Attribution &amp; Operational Analytics</span>
                </h3>
                <p>
                  To acknowledge and reward early adopters during our public preview, authenticated accounts are designated with a system <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">beta_tester</code> flag. Historical promotion audit records (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">user_id</code>, registration epoch, and promotional extension dates) are retained in secure cloud storage solely for account entitlement management and aggregate product conversion metrics. These operational records are never shared with third parties or used for profiling.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Section 1 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">1.0</span>
                  <span>100% Intellectual Property &amp; Copyright Retention</span>
                </h3>
                <p>
                  You retain exclusive, unconditional moral and economic copyright over all documents, markdown texts, technical specifications, slide decks, and exported artifacts created using MD Writer. The service claims zero ownership, license, or right of exploitation over your authored works.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">2.0</span>
                  <span>Acceptable Use &amp; Fair Sync Policy</span>
                </h3>
                <p>
                  MD Writer provides cloud sync, presentation rendering, and PDF tooling for personal, academic, and commercial technical writing. Users agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Deploy automated scrapers, denial-of-service payloads, or abusive batch scripts targeting the synchronization endpoints.</li>
                  <li>Use the public publishing engine (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">/p/:slug</code>) to distribute malicious code, malware, or unlawful harassment materials.</li>
                  <li>Circumvent account security or impersonate administrative credentials.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">3.0</span>
                  <span>Service Availability, Backups &amp; Disclaimers</span>
                </h3>
                <p>
                  While MD Writer implements multi-tier offline resilience, background autosave, and atomic IndexedDB transactions, software and network systems are subject to hardware and browser storage evictions. The software is provided &quot;as is&quot; without warranties of any kind. Users are strongly encouraged to maintain recurring local exports (<code className="font-mono text-[11px]">.md</code> or <code className="font-mono text-[11px]">.zip</code>) for mission-critical documentation.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">4.0</span>
                  <span>Beta Phase Access, Tester Rewards &amp; Pricing Transition</span>
                </h3>
                <p>
                  MD Writer operates under a transparent, 3-tier lifecycle designed to honor early contributors while ensuring sustainable product development:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>Tier 1 — Beta Phase Free Access:</strong> During the active beta phase (prior to official v1.0 release), all registered and guest users receive complete, unrestricted access to all Pro Studio features — including multi-device cloud sync, Word (.docx) export, presentation slide decks, and publication-grade PDF tooling — at zero cost.</li>
                  <li><strong>Tier 2 — Automatic Early Beta-Tester Reward:</strong> Exactly one calendar day prior to the general v1.0 commercial launch, all existing registered users are granted verified <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">beta_tester</code> status. Upon launch, an automated promotional credit is directly applied to these accounts, extending full Pro access without charge through <strong>December 31, 2026</strong> as a thank-you reward for early feedback. No manual coupon code entry is required.</li>
                  <li><strong>Tier 3 — Post-Beta Standard Subscriptions:</strong> Accounts created after the pre-launch cutoff will follow standard transparent subscription tiers (Free, Pro, and Team). New users signing up during a launch billing cycle receive a complimentary soft-landing trial through the remainder of that calendar month before standard recurring billing applies.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 sm:px-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>Effective: October 2026</span>
            <span>•</span>
            <span>Audit Ref: v0.9.1-BETA</span>
            <span>•</span>
            <span className="hidden sm:inline">Certified Local-First Standard</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-bold transition-all cursor-pointer shadow-xs active:scale-95"
            >
              I Understand &amp; Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
