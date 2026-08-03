v010 | 2026-08-02 | 273 lines

# PROCESS.md — Human/Claude working procedures (this project)

Collaborative step-by-step procedures the human and Claude run together for this
project. Processes done entirely by the human live in the Google Doc SOP, not here;
universal human/Claude rules live in CLAUDE.md Part C. Registered in SCOPE.md.

Sections: (1) Images · (2) Blog updates · (3) Client and reference cards ·
(4) Stylebook maintenance · (5) Privacy page stamp · (6) Building or adding a
page · (7) Scheduled site scan

---

## 1. Images

How an image goes from the human's library onto the live site. Applies to every page.

### Principle — an image exists in at most 2.5 places
- **Master (1):** the human's personal library, rooted at `/Users/swai/Images` and
  organized into subfolders (e.g. `/Users/swai/Images/entity` for client marks). Shared
  across projects. Read-only — Claude never modifies, moves, or deletes a master, and
  never assumes a file's location: the human always supplies the exact path.
- **Live (1):** the promoted, web-ready copy under `assets/images/`, committed and
  referenced by pages. The only in-repo copy.
- **Preview (0.5):** a transient working copy outside the repo, so never
  committable, deleted once approved. In a Code session it goes to a temp path
  and is shown inline for immediate review — no managed folder. In a Claude chat
  with no filesystem it goes to `/Users/swai/Images/_previews/`. Either way the
  approved bytes must survive until promotion, since step 4 verifies them.

The repo never holds masters or unpromoted originals. The one intake exception is
`assets/images/**/src/` (e.g. `assets/images/src/clients/`), a gitignored intake tray:
files may pass through it but it is never committed and holds nothing on `main`.

### Procedure (photographs)
1. **Human points** — gives a library path and the target page/section.
2. **Claude previews** — reads the master read-only, produces a web-ready derivative in
   `/Users/swai/Images/_previews/`: crop to the section's aspect, downscale only (never
   upscale), strip EXIF. The `.tf-photo` brand grade is applied by CSS at render, not
   baked into the file. In a Code session Claude displays it inline; otherwise it sends the preview
   link.
3. **Human reviews** — approves, or requests a re-crop (repeat step 2). Nothing is
   promoted unapproved.
4. **Claude promotes + cleans** — copies the approved bytes byte-identically into
   `assets/images/` (sha256-verified against the approved preview, never re-processed on
   the way in), names per the section's convention, wires the page reference, and deletes
   the preview.
5. **Result** — the image exists in exactly 2 places: library master + committed repo copy.

**Timing — the image ships with its page.** For a page or post build, complete
this full cycle (point → preview → approve → promote) before committing — the
image lands in the **same commit and PR as the content**, never a follow-up.
A build isn't finished until the image is either promoted or explicitly
deferred by the human's own decision (e.g. an image-less ship, per SCOPE.md's
"Pages may ship image-less only by explicit decision").

### Logos (client marks — a variant of the above)
Logos are not photographs: no crop-to-aspect, no `.tf-photo` grade. They still follow the
point → preview → approve → promote + clean flow, with these differences.

- **Normalization (always):** convert to `client-<kebab-slug>.png`, transparent
  PNG, with the mark's own colours preserved — Claude never recolours a mark.
  Source formats vary (SVG/PNG/WEBP/AVIF/JPEG); all normalize to this.
- **Size is derived from the stylesheet, never hardcoded.** A fixed bounding box
  is the wrong instrument: it sizes the canvas rather than the mark, so a square
  mark can render at a very different optical weight from a wide wordmark.
  STYLE.css caps rendered size in both placements, which is what actually keeps
  the set even.
  Instead:
  1. **Trim the surrounding empty margin first** — autocrop the alpha, or
     flood-fill from the edges on an opaque source. Untrimmed padding is the
     main cause of "these logos look different sizes".
  2. **Read the rendered slot height from `STYLE.css`** for the placement in
     question — `.tf-client-logo-slot` for the `about.html` carousel,
     `.tf-logos img` for the `index.html` `#trusted` row.
  3. **Scale the trimmed mark to 2× that height** for retina, capping width so a
     long wordmark does not run away.
  The two placements render at different sizes, which is why the committed set
  carries both `client-<slug>.png` and a smaller `client-<slug>-trim.png`.
- **Background: knockout to transparent (default).** The logo then sits on any
  ground and matches whatever surface it is placed on. Two cases where knockout
  fails and **recolor-to-ground** is used instead: the mark itself contains the
  background colour, so knockout punches holes in it; or the source is a JPEG,
  whose compression fringes the cut edges. Both are visible at preview — if the
  knockout looks damaged, fall back and say why.
- **Off-color / degraded sources:** the preferred fix is a clean source file (official
  brand/press-kit asset). When none is obtainable, Claude may attempt correction, but the
  result is best-effort and human-approved, not guaranteed brand-accurate — a logo is a
  client's identity, so "approximately right" is a judgment the human signs off on, not Claude.
- **Placement conflicts are real:** the light carousel wants full-color, light-ground logos; a
  monochrome-ink strip (`.tf-logos`, if built) wants flat-ink or text and would destroy
  multi-color marks. A logo needed on both grounds may require two variants, or the mono
  placement stays text. Decide per placement; do not force one file to serve both.
- **New client (no prior logo):** if promoting a mark for a client that currently renders as a
  text wordmark (a provisional `.tf-client-wordmark` rule), removing that rule is a STYLE.css
  change — governance-scoped, handled as its own commit, not folded into the image promotion.

### Known state (not a standard to preserve)
The committed set is in good shape as of 2026-08-01: zero trapped margin (trimmed
in STYLE.css v16), rendered spread of 1.7x in the carousel and 1.27x in `#trusted`,
and no upscaled logos after PR #96. Of the eight opaque files, seven sit on
`#FCFBFA` = `--tf-paper`, correctly recolored-to-ground; only gevi (`#A5C7CD`) is
genuinely mismatched. gevi and kanu are low-resolution and accepted as-is — no
higher-resolution source exists.

---

## 2. Blog updates

**Recap and intro must be verbatim-identical.** `bloglist.json`'s `recap` field
is a byte-for-byte copy of the post's own `.tf-prose-intro` text (BLOG.md §2)
— not just the same words, but the same punctuation. A straight quote/apostrophe
standing in for the post's curly one is a mismatch, not a nit. Whenever either
side is edited — the intro in the post's HTML, or the recap in the manifest —
re-copy into the other side in the **same commit**; nothing checks this
automatically (BLOG.md's opening note).

**Keep title and intro length roughly consistent across posts.** The index
cards render title and recap at a fixed width, so a much longer or shorter intro
makes one card sit taller than its neighbours. Match new posts against the
existing ones by eye — there is no fixed word count.

**Audit periodically, or whenever asked:** for each post, extract its
`.tf-prose-intro` text, decode HTML entities, collapse whitespace, and diff
against its manifest `recap`. Report every mismatch found — including
punctuation-only ones — rather than silently picking a side; which text
becomes canonical is the human's call. (This check moves into the §7 Action once
that exists; until then it stays manual.)

## 3. Client and reference cards

Clients and references are **different procedures** despite both being external
organizations with logos. They share nothing but `.tf-card-link`, a five-line
hover utility: different markup, different image handling, different build
mechanism. Neither is a template for the other.

### 3.1 Adding a client

Client cards live in **`about.html` band 2**, the carousel. Each is a
hand-written `<a class="tf-card-sm tf-card-link">` wrapping
`<img class="tf-client-logo">` inside `<span class="tf-client-logo-slot">`, plus
`.tf-pill.tf-pill-sm.tf-pill-tint-*` category pills. No text blurb.

`index.html`'s `#trusted` band is **not** cards — it is `.tf-logos`, a flat row
of bare `<img>`. A client shown there needs a second, smaller
`client-<slug>-trim.png`.

1. Human supplies the logo source and display name. Neither is inferred.
2. Logo goes through §1's logo flow — trim, scale to the placement's slot
   height, knockout to transparent, preview, approve, promote.
3. If the client also appears in `#trusted`, produce the `-trim` variant sized
   for that row. Two placements, two files.
4. Alphabetical by display name — recheck the whole set, never append.
5. Card, pills, and image land in the **same commit**.
6. Removing a provisional `.tf-client-wordmark` rule is a STYLE.css change:
   separate, style-only commit.
7. Show on localhost before committing.

### 3.2 Adding a reference

Reference cards are generated by JS from `references.json`. Adding one is a
**data edit, not a page edit** — `links.html` itself is not touched.

Favicons are fetched live from Google's favicon service at 20×20 with `alt=""`,
degrading to hidden via `onerror`. **No image is committed and §1 does not
apply.**

1. Human supplies URL, name, description, and grouping.
2. Add the entry to `references.json` following the file's existing shape.
3. Ordering follows what the file and the rendering code already do — check
   both rather than assuming alphabetical.
4. New external links are picked up by the §7 scan.
5. Show on localhost before committing.

## 4. Stylebook maintenance

The design system starts in **Claude Design**, which sets the initial theme and
produces v1 of STYLE.md and STYLE.css. The site is built from that v1, and both
files are then extended in place as pages are built (STYLE.md's ratchet record
tracks which page defined what). Periodically the current STYLE.md and STYLE.css
are uploaded back into Claude Design for reconciliation; anything that comes back
lands as ordinary versioned edits.

`int-stylebook.html` (repo root, internal — no nav, reachable by URL only, and
carrying `noindex,nofollow` per SCOPE.md) is the internal reference for the
colour + type system. It **links the live `STYLE.css`**,
so the rendered examples track it automatically — a swatch's colour comes from
`var(--tf-*)`, and its printed **hex is read at runtime** from that computed
colour (a small script resolves each swatch, including the `color-mix()` tokens,
and flips the label to ink/paper by luminance). So a token whose VALUE changes
needs no edit — both the chip and its printed hex self-update. Type specimens
likewise re-render at the live sizes.

What does NOT self-update, and must be re-synced by hand:

- **The token SET.** If a `--tf-*` colour token is ADDED, REMOVED, or RENAMED in
  `STYLE.css`, its swatch card must be added / removed / renamed — the page does
  not grow or shrink on its own. Same for a type-scale token (add/remove its
  specimen row).
- **The labels beside them.** Token names, usage/description notes, `color-mix`
  derivation notes, group headings, and the printed size/role labels on the type
  specimens are all static text.
- **The header version stamps** — "generated from STYLE.md vXX / STYLE.css vXX".
- **The tag→tint labels.** The Plan · Source · Launch · Scale · Collab labels
  beside the tint samples are static text: if STYLE.md's tag→tint map changes,
  update them by hand. The tint COLOURS no longer need this — v032 tokenized the
  backgrounds and v041 the text halves, so both now self-read like every other
  swatch. A tint value change needs no stylebook edit; only an add / remove /
  rename does, per the token-set rule above.

So whenever a STYLE.css / STYLE.md version bumps, check the diff for a token
ADD / REMOVE / RENAME (a value-only change needs nothing). If there is one, add /
remove / rename the affected swatch or specimen and its label, then update the two
header stamps. Separately, check for a change to STYLE.md's tag→tint map and
hand-sync the labels. A pure component or layout change with no token/scale set
change needs no stylebook update.

---

## 5. Privacy page stamp

The operative rule lives in `privacy.html` itself, as a comment beside the stamp
— that is where it is needed and where it will be seen.

In short: any commit that modifies `privacy.html` refreshes the visible
"Last updated: Month D, YYYY" line in the **same commit**, read from machine time
(`date +%F`) and never hand-typed. See CLAUDE.md Part B → **Governance docs carry
a version stamp** for the general machine-time requirement.

---

## 6. Building or adding a page

1. **Human initiates** with the page's purpose and content in chat. Never build
   from an assumed brief.
2. **Ask for a sketch**, then produce a mock in chat from STYLE.md so layout is
   agreed before any file exists.
3. **Image via §1** — ask the human to supply it; point → preview → approve →
   promote.
4. **Once content and layout are both confirmed**, write the prompt for Code to
   build. Not before.
5. **Page-unique design is allowed.** A layout or style used only on this page
   need not be pre-built into STYLE.css or STYLE.md — but it must be built from
   existing tokens, never raw hex or px, and it gets a one-line note in
   STYLE.md's ratchet record so the next page finds it. If the human later asks
   to reuse it, discuss promoting it into the governance docs first.
6. **Ask whether the page goes in the nav** and act accordingly. A page is not
   linked in `partials.html` until the human says it is visible; until then it
   is live but unlisted.
7. **Use a greppable placeholder** — `href="#TODO"` — where a real link is not
   ready yet, so it can be found before launch.
8. **Show it on localhost** and keep editing until the human is satisfied, then
   open the PR.

---

## 7. Scheduled site scan

A GitHub Action runs on a schedule and checks the live site. The specific checks
are defined in the workflow itself, not listed here — the workflow is the source
of truth for what it does.

**The reminder is email.** On failure GitHub emails the repo owner. There is no
Issues integration and no bot-written backlog row: the human reads the run
output and either fixes the finding or logs it to BACKLOG.md by hand, through the
normal Part C flush.

Known limitation: GitHub silently disables scheduled workflows after 60 days
without repo activity.

**Status: the Action does not exist yet.** This section documents the intended
process; building the workflow is tracked in BACKLOG.md.
