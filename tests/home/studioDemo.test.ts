import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Studio Workspace Demo', () => {
  it('defines 4 interactive modes without glassmorphism', () => {
    const code = fs.readFileSync('src/components/home/StudioWorkspaceDemo.tsx', 'utf-8');
    assert.ok(code.includes('specs'), 'Supports technical specs mode');
    assert.ok(code.includes('math'), 'Supports KaTeX math mode');
    assert.ok(code.includes('mimo'), 'Supports Mimo diff mode');
    assert.ok(code.includes('export'), 'Supports print export preview mode');
    assert.ok(!code.includes('backdrop-blur'), 'No glassmorphism allowed');
  });
});
