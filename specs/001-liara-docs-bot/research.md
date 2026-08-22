# Research: Liara Docs Bot

**Date**: 2026-08-20  
**Feature**: [spec.md](spec.md)  
**Plan**: [plan.md](plan.md)

## R1: ChromaDB on Liara

- **Decision**: Use ChromaDB client embedded in the app, persisted to mounted storage or bundled index files.
- **Rationale**: Avoids a separate managed service, fits the lightweight/frugal constraint, and matches the finalized architecture decision.
- **Alternatives considered**: Faiss (more manual), Qdrant (heavier), hosted vector DB (external dependency/cost).

## R2: Static export Next.js for Liara deploy

- **Decision**: Use `output: "export"` and serve via Nginx on Liara.
- **Rationale**: Matches the existing docs site convention, keeps the frontend frugal, and works with Liara Docker deployment.
- **Alternatives considered**: SSR/SSG on Node runtime (more resource usage), separate frontend host (extra dependency).

## R3: GitHub Actions re-indexing

- **Decision**: Run indexing workflow on docs change, validate new collection, then swap.
- **Rationale**: Keeps runtime offline-capable and meets the precomputed-embeddings requirement.
- **Alternatives considered**: Runtime re-index (violates offline query requirement), manual re-index (error-prone).

## R4: Local/offline embedding model for MVP

- **Decision**: Use `bge-m3-Q4_K_M.gguf` from `/mnt/data/LocalAI/Models/Embeddings/` as the local/offline embedding model for MVP (no external API key required), with provider abstraction to support API-based or different local models in the future.
- **Rationale**: Eliminates API key dependency for embeddings, reduces operational cost, and enables offline re-indexing. The LLM API remains external for answer generation. `bge-m3` is multilingual and suitable for Persian documentation.
- **Alternatives considered**: API-only embedding (requires key/cost), local LLM for answers (too heavy for Liara resources).

## R5: LLM provider

- **Decision**: Use `https://api.kilo.ai/api/gateway` with model `kilo-auto/free` for MVP. API key is provided via environment variable and must never be committed to source control.
- **Rationale**: Cost-effective for MVP, OpenAI-compatible API simplifies integration, free tier suitable for evaluation.
- **Alternatives considered**: Self-hosted LLM (too heavy), other paid APIs (higher cost).

## R5: Chunking parameters

- **Decision**: 512-token chunks with 50-token overlap; preserve metadata.
- **Rationale**: Balanced retrieval precision/recall for documentation-sized content.
- **Alternatives considered**: 256 tokens (too fragmented), 1024 tokens (lower precision).

## R6: Top-K=5 without reranker

- **Decision**: MVP uses vector search only with Top-K=5.
- **Rationale**: Minimizes cost and complexity while meeting answer-quality targets.
- **Alternatives considered**: Reranker (higher cost/latency), hybrid search (more infrastructure).
