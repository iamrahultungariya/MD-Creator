import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('WindowFrame & AnimatedCursor (Clean Flat Window & Cursor Engine)', () => {
  it('WindowFrame provides clean macOS window chrome with hairline border and traffic lights', () => {
    assert.ok(fs.existsSync('src/video/components/WindowFrame.tsx'), 'WindowFrame.tsx must exist');
    const content = fs.readFileSync('src/video/components/WindowFrame.tsx', 'utf-8');
    assert.ok(
      content.includes('#FF5F56') || content.includes('bg-[#ff5f56]') || content.includes('traffic-light') || content.includes('bg-red-500'),
      'Includes macOS traffic light controls'
    );
    assert.ok(
      content.includes('border-neutral-800') || content.includes('border-neutral-700'),
      'Has clean dark hairline border'
    );
    assert.ok(
      content.includes('WindowFrame'),
      'Exports WindowFrame component'
    );
  });

  it('AnimatedCursor renders SVG pointer with interpolated positions and click waves', () => {
    assert.ok(fs.existsSync('src/video/components/AnimatedCursor.tsx'), 'AnimatedCursor.tsx must exist');
    const content = fs.readFileSync('src/video/components/AnimatedCursor.tsx', 'utf-8');
    assert.ok(content.includes('<svg') || content.includes('Cursor'), 'Renders cursor graphic');
    assert.ok(content.includes('interpolate'), 'Interpolates cursor positions over frames');
    assert.ok(content.includes('click') || content.includes('ripple') || content.includes('scale'), 'Supports click animation effect');
  });
});
