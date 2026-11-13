import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 1: ModalPortal Primitive', () => {
  it('creates ModalPortal with createPortal, body scroll lock, and escape handler', () => {
    assert.ok(
      fs.existsSync('src/components/common/ModalPortal.tsx'),
      'src/components/common/ModalPortal.tsx must exist'
    );
    const code = fs.readFileSync('src/components/common/ModalPortal.tsx', 'utf-8');
    assert.ok(code.includes('createPortal'), 'ModalPortal must use createPortal');
    assert.ok(code.includes('document.body.style.overflow'), 'ModalPortal must manage body scroll lock');
    assert.ok(code.includes('Escape'), 'ModalPortal must handle Escape key');
  });
});
