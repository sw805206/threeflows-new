/**
 * subscribe-updates.gs — sends an update to the confirmed subscriber list.
 *
 * ── WHAT THIS IS ──────────────────────────────────────────────────────────
 * The SECOND file in the same bound Apps Script project as
 * subscribe-endpoint.gs. Files in one project share global scope, so this calls
 * mailFooter_, unsubscribeUrl_, getSheet_, setOpsMetric_ and the COL_* constants
 * directly — there is no second copy of the footer, the column map or the site
 * URLs to drift.
 *
 * It is kept SEPARATE rather than appended for blast radius. The endpoint is
 * web-facing and load-bearing for every subscribe and confirm; this is
 * menu-driven and edited every time something is published. A syntax error while
 * changing send logic must not be able to take the live endpoint down, and a
 * change here should not require re-pasting 1,700 lines of that.
 *
 * BOTH FILES MUST BE PASTED. This one depends on the endpoint's globals and will
 * throw ReferenceError on its own.
 *
 * ── HOW IT IS USED ────────────────────────────────────────────────────────
 * 1. Compose the update as a Gmail DRAFT addressed to DRAFT_TO. The draft is
 *    just the update — no unsubscribe link, no address, no placeholder. The
 *    footer is appended automatically, identically, to every copy.
 * 2. Open the Sheet → "Three Flows" menu → "Send test to me…". This sends the
 *    real thing through the real code path to one address.
 * 3. Read the test. If anything changes, the draft is edited and the test must
 *    be run again — the bulk send REFUSES a draft modified since its last test.
 * 4. "Send update to active subscribers…" → confirm the dialog, which states the
 *    subject and the exact recipient count before anything is sent.
 * 5. If it stops before finishing, run the same item again. It resumes.
 *
 * ── WHAT IT DOES NOT DO ───────────────────────────────────────────────────
 * NO SELF-SCHEDULING TRIGGER, by decision. A long job here is chunked and
 * resumed by hand, because an orphaned time-based trigger is its own failure
 * mode and the current list is far too small to hit the execution limit. The
 * resumable recipient set is the part that is hard to retrofit; automating the
 * resume on top of it is not, and can be added without touching anything else.
 *
 * NO List-Unsubscribe HEADER. GmailApp exposes no custom headers, so the native
 * "unsubscribe" button most clients offer cannot be populated from here — which
 * means someone who wants out is more likely to press "report spam" instead.
 * That is the single biggest deliverability lever for bulk mail and it needs the
 * Gmail API advanced service. Logged to the backlog, not built.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The draft to send is the one addressed to THIS, and nothing else about it
 * matters — not its subject, not its position in the drafts list.
 *
 * A sentinel address rather than a subject prefix, for one reason worth the
 * extra alias: if the draft is ever sent BY HAND from Gmail, it goes to an
 * address we control instead of to whoever happened to be in the To: field.
 * A prefix convention gives no such protection.
 *
 * findUpdateDraft_ hard-fails on zero matches AND on more than one. Guessing
 * which of two drafts was meant is exactly the wrong instinct for an
 * irreversible bulk send.
 */
var DRAFT_TO = 'updates@threeflows.com';

/**
 * How long a single run may spend sending before stopping cleanly.
 *
 * Apps Script kills an execution at six minutes with no chance to record what it
 * had done. Stopping voluntarily at 4.5 leaves room to stamp the last recipient,
 * flush, write Ops and report — so an interrupted run ends in a known state
 * rather than an unknown one.
 */
var MAX_RUN_MS = 4.5 * 60 * 1000;

/**
 * Platform quota that an update send will NOT consume, reserved for
 * confirmations.
 *
 * The two kinds of mail have opposite urgency. A confirmation is time-critical —
 * someone is sitting in front of "check your inbox" — while an update can resume
 * tomorrow with nobody noticing. So updates stop while there is still a day's
 * worth of confirmation headroom left, rather than draining the account and
 * leaving new subscribers stranded.
 *
 * This is the SHARED-resource floor. The two also have SEPARATE counters
 * (PROP_COUNTER for confirmations, PROP_UPDATE_COUNTER here), so a confirmation
 * spike does not eat an update's budget either. Neither can starve the other.
 */
var CONFIRM_RESERVE = 250;

var PROP_UPDATE_COUNTER = 'updateSendCounter';
var PROP_ACTIVE_JOB     = 'updateActiveJob';
var PROP_TEST_STATE     = 'updateTestState';

/* ═══════════════════════════════════════════════════════════════════════════
   MENU
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Installs the menu when the Sheet is opened. Apps Script calls this by name.
 *
 * NOTE if a second onOpen is ever added anywhere in this project: the later
 * definition silently wins and the earlier menu disappears. There must be
 * exactly one.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Three Flows')
    .addItem('Send test to me…', 'menuSendTest')
    .addItem('Send update to active subscribers…', 'menuSendUpdate')
    .addSeparator()
    .addItem('Show send status', 'menuShowStatus')
    .addItem('Abandon current send job', 'menuAbandonJob')
    .addToUi();
}

/**
 * Send one copy of the composed update, to one address, through the SAME code
 * path the bulk send uses.
 *
 * Identical path is the whole point. A test that assembled the mail differently
 * would prove the test, not the mail. This renders the same footer, substitutes
 * the same token and calls the same sender.
 *
 * The recipient must be an ACTIVE subscriber, because the footer needs their
 * real token — which makes the test cover the unsubscribe link too, not just the
 * body. Clicking that link genuinely unsubscribes; re-subscribing afterwards is
 * a verified two-second round trip.
 */
function menuSendTest() {
  var ui = SpreadsheetApp.getUi();
  try {
    var draft = findUpdateDraft_();
    var resp = ui.prompt('Send test',
      'Subject: ' + draft.subject + '\n\n' +
      'Send one copy to which address? It must be an ACTIVE subscriber, so the ' +
      'unsubscribe link in the footer is real.',
      ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return;

    var email = String(resp.getResponseText() || '').trim();
    var found = findRow_(getSheet_(), normEmail_(email));
    if (found.row === 0 || found.status !== STATUS_ACTIVE) {
      ui.alert('Not an active subscriber',
        email + ' is not an active row, so there is no token to build the ' +
        'unsubscribe link from. Subscribe and confirm it first.', ui.ButtonSet.OK);
      return;
    }

    var blocked = updateSendBlocked_();
    if (blocked) { ui.alert('Cannot send', blocked, ui.ButtonSet.OK); return; }

    sendUpdateTo_(found.email || email, found.token, draft);
    updateCounterIncrement_();
    recordTestSent_(draft);

    ui.alert('Test sent',
      'Sent to ' + email + '.\n\nRead it before sending to the list. If you EDIT ' +
      'the draft after this, the bulk send will refuse until you test again.',
      ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Test failed', String(err), ui.ButtonSet.OK);
  }
}

/**
 * Send the update to every active subscriber who has not already received it.
 *
 * Two gates before anything leaves: the draft must have been tested since its
 * last edit, and the human must confirm a dialog naming the subject and the
 * exact recipient count. A count that is not what you expected is the cheapest
 * possible catch for "that is the wrong draft".
 */
function menuSendUpdate() {
  var ui = SpreadsheetApp.getUi();
  try {
    var draft = findUpdateDraft_();
    var job = activeJob_();

    if (job) {
      /* RESUMING. The draft must not have changed mid-job, or the recipients
         still waiting would receive different content from the ones already
         sent — a difference nobody would ever see, because the two halves are in
         different inboxes. */
      if (job.draftUpdated !== draft.updatedAt) {
        ui.alert('Draft changed mid-send',
          'This send is part-finished, but the draft has been edited since it ' +
          'started.\n\nRecipients already sent got the original. Restore the ' +
          'draft to continue this job, or abandon it from the menu.',
          ui.ButtonSet.OK);
        return;
      }
    } else {
      var test = testState_();
      if (!test || test.draftId !== draft.id || test.draftUpdated !== draft.updatedAt) {
        ui.alert('Test send required',
          'This draft has not been tested since its last edit.\n\nRun "Send test ' +
          'to me…" first. The guard exists for the sequence where mistakes ' +
          'actually ship: test, spot a typo, fix it, send.',
          ui.ButtonSet.OK);
        return;
      }
      job = startJob_(draft);
    }

    var pending = pendingRecipients_(getSheet_(), job.jobId);
    if (pending.length === 0) {
      finishJob_();
      ui.alert('Nothing to send', 'Every active subscriber already has this update.',
               ui.ButtonSet.OK);
      return;
    }

    var confirm = ui.alert('Send to ' + pending.length + ' subscriber' +
      (pending.length === 1 ? '' : 's') + '?',
      'Subject: ' + draft.subject + '\n\n' +
      'This cannot be undone.', ui.ButtonSet.OK_CANCEL);
    if (confirm !== ui.Button.OK) return;

    var result = runUpdateJob_(draft, job);
    ui.alert('Send ' + (result.remaining === 0 ? 'complete' : 'paused'),
      result.sent + ' sent this run.\n' +
      result.failed + ' failed.\n' +
      result.remaining + ' remaining.\n\n' +
      (result.remaining === 0
        ? 'Job finished.'
        : (result.reason + '\n\nRun "Send update to active subscribers…" again to continue.')),
      ui.ButtonSet.OK);
  } catch (err) {
    ui.alert('Send failed', String(err), ui.ButtonSet.OK);
  }
}

/** Read-only: what is in flight, what the budget looks like, what was tested. */
function menuShowStatus() {
  var ui = SpreadsheetApp.getUi();
  var lines = [];
  try {
    var draft = findUpdateDraft_();
    lines.push('Draft: ' + draft.subject);
  } catch (err) {
    lines.push('Draft: ' + String(err));
  }
  var test = testState_();
  lines.push('Tested: ' + (test ? test.testedAt + ' (to ' + test.email + ')' : 'never'));

  var job = activeJob_();
  if (job) {
    var pending = pendingRecipients_(getSheet_(), job.jobId).length;
    lines.push('Active job: started ' + job.startedAt);
    lines.push('  remaining: ' + pending);
  } else {
    lines.push('Active job: none');
  }
  lines.push('');
  lines.push('Updates sent today: ' + updateCounterRead_());
  lines.push('Confirmations sent today: ' + counterRead_() + ' of ' + DAILY_SEND_CAP);
  lines.push('Platform quota remaining: ' + MailApp.getRemainingDailyQuota() +
             ' (updates stop below ' + CONFIRM_RESERVE + ')');
  var blocked = updateSendBlocked_();
  lines.push('Update sending: ' + (blocked ? 'BLOCKED — ' + blocked : 'allowed'));

  ui.alert('Send status', lines.join('\n'), ui.ButtonSet.OK);
}

/**
 * Clear the in-flight job WITHOUT unstamping anyone.
 *
 * The escape hatch for a job whose draft was edited and cannot be restored.
 * Rows already sent keep their stamp, so they are not at risk of a duplicate
 * from THIS job — but the next job gets a new id, and every active row will look
 * unsent to it. Anyone who already received the update would receive it again.
 * The dialog says so, because that is the whole cost of abandoning.
 */
function menuAbandonJob() {
  var ui = SpreadsheetApp.getUi();
  var job = activeJob_();
  if (!job) { ui.alert('No active job', 'Nothing in flight.', ui.ButtonSet.OK); return; }

  var pending = pendingRecipients_(getSheet_(), job.jobId).length;
  var confirm = ui.alert('Abandon this send?',
    pending + ' subscriber(s) have not received it.\n\n' +
    'Abandoning does NOT unsend anything. But the next send gets a new job id, ' +
    'so everyone who already received this update would receive it AGAIN.',
    ui.ButtonSet.OK_CANCEL);
  if (confirm !== ui.Button.OK) return;

  finishJob_();
  ui.alert('Abandoned', 'No job is in flight.', ui.ButtonSet.OK);
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE DRAFT
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Find the one draft addressed to DRAFT_TO. Throws on none or several.
 *
 * Returns both body renderings: Gmail gives HTML and plain text for the same
 * message, so the update goes out as multipart/alternative without anyone
 * authoring the copy twice. That is why the update can afford HTML while the
 * transactional mails stay plain — there, a second rendering would be a second
 * hand-maintained copy of the words.
 *
 * `updatedAt` is what the test guard compares. A draft edited after a test has a
 * different value, and the bulk send refuses.
 */
function findUpdateDraft_() {
  var drafts = GmailApp.getDrafts();
  var matches = [];
  for (var i = 0; i < drafts.length; i++) {
    var msg = drafts[i].getMessage();
    if (String(msg.getTo() || '').toLowerCase().indexOf(DRAFT_TO.toLowerCase()) !== -1) {
      matches.push({ draft: drafts[i], msg: msg });
    }
  }

  if (matches.length === 0) {
    throw new Error('No draft addressed to ' + DRAFT_TO + '. Compose the update as a ' +
                    'draft to that address.');
  }
  if (matches.length > 1) {
    throw new Error(matches.length + ' drafts are addressed to ' + DRAFT_TO + '. ' +
                    'Leave exactly one — guessing which was meant is not something ' +
                    'this should do for a send that cannot be undone.');
  }

  var m = matches[0];
  return {
    id: m.draft.getId(),
    subject: String(m.msg.getSubject() || '').trim(),
    plain: m.msg.getPlainBody(),
    html: m.msg.getBody(),
    updatedAt: m.msg.getDate().getTime()
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE FOOTER
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The HTML rendering of mailFooter_.
 *
 * Built from the SAME values the plain-text footer uses — unsubscribeUrl_ and
 * POSTAL_ADDRESS — rather than authored separately, so the two renderings cannot
 * disagree about the link or the address. Only the markup differs.
 */
function updateFooterHtml_(token) {
  var url = unsubscribeUrl_(token);
  return '<hr style="border:none;border-top:1px solid #ddd;margin:24px 0">' +
         '<p style="font-size:13px;color:#666"><a href="' + esc_(url) + '">Unsubscribe</a></p>' +
         '<p style="font-size:13px;color:#666">' +
         esc_(POSTAL_ADDRESS).split('\n').join('<br>') + '</p>';
}

/**
 * Send one copy. One message per recipient, NEVER a bulk BCC — each footer
 * carries that person's own unsubscribe token, so it could not be shared even if
 * we wanted to. It also means no subscriber is ever shown another's address.
 *
 * Throws on failure so the caller can leave the row unstamped and retry it on
 * the next run.
 */
function sendUpdateTo_(email, token, draft) {
  var options = fromOptions_();
  options.htmlBody = draft.html + updateFooterHtml_(token);
  GmailApp.sendEmail(email, draft.subject, draft.plain + mailFooter_(token), options);
}

/* ═══════════════════════════════════════════════════════════════════════════
   BUDGET — separate counter, shared floor
   ═══════════════════════════════════════════════════════════════════════════ */

/** Today's update count. Same implicit-rollover shape as the confirmation
 *  counter: a stored date that is not today reads as zero. */
function updateCounterRead_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(PROP_UPDATE_COUNTER);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.date === today_() && typeof parsed.count === 'number') {
        return parsed.count;
      }
    }
  } catch (err) {
    console.warn('Update counter unreadable, treating as 0: ' + err);
  }
  return 0;
}

function updateCounterIncrement_() {
  var next = updateCounterRead_() + 1;
  var day = today_();
  PropertiesService.getScriptProperties()
    .setProperty(PROP_UPDATE_COUNTER, JSON.stringify({ date: day, count: next }));
  setOpsMetric_('update_sends_today', next);
  setOpsMetric_('counter_date', day);
  return next;
}

/**
 * May an update be sent right now? Returns a reason, or '' to allow.
 *
 * Deliberately NOT sendBlockedReason_. That one gates transactional mail and
 * ends in a daily alert; a paused update is routine and expected, and reusing
 * the alert would train the owner to ignore it. The link base is still required
 * — the footer carries an unsubscribe URL, so an update with no usable base is
 * as broken as a confirmation with none.
 */
function updateSendBlocked_() {
  if (!linkBaseReady_()) {
    return 'web app URL unknown — set EXEC_URL, or deploy as a web app';
  }
  try {
    var remaining = MailApp.getRemainingDailyQuota();
    if (remaining < CONFIRM_RESERVE) {
      return 'platform quota down to ' + remaining + ', which is the ' +
             CONFIRM_RESERVE + ' reserved for confirmations';
    }
  } catch (quotaErr) {
    console.warn('Quota check failed, proceeding: ' + quotaErr);
  }
  return '';
}

/* ═══════════════════════════════════════════════════════════════════════════
   THE JOB
   ═══════════════════════════════════════════════════════════════════════════ */

function activeJob_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(PROP_ACTIVE_JOB);
    return raw ? JSON.parse(raw) : null;
  } catch (err) { return null; }
}

function testState_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(PROP_TEST_STATE);
    return raw ? JSON.parse(raw) : null;
  } catch (err) { return null; }
}

function recordTestSent_(draft) {
  PropertiesService.getScriptProperties().setProperty(PROP_TEST_STATE, JSON.stringify({
    draftId: draft.id,
    draftUpdated: draft.updatedAt,
    subject: draft.subject,
    testedAt: today_()
  }));
}

/**
 * Begin a job and pin its identity.
 *
 * The job id is minted ONCE and stored, never re-derived. Deriving it from the
 * draft on every run would mean an edit mid-send silently produced a second job,
 * and every already-sent recipient would look unsent to it — a duplicate to the
 * entire list, from a one-character typo fix.
 */
function startJob_(draft) {
  var job = {
    jobId: 'job-' + Utilities.getUuid(),
    draftId: draft.id,
    draftUpdated: draft.updatedAt,
    subject: draft.subject,
    startedAt: today_()
  };
  PropertiesService.getScriptProperties().setProperty(PROP_ACTIVE_JOB, JSON.stringify(job));
  setOpsMetric_('update_job_started', new Date());
  setOpsMetric_('update_job_subject', draft.subject);
  return job;
}

function finishJob_() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_ACTIVE_JOB);
  setOpsMetric_('update_job_finished', new Date());
}

/**
 * Who still needs this update: ACTIVE rows whose last_update_id is not this
 * job's.
 *
 * The recipient set is DERIVED, never remembered. There is no progress record to
 * fall out of sync with the sheet, resume is just running again, and a crash
 * costs nothing but the partial run. Status is checked here too, so someone who
 * unsubscribes midway through a long send stops being a recipient — which is the
 * behaviour the unsubscribe link promises.
 */
function pendingRecipients_(sheet, jobId) {
  var last = sheet.getLastRow();
  if (last < 2) return [];

  var values = sheet.getRange(2, 1, last - 1, HEADER.length).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var status = normEmail_(values[i][COL_STATUS - 1]);
    if (status !== STATUS_ACTIVE) continue;
    if (str_(values[i][COL_LAST_UPDATE_ID - 1]) === jobId) continue;
    var email = str_(values[i][COL_EMAIL - 1]);
    var token = str_(values[i][COL_TOKEN - 1]);
    if (!email || !token) continue;   // nothing sendable; leave it alone
    out.push({ row: i + 2, email: email, token: token });
  }
  return out;
}

/**
 * Send until done, out of time, or out of budget.
 *
 * STAMPS AFTER THE SEND, NEVER BEFORE. Same rule as confirm_sent_at, and for the
 * same reason: a stamp written first turns a failure into a recipient who never
 * received the update and can no longer be identified. The residual risk is the
 * opposite one — a send that succeeds and a stamp that fails would re-send on
 * resume — and it is accepted, because flush() closes the window to
 * milliseconds and a rare duplicate is a better failure than a silent omission.
 *
 * A single recipient's failure is logged and skipped, not fatal: they stay
 * unstamped and are simply picked up next run.
 */
function runUpdateJob_(draft, job) {
  var started = new Date().getTime();
  var sheet = getSheet_();
  var pending = pendingRecipients_(sheet, job.jobId);
  var sent = 0, failed = 0, reason = '';

  for (var i = 0; i < pending.length; i++) {
    if (new Date().getTime() - started > MAX_RUN_MS) {
      reason = 'Stopped at the ' + Math.round(MAX_RUN_MS / 60000) +
               '-minute mark so the run could finish cleanly.';
      break;
    }
    var blocked = updateSendBlocked_();
    if (blocked) { reason = 'Stopped: ' + blocked; break; }

    var person = pending[i];
    try {
      sendUpdateTo_(person.email, person.token, draft);
    } catch (mailErr) {
      failed++;
      console.error('Update send failed for row ' + person.row + ' (will retry next run): ' + mailErr);
      continue;
    }

    sheet.getRange(person.row, COL_LAST_UPDATE_ID).setValue(job.jobId);
    SpreadsheetApp.flush();
    updateCounterIncrement_();
    sent++;
  }

  var remaining = pendingRecipients_(sheet, job.jobId).length;
  if (remaining === 0) finishJob_();
  setOpsMetric_('update_last_run', new Date());
  console.log('update job ' + job.jobId + ': sent ' + sent + ', failed ' + failed +
              ', remaining ' + remaining);
  return { sent: sent, failed: failed, remaining: remaining, reason: reason };
}
