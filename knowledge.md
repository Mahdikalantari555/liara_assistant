# Project Knowledge — Liara Docs Bot

## What This Project Is

An **LLM-based documentation support assistant** for Liara users. It answers questions about Liara documentation using RAG (Retrieval-Augmented Generation) over 1142 official Markdown files. Built as a hackathon project for Liara's competition.

**Total scoring: 300 points** — Answer Quality (80), UI/UX (55), Agentic (50), Security (50), Deployment (40), Cost (25).

## Key Directories

| Path | Purpose |
|------|---------|
| `apps/web/` | **Bot app** — Next.js 14 chat UI + API routes (App Router, server routes under `src/app/api/`) |
| `packages/indexing/` | RAG pipeline — chunker, crawler, embedder, BM25/doc-graph retrieval, eval harness |
| `docs/public/llms/` | 1142 LLM-optimized Markdown files organized by topic (`paas/`, `dbaas/`, `ai/`, `one-click-apps/`, …). The rest of the cloned liara-cloud/docs site was removed; source backup: `data/docs-source-backup-2026-08-21.tar.gz` |
| `specs/` | Feature specifications. `specs/001-liara-docs-bot/spec.md` is the formal spec. |
| `openspec/` | Change proposals and their specs/design/tasks |
| `Resources/` | Reference docs for shadcn/ui, Vercel AI SDK, and design systems |

## Commands

```bash
# Setup
npm install            # npm workspaces at repo root

# Development
npm run dev            # apps/web on port 3000

# Build / typecheck
npm run build          # indexing typecheck + Next build
npm run typecheck -w apps/web

# Indexing & eval over the corpus
npm run index -- --retrieval embedding   # or bm25 | bm25-graph
npm run eval  -- --retrieval embedding --limit 20

# Unit tests (tsx assert scripts)
npx tsx packages/indexing/src/lib/bm25.test.ts
cd apps/web && npx tsx src/lib/escalation.test.ts
```

**Package manager**: npm workspaces (root `package.json`). The old yarn/docs-site instructions are obsolete.

## Architecture & Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router), static export (`output: "export"`) |
| Styling | Tailwind CSS 3.4 + dark mode (`class` strategy) |
| Search | Meilisearch (Liara One-Click App) |
| AI Logic | Vercel AI SDK |
| UI Components | shadcn/ui + AI Elements |
| Deployment | Docker on Liara (Nginx-based static platform) |
| LLM Providers | OpenAI-compatible endpoints (Kilo Gateway for testing, Aval AI for production) |

## Key Decisions (from spec)

- **Persian-only responses** — always respond in Persian regardless of input language
- **No authentication** — anonymous sessions with temporary IDs
- **No persistence** — sessions exist only in server memory (lost on refresh/restart)
- **Transient feedback** — logged but not stored in DB
- **Token budget** — hard stop when limit reached; offer to summarize
- **RAG source** — `docs/public/llms/` Markdown files (already LLM-optimized with headers, original URLs preserved)

## Conventions

- **Formatting**: Tailwind CSS with `clsx` for conditional classes. Dark mode via `dark` class.
- **JS config**: `jsconfig.json` uses `@/*` path alias mapped to `./src/*`
- **Build output**: Static export to `out/` directory, deployed via Nginx
- **Docker**: Uses Liara-specific mirrors (`docker-mirror.liara.ir`) and registry (`registry2.iran.liara.ir`)
- **LLM docs**: Each file has `Original link:` pointing back to `docs.liara.ir`

## Gotchas

- The `docs/` folder now contains **only the RAG corpus** (`docs/public/llms/`) plus a few static assets. It is not buildable and must not be treated as an app.
- Sessions are stateless JWTs held by the client — no server session store.
- The spec requires supporting **arbitrary LLM providers** — not hardcoded to a single vendor. Provider config uses `baseURL` + `apiKey` with OpenAI-compatible endpoints.
- Meilisearch is available as a Liara One-Click App but the bot uses its own BM25/vector retrieval, not Meilisearch.
- The `nomic-embed-text-v2-moe.Q8_0.gguf` embedding model (768 dimensions) is available locally at `/mnt/data/LocalAI/Models/Embeddings/` for testing via `llama-server --embedding`.

## Pending Items (from spec-chat.md)

- Kilo Gateway OpenAI compatibility confirmation
- Aval AI chat + embedding endpoint verification
- Production embedding model decision (local vs API)
- Liara resource limits on free/test plans
- Liara AI Service availability check
