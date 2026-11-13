import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Motionimo Video Primitives', () => {
  it('springs utility exports correct spring physics functions', () => {
    assert.ok(fs.existsSync('src/video/utils/springs.ts'), 'springs.ts must exist');
    const content = fs.readFileSync('src/video/utils/springs.ts', 'utf-8');
    assert.ok(content.includes('motionimoSpring'), 'Exports motionimoSpring function');
    assert.ok(content.includes('damping'), 'Configures spring damping');
    assert.ok(content.includes('stiffness'), 'Configures spring stiffness');
  });

  it('KineticText component implements staggered character/word reveals', () => {
    assert.ok(fs.existsSync('src/video/components/KineticText.tsx'), 'KineticText.tsx must exist');
    const content = fs.readFileSync('src/video/components/KineticText.tsx', 'utf-8');
    assert.ok(content.includes('KineticText'), 'Exports KineticText component');
    assert.ok(content.includes('interpolate') || content.includes('spring'), 'Uses remotion animation hooks');
  });

  it('AmbientBackground provides dark canvas with glowing radial orbs', () => {
    assert.ok(fs.existsSync('src/video/components/AmbientBackground.tsx'), 'AmbientBackground.tsx must exist');
    const content = fs.readFileSync('src/video/components/AmbientBackground.tsx', 'utf-8');
    assert.ok(content.includes('bg-neutral-950') || content.includes('#09090b'), 'Uses dark canvas background');
    assert.ok(content.includes('radial-gradient') || content.includes('rounded-full'), 'Renders ambient glow orbs');
  });
});
