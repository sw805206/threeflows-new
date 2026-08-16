v001 | 2026-08-14 | 109 lines

# Three Flows Solutions — Design Tokens

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

The **core palette** is the logo's four inks; charts and tags may draw on the data palette below. Two named surface exceptions — `--tf-white` (header chrome) and `--tf-footer-ground` — are scoped, not relaxations. The data palette is fully tokenized in both halves: `--tf-chart-1…6` (series), `--tf-wash-*` (pale category grounds) and `--tf-wash-*-ink` (the deep same-hue text that pairs with each wash). **Tokenizing added no hue** — every `--tf-wash-*-ink` carries a value the `.tf-pill-tint-*` rules already used as a literal, and two of the six alias core inks outright (`-brick-ink` = `--tf-brick-dark`, `-stone-ink` = `--tf-ink-soft`). The four inks remain the core; these are named handles on colours already in the palette, not an extension of it.

- **Brick `#C2291B`** — brand accent. Primary actions, kickers, emphasis. Use sparingly; most of the page is ink on paper. Hover/pressed: `#8F1E12`. On ink backgrounds use `#D4402C`.
- **Ink `#26221F`** — body text, 2px rules, dark surfaces (footer, hero bands). Secondary text: `#55504D`.
- **Stone `#B8ADA5`** — supporting tone: meta text, chart fills, muted labels. Light borders: `#DDD6CF`.
- **Paper `#FCFBFA`** — the ground. Warm off-white; **the page is never pure white.**
- **White `#FFFFFF` (`--tf-white`) — header chrome only.** The one sanctioned use of pure white: the `.tf-nav` band, which reads as chrome floating above the paper page. It is **not** a content ground and never becomes one — "never pure white" still governs every page surface; this is a named exception for the chrome, not a relaxation of the rule. The header carries no bottom rule: the white→paper tone step is what separates it (see §4).
- **Footer ground `--tf-footer-ground` — dark warm-stone field. RATIFIED.** `color-mix(in srgb, var(--tf-ink) 75%, var(--tf-stone))` ≈ `#4A4540` — a dark warm stone, lighter than ink, so the footer reads as its own band when an ink `.tf-cta` sits directly above it, separated on tone alone. A derived mix per the cream idiom, not a raw hue. **Scope now covers two surfaces:** the footer, and the home band-4 **Runningmate** program header (`.tf-card-ink-soft`), where it separates the second program group from the ink Pathfinder header on tone alone — the same tone-not-a-line idiom. (This widens the earlier "footer only" wording.) Footer links: `color-mix(in srgb, var(--tf-brick-on-ink) 45%, var(--tf-paper))` ≈ `#EBA89E` (~4.8:1 measured). See §6.
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
- **Trusted-by** — `.tf-logos`; names in stone. **Client logos may appear in original brand colour** in two contexts — the about-page client carousel and the home-page trusted-by strip (`.tf-logos`). This corrects the earlier "one-colour ink wordmarks only" wording, which the shipped about carousel already contradicted, and extends the allowance to the home strip. Ink/text wordmarks remain the fallback for any logo without a usable colour asset (e.g. the ArtSabers case). Trimmed logo variants (`-trim`) are permitted for the strip where the padded carousel canvases would render unevenly.
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

**Heading capitalization is per level** — h1 and h2 use conventional (Chicago-style) Title Case: capitalize the first and last word and all principal words; lowercase articles (a, an, the), coordinating conjunctions (and, but, or), and prepositions regardless of length (to, from, of, in, on, with, through…). h3 uses sentence case: capitalize only the first word and any proper nouns. Casing is AUTHORED IN THE MARKUP, not applied via CSS `text-transform` (which cannot lowercase function words or selectively case by level). Proper nouns, acronyms, and product/brand names keep their own capitalization at every level. Kickers/meta remain uppercased via their own class and are unaffected. **Exception — confirmation/UI feedback headings** (the `.tf-form-success` `.tf-callout` title, "Thank you") are **sentence case despite being an h2**, because they are UI feedback, not section headings; a heading audit must not "correct" them to Title Case.

**Currency and percent take the figure test** — the SYMBOL when it is bound to a specific figure ($25,000, 12.5%, $0), the WORD when there is no figure ("your first dollar back", "a percentage of revenue", "the dollar amount", "the percentage increase"). Tables, form labels, UOM slots, chart axes, chart legends and tool output always take the symbol. A spelled-out number carrying its unit is an approximation, not a price point, and stays in words: "roughly seven to ten dollars per user per month" (`blog-google-workspace.html`) is correct as written — `$7–10` would give it a precision the copy deliberately avoids — recorded here so it is not re-litigated. The form-label clause covers the LABEL only; the explain-note prose beneath a field is running prose and takes the figureless test, which is why "Of the leads you approach, the percentage that become paying clients." (`tool-general-cashflow.html`) is correct as a word directly under a field whose UOM slot renders `%`. **Exception — alt text is exempt.** Alt strings spell out what the visible prose symbolises ("1 to 150 pounds", "Zones 2 to 8") as a deliberate screen-reader convention, and a copy audit must not flatten it.

**The multiplication sign is `×`** — used for dimensions (L × W, 18 × 18, weight × zone), for grid names (2×2, 3×3, 1×1), and for multipliers (10× ex-factory, 4× cost). All three are house style. This records existing practice; nothing on the site is out of compliance.

**Ampersands belong in abbreviations, labels and headings** — `&` is correct in closed abbreviations (P&L, R&D, E&O, Q&A), in chart series and table row labels (Shipping & Tariff, Return & Discard), and in navigation, section and group headings (Privacy & Terms, Logistics & Ops). Everywhere else in running prose, write "and". **Carve-out — `references.json` card descriptions** use `&` inline as a compression habit ("tariff & trade", "ACH & wires"); those are data fields, not running prose, and are OUT OF SCOPE of this rule. They are not violations — do not normalise them.

**Ranges are the author's choice — a decision, not an omission.** This guide takes no position on hyphen vs en dash in a numeric range. The known state is recorded so a future audit reads the silence as settled rather than missed: 66 en-dash ranges across 12 files, and 8 hyphenated ranges confined to `blog-unit-economics-2-vs-20.html`, deliberately left as they are.

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
