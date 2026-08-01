v029 | 2026-07-31 | 243 lines

# BACKLOG.md — threeflows-new

Part C backlog process (CLAUDE.md) applies. This file is the source of
truth; items are raised in chat, held in the running block, and flushed
here on the user's request. Also holds the backlog table and the page
inventory.

**Categories:** process, feature, page, bug, governance, refactor, style, others
**Status flow:** open → review → close; or park / discard.
Code never self-closes: done items move to review; only the user closes,
with evidence in Closed-by (PR## for code, or the user's stated reason).

**Escaping:** a literal pipe inside an Item or Closed-by cell must be written
as `\|`. An unescaped `|` breaks the row for int-backlog.html's parser.

**Direct-to-main:** this file is a governance doc, so per CLAUDE.md Part B
all edits are committed directly to main and pushed immediately — no
branch, no PR.

## Backlog

| ID | Status | Category | Item | Raised | Closed-by |
|---|---|---|---|---|---|
| BL-001 | close | process | Cutover: domain flip to this repo per SCOPE.md (verify preview → detach domain from old repo → attach CNAME + custom domain here → verify Cloudflare DNS → spot-check live → archive old repo) | 2026-07-15 | Cutover completed 2026-07-28 (1c0021c), apex CNAME, old repo archived. Redirect layer dropped by user decision — old URLs 404 by design. |
| BL-002 | close | governance | SCOPE.md v002: add rule "Style-system changes identified but not immediately implemented are logged to BACKLOG.md — never left untracked."; trim Open decisions now tracked here (BL-007, BL-008) | 2026-07-15 | User ratified; verified in SCOPE.md v003 (style-tracking rule + trimmed Open decisions present) |
| BL-003 | discard | feature | Current-page nav underline affordance (ink text + 2px brick underline) — implemented in PR#1, then removed by user design decision | 2026-07-15 | User: underline removed by design decision |
| BL-004 | close | feature | Footer buildout: decide what the minimal footer grows into (nav links, contact info, tagline) | 2026-07-15 | User: current footer is good as an MVP; further buildout added when needed. |
| BL-005 | open | feature | Tagline: placeholder "Beside you, start to scale" is TBD in STYLE.md — confirm or replace; placement decision held (nav ruled out; hero/footer candidates) | 2026-07-15 | |
| BL-006 | close | process | STYLE.css foundations review: check brand package against hard constraints and foundation coverage before page builds | 2026-07-15 | OBSOLETE — precondition no longer applicable: 12+ pages are built and STYLE.css advanced v1→v013 through the ratchet process, which now serves as the ongoing audit this row described |
| BL-007 | close | page | Blog restyling depth: full restyle vs minimal carry-over styling for old post bodies (SCOPE.md open decision) — rescoped 2026-07-16: launch trio was rewritten (moot for them); question now covers the 17 remaining carry-over posts (8 of 25 built as of 2026-07-23) | 2026-07-15 | Answered by practice — 12 posts built under the established carry-over styling. Remaining posts are an ongoing stream, not an open decision. |
| BL-008 | close | page | Hidden pages triage: carry all vs keep/kill per page, decided during carry-over inventory (SCOPE.md open decision) — dispositions now applied in the inventory close-out below (keeps: surveys/svy001/svy002; kills: tool-ref001/mtl001/stylebook) | 2026-07-15 | User ratified; dispositions applied in inventory close-out (BACKLOG §B/§E) |
| BL-009 | open | page | QUESTION: how should tool pages be named and listed once there is more than one tool? With a single tool a manifest is premature. — Tool URL scheme + tool page rebuild phase; logic moves to separate JS files per SCOPE | 2026-07-15 | |
| BL-010 | close | page | Placeholder mentions currently plain text — blog-001: "our seminars page"/"our home page"/"our about page"; blog-002 & blog-003: "Contact us"; disposition per post is a user content decision (linkify, leave, or drop) once target pages have content | 2026-07-16 | User: leave placeholder mentions as plain text. Row also predates the slug filename scheme. |
| BL-011 | close | governance | No-italics rule: STYLE.md rule + 4 em/i converted + defensive .tf-prose normalization — user-ratified, closes with style commit as evidence | 2026-07-16 | User ratified; no-italics rule shipped in style commit ec340df |
| BL-012 | close | feature | Deferred blog body patterns — define on first post needing each, per ratchet. **2 of 4 SHIPPED (2026-07-23):** `.tf-prose-table` shipped (STYLE.css v7, in use on 3 pages) and `.tf-callout` shipped (first live use on business-planning, in use on 4 pages). **REMAINING 2:** `.tf-stat-grid` — CSS exists in STYLE.css but has 0 consumers, still awaiting first use; `.tf-disclaimer` — never defined, no CSS and no consumers | 2026-07-16 | Remaining two patterns are governed by STYLE.md's ratchet — defined on first need. Row duplicates that process. |
| BL-013 | close | process | Sitewide image process: repo-local assets, slots as CSS patterns on first use, Code processes/wires, optional manifest image field; rail slot (3:2) built — remainder pending first real images; document with add-a-post process | 2026-07-16 | User ratified 2026-07-18; process documented in BLOG.md §7 (af77d54) — external master /Users/swai/Images, disposable src/preview, post-merge purge |
| BL-014 | close | governance | Inventory reconciliation in BACKLOG.md: §B redirect map rewritten for slug scheme (all 25 posts need old→new redirects, identity rows void); §D header note (table = old repo as-found; new-site truth is bloglist.json) + note blog-002 retitle and blog-003 re-date divergences. **PROGRESS 2026-07-23:** both halves actioned — §B's void identity row replaced with 25 enumerated old blog URLs, and the §D header note added (old-repo-as-found vs `bloglist.json` as new truth, incl. the blogID RENUMBERING discovered during the rewrite, plus the blog-002 retitle and blog-003 re-date). Mapping was derived by title+date, not blogID, since the manifest renumbers IDs. **RESOLVED 2026-07-23:** 8 of 25 posts are carried and mapped to their real slug page; the other 17 have no slug page and each took an interim redirect (assumed) → `blogs.html` per the §B idiom, retargeting to the real slug when that post is carried over under BL-007. No old blog URL is left unmapped | 2026-07-16 | User ratified; §B slug map + §D header note in 5762360, interim redirects for the 17 uncarried in aae850a |
| BL-015 | close | process | Add-a-post process doc: manifest schema (5 fields + optional image/related), slug convention, MD→HTML conversion rules (no-italics → strong, placeholders plain), title ≤2-line / recap ≤3-line budgets + line-count check at post-add, image workflow, title-suffix rule | 2026-07-16 | Shipped as BLOG.md (17997bf); refined 58d59df, af77d54 |
| BL-016 | close | page | blogs.html index build: consume manifest, card kit first use, published-only, date-descending, thumbnails from image field | 2026-07-16 | e337c40 (matches §A latest-substantive) |
| BL-017 | open | feature | QUESTION: should a blog post end with links to related posts? — Related-articles: optional `related` field (blogID array) in bloglist.json, rendered block at post end | 2026-07-16 | |
| BL-018 | close | bug | Reading-time scope (BLOG.md §6 / blog.js) counts non-prose text: any inline `<style>`/`<script>` inside `.tf-prose`, plus in-figure UI labels, are tallied as words. Surfaced on blog-007, where the placement-map component inflated the count 1415->1908 (+35%, 7 min shown as 9). Worked around there by moving the component's style/script outside `.tf-prose`; the durable fix is to exclude `style, script` from the clone in blog.js and record it in §6. **REVIEW 2026-07-23:** blog.js half done — `style, script` added to the skip list (branch `fix/reading-time-exclusions`, e073d41); measured with the shipped selector against blog-007's component inside `.tf-prose`: 1913 words / 9 min → 1516 / 7 min, and all 8 published posts verified unchanged (none currently has style/script inside `.tf-prose`). **§6 half shipped 2026-07-23:** BLOG.md §6 (v005) now states the shipped selector verbatim — "EXCLUDING h1, .tf-meta, .tf-post-topnav, style, script" — with the reason recorded (textContent returns their source). Documented scope verified character-identical to the shipped selector. Both halves complete | 2026-07-18 | User ratified (backlog sweep); code fix PR #40 (e073d41), §6 doc PR #41 (ff9ef9c) |
| BL-019 | close | governance | BLOG.md §7 hero alt-text exception undocumented: §7 mandates descriptive, user-approved alt for post images, but a page HERO renders through a CSS `background-image` (`--tf-page-head-img`) and structurally CANNOT carry alt at all. references.html's hero has none — the hero is decorative and the h1 is the accessible heading. As written, every hero reads as non-compliant with §7. Record it in §7 as an explicit, sanctioned exception (decorative hero → no alt, h1 carries the heading), so the rule's silence isn't mistaken for an oversight. **REVIEW 2026-07-23:** documented in BLOG.md §7's new "Page heroes" subsection (v004, PR #39 / a45fd05) — behavior unchanged, this records existing shipped practice | 2026-07-19 | User ratified; shipped in PR #39 (a45fd05) |
| BL-020 | close | governance | BLOG.md §7 step 4 naming + wiring are post-only: it directs promotion to `assets/images/<slug>.jpg` "matching the post slug" and to "wire the manifest (`image` + `imageAlt`)" — a page hero has neither a post slug nor a manifest. Shipped precedent (references.jpg → `assets/images/references.jpg`, wired inline as `style="--tf-page-head-img: url(...)"`) is unwritten, so the hero path gets improvised each time. Specify it in §7: bare page-name.jpg + inline custom property. Dimensions need no hero-specific target — references.jpg measures 1200x800 3:2, identical to §7's existing preview spec. **REVIEW 2026-07-23:** documented in BLOG.md §7's new "Page heroes" subsection (v004, PR #39 / a45fd05) — behavior unchanged, this records existing shipped practice | 2026-07-19 | User ratified; shipped in PR #39 (a45fd05) |
| BL-021 | close | style | Footer color reconciliation with Claude Design: ground and link ratified as color-mix derived tokens (ground = ink 75% + stone; link = brick-on-ink 45% + paper), provisional flags cleared, stone-bar contrast resolved (~4.3:1), §2 palette rule corrected to reflect the four inks + scoped exceptions + existing data palette. Recorded in STYLE.md §6 | 2026-07-20 | User ratified; shipped in PR #26 (16f0598) |
| BL-022 | open | feature | QUESTION: on the home page, do the dark CTA band and the warm-stone footer beneath it read as two distinct bands, or do they blur together? — Review `--tf-footer-ground` against a real CTA band. **PREMISE CORRECTED 2026-07-31:** the 2026-07-23 "blocker cleared" claim — that `.tf-cta` ships live on all four service pages — was **superseded by BL-026**, which records the CTA band's removal from those pages. `.tf-cta` now survives only on **index.html band 7**; the four service pages carry `.tf-cta-inline`, a different pattern (verified by grep 2026-07-31). Verify the ink CTA band and the warm-stone footer ground read as two distinct bands (separated on TONE alone, no seam or hairline) on index.html | 2026-07-20 | |
| BL-023 | close | page | Ship the Services two-tier nav rewrite in partials.html. SCOPE.md describes the six-link structure (Pathfinder, Runningmate, divider, then business-planning / sourcing-support / launch-hypercare / ongoing-management) and `.tf-dropdown-divider` exists in STYLE.css. **PARTIALLY DONE:** the nav now points at the four DETAIL pages with SCOPE's short labels (Plan / Source / Launch / Grow), which un-orphans them, and the four superseded `service-*.html` shells were deleted with §B redirects added. **STILL PENDING (why this stays open):** the TWO-TIER structure — the Pathfinder + Runningmate overview tier and the `.tf-dropdown-divider` between the tiers — is deferred because `pathfinder.html` and `runningmate.html` do not exist yet; the panel remains ONE flat tier until they are built | 2026-07-20 | Dropped by decision, not deferred: the two overview pages are not being built. Pathfinder and Runningmate remain as program brand names. |
| BL-024 | close | refactor | 22 shell pages carry the partials-injection script inline in 3 near-identical variants (13/8/1) — copy-pasted duplication. Centralize into a single `assets/partials.js` loaded via `<script src>`, so injection logic (and future needs like footer auto-year) live in one place. Surfaced by the © line task. **Review:** centralized in `assets/partials.js`; all 22 inline copies removed and replaced with `<script src="assets/partials.js" defer></script>`. The 3 variants were verified byte-identical after normalizing comments/whitespace, so V1 (fully commented) was adopted verbatim — behavior unchanged. All 22 pages verified on localhost (inject, aria-current, dropdowns incl. Esc/outside-click/resize-crossing, hamburger). Branch `refactor/partials-js` | 2026-07-20 | User ratified; shipped in PR #38 (0d91e2d) |
| BL-025 | open | feature | `.tf-flow` orphaned sitewide by the service-detail redesign — the numbered engage band is deleted from all four service pages, its only HTML consumers (verified by grep). CSS retained per the `.tf-stat-grid` precedent in BL-012. `.tf-flow-label` / `.tf-flow-note` survive; `.tf-service-track` reuses them. Disposition open: keep as a paper-ground pattern awaiting first reuse, or remove. | 2026-07-26 | |
| BL-026 | open | feature | `.tf-btn-secondary` and the scoped `.tf-cta .tf-btn-secondary` override orphaned by the CTA band's removal from the four service pages, its only HTML consumers (verified by grep). `--tf-ink-raised` exists solely for that override. `.tf-cta` itself survives on index.html band 7. Disposition open. | 2026-07-26 | |
| BL-027 | close | page | `tool-company-setup.html` built — the first tool under the hidden `tools.html` (a single hand-linked card added there; BL-009's manifest/TOOLS.md scheme stays open, deferred by explicit human decision). New STYLE.css/STYLE.md patterns: the choice (radio-pill) kit, the data table, the fit-dot indicator, `.tf-panel-head`, and the site's first print stylesheet (STYLE.md v036, STYLE.css v040, §6 "Company setup tool"). Branch `feat/tool-company-setup` | 2026-07-29 | User ratified — tool-company-setup.html shipped. |
| BL-028 | open | refactor | Re-normalize the 15 committed client logos to PROCESS.md §1's sizing rule: trim empty margin, read the rendered slot height from `STYLE.css`, scale to 2x. Current set spans 51x14 to 725x287; `client-wayfair.png` is 725x287 and 72 KB against a 2-14 KB norm, and it and `client-concentrix.png` exceed the old documented cap. Also produce `-trim` variants where a client appears in `index.html`'s `#trusted` row. Referenced by PROCESS.md §1 "Known state" | 2026-07-31 |  |
| BL-029 | open | feature | Build the scheduled scan GitHub Action (PROCESS.md §7, which currently documents the process for a workflow that does not exist). Scope: internal link integrity, external link HTTP status, missing image references, orphaned pages; the recap-vs-intro diff currently done by hand in PROCESS.md §2, which moves here on completion; `bloglist.json` date-format validation, since ISO YYYY-MM-DD is load-bearing for sort order and a malformed date sorts wrong silently; and two style-drift checks — raw hex or px inside page-local `<style>` blocks, and near-duplicate page-local style blocks across pages. Failure emails the owner; no Issues, no bot-written backlog rows | 2026-07-31 |  |
| BL-030 | open | refactor | `.tf-data-table td.tf-fit-assist` and `td.tf-fit-we`, plus the standalone `.tf-fit-assist` / `.tf-fit-we` rules, hardcode `#7A5410`, `#175355` and `#8F1E12` — the same three values tokenized as `--tf-wash-*-ink` in PR #93. Point them at the tokens. Deliberately excluded from #93 to keep that refactor's verification intact. Currently recorded only in the STYLE.css v41 changelog and the STYLE.md ratchet | 2026-07-31 |  |
| BL-031 | close | governance | Add a unique-published-date rule to BLOG.md. Two posts sharing a date render fine on `blogs.html` but trip the post-page pager's collision check, which mutes Previous and Next sitewide. No duplicates exist today, so this is latent | 2026-07-31 | Already documented in BLOG.md §2 (date field) and §5 (same-date collision). Row raised in error 2026-07-31; no change needed. |
| BL-032 | park | refactor | Card unification. `.tf-card`, `.tf-card-sm` and `.tf-ref-card` are independently declared base rules that converge on near-identical values without shared inheritance, and `index.html`'s `#trusted` is a fourth unrelated pattern. A padding, ground or hover change must be made in three or four places. Parked deliberately — churn against a problem not yet felt | 2026-07-31 |  |
| BL-033 | close | others | Delete the `staging.threeflows.com` DNS record at Cloudflare. It has zero repo footprint — no CNAME file, no workflow, no branch, no Pages reference — and is a leftover from the github.io preview phase | 2026-07-31 | DNS record deleted at Cloudflare by user 2026-08-01. Record had zero repo footprint — leftover from the pre-cutover github.io preview phase. |
| BL-034 | close | page | `contact.html` needs a new form endpoint, owner-managed. Promoted from §I item 2 so it is trackable as a row rather than buried in the inventory | 2026-07-31 | Endpoint deployed and verified by test submission 2026-08-01 — header row written, 10-column row with subject, notification email carries the Subject line. Code change merged in PR #95. |

## Inventory / page checklist

Carry-over inventory extracted **read-only** from the old repo's FILES
(`/Users/swai/sw805206/threeflows-website`) on 2026-07-15 — its `.md`
governance docs were not read. Mappings follow SCOPE.md → Site structure.
The user's close-out decisions have now been applied throughout (redirect map
finalized, keep/kill assigned); items still needing confirmation are listed in
section I.

**Removed 2026-07-31 (v023):** §B (URL redirect map) and §D (Blog posts — old
repo as-found) were deleted in full. Both described old-site pages only: no
redirects are being implemented (old URLs 404 by design, see BL-001), and
`bloglist.json` is the source of truth for this site's posts. Git history
retains both. Rows that cite §B or §D — notably **BL-014** — are left unchanged
as historical record; this note is where those citations now lead.

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
un-build it — so only the evidence moves, never the status.

| New page | Source old page(s) / notes | Status | Closed-by |
|---|---|---|---|
| index.html | index.html | close | User ratified 2026-07-31 — full content build shipped and live. |
| business-planning.html | svc1.html — renamed from the `service-planning.html` shell per SCOPE.md v010 Services restructure (ex-svc1, &ldquo;Plan&rdquo;). Built as the tier-2 Plan detail page (intro-split opener, painpoints/solves 2-up, flow+FAQ band, CTA) — the pattern-setter the other three repeat. Nav-linked as &ldquo;Plan&rdquo;, §B redirect retargeted to this filename, and the superseded shell deleted, all in PR #37 | close | a9de501 |
| sourcing-support.html | svc2.html — renamed from the `service-sourcing.html` shell per SCOPE.md v010 Services restructure (ex-svc2, &ldquo;Source&rdquo;). Built as the tier-2 Source detail page — a TEMPLATE REPEAT of business-planning.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Nav-linked as &ldquo;Source&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 1c32acc |
| launch-hypercare.html | svc3.html — renamed from the `service-launch.html` shell per SCOPE.md v010 Services restructure (ex-svc3, &ldquo;Launch&rdquo;, Runningmate). Built as the tier-2 Launch detail page — a TEMPLATE REPEAT of sourcing-support.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Nav-linked as &ldquo;Launch&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 228aa43 |
| ongoing-management.html | svc4.html — renamed from the `service-management.html` shell per SCOPE.md v010 Services restructure (ex-svc4, &ldquo;Grow&rdquo;, Runningmate). Built as the tier-2 Grow detail page — a TEMPLATE REPEAT of launch-hypercare.html (same intro-split / 2-up / flow+FAQ band / CTA; no new STYLE patterns). Completes the four detail pages. Nav-linked as &ldquo;Grow&rdquo;, §B redirect retargeted, and the superseded shell deleted, all in PR #37 | close | 3da0495 |
| blogs.html | blog.html + bloglist.json | close | e337c40 |
| references.html | useful-websites.html — shipped as a data-driven directory backed by `references.json` + `assets/references.js`, both new files not previously recorded in §A | close | 43209ed |
| seminars.html | webinars.html (+ livestream.html folded in via redirect) | open | |
| tools.html | free-tools.html (shell only; individual tool pages deferred — BL-009) | open | |
| about.html | about.html | close | 086e26b |
| contact.html | built fresh — new form + new endpoint (inquiry.html / intake.html redirect in; their old endpoints not carried) | close | User ratified 2026-07-31 — full content build shipped and live. |
| privacy.html | privacy.html | close | a4c843d |
| surveys.html | surveys.html | open | |
| svy###.html (survey pages) | svy001.html, svy002.html — kept; redesigned later; existing Apps Script endpoints carried | open | |
| blog-&lt;slug&gt;.html (posts) | **Ongoing stream, no target count** — the blog is added to as posts are written. The old site's 25-post carry-over target is VOID: that repo is archived and the redirect layer was dropped (BL-001), so there is no fixed set left to work through. Posts ship as `blog-<slug>.html` per BLOG.md §1; `blog-###` survives only as the manifest key (`blogID`). **12 posts live** (verified on disk 2026-07-31: 12 `blog-<slug>.html` files, 12 matching `bloglist.json` entries, 1:1). Stays open as a stream, never completed | open | |
| Calculator MVP page (filename TBD) | no old-repo source — the SCOPE MVP page, built fresh; deferred/placeholder until built. | open | |

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
carry-over and URLs still need decisions (see F).

**Note (2026-07-31):** the `stylebook.html` listed above is the **OLD repo's**
page, killed at carry-over. It is a different artifact from this repo's live
`int-stylebook.html` (renamed from `stylebook.html` in PR #90), which is
published, `noindex`, and maintained per PROCESS.md §4. The dispositions above
are left as the historical record of the old site.

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

- **CNAME** = `threeflows.com` (apex). **RESOLVED at cutover 2026-07-28 in favour
  of the APEX** — the committed CNAME file reads `threeflows.com` and is correct
  as-is. SCOPE cutover step 3's `www.threeflows.com` was the stale side. No CNAME
  edit is needed and nothing here is pending.
- **`.nojekyll` — SHIPPED** (PR #91, live at repo root, empty file). It stops
  GitHub Pages running Jekyll over the repo, which matters because
  `int-backlog.html` fetches this file raw at runtime. Nothing pending.
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
  (**Note 2026-07-31:** these are **OLD repo** pages. The `stylebook.html` here is
  not this repo's live `int-stylebook.html` — see the note under §E. The interim
  redirects were never implemented; old URLs 404 by design, see BL-001.)
- **surveys.html, svy001, svy002** → **KEPT** (redesigned later; existing Apps
  Script endpoints carried as-is).
- **Dev templates** (blog-000, tool-ca000, tool-ck000) → not carried; unlinked, no
  redirect.

**Remaining / to confirm:**
1. **Interim redirects** — **DROPPED, not pending.** No redirect layer is being
   implemented: old URLs 404 by decision (see BL-001), so the "(assumed)" targets
   never needed confirming. The §B map that carried them was deleted in v023.
2. **contact.html new endpoint** — **RESOLVED.** The endpoint is deployed and
   verified (2026-08-01), replacing the dropped inquiry/intake endpoints. Closed
   as **BL-034**; nothing outstanding.
3. **CNAME apex vs www** — **RESOLVED at cutover 2026-07-28 in favour of the
   apex.** Nothing pending; see §G for the detail.
4. **Awareness (no decision needed):** blog-010a/010b pair and non-chronological
   blog IDs (old-repo numbering; §D removed in v023 — `bloglist.json` is now the
   source of truth for this site's posts).
