import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Theme Switching Smoothness and Zero-Jank Architecture', () => {
  it('uses synchronous DOM commit with View Transitions in useThemeStore', () => {
    const storeCode = fs.readFileSync('src/stores/useThemeStore.ts', 'utf-8');

    // Must use flushSync to prevent layout popping during snapshot
    assert.ok(
      storeCode.includes('flushSync'),
      'useThemeStore should use flushSync to commit DOM state synchronously for view transitions'
    );

    // Must calculate origin and radius for smooth radial expansion
    assert.ok(
      storeCode.includes('clipPath') && storeCode.includes('Math.hypot'),
      'useThemeStore should calculate radial clip-path expansion for fluid theme reveals'
    );

    // Must calculate precise element center from getBoundingClientRect for multi-device touch accuracy
    assert.ok(
      storeCode.includes('getBoundingClientRect'),
      'useThemeStore should compute element center via getBoundingClientRect for mobile and desktop touch accuracy'
    );

    // Must guard against concurrent clicks
    assert.ok(
      storeCode.includes('isTransitionActive'),
      'useThemeStore should have a concurrency guard against rapid clicking'
    );
  });

  it('eliminates competing CSS transitions from index.html body to prevent lag', () => {
    const htmlCode = fs.readFileSync('index.html', 'utf-8');

    // Body must not have transition-colors duration-200 which causes frame drops & color clashing
    assert.ok(
      !htmlCode.includes('transition-colors duration-200'),
      'index.html body should not have transition-colors duration-200 to prevent conflicting with theme transitions'
    );
  });

  it('configures hardware-accelerated root view transition rules in index.css', () => {
    const cssCode = fs.readFileSync('src/index.css', 'utf-8');

    // View transition pseudo elements must have animation: none and GPU layer promotion
    assert.ok(
      cssCode.includes('::view-transition-old(root)') && cssCode.includes('mix-blend-mode: normal'),
      'index.css should define root view-transition pseudo-elements with mix-blend-mode: normal'
    );

    // Hardware acceleration properties
    assert.ok(
      cssCode.includes('will-change: clip-path'),
      'index.css should declare will-change: clip-path to pre-allocate GPU textures'
    );
    assert.ok(
      cssCode.includes('transform: translateZ(0)') && cssCode.includes('contain: paint'),
      'index.css should promote pseudo elements to dedicated compositor layers'
    );
  });
});
