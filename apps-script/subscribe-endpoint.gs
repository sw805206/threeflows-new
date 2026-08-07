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
 * ── STAGES 1 + 2 — WHAT IS BUILT ──────────────────────────────────────────
 * Stage 1 (done): doPost writes rows. Subscribe / re-arm / no-op / re-subscribe.
 * Stage 2 (this): the confirmation mail, the confirm and unsubscribe links, and
 *                 the abuse controls that make sending safe — a per-address
 *                 cooldown, a daily cap that fails closed, and a gated alert.
 * Stage 3 (next): wire assets/subscribe.js to POST here. NOT DONE — the page
 *                 still runs its client-side-only swap and posts nowhere.
 *
 * THIS WILL SEND REAL EMAIL ONCE DEPLOYED. CONFIRM_BODY holds the authored copy,
 * so the fail-closed guard that held during development no longer trips. What
 * stands between a deploy and a live send is only the daily cap, the per-address
 * cooldown and the quota floor. Three manual steps are still required first:
 *   1. Add columns H (confirm_sent_at) and I (manage_sent_at) to the live
 *      Subscribe Sheet. This script will not retrofit a header onto a tab that
 *      already holds rows.
 *   2. Verify principals@threeflows.com as a send-as alias (see below), or mail
 *      goes out as the Sheet's owner instead.
 *   3. Re-authorise — stage 2 needs scopes stage 1 did not.
 *   4. EXEC_URL is already filled in and COMMITTED — it does not need re-entering
 *      after a paste, and must not be replaced with a placeholder. It only
 *      changes if a brand-new deployment is created, which warnIfUrlDrifted_
 *      will report in the log.
 * BOTH mail bodies are now configured, so nothing is held back by a placeholder:
 * a deploy sends confirmations AND manage links for real.
 * (If CONFIRM_BODY is ever reset to a placeholder, bodyReady_() fails closed
 * again: rows are still written, nothing is sent.)
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
 * The honeypot, the server-side validation, the cooldown, the cap and the
 * uniform response are what defend the endpoint — not the access setting.
 *
 * SCOPES: stage 2 adds GmailApp (to send AS an alias), MailApp (quota only),
 * PropertiesService and ScriptApp. The first authorisation prompt after pasting
 * this will therefore ask for more than stage 1 did. That is expected.
 *
 * SEND-AS ALIAS — operational prerequisite.
 * The script runs as the Sheet's owner. To make mail arrive FROM
 * principals@threeflows.com, that address must exist as a verified "Send mail
 * as" alias on the owning Gmail account (Gmail → Settings → Accounts). MailApp
 * cannot set `from` at all; GmailApp can, but ONLY to a verified alias — an
 * unverified one is silently ignored and the mail goes out as the owner. This
 * file checks GmailApp.getAliases() and WARNS in the execution log rather than
 * failing, because a confirmation from the wrong address is still better than
 * no confirmation. Check the log after the first live send.
 *
 * ── REDEPLOY CAVEAT (important) ───────────────────────────────────────────
 * To change this script AFTER go-live WITHOUT breaking the wired URL, edit the
 * code, then Deploy → Manage deployments → (pencil/edit the existing Web app
 * deployment) → Version: New version → Deploy. This keeps the SAME /exec URL.
 * Creating a brand-new deployment instead mints a NEW URL and silently breaks
 * BOTH the form and every confirm/unsubscribe link already sitting in an inbox.
 * After go-live that second consequence is the severe one: those links are
 * permanent and unrecallable.
 *
 * ── THE SHEET ─────────────────────────────────────────────────────────────
 * Tab "Subscribe", row 1 frozen, headers in A–H exactly as HEADER below:
 *   A timestamp | B email | C status | D token | E confirmed_at
 *   F unsubscribed_at | G source_page | H confirm_sent_at | I manage_sent_at
 *   J last_update_id
 * I IS NEW IN DEPLOY A and J IN STAGE 4 — add them to the live Sheet, as H was.
 * It is a SEPARATE clock from H on purpose: a flood of manage requests must not
 * be able to silence a legitimate confirmation re-send, nor the reverse.
 * Read BY NAME, never by index, so re-ordering tabs cannot repoint the writes.
 *
 * A second tab, "Ops", mirrors the send counter and the last cap trip so the
 * state is visible when the Sheet is opened rather than hidden in a properties
 * store that cannot be inspected. It is created on demand.
 *
 * ── FRONTEND CONTRACT (what stage 3 must send) ────────────────────────────
 * Fields, all optional except email:
 *   email        the address (required; validated again here, server-side)
 *   source_page  where the submit came from, e.g. "subscribe.html"
 *   website      HONEYPOT — must be present and EMPTY on a real submit
 * `action` may be omitted, or sent as "subscribe" — both route to the subscribe
 * flow, so the stage-1 contract is unchanged by stage 2's routing.
 * Both encodings are accepted (see readParams_): form-encoded/multipart via
 * e.parameter, or a JSON body via e.postData.contents.
 * RECOMMENDED: `body: new FormData(form)` with NO explicit Content-Type, exactly
 * as assets/contact-form.js already does. That is a CORS "simple request" and
 * needs no preflight. A fetch sending `Content-Type: application/json` triggers
 * a CORS preflight OPTIONS that Apps Script does not answer, so the POST fails
 * in the browser — JSON support here is for curl and for a client that sends
 * `Content-Type: text/plain`, not for a stock JSON fetch.
 * Response: always plain-text 200 "OK" (see ok_ and the uniform-response rule).
 * The frontend checks only res.ok, matching contact-form.js — except the confirm
 * POST, which sends format=json and reads {ok} (see handleConfirmPost_).
 *
 * CONFIRM LINKS POINT AT THE SITE, not at this script: the mail sends people to
 * subscribe.html?confirm=<token>, which POSTs back here. See confirmUrl_.
 */

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

/** Tabs. HEADER matches the frozen row 1 of the live Sheet exactly. */
var SHEET_NAME = 'Subscribe';
var OPS_SHEET_NAME = 'Ops';
var HEADER = ['timestamp', 'email', 'status', 'token', 'confirmed_at',
              'unsubscribed_at', 'source_page', 'confirm_sent_at', 'manage_sent_at',
              'last_update_id'];

/** 1-based column positions, derived from HEADER's order above. Named so a
 *  column move is a one-line change here rather than a hunt for magic numbers. */
var COL_TIMESTAMP       = 1;   // A
var COL_EMAIL           = 2;   // B
var COL_STATUS          = 3;   // C
var COL_TOKEN           = 4;   // D
var COL_CONFIRMED_AT    = 5;   // E
var COL_UNSUBSCRIBED_AT = 6;   // F
var COL_SOURCE_PAGE     = 7;   // G
var COL_CONFIRM_SENT_AT = 8;   // H — stage 2
var COL_MANAGE_SENT_AT  = 9;   // I — deploy A
/* J — stage 4. The id of the most recent UPDATE delivered to this row. It is
   what makes a bulk send resumable: the recipient set for a job is "active rows
   whose last_update_id is not this job's", so re-running after an interruption
   picks up exactly the unsent ones and can never double-send. Written by
   subscribe-updates.gs, which shares this project's global scope. */
var COL_LAST_UPDATE_ID  = 10;  // J — stage 4

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
 * PER-ADDRESS COOLDOWN — 15 minutes, measured from confirm_sent_at.
 *
 * Long enough to cover the case that generates almost every genuine re-submit:
 * "it hasn't arrived yet, let me try again." Someone who has waited a quarter of
 * an hour and still has nothing has a real delivery problem, and re-sending is
 * the right answer for them.
 *
 * It keys off confirm_sent_at (last SEND), NOT timestamp (last SUBMIT). Once a
 * cap-skipped write updates timestamp without sending, those two diverge and
 * timestamp becomes the wrong clock.
 */
var COOLDOWN_MS = 15 * 60 * 1000;

/**
 * DAILY SEND CAP, and the reserve left for everything else.
 *
 * A Workspace account allows on the order of 1,500 recipients/day. The gap
 * between 200 and that ceiling is the point, not the number: the endpoint must
 * never be able to consume the quota principals@ needs for actual business
 * correspondence. 200 is roughly 40x any plausible genuine spike while leaving
 * ~1,300 untouched.
 *
 * QUOTA_RESERVE is an INDEPENDENT floor read from the platform itself. The
 * counter below is fast and precise but can drift; getRemainingDailyQuota is
 * authoritative. If fewer than this many sends remain, refuse regardless of what
 * the counter believes.
 */
var DAILY_SEND_CAP = 200;
var QUOTA_RESERVE = 100;

/** Every "day" boundary in this file is New York's, computed explicitly —
 *  never inherited from the script project's timezone setting. */
var TIMEZONE = 'America/New_York';

/** PropertiesService keys. The counter carries its own date so rollover is
 *  implicit: a stored date that is not today means the count is zero. */
var PROP_COUNTER = 'confirmSendCounter';
var PROP_ALERT_DATE = 'capAlertDate';

/** Where the cap alert goes, and who confirmation mail comes from. */
var ALERT_TO = 'contact@threeflows.com';
var FROM_ADDRESS = 'principals@threeflows.com';
var FROM_NAME = 'Three Flows Solutions';

/**
 * THE DEPLOYED /exec URL — the base for every emailed link.
 *
 * WHY THIS IS A CONSTANT AND NOT JUST ScriptApp.getService().getUrl().
 * getUrl() returns NULL until the script has been deployed as a web app, and
 * string-concatenating null produced mail containing
 * "null?action=confirm&token=..." — a link that looks fine and cannot work.
 * Deploying does populate it, but the dependency is worse than that one failure:
 * getUrl() answers for the CURRENT EXECUTION CONTEXT, so a run started from the
 * editor can hand back the /dev URL, which only works for the script's owner
 * while signed in. That would mint confirmation links that work perfectly for
 * whoever tested them and fail for every actual subscriber — the worst kind of
 * bug, because testing reports success.
 *
 * So the URL is pinned here, deterministically, exactly as
 * assets/contact-form.js pins its own endpoint. getUrl() is kept only as a
 * fallback for the case where this is somehow unset but a deployment exists.
 *
 * IT IS COMMITTED TO THE REPO ON PURPOSE — do not replace it with a placeholder.
 * The value is PUBLIC by necessity: assets/subscribe.js must carry the same URL
 * for the browser to POST to it, and that file is served from threeflows.com. So
 * there is nothing to protect by omitting it here, and a placeholder costs
 * something real — this file is meant to be PASTED into the editor, and a
 * constant that must be re-typed after every paste is a constant that will
 * eventually be forgotten. It nearly was. The endpoint is defended by the
 * honeypot, the validation, the cooldown and the cap, not by this string being
 * hard to find.
 *
 * It does NOT need updating for an ordinary redeploy: Deploy → Manage
 * deployments → New version keeps the same /exec URL. It DOES need updating if a
 * brand-new deployment is ever created — and warnIfUrlDrifted_ below exists to
 * catch exactly that, because a stale pin would otherwise win silently over the
 * live deployment.
 */
var EXEC_URL = 'https://script.google.com/macros/s/AKfycbyXsDKH6u9XG7dNigQtvK0W5CQA3nhTal3aceq2XTnvPBUEGVuM-57A8E5f8wJ83QrZAg/exec';

/** Public site root. Confirm and unsubscribe both hand the visitor back to the
 *  real branded page rather than leaving them on a Google URL. */
var SITE_BASE = 'https://threeflows.com/';
var PAGE_CONFIRMED = SITE_BASE + 'subscribe.html?confirmed=1';
var PAGE_UNSUBSCRIBED = SITE_BASE + 'subscribe.html?unsubscribed=1';
var PAGE_MANAGE = SITE_BASE + 'subscribe.html?manage=1';
/** The branded confirm page. Emailed confirm links point HERE, not at /exec. */
var PAGE_CONFIRM = SITE_BASE + 'subscribe.html?confirm=';

/** Settled copy. */
var CONFIRM_SUBJECT = 'Confirm your subscription to Three Flows updates';

/**
 * THE CONFIRMATION BODY — human-authored, reproduced verbatim.
 *
 * Plain text, sent as-is. {{CONFIRM_URL}} is replaced with the confirm link.
 * Written as an array of lines so the copy stays readable and reviewable in a
 * diff; double quotes throughout because the copy contains apostrophes and
 * escaping them would obscure the words.
 *
 * ONE PARAGRAPH PER LINE, NOT HARD-WRAPPED. Do not re-introduce ~60-character
 * breaks. A hard-wrapped plain-text body gets wrapped AGAIN by the client at its
 * own width, and on a phone that produces a ragged column of half-empty lines.
 * Leaving each paragraph as one long line lets the reader's client wrap it once,
 * to the width it actually has. The blank lines between paragraphs are what
 * carries the structure. The footer's three lines — "—", the company, the
 * address — ARE deliberate breaks and stay as they are.
 *
 * NO UNSUBSCRIBE FOOTER IS APPENDED TO THIS MAIL, deliberately. The recipient is
 * not subscribed yet — a pending row is not a subscription — so there is nothing
 * to unsubscribe from, and offering the option would compete with the copy's own
 * instruction to ignore the email. "Ignore this and you won't be added" IS the
 * opt-out for a double opt-in confirmation, and it is the correct one. The
 * postal address is present because the copy carries it; mailFooter_ below is
 * for the UPDATE mails, which do need an unsubscribe link.
 *
 * If this is ever reset to a placeholder, bodyReady_() fails closed: no mail is
 * sent, the row is still written at pending, exactly as a tripped cap behaves.
 */
var CONFIRM_BODY = [
  "Thanks for subscribing to Three Flows updates.",
  "",
  "Click below to confirm your email address:",
  "",
  "{{CONFIRM_URL}}",
  "",
  "We'll email you when there's something new: blog posts, tools, seminars, and occasional news.",
  "",
  "If you didn't request this, ignore this email — you won't be added, and we won't contact you again.",
  "",
  "—",
  "Three Flows Solutions LLC",
  "7211 Austin St. PMB 168, Forest Hills, NY 11375"
].join('\n');

/**
 * THE MANAGE EMAIL — human-authored, subject and body both settled.
 *
 * Sent when someone uses the manage/cancel form and their address is an ACTIVE
 * subscription. {{UNSUBSCRIBE_URL}} is replaced with their durable one-click
 * link — the same one every update carries, which is exactly what the copy says.
 *
 * THE SUBJECT IS A NEUTRAL NOUN PHRASE ON PURPOSE. "Manage your subscription"
 * would have paralleled the confirmation's subject, and was rejected for a
 * reason worth keeping: anyone can request a manage link for any address, so
 * this mail SOMETIMES ARRIVES UNREQUESTED. An imperative subject reads as an
 * instruction to someone who never asked for it; a noun phrase does not. Do not
 * "fix" it into parallel construction with CONFIRM_SUBJECT.
 *
 * The body's closing line is load-bearing for the same reason, and the harness
 * asserts it by content: "you can ignore it — nothing has changed, and you're
 * still subscribed." It is literally true — a manage request rotates no token
 * and changes no status — and it is what makes an unrequested arrival harmless
 * rather than alarming. It is also why nothing in this flow needs gating behind
 * proof of identity.
 *
 * NO FOOTER IS APPENDED, as with CONFIRM_BODY. The copy carries its own sign-off
 * and postal address, and it already contains the unsubscribe link — appending
 * mailFooter_ would print both twice.
 *
 * If either is ever reset to a placeholder, manageBodyReady_() fails closed:
 * nothing is sent, nothing is stamped. It requires BOTH, because a placeholder
 * subject is just as visible in an inbox as a placeholder body.
 */
var MANAGE_SUBJECT = 'Your Three Flows subscription';

var MANAGE_BODY = [
  "You asked for a link to manage your subscription to Three Flows updates.",
  "",
  "To unsubscribe, click below:",
  "",
  "{{UNSUBSCRIBE_URL}}",
  "",
  "That's the same link that appears at the bottom of every update we send, so you can also cancel from any email in your inbox.",
  "",
  "If you didn't request this, you can ignore it — nothing has changed, and you're still subscribed.",
  "",
  "—",
  "Three Flows Solutions LLC",
  "7211 Austin St. PMB 168, Forest Hills, NY 11375"
].join('\n');

/** Postal address, required in commercial mail and settled as belonging in the
 *  email footer — never on privacy.html. */
var POSTAL_ADDRESS = 'Three Flows Solutions LLC\n' +
                     '7211 Austin St. PMB 168, Forest Hills, NY 11375';

/** Shape of a Utilities.getUuid() token. Tokens arrive from a URL, so they are
 *  UNTRUSTED INPUT: validated against this before being looked up or echoed
 *  into any HTML. */
var TOKEN_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Permissive email SHAPE check — deliberately not RFC 5322.
 *
 * Rejecting a valid address is worse than accepting a typo, because a typo
 * simply never confirms and the row expires at "pending" harmlessly. So this
 * asks only for a local part, an @, and a dotted domain — the same shape
 * assets/contact-form.js checks client-side.
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

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSES
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The ONE response every subscribe caller gets: plain-text 200 "OK".
 *
 * UNIFORM BY DESIGN. A new subscriber, a re-submit, an address already active,
 * a returning unsubscriber, a submit silenced by the cooldown, one dropped by
 * the cap, a bot caught by the honeypot and a malformed address all receive this
 * identical body. Anything that varied by path would turn the endpoint into a
 * membership oracle — POST an address, read the response, learn whether it is on
 * the list. It is not, and must not become one.
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
 * Machine-readable answer for a caller that asked for `format=json`.
 *
 * The HTML paths below cannot tell a browser's fetch() anything: an invalid
 * token returns the invalid-link PAGE with a 200, so `res.ok` is true either
 * way. subscribe.js needs to distinguish those, and this is how. The HTML path
 * is untouched, so the no-JS form submit still gets a real page.
 *
 * It reveals only whether THIS token worked — never anything about an address —
 * so it is not a membership oracle. A token is an unguessable v4 UUID.
 */
function jsonResult_(ok) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: !!ok }))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Escape for interpolation into HTML. Tokens are validated against TOKEN_RE
 *  before they ever reach here, but a value taken from a URL gets both. */
function esc_(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * The confirm/unsubscribe interstitials are DELIBERATELY PLAIN.
 *
 * They are served from script.google.com, live for about two seconds, and exist
 * only to carry the visitor to the real page. Styling them to match the site
 * would mean either duplicating brand tokens here — where nothing keeps them in
 * sync with STYLE.css — or cross-origin loading the live stylesheet and making
 * the click depend on it. The branded experience is subscribe.html, which is
 * where every path below lands.
 */
function page_(title, bodyHtml) {
  var html =
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc_(title) + '</title></head>' +
    '<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;' +
    'max-width:34em;margin:3em auto;padding:0 1.25em">' + bodyHtml + '</body></html>';
  return HtmlService.createHtmlOutput(html);
}

/**
 * Hand the visitor to a real site page.
 *
 * Three mechanisms, deliberately: a JS hop out of the HtmlService sandbox iframe
 * (window.top, or the address bar keeps showing Google), a meta refresh for when
 * scripts are blocked, and a visible link for when both fail. A redirect that
 * silently strands someone mid-confirmation is the failure worth spending nine
 * lines to avoid.
 */
function redirect_(url, label) {
  var safe = esc_(url);
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta http-equiv="refresh" content="0;url=' + safe + '">' +
    '<title>' + esc_(label) + '</title></head>' +
    '<body style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;' +
    'max-width:34em;margin:3em auto;padding:0 1.25em">' +
    '<p>' + esc_(label) + '</p>' +
    '<p><a href="' + safe + '">Continue to threeflows.com</a></p>' +
    '<script>window.top.location.href=' + JSON.stringify(url) + ';</script>' +
    '</body></html>'
  );
}

/** The one answer to every bad, stale or already-spent link. Identical for a
 *  malformed token, an unknown token and a token whose row has moved on, so the
 *  page cannot be used to probe which tokens exist. Points at the manage page,
 *  which exists precisely as this fallback. */
function invalidLinkPage_() {
  return page_('Link no longer valid',
    '<h1 style="font-size:1.3em">This link is no longer valid</h1>' +
    '<p>It may have already been used, or replaced by a newer email.</p>' +
    '<p><a href="' + esc_(PAGE_MANAGE) + '">Manage or cancel your subscription</a></p>');
}

/* ═══════════════════════════════════════════════════════════════════════════
   INPUT
   ═══════════════════════════════════════════════════════════════════════════ */

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

/** Today, in New York, as yyyy-MM-dd. The single definition of "day" here. */
function today_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

/* ═══════════════════════════════════════════════════════════════════════════
   SHEET ACCESS
   ═══════════════════════════════════════════════════════════════════════════ */

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
 * NOTE it does NOT retrofit column H onto a tab that already has rows — adding
 * the stage-2 header to the live Sheet is a manual step, called out at the top.
 * Silently rewriting a populated header row is the kind of "help" that destroys
 * data.
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

/** The Ops tab, created on demand. Label/value pairs, so a new metric is a new
 *  row rather than a schema change. */
function getOpsSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(OPS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(OPS_SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['metric', 'value']);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Upsert a metric on the Ops tab. Mirrors state that otherwise lives only in
 *  PropertiesService, which cannot be inspected by opening the Sheet. */
function setOpsMetric_(name, value) {
  try {
    var sheet = getOpsSheet_();
    var last = sheet.getLastRow();
    if (last >= 2) {
      var labels = sheet.getRange(2, 1, last - 1, 1).getValues();
      for (var i = 0; i < labels.length; i++) {
        if (str_(labels[i][0]) === name) {
          sheet.getRange(i + 2, 2).setValue(value);
          return;
        }
      }
    }
    sheet.appendRow([name, value]);
  } catch (opsErr) {
    // Ops mirroring is observability, never correctness. A failure here must
    // not fail a subscribe or lose a confirmation.
    console.warn('Ops mirror failed for "' + name + '": ' + opsErr);
  }
}

/**
 * Find the 1-based row for an email, comparing trimmed + lowercased against
 * column B. Returns row 0 when absent.
 *
 * Reads A:H in ONE getValues call rather than per-row reads — a per-row loop
 * over a growing list is the classic Apps Script timeout. Status, token and
 * confirm_sent_at travel back with the match so the caller needs no second read.
 */
function findRow_(sheet, emailKey) {
  var miss = { row: 0, status: '', token: '', email: '', confirmSentAt: '', manageSentAt: '' };
  var last = sheet.getLastRow();
  if (last < 2 || emailKey === '') return miss;

  var values = sheet.getRange(2, 1, last - 1, HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (normEmail_(values[i][COL_EMAIL - 1]) === emailKey) {
      return {
        row: i + 2,
        status: normEmail_(values[i][COL_STATUS - 1]),
        token: str_(values[i][COL_TOKEN - 1]),
        email: str_(values[i][COL_EMAIL - 1]),
        confirmSentAt: values[i][COL_CONFIRM_SENT_AT - 1],
        manageSentAt: values[i][COL_MANAGE_SENT_AT - 1]
      };
    }
  }
  return miss;
}

/**
 * Find the 1-based row holding a token. Exact, case-sensitive match on a UUID.
 * Callers MUST have validated the token against TOKEN_RE first — this does not
 * re-check, and an empty token must never match an empty cell.
 */
function findRowByToken_(sheet, token) {
  var miss = { row: 0, status: '', email: '' };
  var last = sheet.getLastRow();
  if (last < 2 || token === '') return miss;

  var values = sheet.getRange(2, 1, last - 1, HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    if (str_(values[i][COL_TOKEN - 1]) === token) {
      return {
        row: i + 2,
        status: normEmail_(values[i][COL_STATUS - 1]),
        email: str_(values[i][COL_EMAIL - 1])
      };
    }
  }
  return miss;
}

/* ═══════════════════════════════════════════════════════════════════════════
   SEND BUDGET — counter, cap, quota floor, alert
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Read today's send count.
 *
 * The stored value carries its own date, so ROLLOVER IS IMPLICIT: a date that is
 * not today reads as zero, and no scheduled trigger is needed to reset anything.
 * A corrupt or absent value also reads as zero — the sheet's confirm_sent_at
 * column is the auditable record, and a recount from it repairs any drift.
 */
function counterRead_() {
  try {
    var raw = PropertiesService.getScriptProperties().getProperty(PROP_COUNTER);
    if (raw) {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.date === today_() && typeof parsed.count === 'number') {
        return parsed.count;
      }
    }
  } catch (err) {
    console.warn('Send counter unreadable, treating as 0: ' + err);
  }
  return 0;
}

/**
 * Increment today's count and mirror it to Ops.
 *
 * PropertiesService IS NOT TRANSACTIONAL — two concurrent executions can both
 * read 41 and both write 42. This is only ever called from inside the script
 * lock the subscribe flow already holds, which is what makes it safe. Do not
 * call it from an unlocked path.
 */
function counterIncrement_() {
  var next = counterRead_() + 1;
  var day = today_();
  PropertiesService.getScriptProperties()
    .setProperty(PROP_COUNTER, JSON.stringify({ date: day, count: next }));
  setOpsMetric_('confirm_sends_today', next);
  setOpsMetric_('counter_date', day);
  return next;
}

/** Is the confirmation copy filled in? While it is not, sending is refused —
 *  see CONFIRM_BODY. */
function bodyReady_() {
  return CONFIRM_BODY && CONFIRM_BODY.indexOf('__') !== 0;
}

/** Same guard for the manage mail — see MANAGE_BODY. Both the subject and the
 *  body must be real, because a placeholder subject is just as visible. */
function manageBodyReady_() {
  return MANAGE_BODY && MANAGE_BODY.indexOf('__') !== 0 &&
         MANAGE_SUBJECT && MANAGE_SUBJECT.indexOf('__') !== 0;
}

/**
 * May a confirmation be sent right now? Returns a reason string, or '' to allow.
 *
 * Four independent gates, cheapest first. `kind` is 'confirm' or 'manage' and
 * selects which body must be configured; the cap and the quota floor are shared,
 * because both kinds draw on the same daily budget.
 *   0. No usable link base → refuse. Every mail here carries a tokenised link,
 *      so without one there is nothing worth sending.
 *   1. The copy is not written yet → refuse (fail closed on a half-built deploy).
 *   2. Our own counter has reached DAILY_SEND_CAP.
 *   3. The platform's own remaining quota is below QUOTA_RESERVE. This catches
 *      counter drift AND protects the quota that ordinary business mail from
 *      this account needs — the counter knows nothing about mail sent by hand.
 */
function sendBlockedReason_(kind) {
  warnIfUrlDrifted_();
  if (!linkBaseReady_()) {
    return 'web app URL unknown — set EXEC_URL, or deploy as a web app';
  }
  if (kind === 'manage') {
    if (!manageBodyReady_()) return 'manage body not configured';
  } else if (!bodyReady_()) {
    return 'confirmation body not configured';
  }
  if (counterRead_() >= DAILY_SEND_CAP) return 'daily cap of ' + DAILY_SEND_CAP + ' reached';
  try {
    var remaining = MailApp.getRemainingDailyQuota();
    setOpsMetric_('remaining_gmail_quota', remaining);
    if (remaining < QUOTA_RESERVE) {
      return 'platform quota below reserve (' + remaining + ' < ' + QUOTA_RESERVE + ')';
    }
  } catch (quotaErr) {
    // Quota unreadable: allow, and let the cap and the send itself be the guard.
    console.warn('Quota check failed, proceeding on the counter alone: ' + quotaErr);
  }
  return '';
}

/**
 * Tell the owner the cap tripped — ONCE per day.
 *
 * The gating is not a nicety. The cap tripping means requests are arriving in
 * volume; an ungated alert would become its own flood, mailbombing the owner
 * with warnings about mailbombing.
 *
 * Note the circularity this sits inside: the alert is itself an email, sent at
 * the exact moment the endpoint is trying to stop sending email. That is why
 * DAILY_SEND_CAP (200) sits so far below the platform's ~1,500 — the gap is what
 * guarantees the alert can still get out. Apps Script's own failure
 * notifications will never cover this: they fire on execution FAILURES, and a
 * tripped cap is a successful execution that chose not to send.
 */
function alertCapTripped_(reason, pendingEmail) {
  var day = today_();
  var props = PropertiesService.getScriptProperties();

  setOpsMetric_('last_cap_trip', new Date());
  setOpsMetric_('last_cap_trip_reason', reason);

  if (props.getProperty(PROP_ALERT_DATE) === day) return;   // already alerted today

  var body =
    'The subscribe endpoint stopped sending confirmation emails.\n\n' +
    'Reason:      ' + reason + '\n' +
    'Date:        ' + day + ' (' + TIMEZONE + ')\n' +
    'Sends today: ' + counterRead_() + ' of ' + DAILY_SEND_CAP + '\n\n' +
    'Subscribers are STILL BEING RECORDED — rows are written at status\n' +
    '"pending" with an empty confirm_sent_at. Nothing is being lost; those\n' +
    'people simply have not been mailed yet.\n\n' +
    'To find them: filter the Subscribe tab for status "pending" and an empty\n' +
    'confirm_sent_at. That is exactly the set awaiting a confirmation.\n\n' +
    'This alert is sent at most once per day.\n';

  try {
    MailApp.sendEmail(ALERT_TO, 'Subscribe endpoint: sending halted (' + reason + ')', body);
    props.setProperty(PROP_ALERT_DATE, day);
    setOpsMetric_('last_alert_sent', day);
  } catch (mailErr) {
    // If even the alert cannot go out, the log is the last channel left.
    console.error('CAP ALERT FAILED (' + reason + '), pending address count unaffected: ' + mailErr);
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   OUTBOUND MAIL
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The deployed /exec URL, or '' when it cannot be determined.
 *
 * Returns a STRING ALWAYS — never null — so no caller can concatenate the word
 * "null" into a link. '' is the honest "unknown", and linkBaseReady_() below is
 * what stops an unknown base ever reaching an email.
 */
function execUrl_() {
  if (EXEC_URL && EXEC_URL.indexOf('__') !== 0) return EXEC_URL;
  var fromService = null;
  try {
    fromService = ScriptApp.getService().getUrl();
  } catch (urlErr) {
    console.warn('ScriptApp.getService().getUrl() threw: ' + urlErr);
  }
  return fromService || '';
}

/**
 * Can a usable link be built at all?
 *
 * Gates SENDING, not just link-building — see sendBlockedReason_. A mail whose
 * link cannot work is worse than no mail: the recipient cannot act, the send is
 * spent against the daily cap, confirm_sent_at is stamped so the row LOOKS
 * mailed, and the 15-minute cooldown then silences their retry. One missing
 * deployment compounds into a subscriber who is stuck and invisible. Fail closed
 * instead, exactly as an unwritten mail body does.
 */
function linkBaseReady_() {
  return execUrl_() !== '';
}

/**
 * Warn when the PINNED URL disagrees with the deployment actually running.
 *
 * This is the one hazard the pin introduces. execUrl_ prefers EXEC_URL, which is
 * what makes links immune to the /dev-vs-/exec execution-context problem — but
 * it also means that if someone ever creates a BRAND-NEW deployment, the stale
 * pin keeps winning and every emailed link points at the old one. Silently.
 *
 * getUrl() is only trusted here as a COMPARISON, never as the value: it can
 * legitimately differ by returning /dev when run from the editor, so a mismatch
 * is reported as something to check rather than treated as an error. Called on
 * every send, which costs nothing and means the log names the problem the first
 * time a link goes out wrong.
 */
function warnIfUrlDrifted_() {
  if (!EXEC_URL || EXEC_URL.indexOf('__') === 0) return;
  var live = null;
  try {
    live = ScriptApp.getService().getUrl();
  } catch (urlErr) {
    return;
  }
  if (live && live !== EXEC_URL && live.indexOf('/dev') === -1) {
    console.warn('EXEC_URL does not match the running deployment.\n' +
                 '  pinned: ' + EXEC_URL + '\n' +
                 '  live:   ' + live + '\n' +
                 'If a NEW deployment was created, every emailed link still points at the ' +
                 'pinned URL. Update EXEC_URL, or redeploy with Manage deployments → New version.');
  }
}

/**
 * The emailed confirm link — points at the SITE, not at /exec.
 *
 * WHY, and it is not mainly about branding. A mail from
 * principals@threeflows.com whose only link resolves to script.google.com is a
 * PHISHING SHAPE: mismatched sender and link domains are a real spam-filter
 * signal and a real reader-trust signal, and this domain has just had SPF, DKIM
 * and DMARC aligned — a Google link partly undoes that. The confirmation is also
 * the FIRST mail anyone receives, sent to someone with no established
 * relationship, so it is the message least able to survive looking wrong.
 * After this change it carries exactly one link, on our own domain.
 *
 * The cost is a no-JS confirm path: subscribe.html is static and cannot read the
 * token out of the URL without a script. That was weighed and accepted, because
 * a visitor without JS cannot subscribe in the first place — the subscribe form
 * is JS-only too — so the population that could need it is people who subscribed
 * with scripts on and confirmed with them off. Close to nobody. If evidence ever
 * appears, adding a second fallback link to the copy is a small change; nothing
 * here forecloses it.
 *
 * doGet's confirm branch is DELIBERATELY KEPT. Links sent before this change are
 * permanent and unrecallable, and they still resolve there.
 */
function confirmUrl_(token) {
  return PAGE_CONFIRM + encodeURIComponent(token);
}

/**
 * The unsubscribe link — STAYS on /exec, deliberately asymmetric with confirm.
 *
 * It has to work with no JavaScript. privacy.html publicly promises "a one-click
 * unsubscribe link at the bottom" of every update, and the site cannot read a
 * token from the URL without a script — so moving it here would turn one click
 * into a silent no-op for anyone with scripts off, in the one flow where failure
 * produces spam complaints rather than a shrug.
 *
 * That leaves a script.google.com URL in the manage mail and in future updates,
 * which the confirm reasoning above argues against. Accepted, and the split is
 * where the argument is strongest: the CONFIRMATION goes to someone with no
 * relationship yet and now carries only our own domain, while these go to people
 * who have already confirmed. Trust is cheapest to lose at first contact.
 */
function unsubscribeUrl_(token) {
  return execUrl_() + '?action=unsubscribe&token=' + encodeURIComponent(token);
}

/**
 * The footer every UPDATE email carries. NOT USED BY STAGE 2 — nothing calls it
 * yet, and that is correct: the only mail stage 2 sends is the confirmation,
 * which deliberately carries no unsubscribe link (see CONFIRM_BODY).
 *
 * It is defined now, and exercised directly by the test harness so it is not
 * untested dead code, because the alternative is that the first update mail
 * invents a second version of the footer and the two drift.
 *
 * The postal address appears here and in CONFIRM_BODY — the two places mail goes
 * out from — and NOWHERE on the site. That is settled: commercial mail is
 * required to carry a physical mailing address; privacy.html is not, and putting
 * it there was decided against.
 *
 * The unsubscribe URL is one-click by design — see doGet.
 */
function mailFooter_(token) {
  return '\n\n--\n' +
         'Unsubscribe: ' + unsubscribeUrl_(token) + '\n\n' +
         POSTAL_ADDRESS + '\n';
}

/**
 * Send the confirmation. Throws on failure so the caller can decide whether the
 * row write still stands (it does — see subscribe_).
 *
 * GmailApp, not MailApp, because only GmailApp can set `from`, and only to a
 * VERIFIED send-as alias. An unverified alias is ignored silently and the mail
 * goes out as the account owner, so the alias is checked and warned about rather
 * than enforced: a confirmation from the wrong address still gets the subscriber
 * subscribed, whereas refusing to send loses them.
 */
function sendConfirmation_(email, token) {
  // The body is sent EXACTLY as authored, with only {{CONFIRM_URL}} filled in.
  // No footer is appended — see CONFIRM_BODY for why a confirmation carries no
  // unsubscribe link, and note the copy supplies its own sign-off and address.
  var body = CONFIRM_BODY.split('{{CONFIRM_URL}}').join(confirmUrl_(token));

  GmailApp.sendEmail(email, CONFIRM_SUBJECT, body, fromOptions_());
}

/**
 * The `from` options every outbound mail uses. Factored out so the confirmation
 * and the manage link cannot drift into two different senders.
 *
 * The alias is checked and WARNED about rather than enforced: an unverified
 * alias is silently ignored by Gmail and the mail goes out as the account owner,
 * which is wrong but harmless — whereas refusing to send loses the subscriber.
 */
function fromOptions_() {
  var options = { name: FROM_NAME };
  try {
    var aliases = GmailApp.getAliases();
    if (aliases && aliases.indexOf(FROM_ADDRESS) !== -1) {
      options.from = FROM_ADDRESS;
    } else {
      console.warn('"' + FROM_ADDRESS + '" is not a verified send-as alias on this ' +
                   'account — sending as the owner instead. Add it in Gmail → ' +
                   'Settings → Accounts to fix.');
    }
  } catch (aliasErr) {
    console.warn('Could not read send-as aliases, sending as the owner: ' + aliasErr);
  }
  return options;
}

/**
 * Send the manage/cancel link. Throws on failure so the caller can decide.
 * {{UNSUBSCRIBE_URL}} becomes the row's DURABLE unsubscribe token — the same
 * link every update mail carries, not a new one — so this adds no extra
 * credential to keep track of.
 */
function sendManageLink_(email, token) {
  var body = MANAGE_BODY.split('{{UNSUBSCRIBE_URL}}').join(unsubscribeUrl_(token));
  GmailApp.sendEmail(email, MANAGE_SUBJECT, body, fromOptions_());
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBSCRIBE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The subscribe state machine, run INSIDE the lock. Returns a short string
 * naming the path taken — for the execution log only; the caller's response
 * never varies.
 *
 * Paths:
 *   absent        → append a pending row with a fresh token, then send
 *   pending       → re-arm: new token, new timestamp, then send
 *   active        → NOTHING. No write, no timestamp touch. Already subscribed.
 *   unsubscribed  → treat as a fresh subscribe: new token, status back to
 *                   pending, unsubscribed_at AND confirmed_at cleared, then send
 *   anything else → NOTHING, and warn
 *
 * THE COOLDOWN GATES RE-ARM AND SEND AS ONE UNIT. Inside the window nothing at
 * all happens: no new token, no timestamp write, no send. Re-arming while
 * skipping the send would invalidate the token in the email the person already
 * has, leaving them clicking a dead link — strictly worse than doing nothing.
 * A brand-new address has never been sent to, so no cooldown can apply to it.
 * The unsubscribed → pending transition is EXEMPT — see the note at the check
 * itself for why that opens no mailbombing vector.
 *
 * confirmed_at IS cleared on the unsubscribed → pending path, so that status is
 * the single answer to where someone is: a pending row never carries a
 * confirmation date. The cost is that the previous consent timestamp is lost at
 * that moment; it is accepted because the NEW subscription's proof of consent is
 * the new confirmed_at, written when they confirm again. (confirmed_at is NOT
 * cleared on active → unsubscribed — there, confirmed_at and unsubscribed_at
 * together are the audit trail showing consent existed and when it ended.)
 *
 * An unrecognised status is most likely a hand-added suppression ("bounced",
 * "complained", "do not mail"), and re-arming it would mail someone who was
 * deliberately taken off. Doing nothing can strand a legitimate subscriber,
 * which is recoverable by hand; mailing a suppressed address is not.
 */
function subscribe_(sheet, email, emailKey, sourcePage) {
  var found = findRow_(sheet, emailKey);
  var now = new Date();
  var row;

  if (found.row === 0) {
    sheet.appendRow([now, email, STATUS_PENDING, Utilities.getUuid(), '', '', sourcePage, '']);
    row = sheet.getLastRow();
    return dispatchConfirmation_(sheet, row, email, 'appended');
  }

  if (found.status === STATUS_ACTIVE) {
    return 'noop-active';
  }

  if (found.status !== STATUS_PENDING && found.status !== STATUS_UNSUBSCRIBED) {
    console.warn('Row ' + found.row + ' has unrecognised status "' + found.status +
                 '" — left untouched. Resolve by hand if this address should be able to subscribe.');
    return 'noop-unknown-status';
  }

  // Cooldown: re-arm and send are one unit, so skip BOTH or neither.
  //
  // EXEMPT: unsubscribed → pending. Do NOT "fix" this back to a blanket check.
  // Reaching "unsubscribed" requires clicking a tokenised link, which proves
  // control of the mailbox — an attacker POSTing someone else's address can only
  // ever drive it to pending, never to unsubscribed. So this transition cannot
  // be used to mailbomb anyone, and the cooldown buys nothing here while costing
  // something real: without the exemption, an accidental unsubscribe followed by
  // an immediate re-subscribe is silently stalled for 15 minutes, and the person
  // is left staring at "Check your inbox" with no email coming.
  //
  // The exemption is deliberately NARROW. pending → pending is still gated (that
  // IS the attacker-reachable path), and a re-submit straight after this
  // re-subscribe lands on the pending path and is gated normally.
  var lastSent = found.confirmSentAt;
  if (found.status !== STATUS_UNSUBSCRIBED &&
      lastSent instanceof Date && (now.getTime() - lastSent.getTime()) < COOLDOWN_MS) {
    return 'noop-cooldown';
  }

  row = found.row;
  sheet.getRange(row, COL_TIMESTAMP).setValue(now);
  sheet.getRange(row, COL_TOKEN).setValue(Utilities.getUuid());
  if (found.status === STATUS_UNSUBSCRIBED) {
    sheet.getRange(row, COL_STATUS).setValue(STATUS_PENDING);
    sheet.getRange(row, COL_UNSUBSCRIBED_AT).setValue('');
    sheet.getRange(row, COL_CONFIRMED_AT).setValue('');
  }
  return dispatchConfirmation_(sheet, row, email,
                               found.status === STATUS_UNSUBSCRIBED ? 'resubscribed' : 're-armed-pending');
}

/**
 * Send the confirmation for a row that has just been written, or decline to.
 *
 * FAILS CLOSED, AND THE ROW SURVIVES EITHER WAY. When the budget refuses, the
 * subscriber is already recorded at pending with an empty confirm_sent_at —
 * which is precisely the marker that makes a later backfill possible, and the
 * reason column H exists at all. Losing an email is recoverable; losing a
 * subscriber is not.
 *
 * confirm_sent_at is stamped only AFTER the send succeeds, so it always means
 * "we actually mailed this person", never "we meant to".
 */
function dispatchConfirmation_(sheet, row, email, outcome) {
  var blocked = sendBlockedReason_('confirm');
  if (blocked) {
    console.warn('Confirmation NOT sent (' + blocked + '). Row ' + row +
                 ' stands at pending with an empty confirm_sent_at.');
    alertCapTripped_(blocked, email);
    return outcome + '+no-send(' + blocked + ')';
  }

  try {
    var token = str_(sheet.getRange(row, COL_TOKEN).getValue());
    sendConfirmation_(email, token);
  } catch (mailErr) {
    // The row is already safe. A send failure must not fail the request, or the
    // visitor would be told to retry and would re-arm the token pointlessly.
    console.error('Confirmation send failed for row ' + row + ' (row kept): ' + mailErr);
    return outcome + '+send-failed';
  }

  sheet.getRange(row, COL_CONFIRM_SENT_AT).setValue(new Date());
  counterIncrement_();
  return outcome + '+sent';
}

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIRM  and  UNSUBSCRIBE
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * TOKEN SEMANTICS — read before changing any of this.
 *
 * There is ONE token per row, and it is ROTATED at every transition that mints a
 * new invitation. It is not a single-use nonce, because the two links it serves
 * have opposite lifetimes:
 *
 *   CONFIRM is effectively single-use, enforced by STATE rather than by burning
 *   the token: confirming moves the row to active and rotates the token, so the
 *   link in that email stops matching anything. A second click lands on the
 *   invalid-link page.
 *
 *   UNSUBSCRIBE MUST LAST FOREVER. Its link goes in every update email, and
 *   those sit in inboxes for years. A token burned on first use would turn every
 *   archived email's unsubscribe link into a dead end — the exact failure that
 *   makes people mark mail as spam instead. So unsubscribing does NOT rotate the
 *   token, and repeat clicks are idempotent.
 *
 * The token minted AT CONFIRM is therefore the durable unsubscribe token, and it
 * survives until the address re-subscribes (which mints a fresh one and retires
 * the old links along with it).
 *
 * Guessing a token is not a practical attack: it is a v4 UUID. And every failure
 * mode — malformed, unknown, wrong state — returns the SAME invalid-link page,
 * so the endpoint cannot be used to probe which tokens exist.
 */

/**
 * Confirm, reached only from the POST of the button on the interstitial.
 *
 * NEVER wire this to a GET. Mail scanners — Outlook Safe Links, corporate
 * filters, some mobile clients — prefetch every URL in a message before the
 * human sees it. A GET that flipped pending → active would fire without anyone
 * clicking, manufacturing "confirmed" subscribers who never consented and
 * hollowing out the double opt-in that privacy.html publicly claims. The button
 * is what makes the consent real.
 *
 * confirmed_at is stamped fresh on every confirmation, including a
 * re-subscribe's. It always means "when the CURRENT active state began" — the
 * unsubscribed → pending path having already cleared the previous value.
 */
function confirm_(sheet, token) {
  var found = findRowByToken_(sheet, token);
  if (found.row === 0) return { ok: false, reason: 'unknown-token' };

  if (found.status === STATUS_ACTIVE) {
    // Already confirmed. Idempotent: send them to the same page a first
    // confirmation reaches, rather than an error they cannot act on.
    return { ok: true, reason: 'already-active' };
  }
  if (found.status !== STATUS_PENDING) {
    return { ok: false, reason: 'not-pending(' + found.status + ')' };
  }

  sheet.getRange(found.row, COL_STATUS).setValue(STATUS_ACTIVE);
  sheet.getRange(found.row, COL_CONFIRMED_AT).setValue(new Date());
  sheet.getRange(found.row, COL_UNSUBSCRIBED_AT).setValue('');
  // Rotate: this new token is the DURABLE unsubscribe token from here on, and
  // rotating retires the confirm link that was just spent.
  sheet.getRange(found.row, COL_TOKEN).setValue(Utilities.getUuid());
  return { ok: true, reason: 'confirmed' };
}

/**
 * Unsubscribe, reached by a one-click GET.
 *
 * One-click is deliberate and asymmetric with confirm. Prefetch here is harmless
 * in direction — an accidental unsubscribe is an annoyance, not a manufactured
 * consent — and privacy.html promises "a one-click unsubscribe link at the
 * bottom" of every update. Adding a confirmation step would break that promise
 * and add friction exactly where friction produces spam complaints.
 *
 * The token is NOT rotated, so every archived email's link keeps working and
 * repeat clicks are idempotent.
 */
function unsubscribe_(sheet, token) {
  var found = findRowByToken_(sheet, token);
  if (found.row === 0) return { ok: false, reason: 'unknown-token' };

  if (found.status === STATUS_UNSUBSCRIBED) {
    return { ok: true, reason: 'already-unsubscribed' };
  }

  sheet.getRange(found.row, COL_STATUS).setValue(STATUS_UNSUBSCRIBED);
  sheet.getRange(found.row, COL_UNSUBSCRIBED_AT).setValue(new Date());
  // confirmed_at is deliberately KEPT: with unsubscribed_at it is the audit
  // trail showing consent existed and when it ended.
  return { ok: true, reason: 'unsubscribed' };
}

/* ═══════════════════════════════════════════════════════════════════════════
   MANAGE — mail someone their own unsubscribe link
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The self-serve fallback for someone who no longer has an update email to
 * unsubscribe from. privacy.html points at subscribe.html?manage=1 publicly, so
 * this is a promise already made in a live policy document, not an extra.
 *
 * ONLY an ACTIVE row gets mail. Anything else — no such address, still pending,
 * already unsubscribed, an unrecognised status — does nothing at all. There is
 * nothing to cancel in any of those cases, and inventing a mail for them would
 * mean writing to people who never completed a subscription.
 *
 * UNIFORM OUTCOME REGARDLESS. The caller's response never varies (see ok_), so
 * this cannot be used to ask "is this address on the list?" — and note the mail
 * only ever goes TO the address entered, so even the send itself tells a prober
 * nothing they could observe.
 *
 * ITS OWN COOLDOWN, ON ITS OWN COLUMN. This path IS attacker-reachable: anyone
 * can POST any address here, unlike the unsubscribed → pending transition, which
 * requires having clicked a tokenised link. So it gets no exemption. The clock is
 * COL_MANAGE_SENT_AT rather than the confirmation's, so a flood of manage
 * requests cannot silence a legitimate confirmation re-send, nor the reverse.
 *
 * The link sent is the row's DURABLE unsubscribe token — the same one every
 * update mail carries. The token is NOT rotated, so this adds no new credential
 * and does not invalidate anything already in the person's inbox.
 */
function manageLink_(sheet, email, emailKey) {
  var found = findRow_(sheet, emailKey);
  var now = new Date();

  if (found.row === 0) return 'noop-not-found';
  if (found.status !== STATUS_ACTIVE) return 'noop-not-active(' + found.status + ')';

  var lastSent = found.manageSentAt;
  if (lastSent instanceof Date && (now.getTime() - lastSent.getTime()) < COOLDOWN_MS) {
    return 'noop-cooldown';
  }

  var blocked = sendBlockedReason_('manage');
  if (blocked) {
    console.warn('Manage link NOT sent (' + blocked + ') for row ' + found.row + '.');
    alertCapTripped_(blocked, email);
    return 'no-send(' + blocked + ')';
  }

  try {
    /* Mail the STORED address, not the typed one: they match case-insensitively
       by definition, and the stored value is the one the subscriber confirmed. */
    sendManageLink_(found.email || email, found.token);
  } catch (mailErr) {
    console.error('Manage link send failed for row ' + found.row + ': ' + mailErr);
    return 'send-failed';
  }

  sheet.getRange(found.row, COL_MANAGE_SENT_AT).setValue(new Date());
  counterIncrement_();
  return 'sent';
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENTRY POINTS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * GET routing — the two emailed links, and nothing else.
 *
 *   ?action=confirm&token=…      → the interstitial: a BUTTON that POSTs.
 *                                  LEGACY PATH since deploy B — new confirm
 *                                  links point at subscribe.html — but kept
 *                                  because links already sent are permanent.
 *                                  Renders only; changes nothing. Safe to
 *                                  prefetch, which is the entire point.
 *   ?action=unsubscribe&token=…  → unsubscribes immediately, then redirects.
 *   anything else                → the invalid-link page.
 *
 * The confirm branch takes no lock because it performs no write.
 */
function doGet(e) {
  var p = (e && e.parameter) ? e.parameter : {};
  var action = str_(p.action).toLowerCase();
  var token = str_(p.token);

  if (!TOKEN_RE.test(token)) return invalidLinkPage_();

  if (action === 'confirm') {
    return page_('Confirm your subscription',
      '<h1 style="font-size:1.3em">Confirm your subscription</h1>' +
      '<p>Click the button below to start receiving Three Flows updates.</p>' +
      /* target="_top" IS LOAD-BEARING — without it this form does not work at
         all, for anyone.

         HtmlService renders this page inside a sandboxed iframe served from
         googleusercontent.com. A form submit is a NAVIGATION, and its default
         target is the frame it sits in — so the POST tried to load
         script.google.com/macros/s/.../exec INSIDE that iframe. Google serves
         /exec with framing denied, and the browser answered
         "script.google.com refused to connect". It looked like a Workspace URL
         rewrite; it was not, and it failed identically in incognito.

         _top navigates the WHOLE TAB instead, so the response loads as a
         top-level document with nothing to frame. This is the documented way out
         of the HtmlService sandbox.

         setXFrameOptionsMode is NOT the fix and does not help here: it governs
         whether OUR output may be embedded by others, not whether Google's /exec
         response consents to being framed.

         An EMPTY action posts back to the current URL, which IS the /exec being
         viewed — so omitting it is more robust than emitting a base we may not
         know. Never interpolate a possibly-empty base here. */
      '<form method="post" target="_top"' + (execUrl_() ? ' action="' + esc_(execUrl_()) + '"' : '') + '>' +
      '<input type="hidden" name="action" value="confirm">' +
      '<input type="hidden" name="token" value="' + esc_(token) + '">' +
      '<button type="submit" style="font:inherit;padding:.7em 1.4em;border:0;' +
      'background:#B2231C;color:#fff;cursor:pointer">Confirm my subscription</button>' +
      '</form>');
  }

  if (action === 'unsubscribe') {
    var lock = LockService.getScriptLock();
    try {
      lock.waitLock(LOCK_TIMEOUT_MS);
    } catch (lockErr) {
      throw new Error('Could not acquire lock within ' + LOCK_TIMEOUT_MS + 'ms: ' + lockErr);
    }
    var result;
    try {
      result = unsubscribe_(getSheet_(), token);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }
    console.log('unsubscribe: ' + result.reason);
    return result.ok ? redirect_(PAGE_UNSUBSCRIBED, 'You have been unsubscribed.')
                     : invalidLinkPage_();
  }

  return invalidLinkPage_();
}

/**
 * POST routing.
 *
 *   action absent or "subscribe" → the subscribe flow (stage 1's contract,
 *                                  unchanged: the page need not send `action`)
 *   action "confirm"             → the confirm button
 *   action "manage"              → mail someone their own unsubscribe link
 *   anything else                → REJECTED, nothing written (see below)
 *
 * Subscribe returns plain text for the page's fetch; confirm returns HTML,
 * because it is a real browser navigation from a form. Different callers,
 * different content types, one entry point.
 */
function doPost(e) {
  var p = readParams_(e);
  var action = str_(p.action).toLowerCase();

  if (action === '' || action === 'subscribe') return handleSubscribePost_(p);
  if (action === 'confirm') return handleConfirmPost_(p);
  if (action === 'manage')  return handleManagePost_(p);

  /* UNKNOWN ACTION → REJECT. Do NOT restore a fall-through to subscribe.
     It used to default that way, and the consequence was the worst outcome
     available here: a manage submit — someone asking to CANCEL — would have been
     routed into the subscribe flow and answered with a confirmation email. An
     action this endpoint does not recognise is a client that is out of step with
     it, and the safe response is to do nothing.
     Still the uniform OK, so the rejection reveals nothing; the log is where a
     genuinely broken client shows up. */
  console.warn('Rejected unknown action "' + action + '" — nothing written, nothing sent.');
  return ok_();
}

/**
 * The manage form's POST. Same front matter as subscribe — honeypot first, then
 * server-side validation, then the lock — because it takes the same untrusted
 * address from the same kind of public form.
 */
function handleManagePost_(p) {
  var email    = str_(p.email);
  var honeypot = str_(p.website);
  var emailKey = normEmail_(email);

  if (honeypot !== '') {
    return ok_();
  }

  if (!isEmailShape_(email)) {
    console.warn('Manage: rejected a malformed address (nothing sent). Length: ' + email.length);
    return ok_();
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    throw new Error('Could not acquire lock within ' + LOCK_TIMEOUT_MS + 'ms: ' + lockErr);
  }

  try {
    var outcome = manageLink_(getSheet_(), email, emailKey);
    SpreadsheetApp.flush();
    console.log('manage: ' + outcome);
  } finally {
    lock.releaseLock();
  }

  return ok_();
}

/**
 * The confirm button's POST.
 *
 * Answers in one of two shapes. `format=json` gets {ok:true|false} — asked for by
 * subscribe.js, which cannot read success off an HTML page that returns 200
 * either way. Everything else gets the HTML redirect or invalid-link page, which
 * is what a no-JS native form submit needs. Same logic, two renderings.
 */
function handleConfirmPost_(p) {
  var wantsJson = str_(p.format).toLowerCase() === 'json';
  var token = str_(p.token);
  if (!TOKEN_RE.test(token)) return wantsJson ? jsonResult_(false) : invalidLinkPage_();

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    throw new Error('Could not acquire lock within ' + LOCK_TIMEOUT_MS + 'ms: ' + lockErr);
  }

  var result;
  try {
    result = confirm_(getSheet_(), token);
    SpreadsheetApp.flush();
  } finally {
    lock.releaseLock();
  }

  console.log('confirm: ' + result.reason);
  if (wantsJson) return jsonResult_(result.ok);
  return result.ok ? redirect_(PAGE_CONFIRMED, 'Your subscription is confirmed.')
                   : invalidLinkPage_();
}

/**
 * The subscribe POST.
 *
 * Order matters, and each step's failure mode is chosen deliberately:
 *
 *   1. Honeypot first. A non-empty `website` is a bot: return the SAME success,
 *      write nothing, log nothing identifying. The bot gets no signal.
 *   2. Validate the email server-side. The client's HTML5 check is not trusted —
 *      a direct POST never ran it. A malformed address returns success and
 *      writes nothing, for the same reason the honeypot does: any distinct
 *      response is a probe surface.
 *   3. Take the script lock, then read-then-write-then-send inside it. The lock
 *      covers the counter increment too, which is what makes the
 *      non-transactional PropertiesService read-modify-write safe.
 *   4. A lock timeout or a sheet failure THROWS → non-200. That is the one
 *      non-uniform response, and it is correct: the write did not happen, the
 *      caller should retry, and "the request failed" reveals nothing about who
 *      is on the list. A MAIL failure is NOT in this category — the row is
 *      already safe, so it is swallowed and success is returned.
 */
function handleSubscribePost_(p) {
  var email      = str_(p.email);
  var honeypot   = str_(p.website);
  var sourcePage = safeSourcePage_(p.source_page);
  var emailKey   = normEmail_(email);

  if (honeypot !== '') {
    return ok_();
  }

  if (!isEmailShape_(email)) {
    console.warn('Rejected a malformed address (no row written). Length: ' + email.length);
    return ok_();
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(LOCK_TIMEOUT_MS);
  } catch (lockErr) {
    throw new Error('Could not acquire lock within ' + LOCK_TIMEOUT_MS + 'ms: ' + lockErr);
  }

  try {
    var outcome = subscribe_(getSheet_(), email, emailKey, sourcePage);
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
   `e` and calls an entry point with it.

   NO TRAILING UNDERSCORE ON THESE — do not "fix" them to match the private
   helpers above. In Apps Script a trailing underscore marks a function PRIVATE:
   it disappears from the editor's Run dropdown and cannot be invoked from it.
   Every helper above is correctly private; these must be PUBLIC or they cannot
   be run, which is their entire purpose. (They were shipped with the underscore
   once and had to be driven by hand-pasted wrappers — that is the mistake this
   note exists to prevent.) Making them public exposes nothing over HTTP: only
   doGet/doPost are web-reachable, so running these still requires editor access.

   THEY WRITE REAL ROWS AND SEND REAL MAIL. CONFIRM_BODY is filled in, so the
   fail-closed guard no longer holds anything back. Each run consumes one of the
   day's 200 sends. Delete the rows afterwards.

   ADDRESSES — two kinds, on purpose.
   The mocks that SEND (testFormEncoded, testJson) use plus-addressed variants of
   contact@threeflows.com, a real mailbox we own. Deliberately NOT example.com:
   that domain accepts no mail, so every run would HARD-BOUNCE, and repeated hard
   bounces from a young sending domain are exactly the signal that damages sender
   reputation. A deliverable address costs nothing, and it is strictly more
   useful — the confirmation actually arrives, so the rendered mail and the real
   confirm button can both be exercised end to end rather than assumed. The plus
   tag keeps the test rows obvious in the Sheet and filterable in Gmail.
   The mocks that NEVER SEND (honeypot, malformed, formula injection) keep
   example.com, because nothing leaves the building and a visibly fake address
   says so at a glance.

   Suggested order for a first run:
     1. testFormEncoded       → new "pending" row, token filled, confirmation
                                mailed. Log: "appended+sent". It is a DELIVERABLE
                                address, so the mail should ARRIVE in the
                                contact@ inbox — no bounce.
     2. testFormEncoded       → run AGAIN IMMEDIATELY: expect "noop-cooldown"
                                and NOTHING changed — same token, same timestamp,
                                same confirm_sent_at, no second mail. That is the
                                15-minute per-address cooldown.
     3. testJson              → a second pending row for the json@ address
     4. testHoneypot          → returns OK, writes NOTHING (row count unchanged)
     5. testMalformedEmail    → returns OK, writes NOTHING
     6. testFormulaInjection  → returns OK, writes NOTHING
     7. testShowLinks         → prints the confirm and unsubscribe URLs for the
                                first pending row, so both can be opened in a
                                browser without waiting for mail
     8. testBudget            → prints the counter, the cap, the remaining
                                platform quota, and whether each mail kind is
                                allowed to send
     9. testManage            → mails the unsubscribe link, but ONLY once the
                                address is ACTIVE (confirm it first). A run that
                                appears to do nothing almost always means the row
                                is still pending.
    10. testUnknownAction     → returns OK, writes NOTHING, sends NOTHING
   Then set a row's status to "active" by hand and run 1 again: nothing changes.
   Set it to "unsubscribed" and run 1 again: status returns to "pending", token
   changes, unsubscribed_at AND confirmed_at clear. Those two paths are the ones
   the harness proves only in memory.
   ───────────────────────────────────────────────────────────────────────────── */

/** Mock: form-encoded / multipart — the encoding contact-form.js already uses,
 *  and the one recommended for stage 3. Sends a REAL confirmation to
 *  contact+subtest@threeflows.com; open it and click through to test the whole
 *  loop. Delete the row and the mail afterwards. */
function testFormEncoded() {
  var e = {
    parameter: {
      email: 'contact+subtest@threeflows.com',
      source_page: 'subscribe.html',
      website: ''
    },
    postData: {
      type: 'application/x-www-form-urlencoded',
      contents: 'email=contact%2Bsubtest%40threeflows.com&source_page=subscribe.html&website='
    }
  };
  Logger.log('response: ' + doPost(e).getContent());
}

/** Mock: JSON body. e.parameter is empty exactly as it would be for a real
 *  JSON POST, so this exercises the readParams_ fallback rather than shadowing
 *  it with parameters that were never sent. */
function testJson() {
  var e = {
    parameter: {},
    postData: {
      type: 'application/json',
      contents: JSON.stringify({
        email: 'contact+subtest-json@threeflows.com',
        source_page: 'subscribe.html',
        website: ''
      })
    }
  };
  Logger.log('response: ' + doPost(e).getContent());
}

/** Mock: honeypot filled — must return OK and write NOTHING. Check the row
 *  count before and after; it must not move. */
function testHoneypot() {
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
function testMalformedEmail() {
  var e = { parameter: { email: 'not-an-email', source_page: 'subscribe.html', website: '' } };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO new row)');
}

/** Mock: the formula-injection guard. An address whose local part starts with
 *  "=" is rejected by EMAIL_RE, so nothing reaches the Sheet as a formula. */
function testFormulaInjection() {
  var e = { parameter: { email: '=HYPERLINK("http://x")@example.com', source_page: 'subscribe.html', website: '' } };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO new row)');
}

/**
 * Print the confirm and unsubscribe URLs for the first row with a token, so both
 * links can be exercised in a browser without waiting on mail. Reads only.
 */
function testShowLinks() {
  var sheet = getSheet_();
  var last = sheet.getLastRow();
  if (last < 2) { Logger.log('No rows yet — run testFormEncoded first.'); return; }

  var values = sheet.getRange(2, 1, last - 1, HEADER.length).getValues();
  for (var i = 0; i < values.length; i++) {
    var token = str_(values[i][COL_TOKEN - 1]);
    if (token) {
      Logger.log('row %s  %s  status=%s', i + 2, values[i][COL_EMAIL - 1], values[i][COL_STATUS - 1]);
      Logger.log('confirm:     %s', confirmUrl_(token));
      Logger.log('unsubscribe: %s', unsubscribeUrl_(token));
      return;
    }
  }
  Logger.log('No row carries a token.');
}

/** Print the send budget: today's count, the cap, the platform's remaining
 *  quota, and whether sending is currently allowed (and if not, why). */
function testBudget() {
  Logger.log('date (%s):       %s', TIMEZONE, today_());
  Logger.log('sends today:     %s of %s', counterRead_(), DAILY_SEND_CAP);
  Logger.log('platform quota:  %s remaining (reserve %s)', MailApp.getRemainingDailyQuota(), QUOTA_RESERVE);
  Logger.log('link base:       %s', execUrl_() || 'UNKNOWN — set EXEC_URL or deploy as a web app');
  Logger.log('confirm copy:    %s', bodyReady_() ? 'configured' : 'NOT CONFIGURED');
  Logger.log('manage copy:     %s', manageBodyReady_() ? 'configured' : 'NOT CONFIGURED');
  var bc = sendBlockedReason_('confirm');
  var bm = sendBlockedReason_('manage');
  Logger.log('confirm sending: %s', bc ? 'BLOCKED — ' + bc : 'allowed');
  Logger.log('manage sending:  %s', bm ? 'BLOCKED — ' + bm : 'allowed');
}

/**
 * Mock: the manage form. Sends the unsubscribe link to an address that must
 * ALREADY BE ACTIVE — run testFormEncoded, click the confirmation, then this.
 * Anything not active is a silent no-op by design, so a "nothing happened" run
 * usually means the row is still pending.
 */
function testManage() {
  var e = {
    parameter: {
      action: 'manage',
      email: 'contact+subtest@threeflows.com',
      website: ''
    }
  };
  Logger.log('response: ' + doPost(e).getContent());
}

/** Mock: an action this endpoint does not know. Must write nothing and send
 *  nothing — NOT fall through to the subscribe flow. */
function testUnknownAction() {
  var e = { parameter: { action: 'destroy', email: 'contact+subtest@threeflows.com', website: '' } };
  Logger.log('response: ' + doPost(e).getContent() + '  (expect NO row, NO mail)');
}
