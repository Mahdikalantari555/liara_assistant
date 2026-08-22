# Implementation Plan: Liara Docs Bot

**Branch**: `001-liara-docs-bot` | **Date**: 2026-08-20 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-liara-docs-bot/spec.md`

## Summary

Build a Persian-only docs assistant for Liara that answers questions from local `docs/public` via RAG with ChromaDB. The `docs/public` directory is versioned in the main repository, enabling offline-first operation. The app is stateless, horizontally scalable, and deployable on Liara. MVP focuses on retrieval quality, citation quality, and UX rather than infrastructure complexity.

## Technical Context

**Language/Version**: TypeScript (Node.js 18+)

**Primary Dependencies**: Next.js 14, Tailwind CSS 3.4, ChromaDB, OpenAI-compatible SDK, Vercel AI SDK (optional), local embedding model (`bge-m3-Q4_K_M.gguf` via llama.cpp)

**Storage**: ChromaDB (vector), filesystem (docs, index artifacts), in-memory (sessions/logs)

**Testing**: Jest + React Testing Library + Playwright (E2E)

**Target Platform**: Linux container (Docker) on Liara

**Project Type**: Web application (static export) + indexing pipeline

**Performance Goals**: 90% of answers under 8s; 100 concurrent sessions; Top-K=5 retrieval under 500ms

**Constraints**: Frugal, lightweight, deployment-friendly, minimal external dependencies, npm-only, local embedding model (`bge-m3-Q4_K_M.gguf`), LLM via `https://api.kilo.ai/api/gateway` (`kilo-auto/free`)

**Scale/Scope**: 3+ horizontal instances; docs corpus in `docs/public`; evaluation dataset of 50–100 questions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No project constitution is currently defined beyond the spec-driven defaults. This plan aligns with the spec’s explicit design priorities: frugal, lightweight, deployment-friendly, minimal external dependencies, and scalable.

## Project Structure

### Documentation (this feature)

```text
specs/001-liara-docs-bot/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # API contracts
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
apps/web/                 # Frontend (Next.js app router)
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Chat/
│   │   └── Sidebar/
│   └── lib/
│       ├── chat.ts
│       └── sidebar.ts
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
└── Dockerfile

packages/
└── indexing/             # GitHub Actions / local indexing pipeline
    ├── src/
    │   ├── crawler.ts
    │   ├── chunker.ts
    │   ├── embedder.ts
    │   └── indexer.ts
    └── package.json

infra/
└── liara/                # Liara deployment config
    ├── liara.json
    └── nginx.conf
```

**Structure Decision**: Use an apps/web frontend plus a separate packages/indexing pipeline. The frontend is a static-export Next.js app. The indexing package is run in CI to produce a ChromaDB artifact deployed with the app or fetched at startup.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Separate indexing package | Re-indexing must run in GitHub Actions without the web runtime | Keeping it in web would couple CI to runtime dependencies and increase image size |
| Versioned ChromaDB collection swap | Zero-downtime re-indexing is required | In-place replace would cause downtime or stale reads |

## Actual Deviations / Decisions

| Planned | Actual | Reason |
|---------|--------|--------|
| `output: "export"` + Nginx static | `output: "standalone"` Node server | Static export cannot run `/api/*` route handlers (chat, feedback, sidebar). Liara Node platform serves the standalone server directly. |
| Local embedding (`bge-m3` via llama-server) as default | AvalAI `text-embedding-3-large` (3072 dims) as default | Local model path is unavailable in the default deploy environment; hosted embeddings remove the model-serving dependency and simplify CI. Runtime and indexer must use the same model (manifest enforces this). |
| ChromaDB HTTP service | File-backed vector store (`data/index/`) | MVP offline-first requirement: zero extra services. The committed artifact is read-only at runtime and swapped by CI. Chroma HTTP adapter stays available for scale-out. |
| Tests: Jest + RTL + Playwright | Omitted for MVP | Spec allows lightweight validation via quickstart scenarios + selfcheck + eval dataset. Keeps the initial build fast and frugal. |
| Docker: Node → Nginx | Docker: Node standalone only | Nginx is unnecessary when serving a single Next.js standalone process on Liara Node platform. Reduces image size and failure surface. |
