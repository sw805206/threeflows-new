v003 | 2026-08-02 | 155 lines

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

## 5. Page shape

The order of parts, as shipped. Geometry — the 260px rail, the `space-between`
split, the 62ch content cap — is STYLE.md's and is not restated here.

**Rail** (`.tf-tool-rail`, sticky): lede image → CTA block → step switcher.

**Content** (`.tf-tool-content`): "← Tools" topnav → `h1` → `.tf-prose-intro` →
`.tf-tool-divider` → a right-aligned action row → the panel → the legal block at
the foot, under its own divider.

The action row sits **above the panel and outside it**, so the controls hold one
position instead of moving with each panel's heading. `.tf-panel-head` is
therefore TITLE-ONLY; the panel keeps its visible `h2`.

## 6. Required copy

These three strings must not drift, so they are reproduced here in full. The
page is the source; this section is the check.

The legal block sits at the foot of the content column, headed `.tf-meta`
**"Disclaimer and privacy"**, and carries three paragraphs in this order:
**generic, privacy, tool-specific.**

**1. Generic** — character-identical on both tool pages AND on `tools.html`.
Being quoted in three places, it changes in ONE commit, per STYLE.md's
quoted-values rule:

> Three Flows Solutions is a business consultancy. These free tools are provided
> to introduce business logic. Do not use the output as the basis for a final
> business decision or for execution without discussing it with qualified
> professional service providers, and check the federal, state, and institutional
> regulations, laws, and standards that apply to your situation.

**2. Privacy** — tool pages only. It is deliberately NOT on `tools.html`, which
has no inputs to describe:

> Nothing you enter in these free tools is sent to us or stored anywhere — we
> have no record of it and cannot retrieve it for you. Your entries exist only
> while the page is open; refreshing or leaving the page clears them. Download
> the PDF if you want to keep your work.

**3. Tool-specific** — each tool's own, per §8.

**Rail CTA**, identical on both pages. It opens in a new tab, deliberately and
only here, so a reader mid-way through the inputs does not lose them:

> Want something customized to your business? Contact us.

The legal block is **not print-hidden** — all three paragraphs print — and the
PDF places the whole block at the TOP of the generated document, ahead of the
panel content.

## 7. Constraints

- **Front-end only, and no persistence of any kind.** No backend and no database
  (SCOPE.md), and additionally **no `localStorage`, no `sessionStorage`, no
  cookies** — nothing that outlives the page. That last rule is what makes §6's
  privacy paragraph true rather than aspirational. A future "save my progress"
  request is a change to this rule and to that paragraph, not a feature that
  fits around them.
- **The engine lives in `assets/tool-<slug>.js`** — never inline (SCOPE.md).
- **No user-facing copy is restated in the JS.** The title, the intro and the
  legal block are READ FROM THE DOM when the PDF is built. This is written from a
  failure: both engines once hardcoded all three, and both drifted — tool-002
  reached the point of printing a hand-tightened paraphrase of its own
  disclaimer, a third wording of one notice. A missing element yields an empty
  string, never a stale fallback.
- **`.tf-prose-intro` is copied verbatim to TWO other places** — the
  `tools.html` card body, and the page's own `<meta name="description">`. One
  wording per tool, in three locations; the page's intro is the source. This
  follows the rule BLOG.md §3 sets for `recap`. Nothing checks any of it; edit
  all three in one commit. tool-001's meta drifted precisely this way and sat
  stale until the page went indexable.

## 8. Per-tool variation

Three things legitimately differ between tools. Everything else in §5–§7 is
shared.

- **"Start over"** appears only where there is input to clear. tool-002 has it;
  tool-001 has none, and none was invented for symmetry.
- **The tool-specific disclaimer paragraph** — §6's third paragraph.
- **Kind — checklist or calculator.** Shown on the index card only, as a Lucide
  icon plus the word, inside `.tf-card-kicker`: `list-checks` "Checklist",
  `calculator` "Calculator". Both at **16px, not STYLE.md §2's 22px default** —
  22px dwarfs a 12px uppercase kicker. Stroke stays 1.75px and the colour comes
  from the kicker's own brick through `currentColor`, so §2 holds otherwise.
