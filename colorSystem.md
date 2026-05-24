# Design System · Saviour

## Colour System
Every colour token used across the app. New additions are marked. One saturated colour per screen — only the action token on CTAs.

---

## 1. Base Surfaces
Used for app backgrounds, containers, and cards.

| Token | Hex | Visual Preview | Description / Usage |
| :--- | :--- | :--- | :--- |
| `base` | `#FAF7F2` | ![#FAF7F2](https://via.placeholder.com/15/FAF7F2/FAF7F2.png) | Base app background |
| `surface` | `#F0E9DE` | ![#F0E9DE](https://via.placeholder.com/15/F0E9DE/F0E9DE.png) | Main container background, default panel surface |
| `surface-raised` | `#EDE3D4` | ![#EDE3D4](https://via.placeholder.com/15/EDE3D4/EDE3D4.png) | Elevated surfaces, cards, and modal components |

---

## 2. Text
Used for hierarchy and reading priority.

| Token | Hex | Visual Preview | Description / Usage |
| :--- | :--- | :--- | :--- |
| `text-primary` | `#2E2A24` | ![#2E2A24](https://via.placeholder.com/15/2E2A24/2E2A24.png) | Primary text, titles, and main headings |
| `text-secondary` | `#8C7E6A` | ![#8C7E6A](https://via.placeholder.com/15/8C7E6A/8C7E6A.png) | Secondary text, descriptions, subheadings, and meta information |
| `text-ghost` | `#C4B5A5` | ![#C4B5A5](https://via.placeholder.com/15/C4B5A5/C4B5A5.png) | Inactive labels, hints, and weaker structural texts |

---

## 3. Brand & Semantic (Saturated)
Strong colours used sparingly for status, active states, and primary actions.

| Token | Hex | Visual Preview | Description / Usage |
| :--- | :--- | :--- | :--- |
| `action` | `#E07A55` | ![#E07A55](https://via.placeholder.com/15/E07A55/E07A55.png) | Primary CTA action color. Used *only* for the main action button. |
| `accent` | `#F5C97A` | ![#F5C97A](https://via.placeholder.com/15/F5C97A/F5C97A.png) | Accent highlight, streak counts, and special details. |
| `success` | `#A3C4A8` | ![#A3C4A8](https://via.placeholder.com/15/A3C4A8/A3C4A8.png) | Positive status, success states. |

---

## 4. Semantic · Subtle Pairs
Paired background and text colors to convey semantic states with high readability.

| Subtle Background | Hex | Saturated Foreground | Hex | Usage / Description |
| :--- | :--- | :--- | :--- | :--- |
| `action-subtle` | `#FAEAE0` | `action` | `#E07A55` | Energy badge bg, active chip background |
| `accent-subtle` | `#FDF6E3` | `accent` | `#F5C97A` | Streak card bg, achievement highlight |
| `success-subtle` | `#EBF3EC` | `success` | `#A3C4A8` | "Everything at home" tag bg, cooked state card |
| `warning-subtle` | `#FDF3E3` | `warning` | `#C4844A` | Pantry item running low — amber state |
| `error-subtle` | `#FAE8E8` | `error` | `#C45A5A` | Out of stock item, failed state, empty pantry |

> **⚠️ Pairing Rule:**
> Always use the subtle token (e.g., `*-subtle`) as the background and the corresponding saturated token as the text/icon colour. Never use the saturated token itself as a general background (except for the primary CTA button) as it is too dark and fails accessibility contrast on light text.

---

## 5. Interactive · Utility
Structural tokens for layout boundaries, interaction feedback, overlays, and disabled states.

| Token | Value | Visual Preview | Description / Usage |
| :--- | :--- | :--- | :--- |
| `on-action` | `#FFFFFF` | ![#FFFFFF](https://via.placeholder.com/15/FFFFFF/FFFFFF.png) | Text/icon colour when sitting on action background |
| `disabled` | `#DDD4C8` | ![#DDD4C8](https://via.placeholder.com/15/DDD4C8/DDD4C8.png) | Disabled buttons, inactive toggles, locked states |
| `divider` | `#E5DDD0` | ![#E5DDD0](https://via.placeholder.com/15/E5DDD0/E5DDD0.png) | List item separators (grocery list, profile options, ingredient lists) |
| `overlay` | `rgba(46, 42, 36, 0.48)` | - | Modal scrim, bottom sheet background, focus trap overlay |

---

## Strict Rules & Best Practices

1. **One Saturated Colour per Screen**
   * The Action colour (`#E07A55`) must appear **only** on the primary CTA button of a screen.
   * All other UI components must use surface tones (`base`, `surface`, `surface-raised`) or subtle semantic pairs.
2. **Strict Palette Adherence**
   * No hardcoded HEX, RGB, or HSL values are allowed outside this system.
   * All CSS colors must be referenced using variables generated from these tokens.

---

## Ready-to-Use CSS Variables
Include the following in your main stylesheet (e.g., `variables.css` or the top of `index.css` / `style.css`) to enforce this color system globally:

```css
:root {
  /* Base Surfaces */
  --color-base: #FAF7F2;
  --color-surface: #F0E9DE;
  --color-surface-raised: #EDE3D4;

  /* Text Colors */
  --color-text-primary: #2E2A24;
  --color-text-secondary: #8C7E6A;
  --color-text-ghost: #C4B5A5;

  /* Brand & Semantic Saturated */
  --color-action: #E07A55;
  --color-accent: #F5C97A;
  --color-success: #A3C4A8;
  --color-warning: #C4844A;
  --color-error: #C45A5A;

  /* Brand & Semantic Subtle */
  --color-action-subtle: #FAEAE0;
  --color-accent-subtle: #FDF6E3;
  --color-success-subtle: #EBF3EC;
  --color-warning-subtle: #FDF3E3;
  --color-error-subtle: #FAE8E8;

  /* Interactive & Utility */
  --color-on-action: #FFFFFF;
  --color-disabled: #DDD4C8;
  --color-divider: #E5DDD0;
  --color-overlay: rgba(46, 42, 36, 0.48);
}
```
