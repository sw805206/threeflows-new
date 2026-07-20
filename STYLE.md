v016 | last updated: 2026-07-20

# Three Flows Solutions — Brand Style Guide

v016: footer ground — **`--tf-footer-ground`** (`#4A423C`, PROVISIONAL pending Claude Design) added, a dark warm stone so the footer reads distinct from an ink `.tf-cta` stacked directly above it, separated on TONE alone with no seam (ink is retired as a divider, §4); the override is scoped `.tf-surface-ink.tf-footer` (0,2,0) so the shared ink rule is untouched and hero bands stay ink; footer link lightened to `#E68A76` (PROVISIONAL — `--tf-brick-on-ink` is tuned for the ink ground and may not clear contrast on the lighter one), footer-scoped so `.tf-surface-ink` links elsewhere are unchanged; the footer's 2px ink top rule is NOT changed and no hairline is added; known caveat recorded — the reversed lockup's stone bar (`#B8ADA5`) loses some contrast on the lighter ground, flagged for Design to resolve WITH the ground; style only, nothing consumes it yet (the CTA template is parked) (v015: Services two-tier dropdown — **`.tf-dropdown-divider`** added, a VISUAL-ONLY separator that groups the two overview links apart from the four detail links inside ONE flat Services panel (light within-a-section rule per §4 — not sand, not ink; `.tf-has-dropdown` and its `.is-open` state machine reused unchanged, so no nesting, no sub-panel and no second trigger enters the nav); §5's nav header comment corrected, having still described the old flat four-link Services (v014: about.html hero migration — `.tf-page-head` adopted (FIRST multi-band hero, first consumer of the multi-band bridge); **`--tf-page-head-pos`** added — per-page cover-crop focal point, default `center` so `references.html` is unchanged (about sets `center 63%`; NB `background-position` X is inert on this band — `cover` scales 3:2 by width, zero horizontal overflow, so panning is vertical-only); **`.tf-container > :first-child { margin-block-start: 0 }`** — about's `.tf-profile-grid` became the container's first child when the header trio moved into the band, and its 32px top margin ADDED to the section's padding (margin never collapses across padding), rendering 80px where the standard is 48px; blast radius measured at exactly one element on one page, same idiom as `.tf-prose > :first-child`; `assets/images/about.jpg` promoted per §7 (byte-identical, decorative hero no alt per BL-019, bare page-name + inline wiring per BL-020) (v013: header-gap standard reconciled by measurement: hero/plain parity confirmed ALREADY CORRECT at 48px (no rule added — Defect A satisfied as v011 wrote it); **multi-band hero bridge added** (`.tf-page-head + main:not(.tf-section)` → `padding-block-start: 0`, measured 96px → 48px on a multi-band harness, `references.html` unaffected) — v011 resolved the single-band case by SPECIFICITY COLLISION on a shared `<main>`, which does not survive `<main>` wrapping several sections; **plain-page gap RE-ANCHORED on the header block** (`main .tf-container > h1:not(:has(+ .tf-prose-intro))` → 48px) so the gap sits below the LAST header element rather than below the intro specifically — an intro-less page was falling to the h1's 16px; measured across all four cases (plain-with-intro 48→48, plain-without-intro **16→48**, hero 48→48, grandfathered 16→16), applies to 9 intro-less shells incl. `index.html`, mutually exclusive with the intro rule so it cannot double; one open item flagged, not fixed (hero-vs-plain differ by 48px when measured from the intro TEXT, which is v011's "additive by design") (v012: about.html client carousel: `.tf-card-sm` kit-level small-card shell (**bordered** — it sits on the wash band, where paper-on-wash is too narrow a step to go borderless like `.tf-ref-card` does on cream); `.tf-carousel` scroll-snap track with vanilla arrow controls (`assets/carousel.js`), 5-up via a single `--tf-carousel-card-w`, swipe-only below 820px; client cards reduced to logo + **≤2** engagement pills (descriptions dropped); `.tf-icon-brand` — third-party brand marks render in their owner's colour, **superseding** the about-page rule that pinned the LinkedIn mark to ink-soft → brick (v011: post-header gap corrected: `--tf-space-6` (48px) of page-background white space between the header block (band edge on hero pages, intro text on plain pages) and the first content element; a hero band's internal padding frames its own text and does not count toward it (`.tf-page-head + main` back to `--tf-space-6`) — supersedes v10, which measured from the subtitle and removed the hero white gap (v10: tier-1 subtitle rhythm: subtitle→first-content gap standardised to `--tf-space-6` (48px) on every tier-1 page, hero or plain (`.tf-container > .tf-prose-intro`; hero supplies it from the band's bottom padding with `.tf-page-head + main` at 0) — supersedes the band-edge-measured `--tf-space-2` rule (v9: references.html restyle: `.tf-page-head` → full-bleed HERO band (background photo + dark scrim, light-on-dark text, stone-light kicker, ink fallback); tabs → underline idiom (`.tf-tabs` light track + brick active underline, supersedes the ink-boxed control); `.tf-ref-card` → borderless (paper-on-cream contrast) (v8: references.html build: shared `.tf-page-head` (text block + optional header image, tier-1 pattern), segmented tab control (`.tf-tabs` / `.tf-tab`), cream group panels (`.tf-ref-group`) + card grid (`.tf-ref-grid` / `.tf-ref-card`); `--tf-cream` role widened to raised/recessed surfaces generally (v7: blog-004 build: prose tables (`.tf-prose-table` + `.tf-prose table`), the first of the BL-012 deferred body patterns (v6: about.html build: `.tf-profile-lg` principals card (natural-aspect headshots, never cropped — square mandate revoked), wash band tint (`--tf-sand-wash` / `.tf-section-wash`), client-logo slot (original colour), tag→tint mapping (v5: sitewide chrome/divider restyle: ink retired as a section divider (sand `--tf-sand` / `--tf-rule-sand`), white dividerless header (`--tf-white`), dropdown cream lightened to a 15% mix; footer keeps its ink top rule (v4: page-header standard — `.tf-kicker` + h1 on every top-level page. v3: paper token lightened to `#FCFBFA`; blog rail image slot + tag removal; no-italics rule. v2: merge of the site build (v1 + ratchet record) and Claude Design v1.5))))))))))). This package: `style.md` (rules), `style.css` (tokens + components), `logo-mark.svg`, `logo-mark-reversed.svg`.

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
- **Paper `#FCFBFA`** — the ground. Warm off-white; **the page is never pure white.**
- **White `#FFFFFF` (`--tf-white`) — header chrome only.** The one sanctioned use of pure white: the `.tf-nav` band, which reads as chrome floating above the paper page. It is **not** a content ground and never becomes one — "never pure white" still governs every page surface; this is a named exception for the chrome, not a relaxation of the rule. The header carries no bottom rule: the white→paper tone step is what separates it (see §4).
- **Footer ground `--tf-footer-ground` `#4A423C` — footer only. PROVISIONAL.** A dark warm stone, lighter than ink, so the footer reads as its own band when an ink `.tf-cta` sits directly above it. A second named exception to "no additional hues" (alongside `--tf-white`), scoped to one surface and not a relaxation of the rule. **Values are not final** — pending reconciliation in Claude Design, and the token is the wrong shape besides: a hand-picked hex where the idiom is a derived mix (see Cream below). It should be redefined as a computed stone→ink tint once ratified. See §6.
- **Cream `--tf-cream`** — derived overlay tint (≈#F7F5F4 — a 15% stone-light mix into paper) for raised surfaces: dropdowns, popovers, menus. Lightened from the original 50% mix (≈#ECE8E4), which read as a gray slab against the lighter chrome; still a derived tint of existing tokens, not a new raw hue.

Text on brick is always paper. Body-size text in brick should be avoided (contrast) — use it for labels ≥ 14px bold, buttons, and headings only.

### Data palette (charts & category coding)

Six equal-weight series colors, used **in order** — Brick is always the primary series: Brick `#C2291B`, Slate `#35618E`, Ochre `#B07A18`, Teal `#23787A`, Plum `#8A3A62`, Stone `#B8ADA5` (tokens `--tf-chart-1` … `--tf-chart-6`). All sit at the logo's muted saturation. Area fills: the color at 20% opacity with a solid 2px line. Never for body text.

### Pills (v2 kit)

Pills and the logo bars are the two rounded shapes in the brand. Base `.tf-pill` (13px / 6px 15px) +
- `.tf-pill-brick` / `.tf-pill-ink` — solid, status & emphasis
- `.tf-pill-outline` (optionally `.tf-pill-dot`) — filters & states
- `.tf-pill-tint-{brick|slate|ochre|teal|plum|stone}` — category tags (wash bg + deep text of the same hue). This resolves the "pending palette extension" note from the blog build.
- `.tf-pill-sm` — small uppercase modifier (journey phases, compact labels)
- State aliases `-primary` (solid brick), `-secondary` (brick outline), `-muted` (stone outline) — formerly the blog tags; retained as kit, no current consumer (see the rail-image / tag-removal record in §6)

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

**No italics anywhere in the brand** — Space Grotesk ships no italic style, so `em`/`i` render as faux-oblique. Emphasis is `<strong>` or sentence structure. (Testimonials were already never-italic; this generalizes the rule.) `.tf-prose em, .tf-prose i` normalize to upright medium as a defensive net.

---

## 4. Layout & rules

### Rule hierarchy

Three rules, by job. All are 2px — the weight is constant; the **tone** assigns the job. Don't soften any of them into hairlines.

**The tone is a role marker, not a strength ranking.** Sand `#E5DFD7` is *lighter* than light `#DDD6CF` (measured against paper: sand contrasts 1.28, light 1.392), so the major-section divider reads slightly quieter than the within-section rule rather than louder. Accepted deliberately: the page's structure is carried by spacing and the footer's ink line, and a section boundary on this site does not need to shout. Don't "fix" this by darkening sand without revisiting the whole hierarchy — the two rules must stay distinguishable from each other, which is the property that actually matters.

- **Sand 2px (`--tf-rule-sand`, `#E5DFD7`) — divides major sections.** `.tf-section` bottoms and `.tf-prose hr`. This is the standard divider.
- **Light 2px (`--tf-rule-light`, `#DDD6CF`) — divides content *within* a section.** The prose meta line, card borders, stat/journey cell splits, step lists.
- **Ink 2px (`--tf-rule`) — retired as a divider.** It survives in exactly two roles: **component frames** (`.tf-btn-secondary`, `.tf-nav-toggle`, `.tf-stat-grid`, `.tf-journey`, `.tf-card-strong`, `.tf-card-ink`), where it draws the edge of a *thing* rather than a boundary between things; and **the footer's top rule** — the deliberate exception, and now the page's only strong line. Never reintroduce ink as a section divider.
- **The header has no rule at all.** The white→paper tone step separates the chrome from the page (see §2).

`--tf-rule` was **not** globally redefined — component borders are unchanged. A divider is a distinct job with its own token.
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
  *(Superseded — and the `.tf-toc { display: none }` claim was never accurate:
  the sheet only ever hid `.tf-toc-label` and `.tf-toc ul`, leaving `.tf-toc`
  itself in flow. That in-flow rail is what carries the mobile rail image today —
  see the rail-image ratchet note below.)*

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

### Paper lightened — user review — 2026-07-16

`--tf-paper` #FBFAF8 → #FCFBFA (one step lighter, still warm; user decision after comparing candidates). `--tf-cream` follows automatically via its color-mix derivation (now resolves ≈#ECE8E4). No other token or component changes. Supersedes a Claude Design suggestion to add a separate `--tf-ground` token — rejected: the site has no sheet-on-ground layout; the page ground is paper.

### Rail image slot + tag removal — blog post pages — 2026-07-16

Two decisions from the blog layout finalization. **This supersedes the tags half of the "Blog post patterns" record above** (tag pills in the rail, the "Filed under" block, and the mobile tags-only collapsed rail are all retired).

- **Tags dropped from the blog system (user decision).** Removed the rail tags block (`.tf-toc-tags` + its `.tf-pills` rule from `style.css`), the `primaryTags` / `secondaryTags` fields from every `bloglist.json` entry, and the whole tags-rendering path from `blog.js` (label, pills, and the vocabulary union derived across manifest entries). Manifest schema is now `blogID, filename, title, date, status` (+ optional `image`, below). **The pill kit stays in the sheet** — `.tf-pill` and every variant, including the `-primary` / `-secondary` / `-muted` aliases: it is design-kit furniture (the journey stepper consumes the tint + `-sm` variants). The three state aliases currently have no consumer.
- **Rail image slot (`.tf-rail-img`) — defined by the blog post pages.** An optional per-post lede image at the **top of the rail**, above "In this article". **Manifest-driven:** `blog.js` renders it only when the post's entry carries an `image` path; absent field → **no element at all** (no placeholder, no broken image, no gap). Rendered as `<img class="tf-rail-img tf-photo" alt="" loading="lazy">` — `alt` is empty because the image is decorative until per-post alt text ships with the real images; **always carries `.tf-photo`**, so it takes the brand grade like every other content photograph. Treatment: **3:2 crop** (`aspect-ratio: 3 / 2` + `object-fit: cover`), full rail width, square corners, no border, no shadow, `--tf-space-3` below.
- **Placement follows the existing rail, no new layout rules.** Desktop (≥ 820px): it sits inside the sticky `.tf-toc` and travels with it (image → "In this article" → list). Mobile (< 820px): it stays **in-flow above the article**, taking the slot the retired tags block occupied — this needed **no mobile-specific rule**, because the collapsed-rail treatment only hides `.tf-toc-label` and `.tf-toc ul`; `.tf-toc` itself remains in flow. With no image set, the collapsed rail has no visible content and takes no height.

### Layout stabilization — space reservation — blog post pages — 2026-07-16

Kills the vertical shift that made the blog feel unstable: content jumping when the fetched nav landed, and the body starting at a different y on every post. Both fixes are **space reservations in `style.css`** — no page-local styles, no markup changes.

- **Header band (`#tf-header { min-height: 74px }`).** The placeholder is empty until the partials fetch resolves, so the page painted its content at the top and dropped it by a band-height when the nav arrived. 74px is the measured band: `--tf-space-2` (16) + the 40px lockup/hamburger row + `--tf-space-2` (16) + the 2px rule. **One value covers both breakpoints** — desktop and mobile measure identically, because the hamburger button and the lockup mark are both 40px, so no media query is needed. **Soft-fail trade (accepted):** the no-JS / failed-fetch state changes from "no nav, content at top" to "no nav, **empty 74px band** at top". **Known gap:** below ~360px the lockup and hamburger wrap to two rows (real band 130px), so a residual jump remains under that width; not handled — the wrap threshold is font-metric dependent and would misreserve while the webfont loads.
- **Post header (desktop ≥ 820px only).** `main[data-blog-id] .tf-prose > h1 { min-height: 2lh }` and `main[data-blog-id] .tf-prose-intro { min-height: 3lh }` — the h1 and recap are the only variable-height blocks above the body, so reserving them pins the date line, the divider, and the body top to the same y across posts. The `lh` unit is the element's **own rendered line box**, so the reservation tracks the type scale with no recompute (currently h1 2lh ≈ 110.4px, recap 3lh ≈ 76.8px). **`min-height`, not `height`: overflow stays visible** — an over-long title or recap is meant to look wrong so it gets caught, never silently clipped. Scoped to `main[data-blog-id]`, which is **blog posts only** — no hook class was needed and the privacy page's h1/intro are untouched. Below 820px there are no reservations (natural heights).
- **EDITORIAL RULE — titles fit 2 desktop lines, recaps fit 3.** The reservations encode a writing target, they do not enforce it: **titles are written to fit 2 rendered lines at desktop, recaps to fit 3, and the wording is adjusted to keep it.** Check at post-add time (1280px is the reference width); if a title runs to 3 lines, trim the title rather than raise the reservation — raising it re-introduces the shift for every other post.

### Card kit first use + card grid — blogs.html — 2026-07-16

First real use of the card kit defined by Design in v2 ("pending first use" — that note is now discharged for `.tf-card`, `.tf-card-title`, `.tf-card-body`). The blog index renders one card per published post from `bloglist.json`. **The kit was used as-is — no kit rule was changed.** New patterns added alongside it:

- **`.tf-card-grid` — the shared grid for card collections. Intrinsically sized, not breakpoint-driven:** `repeat(auto-fill, minmax(300px, 1fr))` with a `--tf-space-3` gap. The column count falls out of the available measure — 3-up on the full 1200px container, 2-up on tablets, 1-up on phones — so **no new breakpoint enters the sheet's 768/820 vocabulary.** *Why not 768/820:* those two values can't express 1/2/3-up (they'd leave a 52px-wide 2-up band, and 3-up at 820px yields 236px cards — too narrow for a 3:2 cap plus a serif title). 300px is the floor at which a card stays legible; the 1200px container caps the grid at 3 tracks, so cards never stretch thin.
- **Whole-card link (`.tf-card-link`).** Each card is a single `<a>` wrapping image, meta, title, and recap — one tab stop, whole surface clickable, and `imageAlt` carries the image description inside the link. It pins `color: inherit` on hover/focus/active so the card's own type colours hold against the base `a` rules (the same idiom `.tf-lockup` uses).
- **Hover affordance: border light → ink, title ink → brick.** On the index **brick appears only as this hover state** — nothing is brick at rest. Keyboard focus uses the standard `:focus-visible` brick ring.
- **`.tf-card-cap` — the 3:2 image cap.** Flush to the card's inner edges, cancelling the card's `--tf-space-3` padding with negative margins **rather than the kit dropping its padding**; the card's 2px border still frames the image. Carries `.tf-photo` like every content photograph.
- **Usage decision — the kicker slot holds a `.tf-meta` line, not `.tf-card-kicker`.** The card's top line is `DATE · N MIN READ` in the standard meta treatment (12px, uppercase, tracked, **ink-soft**). `.tf-card-kicker` is brick and `.tf-card-meta` is stone and bottom-pinned; neither was rewritten — the index simply uses `.tf-meta` in that slot, keeping the index free of at-rest brick. Both kit classes stand unchanged for other pages.
- **Manifest fields for the index (`recap`, `readMinutes`).** The card's recap is the post's own `.tf-prose-intro` copied verbatim, and `readMinutes` is precomputed with the same scope `blog.js` uses on the post page, so the index and the post always agree. Both are data, not style.

### Page-header standard — all top-level pages — 2026-07-17

Page-header standard — every top-level page opens `.tf-kicker` + h1 (+ intro
where the page has one). Section children carry the section name (Services ×4,
Resources ×4); standalone pages their own name (About, Contact, Surveys);
`privacy.html` predates the rule and keeps its original "Legal" kicker —
grandfathered, not the template. `index.html` deferred to the home page design;
blog post pages excluded (their header is the topnav pattern). No sheet change —
`.tf-kicker` used as-is. On built pages the h1 is a title, not the page name, so
kicker and h1 never duplicate; the echo on placeholder shells is temporary.

### Sitewide chrome/divider restyle — all pages — 2026-07-17

One coherent change to the page's structural lines and chrome surfaces. The site
was built on a single 2px ink rule doing every job — chrome edge, section
divider, component frame — which made every boundary shout equally. This
separates those jobs by tone and leaves ink to the two places it earns.

- **Ink retired as a section divider → sand `--tf-sand` `#E5DFD7`.** Applied
  at the two divider sites only: `.tf-section` `border-bottom` and
  `.tf-prose hr`, both via the new `--tf-rule-sand` (tone token + rule token,
  the same idiom as `--tf-ink`/`--tf-rule` and `--tf-stone-light`/
  `--tf-rule-light`). **`--tf-rule` was
  deliberately NOT globally redefined** — component frames
  (`.tf-btn-secondary`, `.tf-nav-toggle`, `.tf-stat-grid`, `.tf-journey`,
  `.tf-card-strong`, `.tf-card-ink`) keep ink unchanged, because a frame draws
  the edge of a thing, not a boundary between things. **Candidate chosen from a
  live comparison:** `#E5DFD7` (warmer sand, per the approved mock) over
  `var(--tf-stone-light)` `#DDD6CF` (the existing token, no new tone). Reusing
  stone-light would have made the section divider and the within-section rule
  *the same colour*, collapsing the distinction the hierarchy exists to draw;
  the two must differ. The cost is a new raw tone in the sheet, accepted for
  that separation. Known and accepted: sand is lighter than light, so the major
  divider reads quieter than the minor rule — see the §4 note.
- **White dividerless header.** `.tf-nav` background → `--tf-white` `#FFFFFF`
  and its `border-bottom` **removed**: the chrome is separated from the page by
  the white→paper tone step alone. `#FFFFFF` is sanctioned **only** here (§2);
  the page ground stays paper.
- **Header reservation 74px → 72px.** `#tf-header { min-height }` reserves the
  rendered band, and the band lost exactly the 2px of its bottom rule. Left at
  74px it would re-introduce a 2px jump on every partials fetch — the precise
  bug the reservation exists to kill. Still one value for both breakpoints (the
  hamburger and the lockup mark are both 40px); the sub-360px wrap gap noted in
  the original reservation record is unchanged.
- **Dropdown cream lightened — 50% → 15% stone-light mix** (≈#ECE8E4 →
  ≈#F7F5F4, measured in-browser, not estimated). Treatment is otherwise
  **unchanged**: borderless, no shadow, square
  corners, ink items, brick hover. Against the white chrome the 50% mix read as a
  gray slab; at 15% the panel still separates from paper by tone alone.
- **Footer keeps the 2px ink top rule** — the deliberate exception, and now the
  page's only strong line. It is what makes the retirement read as a hierarchy
  rather than an absence.

**Known, accepted:** on placeholder shells the single `.tf-section`'s sandy
bottom divider lands directly above the footer's ink top rule — two 2px lines
stacked with no content between. Pre-existing (it was ink-on-ink, reading as one
4px line); the tone split makes it legible as two. It resolves itself as soon as
a page has more than one section, and the shells are placeholders. Not worked
around in the sheet — a page-structure artifact, not a rule-hierarchy fault.

### Profile first use + wash band + client logos — about.html — 2026-07-17

The about build adds the patterns the page needed. Note it does **not** discharge
the v2 Design "pending first use" note on `.tf-profile` / `.tf-avatar`: the
principals needed a dominant square portrait, so the page built its own
`.tf-profile-lg` variant rather than consuming the small circular kit, which
stays pending a supporting-mention first use elsewhere.

- **Principal card — its OWN pattern (`.tf-profile-lg` + `.tf-headshot`), NOT a
  modifier on `.tf-profile`/`.tf-avatar`.** The two firm principals are the about
  page's *subject*, and the card is deliberately built to **dominate** the client
  cards below it — larger padding (`--tf-space-4`), a 220px portrait, a 21px serif
  name (the client-card title is also serif but smaller). That is the intended
  page hierarchy: principals read first, clients are the supporting grid. Measured
  at 1280px the principal card renders **visibly taller** than a client card,
  confirming the hierarchy holds in layout, not just intent.
  `.tf-profile-lg` is a **column** card: a top row (`.tf-profile-head` — photo left;
  name + credential + LinkedIn + role centred beside it), then the **bio as a
  full-width paragraph below that row** (not a two-column split — the bio spans the
  whole card). `.tf-headshot` is the portrait, rendered at **natural aspect**. The
  base `.tf-profile` / `.tf-avatar` kit stands **unchanged** for supporting-mention
  use on other pages — this variant overrides enough (uncropped rectangle vs
  circle, size, padding, structure) that bending the base would compromise both, so
  it is a separate pattern, not a size modifier.
  - **NATURAL ASPECT, never cropped — square mandate REVOKED.** An interim version
    forced a 160px then 220px **square** slot with `object-fit: cover`; that was
    the cause of repeated top-clipping and is **revoked**. The headshot now uses
    the **original image at its native aspect ratio**: fixed width (220px), height
    auto, no `object-fit`, no fixed-height slot — so the element renders 100% of
    the source frame, all headroom included. Assets are the originals downscaled
    **proportionally** (`440px` wide @2x), never cropped, never upscaled. This also
    **supersedes §2's "profile photos: circle crop"** for principal portraits: an
    uncropped editorial rectangle, not a circle. **Scope:** principal cards only —
    `.tf-avatar` stays a circle for supporting mentions and §2's circle line still
    governs those. The 96px `.tf-avatar-lg` from an earlier pass is **removed and
    must not ship**.
  - **`.tf-photo` grade still applies** (`class="tf-headshot tf-photo"`) — the same
    brand grade as every content photograph, no per-image grading. `alt=""`: the
    portrait sits directly beside the name in text, so a repeated name would be
    screen-reader noise.
  - **Source-background mismatch — FLAGGED, not resolved.** The two originals do
    not match. `twg.png` is a portrait on an **opaque dark-brown studio backdrop**
    (~62% of the frame opaque) with **transparent outer margins** (~36% alpha 0) —
    not a clean cutout; `sw.jpeg` is a portrait on an **opaque light studio
    background**, no alpha. Preserved faithfully (twg exported PNG to keep the
    alpha, sw JPEG) rather than inventing a flatten colour or cropping to the
    subject — so on-page Thomas reads as a dark-backdrop portrait with thin
    paper-showing strips at the extreme edges, and Serena as a light rectangle. This
    is the known background mismatch the user is deciding separately; nothing is
    normalized here without direction.
  - Added with it: `.tf-profile-name` / `.tf-profile-role` for the name + one-line
    discipline; `.tf-profile-head` (the photo + identity row) and `.tf-profile-id`
    (the identity column, vertically centred against the photo); and
    **`.tf-profile-grid`** — 1-up by default, **2-up from 820px** (the site's nav
    breakpoint). A **fixed** breakpoint, not `.tf-card-grid`'s intrinsic auto-fit:
    there are exactly two cards and the pairing is deliberate, so it shouldn't
    reflow to 1-up mid-desktop the way an auto-fit track would on a narrow window.
    **The inline LinkedIn mark is ink-soft → brick on hover, never LinkedIn
    blue** — the palette stays the logo's four inks; an external brand colour would
    be the first hue to breach §2. *(SUPERSEDED 2026-07-18 — see the client-carousel
    note: third-party brand marks now render in their owner's colour via
    `.tf-icon-brand`, a class-scoped exception. The rest of this bullet stands.)*
- **Wash band (`--tf-sand-wash` `#F6F2ED` + `.tf-section-wash`).** A page-width
  tinted ground that separates a major band from its neighbours by **field**
  rather than by a line. **Naming matters here:** `--tf-sand` was already taken
  by the divider *rule* (`#E5DFD7`), and the two are different jobs — a 2px line
  versus a field — so the wash took its own token rather than overloading the
  name. The wash is deliberately **lighter than the rule**, so a tinted band can
  never read as a thick border. `.tf-section-wash` is a modifier on
  `.tf-section`, inheriting the band + container idiom (tint spans the viewport,
  content stays on the shared measure) and keeping its own sand divider. Never
  page-local. First use: the clients band.
- **Client logo slot (`.tf-client-logo` + `.tf-client-logo-slot`).** Logos arrive
  at wildly different aspects (a 0.9:1 square mark next to a 6.5:1 wordmark).
  The slot normalizes them to a common **visual mass**: 32px height with a
  **130px width cap**, contain-fitted, flush left. Wide wordmarks hit the cap and
  render shorter than 32px — **intended**: equal height alone would give a 6.5:1
  wordmark ~7× the area of a square mark. `.tf-client-logo-slot` reserves a
  constant 40px band so copy aligns across a row whatever each logo's fitted
  height. **Asset prep is part of the pattern:** each logo is trimmed of its
  transparent/white padding, then contain-fitted and exported at **2x** into
  `assets/images/clients/`; unprocessed sources stay in
  `assets/images/src/clients/` and are never referenced by a page.
- **Client logos keep their ORIGINAL colour — and this is the CLIENT-CARD rule
  only.** It does **not** touch the trusted-by strip: **`.tf-logos` still
  mandates one-colour ink wordmarks** (§2 "Trusted-by"). The two coexist
  deliberately — a client card identifies a specific engagement, and the brand's
  own colour is the identifier; a trusted-by strip is a texture of names and
  would turn into confetti at full colour. Don't generalize either rule to the
  other.
- **Tag → tint mapping (fixed vocabulary).** The engagement tags use the
  **existing** `.tf-pill-tint-*` set with `.tf-pill-sm`; no new pill or tint was
  added. **Plan = tint-brick · Source = tint-ochre · Launch = tint-teal ·
  Scale = tint-slate · Collab = tint-plum.** This mapping is now the site's
  vocabulary for these five engagement phases: **blog and service pages reusing
  these tags must follow it**, so a reader learns the colour once. A new phase
  takes the next unused data-palette tint; never re-point an existing one.

### Prose tables — blog-amazon-inbound.html (blog-004) — 2026-07-17

First of the four deferred blog body patterns (BL-012). Until now a `<table>` in
prose rendered browser-default and cramped; the post that needed one defines the
pattern in `STYLE.css`, per BLOG.md §9. **The remaining three (`.tf-callout`,
`.tf-stat-grid` first use, disclaimer line) are untouched — BL-012 stays open.**

- **Element-scoped, so a post writes a plain `<table>`.** `.tf-prose table` /
  `th` / `td` follow the same idiom as the existing `.tf-prose ul/ol/hr` rules:
  the post introduces **no class of its own**, which is the rule BLOG.md §3
  states. The one class is the wrapper (below), and it is part of the pattern,
  not post-local styling.
- **`.tf-prose-table` — the scroll wrapper.** `overflow-x: auto` on a wrapping
  `<div>`. Needed because a table **cannot shrink below its content**: at the
  62ch prose measure a three-column table already sits near its floor, and on a
  phone it would otherwise widen the page and give the whole document a
  horizontal scrollbar. Wrapping confines the scroll to the table. No
  `min-width` is set, so a table that fits **never** scrolls — the wrapper is
  inert until the content demands it.
- **Frame ink, internals light — a table is a component, not a section
  boundary.** The outer border is `--tf-rule` (2px ink), which is **consistent
  with the divider retirement, not an exception to it**: ink survives on
  component frames — the edge of a thing (§4) — exactly as on `.tf-stat-grid`
  and `.tf-journey`, whose cell splits are likewise `--tf-rule-light`. Internal
  rules stop short of the frame (`tr > :last-child` drops the right border, the
  last row drops the bottom) so nothing doubles against the 2px edge.
- **Header row = the `.tf-meta` treatment** (12px, uppercase, 0.14em tracked,
  ink-soft) on the paper ground — a column label reads as a label, not as a
  heavier first row of data. **Weight 500, not the UA's bold:** `.tf-meta` sets
  no weight, and bold at 12px tracked reads as shouting. Same judgement as the
  blog index, which puts `.tf-meta` in the card's kicker slot rather than
  reaching for a louder treatment.
- **Body cells `--tf-text-sm`, padding `--tf-space-1` / `--tf-space-2`,
  `vertical-align: top`, flush left, square corners.** Top alignment because
  cells in a prose table hold sentences of unequal length, and centring them
  ragged-tops a row.
- **No zebra striping, no hover.** The table is read, not operated — there is no
  row action, so a hover state would signal an affordance that isn't there, and
  striping would add another tone to a palette that separates jobs by a tone
  each. Row separation is the light rule's job.

### Heading wrap balance→pretty — blog-004 review — 2026-07-17

The `h1–h4` rule carried `text-wrap: balance`; changed site-wide to
`text-wrap: pretty`. One property on one rule — no other change.

- **Why.** `balance` evens out the line lengths of a multi-line heading, which
  pulls the **first line in narrower** than the available measure. Surfaced
  during the blog-004 review on the ONT8 h2 ("The ONT8 Lesson: What "Dirty"
  Freight Costs"), whose first line balanced short of the body measure and read
  as an awkwardly early wrap against the prose beneath it. `pretty` instead lets
  the first line **fill to the measure** and only optimises the **last** line
  (avoiding a lone short word), which is the behaviour a left-aligned editorial
  heading over running prose wants.
- **Scope.** `h1–h4` (every heading). `p` already used `pretty`; the two now
  agree, so headings and body copy wrap on the same principle.
- **Trade-off, accepted.** `pretty` gives up `balance`'s evened multi-line
  shape, so a heading can end on a slightly shorter last line — a small orphan
  risk. Accepted: filling the first line to the measure matters more for a
  flush-left heading than an evened silhouette, and `pretty`'s own last-line
  optimisation keeps the orphan case rare.

### References directory — hero header, underline tabs, cream panels, borderless cards — references.html — 2026-07-17 (restyled 2026-07-18)

The References directory (a tabbed link index rendered by `assets/references.js`
from `references.json`) needed four patterns. All are in `STYLE.css`, never
page-local, and reuse existing tokens except two literal card sizes (17px name,
13px body — the same posture as `.tf-quote`). **The 2026-07-18 restyle replaced
three of them** (side-image header → hero band, ink-boxed tabs → underline,
bordered cards → borderless); the cream group panel is unchanged.

- **`.tf-page-head` — SHARED tier-1 HERO band (supersedes the earlier
  side-image flex row).** A **full-bleed band placed ABOVE `<main>`**: a
  background photo under a **dark scrim gradient**, with **light-on-dark text**
  (kicker / h1 / intro) held in a `.tf-container`. The photo is per-page, passed
  as the `--tf-page-head-img` custom property so the shared sheet carries no page
  image URL; **`background-color: var(--tf-ink)` is the MANDATORY fallback** if
  the image fails to load. **The kicker is `--tf-stone-light` here, NOT brick** —
  brick is reserved for light grounds (hero-only rule); the h1 is paper, the
  intro is paper at 85% opacity capped to 62ch. **Scrim = directional**
  (`linear-gradient(90deg, ink .82 → .72 @38% → .35)`), chosen over a uniform
  flat `.62` scrim so the text sits in the darkest (left) band; the alternative
  was compared on the real photo at review. **Image-less tier-1 pages render the
  SAME band as a solid-ink field** (the scrim over the ink fallback), never a
  plain light header — so every tier-1 page opens on the same dark band. This
  also supersedes the v4 bare kicker+h1 opener.
  **Post-header gap = `--tf-space-6` (48px) of page-background white space
  between the header block and the first content element. Header block = band
  edge on hero pages, intro text on plain pages. A hero band's internal padding
  frames its own text and does not count toward this gap.** The band framing and
  the post-header gap are therefore **additive by design** on hero pages, not
  alternatives. Implementation: plain pages carry the gap on the header intro
  (`.tf-container > .tf-prose-intro`), so it lives with the header pattern rather
  than on whatever content follows; hero pages carry it on `.tf-page-head + main`
  (`padding-block-start: var(--tf-space-6)`), measured from the band edge. The
  hero intro's own bottom margin is zeroed (`.tf-page-head .tf-prose-intro`) so
  the band frames its text symmetrically — 48px above the kicker, 48px below the
  intro — which is band framing, separate from the gap. **Scoped to the header
  intro (a DIRECT child of the page container)**, so the long-form recap inside
  `.tf-prose` — blog posts, privacy — keeps its own 16px rhythm untouched (the
  blog post body-top reservation in BLOG.md §5 depends on it).
  *(Supersedes two earlier attempts: the band-edge-measured `--tf-space-2` rule,
  and the subtitle-measured rule that set `main` to `0` and so removed the hero
  page's white gap entirely.)*
- **Tabs (`.tf-tabs` / `.tf-tab`) — the underline idiom (supersedes the ink-boxed
  segmented control).** A full-width strip on a **paper ground** sitting on a
  **light baseline track** (`border-bottom` 2px `--tf-stone-light`); each
  `<button>` is `flex: 1`, left-aligned, 15px / 500 in `--tf-ink-soft`, with a
  transparent 2px bottom border pulled onto the track (`margin-bottom: -2px`).
  **Active = ink text, 700, a 2px brick underline sitting ON the track**; hover =
  brick text; `:focus-visible` brick ring; `aria-selected` + hash deep-linking
  unchanged. A **24px gap** (`--tf-space-3`) separates the strip from the first
  group panel. **Distinct from the pill kit AND from underlined prose links** —
  the brick line is a selected-state marker, not a hyperlink affordance.
- **`.tf-ref-group` / `.tf-ref-group-label` — cream group panel.**
  `background: var(--tf-cream)`, `--tf-space-3` padding, with an uppercase
  meta-style label. **This WIDENS `--tf-cream`'s stated role.** Until now cream
  was defined for *overlay* surfaces (dropdowns, popovers — things floating
  *above* the page). Here it grounds a **recessed content panel** in the page
  flow. The role is therefore restated: **`--tf-cream` is the tone for any
  raised OR recessed surface that must separate from the paper page by tone
  rather than by a rule** — overlays above, grouping panels within. Still a
  derived tint of existing tokens (§2), not a new hue; the palette stays closed.
- **`.tf-ref-grid` / `.tf-ref-card` — card grid on the panel.** `auto-fill,
  minmax(250px, 1fr)`, `--tf-space-2` gap — intrinsically sized, no new
  breakpoint. Each card is a **BORDERLESS small paper card** (`--tf-paper` on the
  cream panel; the earlier 2px light border was removed in the 2026-07-18
  restyle) — **the paper-on-cream surface contrast carries the separation**, at
  rest and on hover alike. `--tf-space-2` padding; a head row (**20px favicon +
  17px serif name**), a **13px ink-soft** description, and the **action word
  pinned bottom-right** (13px / 500, ink-soft, **no arrow**). The **whole card is
  one `<a>`** carrying `.tf-card-link` (colour pinned to inherit); on hover the
  **name and action go brick** (no border appears). Favicons are the Google s2
  service (`sz=32`, lazy) with an `onerror` that hides a blocked glyph rather
  than showing a broken image.

### Client carousel + small-card shell + brand-mark rule — about.html — 2026-07-18

The clients band moved from a 13-card grid to a horizontal carousel. Three
patterns entered the sheet; one older rule is superseded.

- **`.tf-card-sm` — a kit-level small-card SHELL, built fresh.** Container
  properties only (flex column, `--tf-space-1` gap, `--tf-space-2` padding, paper
  ground, 2px light border); contents are the consumer's business. **It keeps its
  border, and the ground is why.** `.tf-ref-card` is borderless because it sits on
  the cream panel, where paper-on-cream carries the separation; this shell sits on
  the wash band (`--tf-sand-wash` `#F6F2ED`), a narrower step from paper, so the
  border does the defining. **The surface decides the border, not the card size.**
  - **DEFERRED GENERALIZATION (tracked, not silent):** `.tf-ref-card` duplicates
    these same five container properties and **should fold into `.tf-card-sm` the
    next time references.html is touched.** Not done in this commit — refactoring
    it would pull a page that shipped the day before into this change's blast
    radius, and the duplication is five lines. Whoever next opens references.html
    owns the merge.
- **`.tf-carousel` — a CSS scroll-snap track.** Horizontal flex row,
  `scroll-snap-type: x mandatory`, `scroll-behavior: smooth`, native scrollbar
  hidden. **The scrolling is CSS, not JS:** touch, trackpad, and keyboard all work
  with `assets/carousel.js` absent — the script adds only the arrows. Same soft-JS
  posture as the partials fetch and `toc.js`. **The row is TWO variables** —
  `--tf-carousel-card-w` (208px ≈ 5-up on the 1136px inner container, ~260px ≈
  4-up) and `--tf-carousel-card-h` (160px, ≈ 4:3 against that width) — so
  re-pitching it is a one-value change either way, deliberately, because density
  is a review decision. **Card height is FIXED, not content-derived:** a uniform
  row reads as a gallery, and the surplus height becomes deliberate space between
  the logo (top) and the pills (bottom, pinned by `.tf-card-sm > .tf-pills`)
  rather than ragged card bottoms — so a 1-pill and a 2-pill card share a
  baseline. **Below 820px** (the nav breakpoint, reused — no new breakpoint) the
  arrows hide and the card goes 75vw so the next card peeks: swipe-only.
- **Arrows (`assets/carousel.js`, `.tf-carousel-arrow`).** Vanilla, own file, per
  SCOPE. One **card** per click (measured from the DOM, so it follows the width
  variable and the mobile 75vw for free), not one page. No auto-advance, no
  timers. An arrow at the end of its travel goes **muted, not hidden** — the blog
  pager's absent-neighbour idiom. Real `<button>`s: focusable, standard
  `:focus-visible` brick ring. Square and borderless, ink → brick on hover; the
  brand has no circular buttons. `prefers-reduced-motion` jumps instead of gliding.
  **They FLANK the track** — one each side, vertically centred on the card row —
  and sit in `.tf-container`'s own gutter, never over the cards. The size follows
  from that: the control is `--tf-space-4` (32px) at a −32px offset, so its lane
  is *exactly* the container's padding lane and it can neither clip the outermost
  card nor force horizontal overflow. A 40px arrow at −40px would overflow the
  viewport around 820px, which is why the control is 32px and not larger. The nav
  wrapper is `display: contents`, so the buttons position against
  `.tf-carousel-wrap` with no markup change; the wrap carries the row's top margin
  so `top: 50%` centres on the cards without discounting it.
- **Client cards lost their descriptions and are capped at 2 pills.** A carousel
  card is a glance, not a read: logo + up to two engagement tags. **The note #17
  tag→tint mapping is UNCHANGED and still governs** (Plan=brick · Source=ochre ·
  Launch=teal · Scale=slate · Collab=plum) — about simply stops *showing* three or
  more; blog and service pages keep the full vocabulary.
- **`.tf-icon-brand` — SUPERSEDES the LinkedIn-blue prohibition.** The about-page
  note previously pinned the principals' LinkedIn mark to ink-soft → brick,
  "never LinkedIn blue". That is now reversed for **third-party brand marks**:
  they render in **their owner's colour** (LinkedIn `#0A66C2`, `#004182` pressed),
  the one sanctioned non-palette hue, **scoped to a class so it cannot leak** onto
  brand surfaces. Written as `a.tf-icon-brand` — the *same* specificity as
  `.tf-profile-name a`, winning on source order rather than escalated specificity,
  so a future more-specific rule can still override it. The palette itself is
  unchanged: this is a named, contained exception, not a new brand colour.

### Header-gap standard reconciled — measurement pass, all tier-1 pages — 2026-07-19

Audit of the post-header gap across every tier-1 page, by **rendered measurement**
at 1265×900 rather than by reading the rule — each case measured with the rule
toggled in place, so before and after come from the same render. Three defects
were considered; **one was already satisfied, two were real and are fixed here.**

- **DEFECT A — hero vs plain parity: ALREADY SATISFIED, no rule added.** Measured
  from the visual bottom of the header block as v011 defines it (**band edge** on
  hero pages, **intro box** on plain pages), the gap is **48px on both**:
  `references.html` (hero) 48.00px band-edge → first content; `blogs.html` (plain)
  48.00px intro-box → first content. They already agree to the pixel, so **no rule
  was added for Defect A.** The v011 implementation is correct as written.
- **DEFECT B — multi-band hero bridge: REAL, fixed.** `.tf-page-head + main`
  resolves to 48px only because `references.html` puts `.tf-section` on `<main>`
  **itself** — both declarations then land on the SAME element and the more
  specific one wins. That is resolution **by collision, not by design**, and it
  does not survive a multi-band page: `<main>` wrapping several
  `<section class="tf-section">` puts the two paddings on DIFFERENT elements,
  where they **add — measured 96px** on a synthetic multi-band harness. Fixed with
  `.tf-page-head + main:not(.tf-section) { padding-block-start: 0 }` (specificity
  0,2,1, so it beats the base rule regardless of source order), handing the gap to
  the first section's own top padding: **measured 96px → 48px**, identical to the
  single-band geometry. **Zero current consumers** — no page ships a multi-band
  hero yet; this fixes the standard AHEAD of the first one (about, then blogs and
  the service pages). Verified `references.html` is **unaffected**: its `<main>`
  carries `.tf-section`, so `:not()` excludes it — still 48px, padding still 48px.
  *Caveat recorded:* the 48px is then coloured by the first section's ground.
  Paper (the expected case) is indistinguishable from page background; a hero page
  opening onto a **wash** band would tint the gap and should lead with a paper band.
- **DEFECT C — the plain-page gap re-anchored on the HEADER BLOCK: REAL, fixed.**
  v011 hung the plain-page gap on the INTRO (`.tf-container > .tf-prose-intro`),
  so a page whose header block ends at the **h1** had no rule supplying it and fell
  through to the h1's own 16px. **The gap belongs to the header block, not to the
  intro: it is 48px below the LAST header element, whichever that is.** Added
  `main .tf-container > h1:not(:has(+ .tf-prose-intro)) { margin-bottom:
  var(--tf-space-6) }` — an h1 **not** followed by an intro carries the 48px itself.
  **The two rules are mutually exclusive by construction** — `:has(+ .tf-prose-intro)`
  is precisely the case the intro rule already covers — so they can never stack and
  double. Scoping does the rest: `main …` excludes a HERO h1 (it lives in the band
  OUTSIDE `<main>`, where band padding frames it — verified the hero h1 stays at
  16px), and `.tf-container >` keeps v011's direct-child scoping, so an h1 inside
  `.tf-prose` (privacy, blog posts) keeps its own 16px rhythm.
  **Measured, all four cases, before → after:** plain **with** intro (`blogs.html`)
  48 → **48 unchanged**, rule does not match; plain **without** intro
  (`contact.html`) 16 → **48, the fix**; hero (`references.html`) 48 → **48
  unchanged**, rule does not match; grandfathered (`privacy.html`) 16 → **16
  unchanged**, rule does not match. Full-site sweep: the rule applies to **nine**
  pages, all 16 → 48 — the eight placeholder shells (contact, seminars, surveys,
  tools, service ×4) **plus `index.html`**, whose deferred home-page shell is also
  intro-less. `about.html`, the blog posts and `blog-template.html` are untouched.
  **`:has()` is used here for the first time in this sheet** — baseline-supported
  since 2023, and the alternative (a margin on the *following* sibling, relying on
  margin collapse) was rejected as more fragile and less parallel to the intro rule
  it sits beside.

**OPEN — not fixed here, needs a decision.** One item remains from the measurement:

- **Measured from the intro TEXT, hero and plain differ by exactly 48px** —
  `references.html` 96px intro-box → content (48 band padding + 48 gap) versus
  `blogs.html` 48px. This is **v011's stated "additive by design"**, working as
  specified, and is the most likely candidate for the discrepancy noticed when
  flipping between the two pages. Whether the hero's header block *should* sit
  twice as far from its content as a plain page's is a **design decision, not a
  bug** — reversing it would supersede a rule one day old, so it is left standing
  and flagged rather than changed.

### about.html hero migration — first multi-band hero — about.html — 2026-07-19

about.html adopts the shared `.tf-page-head` hero band, replacing its v4 bare
kicker+h1 opener. **It is the FIRST multi-band hero on the site**, so it is the
first page to exercise the bridge added earlier today — and exercising it exposed
one further gap. The header trio (kicker / h1 / intro) moved verbatim out of
BAND 1's `.tf-container` into a `<header class="tf-page-head">` placed before
`<main>`, exactly as `references.html` does. BAND 1 now opens directly on
`.tf-profile-grid` with **no heading** — deliberate: the hero labels the page.

- **`--tf-page-head-pos` — per-page cover-crop focal point (NEW).** The band
  renders WIDE and SHORT, so `cover` discards most of a 3:2 photo's height — at a
  ~238px band on a 1265px viewport only the **middle 28.17%** survives. `center`
  is right only when the subject sits mid-frame. about's photo has its subjects
  **below** centre, and `center` cut them off at chest height. Added
  `background-position: var(--tf-page-head-pos, center)` so a page can aim that
  window **without a page-local style** (SCOPE forbids those), exactly as
  `--tf-page-head-img` carries the photo. **Default `center` = the shipped
  `references.html` behaviour, verified unchanged at `50% 50%`.** about sets
  `center 63%`.
  *Recorded because it is counter-intuitive:* **`background-position` X does
  nothing on this band.** `cover` scales a 3:2 image by WIDTH here (the box is far
  wider than 3:2), so the scaled image matches the box width exactly — **zero
  horizontal overflow**, and 606px vertical. Panning is a VERTICAL-only control;
  moving a subject sideways requires re-cropping the source, not a position value.
- **`.tf-container > :first-child { margin-block-start: 0 }` (NEW).** A first
  child's top margin **adds to** the section's padding rather than collapsing into
  it (margin never collapses across padding), so the band's top framing silently
  exceeds `--tf-space-6`. Surfaced the moment about's header trio left BAND 1 and
  `.tf-profile-grid` (margin-top 32px) became the container's first child:
  **measured 80px where the standard is 48px.** Zeroed so the section's padding
  alone owns that edge — **same idiom and same reason as `.tf-prose > :first-child`**,
  which already existed for the identical problem one level down. Blast radius
  measured across all 14 pages before landing: **exactly one element on one page**
  (about's profile grid) — every other `.tf-container` first child already carried
  a zero top margin, so nothing else can move. Gap measured back to **48px**.
- **Image promoted per BLOG.md §7 — `assets/images/about.jpg`.** Master
  `/Users/swai/Images/jumping-02.jpg` (5667×3778, exact 3:2) read **read-only**;
  preview exported by pure downscale (no upscale), then re-cropped at the user's
  request to push the group rightward, and the **approved bytes promoted
  byte-identically** (sha256 verified, never re-processed) to a committed
  1200×800 q82 EXIF-stripped file. **Decorative hero, NO alt** — a CSS
  `background-image` structurally cannot carry alt text and the h1 is the
  accessible heading, per **BL-019**; naming (`about.jpg`, bare page name) and
  wiring (inline `--tf-page-head-img`, no manifest) follow the `references.jpg`
  precedent per **BL-020**. Both rows remain open pending the §7 doc edit.
  *Known constraint, recorded deliberately:* the approved crop is tuned tight —
  the visible strip equals the subject height with **no vertical spare**. A
  TALLER band (narrower viewport, wrapped headline) shows more and is safe; a
  SHORTER band would clip feet. Nothing on the page shortens it today, but hero
  copy edits should re-check the crop.

### Services dropdown divider — Services two-tier nav — 2026-07-20

The Services restructure (SCOPE.md → Site structure) grows the panel from four
links to six and asks for the two overview links (Pathfinder, Runningmate) to
read apart from the four detail links (Plan, Source, Launch, Grow). The sheet
carried no way to divide items *inside* a dropdown, so one pattern was added.
**Style only — no markup ships in this change**; the nav rewrite is a separate
job, and until it lands nothing on the site consumes this class.

- **`.tf-dropdown-divider` — a visual separator between runs of links in ONE
  panel (NEW).** `border-top: var(--tf-rule-light)` with `margin-block:
  var(--tf-space-1)`, spanning the panel edge to edge. `border: none` precedes it
  so the class normalizes a bare `<hr>` as readily as a `<div>` — the markup job
  can pick either without a second rule.
- **"Two-tier" is VISUAL, not structural — the distinction this entry exists to
  record.** The divider groups; it does not nest. Both runs stay in the same
  `.tf-dropdown`, under the same `.tf-nav-trigger`, inside the same
  `.tf-has-dropdown` — **`.is-open` and the nav script are reused completely
  unchanged**, and the panel remains one flat list to the script, the keyboard
  and the screen reader. No sub-panel, no second trigger, no nested state.
  A future "expanding sub-menu" is a different pattern and a different decision;
  it must not be grafted onto this class.
- **Light rule reused, not a new tone (§4).** `--tf-rule-light` is *by definition*
  the rule that divides content within a section, which is exactly this job — the
  panel is one surface, and the divider separates content inside it. **Sand**
  (`--tf-rule-sand`) is reserved for major section boundaries and would overstate
  a grouping inside a 6-item menu; **ink** is retired as a divider outright. No
  new token, no new hue, no hard-coded hex — the whole pattern is three
  declarations off existing tokens.
- **Resources is untouched.** It keeps its four undivided links; the divider is
  opt-in per panel, placed by markup, so no existing dropdown changes.
- **§5's nav header comment corrected.** It still described "two dropdown groups
  (Services, Resources)" against the old flat four-link Services. Comment text
  only — **no rule was altered by that fix.**

### Footer ground — separating the footer from an ink CTA — 2026-07-20

The CTA band (`.tf-cta`) is an ink ground, and so is the footer
(`.tf-surface-ink`). Stacked directly — which the CTA template will do once it
ships — the two merge into a single undifferentiated dark slab with the footer's
2px ink top rule invisible inside it. The fix separates them on **tone**: the
footer takes a darker-warm stone ground, lighter than ink, so the boundary is
legible without drawing anything at it. **Style only — no page currently stacks
the two**; the CTA template is parked, so nothing on the site consumes this yet.

**⚠ PROVISIONAL — pending Claude Design.** Both values below are working
placeholders chosen to prove the approach, not ratified brand colors. They may
be revised and brought back here as a follow-up. Nothing else should be built on
these hexes in the meantime.

- **`--tf-footer-ground: #4A423C` — a dark warm stone (NEW, PROVISIONAL).** A
  named exception to §2's "no additional hues," scoped to a single surface, in
  the same spirit as `--tf-white` for chrome. **It is knowingly the wrong shape:**
  a hand-picked hex, where this sheet's idiom for a derived surface is a computed
  mix off existing tokens (`--tf-cream` is the model). Once Design ratifies the
  target it should be **redefined as a computed stone→ink derived tint**, not
  kept as this literal.
- **The override is footer-scoped, and that is the point.** The footer carries
  both classes (`<footer class="tf-surface-ink tf-footer">`), so it inherited its
  ink ground from the shared rule. `.tf-surface-ink.tf-footer` (0,2,0) replaces
  that ground **without touching `.tf-surface-ink` itself**, so hero bands — the
  other consumer — stay ink. Specificity rather than source order, so the
  override survives the sections being reordered.
- **Footer link `#E68A76` — a lightened brick (PROVISIONAL).**
  `--tf-brick-on-ink` (`#D4402C`) is tuned for the *ink* ground and may not clear
  contrast on the lighter one. Scoped to the footer, so `.tf-surface-ink` links
  elsewhere keep the standard treatment. **Not contrast-measured** — an eyeball
  judgement until Design ratifies it together with the ground. Hover stays paper,
  inherited.
- **No seam, by design.** No hairline, no divider, no border between the CTA and
  the footer: the tone step *is* the separation. Adding a rule would double the
  signal, and ink is retired as a divider anyway (§4).
- **The footer's existing 2px ink top rule is unchanged** — it still marks the
  footer against a *paper* page, which is the common case and the reason it
  exists (§4).
- **⚠ Known caveat — the logo's stone bar loses contrast.** The reversed lockup
  (`logo-mark-reversed.svg`) carries a stone bar (`#B8ADA5`) sized against the
  ink ground. On the lighter footer ground that step narrows and the bar reads
  softer. Accepted for now as part of the provisional state, and flagged here so
  Design resolves it **with** the ground rather than discovering it after.
