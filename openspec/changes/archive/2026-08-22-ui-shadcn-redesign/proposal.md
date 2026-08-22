# Proposal: UI Overhaul — shadcn/ui + Liara Design Tokens

## Why

The current UI is hand-rolled components styled against the old light-theme token set in `(liara)-DESIGN.md`, while the authoritative target is now `خدمات-رایانش-ابری---لیارا-DESIGN.md` (dark surfaces, `#00eac7` accent, Yekan type scale). Visually it also falls short of liara.ir's finished look — notably its layered gradient background. Rebuilding the component layer on shadcn/ui while swapping the token source fixes both at once and gives future features accessible primitives for free. The user-facing question-topic picker requested for this change rides along here because it is pure UI.

## What Changes

- Adopt shadcn/ui as the component foundation (Button, Input, Textarea, Select/DropdownMenu, Card, ScrollArea, Dialog where needed), themed via CSS variables mapped to the new DESIGN.md tokens.
- Replace hardcoded colors/radii/spacing in existing components with the new token set: dark-first palette (`#111111` base, `#eeeeee` text, `#00eac7` / `#87fcc4` accents), Yekan font stack, validated radius scale (22px hero / 10px controls / 4px chips).
- Recreate the liara.ir-style page background (layered gradients/mesh) behind the chat surface.
- Add an **optional** topic dropdown above the chat input: user may pick a service family before typing; selection is sent as the chat request `topic` hint (consumed by the `conversation-flow-improvements` change) and can be cleared.
- Add tasteful decorative elements (empty-state illustration area, subtle dividers/accent shapes) to fill visual dead space — no content-free chrome that hurts readability.
- Keep RTL layout and Persian-first copy intact; keep dark mode via `class` strategy.

## Capabilities

### New Capabilities
- `ui-design-system`: token-driven theming (colors/type/radius/background), shadcn component adoption rules, topic-picker behavior, and decorative-element constraints.

### Modified Capabilities

(none)

## Impact

- **Code**: `apps/web/tailwind.config.ts` (token remap), `apps/web/src/app/globals.css` (CSS variables, background layers), all `apps/web/src/components/**` (restyle onto shadcn primitives), `package.json` (add `shadcn/ui` deps: radix primitives + `clsx`/`tailwind-merge`/`class-variance-authority`).
- **APIs**: none directly; consumes optional `topic` field from the conversation-flow change.
- **Dependencies**: adds radix-ui primitives via shadcn CLI — first UI dep addition; no runtime service.
- **Accessibility**: shadcn primitives bring keyboard/focus handling the hand-rolled components lack.
