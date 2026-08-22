# Tasks: Liara Docs Bot

**Input**: Design documents from `specs/001-liara-docs-bot/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not explicitly requested in spec; tests are OPTIONAL and omitted to keep MVP lightweight. Validation relies on quickstart.md scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize project structure per implementation plan
- [ ] T002 Initialize npm project in `apps/web/` with Next.js 14, Tailwind CSS 3.4, TypeScript
- [ ] T003 [P] Initialize npm project in `packages/indexing/` with TypeScript and ChromaDB client
- [ ] T004 [P] Create `infra/liara/liara.json` with Liara deployment configuration
- [ ] T005 [P] Create `infra/liara/nginx.conf` for static export serving
- [ ] T006 [P] Configure `apps/web/tsconfig.json` and `packages/indexing/tsconfig.json`
- [ ] T007 [P] Configure `apps/web/tailwind.config.ts` with Liara design tokens from `(liara)-DESIGN.md`
- [ ] T008 [P] Create `apps/web/next.config.js` with `output: "export"` for static build
- [ ] T009 [P] Create root `package.json` with npm workspaces linking `apps/web` and `packages/indexing`
- [ ] T010 Create `.gitignore` for Node.js, Next.js, and ChromaDB artifacts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 [P] Implement ChromaDB client wrapper in `packages/indexing/src/lib/chromadb.ts`
- [ ] T012 [P] Implement embedding provider abstraction in `packages/indexing/src/lib/embedding.ts`
- [ ] T013 [P] Implement LLM provider abstraction in `apps/web/src/lib/llm.ts`
- [ ] T014 [P] Implement JWT session utilities in `apps/web/src/lib/session.ts`
- [ ] T015 [P] Implement rate limiter middleware in `apps/web/src/middleware/rate-limit.ts`
- [ ] T016 [P] Implement metrics logger in `apps/web/src/lib/metrics.ts`
- [ ] T017 [P] Implement query cache in `apps/web/src/lib/cache.ts`
- [ ] T018 [P] Create shared TypeScript types in `packages/indexing/src/types/index.ts`
- [ ] T019 [P] Create `apps/web/src/types/index.ts` for frontend types
- [ ] T020 Configure environment variable schema for LLM API keys and secrets via Liara env vars
- [ ] T021 Create `apps/web/Dockerfile` with multi-stage Node.js → Nginx build
- [ ] T022 Create GitHub Actions workflow skeleton in `.github/workflows/reindex.yml`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Ask Documentation Question (Priority: P1) 🎯 MVP

**Goal**: User asks a question and receives a Persian answer with source citations from Liara docs.

**Independent Test**: Ask a documented question and verify answer includes at least one citation in format `[Title](URL) - بخش: "Section"`.

### Implementation for User Story 1

- [ ] T023 [P] [US1] Create crawler in `packages/indexing/src/crawler.ts` to read `docs/public` markdown files
- [ ] T024 [P] [US1] Create chunker in `packages/indexing/src/chunker.ts` with 512-token chunks and 50-token overlap
- [ ] T025 [P] [US1] Create embedder in `packages/indexing/src/embedder.ts` using external embedding API
- [ ] T026 [P] [US1] Create indexer in `packages/indexing/src/indexer.ts` to populate ChromaDB collection
- [ ] T027 [US1] Implement RAG retrieval service in `apps/web/src/lib/retrieval.ts` with Top-K=5
- [ ] T028 [US1] Implement chat API route in `apps/web/src/app/api/chat/route.ts` with POST `/api/chat`
- [ ] T029 [US1] Implement prompt template for Persian answers with citation instructions in `apps/web/src/lib/prompts.ts`
- [ ] T030 [US1] Implement fallback response logic for out-of-scope or no-retrieval queries
- [ ] T031 [P] [US1] Create Chat message component in `apps/web/src/components/Chat/Message.tsx`
- [ ] T032 [P] [US1] Create Chat input component in `apps/web/src/components/Chat/ChatInput.tsx`
- [ ] T033 [P] [US1] Create Chat container component in `apps/web/src/components/Chat/ChatContainer.tsx`
- [ ] T034 [US1] Implement citation rendering with `[Title](URL) - بخش: "Section"` format
- [ ] T035 [US1] Implement input sanitization to reduce prompt injection risk
- [ ] T036 [US1] Wire frontend chat to `POST /api/chat` with session token and message

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Continue Multi-Turn Conversation (Priority: P1)

**Goal**: Bot remembers earlier conversation context and provides contextually relevant follow-up answers.

**Independent Test**: Ask follow-up question referencing previous topic without repeating it; verify bot understands context.

### Implementation for User Story 2

- [ ] T037 [US2] Implement conversation context management in `apps/web/src/lib/context.ts`
- [ ] T038 [US2] Implement JWT-based session state encoding/decoding in `apps/web/src/lib/session.ts`
- [ ] T039 [US2] Add conversation history to LLM prompt in `apps/web/src/lib/prompts.ts`
- [ ] T040 [US2] Implement context-aware retrieval that incorporates previous messages
- [ ] T041 [US2] Implement token budget tracking and hard stop when limit reached
- [ ] T042 [US2] Implement conversation summary offer when token budget exceeded

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 6 - Browse Documentation Alongside Chat (Priority: P1)

**Goal**: Documentation sidebar shows context-relevant links alongside chat.

**Independent Test**: Open chat and see sidebar with relevant docs; click link opens docs.liara.ir in new tab.

### Implementation for User Story 6

- [ ] T043 [P] [US6] Create Sidebar component in `apps/web/src/components/Sidebar/Sidebar.tsx`
- [ ] T044 [P] [US6] Create Sidebar link item component in `apps/web/src/components/Sidebar/SidebarItem.tsx`
- [ ] T045 [US6] Implement `GET /api/sidebar` route in `apps/web/src/app/api/sidebar/route.ts`
- [ ] T046 [US6] Implement sidebar link relevance scoring based on conversation context
- [ ] T047 [US6] Integrate sidebar into main layout in `apps/web/src/app/layout.tsx`
- [ ] T048 [US6] Style sidebar according to Liara design system: Yekan Bakh, 300px right-anchored, flat elevation

**Checkpoint**: User Story 6 should be independently functional

---

## Phase 6: User Story 3 - Clarify Ambiguous Questions (Priority: P2)

**Goal**: Bot asks clarifying questions when user intent is ambiguous.

**Independent Test**: Ask ambiguous question; verify bot asks clarification instead of guessing.

### Implementation for User Story 3

- [ ] T049 [US3] Implement ambiguity detection logic in `apps/web/src/lib/intent.ts`
- [ ] T050 [US3] Implement clarification prompt generation in `apps/web/src/lib/prompts.ts`
- [ ] T051 [US3] Implement clarification UI state in Chat component
- [ ] T052 [US3] Wire clarification flow to chat API route

**Checkpoint**: User Story 3 should be independently functional

---

## Phase 7: User Story 4 - Provide Feedback on Answers (Priority: P3)

**Goal**: User can submit thumbs up/down feedback on answers.

**Independent Test**: Click feedback button; verify confirmation and transient logging.

### Implementation for User Story 4

- [ ] T053 [P] [US4] Create feedback buttons component in `apps/web/src/components/Chat/Feedback.tsx`
- [ ] T054 [US4] Implement `POST /api/feedback` route in `apps/web/src/app/api/feedback/route.ts`
- [ ] T055 [US4] Implement transient feedback logging in `apps/web/src/lib/metrics.ts`
- [ ] T056 [US4] Wire feedback UI to API with confirmation toast

**Checkpoint**: User Story 4 should be independently functional

---

## Phase 8: User Story 5 - Discover Related Questions (Priority: P3)

**Goal**: Bot suggests 2-3 related follow-up questions after each answer.

**Independent Test**: Receive answer with suggested questions; click suggestion sends as next message.

### Implementation for User Story 5

- [ ] T057 [US5] Implement related question generation in `apps/web/src/lib/prompts.ts`
- [ ] T058 [P] [US5] Create suggestions component in `apps/web/src/components/Chat/Suggestions.tsx`
- [ ] T059 [US5] Wire suggestion clicks to chat input submission

**Checkpoint**: User Story 5 should be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T060 [P] Implement evaluation dataset loader and accuracy measurement script in `packages/indexing/src/eval.ts`
- [ ] T061 [P] Add monitoring dashboard/config for query count, token usage, miss rate, fallback rate
- [ ] T062 [P] Implement caching layer for frequent queries in `apps/web/src/lib/cache.ts`
- [ ] T063 [P] Add error boundaries and graceful failure UI in `apps/web/src/app/error.tsx`
- [ ] T064 [P] Implement typing indicator in Chat component
- [ ] T065 [P] Add loading states and skeleton screens per Liara design system
- [ ] T066 [P] Run quickstart.md validation scenarios V1-V6
- [ ] T067 Finalize Docker multi-stage build with Nginx in `apps/web/Dockerfile`
- [ ] T068 Finalize GitHub Actions re-index workflow with versioned ChromaDB collection swap
- [ ] T069 Run evaluation dataset of 50-100 questions and measure accuracy/miss rate/fallback rate
- [ ] T070 Document deployment steps and verify Liara deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 context but independently testable
- **User Story 6 (P1)**: Can start after Foundational (Phase 2) - Independently testable
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Independently testable
- **User Story 5 (P3)**: Can start after Foundational (Phase 2) - Independently testable

### Within Each User Story

- Infrastructure/models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all P1 user stories (US1, US2, US6) can start in parallel
- P2/P3 stories can run in parallel with each other after Foundational
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all foundational tasks together:
T011: ChromaDB client wrapper
T012: Embedding provider abstraction
T013: LLM provider abstraction
T014: JWT session utilities
T015: Rate limiter middleware
T016: Metrics logger
T017: Query cache
T018: Shared TypeScript types
T019: Frontend types
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 6)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Ask Documentation Question)
4. Complete Phase 4: User Story 2 (Multi-Turn Context)
5. Complete Phase 5: User Story 6 (Documentation Sidebar)
6. **STOP and VALIDATE**: Test US1, US2, US6 independently
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Test independently
3. Add US2 → Test independently
4. Add US6 → Test independently → Deploy/Demo (MVP!)
5. Add US3 → Test independently → Deploy/Demo
6. Add US4 → Test independently → Deploy/Demo
7. Add US5 → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 6
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- MVP excludes: reranker, hybrid search, tool calling to maintain focus on core RAG quality
