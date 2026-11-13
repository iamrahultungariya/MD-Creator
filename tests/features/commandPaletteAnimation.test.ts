import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Search & Command Palette Transitions (Adaptive Origin & Keyboard Slide)', () => {
  it('verifies useCommandPalette tracks triggerType and originRect', () => {
    const hookPath = 'src/hooks/useCommandPalette.ts';
    assert.ok(fs.existsSync(hookPath), 'useCommandPalette.ts must exist');
    const content = fs.readFileSync(hookPath, 'utf-8');

    assert.ok(content.includes('triggerType'), 'Hook must track triggerType');
    assert.ok(content.includes('originRect'), 'Hook must track originRect');
    assert.ok(content.includes('open-command-palette'), 'Hook must listen for open-command-palette custom event');
    assert.ok(content.includes('setTriggerType(\'keyboard\')'), 'Keyboard shortcut must set triggerType to keyboard');
  });

  it('verifies Navbar captures click coordinates for gooey expand effect', () => {
    const navbarPath = 'src/components/home/Navbar.tsx';
    assert.ok(fs.existsSync(navbarPath), 'Navbar.tsx must exist');
    const content = fs.readFileSync(navbarPath, 'utf-8');

    assert.ok(content.includes('getBoundingClientRect'), 'Navbar must capture bounding rect of clicked search button');
    assert.ok(content.includes('open-command-palette'), 'Navbar must dispatch open-command-palette event');
    assert.ok(content.includes('originRect'), 'Navbar must pass originRect');
  });

  it('verifies CommandPaletteModal implements both gooey expand and keyboard slide variants', () => {
    const modalPath = 'src/components/common/CommandPaletteModal.tsx';
    assert.ok(fs.existsSync(modalPath), 'CommandPaletteModal.tsx must exist');
    const content = fs.readFileSync(modalPath, 'utf-8');

    assert.ok(content.includes('clickAnimationVariants'), 'Must define clickAnimationVariants for gooey bloom');
    assert.ok(content.includes('keyboardAnimationVariants'), 'Must define keyboardAnimationVariants for slide down');
    assert.ok(content.includes('transformOriginStyle'), 'Must compute transformOrigin based on button coordinates');
    assert.ok(content.includes('ModalPortal'), 'Must be wrapped in ModalPortal');
    assert.ok(content.includes('AnimatePresence'), 'Must use AnimatePresence for exit animations');
  });

  it('verifies ModalPortal maintains grace period for smooth exit animations', () => {
    const portalPath = 'src/components/common/ModalPortal.tsx';
    assert.ok(fs.existsSync(portalPath), 'ModalPortal.tsx must exist');
    const content = fs.readFileSync(portalPath, 'utf-8');

    assert.ok(content.includes('shouldRender'), 'ModalPortal must track shouldRender for exit transitions');
    assert.ok(content.includes('260'), 'ModalPortal must delay unmounting for exit animations');
  });
});
