# ADR-004: Local/Offline Embedding Model for MVP

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to generate embeddings for documentation chunks. Options:
1. Use a local embedding model
2. Use an external embedding API (OpenAI-compatible)
3. Hybrid approach

## Decision

We will use a **local/offline embedding model** for the MVP (no external API key required), with the ability to migrate to API-based or different local models in the future.

## Rationale

- **No API key required**: Eliminates dependency on external embedding API keys for MVP
- **Offline capable**: Embeddings can be generated without internet access
- **Cost-effective**: No per-token embedding API costs during re-indexing
- **Resource efficient**: Lightweight embedding models can run on standard CPU
- **Migration path**: Architecture abstracts the embedding provider to enable future migration

## Consequences

- Requires bundling a local embedding model in the indexing pipeline
- Model size must be compatible with GitHub Actions runners and Liara resources
- Embedding quality depends on chosen model; must be validated against evaluation dataset
- LLM API remains external (internet required for query answering)

## Alternatives Considered

- **API-only embedding from start**: Rejected due to API key dependency and operational cost
- **Local embedding from start with API fallback**: Rejected — MVP doesn't need fallback complexity
