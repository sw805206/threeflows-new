v007 | 2026-08-28 | 249 lines

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
`.tf-tool-divider` → the action row → the panel → the byline → the legal block,
under its own divider.

**The action row** sits above the panel and outside it, so the controls hold one
position instead of moving with each panel's heading. It carries two things at
opposite ends: the **step pager** on the left, and Start over / Download PDF on
the right. The pager is TEXT, on the blog's `.tf-post-pager` idiom —
deliberately unlike the pill controls beside it, because navigation is not an
action — and is labelled with the destination step number only
("← Step 1 | Step 3 →"). At the ends the control is DISABLED, not hidden, so
the row does not jump as you move; it is an `<a>` with no `href`, which is
non-focusable without swapping the element out. Print-hidden: it is page
navigation.

**Each panel** carries a "Step N" eyebrow (`.tf-kicker`) above its `h2`, the
same two-line relationship the rail uses, so the panel identifies itself on
paper where no rail sits beside it. `.tf-panel-head` is otherwise TITLE-ONLY.
**The step number is authored once**, in the rail's `.tf-step-nav-num`; the
eyebrow and both pager labels are derived from it at runtime, so renumbering the
rail cannot leave them disagreeing. The cost is that the eyebrow does NOT appear
in a grep of the static HTML — the markup carries an empty
`[data-step-eyebrow]` slot and the number lands at runtime.

**The byline** — the logo mark plus "Presented by Three Flows Solutions" — sits
at the head of the legal block, on screen, in print and in the PDF. The
" | printed on YYYY-MM-DD HH:MM" stamp appears in print and PDF ONLY, taken at
print/download time rather than page load: on screen a timestamp that changed
every visit would read as a moving publication date. The PDF draws the mark with
jsPDF primitives from the logo's real geometry, so `.tf-byline` and the engines
are commented as a pair.

**Rail, pager, eyebrow and the URL hash are one state**, driven by a single
tablist. There is no second source of truth for which step is active.

## 6. Required copy

These strings must not drift, so they are reproduced here in full. The page is
the source; this section is the check. The first three are on EVERY tool page;
the fourth is scoped to one tool and says so.

The legal block sits at the foot of the content column, headed `.tf-meta`
**"Disclaimer and privacy"**, and carries three paragraphs in this order:
**generic, privacy, tool-specific.**

**1. Generic** — character-identical on every tool page AND on
`tools.html`. Being quoted in four places, it changes in ONE commit, per
STYLE.md's quoted-values rule. The count grows with every tool built, which is
the reason the rule is a single-commit rule rather than a careful-editing one:

> Three Flows Solutions is a business consultancy. These tools are provided
> to introduce business logic. Do not use the output as the basis for a final
> business decision or for execution without discussing it with qualified
> professional service providers, and check the federal, state, and institutional
> regulations, laws, and standards that apply to your situation.

**2. Privacy** — tool pages only. It is deliberately NOT on `tools.html`, which
has no inputs to describe. On `tool-overall-tax-estimator.html` it has a SECOND
reader: the callout in item 4 derives its body from this paragraph at runtime,
so editing the wording here moves both the foot-of-page notice and the surfaced
one, and neither needs touching separately:

> Nothing you enter in these tools is sent to us or stored anywhere — we
> have no record of it and cannot retrieve it for you. Your entries exist only
> while the page is open; refreshing or leaving the page clears them. Download
> the PDF if you want to keep your work.

**3. Tool-specific** — each tool's own, per §8.

**4. Privacy callout title** — `tool-overall-tax-estimator.html` ONLY, per §8's
surfaced-privacy-callout variation. The other tool pages do not carry it and
must not gain it by symmetry:

> Your numbers stay in this browser and never reach us.

**The callout's BODY is never authored.** It is paragraph 2 above, copied into
the callout at runtime from the legal block in the same page — the derivation
idiom §5 uses for the panel eyebrow. One authored wording of that paragraph per
page, so the surfaced notice and the foot-of-page notice cannot become two
versions of one promise. A missing source element yields an empty string, never
a fallback sentence; a fallback would be a second authored wording under
another name, which is the exact failure §7 records. The consequence to accept:
the sentence is NOT in a grep of the static markup at the callout, and the
paragraph therefore prints twice — once surfaced, once in the legal block. That
is intended, not a duplication to tidy.

**Rail CTA**, identical on all three pages. It opens in a new tab, deliberately
and only here, so a reader mid-way through the inputs does not lose them:

> Want something customized to your business? Contact us.

The legal block is **not print-hidden** — all three paragraphs print — and the
PDF places the whole block at the TOP of the generated document, ahead of the
panel content. Where a tool also carries §6's fourth string, that callout
prints too and follows the legal block in the PDF, so the order on paper is
legal block, then callout, then panel. The legal block is no longer the only
thing standing between the top of the document and the panel content.

## 7. Constraints

- **Front-end only. Tool input never persists and never leaves the browser.**
  No backend and no database (SCOPE.md). Nothing a reader types INTO a tool is
  stored, transmitted, or allowed to outlive the page — no `localStorage`, no
  `sessionStorage`, no cookies, no network call carrying it. That is what makes
  §6's privacy paragraph true rather than aspirational, and a "save my
  progress" feature is still a change to this rule and to that paragraph, not
  something that fits around them. Site-level state that is NOT derived from
  tool input — the email-unlock flag being the only current case — is
  permitted, and is governed where it is defined rather than here. The
  distinction is the reader's data versus the site's own bookkeeping; if a
  proposed value could be reconstructed from what someone typed into a tool, it
  falls under the prohibition.
- **The engine lives in `assets/tool-<slug>.js`** — never inline (SCOPE.md).
- **No user-facing copy is restated in the JS.** The title, the intro and the
  legal block are READ FROM THE DOM when the PDF is built. This is written from a
  failure: the first two engines once hardcoded all three, and both drifted —
  tool-002
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

Four things legitimately differ between tools. Everything else in §5–§7 is
shared.

- **"Start over"** appears only where there is input to clear. tool-002 and
  tool-003 have it; tool-001 has none, and none was invented for symmetry.
- **The tool-specific disclaimer paragraph** — §6's third paragraph.
- **A surfaced privacy callout.** `tool-overall-tax-estimator.html` carries
  §6's fourth string in a base `.tf-callout` above the panel; tool-001 and
  tool-002 do not, and were not given one for symmetry. The distinction is what
  the tool ASKS FOR, not what it does with it: tool-003 collects household
  income, wages, business revenue and a home value — figures a reader may
  hesitate over — where tool-001 asks only structural questions and tool-002
  asks about a plan rather than a paycheck. Every tool page makes the same
  promise in its legal block; this one repeats it where the reader meets it
  before typing. A tool that starts collecting figures of that kind should gain
  the callout; one that does not should not carry it as decoration.
- **Kind — checklist or calculator.** Shown on the index card only, as a Lucide
  icon plus the word, inside `.tf-card-kicker`: `list-checks` "Checklist",
  `calculator` "Calculator". Both at **16px, not STYLE.md §2's 22px default** —
  22px dwarfs a 12px uppercase kicker. Stroke stays 1.75px and the colour comes
  from the kicker's own brick through `currentColor`, so §2 holds otherwise.

## 9. Card-only entries (paid tools)

A paid tool has no page in this repo. It is a card on `tools.html` whose link
leaves for `app.threeflows.com`, where `threeflows-app` owns the tool, the
account, the entitlement and the payment.

Such an entry therefore has NO slug (§1), NO `data-tool-id` (§2), NO
`toollist.json` row (§3), and none of §5–§7 applies to it. It stays out of the
manifest for the same reason §3 gives for the manifest's current thinness:
`filename` must point at a file on disk, and there is none. If the manifest
later earns a consumer that needs the whole shelf rather than the pages, that
is the moment to revisit.

What the card carries: the kind kicker per §8, a title, a description, and a
pill whose label is the app's entry action. It carries NO price — pricing lives
in the app, and a number quoted here would go stale in a repo this one cannot
see, with nothing to catch it.

The link target must be a stable destination page supplied by `threeflows-app`,
never the auth screen. A reader arriving cold from a blog post needs to see what
the tool is before being asked to authenticate.

The boundary: card copy is owned here; everything past the click is owned by
`threeflows-app`.
