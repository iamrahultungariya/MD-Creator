import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('Footer Technical Metadata', () => {
  it('displays version, license, and system status', () => {
    const code = fs.readFileSync('src/components/home/Footer.tsx', 'utf-8');
    assert.ok(code.includes('v2.3.0'), 'Shows current release version');
    assert.ok(code.includes('MIT'), 'Shows license');
    assert.ok(code.includes('writermd.vercel.app') || code.includes('MD Writer'), 'Brand identity');
  });
});
