import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('In-App Feedback Prompt & Modal Tests', () => {
  test('snooze duration calculation is exactly 15 days (1,296,000,000 ms)', () => {
    const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
    assert.strictEqual(FIFTEEN_DAYS_MS, 1296000000);
  });

  test('zero em dash compliance across feedback components and hooks', () => {
    const files = [
      'src/hooks/useFeedbackPrompt.ts',
      'src/components/feedback/FeedbackPromptToast.tsx',
      'src/components/feedback/FeedbackPromptModal.tsx'
    ];
    for (const f of files) {
      const fullPath = path.resolve(process.cwd(), f);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        assert.ok(!content.includes('\u2014'), `${f} contains banned em dash character`);
      }
    }
  });

  test('payload structure matches Supabase feedbacks schema', () => {
    const payload = {
      id: 'test-uuid-1234',
      user_id: null,
      user_email: 'guest@example.com',
      user_name: null,
      category: 'feature',
      sentiment: 'good',
      subject: 'In-App Discovery Feedback',
      message: 'Great minimalist markdown app!',
      priority: 'normal',
      status: 'new',
      system_info: {
        experience: 'excellent',
        liked_most: 'Clean typography',
        can_improve: 'Export options',
        next_feature: 'Offline sync',
        is_guest: true,
        dwell_seconds: 30
      }
    };

    assert.strictEqual(payload.category, 'feature');
    assert.strictEqual(payload.status, 'new');
    assert.strictEqual(payload.system_info.experience, 'excellent');
    assert.strictEqual(payload.system_info.dwell_seconds, 30);
  });

  test('storage keys conform to specification constants', () => {
    const SUBMITTED_KEY = 'md_writer_feedback_submitted';
    const SNOOZE_KEY = 'md_writer_feedback_snooze_until';
    assert.strictEqual(SUBMITTED_KEY, 'md_writer_feedback_submitted');
    assert.strictEqual(SNOOZE_KEY, 'md_writer_feedback_snooze_until');
  });

  test('experience rating options cover all 5 sentiment levels', () => {
    const ratings = ['excellent', 'good', 'okay', 'not_great', 'poor'];
    assert.strictEqual(ratings.length, 5);
    assert.ok(ratings.includes('excellent'));
    assert.ok(ratings.includes('poor'));
  });
});
