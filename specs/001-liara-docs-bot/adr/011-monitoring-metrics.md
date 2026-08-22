# ADR-011: Monitoring Metrics — Query Count, Token Usage, Miss Rate, Fallback Rate

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to implement monitoring to support operations and evaluation. Challenge.md includes Security & Monitoring (50 pts) as a criterion.

## Decision

We will track these core metrics:
- **Query Count**: Total and per-session query volume
- **Token Usage**: Input/output tokens per query for cost tracking
- **Retrieval Miss Rate**: Percentage of queries with no relevant retrieval results
- **Fallback Rate**: Percentage of queries handled by fallback response

## Rationale

- **Cost optimization**: Token usage directly impacts the 25-point cost optimization criterion
- **Quality monitoring**: Retrieval miss rate indicates RAG quality issues
- **Reliability**: Fallback rate shows system resilience
- **Challenge alignment**: Supports both Security & Monitoring (50 pts) and Cost Optimization (25 pts)

## Consequences

- Metrics must be logged without impacting query latency
- Dashboard or log aggregation needed for visibility
- Metrics inform tuning decisions (chunk size, top-K, etc.)

## Alternatives Considered

- **More extensive metrics**: Rejected for MVP — would add complexity
- **No monitoring**: Rejected — fails Challenge.md criteria
