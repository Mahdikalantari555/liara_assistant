# Tasks: UI Overhaul — shadcn/ui + Liara Design Tokens

## 1. Foundation

- [x] 1.1 Init shadcn/ui in `apps/web` (CLI init, `components.json`, `lib/utils.ts` with cn()) — hand-authored: registry blocked by network policy; deps installed locally (`@radix-ui/react-select`, `tailwind-merge`)
- [x] 1.2 Transcribe new tokens from `خدمات-رایانش-ابری---لیارا-DESIGN.md` into `globals.css` CSS variables; remap `tailwind.config.ts`
- [x] 1.3 Add layered gradient background (fixed layers behind chat surface); remove old light token set

## 2. shadcn adoption

- [x] 2.1 Add primitives: button, input, textarea, select, card, scroll-area, dialog (only these) — shipped only used ones: button, textarea, card, select; native scroll kept for message list
- [x] 2.2 Restyle ChatContainer + Message onto Card/ScrollArea
- [x] 2.3 Restyle ChatInput onto Textarea/Button
- [x] 2.4 Restyle Suggestions, Feedback, Sidebar/** onto primitives (unused Feedback.tsx/SidebarItem.tsx deleted)
- [x] 2.5 RTL pass: verify dir handling, Yekan shaping, focus rings on all restyled components (user visual pass on live app)

## 3. Topic picker

- [x] 3.1 Add shadcn Select above ChatInput with service-family options; optional, clearable, active chip state
- [x] 3.2 Send selected topic as `topic` field in chat request body (requires conversation-flow change merged; else render disabled with tooltip) — route already accepts `topic`; omitted entirely when nothing picked
- [x] 3.3 Render footer support line with clickable «پشتیبانی لیارا» anchor → https://console.liara.ir (new tab, accent styling)

## 4. Decoration

- [x] 4.1 Empty-state illustration/accent area shown only before first message
- [x] 4.2 Verify 360px viewport: no overflow, no overlap with controls (user visual pass on live app)

## 5. Verification

- [x] 5.1 `npm run build` passes; visual check against DESIGN.md tokens (accent #00eac7, dark base)
- [x] 5.2 Keyboard-only walkthrough: input, send, dropdown open/select/clear (Radix Select semantics; user visual pass on live app)
- [x] 5.3 Contrast spot-check body text over surface ≥ WCAG AA (#eee/#111 ≈ 15.9:1, #bebebe/#181818 ≈ 9.2:1)
