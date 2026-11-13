import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Printer, 
  CheckCircle2,
  AlertTriangle 
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../../config/version';

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
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 pt-16 sm:pt-20 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[85vh] my-auto bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl flex flex-col text-neutral-900 dark:text-neutral-100 overflow-hidden font-sans"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Document Metadata */}
        <div className="p-4 sm:px-6 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-50/70 dark:bg-neutral-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
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
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold hidden sm:inline">
                  {APP_VERSION_LABEL}
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
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer hidden sm:flex items-center"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#121316]">
          <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-white text-neutral-950 dark:bg-neutral-900 dark:text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 cursor-pointer ${
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
            <span>Local Storage • No Data Selling • Clear AI Transparency</span>
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
                  <span>Local-First Data Storage &amp; Local Disk Access</span>
                </h3>
                <p>
                  MD Writer runs locally in your browser. All markdown documents, drafts, templates, and UI preferences are stored directly on your personal device using your browser&apos;s IndexedDB database via Dexie.js. Furthermore, when using the Local Disk Folder feature (<kbd className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">Ctrl+O</kbd>), files are accessed directly on your local filesystem through standard browser File System Access APIs. No local files are ever read or transmitted without your explicit user selection.
                </p>
              </div>

              {/* Section 2 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">2.0</span>
                  <span>Cloud Synchronization, Realtime Parity &amp; Deletion Lifecycle</span>
                </h3>
                <p>
                  When you voluntarily authenticate with Supabase, multi-device cloud synchronization is activated. Synced documents are housed in enterprise PostgreSQL databases protected by Row-Level Security (RLS) policies, ensuring only your authenticated session ID (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">auth.uid()</code>) can access or edit your records.
                </p>
                <p>
                  To support reliable cross-device deletions and offline recovery, deletions operate via soft-deletion flags (<code className="font-mono text-[11px]">is_deleted: true</code>, <code className="font-mono text-[11px]">deleted_at</code>) propagated across connected devices via Supabase Realtime publications. Soft-deleted documents in trash can be restored by you at any time, permanently emptied on demand, or automatically pruned after 30 days.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">3.0</span>
                  <span>Platform Data Sovereignty (MD Writer Core)</span>
                </h3>
                <p>
                  MD Writer the application and its core infrastructure <strong>never train machine-learning models on your personal notes, drafts, or code</strong>. We do not sell, rent, broker, or monetize your documents, and no third-party marketing trackers or tracking pixels are included in the application.
                </p>
              </div>

              {/* Section 4: Crucial AI & Google Gemini Model Training Disclosure */}
              <div className="space-y-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>4.0 AI Assistant (Mimo) &amp; Google Gemini Model Training Notice</span>
                </div>
                <p className="text-xs leading-relaxed">
                  When you voluntarily interact with the built-in AI writing assistant (<strong>Mimo</strong>), your text prompts and selected document excerpts are transmitted over HTTPS to the <strong>Google Gemini API</strong> (<code className="font-mono text-[11px]">generativelanguage.googleapis.com</code>) to generate suggestions, summaries, formulas, and diffs.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-neutral-950 dark:text-white">
                    Important Model Training Notice:
                  </div>
                  <p className="leading-relaxed">
                    Under Google&apos;s standard Generative AI Terms of Service for developer and free API tiers, <strong>content, prompts, and document excerpts submitted to Google Gemini may be logged, reviewed by human reviewers, and utilized by Google to train, refine, and improve Google machine learning models and products.</strong>
                  </p>
                  <div className="font-semibold text-neutral-950 dark:text-white pt-1">
                    How you maintain complete control and privacy:
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    <li><strong>Completely Optional:</strong> Mimo is 100% opt-in. If you do not open Mimo or send a prompt, zero document text is ever transmitted to AI endpoints.</li>
                    <li><strong>Document Privacy Shield:</strong> You can toggle <span className="font-medium text-neutral-950 dark:text-white">Exclude from AI Scan</span> in Document Info, or enclose sensitive sections within <code className="font-mono text-[11px] bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">/private</code> blocks. Shielded sections are filtered in client memory and guaranteed never to leave your device.</li>
                    <li><strong>Bring Your Own Key (BYOK):</strong> If you connect your personal Gemini API key associated with a paid Google Cloud account with zero-data-logging policies, requests communicate directly from your browser to Google under your enterprise GCP terms.</li>
                  </ul>
                </div>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">5.0</span>
                  <span>Community Reviews &amp; User Feedback Collection</span>
                </h3>
                <p>
                  MD Writer provides voluntary in-app feedback mechanisms (including the daily feedback prompt and reviews form). When you submit feedback or community reviews:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Bug &amp; Feature Feedback:</strong> Stored securely in the Supabase <code className="font-mono text-[11px]">feedbacks</code> table (including rating, category, message, and diagnostic user/client info) strictly to diagnose software issues and guide product roadmap priorities.</li>
                  <li><strong>Community Testimonials:</strong> Reviews submitted for public display are stored in <code className="font-mono text-[11px]">community_reviews</code>. Approved testimonials (display name, role, star rating, and review text) are displayed on the public landing page.</li>
                  <li>You may request modification or erasure of your submitted feedback or reviews at any time by contacting support.</li>
                </ul>
              </div>

              {/* Section 6 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">6.0</span>
                  <span>Regulatory Compliance: GDPR, CCPA &amp; Data Portability</span>
                </h3>
                <p>
                  In accordance with the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA):
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Right to Portability (GDPR Art. 20):</strong> Export your complete document library at any time via Markdown (.md), Word (.docx), or full database JSON/ZIP archives.</li>
                  <li><strong>Right to Erasure (GDPR Art. 17):</strong> Purge your local IndexedDB cache in 1 click or permanently delete your cloud profile and associated database rows.</li>
                  <li><strong>Zero Commercial Data Brokering:</strong> We do not sell, license, trade, or monetize personal information.</li>
                </ul>
              </div>

              {/* Section 7 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">7.0</span>
                  <span>Third-Party Subprocessors</span>
                </h3>
                <p>
                  Our application infrastructure utilizes minimal, industry-standard subprocessors strictly to deliver core features:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Supabase Inc.</strong> — Database hosting, authentication, and realtime websocket sync.</li>
                  <li><strong>Google LLC (Gemini API)</strong> — Optional generative text and diff suggestions when Mimo is invoked.</li>
                  <li><strong>Cloudflare / Vercel Edge CDN</strong> — Static web asset delivery and DDoS mitigation.</li>
                </ul>
              </div>

              {/* Section 8 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">8.0</span>
                  <span>Beta Tester Attribution &amp; Operational Analytics</span>
                </h3>
                <p>
                  To acknowledge and reward early adopters during our public preview, authenticated accounts are designated with a system <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">beta_tester</code> flag. Historical promotion audit records (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">user_id</code>, registration epoch, and promotional extension dates) are retained in secure cloud storage solely for account entitlement management. These records are never shared with third parties.
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
                  <span>Acceptable Use &amp; Publishing Guidelines</span>
                </h3>
                <p>
                  MD Writer provides cloud sync, presentation rendering, and document publishing for personal, academic, and commercial writing. Users agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Deploy automated scrapers, denial-of-service payloads, or abusive batch scripts targeting synchronization endpoints.</li>
                  <li>Use the public publishing engine (<code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">/p/:slug</code>) to distribute malicious software, phishing payloads, or unlawful harassment materials.</li>
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
                  While MD Writer implements multi-tier offline resilience, background autosave, and atomic IndexedDB transactions, client storage is subject to hardware failures and browser storage evictions. The software is provided &quot;as is&quot; without warranties of any kind. Users are strongly encouraged to maintain recurring local exports (<code className="font-mono text-[11px]">.md</code> or <code className="font-mono text-[11px]">.zip</code>) for mission-critical documentation.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">4.0</span>
                  <span>AI Writing Companion (Mimo) &amp; Third-Party Processing Terms</span>
                </h3>
                <p>
                  By utilizing the optional Mimo AI assistant, you acknowledge that prompt queries and document context are transmitted to Google Gemini for real-time processing and that Google may utilize submitted inputs for model training under its applicable Terms of Service. You agree that:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>You will not submit sensitive prompts or confidential information that violates Google&apos;s Generative AI Prohibited Use Policies unless appropriately shielded.</li>
                  <li>You retain sole intellectual property ownership over all authored works and accepted AI modifications.</li>
                  <li>Mimo is a pair-writing assistant that suggests diffs and ideas; you remain solely responsible for reviewing and verifying the accuracy of all text, code, KaTeX math formulas, and diffs prior to accepting them into your files.</li>
                </ul>
              </div>

              {/* Section 5 */}
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-xs text-neutral-400">5.0</span>
                  <span>Version 2.0.0 Public Preview, Early Tester Rewards &amp; Subscriptions</span>
                </h3>
                <p>
                  MD Writer operates under a transparent lifecycle designed to honor early contributors while ensuring sustainable product development:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li><strong>v2.0.0 Public Preview Free Access:</strong> During the active public preview, all registered and guest users receive complete, unrestricted access to all Pro Studio features — including real-time multi-device cloud sync, Word (.docx) export, presentation slide decks, and publication-grade PDF tooling — at zero cost.</li>
                  <li><strong>Automatic Early Beta-Tester Reward:</strong> Registered users participating in the preview are granted verified <code className="font-mono text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">beta_tester</code> status. Full Pro access is extended without charge through <strong>December 31, 2026</strong> as a thank-you reward for early feedback. No manual coupon code entry is required.</li>
                  <li><strong>Post-Preview Standard Accounts:</strong> Accounts created after the preview period will have access to standard Free, Pro, and Team tiers. Local-first offline writing and export will always remain 100% free.</li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 sm:px-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>Effective: November 2026</span>
            <span>•</span>
            <span>Audit Ref: {APP_VERSION_LABEL}-RELEASE</span>
            <span>•</span>
            <span className="hidden sm:inline">Certified Local-First Standard</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs transition-colors duration-150 cursor-pointer shadow-xs active:translate-y-[1px]"
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
