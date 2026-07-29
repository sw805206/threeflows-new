/**
 * contact-endpoint.gs — Google Apps Script backend for the threeflows.com
 * contact form (contact.html + assets/contact-form.js).
 *
 * ── WHAT THIS IS ──────────────────────────────────────────────────────────
 * Source-of-truth RECORD of the contact-form endpoint. It is NOT executed by
 * the static site; the site only POSTs to the deployed /exec URL. This file
 * lives in the repo so the endpoint logic is versioned and reviewable.
 *
 * ── HOW IT IS DEPLOYED ────────────────────────────────────────────────────
 * CONTAINER-BOUND script on a Google Sheet (Extensions → Apps Script from the
 * Sheet), so SpreadsheetApp.getActiveSpreadsheet() resolves to that Sheet.
 * Deploy: Deploy → New deployment → Web app
 *   - Execute as: me (the owner)
 *   - Who has access: Anyone
 * Copy the resulting /exec URL — that is what replaces the '__CONTACT_ENDPOINT__'
 * placeholder in assets/contact-form.js (a one-line change; nothing else).
 *
 * ── REDEPLOY CAVEAT (important) ───────────────────────────────────────────
 * To change this script AFTER go-live WITHOUT breaking the wired URL, edit the
 * code, then Deploy → Manage deployments → (pencil/edit the existing Web app
 * deployment) → Version: New version → Deploy. This keeps the SAME /exec URL.
 * Creating a brand-new deployment instead mints a NEW URL and silently breaks
 * the form until the frontend is re-wired.
 *
 * ── TIMEZONE ──────────────────────────────────────────────────────────────
 * The stored/emailed timestamp is computed in America/New_York explicitly via
 * Utilities.formatDate(..., 'America/New_York', ...), so correctness does NOT
 * depend on the script's project timezone. Setting "timeZone":"America/New_York"
 * in appsscript.json is an optional nice-to-have (it aligns the Apps Script
 * editor/Logger); it is not required, which matters because deployment here is
 * done by pasting Code.gs only. The timestamp is deliberately UNLABELLED — no
 * timezone text appears in the value, the header row, or the email.
 *
 * ── FRONTEND CONTRACT ─────────────────────────────────────────────────────
 * assets/contact-form.js POSTs `new FormData(form)` (multipart/form-data) and
 * checks ONLY `res.ok`. Fields on e.parameter:
 *   first, last, email, message, website (honeypot),
 *   tz (browser IANA zone), geo_city, geo_region, geo_country (best-effort,
 *   may be empty when the client-side IP lookup is blocked/times out).
 *   - A 200 (any ContentService text output) reads as success.
 *   - Any non-2xx (e.g. an uncaught throw → 500) reads as failure and the form
 *     shows its retry message and stays intact.
 * Dependency-free; plain text via ContentService (never HtmlService).
 */

/** Recipient of the notification email. */
var NOTIFY_TO = 'contact@threeflows.com';

/** Tab that stores submissions, and its header row (labels exactly as below —
 *  the first column is just "timestamp", with no timezone annotation). */
var SHEET_NAME = 'Submissions';
var HEADER = ['timestamp', 'first', 'last', 'email', 'message',
              'tz', 'geo_city', 'geo_region', 'geo_country'];

/**
 * Plain-text 200 success response. The frontend only checks res.ok, so the body
 * text is informational. Bots and humans get the identical response.
 */
function ok_() {
  return ContentService
    .createTextOutput('OK')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * Append the submission to the Submissions tab, creating the tab (with a header
 * row) on first use. Throws if the write fails — the caller uses that to decide
 * whether the submission was actually saved. `ts` is the pre-formatted
 * (America/New_York, minute precision) timestamp string.
 */
function saveRow_(ts, first, last, email, message, tz, geoCity, geoRegion, geoCountry) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
  }
  sheet.appendRow([ts, first, last, email, message, tz, geoCity, geoRegion, geoCountry]);
}

/**
 * Notify the inbox, with replyTo set to the submitter so a reply goes straight
 * back to them. Kept separate so an email failure AFTER the row is saved does
 * not fail the whole request (the submission is already safe in the Sheet).
 * The timestamp line carries the value only — no timezone text.
 */
function notify_(ts, first, last, email, message, tz, geoCity, geoRegion, geoCountry) {
  var body =
    'New contact form submission:\n\n' +
    'Timestamp:   ' + ts + '\n' +
    'First:       ' + first + '\n' +
    'Last:        ' + last + '\n' +
    'Email:       ' + email + '\n' +
    'Message:     ' + message + '\n\n' +
    'Browser tz:  ' + tz + '\n' +
    'Geo city:    ' + geoCity + '\n' +
    'Geo region:  ' + geoRegion + '\n' +
    'Geo country: ' + geoCountry + '\n';

  var options = { replyTo: email, name: 'Three Flows Solutions website' };
  MailApp.sendEmail(NOTIFY_TO, 'New contact form submission — ' + first + ' ' + last, body, options);
}

/**
 * Entry point. Handles a form POST.
 *
 * Ordering matters for the success contract:
 *   1. Honeypot first — a filled `website` field is a bot. Return the SAME
 *      success response, but save nothing and email nothing, so the bot gets no
 *      signal it was caught.
 *   2. Save the row. If this throws, the submission is NOT saved → rethrow so
 *      the web app returns a non-200 and the frontend shows its retry message.
 *   3. Email. If this throws, the row is ALREADY saved → swallow the error and
 *      still return success (the submission is not lost; only the notification
 *      failed, which is recoverable from the Sheet).
 */
function doPost(e) {
  var p = (e && e.parameter) ? e.parameter : {};

  var first      = (p.first       || '').trim();
  var last       = (p.last        || '').trim();
  var email      = (p.email       || '').trim();
  var message    = (p.message     || '').trim();
  var website    = (p.website     || '').trim();   // honeypot
  var tz         = (p.tz          || '').trim();
  var geoCity    = (p.geo_city    || '').trim();
  var geoRegion  = (p.geo_region  || '').trim();
  var geoCountry = (p.geo_country || '').trim();

  // 1. Silent honeypot drop — indistinguishable success, no side effects.
  if (website !== '') {
    return ok_();
  }

  // Minute-precision timestamp, computed in America/New_York, UNLABELLED.
  var ts = Utilities.formatDate(new Date(), 'America/New_York', 'yyyy-MM-dd HH:mm');

  // 2. Save. A failure here means nothing was stored → signal failure.
  var saved = false;
  try {
    saveRow_(ts, first, last, email, message, tz, geoCity, geoRegion, geoCountry);
    saved = true;
  } catch (err) {
    // Not saved: rethrow so the platform returns 500 (res.ok === false) and the
    // user is asked to retry rather than being told it worked.
    throw err;
  }

  // 3. Notify. The row is safe; a mail failure must not fail the request.
  try {
    notify_(ts, first, last, email, message, tz, geoCity, geoRegion, geoCountry);
  } catch (mailErr) {
    // Intentionally swallowed — logged for the owner, invisible to the user.
    console.error('Notification email failed (row was saved): ' + mailErr);
  }

  return ok_();
}
