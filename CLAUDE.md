v022 | 2026-08-30 | 366 lines

# Working Rules

Process lives in three tiers, by ownership:

- **CLAUDE.md** — universal human/Claude working rules that apply to every
  project. Contains Part A (behavioral), Part B (code discipline), and Part C
  (shared processes).
- **SCOPE.md** — describes the project and lists the other governance files it
  requires. Each project declares its own type, required governance docs, and
  branch/PR discipline here. Read it first to know where the project sits.
- **XYZ.md** — project-specific files, in the repo.
- **Google Doc SOP** — processes done entirely by the human. A user reference,
  not a source of truth.

**Precedence.** SCOPE.md governs project-specific matters. Where SCOPE.md and
CLAUDE.md conflict, CLAUDE.md Part A and Part B govern.

## Part A — Behavioral (applies to all work)

**Read the governance files first.** Read SCOPE.md at the start of every task —
in a Claude chat, the project-folder copy; in Code, the version on
`origin/main`. Read CLAUDE.md as well when the task touches the repo,
governance, or the backlog: Part A is already pasted into my global settings, so
Parts B and C are what opening the file adds. Then read the docs the task
ACTUALLY TOUCHES, drawn from the set SCOPE.md lists — not the whole set. A doc
unrelated to the task is not read "for context": STYLE.md and STYLE.css are read
when a task touches styling, which is when they earn their size. Read once per
chat at the first task, and again after a prompt I ran lands, since the files
have changed underneath you. If a required governance file is missing, stop and
ask before doing any work.

**Don't guess.** If something is missing, ambiguous, or uncertain, stop and ask
— never guess at a file's contents, a convention, or my intent. When you agree
with a proposal of mine, restate it more concisely without drifting back toward
your own phrasing; if you still see a genuine problem with it, say so explicitly
rather than quietly changing the wording.

**Ask for content first.** If I say I'm sending content but nothing is attached,
assume I hit send before attaching it. Stop and ask for the content — do not
fill the gap with a speculative or elaborated response before I've provided it.

**Match the mode.** Not every chat is about coding. Do not default to
coding-oriented output unless the chat is actually about building or modifying
code. If unsure which mode we're in, ask before proceeding.

**Be concise and direct.** Keep responses focused. Push back when you disagree —
don't just agree to be agreeable. Do not over-explain your reasoning; I will ask
if I want more.

**Write US English.** Prose in governance docs, code comments, commit messages,
and user-facing copy alike. The exceptions are what make the rule safe to apply
mechanically: identifiers, file paths, CSS custom properties and quoted
third-party text keep whatever spelling they already have, because changing
them changes what they refer to rather than how it reads. So does a file
authored in another repo and synced in — it must stay byte-identical across
copies, so a British form there is corrected at its source, never here.

**The repo is the source of truth.** In any project with a git repo, the
committed, merged repo (git main) is authoritative — not another conversation,
not memory, not an attached or synced copy. If attached or synced project files,
or claims about what was decided in another chat, conflict with the repo, flag
the conflict, stop, and ask before proceeding.

**Prompts are for Claude Code.** When I ask for a prompt to run, write it for
Code to execute — clear, scoped, and based on what we discussed. I will review
it before running. Always put it in a code block so I can copy-paste it
directly. If you amend a prompt already written, regenerate it in full.

**Discussion mode by default — wait for the go.** Do not write prompts, code, or
files until I explicitly say so (e.g. "write it now"). Until then, ask
questions, surface tradeoffs, and refine the thinking with me. Surfacing options
and recommending one is always fine; producing the deliverable waits for my
word, even if the discussion feels complete. Do not draft until all your own
questions are answered.

## Part B — Code discipline (projects with a git repo)

These rules apply to any project with a git repo, coding or not, per its
SCOPE.md. Clauses referencing `origin/main`, pushing, or PRs apply only where
the repo has a remote; the rest apply to local-only repos too.

**Read governance docs from `origin/main`.** Always `git fetch origin` first,
then read the committed version (`git show origin/main:<file>`) — never the
working tree, never the synced project folder.

**Sync audit.** At the start of every repo-touching task (pure discussion turns
don't need it), compare line 1 — version, date, line count — between
`origin/main` and the project-folder copy. Line 1 only: never read a file's body
for an audit. Audit whatever governance docs SCOPE.md lists, plus CLAUDE.md and
SCOPE.md themselves, plus any stamped non-`.md` governance file the project
keeps (e.g. STYLE.css); never assume a fixed list. Code reads both sides itself
and reports the joined result — a chat cannot read git, so it is never asked to
supply half of it. Where the two differ, the higher version is current — flag it
and sync to that version.

**Verify the git identity before pushing.** Where the repo has a remote, run
`gh auth status` at the start of any task that will push, and confirm the active
account matches the GitHub account declared in SCOPE.md. `gh auth switch` and
`gh auth login` change credential state for every project on the machine, so
Claude never runs either — on a mismatch, stop and give me the exact command to
run myself. The declared account is per-project and the switch is global, which
is why this is checked at the start of the task rather than discovered at the
push.

**Governance docs go direct to main.** Every `.md` governance doc listed in
SCOPE.md — CLAUDE.md, SCOPE.md, BLOG.md, BACKLOG.md, PROCESS.md and the like —
is committed straight to main and pushed immediately. No branch, no PR. Their
blast radius is small: they carry no styling or page logic, so a bad edit
degrades a doc or an internal view, never the public site. Push is the finish
line: an edit left uncommitted or unpushed is the failure this rule exists to
prevent.

**Publicly-served governance files are the exception.** Where SCOPE.md declares
a governance file publicly served, an authored change to it keeps branch and PR
discipline: committing straight to main would change the live site with no
review. A byte-identical copy of content already reviewed in the repo where it
was authored is not an authored change, and goes direct to main like any other
governance doc — unless the RECEIVING repo deploys from main. The property that
matters there is not whether the change was authored but where it lands: a sync
copy into a repo whose main is the deploy ships live styling that nothing has
reviewed against THAT repo's screens, and being reviewed in the authoring repo
is not the same review. Into a deploying repo, such a copy keeps branch and PR
discipline on the receiving side.

**Governance docs carry a version stamp.** Line 1 of every `.md` governance doc
is exactly `v### | yyyy-mm-dd | #### lines` — nothing above it, no title, no
blank line. A file whose format forbids bare text at the top (e.g. STYLE.css,
which must open with a comment) carries the identical stamp on the first line of
its opening comment block. Bump `v###` on every substantive change. The date and
the line count are read from the machine at the moment of writing (`date +%F`,
`wc -l`) — never hand-typed, never copied forward from another line. A
hand-typed date is how a doc ends up stamped ahead of the actual day, and a
hand-typed line count is worse than none. The date is the machine's LOCAL
timezone: the stamps are for the human reading them, so a doc edited late at
night carries that night's date. If machine time returns something implausible,
stop and ask rather than stamp it. Version counters are per-file and
independent: each doc's `v###` tracks its own history, so a constant offset
between two files is expected and is not a defect to reconcile.

**Correcting a claim means correcting what justified it.** When a factual claim
in a governance doc changes, the sentence stating the claim is not the only thing
that moved. Two others did, and neither announces itself:

- **The justification** — the sentences saying WHY the doc says what it says: the
  reason, the argument, the "because". Someone checking the doc reads the claim
  against reality, because the claim is what they came for. The reasoning reads as
  background, and nobody diffs background.
- **The conclusion** — what the doc went on to infer FROM the claim. This can sit
  paragraphs away, in a different subsection, and it can be further from true than
  the premise ever was.

So amending is three passes rather than one. Correct the claim. Then find the
sentences explaining why it said that. Then find what was concluded from it. Check
all three against what is now true, and delete or rewrite a justification whose
premise has died rather than leaving it standing because the paragraph around it
was rewritten and now looks fresh. **A rewritten paragraph is not evidence that
the sentences inside it were re-read.**

The check is cheap and specific: after the edit, search the section for the words
that carry reasoning — because, since, which is why, so that, the reason — and for
anything that begins "this means" or "so there is no". Each hit either still
follows from what the doc now says or does not.

**The evidence, kept because a rule without it gets softened by whoever finds it
inconvenient.** This project has hit it four times: PR #14's form, the Resend
claim, the mock consolidation's undrawn list, and the plan column. In three of the
four a rewrite of the surrounding paragraph left the justifying sentences looking
untouched — the paragraph was newer than the sentences inside it. The fourth is
the one that establishes the conclusion pass: the doc said nothing recorded which
plan a user had bought, which became false when the column was added, and
concluded from it that there was nowhere at all a paid user could read their plan
back — which became false later still, and was further from true. Checking only
the premise would have left the conclusion standing.

**Protect main when it deploys from main.** Where the project deploys from main
(a live website or app), anything on the branch-and-PR side of the split takes
one feature branch per task, branched from an up-to-date main → commit locally as
you work → push the branch → open a PR only when I ask → merge → clean up. Where
the project does not deploy from main, a commit reaches no reader and there is
nothing for the split to protect: committing directly to main is fine, and you
branch only when you want isolation for risky work.

**Direct to main:** anything the build validates before it publishes, plus
governance docs.

**Branch and PR unless I say otherwise:** anything on a deploying surface that
nothing validates — the viewer, the build script, stylesheets.

Public or private makes no difference. If it isn't obvious which side a file sits
on, the test is whether a bad commit reaches readers with nothing catching it; if
that's still unclear, ask.

When I ask for a PR, name it `type/short-description`, where type is one of: feat,
fix, docs, refactor, chore, style, test, perf, build, ci, uat.

**Post-merge cleanup — Claude reminds, so I don't have to.** After any PR
merges, Claude surfaces the cleanup automatically, but only once the merge is
confirmed on main (a merge commit in `git log`, or my confirmation). The
sequence is push → PR → merge → cleanup. Then provide: `git checkout main`,
`git pull origin main`, `git branch -d <branch>`, `git remote prune origin`.

**Style changes get their own commit.** When a UI/UX decision is finalized and
applies project-wide (not a one-off), ask whether STYLE.md and/or STYLE.css
should be created or updated. Any change to either gets its own commit, never
mixed into other changes.

**Show client-facing changes on localhost.** When edits are client-facing UI or
UX changes (style, content, layout, flow), launch localhost first so I can see
them before they're committed. Start the server with caching disabled, or hand
over the URL cache-busted (`?v=<short-sha>` or equivalent) — never a bare
`localhost:####`. Beating the cache is Claude's job, not mine: a review of a
stale page is a wasted review.

## Part C — Global Human/Claude Processes

Processes here are either **universal** — they apply to every project, always —
or **opt-in**, applying only where SCOPE.md declares them.

### how-to: keep CLAUDE.md in sync (universal)

The master copy of CLAUDE.md lives on local disk at
`/Users/swai/sw805206/CLAUDE.md`. Every project repo holds a copy, and the disk
master is what they reconcile against — regardless of which local tree or which
GitHub account the repo belongs to, since the master is an absolute path, not a
tree-relative one. A new repo joins by taking a copy at creation, per §how-to:
start a new project.

**Publishing a change (project A).** Edit the copy in project A's repo, commit
to main, then copy the file back to the disk master. The change is not finished
until both have happened: an uncommitted edit is invisible to other projects,
and a stale disk master is a file every other project will sync backwards from.

**Reconciling a copy (any project).** At the start of a task, compare the
project's copy against the disk master by line 1, and where they differ, **sync
to the later version automatically** — Claude performs the sync and reports it,
rather than flagging the gap and waiting to be told. The comparison is
two-sided, so it has two outcomes. **Disk master later:** copy it into the
working tree, commit, and push. **Repo copy later:** copy it out to the disk
master, which is the publishing step above run on its own. Either way both
copies end the task on the same version, and a gap is never carried forward
across tasks.

**Human steps after any change.** Re-paste Part A into Claude's global settings,
and upload the current file to each Claude project folder.

### how-to: start a new project (universal)

A new repo is set up deliberately; nothing about it is automatic. The decisions
below are made before any work begins, and a chat opening this section asks for
them rather than assuming them.

**The account decides the tree.** Each GitHub account owns one local tree, and a
repo lives in the tree matching the account that owns it. Placement is not
cosmetic: commit identity is derived from the directory, so a repo cloned into
the wrong tree commits under the wrong account and nothing announces it.

**The clone URL carries the credential path.** Accounts authenticate
differently, and the URL form is what selects between them. Clone with the form
belonging to that account, not a bare `github.com` URL assumed to work for all
of them. A wrong URL fails loudly, which is the easy failure.

**Verify identity before the first commit.** Run `git config user.email` in the
fresh clone and check it against the account the project belongs to. This is a
rule, not a step to remember: no commit is made in a new repo until it has
passed. It is the only check that catches a wrong-tree clone, whose failure is
otherwise silent.

**Then author the governance the project needs.** Copy CLAUDE.md from the disk
master per §how-to: keep CLAUDE.md in sync — byte-identical, never re-stamped.
Author SCOPE.md, which declares the project type, the governance docs it
requires, whether it deploys from main, and its branch/PR discipline; little
else can be decided until it exists. Add BACKLOG.md where the project opts into
the backlog process. Ignore local tooling directories at creation rather than
after they first dirty the tree.

**The first push anchors the repo.** Governance docs go direct to main per Part
B, so the initial commit is pushed immediately rather than left sitting local.

### how-to: maintain the backlog (opt-in — when SCOPE.md declares it)

The backlog tracks DEFERRED work — anything raised but not being done now,
short-term or long-term. The definitions — categories, status semantics — live
in the BACKLOG.md header. Nothing here turns on what KIND of thing an item is:
no category, no doc type and no size makes an item belong in the backlog or
exempt from it.

**Process vs. artifact.** The process here is global and identical everywhere.
The artifact is per-project: each project keeps its own `BACKLOG.md` in its own
repo. One shared process, one backlog file per project; they never merge across
projects.

**Two states.** The distinction is the whole system:

- **The running block** — a live tally *in chat*. Temporary, uncommitted, holds
  items as they are raised during a session.
- **BACKLOG.md** — the source of truth *in the repo*.

**The block has two exits.** Items are raised in chat and held in the running
block. The default exit is DONE: an item raised and finished in the same
session, never deferred, leaves the block without ever becoming a `BL-###` row
— git history, the PR and the project's ratchet record carry the evidence, and
a row would only duplicate them. The other exit is DEFERRED: I say the item
waits, and it is flushed to BACKLOG.md. Only deferred items are ever flushed.
The test is deferral alone — never the item's category, and never whether it is
a bug, a governance fix, a feature or a decision.

**A DECISION NOT TO ACT GOES IN THE GOVERNING PROSE, NOT HERE.** The DONE exit
above assumes a finished item left a commit to find; a decision to leave code
alone leaves none — no commit, no diff, no PR — so its reasoning has no artifact
at all and vanishes with the chat. It is still not deferred, so a row would
announce work that does not exist in the one file people read looking for work.
Record it in the §-level documentation that governs the thing decided about,
where the person who would otherwise "fix" it is already reading. Symptom: an
asymmetry nobody can explain, tidied away three months later on the evidence
available.

**This governs entry to the backlog only.** Once an item IS a row, the Status
rules below govern it for the rest of its life: work done on an existing row
moves it to `review` and never lifts it back out of the file. The DONE exit
decides what never becomes a row; it says nothing about a row that already
exists.

**The running block.** The trigger is my saying "log to backlog." The block
reprints whenever it changes — never the new row alone — so the latest printing
is always the complete, authoritative list. Reprint a row's FULL text only when
that row's wording changed; otherwise give it as ID, status and a one-line
summary. Every pending row is printed in full at the flush, which is where the
wording has to be exact. Temp IDs are `P01`, `P02`, … scoped to the current
unflushed batch. An item that leaves by being DONE drops out of the table at the
next reprint and is named in a one-line note beneath it with its evidence (SHA
or PR), so nothing vanishes silently; those notes are chat-only and die with the
session, since the durable record is git. `P##` are never reassigned within a
session — when an item leaves, the others keep their IDs and the next item takes
the next number, because I will already have referred to them by name. They
recycle from P01 only once the block is empty, which a flush does not
necessarily leave it.

**Flushing.** I request the flush; nothing flushes automatically. What flushes
is the DEFERRED items only — where the block also holds items awaiting action,
the flush names which rows are going and leaves the rest in place. It is a
word-for-word copy verified by count — N deferred rows named = N new rows out —
which guards against dropped or duplicated rows. P## become permanent `BL-###`,
assigned in cumulative sequence from the last BL number in the file and never
reused. Category and status are assigned at flush. BACKLOG.md is a governance
doc, so the flush is committed and pushed per Part B. If the project publishes a
rendered backlog view, verify the flush there rather than in the raw file: push,
wait for the deploy to land, then confirm the new rows render as
correctly-columned rows. This is what catches an unescaped pipe, and a bare
`<angle-bracketed>` token, which renders as a tag and vanishes — both silent in
the source and visible only once rendered. Verify against the deployed page, not
a local copy, and not before the deploy confirms.

**Claude does not log as a way of deferring.** Where an item could reasonably
be done now, Claude says so and offers to do it rather than proposing a row.
Deferral is my call — never Claude's default response to noticing something.

**Status rules.** Code never self-closes: done items move to `review`, not
`close`. Close is mine alone and needs evidence in **Closed-by** — the `PR##`
for code, or my stated reason otherwise. A `discard` row carries its reason
there too: a discard without a recorded reason is a vanished row. Closed-by
stays empty on every other status.

**Schema.** `| ID | Status | Category | Item | Raised | Closed-by |` — the
running block uses the same columns, with a `P##` in the ID slot.
