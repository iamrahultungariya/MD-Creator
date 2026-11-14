import test from 'node:test';
import assert from 'node:assert/strict';
import { generateSmoothSplinePath } from '../../src/components/admin/analytics/SmoothMountainChart';

test('generateSmoothSplinePath: generates smooth cubic bezier commands without NaN', () => {
  const points = [
    { x: 30, y: 120 },
    { x: 130, y: 50 },
    { x: 230, y: 90 },
    { x: 330, y: 30 },
    { x: 430, y: 70 },
  ];
  const { linePath, areaPath } = generateSmoothSplinePath(points, 180);

  assert.ok(linePath.startsWith('M 30.0,120.0 C'), `linePath should start with M and C commands, got: ${linePath}`);
  assert.ok(!linePath.includes('NaN'), 'linePath must not contain NaN');
  assert.ok(!areaPath.includes('NaN'), 'areaPath must not contain NaN');
  assert.ok(areaPath.endsWith('180.0 Z'), `areaPath should close back to baseline, got: ${areaPath}`);
});

test('generateSmoothSplinePath: handles edge cases (empty and single points)', () => {
  const emptyRes = generateSmoothSplinePath([], 180);
  assert.equal(emptyRes.linePath, '');
  assert.equal(emptyRes.areaPath, '');

  const singleRes = generateSmoothSplinePath([{ x: 50, y: 100 }], 180);
  assert.equal(singleRes.linePath, 'M 50.0,100.0');
  assert.ok(singleRes.areaPath.includes('Z'));
});
