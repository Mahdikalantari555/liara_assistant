# Proposal: Conversation Flow Improvements

## Why

Two gaps in the chat loop: (1) when the bot keeps failing on a question — repeated re-asks, repeated "not helpful" feedback — the user is stuck in a loop with no way out; today there is no escalation path to Liara human support. (2) The conversation topic is inferred server-side only; the user cannot state the topic up front ("this is a PostgreSQL question"), so early turns retrieve against a guessed topic.

## What Changes

- Track per-session consecutive unhelpful outcomes (explicit 👎 feedback AND near-duplicate question repeats) and, after N failures, append a support-referral message linking to the ticket page.
- Support URL comes from env (`SUPPORT_TICKET_URL`), not hardcoded.
- `/api/chat` accepts an optional client-supplied `topic` hint that overrides inferred topic for retrieval prefix and agent context.
- The active topic is passed to the LLM system context explicitly ("the user is asking about X") so answers anchor to it.

## Capabilities

### New Capabilities
- `conversation-flow`: failure-streak detection with support escalation, client topic hints, and topic-aware agent context.

### Modified Capabilities

(none)

## Impact

- **Code**: `apps/web/src/lib/session.ts` (failure streak counter), new `apps/web/src/lib/escalation.ts`, `apps/web/src/app/api/chat/route.ts` (topic param + escalation check), `apps/web/src/lib/prompts.ts` (topic line), `.env.example`.
- **APIs**: `/api/chat` request gains optional `topic` field — additive, backward compatible. Response gains optional `escalated: boolean`.
- **Dependencies**: none.
