/**
 * subscribe-endpoint.test.js — test harness for subscribe-endpoint.gs.
 *
 * ── HOW TO RUN ────────────────────────────────────────────────────────────
 *   node apps-script/subscribe-endpoint.test.js
 *
 * NO INSTALL, NO DEPENDENCIES, NO package.json. It uses only `fs` and `vm`,
 * both Node built-ins, and resolves its target relative to its own directory so
 * it runs from any working directory. Exits 0 when every assertion passes, 1
 * otherwise, so it can be dropped into CI later without modification.
 *
 * ── WHY THIS EXISTS ───────────────────────────────────────────────────────
 * subscribe-endpoint.gs cannot be run here: Apps Script's globals exist only on
 * Google's runtime, and deploying to check a branch of a state machine is a slow
 * loop that writes real rows — and, since stage 2, SENDS REAL MAIL. So this
 * reads the .gs AS TEXT and executes it in a `vm` context against in-memory
 * stubs. The .gs is never modified, never imported, and carries no test hooks —
 * it is exercised exactly as deployed.
 *
 * The stubs are deliberately thin: they model only what the endpoint actually
 * calls. `rows` is a plain array standing in for the sheet, index 0 being the
 * frozen header. A passing run means "the logic is right", NOT "Apps Script will
 * behave identically" — real quota, real lock contention across concurrent
 * executions, Gmail alias resolution and Sheets' own value coercion are outside
 * what this can prove. The editor mocks in the .gs cover those.
 *
 * ── PUBLICLY SERVED ───────────────────────────────────────────────────────
 * The site deploys from main with .nojekyll, so every committed file is fetchable
 * — this one included, like apps-script/contact-endpoint.gs already is. It
 * deliberately contains no endpoint URL, no credentials, and no real addresses:
 * every address below is on example.com, reserved by RFC 2606 for exactly this.
 * Keep it that way.
 *
 * ── WHEN THE ENDPOINT CHANGES ─────────────────────────────────────────────
 * The column order and status vocabulary are duplicated here (H, and the literal
 * statuses in the cases below) so the test asserts against the SPEC rather than
 * re-deriving it from the code — a test that imports the constants it checks
 * cannot catch a constant being changed. If a column moves or a status is
 * renamed in the .gs, this file must be updated by hand, and the failure it
 * throws first is the point.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TARGET = path.join(__dirname, 'subscribe-endpoint.gs');

/* ── Stubs ───────────────────────────────────────────────────────────────── */

let rows = [];          // rows[0] is the header row; the sheet, in memory
let ops = [];           // the Ops tab
let uuidCounter = 0;
let lockHeld = false;
let props = {};         // PropertiesService backing store
let sentMail = [];      // GmailApp sends (confirmations)
let alertMail = [];     // MailApp sends (cap alerts)
let quotaRemaining = 1500;
let aliases = ['principals@threeflows.com'];
let mailThrows = false;   // force a send failure
let serviceUrl = null;    // ScriptApp.getService().getUrl(), null = never deployed
const log = [];

const HEADER_LEN = 9;

function makeSheet(store) {
  return {
    getLastRow: () => store.length,
    appendRow: r => {
      const row = r.slice();
      while (row.length < HEADER_LEN) row.push('');
      store.push(row);
    },
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
      setValue: v => {
        while (store[row - 1].length < col) store[row - 1].push('');
        store[row - 1][col - 1] = v;
      }
    })
  };
}

/** yyyy-MM-dd only — the single format the endpoint asks for. */
function formatDate(d, tz, fmt) {
  const p = n => String(n).padStart(2, '0');
  if (fmt === 'yyyy-MM-dd') return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  throw new Error('harness formatDate: unsupported format ' + fmt);
}

const sandbox = {
  console: {
    log: m => log.push('LOG ' + m),
    warn: m => log.push('WARN ' + m),
    error: m => log.push('ERR ' + m)
  },
  Logger: { log: (...a) => log.push('Logger ' + a.join(' ')) },
  Utilities: { getUuid: () => `0000000${++uuidCounter}`.slice(-8) + '-aaaa-4bbb-8ccc-dddddddddddd',
               formatDate },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: n => (n === 'Subscribe' ? makeSheet(rows) : n === 'Ops' ? makeSheet(ops) : null),
      insertSheet: n => (n === 'Ops' ? makeSheet(ops) : makeSheet(rows))
    }),
    flush: () => {}
  },
  ContentService: {
    MimeType: { TEXT: 'TEXT' },
    createTextOutput: t => ({ setMimeType: () => ({ getContent: () => t }) })
  },
  HtmlService: { createHtmlOutput: h => ({ getContent: () => h }) },
  LockService: {
    getScriptLock: () => ({
      waitLock: () => { if (lockHeld) throw new Error('lock busy'); lockHeld = true; },
      releaseLock: () => { lockHeld = false; }
    })
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: k => (k in props ? props[k] : null),
      setProperty: (k, v) => { props[k] = v; }
    })
  },
  MailApp: {
    getRemainingDailyQuota: () => quotaRemaining,
    sendEmail: (to, subject, body) => alertMail.push({ to, subject, body })
  },
  GmailApp: {
    getAliases: () => aliases,
    sendEmail: (to, subject, body, options) => {
      if (mailThrows) throw new Error('simulated Gmail failure');
      sentMail.push({ to, subject, body, options });
    }
  },
  /* Defaults to NULL — the undeployed state, which is what produced
     "null?action=confirm&..." in a real test mail. Tests that need a deployment
     set `serviceUrl`. */
  ScriptApp: { getService: () => ({ getUrl: () => serviceUrl }) },
  JSON, String, Object, Array, Date, Error, RegExp, encodeURIComponent
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(TARGET, 'utf8'), sandbox);

/** The human-authored confirmation copy, captured as loaded so the send tests
 *  exercise the real thing rather than a stand-in. */
const AUTHORED_BODY = sandbox.CONFIRM_BODY;
const AUTHORED_MANAGE_BODY = sandbox.MANAGE_BODY;
const AUTHORED_MANAGE_SUBJECT = sandbox.MANAGE_SUBJECT;

/* ── Harness plumbing ────────────────────────────────────────────────────── */

/** The sheet's frozen row 1, asserted against rather than imported. */
const H = ['timestamp', 'email', 'status', 'token', 'confirmed_at',
           'unsubscribed_at', 'source_page', 'confirm_sent_at', 'manage_sent_at'];

const C = { TS: 0, EMAIL: 1, STATUS: 2, TOKEN: 3, CONFIRMED: 4, UNSUB: 5, SRC: 6,
            SENT: 7, MSENT: 8 };

const PLACEHOLDER_BODY = '__CONFIRM_BODY__';

function reset(opts) {
  opts = opts || {};
  rows = [H.slice()];
  ops = [['metric', 'value']];
  uuidCounter = 0;
  props = {};
  sentMail = [];
  alertMail = [];
  quotaRemaining = 1500;
  aliases = ['principals@threeflows.com'];
  mailThrows = false;
  serviceUrl = null;
  log.length = 0;
  /* EXEC_URL pinned, which is the recommended production configuration: links
     must not depend on the execution context. Cases below override it. */
  sandbox.EXEC_URL = 'https://script.google.com/macros/s/TESTID/exec';
  sandbox.CONFIRM_BODY = ('body' in opts) ? opts.body : AUTHORED_BODY;
  /* The manage copy is a placeholder in the .gs (the human writes it), so the
     tests supply a stand-in — except where the fail-closed guard is the thing
     under test. */
  /* Both manage copies are authored now, so the tests exercise the real thing.
     Case 37b overrides the subject to prove the fail-closed guard still bites. */
  sandbox.MANAGE_SUBJECT = ('manageSubject' in opts) ? opts.manageSubject : AUTHORED_MANAGE_SUBJECT;
  sandbox.MANAGE_BODY = ('manageBody' in opts) ? opts.manageBody : AUTHORED_MANAGE_BODY;
}

const post = e => sandbox.doPost(e).getContent();
const get = e => sandbox.doGet(e).getContent();
const manage = (email, extra) => post({ parameter: Object.assign({ action: 'manage', email, website: '' }, extra || {}) });
const sub = (email, extra) => post({ parameter: Object.assign({ email, website: '', source_page: 'subscribe.html' }, extra || {}) });
const dataRows = () => rows.slice(1);
const row1 = () => rows[1];
const opsValue = name => { const r = ops.find(x => x[0] === name); return r ? r[1] : undefined; };
const show = () => dataRows().map(r =>
  `[${r[C.EMAIL]} | ${r[C.STATUS]} | tok=${String(r[C.TOKEN]).slice(0, 8)} | conf=${r[C.CONFIRMED] || '-'} | unsub=${r[C.UNSUB] || '-'} | sent=${r[C.SENT] ? 'Y' : '-'}]`
).join('\n    ') || '(none)';

/** Safe field read. A failing assertion must REPORT, not crash the run and hide
 *  every case after it — which is exactly what `at(alertMail,0,'subject')` did when a
 *  mutation stopped the alert from being sent. */
const at = (arr, i, k) => (arr && arr[i] ? arr[i][k] : '(nothing recorded)');

/** Safe parse. An assertion about a JSON response must REPORT when the response
 *  is not JSON, not throw and take every later case down with it — which is what
 *  a bare JSON.parse did when a mutation made confirm always return HTML. */
const asJson = t => { try { return JSON.parse(t); } catch (e) { return { ok: '(not JSON)' }; } };

/** Read the send counter without assuming it exists. A mutation that stops
 *  sending leaves the property unset, and a bare JSON.parse(undefined) throws —
 *  taking every later case down with it. Third time this class of brittleness
 *  has bitten; swept the file for the rest. */
const counterCount = () => { try { return JSON.parse(props.confirmSendCounter).count; } catch (e) { return '(counter unset)'; } };

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? '\n        ' + detail : ''}`); }
}
function section(t) { console.log(`\n=== ${t} ===`); }

/* ── Stage 1: the subscribe state machine ────────────────────────────────── */

section('1. New address, form-encoded');
reset();
let r = post({ parameter: { email: 'A@Example.com ', source_page: 'subscribe.html', website: '' } });
console.log('    ' + show());
check('returns OK', r === 'OK', 'got: ' + r);
check('one row appended', dataRows().length === 1);
check('status pending', row1()[C.STATUS] === 'pending');
check('token generated', /^[0-9a-f]{8}-/.test(row1()[C.TOKEN]));
check('timestamp is a Date', row1()[C.TS] instanceof Date);
check('email stored as typed, trimmed', row1()[C.EMAIL] === 'A@Example.com');
check('confirmed_at / unsubscribed_at empty', row1()[C.CONFIRMED] === '' && row1()[C.UNSUB] === '');
check('source_page stored', row1()[C.SRC] === 'subscribe.html');

section('2. status=active → do nothing');
reset();
sub('a@example.com');
row1()[C.STATUS] = 'active';
let snap = JSON.stringify(row1());
log.length = 0;
r = sub('a@example.com');
check('returns the same OK', r === 'OK');
check('row completely untouched', JSON.stringify(row1()) === snap);
/* "Wrote nothing" is NOT sufficient: if the active branch were removed, active
   would fall through to the unrecognised-status branch, which ALSO writes
   nothing. The log is the distinguishing evidence. */
check('handled deliberately, not as unknown → no warning',
      !log.some(l => l.startsWith('WARN')), log.join(' | '));

section('3. Unrecognised status → untouched + warned');
reset();
sub('x@example.com');
row1()[C.STATUS] = 'bounced';
snap = JSON.stringify(row1());
log.length = 0;
r = sub('x@example.com');
check('returns OK', r === 'OK');
check('row untouched', JSON.stringify(row1()) === snap);
check('warning logged', log.some(l => l.startsWith('WARN')), log.join(' | '));

section('4. JSON body, e.parameter empty');
reset();
r = post({ parameter: {}, postData: { type: 'application/json',
  contents: JSON.stringify({ email: 'json@example.com', source_page: 'subscribe.html', website: '' }) } });
check('returns OK', r === 'OK');
check('row appended from JSON body', dataRows().length === 1 && row1()[C.EMAIL] === 'json@example.com');

section('5. urlencoded raw contents must not break the JSON parse');
reset();
r = post({ parameter: { email: 'ue@example.com', website: '' },
           postData: { type: 'application/x-www-form-urlencoded', contents: 'email=ue%40example.com&website=' } });
check('row appended', dataRows().length === 1 && row1()[C.EMAIL] === 'ue@example.com', show());

section('6. Honeypot → OK, no write, no mail');
reset();
r = post({ parameter: { email: 'bot@example.com', website: 'http://spam.example' } });
check('returns OK', r === 'OK');
check('nothing written', dataRows().length === 0);
check('nothing sent', sentMail.length === 0);

section('7. Malformed / hostile input → OK, no write');
const bad = ['not-an-email', '', 'a@b', '@example.com', 'a b@example.com',
             '=HYPERLINK("http://x")@example.com', '+1@example.com', '-x@example.com',
             'a'.repeat(250) + '@example.com'];
bad.forEach(b => {
  reset();
  const res = post({ parameter: { email: b, website: '' } });
  check(`rejected: ${JSON.stringify(b.slice(0, 34))}`,
        res === 'OK' && dataRows().length === 0 && sentMail.length === 0, 'rows: ' + dataRows().length);
});

section('8. Valid addresses must NOT be rejected');
['a@b.co', 'first.last@sub.domain.co.uk', 'user+tag@example.com', "o'brien@example.com",
 'user_name@example-host.io', '123@456.com', 'UPPER@EXAMPLE.COM'].forEach(g => {
  reset();
  sub(g);
  check(`accepted: ${g}`, dataRows().length === 1, 'rows: ' + dataRows().length);
});

section('9. source_page whitelist');
reset();
sub('sp@example.com', { source_page: 'subscribe.html?manage=1' });
check('query-string page kept', row1()[C.SRC] === 'subscribe.html?manage=1', row1()[C.SRC]);
reset();
sub('sp2@example.com', { source_page: '=EVIL()' });
check('formula-ish source_page dropped to ""', row1()[C.SRC] === '', JSON.stringify(row1()[C.SRC]));

section('10. Missing / empty event object');
reset();
check('doPost({}) does not throw', (() => { try { return post({}) === 'OK'; } catch (x) { return false; } })());
check('nothing written', dataRows().length === 0);

/* ── Stage 2: sending, cooldown, cap ─────────────────────────────────────── */

section('11. Confirmation is sent, and confirm_sent_at stamped only after');
reset();
sub('send@example.com');
console.log('    ' + show());
check('exactly one mail sent', sentMail.length === 1, 'sent: ' + sentMail.length);
check('sent to the subscriber', at(sentMail,0,'to') === 'send@example.com');
check('settled subject', at(sentMail,0,'subject') === 'Confirm your subscription to Three Flows updates');
check('from the verified alias', (at(sentMail,0,'options')||{}).from === 'principals@threeflows.com');
check('from name set', (at(sentMail,0,'options')||{}).name === 'Three Flows Solutions');
check('{{CONFIRM_URL}} substituted', !/\{\{CONFIRM_URL\}\}/.test(at(sentMail,0,'body')));
/* DEPLOY B: the confirm link points at the SITE, not at /exec. A mail from
   principals@threeflows.com whose only link resolves to script.google.com is a
   phishing shape — mismatched sender and link domains are a spam-filter signal
   and a reader-trust signal, and this is the first mail anyone receives. */
check('confirm link points at threeflows.com',
      /https:\/\/threeflows\.com\/subscribe\.html\?confirm=/.test(at(sentMail,0,'body')),
      at(sentMail,0,'body'));
check('and NOT at script.google.com',
      at(sentMail,0,'body').indexOf('script.google.com') === -1);
/* The confirmation deliberately carries NO unsubscribe link: the recipient is
   not subscribed yet, and the copy's "ignore this email" IS the opt-out for a
   double opt-in. Offering unsubscribe would compete with that instruction. */
check('NO unsubscribe link — nothing to unsubscribe from yet',
      at(sentMail,0,'body').indexOf('action=unsubscribe') === -1);
check('the ignore-clause that makes that correct is present',
      /ignore this email/.test(at(sentMail,0,'body')));
check('opens with the authored first line',
      at(sentMail,0,'body').indexOf('Thanks for subscribing to Three Flows updates.') === 0);
check('carries the postal address from the copy itself',
      at(sentMail,0,'body').indexOf('7211 Austin St. PMB 168, Forest Hills, NY 11375') !== -1);
check('address appears exactly ONCE — no appended duplicate footer',
      at(sentMail,0,'body').split('7211 Austin St.').length - 1 === 1,
      'occurrences: ' + (at(sentMail,0,'body').split('7211 Austin St.').length - 1));
check('sent as plain text, no htmlBody',
      (at(sentMail,0,'options')||{}).htmlBody === undefined);
check('confirm_sent_at stamped', row1()[C.SENT] instanceof Date);
check('counter incremented', counterCount() === 1);
check('Ops mirrors the count', opsValue('confirm_sends_today') === 1, String(opsValue('confirm_sends_today')));

section('12. Unverified alias → still sends, but warns');
reset();
aliases = [];
sub('noalias@example.com');
check('mail still sent', sentMail.length === 1);
check('no from override', (at(sentMail,0,'options')||{}).from === undefined);
check('warned about the alias', log.some(l => /send-as alias/.test(l)), log.join(' | '));

section('13. FAIL CLOSED — body not configured');
reset({ body: PLACEHOLDER_BODY });
r = sub('closed@example.com');
check('returns the same OK', r === 'OK');
check('row STILL written', dataRows().length === 1 && row1()[C.STATUS] === 'pending');
check('nothing sent', sentMail.length === 0);
check('confirm_sent_at left empty — the backfill marker', row1()[C.SENT] === '');
check('counter not incremented', props.confirmSendCounter === undefined);
check('owner alerted', alertMail.length === 1 && /body not configured/.test(at(alertMail,0,'subject')));

section('14. Cooldown gates re-arm AND send as one unit');
reset();
sub('cool@example.com');
const tokAfterFirst = row1()[C.TOKEN];
const tsAfterFirst = row1()[C.TS];
const sentAfterFirst = row1()[C.SENT];
r = sub('cool@example.com');                     // immediate re-submit
console.log('    ' + show());
check('returns the same OK', r === 'OK');
check('no second mail', sentMail.length === 1, 'sent: ' + sentMail.length);
check('token NOT rotated — the emailed link stays valid', row1()[C.TOKEN] === tokAfterFirst);
check('timestamp NOT touched', row1()[C.TS] === tsAfterFirst);
check('confirm_sent_at NOT touched', row1()[C.SENT] === sentAfterFirst);
check('still one row', dataRows().length === 1);

section('15. Cooldown expired → re-arms and sends again');
row1()[C.SENT] = new Date(Date.now() - 20 * 60 * 1000);   // 20 min ago
r = sub('cool@example.com');
check('second mail sent', sentMail.length === 2, 'sent: ' + sentMail.length);
check('token rotated', row1()[C.TOKEN] !== tokAfterFirst);
check('confirm_sent_at refreshed', row1()[C.SENT].getTime() > Date.now() - 5000);

section('16. Cooldown does not apply to a brand-new address');
reset();
sub('n1@example.com');
sub('n2@example.com');
check('both mailed', sentMail.length === 2, 'sent: ' + sentMail.length);
check('two rows', dataRows().length === 2);

section('17. Daily cap → fails closed, row survives, alert once');
reset();
props.confirmSendCounter = JSON.stringify({ date: formatDate(new Date(), 'x', 'yyyy-MM-dd'), count: 200 });
r = sub('capped@example.com');
check('returns the same OK', r === 'OK');
check('row STILL written at pending', dataRows().length === 1 && row1()[C.STATUS] === 'pending');
check('nothing sent', sentMail.length === 0);
check('confirm_sent_at empty', row1()[C.SENT] === '');
check('alert sent', alertMail.length === 1, 'alerts: ' + alertMail.length);
check('alert names the cap', /daily cap of 200/.test(at(alertMail,0,'subject')), at(alertMail,0,'subject'));
check('alert says rows are still being recorded', /STILL BEING RECORDED/.test(at(alertMail,0,'body')));
check('alert tells you how to find them', /empty\s+confirm_sent_at/.test(at(alertMail,0,'body')));
check('Ops records the trip', opsValue('last_cap_trip') instanceof Date);

section('18. Alert is gated to once per day');
sub('capped2@example.com');
sub('capped3@example.com');
check('still exactly one alert after 3 trips', alertMail.length === 1, 'alerts: ' + alertMail.length);
check('all three rows written', dataRows().length === 3);

section('19. Platform quota floor is independent of the counter');
reset();
quotaRemaining = 50;                              // below QUOTA_RESERVE of 100
r = sub('lowquota@example.com');
check('counter says fine, quota says no → blocked', sentMail.length === 0);
check('row still written', dataRows().length === 1);
check('alert names the quota', /quota below reserve/.test(at(alertMail,0,'subject')), at(alertMail,0,'subject'));

section('20. Counter rolls over implicitly on a new day');
reset();
props.confirmSendCounter = JSON.stringify({ date: '2020-01-01', count: 9999 });
sub('rollover@example.com');
check('yesterday\'s count ignored → sent', sentMail.length === 1);
check('counter reset to 1 for today', counterCount() === 1);

section('21. Corrupt counter reads as zero rather than blocking');
reset();
props.confirmSendCounter = 'not json{';
sub('corrupt@example.com');
check('still sent', sentMail.length === 1);

/* ── Stage 2: confirm ────────────────────────────────────────────────────── */

section('22. Confirm via POST → active, stamped, token rotated');
reset();
sub('conf@example.com');
const confirmToken = row1()[C.TOKEN];
let out = post({ parameter: { action: 'confirm', token: confirmToken } });
console.log('    ' + show());
check('redirects to the branded confirmed page', /subscribe\.html\?confirmed=1/.test(out));
check('status active', row1()[C.STATUS] === 'active');
check('confirmed_at stamped', row1()[C.CONFIRMED] instanceof Date);
check('token ROTATED — the spent confirm link dies', row1()[C.TOKEN] !== confirmToken);

section('23. The old confirm token no longer works');
out = post({ parameter: { action: 'confirm', token: confirmToken } });
check('invalid-link page', /no longer valid/.test(out));
check('points at the manage fallback', /subscribe\.html\?manage=1/.test(out));

section('24. Re-confirming with the CURRENT token is idempotent');
const durableToken = row1()[C.TOKEN];
const confirmedAt = row1()[C.CONFIRMED];
out = post({ parameter: { action: 'confirm', token: durableToken } });
check('still the confirmed page', /subscribe\.html\?confirmed=1/.test(out));
check('confirmed_at unchanged', row1()[C.CONFIRMED] === confirmedAt);
check('token not rotated again', row1()[C.TOKEN] === durableToken);

section('25. GET confirm renders a button and changes NOTHING (prefetch-safe)');
reset();
sub('pre@example.com');
const preToken = row1()[C.TOKEN];
snap = JSON.stringify(row1());
out = get({ parameter: { action: 'confirm', token: preToken } });
check('renders a form that POSTs', /<form method="post"/.test(out));
/* Without target="_top" the submit navigates the HtmlService SANDBOX IFRAME to
   script.google.com/exec, which Google serves with framing denied — the browser
   shows "script.google.com refused to connect" and the button does nothing, for
   everyone, incognito included. One attribute is the difference between this
   page working and not existing. */
check('form targets _top — escapes the HtmlService sandbox iframe',
      /<form method="post" target="_top"/.test(out));
check('carries the token as a hidden field', out.indexOf(preToken) !== -1);
check('row completely unchanged — a scanner prefetch confirms nobody',
      JSON.stringify(row1()) === snap);
check('status still pending', row1()[C.STATUS] === 'pending');

/* ── Stage 2: unsubscribe ────────────────────────────────────────────────── */

section('26. Unsubscribe is a one-click GET');
reset();
sub('un@example.com');
post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
const unsubToken = row1()[C.TOKEN];
const confAt = row1()[C.CONFIRMED];
out = get({ parameter: { action: 'unsubscribe', token: unsubToken } });
console.log('    ' + show());
check('redirects to the branded unsubscribed page', /subscribe\.html\?unsubscribed=1/.test(out));
check('status unsubscribed', row1()[C.STATUS] === 'unsubscribed');
check('unsubscribed_at stamped', row1()[C.UNSUB] instanceof Date);
check('confirmed_at KEPT — the consent audit trail', row1()[C.CONFIRMED] === confAt);
check('token NOT rotated — archived emails keep working', row1()[C.TOKEN] === unsubToken);

section('27. Unsubscribe is idempotent and survives repeat clicks');
out = get({ parameter: { action: 'unsubscribe', token: unsubToken } });
check('still the unsubscribed page', /subscribe\.html\?unsubscribed=1/.test(out));
check('status unchanged', row1()[C.STATUS] === 'unsubscribed');

section('28. unsubscribed → pending is EXEMPT from the cooldown');
/* THE CARVE-OUT, pinned so a future reader does not revert it as a bug.
   confirm_sent_at is still recent from the original confirmation, so a blanket
   cooldown would silence this — and someone who unsubscribed by accident would
   be stalled 15 minutes, staring at "Check your inbox" with nothing coming.
   Reaching "unsubscribed" requires clicking a tokenised link, which proves
   control of the mailbox; an attacker POSTing someone else's address can only
   ever drive it to pending. So the exemption opens no mailbombing vector. */
check('precondition: confirm_sent_at is recent enough to have blocked this',
      row1()[C.SENT] instanceof Date && (Date.now() - row1()[C.SENT].getTime()) < 15 * 60 * 1000);
r = sub('un@example.com');
console.log('    ' + show());
check('returns the same OK', r === 'OK');
check('status back to pending DESPITE the recent send', row1()[C.STATUS] === 'pending');
check('unsubscribed_at cleared', row1()[C.UNSUB] === '');
check('confirmed_at CLEARED — status is the single answer', row1()[C.CONFIRMED] === '');
check('token rotated', row1()[C.TOKEN] !== unsubToken);
check('a fresh confirmation WAS sent', sentMail.length === 2, 'sent: ' + sentMail.length);
check('still one row', dataRows().length === 1);

section('29. ...and the exemption is NARROW — pending is still gated');
/* The row is now pending with a fresh confirm_sent_at. An immediate re-submit
   takes the PENDING path, which is the attacker-reachable one, and must still be
   silenced. If this ever stops holding, the carve-out has been widened from one
   transition into a blanket removal — which is the actual regression to fear. */
const afterResubToken = row1()[C.TOKEN];
const afterResubSent = row1()[C.SENT];
r = sub('un@example.com');
check('returns the same OK', r === 'OK');
check('no third mail', sentMail.length === 2, 'sent: ' + sentMail.length);
check('token NOT rotated', row1()[C.TOKEN] === afterResubToken);
check('confirm_sent_at NOT touched', row1()[C.SENT] === afterResubSent);

section('30. Confirming again after re-subscribe stamps a FRESH confirmed_at');
const priorConfirmedAt = row1()[C.CONFIRMED];
out = post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
check('active again', row1()[C.STATUS] === 'active');
check('confirmed_at is a Date', row1()[C.CONFIRMED] instanceof Date);
check('and it is NEW, not the cleared-then-restored old one',
      row1()[C.CONFIRMED] !== priorConfirmedAt && priorConfirmedAt === '');

/* ── Stage 2: routing and hostile tokens ─────────────────────────────────── */

section('31. Routing and bad tokens all land on the same invalid page');
reset();
sub('route@example.com');
const goodToken = row1()[C.TOKEN];
[
  ['no action',            { token: goodToken }],
  ['unknown action',       { action: 'destroy', token: goodToken }],
  ['malformed token',      { action: 'confirm', token: 'not-a-uuid' }],
  ['empty token',          { action: 'unsubscribe', token: '' }],
  ['html in token',        { action: 'confirm', token: '<script>alert(1)</script>' }],
  ['unknown but well-formed token',
                           { action: 'unsubscribe', token: '99999999-aaaa-4bbb-8ccc-dddddddddddd' }]
].forEach(([label, parameter]) => {
  const res = get({ parameter });
  check(`GET ${label} → invalid-link page`, /no longer valid/.test(res));
});
check('no row was touched by any of them', row1()[C.STATUS] === 'pending' && row1()[C.TOKEN] === goodToken);
check('no script tag ever echoed into the page',
      !/<script>alert/.test(get({ parameter: { action: 'confirm', token: '<script>alert(1)</script>' } })));

section('32. POST confirm with a malformed token is refused');
out = post({ parameter: { action: 'confirm', token: 'nope' } });
check('invalid-link page', /no longer valid/.test(out));
check('row untouched', row1()[C.STATUS] === 'pending');

section('33. A FAILED send must not claim the mail went out');
/* confirm_sent_at is the record that someone WAS mailed — the cooldown clock and
   the backfill marker both read it. Stamping it before the send succeeds would
   make a Gmail failure look like a delivery: the person is never mailed, yet the
   cooldown silences their retries for 15 minutes and the backfill filter skips
   them. Caught by mutation testing, which moved the stamp above the try block
   and every other assertion still passed. */
reset();
mailThrows = true;
r = sub('fails@example.com');
check('returns the same OK — the row is safe', r === 'OK');
check('row written at pending', dataRows().length === 1 && row1()[C.STATUS] === 'pending');
check('confirm_sent_at NOT stamped', row1()[C.SENT] === '', String(row1()[C.SENT]));
check('counter NOT incremented', props.confirmSendCounter === undefined);
check('failure logged', log.some(l => l.startsWith('ERR')), log.join(' | '));
mailThrows = false;
r = sub('fails@example.com');
check('no cooldown was armed → the retry sends', sentMail.length === 1, 'sent: ' + sentMail.length);

section('33b. Deploy B — confirm on the site, unsubscribe still on /exec');
/* The split is deliberate and asymmetric. Unsubscribe must work with NO JS —
   privacy.html promises one-click — and a static page cannot read a token from
   the URL without a script. Confirm can afford the JS dependency because a
   visitor without JS cannot subscribe in the first place. */
reset();
sub('split@example.com');
const cUrl = sandbox.confirmUrl_('8f14e45f-ea1b-4b9a-8b7c-1c2d3e4f5a6b');
const uUrl = sandbox.unsubscribeUrl_('8f14e45f-ea1b-4b9a-8b7c-1c2d3e4f5a6b');
check('confirm → site', cUrl === 'https://threeflows.com/subscribe.html?confirm=8f14e45f-ea1b-4b9a-8b7c-1c2d3e4f5a6b', cUrl);
check('unsubscribe → /exec, so it works with no JS',
      /^https:\/\/script\.google\.com\/.*action=unsubscribe/.test(uUrl), uUrl);
check('the manage mail therefore still carries a Google URL — accepted, recorded',
      sandbox.mailFooter_('8f14e45f-ea1b-4b9a-8b7c-1c2d3e4f5a6b').indexOf('script.google.com') !== -1);

section('33c. The LEGACY interstitial still resolves pre-repoint links');
/* Confirm links sent before deploy B are permanent and unrecallable. doGet's
   confirm branch is kept for exactly them; deleting it would strand anyone who
   had not yet clicked. */
reset();
sub('legacy@example.com');
const legacyTok = row1()[C.TOKEN];
const legacyOut = get({ parameter: { action: 'confirm', token: legacyTok } });
check('old-style GET still renders the button', /<form method="post" target="_top"/.test(legacyOut));
check('and still changes nothing until POSTed', row1()[C.STATUS] === 'pending');
check('POSTing it still confirms',
      post({ parameter: { action: 'confirm', token: legacyTok } }) &&
      row1()[C.STATUS] === 'active');

section('33d. Bodies are ONE PARAGRAPH PER LINE, not hard-wrapped');
/* A hard-wrapped plain-text body gets wrapped AGAIN by the client at its own
   width, which on a phone reads as a ragged column of half-empty lines. Blank
   lines carry the structure; each paragraph is one long line. The footer's three
   lines below the "—" are deliberate and exempt. */
[['confirmation', sandbox.CONFIRM_BODY], ['manage', sandbox.MANAGE_BODY]].forEach(([label, body]) => {
  const lines = body.split('\n');
  const sep = lines.indexOf('—');
  check(`${label}: has the — footer separator`, sep > 0, 'index: ' + sep);
  const prose = lines.slice(0, sep);
  let wrapped = null;
  for (let i = 0; i + 1 < prose.length; i++) {
    if (prose[i].trim() !== '' && prose[i + 1].trim() !== '') { wrapped = prose[i]; break; }
  }
  check(`${label}: no paragraph is split across two lines`, wrapped === null,
        'wrapped at: ' + JSON.stringify(wrapped));
  check(`${label}: footer keeps its two address lines`,
        lines.slice(sep).filter(l => l.trim() !== '').length === 3, lines.slice(sep).join(' | '));
});

section('34. MANAGE — an active subscriber is mailed their unsubscribe link');
reset();
sub('m@example.com');
post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
const durable = row1()[C.TOKEN];
sentMail.length = 0;
let out2 = manage('m@example.com');
console.log('    ' + show());
check('returns the same OK', out2 === 'OK');
check('exactly one mail sent', sentMail.length === 1, 'sent: ' + sentMail.length);
check('sent to the subscriber', at(sentMail,0,'to') === 'm@example.com');
/* A NEUTRAL NOUN PHRASE, not the imperative that would parallel the
   confirmation's subject. This mail sometimes arrives unrequested, and an
   imperative reads as an instruction to someone who never asked. */
check('settled subject', at(sentMail,0,'subject') === 'Your Three Flows subscription',
      at(sentMail,0,'subject'));
check('carries the DURABLE unsubscribe token, not a new one',
      at(sentMail,0,'body').indexOf(durable) !== -1);
check('opens with the authored first line',
      at(sentMail,0,'body').indexOf('You asked for a link to manage your subscription') === 0);
/* Load-bearing, not decorative: anyone can request a manage link for any
   address, so an unrequested one WILL sometimes land in a subscriber's inbox.
   This sentence is what makes that harmless rather than alarming. */
check('reassures an unrequested recipient they are still subscribed',
      at(sentMail,0,'body').indexOf("nothing has changed, and you're still subscribed") !== -1);
check('address appears exactly ONCE — no appended duplicate footer',
      at(sentMail,0,'body').split('7211 Austin St.').length - 1 === 1);
check('sent as plain text, no htmlBody',
      (at(sentMail,0,'options')||{}).htmlBody === undefined);
check('token NOT rotated — archived links still work', row1()[C.TOKEN] === durable);
check('{{UNSUBSCRIBE_URL}} substituted', !/\{\{UNSUBSCRIBE_URL\}\}/.test(at(sentMail,0,'body')));
check('manage_sent_at stamped', row1()[C.MSENT] instanceof Date);
check('confirm_sent_at NOT touched — separate clocks',
      row1()[C.SENT] instanceof Date && row1()[C.SENT] !== row1()[C.MSENT]);
check('counts against the shared daily budget',
      counterCount() === 2, props.confirmSendCounter);

section('35. MANAGE — its own cooldown, and NO exemption');
/* Unlike unsubscribed → pending, this path IS attacker-reachable: anyone can
   POST any address. So it gets the blanket cooldown, with no carve-out. */
out2 = manage('m@example.com');
check('returns the same OK', out2 === 'OK');
check('no second mail', sentMail.length === 1, 'sent: ' + sentMail.length);

section('36. MANAGE — only ACTIVE rows are mailed');
[['pending', 'pending'], ['unsubscribed', 'unsubscribed'], ['bounced', 'an unrecognised status']]
  .forEach(([status, label]) => {
    reset();
    sub('s@example.com');
    row1()[C.STATUS] = status;
    sentMail.length = 0;
    const res = manage('s@example.com');
    check(`${label} → OK, nothing sent`, res === 'OK' && sentMail.length === 0,
          'sent: ' + sentMail.length);
  });
reset();
check('unknown address → OK, nothing sent',
      manage('nobody@example.com') === 'OK' && sentMail.length === 0 && dataRows().length === 0);

section('37. MANAGE — honeypot, malformed address, fail-closed copy');
reset();
sub('hp@example.com');
post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
sentMail.length = 0;
check('honeypot → OK, nothing sent',
      manage('hp@example.com', { website: 'http://spam' }) === 'OK' && sentMail.length === 0);
check('malformed address → OK, nothing sent',
      manage('not-an-email') === 'OK' && sentMail.length === 0);
reset({ manageBody: '__MANAGE_BODY__' });
sub('fc@example.com');
post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
sentMail.length = 0;
alertMail.length = 0;
check('manage copy unwritten → FAILS CLOSED, nothing sent',
      manage('fc@example.com') === 'OK' && sentMail.length === 0);
check('manage_sent_at NOT stamped', row1()[C.MSENT] === '');
check('owner alerted', alertMail.length === 1 && /manage body not configured/.test(at(alertMail,0,'subject')),
      at(alertMail,0,'subject'));

section('37b. MANAGE — a placeholder SUBJECT alone still fails closed');
/* Both copies are authored now, so this forces a placeholder subject back in to
   prove the guard requires BOTH — a placeholder subject is just as visible in an
   inbox as a placeholder body. */
reset({ manageSubject: '__MANAGE_SUBJECT__' });
sub('subj@example.com');
post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
sentMail.length = 0;
check('authored body + placeholder subject → nothing sent',
      manage('subj@example.com') === 'OK' && sentMail.length === 0, 'sent: ' + sentMail.length);
check('manage_sent_at NOT stamped', row1()[C.MSENT] === '');

section('37c. NO LINK BASE → fail closed, never mail a dead link');
/* The bug this pins: ScriptApp.getService().getUrl() returns null until the
   script is deployed as a web app, and concatenating null produced real mail
   containing "null?action=confirm&token=...". A link that looks fine and cannot
   work is worse than no mail — the send is spent, confirm_sent_at is stamped so
   the row LOOKS mailed, and the cooldown then silences the retry. */
reset();
sandbox.EXEC_URL = '__EXEC_URL__';
serviceUrl = null;
r = sub('nolink@example.com');
check('returns the same OK', r === 'OK');
check('row STILL written at pending', dataRows().length === 1 && row1()[C.STATUS] === 'pending');
check('NOTHING sent — no dead link mailed', sentMail.length === 0, 'sent: ' + sentMail.length);
check('confirm_sent_at NOT stamped, so the row is not falsely marked mailed',
      row1()[C.SENT] === '');
check('owner alerted with the cause', alertMail.length === 1 &&
      /web app URL unknown/.test(at(alertMail,0,'subject')), at(alertMail,0,'subject'));

section('37d. execUrl_ never yields the string "null"');
reset();
sandbox.EXEC_URL = '__EXEC_URL__';
serviceUrl = null;
check('unset + undeployed → empty string, not null', sandbox.execUrl_() === '');
check('and no link contains "null"', sandbox.confirmUrl_('t').indexOf('null') === -1);
serviceUrl = 'https://script.google.com/macros/s/FROMSERVICE/exec';
check('falls back to getUrl() when EXEC_URL is unset',
      sandbox.execUrl_() === 'https://script.google.com/macros/s/FROMSERVICE/exec');
sandbox.EXEC_URL = 'https://script.google.com/macros/s/PINNED/exec';
check('the PINNED value wins over the execution context',
      sandbox.execUrl_() === 'https://script.google.com/macros/s/PINNED/exec');
reset();
serviceUrl = null;
check('pinned alone is enough — no deployment lookup needed',
      sandbox.execUrl_() === 'https://script.google.com/macros/s/TESTID/exec' &&
      sandbox.linkBaseReady_() === true);

section('37e. EXEC_URL is committed, and drift from the live deployment warns');
/* The pin is committed on purpose — the value is public by necessity, since
   assets/subscribe.js must carry the same URL for the browser to POST to it. A
   placeholder would cost something real: this file is meant to be PASTED, and a
   constant that must be re-typed after every paste is one that gets forgotten. */
reset();
check('EXEC_URL is a real /exec URL, not a placeholder',
      /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(sandbox.EXEC_URL),
      sandbox.EXEC_URL);
/* The hazard the pin introduces: a NEW deployment would mint a new URL and the
   stale pin would keep winning, silently. */
serviceUrl = 'https://script.google.com/macros/s/ADIFFERENTDEPLOYMENT/exec';
log.length = 0;
sub('drift@example.com');
check('a differing live deployment warns', log.some(l => /does not match the running deployment/.test(l)),
      log.join(' | '));
check('and the PINNED url still wins, so links stay consistent',
      /macros\/s\/TESTID\/exec/.test(sandbox.unsubscribeUrl_('t')), sandbox.unsubscribeUrl_('t'));
/* Running from the editor legitimately returns /dev — not drift, must not cry wolf. */
reset();
serviceUrl = 'https://script.google.com/macros/s/TESTID/dev';
log.length = 0;
sub('devurl@example.com');
check('a /dev URL from the editor does NOT warn',
      !log.some(l => /does not match the running deployment/.test(l)), log.join(' | '));

section('38. UNKNOWN ACTION is rejected, never routed to subscribe');
/* The regression this exists to prevent: doPost used to fall through to the
   subscribe flow for any action it did not recognise, so a manage submit against
   an endpoint that had not learned "manage" yet would have SUBSCRIBED the person
   and mailed them a confirmation — while they were trying to cancel. */
reset();
const res38 = post({ parameter: { action: 'destroy', email: 'unknown@example.com', website: '' } });
check('returns the uniform OK', res38 === 'OK');
check('NO row written', dataRows().length === 0, 'rows: ' + dataRows().length);
check('NO mail sent', sentMail.length === 0);
check('logged for a broken client to be found by', log.some(l => /unknown action/i.test(l)));
reset();
check('action="subscribe" still subscribes',
      sub('explicit@example.com', { action: 'subscribe' }) === 'OK' && dataRows().length === 1);
reset();
check('absent action still subscribes',
      sub('implicit@example.com') === 'OK' && dataRows().length === 1);

section('39. format=json gives fetch() an answer it can branch on');
reset();
sub('j@example.com');
const jTok = row1()[C.TOKEN];
let body39 = post({ parameter: { action: 'confirm', token: jTok, format: 'json' } });
check('valid token → {"ok":true}', asJson(body39).ok === true, body39);
check('and it actually confirmed', row1()[C.STATUS] === 'active');
body39 = post({ parameter: { action: 'confirm', token: jTok, format: 'json' } });
check('spent token → {"ok":false}', asJson(body39).ok === false, body39);
body39 = post({ parameter: { action: 'confirm', token: 'nope', format: 'json' } });
check('malformed token → {"ok":false}', asJson(body39).ok === false, body39);
/* The HTML path must be untouched — it is what the no-JS form submit gets. */
reset();
sub('h@example.com');
const hOut = post({ parameter: { action: 'confirm', token: row1()[C.TOKEN] } });
check('no format → still the HTML redirect', /subscribe\.html\?confirmed=1/.test(hOut));

section('40. mailFooter_ — unused by stage 2, but must stay correct');
/* Nothing calls it yet: the only mail stage 2 sends is the confirmation, which
   carries no unsubscribe link. It is exercised directly so the definition the
   first update mail will depend on is not untested dead code. */
reset();
const footer = sandbox.mailFooter_('99999999-aaaa-4bbb-8ccc-dddddddddddd');
check('carries a one-click unsubscribe link', /Unsubscribe: .*action=unsubscribe&token=/.test(footer));
check('carries the postal address', footer.indexOf('7211 Austin St. PMB 168, Forest Hills, NY 11375') !== -1);
check('carries the company name', footer.indexOf('Three Flows Solutions LLC') !== -1);

section('41. Lock is released after every path');
reset();
sub('l1@example.com');
sub('l2@example.com');
post({ parameter: { action: 'confirm', token: rows[1][C.TOKEN] } });
get({ parameter: { action: 'unsubscribe', token: rows[1][C.TOKEN] } });
check('all four calls completed → lock never wedged', dataRows().length === 2 && !lockHeld);

console.log(`\n──────── ${pass} passed, ${fail} failed ────────\n`);
process.exit(fail ? 1 : 0);
