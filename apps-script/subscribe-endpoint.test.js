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
 * subscribe-endpoint.gs cannot be run here: Apps Script's globals
 * (SpreadsheetApp, LockService, Utilities, ContentService) exist only on
 * Google's runtime, and deploying to check a branch of a state machine is a slow
 * loop that writes real rows to the real list. So this reads the .gs AS TEXT and
 * executes it in a `vm` context against in-memory stubs of those globals. The
 * .gs is never modified, never imported, and carries no test hooks — it is
 * exercised exactly as deployed.
 *
 * The stubs are deliberately thin: they model only what the endpoint actually
 * calls. `rows` is a plain array standing in for the sheet, index 0 being the
 * frozen header. Anything the endpoint does not touch is not simulated, so a
 * passing run means "the logic is right", NOT "Apps Script will behave
 * identically" — quota limits, real lock contention across concurrent
 * executions, and Sheets' own value coercion are outside what this can prove.
 * Those are what the editor mocks in the .gs are for.
 *
 * ── PUBLICLY SERVED ───────────────────────────────────────────────────────
 * The site deploys from main with .nojekyll, so every committed file is fetchable
 * — this one included, like apps-script/contact-endpoint.gs already is. It
 * deliberately contains no endpoint URL, no credentials, and no real addresses:
 * every address below is on example.com, which is reserved by RFC 2606 for
 * exactly this. Keep it that way.
 *
 * ── WHEN THE ENDPOINT CHANGES ─────────────────────────────────────────────
 * The status vocabulary and column order are duplicated here (H, and the literal
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

/* ── Stubs for the Apps Script globals ───────────────────────────────────── */

let rows = [];          // rows[0] is the header row; the sheet, in memory
let uuidCounter = 0;    // deterministic tokens, so "did it change?" is provable
let lockHeld = false;
const log = [];         // console/Logger output the endpoint emitted

/** Minimal Sheet: only the methods subscribe-endpoint.gs actually calls. */
function makeSheet() {
  return {
    getLastRow: () => rows.length,
    appendRow: r => rows.push(r.slice()),
    setFrozenRows: () => {},
    getRange: (row, col, numRows, numCols) => ({
      getValues: () => {
        const out = [];
        for (let i = 0; i < numRows; i++) {
          const r = rows[row - 1 + i] || [];
          out.push(r.slice(col - 1, col - 1 + numCols));
        }
        return out;
      },
      setValue: v => {
        while (rows[row - 1].length < col) rows[row - 1].push('');
        rows[row - 1][col - 1] = v;
      }
    })
  };
}

const sandbox = {
  console: {
    log: m => log.push('LOG ' + m),
    warn: m => log.push('WARN ' + m),
    error: m => log.push('ERR ' + m)
  },
  Logger: { log: m => log.push('Logger ' + m) },
  Utilities: { getUuid: () => 'uuid-' + (++uuidCounter) },
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: n => (n === 'Subscribe' ? makeSheet() : null),
      insertSheet: () => makeSheet()
    }),
    flush: () => {}
  },
  ContentService: {
    MimeType: { TEXT: 'TEXT' },
    createTextOutput: t => ({ setMimeType: () => ({ getContent: () => t }) })
  },
  LockService: {
    getScriptLock: () => ({
      waitLock: () => { if (lockHeld) throw new Error('lock busy'); lockHeld = true; },
      releaseLock: () => { lockHeld = false; }
    })
  },
  JSON, String, Object, Array, Date, Error, RegExp
};

vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(TARGET, 'utf8'), sandbox);

/* ── Harness plumbing ────────────────────────────────────────────────────── */

/** The sheet's frozen row 1, asserted against rather than imported. */
const H = ['timestamp', 'email', 'status', 'token', 'confirmed_at',
           'unsubscribed_at', 'source_page'];

const reset = () => { rows = [H.slice()]; uuidCounter = 0; log.length = 0; };
const post = e => sandbox.doPost(e).getContent();
const dataRows = () => rows.slice(1);
const show = () => dataRows().map(r =>
  `[${r[1]} | ${r[2]} | ${r[3]} | conf=${r[4] || '-'} | unsub=${r[5] || '-'} | ${r[6] || '-'}]`
).join('\n    ') || '(none)';

let pass = 0, fail = 0;
function check(label, cond, detail) {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label}${detail ? '\n        ' + detail : ''}`); }
}

/* ── Cases ───────────────────────────────────────────────────────────────── */

console.log('\n=== 1. New address, form-encoded ===');
reset();
let r = post({ parameter: { email: 'A@Example.com ', source_page: 'subscribe.html', website: '' } });
console.log('    ' + show());
check('returns OK', r === 'OK', 'got: ' + r);
check('one row appended', dataRows().length === 1);
check('status pending', dataRows()[0][2] === 'pending');
check('token generated', /^uuid-/.test(dataRows()[0][3]));
check('timestamp is a Date', dataRows()[0][0] instanceof Date);
check('email stored as typed, trimmed', dataRows()[0][1] === 'A@Example.com');
check('confirmed_at / unsubscribed_at empty', dataRows()[0][4] === '' && dataRows()[0][5] === '');
check('source_page stored', dataRows()[0][6] === 'subscribe.html');

console.log('\n=== 2. Re-submit, different case → re-arm, no duplicate ===');
const tok1 = dataRows()[0][3];
r = post({ parameter: { email: 'a@example.COM', source_page: 'subscribe.html', website: '' } });
console.log('    ' + show());
check('still exactly one row', dataRows().length === 1, 'rows: ' + dataRows().length);
check('token regenerated', dataRows()[0][3] !== tok1);
check('status still pending', dataRows()[0][2] === 'pending');

console.log('\n=== 3. status=active → do nothing ===');
rows[1][2] = 'active';
const snapshot = JSON.stringify(rows[1]);
log.length = 0;
r = post({ parameter: { email: 'a@example.com', source_page: 'subscribe.html', website: '' } });
console.log('    ' + show());
check('returns the same OK', r === 'OK');
check('row completely untouched', JSON.stringify(rows[1]) === snapshot);
check('no new row', dataRows().length === 1);
/* "Wrote nothing" is NOT sufficient here. If the active branch were removed,
   active would fall through to the unrecognised-status branch, which ALSO
   writes nothing — behaviourally identical to every assertion above. The
   distinguishing evidence is the log: active is a KNOWN status handled on
   purpose, so it must not warn. Without this line the whole branch could be
   deleted and this case would still pass. (Found by mutation-testing the
   harness against itself.) */
check('active is handled deliberately, not as unknown → no warning',
      !log.some(l => l.startsWith('WARN')), log.join(' | '));

console.log('\n=== 4. status=unsubscribed → pending, unsubscribed_at cleared ===');
rows[1][2] = 'unsubscribed';
rows[1][4] = '2026-01-01';           // confirmed_at — historical, must survive
rows[1][5] = '2026-02-02';           // unsubscribed_at — must be cleared
const tok3 = rows[1][3];
r = post({ parameter: { email: 'a@example.com', source_page: 'subscribe.html', website: '' } });
console.log('    ' + show());
check('status back to pending', rows[1][2] === 'pending');
check('unsubscribed_at cleared', rows[1][5] === '');
check('token regenerated', rows[1][3] !== tok3);
check('confirmed_at preserved as history', rows[1][4] === '2026-01-01');
check('no duplicate row', dataRows().length === 1);

console.log('\n=== 5. Unrecognised status → untouched + warned ===');
/* The suppression case: a hand-added "bounced"/"complained" must never be
   re-armed into pending, because that would mail someone deliberately removed. */
reset();
post({ parameter: { email: 'x@example.com', website: '' } });
rows[1][2] = 'bounced';
const snap2 = JSON.stringify(rows[1]);
log.length = 0;
r = post({ parameter: { email: 'x@example.com', website: '' } });
check('returns OK', r === 'OK');
check('row untouched', JSON.stringify(rows[1]) === snap2);
check('warning logged', log.some(l => l.startsWith('WARN')), log.join(' | '));

console.log('\n=== 6. JSON body, e.parameter empty ===');
reset();
r = post({ parameter: {}, postData: { type: 'application/json',
  contents: JSON.stringify({ email: 'json@example.com', source_page: 'subscribe.html', website: '' }) } });
console.log('    ' + show());
check('returns OK', r === 'OK');
check('row appended from JSON body', dataRows().length === 1 && dataRows()[0][1] === 'json@example.com');

console.log('\n=== 7. urlencoded raw contents must not break the JSON parse ===');
reset();
r = post({ parameter: { email: 'ue@example.com', website: '' },
           postData: { type: 'application/x-www-form-urlencoded', contents: 'email=ue%40example.com&website=' } });
check('row appended', dataRows().length === 1 && dataRows()[0][1] === 'ue@example.com', show());

console.log('\n=== 8. Honeypot → OK, no write ===');
reset();
r = post({ parameter: { email: 'bot@example.com', website: 'http://spam.example' } });
check('returns OK', r === 'OK');
check('nothing written', dataRows().length === 0);

console.log('\n=== 9. Malformed / hostile input → OK, no write ===');
const bad = ['not-an-email', '', 'a@b', '@example.com', 'a b@example.com',
             '=HYPERLINK("http://x")@example.com', '+1@example.com', '-x@example.com',
             'a'.repeat(250) + '@example.com'];
bad.forEach(b => {
  reset();
  const res = post({ parameter: { email: b, website: '' } });
  check(`rejected: ${JSON.stringify(b.slice(0, 34))}`,
        res === 'OK' && dataRows().length === 0, 'rows: ' + dataRows().length);
});

console.log('\n=== 10. Valid addresses must NOT be rejected ===');
const good = ['a@b.co', 'first.last@sub.domain.co.uk', 'user+tag@example.com',
              "o'brien@example.com", 'user_name@example-host.io', '123@456.com',
              'UPPER@EXAMPLE.COM'];
good.forEach(g => {
  reset();
  post({ parameter: { email: g, website: '' } });
  check(`accepted: ${g}`, dataRows().length === 1, 'rows: ' + dataRows().length);
});

console.log('\n=== 11. source_page whitelist ===');
reset();
post({ parameter: { email: 'sp@example.com', website: '', source_page: 'subscribe.html?manage=1' } });
check('query-string page kept', dataRows()[0][6] === 'subscribe.html?manage=1', dataRows()[0][6]);
reset();
post({ parameter: { email: 'sp2@example.com', website: '', source_page: '=EVIL()' } });
check('formula-ish source_page dropped to ""', dataRows()[0][6] === '', JSON.stringify(dataRows()[0][6]));

console.log('\n=== 12. Missing / empty event object ===');
reset();
check('doPost({}) does not throw',
      (() => { try { return post({}) === 'OK'; } catch (x) { return false; } })());
check('nothing written', dataRows().length === 0);

console.log('\n=== 13. Lock is released after a successful call ===');
reset();
post({ parameter: { email: 'l1@example.com', website: '' } });
post({ parameter: { email: 'l2@example.com', website: '' } });
check('second call succeeded → lock was released', dataRows().length === 2, 'rows: ' + dataRows().length);

console.log(`\n──────── ${pass} passed, ${fail} failed ────────\n`);
process.exit(fail ? 1 : 0);
