# ADR-001: Use RAG Instead of Fine-tuning

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need to build an agent that answers questions based on Liara documentation. Two main approaches were considered:
1. Fine-tune a language model on Liara documentation
2. Use Retrieval-Augmented Generation (RAG) with a vector database

## Decision

We will use **RAG** as the primary retrieval mechanism.

## Rationale

- **Up-to-date information**: RAG allows us to query the latest documentation without retraining
- **Traceability**: Every answer can be traced back to specific documentation pages via citations
- **Cost-effective**: No need for expensive fine-tuning pipelines or retraining when docs change
- **Flexibility**: Easy to add/remove/update documentation sources
- **Architecture**: Aligns with the constraint that internet is only needed for updating docs, not for answering queries

## Consequences

- Requires a chunking, embedding, and retrieval pipeline
- Requires a vector database for similarity search
- Answers quality depends on retrieval quality
- We must maintain the documentation index

## Alternatives Considered

- **Fine-tuning**: Rejected due to high cost, lack of traceability, and need for retraining on every docs update
