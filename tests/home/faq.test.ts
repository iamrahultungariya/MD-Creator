import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('FAQ Section Compliance', () => {
  it('answers core privacy, local storage, and export questions', () => {
    const code = fs.readFileSync('src/components/home/FaqSection.tsx', 'utf-8');
    assert.ok(code.includes('Where are my documents saved?'), 'Offline storage question');
    assert.ok(code.includes('Gemini'), 'Gemini API key question');
    assert.ok(code.includes('divide-y'), 'Uses 1px hairline dividers');
    assert.ok(!code.includes('backdrop-blur'), 'No glassmorphism');
  });
});
