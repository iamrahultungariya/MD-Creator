import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Phase 3: Secondary Modals Portaled Check', () => {
  const modalFiles = [
    'src/components/editor/ImageEmbedModal.tsx',
    'src/components/editor/KatexFormulaModal.tsx',
    'src/components/editor/TableBuilderModal.tsx',
    'src/components/editor/ToolbarSettingsModal.tsx',
    'src/components/editor/RevisionHistoryModal.tsx',
    'src/components/auth/AvatarPickerModal.tsx',
    'src/features/pdf-export/components/ExportPdfModal.tsx',
    'src/components/common/PreferencesModal.tsx',
    'src/components/common/StorageDetailsModal.tsx',
    'src/components/common/CrossDeviceDeletionModal.tsx',
    'src/components/common/LegalModal.tsx',
    'src/components/common/PwaInstallModal.tsx',
    'src/components/common/GlobalConfirmDialog.tsx',
    'src/components/blog/BlogCreateModal.tsx',
    'src/components/common/MimoIntroModal.tsx',
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
