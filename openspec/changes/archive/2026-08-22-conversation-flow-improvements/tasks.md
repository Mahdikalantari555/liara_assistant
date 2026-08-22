# Tasks: Conversation Flow Improvements

## 1. Config & session state

- [x] 1.1 `config.ts` — add `ESCALATION_THRESHOLD` (default 3) and `SUPPORT_TICKET_URL`; expose in `configHealth` as booleans
- [x] 1.2 `session.ts` — add `failureStreak: number` and `lastQuestion: string` to session state
  - Deviation (deliberate): sessions are stateless JWTs, so streak + lastQuestion live in an in-memory `Map` keyed by sessionId inside `escalation.ts` (`StreakState`), mirroring the rate-limiter trade-off; `session.ts` untouched.

## 2. Escalation logic

- [x] 2.1 New `apps/web/src/lib/escalation.ts` — `normalizeQuestion`, `isDuplicate(prev, next)`, `bumpStreak(session, reason)`, `buildReferral(cfg)` returning referral block (URL omitted when env unset)
  - Shipped as `normalizeQuestion` / `isDuplicate` / `bumpStreak`+`resetStreak` / `checkEscalation` / private `buildReferral()` reading config directly; URL omitted when `SUPPORT_TICKET_URL` unset (covered by `escalation-nourl.test.ts`).
- [x] 2.2 Unit test for normalize/isDuplicate/threshold/reset behavior (`escalation.test.ts` + `escalation-nourl.test.ts`, both green)
- [x] 2.3 Wire `/api/feedback` route: negative feedback bumps streak, positive resets
- [x] 2.4 Wire `route.ts`: duplicate question bumps streak; after LLM step, if streak ≥ threshold append referral to response payload + set `escalated: true` + reset counter

## 3. Topic hint

- [x] 3.1 `route.ts` — parse optional `topic` from request body; sanitize via `sanitizeInput`, cap 80 chars; use as retrieval topic for the turn when non-empty
- [x] 3.2 `prompts.ts` — include active topic line in system context when a topic exists
- [x] 3.3 `.env.example` — document `ESCALATION_THRESHOLD`, `SUPPORT_TICKET_URL`

## 4. Verification

- [x] 4.1 `npm run test` passes including escalation tests
  - No repo-level `test` script; per convention ran `npx tsx src/lib/escalation.test.ts` and `escalation-nourl.test.ts` from `apps/web` — all assertions pass.
- [x] 4.2 Manual: send same question 3× → referral appears with URL from env; unset env → referral without dead link
  - E2E vs live dev server (kilo→avalai fallback): with `SUPPORT_TICKET_URL` set, referral + `[ثبت تیکت پشتیبانی](url)` appended and `escalated: true` on the firing turn (threshold=2 run: fired on ask #3). Linkless variant covered by `escalation-nourl.test.ts`; feedback-driven bumps verified via 👎 → next-turn referral.
  - Fixes made during verification: escalation/rate-limit/cache stores pinned on `globalThis` (Next compiles per-route bundles that forked the Maps); streak snapshot (`enteringStreak`) so 👎 evidence survives a fresh-question reset.
- [x] 4.3 Request with `topic: "PostgreSQL"` → answer cites PostgreSQL docs on first turn for an ambiguous question
  - E2E: ambiguous backup question + `topic:"PostgreSQL"` answered directly citing `docs.liara.ir/dbaas/postgresql/*`. Fix en route: client topic now bypasses the clarify detour (`clarifying: false`).
- [x] 4.4 `/api/chat` old clients (no topic field) behave exactly as before
  - All E2E turns omitted `topic` and answered normally; field is optional with previous inferred-topic fallback.
