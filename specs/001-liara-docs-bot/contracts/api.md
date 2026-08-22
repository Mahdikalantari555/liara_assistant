# API Contracts: Liara Docs Bot

**Date**: 2026-08-20  
**Spec**: [spec.md](spec.md)

## Frontend ↔ Backend

### POST /api/chat

Send a user message and receive the assistant reply.

**Request**

```json
{
  "sessionToken": "string (JWT)",
  "message": "string",
  "signal": "string (AbortSignal id, optional)"
}
```

**Response 200**

```json
{
  "reply": "string",
  "citations": [
    {
      "title": "string",
      "url": "string",
      "section": "string",
      "score": 0.0
    }
  ],
  "suggestions": ["string"],
  "tokenUsage": {
    "input": 0,
    "output": 0
  }
}
```

**Error 429**

Rate limited.

```json
{
  "error": "rate_limited",
  "retryAfterMs": 1000
}
```

### POST /api/feedback

Submit transient feedback for an answer.

**Request**

```json
{
  "sessionToken": "string",
  "responseId": "string",
  "type": "positive | negative"
}
```

**Response 200**

```json
{
  "status": "recorded"
}
```

### GET /api/sidebar?context=<query>

Return context-relevant doc links for the sidebar.

**Response 200**

```json
{
  "links": [
    {
      "title": "string",
      "url": "string",
      "section": "string"
    }
  ]
}
```

## Runtime Configuration

All secrets and environment-specific values are loaded from environment variables. The application must read `.env` at startup. Required variables:

- `LLM_API_KEY`: API key for LLM provider (never logged or exposed)
- `LLM_API_BASE`: Base URL for LLM provider
- `LLM_MODEL`: Model identifier
- `EMBEDDING_MODEL_PATH`: Path to local embedding model file
- `EMBEDDING_TYPE`: `local` or `api`
- `CHROMA_DB_PATH`: ChromaDB persistence path

## Indexing Pipeline (CI)

Input: `docs/public`  
Output: ChromaDB collection artifact

Not exposed as a runtime API; executed in GitHub Actions.
