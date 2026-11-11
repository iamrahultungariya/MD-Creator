import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

interface PricingTier {
  id: string;
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
    tagline: 'Pure distraction-free writing for developers, researchers, and students.',
    priceDisplay: {
      monthly: '$0',
      annual: '$0',
      note: 'Free forever • No credit card',
    },
    ctaText: 'Start Free',
    ctaAction: 'editor',
    features: [
      '100% Local-first IndexedDB storage',
      'Direct local folder access via File System API',
      'GitHub Flavored Markdown & KaTeX equations',
      'Direct BYOK Google Gemini 3.x key connection',
      'Client-side HTML, Markdown & browser print export',
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
      note: 'One-time payment • Lifetime updates',
    },
    ctaText: 'Get Lifetime Access',
    ctaAction: 'auth',
    features: [
      'Everything in Free Forever',
      'Lifetime license for all future v2.x and v3.x releases',
      'Encrypted multi-device cloud backup & sync',
      'Unlimited delta version snapshots & rollback',
      'Camera-ready publication PDF studio export',
      'Clean Word DOCX conversion with equations',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Studio',
    tagline: 'Continuous cross-device sync and managed AI quota for teams and professionals.',
    priceDisplay: {
      monthly: '$8',
      annual: '$6',
      note: 'per month • billed annually or $8 monthly',
    },
    ctaText: 'Start 14-Day Trial',
    ctaAction: 'auth',
    features: [
      'Everything in Free Forever',
      'Encrypted cloud synchronization across devices',
      'Managed Gemini 3.x AI quota without personal GCP key',
      'Delta revision history & diff viewer',
      'Password-protected public sharing links',
      'Priority email & Discord engineering support',
    ],
  },
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<'annual' | 'monthly'>('annual');

  const handleCta = (action: 'editor' | 'auth') => {
    if (action === 'editor') {
      navigate('/editor');
    } else {
      navigate('/auth');
    }
  };

  return (
    <section id="pricing" className="py-16 sm:py-24 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-12 max-w-2xl">
          <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest mb-2">
            Pricing Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.03em] text-neutral-950 dark:text-white">
            Local core free forever. Pay for sync &amp; studio power.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Your local files and BYOK AI are never locked behind a paywall. Upgrade when you need encrypted multi-device sync and camera-ready exports.
          </p>

          {/* Billing Interval Toggle with Global rounded-xl Container and rounded-lg Buttons */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shadow-2xs">
            <button
              onClick={() => setBillingInterval('annual')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                billingInterval === 'annual'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Annual (Save 25%)
            </button>
            <button
              onClick={() => setBillingInterval('monthly')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                billingInterval === 'monthly'
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards with Global rounded-2xl Token */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {TIERS.map((tier) => {
            const price = billingInterval === 'annual' ? tier.priceDisplay.annual : tier.priceDisplay.monthly;

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
                  {/* Top Label & Featured Badge with rounded-full */}
                  <div className="flex items-center justify-between mb-3 min-h-[22px]">
                    <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold">
                      {tier.name}
                    </span>
                    {tier.featuredBadge && (
                      <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-brand-300 dark:border-brand-700 bg-brand-50 dark:bg-brand-950/80 text-brand-700 dark:text-brand-300 font-medium">
                        {tier.featuredBadge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 dark:text-neutral-400 min-h-[32px] leading-relaxed mb-6">
                    {tier.tagline}
                  </p>

                  {/* Price */}
                  <div className="mb-6 pb-6 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white tabular-nums">
                        {price}
                      </span>
                      {tier.id === 'pro' && (
                        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                          /month
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-1">
                      {tier.priceDisplay.note}
                    </div>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 mb-8">
                    <div className="text-[11px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-semibold font-mono">
                      Capabilities
                    </div>
                    {tier.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                        <Check className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button with Global rounded-xl Token */}
                <button
                  onClick={() => handleCta(tier.ctaAction)}
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
