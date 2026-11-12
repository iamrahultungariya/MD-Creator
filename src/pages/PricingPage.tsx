import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useCheckoutModalStore } from '../stores/useCheckoutModalStore';
import { SubscriptionPlanId } from '../services/paymentService';

interface FeatureRow {
  category: string;
  name: string;
  free: boolean;
  lifetime: boolean;
  pro: boolean;
}

const COMPARISON_FEATURES: FeatureRow[] = [
  { category: 'Core Writing', name: '100% Local-first IndexedDB storage', free: true, lifetime: true, pro: true },
  { category: 'Core Writing', name: 'File System Access API (Ctrl+O disk folders)', free: true, lifetime: true, pro: true },
  { category: 'Core Writing', name: 'GitHub Flavored Markdown & CodeMirror 6', free: true, lifetime: true, pro: true },
  { category: 'Typesetting', name: 'KaTeX LaTeX math ($...$ and $$...$$)', free: true, lifetime: true, pro: true },
  { category: 'Typesetting', name: 'Interactive Mermaid 11.x diagrams', free: true, lifetime: true, pro: true },
  { category: 'Typesetting', name: 'WYSIWYG spreadsheet table editor & CSV paste', free: true, lifetime: true, pro: true },
  { category: 'AI Intelligence', name: 'Google Gemini 3.x BYOK (Free API key)', free: true, lifetime: true, pro: true },
  { category: 'AI Intelligence', name: 'AST Section Surgeon & Non-destructive diffs', free: true, lifetime: true, pro: true },
  { category: 'AI Intelligence', name: 'Managed AI quota without personal GCP key', free: false, lifetime: false, pro: true },
  { category: 'Sync & Backup', name: 'Encrypted multi-device cloud synchronization', free: false, lifetime: true, pro: true },
  { category: 'Sync & Backup', name: 'Continuous delta version snapshots & diff viewer', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Client-side HTML, Markdown & browser print', free: true, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Camera-ready Vector PDF export [Beta]', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Microsoft Word (.docx) with equations [Beta]', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Password-protected public sharing links', free: false, lifetime: true, pro: true },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'annual' | 'monthly'>('annual');

  const handleCta = (action: 'editor' | 'auth', tierId: 'free' | 'lifetime' | 'pro') => {
    if (action === 'editor') {
      navigate('/editor');
      return;
    }

    const planId: SubscriptionPlanId =
      tierId === 'lifetime'
        ? 'lifetime'
        : billingInterval === 'annual'
        ? 'pro_annual'
        : 'pro_monthly';

    useCheckoutModalStore.getState().openCheckout(planId);
  };

  return (
    <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-neutral-900 dark:text-[#EDEAF5] font-sans transition-colors duration-200">
      {/* Top Header (Flat solid surface) */}
      <header className="sticky top-0 z-40 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 select-none group">
              <img src="/logo.png" alt="MD Writer" className="w-6 h-6 rounded-md object-contain" />
              <span className="font-semibold text-sm tracking-tight text-neutral-950 dark:text-white">
                MD Writer
              </span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Pricing
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/blog"
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white font-medium px-2 py-1"
            >
              Blog
            </Link>
            <Link
              to="/editor"
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Open Studio
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        {/* Pricing Hero (No global billing toggle) */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono text-xs select-none">
            <span>ZERO SCARCITY · HONEST PRICING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-neutral-950 dark:text-white leading-tight">
            Local core free forever. Pay only for sync &amp; studio exports.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Your personal files, offline database, and Gemini BYOK never expire. Upgrade to Early-Bird Lifetime or Pro Studio when you need cloud sync and camera-ready exports.
          </p>
        </div>

        {/* 3 Tier Cards (Zero Icons, Scoped Pro Toggle) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {/* Card 1: Free Forever */}
          <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                Free Forever (BYOK)
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[34px] mb-6 leading-relaxed">
                Pure distraction-free writing for developers, researchers, and students.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono tabular-nums">
                  $0
                </span>
                <div className="text-xs font-mono text-neutral-500 mt-1.5">
                  Free forever · No credit card
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold font-mono mb-3">
                Included
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/70 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="py-2 first:pt-0 last:pb-0">100% Local-first IndexedDB storage</li>
                <li className="py-2 first:pt-0 last:pb-0">File System API local disk folder access</li>
                <li className="py-2 first:pt-0 last:pb-0">GitHub Flavored Markdown &amp; KaTeX equations</li>
                <li className="py-2 first:pt-0 last:pb-0">Direct BYOK Google Gemini 3.x connection</li>
                <li className="py-2 first:pt-0 last:pb-0">Client-side HTML, Markdown &amp; browser print</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => handleCta('editor', 'free')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              Start Free
            </button>
          </div>

          {/* Card 2: Early-Bird Lifetime (Featured) */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-brand-500/70 dark:border-brand-500/60 bg-white dark:bg-neutral-900 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs whitespace-nowrap">
              Early-Bird Deal
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold mb-2">
                Early-Bird Lifetime
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[34px] mb-6 leading-relaxed">
                Permanent access with lifetime updates for craft-focused writers.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono tabular-nums">
                    $49
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">one-time</span>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1.5">
                  One-time payment · Lifetime updates
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold font-mono mb-3">
                Included
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/70 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="py-2 first:pt-0 last:pb-0 font-medium text-neutral-950 dark:text-white">
                  Everything in Free Forever
                </li>
                <li className="py-2 first:pt-0 last:pb-0">Lifetime license for all future v2.x and v3.x releases</li>
                <li className="py-2 first:pt-0 last:pb-0">Encrypted multi-device cloud backup &amp; sync</li>
                <li className="py-2 first:pt-0 last:pb-0">Continuous delta version snapshots &amp; diff viewer</li>
                <li className="py-2 first:pt-0 last:pb-0">Publication Vector PDF &amp; Word DOCX export [Beta]</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => handleCta('auth', 'lifetime')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-all cursor-pointer shadow-xs hover:shadow"
            >
              Get Lifetime Access ($49)
            </button>
          </div>

          {/* Card 3: Pro Studio */}
          <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                Pro Studio
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[34px] mb-6 leading-relaxed">
                Continuous cross-device sync and managed AI quota for professionals.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono tabular-nums">
                      {billingInterval === 'annual' ? '$6' : '$8'}
                    </span>
                    <span className="text-xs text-neutral-500 font-mono">/mo</span>
                  </div>

                  {/* Billing Interval Switcher Scoped Strictly Inside Pro Studio Card */}
                  <div
                    role="group"
                    aria-label="Pro Studio billing interval"
                    className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-950 shrink-0"
                  >
                    <button
                      type="button"
                      aria-pressed={billingInterval === 'annual'}
                      onClick={() => setBillingInterval('annual')}
                      className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        billingInterval === 'annual'
                          ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      Yearly -25%
                    </button>
                    <button
                      type="button"
                      aria-pressed={billingInterval === 'monthly'}
                      onClick={() => setBillingInterval('monthly')}
                      className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        billingInterval === 'monthly'
                          ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      Monthly
                    </button>
                  </div>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1.5 tabular-nums">
                  {billingInterval === 'annual'
                    ? 'Billed annually ($72/yr) · Save 25%'
                    : 'Billed monthly · Cancel anytime'}
                </div>
              </div>
              <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold font-mono mb-3">
                Included
              </div>
              <ul className="divide-y divide-neutral-100 dark:divide-neutral-800/70 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="py-2 first:pt-0 last:pb-0 font-medium text-neutral-950 dark:text-white">
                  Everything in Free Forever
                </li>
                <li className="py-2 first:pt-0 last:pb-0">Continuous encrypted cloud sync across devices</li>
                <li className="py-2 first:pt-0 last:pb-0">Managed Gemini 3.x AI quota without personal GCP key</li>
                <li className="py-2 first:pt-0 last:pb-0">Password-protected public sharing links</li>
                <li className="py-2 first:pt-0 last:pb-0">Priority email &amp; engineering support</li>
              </ul>
            </div>
            <button
              type="button"
              onClick={() => handleCta('auth', 'pro')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              Start 14-Day Trial
            </button>
          </div>
        </div>

        {/* Feature Comparison Matrix Table (Plain-text status indicators, zero icon bloat) */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-neutral-950 dark:text-white">
              Full Feature Comparison
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Every detail of what is included in each tier.
            </p>
          </div>

          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-950/60 font-mono text-xs">
                  <th className="py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300">Feature</th>
                  <th className="py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300 text-center w-28 sm:w-36">Free ($0)</th>
                  <th className="py-4 px-6 font-semibold text-brand-600 dark:text-brand-400 text-center w-28 sm:w-36 bg-brand-500/5">Lifetime ($49)</th>
                  <th className="py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300 text-center w-28 sm:w-36 tabular-nums">
                    {billingInterval === 'annual' ? 'Pro ($6/mo)' : 'Pro ($8/mo)'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                {COMPARISON_FEATURES.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-neutral-800 dark:text-neutral-200">
                      {feat.name}
                    </td>
                    <td className="py-3.5 px-6 text-center font-mono text-xs">
                      {feat.free ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold" aria-label="Included">✓</span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-600" aria-label="Not included">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center bg-brand-500/5 font-mono text-xs">
                      {feat.lifetime ? (
                        <span className="text-brand-600 dark:text-brand-400 font-semibold" aria-label="Included">✓</span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-600" aria-label="Not included">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center font-mono text-xs">
                      {feat.pro ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold" aria-label="Included">✓</span>
                      ) : (
                        <span className="text-neutral-400 dark:text-neutral-600" aria-label="Not included">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing FAQ Section */}
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-neutral-950 dark:text-white">
              Pricing &amp; Guarantee Questions
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-neutral-950 dark:text-white mb-2">
                What does &quot;Early-Bird Lifetime&quot; actually mean?
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                You make a single payment of $49 and receive full Pro studio features and cloud synchronization forever. You never pay a recurring monthly subscription, and all future v2.x and v3.x updates are included.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-neutral-950 dark:text-white mb-2">
                If I don&apos;t pay anything, will I lose my notes?
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Never. MD Writer is 100% local-first. All your markdown files remain stored on your own device in your browser IndexedDB or your local computer hard drive. Free core writing will never be deprecated.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <h4 className="font-bold text-neutral-950 dark:text-white mb-2">
                How does the Google Gemini BYOK work with Free vs Pro?
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Free Forever users connect their personal Google AI Studio key (which has a generous free tier from Google). Pro users get access to managed Gemini quotas directly without needing their own Google Cloud console account.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
