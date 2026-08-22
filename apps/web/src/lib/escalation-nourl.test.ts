// Runs with SUPPORT_TICKET_URL unset: referral must contain no link.
(process.env as Record<string, string | undefined>).SUPPORT_TICKET_URL = undefined;
(process.env as Record<string, string | undefined>).NODE_ENV = undefined;

import assert from 'assert/strict';
import { bumpStreak, checkEscalation } from './escalation';

(async () => {
  const u = 'nourl-session';
  bumpStreak(u);
  bumpStreak(u);
  bumpStreak(u);
  const fired = checkEscalation(u);
  assert.equal(fired.escalated, true);
  assert.ok(!fired.referral!.includes('](http'), 'no dead link when env unset');
  console.log('escalation-nourl.test: all assertions passed');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
