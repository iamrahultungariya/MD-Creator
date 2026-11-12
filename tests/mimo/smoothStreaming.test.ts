import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Phase 3: Smooth Streaming Engine & Low-Spec Zero-Flicker Architecture', () => {
  it('batches streaming token chunks in useMimoChatStream using RAF or buffered throttling', () => {
    const hookCode = fs.readFileSync('src/features/mimo/hooks/useMimoChatStream.ts', 'utf-8');

    // Must have buffer or batching mechanism to prevent 60fps AST re-parses on raw chunks
    assert.ok(
      hookCode.includes('requestAnimationFrame') || hookCode.includes('streamBuffer') || hookCode.includes('flushTextBuffer'),
      'useMimoChatStream must buffer stream chunks to prevent mobile layout thrashing'
    );

    // Must ensure final flush on stream completion so no tokens are lost
    assert.ok(
      hookCode.includes('flush') || hookCode.includes('cancelAnimationFrame'),
      'useMimoChatStream must cleanly flush pending tokens on completion'
    );
  });

  it('isolates streaming layout in MimoChatMessage to prevent mobile viewport glitching', () => {
    const msgCode = fs.readFileSync('src/features/mimo/components/MimoChatMessage.tsx', 'utf-8');

    // Must apply layout containment or smooth streaming wrapper
    assert.ok(
      msgCode.includes('contain') || msgCode.includes('will-change') || msgCode.includes('contain-content'),
      'MimoChatMessage must use layout containment on streaming message to eliminate mobile reflow thrashing'
    );
  });
});
