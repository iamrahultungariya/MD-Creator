import { describe, it } from 'node:test';
import assert from 'node:assert';
import { getIntentSystemInstruction } from '../../src/features/mimo/services/intentPromptService';

describe('intentPromptService', () => {
  it('returns lean instruction for GENERAL_QA without diff blocks', () => {
    const prompt = getIntentSystemInstruction('GENERAL_QA');
    assert.ok(prompt.length < 500, `Prompt must be lean (<500 chars), got ${prompt.length}`);
    assert.ok(prompt.includes('Direct to the point from Token 1'));
    assert.ok(!prompt.includes('diff hunk'), 'Should not include diff instructions for general QA');
  });

  it('returns surgical diff instruction for DOC_TRANSFORM', () => {
    const prompt = getIntentSystemInstruction('DOC_TRANSFORM');
    assert.ok(prompt.includes('```diff') || prompt.includes('```replacement'));
    assert.ok(prompt.includes('Surgically') || prompt.includes('surgical'));
  });

  it('returns clarification/quiz instruction for DOC_QUERY when asked', () => {
    const prompt = getIntentSystemInstruction('DOC_QUERY');
    assert.ok(prompt.includes('Accurately reference'));
  });
});
