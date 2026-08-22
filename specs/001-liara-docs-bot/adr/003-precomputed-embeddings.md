# ADR-003: Precomputed Embeddings with GitHub Actions Re-indexing

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to store embeddings for Liara documentation. Two approaches:
1. Compute embeddings at runtime when docs change
2. Precompute embeddings and store them in the vector database

## Decision

We will use **precomputed embeddings** stored in Faiss. Re-indexing will be automated via **GitHub Actions** when documentation changes.

## Rationale

- **Performance**: No embedding computation overhead at runtime; queries are fast
- **Resource efficiency**: Embedding computation happens offline, not during user requests
- **Cost control**: Embedding API calls happen only during re-indexing, not per user query
- **Reliability**: Separates indexing from serving; indexing failures don't affect query serving
- **Automation**: GitHub Actions provides a reliable, scheduled, or event-driven re-indexing pipeline

## Consequences

- Requires a re-indexing pipeline (crawler → chunk → embed → index)
- Index files must be deployed with the application or downloaded at startup
- Documentation updates are not instantaneous (next deploy or scheduled run)
- Requires CI/CD pipeline configuration

## Alternatives Considered

- **Runtime embedding**: Rejected due to higher latency, cost per query, and resource usage during serving
