# Proposal: Align Spec with notes.md

**Change ID**: align-spec-with-notes-md  
**Date**: 2026-08-20  
**Status**: Draft

## Summary

Update the existing `specs/001-liara-docs-bot/spec.md` to align with the requirements documented in `notes.md`. The current spec was created based on earlier inputs (`@spec-chat.md` and `@proposal.md`) but does not fully reflect the MVP requirements and design decisions now captured in `notes.md`.

## Motivation

`notes.md` contains the most important considerations for the Liara Docs Bot MVP. Several requirements from `notes.md` are missing or under-specified in the current spec:
1. **Documentation sidebar/list** alongside the chat interface
2. **Citation format** — links must appear at the end of responses as references with title as hyperlink
3. **ChromaDB** for embedding handling
4. **Dockerization** requirement
5. **Deploy on Liara** as explicit MVP requirement
6. **Context-aware multi-turn conversation** example (deployment error troubleshooting)
7. **Future integration** into Liara docs site as "AI Assistant" page

## Proposed Changes

### 1. Update User Scenarios

Add a new user story for the documentation sidebar/list:
- **User Story 6 - Browse Documentation Alongside Chat (Priority: P1)**
  - A user can view a list of documentation topics/links alongside the chat interface
  - Clicking a documentation link opens the relevant docs page or pre-fills a related question

Update User Story 2 to include the deployment error troubleshooting example from `notes.md`:
- Given a user asked about deploying a Node.js app and then asks "What if deployment fails?", the bot provides troubleshooting steps based on previous context

### 2. Update Functional Requirements

Add new FRs:
- **FR-011**: System MUST provide a documentation list/sidebar alongside the chat interface with links to relevant Liara documentation.
- **FR-012**: System MUST include source citations at the end of every response in the format: "برای اطلاعات بیشتر به مستندات مراجعه کنید: [Documentation Title](URL)"
- **FR-013**: System MUST use ChromaDB for vector storage and similarity search of documentation embeddings.
- **FR-014**: The application MUST be containerized using Docker for consistent deployment.
- **FR-015**: The MVP MUST be deployable on Liara infrastructure.

### 3. Update Architecture/Implementation Notes

While the spec should remain implementation-agnostic, the `notes.md` indicates specific technology choices that should be honored:
- ChromaDB for embeddings
- Docker for deployment
- Target deployment: Liara

These should be recorded as **technical constraints** rather than implementation details.

### 4. Update Success Criteria

Add:
- **SC-010**: The documentation sidebar/list loads and displays relevant documentation links within 3 seconds of chat initialization.
- **SC-011**: Source citations are rendered as clickable hyperlinks at the end of 100% of documented answers.
- **SC-012**: The application builds into a Docker image and deploys successfully on Liara infrastructure.

### 5. Clarify Future Vision

Add a note in Assumptions/Boundaries:
- The chat interface is designed to potentially integrate as a page within the Liara documentation site under the title "دستیار هوش مصنوعی" (AI Assistant)

## Impact

- **Scope**: Spec update only — no code changes in this change
- **Risk**: Low — clarifies existing requirements, does not remove functionality
- **Dependencies**: None — standalone spec update

## Open Questions

- Should the documentation sidebar show ALL docs or only context-relevant docs?
- Should clicking a sidebar link open in a new tab or pre-fill a chat question?
