# BM25 + Graph Retrieval Fallback Mode

**Change ID:** bm25-graph-retrieval  
**Status:** proposed  
**Created:** 2026-08-20

## ASSUMPTIONS
1. Embedding provider may be unavailable (local llama-server down, no API credit, network blocked).
2. Corpus is local Markdown under `docs/public/llms/` with `Original link:` headers and internal Markdown links.
3. We want a deterministic, offline-capable fallback that still returns relevant chunks with citations.
4. Graph expansion is optional and additive: it enriches BM25 hits, it does not replace them.
5. Existing API contract (`/api/chat`, `/api/sidebar`) must remain stable for the frontend.

→ Correct me now if any assumption is wrong.

## Objective

Add a retrieval fallback mode that works **without any embedding service**.  
When the embedding provider fails or is disabled, the app must still:

- retrieve top-K relevant chunks using **BM25** over raw text,
- optionally expand results using a **doc-to-doc graph** extracted from Markdown links,
- return the same response shape (`citations`, `links`, `fallback` flag) so the UI does not change.

This unblocks indexing, evaluation, and demo when llama-server or remote embedding APIs are unavailable.

## Commands

```bash
# Run full indexing with BM25 fallback (no embedding provider needed)
npm run index -- --retrieval bm25

# Run BM25-only evaluation smoke test
npm run eval -- --retrieval bm25 --limit 20

# Run BM25 + graph expansion evaluation
npm run eval -- --retrieval bm25-graph --limit 20
```

Flags:
- `--retrieval bm25` — use BM25 only, no graph expansion
- `--retrieval bm25-graph` — BM25 + 1-hop doc graph expansion
- `--limit N` — smoke-test on first N pages

## Project Structure

```
packages/indexing/src/
  lib/
    bm25.ts                 # BM25 index + search over chunks
    doc-graph.ts            # Parse Markdown links → adjacency list
  retrieval/
    bm25-retriever.ts       # VectorStore-like BM25 implementation
    graph-expander.ts       # Graph expansion on BM25 hits
  eval.ts                   # Add bm25 / bm25-graph modes
  indexer.ts                # Add --retrieval flag

apps/web/src/lib/
  retrieval.ts              # Add BM25 fallback path
  config.ts                 # Add RETRIEVAL_MODE env
```

## Code Style

```typescript
// packages/indexing/src/lib/bm25.ts
export interface Bm25Index {
  search(query: string, topK: number): Promise<RetrievedChunk[]>;
}

export function buildBm25Index(chunks: DocumentationChunk[]): Bm25Index {
  const tokens = new Map<string, Set<string>>();
  const df = new Map<string, number>();
  const N = chunks.length;
  const avgdl = chunks.reduce((s, c) => s + c.tokenCount, 0) / N;
  const k1 = 1.5;
  const b = 0.75;

  for (const c of chunks) {
    const t = new Set(tokenize(c.content));
    tokens.set(c.chunkId, t);
    for (const w of t) df.set(w, (df.get(w) ?? 0) + 1);
  }

  return {
    async search(query, topK) {
      const qTerms = tokenize(query);
      const scores = chunks.map((c) => {
        const doc = tokens.get(c.chunkId)!;
        let score = 0;
        for (const q of qTerms) {
          const idf = Math.log((N - (df.get(q) ?? 0) + 0.5) / ((df.get(q) ?? 0) + 0.5) + 1);
          const f = [...doc].filter((w) => w === q).length;
          score += idf * (f * (k1 + 1)) / (f + k1 * (1 - b + b * (c.tokenCount / avgdl)));
        }
        return { chunk: c, score };
      });
      return scores.sort((a, b) => b.score - a.score).slice(0, topK).map((s) => ({ ...s.chunk, score: s.score }));
    },
  };
}
```

## Testing Strategy

- **Unit:** `packages/indexing/src/lib/bm25.test.ts` — tokenization, IDF bounds, top-K determinism.
- **Unit:** `packages/indexing/src/lib/doc-graph.test.ts` — link extraction, cycle handling.
- **Integration:** `npm run eval -- --retrieval bm25 --limit 50` — compare miss/fallback rates vs embedding baseline.
- **Smoke:** `npm run build && npm run start` with `RETRIEVAL_MODE=bm25` → chat answers still include citations.

## Boundaries

### Always
- BM25 mode must never crash the app; if it throws, fall back to the existing `fallback.ts` no-context response.
- BM25 index is rebuilt on every `npm run index` and written to `data/index/<version>/bm25.json`.
- Graph expansion is read-only at runtime; no network calls.

### Ask First
- Changing default `RETRIEVAL_MODE` from `embedding` to `bm25`.
- Shipping graph expansion as the default path (requires eval approval).

### Never
- Do not remove the embedding path. BM25 is a fallback, not a replacement.
- Do not add external services (Chroma, Redis) for BM25 mode.
- Do not send BM25 index files to the network.

## Success Criteria

| Metric | Target |
|--------|--------|
| Build | `npm run build` passes with `RETRIEVAL_MODE=bm25` |
| Eval miss rate | ≤ 15% on 50-question smoke set |
| Eval fallback rate | ≤ 20% (answers with citations) |
| Index size | `bm25.json` ≤ 20MB for full corpus |
| Startup | No network calls during BM25 retrieval |
| API contract | `/api/chat` response shape unchanged |
