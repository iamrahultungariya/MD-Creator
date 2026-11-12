import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Task 4: Smooth Page Navigation Transitions', () => {
  it('integrates unified PageTransition across all primary routes including editor in App.tsx', () => {
    const appCode = fs.readFileSync('src/App.tsx', 'utf-8');

    // Must not have an abrupt split return for editor that bypasses page transitions
    assert.ok(
      !appCode.includes('if (isEditor) {\n    return (\n      <ErrorBoundary>\n        <Suspense fallback={<PageLoader variant="editor" />}>'),
      'App.tsx must not use an abrupt split early return that skips page transitions'
    );

    // Routes must route /editor inside the unified AnimatePresence tree
    assert.ok(
      appCode.includes('path="/editor"') && appCode.includes('PageTransition'),
      'App.tsx must wrap /editor with PageTransition'
    );
  });

  it('configures hardware acceleration in PageTransition.tsx', () => {
    const transitionCode = fs.readFileSync('src/components/common/PageTransition.tsx', 'utf-8');

    assert.ok(
      transitionCode.includes('willChange') || transitionCode.includes('will-change'),
      'PageTransition.tsx must configure hardware acceleration (willChange)'
    );
  });
});
