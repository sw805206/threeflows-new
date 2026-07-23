v016 | last updated: 2026-07-23

# BACKLOG.md — threeflows-new

Part C backlog process (CLAUDE.md) applies. This file is the source of
truth; items are raised in chat, held in the running block, and flushed
here on the user's request. Also holds the page checklist and carry-over
inventory status (per SCOPE.md).

**Categories:** process, feature, page, bug, governance, others
**Status flow:** open → review → close; or park / discard.
Code never self-closes: done items move to review; only the user closes,
with evidence in Closed-by (PR## for code, or the user's stated reason).

**Direct-to-main:** routine bookkeeping on this file — recording state on
existing rows, and flushing the running block — is committed directly to
main and pushed immediately, no branch or PR. Structural changes to the
table's rules or shape need a PR like any governance change. Definitions
of routine vs structural live in CLAUDE.md Part B → **Exception — routine
backlog bookkeeping goes direct to main**; they are not repeated here.

## Backlog

| ID | Status | Category | Item | Raised | Closed-by |
|---|---|---|---|---|---|
| BL-001 | open | process | Cutover: domain flip to this repo per SCOPE.md (verify preview → detach domain from old repo → attach CNAME + custom domain here → verify Cloudflare DNS → spot-check live → archive old repo) | 2026-07-15 | |
| BL-002 | close | governance | SCOPE.md v002: add rule "Style-system changes identified but not immediately implemented are logged to BACKLOG.md — never left untracked."; trim Open decisions now tracked here (BL-007, BL-008) | 2026-07-15 | User ratified; verified in SCOPE.md v003 (style-tracking rule + trimmed Open decisions present) |
| BL-003 | discard | feature | Current-page nav underline affordance (ink text + 2px brick underline) — implemented in PR#1, then removed by user design decision | 2026-07-15 | User: underline removed by design decision |
| BL-004 | open | feature | Footer buildout: decide what the minimal footer grows into (nav links, contact info, tagline) | 2026-07-15 | |
| BL-005 | open | feature | Tagline: placeholder "Beside you, start to scale" is TBD in STYLE.md — confirm or replace; placement decision held (nav ruled out; hero/footer candidates) | 2026-07-15 | |
| BL-006 | close | process | STYLE.css foundations review: check brand package against hard constraints and foundation coverage before page builds | 2026-07-15 | OBSOLETE — precondition no longer applicable: 12+ pages are built and STYLE.css advanced v1→v013 through the ratchet process, which now serves as the ongoing audit this row described |
| BL-007 | open | page | Blog restyling depth: full restyle vs minimal carry-over styling for old post bodies (SCOPE.md open decision) — rescoped 2026-07-16: launch trio was rewritten (moot for them); question now covers the 17 remaining carry-over posts (8 of 25 built as of 2026-07-23) | 2026-07-15 | |
| BL-008 | close | page | Hidden pages triage: carry all vs keep/kill per page, decided during carry-over inventory (SCOPE.md open decision) — dispositions now applied in the inventory close-out below (keeps: surveys/svy001/svy002; kills: tool-ref001/mtl001/stylebook) | 2026-07-15 | User ratified; dispositions applied in inventory close-out (BACKLOG §B/§E) |
| BL-009 | open | page | Tool URL scheme + tool page rebuild phase; logic moves to separate JS files per SCOPE | 2026-07-15 | |
| BL-010 | open | page | Placeholder mentions currently plain text — blog-001: "our seminars page"/"our home page"/"our about page"; blog-002 & blog-003: "Contact us"; disposition per post is a user content decision (linkify, leave, or drop) once target pages have content | 2026-07-16 | |
| BL-011 | close | governance | No-italics rule: STYLE.md rule + 4 em/i converted + defensive .tf-prose normalization — user-ratified, closes with style commit as evidence | 2026-07-16 | User ratified; no-italics rule shipped in style commit ec340df |
| BL-012 | open | feature | Deferred blog body patterns — define on first post needing each, per ratchet. **2 of 4 SHIPPED (2026-07-23):** `.tf-prose-table` shipped (STYLE.css v7, in use on 3 pages) and `.tf-callout` shipped (first live use on business-planning, in use on 4 pages). **REMAINING 2:** `.tf-stat-grid` — CSS exists in STYLE.css but has 0 consumers, still awaiting first use; `.tf-disclaimer` — never defined, no CSS and no consumers | 2026-07-16 | |
| BL-013 | close | process | Sitewide image process: repo-local assets, slots as CSS patterns on first use, Code processes/wires, optional manifest image field; rail slot (3:2) built — remainder pending first real images; document with add-a-post process | 2026-07-16 | User ratified 2026-07-18; process documented in BLOG.md §7 (af77d54) — external master /Users/swai/Images, disposable src/preview, post-merge purge |
| BL-014 | open | governance | Inventory reconciliation in BACKLOG.md: §B redirect map rewritten for slug scheme (all 25 posts need old→new redirects, identity rows void); §D header note (table = old repo as-found; new-site truth is bloglist.json) + note blog-002 retitle and blog-003 re-date divergences. **PROGRESS 2026-07-23:** both halves actioned — §B's void identity row replaced with 25 enumerated old blog URLs, and the §D header note added (old-repo-as-found vs `bloglist.json` as new truth, incl. the blogID RENUMBERING discovered during the rewrite, plus the blog-002 retitle and blog-003 re-date). Mapping was derived by title+date, not blogID, since the manifest renumbers IDs. **STILL OPEN — user decision:** 8 of 25 posts are carried and mapped; the other **17 have no slug page** and are marked with no target rather than an invented one, so those old URLs still 404 at cutover. Decide: interim redirect (e.g. → blogs.html, matching the §B "(assumed)" idiom) or hold each until its post is built | 2026-07-16 | |
| BL-015 | close | process | Add-a-post process doc: manifest schema (5 fields + optional image/related), slug convention, MD→HTML conversion rules (no-italics → strong, placeholders plain), title ≤2-line / recap ≤3-line budgets + line-count check at post-add, image workflow, title-suffix rule | 2026-07-16 | Shipped as BLOG.md (17997bf); refined 58d59df, af77d54 |
| BL-016 | close | page | blogs.html index build: consume manifest, card kit first use, published-only, date-descending, thumbnails from image field | 2026-07-16 | e337c40 (matches §A latest-substantive) |
| BL-017 | open | feature | Related-articles: optional `related` field (blogID array) in bloglist.json, rendered block at post end | 2026-07-16 | |
| BL-018 | open | bug | Reading-time scope (BLOG.md §6 / blog.js) counts non-prose text: any inline `<style>`/`<script>` inside `.tf-prose`, plus in-figure UI labels, are tallied as words. Surfaced on blog-007, where the placement-map component inflated the count 1415->1908 (+35%, 7 min shown as 9). Worked around there by moving the component's style/script outside `.tf-prose`; the durable fix is to exclude `style, script` from the clone in blog.js and record it in §6 | 2026-07-18 | |
| BL-019 | open | governance | BLOG.md §7 hero alt-text exception undocumented: §7 mandates descriptive, user-approved alt for post images, but a page HERO renders through a CSS `background-image` (`--tf-page-head-img`) and structurally CANNOT carry alt at all. references.html's hero has none — the hero is decorative and the h1 is the accessible heading. As written, every hero reads as non-compliant with §7. Record it in §7 as an explicit, sanctioned exception (decorative hero → no alt, h1 carries the heading), so the rule's silence isn't mistaken for an oversight | 2026-07-19 | |
| BL-020 | open | governance | BLOG.md §7 step 4 naming + wiring are post-only: it directs promotion to `assets/images/<slug>.jpg` "matching the post slug" and to "wire the manifest (`image` + `imageAlt`)" — a page hero has neither a post slug nor a manifest. Shipped precedent (references.jpg → `assets/images/references.jpg`, wired inline as `style="--tf-page-head-img: url(...)"`) is unwritten, so the hero path gets improvised each time. Specify it in §7: bare page-name.jpg + inline custom property. Dimensions need no hero-specific target — references.jpg measures 1200x800 3:2, identical to §7's existing preview spec | 2026-07-19 | |
| BL-021 | close | style | Footer color reconciliation with Claude Design: ground and link ratified as color-mix derived tokens (ground = ink 75% + stone; link = brick-on-ink 45% + paper), provisional flags cleared, stone-bar contrast resolved (~4.3:1), §2 palette rule corrected to reflect the four inks + scoped exceptions + existing data palette. Recorded in STYLE.md §6 | 2026-07-20 | User ratified; shipped in PR #26 (16f0598) |
| BL-022 | open | feature | Review `--tf-footer-ground` against a real CTA band. **BLOCKER CLEARED 2026-07-23:** `.tf-cta` now ships LIVE on all four service pages (business-planning, sourcing-support, launch-hypercare, ongoing-management), so the CTA-above-footer stacking the token was designed for is real and on-screen — the row is actionable now. Verify the ink CTA band and the warm-stone footer ground read as two distinct bands (separated on TONE alone, no seam or hairline) on a live page | 2026-07-20 | |
| BL-023 | open | page | Ship the Services two-tier nav rewrite in partials.html. SCOPE.md describes the six-link structure (Pathfinder, Runningmate, divider, then business-planning / sourcing-support / launch-hypercare / ongoing-management) and `.tf-dropdown-divider` exists in STYLE.css. **PARTIALLY DONE:** the nav now points at the four DETAIL pages with SCOPE's short labels (Plan / Source / Launch / Grow), which un-orphans them, and the four superseded `service-*.html` shells were deleted with §B redirects added. **STILL PENDING (why this stays open):** the TWO-TIER structure — the Pathfinder + Runningmate overview tier and the `.tf-dropdown-divider` between the tiers — is deferred because `pathfinder.html` and `runningmate.html` do not exist yet; the panel remains ONE flat tier until they are built | 2026-07-20 | |
| BL-024 | close | refactor | 22 shell pages carry the partials-injection script inline in 3 near-identical variants (13/8/1) — copy-pasted duplication. Centralize into a single `assets/partials.js` loaded via `<script src>`, so injection logic (and future needs like footer auto-year) live in one place. Surfaced by the © line task. **Review:** centralized in `assets/partials.js`; all 22 inline copies removed and replaced with `<script src="assets/partials.js" defer></script>`. The 3 variants were verified byte-identical after normalizing comments/whitespace, so V1 (fully commented) was adopted verbatim — behavior unchanged. All 22 pages verified on localhost (inject, aria-current, dropdowns incl. Esc/outside-click/resize-crossing, hamburger). Branch `refactor/partials-js` | 2026-07-20 | User ratified; shipped in PR #38 (0d91e2d) |

## Inventory / page checklist

Carry-over inventory extracted **read-only** from the old repo's FILES
(`/Users/swai/sw805206/threeflows-website`) on 2026-07-15 — its `.md`
governance docs were not read. Mappings follow SCOPE.md → Site structure.
The user's close-out decisions have now been applied throughout (redirect map
finalized, keep/kill assigned); items still needing confirmation are listed in
section I.

### A. Page checklist (new pages to build)

Shells for the 13 top-level pages already exist (PR#1) as placeholders, so a row
at `open` means the content build has not happened — not that the file is absent.
Blog posts and the calculator MVP page come later.

**Status vocabulary — §A uses the BL table's flow: open → review → close.**
`open` = not built; `review` = built, awaiting human ratification; `close` =
ratified, with evidence (the shipping SHA) in Closed-by. Code never self-closes.

**Closed-by tracks the LATEST SUBSTANTIVE commit, not the first.** When a page
already at `close` is materially changed, its Closed-by SHA moves to the most
recent substantive commit — always a SINGLE SHA, never an accumulating list, since
git carries the full history and the row does not duplicate it. **Substantive** =
a change to what the page PRESENTS or how it is BUILT (a new section, a
layout/pattern change, a migration); typo, copy and whitespace fixes are not, and
leave the SHA alone. The page **stays `close`** — a material change did not
un-build it — so only the evidence moves, never the status. Updating a Closed-by
SHA under this rule is ROUTINE bookkeeping (direct-to-main per the PR#10
exception), not a structural change.

| New page | Source old page(s) / notes | Status | Closed-by |
|---|---|---|---|
| index.html | index.html | open | |
| business-planning.html | svc1.html — renamed from the `service-planning.html` shell per SCOPE.md v010 Services restructure (ex-svc1, &ldquo;Plan&rdquo;). Built as the tier-2 Plan detail page (intro-split opener, painpoints/solves 2-up, flow+FAQ band, CTA) — the pattern-setter the other three repeat. Nav-linked as &ldquo;Plan&rdquo;, §B redirect retargeted to this filename, and the superseded shell deleted, all in PR #37 | close | a9de501 |
| sourcing-support.html | svc2.html — renamed from the `service-sourcing.html` shell per SCOPE.md v010 Services restructure (ex-svc2, &ldquo;Source&rdquo;). Built as the tier-2 Source detail page — a TEMPLATE REPEAT of business-planning.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Nav-linked as &ldquo;Source&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 1c32acc |
| launch-hypercare.html | svc3.html — renamed from the `service-launch.html` shell per SCOPE.md v010 Services restructure (ex-svc3, &ldquo;Launch&rdquo;, Runningmate). Built as the tier-2 Launch detail page — a TEMPLATE REPEAT of sourcing-support.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Nav-linked as &ldquo;Launch&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 228aa43 |
| ongoing-management.html | svc4.html — renamed from the `service-management.html` shell per SCOPE.md v010 Services restructure (ex-svc4, &ldquo;Grow&rdquo;, Runningmate). Built as the tier-2 Grow detail page — a TEMPLATE REPEAT of launch-hypercare.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Completes the four detail pages. Nav-linked as &ldquo;Grow&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 3da0495 |
| blogs.html | blog.html + bloglist.json | close | e337c40 |
| references.html | useful-websites.html — shipped as a data-driven directory backed by `references.json` + `assets/references.js`, both new files not previously recorded in §A | close | 43209ed |
| seminars.html | webinars.html (+ livestream.html folded in via redirect) | open | |
| tools.html | free-tools.html (shell only; individual tool pages deferred — BL-009) | open | |
| about.html | about.html | close | 086e26b |
| contact.html | built fresh — new form + new endpoint (inquiry.html / intake.html redirect in; their old endpoints not carried) | open | |
| privacy.html | privacy.html | close | a4c843d |
| surveys.html | surveys.html | open | |
| svy###.html (survey pages) | svy001.html, svy002.html — kept; redesigned later; existing Apps Script endpoints carried | open | |
| blog-&lt;slug&gt;.html (posts) | blog-001…024 incl. 010a/010b (25 posts) — the new repo ships **slug filenames** per BLOG.md §1 (e.g. `blog-welcome-to-three-flows.html`); `blog-###` survives only as the manifest key (`blogID`). Slug scheme for the §B redirect map tracked in BL-014. **8 of 25 built** (verified on disk 2026-07-23) | open | |
| Calculator MVP page (filename TBD) | no old-repo source — the SCOPE MVP page, built fresh; deferred/placeholder until built. Added so the cutover gate counts it | open | |

### B. URL redirect map (old → new — Cloudflare Redirect Rules input at cutover)

Finalized per the user's close-out decisions for the non-blog URLs. Rows marked
**interim redirect (assumed)** are the assumed "nothing 404s" redirects the user
will confirm at review.

**Blog rows corrected 2026-07-23 (BL-014).** The former single row mapped
`blog-001…024 → blog-###.html` as "identity — no redirect needed". That was
VOID: the new repo ships **slug filenames**, so every one of those old URLs would
have 404'd at cutover. The 25 old blog URLs are now enumerated individually.
Mapping was derived from `bloglist.json` + disk by matching **title and date** —
NOT by `blogID`, because the new manifest **renumbers** blogIDs (e.g. old
`blog-011` is manifest `blog-005`), so blogID is not a carry-over key.
**8 of 25 are carried** and mapped to their slug page; **17 are NOT CARRIED** (no
slug page exists yet) and are marked with no target rather than an invented one —
those 17 still 404 at cutover until the posts are built or an interim target is
chosen. That decision is open; see BL-014.

| Old URL | Destination | Note |
|---|---|---|
| index.html | index.html | identity |
| about.html | about.html | identity |
| contact.html | contact.html | identity (contact built fresh — new form + new endpoint) |
| privacy.html | privacy.html | identity (hidden; footer link) |
| surveys.html | surveys.html | identity (hidden cover; kept, redesigned later) |
| blog.html | blogs.html | redirect |
| blog-001.html | blog-welcome-to-three-flows.html | redirect — CARRIED (matched on title + date 2025-03-05) |
| blog-002.html | blog-cut-import-costs.html | redirect — CARRIED (date 2025-04-29 matches; RETITLED, the §D-flagged blog-002 divergence) |
| blog-003.html | blog-factory-data.html | redirect — CARRIED (title matches; RE-DATED 2025-06-09 → 2025-05-21, the §D-flagged blog-003 divergence) |
| blog-004.html | — | **NOT CARRIED** — "Navigating the US-China Tariff War" has no slug page; target pending (see BL-014) |
| blog-005.html | — | **NOT CARRIED** — "Why Data Integrity Is the Foundation…"; target pending (see BL-014) |
| blog-006.html | — | **NOT CARRIED** — "Is FedEx's 2026 Rate Increase Really Just 5.9%?"; target pending (see BL-014) |
| blog-007.html | blog-warehouse-placement-case-study.html | redirect — CARRIED (distinctive title match; re-dated 2025-11-17 → 2025-09-22) |
| blog-008.html | — | **NOT CARRIED** — "Is a $1.40 Product Worth Selling in the US?"; target pending (see BL-014) |
| blog-009.html | — | **NOT CARRIED** — "Why Your Whatnot Livestream Needs a Sell-Through Model…"; target pending (see BL-014) |
| blog-010a.html | — | **NOT CARRIED** — "Dedicated 3PL Service Can Cost $23.33 Per Order…"; target pending (see BL-014) |
| blog-010b.html | — | **NOT CARRIED** — "The Fifth M: Why Measurement…"; target pending (see BL-014) |
| blog-011.html | blog-obbba-business-provisions.html | redirect — CARRIED (exact title + exact date 2025-07-06); NB new manifest renumbers this as blogID blog-005 |
| blog-012.html | blog-amazon-two-new-policies.html | redirect — CARRIED (exact title + exact date 2025-08-04); NB new manifest renumbers this as blogID blog-006 |
| blog-013.html | — | **NOT CARRIED** — "Which Marketplace Actually Costs Less?…"; target pending (see BL-014) |
| blog-014.html | — | **NOT CARRIED** — "Inside Amazon's Supply Chain…"; target pending (see BL-014) |
| blog-015.html | — | **NOT CARRIED** — "How Amazon Built a Global Logistics Network…"; target pending (see BL-014) |
| blog-016.html | — | **NOT CARRIED** — "The Little Red Button…"; target pending (see BL-014) |
| blog-017.html | — | **NOT CARRIED** — "Amazon's US Warehouse Network…"; target pending (see BL-014) |
| blog-018.html | blog-amazon-inbound.html | redirect — CARRIED (Amazon-inbound topic match, title reworded); NB new manifest renumbers this as blogID blog-004 |
| blog-019.html | — | **NOT CARRIED** — "From Shelf to Doorstep…"; target pending (see BL-014) |
| blog-020.html | — | **NOT CARRIED** — "The Culture That Built Amazon…"; target pending (see BL-014) |
| blog-021.html | — | **NOT CARRIED** — "Test Before You List…"; target pending (see BL-014) |
| blog-022.html | — | **NOT CARRIED** — "Cashflow: Your Unit Economics Over a Time Horizon"; target pending (see BL-014) |
| blog-023.html | blog-sourcing-strategy-2x2.html | redirect — CARRIED (near-identical title); NB new manifest renumbers this as blogID blog-008 |
| blog-024.html | — | **NOT CARRIED** — "Last-Mile Shipping Rates Explained…"; target pending (see BL-014) |
| svc1.html | business-planning.html | redirect (retargeted from the `service-planning.html` shell, deleted at the nav rewrite) |
| svc2.html | sourcing-support.html | redirect (retargeted from the `service-sourcing.html` shell, deleted at the nav rewrite) |
| svc3.html | launch-hypercare.html | redirect (retargeted from the `service-launch.html` shell, deleted at the nav rewrite) |
| svc4.html | ongoing-management.html | redirect (retargeted from the `service-management.html` shell, deleted at the nav rewrite) |
| service-planning.html | business-planning.html | redirect — interim PR#1 shell filename, DELETED at the nav rewrite; mapped so any bookmarked preview URL still resolves |
| service-sourcing.html | sourcing-support.html | redirect — interim PR#1 shell filename, DELETED at the nav rewrite; mapped so any bookmarked preview URL still resolves |
| service-launch.html | launch-hypercare.html | redirect — interim PR#1 shell filename, DELETED at the nav rewrite; mapped so any bookmarked preview URL still resolves |
| service-management.html | ongoing-management.html | redirect — interim PR#1 shell filename, DELETED at the nav rewrite; mapped so any bookmarked preview URL still resolves |
| useful-websites.html | references.html | redirect |
| webinars.html | seminars.html | redirect |
| livestream.html | seminars.html | redirect (folded into seminars) |
| free-tools.html | tools.html | redirect |
| inquiry.html | contact.html | redirect (old inquiry endpoint not carried) |
| intake.html | contact.html | redirect (old intake endpoint not carried) |
| svy001.html | svy001.html | identity (KEPT, hidden; redesigned later; endpoint carried) |
| svy002.html | svy002.html | identity (KEPT, hidden; redesigned later; endpoint carried) |
| tool-ca001, ca002, ck001–004 (6 pages) | tools.html | interim redirect (assumed) — pages deferred to tool-redesign phase (BL-009) |
| tool-ref001.html | tools.html | **KILLED** (conscious drop) + interim redirect (assumed) |
| mtl001.html | index.html | **KILLED** (conscious drop) + interim redirect (assumed) |
| stylebook.html | index.html | **KILLED** (conscious drop) + interim redirect (assumed) |
| blog-000-template.html | — | dev scaffold — not carried; not linked, no redirect |
| tool-ca000-template.html | — | dev scaffold — not carried; not linked, no redirect |
| tool-ck000-template.html | — | dev scaffold — not carried; not linked, no redirect |
| partials.html | (infrastructure) | shared chrome fragment, not a page; new repo has its own partials.html |

Conscious drops (recorded): **tool-ref001, mtl001.html, stylebook.html** — killed,
each with an interim redirect so nothing 404s at cutover.

### C. Form endpoints (Google Apps Script — owner-managed, reused as-is)

| Endpoint `…/macros/s/<id>/exec` | Posts from | Carried? |
|---|---|---|
| `AKfycbwEzk-yjtQHV43rF5RAi0dI57s8J3vEwopsc6V8bYwSZOTZWkS-CdegENA5B-ARzaL7Eg` | all 9 free-tool pages: tool-ca001, tool-ca002, tool-ck001–004, tool-ref001 (+ templates ca000, ck000) | carried — reused when the tool pages are rebuilt (BL-009) |
| `AKfycby4KC-lDutGwu8J_JgJkMHOBqN-KVFzC0imFaOab-PEXs3FP7mwAJDYepPlaEC5SKEH` | svy001.html | carried as-is (survey kept) |
| `AKfycbyMvPNB6akceXedJHSQ68VsaKVLkDo6cRwF-Bkd1mEhE1MPqTjEWwsRwjFZWg3SNF3MVw` | svy002.html | carried as-is (survey kept) |
| `AKfycbzl3TU2fqA9HyNXAvV-roSWrYHuxzP5BDXk3R9lgSTwWc7l2qOyCSGsqhWyh6sZ6724wg` | inquiry.html | **not carried** — inquiry.html redirects to contact.html |
| `AKfycbznBHI_NaNzej3mWMttEKa0zDu4aKbuj740tSzcGg1P7twV-StguqnLXfPxubH8jGUF` | intake.html | **not carried** — intake.html redirects to contact.html |

**contact.html** is built fresh with a **new form + new endpoint** (to be created);
the old inquiry/intake endpoints (D/E above) are not carried.

### D. Blog posts (bloglist.json + files)

**HEADER NOTE (BL-014, 2026-07-23) — this table is the OLD REPO AS-FOUND, not the
new site.** It is a historical inventory captured read-only on 2026-07-15 and is
NOT updated as the new site is built. **The new site's source of truth is
`bloglist.json`**, which currently holds **8 published posts** (verified against
disk: 8/8, no manifest entry without a file and no file without an entry). Do not
read the 25 rows below as the new site's contents.

Known divergences between this old table and the new manifest:
- **blogIDs are RENUMBERED.** The new manifest assigns `blog-001…008` in new
  publication order; they do NOT correspond to the old IDs below. Old `blog-011` is
  manifest `blog-005`, old `blog-012` is `blog-006`, old `blog-018` is `blog-004`,
  old `blog-023` is `blog-008`. Old→new mapping therefore matches on **title/date**,
  never on blogID — see the §B blog rows.
- **blog-002 RETITLED** — "How to Legally Cut Import Costs by Up to 48%…" →
  "Four Ways to Cut Your Import Cost in a Tariff War" (date unchanged).
- **blog-003 RE-DATED** — 2025-06-09 → 2025-05-21 (title reworded).
- Several carried posts were re-dated on the new site (007, 018, 023).

The 25-row table below is retained as-found for redirect derivation and audit.

25 posts in the OLD repo, all `status: published`. One template on disk
(`blog-000-template.html`) was not in the old manifest (expected).

| ID | file | date | status | primary | secondary | title |
|---|---|---|---|---|---|---|
| blog-001 | blog-001.html | 2025-03-05 | published | Others | — | Welcome to Three Flows Solutions: Where Education Meets Execution |
| blog-002 | blog-002.html | 2025-04-29 | published | Source | Compliance | How to Legally Cut Import Costs by Up to 48%: Export Rebates and First Sale Explained |
| blog-003 | blog-003.html | 2025-06-09 | published | Source | Data | Factory Data Problems Are Costing You More Than You Think |
| blog-004 | blog-004.html | 2025-05-12 | published | Source | Compliance | Navigating the US-China Tariff War: Supply Chain Strategies That Actually Work |
| blog-005 | blog-005.html | 2025-07-07 | published | Data | Source | Why Data Integrity Is the Foundation of a Scalable Supply Chain |
| blog-006 | blog-006.html | 2025-07-21 | published | Scale | Data | Is FedEx's 2026 Rate Increase Really Just 5.9%? |
| blog-007 | blog-007.html | 2025-11-17 | published | Scale | Plan, Data | Where Should Your Third US Warehouse Be? |
| blog-008 | blog-008.html | 2026-02-09 | published | Plan | Source | Is a $1.40 Product Worth Selling in the US? |
| blog-009 | blog-009.html | 2026-02-02 | published | Launch | Data | Why Your Whatnot Livestream Needs a Sell-Through Model Before You Go Live |
| blog-010a | blog-010a.html | 2025-06-05 | published | Launch | Data, Setup, Scale | Dedicated 3PL Service Can Cost $23.33 Per Order — or $5.71. The Difference Is How You Set It Up. |
| blog-010b | blog-010b.html | 2025-06-08 | published | Scale | Data | The Fifth M: Why Measurement Is the One That Makes All the Others Work |
| blog-011 | blog-011.html | 2025-07-06 | published | Others | Plan | What the One Big Beautiful Bill Means for Your Business |
| blog-012 | blog-012.html | 2025-08-04 | published | Scale | Launch | Amazon's Two New Policies: What They Mean for Sellers |
| blog-013 | blog-013.html | 2026-02-25 | published | Plan | Launch, Setup | Which Marketplace Actually Costs Less? A 2026 Fee Breakdown |
| blog-014 | blog-014.html | 2025-12-05 | published | Others | — | Inside Amazon's Supply Chain: A View from the Inside |
| blog-015 | blog-015.html | 2025-12-22 | published | Others | — | How Amazon Built a Global Logistics Network from Scratch |
| blog-016 | blog-016.html | 2026-01-12 | published | Others | — | The Little Red Button: What Happens to Amazon When a Blizzard Hits |
| blog-017 | blog-017.html | 2026-01-28 | published | Others | — | Amazon's US Warehouse Network: How 200+ Fulfillment Centers Actually Work |
| blog-018 | blog-018.html | 2026-02-16 | published | Others | Scale | Getting Into Amazon's Warehouse: The Inbound Process Every FBA Seller Should Know |
| blog-019 | blog-019.html | 2026-04-11 | published | Others | — | From Shelf to Doorstep: Inside Amazon's Fulfillment Center Operations |
| blog-020 | blog-020.html | 2026-04-25 | published | Others | — | The Culture That Built Amazon: Leadership Principles, Bar Raisers, and What It Really Takes |
| blog-021 | blog-021.html | 2026-05-03 | published | Plan | Source, Launch | Test Before You List: The Case for Pre-Launch Market Research |
| blog-022 | blog-022.html | 2026-05-20 | published | Plan | Data | Cashflow: Your Unit Economics Over a Time Horizon |
| blog-023 | blog-023.html | 2026-03-25 | published | Plan | Source | Make or Buy? Local or Overseas? How to Think Through Your Sourcing Strategy |
| blog-024 | blog-024.html | 2026-06-03 | published | Source, Data | Launch, Scale, Setup | Last-Mile Shipping Rates Explained: UPS vs FedEx vs USPS (2026) |

**Flags:**
- **blog-010a / blog-010b** — the "010" slot is a *pair* of distinct published
  posts; there is no bare `blog-010.html`. Both are in the manifest and on disk.
- **blogIDs are not chronological** — dates for 004, 009, 010a, 014, 023 fall
  earlier than the preceding ID. The index presumably sorts by the `date` field,
  not by ID. Not a defect; flagged for awareness.
- Primary/secondary tag vocabulary in use: Plan, Source, Launch, Scale, Setup,
  Data, Compliance, Others (carry into the new blog's tag system).

### E. Hidden pages (not in the old nav)

Old nav = Home, Services (svc1–4), Resources (blog, useful-websites, free-tools,
webinars, livestream), About, Contact; footer = privacy. Everything below is not
in that nav. Keep/kill now assigned per the user's close-out (BL-008).

| Page | What it is | Keep/kill |
|---|---|---|
| privacy.html | Privacy & Terms (footer-linked; kept in new footer) | KEEP |
| surveys.html | Surveys cover page | KEEP (redesigned later) |
| svy001.html | Individual survey (posts to endpoint B) | KEEP (redesigned later; endpoint carried) |
| svy002.html | Individual survey (795 KB, self-contained; posts to endpoint C) | KEEP (redesigned later; endpoint carried) |
| mtl001.html | Materials / slide deck (assets/mtl001/slide-01…20.png) | KILL (interim redirect → index.html) |
| stylebook.html | Internal stylebook | KILL (interim redirect → index.html) |
| inquiry.html | Inquiry form (posts to endpoint D) | DROP page → redirect to contact.html (endpoint not carried) |
| intake.html | Client intake form (posts to endpoint E) | DROP page → redirect to contact.html (endpoint not carried) |
| blog-000-template.html | Blog post template (dev scaffold) | DROP (dev scaffold; not carried) |
| tool-ca000-template.html | Calculator template (dev scaffold) | DROP (dev scaffold; not carried) |
| tool-ck000-template.html | Checklist template (dev scaffold) | DROP (dev scaffold; not carried) |
| partials.html | Shared chrome fragment (infrastructure, not a page) | n/a |

Note: blog posts and individual tool pages are reachable via their in-nav
indexes (blog.html / free-tools.html), so they are not "hidden" — but their
carry-over and URLs still need decisions (see B, D, F).

### F. Free tools

**Decision:** `tools.html` shell stands. The 6 live tool pages are **deferred to a
tool-redesign phase (BL-009)**, where their logic moves from inline `<script>` to
**separate JS files per SCOPE** (the old repo has ZERO standalone `.js` files — all
logic is inline). Each old tool URL gets an interim redirect → `tools.html` so
nothing 404s. `tool-ref001` is a **conscious KILL**. All old tools POST to endpoint
A (carried, reused on rebuild) and validate email via `api.mailcheck.ai`;
calculators use no chart library (pure inline JS).

| Page | Title | Type | What it does | Disposition |
|---|---|---|---|---|
| tool-ck001 | Pre-Launch Planning Checklist | checklist | launch-prep steps; two go/no-go gates | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ck002 | Sample Sourcing Checklist | checklist | Alibaba/1688 sample eval, compliance, supplier verification, go/no-go | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ck003 | Voice of Customer Checklist | checklist | pre-launch validation: questionnaire, MVP testing, packaging, listing review; 3 gates | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ck004 | Company and Brand Setup Checklist | checklist | US entity, EIN, banking, trademark, logo, website, marketplace (US-centric) | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ca001 | Unit Economics & Cashflow Model | calculator | margin + every cash event across the order cycle, month by month | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ca002 | Last-Mile Rate Calculator | calculator | USPS/UPS/FedEx 2026 ground rates, side by side, by zone | deferred → rebuild (BL-009); redirect → tools.html |
| tool-ref001 | Sourcing Strategy Decision Guide | reference / decision | 12 questions → personalised sourcing recommendation, score, action plan | **KILLED** (was already commented out on the index); redirect → tools.html |

### G. Deploy config

- **CNAME** = `threeflows.com` (apex). Old file is apex; SCOPE cutover step 3 says
  `www.threeflows.com`. **Status: pending Cloudflare verification (apex vs www)** —
  blocks the cutover step only; nothing to do now.
- **No `.nojekyll`** file (GitHub Pages runs Jekyll; the site is plain `.html` so
  it likely renders fine, but the new repo may want `.nojekyll` to be safe).
- `.gitattributes` (eol=lf normalization) and `.gitignore` (.DS_Store, .claude/,
  blog draft archives) are dev hygiene — the new repo has its own; nothing to
  carry.
- No CI workflow, no `_config.yml`, no other deploy config.

### H. External dependencies (actually loaded)

| Dependency | Loaded by |
|---|---|
| Google Fonts — **DM Serif Display + DM Sans** (fonts.googleapis.com / fonts.gstatic.com) | ~all 54 pages — this is the OLD font stack; the new site uses Source Serif 4 + Space Grotesk, so it will **not** carry |
| **Chart.js 4.4.1** (cdnjs) | blog-008.html, blog-009.html |
| **D3 7.8.5** (cdnjs) | blog-007.html |
| **TopoJSON 3.0.2** (cdnjs) | blog-007.html |
| **us-atlas@3** states-10m.json (jsdelivr) | blog-007.html |
| **api.mailcheck.ai** (email validation) | all 9 free-tool pages |
| **Favicon service** — google.com/s2/favicons?sz=32&domain=… | useful-websites.html (link directory) |
| **Unsplash** hotlinked images (images.unsplash.com) | index.html, blog.html, svc1–4.html |

Notes: the many single-host hits (linkedin, shopify, amazon, xero, statista, …)
are OUTBOUND LINKS in useful-websites.html and blog bodies, not dependencies.
`w3.org` hits are SVG/XML namespaces, not a dependency. Only blog-007 (map) and
blog-008/009 (charts) pull JS libs; the calculators use none. Repo-local assets
(`assets/images/client-*.png` logos, `logo_claude.svg`, `red_button.jpg`,
`assets/mtl001/slide-*.png`) are not external.

### I. Close-out — decisions applied & what remains

**Resolved by the user's close-out decisions:**
- **livestream.html** → seminars.html (redirect; folded in).
- **contact / inquiry / intake** → contact.html built fresh (new form + new
  endpoint); inquiry.html and intake.html redirect to contact.html; old
  inquiry/intake endpoints not carried.
- **Individual tool pages** → deferred to the tool-redesign phase (**BL-009**);
  logic moves to separate JS files per SCOPE; interim redirects → tools.html.
- **tool-ref001, mtl001.html, stylebook.html** → **KILLED** (conscious drops),
  each with an interim redirect (ref001/tools.html; mtl001 & stylebook → index.html).
- **surveys.html, svy001, svy002** → **KEPT** (redesigned later; existing Apps
  Script endpoints carried as-is).
- **Dev templates** (blog-000, tool-ca000, tool-ck000) → not carried; unlinked, no
  redirect.

**Remaining / to confirm:**
1. **Interim redirects marked "(assumed)"** — the "nothing 404s" redirects for the
   old tool pages, tool-ref001, mtl001, and stylebook are assumptions the user is
   to confirm at this review.
2. **contact.html new endpoint** — the fresh form needs a new endpoint created
   (owner-managed), replacing the dropped inquiry/intake endpoints.
3. **CNAME apex vs www** — pending Cloudflare verification; blocks the cutover step
   only.
4. **Awareness (no decision needed):** blog-010a/010b pair and non-chronological
   blog IDs (see D).
