# Three Flows Solutions — Brand Style Guide

v1 · 2026. This package: `style.md` (rules), `style.css` (tokens + components), `logo-mark.svg`, `logo-mark-reversed.svg`.

---

## 1. Logo

The mark is three rounded bars with a **fixed hierarchy: middle tallest, left second, right shortest**. Each bar carries one flow:

- **Ink bar** (left, #26221F) — material flow (supply chain)
- **Brick bar** (middle, #C2291B) — information flow (systems & process)
- **Stone bar** (right, #B8ADA5) — cash flow (bookkeeping)

### Rules
- Never reorder, recolor individually, or redraw the bar proportions.
- Minimum size: 24px. Clearspace: one bar-width on all sides.
- On dark (ink) backgrounds use `logo-mark-reversed.svg`.
- Primary lockup: mark + "Three Flows Solutions" on **one line**, set in Source Serif 4 Bold. Use `.tf-lockup` from style.css.
- Mark alone is fine for avatars, favicon, and watermarks.

### Tagline
Placeholder, still TBD: *"Beside you, start to scale."* Set in Space Grotesk Medium, brick color, below or beside the lockup.

---

## 2. Color

The palette is exactly the logo's four inks — **no additional hues**.

- **Brick `#C2291B`** — brand accent. Primary actions, kickers, emphasis. Use sparingly; most of the page is ink on paper. Hover/pressed: `#8F1E12`. On ink backgrounds use `#D4402C`.
- **Ink `#26221F`** — body text, 2px rules, dark surfaces (footer, hero bands). Secondary text: `#55504D`.
- **Stone `#B8ADA5`** — supporting tone: meta text, chart fills, muted labels. Light borders: `#DDD6CF`.
- **Paper `#F5F2EE`** — the ground. Warm white everywhere; never pure white.

Text on brick is always paper. Body-size text in brick should be avoided (contrast) — use it for labels ≥ 14px bold, buttons, and headings only.

---

## 3. Typography

Two families, loaded from Google Fonts (see the `<link>` snippet at the top of style.css):

- **Headings — Source Serif 4**, weights 600–700. Wordmark, headlines, pull quotes. Advisory, human register.
- **Body & UI — Space Grotesk**, 400 body · 500 labels/buttons · 700 stats. Quietly technical counterpart to the serif.

Scale (from style.css tokens): hero 48 / h2 36 / h3 27 / lead 20 / body 16 / caption 14 / meta 12 (uppercase, 0.14em tracking).

---

## 4. Layout & rules

- Strong **2px ink rules** divide major sections; light rules (`#DDD6CF`) divide content inside a section. Don't soften them into hairlines.
- Everything sits **flush left** — headings, copy, and button labels (a wide button starts its label at the left padding edge, never centered).
- Corners on UI surfaces are square. The only rounded corners in the brand are the logo bars themselves (rx 4).
- Spacing runs on an 8px base (`--tf-space-*`).

---

## 5. Using style.css

1. Load the Google Fonts `<link>` (top of style.css), then `<link rel="stylesheet" href="style.css">`.
2. Build with the provided classes:
   - `.tf-nav` + `.tf-lockup` — header
   - `.tf-kicker` + `h1/h2` + `.tf-lead` — section openers
   - `.tf-btn.tf-btn-primary` / `.tf-btn-secondary` — actions
   - `.tf-section`, `.tf-card`, `.tf-surface-ink` — page structure
   - `.tf-stat-value` / `.tf-stat-label` — stats
3. Take every color/size from the `--tf-*` tokens; don't hard-code hexes.

### Minimal page skeleton

```html
<header class="tf-nav">
  <a class="tf-lockup" href="/">
    <img src="logo-mark.svg" alt="" class="tf-lockup-mark">
    <span class="tf-lockup-name">Three Flows Solutions</span>
  </a>
  <nav class="tf-nav-links">
    <a href="/services">Services</a>
    <a href="/about">About</a>
    <a href="/contact" aria-current="page">Contact</a>
  </nav>
</header>

<section class="tf-section">
  <div class="tf-kicker">E-commerce launch &amp; retail growth</div>
  <h1>Launch your retail business with confidence</h1>
  <p class="tf-lead tf-secondary">Plan, source, launch, and grow — with enterprise-level rigor at every stage.</p>
  <a class="tf-btn tf-btn-primary" href="/contact">See how we work →</a>
</section>
```
