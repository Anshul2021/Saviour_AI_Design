# Design System Brief
## Cooking App for Exhausted Working Professionals

---

## Vibe

Warm, calm, and quietly playful. Like a well-worn kitchen on a Sunday morning — not clinical, not loud, not over-designed. The UI should feel like it was made by someone who actually cooks at home, not a tech company. Understated personality. Nothing screams for attention. The interface does the thinking so the user doesn't have to.

Primary emotion to design for: **relief**. The user is tired. Every screen should feel like the decision has already been made for her.

---

## Colours

### Base surfaces
| Token | Hex | Usage |
|---|---|---|
| `--color-base` | `#FAF7F2` | App background, page canvas |
| `--color-surface` | `#F0E9DE` | Cards, input fields, containers |
| `--color-surface-raised` | `#EDE3D4` | Elevated cards, selected states |

### Text
| Token | Hex | Usage |
|---|---|---|
| `--color-text-primary` | `#2E2A24` | Headlines, key information |
| `--color-text-secondary` | `#8C7E6A` | Supporting labels, metadata |
| `--color-text-ghost` | `#C4B5A5` | Intentionally de-prioritised actions (e.g. "Not tonight") |

### Brand / Semantic
| Token | Hex | Usage |
|---|---|---|
| `--color-action` | `#E07A55` | Primary CTA button only. One per screen, maximum. |
| `--color-accent` | `#F5C97A` | Highlights, tags, effort level indicators |
| `--color-success` | `#A3C4A8` | Post-cook done state, completion confirmations |

### Rules
- `--color-action` (#E07A55) is the **only saturated colour on any screen**. Everything else whispers. This is non-negotiable.
- Never use pure black (`#000000`) or pure white (`#FFFFFF`). Always use the warm-tinted equivalents above.
- No colour used purely decoratively. Every colour encodes meaning.
- No dark mode needed for v1.

---

## Typography

Two fonts. One for personality, one for readability. They share rounded, soft letterforms — they feel like the same family even though they aren't.

### Font 1 — Fraunces (Display & Headings)
Fraunces is a variable optical-size serif. Soft, warm, slightly quirky. Used only for hero text and section headings. Never for body copy, labels, or metadata.

**Import:**
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&display=swap
```

Use `font-variation-settings: "opsz" 9` for display sizes (soft, rounded feel).
Use `font-variation-settings: "opsz" 144` for anything below 18px (crisper, more legible).

### Font 2 — DM Sans (Body, Labels, UI)
DM Sans is a geometric sans-serif with slightly rounded terminals — it shares Fraunces's quiet roundness without competing with it. Clean, highly legible at small sizes, invisible in the best way. Used for all body copy, metadata, labels, buttons, and form fields.

**Import:**
```
https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap
```

### Combined import (use this)
```
https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=DM+Sans:wght@300;400;500&display=swap
```

### Type scale
| Role | Font | Size | Weight | Style | Notes |
|---|---|---|---|---|---|
| Display | Fraunces | 28px | 400 | normal | Hero meal name. `opsz: 9`. |
| Heading | Fraunces | 20px | 400 | normal | Section titles, emotional prompts. `opsz: 9`. |
| Subheading | Fraunces | 16px | 400 | normal | Secondary titles. `opsz: 144`. |
| Body | DM Sans | 14px | 400 | normal | Cook time, ingredient count, descriptions. |
| Label | DM Sans | 12px | 500 | normal | Tags, effort level, uppercase metadata. |
| Ghost | DM Sans | 12px | 300 | normal | De-prioritised actions ("Not tonight"). |
| Button | DM Sans | 14px | 500 | normal | CTA button text. |

### Rules
- **Fraunces = personality. DM Sans = clarity.** Never swap these roles.
- **Sentence case always.** Never ALL CAPS for Fraunces headings.
- DM Sans labels only: `text-transform: uppercase; letter-spacing: 0.07em` at 11–12px.
- Line height: 1.2 for Fraunces display, 1.35 for Fraunces headings, 1.6 for DM Sans body.
- No font sizes below 12px.
- Maximum weight in this system: 500. Never use 600, 700, or bold.

---

## Shape & Roundness

**Rounded. Consistently. No sharp corners anywhere.**

| Context | Border radius |
|---|---|
| Buttons (pill) | `999px` (fully rounded) |
| Cards, containers | `16px` |
| Input fields | `12px` |
| Tags, chips, badges | `8px` |
| Image thumbnails | `12px` |

Corners should feel soft throughout. The app is not corporate. It is not a dashboard. It is a personal kitchen assistant.

---

## Elevation & Shadows

**No shadows. Zero. None.**

Depth is created through colour alone:
- Background: `#FAF7F2`
- Raised card: `#F0E9DE`
- Further raised / selected: `#EDE3D4`

Each level is a warmer, slightly darker tone of the same cream family. This is enough. Shadows make the app feel like a generic productivity tool. Do not add them.

No `box-shadow`, no `drop-shadow`, no `filter: drop-shadow`. Not even subtle ones.

---

## Gradients

**Minimal and purposeful only.**

The app is flat by philosophy. But one gradient is allowed:

- **Fade-out at bottom of scrollable lists**: `linear-gradient(to bottom, transparent, #FAF7F2)` — signals more content below without a hard edge.

That is the only gradient in the system. No colour gradients, no mesh backgrounds, no gradient buttons.

---

## Scrollbars

**No visible scrollbars anywhere.**

To preserve a clean, print-editorial feel, scrollbars are entirely hidden across all scrollable containers (e.g. using `-webkit-scrollbar { display: none }` and `scrollbar-width: none`). Scrollability is signaled through the list fade-out gradient or visible content cuts.

---

## Noise / Texture

**None.**

No grain overlays, no noise textures, no paper textures. The warmth comes from the cream palette, not surface effects. Adding noise makes the app feel like a Substack newsletter, not a focused utility.

---

## Spacing

Base unit: `8px`. All spacing is a multiple of this.

| Token | Value | Usage |
|---|---|---|
| `--space-xs` | `8px` | Inline gaps, icon-to-label |
| `--space-sm` | `12px` | Between elements in a group |
| `--space-md` | `16px` | Card internal padding |
| `--space-lg` | `24px` | Between sections |
| `--space-xl` | `32px` | Screen-level vertical rhythm |
| `--space-2xl` | `48px` | Top padding on hero screens |

Be generous. The app should breathe. Cramped layouts feel anxious. This app is the opposite of anxious.

---

## Buttons

**One primary button per screen. Maximum.**

### Primary (CTA)
- Background: `#E07A55`
- Text: `#FAF7F2`, DM Sans 500, 15px
- Shape: `border-radius: 999px` (full pill)
- Padding: `16px 32px`
- Width: full-width on mobile (100%)
- No border, no shadow
- Hover: `background: #D06845`

### Ghost (de-prioritised)
- Background: none
- Text: `#C4B5A5`, DM Sans 300, 13px
- No border, no underline
- Tap target minimum 44px height (accessibility)
- This is the "Not tonight" button. It should feel like an afterthought, because it is.

### No secondary/outlined buttons in v1.
If a screen needs two options, one is primary and one is ghost. Never two equal-weight buttons competing.

---

## Icons

Line icons only (Phosphor Icons or Lucide — outline weight). No filled icons.

- Size: 20px inline, 24px standalone
- Colour: `--color-text-secondary` for decorative, `--color-text-primary` for functional
- Stroke width: 1.5px

---

## Cards

```
background: #F0E9DE
border-radius: 16px
padding: 20px
border: none
box-shadow: none
```

No borders on cards. The colour contrast between canvas (`#FAF7F2`) and card (`#F0E9DE`) is the boundary. Clean.

---

## Do Not

- Do not use Inter, Roboto, or any other sans-serif — DM Sans only for UI text
- Do not use any serif other than Fraunces — no mixing in other display fonts
- Do not use Fraunces for body copy, labels, button text, or form fields
- Do not use DM Sans for hero headlines or section headings
- Do not show scrollbars anywhere
- Do not add shadows anywhere
- Do not use more than one saturated colour per screen
- Do not use gradients except the single scroll-fade listed above
- Do not use noise or texture
- Do not use dark backgrounds (light-only app)
- Do not add more than one primary CTA per screen
- Do not use `font-weight: 600` or `700` — 500 is the maximum
- Do not use pure black or pure white

---

## One-line Summary for AI Prompts

> Warm cream background (#FAF7F2), Fraunces serif for headlines and headings, DM Sans for all body and UI text, no shadows, no gradients, no noise, fully rounded pill buttons in terracotta (#E07A55), flat card depth using warm colour tones only, ghost text for de-prioritised actions, calm and minimal — one saturated colour per screen maximum.