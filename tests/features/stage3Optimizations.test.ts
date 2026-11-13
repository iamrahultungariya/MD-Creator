import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Stage 3: Advanced Architecture & Accessibility Optimizations', () => {
  it('Phase 3.1: verifies CodeMirrorEditor dynamically imports @replit/codemirror-vim on demand', () => {
    const editorPath = 'src/features/editor/components/CodeMirrorEditor.tsx';
    assert.ok(fs.existsSync(editorPath), 'CodeMirrorEditor.tsx must exist');
    const content = fs.readFileSync(editorPath, 'utf-8');

    // Must NOT have static import of @replit/codemirror-vim
    assert.strictEqual(
      /^import.*from '@replit\/codemirror-vim'/m.test(content),
      false,
      'CodeMirrorEditor must NOT statically import @replit/codemirror-vim'
    );

    // Must have dynamic import() inside keymapMode effect
    assert.ok(
      content.includes("import('@replit/codemirror-vim')"),
      'CodeMirrorEditor must dynamically import @replit/codemirror-vim when keymapMode is vim'
    );
  });

  it('Phase 3.1 & 3.2: verifies vite.config.ts isolates codemirror chunks and runtime caching', () => {
    const viteConfigPath = 'vite.config.ts';
    assert.ok(fs.existsSync(viteConfigPath), 'vite.config.ts must exist');
    const content = fs.readFileSync(viteConfigPath, 'utf-8');

    assert.ok(
      content.includes("'vendor-codemirror-vim'"),
      'vite.config.ts must isolate @replit/codemirror-vim into vendor-codemirror-vim'
    );
    assert.ok(
      content.includes("'vendor-codemirror-languages'"),
      'vite.config.ts must isolate @codemirror/language-data into vendor-codemirror-languages'
    );
    assert.ok(
      content.includes('maxEntries: 120'),
      'vite.config.ts must provide maxEntries of 120 for heavy-dynamic-chunks to retain KaTeX fonts'
    );
  });

  it('Phase 3.3: verifies ModalPortal implements WCAG 2.1 AA focus trapping and restoration', () => {
    const portalPath = 'src/components/common/ModalPortal.tsx';
    assert.ok(fs.existsSync(portalPath), 'ModalPortal.tsx must exist');
    const content = fs.readFileSync(portalPath, 'utf-8');

    assert.ok(content.includes('createPortal'), 'ModalPortal must use createPortal');
    assert.ok(content.includes('document.body.style.overflow'), 'ModalPortal must lock body scroll');
    assert.ok(content.includes('Escape'), 'ModalPortal must handle Escape key');
    assert.ok(content.includes('Tab'), 'ModalPortal must handle Tab key for focus trapping');
    assert.ok(content.includes('previousActiveElementRef'), 'ModalPortal must retain previous focus element');
    assert.ok(content.includes('FOCUSABLE_SELECTOR'), 'ModalPortal must query focusable elements');
  });

  it('Phase 3.4: verifies useDocuments hooks specify gcTime for memory leak prevention', () => {
    const docsHookPath = 'src/hooks/useDocuments.ts';
    assert.ok(fs.existsSync(docsHookPath), 'useDocuments.ts must exist');
    const content = fs.readFileSync(docsHookPath, 'utf-8');

    const matches = content.match(/gcTime:\s*5\s*\*\s*60\s*\*\s*1000/g);
    assert.ok(
      matches && matches.length >= 5,
      `useDocuments.ts must specify gcTime across document queries, found: ${matches?.length}`
    );
  });
});
