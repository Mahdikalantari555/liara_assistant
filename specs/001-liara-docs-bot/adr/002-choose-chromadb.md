# ADR-002: Choose ChromaDB as Vector Database

**Status**: Accepted  
**Date**: 2026-08-20  
**Deciders**: Project Team

## Context

We need a vector database to store and search documentation embeddings. Options evaluated:
- Faiss (Facebook AI Similarity Search)
- ChromaDB
- Qdrant

## Decision

We will use **ChromaDB** as the primary vector database.

## Rationale

- **Ease of use**: ChromaDB provides a simple API for embedding storage and retrieval
- **Feature-rich**: Built-in metadata filtering, collection management, and persistence
- **Integration**: Good ecosystem support with LangChain, LlamaIndex, and other AI frameworks
- **Deployment flexibility**: Can run embedded in the application or as a separate service
- **Developer experience**: Excellent documentation and community support

## Consequences

- Slightly higher resource usage compared to Faiss, but still lightweight enough for MVP
- Requires ChromaDB dependency in the application
- Metadata storage is handled natively by ChromaDB

## Alternatives Considered

- **Faiss**: Lighter but requires more manual implementation for metadata handling and persistence
- **Qdrant**: Powerful but overkill for MVP; more resource-intensive
