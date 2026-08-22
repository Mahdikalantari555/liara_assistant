# Design: Conversation Flow Improvements

## Context

`session.ts` already persists per-session state (topic, turn budget) in memory with TTL; `route.ts` pipeline is `rate limit -> sanitize -> budget -> cache -> clarify -> retrieve -> LLM`. Feedback already flows through `/api/feedback` but is not wired into session state. Topic inference exists (`intent.ts: extractTopic`) and only feeds retrieval prefixing.

## Goals / Non-Goals

**Goals:**
- Failure-streak counter living on the existing session object — no new store.
- One additive request field (`topic`) and one additive response flag (`escalated`).
- Escalation copy assembled server-side, single place.

**Non-Goals:**
- No sentiment analysis or LLM judging of "unhelpful" — explicit feedback + near-duplicate repeat only.
- No email/webhook to a real ticketing API; just the link.
- No topic taxonomy UI concerns here (that lives in the UI overhaul change).

## Decisions

1. **Near-duplicate = normalized string equality** (lowercase, strip punctuation/zero-width, collapse whitespace) against the previous user question. Levenshtein etc. is overkill for "user re-asked because answer failed".
2. **Streak stored on session object**, incremented by `/api/feedback` (negative) and by duplicate detection in `route.ts`; reset on positive feedback or non-duplicate turn. Sessions are in-memory per spec — streak dies with the session; acceptable and consistent.
3. **Escalation check runs after LLM completion**, appending a fixed bilingual (fa/en) referral block to the assistant message payload as a separate field so the UI can render it distinctly. Prompt does not mention escalation — no token cost on normal turns.
4. **Topic hint sanitization**: reuse `sanitizeInput` on the `topic` field, cap length (~80 chars), drop if empty after sanitize. It never reaches the model raw.
5. **Config additions**: `ESCALATION_THRESHOLD` (num, default 3), `SUPPORT_TICKET_URL` (str). Both read in `config.ts`, surfaced in `configHealth` as booleans only.

## Risks / Trade-offs

- [Duplicate detection false-positives on short generic questions like "چرا؟"] → require ≥3 words in normalized question before counting as duplicate.
- [In-memory streak lost on restart] → consistent with existing session semantics; not data loss.
- [Users spam 👎 to fish the link] → harmless; counter resets after referral shown.

## Migration Plan

Additive env + additive fields; deploy and roll back by unsetting nothing — defaults preserve current behavior exactly (`threshold` unreachable only if feature flag off? No flag needed: default behavior identical until threshold met).

## Open Questions

- Exact support URL value (ops decision) — placeholder documented in `.env.example`.
