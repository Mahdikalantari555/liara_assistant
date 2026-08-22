// Env must be set before first getConfig() call — the config module caches.
process.env.SUPPORT_TICKET_URL = 'https://example.com/tickets';
(process.env as Record<string, string | undefined>).NODE_ENV = undefined;

import assert from 'assert/strict';
import {
  normalizeQuestion,
  isDuplicate,
  registerTurn,
  bumpStreak,
  resetStreak,
  checkEscalation,
  currentStreak,
} from './escalation';

(async () => {
  // Normalization: punctuation, zero-width, case.
  assert.equal(normalizeQuestion('چطور  Redis  نصب کنم؟'), 'چطور redis نصب کنم');
  // Zero-width joiner is deleted (Persian half-space), not turned into a space.
  assert.equal(normalizeQuestion('میکرو\u200cسرویس را دیپلوی کن!'), 'میکروسرویس را دیپلوی کن');

  // Duplicate detection: normalized equality, short questions never duplicate.
  assert.equal(isDuplicate('چطور Redis نصب کنم؟', 'چطور redis نصب کنم'), true);
  assert.equal(isDuplicate(undefined, 'چطور Redis نصب کنم؟'), false);
  assert.equal(isDuplicate('چرا؟', 'چرا؟'), false);

  // Streak: duplicates bump, fresh question resets.
  const s = 'session-test-1';
  assert.equal(registerTurn(s, 'چطور دیتابیس بسازم در لیارا'), false);
  assert.equal(checkEscalation(s).escalated, false);
  assert.equal(registerTurn(s, 'چطور دیتابیس   بسازم در لیارا؟'), true); // count=1
  assert.equal(checkEscalation(s).escalated, false);
  assert.equal(registerTurn(s, 'یک سؤال کاملاً متفاوت درباره Object Storage'), false); // reset
  assert.equal(bumpStreak(s), 1);
  assert.equal(bumpStreak(s), 2);
  resetStreak(s);
  assert.equal(checkEscalation(s).escalated, false);

  // Threshold fires exactly once, then resets (default threshold = 3).
  const t = 'session-test-2';
  bumpStreak(t);
  bumpStreak(t);
  bumpStreak(t);
  const fired = checkEscalation(t);
  assert.equal(fired.escalated, true);
  assert.ok(fired.referral!.includes('[ثبت تیکت پشتیبانی](https://example.com/tickets)'));
  assert.equal(checkEscalation(t).escalated, false);

  // The no-URL-configured variant runs as a separate process (config caches
  // per process): see package.json "test:web" / escalation-nourl.test.ts.

  console.log('escalation.test: all assertions passed');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Regression: 👎 evidence must survive a fresh (non-duplicate) turn — the
// route snapshots the streak before registerTurn and passes it back in.
{
  const id = 'fresh-after-dislike';
  registerTurn(id, 'چطور دیتابیس بسازم در لیارا');
  bumpStreak(id);
  bumpStreak(id);
  bumpStreak(id); // count = 3 (default threshold)
  const entering = currentStreak(id);
  assert.equal(entering, 3);
  registerTurn(id, 'حالا یک سؤال کاملاً جدید درباره دامنه'); // live counter resets
  assert.equal(currentStreak(id), 0);
  const esc = checkEscalation(id, entering);
  assert.equal(esc.escalated, true);
}
console.log('escalation.test: regression assertions passed');
