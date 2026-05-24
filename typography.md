# Design System · Saviour

## Typography Scale
Complete typography system used across all Saviour app screens. 
- **Fraunces** is used for all display, editorial, and header moments.
- **DM Sans** is used for all user interface elements, body copy, labels, actions, and metadata.

---

## Google Fonts Imports
The following fonts should be imported in your global CSS stylesheet:
```css
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap');
```

---

## Typography Scale Table

| Role | Font Family | Size | Weight | Line Height | Letter Spacing | Case | CSS Class / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Fraunces | `28px` | `400` | `36px` | Normal | Normal | `.ty-display` (Main screen/editorial headers) |
| **Heading** | Fraunces | `20px` | `400` | `28px` | Normal | Normal | `.ty-heading` (Section headings) |
| **Subheading** | Fraunces | `16px` | `400` | `24px` | Normal | Normal | `.ty-subheading` (Supporting subheadings) |
| **Body** | DM Sans | `14px` | `400` | `22.4px` | Normal | Normal | `.ty-body` (Body text, detail, metadata) |
| **Body Small** | DM Sans | `12px` | `400` | `15.95px` | Normal | Normal | `.ty-body-small` (Secondary contexts, helper text) |
| **Label** | DM Sans | `12px` | `500` | `16px` | `0.84px` (7%) | Uppercase | `.ty-label` (Uppercase section labels) |
| **Caption** | DM Sans | `11px` | `400` | `15.95px` | Normal | Normal | `.ty-caption` (Time, status, note, caption) |
| **Ghost** | DM Sans | `12px` | `300` | `16px` | `0.84px` (7%) | Uppercase | `.ty-ghost` (Inactive uppercase labels, hints) |
| **Button** | DM Sans | `14px` | `500` | `22.4px` | Normal | Normal | `.ty-button` (CTA buttons, actions) |

---

## CSS Custom Properties
```css
:root {
  /* Font Families */
  --font-display: 'Fraunces', serif;
  --font-interface: 'DM Sans', sans-serif;

  /* Font Sizes */
  --font-size-display: 28px;
  --font-size-heading: 20px;
  --font-size-subheading: 16px;
  --font-size-body: 14px;
  --font-size-body-small: 12px;
  --font-size-label: 12px;
  --font-size-caption: 11px;
  --font-size-ghost: 12px;
  --font-size-button: 14px;

  /* Font Weights */
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;

  /* Line Heights */
  --line-height-display: 36px;
  --line-height-heading: 28px;
  --line-height-subheading: 24px;
  --line-height-body: 22.4px;
  --line-height-body-small: 15.95px;
  --line-height-label: 16px;
  --line-height-caption: 15.95px;
  --line-height-ghost: 16px;
  --line-height-button: 22.4px;

  /* Letter Spacing */
  --letter-spacing-label: 0.84px; /* 7% of 12px */
  --letter-spacing-ghost: 0.84px; /* 7% of 12px */
}
```
