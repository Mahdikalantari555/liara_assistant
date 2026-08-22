# Quickstart: Liara Docs Bot

**Date**: 2026-08-20  
**Spec**: [spec.md](spec.md)

## Prerequisites

- Node.js 18+
- npm
- Docker
- ChromaDB client dependency installed
- OpenAI-compatible API key configured via Liara env vars
- Local embedding model at `/mnt/data/LocalAI/Models/Embeddings/bge-m3-Q4_K_M.gguf`
- `docs/public` directory present in repository root

## Setup

```bash
cp .env.example .env
# Edit .env and add your LLM_API_KEY if using external LLM
npm install
npm run build
docker build -t liara-docs-bot .
```

## Validation Scenarios

### V1: Chat answers with citations

1. Open the app.
2. Ask: "چطور پروژه‌ام را روی لیارا Deploy کنم؟"
3. Expected: Persian answer with citations formatted as `[Title](URL) - بخش: "Section"`.

### V2: Multi-turn context

1. Ask about Node.js deployment.
2. Ask: "اگر Deploy خطا داد چه کنم؟"
3. Expected: Troubleshooting specific to Node.js on Liara.

### V3: Ambiguity clarification

1. Ask: "چطور دیتابیس بسازم؟"
2. Expected: Clarification prompt listing database options.

### V4: Out-of-scope fallback

1. Ask a general programming question unrelated to Liara.
2. Expected: Polite fallback suggesting Liara support contact.

### V5: Sidebar updates

1. Open chat.
2. Ask about databases.
3. Expected: Sidebar shows database-related docs within 500ms.

### V6: Re-indexing without downtime

1. Trigger GitHub Actions re-index.
2. Send a query during re-indexing.
3. Expected: No downtime; zero user-visible errors.

### V7: Evaluation questions display

1. Open the chat page for the first time (no prior session).
2. Expected: 3-5 random evaluation questions are displayed.
3. Click one of the questions.
4. Expected: The question is submitted as the first message and the bot responds.

## Monitoring Validation

- Confirm logs include: query count, token usage, retrieval miss rate, fallback rate.
- Confirm no API keys or secrets appear in logs or client responses.
