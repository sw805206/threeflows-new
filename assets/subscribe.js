/* subscribe.js — page logic for subscribe.html.

   Three jobs, all client-side:

   1. STATE SWITCH. subscribe.html carries all five states in one file and this
      script picks one from the URL query string:

        (none)            → the subscribe form   (also the no-JS default)
        ?confirm=<token>  → the branded confirm page (a button that POSTs)
        ?confirmed=1      → "You're subscribed"
        ?unsubscribed=1   → "You're unsubscribed"
        ?manage=1         → the manage/cancel form

      Anything else — an unknown parameter, a known parameter with a value other
      than "1", a malformed query — falls through to the FORM state, which is the
      state already visible in the markup. If more than one state parameter is
      present the first match in the order above wins; that precedence is
      arbitrary but fixed, so the behaviour is not accidental.

      ?confirm= is the one that carries a VALUE rather than "1", so it gets its
      own check. A ?confirm= whose token is malformed also lands on the form, but
      with the expired-link message revealed — re-subscribing IS the remedy, so
      the form is the right destination rather than a sixth state.

   2. SUBMIT. The subscribe and manage forms POST to the endpoint and swap in
      their "Check your inbox" panel on success.

   3. CONFIRM. The confirm button POSTs the token and swaps to the "You're
      subscribed" state IN PLACE — no navigation, so the visitor never sees a
      script.google.com URL.

   Validation is the BROWSER'S: the fields are type="email" + required and the
   forms carry no `novalidate`, so the native check gates the submit event and
   this file never inspects the address. No third-party validator (mailcheck or
   otherwise) — that would be a SCOPE dependency-by-exception decision and it has
   not been made.

   Soft-fail, matching carousel.js / references.js / toc.js / contact-form.js /
   the partials fetch: JS enhances, its absence never breaks the page. If this
   script is missing or throws, subscribe.html still renders the subscribe form
   (the default state is the one authored visible). The confirm state is the one
   thing that genuinely needs JS — see its comment in the markup. */
(function () {
  'use strict';

  /* ─── THE ENDPOINT ─────────────────────────────────────────────────────────
     The deployed Apps Script /exec URL, wired the same way contact-form.js wires
     its own. Used in two places: the fetch() calls below, and the confirm form's
     `action`, which this script fills in — one constant, because a second copy
     hardcoded in the markup would drift the moment the deployment changed.

     It is PUBLIC by necessity: the browser has to POST to it, so it is readable
     by anyone who views this file. That is not a leak, and the endpoint is not
     defended by the URL being hard to find — the honeypot, the server-side
     validation, the per-address cooldown and the daily cap are what defend it.

     Redeploying with Manage deployments → New version keeps this URL. Only a
     brand-new deployment would change it, which would break this line and the
     confirm links already sitting in inboxes alike.

     If it is ever reset to a placeholder: the subscribe and manage forms fall
     back to the client-side swap (no request), and the confirm button does NOT
     fake a confirmation — it reveals the expired-link message instead. Claiming
     someone is subscribed when nothing was written is the one failure worth
     special-casing. */
  var SUBSCRIBE_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyXsDKH6u9XG7dNigQtvK0W5CQA3nhTal3aceq2XTnvPBUEGVuM-57A8E5f8wJ83QrZAg/exec';

  function endpointReady() {
    return SUBSCRIBE_ENDPOINT && SUBSCRIBE_ENDPOINT.indexOf('__') !== 0;
  }

  /* The token shape Utilities.getUuid() produces, mirrored from the endpoint's
     TOKEN_RE. Checked here so a malformed token never reaches the form field or
     the network — the same untrusted-input discipline the server applies. */
  var TOKEN_RE = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

  /* The "=1" states, in precedence order. `id` is the section to reveal. */
  var STATES = [
    { param: 'confirmed',    id: 'tf-state-confirmed' },
    { param: 'unsubscribed', id: 'tf-state-unsubscribed' },
    { param: 'manage',       id: 'tf-state-manage' }
  ];

  var DEFAULT_STATE_ID = 'tf-state-form';
  var CONFIRM_STATE_ID = 'tf-state-confirm';
  var CONFIRMED_STATE_ID = 'tf-state-confirmed';

  /* Reveal one state and hide the default. Reveal first, hide second: if the
     target section is missing from the markup for any reason, the page is left
     showing the form rather than showing nothing at all. */
  function showState(id) {
    var target = document.getElementById(id);
    if (!target) return false;
    target.hidden = false;
    var def = document.getElementById(DEFAULT_STATE_ID);
    if (def && id !== DEFAULT_STATE_ID) def.hidden = true;
    return true;
  }

  /* Send someone back to the form with the expired-link message. The single
     recovery path for every unusable confirm link — malformed token, endpoint
     rejection, endpoint unreachable — so all three look the same to the visitor
     and all three have the same fix: subscribe again. */
  function showExpired() {
    var confirmState = document.getElementById(CONFIRM_STATE_ID);
    if (confirmState) confirmState.hidden = true;
    showState(DEFAULT_STATE_ID);
    var msg = document.getElementById('tf-confirm-expired');
    if (msg) msg.hidden = false;
  }

  /* Did the endpoint accept it?

     BACKWARD- AND FORWARD-COMPATIBLE, deliberately. The site is designed to
     merge BEFORE the endpoint starts answering `format=json`, so this must read
     both shapes:
       - JSON body  → trust its `ok` field (the new, precise answer)
       - anything else (the old HTML redirect/invalid-link page) → fall back to
         res.ok, which is what the endpoint has always signalled
     Without this fallback the site could not land first, and landing first is
     what keeps already-sent confirm links working during the changeover. */
  function accepted(res, text) {
    try {
      var body = JSON.parse(text);
      if (body && typeof body === 'object' && typeof body.ok === 'boolean') {
        return body.ok;
      }
    } catch (parseErr) {
      /* Not JSON — the pre-change endpoint. Fall through. */
    }
    return res.ok;
  }

  try {
    /* ─── 1. State switch ─────────────────────────────────────────────────── */
    var params = new URLSearchParams(window.location.search);
    var rawConfirm = params.get('confirm');

    if (rawConfirm !== null) {
      /* A confirm link. A well-formed token opens the confirm state; anything
         else is an expired or mangled link and lands on the form. */
      if (TOKEN_RE.test(rawConfirm) && showState(CONFIRM_STATE_ID)) {
        var tokenField = document.getElementById('tf-confirm-token');
        if (tokenField) tokenField.value = rawConfirm;
        var confirmForm = document.getElementById('tf-confirm-form');
        /* Fill the no-JS fallback target. If the endpoint is not wired the
           action stays empty, which posts to the page itself — harmless, and the
           submit handler below intercepts before that can happen. */
        if (confirmForm && endpointReady()) confirmForm.action = SUBSCRIBE_ENDPOINT;
      } else {
        showExpired();
      }
    } else {
      for (var i = 0; i < STATES.length; i++) {
        if (params.get(STATES[i].param) === '1') { showState(STATES[i].id); break; }
      }
    }

    /* ─── 2. The subscribe and manage forms ───────────────────────────────── */

    /* Replace a form with its success panel. Everything that should disappear
       on submit — the small print, the "Already subscribed?" link — is inside
       the form's .tf-form-foot, so hiding the form hides all of it. The
       .tf-form[hidden] and .tf-form-success[hidden] guards in STYLE.css make the
       attribute stick against those rules' own display:flex. */
    function wireForm(formId, successId) {
      var form = document.getElementById(formId);
      if (!form) return;   /* state not in the markup: leave it alone */

      var success = document.getElementById(successId);
      var submitBtn = form.querySelector('[type="submit"]');
      var submitBtnLabel = submitBtn ? submitBtn.textContent : '';
      var submitting = false;

      function setPending(on) {
        if (!submitBtn) return;
        submitBtn.disabled = on;
        submitBtn.textContent = on ? 'Sending…' : submitBtnLabel;
      }

      function showSuccess() {
        form.hidden = true;
        if (success) success.hidden = false;
      }

      /* The submit event only fires once the browser's own type="email" +
         required check passes, so there is nothing to validate here. */
      form.addEventListener('submit', function (e) {
        e.preventDefault();

        /* In-flight guard. Disabling the button alone blocks CLICKS, not a
           submit fired by the Enter key — so a flag is what actually prevents a
           second POST while one is in flight. */
        if (submitting) return;

        if (!endpointReady()) {
          showSuccess();
          return;
        }

        submitting = true;
        setPending(true);

        /* FormData with no explicit Content-Type: a CORS simple request, so no
           preflight — the same shape contact-form.js uses. Sending JSON here
           would trigger an OPTIONS that Apps Script does not answer. */
        fetch(SUBSCRIBE_ENDPOINT, { method: 'POST', body: new FormData(form) })
          .then(function (res) {
            /* The endpoint answers with an identical 200 for every path, on
               purpose — it must never reveal whether an address is on the list.
               So there is nothing to branch on here, and nothing to report back
               beyond "it went through". */
            if (!res.ok) throw new Error('Bad response');
            showSuccess();
          })
          .catch(function () {
            /* Network or 5xx: the write did not happen, so let them retry rather
               than telling them to check an inbox nothing was sent to. */
            submitting = false;
            setPending(false);
          });
      });
    }

    wireForm('tf-subscribe-form', 'tf-subscribe-success');
    wireForm('tf-manage-form', 'tf-manage-success');

    /* ─── 3. The confirm button ───────────────────────────────────────────── */

    /* POSTs the token and swaps to the "You're subscribed" state in place, so
       the visitor stays on threeflows.com throughout. Every failure — rejected
       token, unreachable endpoint, unwired endpoint — lands on showExpired(),
       because they all have the same remedy and none of them should ever be
       dressed up as a success. */
    var confirmFormEl = document.getElementById('tf-confirm-form');
    if (confirmFormEl) {
      var confirming = false;
      var confirmBtn = confirmFormEl.querySelector('[type="submit"]');
      var confirmBtnLabel = confirmBtn ? confirmBtn.textContent : '';

      confirmFormEl.addEventListener('submit', function (e) {
        e.preventDefault();
        if (confirming) return;

        var token = (document.getElementById('tf-confirm-token') || {}).value || '';
        if (!TOKEN_RE.test(token) || !endpointReady()) {
          showExpired();
          return;
        }

        confirming = true;
        if (confirmBtn) {
          confirmBtn.disabled = true;
          confirmBtn.textContent = 'Confirming…';
        }

        var data = new FormData();
        data.append('action', 'confirm');
        data.append('token', token);
        /* Ask for a machine-readable answer. An endpoint that does not yet know
           this parameter simply ignores it and returns HTML — which accepted()
           handles. */
        data.append('format', 'json');

        fetch(SUBSCRIBE_ENDPOINT, { method: 'POST', body: data })
          .then(function (res) {
            return res.text().then(function (text) { return accepted(res, text); });
          })
          .then(function (ok) {
            if (!ok) { showExpired(); return; }
            var confirmState = document.getElementById(CONFIRM_STATE_ID);
            if (confirmState) confirmState.hidden = true;
            showState(CONFIRMED_STATE_ID);
          })
          .catch(function () {
            confirming = false;
            if (confirmBtn) {
              confirmBtn.disabled = false;
              confirmBtn.textContent = confirmBtnLabel;
            }
            showExpired();
          });
      });
    }

  } catch (e) {
    /* Soft-fail: the form state is the authored default and the forms carry no
       `novalidate`, so a thrown error leaves a working, natively-validated
       subscribe form on the page. */
  }
})();
