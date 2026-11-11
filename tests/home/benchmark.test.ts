import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Benchmark Section Legal & Anti-Slop Check', () => {
  it('uses generic category names and crisp table borders', () => {
    const code = fs.readFileSync('src/components/home/BenchmarkSection.tsx', 'utf-8');
    assert.ok(code.includes('Traditional Cloud Suites'), 'Trademark safe category');
    assert.ok(code.includes('Plugin-Heavy Desktop Apps'), 'Trademark safe category');
    assert.ok(code.includes('MD Writer'), 'Highlights MD Writer');
    assert.ok(!code.includes('backdrop-blur'), 'No glassmorphism');
  });
});
