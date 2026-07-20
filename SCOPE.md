v010 | last updated: 2026-07-20

# SCOPE.md — threeflows.com Relaunch (new repo)

## Project

Greenfield rebuild of www.threeflows.com: a full redesign of the existing
multi-page static HTML site (company, services, about, blogs, free tools),
built clean in this repo and cut over by domain flip when complete. The
relaunch includes a new calculator MVP as one of its pages; MVP and site
launch together.

Content is provided by the user. Style direction comes from Claude Design,
captured in STYLE.css (tokens, shared patterns) with decisions recorded in
STYLE.md.

This repo and this file are the only sources of truth for the relaunch.
The old repo (threeflows-website) and its governance docs are NOT
referenced; the old repo serves solely as raw material for the carry-over
inventory and is archived at cutover.

**Project type:** website, will deploy from main via GitHub Pages.
Until the domain flips, merging to main publishes only to the repo's
default github.io preview URL.

**Branch-per-stream discipline (from 2026-07-17).** The pre-cutover
permission for direct commits to main is retired. Each work stream lives
on its own feature branch (`feat/<stream>`) in its own git worktree under
`../threeflows-worktrees/<stream>`; main receives finished work via PR
only, so main always holds finished work alone and concurrent streams
never collide in the working tree. Governance-doc edits are no exception:
they follow CLAUDE.md Part B → **Governance changes get their own PR,
merged promptly, then cascade**. From the moment the custom domain is attached,
full Part B discipline applies unchanged.

## Hard constraints

- Static site, vanilla JS, no frameworks (no React/Vue/jQuery, no
  Tailwind). STYLE.css is plain CSS with variables.
- Lean dependencies; per-page CDN loads by exception only.
- All internal links are RELATIVE paths — required for the github.io
  subpath preview to work, and good practice for portability.

## Governance docs

- CLAUDE.md — universal working rules (synced from MOTHERSHIP)
- SCOPE.md — this file
- STYLE.md — design-system decisions in words; ratchet-rule record
  (which page defined which pattern)
- STYLE.css — design tokens and shared patterns; single source of truth
  for all styling
- BLOG.md — blog add-a-post procedure and manifest schema
- BACKLOG.md — Part C backlog process is ACTIVE; also holds the page
  checklist and carry-over inventory status

All are written fresh for this repo. No doc from the old repo is copied
or cross-referenced.

## Carry-over inventory (first task of work)

Before page work begins, extract from the old repo's FILES (not its docs)
everything the new site must preserve:

- [x] Full list of live filenames/URLs — superseded by the user's page
      reorg (see Site structure); old URL → new URL redirect map still
      required at inventory time (Cloudflare Redirect Rules at cutover)
- [ ] Form endpoint URLs (Google Apps Script) from contact, intake, and
      gated-tool pages — the endpoints are owner-managed and reused as-is
- [ ] Blog posts: content, filenames, dates, tags
- [ ] Hidden pages (surveys, materials) reachable by direct link — list
      them all with a keep/kill decision each (BL-008)
- [ ] Existing free tools and their calculator/checklist logic
- [ ] CNAME value and any deploy-config files
- [ ] External dependencies actually in use (fonts, chart libraries,
      email-screening service)

The completed inventory lives in BACKLOG.md as the page checklist; each
row is tracked to done before cutover.

## Site structure (per user reorg, 2026-07-15; Services restructured 2026-07-20)

index.html (Home); pathfinder.html, runningmate.html (service overviews);
business-planning.html, sourcing-support.html, launch-hypercare.html,
ongoing-management.html (service details); blogs.html (index; posts
blog-###.html later); references.html; seminars.html; tools.html;
about.html; contact.html; privacy.html (hidden — no nav; linked in the
shared footer); surveys.html (hidden cover; svy###.html later).
Nav = Home, Services (dropdown ×6, two tiers — see below), Resources
(dropdown: Blogs, References, Seminars, Free tools), About, Contact.
Shared header/footer served from partials.html, fetched per page.

Services is a two-tier dropdown in a SINGLE panel: two overview pages on
top, a purely visual divider, then the four detail pages. The divider is
visual only — there are no nested or expanding sub-panels, and the flat
`.tf-has-dropdown` mechanism is reused unchanged, so the panel keeps one
tier of behavior. Link text and targets, in panel order:

- Pathfinder → pathfinder.html (overview; built fresh, no old-repo source)
- Runningmate → runningmate.html (overview; built fresh, no old-repo source)
- *(visual divider)*
- Plan → business-planning.html (ex-svc1)
- Source → sourcing-support.html (ex-svc2)
- Launch → launch-hypercare.html (ex-svc3)
- Grow → ongoing-management.html (ex-svc4)

The four detail pages replace the service-*.html placeholder shells by
delete-and-build: the shells held only the shared boilerplate, so nothing
is preserved from them. The two overview pages are new, growing the site
by two pages. Resources, Home, About and Contact are unchanged.

## Build strategy

- Foundations first: colors, fonts, type scale, spacing scale, shared
  header/footer — captured in STYLE.css before page work begins.
- Components settled on first need: the first page needing a pattern
  (hero, card, etc.) defines it, and it goes into STYLE.css immediately —
  never into page-local styles. The decision is recorded in STYLE.md.
- Later pages reuse, not reinvent. If new patterns are still appearing
  after the first 2–3 pages, flag it — the design is drifting.
- Reuse check before any new pattern. Before defining a new shared
  pattern, grep the ratchet-rule record in origin/main's STYLE.md for one
  that already does the job, and reuse it if it exists. Only a genuinely
  new need gets a new pattern.
- Every tier-1 page build includes a .tf-page-head header: kicker, h1,
  intro written with the page's content, plus a header image (sourced and
  approved via the BLOG.md §7 image process; CSS cover-crops it in the hero
  band) at build time. Pages may ship image-less only by explicit decision.
- Style-system changes identified but not immediately implemented are
  logged to BACKLOG.md — never left untracked.
- Style changes always get their own commits, never mixed with other
  changes (Part B).
- The calculator MVP's computing engine lives in its own JS file from
  day one, so a future paid app can share the same math.
- Preview: localhost for daily work; the repo's github.io URL for
  shareable/on-phone preview.
- When a style change modifies a value that is quoted verbatim in another
  governance doc (e.g. a measured y in BLOG.md's post-add check, a token value
  referenced in a build procedure), that doc must be updated in the same commit
  as the style change. A ratchet note in STYLE.md alone is not sufficient —
  quoted values elsewhere go stale silently.

## Cutover — domain flip

Cutover happens once, when every page-checklist row is done:

1. Verify the new repo renders completely on its github.io preview URL.
2. Old repo: remove the custom domain from Pages settings.
3. New repo: add CNAME file (www.threeflows.com) and set the custom
   domain in Pages settings.
4. Cloudflare DNS: verify records still point at GitHub Pages
   (expected: no change needed); add Redirect Rules per the old→new
   URL redirect map from the inventory.
5. Confirm the live domain serves the new site; spot-check forms,
   tools, and a sample of blog posts and hidden pages.
6. Archive the old repo (read-only) as the historical record.

Rollback: reverse steps 2–3 — reattach the domain to the old repo.

## Freeze policy (old site, during the build)

The old site is frozen to emergency-only fixes (broken links, unusable
pages). Every such fix is logged in this repo's BACKLOG.md as
"re-apply in new tree" — there is no automatic sync across repos.

## Open decisions

Tracked in BACKLOG.md (BL-004 footer buildout, BL-005 tagline, BL-007
blog restyling depth, BL-008 hidden pages triage). BACKLOG.md is the
authoritative tracker for open items; this section no longer duplicates
them.

## Closed decisions

- Repo: `threeflows-new` (github.com/sw805206/threeflows-new); local
  tree at /Users/swai/sw805206/threeflows-new.
- Cutover: domain flip to this repo; old repo archived. Single big-bang
  launch, MVP included.
- Hosting: GitHub Pages + Cloudflare DNS, unchanged as platforms.
- Governance: written fresh; no cross-reference to old repo docs.
- Site structure: reorged per user (see Site structure); URL changes
  handled via redirect map at cutover.
- "Useful websites" renamed to "References" (references.html).

## Stage 3 (future, out of scope)

Paid application on its own subdomain with its own stack. Marketing site
connects via CTA links only. Brand shared by re-declaring the same design
tokens in the app. Triggers creation of an ARCHITECTURE.md in this repo.
