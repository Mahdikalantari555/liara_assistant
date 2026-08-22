# Conversation Flow — Delta Spec

## Purpose

Give users a way out of unproductive answer loops by escalating to human support, and let users (or the UI) declare the question topic so retrieval and the agent anchor to it from turn one.

## ADDED Requirements

### Requirement: Failure streak triggers support escalation

The system SHALL count consecutive unhelpful outcomes per session, where an unhelpful outcome is (a) an explicit negative feedback on an answer, or (b) a new question that is a near-duplicate of the immediately preceding question. When the count reaches the configured threshold (`ESCALATION_THRESHOLD`, default 3), the system SHALL append a support-referral message containing a working link to `SUPPORT_TICKET_URL` and reset the counter.

#### Scenario: Three consecutive 👎
- **WHEN** a session receives negative feedback on three consecutive assistant answers
- **THEN** the next `/api/chat` response includes the support-referral message with the ticket URL and `escalated: true`

#### Scenario: Repeated identical question
- **WHEN** the user sends essentially the same question again after an answer that was not marked helpful
- **THEN** the failure streak increments

#### Scenario: Helpful answer resets streak
- **WHEN** the user gives positive feedback or asks a substantively different question
- **THEN** the failure streak resets to zero

### Requirement: Escalation never blocks answering

Escalation SHALL be additive: the bot still attempts its normal answer; the referral is appended, not substituted. The system MUST NOT stop responding to questions.

#### Scenario: Escalated turn still answers
- **WHEN** the threshold is reached and the user asks a question
- **THEN** the response contains both the normal answer (or fallback) and the referral message

### Requirement: Support URL is configuration, not code

The ticket link MUST come from `SUPPORT_TICKET_URL`. If unset, the system SHALL omit the referral link and keep only a generic "contact support" line — it MUST NOT render a dead or placeholder URL.

#### Scenario: Env unset
- **WHEN** escalation fires but `SUPPORT_TICKET_URL` is not configured
- **THEN** the referral message contains no URL

### Requirement: Client topic hint overrides inference

`/api/chat` SHALL accept an optional `topic` string in the request body. When present and non-empty, it SHALL be used as the retrieval topic prefix for that turn in place of the inferred topic, subject to the same sanitization as question text.

#### Scenario: User picks topic before typing
- **WHEN** the client sends `{ "question": "...", "topic": "PostgreSQL" }`
- **THEN** retrieval embeds/prefilters with "PostgreSQL" context for this turn

#### Scenario: No topic sent
- **WHEN** the request omits `topic`
- **THEN** behavior is exactly today's inferred-topic behavior

### Requirement: Topic anchors agent context

The active topic SHALL be included in the LLM system context so generation knows the domain of the conversation.

#### Scenario: Topic present
- **WHEN** an active topic exists for the turn
- **THEN** the system prompt passed to the model states the conversation topic
