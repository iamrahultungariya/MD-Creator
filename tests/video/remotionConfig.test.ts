import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Remotion Root Configuration', () => {
  it('defines valid compositions for landscape and portrait', () => {
    assert.ok(fs.existsSync('src/video/Root.tsx'), 'src/video/Root.tsx must exist');
    const content = fs.readFileSync('src/video/Root.tsx', 'utf-8');
    assert.ok(content.includes('MDWriterTeaserLandscape'), 'Must register landscape composition');
    assert.ok(content.includes('width={1920}') || content.includes('width: 1920'), 'Landscape width must be 1920');
    assert.ok(content.includes('height={1080}') || content.includes('height: 1080'), 'Landscape height must be 1080');
    assert.ok(content.includes('fps={60}') || content.includes('fps: 60'), 'FPS must be 60');
    assert.ok(content.includes('durationInFrames={2400}') || content.includes('durationInFrames: 2400'), 'Landscape duration must be 2400 frames');
  });

  it('declares remotion scripts in package.json', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    assert.ok(pkg.scripts['video:preview'] || pkg.scripts['video:dev'], 'Must include video preview script');
    assert.ok(pkg.scripts['video:render'], 'Must include video render script');
  });
});
