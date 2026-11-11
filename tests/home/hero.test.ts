import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Hero Section Copy & Anti-Slop Check', () => {
  it('uses outcome-driven copy without marketing fluff', () => {
    const code = fs.readFileSync('src/components/home/Hero.tsx', 'utf-8');
    assert.ok(code.includes('The plain text studio built for focused writing.'), 'Headline must match spec');
    assert.ok(code.includes('LOCAL-FIRST'), 'Kicker badge must emphasize local-first');
    assert.ok(!code.includes('Supercharge'), 'No marketing cliches');
    assert.ok(!code.includes('Revolutionize'), 'No marketing cliches');
  });
});
