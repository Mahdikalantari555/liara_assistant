# Design: UI Overhaul — shadcn/ui + Liara Design Tokens

## Context

Components are hand-rolled (Chat/ChatContainer, ChatInput, Message, Suggestions, Feedback, Sidebar/**) styled from the old light token set in `(liara)-DESIGN.md`; `tailwind.config.ts` already centralizes tokens, which makes the swap mechanical. The new target doc is a frequency-extracted dark token set (`#00eac7` accent, Yekan, 22/10/4px radii). RTL Persian-first layout must survive. The topic picker depends on the optional `topic` request field added by `conversation-flow-improvements` — implement that change first, or ship the dropdown behind a disabled state.

## Goals / Non-Goals

**Goals:**
- One-time restyle onto shadcn/ui + new tokens; zero API changes here.
- Background and decoration that read as "Liara", not generic chat.

**Non-Goals:**
- No new pages/routes; no layout re-architecture beyond styling.
- No light-theme support in this pass (new tokens are dark-first); old tokens removed, not dual-tracked.
- No animation library — CSS transitions only.

## Decisions

1. **shadcn via CLI, components copied in** (not npm package import) — matches Tailwind setup, keeps code owned and editable. Deps: radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`.
2. **Token mapping in `globals.css` CSS variables** wired into `tailwind.config.ts` (`hsl(var(--...)`) so DESIGN.md edits touch one file.
3. **Background = two fixed-position gradient layers** (radial teal glow top-left, subtle mesh/noise bottom) behind `surface.base` chat card — reproduces liara.ir depth without images; pure CSS, no asset downloads.
4. **Topic picker = shadcn Select**, options mirroring `SERVICE_GROUPS` labels from `intent.ts` (single source of truth imported server-side → rendered list kept in sync manually; ponytail until an API serves it).
5. **Decorations gated to empty-state** only (before first message); conversation view stays chrome-free for readability.

## Risks / Trade-offs

- [Yekan Bakh not loaded on all clients] → keep system-ui fallback stack; verify Persian shaping in fallback during review.
- [Dark-only flip surprises existing users] → acceptable per design direction; light theme can return as a second token file later.
- [Radix deps weight] → tree-shaken per component; only adopted primitives are installed.
- [Dropdown sent as free string could mismatch backend expectations] → backend sanitizes and treats unknown topics as plain text prefix; harmless.

## Migration Plan

Branch work: tokens+background first (visual check), then component swaps one component per commit, then topic picker last. Rollback = revert branch; no data involved.

## Open Questions

- Final ticket/support URL value belongs to conversation-flow change, not here.
