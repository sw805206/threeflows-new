/* contact-form.js — client-side handling for the contact.html form.

   Three jobs: validate the required fields, drop honeypot spam silently, and
   swap the form for the inline "Thank you" panel on success. The network POST
   is DEFERRED: CONTACT_ENDPOINT is a named placeholder, so wiring the real
   Google Apps Script URL later is a one-line change (replace the string). While
   it holds the placeholder, no request is sent — the form validates, runs the
   honeypot, and shows the success swap client-side.

   Soft-fail, matching carousel.js / references.js / toc.js / the partials fetch:
   JS enhances, its absence never breaks the page. The form carries `novalidate`
   so this script owns validation; if the script is missing, that attribute is
   inert and the browser's own validation + native submit take over. */
(function () {
  'use strict';

  /* Deferred endpoint. Replace this ONE string with the live Apps Script /exec
     URL to go live — nothing else changes. While it equals the placeholder (or
     is empty), the success swap runs without a network POST. */
  var CONTACT_ENDPOINT = 'https://script.google.com/macros/s/AKfycbwNn7LqZ9zlVmBDaH9FU7NBJIqr3-gt0F-7SYxYNbtu4HlIQM5ecnEa_GXXbXBR8uyM6w/exec';

  function endpointReady() {
    return CONTACT_ENDPOINT && CONTACT_ENDPOINT.indexOf('__') !== 0;
  }

  /* Pragmatic email shape check — a non-empty local part, an @, and a dotted
     domain. Deliberately loose: the server is the authority; this only catches
     obvious typos before submit. */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showFieldError(input, errorEl) {
    if (input) input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.hidden = false;
  }

  function clearFieldError(input, errorEl) {
    if (input) input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.hidden = true;
  }

  try {
    var form = document.getElementById('tf-contact-form');
    if (!form) return;   // not the contact page, or markup absent: leave it alone

    /* Hidden metadata fields — created here (not in the markup) so FormData
       picks them up automatically. All default to "" and are filled
       best-effort; a blank value is always acceptable. */
    function addHidden(name) {
      var el = document.createElement('input');
      el.type = 'hidden';
      el.name = name;
      el.value = '';
      form.appendChild(el);
      return el;
    }
    var fTz = addHidden('tz');
    var fCity = addHidden('geo_city');
    var fRegion = addHidden('geo_region');
    var fCountry = addHidden('geo_country');

    /* Browser time zone — synchronous, no network. Blank on any failure. */
    try {
      fTz.value = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (tzErr) { /* soft-fail: leave "" */ }

    /* Approx location from IP — fire-and-forget, HARD soft-fail. Any error,
       block, timeout, or malformed response leaves the fields "" and must never
       delay, break, or alter submission or validation. Provider is fixed as
       ipapi.co. Same soft-fail posture as the partials/references/toc fetches. */
    (function geoLookup() {
      try {
        var ctrl = new AbortController();
        var timer = setTimeout(function () { ctrl.abort(); }, 4000);
        fetch('https://ipapi.co/json/', { signal: ctrl.signal })
          .then(function (res) { return res.ok ? res.json() : null; })
          .then(function (data) {
            if (!data) return;
            if (data.city) fCity.value = data.city;
            if (data.region) fRegion.value = data.region;
            if (data.country_name) fCountry.value = data.country_name;
          })
          .catch(function () { /* soft-fail: leave "" */ })
          .then(function () { clearTimeout(timer); });
      } catch (geoErr) { /* soft-fail (e.g. no AbortController): leave "" */ }
    })();

    var success = document.getElementById('tf-contact-success');
    var formError = document.getElementById('cf-form-error');
    var honeypot = document.getElementById('cf-website');

    var first = document.getElementById('cf-first');
    var firstError = document.getElementById('cf-first-error');
    var email = document.getElementById('cf-email');
    var emailError = document.getElementById('cf-email-error');
    var message = document.getElementById('cf-message');
    var messageError = document.getElementById('cf-message-error');

    /* Clear a field's error as soon as the user edits it — so the form stops
       nagging while they are fixing it. */
    if (first) first.addEventListener('input', function () { clearFieldError(first, firstError); });
    if (email) email.addEventListener('input', function () { clearFieldError(email, emailError); });
    if (message) message.addEventListener('input', function () { clearFieldError(message, messageError); });

    function validate() {
      var firstInvalid = null;

      if (first && first.value.trim() === '') {
        showFieldError(first, firstError);
        firstInvalid = firstInvalid || first;
      }
      if (email && !EMAIL_RE.test(email.value.trim())) {
        showFieldError(email, emailError);
        firstInvalid = firstInvalid || email;
      }
      if (message && message.value.trim() === '') {
        showFieldError(message, messageError);
        firstInvalid = firstInvalid || message;
      }

      if (firstInvalid) { firstInvalid.focus(); return false; }
      return true;
    }

    /* Reveal the success panel in place of the form (no page navigation). */
    function showSuccess() {
      form.hidden = true;
      if (success) success.hidden = false;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (formError) formError.hidden = true;

      /* Honeypot: a non-empty decoy means a bot filled every field. Drop it
         silently — show the same success panel a human would see, but send
         nothing, so the bot gets no signal that it was caught. */
      if (honeypot && honeypot.value.trim() !== '') {
        showSuccess();
        return;
      }

      if (!validate()) return;

      /* Endpoint deferred → success swap only, no request. */
      if (!endpointReady()) {
        showSuccess();
        return;
      }

      /* Live path (runs only once a real endpoint is wired). On a network/HTTP
         failure, reveal the submit-failure message and leave the form intact so
         the user can retry. */
      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(CONTACT_ENDPOINT, {
        method: 'POST',
        body: new FormData(form)
      }).then(function (res) {
        if (!res.ok) throw new Error('Bad response');
        showSuccess();
      }).catch(function () {
        if (formError) formError.hidden = false;
        if (submitBtn) submitBtn.disabled = false;
      });
    });
  } catch (e) {
    /* soft-fail: with novalidate inert on a thrown error, the browser's own
       validation + native submit still work. */
  }
})();
