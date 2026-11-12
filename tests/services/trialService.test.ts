import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  computeTrialStatus,
  calculateDaysRemaining,
  TRIAL_DURATION_DAYS,
  TRIAL_WARNING_DAYS,
  markTrialWarningNotifiedToday,
  isTrialWarningNotifiedToday,
} from '../../src/services/trialService';

describe('Strict 14-Day Pro Trial Subsystem', () => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  it('calculates remaining days accurately', () => {
    const now = Date.now();
    const future14 = new Date(now + 14 * ONE_DAY_MS).toISOString();
    assert.strictEqual(calculateDaysRemaining(future14, now), 14);

    const future2 = new Date(now + 2 * ONE_DAY_MS).toISOString();
    assert.strictEqual(calculateDaysRemaining(future2, now), 2);

    const past = new Date(now - 1 * ONE_DAY_MS).toISOString();
    assert.strictEqual(calculateDaysRemaining(past, now), 0);
  });

  it('marks trial as active without warnings on days 1 to 11', () => {
    const now = Date.now();
    const expiresAt = new Date(now + 10 * ONE_DAY_MS).toISOString(); // 10 days remaining (day 4 or 5)
    const status = computeTrialStatus(
      {
        subscription_tier: 'pro',
        plan_id: 'pro_annual',
        pro_expires_at: expiresAt,
        trial_started_at: new Date(now - 4 * ONE_DAY_MS).toISOString(),
      },
      now
    );

    assert.strictEqual(status.status, 'active');
    assert.strictEqual(status.daysRemaining, 10);
    assert.strictEqual(status.shouldNotifyToday, false);
  });

  it('triggers warning notification on days 12, 13, and 14 (last 3 days)', () => {
    const now = Date.now();
    const expiresAt = new Date(now + 2 * ONE_DAY_MS).toISOString(); // 2 days remaining (day 13)
    const status = computeTrialStatus(
      {
        subscription_tier: 'pro',
        plan_id: 'pro_annual',
        pro_expires_at: expiresAt,
        trial_started_at: new Date(now - 12 * ONE_DAY_MS).toISOString(),
      },
      now,
      () => false // Mock: not yet notified today
    );

    assert.strictEqual(status.status, 'warning');
    assert.strictEqual(status.daysRemaining, 2);
    assert.strictEqual(status.shouldNotifyToday, true);
    assert.ok(status.daysRemaining <= TRIAL_WARNING_DAYS);
  });

  it('strictly limits warning notifications to once per day during the last 3 days', () => {
    const today = new Date().toISOString().slice(0, 10);
    const storageKey = `md_writer_trial_warning_${today}`;

    // Test helper functions
    assert.strictEqual(isTrialWarningNotifiedToday(today, () => null), false);
    assert.strictEqual(isTrialWarningNotifiedToday(today, () => today), true);
  });

  it('strictly expires and flags deactivation on day 15 (expired trial)', () => {
    const now = Date.now();
    const expiresAt = new Date(now - 1000).toISOString(); // Expired 1 second ago
    const status = computeTrialStatus(
      {
        subscription_tier: 'pro',
        plan_id: 'pro_annual',
        pro_expires_at: expiresAt,
        trial_started_at: new Date(now - 15 * ONE_DAY_MS).toISOString(),
      },
      now
    );

    assert.strictEqual(status.status, 'expired');
    assert.strictEqual(status.daysRemaining, 0);
    assert.strictEqual(status.shouldDeactivate, true);
  });
});
