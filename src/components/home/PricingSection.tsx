import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface PricingTier {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  monthlyPrice: string;
  annualPrice: string;
  annualBilled: string;
  lifetimePrice?: string;
  isPopular?: boolean;
  ctaText: string;
  ctaAction: 'editor' | 'auth' | 'contact';
  features: Array<{ text: string; highlight?: boolean; beta?: boolean; roadmap?: boolean }>;
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Starter & BYOK',
    tagline: 'Pure distraction-free writing for developers, researchers, and students.',
    monthlyPrice: '$0',
    annualPrice: '$0',
    annualBilled: 'Free forever',
    ctaText: 'Start Writing Free',
    ctaAction: 'editor',
    features: [
      { text: '100% Local-First with offline IndexedDB' },
      { text: 'Direct local folder access via File System API (Ctrl+O)' },
      { text: 'Full GitHub Flavored Markdown, KaTeX & Mermaid' },
      { text: 'Direct BYOK for Google Gemini 3.x Family', highlight: true },
      { text: 'Standard Markdown & browser print export' },
      { text: '15+ curated markdown blueprints' },
      { text: 'Zero mandatory account required to write' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Writer',
    tagline: 'Continuous cross-device sync, delta history, and publication-ready studio exports.',
    badge: 'Most Popular',
    monthlyPrice: '$8',
    annualPrice: '$6',
    annualBilled: '$72 billed annually',
    lifetimePrice: '$49 Lifetime Early-Bird',
    isPopular: true,
    ctaText: 'Upgrade to Pro',
    ctaAction: 'auth',
    features: [
      { text: 'Everything in Free' },
      { text: 'Encrypted multi-device sync across laptops, tablets & phones', highlight: true },
      { text: 'Unlimited version snapshots & delta diff restore' },
      { text: 'Publication-Grade Vector PDF Studio', beta: true },
      { text: 'Microsoft Word (.docx) export with tables & callouts', beta: true },
      { text: 'Password-protected public sharing links' },
      { text: '"View & Propose Changes" collaborative mode' },
      { text: 'Hosted AI Infrastructure', roadmap: true },
    ],
  },
  {
    id: 'team',
    name: 'Team & Organization',
    tagline: 'Centralized knowledge vaults and shared documentation for engineering teams.',
    monthlyPrice: '$16',
    annualPrice: '$12',
    annualBilled: 'per user / month billed annually',
    ctaText: 'Create Team Vault',
    ctaAction: 'auth',
    features: [
      { text: 'Everything in Pro' },
      { text: 'Shared team workspace vaults & folders' },
      { text: 'Shared organization blueprints & templates' },
      { text: 'Role-based access control (Admin, Editor, Viewer)' },
      { text: 'Priority sync infrastructure & unified billing' },
      { text: 'Dedicated support & onboarding' },
    ],
  },
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  const handleCta = (action: string) => {
    if (action === 'editor') {
      navigate('/editor');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="pricing" className="py-20 sm:py-28 relative overflow-hidden bg-neutral-50/50 dark:bg-neutral-900/20 border-t border-neutral-200/80 dark:border-neutral-800 transition-colors font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>TRANSPARENT PRICING</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 dark:text-white tracking-[-0.03em] leading-tight">
            Local core free forever. Pay for sync &amp; studio power.
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your local files and BYOK AI are never locked behind a paywall. Support development and unlock continuous cloud backup, unlimited revisions, and publication exports.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xs mt-2">
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                billingCycle === 'annual'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">Save 25%</span>
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const isAnnual = billingCycle === 'annual';
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const billedNote = isAnnual ? tier.annualBilled : 'billed monthly';

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
                  tier.isPopular
                    ? 'bg-white dark:bg-neutral-900 border-2 border-brand-500/80 shadow-md ring-1 ring-brand-500/20'
                    : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs'
                }`}
              >
                {/* Popular Pill */}
                {tier.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-brand-600 text-white font-semibold text-[10px] tracking-wide uppercase shadow-xs">
                    {tier.badge}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Card Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold text-neutral-950 dark:text-white tracking-tight">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed min-h-[34px]">
                      {tier.tagline}
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-neutral-950 dark:text-white tracking-tight">
                        {price}
                      </span>
                      {tier.monthlyPrice !== '$0' && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">/ month</span>
                      )}
                    </div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {billedNote}
                    </div>

                    {/* Lifetime Pill Option for Pro */}
                    {tier.lifetimePrice && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                        <Zap className="w-3 h-3 text-emerald-500" />
                        <span>Or <strong>{tier.lifetimePrice}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                      Included Capabilities
                    </div>
                    <ul className="space-y-2 text-xs text-neutral-700 dark:text-neutral-300">
                      {tier.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className={feat.highlight ? 'font-semibold text-neutral-950 dark:text-white' : ''}>
                            {feat.text}
                            {feat.beta && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                Beta
                              </span>
                            )}
                            {feat.roadmap && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded-md text-[9px] font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                                In Dev
                              </span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Button */}
                <div className="pt-6 mt-6 border-t border-neutral-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleCta(tier.ctaAction)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-2xs active:translate-y-[1px] ${
                      tier.isPopular
                        ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                        : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-900'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 text-center max-w-xl mx-auto shadow-2xs">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>14-day money-back guarantee on Pro subscriptions. Cancel anytime in one click.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
