## Context

See `proposal.md` for motivation. The current shell is functional but visually flat. The goal is a cohesive "liquid" polish—smooth transitions, softer motion, cleaner spacing, and consistent Liara brand styling—while keeping the product simple: users ask questions, get cited answers, and optionally browse related docs.

## Goals / Non-Goals

**Goals**
- Introduce subtle entrance/transition animations for messages and UI state changes.
- Improve mobile ergonomics: input stays visible above the keyboard, content remains readable.
- Keep citations clearly attached to assistant replies.
- Maintain the existing sidebar and starter questions behavior.
- Recolor header to brand purple/violet and add a lightweight robot idle animation.
- Increase assistant bubble contrast and readability.
- Improve sidebar doc-link cards for scanability and hover affordance.
- Rebrand interactive surfaces with consistent purple/violet accents.

**Non-Goals**
- No new backend features, APIs, or data model changes.
- No hero section, agentic flow stepper, or marketing layout changes.
- No redesign of the retrieval or citation logic.

## Decisions

| Decision | Rationale | Alternatives Considered |
|---|---|---|
| Use `motion` (Framer Motion) for animations | Provides spring-based transitions and layout animations that feel "liquid" with minimal custom code. Works with Next.js App Router and SSR. | CSS-only transitions/animations (less expressive for staggered message entrance). |
| Add `motion` as a workspace dependency in `apps/web` | Keeps the animation library scoped to the web app. | Global root dependency (unnecessary; only web uses UI). |
| Replace `h-screen` with `h-dvh` on the chat root | Fixes mobile keyboard overlap on iOS/Android without JS hacks. | JS-based viewport resizing listener (more code, more edge cases). |
| Auto-resize `ChatInput` textarea instead of fixed `rows={1}` | Lets users write longer questions on mobile without fighting the input height. | Keep single-line input (hurts mobile UX). |
| Keep citations as links at the bottom of assistant messages | Satisfies the requirement for traceable sources without changing data flow. | Inline citation markers (requires LLM output format change). |
| Remove exposed session label from header subtitle | Avoids leaking internal identifiers into the UI while preserving the label in state/logic. | Keep label visible (privacy/UX concern). |
| Add inline SVG robot animation in header | Lightweight idle animation that reinforces the assistant persona without external assets. | External image/icon asset (adds request/asset overhead). |
| Use purple/violet brand accents for header, input, sidebar, and interactive chips | Creates visual consistency across the chat shell and improves perceived polish. | Keep neutral gray-only palette (less branded, flatter). |

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| `motion` increases bundle size | Use tree-shakeable `motion` imports; measure with Next.js bundle analyzer. If too heavy, fall back to CSS transitions. |
| Animations distract from content | Keep motion subtle: short duration (150-250ms), reduced-motion media query respected. |
| Mobile keyboard behavior varies across browsers | Test on iOS Safari and Android Chrome; `dvh` has good support but fall back to `min-h-screen` if needed. |
| Dark theme contrast regressions | Rechecked assistant bubble, sidebar cards, input, citations, and chips against intended color tokens; kept text colors at or above intended legibility targets. |

## Migration Plan

1. Install `motion` in `apps/web`.
2. Update `ChatContainer`, `ChatInput`, `Message`, `EvaluationPrompts`, and `Sidebar` styling/animation.
3. Add global CSS variables for animation timings and easing, plus robot idle keyframes.
4. Test on mobile viewports (320px, 768px) and desktop.
5. Rollback: remove motion imports and revert to static rendering if performance/UX regresses.

## Open Questions

- None.

## Plan Verification

- **Depth**: STANDARD
- **Scope**: 9 file paths, 8 API/type names, 15 line citations confirmed
- **Escalation**: skipped — no state-machine topology; reduced-motion is a 2-state CSS media query; chat send/loading states unchanged
- **Claims**:
  - `apps/web/src/components/Chat/ChatContainer.tsx:177` uses `h-screen` → replaced with `chat-shell` using `100dvh` fallback-safe CSS (confirmed)
  - `apps/web/src/components/Chat/ChatInput.tsx:44` `rows={1}` with no auto-resize → auto-resize added with `MAX_HEIGHT` clamp (confirmed)
  - `motion` added to `apps/web/package.json` (confirmed)
  - Header subtitle no longer renders session label; label remains in state/logic (confirmed)
  - Robot SVG + `robot-float`/`robot-blink` keyframes added in `apps/web/src/app/globals.css` (confirmed)
  - Citations after `RichContent` at `apps/web/src/components/Chat/Message.tsx:87-95` retain logic; only styling updated (confirmed)
  - Assistant bubble contrast updated in `apps/web/src/components/Chat/Message.tsx:69-76` (confirmed)
  - Sidebar cards updated in `apps/web/src/components/Sidebar/Sidebar.tsx:27-41` with card background, border, and hover states (confirmed)
  - Chat input focus/placeholder/button colors updated in `apps/web/src/components/Chat/ChatInput.tsx:47-73` (confirmed)
  - No `prefers-reduced-motion` behavior broken; still respected globally (confirmed)
- **Out of scope (noticed, not touching)**:
  - `loading.tsx` / `error.tsx` also use `h-screen` (task scoped to chat shell)
  - `SidebarItem.tsx` duplicates Sidebar link markup but is unused
  - Root package manager is npm workspaces (`package-lock.json`)
