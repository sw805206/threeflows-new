v005 | last updated: 2026-07-29

# PROCESS.md — Human/Claude working procedures (this project)

Collaborative step-by-step procedures the human and Claude run together for this
project. Processes done entirely by the human live in the Google Doc SOP, not here;
universal human/Claude rules live in CLAUDE.md Part C. Registered in SCOPE.md.

Sections: (1) Images · (2) Blog updates [TBD] · (3) Adding clients [TBD] · (4) Stylebook maintenance · (5) Privacy page stamp

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
- **Preview (0.5):** a transient working copy at `/Users/swai/Images/_previews/`
  (outside the repo, so never committable). Deleted once the image is approved.

The repo never holds masters or unpromoted originals. The one intake exception is
`assets/images/**/src/` (e.g. `assets/images/src/clients/`), a gitignored intake tray:
files may pass through it but it is never committed and holds nothing on `main`.

### Procedure (photographs)
1. **Human points** — gives a library path and the target page/section.
2. **Claude previews** — reads the master read-only, produces a web-ready derivative in
   `/Users/swai/Images/_previews/`: crop to the section's aspect, downscale only (never
   upscale), strip EXIF. The `.tf-photo` brand grade is applied by CSS at render, not
   baked into the file. Claude sends the preview link.
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

- **Normalization (always):** convert to the committed convention — `client-<kebab-slug>.png`,
  transparent PNG, fit within ≤260 × ≤64 px, full color. Source formats vary
  (SVG/PNG/WEBP/AVIF/JPEG); all are normalized to this.
- **Background handling (when a logo has a baked-in background):** two strategies, chosen by
  the human per logo at preview:
  - **Knockout** → make the background transparent. Reusable on any ground, but riskier: can
    erase mark parts that share the background color, and JPEG sources fringe at edges (avoid
    knockout on JPEG).
  - **Recolor-to-ground** → repaint the background to match the surface the logo sits on (e.g.
    the carousel card ground). Safe and clean, but the file is then tied to that one ground and
    is not reusable on a differently-colored surface.
  Default: recolor-to-ground when the logo has a single known placement; knockout only when the
  logo must sit on multiple grounds and the source permits a clean cut.
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
The committed client-logo set is already inconsistent on background (some transparent, some
white-boxed). New promotions need not match that inconsistency; follow the strategy above per
logo.

---

## 2. Blog updates
_TBD — to be specified. Placeholder; do not infer a procedure until worked through._

## 3. Adding clients
_TBD — to be specified. Placeholder; do not infer a procedure until worked through._

## 4. Stylebook maintenance

`stylebook.html` (repo root, hidden — no nav, reachable by URL only) is the
internal reference for the colour + type system. It **links the live `STYLE.css`**,
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
- **The category tint pairings.** The six `.tf-pill-tint-*` samples (background +
  text) in the Colour section are RAW HEX LITERALS in `STYLE.css`, not tokens, so
  they CANNOT self-read — their hexes are hardcoded in the stylebook. If a tint's
  background or text hex changes in `STYLE.css`, update the matching sample and its
  printed hexes by hand; likewise update the tag→tint labels (Plan · Source ·
  Launch · Scale · Collab) if STYLE.md's tag→tint map changes. This is the tints'
  manual-drift surface, distinct from the self-reading token swatches.

So whenever a STYLE.css / STYLE.md version bumps, check the diff for a token
ADD / REMOVE / RENAME (a value-only change needs nothing). If there is one, add /
remove / rename the affected swatch or specimen and its label, then update the two
header stamps. Separately, check for a change to any `.tf-pill-tint-*` literal (bg
or text) or the tag→tint map, and hand-sync the tint pairings — a raw-literal edit
is NOT a token change and will not surface as one. A pure component or layout
change with no token/scale set change and no tint-literal change needs no stylebook
update.

---

## 5. Privacy page stamp

`privacy.html` carries a visible **"Last updated: Month D, YYYY"** stamp — the
`.tf-meta` line under the intro. It is the date shown to users and the one the
policy's own "Changes to This Policy" section promises to keep current.

**RULE — any commit that modifies `privacy.html` MUST refresh that stamp in the
SAME commit.** The date is read from machine time at the moment of the edit
(`date +%F`) and rendered in the page's existing `Month D, YYYY` format — never
hand-typed, copied from another line, or inferred (Part A → **Dates come from
machine time**). A commit that touches `privacy.html` without updating the stamp
is non-compliant; a commit that does not touch `privacy.html` leaves it untouched.
