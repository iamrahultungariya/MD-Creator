import { describe, it } from 'node:test';
import assert from 'node:assert';
import { prepareMimoContext } from '../../src/features/mimo/services/contextEngine';

describe('contextEngine token guard', () => {
  it('does NOT include raw content for GENERAL_QA even when document is under 300 LOC', () => {
    const content = '# My Private Diary\nLine 2\nLine 3\nSecret password is 1234';
    const ctx = prepareMimoContext({
      docId: 'doc-1',
      title: 'Private Diary',
      content,
      userPrompt: 'What is the theory of relativity?',
      cursorLine: 1,
    });

    assert.strictEqual(ctx.contextMode, 'summary');
    assert.ok(
      !ctx.contextText.includes('Secret password is 1234'),
      'Must not leak raw document content in GENERAL_QA mode'
    );
  });

  it('provides selection_focused mode with minimal tokens when user has text selected', () => {
    const content = '# Heading\nSelected line here\nOther secret text';
    const ctx = prepareMimoContext({
      docId: 'doc-1',
      title: 'Doc',
      content,
      userPrompt: 'Improve this sentence',
      selectedText: 'Selected line here',
      cursorLine: 2,
    });

    assert.strictEqual(ctx.contextMode, 'selection_focused');
    assert.ok(ctx.contextText.includes('Selected line here'));
    assert.ok(!ctx.contextText.includes('Other secret text'));
  });

  it('includes full document context when document-wide analysis or editing is requested', () => {
    const content = '# Heading\nContent line 1\nContent line 2';
    const ctx = prepareMimoContext({
      docId: 'doc-1',
      title: 'Doc',
      content,
      userPrompt: 'Summarize this document',
      cursorLine: 1,
    });

    assert.strictEqual(ctx.contextMode, 'full_safe');
    assert.ok(ctx.contextText.includes('Content line 1'));
  });
});
