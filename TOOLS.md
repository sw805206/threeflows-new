v001 | 2026-08-01 | 66 lines

# TOOLS.md — tool page naming and IDs

The naming and identity scheme for tool pages: the filename, the internal ID,
and the manifest that maps one to the other. Deliberately thin — it grows during
the tool rebuild phase. Governing docs: CLAUDE.md (working rules), SCOPE.md
(project — including the stack constraints and the tool-page CDN exceptions,
which this file does not restate), STYLE.md (design decisions + ratchet record).

The scheme mirrors the blog's. Where a rule is identical in substance, BLOG.md
is the fuller write-up; nothing here repeats the build or image procedures owned
by PROCESS.md and BLOG.md.

---

## 1. Filename — the slug

- `tool-<slug>.html`, lowercase, hyphenated.
- **2–4 words, short keywords — not the full title.** Shipped precedent:
  `tool-company-setup.html` (3), whose `<h1>` is "Company Setup Checklist".
- **Slugs are stable. A title edit never renames the file.** The title lives in
  the `<h1>` and the manifest; the slug is the URL.

## 2. Internal ID

Every tool page carries an internal ID, `tool-###`, on `<main>` as
`data-tool-id` — exactly as a blog post carries `data-blog-id`:

```html
<main class="tf-section" data-tool-id="tool-001">
```

- **Never reused, never renumbered.** `tool-company-setup.html` is `tool-001`.
- **Not chronological** — don't infer build or publish order from it.
- **Internal only.** It is never rendered and never user-visible.
- Rebuilt legacy tools (the old `ca001`, `ca002`, `ck001`–`ck004` pages) take
  **fresh** numbers in rebuild order. Nothing is inherited from the old scheme.

## 3. Manifest entry (`toollist.json`)

One object per tool. Three fields, and field order below is the house order.

| Field | Req | Notes |
|---|---|---|
| `toolID` | ✔ | Stable key, e.g. `tool-001`. Matches the page's `data-tool-id`. Per §2. |
| `filename` | ✔ | The slug file. Must exist on disk. |
| `title` | ✔ | Must match the page's `<h1>` exactly. |

**Nothing reads this file yet, and that is intentional.** `tools.html` does not
render from it: the index is hand-linked cards, maintained by hand, and stays
that way until the manifest earns a consumer. `toollist.json` exists from the
first tool onward so that (a) the ID → page mapping is machine-readable rather
than living only in the pages, and (b) it can grow into a real index manifest —
the way `bloglist.json` is one for `blogs.html` — without a migration. Adding
fields to a manifest later is cheap; retrofitting IDs across shipped pages is
not.

Keep it in step by hand: a new tool page means a new object here, in the same
commit. Nothing checks this for you.

## 4. Shared ID namespace

`blog-###` and `tool-###` are distinct prefixes in one unambiguous namespace, so
future blog ↔ tool cross-referencing can resolve an ID against either manifest —
not designed and not implemented now.
