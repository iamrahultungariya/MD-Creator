import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 1: Cloud Sync Controls (Local-Only Toggle on Creation & Existing Docs)', () => {
  it('provides setDocumentLocalOnly helper and updates saveDocument in src/db/index.ts', () => {
    const dbCode = fs.readFileSync('src/db/index.ts', 'utf-8');
    assert.ok(
      dbCode.includes('setDocumentLocalOnly'),
      'src/db/index.ts must export setDocumentLocalOnly function'
    );
  });

  it('renders a Local-Only toggle switch in CreateDocumentModal.tsx', () => {
    const modalCode = fs.readFileSync('src/components/document/CreateDocumentModal.tsx', 'utf-8');
    assert.ok(
      modalCode.includes('isLocalOnly') || modalCode.includes('localOnly'),
      'CreateDocumentModal.tsx must maintain isLocalOnly state'
    );
    assert.ok(
      modalCode.includes('Keep Local Only') || modalCode.includes('Local-Only') || modalCode.includes('Disable Cloud Sync') || modalCode.includes('Offline Only'),
      'CreateDocumentModal.tsx must have user-facing label for local-only storage'
    );
  });

  it('provides a visible Cloud Sync status badge and toggle in EditorHeader.tsx', () => {
    const headerCode = fs.readFileSync('src/features/editor/components/EditorHeader.tsx', 'utf-8');
    assert.ok(
      headerCode.includes('isLocalOnly') || headerCode.includes('setDocumentLocalOnly') || headerCode.includes('Cloud Synced') || headerCode.includes('Local Only'),
      'EditorHeader.tsx must render Cloud Sync status and toggle capability'
    );
  });

  it('renders Local-Only action and badge in DocumentGridCard.tsx and DocumentListItem.tsx', () => {
    const cardCode = fs.readFileSync('src/components/documents/DocumentGridCard.tsx', 'utf-8');
    const listCode = fs.readFileSync('src/components/documents/DocumentListItem.tsx', 'utf-8');

    assert.ok(
      cardCode.includes('isLocalOnly') || cardCode.includes('Local Only'),
      'DocumentGridCard.tsx must support isLocalOnly status or toggle'
    );
    assert.ok(
      listCode.includes('isLocalOnly') || listCode.includes('Local Only'),
      'DocumentListItem.tsx must support isLocalOnly status or toggle'
    );
  });
});
