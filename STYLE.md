# Three Flows Solutions — Brand Style Guide

v2 · 2026-07-16 — merge of the site build (v1 + ratchet record) and Claude Design v1.5. This package: `style.md` (rules), `style.css` (tokens + components), `logo-mark.svg`, `logo-mark-reversed.svg`.

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
- **Paper `#FBFAF8`** — the ground. Warm off-white; never pure white.
- **Cream `--tf-cream`** — derived overlay tint (≈#ECE7E2 with v2 paper) for raised surfaces: dropdowns, popovers, menus.

Text on brick is always paper. Body-size text in brick should be avoided (contrast) — use it for labels ≥ 14px bold, buttons, and headings only.

### Data palette (charts & category coding)

Six equal-weight series colors, used **in order** — Brick is always the primary series: Brick `#C2291B`, Slate `#35618E`, Ochre `#B07A18`, Teal `#23787A`, Plum `#8A3A62`, Stone `#B8ADA5` (tokens `--tf-chart-1` … `--tf-chart-6`). All sit at the logo's muted saturation. Area fills: the color at 20% opacity with a solid 2px line. Never for body text.

### Pills (v2 kit)

Pills and the logo bars are the two rounded shapes in the brand. Base `.tf-pill` (13px / 6px 15px) +
- `.tf-pill-brick` / `.tf-pill-ink` — solid, status & emphasis
- `.tf-pill-outline` (optionally `.tf-pill-dot`) — filters & states
- `.tf-pill-tint-{brick|slate|ochre|teal|plum|stone}` — category tags (wash bg + deep text of the same hue). This resolves the "pending palette extension" note from the blog build.
- `.tf-pill-sm` — small uppercase modifier (journey phases, compact labels)
- Blog-tag aliases kept for blog.js: `-primary` (solid brick), `-secondary` (brick outline), `-muted` (stone outline)

### Icons & imagery

**Lucide** (lucide.dev) only — 1.75px stroke, 22px default, brick or ink. **No emoji anywhere in the brand.** Every content photograph passes through `.tf-photo` (`saturate(0.72) sepia(0.14) contrast(1.04) brightness(1.02)`) — muted, warmed to the palette; no per-image grading. Profile photos: same treatment, circle crop.

### Site components (brand sheet §07–12)

- **Stats** — `.tf-stat-grid` + `.tf-stat-value`/`.tf-stat-label`; figures always brick
- **Testimonial** — `.tf-quote` + `.tf-quote-attr`; Source Serif 4 Semibold, never italic
- **Trusted-by** — `.tf-logos`; names in stone, logos only as one-color ink wordmarks
- **Journey stepper** — `.tf-journey` + `.tf-journey-step` + `.tf-journey-num`; phases are pills: Pathfinder `.tf-pill .tf-pill-sm .tf-pill-tint-brick`, Runningmate `.tf-pill .tf-pill-sm .tf-pill-tint-teal`. Hover/active = brick-tint wash
- **Step lists** — `.tf-steps` on an `<ol>`; auto-numbered in brick
- **Callouts** — `.tf-callout` with a Lucide icon
- **Profiles** — `.tf-profile` + `.tf-avatar` (initials until photography is supplied)
- **Cards** — `.tf-card` + `.tf-card-kicker/-title/-body/-meta`; `.tf-card-strong` (stat), `.tf-card-ink` (feature, max one per row)
- **CTA band** — `.tf-cta` (ink field) + `.tf-btn-primary` brick button; once per page

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

---

## 6. Ratchet-rule record

Each row: which build first needed a pattern, and what was added to `style.css`. Patterns always live in `style.css`, never page-local.

### Shared header/footer (partials.html + site shell) — 2026-07-15

Defined the shared navigation and footer patterns. The header/footer markup lives once in `partials.html` and is fetched + injected into `#tf-header` / `#tf-footer` placeholders by a small vanilla-JS snippet each page carries (relative fetch, so it works on localhost and under the github.io subpath; fails silently to no-nav rather than a broken page). Added to `style.css`:

- **Nav dropdowns (`.tf-nav-item`, `.tf-has-dropdown`, `.tf-nav-trigger`, `.tf-dropdown`).** Two dropdown groups (Services, Resources). Triggers are `<button>`s styled to match `.tf-nav-links a` (14px, ink-soft → brick on hover/open). On desktop (≥ 820px) the panel floats below its trigger inside a 2px ink rule and opens on hover, focus-within, or click (`.is-open`); JS toggles `aria-expanded` and closes others on outside click.
- **Mobile menu (`.tf-nav-toggle`, `.tf-nav-toggle-bar`, `.tf-nav-open`).** Below 820px the nav collapses behind a square hamburger (2px ink border, three ink bars); tapping toggles `.tf-nav-open` on the header, which stacks `.tf-nav-links` full-width on its own row. Dropdowns become tap-to-expand accordions (indented, no floating panel).
- **Breakpoint:** single nav breakpoint at **820px** (enough room for the lockup plus six nav slots on one line).
- **Footer (`.tf-footer`, `.tf-footer-links`).** Pairs with `.tf-surface-ink` (dark ground). Reversed logo lockup on the left, links on the right, wrapping on narrow screens; 2px ink top rule; `--tf-space-4` block padding. Currently one link (Privacy &amp; Terms → `privacy.html`); built to grow. Hidden pages (`privacy.html` aside, `surveys.html`) never appear in nav.

All colors/sizes taken from `--tf-*` tokens; square corners and flush-left preserved.

### Nav dropdown revision — localhost review — 2026-07-15

Localhost review of the header found the dropdowns stuck open (two panels at once) and the panels truncating / bordered / on a paper ground. These are the corrected design-system decisions (all in `style.css`; the matching state machine is in the per-page nav snippet):

- **Single-open, JS-owned state.** The panel display rule is now `.tf-has-dropdown.is-open > .tf-dropdown` only — the CSS `:hover` and `:focus-within` display triggers were removed. Visibility is driven solely by the `.is-open` class the nav script sets, so exactly one panel can be open at a time. (The earlier `:focus-within` rule was what pinned a panel open after a click.) Behavior: open on the trigger's hover or click; close on mouse leave, outside click, or Esc.
- **Panel treatment = raised cream surface, borderless (user decision — see the cream-token entry below).** `.tf-dropdown` is `background: var(--tf-cream)` with ink item text and brick for hover / current-page. No border, no shadow, square corners; contrast comes from the surface itself (the previous 2px-rule / paper panel is gone). *(This bullet supersedes an interim ink-surface treatment tried in the same review.)*
- **Panel sizing.** Desktop panel is `width: max-content` with `white-space: nowrap` on items, so it always fits its longest label — no wrapping, no truncation (replaces the fixed `min-width: 210px`).
- **Layering.** Desktop panel is `position: absolute; z-index: 50`, so it overlays following sections/footer cleanly and never pushes or bleeds into page content.
- **Current-page rule.** *(Superseded — see the "Nav link states — no current-page marker" record below; the current page now carries no visual affordance. The exact-filename `aria-current` marking is retained in the snippet for accessibility.)* The snippet sets `aria-current="page"` via **exact filename match on `.tf-nav-links` links only** (never a substring; the lockup and the dropdown `<button>` triggers are never marked). Top-level colouring is scoped to `.tf-nav-links > a`; a trigger shows brick only while its own panel is open (`.tf-has-dropdown.is-open > .tf-nav-trigger`) or on hover.
- **Lockup colour.** `.tf-lockup` now sets `color: inherit`, so the wordmark follows its surface — ink on the paper header, paper on the ink footer — instead of picking up the base `a { color: brick }`. Fixes the header wordmark rendering brick (a second brick element) and keeps the lockup out of the current-page count. (`assets/logo-mark.svg` is referenced relatively and serves 200 on localhost and the github.io subpath; a "missing" lockup only occurs when a page is opened over `file://`, where `fetch()` is blocked and the header fails silently by design.)
- **Mobile parity.** Same items and single-open accordion behavior below 820px; the cream panel treatment carries over as an in-flow block; nav links and triggers get `--tf-space-1` vertical padding for adequate tap targets. `privacy.html` stays footer-only.

### Cream overlay surface + sticky footer — localhost review — 2026-07-15

Two design-system decisions from the same review:

- **`--tf-cream` — raised-surface tone for overlays.** Added `--tf-cream: color-mix(in srgb, var(--tf-stone-light) 50%, var(--tf-paper))` (~`#E9E4DE`). It is a **derived tint of existing tokens, not a new raw hue** — the palette stays closed (the logo's four inks). Cream is the standing tone for elements that sit *above* the page: the nav dropdowns use it now, and future overlays (popovers, menus, raised cards) reuse `--tf-cream` rather than inventing another tone. On it, item text is ink and hover is brick (the current page carries no marker — see the nav-link-states record below).
- **Sticky footer (`body.tf-app` + `.tf-app > main`).** The app shell is a full-height flex column: `body.tf-app { min-height: 100vh; display: flex; flex-direction: column; }` and `.tf-app > main { flex: 1 0 auto; }`. `<main>` grows to fill, so the footer sits at the viewport bottom on short pages and flows naturally after content on long ones. Applied by giving each shell page `<body class="tf-app">` with the `#tf-header` / `<main>` / `#tf-footer` structure — a shared pattern, never page-local.

### Page container + nav link states — localhost review — 2026-07-15

- **`.tf-container` — the shared content measure.** `width: 100%; max-width: 1200px; margin-inline: auto; box-sizing: border-box`, with `padding-inline: var(--tf-space-3)` (24px) below tablet and `var(--tf-space-4)` (32px) from `min-width: 768px` up. It centres content and holds it to a readable width. **Full-bleed surfaces still span the viewport — only their content is contained:** `.tf-nav` and `.tf-footer` became full-bleed bands (paper header rule / ink footer band across the whole width) whose inner content lives in a `.tf-container` (`.tf-nav-inner`, `.tf-footer-inner`, both of which also carry the flex layout that used to sit on the band). Every page's `<main>` content uses the same measure via a nested `.tf-container` (see the section-rhythm record below). New shared pattern; applied via partials/shell structure, never page-local.
- **Nav link states — no current-page marker.** The current page keeps `aria-current="page"` in the markup for accessibility, but carries **no visual affordance** (no brick text, no underline). At rest every nav link is quiet: top-level links are ink-soft, dropdown panel items are ink on the cream surface. **Brick text appears only on hover, or on a dropdown trigger while its own panel is open.** Same rule desktop and hamburger. (This supersedes two earlier same-day attempts at a current-page marker — brick text, then an ink-text + 2px-brick underline — both dropped: the page context already signals location, and a nav marker competed with the trigger-open brick signal.)
- **Nav divider unchanged.** The header/footer dividers stay the 2px ink rule (`--tf-rule`).

### Section rhythm + section/container reconciliation — localhost review — 2026-07-15

- **Page content sits in `.tf-section`.** Shell pages were `<main class="tf-container">` with the H1 flush under the nav divider. Now each page is `<main class="tf-section"><div class="tf-container">…</div></main>`, so content gets `--tf-space-6` (48px) of top rhythm below the nav's ink divider (and the same at the bottom, above the footer).
- **Reconciled side padding — gutters live in one place.** `.tf-section` was `padding: var(--tf-space-6) var(--tf-space-3)`; the horizontal `--tf-space-3` was removed so it is now `padding-block: var(--tf-space-6)` only. `.tf-section` is a **full-bleed band** (vertical rhythm + the 2px ink divider spanning the viewport, like the header/footer bands); the nested `.tf-container` supplies the responsive horizontal gutters (24/32px). Because the section no longer sets inline padding, section padding and container gutters **never double up** — the gutter is defined once, in `.tf-container`.

### Lockup never takes link colour — localhost review — 2026-07-15

The header lockup is an `<a href="index.html">`, so it was picking up the global `a:hover { color: var(--tf-brick-dark) }` and the wordmark flipped brick on hover. The lockup is a wordmark, not a coloured link: it must stay on its surface tone in **every** state. Fix (in `style.css`): `.tf-lockup:hover, .tf-lockup:focus, .tf-lockup:active { color: inherit; }` — the `:hover` selector (0,2,0) outranks `a:hover` (0,1,1), so the header wordmark stays ink at rest, hover, focus, and active. The footer lockup is a `<div>` (not a link), so it never took link colouring and stays paper in all states — verified. `:focus-visible` still draws the standard brick focus ring (an outline, not text colour), so keyboard focus remains visible.

### Long-form prose (`.tf-prose`) — privacy.html — 2026-07-15

Long documents (legal text now; blog posts and service write-ups later) need a
narrow, readable measure and body-element styling the base sheet doesn't carry.
Defined by the first page that needed it (privacy.html); **reused, not
reinvented, by blogs and services.**

- **`.tf-prose` — reading measure.** `max-width: 62ch` (**≈85 rendered
  characters** in Space Grotesk), flush left. It nests *inside* a
  `.tf-container`: the container supplies the outer gutters and the 1200px page
  measure; `.tf-prose` holds the running text at the left edge (no
  auto-centering), so paragraphs read comfortably on wide screens while the page
  frame stays consistent with every other page. **Unit caveat:** the `ch` unit
  is tied to the font's `0` glyph, which in Space Grotesk runs ~1.37× the
  average character — so a nominal `70ch` renders ~96 chars (too wide). `62ch`
  lands the intended ~85-character measure; size by rendered characters, not the
  nominal `ch` number, when reusing this on blogs/services.
- **Prose page intro (`.tf-prose-intro`).** The paragraph under the h1 is
  **body size (16px) in `--tf-ink-soft`** — differentiated from the body copy by
  colour, not size. It deliberately does **not** use `.tf-lead` (20px), which
  stays reserved for hero moments; a legal/reference page opens quietly.
- **Header divider (`.tf-prose > .tf-meta`).** A direct-child meta line (e.g.
  "Last updated …") closes the page-header block with a **light rule**
  (`--tf-rule-light`, `--tf-space-3` padding above it) before the body copy —
  the brand's rule hierarchy: light rules divide content *within* a section,
  the 2px ink `hr` divides major sections.
- **Heading rhythm.** Within prose, headings get more space above than below
  (`h2` `--tf-space-6` top / `--tf-space-2` bottom; `h3` `--tf-space-3` /
  `--tf-space-1`) so each section reads as a grouped block. `> :first-child`
  gets `margin-top: 0`; `h2/h3` get `scroll-margin-top` so an in-page anchor
  jump doesn't butt the viewport top.
- **Lists.** `.tf-prose ul/ol` get bottom spacing + left padding
  (`--tf-space-3`); `li` get `--tf-space-1` between items. (The base sheet
  styled no lists.)
- **Inline links.** `.tf-prose a` is underlined — inside running text, colour
  alone shouldn't carry a link (accessibility + scannability). Elsewhere links
  stay underline-free per the base `a` rule.
- **Section rule.** `.tf-prose hr` renders as the brand's 2px ink rule
  (`--tf-rule`) with `--tf-space-6` above/below — used to divide major
  sections (e.g. Privacy Policy vs Terms of Use on privacy.html).

Page structure that uses it: `<main class="tf-section"> <div class="tf-container"> <div class="tf-prose"> … </div></div></main>`. All colours/sizes from `--tf-*` tokens.

### "In this article" TOC rail (`.tf-toc`) — privacy.html — 2026-07-15

A sticky table-of-contents rail for long-form prose pages. **Defined by
privacy.html; reused by blog posts.**

- **Opt-in, JS-built, soft-fail.** A page opts in by wrapping its `.tf-prose` in
  `<div class="tf-prose-layout" data-toc>`. The shared `assets/toc.js` (a
  separate file, never inline) finds `[data-toc]`, scans the prose for headings,
  generates ids on any heading that lacks one, builds the rail, inserts it
  **before** the prose, and adds `.is-railed`. If the script is absent, fails,
  finds no marker, or finds no headings, the page renders normally with **no
  rail** — the same soft-JS posture as the partials fetch. Pages without
  `[data-toc]` never get a rail.
- **Entries: H2-only by default.** The rail lists the article's **main
  sections (H2)** only — no H3 or deeper. `toc.js` keeps depth capability (the
  marker's value is the heading selector, e.g. `data-toc="h2, h3"`); the pattern
  **default is H2-only** (`data-toc` empty → `h2`). The `.tf-toc-sub` indent
  style is retained for pages that opt into deeper levels.
- **Layout — rail left, prose right, space between.** On desktop
  (`min-width: 820px`) `.tf-prose-layout.is-railed` is a flex row with
  `justify-content: space-between`: a fixed **260px** rail (wide enough that
  short H2 titles rarely wrap) pinned to the container's **left** edge, and the
  `.tf-prose` column (`flex: 0 1 62ch`, keeping its ~640px / ~85-char measure)
  pinned to the container's **right** edge. The flexible space sits **between**
  the two, so there is no orphan space on the far right. **Deliberate
  asymmetry** vs. non-prose pages, whose content just starts at the container's
  left edge.
- **Rail styling.** Sticky (`position: sticky; top: --tf-space-4`) so it stays
  in view while the document scrolls. The left edge is a 2px `--tf-stone-light`
  rule, formed by contiguous `border-left`s on the label + each link. An
  **"IN THIS ARTICLE"** label uses the `.tf-meta` treatment. Links are
  `--tf-ink-soft` at `--tf-text-sm`; deeper entries (`.tf-toc-sub`, unused in the
  H2-only default) indent their text via extra left padding while the border
  stays on the edge. **Hover** → brick text. **Active section** → brick text
  **and** its segment of the edge rule turns brick (`.is-active` sets
  `border-left-color`). Active is tracked by `IntersectionObserver` (last
  heading past a 120px trigger line), with an rAF-throttled scroll/resize
  fallback.
- **Mobile (< 820px): the rail is hidden entirely** (`.tf-toc { display: none }`
  and the layout stays single-column). Chosen over an in-flow block because
  these are linear reads and a section list above the content would cost more
  scrolling than it saves; the headings remain reachable by scrolling.

### Blog post patterns — tag pills, top nav row, rail tags — blog-template.html — 2026-07-15

Patterns for the blog system, defined by the post template; reused by every
post. (This supersedes an earlier same-day version that put pills in the post
header and prev/next as a two-tile row at the post's end — both replaced below.)

- **Tag pills (`.tf-pill`, `-primary` / `-secondary` / `-muted`) — ROUNDED.**
  `border-radius: 999px` (pill shape). **This is a deliberate deviation:** the
  brand's square-corner rule stands for UI surfaces; **pills and the logo bars
  are the two rounded exceptions.** Three states, brand palette only: **primary**
  = filled `--tf-brick` / `--tf-paper` text; **secondary** = brick outline
  (transparent ground, `--tf-brick` text + border); **muted** = `--tf-stone`
  text / `--tf-stone-light` outline. **Colour treatment is current-but-open** —
  it stays within the existing palette for now, pending a possible palette
  extension from Claude Design. Pill padding is a raw `4px 10px`, consistent with
  how the button component sizes its padding.
- **Tags live in the rail (`.tf-toc-tags`).** Above the rail heading, blog.js
  renders a **"Filed under"** `.tf-meta` label + the pills. The pills show the
  **full tag vocabulary** — the alphabetical union of every manifest entry's
  `primaryTags` + `secondaryTags`, derived dynamically — with this post's primary
  tag(s) filled, its secondary tag(s) outlined, and every other vocabulary tag
  muted. **Mobile:** the rail collapses to just this tags block, rendered in-flow
  above the article (the heading + TOC list hide below 820px).
- **Rail heading (`.tf-toc-label`).** "In this article" is now **14px / weight
  500 / `--tf-ink`** (not the meta gray), with a `--tf-space-2` gap before the
  first entry. (toc.js still tags it `.tf-meta tf-toc-label`; the CSS overrides
  the meta treatment. This also applies to the privacy page's rail, which shares
  the pattern.)
- **Top nav row (`.tf-post-topnav` + `.tf-post-pager`).**
  Above the h1: **"← Blogs"** back link flush left (links to `blogs.html`,
  `--tf-ink-soft`, brick on hover) and a **compact "← Previous | Next →" pager**
  flush right, wired by blog.js to the neighbour logic (Previous = next older
  published, Next = next newer). An **absent neighbour renders muted/disabled**
  (`--tf-stone`), **not hidden** — so at n=1 both sides show muted. The old
  bottom prev/next tiles are removed; navigation is top-only.
- **Reading time.** blog.js counts the article's words (excluding the top nav and
  the date meta), divides by ~220 wpm rounding up, and appends `" · N min read"`
  to the date meta line → e.g. `MARCH 5, 2025 · 6 MIN READ`. Computed from the
  DOM independent of the manifest; if the script fails, the baked date renders
  alone.

### v2 merge — Claude Design × site build — 2026-07-16

Merged the codebase v1+ratchet files with Design v1.5 into v2. Everything from both sides kept; conflicts resolved per review:

1. **`--tf-paper` → `#FBFAF8`** (off-white; was #F5F2EE). `--tf-cream` still derives via color-mix and now resolves ≈#ECE7E2.
2. **Pills → the Design kit** (13px / 6px 15px base, solid/outline/tint variants + `.tf-pill-sm`). Blog-tag aliases `-primary/-secondary/-muted` retained on the new base so blog.js is untouched. Tint set resolves the blog build's "pending palette extension" note.
3. **Color copy** → core four inks + data palette (`--tf-chart-1…6`); "no additional hues" retired.
4. **Journey phases** restyled as pills on the shared base (tint-brick / tint-teal); the slate phase color was dropped earlier — slate stays chart-only.
5. New in v2 from Design: card kit, stat grid, quote, logos strip, journey, steps, callouts, profiles, CTA band (ink field), Lucide-only icons, `.tf-photo` treatment.
6. **Defined by Design, pending first use** (no built page consumes these yet — they ship in the sheet so pages can adopt them without re-deriving): the card kit (`.tf-card`, `.tf-card-ink`, `.tf-card-kicker/-title/-body/-meta`, `.tf-card-strong`), `.tf-stat-grid`, `.tf-quote`/`.tf-quote-attr`, `.tf-logos`, the journey stepper (`.tf-journey`/`.tf-journey-step`/`.tf-journey-num`), `.tf-steps`, `.tf-callout`/`.tf-callout-title`/`.tf-callout-body`, `.tf-profile`/`.tf-avatar`, `.tf-cta`, `.tf-photo`, the new pill variants (`.tf-pill-brick`/`-ink`/`-outline`/`-sm`/`-dot`, `.tf-pill-tint-*`), the data-palette tokens (`--tf-chart-1…6`), and the pre-existing base components still unused (`.tf-btn*`, `.tf-lead`, `.tf-stat-value`/`-label`). **In active use today:** the app-shell, container, section, prose (+ intro/meta-divider), TOC rail, nav (+ dropdowns/hamburger), footer band, surface-ink, lockup, kicker/meta/secondary, and the blog pill aliases (`-primary/-secondary/-muted`) + top-nav/pager — exercised by index/shell, privacy, and the blog post. First real use of a pending component records its own ratchet note.
