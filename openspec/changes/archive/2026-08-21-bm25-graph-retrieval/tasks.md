# Tasks: BM25 + Graph Retrieval Fallback Mode

**Change ID:** bm25-graph-retrieval  
**Input:** `openspec/changes/bm25-graph-retrieval/specs/bm25-graph-retrieval.md`, `plan.md`

## Phase A: Foundation

- [ ] T001 [P] [A1] Implement tokenizer + BM25 index in `packages/indexing/src/lib/bm25.ts`
- [ ] T002 [P] [A2] Implement Markdown link parser + adjacency list in `packages/indexing/src/lib/doc-graph.ts`
- [ ] T003 [A] Add unit tests for BM25 scoring and top-K determinism in `packages/indexing/src/lib/bm25.test.ts`
- [ ] T004 [A] Add unit tests for graph parsing and cycle handling in `packages/indexing/src/lib/doc-graph.test.ts`

## Phase B: Indexer Integration

- [ ] T005 [B1] Implement file-backed `Bm25Retriever` matching `VectorStore` interface in `packages/indexing/src/retrieval/bm25-retriever.ts`
- [ ] T006 [B2] Implement `GraphExpander` for 1-hop doc expansion in `packages/indexing/src/retrieval/graph-expander.ts`
- [ ] T007 [B3] Add `--retrieval bm25|bm25-graph|embedding` flag to `packages/indexing/src/indexer.ts` and write `bm25.json` artifact
- [ ] T008 [B4] Add `--retrieval` modes to `packages/indexing/src/eval.ts`

## Phase C: Runtime Integration

- [ ] T009 [C1] Add BM25 fallback path in `apps/web/src/lib/retrieval.ts` when embedding fails or `RETRIEVAL_MODE=bm25`
- [ ] T010 [C2] Add `RETRIEVAL_MODE` env var to `apps/web/src/lib/config.ts`
- [ ] T011 [C3] Smoke test: `RETRIEVAL_MODE=bm25 npm run build && npm run start` → `/api/chat` returns citations

## Verification

- [ ] T012 Run `npm run test` (or `npx tsx` smoke scripts) for new modules
- [ ] T013 Run `npm run index -- --retrieval bm25 --limit 50` and verify `bm25.json` is written
- [ ] T014 Run `npm run eval -- --retrieval bm25 --limit 50` and check miss/fallback rates
- [ ] T015 Update `specs/001-liara-docs-bot/tasks.md` checkboxes for completed BM25 tasks
