import { describe, it } from 'node:test';
import assert from 'node:assert';
import { resolveThinkingBudget } from '../../src/features/mimo/services/mimoGeminiService';

describe('resolveThinkingBudget', () => {
  it('returns 0 thinking budget for DOC_TRANSFORM to eliminate latency and token waste on simple edits', () => {
    const budget = resolveThinkingBudget('DOC_TRANSFORM', 'LOW', 'gemini-3.8-flash');
    assert.strictEqual(budget, 0);
  });

  it('returns constrained budget for DOC_QUERY', () => {
    const budget = resolveThinkingBudget('DOC_QUERY', 'MEDIUM', 'gemini-3.8-flash');
    assert.strictEqual(budget, 512);
  });

  it('returns deeper budget for high complexity reasoning', () => {
    const budget = resolveThinkingBudget('DOC_QUERY', 'HIGH', 'gemini-3.8-flash');
    assert.strictEqual(budget, 1024);
  });

  it('returns undefined budget for non-reasoning model tiers like flash-lite', () => {
    const budget = resolveThinkingBudget('DOC_QUERY', 'HIGH', 'gemini-3.5-flash-lite');
    assert.strictEqual(budget, undefined);
  });
});
