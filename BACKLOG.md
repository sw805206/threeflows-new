v002 | last updated: 2026-07-15

# BACKLOG.md — threeflows-new

Part C backlog process (CLAUDE.md) applies. This file is the source of
truth; items are raised in chat, held in the running block, and flushed
here on the user's request. Also holds the page checklist and carry-over
inventory status (per SCOPE.md).

**Categories:** process, feature, page, bug, governance, others
**Status flow:** open → review → close; or park / discard.
Code never self-closes: done items move to review; only the user closes,
with evidence in Closed-by (PR## for code, or the user's stated reason).

## Backlog

| ID | Status | Category | Item | Raised | Closed-by |
|---|---|---|---|---|---|
| BL-001 | open | process | Cutover: domain flip to this repo per SCOPE.md (verify preview → detach domain from old repo → attach CNAME + custom domain here → verify Cloudflare DNS → spot-check live → archive old repo) | 2026-07-15 | |
| BL-002 | open | governance | SCOPE.md v002: add rule "Style-system changes identified but not immediately implemented are logged to BACKLOG.md — never left untracked."; trim Open decisions now tracked here (BL-007, BL-008) | 2026-07-15 | |
| BL-003 | discard | feature | Current-page nav underline affordance (ink text + 2px brick underline) — implemented in PR#1, then removed by user design decision | 2026-07-15 | User: underline removed by design decision |
| BL-004 | open | feature | Footer buildout: decide what the minimal footer grows into (nav links, contact info, tagline) | 2026-07-15 | |
| BL-005 | open | feature | Tagline: placeholder "Beside you, start to scale" is TBD in STYLE.md — confirm or replace; placement decision held (nav ruled out; hero/footer candidates) | 2026-07-15 | |
| BL-006 | open | process | STYLE.css foundations review: check brand package against hard constraints and foundation coverage before page builds | 2026-07-15 | |
| BL-007 | open | page | Blog restyling depth: full restyle vs minimal carry-over styling for old post bodies (SCOPE.md open decision) | 2026-07-15 | |
| BL-008 | open | page | Hidden pages triage: carry all vs keep/kill per page, decided during carry-over inventory (SCOPE.md open decision) | 2026-07-15 | |
