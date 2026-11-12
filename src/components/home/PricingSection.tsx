import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutModalStore } from '../../stores/useCheckoutModalStore';
import { SubscriptionPlanId } from '../../services/paymentService';

interface PricingTier {
  id: 'free' | 'lifetime' | 'pro';
  name: string;
  tagline: string;
  priceDisplay: {
    monthly: string;
    annual: string;
    note: string;
  };
  isFeatured?: boolean;
  featuredBadge?: string;
  ctaText: string;
  ctaAction: 'editor' | 'auth';
  features: string[];
}

const TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free Forever (BYOK)',
    tagline: 'Distraction-free local writing for developers, researchers, and students.',
    priceDisplay: {
      monthly: '$0',
      annual: '$0',
      note: 'Free forever · No credit card',
    },
    ctaText: 'Start Free',
    ctaAction: 'editor',
    features: [
      '100% local-first IndexedDB storage',
      'Direct disk folder access via File System API',
      'GitHub Flavored Markdown & KaTeX equations',
      'Direct BYOK Google Gemini 3.x connection',
      'Client-side HTML, Markdown & browser print',
      '15+ curated markdown blueprints',
    ],
  },
  {
    id: 'lifetime',
    name: 'Early-Bird Lifetime',
    tagline: 'Permanent access with lifetime updates for craft-focused writers.',
    isFeatured: true,
    featuredBadge: 'Early-Bird Deal',
    priceDisplay: {
      monthly: '$49',
      annual: '$49',
      note: 'One-time payment · Lifetime updates',
    },
    ctaText: 'Get Lifetime Access',
    ctaAction: 'auth',
    features: [
      'Everything in Free Forever',
      'Lifetime license for all future v2.x & v3.x releases',
      'Encrypted multi-device cloud backup & sync',
      'Full delta version snapshots & rollback history',
      'Camera-ready Vector PDF studio export',
      'Clean Word DOCX conversion with equations',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Studio',
    tagline: 'Continuous cross-device sync and managed AI quota without a personal key.',
    priceDisplay: {
      monthly: '$8',
      annual: '$6',
      note: 'Billed annually ($72/yr) or $8 monthly',
    },
    ctaText: 'Start 14-Day Trial',
    ctaAction: 'auth',
    features: [
      'Everything in Free Forever',
      'Encrypted cloud synchronization across devices',
      'Managed Gemini 3.x AI quota without personal GCP key',
      'Delta revision history & diff viewer',
      'Password-protected public sharing links',
      'Priority email & engineering support',
    ],
  },
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'annual' | 'monthly'>('annual');

  const handleCta = (action: 'editor' | 'auth', tierId: PricingTier['id']) => {
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
    <section id="pricing" className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header (Clean, zero global billing toggle) */}
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
            Pricing Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Local core free forever. Pay for sync &amp; studio power.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your local files and personal AI keys are never locked behind a paywall. Upgrade only when you want cloud sync and publication-grade exports.
          </p>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const isPro = tier.id === 'pro';
            const price = isPro
              ? billingInterval === 'annual'
                ? tier.priceDisplay.annual
                : tier.priceDisplay.monthly
              : tier.priceDisplay.monthly;

            const priceNote = isPro
              ? billingInterval === 'annual'
                ? 'Billed annually ($72/yr) · Save 25%'
                : 'Billed monthly · Cancel anytime'
              : tier.priceDisplay.note;

            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-colors shadow-xs ${
                  tier.isFeatured
                    ? 'border-2 border-brand-500/80 bg-neutral-50/60 dark:bg-neutral-900/60 relative'
                    : 'border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950'
                }`}
              >
                <div>
                  {/* Top Label & Optional Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3 min-h-[22px]">
                    <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                      {tier.name}
                    </span>
                    {tier.featuredBadge && (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-medium whitespace-nowrap">
                        {tier.featuredBadge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[34px] leading-relaxed mb-5">
                    {tier.tagline}
                  </p>

                  {/* Price + Scoped Pro Interval Toggle */}
                  <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white tabular-nums">
                          {price}
                        </span>
                        {isPro && (
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                            /mo
                          </span>
                        )}
                      </div>

                      {isPro && (
                        <div
                          role="group"
                          aria-label="Pro Studio billing interval"
                          className="inline-flex items-center p-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0"
                        >
                          <button
                            type="button"
                            aria-pressed={billingInterval === 'annual'}
                            onClick={() => setBillingInterval('annual')}
                            className={`px-2 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                              billingInterval === 'annual'
                                ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs'
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
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
                                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
                            }`}
                          >
                            Monthly
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-1.5 tabular-nums">
                      {priceNote}
                    </div>
                  </div>

                  {/* Typographic Capability List (Zero Icons) */}
                  <div className="mb-8">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold font-mono mb-3">
                      Included
                    </div>
                    <ul className="divide-y divide-neutral-100 dark:divide-neutral-900 text-xs text-neutral-700 dark:text-neutral-300">
                      {tier.features.map((feature, fIdx) => (
                        <li key={fIdx} className="py-2 first:pt-0 last:pb-0 leading-snug">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action CTA Button */}
                <button
                  type="button"
                  onClick={() => handleCta(tier.ctaAction, tier.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold active:translate-y-[1px] transition-all cursor-pointer shadow-xs ${
                    tier.isFeatured
                      ? 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow'
                      : 'border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {tier.ctaText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
