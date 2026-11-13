import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 2: Primary Modals Portaled Check', () => {
  const modalFiles = [
    'src/components/home/TemplatesModal.tsx',
    'src/components/share/BulkShareModal.tsx',
    'src/components/common/CloudSyncModal.tsx',
    'src/components/auth/QuickAuthModal.tsx',
    'src/components/editor/ExportModal.tsx',
    'src/components/editor/PublishModal.tsx',
  ];

  for (const file of modalFiles) {
    it(`verifies ${file} uses ModalPortal or createPortal`, () => {
      const code = fs.readFileSync(file, 'utf-8');
      assert.ok(
        code.includes('ModalPortal') || code.includes('createPortal'),
        `${file} must use ModalPortal or createPortal`
      );
    });
  }
});
