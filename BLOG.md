v002 | last updated: 2026-07-17

# BLOG.md — how to add a blog post

Operational procedure for the blog. Follow top to bottom; every rule here is
settled and shipped. Governing docs: CLAUDE.md (working rules), SCOPE.md
(project), STYLE.md (design decisions + ratchet record). The moving parts are
`blog-template.html` (copy-source), `bloglist.json` (manifest), `assets/blog.js`
(post + index rendering), and `blogs.html` (the index).

**The manifest is the index's only source of truth.** A post page renders from
its own HTML; the index card renders from the manifest. Where the two carry the
same fact (recap, reading time), they must be kept in step by hand — nothing
checks this for you.

---

## 1. Filename — the slug

- `blog-<slug>.html`, lowercase, hyphenated: `blog-cut-import-costs.html`.
- **2–4 words, short keywords — not the full title.** In use:
  `blog-factory-data` (2), `blog-cut-import-costs` (3),
  `blog-welcome-to-three-flows` (4).
- **Slugs are stable. A title edit never renames the file.** The title lives in
  the manifest and the `<h1>`; the slug is the URL. (blog-002 was retitled twice
  and kept its slug.)

## 2. Manifest entry (`bloglist.json`)

One object per post. Field order below is the house order.

| Field | Req | Notes |
|---|---|---|
| `blogID` | ✔ | Stable key, e.g. `blog-003`. **Never reused, never renumbered.** Matches the page's `data-blog-id`. Not chronological — don't infer order from it. |
| `filename` | ✔ | The slug file. Must exist on disk. |
| `title` | ✔ | Must match the page's `<h1>` exactly. |
| `date` | ✔ | `YYYY-MM-DD`. **Drives index order and pager neighbours.** Two published posts must not share a date (see §5). |
| `status` | ✔ | `"published"` — see the caveat below. |
| `recap` | ✔ | **Verbatim copy of the post's `.tf-prose-intro` text.** Card body on the index. |
| `readMinutes` | ✔ | Integer, per §6. Feeds the index card only. |
| `image` | — | Relative path, per §7. Absent → no image renders, no placeholder. |
| `imageAlt` | — | Per §7. Absent → `alt=""`. |

**`status` caveat — it unlists, it does not hide.** `status` is only read by the
index filter and the pager filter. A post whose status is not `"published"` is
absent from the index and from every pager, **but its own page is a static HTML
file that still renders fully if the URL is visited** (rail image, TOC, and
reading time all work; both pager sides render muted). The repo is public, so a
non-published post is *unlisted*, not private. To keep a draft off the live site,
keep the file out of the repo — not just out of the manifest.

## 3. Content conversion — Markdown draft → HTML

Copy `blog-template.html` to the slug, set `data-blog-id` on `<main>`, fill the
`<h1>`, the intro, the date meta, and the body. Then:

| Source | Becomes |
|---|---|
| intro / standfirst line | `<p class="tf-prose-intro">` — **plain text, no `<em>`** |
| `##` | `<h2>` — **feeds the TOC rail** |
| `###` | `<h3>` — subsection, **not** in the rail |
| `**bold**` | `<strong>` |
| ***any* source italics** | **`<strong>`** — no-italics rule (STYLE.md §3) |
| bulleted list | `<ul>` / `<li>` |
| numbered list | `<ol>` / `<li>` |
| `[bracketed placeholder]` | **plain text, brackets removed, no `<a>`** (BL-010) |
| emoji | **removed** — no emoji in the brand |

- **Existing `tf-` classes only.** A post never introduces a class or a style. If
  the body needs a pattern that does not exist, see §9.
- Strip everything from the source document: inline styles, old classes, fonts,
  scripts.
- The date meta line is baked as `<p class="tf-meta">Month D, YYYY</p>`; blog.js
  appends ` · N min read` at runtime.

## 4. Title rules

- **Page `<title>` = `<h1> — Three Flows Solutions`.** Exception: **if the `<h1>`
  already contains the brand name, use the `<h1>` alone** — no suffix. (blog-001
  is `<title>Welcome to Three Flows Solutions</title>`, not doubled.)
- **Editorial budgets — title fits 2 desktop lines, recap fits 3.** These are
  reservations (`min-height: 2lh` / `3lh`, desktop ≥820px), so an overrun
  **overflows visibly and is never clipped** — it shifts that post's body down
  and breaks alignment with every other post. **Trim the wording; never raise the
  reservation.**
- **Guide: ~50 characters for a title** — conservative, and only a guide. Measured
  on the real page: 49 chars → 2 lines; 57 chars → 3 lines (both 3-line titles
  were rewritten). **Verify by rendering (§5), not by counting.**

## 5. Post-add check (required)

Render the new post at **1280px** and confirm:

- [ ] Title renders **≤2 lines**, recap **≤3 lines**.
- [ ] **Body top lands at the shared y — currently `454.73`** at desktop
      (≥820px). A different value means a budget was blown (§4).
- [ ] Rail: image (if any) → "In this article" → H2 list. Rail top `120`.
- [ ] Reading time on the date line matches the manifest's `readMinutes` (§6).
- [ ] Pager: neighbours re-wire **automatically by date** — no manual linking.
      Previous = next older published, Next = next newer; an absent neighbour
      renders muted, not hidden.
- [ ] Index card: appears in date-descending position, recap and meta match the
      post page.
- [ ] No console errors.

**Same-date collision:** two published posts sharing a `date` make the order
ambiguous — blog.js mutes both pager sides and warns to the console. Give each
post its own date.

## 6. Reading time

```
readMinutes = ceil(words / 220)
words = .tf-prose text, EXCLUDING h1, .tf-meta, .tf-post-topnav
```

This is blog.js's exact scope (clone `.tf-prose`, remove those three, count
whitespace-separated tokens). The h1 is excluded **so a title edit never moves
the count**; the topnav is excluded because it sits *inside* `.tf-prose`.
Everything else counts — paragraphs, headings, list items, and any future body
element.

- The **post page computes this live from the DOM**. The **index card reads
  `readMinutes` from the manifest**. They are independent.
- **Compute at post-add, and RECOMPUTE whenever a post body is edited** —
  otherwise the card and the post page silently disagree.
- To compute: render the post and evaluate the scope above, or ask Code to.

## 7. Images (optional per post)

1. **Originals → `assets/images/src/`** (gitignored staging; the originals
   archive — never delete, never edit in place).
2. **Crop → `assets/images/src/preview/`**: 3:2, **1200×800**, JPEG **q80–85**,
   **EXIF stripped**, **never upscale** (if a source can't yield 1200px wide at
   3:2, use the largest clean size and say so). Centred crop by default; **if
   centring cuts the subject, produce an offset `-crop-alt` too** and say what
   moved and why.
3. **The user approves a crop.** Preview files are for review only.
4. **Promote the approved bytes** — copy, never re-process — to
   `assets/images/<slug>.jpg` (matching the post slug). Verify the copy is
   byte-identical.
5. **Wire the manifest**: `image` + `imageAlt`.

**Alt text policy: descriptive, not empty.** One plain factual sentence
describing what is visibly in the photo — no marketing language, no "image of"
prefix — **and the user approves it.** (blog.js falls back to `alt=""` only when
`imageAlt` is absent; that fallback is for a missing decision, not the standard.)

Rendering: the image is the rail's top slot on the post (3:2, `.tf-photo`,
sticky with the rail on desktop, in-flow above the article on mobile) and the
card cap on the index. `loading="eager"` on the rail (above-fold LCP);
`loading="lazy"` on index cards.

## 8. Ship rhythm

1. **Localhost review first** — client-facing changes are shown before they are
   committed (CLAUDE.md Part B).
   **⚠ Stale-JS caching is a known trap:** the preview has repeatedly executed a
   cached `blog.js`/`STYLE.css` and shown *phantom* old behavior. Verify on a
   **fresh origin** (a different port) or a hard refresh before believing a
   result — and before reporting a bug.
2. **Commit.** Style changes (`STYLE.css` / `STYLE.md`) go in their **own
   commit, separate from content/JS** (Part B). Keep the two file sets disjoint
   as you work.
3. **Push after every ship.** `git push origin main`. Pre-cutover, direct commits
   to main are permitted (SCOPE.md); the github.io preview builds from main.
4. **Verify the live preview** on the github.io subpath — it is the only place
   relative paths (manifest fetch, image srcs, hrefs) are proven end-to-end.
   Allow a moment for images to download before judging them.

## 9. Deferred body patterns

The first post that needs one of these **defines the pattern** (in `STYLE.css`,
never page-local) and **records a ratchet note** in STYLE.md — see BL-012:

- **prose tables** — no `table` rules exist yet; tables currently render browser-
  default and cramped
- **`.tf-callout`** — the replacement for the old repo's emoji note blocks
- **`.tf-stat-grid`** — for stat trios (the old blog-002 stat boxes)
- **disclaimer line** — no pattern yet

Same rule for any other unbuilt pattern: **define it once in the sheet, record
it, then reuse.** Never style inside a post.
