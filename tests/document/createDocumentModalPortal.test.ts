import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 1: CreateDocumentModal Portal & Anti-Slop Architecture', () => {
  const modalCode = fs.readFileSync('src/components/document/CreateDocumentModal.tsx', 'utf-8');

  it('uses createPortal to mount directly to document.body', () => {
    assert.ok(
      modalCode.includes('createPortal') && modalCode.includes('document.body'),
      'CreateDocumentModal.tsx must use createPortal to mount to document.body'
    );
  });

  it('implements body scroll lock on mount and clean restoration on unmount', () => {
    assert.ok(
      modalCode.includes('document.body.style.overflow'),
      'CreateDocumentModal.tsx must manage document.body.style.overflow'
    );
  });

  it('replaces all banned transition-all instances with explicit transitions', () => {
    assert.ok(
      !modalCode.includes('transition-all'),
      'CreateDocumentModal.tsx must not contain banned transition-all'
    );
  });

  it('maintains local-only storage toggle controls', () => {
    assert.ok(
      modalCode.includes('isLocalOnly'),
      'CreateDocumentModal.tsx must retain isLocalOnly control'
    );
  });
});
