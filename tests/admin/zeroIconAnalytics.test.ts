import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('zero-icon compliance: ActiveUserDashboard and SmoothMountainChart must have zero icons', () => {
  const dashboardPath = path.resolve(process.cwd(), 'src/components/admin/analytics/ActiveUserDashboard.tsx');
  const chartPath = path.resolve(process.cwd(), 'src/components/admin/analytics/SmoothMountainChart.tsx');

  const dashboardContent = fs.readFileSync(dashboardPath, 'utf-8');
  const chartContent = fs.readFileSync(chartPath, 'utf-8');

  // 1. Must not import from lucide-react or any icon package
  assert.ok(
    !dashboardContent.includes("from 'lucide-react'"),
    'ActiveUserDashboard.tsx must NOT import from lucide-react'
  );
  assert.ok(
    !chartContent.includes("from 'lucide-react'"),
    'SmoothMountainChart.tsx must NOT import from lucide-react'
  );

  // 2. Must not contain common icon component JSX tags
  const forbiddenTags = [
    '<Users',
    '<PenTool',
    '<Clock',
    '<Zap',
    '<FileDown',
    '<FileText',
    '<Presentation',
    '<Table',
    '<Sigma',
    '<GitFork',
    '<Timer',
    '<Share2',
    '<RefreshCw',
    '<ArrowUpRight',
    '<Activity ',
    '<Activity/>',
    '<Layers',
    '<Sparkles',
    '<DownloadCloud',
    '<Sun',
    '<Sunset',
    '<Moon',
    '<Compass'
  ];

  for (const tag of forbiddenTags) {
    assert.ok(
      !dashboardContent.includes(tag),
      `ActiveUserDashboard.tsx must NOT render icon tag ${tag}`
    );
    assert.ok(
      !chartContent.includes(tag),
      `SmoothMountainChart.tsx must NOT render icon tag ${tag}`
    );
  }

  // 3. Must not contain em dash (Rule R-02)
  assert.ok(!dashboardContent.includes('—'), 'ActiveUserDashboard.tsx must NOT contain em dash character (—)');
  assert.ok(!chartContent.includes('—'), 'SmoothMountainChart.tsx must NOT contain em dash character (—)');
});
