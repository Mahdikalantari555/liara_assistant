---
version: alpha
name: "Frequency-Based Extraction"
description: "Design tokens extracted from frequency analysis without LLM interpretation."
colors:
  text: "#eeeeee"
  text-2: "#ffffff"
  text-3: "#111111"
  text-4: "#bebebe"
  text-5: "#222222"
  text-6: "#b4bcd0"
  text-7: "#8a8a8a"
  text-8: "#cccccc"
  text-9: "#00eac7"
  local-accent: "#87fcc4"
typography:
  type-1:
    fontFamily: "yekan"
    fontSize: "16px"
    fontWeight: "400"
  type-2:
    fontFamily: "yekan"
    fontSize: "15px"
    fontWeight: "400"
    lineHeight: "18px"
  type-3:
    fontFamily: "yekan"
    fontSize: "15px"
    fontWeight: "500"
  type-4:
    fontFamily: "yekan"
    fontSize: "14px"
    fontWeight: "600"
  type-5:
    fontFamily: "yekan"
    fontSize: "12px"
    fontWeight: "700"
rounded:
  radius-1: "22px"
  radius-2: "6px"
  radius-3: "50px"
  radius-4: "10px"
  radius-5: "4px"
spacing:
  space-1: "10px"
  space-2: "20px"
  space-3: "15px"
  space-4: "5px"
  space-5: "3px"
  space-6: "30px"
  space-7: "40px"
  space-8: "50px"
  space-9: "25px"
  space-10: "70px"
---

## Overview

Design tokens extracted from frequency analysis without LLM interpretation.

**Signature traits:**
- Evidence was insufficient to extract distinctive signature traits for this system.

## Colors

The palette uses 10 validated color tokens across 1 theme profile. Semantic roles stay attached to observed usage so generation agents can choose accents without inventing new color meaning.

### Text Scale
- **Text** (#eeeeee): Frequency rank #1 (542 occurrences); token importance textCandidate: repeated text-role usage (542 hits). Role: text. {authored: rgb(238, 238, 238), space: rgb}
- **Text-2** (#ffffff): Frequency rank #2 (302 occurrences); token importance textCandidate: repeated text-role usage (302 hits). Role: text. {authored: rgb(255, 255, 255), space: rgb, alpha: 0.02}
- **Text-3** (#111111): Frequency rank #3 (72 occurrences); token importance textCandidate: repeated text-role usage (72 hits). Role: text. {authored: rgb(17, 17, 17), space: rgb}
- **Text-4** (#bebebe): Frequency rank #4 (72 occurrences); token importance textCandidate: repeated text-role usage (72 hits). Role: text. {authored: rgb(190, 190, 190), space: rgb}
- **Text-5** (#222222): Frequency rank #5 (62 occurrences); token importance textCandidate: repeated text-role usage (62 hits). Role: text. {authored: rgb(34, 34, 34), space: rgb}
- **Text-6** (#b4bcd0): Frequency rank #6 (36 occurrences); token importance textCandidate: repeated text-role usage (36 hits). Role: text. {authored: rgb(180, 188, 208), space: rgb}
- **Text-7** (#8a8a8a): Frequency rank #7 (15 occurrences); token importance textCandidate: repeated text-role usage (15 hits). Role: text. {authored: rgb(138, 138, 138), space: rgb, alpha: 0.133}
- **Text-8** (#cccccc): Frequency rank #9 (10 occurrences); token importance textCandidate: repeated text-role usage (10 hits). Role: text. {authored: rgb(204, 204, 204), space: rgb}
- **Text-9** (#00eac7): Frequency rank #10 (9 occurrences); token importance textCandidate: repeated text-role usage (9 hits). Role: text. {authored: rgb(0, 234, 199), space: rgb, alpha: 0.133}

### Interactive
- **Local-accent** (#87fcc4): Frequency rank #8 (11 occurrences); token importance localAccent: localized usage with limited global footprint. Role: border. {authored: rgb(135, 252, 196), space: rgb, alpha: 0.08}

## Typography

Typography uses yekan across extracted hierarchy roles. Keep hierarchy mapped to these token rows before adding decorative type styles.

Uses yekan throughout for a uniform feel. Weight range spans regular, medium, semi-bold, bold. Sizes range from 12px to 16px.

### Type Scale Evidence
| Role | Font | Size | Weight | Line Height | Letter Spacing | Stack / Features | Notes |
|------|------|------|--------|-------------|----------------|------------------|-------|
| Frequency rank #1 | yekan | 16px | 400 | normal | normal | yekan, yekan Fallback | Extracted token |
| Frequency rank #2 | yekan | 15px | 400 | 18px | normal | yekan, yekan Fallback | Extracted token |
| Frequency rank #3 | yekan | 15px | 500 | normal | normal | yekan, yekan Fallback | Extracted token |
| Frequency rank #4 | yekan | 14px | 600 | normal | normal | yekan, yekan Fallback | Extracted token |
| Frequency rank #5 | yekan | 12px | 700 | normal | normal | yekan, yekan Fallback | Extracted token |

## Layout

Layout rhythm is inferred from spacing tokens and responsive breakpoint evidence.

### Spacing System
| Token | Value | Px | Notes |
|------|-------|----|-------|
| space-5 | 3px | 3 | Extracted spacing token |
| space-4 | 5px | 5 | Extracted spacing token |
| space-1 | 10px | 10 | Extracted spacing token |
| space-3 | 15px | 15 | Extracted spacing token |
| space-2 | 20px | 20 | Extracted spacing token |
| space-9 | 25px | 25 | Extracted spacing token |
| space-6 | 30px | 30 | Extracted spacing token |
| space-7 | 40px | 40 | Extracted spacing token |
| space-8 | 50px | 50 | Extracted spacing token |
| space-10 | 70px | 70 | Extracted spacing token |

## Elevation & Depth

Keep depth flat unless validated shadow or interaction evidence appears in the extraction payload. Do not invent shadows beyond this evidence boundary.

### Shadow Evidence
| Shadow Token | Layers | Details |
|--------------|--------|---------|
| n/a | 0 | No validated shadow payload |

### Interaction Signals
| Theme | Signal | Evidence |
|-------|--------|----------|
| Light | backdrop-filter | blur(5px) ; blur(10px) |
| Light | outline-style | solid |
| Light | outline-color | rgb(238, 238, 238) ; rgb(255, 255, 255) ; rgba(0, 0, 0, 0) |
| Light | outline-width | 3px ; 1px |
| Light | outline-offset | 0px |
| Light | transform | matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, 0) ; matrix(1, 0, 0, 1, 0, -50) ; matrix(1, 0, 0, 1, 0, 0) |

## Shapes

Shape language maps directly to rounded tokens. Keep component corners consistent with the role mapping below before introducing bespoke geometry.

### Radius Roles
| Token | Value | Px | Role Mapping |
|------|-------|----|--------------|
| radius-5 | 4px | 4 | Subtle corner |
| radius-2 | 6px | 6 | Subtle corner |
| radius-4 | 10px | 10 | Control corner |
| radius-1 | 22px | 22 | Large surface corner |
| radius-3 | 50px | 50 | Large surface corner |

### Geometry Evidence
| Radius Token | Shape | Units |
|--------------|-------|-------|
| radius-1 | 22px | px |
| radius-2 | 6px | px |
| radius-3 | 50px | px |
| radius-4 | 10px | px |
| radius-5 | 4px | px |

## Components

(none detected)

## Do's and Don'ts

Guardrails tie generation choices back to validated tokens, component patterns, and evidence-backed hierarchy.

| Do | Don't |
|----|---------|
| Do maintain consistent spacing using the base grid | Don't make unsupported claims about absent visual features |
| Do maintain WCAG AA contrast ratios (4.5:1 for normal text) | Don't mix rounded and sharp corners in the same view |
| Do use the primary color only for the single most important action per screen |  |
| Do verify evidence before writing new design-system guidance |  |

## Responsive Evidence

### Breakpoints
| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | <= 425px | (max-width: 425px) |
| Mobile | <= 450px | (max-width: 450px) |
| Breakpoint 3 | <= 820px | (max-width: 820px) |
| Breakpoint 4 | <= 1100px | (max-width: 1100px) |
| Breakpoint 5 | <= 1300px | (max-width: 1300px) |
| Breakpoint 6 | <= 1440px | (max-width: 1440px) |
| Tablet | >= 820px | (min-width: 820px) |
| Breakpoint 8 | Unknown | (prefers-reduced-motion: reduce) |

## Agent Prompt Guide

### Example Component Prompts
- Create button component using validated primary color role and spacing tokens.
- Create card component with mapped radius role and evidence-backed elevation.
- Create form input component using inferred typography hierarchy and border roles.

### Iteration Guide
1. Start with extracted palette and typography roles only.
2. Map spacing and radius directly from token tables before visual polish.
3. Apply component patterns one section at a time and compare against source intent.
4. Keep elevation claims tied to explicit evidence in output.
5. Iterate with smallest diffs and re-check section hierarchy after each change.
