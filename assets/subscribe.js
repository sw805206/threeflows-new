/* subscribe.js — page logic for subscribe.html.

   Two jobs, both client-side:

   1. STATE SWITCH. subscribe.html carries all four states in one file and this
      script picks one from the URL query string:

        (none)            → the subscribe form   (also the no-JS default)
        ?confirmed=1      → "You're subscribed"
        ?unsubscribed=1   → "You're unsubscribed"
        ?manage=1         → the manage/cancel form

      Anything else — an unknown parameter, a known parameter with a value other
      than "1", a malformed query — falls through to the FORM state, which is the
      state already visible in the markup. If more than one state parameter is
      present the first match in the order above wins; that precedence is
      arbitrary but fixed, so the behaviour is not accidental.

   2. SUBMIT SWAP. On a valid submit, the form is replaced in place by its
      "Check your inbox" panel. NO NETWORK REQUEST IS MADE — the POST endpoint is
      not built yet; see SUBSCRIBE_ENDPOINT below.

   Validation is the BROWSER'S: the fields are type="email" + required and the
   forms carry no `novalidate`, so the native check gates the submit event and
   this file never inspects the address. No third-party validator (mailcheck or
   otherwise) — that would be a SCOPE dependency-by-exception decision and it has
   not been made.

   Soft-fail, matching carousel.js / references.js / toc.js / contact-form.js /
   the partials fetch: JS enhances, its absence never breaks the page. If this
   script is missing or throws, subscribe.html still renders the subscribe form
   (the default state is the one authored visible) and that form still submits
   natively. */
(function () {
  'use strict';

  /* ─── THE POST GOES HERE ───────────────────────────────────────────────────
     NOT WIRED. There is no subscription backend yet: no endpoint, no list, no
     double-opt-in mailer. When one exists, this is the one string to fill in,
     and the `if (!endpointReady())` branch in handleSubmit() below is the single
     place the fetch() gets added — the contact-form.js shape, deliberately, so
     the two forms wire the same way. Nothing else in this file changes.

     Until then every submit is client-side only: validate (natively), swap in
     the "check your inbox" panel, send nothing. */
  var SUBSCRIBE_ENDPOINT = '__SUBSCRIBE_ENDPOINT__';

  function endpointReady() {
    return SUBSCRIBE_ENDPOINT && SUBSCRIBE_ENDPOINT.indexOf('__') !== 0;
  }

  /* The four states, in precedence order. `id` is the section to reveal; `param`
     is the query key that selects it. The first entry is the default and has no
     parameter — it is the state already visible in the markup, so it is never
     "revealed", only left alone. */
  var STATES = [
    { param: 'confirmed',    id: 'tf-state-confirmed' },
    { param: 'unsubscribed', id: 'tf-state-unsubscribed' },
    { param: 'manage',       id: 'tf-state-manage' }
  ];

  var DEFAULT_STATE_ID = 'tf-state-form';

  try {
    /* ─── 1. State switch ─────────────────────────────────────────────────── */
    var params = new URLSearchParams(window.location.search);
    var selected = null;

    for (var i = 0; i < STATES.length; i++) {
      if (params.get(STATES[i].param) === '1') { selected = STATES[i].id; break; }
    }

    /* No match → leave the markup as authored: the form state stays visible and
       the other three stay [hidden]. Nothing to do. */
    if (selected && selected !== DEFAULT_STATE_ID) {
      var defaultSection = document.getElementById(DEFAULT_STATE_ID);
      var selectedSection = document.getElementById(selected);
      /* Reveal first, hide second: if the selected section is missing from the
         markup for any reason, the page is left showing the form rather than
         showing nothing at all. */
      if (selectedSection) {
        selectedSection.hidden = false;
        if (defaultSection) defaultSection.hidden = true;
      }
    }

    /* ─── 2. Submit swap ──────────────────────────────────────────────────── */

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

        /* In-flight guard. Inert while the endpoint is a placeholder, but it
           lives here now so the live path cannot double-POST later: disabling
           the button alone blocks clicks, not Enter-key submission. */
        if (submitting) return;

        /* Endpoint deferred → success swap only, no request. This is the branch
           that grows a fetch() when the backend exists. */
        if (!endpointReady()) {
          showSuccess();
          return;
        }

        submitting = true;
        setPending(true);
        showSuccess();
      });
    }

    wireForm('tf-subscribe-form', 'tf-subscribe-success');
    wireForm('tf-manage-form', 'tf-manage-success');

  } catch (e) {
    /* Soft-fail: the form state is the authored default and the forms carry no
       `novalidate`, so a thrown error leaves a working, natively-validated
       subscribe form on the page. */
  }
})();
