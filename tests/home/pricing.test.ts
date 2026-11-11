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
});
