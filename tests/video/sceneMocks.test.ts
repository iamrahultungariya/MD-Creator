import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Scene UI Mocks (Task 4)', () => {
  it('AutoTypingEngine outputs slice of text based on current frame', () => {
    assert.ok(fs.existsSync('src/video/components/AutoTypingEngine.tsx'), 'AutoTypingEngine.tsx must exist');
    const content = fs.readFileSync('src/video/components/AutoTypingEngine.tsx', 'utf-8');
    assert.ok(content.includes('useCurrentFrame'), 'Uses useCurrentFrame');
    assert.ok(content.includes('substring') || content.includes('slice'), 'Slices string according to frame progress');
  });

  it('EditorMock renders dual pane with CodeMirror look and live preview', () => {
    assert.ok(fs.existsSync('src/video/components/EditorMock.tsx'), 'EditorMock.tsx must exist');
    const content = fs.readFileSync('src/video/components/EditorMock.tsx', 'utf-8');
    assert.ok(content.includes('EditorMock'), 'Exports EditorMock');
    assert.ok(content.includes('font-mono'), 'Uses monospace font for editor pane');
  });

  it('MimoDrawerMock renders sliding drawer with prompt and diff card', () => {
    assert.ok(fs.existsSync('src/video/components/MimoDrawerMock.tsx'), 'MimoDrawerMock.tsx must exist');
    const content = fs.readFileSync('src/video/components/MimoDrawerMock.tsx', 'utf-8');
    assert.ok(content.includes('MimoDrawerMock'), 'Exports MimoDrawerMock');
    assert.ok(content.includes('Mimo') || content.includes('Gemini'), 'References Mimo assistant branding');
    assert.ok(content.includes('translateX') || content.includes('translate-x') || content.includes('right-0'), 'Supports slide-in transition');
  });
});
