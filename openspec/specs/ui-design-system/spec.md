# ui-design-system Specification

## Purpose
Make the chat UI visually match Liara's design language (dark token set from خدمات-رایانش-ابری---لیارا-DESIGN.md, liara.ir-style background) on an accessible shadcn/ui foundation, and let users optionally declare their question topic before typing.
## Requirements
### Requirement: Tokens come from the new design document

All colors, font sizes/weights, radii, and spacing used by chat components SHALL be defined as CSS variables / Tailwind tokens transcribed from `خدمات-رایانش-ابری---لیارا-DESIGN.md` (including `#00eac7` accent, `#111111` dark base, Yekan family, 22/10/4px radii). Components MUST NOT hardcode values outside that scale.

#### Scenario: Accent color change
- **WHEN** the accent token value changes in the token file
- **THEN** every accent-colored element updates without component edits

### Requirement: shadcn/ui is the component foundation

Interactive elements (buttons, inputs, dropdowns, dialogs, scroll containers) SHALL use shadcn/ui components built on Radix primitives; bespoke DOM for these element types MUST NOT be added.

#### Scenario: Keyboard navigation
- **WHEN** the topic dropdown is focused
- **THEN** arrow keys, Enter, and Escape behave per Radix menu semantics without custom code

### Requirement: liara.ir-style layered background

The main page SHALL render a layered gradient/mesh background equivalent in character to liara.ir's landing background, behind the chat surface, with text contrast preserved (WCAG AA against the overlaying surface).

#### Scenario: Contrast check
- **WHEN** the background renders behind the chat card
- **THEN** body text over the surface meets WCAG AA contrast

### Requirement: Optional pre-question topic picker

The UI SHALL offer a dropdown above the chat input listing service families (e.g. دیتابیس، پلتفرم برنامه، ذخیره‌سازی). Selection is OPTIONAL — the input works with no selection. When set, the chosen topic SHALL be sent as the request `topic` field and displayed as an active chip; the user SHALL be able to clear it.

#### Scenario: Topic chosen then question sent
- **WHEN** user selects "دیتابیس" and sends a question
- **THEN** the request body includes `"topic": "دیتابیس"` and the chip shows the active selection

#### Scenario: No selection
- **WHEN** the user never opens the dropdown
- **THEN** requests contain no `topic` field and the UI shows nothing extra

### Requirement: Support footer link is clickable

The footer disclaimer under the chat input SHALL render its support reference as a real anchor to `https://console.liara.ir` (opens in a new tab), styled with the accent token — not as literal markdown text.

#### Scenario: Footer support link
- **WHEN** the footer line renders
- **THEN** «پشتیبانی لیارا» is an `<a>` element with `href="https://console.liara.ir"` and keyboard focusable

### Requirement: Decorative elements stay subordinate

Decorative additions (illustration area, accent shapes, dividers) MAY fill empty regions but MUST NOT reduce readability, overlap interactive elements, or add horizontal scroll at any supported viewport width.

#### Scenario: Narrow viewport
- **WHEN** the page renders at 360px width
- **THEN** no decoration causes overflow or covers controls

