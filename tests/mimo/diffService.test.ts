import { describe, it } from 'node:test';
import assert from 'node:assert';
import { applyDiffHunkToDocument, extractDiffHunkFromResponse } from '../../src/features/mimo/services/diffService';
import { MimoDiffHunk } from '../../src/features/mimo/types/mimoTypes';

describe('diffService resilient replacement', () => {
  it('applies section replacement without corrupting KaTeX formula containing dollar signs', () => {
    const original = `# Section 1\nSome text\n\n# Section 2\nOld formula: $$x = 1$$\n\n# Section 3\nFooter`;
    const hunk: MimoDiffHunk = {
      id: 'test-1',
      originalLines: 'Old formula: $$x = 1$$',
      proposedLines: 'New formula: $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$ with $50 and $100',
    };

    const result = applyDiffHunkToDocument(original, hunk);
    assert.strictEqual(result.success, true);
    assert.ok(result.nextContent.includes('$$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$'));
    assert.ok(result.nextContent.includes('$50 and $100'));
    assert.ok(result.nextContent.includes('# Section 1'));
    assert.ok(result.nextContent.includes('# Section 3'));
  });

  it('matches diff hunk with minor line-ending differences (CRLF vs LF)', () => {
    const original = 'Line 1\r\nLine 2 to change\r\nLine 3';
    const hunk: MimoDiffHunk = {
      id: 'test-2',
      originalLines: 'Line 2 to change',
      proposedLines: 'Line 2 updated',
    };

    const result = applyDiffHunkToDocument(original, hunk);
    assert.strictEqual(result.success, true);
    assert.ok(result.nextContent.includes('Line 2 updated'));
  });

  it('extracts diff hunk cleanly from markdown response containing explanatory text', () => {
    const aiText = `I have updated the introduction for clarity:

\`\`\`diff
- - Old line that was verbose
+ + Modern concise line
\`\`\`

Let me know if this looks good!`;

    const { cleanText, hunk } = extractDiffHunkFromResponse(aiText);
    assert.ok(hunk !== null);
    assert.ok(hunk.proposedLines.includes('Modern concise line'));
    assert.ok(cleanText.includes('I have updated the introduction'));
  });
});
