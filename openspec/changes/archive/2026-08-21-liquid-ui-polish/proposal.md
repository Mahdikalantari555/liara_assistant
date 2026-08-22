## Why

The current chat UI is functional but visually plain. Users interact with a docs-assistant, and the first impression matters for trust and readability—especially on mobile. A cohesive visual polish across the chat shell makes the interface feel modern and polished without adding complexity.

## What Changes

- Introduce a cohesive visual polish across the chat shell: softer borders, refined spacing, subtle motion, and consistent brand colors.
- Improve mobile ergonomics: input area stays visible above the keyboard, messages remain readable, and citations don’t crowd the viewport.
- Recolor the header to Liara brand purple/violet, add an inline robot idle animation, and remove the exposed session label from the subtitle.
- Increase assistant answer contrast and distinguish citations, inline links, and suggestion chips.
- Improve sidebar readability with card-style doc links and clearer typography.
- Keep the product simple: the assistant still answers questions from official docs with linked sources; no new features, flows, or backend changes.

## Capabilities

### New Capabilities
- None. This change is visual/implementation-only and does not alter system behavior or requirements.

### Modified Capabilities
- None.

## Impact

- Affects `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`, `apps/web/src/app/layout.tsx`, `ChatContainer.tsx`, `ChatInput.tsx`, `Message.tsx`, `EvaluationPrompts.tsx`, `Sidebar.tsx`, and `tailwind.config.ts`.
- Added `motion` as a workspace dependency in `apps/web`.
- No API, data model, or backend changes.
