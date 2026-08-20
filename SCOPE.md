v032 | 2026-08-20 | 278 lines

# SCOPE.md — threeflows.com

## 1. Project

Three Flows Solutions LLC is a boutique business consultancy specializing in
business modeling and e-commerce. This repo holds threeflows.com, its
multi-page static marketing website.

Content is supplied by the human. Style direction comes from Claude Design,
captured in TOKENS.css and STYLE.css with the decisions recorded in STYLE.md.

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
  page defined which pattern, per-repo; never synced
- **TOKENS.md** — what the tokens mean: palette, type scale, and the global
  rules that apply to any Three Flows surface. Shared with sibling repos.
- **TOKENS.css** — the design tokens: the `:root` custom properties (colour,
  type scale, spacing, rules). Shared with sibling repos; see §3 Cross-repo
  sync. Publicly served.
- **STYLE.css** — shared patterns and components, built from TOKENS.css.
  Publicly served. Per-repo; never synced.
- **BLOG.md** — add-a-post procedure and manifest schema
- **TOOLS.md** — tool page naming and internal ID scheme
- **BACKLOG.md** — the backlog table and page inventory; the CLAUDE.md Part C
  backlog process is ACTIVE for this project. Its rendered view is
  `int-backlog.html`, which fetches BACKLOG.md at runtime; that page is where
  the Part C flush verification is performed
- **PROCESS.md** — project-specific human/Claude procedures

CLAUDE.md is deliberately not on that list: it holds universal working rules,
not product ones, and is synced from the disk master at
`/Users/swai/sw805206/CLAUDE.md`.

Open items are tracked in BACKLOG.md, which is authoritative for them; this
file does not duplicate them.

## 3. Architecture and conventions

There is no separate ARCHITECTURE.md — the site is small enough that this
section covers it.

### Stack and constraints

- Static multi-page HTML with vanilla JS. No frameworks (no React/Vue/jQuery,
  no Tailwind). STYLE.css is plain CSS, built on the variables TOKENS.css
  declares and STYLE.css `@import`s.
- Lean dependencies; per-page CDN loads by exception only. Charting libraries
  for tool pages are an accepted exception.
  - **Exception taken: jsPDF + jspdf-autotable.** Loaded from cdnjs with
    Subresource Integrity hashes, `crossorigin`, `referrerpolicy="no-referrer"`
    and `defer`, on tool pages that offer a PDF download — and on those pages
    only. A blocked or tampered CDN therefore leaves `window.jspdf` undefined
    and the tool falls back to `window.print()`. Current consumers:
    `tool-company-setup.html` and `tool-general-cashflow.html`.
- All internal links are RELATIVE paths, for portability.
- Shared header and footer are served from `partials.html`, fetched per page.
- Tools may compute and display entirely in the browser — front-end only, no
  backend and no database. Each tool's calculation logic lives in its own JS
  file, never inline in the page, so the math stays testable and reusable.
  This constraint is about TOOLS specifically. Forms and the mailing list do
  have a backend — see below.

### Form and mail backends

The site is static, but it is not backend-free. Two Google Apps Script web apps
sit behind it, both owner-managed, both reached only by a `fetch` POST to a
deployed `/exec` URL. Neither is executed by the site; GitHub Pages serves files
and nothing else.

Their source is versioned in `apps-script/` so the logic is reviewable, but the
repo copy is a RECORD, not the running code — Google holds what actually
executes, and the two can drift. A change is only live once pasted into the
Apps Script project and redeployed.

- **`contact-endpoint.gs`** — behind `contact.html`. Writes submissions to a
  Google Sheet and notifies the owner.
- **`subscribe-endpoint.gs` + `subscribe-updates.gs`** — behind
  `subscribe.html`. Confirmed opt-in mailing list: the endpoint writes rows and
  sends confirmation, confirm, unsubscribe and manage mail; the second file
  sends updates to the list from a Sheet menu. Both run in ONE container-bound
  script project on the "Subscribe" Sheet and share global scope, so neither
  works without the other. PROCESS.md §8 holds the procedure; the operator
  checklist lives in that Sheet.

Legacy survey pages post to their own carried-over endpoints, inventoried in
BACKLOG.md §C.

**The datastore is Google Sheets.** Submissions, survey responses and subscriber
addresses live there and nowhere else — no database, and nothing client-sensitive
in this repo. `privacy.html` states this publicly and is the binding version.

**Never mint a new deployment for an endpoint that is already wired.** Editing
the existing web app keeps its `/exec` URL; a new deployment gets a new one and
silently breaks both the live form and every confirm/unsubscribe link already
sitting in someone's inbox.

### Pages

`index.html` (Home); `business-planning.html`, `sourcing-support.html`,
`launch-hypercare.html`, `ongoing-management.html` (services); `blogs.html`
(index — individual posts are `blog-<slug>.html`, per BLOG.md §1);
`links.html`; `seminars.html`; `tools.html` (index — individual tools are
`tool-<slug>.html`, per TOOLS.md §1); `about.html`; `contact.html`;
`privacy.html`; `subscribe.html`; `surveys.html` (cover for individual survey
pages).

`subscribe.html` is unlisted rather than internal — it is a real public page,
linked from the footer bar, from `contact.html`'s success panel and from
`privacy.html`, but deliberately absent from the nav. It carries all five
subscription states in one file, switched by query string.

`partials.html` is the source of truth for the nav, and therefore for which
pages are publicly reachable — a page not linked there is live but unlisted. No
doc restates it, and no doc tracks visibility separately. Its current shape is
Home, Services (dropdown: Plan → `business-planning.html`,
Source → `sourcing-support.html`, Launch → `launch-hypercare.html`, Grow →
`ongoing-management.html`), Resources (dropdown: Blogs, Tools, Links),
About, Contact. Dropdowns are flat and single-tier, using the
`.tf-has-dropdown` mechanism.

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

- Foundations first: colors, fonts, type scale and spacing scale live in
  TOKENS.css; the shared header/footer lives in STYLE.css.
- Later pages reuse rather than reinvent. The reuse check and the ratchet
  record live in STYLE.md.
- A pattern used on two or more pages belongs in STYLE.css. A genuine one-off
  may stay in a page-local style block, but must be built from existing tokens
  — `var(--tf-*)`, the spacing and type scales — never raw hex or px, and it
  gets a one-line note in STYLE.md's ratchet record so the next page that wants
  it promotes it instead of rebuilding it. STYLE.md holds the full rule.
- The procedure for building or adding a page lives in PROCESS.md.

### Automated checks

A scheduled GitHub Action runs checks against the live site. The specific
checks are defined in the workflow itself, not listed here — the workflow is
the source of truth for what it does (PROCESS.md §7). On failure GitHub emails
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
concurrent streams return. Third: STYLE.css, TOKENS.css and
`assets/logo-mark.svg` are declared publicly served for the purposes of
CLAUDE.md Part B — an authored change to any of them keeps branch and PR
discipline, while a mechanical sync copy of already-reviewed content is not an
authored change and goes direct to main.

### Cross-repo sync

Some governance files are shared with sibling `threeflows-*` repos. The manifest
is authoritative — a file not listed here is never synced, in either direction.

**Authoring direction.** This repo is the master for the shared brand
foundation — the design tokens, their documented meanings, and the brand mark,
which is exactly the manifest below and nothing else. Manifest files are
authored HERE and never in a sibling. Not shared, and never synced: STYLE.md
and STYLE.css, which §2 declares per-repo, `partials.html`, and every pattern a
sibling builds from the tokens. A sibling CONSUMING a token is expected and
correct. A sibling declaring its own value for one, or widening a token's
documented scope in its own copy, is the drift this rule exists to prevent — it
raises a backlog row here instead.

**Children.** `threeflows-app` is the first and currently only child. The
Siblings table below is the register; adding a child means a row there plus the
matching declaration in that repo's SCOPE.md.

**The bind is two-sided.** Each child's SCOPE.md states the same relationship
and names this repo as master. The manifest list itself lives here only — a
child names the relationship and points at this file rather than restating the
list, so the two can never disagree about what is shared.

**Manifest:** TOKENS.css, TOKENS.md, `assets/logo-mark.svg`

**Siblings:**

| Repo | Local path | Remote |
|---|---|---|
| threeflows-app | `/Users/swai/sw805206/threeflows-app` | `https://github.com/sw805206/threeflows-app.git` |

`partials.html` is deliberately excluded: the app's header carries signed-in
state and an account link, so it is the same role filled by different markup,
not a shared file. Adding it later is a one-line change here.

**The rule.** Claude Code only — a chat cannot read another repo.

1. Run at the start of any task that will touch a manifest file, before any
   edit. Never author on top of a copy that has not been reconciled.
2. `git fetch origin` here and in each sibling. Compare `origin/main` on both
   sides. Never the working tree, never a project-folder copy.
3. Compare each manifest file — line 1 for a stamped file, a `shasum -a 256`
   checksum for an unstamped one. `assets/logo-mark.svg` is the only unstamped
   entry and stays that way deliberately: an SVG is a served asset that design
   tools rewrite wholesale on export, so a stamp in an opening XML comment
   would be dropped silently and leave this rule reading a stamp that is no
   longer there. A checksum cannot say which side is newer and does not need
   to — the authoring direction above already fixes that, so a mismatch on an
   unstamped file always means copy down from here.
   - **Identical** → nothing to do. Report it.
   - **This repo higher**, or an unstamped file differing → copy this repo's
     version into the sibling, verify byte-identical, commit, push. Report both
     SHAs.
   - **A sibling higher** → STOP and report. Manifest files are authored here
     only, so a sibling ahead means authoring happened in the wrong repo. Never
     copy it down.
   - **Same version, different content** → STOP and ask. Never overwrite. Detect
     this by comparing checksums, not line 1 alone.
   - **Absent on one side** → bootstrap: copy across, no comparison. Not a stop.
   - **Sibling repo missing from disk** → STOP and report. Never skip silently.
4. A sync copies the file whole, stamp included. **A sync never bumps the
   version.** Only an authoring edit bumps. Two copies with identical content
   must always carry identical stamps.
5. A sync commit message names it as a sync and cites the source repo and
   version, so the log distinguishes a copy from an authored change.
6. **Authoring from a sibling's session.** A Code session started in a sibling
   repo may author manifest files, but only by working in this repo: `cd` here,
   run this repo's governance reads, the Part B sync audit and the Part C
   CLAUDE.md reconcile, then author. Routing follows the FILE's repo, not the
   session's — TOKENS.md direct to main, TOKENS.css on a branch with a PR per
   its publicly-served declaration. This removes the need to switch chats for a
   token change; it does not permit authoring in the sibling.

## 4. The application platform

The paid application lives in `threeflows-app`, a separate private repo at
`/Users/swai/sw805206/threeflows-app`, to be deployed on `app.threeflows.com`.
That repo holds its own SCOPE.md and its own BACKLOG.md and governs itself. The
marketing site connects to it via CTA links only.

Brand is shared by syncing TOKENS.css and TOKENS.md — see §3 Cross-repo sync.
This supersedes the earlier plan to re-declare the tokens by hand in the app.

No ARCHITECTURE.md is created in this repo. Earlier text placed one here; with
the application in its own repo, this repo stays a static marketing site and
needs none. Any architecture doc belongs in threeflows-app.
