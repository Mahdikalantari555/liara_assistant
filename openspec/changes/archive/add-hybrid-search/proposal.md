# Proposal: Add Hybrid Search

## Why

Retrieval currently runs a single mode: embeddings (`embedding`) or, when embeddings are unavailable, lexical BM25 (`bm25`/`bm25-graph`). Each alone misses queries the other catches — embeddings handle paraphrase and Persian phrasing, BM25 handles exact identifiers (`CLI`, error codes, `liara deploy`). Hybrid search fuses both ranked lists so retrieval quality stops depending on one signal.

## What Changes

- Add `hybrid` to `RETRIEVAL_MODE`, running the embedding path and BM25 path **in parallel** and fusing their results with Reciprocal Rank Fusion (RRF).
- Add a shared fusion helper in `packages/indexing` (`rrf.ts`) so both the runtime and `eval.ts` use identical fusion logic.
- Extend eval modes with `--retrieval hybrid` for before/after comparison against `embedding` and `bm25`.
- Graceful degradation preserved: if either leg fails, hybrid falls back to the surviving leg's results (never worse than today's single-mode behavior).
- No change to `/api/chat` or `/api/sidebar` response shapes; no change to defaults (`embedding` stays default until eval proves hybrid wins).

## Capabilities

### New Capabilities
- `hybrid-retrieval`: parallel semantic + lexical retrieval with RRF fusion, per-leg degradation, and hybrid eval mode.

### Modified Capabilities

(none — existing `bm25-graph-retrieval` behavior is reused as-is as one fusion leg; its requirements do not change)

## Impact

- **Code**: `apps/web/src/lib/retrieval.ts` (hybrid branch), `apps/web/src/lib/config.ts` (mode union + env docs), `packages/indexing/src/retrieval/*` (RRF + hybrid retriever), `packages/indexing/src/eval.ts` (new mode), `.env.example` (document `RETRIEVAL_MODE=hybrid`).
- **APIs**: none changed.
- **Dependencies**: none added.
- **Data**: reuses existing vector index and `bm25.json`; no re-index required.
