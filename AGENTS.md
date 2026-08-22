# Project knowledge

This file gives AI agents context about your project: goals, commands, conventions, and gotchas.

## Quickstart
- **Setup**: `npm install` (npm workspaces — NOT yarn)
- **Dev**: `npm run dev` (apps/web on port 3000)
- **Build**: `npm run build` (packages/indexing typecheck + apps/web Next build)
- **Typecheck**: `npm run typecheck -w apps/web`
- **Index corpus**: `npm run index -- --retrieval embedding|bm25|bm25-graph`
- **Eval**: `npm run eval -- --retrieval <mode> --limit N`
- **Unit tests**: `npx tsx packages/indexing/src/lib/bm25.test.ts` etc.; apps/web tests via `npx tsx src/lib/<name>.test.ts`

## Architecture
- **Key directories**:
  - `apps/web/` — Next.js 14 chatbot UI + API routes (`/api/chat`, `/api/sidebar`, `/api/feedback`)
  - `packages/indexing/` — corpus chunker, crawler, embedder, BM25/graph retrieval, eval harness
  - `docs/public/llms/` — 1142 LLM-optimized Markdown files (the only part of the cloned liara-cloud/docs kept; full source backed up in `data/docs-source-backup-2026-08-21.tar.gz`)
  - `specs/001-liara-docs-bot/` — Formal feature specification
  - `openspec/` — Change proposals (spec-driven schema)
  - `Resources/` — Reference material (shadcn/ui, Vercel AI SDK)
- **Data flow**: User question → RAG retrieval from `docs/public/llms/` → LLM generation → Persian response with citations

## Conventions
- **Formatting/linting**: Tailwind CSS 3.4, `clsx`, dark mode via `class` strategy
- **JS config**: `jsconfig.json` / tsconfig — `@/*` alias maps to `./src/*` inside each workspace
- **Package manager**: npm workspaces (root `package.json`; do NOT use yarn here)
- **Sessions**: stateless JWT in client-held token; server keeps only ephemeral in-memory maps (rate limit, escalation streak)
- **LLM docs format**: Each llms file has `Original link:` pointing back to `docs.liara.ir`

## Things to avoid
- Don't use yarn/npm-inside-docs — `docs/` no longer contains a buildable app, only the RAG corpus under `public/llms/`
- Don't treat `docs/` as an app — it's reference data consumed by the indexer
- Don't hardcode LLM providers — spec requires OpenAI-compatible provider abstraction
- Don't persist session data server-side — sessions are JWT stateless per spec
