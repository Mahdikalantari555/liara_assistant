# Feature Specification: Liara Docs Bot

**Feature Branch**: `001-liara-docs-bot`

**Created**: 2026-08-20

**Last Updated**: 2026-08-20

**Status**: Draft

**Input**: User description: "based on @spec-chat.md and @proposal.md", aligned with `notes.md` (2026-08-20), finalized architecture decisions (2026-08-20), Challenge.md requirements (2026-08-20), local docs in `docs/public` with GitHub Actions re-indexing

## Clarifications

### Session 2026-08-20

- Q: Should the bot require user authentication, or should it support anonymous sessions? → A: No authentication — anonymous sessions only, identified by temporary session IDs.
- Q: How should the system determine which language to use when responding? → A: Persian-only — system responds in Persian regardless of input language.
- Q: Should conversation sessions persist across page refreshes and browser tabs, or are they limited to a single tab/session? → A: No persistence — sessions exist only in server memory and are lost on page refresh, tab close, or server restart.
- Q: What should happen when a session reaches its token budget limit? → A: Hard stop — bot stops accepting new messages and offers to summarize the conversation so far.
- Q: Should feedback data be stored persistently for analysis, or is transient/log-only storage sufficient? → A: Transient only — feedback is logged but not stored in a database for later analysis.
- Q: Should the documentation sidebar show all docs or only context-relevant docs? → A: Context-relevant — sidebar shows documentation links relevant to the current conversation context.
- Q: Should clicking a sidebar link open in a new tab or pre-fill a chat question? → A: Open in new tab — sidebar links navigate to the actual documentation page in a new tab.
- Q: Which vector database should be used? → A: ChromaDB — chosen for its ease of use, feature-rich API, and good ecosystem integration.
- Q: Should embeddings be computed at runtime or precomputed? → A: Precomputed — embeddings are generated offline and stored; not recalculated during query serving.
- Q: How should documentation re-indexing be triggered? → A: Automated via GitHub Actions when documentation changes.
- Q: What is the primary language for implementation? → A: TypeScript — chosen for ecosystem support, performance, and deployment compatibility.
- Q: Where is the primary local documentation source located? → A: `docs/public` directory — contains the local copy of Liara documentation used for indexing.
- Q: When and how are embeddings generated? → A: Embeddings are generated via GitHub Actions (not at runtime), precomputed once and stored. Re-indexing only occurs when documentation content changes.
- Q: What is the scalability target for the system? → A: The architecture must support horizontal scaling to handle concurrent users and growing documentation volume without architectural redesign.
- Q: What is the preferred deployment architecture? → A: Stateless application instances with shared ChromaDB index for horizontal scaling.
- Q: How should API keys and secrets be managed? → A: Using Liara environment variables / secrets management.
- Q: How should conversation sessions be managed in a horizontally scaled architecture? → A: JWT-based client-side sessions — fully stateless with no server-side session state.
- Q: What is the re-indexing strategy for ChromaDB collections? → A: Versioned collection swap — create new collection, validate, then swap to avoid downtime and enable rollback.
- Q: What is the LLM provider strategy? → A: Single primary LLM provider with one fallback provider — simple, cost-effective, low external dependency.
- Q: What is the package manager for the project? → A: npm — chosen as the standard package manager for this project.
- Q: Should the application include all documentation pages or only the main chat interface with sidebar? → A: Main pages only — the application consists of a primary chat interface with a documentation sidebar for quick access; full documentation pages remain on docs.liara.ir.
- Q: What is the embedding provider strategy? → A: Local/offline embedding model for MVP (no API key required), with abstraction to support API-first or local models — architecture supports both, MVP defaults to local.
- Q: Which local embedding model should be used? → A: bge-m3-Q4_K_M.gguf from /mnt/data/LocalAI/Models/Embeddings/ — suitable for Persian documentation, runs offline via llama.cpp.
- Q: Which LLM provider and model should be used? → A: https://api.kilo.ai/api/gateway with model `kilo-auto/free`. API key is provided via environment variable and must never be committed to code.
- Q: Should the evaluation questions be fixed or dynamic? → A: Fixed dataset of 50-100 questions, with 3-5 random questions displayed before each new chat session.
- Q: What is the retrieval strategy for MVP? → A: Top-K=5 without reranker — simple, fast, and cost-effective for MVP.
- Q: What citation format should be used? → A: Title + Link + Section — provides maximum traceability and quality for answer verification.
- Q: What are the chunking parameters? → A: 512 token chunks with 50 token overlap, storing metadata: source_url, section_title, page_title, chunk_id, token_count.
- Q: What is the MVP scope regarding advanced features? → A: No reranker, no hybrid search, no tool calling — focus on core RAG quality and UX.
- Q: How will answer quality be measured before delivery? → A: Evaluation dataset of 50-100 real questions from Liara documentation.
- Q: What monitoring metrics are required? → A: Query count, token usage, retrieval miss rate, fallback rate.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask Documentation Question (Priority: P1)

A Liara user has a question about how to use a Liara service (e.g., "How do I deploy a Django app on Liara?"). The user types the question into the chat interface and receives an accurate answer drawn from official Liara documentation, with clear source citations linking back to the relevant docs page.

**Why this priority**: This is the core value proposition — answering documentation questions correctly and with traceable sources.

**Independent Test**: User asks a specific documented question and receives an answer that includes at least one source citation. The answer can be verified against the cited documentation page.

**Acceptance Scenarios**:

1. **Given** the bot is running and the knowledge base is indexed, **When** a user asks "How do I connect a PostgreSQL database to my Next.js app on Liara?", **Then** the bot returns a step-by-step answer with at least one citation linking to the relevant docs.liara.ir page.
2. **Given** the bot receives a question about a topic not covered in the documentation, **When** the user submits the question, **Then** the bot responds with a polite fallback message indicating the information is not available in the docs and suggests contacting Liara support.
3. **Given** the bot is running, **When** a user asks a question in any language, **Then** the bot responds in Persian using the same documentation sources.
4. **Given** the bot returns an answer, **When** the response is displayed, **Then** the answer ends with a reference section: "برای اطلاعات بیشتر به مستندات مراجعه کنید: [Documentation Title](URL)"

---

### User Story 2 - Continue Multi-Turn Conversation (Priority: P1)

A user asks an initial question, receives an answer, and then asks a follow-up question that depends on the previous context (e.g., "What about scaling?" after asking about deployment). The bot remembers the earlier part of the conversation and provides a contextually relevant follow-up answer.

**Why this priority**: Documentation queries often require multi-step exploration; context preservation is essential for a natural support experience.

**Independent Test**: User asks an initial question, then asks a follow-up that references the previous topic without repeating it. The bot's second answer reflects understanding of the first answer's subject.

**Acceptance Scenarios**:

1. **Given** a user has asked about Django deployment, **When** the user asks "How do I add a custom domain?", **Then** the bot answers in the context of Django apps on Liara rather than giving a generic domain guide.
2. **Given** a conversation has exceeded the context window, **When** the bot processes the next message, **Then** the bot summarizes earlier messages and continues coherently without losing critical context.
3. **Given** a user asked "چطور پروژه‌ام را روی لیارا Deploy کنم؟" and selected "Node.js", **When** the user asks "اگر Deploy خطا داد چه کنم؟", **Then** the bot provides troubleshooting steps specific to Node.js deployment on Liara based on the previous context.

---

### User Story 3 - Clarify Ambiguous Questions (Priority: P2)

A user asks a question that could refer to multiple Liara services (e.g., "How do I set up a database?"). The bot recognizes the ambiguity and asks a clarifying question before answering.

**Why this priority**: Asking the right clarification prevents incorrect or hallucinated answers and improves answer quality.

**Independent Test**: User asks an ambiguous question. The bot responds with a short clarification prompt listing the possible interpretations instead of guessing.

**Acceptance Scenarios**:

1. **Given** a user asks "How do I create a database?", **When** the bot detects multiple valid interpretations (e.g., PostgreSQL, MySQL, MongoDB), **Then** the bot asks which database type the user means before proceeding.
2. **Given** a user asks a question with insufficient context, **When** the bot cannot determine the service category, **Then** the bot asks which Liara service (PaaS, DBaaS, AI, etc.) the question relates to.

---

### User Story 4 - Provide Feedback on Answers (Priority: P3)

After receiving an answer, the user can indicate whether it was helpful. This feedback is recorded to help improve future answer quality.

**Why this priority**: Feedback enables quality monitoring and continuous improvement, but is not required for the core MVP experience.

**Independent Test**: User clicks a thumbs-up or thumbs-down button after an answer. The feedback is recorded and acknowledged with a brief confirmation.

**Acceptance Scenarios**:

1. **Given** a user received an answer, **When** the user clicks the thumbs-up button, **Then** the system records positive feedback and shows a confirmation.
2. **Given** a user received an answer, **When** the user clicks the thumbs-down button, **Then** the system records negative feedback and shows a confirmation.

---

### User Story 5 - Discover Related Questions (Priority: P3)

After each answer, the bot suggests 2–3 related follow-up questions the user might want to ask next.

**Why this priority**: Proactive suggestions reduce friction and help users explore documentation more effectively.

**Independent Test**: After receiving an answer, the user sees suggested follow-up questions. Selecting a suggestion sends it as the next user message.

**Acceptance Scenarios**:

1. **Given** a user asked about deploying a Node.js app, **When** the bot returns the answer, **Then** the bot suggests at least two related questions such as "How do I set up environment variables?" and "How do I configure custom domains?"
2. **Given** suggested questions are displayed, **When** the user clicks one, **Then** the question is submitted as a new user message and the conversation continues naturally.

---

### User Story 6 - Browse Documentation Alongside Chat (Priority: P1)

A user can view a list of relevant documentation links alongside the chat interface. This helps users discover related documentation without leaving the chat context.

**Why this priority**: Documentation discovery is essential for a docs bot — users should be able to explore related docs while chatting.

**Independent Test**: User opens the chat interface and sees a documentation sidebar/list with relevant links. Clicking a link opens the documentation page in a new tab.

**Acceptance Scenarios**:

1. **Given** the chat interface is loaded, **When** the page renders, **Then** a documentation sidebar/list is visible alongside the chat area with context-relevant documentation links.
2. **Given** a user is viewing the documentation sidebar, **When** they click a documentation link, **Then** the link opens the relevant docs.liara.ir page in a new browser tab.
3. **Given** the conversation context changes (e.g., user asks about databases), **When** the sidebar updates, **Then** the documentation links update to show database-related documentation.

---

### Edge Cases

- What happens when the user submits an empty message or whitespace?
- How does the system behave when the documentation service or vector database is temporarily unavailable?
- What happens when the user asks a question outside the scope of Liara documentation (e.g., general programming questions unrelated to Liara)?
- How does the system handle extremely long conversations approaching token limits?
- What happens when the same question is asked repeatedly within a short time?
- What happens when a session reaches its token budget limit?
- What happens when the documentation sidebar cannot load links due to network issues?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST answer user questions using official Liara documentation as the primary knowledge source.
- **FR-002**: System MUST include source citations with every answer, referencing the specific documentation page. Citations MUST appear at the end of the response in the format: "برای اطلاعات بیشتر به مستندات مراجعه کنید: [Documentation Title](URL) - بخش: \"Section Name\"" including the documentation title, URL, and relevant section name.
- **FR-003**: System MUST maintain conversation context within a session to support multi-turn dialogue.
- **FR-004**: System MUST ask clarifying questions when user intent is ambiguous or could refer to multiple Liara services.
- **FR-005**: System MUST respond to all questions in Persian, regardless of the language used in the user's input.
- **FR-006**: System MUST provide a graceful fallback response when no relevant documentation is found.
- **FR-007**: System MUST allow users to submit feedback on answer quality (positive or negative).
- **FR-008**: System MUST suggest related follow-up questions after each answer.
- **FR-009**: System MUST enforce per-session token budgets to prevent excessive consumption. When a session reaches its token budget limit, the system MUST stop accepting new messages and offer to summarize the conversation so far.
- **FR-010**: System MUST sanitize user input to reduce prompt injection risk.
- **FR-011**: System MUST provide a documentation sidebar/list alongside the chat interface, displaying context-relevant documentation links that open in a new tab.
- **FR-012**: System MUST use ChromaDB for vector storage and similarity search of documentation embeddings.
- **FR-013**: Embeddings MUST be precomputed and stored in the vector database. Embeddings MUST NOT be recalculated at runtime during query serving.
- **FR-014**: The system MUST support automated re-indexing via GitHub Actions when documentation content changes.
- **FR-015**: The embedding provider MUST be abstracted to support both local/offline embedding models (MVP default: `bge-m3-Q4_K_M.gguf`) and external API embedding, enabling migration without changing the core pipeline.
- **FR-016**: The core RAG pipeline (documentation retrieval and embedding) MUST NOT require internet connectivity. Internet access is required ONLY for LLM API calls and re-indexing pipeline updates.
- **FR-017**: The application MUST be implemented in TypeScript.
- **FR-018**: The application MUST be containerized using Docker for consistent development and deployment.
- **FR-019**: The MVP MUST be deployable on Liara infrastructure.
- **FR-020**: The system design MUST prioritize: Frugal (minimum cost), Lightweight (minimal resource usage), Deployment-friendly (easy to deploy), Minimum operational cost, and Minimum external service dependencies.
- **FR-021**: The system MUST support horizontal scalability to handle increasing user load and documentation volume without requiring architectural redesign.
- **FR-022**: The embedding generation pipeline MUST run via GitHub Actions (not at runtime) to produce precomputed embeddings using a local/offline embedding model (no external API key required), stored in ChromaDB.
- **FR-023**: The application MUST index documentation from the local `docs/public` directory, which is versioned in the main repository alongside the application code. This enables offline-first operation and ensures consistent knowledge base across deployments.
- **FR-024**: The system MUST implement rate limiting to protect against abuse.
- **FR-025**: The system MUST log operational metrics for monitoring and debugging purposes.
- **FR-026**: The system MUST cache frequent queries to reduce token consumption and improve response time.
- **FR-027**: The system MUST properly manage API keys and secrets, never exposing them in client-side code or logs. API keys MUST be loaded from environment variables via `.env` file or platform secrets management.
- **FR-028**: The system MUST implement graceful error handling and failure recovery for all external dependencies (LLM API, vector database, documentation sources).
- **FR-029**: The system MUST be stateless at the application layer to support horizontal scaling across multiple instances.
- **FR-030**: The system MUST use a shared ChromaDB index accessible by all application instances.
- **FR-031**: Conversation context MUST be encoded in client-side JWT tokens, eliminating server-side session storage.
- **FR-032**: The system MUST implement versioned ChromaDB collection swaps during re-indexing to ensure zero downtime and enable rollback.
- **FR-033**: API keys and secrets MUST be managed through Liara's environment variables / secrets management system.
- **FR-034**: The system MUST abstract the LLM provider to support a primary provider (`https://api.kilo.ai/api/gateway`, model `kilo-auto/free`) with one fallback provider. API keys MUST be provided via environment variables and MUST NOT be committed to source control.
- **FR-035**: The re-indexing pipeline MUST validate new ChromaDB collections before swapping them into production.
- **FR-036**: The system MUST be deployable as multiple stateless instances behind a load balancer on Liara infrastructure.
- **FR-037**: The application MUST use npm as the package manager.
- **FR-038**: The application interface MUST follow the Liara design system defined in `(liara)-DESIGN.md`, including: Yekan Bakh font, right-anchored 300px sidebar navigation, flat elevation (no box-shadows), neutral gray-white palette, 8px card radius, and subtle 1px borders.
- **FR-039**: The application MUST consist of main pages only: a primary chat interface with an integrated documentation sidebar for quick access. Full documentation pages remain hosted on docs.liara.ir and are accessed via hyperlinks.
- **FR-040**: The chat interface MUST be familiar and intuitive, following standard chat UX patterns (message history, input field, send button, typing indicators).
- **FR-041**: The RAG retrieval pipeline MUST use Top-K=5 retrieval without reranker for MVP.
- **FR-042**: The system MUST NOT use reranker, hybrid search, or tool calling in the MVP.
- **FR-043**: Documentation MUST be chunked into 512-token segments with 50-token overlap during indexing.
- **FR-044**: Each documentation chunk MUST store metadata: source_url, section_title, page_title, chunk_id, and token_count.
- **FR-045**: The system MUST maintain an evaluation dataset of 50-100 real questions from Liara documentation for pre-delivery accuracy measurement.
- **FR-046**: The system MUST track and log: query count, token usage, retrieval miss rate, and fallback rate.
- **FR-047**: The system MUST prioritize development effort on: Retrieval Quality > Citation Quality > UX > Infrastructure Complexity.
- **FR-048**: The chat interface MUST display 3-5 random evaluation questions from the dataset before the user sends their first message, to guide initial interaction and enable evaluation. Questions are selected randomly each time and the dataset is extensible.

### Key Entities

- **Conversation Session**: An anonymous chat session between a user and the bot, identified by a temporary session ID. Contains ordered messages and metadata such as creation time and token usage. No user identity or authentication is required.
- **User Message**: A single input from the user within a session. Contains text content, timestamp, and language detection.
- **Bot Response**: A single answer generated by the bot. Contains text content, source citations, timestamp, token usage, and optional suggested follow-up questions.
- **Source Citation**: A reference to a specific documentation page. Contains the documentation title, URL, and relevance score. Rendered as a hyperlink at the end of bot responses.
- **Feedback Entry**: A transient record of user feedback on a specific bot response. Contains the response ID, feedback type (positive or negative), and timestamp. Feedback is logged for operational monitoring but is not stored persistently in a database.
- **Documentation Link**: A reference to a Liara documentation page displayed in the sidebar. Contains title, URL, and relevance to current conversation context.
- **Documentation Chunk**: A segment of Liara documentation created during the chunking process. Contains text content, source URL, chunk ID, and embedding vector.
- **Embedding Index**: A ChromaDB collection containing precomputed embedding vectors for all documentation chunks, stored alongside metadata for retrieval.
- **Re-indexing Pipeline**: An automated process (via GitHub Actions) that crawls local documentation from `docs/public`, chunks content, generates embeddings, and updates the ChromaDB collection.
- **Crawler**: A component that extracts documentation content from the local `docs/public` directory and prepares it for chunking.
- **Query Cache**: A mechanism to store and retrieve frequent query results to reduce token consumption and improve response time.
- **Rate Limiter**: A component that controls request rates per session/IP to prevent abuse.
- **Metrics Logger**: A component that records operational metrics (latency, token usage, error rates) for monitoring.
- **Session Token**: A JWT token containing session metadata, used for stateless session management across horizontally scaled instances.
- **Collection Version**: A versioned identifier for ChromaDB collections, enabling zero-downtime re-indexing via versioned collection swaps.
- **LLM Provider Configuration**: Abstracted configuration for primary and fallback LLM providers, enabling provider switching without code changes.
- **Design Token**: A UI value from the Liara design system (color, typography, spacing, radius) that must be consistently applied across the application interface.
- **Chat Interface**: The primary user interface consisting of a message list, input field, and send button, following standard chat UX patterns.
- **Documentation Sidebar**: A right-anchored 300px navigation panel displaying context-relevant documentation links, styled according to the Liara design system.
- **Main View**: A top-level application screen. The application has exactly 2 main views: Chat View and Documentation Sidebar (integrated). Full documentation pages are not served by this application.
- **Chunk Metadata**: Structured data attached to each documentation chunk: source_url, section_title, page_title, chunk_id, token_count. Used for citation generation and filtering.
- **Evaluation Dataset**: A curated set of 50-100 real questions from Liara documentation with expected answer characteristics, used for pre-delivery quality measurement. A subset of these questions is displayed randomly on the chat page before the first user message. A subset of these questions is displayed randomly on the chat page before the first user message.
- **Retrieval Miss**: A query where no relevant documentation chunks are retrieved above the similarity threshold.
- **Monitoring Metric**: An operational data point tracked for system health and cost analysis: query count, token usage, retrieval miss rate, or fallback rate.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive an answer with at least one source citation in under 8 seconds for 90% of documented questions.
- **SC-002**: 85% of answers include source citations that are relevant to the user's question.
- **SC-003**: Users resolve their documentation query without leaving the chat in at least 75% of sessions.
- **SC-004**: Users successfully complete their primary documentation query on the first attempt in at least 70% of sessions.
- **SC-005**: The bot asks clarifying questions for at least 80% of ambiguous multi-service queries instead of guessing.
- **SC-006**: System remains responsive and returns a fallback message within 5 seconds when the language model API or documentation index is unavailable.
- **SC-007**: Feedback submission succeeds without errors in 99% of attempts.
- **SC-008**: Users can ask their first question within 10 seconds of opening the chat interface, without any login or account creation step.
- **SC-009**: When a session reaches its token budget limit, the bot stops accepting new messages and offers a conversation summary within 2 seconds.
- **SC-010**: The documentation sidebar/list loads and displays relevant documentation links within 3 seconds of chat initialization.
- **SC-011**: Source citations are rendered as clickable hyperlinks at the end of 100% of documented answers.
- **SC-012**: The application builds into a Docker image and deploys successfully on Liara infrastructure.
- **SC-013**: The system maintains 99.5% availability for query serving during re-indexing operations.
- **SC-014**: The system handles at least 100 concurrent chat sessions without degradation in response quality.
- **SC-015**: Token consumption per query is optimized to stay within budget constraints while maintaining answer quality.
- **SC-016**: Rate limiting activates within 100ms of detecting abusive request patterns.
- **SC-017**: All API keys and secrets are stored securely and never exposed in client-side code or application logs.
- **SC-018**: Critical errors are logged with sufficient context for debugging within 200ms of occurrence.
- **SC-019**: Re-indexing via GitHub Actions completes within 15 minutes for the full documentation corpus.
- **SC-020**: The query cache achieves at least 30% hit rate for repeated or similar queries.
- **SC-021**: The system supports horizontal scaling to at least 3 application instances without degradation in response quality or availability.
- **SC-022**: JWT-based session tokens are validated within 50ms with no server-side session lookup.
- **SC-023**: Re-indexing via versioned collection swap completes with zero downtime and can be rolled back within 2 minutes.
- **SC-024**: The system survives a single application instance failure with no user-visible errors or data loss.
- **SC-025**: LLM provider failover occurs within 5 seconds when the primary provider is unavailable.
- **SC-026**: API keys and secrets are never exposed in client-side code, application logs, or error messages.
- **SC-027**: All external dependency failures are handled gracefully with appropriate fallback responses.
- **SC-028**: The shared ChromaDB index supports concurrent reads from at least 10 application instances without performance degradation.
- **SC-029**: The application uses npm as the package manager with no yarn-specific configurations.
- **SC-030**: The UI achieves WCAG AA contrast ratios (4.5:1 for normal text) using the Liara design system palette.
- **SC-031**: The chat interface loads within 2 seconds on desktop and 3 seconds on mobile.
- **SC-032**: Documentation sidebar links update within 500ms of context change.
- **SC-033**: The application consists of exactly 2 main views: Chat View (primary) and Documentation Sidebar (integrated). No additional full documentation pages are served by the application.
- **SC-034**: Retrieval uses Top-K=5 without reranker for MVP, with no hybrid search or tool calling.
- **SC-035**: Documentation chunks are created with 512-token size and 50-token overlap, with complete metadata (source_url, section_title, page_title, chunk_id, token_count).
- **SC-036**: Citations include documentation title, URL, and section name in the format: "[Title](URL) - بخش: \"Section Name\"".
- **SC-037**: An evaluation dataset of 50-100 real questions from Liara documentation is used to measure answer accuracy before delivery.
- **SC-038**: The system logs query count, token usage, retrieval miss rate, and fallback rate for operational monitoring.
- **SC-039**: Retrieval miss rate is below 15% on the evaluation dataset.
- **SC-040**: Fallback response rate is below 10% on the evaluation dataset.
- **SC-041**: The chat interface displays 3-5 random evaluation questions before the first user message, and clicking a question submits it as the first message. Questions are randomized on each page load.

## Evaluation Dataset (Examples)

The following representative questions must be included in the 50–100 question evaluation dataset. A subset of these questions is displayed randomly on the chat page before the user sends their first message. The dataset is extensible and new questions can be added at any time without code changes.

1. چطور پروژم رو روی زیرساخت لیارا دیپلوی کنم؟
2. چطوری با داکر پروژم رو بیارم بالا؟
3. هزینه استفاده از لیارا برای ۱ ماه چقدره؟
4. آیا می‌توانم از لیارا برای هاست ربات تلگرام هم استفاده کنم؟
5. برای آپلود کدهای پایتونم باید چیکار کنم؟
6. چگونه می‌توانم دیتابیس PostgreSQL روی لیارا ایجاد کنم؟
7. لیارا از کدام فریم‌ورک‌های Node.js پشتیبانی می‌کند؟
8. چطور می‌توانم دامنه سفارشی به پروژه خودم وصل کنم؟
9. آیا لیارا از SSL/HTTPS رایگان پشتیبانی می‌کند؟
10. محدودیت منابع پلان رایگان لیارا چیست؟
11. چطور می‌توانم لاگ‌های برنامه‌ام را مشاهده کنم؟
12. لیارا برای پروژه‌های Django مناسب است؟
13. چطور از متغیرهای محیطی در لیارا استفاده کنم؟
14. آیا می‌توانم از GitHub Actions برای استقرار خودکار استفاده کنم؟

## Assumptions

- Users have stable internet connectivity to access the chat interface and retrieve documentation sources.
- Users primarily communicate in Persian or English; the system always responds in Persian regardless of input language. Other languages are out of scope for the initial version.
- The official Liara documentation content remains relatively stable between ingestion cycles.
- Users access the bot through a modern web browser; native mobile apps are out of scope for the initial version.
- The system relies on an external language model provider for response generation; provider availability is assumed but fallback behavior is required.
- Session data is non-persistent and exists only in server memory; sessions are lost on page refresh, tab close, or server restart.
- Users access the bot without authentication; sessions are anonymous and identified by temporary session IDs.
- User feedback is recorded transiently in logs only and is not stored in a persistent database.
- Rate limiting is enforced at the infrastructure level to protect the service from abuse.
- ChromaDB is the designated vector database for documentation embeddings.
- Embeddings are precomputed offline and stored in ChromaDB; they are not recalculated at runtime.
- Re-indexing is automated via GitHub Actions when documentation content changes.
- The application is implemented in TypeScript.
- The application will be containerized with Docker and deployed on Liara infrastructure.
- The chat interface is designed to potentially integrate as a page within the Liara documentation site under the title "دستیار هوش مصنوعی" (AI Assistant).
- Internet connectivity is required ONLY for LLM API calls and re-indexing pipeline updates. The core RAG pipeline (ChromaDB + local embeddings) operates without internet.
- Embedding generation uses a local/offline embedding model in the MVP (no external API key required), with architecture supporting future migration to API-based or different local models.
- Design priorities: Frugal (minimum cost), Lightweight (minimal resource usage), Deployment-friendly (easy to deploy), Minimum operational cost, Minimum external service dependencies.
- The primary documentation source is the local `docs/public` directory, versioned in the main repository. This enables offline-first operation and ensures consistent knowledge base across deployments.
- Embeddings are generated via GitHub Actions, precomputed once, and stored in ChromaDB. Re-indexing only occurs when documentation content changes.
- The system must be horizontally scalable to support growing user base and documentation volume.
- All evaluation criteria from Challenge.md must be met: answer quality (80 pts), UI/UX (55 pts), agentic capabilities (50 pts), security/stability/monitoring (50 pts), Liara deployment (40 pts), cost optimization (25 pts).
- Rate limiting, logging, monitoring, caching, and proper secrets management are mandatory requirements.
- The application uses npm as the package manager.
- The UI strictly follows the Liara design system from `(liara)-DESIGN.md`: Yekan Bakh font, right-anchored 300px sidebar, flat elevation (no box-shadows), neutral gray-white palette, 8px card radius, subtle 1px borders.
- The application consists of main pages only: a primary chat interface with an integrated documentation sidebar. Full documentation pages are accessed via links to docs.liara.ir, not served by this application.
- MVP excludes: reranker, hybrid search, and tool calling to maintain simplicity and focus on core RAG quality.
- Chunking parameters: 512-token chunks with 50-token overlap, storing metadata: source_url, section_title, page_title, chunk_id, token_count.
- Development priority order: Retrieval Quality > Citation Quality > UX > Infrastructure Complexity.
- An evaluation dataset of 50-100 real questions from Liara documentation will be created for pre-delivery accuracy measurement.
- Core monitoring metrics: query count, token usage, retrieval miss rate, fallback rate.
- Target retrieval miss rate: below 15% on evaluation dataset.
- Target fallback response rate: below 10% on evaluation dataset.
