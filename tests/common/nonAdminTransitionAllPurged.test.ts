import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

function getFilesRecursively(dir: string, ext = '.tsx'): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(filePath, ext));
    } else if (file.endsWith(ext)) {
      results.push(filePath);
    }
  }
  return results;
}

describe('Phase 3: Transition-All Purge Check (Common, Auth, Blog, Share)', () => {
  const targetDirs = [
    'src/components/common',
    'src/components/auth',
    'src/components/blog',
    'src/components/share',
  ];

  const files = targetDirs.flatMap((d) => getFilesRecursively(d));

  for (const file of files) {
    const relPath = file.replace(/\\/g, '/');
    it(`verifies ${relPath} contains zero transition-all`, () => {
      const code = fs.readFileSync(file, 'utf-8');
      const matches = code.match(/transition-all/g);
      assert.strictEqual(
        matches,
        null,
        `${relPath} should have 0 transition-all instances, found: ${matches?.length}`
      );
    });
  }
});
