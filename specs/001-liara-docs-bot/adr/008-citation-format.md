# ADR-008: Citation Format — Title + Link + Section

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to format source citations in bot responses. Two options:
1. Simple link only: `[Documentation Title](URL)`
2. Detailed citation: `[Documentation Title](URL) - Section: "Specific Section Name"`

## Decision

We will use **detailed citations**: `[Documentation Title](URL) - بخش: "Specific Section Name"`

## Rationale

- **Higher quality**: More context helps users verify and navigate to exact information
- **Better UX**: Users can quickly identify which section of the docs contains the answer
- **Evaluation alignment**: Challenge.md emphasizes answer quality (80 pts) — detailed citations contribute directly to this
- **Traceability**: Clearer audit trail between answer and source

## Consequences

- Requires storing section information during chunking
- Slightly more complex citation rendering logic
- Better alignment with evaluation criteria

## Alternatives Considered

- **Simple link only**: Rejected due to lower citation quality
