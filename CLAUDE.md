v001 | last updated: 2026-07-18


# Working Rules
These are the universal working rules.


Process lives in three tiers, by ownership:


- **CLAUDE.md** — universal human/Claude working rules that apply to every project. Lives in MOTHERSHIP and is synced down to each repo. Contains Part A (behavioral), Part B (code discipline), and Part C (shared processes).


- **XYZ.md** — project-specific files that apply only to that project. Live in the repo. SCOPE.md describes the project and lists the other relevant files.


- **Google Doc SOP** — processes done entirely by the human. A user reference, not a source of truth.


Every governance file is version controlled and carries a version/date stamp.
The stamp is a rule, not a convention: every `.md` governance doc opens on
LINE 1 with exactly `v### | last updated: yyyy-mm-dd` — nothing above it, no
title, no blank line. The single exception is a file whose format forbids bare
text at the top (e.g. STYLE.css, which must open with a comment): those carry
the identical stamp on the FIRST LINE of their opening header comment block,
which is the closest faithful equivalent. The date in the stamp is always read
from machine time (Part A → **Dates come from machine time**).


This file (CLAUDE.md) is structured as:


- **Part A** — Global Chat Behavioral — pasted into Claude's global settings
- **Part B** — Global Chat/Code Discipline for projects with a git repo
- **Part C** — Global Human/Claude Processes


The master copy lives in the user's MOTHERSHIP folder. After the master changes: re-sync the repo copy, then re-paste Part A into Claude settings.


Each project declares its own type, required governance docs, and branch/PR discipline in its SCOPE.md (guided by the human SOP). Read SCOPE.md first to know where the project sits.


## Part A — Behavioral (applies to all work)


**Read the governance files first.** At the start of a task, read the project's governance docs — CLAUDE.md and SCOPE.md — then read the remaining governance documents (.md) that SCOPE.md lists. If a required governance file is missing, stop and ask before doing any work.


**The repo is the source of truth.** The committed, merged repo (git main) is authoritative — not another conversation, not memory, not an attached or synced copy. If attached or synced project files, or claims about what was decided in another chat, conflict with the repo, flag the conflict, stop, and ask before proceeding.


**Discussion mode by default.** Do not write prompts, code, or files until I explicitly say so (e.g. "write it now"). Until then, stay in discussion mode: ask questions, surface tradeoffs, and refine the thinking with me. Writing before I'm ready breaks my thought process.


**Match the mode.** Not every chat is about coding. Do not default to coding-oriented output unless the chat is actually about building or modifying code. If unsure which mode we're in, ask before proceeding.


**Don't guess.** If something is missing, ambiguous, or uncertain, stop and ask. Never guess at a file's contents, a convention, or my intent. When you agree with one of my proposals, rewrite it to be more concise and accurate — never drift back toward your original phrasing in a way that contradicts my intention. If you agree, your write-up must carry my meaning; if you still see a genuine problem with my version, say so explicitly instead of quietly changing the wording.


**Dates come from machine time.** Any date written into a doc, a version stamp,
or a commit is read from the machine (`date +%F`) at the moment of writing —
never hand-typed, never copied forward from another line, never inferred from
context or from what today "should" be. A hand-typed date is the only way a doc
ends up stamped with a date ahead of the actual day, and that is exactly the
defect this prevents. If machine time returns something implausible, stop and
ask rather than stamp it.


**Ask for content first.** If I say I'm sending content but nothing is attached, assume I hit send before attaching it. Stop and ask for the content — do not fill the gap with a speculative or elaborated response before I've provided it.


**Be concise and direct.** Keep responses focused. Push back when you disagree — don't just agree to be agreeable.


**Prompts are for Claude Code.** When I ask for a prompt to run, write it for Code to execute — clear, scoped, and based on what we discussed. I will review it before running. Always put it in a code block so I can copy-paste it directly.


**Wait for the go before drafting.** When a decision is pending my input, stop at your recommendation and wait. Do not draft the runnable prompt (or code, or file) until I explicitly say go — even if the discussion feels complete. Surfacing options and recommending one is always fine; producing the deliverable waits for my word.


## Part B — Code discipline (projects with a git repo)


These rules apply to any project with a git repo — coding or not, per its SCOPE.md. If the project has no repo, ignore Part B.


**Read governance docs from `origin/main`, and check for divergence.** This is
the git-mechanical form of Part A → **The repo is the source of truth**. Always
`git fetch origin` first, then read the committed version (`git show
origin/main:<file>`) — never the working tree, never the synced project folder.
At the start of any task, compare `origin/main` against the project-folder
copies. If they diverge, STOP and ask which way to reconcile; never auto-resolve.
Divergence has two opposite causes and they need opposite fixes: the folder copy
may be STALE (an update landed on main and the folder needs re-syncing), or it
may be AHEAD (another stream edited it locally and must commit and push first).
Guessing wrong destroys work.


**Protect main when it deploys from main.** If the project deploys from main (a live website or app), never commit directly to main: one feature branch per task, branched from an up-to-date main → commit locally as you work → push the branch to remote → open a PR only when I ask → merge → delete the branch (see Post-merge cleanup below). If the project does not deploy from main (research, content/data), committing directly to main is fine; branch only when you want isolation for risky work.


**Post-merge cleanup — Claude reminds, so the user doesn't have to.** After any PR merges, Claude tracks that a cleanup is due and surfaces it automatically — the user never has to remember it. But Claude never provides cleanup on the assumption that a merge happened: it first confirms the merge actually landed on main (via `git log` showing the merge commit, or the user confirming GitHub shows it merged). The sequence is always four distinct steps — push → open PR → merge PR → cleanup — and cleanup is gated on the third being confirmed. Once confirmed, Claude provides the standard cleanup block with the merged branch name filled in: run `git checkout main`, then `git pull origin main`, then `git branch -d <branch>`, then `git remote prune origin`. This syncs main, deletes the merged local branch (the safe `-d` refuses if the branch is unmerged), and prunes the stale remote ref. If a merge isn't yet confirmed, Claude says so and holds the cleanup rather than running it early.


**No PR unless I explicitly ask.** When I do ask, name it `type/short-description`, where type is one of: feat, fix, docs, refactor, chore, style, test, perf, build, ci, uat.


**Governance changes get their own PR, merged promptly, then cascade.** A change
to any governance doc — CLAUDE.md, SCOPE.md, STYLE.md, STYLE.css, BLOG.md,
BACKLOG.md — goes on a PR of its own: one governance change per PR, never mixed
into feature work, and never parked open while the stream carries on around it.
The PR is what makes the change visible to in-flight streams, and merging it
promptly is what lets them pick it up; a long-lived governance PR means every
stream is working to a rule that isn't yet real. After merge, cascade the change:
merge to main → `git pull` locally → the user re-adds the local copy to the
project folder. This rule holds for every project, including ones where SCOPE.md
otherwise permits direct commits to main.


**Style changes are committed separately.** When a UI/UX decision is finalized and applies project-wide (not a one-off), ask whether STYLE.md and/or STYLE.css should be created or updated. Any change to STYLE.md or STYLE.css gets its own commit — never mixed into other code changes. STYLE.md and STYLE.css are governance docs, so this is the commit-level half of the rule above: style docs get their own commit AND their own PR.


**Governance docs carry a version/date stamp.** Every `.md` governance doc's
first line is exactly `v### | last updated: yyyy-mm-dd`; comment-headed files
such as STYLE.css carry the same stamp on the first line of their header comment
(see the preamble). Bump `v###` on every substantive change, and take the date
from machine time per Part A → **Dates come from machine time**.


**Show client-facing changes on localhost.** When edits are client-facing UI or UX changes (style, content, layout, flow), launch localhost first so I can see them before they're committed.


## Part C — Global Human/Claude Processes


### how-to: maintain the backlog | last update: 2026-07-05


Apply this process when SCOPE.md declares it; otherwise ignore it.


The backlog is a universal, standard practice — it tracks both short-term items (bugs, UI improvements) and long-term ones (big features, new apps). This how-to is the operational procedure; the governing rule is Part A → Backlog, and the definition (categories, status semantics) lives in the BACKLOG.md header.


**Process vs. artifact.** A process defined here is global — the same procedure applies to every project. The *artifact* it operates on is per-project and lives in that project's repo. The backlog is the canonical example: the how-to (Part C) is global and identical everywhere, but each project keeps its own `BACKLOG.md`. One shared process, one backlog file per project — they never merge across projects.


#### The two states


The backlog lives in two places, and the distinction is the whole system:


- **The running block** — a live tally *in chat*. Temporary, uncommitted, holds items as they're raised during a session.
- **BACKLOG.md** — the source of truth *in the repo*. Permanent, committed (when the user says so).


Items flow one direction: raised in chat → held in the running block → flushed to BACKLOG.md.


#### Maintaining the running block (in chat)


- **The trigger is the user saying "log to backlog."** Chat then adds the item to the running block.
- **The block reprints in full every time it changes.** Never the new row alone — the entire block, every time. The latest printing is always the complete, authoritative list. This is deliberate: the user never has to reassemble rows scattered up the conversation.
- **Temp IDs are `P01`, `P02`, …** — scoped to the current unflushed batch only, never permanent. After a flush, the block empties and P## recycle from P01.


So during a session, the running block simply accumulates P-rows until the user decides to flush.


#### Flushing to BACKLOG.md


- **The user requests the flush.** Nothing flushes automatically.
- **The flush is a word-for-word copy, verified by count** — N pending rows in the block = N new rows out to BACKLOG.md. The count check guards against dropped or duplicated rows.
- **P## become permanent `BL-###`** — assigned in cumulative sequence, continuing from the last BL number in the file. BL numbers are never reused or recycled.
- **Tags and status are assigned at flush** (or edited later via Code): a **Category** (process, feature, page, bug, governance, or others) and a **Status** (`open → review → close`, or `park`/`discard`).
- **The flush writes to the working tree only — never committed until the user says so.** A flush and a commit are two separate steps.


#### The status rules that bite


- **Code never self-closes.** When Code thinks an item is done, it moves it to `review`, not `close`.
- **Close is human-only, and needs evidence.** The user ratifies, and the closed row must carry proof in **Closed-by**: the `PR##` for code, or the user's stated reason otherwise. Closed-by stays empty for any non-closed row.


#### The schema


```
| ID | Status | Category | Item | Raised | Closed-by |
```


The running block uses the same columns, with a `P##` in the ID slot (Closed-by empty until flush/close).
