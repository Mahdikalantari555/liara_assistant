# ADR-010: Evaluation Dataset — 50-100 Real Questions

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need a way to measure answer quality before delivery. The Challenge.md emphasizes answer quality as the highest-weighted criterion (80 pts).

## Decision

We will create an **evaluation dataset of 50-100 real questions** from Liara documentation to measure accuracy before project delivery.

## Rationale

- **Measurable quality**: Enables data-driven assessment of RAG quality
- **Challenge alignment**: Directly supports the 80-point answer quality criterion
- **Pre-delivery validation**: Identifies gaps before submission
- **Regression testing**: Can be reused to detect quality degradation

## Consequences

- Requires manual curation of questions from documentation
- Dataset must be representative of actual user queries
- Evaluation run adds time to pre-delivery checklist

## Alternatives Considered

- **No evaluation dataset**: Rejected — would not meet quality assurance requirements
- **Synthetic questions only**: Rejected — real user questions are more representative
