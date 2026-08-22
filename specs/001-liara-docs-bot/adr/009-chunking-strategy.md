# ADR-009: Chunking Strategy — Size, Overlap, and Metadata

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to define how documentation is split into chunks for embedding. The chunking strategy directly impacts RAG retrieval quality.

## Decision

We will use the following chunking parameters:
- **Chunk Size**: 512 tokens
- **Chunk Overlap**: 50 tokens (≈10% overlap)
- **Metadata Structure**: Each chunk stores: `source_url`, `section_title`, `page_title`, `chunk_id`, `token_count`

## Rationale

- **512 tokens**: Large enough to contain meaningful context, small enough for precise retrieval
- **50 token overlap**: Prevents losing context at chunk boundaries while keeping index size manageable
- **Rich metadata**: Enables detailed citations (Title + Link + Section) and better filtering
- **RAG quality**: Directly impacts the 80-point answer quality criterion

## Consequences

- Chunking must be consistent between indexing and retrieval
- Metadata must be preserved through the entire pipeline
- Chunk size may need tuning based on actual documentation structure

## Alternatives Considered

- **Smaller chunks (256 tokens)**: Might lose context
- **Larger chunks (1024 tokens)**: Might reduce retrieval precision
- **No overlap**: Risk of missing information at boundaries
