# Plan: BM25 + Graph Retrieval Fallback Mode

**Change ID:** bm25-graph-retrieval  
**Status:** proposed  
**Created:** 2026-08-20

## 1. Components

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `Bm25Index` | `packages/indexing/src/lib/bm25.ts` | Tokenize chunks, compute BM25 scores, return top-K |
| `DocGraph` | `packages/indexing/src/lib/doc-graph.ts` | Parse Markdown links → adjacency list + 1-hop expansion |
| `Bm25Retriever` | `packages/indexing/src/retrieval/bm25-retriever.ts` | File-backed BM25 store matching `VectorStore` interface |
| `GraphExpander` | `packages/indexing/src/retrieval/graph-expander.ts` | Expand BM25 hits with linked docs |
| `Eval modes` | `packages/indexing/src/eval.ts` | Add `--retrieval bm25` and `--retrieval bm25-graph` |
| `Indexer flag` | `packages/indexing/src/indexer.ts` | Add `--retrieval` flag, write `bm25.json` |
| `Runtime fallback` | `apps/web/src/lib/retrieval.ts` | Use BM25 when embedding fails or `RETRIEVAL_MODE=bm25` |
| `Config` | `apps/web/src/lib/config.ts` | Add `RETRIEVAL_MODE` env var |
| `Tests` | `packages/indexing/src/lib/bm25.test.ts`, `doc-graph.test.ts` | Unit tests for BM25 and graph parsing |

## 2. Implementation Order

### Phase A: Foundation (no UI changes)
1. `bm25.ts` — tokenizer + BM25 scoring
2. `doc-graph.ts` — Markdown link extraction + adjacency list
3. Unit tests for A1 + A2

### Phase B: Indexer integration
4. `bm25-retriever.ts` — file-backed store, same interface as `FileVectorStore`
5. `graph-expander.ts` — 1-hop expansion on hits
6. `indexer.ts` — `--retrieval` flag + `bm25.json` artifact
7. `eval.ts` — new modes

### Phase C: Runtime integration
8. `retrieval.ts` — BM25 fallback path
9. `config.ts` — `RETRIEVAL_MODE` env
10. E2E smoke: `npm run build && npm run start` with `RETRIEVAL_MODE=bm25`

## 3. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| BM25 quality << embeddings on Persian | Medium | Medium | Keep both paths; BM25 is fallback, not replacement |
| Graph parsing misses some links | Low | Low | Graceful degradation; BM25 still works without graph |
| `bm25.json` too large | Low | Medium | Chunk metadata only, no vectors; expect <20MB |
| Tokenizer splits Persian poorly | Medium | Medium | Use whitespace + regex; add Persian-specific tests |

## 4. Parallel vs Sequential

- A1 (`bm25.ts`) and A2 (`doc-graph.ts`) can be built in parallel.
- B4-B6 depend on A1+A2.
- C8-C9 can be built in parallel with B6.
- Integration (B7 + C10) must be sequential.

## 5. Verification Checkpoints

| Checkpoint | Criteria |
|------------|----------|
| A complete | `npm run test` passes for bm25 + doc-graph |
| B complete | `npm run index -- --retrieval bm25 --limit 50` writes `bm25.json` |
| C complete | `RETRIEVAL_MODE=bm25 npm run build` succeeds, `/api/chat` returns citations |
| Change complete | Eval miss rate ≤ 15% on 50-question smoke set |
