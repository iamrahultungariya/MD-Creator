import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  ChevronRight, 
  Minus
} from 'lucide-react';
import { useCheckoutModalStore } from '../stores/useCheckoutModalStore';
import { SubscriptionPlanId } from '../services/paymentService';

interface FeatureRow {
  category: string;
  name: string;
  free: boolean | string;
  lifetime: boolean | string;
  pro: boolean | string;
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
  { category: 'Sync & Backup', name: 'Unlimited delta version snapshots & diff viewer', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Client-side HTML, Markdown & browser print', free: true, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Camera-ready Vector PDF export [Beta]', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Microsoft Word (.docx) with equations [Beta]', free: false, lifetime: true, pro: true },
  { category: 'Publication Suite', name: 'Password-protected public sharing links', free: false, lifetime: true, pro: true },
];

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'annual' | 'monthly'>('annual');

  const handleCta = (action: 'editor' | 'auth', tierId: string) => {
    if (action === 'editor') {
      navigate('/editor');
    } else {
      const planId: SubscriptionPlanId = tierId === 'lifetime' ? 'lifetime' : 'pro_monthly';
      useCheckoutModalStore.getState().openCheckout(planId);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAFD] dark:bg-[#0E0B14] text-neutral-900 dark:text-[#EDEAF5] font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
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
        {/* Pricing Hero */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 font-mono text-xs select-none">
            <span>ZERO SCARCITY • HONEST PRICING</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-[-0.03em] text-neutral-950 dark:text-white leading-tight">
            Local core free forever. Pay only for sync &amp; studio exports.
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Your personal files, offline database, and Gemini BYOK never expire. Upgrade to Early-Bird Lifetime or Pro Studio when you need cloud sync and camera-ready exports.
          </p>

          {/* Billing Interval Switcher */}
          <div className="pt-4 flex items-center justify-center">
            <div className="inline-flex items-center p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-2xs">
              <button
                type="button"
                onClick={() => setBillingInterval('annual')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  billingInterval === 'annual'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="ml-1.5 font-mono text-[10px] text-brand-600 dark:text-brand-400 font-bold">
                  Save 25%
                </span>
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval('monthly')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  billingInterval === 'monthly'
                    ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-xs font-semibold'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
            </div>
          </div>
        </div>

        {/* 3 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {/* Card 1: Free Forever */}
          <div className="p-6 sm:p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-xs flex flex-col justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-2">
                Free Forever (BYOK)
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[32px] mb-6">
                Pure distraction-free writing for developers, researchers, and students.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono">
                  $0
                </span>
                <div className="text-xs font-mono text-neutral-500 mt-1">Free forever • No credit card</div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>100% Local-first IndexedDB storage</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>File System API local disk folder access</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>GitHub Flavored Markdown &amp; KaTeX equations</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Direct BYOK Google Gemini 3.x key connection</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Client-side HTML, Markdown &amp; browser print</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleCta('editor', 'free')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              Start Free
            </button>
          </div>

          {/* Card 2: Early-Bird Lifetime (Featured) */}
          <div className="p-6 sm:p-8 rounded-2xl border-2 border-brand-500/70 dark:border-brand-500/60 bg-white dark:bg-neutral-900 shadow-md flex flex-col justify-between relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-mono text-[10px] font-bold uppercase tracking-wider shadow-xs">
              Early-Bird Deal
            </div>
            <div>
              <div className="font-mono text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400 font-semibold mb-2">
                Early-Bird Lifetime
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[32px] mb-6">
                Permanent access with lifetime updates for craft-focused writers.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono">
                    $49
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">one-time</span>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1">One-time payment • Lifetime updates</div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span><strong>Everything in Free Forever</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>Lifetime license for all future v2.x and v3.x releases</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>Encrypted multi-device cloud backup &amp; sync</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>Unlimited delta version snapshots &amp; diff viewer</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <span>Publication Vector PDF &amp; Word DOCX export [Beta]</span>
                </li>
              </ul>
            </div>
            <button
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
              <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[32px] mb-6">
                Continuous cross-device sync and managed AI quota for professionals.
              </p>
              <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-neutral-950 dark:text-white font-mono">
                    {billingInterval === 'annual' ? '$6' : '$8'}
                  </span>
                  <span className="text-xs text-neutral-500 font-mono">/month</span>
                </div>
                <div className="text-xs font-mono text-neutral-500 mt-1">
                  {billingInterval === 'annual' ? 'Billed annually ($72/yr)' : 'Billed monthly'}
                </div>
              </div>
              <ul className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300 mb-8">
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Everything in Free Forever</strong></span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Continuous encrypted cloud sync across devices</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Managed Gemini 3.x AI quota without personal GCP key</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Password-protected public sharing links</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Priority email &amp; Discord engineering support</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleCta('auth', 'pro')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all cursor-pointer shadow-xs"
            >
              Start 14-Day Trial
            </button>
          </div>
        </div>

        {/* Feature Comparison Matrix Table */}
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
                  <th className="py-4 px-6 font-semibold text-neutral-700 dark:text-neutral-300 text-center w-28 sm:w-36">Pro ($8/mo)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/80">
                {COMPARISON_FEATURES.map((feat, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-neutral-800 dark:text-neutral-200">
                      {feat.name}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {feat.free === true ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center bg-brand-500/5 font-semibold text-brand-600 dark:text-brand-400">
                      {feat.lifetime === true ? (
                        <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-center">
                      {feat.pro === true ? (
                        <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <Minus className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />
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
