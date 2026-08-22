# Design: Liara Docs Bot

**Change**: align-spec-with-notes-md  
**Date**: 2026-08-20  
**Status**: Draft

## Overview

This design document captures the architectural decisions for the Liara Docs Bot MVP, aligned with the requirements in `notes.md` and the updated `spec.md`.

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Container                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Frontend  │    │   Backend   │    │   Vector Store  │ │
│  │  (Next.js)  │◄──►│  (API)      │◄──►│   (ChromaDB)    │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                                │
│         │                  │                                │
│  ┌──────▼──────────────────▼──────┐                         │
│  │      LLM Provider (OpenAI-     │                         │
│  │      compatible)               │                         │
│  └────────────────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. Frontend (Next.js)
- Chat interface with message history
- Documentation sidebar/list alongside chat
- Source citations rendered as hyperlinks at end of responses
- Responsive design for modern browsers
- Static export build for deployment on Liara

#### 2. Backend (API)
- Session management (in-memory, anonymous)
- Message processing and LLM orchestration
- Context management for multi-turn conversations
- Clarification logic for ambiguous queries
- Feedback logging (transient)
- RAG pipeline: query → ChromaDB search → LLM generation

#### 3. Vector Store (ChromaDB)
- Stores documentation embeddings
- Provides similarity search for RAG retrieval
- Embedded within the application stack

#### 4. LLM Provider
- OpenAI-compatible provider abstraction
- Persian response generation
- Citation extraction and formatting

## Data Flow

1. User submits question via chat interface
2. Backend creates/retrieves session context
3. Query is embedded and searched against ChromaDB
4. Retrieved docs are sent to LLM with context and citation instructions
5. LLM generates Persian response with source citations
6. Response is displayed with citations as hyperlinks
7. Documentation sidebar updates with relevant links

## Documentation Sidebar

- Displays context-relevant documentation links
- Updates based on conversation topic
- Links open in new tab to docs.liara.ir
- Helps users discover related documentation

## Citation Format

Every bot response ends with:
```
برای اطلاعات بیشتر به مستندات مراجعه کنید:
- [Documentation Title 1](https://docs.liara.ir/path1)
- [Documentation Title 2](https://docs.liara.ir/path2)
```

## Deployment

- Docker container with multi-stage build (Node.js builder → Nginx static server)
- Deployed on Liara infrastructure
- Environment variables for LLM provider configuration

## Technical Constraints

- ChromaDB for vector storage (mandated by notes.md)
- Docker for containerization (mandated by notes.md)
- Liara deployment target (mandated by notes.md)
- In-memory sessions only (no persistence)

## Future Integration

The chat interface is designed to potentially integrate as a page within the Liara documentation site under the title "دستیار هوش مصنوعی" (AI Assistant).
