import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Video Preview & Render Verification (Task 6)', () => {
  it('VideoPreviewModal integrates @remotion/player with controls', () => {
    assert.ok(fs.existsSync('src/components/video/VideoPreviewModal.tsx'), 'VideoPreviewModal.tsx must exist');
    const content = fs.readFileSync('src/components/video/VideoPreviewModal.tsx', 'utf-8');
    assert.ok(content.includes('Player'), 'Uses Remotion Player component');
    assert.ok(content.includes('MDWriterTeaser'), 'Mounts MDWriterTeaser composition');
    assert.ok(content.includes('controls'), 'Enables playback controls');
  });

  it('HomePage provides action to open Video Preview', () => {
    const homeContent = fs.readFileSync('src/pages/HomePage.tsx', 'utf-8');
    assert.ok(
      homeContent.includes('VideoPreview') || homeContent.includes('Teaser') || homeContent.includes('Watch'),
      'HomePage should wire up teaser preview affordance'
    );
  });
});
