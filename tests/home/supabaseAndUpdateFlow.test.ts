import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

describe('5.4 Supabase Sync Wiring & Lightweight Post-Update Toast', () => {
  it('syncs and hydrates documents.is_ai_excluded across cloud sync and realtime handlers', () => {
    const supaCode = fs.readFileSync('src/lib/supabase.ts', 'utf-8');
    assert.ok(supaCode.includes('is_ai_excluded: Boolean(doc.isAiExcluded)'), 'Must push is_ai_excluded on upsert');
    const pullMatches = supaCode.match(/isAiExcluded:\s*Boolean\(/g) || [];
    assert.ok(pullMatches.length >= 4, `Expected at least 4 pull/fetch/realtime isAiExcluded mappings, found ${pullMatches.length}`);
  });

  it('wires telemetryService and ActiveUserDashboard to Supabase analytics', () => {
    const telemetryCode = fs.readFileSync('src/services/telemetryService.ts', 'utf-8');
    const dashboardCode = fs.readFileSync('src/components/admin/analytics/ActiveUserDashboard.tsx', 'utf-8');

    assert.ok(telemetryCode.includes("rpc('record_daily_telemetry'"), 'Must call record_daily_telemetry RPC');
    assert.ok(telemetryCode.includes('fetchCloudDailyMetrics'), 'Must export cloud daily metrics reader');
    assert.ok(telemetryCode.includes('fetchCloudActivityFeed'), 'Must export cloud activity feed reader');
    assert.ok(dashboardCode.includes('fetchCloudDailyMetrics'), 'Dashboard must hydrate daily metrics from Supabase');
    assert.ok(dashboardCode.includes('fetchCloudActivityFeed'), 'Dashboard must hydrate activity feed from Supabase');
  });

  it('renders lightweight non-blocking vX.X.X release notification redirecting to /changelog', () => {
    const modalCode = fs.readFileSync('src/components/common/UpdateAvailableModal.tsx', 'utf-8');
    assert.ok(modalCode.includes('{APP_VERSION_LABEL} is live'), 'Must display version is live header');
    assert.ok(modalCode.includes('Check out changes'), 'Must offer Check out changes button');
    assert.ok(modalCode.includes("navigate('/changelog')"), 'Must redirect to /changelog');
    assert.ok(!modalCode.includes('<Sparkles'), 'Must not include decorative Sparkles icon');
    assert.ok(!modalCode.includes('backdrop-blur'), 'Must not use heavy backdrop-blur overlay');
    assert.ok(!modalCode.includes("overflow = 'hidden'"), 'Must not block page scroll');
  });
});
