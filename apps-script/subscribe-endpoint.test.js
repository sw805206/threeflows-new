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
const log = [];

const HEADER_LEN = 8;

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
  ScriptApp: { getService: () => ({ getUrl: () => 'https://script.google.com/macros/s/TESTID/exec' }) },
  JSON, String, Object, Array, Date, Error, RegExp, encodeURIComponent
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(TARGET, 'utf8'), sandbox);

/* ── Harness plumbing ────────────────────────────────────────────────────── */

/** The sheet's frozen row 1, asserted against rather than imported. */
const H = ['timestamp', 'email', 'status', 'token', 'confirmed_at',
           'unsubscribed_at', 'source_page', 'confirm_sent_at'];

const C = { TS: 0, EMAIL: 1, STATUS: 2, TOKEN: 3, CONFIRMED: 4, UNSUB: 5, SRC: 6, SENT: 7 };

const REAL_BODY = 'Hello.\n\nConfirm here: {{CONFIRM_URL}}\n';
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
  log.length = 0;
  sandbox.CONFIRM_BODY = ('body' in opts) ? opts.body : REAL_BODY;
}

const post = e => sandbox.doPost(e).getContent();
const get = e => sandbox.doGet(e).getContent();
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
check('{{CONFIRM_URL}} substituted', /action=confirm&token=/.test(at(sentMail,0,'body')) &&
      !/\{\{CONFIRM_URL\}\}/.test(at(sentMail,0,'body')));
check('footer carries the unsubscribe link', /Unsubscribe: .*action=unsubscribe/.test(at(sentMail,0,'body')));
check('footer carries the postal address',
      at(sentMail,0,'body').indexOf('7211 Austin St. PMB 168, Forest Hills, NY 11375') !== -1);
check('confirm_sent_at stamped', row1()[C.SENT] instanceof Date);
check('counter incremented', JSON.parse(props.confirmSendCounter).count === 1);
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
check('counter reset to 1 for today', JSON.parse(props.confirmSendCounter).count === 1);

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

section('28. The cooldown ALSO gates unsubscribed → pending');
/* Deliberate, and worth pinning: the row still carries confirm_sent_at from its
   original confirmation, so an immediate re-subscribe is inside the window and
   nothing happens — no token, no status change, no mail. The spec says "inside
   the window, do nothing at all" without carving out this transition.
   CONSEQUENCE: someone who unsubscribes by accident and re-subscribes straight
   away is silently stalled for 15 minutes. Flagged for the human; not changed
   here, because the approved design does not exempt this path. */
snap = JSON.stringify(row1());
r = sub('un@example.com');
check('returns the same OK', r === 'OK');
check('row untouched — still unsubscribed', JSON.stringify(row1()) === snap);
check('no mail sent', sentMail.length === 1, 'sent: ' + sentMail.length);

section('29. Re-subscribe past the cooldown clears confirmed_at');
row1()[C.SENT] = new Date(Date.now() - 20 * 60 * 1000);   // 20 min ago
r = sub('un@example.com');
console.log('    ' + show());
check('status back to pending', row1()[C.STATUS] === 'pending');
check('unsubscribed_at cleared', row1()[C.UNSUB] === '');
check('confirmed_at CLEARED — status is the single answer', row1()[C.CONFIRMED] === '');
check('token rotated', row1()[C.TOKEN] !== unsubToken);
check('a fresh confirmation was sent', sentMail.length === 2, 'sent: ' + sentMail.length);
check('still one row', dataRows().length === 1);

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

section('34. Lock is released after every path');
reset();
sub('l1@example.com');
sub('l2@example.com');
post({ parameter: { action: 'confirm', token: rows[1][C.TOKEN] } });
get({ parameter: { action: 'unsubscribe', token: rows[1][C.TOKEN] } });
check('all four calls completed → lock never wedged', dataRows().length === 2 && !lockHeld);

console.log(`\n──────── ${pass} passed, ${fail} failed ────────\n`);
process.exit(fail ? 1 : 0);
