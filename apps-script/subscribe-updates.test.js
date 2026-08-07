/**
 * subscribe-updates.test.js — test harness for subscribe-updates.gs.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   node apps-script/subscribe-updates.test.js
 *
 * No install, no dependencies — `fs` and `vm` only, like its sibling. Exits 0/1.
 *
 * LOADS BOTH .gs FILES INTO ONE CONTEXT, endpoint first. That is not a
 * convenience: the two files share global scope in the real Apps Script project,
 * and subscribe-updates.gs depends on the endpoint's globals (mailFooter_,
 * unsubscribeUrl_, getSheet_, the COL_* map). Loading them together is what the
 * deployment actually does, so it is what the test does.
 *
 * Bulk send is the one part of this system that cannot be safely learned in
 * production: a mistake reaches the whole list at once and cannot be recalled.
 * Everything below exists so the resume, the double-send guards and the budget
 * split are exercised before a single real update goes out.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ENDPOINT = path.join(__dirname, 'subscribe-endpoint.gs');
const UPDATES = path.join(__dirname, 'subscribe-updates.gs');

/* ── Stubs ───────────────────────────────────────────────────────────────── */

let rows = [], ops = [], props = {};
let uuidCounter = 0, lockHeld = false;
let sentMail = [], alertMail = [];
let quotaRemaining = 1500;
let drafts = [];
let uiCalls = [], uiAlertAnswer = 'OK', uiPromptAnswer = '';
let mailThrows = false, failFor = null;
let clock = null;                 // when set, Date.now() advances by clockStep per send
let clockStep = 0;
const log = [];

const HEADER_LEN = 10;

function makeSheet(store) {
  return {
    getLastRow: () => store.length,
    appendRow: r => { const row = r.slice(); while (row.length < HEADER_LEN) row.push(''); store.push(row); },
    setFrozenRows: () => {},
    getRange: (row, col, numRows, numCols) => ({
      getValue: () => (store[row - 1] || [])[col - 1],
      getValues: () => {
        const out = [];
        for (let i = 0; i < numRows; i++) {
          const r = store[row - 1 + i] || [];
          const slice = r.slice(col - 1, col - 1 + numCols);
          while (slice.length < numCols) slice.push('');
          out.push(slice);
        }
        return out;
      },
      setValue: v => { while (store[row - 1].length < col) store[row - 1].push(''); store[row - 1][col - 1] = v; }
    })
  };
}

function formatDate(d, tz, fmt) {
  const p = n => String(n).padStart(2, '0');
  if (fmt === 'yyyy-MM-dd') return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  throw new Error('harness formatDate: unsupported format ' + fmt);
}

/** A Date whose now() the test can advance, so the 4.5-minute cutoff is
 *  reachable without actually waiting 4.5 minutes. */
class TestDate extends Date {
  constructor(...args) {
    if (args.length === 0 && clock !== null) { super(clock); return; }
    super(...args);
  }
}

const sandbox = {
  console: { log: m => log.push('LOG ' + m), warn: m => log.push('WARN ' + m), error: m => log.push('ERR ' + m) },
  Logger: { log: (...a) => log.push('Logger ' + a.join(' ')) },
  Utilities: { getUuid: () => `0000000${++uuidCounter}`.slice(-8) + '-aaaa-4bbb-8ccc-dddddddddddd', formatDate },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: n => (n === 'Subscribe' ? makeSheet(rows) : n === 'Ops' ? makeSheet(ops) : null),
      insertSheet: n => (n === 'Ops' ? makeSheet(ops) : makeSheet(rows))
    }),
    flush: () => {},
    getUi: () => ({
      ButtonSet: { OK: 'OK', OK_CANCEL: 'OK_CANCEL' },
      Button: { OK: 'OK', CANCEL: 'CANCEL' },
      createMenu: () => { const m = { addItem: () => m, addSeparator: () => m, addToUi: () => {} }; return m; },
      alert: (title, body) => { uiCalls.push({ kind: 'alert', title, body }); return uiAlertAnswer; },
      prompt: (title, body) => {
        uiCalls.push({ kind: 'prompt', title, body });
        return { getSelectedButton: () => uiAlertAnswer, getResponseText: () => uiPromptAnswer };
      }
    })
  },
  ContentService: { MimeType: { TEXT: 'TEXT', JSON: 'JSON' }, createTextOutput: t => ({ setMimeType: () => ({ getContent: () => t }) }) },
  HtmlService: { createHtmlOutput: h => ({ getContent: () => h }) },
  LockService: { getScriptLock: () => ({ waitLock: () => { if (lockHeld) throw new Error('busy'); lockHeld = true; }, releaseLock: () => { lockHeld = false; } }) },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = v; },
      deleteProperty: k => { delete props[k]; }
    })
  },
  MailApp: { getRemainingDailyQuota: () => quotaRemaining, sendEmail: (to, subject, body) => alertMail.push({ to, subject, body }) },
  GmailApp: {
    getAliases: () => ['principals@threeflows.com'],
    getDrafts: () => drafts,
    sendEmail: (to, subject, body, options) => {
      if (clock !== null) clock += clockStep;
      if (mailThrows || (failFor && to === failFor)) throw new Error('simulated Gmail failure');
      sentMail.push({ to, subject, body, options });
    }
  },
  ScriptApp: { getService: () => ({ getUrl: () => null }) },
  JSON, String, Object, Array, Date: TestDate, Error, RegExp, Math, encodeURIComponent
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(ENDPOINT, 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(UPDATES, 'utf8'), sandbox);

/* ── Plumbing ────────────────────────────────────────────────────────────── */

const H = ['timestamp', 'email', 'status', 'token', 'confirmed_at', 'unsubscribed_at',
           'source_page', 'confirm_sent_at', 'manage_sent_at', 'last_update_id'];
const C = { EMAIL: 1, STATUS: 2, TOKEN: 3, JOB: 9 };

function makeDraft(opts) {
  opts = opts || {};
  return {
    getId: () => opts.id || 'draft-1',
    getMessage: () => ({
      getTo: () => (opts.to === undefined ? 'updates@threeflows.com' : opts.to),
      getSubject: () => opts.subject || 'Three ways to cut import costs',
      getPlainBody: () => opts.plain || 'Here is the update.',
      getBody: () => opts.html || '<p>Here is the update.</p>',
      getDate: () => new Date(opts.updated || 1700000000000)
    })
  };
}

function reset(opts) {
  opts = opts || {};
  rows = [H.slice()];
  ops = [['metric', 'value']];
  props = {};
  uuidCounter = 0; lockHeld = false;
  sentMail = []; alertMail = []; uiCalls = [];
  quotaRemaining = 1500;
  uiAlertAnswer = 'OK'; uiPromptAnswer = '';
  mailThrows = false; failFor = null;
  clock = null; clockStep = 0;
  log.length = 0;
  drafts = ('drafts' in opts) ? opts.drafts : [makeDraft()];
  sandbox.EXEC_URL = 'https://script.google.com/macros/s/TESTID/exec';
}

/** Put N confirmed subscribers on the sheet. */
function seedActive(n) {
  for (let i = 1; i <= n; i++) {
    rows.push([new Date(), `s${i}@example.com`, 'active', `tok-${i}`, new Date(), '', 'subscribe.html', new Date(), '', '']);
  }
}
const jobRows = () => rows.slice(1).map(r => r[C.JOB]);
const alertBodies = () => uiCalls.map(c => c.title + ' :: ' + c.body).join(' || ');

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? '\n        ' + detail : ''}`); }
}
function section(t) { console.log(`\n=== ${t} ===`); }

/* ── Cases ───────────────────────────────────────────────────────────────── */

section('1. The draft must be unambiguous');
reset({ drafts: [] });
check('no draft → throws, naming the sentinel',
      (() => { try { sandbox.findUpdateDraft_(); return false; } catch (e) { return /updates@threeflows\.com/.test(String(e)); } })());
reset({ drafts: [makeDraft({ id: 'a' }), makeDraft({ id: 'b' })] });
check('two drafts → REFUSES rather than guessing',
      (() => { try { sandbox.findUpdateDraft_(); return false; } catch (e) { return /2 drafts/.test(String(e)); } })());
reset({ drafts: [makeDraft({ to: 'someone-else@example.com' }), makeDraft({ id: 'right' })] });
check('picks the one addressed to the sentinel, ignores the rest',
      sandbox.findUpdateDraft_().id === 'right');

section('2. The composed message: both renderings, footer appended to each');
reset();
seedActive(1);
const d = sandbox.findUpdateDraft_();
sandbox.sendUpdateTo_('s1@example.com', 'tok-1', d);
const m = sentMail[0];
check('one message sent', sentMail.length === 1);
check('subject is the draft subject', m.subject === 'Three ways to cut import costs');
check('plain body = draft + text footer', m.body.indexOf('Here is the update.') === 0 &&
      /Unsubscribe: https:\/\/script\.google\.com\/.*action=unsubscribe/.test(m.body));
check('html body = draft html + html footer', /^<p>Here is the update\.<\/p>/.test(m.options.htmlBody) &&
      /<a href="[^"]*action=unsubscribe[^"]*">Unsubscribe<\/a>/.test(m.options.htmlBody));
check('the two footers carry the SAME token',
      m.body.indexOf('tok-1') !== -1 && m.options.htmlBody.indexOf('tok-1') !== -1);
check('postal address in both', m.body.indexOf('7211 Austin St.') !== -1 &&
      m.options.htmlBody.indexOf('7211 Austin St.') !== -1);
check('sent from the verified alias', m.options.from === 'principals@threeflows.com');
/* The draft carries no placeholder — mailFooter_ supplies the link. */
check('no {{UNSUBSCRIBE_URL}} convention needed in the draft',
      m.body.indexOf('{{') === -1 && m.options.htmlBody.indexOf('{{') === -1);

section('3. Only ACTIVE rows are recipients');
reset();
seedActive(3);
rows[2][C.STATUS] = 'pending';
rows[3][C.STATUS] = 'unsubscribed';
check('pending and unsubscribed are excluded',
      sandbox.pendingRecipients_(sandbox.getSheet_(), 'job-x').map(p => p.email).join(',') === 's1@example.com');

section('4. RESUME — the recipient set is derived, never remembered');
reset();
seedActive(5);
const job = sandbox.startJob_(sandbox.findUpdateDraft_());
rows[1][C.JOB] = job.jobId;
rows[2][C.JOB] = job.jobId;
check('already-stamped rows drop out',
      sandbox.pendingRecipients_(sandbox.getSheet_(), job.jobId).length === 3);
check('a DIFFERENT job sees everyone again',
      sandbox.pendingRecipients_(sandbox.getSheet_(), 'job-other').length === 5);

section('4b. The job id is MINTED once, not derived from the draft');
/* If the id were a function of the draft, an edit would silently produce a
   different one — and every already-sent row would look unsent to it. That is a
   duplicate to the entire list from a one-character typo fix. Minting guarantees
   two jobs never collide, and startJob_ storing it guarantees a resume reuses
   the same one rather than recomputing. */
reset();
seedActive(1);
const dA = sandbox.findUpdateDraft_();
const jobA = sandbox.startJob_(dA);
const jobB = sandbox.startJob_(dA);   // same draft, unchanged
check('two jobs from the SAME draft get different ids', jobA.jobId !== jobB.jobId,
      jobA.jobId + ' vs ' + jobB.jobId);
check('the id is stored, so a resume reuses it',
      JSON.parse(props.updateActiveJob).jobId === jobB.jobId);

section('5. A full run sends once each, stamps each, and finishes the job');
reset();
seedActive(4);
const d5 = sandbox.findUpdateDraft_();
const job5 = sandbox.startJob_(d5);
let res = sandbox.runUpdateJob_(d5, job5);
check('all four sent', res.sent === 4 && sentMail.length === 4, JSON.stringify(res));
check('none failed', res.failed === 0);
check('nothing remaining', res.remaining === 0);
check('every row stamped with the job id', jobRows().every(v => v === job5.jobId), jobRows().join(','));
check('job cleared on completion', sandbox.activeJob_() === null);
check('counter reflects four update sends', sandbox.updateCounterRead_() === 4);
check('CONFIRMATION counter untouched — separate budgets', sandbox.counterRead_() === 0);

section('6. Re-running a finished job sends NOTHING');
res = sandbox.runUpdateJob_(d5, job5);
check('no further sends', res.sent === 0 && sentMail.length === 4, 'sent: ' + sentMail.length);

section('7. A failed recipient is skipped, not fatal, and retried next run');
reset();
seedActive(3);
failFor = 's2@example.com';
const d7 = sandbox.findUpdateDraft_();
const job7 = sandbox.startJob_(d7);
res = sandbox.runUpdateJob_(d7, job7);
check('the other two went', res.sent === 2, JSON.stringify(res));
check('the failure was counted', res.failed === 1);
check('the failed row is NOT stamped', rows[2][C.JOB] === '');
check('it is still pending', res.remaining === 1);
check('the failure is logged with its row', log.some(l => /Update send failed for row 3/.test(l)), log.join(' | '));
check('job stays open', sandbox.activeJob_() !== null);
failFor = null;
res = sandbox.runUpdateJob_(d7, job7);
check('next run picks it up', res.sent === 1 && res.remaining === 0);
check('and the earlier two were NOT re-sent', sentMail.length === 3, 'sent: ' + sentMail.length);

section('8. The stamp goes AFTER the send, never before');
/* A stamp written first turns a send failure into a recipient who never got the
   update and can no longer be identified. Same rule as confirm_sent_at, and the
   same mutation caught it there. */
reset();
seedActive(1);
mailThrows = true;
const d8 = sandbox.findUpdateDraft_();
const job8 = sandbox.startJob_(d8);
res = sandbox.runUpdateJob_(d8, job8);
check('nothing sent', sentMail.length === 0);
check('row NOT stamped, so it stays identifiable', rows[1][C.JOB] === '');
check('counter not incremented', sandbox.updateCounterRead_() === 0);
check('still counted as remaining', res.remaining === 1);

section('9. The 4.5-minute cutoff stops cleanly and reports the remainder');
reset();
seedActive(10);
clock = 1000000;
clockStep = 60 * 1000;            // one minute per send
const d9 = sandbox.findUpdateDraft_();
const job9 = sandbox.startJob_(d9);
res = sandbox.runUpdateJob_(d9, job9);
check('stopped before finishing', res.sent > 0 && res.sent < 10, JSON.stringify(res));
check('the rest are reported as remaining', res.remaining === 10 - res.sent);
check('it says WHY it stopped', /minute mark/.test(res.reason), res.reason);
check('job stays open for the resume', sandbox.activeJob_() !== null);
check('only the sent rows are stamped',
      jobRows().filter(v => v === job9.jobId).length === res.sent);
clock = null; clockStep = 0;
res = sandbox.runUpdateJob_(d9, job9);
check('resume finishes the rest', res.remaining === 0);
check('and nobody got two copies', sentMail.length === 10, 'sent: ' + sentMail.length);

section('10. BUDGET — updates stop at the confirmation reserve');
reset();
seedActive(3);
quotaRemaining = 200;             // below CONFIRM_RESERVE of 250
const d10 = sandbox.findUpdateDraft_();
const job10 = sandbox.startJob_(d10);
res = sandbox.runUpdateJob_(d10, job10);
check('nothing sent', res.sent === 0, JSON.stringify(res));
check('the reason names the reserve', /reserved for confirmations/.test(res.reason), res.reason);
check('everyone still pending — the send resumes tomorrow', res.remaining === 3);
check('NO cap alert email — a paused update is routine, not an incident',
      alertMail.length === 0, 'alerts: ' + alertMail.length);
quotaRemaining = 1500;
res = sandbox.runUpdateJob_(d10, job10);
check('it resumes once quota recovers', res.sent === 3 && res.remaining === 0);

section('11. BUDGET — the two counters do not consume each other');
reset();
seedActive(2);
props.confirmSendCounter = JSON.stringify({ date: formatDate(new Date(), 'x', 'yyyy-MM-dd'), count: 199 });
const d11 = sandbox.findUpdateDraft_();
const job11 = sandbox.startJob_(d11);
res = sandbox.runUpdateJob_(d11, job11);
check('a nearly-exhausted CONFIRMATION cap does not block updates', res.sent === 2, JSON.stringify(res));
check('and updates did not advance the confirmation counter', sandbox.counterRead_() === 199);

section('12. No usable link base → refuse; the footer needs a real URL');
reset();
seedActive(1);
sandbox.EXEC_URL = '__EXEC_URL__';
check('blocked with the cause named', /web app URL unknown/.test(sandbox.updateSendBlocked_()),
      sandbox.updateSendBlocked_());

section('13. TEST GUARD — an edited draft cannot be bulk-sent');
reset();
seedActive(2);
uiPromptAnswer = 's1@example.com';
sandbox.menuSendTest();
check('test sent to the named active subscriber', sentMail.length === 1 && sentMail[0].to === 's1@example.com');
check('test state recorded', sandbox.testState_() !== null);
/* Edit the draft: same id, later timestamp. This is the sequence that ships
   mistakes — test, spot a typo, fix it, send. */
drafts = [makeDraft({ updated: 1700000999999 })];
uiCalls = [];
sandbox.menuSendUpdate();
check('bulk REFUSES after an edit', sentMail.length === 1, 'sent: ' + sentMail.length);
check('and says a test is required', /Test send required/.test(alertBodies()), alertBodies());
check('no job was started', sandbox.activeJob_() === null);

section('14. TEST GUARD — a tested, unedited draft proceeds');
uiPromptAnswer = 's1@example.com';
sandbox.menuSendTest();
uiCalls = [];
sandbox.menuSendUpdate();
check('the bulk send ran', sentMail.length > 2, 'sent: ' + sentMail.length);
check('the confirm dialog stated the recipient count',
      /Send to 2 subscribers\?/.test(alertBodies()), alertBodies());
check('and the subject', /Three ways to cut import costs/.test(alertBodies()));

section('15. A cancelled dialog sends nothing');
reset();
seedActive(3);
uiPromptAnswer = 's1@example.com';
sandbox.menuSendTest();
const beforeCancel = sentMail.length;
uiAlertAnswer = 'CANCEL';
sandbox.menuSendUpdate();
check('nothing further sent', sentMail.length === beforeCancel, 'sent: ' + sentMail.length);

section('16. A draft edited MID-JOB halts the resume');
reset();
seedActive(6);
uiPromptAnswer = 's1@example.com';
uiAlertAnswer = 'OK';
sandbox.menuSendTest();
const d16 = sandbox.findUpdateDraft_();
const job16 = sandbox.startJob_(d16);
rows[1][C.JOB] = job16.jobId;      // pretend one was sent
uiCalls = [];
drafts = [makeDraft({ updated: 1700000888888 })];
sandbox.menuSendUpdate();
check('refuses to continue with different content',
      /Draft changed mid-send/.test(alertBodies()), alertBodies());
check('the half-finished job is left intact', sandbox.activeJob_() !== null);

section('17. Abandoning warns that the next send re-sends to everyone');
uiCalls = [];
uiAlertAnswer = 'OK';
sandbox.menuAbandonJob();
check('the warning is explicit about duplicates',
      /would receive it AGAIN/.test(alertBodies()), alertBodies());
check('job cleared', sandbox.activeJob_() === null);
check('but stamps are NOT unwound', rows[1][C.JOB] === job16.jobId);

section('18. Someone who unsubscribes mid-job stops receiving it');
reset();
seedActive(3);
const d18 = sandbox.findUpdateDraft_();
const job18 = sandbox.startJob_(d18);
rows[1][C.JOB] = job18.jobId;
rows[2][C.STATUS] = 'unsubscribed';
res = sandbox.runUpdateJob_(d18, job18);
check('only the still-active, unsent row is mailed',
      res.sent === 1 && sentMail[0].to === 's3@example.com', JSON.stringify(res));

console.log(`\n──────── ${pass} passed, ${fail} failed ────────\n`);
process.exit(fail ? 1 : 0);
