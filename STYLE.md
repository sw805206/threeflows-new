v049 | 2026-08-01 | 2465 lines

# Three Flows Solutions — Brand Style Guide

v038: `.tf-fit-*` now consumes the tint ink tokens (refactor/fit-tokens, paired with STYLE.css v042, same commit per SCOPE.md). Pure refactor — no colour value changed; the six `.tf-fit-you/-assist/-we` declarations drop their raw hex for `--tf-wash-{brick|ochre|teal}-ink`, closing the last known duplicate of those three values and completing the follow-up v037 deliberately left out of scope. See the 2026-08-01 ratchet entry. (v037: category tint TEXT tokenized (refactor/tint-tokens, paired with STYLE.css v041, same commit per SCOPE.md). Pure refactor — no colour value changed; the six `.tf-pill-tint-*` deep-text literals became `--tf-wash-*-ink` tokens so int-stylebook.html self-reads both halves of every pairing. See the 2026-07-31 ratchet entry. (v036: tool-company-setup.html build (feat/tool-company-setup, paired with STYLE.css v040, same commit per SCOPE.md). See §6 "Company setup tool" for full detail. (v035: Contact success block HIDDEN-UNTIL-SUBMIT fix (paired with STYLE.css v039, same commit per SCOPE.md). Since the v033 reskin made `.tf-form-success` a `.tf-callout` (which sets `display:flex`), the block's `[hidden]` attribute was DEFEATED — the "Thank you" success block rendered ON PAGE LOAD, beneath the Send button, before any submit. A regression: v033 added a `.tf-form[hidden]` guard for the form but no matching one for `.tf-form-success`. CSS-only fix: add `.tf-form-success[hidden] { display: none }` — the same guard idiom as `.tf-form[hidden]` / `.tf-ref-panel[hidden]` — so the DEFAULT hidden state holds without JS (and even if JS errors), while the swap JS still clears `[hidden]` to reveal the block on a successful submit. The `hidden` attribute in the markup and the submit handler were already correct; only the CSS guard was missing. Block stays borderless (the v034 instance override) — unchanged. (v034: Contact success callout goes BORDERLESS + Brief description now required (paired with STYLE.css v038, same commit per SCOPE.md). (1) The submit-success block (`.tf-form-success`) drops `.tf-callout`'s `--tf-rule-light` border for THIS instance only — a `border: none` on the existing `.tf-form-success` override (later source order, equal specificity), so the base `.tf-callout` frame is UNCHANGED and every other callout (intake, business-planning painpoints/solves) keeps its border; the success block becomes paper-on-paper, defined by the brick check-circle icon + spacing alone. No new token / colour / pattern. (2) `contact.html` makes the Brief description textarea a REQUIRED field: the label gains the same `.tf-required` brick asterisk as First name / Email, the textarea gains `required` + `aria-describedby`, and `assets/contact-form.js` blocks submit on an empty message using the EXISTING `.tf-field-error` + `aria-invalid` treatment (reused, not new); the "* required" note is unchanged. Markup + JS only for (2); no CSS. (v033: Contact success state reskinned to the `.tf-callout` idiom (paired with STYLE.css v037, same commit per SCOPE.md). The submit-success panel (`.tf-form-success`) moves OFF the full-width `.tf-surface-ink` ink slab onto the existing light `.tf-callout` idiom — REUSE, not a new pattern: a brick Lucide check-circle in the `.tf-callout` svg slot, `.tf-callout-title` / `.tf-callout-body`, `--tf-rule-light` border on a paper ground, at the form-column width. `.tf-form-success` now only supplies top spacing (`margin-block-start`) since `.tf-callout` gives the box. No new colour / token / hex, no arrows; the base `.tf-callout` (brick title + icon) is used, not `-affirm` (which would ink them). This ALSO fixes the swap: `.tf-form`'s `display:flex` was defeating the `[hidden]` attribute, so on submit the form never actually hid (the callout just appeared below it); a scoped `.tf-form[hidden] { display: none }` guard — mirroring the existing `.tf-ref-panel[hidden]` precedent — makes the form genuinely disappear. The JS is UNCHANGED (still toggles `[hidden]`); only the CSS guard is new. §3 gains a one-line EXCEPTION: confirmation / UI feedback headings (this success title, "Thank you") are SENTENCE CASE despite being an h2, so a heading audit does not "correct" them to Title Case. (v032: intake.html forward-reference RETIRED — the page will NOT be built, reversing the earlier plan (recorded in the v026 §6 contact-build entry) to ship it as a hidden page with its own deferred endpoint. Nothing is deleted (the page was never created); the dangling FORWARD REFERENCE is removed: the `.tf-intake-link` anchor on `contact.html` (→ `intake.html`, `target=_blank`), its `.tf-intake-link` STYLE.css rule + comment, and the live prose comments describing it. This RESOLVES the "BACKLOG divergence" the v026 §6 entry flagged — settled in **BACKLOG.md's favour**: BACKLOG §B/§E already map the OLD-site `intake.html → contact.html` (a Cloudflare redirect still required at cutover, since intake.html is live on the old site), so BACKLOG.md and SCOPE.md are already correct and are **NOT edited**. Bottom-alignment: removing the link does NOT break the mechanism — `.tf-field-grow`'s `flex:1` still pins `.tf-form-foot` to the column bottom, so the collage bottom now meets the **send button** at the identical y (measured 0px shift on localhost, no foot change); the live `.tf-form-foot` / `.tf-field-grow` / collage comments are re-anchored on the button accordingly. Paired with STYLE.css v035 (the `.tf-intake-link` rule deleted), same commit per SCOPE.md; the contact.html anchor + its comments are removed on the paired `chore/remove-intake-link` branch (markup-first merge order). The dated v026 §6 "Contact page build" record is left UNCHANGED as history — this reversal lives only in this ratchet entry. (v031: Lightbox zoom + pan (paired with STYLE.css v034, same commit per SCOPE.md). The `.tf-lightbox` overlay gains a scrollable `.tf-lightbox-stage` and a − / + / × control cluster; `assets/lightbox.js` is rewritten so an enlarged image opens fit-to-viewport-READABLE (natural resolution, capped to the viewport width) and zooms — buttons, +/- keys, or wheel — with drag-to-pan once it is larger than the viewport, so a dense heat map (blog-011's rate maps) is actually legible. Closes on ×, a backdrop click, or Escape. This is the CODE half of the in-body zoomable-image feature; the BLOG.md §7 rule and the blog-template `lightbox.js` script are its DOCS half (docs(blog) dcd5653, same branch). Builds on the `.tf-figure-zoom` / `.tf-lightbox` base added in v030. (v030: Blog body figures — `.tf-prose-figure` + `.tf-figure-aside` (paired with STYLE.css v033, same commit per SCOPE.md). The first body-image patterns (BLOG.md §9 — a body pattern lives in the sheet, never page-local), first needed by blog-011. **`.tf-prose-figure`** is a full-width in-flow figure wrapper: its `<img>` reuses **`.tf-img-framed`** for sizing, and screenshots / data-graphics deliberately SKIP the `.tf-photo` grade (that is for photographs). **`.tf-figure-aside`** is an image-alongside-text split for a wide-and-tall figure: the image sits beside the prose that reads it and, on desktop, is sized to that text block's HEIGHT (`assets/lightbox.js` measures the text and caps the image to it), so a very tall figure renders as a small preview strip rather than towering. Because that strip is too small to read, every figure image is **click-to-enlarge** — a vanilla lightbox (`.tf-figure-zoom` button → `.tf-lightbox` overlay, Escape / backdrop / × to close). Below 820px it stacks image-on-top (source order = image first), capped so a tall figure is not a full-screen tower. No stylebook change — layout only, no token / type-scale set change (PROCESS.md §4). (v029: Category (data-viz) palette + wash-token promotion (paired with STYLE.css v032, same commit per SCOPE.md). The six `.tf-pill-tint-*` wash BACKGROUNDS — previously raw hex literals in both the pill rules and (by hand) the stylebook — are promoted to **`--tf-wash-brick/slate/ochre/teal/plum/stone`** tokens; the pill rules and the `.tf-journey-step` hover now reference them, collapsing the tint drift-surface PROCESS.md §4 flagged (only the pills' DEEP TEXT colours stay literals, pill-only). A new **`--tf-cat-*`** category palette (nine tokens) is added for the cashflow / unit-economics stacked visualizations, shared across blog-009 and blog-010: Product Purchase → `--tf-ink-soft`, Shipping & Tariff → `--tf-stone`, Fulfillment → `--tf-sand` (three existing weighted tones), and 3PL Storage / Online Ads / e-Comm Platform / Sales Revenue / Return & Discard / Cumulative P&L aliasing the six category washes. No new hue is introduced — the data-viz palette is the site's existing wash palette re-assigned to commerce categories. stylebook.html re-synced (wash + cat swatch groups added, tint-pairings note updated for the tokenised backgrounds, header stamps bumped). (v028: Heading capitalization amended to PER-LEVEL in §3, SUPERSEDING the v027 "all headings (h1/h2/h3) use Title Case" rule. h1 and h2 keep Chicago Title Case; h3 is now sentence case (first word + proper nouns only); proper nouns/acronyms/brand names keep their own casing at every level; kickers/meta unaffected. Reason: the v027 blanket rule was written from intent, but an audit of all 119 live content headings found h3 is majority sentence-case AUTHORED intent (15 of 24 h3 in sentence case vs Title Case), so a uniform rule would have mis-flagged the h3 house convention as violations. Still PROSE-ONLY, no paired STYLE.css edit (the v023 comment/prose-only precedent). Page-copy reconciliation to this amended rule (h1/h2 up to Title Case, h3 confirmed sentence case) is a SEPARATE commit that follows. (v027: Heading Title Case rule documented in §3. Headings (h1/h2/h3) use conventional (Chicago-style) Title Case — first/last word and all principal words capitalized, articles/coordinating-conjunctions/prepositions lowercased — AUTHORED IN THE MARKUP, never via CSS `text-transform` (which would uppercase function words and cannot lowercase them); kickers/meta keep their own class-driven uppercasing. This DOCUMENTS existing intent (headings were always meant to read as titles), not a new decision; PROSE-ONLY, no paired STYLE.css edit (the v023 comment/prose-only precedent). No page is fixed by this commit — no current heading is known to violate the rule in a way recorded here; any page-copy corrections are a SEPARATE commit that follows. (v026: contact.html build (feat/contact-page, paired with STYLE.css v031, same commit per SCOPE.md). The tier-1 Contact page, first consumer of three new pattern groups: the **FORM KIT** (`.tf-form-col`, `.tf-form`, `.tf-field`, `.tf-field-row` first+last two-up, `.tf-field-grow` for the brief-description textarea, `.tf-label`, `.tf-input`/`.tf-textarea`, `.tf-required`, `.tf-form-note`, a paper-ground field with a 2px stone-light border going brick on focus; error states `.tf-input[aria-invalid]` + `.tf-field-error`; the endpoint-unreachable `.tf-form-error`; `.tf-form-foot`, the bottom-pinned action block whose `.tf-btn` keeps intrinsic width — NO arrows; and `.tf-form-success`, the inline ink swap that reuses `.tf-surface-ink`), the **`.tf-hp`** off-screen honeypot, and the **`.tf-collage`** 3×3 square-tile grid (each photo tile a `<figure>` `.tf-collage-tile` with a cover-cropped `.tf-collage-img` and a `.tf-collage-label` laid OVER the photo on a `--tf-ink`-derived scrim, plus the `.tf-collage-more` `--tf-cream` label tile). The two-column body REUSES `.tf-grid-2up` (collage-first source order → collage-left/form-right ≥820px, stacked collage-first below), equal-height so the collage bottom and the intake link meet; the hero reuses `.tf-page-head`. `--tf-*` tokens only — no raw hex (the scrim uses `color-mix` with `transparent`), no new token/scale, so no stylebook re-sync (PROCESS.md §4). Images quick-populated for staging (not the §1 promotion). Full detail in §6. (v025: Service-list brick marker (paired with STYLE.css v030, same commit per SCOPE.md). A 6px brick square &mdash; the same literal `.tf-callout-list` uses, only the colour differs &mdash; marks each `.tf-service-track` item; folded into the rule, not a standalone class, as its only consumer. v029's item padding is re-based to `0 --tf-space-2`, the 16px rhythm unchanged, so labels sit at the item top for the marker to align to. Band 2's neutral stone pain-point bullets and band 3's brick service squares are ONE mark in two colours, emphasis on the offering. NO numeral or counter: a service list is not a sequence, so a numbered marker would rebuild the numbered engage band just retired. (v024: Service-detail two-content-column re-cut (paired with STYLE.css v029, same commit per SCOPE.md). The v020 two-column engage band (`.tf-flow` left / `.tf-faq` right in a `.tf-grid-2up`, "the reusable service-detail template band") is SUPERSEDED — the engage band is deleted from all four service-detail pages; the v019 symmetric painpoints|solves `.tf-callout` pair is RETIRED (pain points now sit opposite the approach prose, the solves are replaced by the service track). New patterns: **`.tf-content-split`** (the 40ch/62ch two-CONTENT-column row — both columns carry heading + body, so it is NOT a `.tf-section-split` variant, whose left column IS the heading), **`.tf-service-track`** (`.tf-flow`'s label/note shape without the brick counter), **`.tf-cta-inline`** (the closing action following the services list, a `--tf-space-6` break — not bottom-aligned). `.tf-faq` item rhythm tightened to `--tf-space-1`, folding the throwaway spike's tight modifier onto the base rule (the four service pages are its only consumers). `.tf-flow` and `.tf-btn-secondary` are now orphaned; their CSS is retained (not deleted) per the `.tf-stat-grid` precedent in BL-012, flagged for a backlog row. Full detail in §6. (v023: `.tf-lead` stale-size reconcile (paired with STYLE.css v028, same commit per SCOPE.md). §3 "Prose page intro" no longer calls `.tf-lead` 20px / hero-reserved — stale since STYLE.css v13; the two are distinguished by ROLE and by `.tf-lead`'s colour shift inside `.tf-cta`. The v021 ratchet's "Known stale note" is marked reconciled — it flagged only the STYLE.css copy and missed this one. Comment/prose only. (v022: Home page (`index.html`) build — all seven bands, rebased onto main at STYLE.css v027. New shared patterns: **`.tf-hero-home`**, **`.tf-grid-4up`**, **`.tf-prog-group`** + **`.tf-card-ink-soft`**, **`.tf-card-head`**, **`.tf-stat-card`**; **`#trusted`** per-logo trusted-by sizing with **`-trim`** logo variants; **`.tf-stat-grid`** 6-up repair (now unused, retained as a paper-ground pattern). Band-3 scoped overrides: true-italic Source Serif pull-quote (§3's italics ban targets faux-oblique on Space Grotesk only — a true-serif quote is exempt), callout-body emphasis, column bottom-alignment. **`.tf-img-framed`** goes borderless sitewide. **`--tf-footer-ground`** scope widened to the band-4 Runningmate header (no longer footer-only). §2 amended — client logos may appear in ORIGINAL COLOUR in the about carousel and the home trusted-by strip (supersedes "ink wordmarks only"). Full detail in §6 "Home page build". (v021: `.tf-lead` 20px → 16px — resized the lead paragraph (`--tf-text-lg` 20px → `--tf-text-base` 16px), aligning the service-page hook and CTA subline with the site's 16px lead/intro size used by **`.tf-prose-intro`**. No explicit line-height is set: `.tf-lead` inherits the body's unitless `line-height: 1.6`, so at 16px the leading is 25.6px — the identical mechanism `.tf-prose-intro` uses, keeping the two locked to one rhythm. **Colour deliberately unchanged** — `.tf-lead` sets no colour, so it stays ink on paper grounds and `--tf-paper` inside `.tf-cta`. Consumed by exactly 4 elements — the hook + CTA subline on `business-planning.html` and `sourcing-support.html`; no other consumers. NB the `.tf-prose-intro` comment in STYLE.css still describes `.tf-lead` as "(20px), reserved for hero moments" — now stale; left untouched here (that block was out of scope) and flagged for a separate reconciliation. (v020: business-planning.html &mdash; &ldquo;How we engage&rdquo; band + FAQ revert. **`.tf-flow`** (NEW) &mdash; a vertical numbered process flow (brick auto-number, bold label, one explanation line, body size), kin to `.tf-steps` but page-level; it fills the LEFT column of a two-column engage band (a reused `.tf-grid-2up`), with the STATIC FAQ on the RIGHT &mdash; the reusable service-detail template band. **`.tf-faq` REVERTED** from the v018 interactive accordion to a STATIC, all-visible list (`dt` question + `dd` answer, no `<button>`, no fold); **`assets/faq.js` deleted** and its `<script>` removed. The accordion was reverted because the FAQ now sits beside the flow and displays in full. (v019: business-planning.html — Plan detail page (tier-2). Page patterns + reuse, plus a WIDTH + TYPE discipline for tier-2 pages: every section is full-`.tf-container` width and meets ONE shared right edge (the tier-2 intro image), while running text keeps the blog's 62ch measure inside; TYPE inherits the blog scale (base h1/h2/h3 + `.tf-prose`), no page-specific font sizes. Patterns: **`.tf-intro-split`** (tier-2 two-column opener — text column beside a framed inline content image, deliberately NOT the `.tf-page-head` hero; its right edge is the page's alignment reference); **`.tf-section-split`** (labelled prose row — heading LEFT, 62ch prose pinned to the container's right edge; the no-TOC-rail analog of `.tf-prose-layout`, so a running-text section reaches the shared right edge instead of hugging the left — WIDTH only, type unchanged); **`.tf-grid-2up`** (locked 2-up GENERALIZED out of `.tf-profile-grid`, which now consumes it as a thin margin-only modifier — about.html's principals render identically); **`.tf-faq`** (FOLDED `<dl>` accordion — `<button>` triggers toggled by `assets/faq.js`, full-width dividers, answers inherit the body size/colour capped at 62ch). Reuse: `.tf-callout` gains `.tf-callout-warn`/`.tf-callout-affirm` accent modifiers + `.tf-callout-list` for the symmetric painpoints|solves cards, whose bullets take the INHERITED body size AND colour — identical to the "Our approach" copy, not a reduced/muted caption (first LIVE `.tf-callout` use, BL-012); `.tf-cta` gains a secondary-button override for its ink ground + `.tf-btn-row` for the two spaced, arrowless actions (first live `.tf-cta` with a second action beside the brick button) (v018: Ink CTA band secondary button — added a scoped **`.tf-cta .tf-btn-secondary`**, a solid MUTED-fill variant so the ink band carries an EVEN two-button pair (brick primary + muted secondary). First needed by the business-planning CTA's two-button pair on the ink band. Fill = new derived token **`--tf-ink-raised`** = `color-mix(in srgb, var(--tf-ink) 80%, var(--tf-stone))` (the `--tf-cream` idiom, no raw hex; darker than `--tf-footer-ground` so a button on ink stays quieter than the footer band); `--tf-paper` text; a 1px `color-mix(in srgb, var(--tf-ink) 58%, var(--tf-stone))` border a shade lighter than the fill for definition; padding `12px 47px 12px 17px` = the primary's rhythm minus the 1px border, so the two buttons share one outer box and pair evenly; hover lightens the fill to `color-mix(in srgb, var(--tf-ink) 66%, var(--tf-stone))`; square corners, `--tf-*` tokens only, no shadow. This is ADDITIVE and `.tf-cta`-scoped: the base light-ground **`.tf-btn-secondary`** — ink text on a transparent fill with its sanctioned 2px ink border (§4/§97/§389) — is NOT altered; the scoped selector (0,2,0) outranks the base (0,1,0) on the ink band only, so the base outline treatment and its 2px ink frame stand everywhere else (v017: Design reconciliation — the two v016 footer PROVISIONALs ratified as derived `color-mix` tokens (the `--tf-cream` idiom, no hand-picked hexes): `--tf-footer-ground` = `color-mix(in srgb, var(--tf-ink) 75%, var(--tf-stone))` ≈ `#4A4540` (replaces the literal `#4A423C`), footer link = `color-mix(in srgb, var(--tf-brick-on-ink) 45%, var(--tf-paper))` ≈ `#EBA89E` (Design measured ~4.8:1; the provisional `#E68A76` was ~3.7:1, under the 4.5:1 minimum for 14px links); reversed-lockup stone-bar caveat resolved (~4.3:1, acceptable for a graphic element, no footer logo variant); §2 palette line corrected — "exactly the four inks / no additional hues" replaced with "core palette is the four inks; charts & tags draw on the data palette below; `--tf-white` and `--tf-footer-ground` are named scoped exceptions" (justified on a present fact: the `--tf-chart-1…6` data palette already exists in committed STYLE.css, so the old absolute line was self-contradictory); PROVISIONAL flags cleared in STYLE.css v9 (v016: footer ground — **`--tf-footer-ground`** (`#4A423C`, PROVISIONAL pending Claude Design) added, a dark warm stone so the footer reads distinct from an ink `.tf-cta` stacked directly above it, separated on TONE alone with no seam (ink is retired as a divider, §4); the override is scoped `.tf-surface-ink.tf-footer` (0,2,0) so the shared ink rule is untouched and hero bands stay ink; footer link lightened to `#E68A76` (PROVISIONAL — `--tf-brick-on-ink` is tuned for the ink ground and may not clear contrast on the lighter one), footer-scoped so `.tf-surface-ink` links elsewhere are unchanged; the footer's 2px ink top rule is NOT changed and no hairline is added; known caveat recorded — the reversed lockup's stone bar (`#B8ADA5`) loses some contrast on the lighter ground, flagged for Design to resolve WITH the ground; style only, nothing consumes it yet (the CTA template is parked) (v015: Services two-tier dropdown — **`.tf-dropdown-divider`** added, a VISUAL-ONLY separator that groups the two overview links apart from the four detail links inside ONE flat Services panel (light within-a-section rule per §4 — not sand, not ink; `.tf-has-dropdown` and its `.is-open` state machine reused unchanged, so no nesting, no sub-panel and no second trigger enters the nav); §5's nav header comment corrected, having still described the old flat four-link Services (v014: about.html hero migration — `.tf-page-head` adopted (FIRST multi-band hero, first consumer of the multi-band bridge); **`--tf-page-head-pos`** added — per-page cover-crop focal point, default `center` so `references.html` is unchanged (about sets `center 63%`; NB `background-position` X is inert on this band — `cover` scales 3:2 by width, zero horizontal overflow, so panning is vertical-only); **`.tf-container > :first-child { margin-block-start: 0 }`** — about's `.tf-profile-grid` became the container's first child when the header trio moved into the band, and its 32px top margin ADDED to the section's padding (margin never collapses across padding), rendering 80px where the standard is 48px; blast radius measured at exactly one element on one page, same idiom as `.tf-prose > :first-child`; `assets/images/about.jpg` promoted per §7 (byte-identical, decorative hero no alt per BL-019, bare page-name + inline wiring per BL-020) (v013: header-gap standard reconciled by measurement: hero/plain parity confirmed ALREADY CORRECT at 48px (no rule added — Defect A satisfied as v011 wrote it); **multi-band hero bridge added** (`.tf-page-head + main:not(.tf-section)` → `padding-block-start: 0`, measured 96px → 48px on a multi-band harness, `references.html` unaffected) — v011 resolved the single-band case by SPECIFICITY COLLISION on a shared `<main>`, which does not survive `<main>` wrapping several sections; **plain-page gap RE-ANCHORED on the header block** (`main .tf-container > h1:not(:has(+ .tf-prose-intro))` → 48px) so the gap sits below the LAST header element rather than below the intro specifically — an intro-less page was falling to the h1's 16px; measured across all four cases (plain-with-intro 48→48, plain-without-intro **16→48**, hero 48→48, grandfathered 16→16), applies to 9 intro-less shells incl. `index.html`, mutually exclusive with the intro rule so it cannot double; one open item flagged, not fixed (hero-vs-plain differ by 48px when measured from the intro TEXT, which is v011's "additive by design") (v012: about.html client carousel: `.tf-card-sm` kit-level small-card shell (**bordered** — it sits on the wash band, where paper-on-wash is too narrow a step to go borderless like `.tf-ref-card` does on cream); `.tf-carousel` scroll-snap track with vanilla arrow controls (`assets/carousel.js`), 5-up via a single `--tf-carousel-card-w`, swipe-only below 820px; client cards reduced to logo + **≤2** engagement pills (descriptions dropped); `.tf-icon-brand` — third-party brand marks render in their owner's colour, **superseding** the about-page rule that pinned the LinkedIn mark to ink-soft → brick (v011: post-header gap corrected: `--tf-space-6` (48px) of page-background white space between the header block (band edge on hero pages, intro text on plain pages) and the first content element; a hero band's internal padding frames its own text and does not count toward it (`.tf-page-head + main` back to `--tf-space-6`) — supersedes v10, which measured from the subtitle and removed the hero white gap (v10: tier-1 subtitle rhythm: subtitle→first-content gap standardised to `--tf-space-6` (48px) on every tier-1 page, hero or plain (`.tf-container > .tf-prose-intro`; hero supplies it from the band's bottom padding with `.tf-page-head + main` at 0) — supersedes the band-edge-measured `--tf-space-2` rule (v9: references.html restyle: `.tf-page-head` → full-bleed HERO band (background photo + dark scrim, light-on-dark text, stone-light kicker, ink fallback); tabs → underline idiom (`.tf-tabs` light track + brick active underline, supersedes the ink-boxed control); `.tf-ref-card` → borderless (paper-on-cream contrast) (v8: references.html build: shared `.tf-page-head` (text block + optional header image, tier-1 pattern), segmented tab control (`.tf-tabs` / `.tf-tab`), cream group panels (`.tf-ref-group`) + card grid (`.tf-ref-grid` / `.tf-ref-card`); `--tf-cream` role widened to raised/recessed surfaces generally (v7: blog-004 build: prose tables (`.tf-prose-table` + `.tf-prose table`), the first of the BL-012 deferred body patterns (v6: about.html build: `.tf-profile-lg` principals card (natural-aspect headshots, never cropped — square mandate revoked), wash band tint (`--tf-sand-wash` / `.tf-section-wash`), client-logo slot (original colour), tag→tint mapping (v5: sitewide chrome/divider restyle: ink retired as a section divider (sand `--tf-sand` / `--tf-rule-sand`), white dividerless header (`--tf-white`), dropdown cream lightened to a 15% mix; footer keeps its ink top rule (v4: page-header standard — `.tf-kicker` + h1 on every top-level page. v3: paper token lightened to `#FCFBFA`; blog rail image slot + tag removal; no-italics rule. v2: merge of the site build (v1 + ratchet record) and Claude Design v1.5)))))))))))))))))))))))))))))))). This package: `style.md` (rules), `style.css` (tokens + components), `logo-mark.svg`, `logo-mark-reversed.svg`.)

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

## 5. Using STYLE.css

1. Load the Google Fonts `<link>` (top of STYLE.css), then `<link rel="stylesheet" href="STYLE.css">`.
2. Build with the provided classes:
   - `.tf-nav` + `.tf-lockup` — header
   - `.tf-kicker` + `h1/h2` + `.tf-lead` — section openers
   - `.tf-btn.tf-btn-primary` / `.tf-btn-secondary` — actions
   - `.tf-section`, `.tf-card`, `.tf-surface-ink` — page structure
   - `.tf-stat-value` / `.tf-stat-label` — stats
3. Take every color/size from the `--tf-*` tokens; don't hard-code hexes.

### Reuse, one-offs, and quoted values

**Before defining any new pattern, search the ratchet record in §6.** If an
existing pattern already does the job, reuse it. A new pattern is for a
genuinely new need, not a slightly different instance of an old one.

**A pattern used on two or more pages belongs in `STYLE.css`.** That is the
default and covers almost everything.

**A genuine one-off may stay in a page-local `<style>` block**, under three
conditions:

1. It is built entirely from existing tokens — `var(--tf-*)`, the spacing and
   type scales. Never a raw hex, never a raw px where a token exists.
2. It gets a one-line note in the §6 ratchet record naming the page and the
   pattern, so the next page that wants it promotes it instead of rebuilding it.
3. On its **second** use it is promoted into `STYLE.css` rather than copied.
   Two page-local copies of one pattern is the failure this rule prevents.

Internal-only pages (`int-*.html`) are outside the ratchet: their styles are
never shared with visitor pages, so there is nothing to promote or rebuild.

**Quoted values cross documents.** When a `STYLE.css` change alters a value
quoted verbatim elsewhere — a hex in `int-stylebook.html`, a measurement in
`PROCESS.md`, a token name in `SCOPE.md` — both files change in the **same
commit**. A value quoted in two places drifts silently. The `.tf-pill-tint-*`
literals tokenized in v041 are the worked example.

### Minimal page skeleton

A page does **not** hardcode the header or nav. The shared chrome lives once in
`partials.html` and is fetched and injected into the two placeholder divs by
`assets/partials.js`; every internal link is a relative `.html` filename, per
SCOPE.md's relative-links constraint. Derived from `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page name — Three Flows Solutions</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="STYLE.css">
  <link rel="icon" type="image/svg+xml" href="assets/logo-mark.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
  <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
</head>
<body class="tf-app">
  <!-- Shared header injected from partials.html -->
  <div id="tf-header"></div>

  <main>
    <section class="tf-section">
      <div class="tf-container">
        <div class="tf-kicker">Section kicker</div>
        <h1>Page heading</h1>
        <p class="tf-prose-intro">One-paragraph intro.</p>
        <div class="tf-btn-row">
          <a class="tf-btn tf-btn-primary" href="contact.html">Contact us</a>
        </div>
      </div>
    </section>
  </main>

  <!-- Shared footer injected from partials.html -->
  <div id="tf-footer"></div>

  <script src="assets/partials.js" defer></script>
</body>
</html>
```

Nav targets are the real relative filenames: `index.html`, `business-planning.html`,
`sourcing-support.html`, `launch-hypercare.html`, `ongoing-management.html`,
`blogs.html`, `references.html`, `about.html`, `contact.html`, `privacy.html`.
A page carrying the ital font axis (only `index.html`, for the band-3 quote)
requests it in the font `<link>`; every other page uses the stack above.

---

## 6. Ratchet-rule record

Each row: which build first needed a pattern, and what was added to
`STYLE.css`. Patterns live in `STYLE.css` by default; a genuine one-off may stay
page-local under the rule in §5, and is recorded here so the next page finds it.

### Fit-dot names corrected in the v40 records — 2026-08-01

Documentation only. No CSS rule, selector, value or declaration changed, and no
HTML or JS changed — verified by stripping every comment from `STYLE.css` and
diffing the remainder, which is byte-identical.

- **Three v40 passages named classes and hues that never shipped.** The
  STYLE.css v40 changelog wrote the modifiers with a `-dot-` infix on
  teal/plum/stone; this record's "Fit-dot indicator (NEW)" entry named
  `.tf-fit-dot-solo` / `-together` / `-no` with three wrong hex pairs; and the
  step-number bullet named `td.tf-fit-solo/-together/-no`. **Shipped is
  `.tf-fit-you` / `-assist` / `-we` on brick / ochre / teal.** All three are
  corrected, with the old names kept as superseded rather than erased.
- **Why it mattered enough to fix.** §5 tells the next author to search this
  record before defining a new pattern. An entry naming classes that do not
  exist does not merely fail that check — it sends the reader looking for
  `.tf-fit-dot-solo`, finding nothing, and concluding the pattern is absent when
  it is present under another name. A wrong ratchet entry is worse than none.
- **`.tf-fit-dot` was wrongly called retired.** It ships, six times, in the two
  legends. v40 retired the dot *column*, not the class.
- **A trap worth recording: the fit cells are JS-generated.** `.tf-col-num` and
  the three `td.tf-fit-*` rules have zero consumers in the static HTML because
  `assets/tool-company-setup.js` writes those cells at runtime. Grepping only
  `*.html` makes them look like dead CSS — they are not. Any future audit of
  unused selectors must read the JS too.
- **v42 tokenized the literals.** The v40 entry's `.tf-pill-tint-*` deep-text
  hexes became `--tf-wash-*-ink` tokens, noted in the STYLE.css entry so a
  reader is not sent looking for literals the rules no longer contain.

### Reuse and one-off rule, quoted values, skeleton refresh — 2026-07-31

Governance-only pass; no CSS changed and no page was touched.

- **The one-off rule now exists in §5.** §6's preamble previously said patterns
  "always live in `style.css`, never page-local", which contradicted SCOPE.md
  v015 §3 and PROCESS.md v008 §6 step 5 — both of which permit a page-local
  one-off built from tokens. The preamble is corrected and §5 carries the full
  rule: token-built only, a one-line note here, and **promotion into `STYLE.css`
  on second use** rather than a second copy.
- **A reuse check comes first.** Search this record before defining anything
  new; a new pattern is for a genuinely new need, not a variant of an old one.
- **Internal-only pages (`int-*.html`) are outside the ratchet** — their styles
  are never shared with visitor pages, so there is nothing to promote.
- **Quoted values cross documents.** A `STYLE.css` change that alters a value
  quoted verbatim in another file changes both in the same commit. The
  `.tf-pill-tint-*` tokenization (v041) is the worked example: the hexes were
  typed into `int-stylebook.html` a second time and could drift.
- **§5's page skeleton was refreshed from `index.html` and `partials.html`.**
  The old one was untouched Claude Design v1: it hardcoded a `<header class=
  "tf-nav">` with absolute links (`/services`, `/about`, `/contact`), referenced
  lowercase `style.css` and a root-level `logo-mark.svg`. Real pages hardcode no
  header at all — they carry `#tf-header` / `#tf-footer` placeholders filled by
  `assets/partials.js` — and `/services` is not a page. Absolute paths also
  violate SCOPE.md's relative-links constraint.
- **v039 follow-up — §5's `<link>` path corrected to `STYLE.css`.** Item 1 told
  the reader to write `href="style.css"`. GitHub Pages serves from a
  case-sensitive filesystem, so that exact instruction 404s the entire
  stylesheet; the §5 heading was corrected with it. The remaining lowercase
  mentions elsewhere in this file are prose, not instructions, and are left
  alone.

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
  colour, not size. It is distinct from `.tf-lead` by **role, not size** —
  `.tf-lead` is also 16px since STYLE.css v13, and is set apart by context (the
  service-page hook and CTA subline) and by its colour shift inside `.tf-cta`;
  a legal/reference page opens quietly.
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

### Design reconciliation — footer values ratified — 2026-07-20

Claude Design reviewed the v016 provisionals. Both are ratified as **derived
`color-mix` tokens** — the `--tf-cream` idiom, no hand-picked hexes for a derived
surface — and the two PROVISIONAL flags in `STYLE.css` are cleared (v9). Nothing
consumes the footer ground yet (the `.tf-cta` template is still parked), so the
blast radius is zero today.

- **`--tf-footer-ground`** → `color-mix(in srgb, var(--tf-ink) 75%, var(--tf-stone))`
  ≈ `#4A4540`. Within a hair of the provisional `#4A423C`, now token-derived and
  the right shape — the "wrong shape" caveat is discharged.
- **Footer link** → `color-mix(in srgb, var(--tf-brick-on-ink) 45%, var(--tf-paper))`
  ≈ `#EBA89E`. Design measured the provisional `#E68A76` at ~3.7:1 on the new
  ground — below the 4.5:1 minimum for 14px link text — and the ratified tint at
  ~4.8:1, still reading as brick. Hover stays paper, inherited. (Contrast figures
  are Design's measurements, adopted as given.)
- **Reversed lockup — resolved, no change.** The stone bar measures ~4.3:1 on the
  footer ground; Design judged that acceptable for a graphic element (not text),
  so the standard `logo-mark-reversed.svg` stays and no footer-specific logo
  variant ships. Supersedes the v016 caveat above.
- **§2 palette line corrected.** "Exactly the logo's four inks — no additional
  hues" is replaced by "core palette is the four inks; charts and tags may draw
  on the data palette below; `--tf-white` and `--tf-footer-ground` are named
  scoped exceptions." The correction stands on a present-tense fact, not a
  history claim: the `--tf-chart-1…6` data palette already exists in committed
  `STYLE.css` and defines hues beyond the four inks, so the old absolute line was
  already contradicted by the sheet's own tokens.

### Secondary button on the ink CTA band — 2026-07-21

**What first needed it.** The business-planning CTA is a two-button pair — a
primary action and a secondary — sitting on the ink `.tf-cta` band. The band
already scopes the primary (`.tf-cta .tf-btn-primary:hover` → brick-on-ink), but
there was no secondary tuned for ink: the base `.tf-btn-secondary` is a
LIGHT-ground control (ink text on a transparent fill, 2px ink border) and is
effectively invisible on the ink field. So the pair could not be built without a
dark-ground secondary.

**What was added (Design "option B" — solid muted fill).** A single scoped rule,
`.tf-cta .tf-btn-secondary`, plus one derived token:

- **`--tf-ink-raised`** = `color-mix(in srgb, var(--tf-ink) 80%, var(--tf-stone))`
  — the fill. A solid dark surface that reads as *raised* above the ink ground,
  derived per the `--tf-cream` idiom (no raw hex). Deliberately **darker than
  `--tf-footer-ground`** (75/25) so a button on ink stays quieter than the
  footer's own band.
- **`--tf-paper` text**, and a **1px `color-mix(ink 58%, stone)` border** — a shade
  lighter than the fill, just enough to define the edge on the dark ground.
- **Padding `12px 47px 12px 17px`** — the primary's `13/48/13/18` rhythm minus the
  1px border, so the filled secondary and the borderless primary share one outer
  box and pair evenly.
- **Hover lightens** the fill to `color-mix(ink 66%, stone)`, matching the
  `.tf-cta .tf-btn-primary:hover` idiom of scoping the band's own hover.
- Square corners, `--tf-*` tokens only, no shadow.

Result: inside `.tf-cta`, primary = brick solid, secondary = muted solid fill — a
cohesive pair on dark.

**What this does NOT change.** The base `.tf-btn-secondary` — ink text on a
transparent fill with its **sanctioned 2px ink border** — is untouched (§4: the
2px ink frame is one of the surviving homes of the retired ink rule, "the edge of
a *thing*"). The new treatment is purely additive and `.tf-cta`-scoped:
`.tf-cta .tf-btn-secondary` (0,2,0) outranks the base (0,1,0) on the ink band only,
so every light-ground use keeps the ink outline exactly as before.

**Merged from main (PR #29) on the business-planning sync.** This branch had
carried its own paper-outline `.tf-cta .tf-btn-secondary`; that override was
removed so the page adopts this ratified solid-fill button.

### Tier-2 intro split — business-planning.html — 2026-07-21

business-planning.html is the first **tier-2** (service DETAIL) page. Tier-1 pages
open with the full-bleed `.tf-page-head` hero (photo under a scrim, light-on-dark
text). A detail page wanted to read one level DOWN from those without inventing new
chrome, so it opens on a two-column intro instead of a hero.

- **`.tf-intro-split` — a two-column page opener (NEW).** A grid: text column
  (kicker / h1 / hook / intro links) beside a framed inline content image. One
  column below 820px (the nav breakpoint reused — no new breakpoint), text first
  in source order so it leads on mobile. `align-items: center` seats the shorter
  text block against the taller image.
- **The framed image is the tier-2 SIGNAL, and the reason this is not a hero.**
  `.tf-intro-split-img` is an in-flow `<img>` with a 2px `--tf-rule-light` frame
  (the within-a-thing rule, §4), square corners, no scrim, no bleed — the visual
  opposite of the hero's edge-to-edge cover-cropped background. That contrast is
  what marks a page as a detail page at a glance. `width:100%` + `height:auto`
  renders the source at its own ratio (the promoted image is 3:2), so nothing is
  re-cropped in CSS. Carries `.tf-photo` for the brand grade like every content
  photo.
- **No new tokens, no hex.** Border, gaps and breakpoint are all existing tokens.
- **The image's right edge is the page's ALIGNMENT REFERENCE.** It sits at the
  `.tf-container` edge, and every section below reaches that same right edge (the
  2-up, the FAQ dividers, and the prose column of `.tf-section-split`), so no
  section reads narrower than the intro row.

### Tier-2 width + type discipline — full-width sections, blog type scale — business-planning.html — 2026-07-21

A tier-2 page sits at the SAME level as an individual blog post, so it inherits the
blog's TYPE, and it must not read narrower than its own intro image. Two rules and
one new pattern.

- **TYPE inherits the blog scale — no page-specific font sizes.** Headings are the
  base `h1`/`h2`/`h3` (48/36/27), body is 16px, running copy uses `.tf-prose` — the
  exact scale and rhythm a blog post gets. The page defines no `--tf-text-*` of its
  own.
- **WIDTH: every section is full-`.tf-container` width and meets one shared right
  edge.** The bug this fixes: wrapping whole sections in the 62ch `.tf-prose`
  measure made them far narrower than the intro image — a ragged right edge down
  the page. Now the intro image, the 2-up, the FAQ dividers and the prose column of
  `.tf-section-split` all reach the container's right edge.
- **`.tf-section-split` — a labelled prose row (NEW, WIDTH only).** Heading in a
  left column, `.tf-prose` in a right column whose track is capped at 62ch and
  pinned to the container's right edge. It is the no-TOC-rail analog of the blog's
  `.tf-prose-layout` (rail left, 62ch prose right): the heading takes the rail's
  place, so a running-text section fills the width and aligns right while the copy
  keeps the blog's comfortable measure — it never runs the full container. Type is
  untouched (base h2 label + `.tf-prose` body); this pattern owns width alone.
  Stacks to heading-above-prose below 820px. First use: Our approach, Why us.

### Locked 2-up generalized from the profiles grid — business-planning.html — 2026-07-21

The painpoints|solves row needs the SAME locked two-column geometry the about-page
principals already use: exactly two equal columns from 820px, one column below, and
a FIXED pairing that must not reflow to 1-up mid-desktop the way an auto-fill track
would. That geometry lived inside `.tf-profile-grid`, scoped by name to the
principals. Rather than duplicate it, it was **extracted into a reusable base both
usages consume**.

- **`.tf-grid-2up` — the locked 2-up base (NEW, extracted).** Holds the grid: 1
  column, `1fr 1fr` at ≥820px, `--tf-space-3` gap. Any deliberate two-item row
  reuses it; business-planning.html's painpoints|solves is the second consumer.
- **`.tf-profile-grid` is now a thin modifier on it.** It keeps ONLY
  `margin-top: var(--tf-space-4)` (the about-specific spacing from the section
  opener above the cards); the geometry moved to the base. **about.html's markup
  now carries both classes** (`class="tf-grid-2up tf-profile-grid"`), and the
  computed result is identical to the pre-extraction rule — verified on localhost,
  principals unchanged. This follows the sheet's base+modifier idiom
  (`.tf-card`/`.tf-card-strong`, `.tf-section`/`.tf-section-wash`).

### "How we engage" band + static FAQ — business-planning.html — 2026-07-21

The page's FAQ moved into a two-column **engage band**: a 5-step process flow on the
left, the FAQ on the right, both fully visible and top-aligned. This band is the
reusable pattern-setter for the service-detail template (all four detail pages will
carry it), so it is built from shared parts.

- **`.tf-flow` — a vertical numbered process flow (NEW).** Each `<li>` is a brick
  auto-number (counter, the `.tf-steps` idiom), a bold `.tf-flow-label`, and one
  `.tf-flow-note` explanation line beneath. Kin to `.tf-steps` but at **body size**
  with a two-line step, for a page-level flow rather than the compact 14px inline
  list — which is why it is its own pattern, not a `.tf-steps` override. **No
  dividers between steps** (unlike `.tf-steps`, which rules its rows): the number +
  spacing separate the steps, and a rule here would clash with the FAQ's dividers
  in the adjacent column. Label and note are both body size + `--tf-ink` (the note
  is not muted), so the flow text matches the page body.
- **The band reuses `.tf-grid-2up`.** Flow left, FAQ right, 1fr/1fr from 820px,
  stacked (flow then FAQ) below — no new layout pattern. The right column's edge is
  the container edge, so the band meets the page's shared right edge like every
  other section. Grid `stretch` gives both columns equal height, content top-aligned.

### FAQ reverted to static — business-planning.html — 2026-07-21

- **`.tf-faq` — now a STATIC, all-visible list (no fold, no JS).** This **reverts the
  v018 interactive accordion**: the FAQ now sits in the right column of the engage
  band beside the flow and displays in full, so folding is unnecessary. The `dt`
  holds the question directly as `.tf-faq-q` (a plain heading-family element, **no
  `<button>`, no chevron, no `aria-expanded`**); the `dd` `.tf-faq-a` is always
  visible. Items divided by the light within-section rule (§4); the last drops its
  rule and bottom padding. Question at the card-title tier, answer at body
  size/colour and capped at the blog's 62ch measure.
- **`assets/faq.js` was deleted**, and its `<script>` tag removed from
  business-planning.html — no accordion JS remains anywhere. (Supersedes the v018
  "FAQ accordion" record.)

### Callout reuse + CTA button row — business-planning.html — 2026-07-21

Two existing patterns got their **first live use** here, and each surfaced one small
scoped addition — recorded so the additions aren't mistaken for silent scope creep.

- **`.tf-callout` — first live use (BL-012), reused for the painpoints|solves card
  headers.** The base gives both cards the same light border, padding and icon+title
  row. Two accent modifiers flip ONLY the accent — icon and title together — so the
  pair contrasts on one axis and nothing else: **`.tf-callout-warn`** = brick (the
  painpoints, Lucide `alert-triangle`), **`.tf-callout-affirm`** = ink (the solves,
  Lucide `circle-check`). `.tf-callout-list` gives the four bullets a flush,
  square-stone-marker list (square per the brand; stone so the marker reads as a
  marker, not a second accent). Both cards carry the identical list, so they still
  differ on the header alone. **Bullets take the INHERITED body size AND colour**
  (16px `--tf-ink`; `.tf-callout-list li` no longer reduces to `--tf-text-sm` nor
  mutes to `--tf-ink-soft`), so a painpoint/solve reads identically to the "Our
  approach" body copy — it is primary content, not a caption (step 12,
  type-inherits-blog). The FAQ answer (`.tf-faq-a`) matches, for the same reason.
  **The card HEADER sizes to the card-title tier**, scoped to the pair
  (`.tf-callout-warn`/`.tf-callout-affirm` `.tf-callout-title` → `--tf-text-lg`,
  20px): the base `.tf-callout-title` is `--tf-text-sm` (14px, for small notes),
  which read SMALLER than the 16px bullets — an inverted hierarchy. 20px is the
  scale token nearest the `.tf-card-title` convention (21px) and clears the body.
  The base stays 14px for a generic callout; only the painpoints/solves pair is
  enlarged, and their brick/ink title colour is the intended accent, not body ink.
- **`.tf-cta` — first live use, two-action band.** The two actions sit in
  **`.tf-btn-row`** (flex + `--tf-space-2` gap, wraps on narrow) for clear spacing:
  primary **Contact us** first, secondary **See all services** second, NO arrow
  glyphs. The secondary's dark-ground styling is NOT defined here — it comes from
  main's **v018 `.tf-cta .tf-btn-secondary`** (solid `--tf-ink-raised` fill, see the
  "Secondary button on the ink CTA band" entry above), adopted on the main sync; an
  earlier paper-outline override on this branch was removed so the page uses main's
  button. First page to place two actions on a CTA band.

### `.tf-lead` resized 20px → 16px — 2026-07-22

**What changed.** `.tf-lead { font-size: var(--tf-text-lg) }` (20px) →
`.tf-lead { font-size: var(--tf-text-base) }` (16px). Size only.

**Why.** `.tf-lead` is the service-page **hook** (the line under the h1) and the
**CTA subline**. At 20px it sat a full step above the site's lead/intro size —
`.tf-prose-intro`, the long-form page intro, is 16px (`--tf-text-base`). Dropping
`.tf-lead` to the same 16px aligns the service-page hooks and CTA sublines with
that established lead/intro size, so the pages read on one rhythm.

**Leading — inherited, not set.** No `line-height` is declared on `.tf-lead`; it
inherits the body's **unitless `line-height: 1.6`**, so the leading tracks the
font-size automatically — 32px at the old 20px, **25.6px at 16px**. That 25.6px /
1.6 is exactly what `.tf-prose-intro` renders (which also declares no line-height),
so the two stay locked to one rhythm by the same mechanism. Adding an explicit
`line-height: 1.6` would be redundant and would *diverge* from the reference, so
none was added.

**Colour — deliberately unchanged.** `.tf-lead` sets no colour of its own: it
inherits `--tf-ink` on paper grounds (the hook) and `--tf-paper` inside `.tf-cta`
(the subline). This rule touches size only, so both are preserved.

**Scope.** Consumed by exactly **4 elements on 2 pages** — the hook + CTA subline
on `business-planning.html` and `sourcing-support.html`. No other consumers on
main. The CTA **heading** is a separate element (h2-tier, 36px) and is untouched.

**Known stale note (flagged, now reconciled).** The `.tf-prose-intro` comment in
STYLE.css still reads *"Distinct from `.tf-lead` (20px), which stays reserved for
hero moments."* That is now stale — `.tf-lead` is 16px, the same size as
`.tf-prose-intro`. The `.tf-prose-intro` block was out of scope for this change, so
the comment was left untouched and is flagged here for a separate reconciliation
(the two are now distinguished by role/context, and by `.tf-lead`'s colour shift
inside `.tf-cta`, rather than by size).

**Reconciled 2026-07-26 — STYLE.css v028 / STYLE.md v023.** Both copies were
corrected: the `.tf-prose-intro` comment in STYLE.css, and the §3 "Prose page
intro" entry above, which this note did not catch. The paired fix follows
SCOPE.md — a value quoted verbatim in another governance doc updates in the
same commit, which is the rule the original flag deferred.

### Home page build — index.html, all seven bands — 2026-07-25

The home page was built across seven bands on `feat/index`, then rebased onto
current main and its STYLE.css chain renumbered to sit above main's client-logo
stream (v14–v16), landing at **v027**. The patterns it added, each in `STYLE.css`,
never page-local:

- **`.tf-hero-home` (NEW) — band-1 home hero.** Home's OWN opener on a PAPER
  ground: text column (kicker / h1 / intro) beside a framed inline image, with the
  primary CTA INSIDE the band. Deliberately NOT `.tf-page-head` (the tier-1
  interior hero) and NOT `.tf-intro-split` (the tier-2 detail signal) — near-
  identical geometry, different meaning, so Home does not read like an interior
  page. `.tf-page-head` is untouched.
- **`.tf-grid-4up` (NEW) — locked four-item row (band 6 resources).** The
  `.tf-grid-2up` idiom one step wider: 1 → 2 → 4 columns across the sheet's
  existing 768/820 breakpoints. `.tf-card-grid`'s intrinsic auto-fill lands 3 + 1
  on the 1200px container, so a deliberate four-item set needs declared geometry.
- **`.tf-prog-group` + `.tf-card-ink-soft` (NEW) — band-4 program groups.** Two
  program headers (Pathfinder / Runningmate), each a filled dark card over two
  service cards. Pathfinder uses `--tf-ink`; Runningmate uses `--tf-footer-ground`
  via `.tf-card-ink-soft`, so the two dark groups separate on TONE, not on a
  second accent colour or a drawn line (the footer-vs-ink-CTA idiom).
- **`.tf-card-head` (NEW) — band-4 service-card header strip.** A `--tf-cream`
  header block flush to the card's inner edges (the `.tf-card-cap` negative-margin
  idiom), carrying the service title + duration meta.
- **`.tf-stat-card` / `.tf-stat-cards` (NEW) — band-3 separated stat cards.** For
  the ink case-study band, where the ruled `.tf-stat-grid` reads like a
  spreadsheet: separated boxes read apart by a raised GROUND (`--tf-cream` on
  paper, `--tf-ink-raised` on ink) + the gap, no drawn outline. Figure/caption
  reuse `.tf-stat-value`/`.tf-stat-label`.
- **`.tf-stat-grid` 6-up REPAIR.** Fixed the long-claimed-but-broken 6-up case
  (internal rules moved to each cell's TOP/LEFT so the predicates hold at any
  cell/column count; doubled row-end edge and missing row divider fixed; 2-up
  below 768). Band 3 then moved to `.tf-stat-card`, so `.tf-stat-grid` now has
  **zero consumers** — retained as a valid paper-ground pattern, not deleted.
- **`#trusted .tf-tb-*` — band-2 per-logo trusted-by sizing.** Four client logos
  of very different shape/density can't balance at one shared height, so each is
  sized INDIVIDUALLY for even OPTICAL weight (NYC 21 / Wayfair 27 / Concentrix 16
  / Microsoft 17). Sourced from **band-2-only `client-<slug>-trim.png` variants**
  (ink-trimmed) so the shared padded `client-<slug>.png` the about carousel uses
  stay UNTOUCHED — trimming the shared assets regressed the carousel (verified).
  `#trusted .tf-logos { border-top: none }` drops the strip's own top rule so a
  single line sits at the hero/strip seam. All `#trusted`-scoped; the shared
  `.tf-logos` and `.tf-client-logo` are unaffected.
- **Band-3 scoped overrides (`#client-case-study`).**
  - **True-italic pull-quote.** `#client-case-study .tf-quote { font-style:
    italic }` renders a REAL Source Serif 4 italic face (the `ital,600` axis was
    added to the font `<link>`; verified distinct-metric, not synthesized oblique).
    **§3 exemption, documented here:** §3's no-italics rule targets faux-oblique on
    **Space Grotesk** (which ships no italic); a **true-serif pull-quote in Source
    Serif 4's real italic** is exempt, scoped to band 3's quote alone.
  - **Callout-body emphasis** (`--tf-text-base` + `--tf-stone-light`) so the band's
    conclusion reads louder than its stat captions; **column bottom-alignment**
    (left column a flex column, stat grid `margin-block-start: auto`) so the KPI
    cards' bottom tracks the callout's bottom automatically.
- **`.tf-img-framed` — now BORDERLESS.** The shared framed-image pattern dropped
  its 2px `--tf-rule-light` frame sitewide (user decision); layout props kept.
  Consumers: band-1 hero, band-3 case study.
- **`--tf-footer-ground` scope widened** — no longer footer-only; it now also
  grounds the band-4 Runningmate program header (`.tf-card-ink-soft`). See §2.
- **§2 amended — client logos in original colour.** The "one-colour ink wordmarks
  only" rule for `.tf-logos` is replaced: client logos may render in original
  brand colour in the about carousel AND the home trusted-by strip; ink/text
  wordmarks remain the fallback for a logo with no usable colour asset. See §2.

### Service-detail two-content-column re-cut — 2026-07-26

The four service-detail pages are re-cut from the v020 engage band to a
two-content-column row. STYLE.css v029 / STYLE.md v024, this commit. Governance
only — the CSS is defined here; the page markup is a separate PR.

- **Engage band superseded.** The v020 "How we engage" band — `.tf-flow` (the
  5-step numbered process) on the LEFT, `.tf-faq` on the RIGHT in a reused
  `.tf-grid-2up`, billed as "the reusable service-detail template band" — is
  DELETED from all four service-detail pages. It is replaced by
  `.tf-content-split`, a two-content-column row where each column carries its own
  heading + body. Supersedes the v020 ratchet entry, **"'How we engage' band +
  static FAQ" (2026-07-21)**.

- **Painpoints|solves callout pair retired.** The v019 symmetric `.tf-callout`
  pair (a painpoints card beside a solves card, first live `.tf-callout` use) is
  RETIRED. The **pain points** now sit in the right column opposite the "Our
  approach" prose (left); the **solves** are replaced by the **service track** — a
  plain list of the services offered, not the paired-card treatment.

- **`.tf-content-split` defined — and why it is NOT a `.tf-section-split` variant.**
  The new row is a standalone two-CONTENT-column pattern. In `.tf-section-split`
  the LEFT column IS the heading (a bare label opposite running prose); in
  `.tf-content-split` BOTH columns carry a full heading + body block, which
  section-split's single-label rail cannot express. The left floor is 40ch (vs
  section-split's 16ch label rail), sized to the longest left h2 and the longest
  pain/service lines so nothing over-wraps; the right keeps the 62ch measure and
  space-between right-pinning to the shared hero-image edge (v019). Also new:
  `.tf-service-track` (`.tf-flow`'s label/note shape without the brick counter)
  and `.tf-cta-inline` (the closing action following the services list, a
  `--tf-space-6` break — it follows the list in flow, not bottom-aligned). `.tf-faq`
  item rhythm was tightened to `--tf-space-1`, folding the throwaway spike's tight
  modifier onto the base rule (the four service pages are its only consumers).

- **`.tf-flow` and `.tf-btn-secondary` orphaned.** With the engage band gone,
  `.tf-flow` (the numbered process) has no remaining consumer, and
  `.tf-btn-secondary` is likewise orphaned. Both rules are RETAINED in STYLE.css,
  not deleted — the same posture as `.tf-stat-grid` under **BL-012** (a
  shipped-but-unused pattern kept in the sheet rather than churned out and back
  in). The orphaning is flagged for a backlog row so it is tracked, not silent;
  the backlog edit is separate from this PR.

### Service-list brick marker — 2026-07-26

The service track gains a brick square marker. STYLE.css v030 / STYLE.md v025,
this commit. Governance only — the CSS is defined here; no page markup changes.

- **Brick square, folded into the rule.** Each `.tf-service-track` item is marked
  with a 6px brick square — the SAME literal `.tf-callout-list` uses for its
  bullet, only the colour differs, so if that square is ever tokenized both
  consumers move together. It is folded into `.tf-service-track` itself, NOT
  shipped as a standalone marker class: that rule is its only consumer, and a
  general marker class with one user invites misapplication — the same reasoning
  that dissolved the spike's `-tight` modifier into `.tf-faq` at v024.

- **Item padding re-based, rhythm unchanged.** v029's `.tf-service-track li`
  `padding-block: --tf-space-1` (8+8, 16px between) is superseded by
  `padding-block: 0 --tf-space-2` (0+16, still 16px between). The rhythm is
  identical; the re-base exists only so every label sits at its item's top edge,
  giving the marker a stable line to align to (`top: 0.5em`). This does NOT mean
  v029 was wrong — it was correct; bottom-only is simply the shape the marker
  needs.

- **Stone vs brick across bands 2 and 3 — one mark, two colours.** Band 2's pain
  points keep their neutral `--tf-stone` squares (the PROBLEM); band 3's services
  carry the identical square in `--tf-brick` (the OFFERING). Same shape, same
  size, same alignment — colour alone carries the emphasis. A deliberate system,
  not an inconsistency; band 2 is intentionally left in stone.

- **NO numeral or counter — recorded as a decision.** The marker is a square, not
  a number. A service list is not a sequence; `.tf-flow` (the numbered engage
  process) was orphaned at v024 for exactly that reason, and a numbered marker
  here would rebuild it under a new name. This records that the choice was made,
  not overlooked.

### Contact page build — contact.html — 2026-07-26

The tier-1 Contact page. STYLE.css v031 / STYLE.md v026, this commit. Three new
pattern groups plus two deliberate reuses. **All `--tf-*` tokens — no raw hex, no
new token, no new type size, no new breakpoint**, so per PROCESS.md §4 the
stylebook needs no re-sync (it tracks the token/scale SET, not components).

- **Reuse before new patterns (SCOPE build strategy).** The two-column body is
  **`.tf-grid-2up`**, reused unchanged — not a new "contact body" pattern. It is
  the documented locked-2-up (two equal columns ≥820px, one stacked column below,
  **source order preserved**): collage LEFT / form RIGHT on desktop, stacking to
  **collage-first** below 820px, the order carried by SOURCE ORDER (the collage
  markup precedes the form) so it cannot fall out by accident. Grid stretch makes
  the two columns equal height, and the collage is the taller column, so the form
  column stretches to it — the mechanism behind the bottom-alignment below. The
  hero reuses **`.tf-page-head`**; the success panel reuses **`.tf-surface-ink`**.

- **Form kit (NEW) — the site's first form.** `.tf-form-col` (flex column
  wrapping the form + the hidden success panel), `.tf-form` (`flex:1` so it fills
  the stretched column), `.tf-field` (label above input), `.tf-field-row`
  (**first + last name two-up**, a 1fr/1fr grid holding at every width — no new
  breakpoint), `.tf-label` (14px / 500 Space Grotesk, ink). `.tf-input`
  (+`.tf-textarea`) is a **PAPER-ground** field: `--tf-white` is header-chrome-only
  (§2), so a content field takes `--tf-paper`, framed by the 2px light rule (§4).
  **Focus** turns that border **brick at the same 2px** — the colour change IS the
  indicator, so the base `:focus-visible` outline is suppressed for these fields
  only, no layout shift. 16px input text avoids mobile-Safari zoom. **Required** is
  a brick asterisk (`.tf-required`, aria-hidden; the input's `required` attribute
  carries it to AT) + a "* required" note (`.tf-form-note`). **Error states:**
  `.tf-input[aria-invalid]` brick border + inline `.tf-field-error`; `.tf-form-error`
  a brick-framed endpoint-unreachable alert. **Success:** `.tf-form-success` pads
  an inline ink panel that replaces the form on submit ("Thank you" a base h2 →
  Source Serif, paper on ink).
  **Bottom-alignment (spec):** the collage bottom must meet the intake link. This
  is layout, not a spacer: `.tf-field-grow` (the brief-description field) takes
  `flex:1` so the textarea absorbs the column's free height, and `.tf-form-foot`
  (the "* required" note, the failure notice, the send button, the intake link)
  sits at the bottom — landing the intake link level with the collage's bottom
  edge. The send button is standard `.tf-btn .tf-btn-primary` with **no arrow** and
  **no width/padding override** — `.tf-form-foot .tf-btn { align-self: flex-start }`
  keeps its intrinsic width and left-aligns it inside the full-width foot. The
  intake link (`.tf-intake-link`) is a plain brick text link, **no arrow**,
  `target=_blank rel=noopener` → `intake.html` (a hidden page built later; only the
  link exists here).

- **Honeypot (NEW) — `.tf-hp`.** An OFF-SCREEN decoy (`position:absolute;
  left:-9999px`), deliberately **not `display:none`**: some bots skip hidden
  fields but fill positioned ones. No human sees or tabs to it (aria-hidden,
  tabindex -1, autocomplete off). The JS silently drops any filled submission. No
  CAPTCHA.

- **City collage (NEW) — `.tf-collage`, on-tile labels.** A 3×3 grid of nine
  square cells: eight photo tiles + one label tile, no empty slot. Each photo tile
  is a `<figure>` (`.tf-collage-tile`, the positioning context, `aspect-ratio:1/1`,
  `overflow:hidden`, toned `--tf-stone-light` ground behind) holding a
  cover-cropped `.tf-collage-img` (carries `.tf-photo`) and a `.tf-collage-label`
  laid OVER the photo's bottom. The label is city + country in `--tf-paper` on a
  **bottom scrim** — a `linear-gradient` whose translucency derives from
  `--tf-ink` via `color-mix(… , transparent)` (the `--tf-cream` idiom, so no raw
  rgba/hex enters the sheet) — so light text stays legible on any photo. The label
  is kept to **one line at every width**: `white-space: nowrap` plus a font sized
  to the tile (`min(14px, 7.4cqi)`, the tile being a `container-type: inline-size`
  query container), so even the longest label ("Ho Chi Minh City, VN") fits on one
  line — ~13.3px on a 180px desktop tile down to ~7.7px on a 104px mobile tile. The 9th
  cell, `.tf-collage-more`, is a `--tf-cream` ground with a centred stone "More to
  come" label (no `<img>`). A **section label** ("where our teams are located")
  sits above the tiles as `.tf-collage-head` — a stone caption spanning the grid's
  top row (`grid-column: 1 / -1`). It **reuses the `.tf-meta` treatment** (12px,
  uppercase, tracked) and overrides only the colour to `--tf-stone` (the muted
  meta-label tone the sheet already uses on paper, e.g. `.tf-card-meta`), so no new
  label style is invented. Kept INSIDE the collage grid so the collage stays the
  left column's bottom element — the label+collage block therefore stays
  bottom-aligned with the intake link opposite, with no change to the tiles
  (still square, still full size).

- **Endpoint deferred (recorded).** The POST target is one named placeholder in
  `assets/contact-form.js` (`CONTACT_ENDPOINT = "__CONTACT_ENDPOINT__"`), so
  wiring the real Google Apps Script URL later is a one-line change. Until then the
  handler validates, runs the honeypot, and shows the success swap **with no
  network POST**; the live `fetch` path is written but gated behind the placeholder
  check. Vanilla JS, own file, soft-fail (the `carousel.js` posture). Collage alt
  text is a clearly-marked PLACEHOLDER pending the user's approved factual sentence
  (PROCESS.md §1 / BLOG.md §7); the visible on-tile label is the city, not the alt.

**Flags (recorded, not resolved here):**
- **Images quick-populated for staging, NOT the §1 promotion.** The hero + 8 tiles
  were written straight into `assets/images/` from the user's masters (read-only)
  as a staging convenience, so the page renders populated on localhost. These are
  **provisional bytes, not sha256-approved masters-of-record** — the proper
  PROCESS.md §1 preview→approve→promote pass (hero + 8 tiles) is **still required
  before ship**, and the collage alt text still needs user approval.
- **Square-tile crop spec is NEW.** The tiles use a **1:1 / 800×800** centred crop,
  which the process docs do not yet cover (BLOG.md §7 records only the 3:2 /
  1200×800 hero-and-post spec). This needs recording in the image process. Two
  masters were smaller than 800² and, downscale-only, came out below spec
  (shanghai 641×641, yiwu 640×640) — flagged for re-source or acceptance.
- **BACKLOG divergence.** `intake.html` is KEPT as a hidden standalone page with
  its OWN new deferred endpoint (BACKLOG §B/§E map `intake.html → contact.html`
  redirect, endpoint not carried); contact shows cities without addresses/phone;
  both endpoints are deferred placeholders. BACKLOG.md is **not** edited here — the
  reconciliation is its own governance commit before cutover.

### Company setup tool — tool-company-setup.html — 2026-07-29

The first tool under the hidden `tools.html` (BL-009's manifest/TOOLS.md scheme
stays open, deferred by explicit human decision — this page is hand-linked from
`tools.html`, not manifest-driven). A reference implementation supplied the
copy, content, and interaction logic (a 3-question entity-type Q&A; a Prep &
filing table; a Post-filing setup table); its inline `<style>` and ad-hoc CSS
were **not** reused — every visual element maps to an existing `STYLE.css`
pattern, or a new one defined here. Paired with STYLE.css v040, same commit per
SCOPE.md. Engine lives in its own file, `assets/tool-company-setup.js`
(SCOPE.md's build strategy — a tool's computing logic is never page-inline).

**Shape, twice revised after localhost review.** The first pass wore the
references.html hero+tabs directory shape; the human redirected it: that
treatment belongs to `tools.html` (a future directory of many tools, deferred
until more than one exists — see the open item below). The second pass went
to the opposite extreme — a pure blog-post scroll, all three steps always
visible, no switching. A hand-sketched wireframe corrected that too: the
intended shape is a small header image beside the title, a divider, then a
**vertical step list acting as a switcher** (only the active step's content
shows) beside that content — closer to the ORIGINAL tabs, just with the nav
turned into a left rail instead of top tabs. `.tf-tool-step` and the
`.tf-content-split` reuse from the second pass are removed (unshipped, so
edited in place rather than superseded in a new entry each time).

- **Header — `.tf-intro-split` reused unchanged.** Small framed image
  (`.tf-intro-split-img` + `.tf-photo`) beside a text column (h1 +
  `.tf-prose-intro` + the liability disclaimer, the latter reusing
  `.tf-card-body` — no new text-style class for one paragraph). This is the
  tier-2 opener pattern (business-planning.html etc.), reused here for a
  DIFFERENT job (a tool's lede, not a service page's), which the pattern's
  shape already supports without changes. A **`.tf-post-topnav`** back-link
  ("← Tools" → `tools.html`, the blog "← Blogs" idiom) sits above it.

- **`.tf-tool-divider` (NEW) — the sand section rule** between the header and
  the step rail/panel body (STYLE.md §4: sand divides major sections). Not
  `.tf-prose hr` — that rule is scoped to `.tf-prose` for dividing sections of
  running prose, and this divider sits outside prose, between the page's two
  top-level blocks.

- **`.tf-tool-layout` / `.tf-step-nav` / `.tf-step-nav-item` (NEW) — a
  VERTICAL step rail beside the active panel.** `.tf-tool-layout` is rail-left
  (220px, sticky ≥820px) / panel-right (flexible), stacking rail-above-panel
  below 820px — the same breakpoint and sticky mechanic `.tf-toc` already
  uses. `.tf-step-nav-item` is a real `<button role=tab>`, styled on
  `.tf-toc`'s own left-border-rail idiom (contiguous `border-left`s form the
  rail edge; active = brick text + brick edge segment) — but it SWAPS the
  active panel on click rather than scroll-spying a static page, so it is a
  tablist, not a TOC. Each item is two lines — a bold "Step N", a lighter step
  name beneath — reusing `.tf-flow`'s label/note TYPE only (no brick
  auto-number: the rail's own "Step N" text already carries the sequence).

- **`.tf-panel-head` / `.tf-panel-actions` (restored) — title + Print/Download
  actions atop the active panel.** With the rail swapping panels, only one is
  ever visible, so Print/Download belong per-panel again (not a single
  page-level Print, which the second pass tried and which this shape makes
  unnecessary — `window.print()` naturally reflects whichever step is active
  since the others are `[hidden]`). Buttons are `.tf-pill .tf-pill-outline`,
  reused as clickable `<button>`s — the one-line `button.tf-pill { cursor:
  pointer }` addition still applies, since a pill is normally a
  non-interactive tag `<span>` and sets no cursor.

- **`.tf-tool-panel[hidden]` (restored) — the defensive guard** mirroring the
  established `[hidden]` idiom (`.tf-ref-panel[hidden]`, `.tf-form[hidden]`,
  `.tf-form-success[hidden]`). Panel switching itself reuses the
  `references.js` tablist idiom exactly (`role=tabpanel`, JS toggles
  `[hidden]`, hash-deep-linkable `#decide`/`#prep`/`#post`) — only the trigger
  widget (a vertical rail instead of horizontal `.tf-tabs`) differs.

- **Choice kit (NEW) — `.tf-choice-group` / `-question` / `-hint` / `-options`
  / `.tf-choice`.** Radio-pill question groups for the entity-type Q&A. Each
  `.tf-choice` is a bordered label (pill-sized, square corners) wrapping a
  REAL, visually-hidden `<input type=radio>` — not a styled `<button>` standing
  in for one — so the group keeps native radio semantics (arrow-key navigation
  between options, "N of M" AT announcement); the global `:focus-visible` brick
  ring already covers it, no new focus rule needed. Distinct from the `.tf-pill`
  kit (a solid/outline TAG, not a form control) and from the form kit's
  `.tf-input` (a text field, not a discrete choice). Selected state reuses
  `--tf-wash-brick` as the fill (the closest existing tint to a "chosen" look,
  the same one `.tf-pill-tint-brick` already uses) — no new colour. The
  recommendation result reuses `.tf-callout` / `.tf-callout-warn` as-is (brick
  title + icon) — no new callout variant.

- **Data table (NEW) — `.tf-data-table` + `col.tf-col-*` / `.tf-cost-note` /
  `.tf-cost-badge` / `.tf-rowcheck`.** *(The checkbox column and `.tf-rowcheck`
  described in this bullet were REMOVED in the Round 2 review below — this
  bullet records the table as first shipped, not its final shape.)* The Prep
  & filing and Post-filing setup
  tables are structured/interactive (a checkbox column, a cost badge, a
  fit-dot "who's involved" column, `colgroup`-controlled widths) — a different
  job from **`.tf-prose-table`** (element-scoped, BLOG.md §9, for a bare
  `<table>` inside running prose with no classes of its own).
  `.tf-data-table` deliberately mirrors the prose table's FRAME idiom (ink 2px
  outer border — a table is a component, the edge of a thing, not a section
  boundary; light 2px internal rules; a `.tf-meta`-style uppercase header) so
  the two table kinds read as one family, but it is its own standalone
  pattern, not `.tf-prose`-scoped, and carries furniture the prose table has
  no reason to: column width control, a checkbox cell, a badge. No zebra
  striping, no row hover — the table is read, not operated; the only
  affordance is the checkbox itself. Rendered by `assets/tool-company-setup.js`
  from two data arrays (ported verbatim from the reference), the same
  `renderTable()` shape the reference used. Ships at the reference's full
  **6 columns** (checkbox / # / Step / Est. time / Cost / Who's involved) — a
  second pass briefly collapsed this to 4 to fit a narrower ~62ch column the
  step-row layout gave it; with the vertical-rail shape the active panel gets
  the flexible remainder of the container (roughly 900px, not 62ch), so the
  width pressure that justified collapsing is gone and the full reference
  fidelity is restored. **`.tf-cost-note` (NEW)** — "Sign up to see exact cost
  estimates," moved OUT of the Cost header (where it was a `.tf-th-sub`, now
  deleted — unused after the move) to its own line directly above
  `.tf-fit-legend`, after reviewing an actual printed page: the header
  sub-label crowded a header cell that print then narrows, and a caveat about
  cost estimates reads better as its own line than nested in a column label.
  Print-visible on purpose, unlike the legend beneath it (screen-only) — a
  cost caveat is still relevant on paper.

- **Fit-dot indicator (NEW) — `.tf-fit-dot` + `.tf-fit-you` / `.tf-fit-assist`
  / `.tf-fit-we` + `.tf-fit-legend`.** The task brief asked whether the
  reference's bordered "who's involved" dots fit the **existing**
  `.tf-pill-tint-*` set — checked, and they don't: those are solid TEXT pills
  (wash background + deep text colour), not standalone bordered dots. Confirmed
  the reference's own literal hex values (`#F7E4E1`/`#8F1E12` you·brick,
  `#F4EAD4`/`#7A5410` assist·ochre, `#DDEDED`/`#175355` we·teal) are an
  **exact** match for the site's existing `--tf-wash-brick/-ochre/-teal` tokens
  and the deep-text literals `.tf-pill-tint-brick/-ochre/-teal` already hardcode
  — so the dot is a genuinely NEW **shape** (a small `border-radius:50%` marker,
  the same precedent already sanctioned inside `.tf-pill-dot`) applied as a
  standalone legend/cell marker, reusing colours the sheet already has. No new
  hue enters the palette.

  **CORRECTED 2026-08-01 (v042).** As written, this entry named the modifiers
  `.tf-fit-dot-solo` / `-together` / `-no` and quoted `#DDEDED`/`#175355`
  solo·teal, `#F2E3EA`/`#632846` together·plum, `#ECE7E1`/`#55504D` no·stone.
  **None of those six names or hexes ever shipped** — the classes are
  `-you` / `-assist` / `-we` and the hues are brick / ochre / teal. The old
  names are kept here as superseded so anyone who meets them can follow the
  trail; the body above now states what v40 actually built.

- **Print output (NEW, sitewide) — `.no-print` + `@page A4`.** The first print
  stylesheet on the site. Deliberately GENERAL rather than tool-scoped: chrome
  (`.tf-nav`, `#tf-header`, `#tf-footer`, `.tf-page-head`, `.tf-tabs`) is hidden
  on ANY printed page from here on, sized to A4 with a 12mm margin — harmless
  that `.tf-page-head`/`.tf-tabs` don't appear on THIS page, since other pages
  (references.html) still carry them. Printing prints only the ACTIVE panel —
  the `[hidden]` attribute already suppresses the others regardless of media,
  so no extra print-specific panel rule is needed, and each panel's own Print
  button correctly reflects the step it's attached to. The row-checkbox
  column is print-hidden two ways, ported as-is from the reference: `.no-print`
  on its `th`/`td` (a checkbox input mid-print reads as broken chrome, not
  content), and its `<col>` width zeroed in the print block so the table
  reflows without a blank gutter. The liability disclaimer is **not**
  print-hidden — a printed filing checklist should still carry it.
  **Refined after reviewing an actual printed page:** the step rail
  (`.tf-step-nav`) and the "← Tools" back-link (`.tf-post-topnav`) are now also
  print-hidden — both are page-navigation, meaningless once on paper — and so
  is the header's lede photo (`.tf-intro-split-img` specifically, NOT the
  whole `.tf-intro-split`, so the page's h1/intro/disclaimer still print).
  Table columns get a PRINT-ONLY rebalance: Est. time and Who's involved
  narrow (14%/16% screen → 10%/10% print), Step and Cost widen to absorb the
  freed space (46%/16% screen → 48%/26% print) — screen keeps its
  already-approved wider split; only the print `<col>` widths change.

- **`?subject=` handoff to contact.html.** The closing CTA (`.tf-cta-inline`,
  reused unchanged) links to `contact.html?subject=Company%20setup%20-%20`.
  `contact.html`'s form does not yet read a `subject` query param to prefill
  its Subject line field (the field itself shipped in
  [feat/contact-subject-line](https://github.com/sw805206/threeflows-new/pull/87),
  but nothing populates it from the URL) — flagged as a follow-up, not blocking
  this build.

**Round 2 — print-out + on-screen review, 2026-07-29.** The human printed a
panel and reviewed the header on-screen; eight findings, all addressed:

- **Header layout.** The "← Tools" back-link moved INSIDE the text column
  (directly above the h1) — it previously sat above the image, reading as
  detached from the title it belongs to. The lede photo shrank from the wide
  `.tf-intro-split` treatment to `.tf-rail-img` (the blog TOC rail's own 3:2
  image sizing) inside a 220px column, so it now matches the visual weight of
  a blog rail image rather than dominating the header — and the 220px column
  lines up with the `.tf-step-nav` rail directly beneath it. `.tf-tool-layout`
  (previously step-rail-specific) is GENERALIZED to `:first-child`/`:last-child`
  positional selectors so the SAME rule serves both the header row and the
  step-rail row — one pattern, two consumers, with `position: sticky` still
  scoped to `.tf-step-nav` only (a header image has nothing to stick to).
  **Flexbox gotcha caught on review:** the image's own `width: 100%` combined
  with a flex item's default `min-width: auto` produced an automatic minimum
  size near the full container width, overriding `flex-basis: 220px` — fixed
  with an explicit `min-width: 0` on the fixed-width column.
- **Divider scope.** `.tf-tool-divider` moved from a full-width `<hr>` spanning
  BOTH header columns to living inside the text column only, closing under the
  disclaimer — matching the blog's own header-divider idiom (`.tf-prose >
  .tf-meta`'s light rule closes the header block under the TEXT, never
  reaching under the rail beside it). Confirmed against a live blog page
  screenshot the human supplied.
- **Checkbox and Who's-involved columns REMOVED entirely** (screen and print,
  not just print-hidden as a first pass mistakenly assumed) — `.tf-rowcheck`
  and its "mark step done" affordance are gone. The step **number cell is now
  colour-coded** instead (`.tf-data-table td.tf-fit-you/-assist/-we`, reusing
  the dot's exact tokens as a cell background instead of a separate dot column)
  — reclaims the width both dropped columns held. The legend
  (`.tf-fit-legend`) is unchanged and still explains the colours.

  **CORRECTED 2026-08-01 (v042), two errors.** First, this entry named the cell
  classes `td.tf-fit-solo/-together/-no`; the shipped classes are
  `td.tf-fit-you/-assist/-we` (old names kept as superseded, not erased).
  Second, it called `.tf-fit-dot` **retired**. It is not: `.tf-fit-dot` is
  defined in `STYLE.css` and used **six times** in `tool-company-setup.html` —
  two legends of three dots each. What v40 retired was the separate dot
  *column*, not the class; the dot survives as the legend's colour key.

  The colour-coded cells themselves **do ship**, but the markup is generated at
  runtime: `assets/tool-company-setup.js` writes
  `<td class="tf-col-num tf-fit-<who>">` per row, so `.tf-col-num` and the three
  `td.tf-fit-*` rules have no consumer in the static `.html` and are easy to
  mistake for dead CSS on a grep of the markup alone. They are live — 25 and 21
  consumers respectively in the rendered DOM.
- **Hover vs. active state.** `:hover` on the step rail previously turned
  brick text — the SAME treatment the truly active step uses — so hovering a
  different step while one was already active read as two "active" steps at
  once (review finding). Hover on a non-selected item now washes the
  background (`--tf-wash-brick`) instead of recolouring text; brick text +
  brick rail edge stays the active item's alone.
- **Table border → sand, not ink.** `.tf-data-table table`'s outer frame moved
  from `--tf-rule` to `--tf-rule-sand`. This is a DELIBERATE, `.tf-data-table`-
  SCOPED deviation from the documented "ink survives on component frames"
  rule (STYLE.md §4) that `.tf-prose-table` still follows unchanged — flagged
  below for reconciliation, not applied sitewide in this commit.
- **Real cost estimates.** The reference's "sign up to see exact estimate"
  gate doesn't correspond to any actual sign-up flow, so it read as a dead
  promise — replaced with real cost ranges the human supplied (2026-07-29),
  shown as the Cost cell's primary text with the cost TYPE ("3rd party
  charge", "Gov charge", …) as a smaller `.tf-cost-badge` subline beneath
  (block-level, not inline — a second reason this needed its own line once
  real estimates made the cell two lines deep). `.tf-cost-note` above the
  legend changed from "Sign up to see exact cost estimates" to "Estimates
  only — actual costs vary by state and provider," since the content is no
  longer gated. Column widths rebalanced for the longer real-dollar text:
  Cost 26%→40%, Step 50%→42%, Est. time 18%→12%.
- **Download → Word-compatible `.doc` (RTF), not `.txt`/`.csv`.** All three
  Download buttons (`data-download-doc`, renamed from `data-download-result`/
  `data-download-csv`) now produce a single RTF document mirroring the print
  layout — title/intro/disclaimer, the panel heading, and either the
  recommendation or a real bordered table with the shaded step-number cells
  carried through as RTF cell shading (`\clcbpat`). Hand-built vanilla JS, no
  dependency (SCOPE.md: lean dependencies) — RTF saved with a `.doc`
  extension opens directly in Word without needing a docx library.
  *(SUPERSEDED in Round 3 — the .doc/RTF export is removed entirely; see
  below.)*

**Round 3 — side-by-side blog comparison + content pass, 2026-07-29.** Four
findings:

- **Rail width 220px → 260px.** The human compared a blog post and the tool
  side by side: the tool's header image read visibly smaller. Root cause was
  a made-up 220px rail; `.tf-toc` (the blog's own rail) is **260px**.
  `.tf-tool-layout`'s fixed column now uses that same literal, so a tool page
  and a blog post open with the identical left-column rhythm and image size.
  *(One deliberate remaining difference: the blog pins its prose right at a
  62ch cap, leaving a wide centre gap; the tool's panel fills the remaining
  width instead, because its tables need the room. Flagged below.)*
- **CTA moved INSIDE each panel, directly above the legend** (per the human's
  sketch) — it was a single page-level block after all three panels, so it
  read as page furniture rather than as help offered at the point of use.
  `.tf-cta-inline` is reused unchanged; only its placement moved.
- **Download (.doc/RTF) REMOVED; Print → "Download PDF".** The RTF export
  was rejected on review. The remaining single action calls `window.print()`
  — the print stylesheet already IS the intended PDF layout and every
  browser's print dialog offers a "Save as PDF" destination, so one code path
  serves both and the two can never drift. All the RTF-building code
  (`rtfHeader`/`rtfTable`/`rtfEscape`/`triggerDownload`, the `RTF_COLORS`
  table) is deleted, not just unwired — ~90 lines and the page's only
  non-trivial serialization logic.
- **Table content, ordering, and the responsibility coding re-cut** to the
  human's supplied table. The first column **stays the step number** — Round
  2's colour-shaded `#` cell is kept, not replaced (an interim attempt to put
  spelled-out role labels in that column was corrected: the column is for the
  step number, and the COLOUR is what carries responsibility). The three
  responsibilities are **redefined** from the original solo/together/n-a set
  to **You** (you must own it, brick), **Assist** (we can do it together,
  ochre), **We** (we can execute it, teal) — named in the legend, and on each
  cell as a `title` tooltip. Colours are the
  `.tf-pill-tint-brick/-ochre/-teal` wash + deep-text pairs, exact — no new
  hue; ochre enters the tool's palette here, replacing the retired
  stone/plum pair. Row content and ORDER come from the human's table verbatim
  (including a new "Set up Google/Office Workspace" row) — the JS array is
  the source of truth and is not re-sorted. The legend drops `.no-print`: it
  keys the number column's colours, so it must survive to paper, and a
  `print-color-adjust: exact` rule keeps the wash backgrounds from being
  stripped by the browser's default print behaviour.

**Round 4 — side-by-side spacing + content pass, 2026-07-30.** Seven findings:

- **Header gap: fixed 48px → the blog's own `space-between` mechanism.**
  Measured against a live blog post: its rail→prose gap is **240px** (rail
  260px, prose 62ch pinned to the container's right edge, flexible space
  between); the tool's fixed `--tf-space-6` left the title crowding the
  image. `.tf-tool-layout` now uses `justify-content: space-between` with the
  content column at `flex: 0 1 62ch` — `.tf-prose-layout.is-railed`'s exact
  rule, so the geometry tracks the blog at any width rather than approximating
  it with a hand-tuned gap. Measured 240px after the change, identical to the
  blog.
- **"Disclaimer:" now bold** at the head of the disclaimer paragraph, so it
  reads as a labelled notice rather than a third intro paragraph.
- **CTA position unified across steps.** It previously trailed the Q&A card on
  step 1 but led the table on steps 2–3, so it moved as you switched steps.
  Now it sits directly under `.tf-panel-head` in every panel — measured at the
  same y (551px) on all three — with a scoped `margin-block: --tf-space-4`
  giving symmetric air above and below (the base `.tf-cta-inline` rule's 48px
  top / 0 bottom is wrong for a mid-panel placement).
- **"Estimates only…" note removed** from both table panels; `.tf-cost-note`
  had no other consumer, so the rule is DELETED rather than left orphaned
  (this pattern was introduced in Round 2 and never shipped, so no BL-012-style
  retention applies).
- **"Cost" → "Est. cost"** in both table headers.
- **Est. time column widened** 12% → 18% (Step 42→40, Cost 40→36) so "Same
  day" — the most common value — sits on one line. Verified by measuring line-
  box counts: all three "Same day" cells render single-line.
- **Content edits:** "Acquire" prefixed to the business-licenses and
  business-insurance rows; "Beneficial-ownership disclosure, if your state
  requires it" → "Disclose beneficial ownership (BOIR), if your state requires
  it".
- **"Download PDF" now produces a REAL .pdf file** — it previously opened the
  print dialog, which the human rejected twice. Implemented with **jsPDF
  2.5.1 + jspdf-autotable 3.8.4**, loaded from cdnjs with **Subresource
  Integrity** hashes, `crossorigin`, `referrerpolicy=no-referrer` and `defer`,
  **on this page only**. This is the site's **first third-party JS
  dependency** — an explicit SCOPE.md exception ("lean dependencies; per-page
  CDN loads by exception only"), taken by human decision, recorded below.
  The generated document carries the page's title, intro and disclaimer, the
  panel heading, the responsibility legend, and either the Q&A recommendation
  or the full table with the **number cells shaded in the same brick / ochre /
  teal pairs as the screen** (`didParseCell` colours column 0 only). If the
  CDN is blocked or the SRI check fails, `window.jspdf` is undefined and the
  handler falls back to `window.print()`, so the button is never dead.

**Round 5 — structural alignment to the blog, 2026-07-30.** Round 4 matched
the blog's horizontal geometry but kept a two-row structure (image+title row,
then rail+panel row), which left **169px of dead vertical space** between the
lede image and "Step 1" where a blog post has 24px. Fixed by adopting the
blog's actual STRUCTURE, not just its measurements:

- **One row, not two** — `.tf-tool-layout` is now a single
  `.tf-prose-layout.is-railed` analogue. **`.tf-tool-rail`** stacks the lede
  image directly above the step nav (exactly as `.tf-toc` stacks
  `.tf-rail-img` above "In this article" + its links), and
  **`.tf-tool-content`** carries the back-link, h1, intro, disclaimer, the
  closing divider, and then the panels. The image→nav gap is now just
  `.tf-rail-img`'s own `margin-bottom: --tf-space-3` — **measured 24px**,
  identical to a blog post. `.tf-tool-header` is retired.
- **The whole rail sticks**, not the nav alone — matching `.tf-toc`.
- **Divider tightened** to `--tf-space-3` / `--tf-space-4` (was `-4`/`-6`),
  since it now closes a header block inside the content column rather than
  separating two full-width rows.
- **CTA moved into the rail, between the lede image and the steps.** This
  retires Round 4's per-panel CTA: there is now **one** instance outside the
  panels, so it cannot repeat or shift between steps. The scoped
  `.tf-tool-panel .tf-cta-inline` spacing rule is replaced by a
  `.tf-tool-rail`-scoped one — symmetric `--tf-space-3` (24px above and
  below, matching the image→nav rhythm) at `--tf-text-sm` to suit the 260px
  column; the base rule's 48px-top/0-bottom is wrong in a narrow rail and
  gives no bottom air where the steps now follow.

**Flags (recorded, not resolved here):**
- **SCOPE.md must record the CDN dependency exception.** SCOPE.md's hard
  constraints say "Lean dependencies; per-page CDN loads by exception only" —
  jsPDF + autoTable on `tool-company-setup.html` IS that first exception, and
  SCOPE.md currently lists no exceptions at all. Recording it there is a
  GOVERNANCE change and needs its own PR per CLAUDE.md Part B, so it is
  deliberately NOT bundled into this feature branch. Until it lands, the only
  written record of the decision is this ratchet entry and the commented
  `<script>` block in the page.
- **The 62ch content cap narrows the step tables.** Matching the blog's header
  spacing (above) necessarily consumes 500px of the row (260px rail + 240px
  gap), leaving ~636px for the panel — so the 4-column table now sits at blog-
  prose width and its Step/Est. cost columns wrap more than they did at full
  width. This is the direct trade-off of the blog-matched geometry, accepted
  deliberately; widening the tables again would mean a smaller gap than a blog
  post has. Revisit together, not separately.
- **BLOG.md §9 is stale.** It still lists "prose tables — no `table` rules
  exist yet" as a deferred pattern; `.tf-prose-table` has existed since
  blog-004 (STYLE.md's own 2026-07-17 entry above). Noted here, not fixed —
  BLOG.md is its own governance doc and a separate commit.
- **`tools.html`'s own look is undecided.** Whether it eventually adopts the
  references.html hero+tabs/`.tf-ref-group` directory treatment this tool page
  first tried and dropped is explicitly open — the human's call once more than
  one tool exists to browse. `tools.html` is UNCHANGED in this build (still the
  plain kicker/h1/intro + single `.tf-card-grid` card from the first pass).
- **`.tf-data-table` vs. `.tf-prose-table` border colour now diverges** — sand
  vs. ink, see above. Whether `.tf-prose-table` (blog tables) should also move
  to sand for consistency, or whether the divergence is intentional (a data
  table read as a worksheet vs. a prose table read as reference content), is
  an open reconciliation item — a STYLE-scoped change needing its own commit
  per CLAUDE.md Part B, not bundled here.
- **The tool's content column does NOT match the blog's 62ch right-pinned
  prose.** Both now share the 260px rail, but the blog caps its prose at 62ch
  and pins it to the container's right edge (leaving a wide centre gap),
  whereas `.tf-tool-layout`'s panel fills the remaining width. Deliberate —
  the step tables need the width, and capping the panel would misalign it
  against the header text above it — but it means a tool page and a blog post
  are NOT geometrically identical below the rail. Revisit if a future tool is
  text-heavy rather than table-heavy.
- **"Download PDF" depends on the browser's print dialog.** It calls
  `window.print()`; the user picks "Save as PDF" as the destination. There is
  no generated-file path and no PDF library. If a true one-click PDF download
  is ever required, that is a new dependency decision (SCOPE.md: lean
  dependencies, per-page CDN loads by exception only), not a tweak.


### Category tint text tokenized — STYLE.css only — 2026-07-31

A **pure refactor**: no colour value changed and every rendered pixel is
byte-identical. Verified by capturing the computed `background-color` and
`color` of all 24 live tint pills on about.html plus a synthetic probe for each
of the six classes, before and after — all pairs matched exactly.

- **The six `.tf-pill-tint-*` deep-text hexes became tokens**
  (`--tf-wash-{brick|slate|ochre|teal|plum|stone}-ink`). v032 had promoted the
  *backgrounds* to `--tf-wash-*` but left the text as raw literals, so the
  pairing was half-tokenized.
- **Why it mattered — the stylebook could not read a literal.** Every other
  swatch in `int-stylebook.html` resolves its own computed colour and prints the
  hex from it, so a value change needs no stylebook edit. A literal has no
  `var()` handle, so the six text hexes had to be typed into the stylebook a
  second time. Change a tint in STYLE.css and the stylebook silently lied. That
  surface is now gone: **both halves of every tint pairing self-read.**
- **Two alias rather than repeat.** `--tf-wash-brick-ink` is
  `var(--tf-brick-dark)` and `--tf-wash-stone-ink` is `var(--tf-ink-soft)` —
  their literals were exact duplicates of those tokens, and re-declaring the hex
  would have rebuilt the drift surface one level down. Follows the `--tf-cat-*`
  aliasing idiom. The other four hues have no base ink token to point at.
- **`tint-stone` stays in the set, unmapped.** It has no engagement tag and no
  HTML consumer; §2's tag→tint map is five tags over six tints, and stone is the
  reserve slot the "a new phase takes the next unused tint" rule draws from.
  Tokenizing it keeps the set complete rather than blessing an absence.
- **§2 updated** to say the data palette is tokenized in both halves and that
  this added no hue — see §2.
- **Known duplication, deliberately NOT converted.** `.tf-fit-assist`,
  `.tf-fit-we` and their `.tf-data-table td` variants still hardcode `#7A5410`,
  `#175355` and `#8F1E12` — the same three values one component further out.
  STYLE.css v40 records that reuse as intentional. It is a real remaining drift
  surface, but a different component and out of this refactor's scope; flagged
  for a follow-up. **SUPERSEDED 2026-08-01** — the follow-up landed; see the
  ratchet entry below. This exception no longer stands.

### `.tf-fit-*` consumes the tint ink tokens — STYLE.css only — 2026-08-01

A **pure refactor**, and the direct follow-up the entry above flagged: no colour
value changed and every rendered pixel is byte-identical. This **closes the last
known duplicate** of `#8F1E12`, `#7A5410` and `#175355` — each value now appears
exactly once in STYLE.css, at its token definition.

- **Six declarations became tokens.** The three `.tf-data-table td.tf-fit-*`
  `color` declarations and the three standalone fit-dot `border-color`
  declarations now read `--tf-wash-{brick|ochre|teal}-ink` instead of the raw
  hex. Nothing else changed — no selector, no other declaration, no value.
- **`.tf-fit-you` was in scope too, though nothing said so.** The v041 note
  above and BACKLOG BL-030 both name only `-assist` and `-we`, yet both list
  all three hexes. `#8F1E12` lives *only* on `.tf-fit-you`, so converting just
  the two named classes would have left one of the three values behind and
  defeated the point of the pass. All three classes are converted.
- **The brick alias is preserved, not collapsed.** `--tf-wash-brick-ink` is
  still `var(--tf-brick-dark)`; `.tf-fit-you` points at the wash-ink token
  rather than reaching past it to the base ink. The indirection is the v041
  decision and is deliberate — a tint consumer should read the tint token.
- **Why the verification needed care.** A pure refactor's before and after are
  identical *by design*, so a cached stylesheet yields a passing result for the
  wrong reason — the trap that invalidated the first pass of the v041 work. The
  proof used here does not depend on the eye: the **parsed, in-use stylesheet
  was read back** (`document.styleSheets` → the six rules' `cssText`) and had to
  report `var(--tf-wash-*-ink)` before any comparison was trusted, on a fresh
  origin so no cache entry was shared with the baseline.
- **Coverage.** All **21** live table cells (9 assist / 7 we / 5 you, generated
  by `assets/tool-company-setup.js`) and all **6** legend dots on
  `tool-company-setup.html` — the only page consuming these classes — plus a
  synthetic probe of all three classes in *both* rule families. Every
  before/after pair matched exactly; no console errors.

### Simple cash flow tool — tool-cashflow-projection.html — 2026-08-01

The **second** tool page, and the first real test of whether the first tool's
shell is a pattern or a one-off. It is a pattern: `.tf-tool-layout` /
`.tf-tool-rail` / `.tf-tool-content`, `.tf-step-nav`, `.tf-tool-panel`,
`.tf-panel-head`, `.tf-tool-divider`, `.tf-data-table`, the form kit, `.tf-pill
.tf-pill-outline`, `.tf-callout` and `.tf-cta-inline` all carried over
**unchanged**. The geometry settled over tool-company-setup's five review rounds
(260px rail, `space-between` + 62ch content cap, the 24px image→nav gap) was
reused as found and deliberately **not re-derived**. Paired with STYLE.css v044,
same commit per SCOPE.md. Engine in `assets/tool-cashflow-projection.js`
(SCOPE.md §3). Steps are `#revenue` / `#costs` / `#projection`, switched by the
same `references.js` tablist idiom; arriving at step 3 recomputes, so steps 1
and 2 stay editable with no stale projection and no "recalculate" button.

Five new patterns, all built from existing tokens:

- **`.tf-tip` (NEW) — the hover tip.** A small ringed "?" whose text lives in
  `title`, so tips are hover-only rather than always-visible helper copy under
  every field (nine questions' worth would have doubled the form's height).
  `title` is the idiom `.tf-data-table`'s step-number cells already use for the
  You/Assist/We meanings. **Known limitation, recorded not solved:** `title`
  does not appear on touch and is not reliably announced by every screen
  reader. It is the right trade here — every tip is an example ("asset,
  equipment"), never information needed to answer the question — but a tool
  whose tips carry load-bearing content should build a real popover instead.
  *(SUPERSEDED in Round 2 — `.tf-tip` is DELETED and replaced by
  `.tf-explained`, an always-visible explanation in a second column. The
  limitation recorded above is exactly what the review rejected; see below.)*

- **`.tf-view-toggle` / `-btn` (NEW) — the Monthly/Quarterly segmented
  control.** Drives the chart and the table from one switch. Deliberately
  neither `.tf-pill` (tag furniture) nor `.tf-choice` (a radio answering a form
  question): this changes a VIEW, so the two buttons share one frame with a
  divider between them and read as a single control. Pressed state reuses the
  choice kit's own `--tf-wash-brick` fill + brick text, so "currently chosen"
  looks the same everywhere on the page. Print-hidden — a paper copy has one
  aggregation, whichever was on screen.

- **`.tf-chart-scroll` / `.tf-chart-legend` / `.tf-chart-swatch(-line)` (NEW) —
  the chart's furniture.** The chart itself is a **hand-built SVG generated by
  the JS**; no charting library was added, since the site's own blog waterfalls
  (`blog-cashflow-vs-unit-economics.html`) are hand-built and every colour it
  needs already exists as a token. Grouped bars — revenue `--tf-wash-teal` with
  a 2px `--tf-chart-4` stroke, costs `--tf-wash-brick` with 2px `--tf-chart-1`
  — plus cumulative net cash as a **dashed `--tf-ink` line on a secondary right
  axis**. The dash is the required non-colour cue and is carried into the
  legend, whose third swatch is a dashed rule rather than a filled block.
  MONTHLY renders at a fixed readable bar width (46px per group) and scrolls
  sideways rather than compressing 36+ months into the panel; QUARTERLY is
  given `width:100%` and fits. Quarterly is the default above a 24-month
  horizon, re-derived on each refresh until the user works the toggle, after
  which their choice stands.

  **Why the chart's colours are NOT in STYLE.css.** The SVG has to survive two
  renderings: the live DOM, and a raster snapshot for the generated PDF. The
  PDF path serializes it into an `<img>`, where an external stylesheet does not
  apply — a CSS-classed fill would render on screen and silently vanish from
  the PDF. The JS therefore reads the same `--tf-*` tokens off `:root` with
  `getComputedStyle` and writes them as SVG presentation attributes. One
  source of truth, still tokens, no hex in the JS. STYLE.css keeps the wrapper,
  scroll container and legend. **This is the first pattern on the site whose
  colours are applied by JS rather than by rule**, and the reason is specific
  to rasterization — it is not a precedent for ordinary components.

- **`.tf-repeat` / `-row` / `-del` / `-empty` + `.tf-cost-group` (NEW) — the
  repeatable cost-row editor.** Add/edit/delete lists behind One-time, Annual
  and Monthly costs. A row is the form kit's own `.tf-input` fields in a grid,
  cloned from a `<template>` in the PAGE rather than from a string in the JS.
  The month column is **180px** because a native `<input type="month">` renders
  its calendar affordance inside the field beside "September 2026"; at 150px
  the year clipped behind the icon (caught on localhost). Delete is a text
  control, not a button-shaped one — a row of three fields ending in a solid
  button reads as if the button submits the row. Collapses to one column below
  **640px**, a narrower breakpoint than the sheet's 768/820 nav pair and
  deliberately so: this is a control's internal reflow, not a page-layout
  change.

- **`.tf-print-only` + the pagination block (NEW, sitewide) — the second print
  pass.** `.tf-print-only` is the exact mirror of the existing `.no-print` and
  is likewise general, not tool-scoped. It carries the **assumptions recap**,
  which is print/PDF-only: on screen it would merely restate the two input
  steps sitting one click away, but on paper the numbers need their
  assumptions. Output paginates **chart + footnotes / recap / table**, stated
  once as `break-before: page` here and once as `addPage()` in the engine —
  commented as a pair in both files, because two statements of one layout can
  drift. `print-color-adjust: exact` on the SVG for the same reason the
  step-number cells needed it: the bar fills carry the series.

Also new, but content rather than pattern: **`.tf-cost-summary`**, a small
horizon-totals-by-cost-type block above the table. The brief ruled out both
alternatives for a reason worth recording — four more columns will not fit a
7-column table, and a hover tooltip does not survive to print or PDF.

**Deliberate departures from the brief, both recorded for review:**

- **The totals row does not sum every column.** The brief says "sum each
  column, except cumulative cash". Taken literally that sums *Cumulative
  clients* — already a running total, so its sum is meaningless — and *Active
  projects*, a stock, where a sum counts each project once per month it runs.
  The three FLOW columns (Revenue, Total costs, Net cash) sum; cumulative
  clients and cumulative cash show the closing value; active projects shows the
  horizon **peak**, labelled as such in a `title`. Same reasoning inside a
  quarter: active projects aggregates as the quarter's peak, not its last
  month.
- **A one-time cost dated after the horizon** is excluded from every total
  (the brief only specifies blocking costs dated BEFORE the start month). It is
  outside the window by the same rule that excludes late completion payments.

**Flags (recorded, not resolved here):**
- **The 62ch content cap bites harder on this tool than the last.** Round 5's
  blog-matched geometry leaves ~636px for the panel, which a 7-column table
  cannot hold — it scrolls inside `.tf-data-table`'s existing `overflow-x`.
  Acceptable, but this is the second tool to hit the same wall, and the first
  tool's own flag ("revisit if a future tool is text-heavy") should now read
  "revisit if a future tool is TABLE-heavy" — that is the case that keeps
  arriving. Revisit the rail/cap trade for tools as a whole, not per page.
- **The first tool's flag list contains a stale entry.** Its final bullet still
  says "Download PDF depends on the browser's print dialog… There is no
  generated-file path and no PDF library", which Round 4 of the same entry
  superseded when jsPDF shipped. Noted here, not edited — the flag list is
  history, and correcting it is its own governance commit.
- **`title` on `.tf-tip` is not a touch or AT affordance** — see the pattern
  note above. If tips ever carry load-bearing content, this needs a real
  popover.

**Round 2 — first-build review, 2026-08-01.** Ten findings across all three
steps. Paired with STYLE.css v045.

*Step 1 — the assumptions form*

- **`.tf-explained` (NEW) replaces `.tf-tip`, which is DELETED.** Control on
  the left, explanation on the right. Two problems fell to one change: a
  full-width `.tf-input` was an absurd box for a two-character answer like "3",
  and the hover "?" hid the explanation behind an interaction — the exact
  limitation the original entry above recorded and accepted. Putting the
  explanation in the width the narrower box frees costs nothing and reads
  without hovering. `.tf-tip` is removed from the sheet rather than left
  orphaned, per the `.tf-cost-note` precedent (Round 4 of the company-setup
  entry). **This reverses the original brief's "all tips are hover, not
  always-visible" instruction** — recorded here because the reversal was
  deliberate and requested, not drift.
  ONE pattern, two consumers: step 1's labelled fields and step 2's cost-group
  headings. Stacks below 640px, matching `.tf-repeat-row`'s own reflow
  breakpoint rather than the sheet's 768/820 page-layout pair.
- **`.tf-input-uom` / `.tf-uom` (NEW) — the unit beside the box.** `[50] %`,
  `[10] months`, `$ [25000]`. Currency takes the prefix slot and everything
  else the suffix slot, which is the reading order for each. The input now
  takes the space the unit leaves instead of stretching to the column, so the
  box looks the size of the answer it wants.
- **Number fields lose their spinners.** `appearance: textfield` plus the two
  `::-webkit-*-spin-button` pseudo-elements. Stepper arrows invite nudging a
  value one at a time, which is the wrong affordance for "$25,000" or "12.5%" —
  these are typed. Removing them also reclaims width inside an already narrow
  box. Money and percent fields now accept **two decimal places**
  (`step="0.01"`); months and years stay whole numbers.
- **`.tf-assume-group` (NEW) — sub-groups within a step.** Step 1 now opens
  with **General assumptions** (horizon, business start month) before **Revenue
  assumptions**, because those two answers frame every other one — everything
  below is measured from them. Quieter than the panel's own h2, with a light
  rule under the heading.
- **`.tf-label-sub` (NEW) and a scoped `.tf-field-row` fix.** The payment-terms
  pair reads "Upfront [50] %" / "On completion [50] %", the sub-labels quieter
  than the group label so the pair is one question, not two. `.tf-field-row`'s
  shared `1fr 1fr` resolves as `minmax(AUTO, 1fr)`, so the column holding the
  longer sub-label won more width and the two boxes rendered visibly different
  sizes (109px vs 152px, caught by measurement). `minmax(0, 1fr)` equalizes
  them, **scoped to `.tf-assume-group`** rather than changed in the shared rule,
  which `contact.html` also uses.
- **Validation moved from arrival-time to live.** Every numeric field now
  carries its own range and its own error line, checked as you type rather than
  only on reaching step 3. Out-of-range values are REPORTED, not clamped — a
  conversion rate typed as 150 used to silently become 150% and produce 1.5
  clients per lead. `readAssumptions()` stays the single place every rule
  lives; validating live is just calling it and discarding the result, so there
  is one definition of "valid" and two moments of use.

*Step 2 — costs*

- **Group explanations became visible** in the same `.tf-explained` shape, to
  the right of each group heading.
- **`$` prefix on every amount**, and the amount column widened 110px → 140px
  to hold it. Same no-spinner, two-decimal treatment as step 1.

*Step 3 — the chart, substantially rebuilt*

- **One shared `$0` line, drawn in ink.** Revenue rises above it; **total costs
  now hang BELOW it** rather than sitting beside revenue on a shared positive
  baseline; and cumulative net cash crosses it whenever the running position is
  negative. The line is drawn LAST so it reads as the chart's spine rather than
  something the bars sit on.
- **The two axes are pinned so zero falls at the same height on both.** This is
  the part with teeth. The bars and the cumulative line are on different scales,
  and without pinning the ink line would be truthful for the bars and a lie for
  the dashed line — the one thing a two-axis chart must not do. `zeroScale()`
  always spans zero and always puts a TICK on zero; `alignZero()` then extends
  whichever axis has less room on its short side, only ever growing a range so
  no data point can be pushed out of the plot. Ticks are generated OUTWARD from
  zero so the spacing stays even after that stretching. Verified by measurement:
  both `$0` labels render at the same y.
- **Bars lose their 2px strokes.** `--tf-chart-4` and `--tf-chart-1` are no
  longer read at all. The series are told apart by SIDE of the zero line as
  well as by hue, so the stroke was carrying nothing; `.tf-chart-swatch` drops
  its border to match, since a legend must not key a mark the chart no longer
  draws. Plot height 210 → 230 to absorb the space the below-zero half needs.
- **Watch item:** with no stroke, the bars are `--tf-wash-*` fills alone, which
  is a pale mark on `--tf-paper`. It survives print (the `print-color-adjust:
  exact` rule already covers it) and it is what the review asked for, but if
  the bars ever read as too faint the fix is a deeper fill token, not the
  return of the border.

**Round 3 — second review, 2026-08-01.** Seventeen findings. Paired with
STYLE.css v046.

*Step 1 and 2 — the forms*

- **Every entry box is now the SAME width** (`--tf-entry-w`, 180px), whether or
  not it carries a unit and whatever the unit says. The width is set by the
  widest control in the set — a native `<input type="month">` showing
  "September 2026" plus its own calendar affordance — and the others match it
  rather than the other way round. A field with no unit gets the width
  explicitly, otherwise it stretched to the whole column and towered over its
  neighbours. Verified by measurement: all eight step-1 boxes at 180px.
- **A currency prefix moved INSIDE the box's own left padding**, via
  `.tf-uom-pre` and the `:has()` mechanism `.tf-choice:has(input:checked)`
  already uses. Sitting outside, "$" pushed that one field's left edge right of
  every other field's — boxes that were the same WIDTH stopped sharing a left
  EDGE, which reads as worse alignment than the inconsistent widths it had just
  replaced. All eight boxes now measure the same left and the same width.
- **`.tf-explain-note` drops to `--tf-text-xs`** (12px against the label's
  14px), so the pair reads as question-then-gloss rather than two competing
  headers, with a 2px nudge so the smaller text's first line sits level with the
  label's — top-aligning the BOXES leaves smaller type visibly high. Same 2px
  idiom as `.tf-cost-badge` / `.tf-step-nav-desc`.
- **`.tf-repeat-del` / `.tf-repeat-add` became ICONS** — "×" and "+", each with
  both an `aria-label` and a `title`, since a bare glyph carries no name on its
  own. The words were the actual bug: with "Remove" on the end the grid's last
  track could not shrink and **the row overflowed the card's right border**. Two
  fixes, both needed — the last column is now a fixed 28px rather than `auto`,
  and `.tf-repeat-row > * { min-width: 0 }` stops the description input's
  intrinsic min-content width from becoming the `1fr` track's floor. Measured
  after: row right edge 1175 inside the card's 1201.
- **`Start over` (NEW behaviour, no new pattern)** — a `.tf-pill
  .tf-pill-outline` in each panel head that empties **every** box and removes
  every cost row, returning to step 1. It **asks before it wipes**, by
  relabelling itself to "Clear everything?" rather than opening a dialog: the
  sheet has no modal pattern, and inventing one for a single control would be
  the larger change. It disarms on blur or on any other click.
  **A blank sheet means blank, prefills included** (corrected on review — a
  first pass restored the opening defaults and re-seeded the months from the
  machine clock, which is "reset", not "start over"). The page's own `value=`
  attributes still prefill on FIRST load, where a sensible starting point
  helps; `placeholder=` on each numeric field keeps the expected shape of the
  answer visible once the box is empty.
  **This forced a change to when errors are shown.** Emptying every box makes
  every box invalid, so a form that reports on sight would answer "Start over"
  with a wall of red for questions nobody has been asked yet. Errors are now
  displayed only once a field has been TOUCHED, or once the projection is
  asked for — at which point every outstanding message is revealed at once and
  the projection blocks. The rules themselves are untouched and still live in
  one place; only the moment their message appears changed.
- Copy: tips reworded throughout and shortened; "Approach to signing" became
  **"Sales cycle time"**; the leads unit shortened to "leads"; the payment-terms
  note lost its "the two must total 100%, type one and the other fills in"
  sentence, which the control demonstrates by doing it.

*Step 3 — the chart*

- **One column per period, not two side by side.** Revenue stacks upward from
  zero and total costs stack downward from the SAME x, so a period's money in
  and money out are read on a single vertical instead of compared across a gap.
  Bar width 14.5 → 22 with the grouping gap gone.
- **The legend stops explaining the geometry** — "Revenue (above $0)" is back to
  "Revenue". The chart shows which side each sits on; the legend saying so as
  well was labelling the obvious.
- **Panel title → "Cash Flow Projection"**, in the step rail as well as the h2.

*Step 3 — the summary block, `.tf-cost-summary` renamed `.tf-summary`*

- It now carries **total revenue, total cost, total commission, breakeven month
  and end cash** instead of the cost-type breakdown (one-time / annual /
  monthly / commission) it held first. **This supersedes the original brief's
  requirement** for a by-cost-type block "so the breakdown survives to print and
  PDF" — the breakdown was detail; these five are the answers a reader opens the
  page for. Total revenue was missing entirely from the first build, which is
  what surfaced it. **Breakeven** is new arithmetic, not a re-display: the first
  period whose CUMULATIVE cash is non-negative, i.e. the month the business has
  earned back everything it has spent to date, or "Not within the horizon". The
  generated PDF's summary line was changed in the same commit — it restated the
  old four cost totals and would otherwise have disagreed with the page.

**Open question, recorded not resolved — client counts.** The review's reword
for the conversion tip read "% of leads that are converted to a paying customer,
**round to a full person**". Rounding client counts to whole people would
reverse the original brief's explicit "FRACTIONAL, never rounded", and it is not
a display change: rounding 0.7 clients to 1 in every month compounds into a
materially different revenue line over 36 months. The tip is reworded as asked;
**the math is deliberately left fractional** pending a decision, since guessing
either way silently changes every number on the page.

**Round 4 — third review, 2026-08-01.** Eleven findings. Paired with STYLE.css
v047. The tool is **renamed** in this round: "Consultancy Cashflow Projection"
becomes **"Simple Cash Flow Projection"**, and the slug follows it from
`tool-consultancy-cashflow.html` to `tool-cashflow-projection.html`. TOOLS.md §1
holds slugs stable against title edits, but nothing had shipped yet — the rename
is free now and would not have been later. `tool-002` is unchanged, since an ID
never moves. SCOPE.md §3 names this page as a jsPDF consumer and is corrected in
its own direct-to-main commit.

- **Nothing is prefilled any more.** Not the numbers, not the months. This
  **supersedes the original brief's defaults** — horizon 3, start month = the
  current machine month, sign lag 2, duration 3, 50/50 terms. The page opens as
  a blank sheet; `placeholder=` carries the shape of each expected answer. The
  touched-gating from Round 3 is what makes this bearable: a blank form is an
  invalid form, and without it the page would open shouting.

- **TWO entry widths, not one — and the reason is measured.** Round 3's single
  shared width was the wrong resolution of a real conflict. A native
  `<input type="month">` must hold "September 2026" — **129px of text at the
  field's own 16px, plus 28px padding, 4px border and the ~22px the browser
  reserves for its picker indicator: 183px**. Pinning every box to that floor is
  what made a two-character answer sit in an absurd box; pinning the month
  picker down to a numeric width clips the year behind the icon, which is what a
  150px pass actually did. So `--tf-entry-w` is **120px** for numeric entries and
  `--tf-entry-month-w` is **190px** for month entries. Every box of a kind
  matches every other of that kind, and both kinds share a left edge — which is
  what the original raggedness complaint was about: boxes that stepped in and
  out with the length of the unit word beside them.

- **`max-width`, not `flex-basis` — a real bug.** Round 3 pinned the box with
  `flex: 0 0 180px`, which cannot shrink. In any track narrower than itself —
  the payment-terms pair, and the cost row's Amount column — the box overflowed
  and butted straight into its neighbour with **no gap at all**, so two boxes
  read as one control. Capping instead of pinning gives the same even width
  wherever there is room and lets the box yield where there is not. Measured
  after: 43px between the payment-terms pair, 16px between every cost-row field.

- **Cost and commission are separated everywhere** — chart, table and summary.
  The model now carries `opex` (every entered cost) apart from `commission`
  (the one outgoing that moves with revenue rather than with the plan), with
  `costs` still the two together for the net line. In the chart the below-zero
  bar became a **stack**: entered costs in `--tf-wash-brick`, commission beneath
  in `--tf-wash-plum`. Plum enters this tool's palette here; it is already in
  the sheet's data set and needs no new hue. The legend drops "Total" and gains
  the third key. *(SUPERSEDED in Round 6 — plum sits too close to brick at
  wash strength; commission moved to `--tf-wash-slate`.)*

- **Table: `Cost` and `Commission` as separate columns, and single-month
  `Net cash` removed** — it was the arithmetic of the three columns beside it,
  and Cumulative cash is the figure a reader follows down the page. Type steps
  down to `--tf-text-xs`, scoped to `.tf-projection-table`, since this table
  runs to 36 rows and 7 columns where tool-company-setup's run to 9 and 12 and
  keep the shared 14px. Periods read as **MMM-YY** ("Aug-26", "Q3-26"): a
  36-row column of "September 2026" spends most of its width on the word.

- **`.tf-summary` splits into two `.tf-summary-row`s** — the three horizon
  totals, then breakeven month and end cash. Five equal-looking numbers on one
  row read as an undifferentiated strip.

**Round 5 — fourth review, 2026-08-01.** Six findings, three of which turned
out to be one thing. Paired with STYLE.css v048.

- **`.tf-monthpick` (NEW) — our own month control, replacing
  `<input type="month">`.** Three separate findings — boxes still not one width,
  "February 2026" instead of "Feb-26", and a dropdown calendar rendering in
  Arial — all have the same cause: **the native control cannot be made to do
  any of them.** The browser formats the value in its own locale with no hook to
  change it; its calendar lives in shadow DOM the page cannot reach, so it
  draws in the UA font; and "September 2026" plus the picker indicator sets the
  measured 183px floor that forced the two-width compromise of Round 4. There is
  no styling fix — only replacement.
  The control is a `<button>` showing MMM-YY over a hidden input carrying
  `YYYY-MM`, with a popover holding a year stepper and a 12-month grid. Every
  part inherits `--tf-font-body`, which is the point. Selected state reuses the
  `--tf-wash-brick` + brick treatment the choice kit and view toggle already
  use. Months before the start month are **disabled in the grid**, so the floor
  is visible in the control instead of only reported after the fact. The hidden
  input dispatches a bubbling `change`, so every existing rule in the engine
  treats the widget exactly like a typed field.
  **Consequence: ONE entry width again.** With "Feb-26" shorter than "25000",
  `--tf-entry-month-w` is deleted and every box on both input steps is 120px on
  a shared left edge — what Round 3 asked for and Round 4 could not deliver.
  **The one shadow in the sheet** is here: a popover must read as floating above
  the form rather than as another panel in it. Derived from `--tf-ink` via
  `color-mix`, the `--tf-cream` idiom, so it introduces no colour.
  The widget's internals are built by the JS rather than authored in the page,
  unlike the cost-row `<template>`s. Deliberate: a hidden input keeps the value
  where the rest of the engine already looks for it, and a popover's guts are
  chrome, not content.

- **Placeholders removed.** A greyed "3" sitting in the box still reads as
  prefilled data — the complaint was right, and `placeholder=` was my own
  addition, not part of the brief. Numeric fields are now genuinely empty. The
  month control keeps "MMM-YY", which states a FORMAT rather than a value, and
  is stone for the same reason.

- **Cost amounts were never validated — a real hole.** Step 1's numbers were
  range-checked from Round 2, but the repeatable rows' Amount fields were read
  straight through `parseFloat(..., 0)`. An `<input type=number>` accepts
  exponent notation, so **"e45" sat in the box looking like an entry while
  `.value` read empty and the model silently used 0.** Every row's amount is now
  checked for unparseable, negative and missing, and named in the blocking list.
  Step 1's fields additionally consult `validity.badInput`, which is the only
  way to tell "the box contains something unparseable" from "the box is empty" —
  `.value` reports both as `""`.

- Copy: "The share of leads that convert to a paying client" → "Of the leads you
  approach, the percentage that become paying clients."

**Round 6 — fifth review, 2026-08-01.** Three findings, all about restraint.
Paired with STYLE.css v049.

- **Errors no longer fire while a field is being filled in.** The complaint was
  literal and correct: a freshly added cost row was told, before it had been
  touched, that its empty Month field was "dated before the start month". Two
  faults behind it. First, an UNCHOSEN month was being tested against the start
  month at all — it is not dated too early, it is not dated. Missing and
  too-early are now separate conditions with separate messages, and missing
  never speaks while the form is being filled in. Second, the moment of display
  moved: a field is promoted to "touched" on **change / focusout**, not on
  `input`, and an error is never shown for the field that currently holds
  focus. Typing is silent; leaving a field with a genuinely wrong value speaks;
  correcting it clears immediately, without waiting for another blur. The
  touched set is keyed by ELEMENT (a `WeakSet`) rather than by id, because the
  repeatable rows have no ids.
  A real bug fell out of writing this: the per-row amount check had been
  writing to `err-amounts`, an id that **does not exist in the page**, so
  `setError` silently returned and no amount error had ever been displayed.
  Each cost group now has its own `err-amt-*` slot beside the rows it belongs
  to.

- **The aggregated error block is gone entirely.** `.tf-callout-warn` on step 3
  listed every outstanding problem at once, which after "Start over" — a
  control whose whole job is to empty the form — meant eleven red lines for
  questions nobody had been asked. It is replaced by **`.tf-empty-note`
  (NEW)**: one sentence, body colour, no icon, naming the step that is
  unfinished so an abandoned half-filled row is not a silent dead end.
  Step 3 also stops forcing every inline message out on arrival. Problems are
  reported where they happen, as they happen.

- **Commission moves from `--tf-wash-plum` to `--tf-wash-slate`.** Plum and
  brick are neighbouring warm tints and read as the same bar at wash strength,
  which defeated the point of splitting cost from commission. Slate is cool
  against both. No new token — it is already in the data set.

- **"Start over" clears on one click.** The arm-then-confirm relabel introduced
  in Round 3 was rejected: it read as the button not working, particularly from
  step 3, where the second click frequently landed after something else had
  disarmed it. The control clears **every step**, which it always did — the
  two-step interaction was what obscured that.
