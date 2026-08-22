# Data Model: Liara Docs Bot

**Date**: 2026-08-20  
**Spec**: [spec.md](spec.md)

## Entities

### ConversationSession

Stored client-side in JWT; validated server-side without lookup.

| Field | Type | Notes |
|-------|------|-------|
| sessionId | string | UUID |
| createdAt | ISO timestamp | |
| messages | Message[] | Ordered |
| tokenBudget | number | Soft limit |
| usedTokens | number | Rolling total |

### Message

| Field | Type | Notes |
|-------|------|-------|
| role | enum | `user` / `assistant` |
| content | string | |
| timestamp | ISO timestamp | |
| citations | SourceCitation[] | Assistant only |
| suggestions | string[] | Assistant only |

### SourceCitation

| Field | Type | Notes |
|-------|------|-------|
| title | string | Page title |
| url | string | docs.liara.ir URL |
| section | string | Section heading |
| score | number | Similarity score |

### DocumentationChunk

Persisted in ChromaDB with metadata.

| Field | Type | Notes |
|-------|------|-------|
| chunkId | string | |
| content | string | 512 tokens |
| sourceUrl | string | |
| pageTitle | string | |
| sectionTitle | string | |
| tokenCount | number | |

### MetricsLog (transient)

| Field | Type | Notes |
|-------|------|-------|
| timestamp | ISO timestamp | |
| sessionId | string | |
| queryCount | number | Cumulative |
| tokenUsage | number | Input + output |
| retrievalMiss | boolean | No relevant chunks |
| fallbackUsed | boolean | |

### EvaluationQuestion

A representative question from the Liara documentation evaluation dataset. Contains text content, expected answer characteristics, and optional suggested follow-ups. Used for pre-delivery accuracy measurement and as suggested questions in the chat UI. New questions can be added to the dataset at any time without code changes.

| Field | Type | Notes |
|-------|------|-------|
| questionId | string | |
| text | string | Persian question text |
| expectedAnswerTraits | string[] | Keywords/topics expected in answer |
| suggestedFollowUps | string[] | Optional follow-up questions |
| category | string | Documentation category |

## Relationships

- ConversationSession has many Messages
- Assistant Message has many SourceCitations
- DocumentationChunk is independent; retrieved by similarity
- MetricsLog is append-only and transient

## State Transitions

- Session: `created` → `active` → `tokenExceeded`
- Message: `pending` → `sent` → `answered`
