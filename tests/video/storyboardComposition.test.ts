import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Storyboard Scenes and Master Composition (Task 5)', () => {
  it('all 5 storyboard scenes exist', () => {
    assert.ok(fs.existsSync('src/video/scenes/Scene1Hook.tsx'), 'Scene1Hook exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene2EditorDemo.tsx'), 'Scene2EditorDemo exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene3MimoAi.tsx'), 'Scene3MimoAi exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene4FeatureBlitz.tsx'), 'Scene4FeatureBlitz exists');
    assert.ok(fs.existsSync('src/video/scenes/Scene5Outro.tsx'), 'Scene5Outro exists');
  });

  it('MDWriterTeaser integrates all scenes with Remotion Sequences', () => {
    assert.ok(fs.existsSync('src/video/compositions/MDWriterTeaser.tsx'), 'MDWriterTeaser.tsx must exist');
    const content = fs.readFileSync('src/video/compositions/MDWriterTeaser.tsx', 'utf-8');
    assert.ok(content.includes('Sequence'), 'Uses Remotion Sequence for timeline layout');
    assert.ok(content.includes('Scene1Hook'), 'Includes Scene 1');
    assert.ok(content.includes('Scene2EditorDemo'), 'Includes Scene 2');
    assert.ok(content.includes('Scene3MimoAi'), 'Includes Scene 3');
    assert.ok(content.includes('Scene4FeatureBlitz'), 'Includes Scene 4');
    assert.ok(content.includes('Scene5Outro'), 'Includes Scene 5');
  });
});
