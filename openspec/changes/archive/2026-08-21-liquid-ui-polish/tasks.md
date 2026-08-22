## 1. Setup

- [x] 1.1 Install `motion` in `apps/web` (`npm install motion`)

## 2. Global Styles

- [x] 2.1 Add animation timing/easing CSS variables to `globals.css`
- [x] 2.2 Add `@media (prefers-reduced-motion: reduce)` rules
- [x] 2.3 Add robot idle animation keyframes (`robot-float`, `robot-blink`)

## 3. Layout Fixes

- [x] 3.1 Replace `h-screen` with `h-dvh` on chat root in `ChatContainer.tsx`
- [x] 3.2 Implement auto-resizing `textarea` in `ChatInput.tsx`
- [x] 3.3 Add `interactiveWidget: 'resizes-content'` viewport meta for mobile keyboard behavior

## 4. Animations

- [x] 4.1 Add entrance animation to user/assistant messages in `Message.tsx`
- [x] 4.2 Add entrance animation to starter questions in `EvaluationPrompts.tsx`
- [x] 4.3 Add subtle transition to sidebar links and input focus states

## 5. Header / Brand Polish

- [x] 5.1 Remove exposed session label from header subtitle
- [x] 5.2 Recolor header to purple/violet gradient with near-white text
- [x] 5.3 Add inline SVG robot icon with float/blink idle animation

## 6. Contrast / Theme Polish

- [x] 6.1 Update assistant bubble background, border, and text contrast in `Message.tsx`
- [x] 6.2 Recolor inline links, code blocks, citation links, and suggestion chips for dark-theme legibility
- [x] 6.3 Improve citation section styling and separator contrast

## 7. Sidebar Polish

- [x] 7.1 Convert sidebar links to card layout with purple-tinted background and border
- [x] 7.2 Improve title/metadata typography and hover affordance
- [x] 7.3 Update sidebar header color and add divider

## 8. Chat Input Polish

- [x] 8.1 Restyle input container with purple border, dark background, and focus highlight
- [x] 8.2 Update placeholder color and send button to brand purple
- [x] 8.3 Ensure input text color remains readable above background

## 9. Verification

- [x] 9.1 Typecheck passes (`tsc --noEmit`)
- [x] 9.2 Visual review of changed components by code inspection
- [x] 9.3 Confirm no backend/API/data-model changes introduced
