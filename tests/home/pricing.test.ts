import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Pricing Matrix Architecture', () => {
  it('features Free BYOK, Lifetime Early-Bird, and Pro tiers without fake scarcity', () => {
    const code = fs.readFileSync('src/components/home/PricingSection.tsx', 'utf-8');
    assert.ok(code.includes('$0'), 'Free BYOK tier');
    assert.ok(code.includes('$49'), 'Early bird lifetime tier');
    assert.ok(code.includes('$8') || code.includes('$6'), 'Pro studio tier');
    assert.ok(!code.includes('HURRY'), 'No fake countdown scarcity');
  });

  it('scopes the monthly/annual billing toggle inside the Pro Studio card and removes card icons', () => {
    const sectionCode = fs.readFileSync('src/components/home/PricingSection.tsx', 'utf-8');
    const pageCode = fs.readFileSync('src/pages/PricingPage.tsx', 'utf-8');

    // No Lucide Check / Minus decorative icons in pricing cards
    assert.ok(!sectionCode.includes('lucide-react'), 'PricingSection must not import decorative icons');
    assert.ok(!pageCode.includes('<Check'), 'PricingPage must not render Check icons in cards or matrix');
    assert.ok(!pageCode.includes('<Minus'), 'PricingPage must not render Minus icons in comparison table');

    // No backdrop-blur glassmorphism on PricingPage sticky header
    assert.ok(!pageCode.includes('backdrop-blur'), 'PricingPage must use flat solid surfaces without glassmorphism');

    // Pro Studio CTA must route both pro_annual and pro_monthly accurately
    assert.ok(
      sectionCode.includes("'pro_annual'") && sectionCode.includes("'pro_monthly'"),
      'PricingSection must route both pro_annual and pro_monthly'
    );
    assert.ok(
      pageCode.includes("'pro_annual'") && pageCode.includes("'pro_monthly'"),
      'PricingPage must route both pro_annual and pro_monthly'
    );

    // Billing toggle must live inside the Pro card block rather than the section/hero header
    const sectionHeaderEnd = sectionCode.indexOf('{/* 3 Pricing Cards');
    assert.ok(sectionHeaderEnd > 0);
    assert.ok(
      !sectionCode.slice(0, sectionHeaderEnd).includes("setBillingInterval('annual')"),
      'PricingSection header must not contain global billing interval toggle'
    );

    const proCardStart = pageCode.indexOf('{/* Card 3: Pro Studio */}');
    assert.ok(proCardStart > 0);
    assert.ok(
      !pageCode.slice(0, proCardStart).includes("setBillingInterval('annual')"),
      'PricingPage hero must not contain global billing interval toggle'
    );
    assert.ok(
      pageCode.slice(proCardStart).includes("setBillingInterval('annual')"),
      'PricingPage Pro Studio card must contain billing interval toggle'
    );
  });
});
