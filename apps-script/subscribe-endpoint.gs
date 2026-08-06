/**
 * subscribe-endpoint.gs — Google Apps Script backend for the threeflows.com
 * email subscription list (subscribe.html + assets/subscribe.js).
 *
 * ── WHAT THIS IS ──────────────────────────────────────────────────────────
 * Source-of-truth RECORD of the subscribe endpoint, the sibling of
 * apps-script/contact-endpoint.gs. It is NOT executed by the static site; the
 * site only POSTs to the deployed /exec URL. This file lives in the repo so the
 * endpoint logic is versioned and reviewable.
 *
 * ── STAGE 1 OF 3 — SCOPE (read before extending) ──────────────────────────
 * This stage writes ROWS ONLY. It sends NO EMAIL of any kind — no confirmation
 * mail, no notification. A row written here sits at status "pending" and stays
 * there until stage 2 exists. Nothing in this file calls MailApp or GmailApp,
 * deliberately.
 *   Stage 2: send the confirmation mail + handle the confirm / unsubscribe
 *            links, flipping "pending" → "active" and stamping confirmed_at.
 *   Stage 3: wire assets/subscribe.js to POST here (see FRONTEND CONTRACT).
 * Until stage 2 ships, a subscriber never receives the confirmation link that
 * subscribe.html and privacy.html both promise. That gap is why this endpoint
 * should NOT be wired into the page yet.
 *
 * ── HOW IT IS DEPLOYED ────────────────────────────────────────────────────
 * CONTAINER-BOUND script on the "Subscribe" Google Sheet (Extensions → Apps
 * Script from that Sheet), so SpreadsheetApp.getActiveSpreadsheet() resolves to
 * it and no sheet ID is ever hardcoded.
 * Deploy: Deploy → New deployment → Web app
 *   - Execute as:      Me (the owner)
 *   - Who has access:  Anyone
 *
 * WHY "ANYONE" IS REQUIRED — do not tighten this.
 * The caller is an anonymous visitor's browser on a static site. There is no
 * sign-in, no session, and no server of ours in front of it. "Anyone with a
 * Google account" would force every visitor through a Google login before the
 * POST could land, which silently breaks the form for everyone not already
 * signed in — and for everyone who has no Google account at all. "Anyone" here
 * means "unauthenticated", NOT "anyone can read the Sheet": the script runs as
 * the owner, so the Sheet itself stays private and only this code touches it.
 * The honeypot, the server-side validation, and the uniform response below are
 * what defend the endpoint — not the access setting.
 *
 * ── REDEPLOY CAVEAT (important) ───────────────────────────────────────────
 * To change this script AFTER go-live WITHOUT breaking the wired URL, edit the
 * code, then Deploy → Manage deployments → (pencil/edit the existing Web app
 * deployment) → Version: New version → Deploy. This keeps the SAME /exec URL.
 * Creating a brand-new deployment instead mints a NEW URL and silently breaks
 * the form until the frontend is re-wired.
 *
 * ── THE SHEET ─────────────────────────────────────────────────────────────
 * Tab "Subscribe", row 1 frozen, headers in A–G exactly as HEADER below:
 *   A timestamp | B email | C status | D token | E confirmed_at
 *   F unsubscribed_at | G source_page
 * Read BY NAME, never by index, so re-ordering tabs cannot repoint the writes.
 *
 * ── FRONTEND CONTRACT (what stage 3 must send) ────────────────────────────
 * Fields, all optional except email:
 *   email        the address (required; validated again here, server-side)
 *   source_page  where the submit came from, e.g. "subscribe.html"
 *   website      HONEYPOT — must be present and EMPTY on a real submit
 * Both encodings are accepted (see readParams_): form-encoded/multipart via
 * e.parameter, or a JSON body via e.postData.contents.
 * RECOMMENDED: `body: new FormData(form)` with NO explicit Content-Type, exactly
 * as assets/contact-form.js already does. That is a CORS "simple request" and
 * needs no preflight. A fetch sending `Content-Type: application/json` triggers
 * a CORS preflight OPTIONS that Apps Script does not answer, so the POST fails
 * in the browser — JSON support here is for curl and for a client that sends
 * `Content-Type: text/plain`, not for a stock JSON fetch.
 * Response: always plain-text 200 "OK" (see ok_ and the uniform-response rule).
 * The frontend checks only res.ok, matching contact-form.js.
 */

/** Tab that stores subscribers, and its header row. Labels are lowercase and
 *  match the frozen row 1 of the live Sheet exactly. */
var SHEET_NAME = 'Subscribe';
var HEADER = ['timestamp', 'email', 'status', 'token', 'confirmed_at',
              'unsubscribed_at', 'source_page'];

/** 1-based column positions, derived from HEADER's order above. Named so a
 *  column move is a one-line change here rather than a hunt for magic numbers. */
var COL_TIMESTAMP       = 1;   // A
var COL_EMAIL           = 2;   // B
var COL_STATUS          = 3;   // C
var COL_TOKEN           = 4;   // D
var COL_CONFIRMED_AT    = 5;   // E
var COL_UNSUBSCRIBED_AT = 6;   // F
var COL_SOURCE_PAGE     = 7;   // G

/** Status vocabulary. Any value outside this set is treated as UNKNOWN and left
 *  strictly alone — see subscribe_ for why that is the safe default. */
var STATUS_PENDING      = 'pending';
var STATUS_ACTIVE       = 'active';
var STATUS_UNSUBSCRIBED = 'unsubscribed';

/** How long to wait for the script lock before giving up, in ms. */
var LOCK_TIMEOUT_MS = 15000;

/** Defensive caps. An address longer than 254 chars is not deliverable, and a
 *  source_page longer than 200 chars is not one of ours. */
var MAX_EMAIL_LEN = 254;
var MAX_SOURCE_LEN = 200;

/**
 * Permissive email SHAPE check — deliberately not RFC 5322.
 *
 * The brief the page was built to: rejecting a valid address is worse than
 * accepting a typo, because a typo simply never confirms and the row expires at
 * "pending" harmlessly. So this asks only for a local part, an @, and a dotted
 * domain — the same shape assets/contact-form.js checks client-side.
 *
 * The ONE tightening: the first character must be alphanumeric. That is not
 * pedantry about addresses, it is a SHEET-FORMULA GUARD. Apps Script's
 * appendRow stores a leading "=", "+", "-" or "@" as a FORMULA, so an address
 * like "=HYPERLINK(...)@x.co" would execute when the owner opens the Sheet.
 * Requiring an alphanumeric first character kills that class of injection while
 * excluding no address any provider actually issues.
 */
var EMAIL_RE = /^[A-Za-z0-9][^\s@]*@[^\s@]+\.[^\s@]+$/;

/**
 * source_page is never looked up, only recorded, so it gets a whitelist rather
 * than a guard: page-ish characters only. Anything else is dropped to "" rather
 * than stored, which also closes the same formula-injection hole as above.
 */
var SOURCE_PAGE_RE = /^[A-Za-z0-9._\/?=&%-]{1,200}$/;

/**
 * The ONE response every caller gets: plain-text 200 "OK".
 *
 * UNIFORM BY DESIGN. A new subscriber, a re-submit, an address already active,
 * a returning unsubscriber, a bot caught by the honeypot and a malformed
 * address all receive this identical body. Anything that varied by path would
 * turn the endpoint into a membership oracle — POST an address, read the
 * response, learn whether it is on the list. It is not, and must not become one.
 *
 * The deliberate EXCEPTION is infrastructure failure (see doPost): if the write
 * could not be attempted, this function is not reached and the platform returns
 * a non-200 so the caller can retry. That leaks nothing about membership — it
 * reports only that the request did not complete.
 */
function ok_() {
  return ContentService
    .createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Read the POST body under EITHER encoding, because which one the page will
 * send is not settled yet.
 *
 *   - form-encoded / multipart → Apps Script has already parsed it into
 *     e.parameter. Used as the base.
 *   - JSON body → arrives raw in e.postData.contents with e.parameter empty, so
 *     it is parsed here and merged over the base.
 *
 * Order is safe in both directions: a urlencoded body's raw contents
 * ("email=a%40b.co&...") is not valid JSON, so the parse throws and is ignored;
 * a JSON body leaves e.parameter empty, so there is nothing to overwrite. Only
 * a plain object is merged — JSON.parse happily returns a string, number or
 * array for valid-but-wrong bodies, and none of those carry fields.
 *
 * Never throws: a body that is neither yields {} and the caller then fails the
 * email check, which is the same silent no-write path as any other junk.
 */
function readParams_(e) {
  var params = {};
  var key;

  if (e && e.parameter) {
    for (key in e.parameter) {
      if (Object.prototype.hasOwnProperty.call(e.parameter, key)) {
        params[key] = e.parameter[key];
      }
    }
  }

  if (e && e.postData && e.postData.contents) {
    try {
      var body = JSON.parse(e.postData.contents);
      if (body && typeof body === 'object' && !(body instanceof Array)) {
        for (key in body) {
          if (Object.prototype.hasOwnProperty.call(body, key)) {
            params[key] = body[key];
          }
        }
      }
    } catch (parseErr) {
      // Not JSON — a form-encoded body lands here every time. Not an error.
    }
  }

  return params;
}

/** Trim a possibly-absent value to a string. Numbers and booleans from a JSON
 *  body become strings rather than throwing on .trim(). */
function str_(v) {
  return (v === null || v === undefined) ? '' : String(v).trim();
}

/** Normalised lookup key: trimmed and lowercased. The stored value keeps the
 *  case the subscriber typed; only comparison is case-insensitive. */
function normEmail_(v) {
  return str_(v).toLowerCase();
}

/** Shape check + length cap. See EMAIL_RE for why it is permissive. */
function isEmailShape_(email) {
  return email.length > 0 && email.length <= MAX_EMAIL_LEN && EMAIL_RE.test(email);
}

/** Whitelist source_page, or drop it to "". Never rejects the submission —
 *  a junk source_page is a lost breadcrumb, not a reason to lose a subscriber. */
function safeSourcePage_(raw) {
  var s = str_(raw);
  if (s.length > MAX_SOURCE_LEN) s = s.substring(0, MAX_SOURCE_LEN);
  return SOURCE_PAGE_RE.test(s) ? s : '';
}

/**
 * Resolve the Subscribe tab, creating it if absent and writing the header row
 * when the tab is EMPTY.
 *
 * "Empty" rather than "just created" is the honest test, and it is the lesson
 * contact-endpoint.gs records the hard way: keying the header write to creation
 * alone meant a tab that already existed — or one cleared by hand — never got a
 * header, which is how that Sheet ended up headerless. This covers a fresh tab
 * and a cleared one, and never touches a tab that already holds rows.
 *
 * It also freezes row 1 on creation, matching the live Sheet's setup, so a
 * rebuilt tab behaves like the original rather than subtly differently.
 */
function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Find the 1-based row for an email, comparing trimmed + lowercased against
 * column B. Returns 0 when absent.
 *
 * Reads columns B:C in ONE getValues call rather than per-row reads — a
 * per-row loop over a growing list is the classic Apps Script timeout. The
 * status travels back with the match so the caller needs no second read.
 */
function findRow_(sheet, emailKey) {
  var last = sheet.getLastRow();
  if (last < 2) {
    return { row: 0, status: '' };   // header only, or empty
  }

  var values = sheet.getRange(2, COL_EMAIL, last - 1, 2).getValues();   // B:C
  for (var i = 0; i < values.length; i++) {
    if (normEmail_(values[i][0]) === emailKey && emailKey !== '') {
      return { row: i + 2, status: normEmail_(values[i][1]) };
    }
  }
  return { row: 0, status: '' };
}

/**
 * The state machine, run INSIDE the lock. Returns a short string naming the
 * path taken — for the execution log only; the caller's response never varies.
 *
 * Paths, per the subscription rules:
 *   absent        → append a pending row with a fresh token
 *   pending       → re-arm: new token, new timestamp, status untouched.
 *                   A re-submit almost always means the first mail was lost.
 *   active        → NOTHING. No write, no timestamp touch. Already subscribed.
 *   unsubscribed  → treat as a fresh subscribe: new token, status back to
 *                   pending, unsubscribed_at cleared. Someone who left is
 *                   allowed to return.
 *   anything else → NOTHING, and warn.
 *
 * That last case is the one worth defending. An unrecognised status is most
 * likely a hand-added suppression ("bounced", "complained", "do not mail"), and
 * re-arming it would mail someone who was deliberately taken off. Doing nothing
 * can strand a legitimate subscriber, which is recoverable by hand; mailing a
 * suppressed address is not. The warning puts it in the execution log so the
 * owner can see it happened.
 *
 * confirmed_at is deliberately NOT cleared on the unsubscribed → pending path.
 * It records when this address FIRST confirmed, which stays true history; stage
 * 2 overwrites it on the next confirm anyway.
 */
function subscribe_(sheet, email, emailKey, sourcePage) {
  var found = findRow_(sheet, emailKey);
  var now = new Date();

  if (found.row === 0) {
    sheet.appendRow([now, email, STATUS_PENDING, Utilities.getUuid(), '', '', sourcePage]);
    return 'appended';
  }

  if (found.status === STATUS_ACTIVE) {
    return 'noop-active';
  }

  if (found.status === STATUS_PENDING) {
    sheet.getRange(found.row, COL_TIMESTAMP).setValue(now);
    sheet.getRange(found.row, COL_TOKEN).setValue(Utilities.getUuid());
    return 're-armed-pending';
  }

  if (found.status === STATUS_UNSUBSCRIBED) {
    sheet.getRange(found.row, COL_TIMESTAMP).setValue(now);
    sheet.getRange(found.row, COL_STATUS).setValue(STATUS_PENDING);
    sheet.getRange(found.row, COL_TOKEN).setValue(Utilities.getUuid());
    sheet.getRange(found.row, COL_UNSUBSCRIBED_AT).setValue('');
    return 'resubscribed';
  }

  console.warn('Row ' + found.row + ' has unrecognised status "' + found.status +
               '" — left untouched. Resolve by hand if this address should be able to subscribe.');
  return 'noop-unknown-status';
}

/**
 * Entry point. Handles a subscribe POST.
 *
 * Order matters, and each step's failure mode is chosen deliberately:
 *
 *   1. Honeypot first. A non-empty `website` is a bot: return the SAME success,
 *      write nothing, log nothing identifying. The bot gets no signal.
 *   2. Validate the email server-side. The client's HTML5 check is not trusted —
 *      a direct POST never ran it. A malformed address returns success and
 *      writes nothing, for the same reason the honeypot does: any distinct
 *      response is a probe surface. It is logged so a genuinely broken client
 *      is still diagnosable from the execution log.
 *   3. Take the script lock, then read-then-write inside it. Without the lock,
 *      two near-simultaneous submits for the same address both find no row and
 *      both append — the duplicate this guards against. flush() forces the write
 *      out before the lock is released, so the next execution's read sees it.
 *   4. A lock timeout or a sheet failure THROWS, which the platform turns into a
 *      non-200. That is the one non-uniform response, and it is correct: the
 *      write did not happen, the caller should retry, and "the request failed"
 *      reveals nothing about who is on the list.
 */
function doPost(e) {
  var p = readParams_(e);

  var email      = str_(p.email);
  var honeypot   = str_(p.website);
  var sourcePage = safeSourcePage_(p.source_page);
  var emailKey   = normEmail_(email);

  // 1. Silent honeypot drop — indistinguishable success, no side effects.
  if (honeypot !== '') {
    return ok_();
  }

  // 2. Server-side shape check. Silent no-write, same success response.
  if (!isEmailShape_(email)) {
    console.warn('Rejected a malformed address (no row written). Length: ' + email.length);
    return ok_();
  }

  // 3. Serialise the read-then-write.
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    // 4. Could not even attempt the write → fail loudly so the caller retries.
    throw new Error('Could not acquire lock within ' + LOCK_TIMEOUT_MS + 'ms: ' + lockErr);
  }

  try {
    var sheet = getSheet_();
    var outcome = subscribe_(sheet, email, emailKey, sourcePage);
    SpreadsheetApp.flush();
    console.log('subscribe: ' + outcome);
  } finally {
    // Released even if the write threw, so one failure cannot wedge the lock
    // for every later submit. The throw still propagates → non-200.
    lock.releaseLock();
  }

  return ok_();
}

/* ─────────────────────────────────────────────────────────────────────────────
   TEST HELPERS

   Safe to delete once the page is wired; they are not part of the endpoint.
   Run any of them from the Apps Script editor's function dropdown — the editor
   can only run zero-argument functions, which is why each builds its own mock
   `e` and calls doPost with it.

   THEY WRITE REAL ROWS to the Subscribe tab. Use the example.com addresses
   below (never a real one) and delete the rows afterwards.

   Suggested order for a first run:
     1. test_formEncoded_   → expect a new "pending" row, token filled
     2. test_formEncoded_   → run AGAIN: same row re-armed, token CHANGES,
                              timestamp updates, still exactly one row
     3. test_json_          → a second pending row for the json@ address
     4. test_honeypot_      → returns OK, writes NOTHING (row count unchanged)
     5. test_malformedEmail_→ returns OK, writes NOTHING
   Then set the first row's status to "active" by hand and run 1 again: nothing
   changes. Set it to "unsubscribed" and run 1 again: status returns to
   "pending", token changes, unsubscribed_at clears.
   ───────────────────────────────────────────────────────────────────────────── */

/** Mock: form-encoded / multipart — the encoding contact-form.js already uses,
 *  and the one recommended for stage 3. */
function test_formEncoded_() {
  var e = {
    parameter: {
      email: 'form-test@example.com',
      source_page: 'subscribe.html',
      website: ''
    },
    postData: {
      type: 'application/x-www-form-urlencoded',
      contents: 'email=form-test%40example.com&source_page=subscribe.html&website='
    }
  };
  Logger.log('response: ' + doPost(e).getContent());
}

/** Mock: JSON body. e.parameter is empty exactly as it would be for a real
 *  JSON POST, so this exercises the readParams_ fallback rather than shadowing
 *  it with parameters that were never sent. */
function test_json_() {
  var e = {
    parameter: {},
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        email: 'json-test@example.com',
        source_page: 'subscribe.html',
        website: ''
      })
    }
  };
  Logger.log('response: ' + doPost(e).getContent());
}

/** Mock: honeypot filled — must return OK and write NOTHING. Check the row
 *  count before and after; it must not move. */
function test_honeypot_() {
  var e = {
    parameter: {
      email: 'bot-test@example.com',
      source_page: 'subscribe.html',
      website: 'http://spam.example'
    }
  };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO new row)');
}

/** Mock: malformed address — must return OK and write NOTHING. */
function test_malformedEmail_() {
  var e = { parameter: { email: 'not-an-email', source_page: 'subscribe.html', website: '' } };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO new row)');
}

/** Mock: the formula-injection guard. An address whose local part starts with
 *  "=" is rejected by EMAIL_RE, so nothing reaches the Sheet as a formula. */
function test_formulaInjection_() {
  var e = { parameter: { email: '=HYPERLINK("http://x")@example.com', source_page: 'subscribe.html', website: '' } };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO new row)');
}
