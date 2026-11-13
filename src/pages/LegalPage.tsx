import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { APP_VERSION_LABEL } from '../config/version';

interface LegalPageProps {
  defaultTab?: 'privacy' | 'terms';
}

export const LegalPage: React.FC<LegalPageProps> = ({ defaultTab = 'privacy' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine tab from prop or route pathname
  const initialTab: 'privacy' | 'terms' =
    location.pathname.includes('/terms') ? 'terms' : defaultTab;
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);

  useEffect(() => {
    if (location.pathname.includes('/terms')) {
      setActiveTab('terms');
    } else if (location.pathname.includes('/privacy')) {
      setActiveTab('privacy');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: 'privacy' | 'terms') => {
    setActiveTab(tab);
    window.history.replaceState(null, '', tab === 'privacy' ? '/privacy' : '/terms');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-neutral-900 dark:text-[#EDEAF5] font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Studio</span>
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="font-semibold text-neutral-900 dark:text-white">
                {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 font-medium transition-colors cursor-pointer"
              title="Print Policy"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <Link
              to="/editor"
              className="px-3.5 py-1.5 rounded-lg bg-neutral-950 dark:bg-white text-white dark:text-neutral-950 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Open Editor
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {/* Document Header & Tab Selector */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0">
                {activeTab === 'privacy' ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : (
                  <FileText className="w-6 h-6" />
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">
                  {activeTab === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  {activeTab === 'privacy'
                    ? 'Your content belongs to you. Stored locally on your machine.'
                    : 'Clear, straightforward terms for using MD Writer.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-semibold">
                {APP_VERSION_LABEL}
              </span>
            </div>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center justify-between flex-wrap gap-3 p-1.5 bg-neutral-100/90 dark:bg-neutral-900/90 rounded-xl border border-neutral-200/80 dark:border-neutral-800">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleTabChange('privacy')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-white text-neutral-950 dark:bg-neutral-800 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => handleTabChange('terms')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer ${
                  activeTab === 'terms'
                    ? 'bg-white text-neutral-950 dark:bg-neutral-800 dark:text-white shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Terms of Service
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 px-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Local Storage • Zero Data Selling • AI Transparency</span>
            </div>
          </div>
        </div>

        {/* Content Box */}
        <article className="bg-white dark:bg-neutral-900/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-6 sm:p-10 shadow-xs space-y-8 text-neutral-700 dark:text-neutral-300 leading-relaxed text-sm sm:text-base">
          {activeTab === 'privacy' ? (
            <>
              {/* Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">1.0</span>
                  <span>Local-First Data Storage &amp; Local Disk Access</span>
                </h2>
                <p>
                  MD Writer runs locally in your browser. All markdown documents, drafts, templates, and UI preferences are stored directly on your personal device using your browser&apos;s IndexedDB database via Dexie.js. Furthermore, when using the Local Disk Folder feature (<kbd className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700">Ctrl+O</kbd>), files are accessed directly on your local filesystem through standard browser File System Access APIs. No local files are ever read or transmitted without your explicit user selection.
                </p>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">2.0</span>
                  <span>Cloud Synchronization, Realtime Parity &amp; Deletion Lifecycle</span>
                </h2>
                <p>
                  When you voluntarily authenticate with Supabase, multi-device cloud synchronization is activated. Synced documents are housed in enterprise PostgreSQL databases protected by Row-Level Security (RLS) policies, ensuring only your authenticated session ID (<code className="font-mono text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">auth.uid()</code>) can access or edit your records.
                </p>
                <p>
                  To support reliable cross-device deletions and offline recovery, deletions operate via soft-deletion flags (<code className="font-mono text-xs">is_deleted: true</code>, <code className="font-mono text-xs">deleted_at</code>) propagated across connected devices via Supabase Realtime publications. Soft-deleted documents in trash can be restored by you at any time, permanently emptied on demand, or automatically pruned after 30 days.
                </p>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">3.0</span>
                  <span>Platform Data Sovereignty (MD Writer Core)</span>
                </h2>
                <p>
                  MD Writer the application and its core infrastructure <strong>never train machine-learning models on your personal notes, drafts, or code</strong>. We do not sell, rent, broker, or monetize your documents, and no third-party marketing trackers or tracking pixels are included in the application.
                </p>
              </section>

              {/* Section 4: Crucial AI & Google Gemini Model Training Disclosure */}
              <section className="space-y-3 p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-neutral-800 dark:text-neutral-200">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>4.0 AI Assistant (Mimo) &amp; Google Gemini Model Training Notice</span>
                </div>
                <p className="text-sm leading-relaxed">
                  When you voluntarily interact with the built-in AI writing assistant (<strong>Mimo</strong>), your text prompts and selected document excerpts are transmitted over HTTPS to the <strong>Google Gemini API</strong> (<code className="font-mono text-xs">generativelanguage.googleapis.com</code>) to generate suggestions, summaries, formulas, and diffs.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-neutral-950 dark:text-white">
                    Important Model Training Notice:
                  </div>
                  <p className="leading-relaxed">
                    Under Google&apos;s standard Generative AI Terms of Service for developer and free API tiers, <strong>content, prompts, and document excerpts submitted to Google Gemini may be logged, reviewed by human reviewers, and utilized by Google to train, refine, and improve Google machine learning models and products.</strong>
                  </p>
                  <div className="font-semibold text-neutral-950 dark:text-white pt-2">
                    How you maintain complete control and privacy:
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-sm">
                    <li><strong>Completely Optional:</strong> Mimo is 100% opt-in. If you do not open Mimo or send a prompt, zero document text is ever transmitted to AI endpoints.</li>
                    <li><strong>Document Privacy Shield:</strong> You can toggle <span className="font-medium text-neutral-950 dark:text-white">Exclude from AI Scan</span> in Document Info, or enclose sensitive sections within <code className="font-mono text-xs bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">/private</code> blocks. Shielded sections are filtered in client memory and guaranteed never to leave your device.</li>
                    <li><strong>Bring Your Own Key (BYOK):</strong> If you connect your personal Gemini API key associated with a paid Google Cloud account with zero-data-logging policies, requests communicate directly from your browser to Google under your enterprise GCP terms.</li>
                  </ul>
                </div>
              </section>

              {/* Section 5 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">5.0</span>
                  <span>Community Reviews &amp; User Feedback Collection</span>
                </h2>
                <p>
                  MD Writer provides voluntary in-app feedback mechanisms. When you submit feedback or community reviews:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Bug &amp; Feature Feedback:</strong> Stored securely in Supabase strictly to diagnose software issues and guide product roadmap priorities.</li>
                  <li><strong>Community Testimonials:</strong> Approved testimonials (display name, role, star rating, and review text) are displayed on the public landing page.</li>
                  <li>You may request modification or erasure of your submitted feedback or reviews at any time by contacting support.</li>
                </ul>
              </section>

              {/* Section 6 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">6.0</span>
                  <span>Regulatory Compliance: GDPR, CCPA &amp; Data Portability</span>
                </h2>
                <p>
                  In accordance with the EU General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA/CPRA):
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Right to Portability (GDPR Art. 20):</strong> Export your complete document library at any time via Markdown (.md), Word (.docx), or full database JSON/ZIP archives.</li>
                  <li><strong>Right to Erasure (GDPR Art. 17):</strong> Purge your local IndexedDB cache in 1 click or permanently delete your cloud profile and associated database rows.</li>
                  <li><strong>Zero Commercial Data Brokering:</strong> We do not sell, license, trade, or monetize personal information.</li>
                </ul>
              </section>

              {/* Section 7 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">7.0</span>
                  <span>Third-Party Subprocessors</span>
                </h2>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Supabase Inc.</strong> — Database hosting, authentication, and realtime websocket sync.</li>
                  <li><strong>Google LLC (Gemini API)</strong> — Optional generative text and diff suggestions when Mimo is invoked.</li>
                  <li><strong>Cloudflare / Vercel Edge CDN</strong> — Static web asset delivery and DDoS mitigation.</li>
                </ul>
              </section>
            </>
          ) : (
            <>
              {/* Terms Section 1 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">1.0</span>
                  <span>100% Intellectual Property &amp; Copyright Retention</span>
                </h2>
                <p>
                  You retain exclusive, unconditional moral and economic copyright over all documents, markdown texts, technical specifications, slide decks, and exported artifacts created using MD Writer. The service claims zero ownership, license, or right of exploitation over your authored works.
                </p>
              </section>

              {/* Terms Section 2 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">2.0</span>
                  <span>Acceptable Use &amp; Publishing Guidelines</span>
                </h2>
                <p>
                  MD Writer provides cloud sync, presentation rendering, and document publishing for personal, academic, and commercial writing. Users agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>Deploy automated scrapers, denial-of-service payloads, or abusive batch scripts targeting synchronization endpoints.</li>
                  <li>Use the public publishing engine (<code className="font-mono text-xs">/p/:slug</code>) to distribute malicious software, phishing payloads, or unlawful harassment materials.</li>
                  <li>Circumvent account security or impersonate administrative credentials.</li>
                </ul>
              </section>

              {/* Terms Section 3 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">3.0</span>
                  <span>Service Availability, Backups &amp; Disclaimers</span>
                </h2>
                <p>
                  While MD Writer implements multi-tier offline resilience, background autosave, and atomic IndexedDB transactions, client storage is subject to hardware failures and browser storage evictions. The software is provided &quot;as is&quot; without warranties of any kind. Users are strongly encouraged to maintain recurring local exports (<code className="font-mono text-xs">.md</code> or <code className="font-mono text-xs">.zip</code>) for mission-critical documentation.
                </p>
              </section>

              {/* Terms Section 4 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">4.0</span>
                  <span>AI Writing Companion (Mimo) &amp; Third-Party Processing Terms</span>
                </h2>
                <p>
                  By utilizing the optional Mimo AI assistant, you acknowledge that prompt queries and document context are transmitted to Google Gemini for real-time processing and that Google may utilize submitted inputs for model training under its applicable Terms of Service. You agree that:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li>You will not submit sensitive prompts or confidential information that violates Google&apos;s Generative AI Prohibited Use Policies unless appropriately shielded.</li>
                  <li>You retain sole intellectual property ownership over all authored works and accepted AI modifications.</li>
                  <li>Mimo is a pair-writing assistant that suggests diffs and ideas; you remain solely responsible for reviewing and verifying the accuracy of all text, code, KaTeX math formulas, and diffs prior to accepting them into your files.</li>
                </ul>
              </section>

              {/* Terms Section 5 */}
              <section className="space-y-3">
                <h2 className="text-lg sm:text-xl font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                  <span className="font-mono text-sm text-neutral-400">5.0</span>
                  <span>Studio Tier, Pricing &amp; Future Subscriptions</span>
                </h2>
                <p>
                  MD Writer operates under a transparent lifecycle designed to honor early contributors:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-sm">
                  <li><strong>Core Studio Free Forever:</strong> Local-first editing, offline IndexedDB storage, direct local folder access, KaTeX math, Mermaid diagrams, and direct Google Gemini BYOK are and will remain 100% free forever.</li>
                  <li><strong>Early-Bird Lifetime License:</strong> Users who reserve or purchase the Early-Bird Lifetime Deal ($49 one-time) receive permanent access to cloud synchronization, version snapshots, and studio exports without recurring subscriptions.</li>
                  <li><strong>Pro Studio ($8/month):</strong> Cloud sync and publication export tools are accessible on active monthly or annual terms once commercial checkout is activated.</li>
                </ul>
              </section>
            </>
          )}
        </article>

        {/* Bottom Metadata */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 gap-3 border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex items-center gap-2">
            <span>Last Updated: November 2026</span>
            <span>•</span>
            <span>Audit Ref: {APP_VERSION_LABEL}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hover:underline">Home</Link>
            <Link to="/changelog" className="hover:underline">Changelog</Link>
            <Link to="/feedback" className="hover:underline">Feedback</Link>
          </div>
        </div>
      </main>
    </div>
  );
};
