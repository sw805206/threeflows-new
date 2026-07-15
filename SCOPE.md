v001 | last updated: 2026-07-15

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
default github.io preview URL — so direct commits to main are acceptable
during the build. From the moment the custom domain is attached, full
Part B discipline applies: never commit directly to main; one feature
branch per task → PR → merge.

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
- BACKLOG.md — Part C backlog process is ACTIVE; also holds the page
  checklist and carry-over inventory status

All are written fresh for this repo. No doc from the old repo is copied
or cross-referenced.

## Carry-over inventory (first task of work)

Before page work begins, extract from the old repo's FILES (not its docs)
everything the new site must preserve:

- [ ] Full list of live filenames/URLs — every public page must exist in
      the new tree under the same filename, or be consciously dropped
      (dropped URLs logged; redirects/SEO impact assessed)
- [ ] Form endpoint URLs (Google Apps Script) from contact, intake, and
      gated-tool pages — the endpoints are owner-managed and reused as-is
- [ ] Blog posts: content, filenames, dates, tags
- [ ] Hidden pages (surveys, materials) reachable by direct link — list
      them all with a keep/kill decision each
- [ ] Existing free tools and their calculator/checklist logic
- [ ] CNAME value and any deploy-config files
- [ ] External dependencies actually in use (fonts, chart libraries,
      email-screening service)

The completed inventory lives in BACKLOG.md as the page checklist; each
row is tracked to done before cutover.

## Build strategy

- Foundations first: colors, fonts, type scale, spacing scale, shared
  header/footer — captured in STYLE.css before page work begins.
- Components settled on first need: the first page needing a pattern
  (hero, card, etc.) defines it, and it goes into STYLE.css immediately —
  never into page-local styles. The decision is recorded in STYLE.md.
- Later pages reuse, not reinvent. If new patterns are still appearing
  after the first 2–3 pages, flag it — the design is drifting.
- Style changes always get their own commits, never mixed with other
  changes (Part B).
- The calculator MVP's computing engine lives in its own JS file from
  day one, so a future paid app can share the same math.
- Preview: localhost for daily work; the repo's github.io URL for
  shareable/on-phone preview.

## Cutover — domain flip

Cutover happens once, when every page-checklist row is done:

1. Verify the new repo renders completely on its github.io preview URL.
2. Old repo: remove the custom domain from Pages settings.
3. New repo: add CNAME file (www.threeflows.com) and set the custom
   domain in Pages settings.
4. Cloudflare DNS: verify records still point at GitHub Pages
   (expected: no change needed).
5. Confirm the live domain serves the new site; spot-check forms,
   tools, and a sample of blog posts and hidden pages.
6. Archive the old repo (read-only) as the historical record.

Rollback: reverse steps 2–3 — reattach the domain to the old repo.

## Freeze policy (old site, during the build)

The old site is frozen to emergency-only fixes (broken links, unusable
pages). Every such fix is logged in this repo's BACKLOG.md as
"re-apply in new tree" — there is no automatic sync across repos.

## Open decisions

- Blog restyling depth: full restyle vs minimal carry-over styling for
  old post bodies.
- Hidden pages triage: carry all vs keep/kill per page (decided during
  the carry-over inventory).

## Closed decisions

- Repo: `threeflows-new` (github.com/sw805206/threeflows-new); local
  tree at /Users/swai/sw805206/threeflows-new.
- Cutover: domain flip to this repo; old repo archived. Single big-bang
  launch, MVP included.
- Hosting: GitHub Pages + Cloudflare DNS, unchanged as platforms.
- Governance: written fresh; no cross-reference to old repo docs.

## Stage 3 (future, out of scope)

Paid application on its own subdomain with its own stack. Marketing site
connects via CTA links only. Brand shared by re-declaring the same design
tokens in the app. Triggers creation of an ARCHITECTURE.md in this repo.
