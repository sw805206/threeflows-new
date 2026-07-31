v015 | 2026-07-31 | 136 lines

# SCOPE.md — threeflows.com

## 1. Project

Threeflows Solutions LLC is a boutique business consultancy specializing in
business modeling and e-commerce. This repo holds threeflows.com, its
multi-page static marketing website.

Content is supplied by the human. Style direction comes from Claude Design,
captured in STYLE.css (tokens, shared patterns) with the decisions recorded in
STYLE.md.

**Where it lives**

- Git repo: `https://github.com/sw805206/threeflows-new`
- Local repo: `/Users/swai/sw805206/threeflows-new`
- Hosting: GitHub Pages, deployed from `main`
- Domain: `threeflows.com` (apex), DNS managed on Cloudflare under
  `sw805206@icloud.com`

The site is live. Cutover from the previous site completed 2026-07-28
(commit `1c0021c`); the old repo, `threeflows-website`, is archived and is not
referenced by anything here.

**Ongoing streams:** blog posts, references, tools, and backlog upkeep.

## 2. Governance docs

Product docs, all in this repo:

- **SCOPE.md** — this file
- **STYLE.md** — design-system decisions in words; the ratchet record of which
  page defined which pattern
- **STYLE.css** — design tokens and shared patterns; single source of truth for
  all styling
- **BLOG.md** — add-a-post procedure and manifest schema
- **BACKLOG.md** — the backlog table and page inventory; the CLAUDE.md Part C
  backlog process is ACTIVE for this project
- **PROCESS.md** — project-specific human/Claude procedures

CLAUDE.md is deliberately not on that list: it holds universal working rules,
not product ones, and is synced from the disk master at
`/Users/swai/sw805206/CLAUDE.md`.

Open items are tracked in BACKLOG.md, which is authoritative for them; this
file does not duplicate them.

## 3. Architecture and conventions

There is no separate ARCHITECTURE.md — the site is small enough that this
section covers it. Stage 3 is the trigger to create one.

### Stack and constraints

- Static multi-page HTML with vanilla JS. No frameworks (no React/Vue/jQuery,
  no Tailwind). STYLE.css is plain CSS with variables.
- Lean dependencies; per-page CDN loads by exception only. Charting libraries
  for tool pages are an accepted exception.
- All internal links are RELATIVE paths, for portability.
- Shared header and footer are served from `partials.html`, fetched per page.
- Tools may compute and display entirely in the browser — front-end only, no
  backend and no database. Each tool's calculation logic lives in its own JS
  file, never inline in the page, so the math stays testable and reusable.

### Pages

`index.html` (Home); `business-planning.html`, `sourcing-support.html`,
`launch-hypercare.html`, `ongoing-management.html` (services); `blogs.html`
(index — individual posts are `blog-<slug>.html`, per BLOG.md §1);
`references.html`; `seminars.html`; `tools.html` and its individual tool pages;
`about.html`; `contact.html`; `privacy.html`; `surveys.html` (cover for
individual survey pages).

`partials.html` is the source of truth for the nav, and therefore for which
pages are publicly reachable — a page not linked there is live but unlisted. No
doc restates it, and no doc tracks visibility separately. Its current shape is
Home, Services (dropdown: Plan → `business-planning.html`,
Source → `sourcing-support.html`, Launch → `launch-hypercare.html`, Grow →
`ongoing-management.html`), Resources (dropdown: Blogs, References), About,
Contact. Dropdowns are flat and single-tier, using the `.tf-has-dropdown`
mechanism.

### Internal pages

Internal reference pages are published to the live site so they stay
bookmarkable from any device. They carry
`<meta name="robots" content="noindex,nofollow">`, are linked from nowhere, and
get NO `robots.txt` entry — a disallow would stop crawlers fetching the page
and therefore stop them ever reading the noindex, which is the opposite of what
is wanted.

This is obscurity, not privacy. Static hosting has no auth layer, so these
pages remain publicly fetchable by anyone who knows the URL; nothing
client-sensitive belongs on them.

### Build approach

- Foundations first: colors, fonts, type scale, spacing scale, and the shared
  header/footer live in STYLE.css.
- Later pages reuse rather than reinvent. The reuse check and the ratchet
  record live in STYLE.md.
- A pattern used on two or more pages belongs in STYLE.css. A genuine one-off
  may stay in a page-local style block, but must be built from existing tokens
  — `var(--tf-*)`, the spacing and type scales — never raw hex or px, and it
  gets a one-line note in STYLE.md's ratchet record so the next page that wants
  it promotes it instead of rebuilding it. STYLE.md holds the full rule.
- The procedure for building or adding a page lives in PROCESS.md.

### Automated checks

A scheduled GitHub Action scans the live site for broken internal links, dead
external links, missing images, and orphaned pages. On failure GitHub emails
the repo owner — that email is the reminder. Findings are logged to BACKLOG.md
by hand, through the normal Part C flush; the scan never writes backlog rows
itself. Spelling and grammar stay manual, since automated grammar checking on
marketing copy is mostly false positives.

Known limitation: GitHub silently disables scheduled workflows after 60 days
without repo activity.

### Code discipline

Per CLAUDE.md Part B, which governs. Two project facts it cannot know: this
site deploys from `main`, so Part B's protect-main rules apply in full; and the
`feat/<stream>` worktree setup under `../threeflows-worktrees/` is retired —
feature branches are worked in the main tree. Reinstate worktrees only if
concurrent streams return.

## 4. Stage 3 (future, out of scope)

A paid application on its own subdomain with its own stack. The marketing site
connects to it via CTA links only. Brand is shared by re-declaring the same
design tokens in the app. This triggers the creation of an ARCHITECTURE.md in
this repo.
