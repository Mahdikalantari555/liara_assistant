# Tasks: Add Hybrid Search

## 1. Fusion primitive

- [ ] 1.1 Create `packages/indexing/src/lib/rrf.ts` — `fuseRankings(lists: RetrievedChunk[][], k = 60): RetrievedChunk[]` with chunkId dedup + fused score; export normalized-score helper
- [ ] 1.2 Add `packages/indexing/src/lib/rrf.test.ts` — dedup, rank math, empty-list handling, deterministic order
- [ ] 1.3 Export `rrf.ts` from `packages/indexing/src/index.ts`

## 2. Hybrid retriever

- [ ] 2.1 Create `packages/indexing/src/retrieval/hybrid-retriever.ts` — run embedding search + BM25 search via `Promise.allSettled`, widen each leg to `topK * 3`, fuse, cut to topK
- [ ] 2.2 Handle per-leg failure: one rejected → other leg's results; both rejected → throw (caller maps to miss)

## 3. Runtime integration

- [ ] 3.1 `apps/web/src/lib/config.ts` — extend `retrieval.mode` union with `'hybrid'`
- [ ] 3.2 `apps/web/src/lib/retrieval.ts` — add hybrid branch using the shared retriever; preserve `RetrievalResult` shape and existing fallbacks
- [ ] 3.3 `.env.example` — document `RETRIEVAL_MODE=hybrid`

## 4. Evaluation

- [ ] 4.1 `packages/indexing/src/eval.ts` — accept `--retrieval hybrid`, reuse the same fusion helper
- [ ] 4.2 Run `npm run eval` for `embedding`, `bm25-graph`, `hybrid` on the smoke set; record miss/fallback rates in this change's notes

## 5. Verification

- [ ] 5.1 `npm run test` passes including new rrf tests
- [ ] 5.2 `RETRIEVAL_MODE=hybrid npm run build && npm run start`; `/api/chat` returns citations in unchanged shape
- [ ] 5.3 Kill embedding endpoint with hybrid mode on → chat still answers from BM25 leg
