import test from 'node:test';
import assert from 'node:assert/strict';
import { telemetryService, DailyMetricRecord } from '../../src/services/telemetryService';

test('telemetry cohorts: separates new and returning visitors', () => {
  const metrics: DailyMetricRecord[] = telemetryService.getDailyMetrics(7);
  assert.equal(metrics.length, 7);
  for (const day of metrics) {
    assert.ok(typeof day.newVisitors === 'number', 'newVisitors should be a number');
    assert.ok(typeof day.returningVisitors === 'number', 'returningVisitors should be a number');
    assert.ok(
      day.newVisitors + day.returningVisitors >= day.visitors || day.visitors === 0,
      'sum of cohorts should cover total visitors'
    );
  }
});
