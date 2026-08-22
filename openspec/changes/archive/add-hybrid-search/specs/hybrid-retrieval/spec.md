# Hybrid Retrieval — Delta Spec

## Purpose

Combine semantic (embedding) and lexical (BM25) retrieval so queries that only one signal can match still surface the right chunks, with graceful degradation when either signal is unavailable.

## ADDED Requirements

### Requirement: Hybrid mode fuses both retrievers

The system SHALL support `RETRIEVAL_MODE=hybrid`, which retrieves candidates from BOTH the embedding store and the BM25 index for the same (topic-prefixed) query, and SHALL produce a single fused ranking using Reciprocal Rank Fusion with a fixed constant k = 60.

#### Scenario: Both legs return hits
- **WHEN** `RETRIEVAL_MODE=hybrid` and both the embedding search and the BM25 search succeed
- **THEN** the returned chunk list is the RRF-fused ranking of both result sets, deduplicated by `chunkId` with fused scores

#### Scenario: Query matches only lexically
- **WHEN** a query contains an exact identifier (e.g. an error code) that embeddings rank low but BM25 ranks high
- **THEN** that chunk appears in the fused top-K results

### Requirement: Per-leg degradation never regresses below single-mode

In hybrid mode, if one leg fails (embedding provider down or BM25 index missing), the system SHALL return the surviving leg's results unchanged, and MUST NOT return an empty result when at least one leg succeeded.

#### Scenario: Embedding provider down
- **WHEN** hybrid mode is active and the embedding call throws
- **THEN** results come from the BM25 leg alone and retrieval is not reported as a miss solely due to the embedding failure

#### Scenario: BM25 index missing
- **WHEN** hybrid mode is active and no BM25 artifact exists for the current version
- **THEN** results come from the embedding leg alone

#### Scenario: Both legs fail
- **WHEN** both the embedding call and the BM25 lookup fail
- **THEN** the system returns a retrieval miss (`miss: true`) exactly as today's last-resort path does

### Requirement: Relevance threshold applies to fused scores

Hybrid mode SHALL apply the existing `RETRIEVAL_MIN_SCORE` gate against normalized fused scores (RRF score divided by its theoretical maximum for the observed leg count), so the `relevant`/`miss` semantics match the existing modes.

#### Scenario: Fused results below threshold
- **WHEN** all fused scores normalize below `RETRIEVAL_MIN_SCORE`
- **THEN** `relevant` is empty and `miss` is true

### Requirement: Eval supports hybrid mode

The evaluation harness SHALL accept `--retrieval hybrid` and report miss/fallback rates comparable to the `embedding` and `bm25-graph` modes.

#### Scenario: Hybrid eval run
- **WHEN** `npm run eval -- --retrieval hybrid --limit 20` runs
- **THEN** it completes and prints miss rate and fallback rate for the hybrid strategy

### Requirement: API contract unchanged

Switching `RETRIEVAL_MODE` to `hybrid` SHALL NOT change the response shape of `/api/chat` or `/api/sidebar`.

#### Scenario: Chat under hybrid mode
- **WHEN** a question is asked with `RETRIEVAL_MODE=hybrid`
- **THEN** `/api/chat` returns answers with `citations` and `links` in the existing shape
