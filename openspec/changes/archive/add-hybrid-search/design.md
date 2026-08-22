# Design: Add Hybrid Search

## Context

`apps/web/src/lib/retrieval.ts` already dispatches on `retrieval.mode`: `bm25`/`bm25-graph` use the BM25 artifact via `@liara-docs-bot/indexing`, everything else uses the embedding store, with BM25 as last-resort on embedding failure. Both legs exist and are independently tested; what's missing is running them together and merging rankings. The BM25 index is rebuilt by every `npm run index`, so hybrid needs no new indexing step.

## Goals / Non-Goals

**Goals:**
- One new mode value `hybrid`; both legs run in parallel; RRF fusion.
- Degradation: any single failed leg falls back to the other leg's results.
- Same fusion logic at runtime and in eval (one shared implementation).

**Non-Goals:**
- No reranker/cross-encoder stage.
- No weighted fusion tuning UI or per-query weights — fixed k=60, equal leg weight.
- No changes to chunking, embedding model, or BM25 scoring.

## Decisions

1. **RRF over score normalization.** Embedding cosine scores and BM25 scores live on incomparable scales; normalizing both to a common scale is brittle. RRF uses only ranks: `score(d) = Σ 1/(k + rank_i(d))`, k=60 — the standard constant from the original paper, insensitive to tuning.
   *Alternative considered:* min-max normalize each leg then average — rejected because a single outlier leg skews the whole scale.
2. **Fusion lives in `packages/indexing/src/lib/rrf.ts`.** Eval (`eval.ts`) and runtime (`retrieval.ts`) must not drift; the package is already shared between them.
3. **Hybrid runs legs concurrently** (`Promise.allSettled`) so total latency ≈ max(leg latencies), not the sum. A rejected leg degrades to the other; both rejected → existing miss path.
4. **BM25 top-K widened before fusion.** Each leg fetches `topK * 3` candidates (capped) before fusion, then the fused list is cut to `topK`. Fusing only top-K of each leg starves chunks that are #6 in one leg but #1 in the other.
5. **Threshold on normalized fused score.** Raw RRF scores cluster near `2/(60+1)`; divide by the max achievable for the number of contributing legs so `RETRIEVAL_MIN_SCORE` keeps its existing meaning. Documented as heuristic; eval gates it.
6. **Default stays `embedding`.** Hybrid becomes default only if eval shows miss-rate improvement; flipping the default is an explicit follow-up decision (mirrors bm25-graph's "Ask First" boundary).

## Risks / Trade-offs

- [Latency doubles when embedding leg is slow] → parallel execution caps it at max(legs); BM25 is local and fast.
- [RRF equal weight may under-rank the stronger leg] → acceptable first cut; eval comparison decides whether weights are ever needed (out of scope until data says so).
- [Normalized-threshold semantics differ slightly across modes] → eval reports all modes side by side; spec pins only `relevant`/`miss` behavior, not exact scores.
- [BM25 artifact load cost on every request] → unchanged from today's fallback path; same lazy import, no regression.

## Migration Plan

1. Ship `rrf.ts` + hybrid retriever + eval mode behind the explicit `RETRIEVAL_MODE=hybrid` flag.
2. Run `npm run eval -- --retrieval hybrid` vs baselines; record numbers.
3. Flip default (or don't) as a one-line config change with its own review.
4. Rollback: set `RETRIEVAL_MODE` back to `embedding`/`bm25` — no data or index migration exists to undo.

## Open Questions

None blocking. Weighted fusion and default flip are deferred pending eval numbers.
