v006 | last updated: 2026-07-18

# BACKLOG.md — threeflows-new

Part C backlog process (CLAUDE.md) applies. This file is the source of
truth; items are raised in chat, held in the running block, and flushed
here on the user's request. Also holds the page checklist and carry-over
inventory status (per SCOPE.md).

**Categories:** process, feature, page, bug, governance, others
**Status flow:** open → review → close; or park / discard.
Code never self-closes: done items move to review; only the user closes,
with evidence in Closed-by (PR## for code, or the user's stated reason).

**Direct-to-main:** status/bookkeeping edits to this file travel under the
SCOPE.md governance-doc exception — committed directly to main, not via a
feature branch (per user decision 2026-07-18).

## Backlog

| ID | Status | Category | Item | Raised | Closed-by |
|---|---|---|---|---|---|
| BL-001 | open | process | Cutover: domain flip to this repo per SCOPE.md (verify preview → detach domain from old repo → attach CNAME + custom domain here → verify Cloudflare DNS → spot-check live → archive old repo) | 2026-07-15 | |
| BL-002 | close | governance | SCOPE.md v002: add rule "Style-system changes identified but not immediately implemented are logged to BACKLOG.md — never left untracked."; trim Open decisions now tracked here (BL-007, BL-008) | 2026-07-15 | User ratified; verified in SCOPE.md v003 (style-tracking rule + trimmed Open decisions present) |
| BL-003 | discard | feature | Current-page nav underline affordance (ink text + 2px brick underline) — implemented in PR#1, then removed by user design decision | 2026-07-15 | User: underline removed by design decision |
| BL-004 | open | feature | Footer buildout: decide what the minimal footer grows into (nav links, contact info, tagline) | 2026-07-15 | |
| BL-005 | open | feature | Tagline: placeholder "Beside you, start to scale" is TBD in STYLE.md — confirm or replace; placement decision held (nav ruled out; hero/footer candidates) | 2026-07-15 | |
| BL-006 | open | process | STYLE.css foundations review: check brand package against hard constraints and foundation coverage before page builds | 2026-07-15 | |
| BL-007 | open | page | Blog restyling depth: full restyle vs minimal carry-over styling for old post bodies (SCOPE.md open decision) — rescoped 2026-07-16: launch trio was rewritten (moot for them); question now covers the 22 remaining carry-over posts | 2026-07-15 | |
| BL-008 | close | page | Hidden pages triage: carry all vs keep/kill per page, decided during carry-over inventory (SCOPE.md open decision) — dispositions now applied in the inventory close-out below (keeps: surveys/svy001/svy002; kills: tool-ref001/mtl001/stylebook) | 2026-07-15 | User ratified; dispositions applied in inventory close-out (BACKLOG §B/§E) |
| BL-009 | open | page | Tool URL scheme + tool page rebuild phase; logic moves to separate JS files per SCOPE | 2026-07-15 | |
| BL-010 | open | page | Placeholder mentions currently plain text — blog-001: "our seminars page"/"our home page"/"our about page"; blog-002 & blog-003: "Contact us"; disposition per post is a user content decision (linkify, leave, or drop) once target pages have content | 2026-07-16 | |
| BL-011 | close | governance | No-italics rule: STYLE.md rule + 4 em/i converted + defensive .tf-prose normalization — user-ratified, closes with style commit as evidence | 2026-07-16 | User ratified; no-italics rule shipped in style commit ec340df |
| BL-012 | open | feature | Deferred blog body patterns: prose tables, .tf-callout first use, .tf-stat-grid first use, .tf-disclaimer — define on first post needing each, per ratchet | 2026-07-16 | |
| BL-013 | close | process | Sitewide image process: repo-local assets, slots as CSS patterns on first use, Code processes/wires, optional manifest image field; rail slot (3:2) built — remainder pending first real images; document with add-a-post process | 2026-07-16 | User ratified 2026-07-18; process documented in BLOG.md §7 (af77d54) — external master /Users/swai/Images, disposable src/preview, post-merge purge |
| BL-014 | open | governance | Inventory reconciliation in BACKLOG.md: §B redirect map rewritten for slug scheme (all 25 posts need old→new redirects, identity rows void); §D header note (table = old repo as-found; new-site truth is bloglist.json) + note blog-002 retitle and blog-003 re-date divergences | 2026-07-16 | |
| BL-015 | review | process | Add-a-post process doc: manifest schema (5 fields + optional image/related), slug convention, MD→HTML conversion rules (no-italics → strong, placeholders plain), title ≤2-line / recap ≤3-line budgets + line-count check at post-add, image workflow, title-suffix rule | 2026-07-16 | |
| BL-016 | review | page | blogs.html index build: consume manifest, card kit first use, published-only, date-descending, thumbnails from image field | 2026-07-16 | |
| BL-017 | open | feature | Related-articles: optional `related` field (blogID array) in bloglist.json, rendered block at post end | 2026-07-16 | |

## Inventory / page checklist

Carry-over inventory extracted **read-only** from the old repo's FILES
(`/Users/swai/sw805206/threeflows-website`) on 2026-07-15 — its `.md`
governance docs were not read. Mappings follow SCOPE.md → Site structure.
The user's close-out decisions have now been applied throughout (redirect map
finalized, keep/kill assigned); items still needing confirmation are listed in
section I.

### A. Page checklist (new pages to build)

Shells for the 13 top-level pages already exist (PR#1) as placeholders, so
"not-started" means the content build. Blog posts and the calculator MVP page
come later.

| New page | Source old page(s) | Status |
|---|---|---|
| index.html | index.html | not-started |
| service-planning.html | svc1.html | not-started |
| service-sourcing.html | svc2.html | not-started |
| service-launch.html | svc3.html | not-started |
| service-management.html | svc4.html | not-started |
| blogs.html | blog.html + bloglist.json | not-started |
| references.html | useful-websites.html | not-started |
| seminars.html | webinars.html (+ livestream.html folded in via redirect) | not-started |
| tools.html | free-tools.html (shell only; individual tool pages deferred — BL-009) | not-started |
| about.html | about.html | not-started |
| contact.html | built fresh — new form + new endpoint (inquiry.html / intake.html redirect in; their old endpoints not carried) | not-started |
| privacy.html | privacy.html | not-started |
| surveys.html | surveys.html | not-started |
| svy###.html (survey pages) | svy001.html, svy002.html | not-started (kept; redesigned later; existing Apps Script endpoints carried) |
| blog-###.html (posts) | blog-001…024 incl. 010a/010b (25 posts) | not-started |

### B. URL redirect map (old → new — Cloudflare Redirect Rules input at cutover)

Finalized per the user's close-out decisions. Every old URL resolves; no
UNMAPPED rows remain. Rows marked **interim redirect (assumed)** are the
assumed "nothing 404s" redirects the user will confirm at review.

| Old URL | Destination | Note |
|---|---|---|
| index.html | index.html | identity |
| about.html | about.html | identity |
| contact.html | contact.html | identity (contact built fresh — new form + new endpoint) |
| privacy.html | privacy.html | identity (hidden; footer link) |
| surveys.html | surveys.html | identity (hidden cover; kept, redesigned later) |
| blog.html | blogs.html | redirect |
| blog-001…024, 010a, 010b | blog-###.html (same name) | identity — no redirect needed |
| svc1.html | service-planning.html | redirect |
| svc2.html | service-sourcing.html | redirect |
| svc3.html | service-launch.html | redirect |
| svc4.html | service-management.html | redirect |
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

25 posts, all `status: published`. Manifest ↔ disk match exactly (25/25, no
manifest entry without a file, no file without an entry). One template on disk
(`blog-000-template.html`) is not in the manifest (expected).

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
