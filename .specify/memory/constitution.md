# Liara Docs Bot Constitution

## Core Principles

### I. Test-First with High Coverage (NON-NEGOTIABLE)
Every feature must have automated tests written before implementation. Minimum coverage threshold is **95%** for each feature module. Tests must verify both happy paths and edge cases defined in the spec. No code merges without passing tests.

### II. Simplicity and YAGNI
Implement the simplest solution that satisfies the current spec. Avoid speculative generality, premature abstraction, or "just in case" features. If a requirement is not in spec.md, it does not exist. Revisit complexity only when spec changes.

### III. RAG Quality First
Retrieval quality, citation accuracy, and answer correctness are the highest-priority quality attributes. All technical decisions must be evaluated against their impact on answer quality before performance or convenience.

### IV. Cost-Conscious Engineering
Every external API call, compute hour, and storage byte counts. Prefer batch operations, caching, and precomputation over runtime computation. Monitor token usage and retrieval miss rate as first-class metrics.

### V. Persian-First UX
The interface and responses must be fully localized for Persian users. RTL layout, Yekan Bakh typography, and culturally appropriate phrasing are mandatory, not optional.

### VI. Security and Secrets by Default
API keys, tokens, and secrets must never appear in client-side code, logs, or error messages. Rate limiting, input sanitization, and graceful failure are implemented from day one, not as afterthoughts.

### VII. Offline-Capable Core
The core RAG pipeline (documentation retrieval and embedding) must operate without internet connectivity. External dependencies (LLM API) are abstracted behind interfaces with fallback behavior.

## Additional Constraints

### Performance Standards
- 90% of documented questions answered in under 8 seconds
- Chat interface loads within 2 seconds on desktop, 3 seconds on mobile
- Documentation sidebar updates within 500ms of context change
- Top-K=5 retrieval completes in under 500ms

### Testing Standards
- Unit test coverage ≥ 95% per feature module
- Integration tests for all API contracts defined in `contracts/`
- E2E tests for all user stories in `quickstart.md`
- Evaluation dataset of 50–100 real questions run before every release
- No test flakiness tolerated; flaky tests must be fixed or removed within 24 hours

### Deployment Standards
- Docker multi-stage build with production-ready Nginx
- Static export for frontend; no server-side rendering in production
- GitHub Actions for re-indexing with versioned collection swap
- Health checks and graceful degradation under failure

### Observability Standards
- Structured logging with correlation IDs
- Metrics: query count, token usage, retrieval miss rate, fallback rate
- No secrets or PII in logs
- Error boundaries with user-friendly fallback UI

## Development Workflow

1. Read the relevant spec section and acceptance criteria
2. Write failing tests that verify the acceptance criteria
3. Implement the minimal code to make tests pass
4. Refactor while keeping tests green
5. Update spec only when implementation reveals a necessary design change
6. Run evaluation dataset before marking any feature complete

## Governance

This constitution supersedes all other practices. Amendments require:
1. A written proposal in `specs/001-liara-docs-bot/adr/`
2. Explicit user approval
3. A migration plan for existing code and tests

All PRs/reviews must verify compliance with this constitution. Complexity must be justified with measurable rationale.

**Version**: 1.0.0 | **Ratified**: 2026-08-20 | **Last Amended**: 2026-08-20
