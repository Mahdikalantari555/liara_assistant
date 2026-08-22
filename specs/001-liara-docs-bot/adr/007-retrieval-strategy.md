# ADR-007: Retrieval Strategy — Top-K=5 without Reranker for MVP

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to determine the retrieval strategy for the RAG pipeline. Options:
1. Top-K retrieval with small K (3-5)
2. Top-K retrieval with larger K (8-10) + reranker
3. Hybrid search (vector + keyword)
4. More complex multi-stage retrieval

## Decision

For MVP, we will use **Top-K=5 retrieval without reranker**.

## Rationale

- **Simplicity**: Fewer moving parts means faster development and easier debugging
- **Cost**: No reranker means fewer LLM API calls and lower operational cost
- **Performance**: Top-5 is sufficient for the documentation corpus size
- **MVP scope**: Aligns with the decision to avoid unnecessary complexity
- **Quality focus**: Time investment goes to citation quality and UX rather than retrieval complexity

## Consequences

- Retrieval quality depends heavily on embedding quality
- May miss some relevant passages that a reranker would surface
- Can be enhanced in future iterations if needed

## Alternatives Considered

- **Top-K=8 + reranker**: Rejected due to added complexity and cost for MVP
- **Hybrid search**: Rejected due to added infrastructure complexity
- **Tool calling**: Rejected for MVP scope
