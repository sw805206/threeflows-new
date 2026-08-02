/* tool-general-cashflow.js — the General Cashflow Projection tool's
   engine. Its own file per SCOPE.md §3: a tool's calculation logic never sits
   inline in the page, so the math stays testable and reusable.

   Six pieces:

   1. Step switching — the same [hidden]-attribute tablist idiom references.js
      established and tool-company-setup.js reuses, with the nav rendered as a
      left rail. Deep-linkable via location.hash (#revenue / #costs /
      #projection). Steps 1 and 2 stay editable; ARRIVING at step 3 recomputes
      from whatever the inputs currently say, so there is no stale projection
      and no "recalculate" button to forget to press.
   2. Inputs + validation — every amount is a number field, every month a
      month+year picker; nothing here is free text. Three rules BLOCK rather
      than silently correct: payment terms must total 100, the approach month
      cannot precede the start month, and a cost cannot be dated before the
      start month. A blocked input shows the projection's reason instead of a
      quietly wrong chart.
   3. The model — a month-by-month cash schedule over the horizon. Client
      counts stay FRACTIONAL throughout (rounding 0.83 clients to 1 compounds
      into a badly wrong revenue line over 36 months).
   4. Aggregation — monthly or CALENDAR-anchored quarterly, driving the chart
      and the table together from one switch.
   5. The chart — a hand-built SVG. No charting library: the site's own blog
      waterfalls are hand-built and the palette tokens already exist.
   6. Output — a real .pdf via jsPDF + autoTable, paginated identically to the
      print stylesheet.

   No network calls beyond the two CDN <script>s the page declares. Soft-fail:
   a missing DOM node is checked before use. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  // --- 1. Step switching ---------------------------------------------------
  var TAB_KEYS = ['revenue', 'costs', 'projection'];
  var tabs = {};
  var panels = {};

  document.querySelectorAll('.tf-step-nav .tf-step-nav-item').forEach(function (btn) {
    var key = btn.getAttribute('data-tab');
    tabs[key] = btn;
    btn.addEventListener('click', function () {
      if (currentTab() === key) activate(key);
      else location.hash = key;
    });
  });
  document.querySelectorAll('[data-tool-panel]').forEach(function (panel) {
    panels[panel.getAttribute('data-tool-panel')] = panel;
  });

  function activate(key) {
    if (!panels[key]) key = TAB_KEYS[0];
    TAB_KEYS.forEach(function (k) {
      var on = k === key;
      if (panels[k]) panels[k].hidden = !on;
      if (tabs[k]) {
        tabs[k].setAttribute('aria-selected', on ? 'true' : 'false');
        tabs[k].tabIndex = on ? 0 : -1;
      }
    });
    // Steps 1 and 2 are re-editable at any time, so step 3 is rebuilt on every
    // arrival rather than cached.
    if (key === 'projection') refresh();
    syncPager(key);
  }
  function currentTab() {
    var h = (location.hash || '').replace(/^#/, '');
    return panels[h] ? h : TAB_KEYS[0];
  }

  /* --- Step pager, panel eyebrow, byline stamp ---------------------------
     The step NUMBER is authored ONCE, in the rail's .tf-step-nav-num. The
     eyebrow above each panel h2 and both pager labels are derived from it, so
     renumbering or reordering steps in the rail cannot leave them disagreeing.
     NB this means the eyebrow does NOT appear in a grep of the static HTML: the
     markup carries an empty [data-step-eyebrow] slot and the number lands at
     runtime. */
  function stepLabel(key) {
    var n = tabs[key] && tabs[key].querySelector('.tf-step-nav-num');
    return n ? n.textContent.trim() : '';
  }

  TAB_KEYS.forEach(function (k) {
    var slot = panels[k] && panels[k].querySelector('[data-step-eyebrow]');
    if (slot) slot.textContent = stepLabel(k);
  });

  /* Pager ends are DISABLED, not hidden, so the row does not jump between
     steps. An <a> with no href is not focusable, which meets the non-focusable
     requirement without swapping the element for a <span>. */
  function setPagerEnd(el, key, text) {
    if (!el) return;
    el.textContent = text;
    if (key) {
      el.setAttribute('href', '#' + key);
      el.classList.remove('is-disabled');
      el.removeAttribute('aria-disabled');
    } else {
      el.removeAttribute('href');
      el.classList.add('is-disabled');
      el.setAttribute('aria-disabled', 'true');
    }
  }

  function syncPager(key) {
    var i = TAB_KEYS.indexOf(key);
    var prev = i > 0 ? TAB_KEYS[i - 1] : null;
    var next = (i > -1 && i < TAB_KEYS.length - 1) ? TAB_KEYS[i + 1] : null;
    setPagerEnd(document.querySelector('[data-pager-prev]'), prev,
      '\u2190 ' + stepLabel(prev || TAB_KEYS[0]));
    setPagerEnd(document.querySelector('[data-pager-next]'), next,
      stepLabel(next || TAB_KEYS[TAB_KEYS.length - 1]) + ' \u2192');
  }

  /* "printed on" stamp — local time, stamped at the moment of print/download
     rather than at page load, so a page left open overnight does not print
     yesterday's time. */
  function stamp() {
    var d = new Date(), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) +
           ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }
  window.addEventListener('beforeprint', function () {
    var el = document.querySelector('[data-byline-date]');
    if (el) el.textContent = ' | printed on ' + stamp();
  });

  /* Presented-by byline at the HEAD of the generated document. The mark is
     drawn from assets/logo-mark.svg's REAL geometry — three rounded rects in a
     100-unit viewBox starting at y=8.5 — scaled to an 18pt mark, in the same
     --tf-* colours the SVG uses. No rasterization and no second asset.
     THIS IS THE SAME LINE the screen/print byline renders; if one changes the
     other must change with it, which is why they are commented as a PAIR here
     and in STYLE.css (.tf-byline). */
  function drawByline(doc, margin, y, right) {
    var S = 18 / 100, oy = y;
    function bar(x, yy, w, h, c) {
      doc.setFillColor(c[0], c[1], c[2]);
      doc.roundedRect(margin + x * S, oy + (yy - 8.5) * S, w * S, h * S, 4 * S, 4 * S, 'F');
    }
    bar(21, 42, 16, 43, [38, 34, 31]);     // --tf-ink
    bar(42, 32, 16, 53, [194, 41, 27]);    // --tf-brick
    bar(63, 52, 16, 33, [184, 173, 165]);  // --tf-stone
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(85, 80, 77);
    doc.text('Presented by Three Flows Solutions | printed on ' + stamp(), margin + 26, oy + 13);
    var ry = oy + 22;
    doc.setDrawColor(221, 214, 207).setLineWidth(1);   // --tf-stone-light
    doc.line(margin, ry, right, ry);
    return ry + 14;
  }

  window.addEventListener('hashchange', function () { activate(currentTab()); });

  // --- Month arithmetic ----------------------------------------------------
  // Months are handled as a single absolute integer (year * 12 + monthIndex),
  // which makes "12 months later" and "how many months apart" plain addition
  // and subtraction, with no month-length or year-boundary special cases. A
  // RELATIVE index m is 1-based: m = 1 is the start month.
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                     'August', 'September', 'October', 'November', 'December'];

  function absFromValue(value) {                       // "2026-08" -> abs
    if (!value || !/^\d{4}-\d{2}$/.test(value)) return null;
    var parts = value.split('-');
    var y = parseInt(parts[0], 10);
    var mo = parseInt(parts[1], 10);
    if (mo < 1 || mo > 12) return null;
    return y * 12 + (mo - 1);
  }
  function valueFromAbs(abs) {                         // abs -> "2026-08"
    var y = Math.floor(abs / 12);
    var mo = (abs % 12) + 1;
    return y + '-' + (mo < 10 ? '0' : '') + mo;
  }
  function monthOfYear(abs) { return (abs % 12) + 1; }  // 1..12
  function yearOf(abs) { return Math.floor(abs / 12); }
  function shortLabel(abs) { return MONTHS[abs % 12]; }
  function longLabel(abs) { return MONTHS_LONG[abs % 12] + ' ' + yearOf(abs); }
  // MMM-YY — the compact form the table and the summary use. A 36-row table of
  // "September 2026" spends most of its first column on the word for the month.
  function shortDate(abs) { return MONTHS[abs % 12] + '-' + yy(abs); }
  function yy(abs) { return String(yearOf(abs) % 100).padStart(2, '0'); }

  // --- Formatting ----------------------------------------------------------
  // Negative money reads as ($1,234) — the accounting convention the site's own
  // cashflow waterfall (blog-cashflow-vs-unit-economics.html) already uses.
  function money(v) {
    var n = Math.round(Math.abs(v));
    var s = '$' + n.toLocaleString('en-US');
    return v < 0 ? '(' + s + ')' : s;
  }
  function moneyCompact(v) {
    var a = Math.abs(v), s;
    if (a >= 1000000) s = '$' + trim(a / 1000000) + 'M';
    else if (a >= 1000) s = '$' + trim(a / 1000) + 'k';
    else s = '$' + Math.round(a);
    return v < 0 ? '(' + s + ')' : s;
  }
  function trim(n) { return (Math.round(n * 10) / 10).toString(); }
  function clients(v) { return (Math.round(v * 10) / 10).toLocaleString('en-US'); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // --- Design tokens -------------------------------------------------------
  // Read from :root, so the chart's colours have exactly one definition — the
  // --tf-* tokens at the top of STYLE.css. They are applied as SVG presentation
  // attributes rather than CSS classes because the PDF path rasterizes the SVG
  // through an <img>, where an external stylesheet does not apply; a classed
  // fill would render on screen and vanish from the PDF.
  var TOKENS = null;
  function tokens() {
    if (TOKENS) return TOKENS;
    var cs = getComputedStyle(document.documentElement);
    var read = function (name) { return cs.getPropertyValue(name).trim(); };
    // NB --tf-chart-4 / --tf-chart-1 are no longer read: they were the bars'
    // 2px strokes, dropped on review. The wash fills alone carry the series,
    // helped by the fact that the two now sit on opposite sides of zero.
    TOKENS = {
      revenueFill: read('--tf-wash-teal'),
      costsFill: read('--tf-wash-brick'),
      commissionFill: read('--tf-wash-slate'),
      ink: read('--tf-ink'),
      inkSoft: read('--tf-ink-soft'),
      grid: read('--tf-stone-light'),
      sand: read('--tf-sand'),
      paper: read('--tf-paper')
    };
    return TOKENS;
  }

  // --- 2. Inputs -----------------------------------------------------------
  // WHEN an error is allowed to appear. The rules themselves never change —
  // only the moment their message shows — and the moment is late on purpose:
  //   * not until the field has been LEFT (change / focusout), so nobody is
  //     told a half-typed entry is wrong while they are still typing it;
  //   * never while the field holds focus, so returning to fix something does
  //     not turn red under the cursor mid-edit;
  //   * always, everywhere, the moment the projection is asked for.
  // Keyed by ELEMENT rather than id, because the repeatable cost rows have no
  // ids and need the same treatment as everything else.
  var TOUCHED = new WeakSet();
  function shouldShow(el, reveal) {
    if (reveal) return true;
    if (!el || !TOUCHED.has(el)) return false;
    return document.activeElement !== el;
  }
  var COST_KINDS = ['onetime', 'annual', 'monthly'];
  var hosts = { onetime: $('rep-onetime'), annual: $('rep-annual'), monthly: $('rep-monthly') };


  // --- Month picker --------------------------------------------------------
  // Our own control, replacing <input type="month">. Three things the native
  // one cannot do, all of them asked for:
  //   1. Display MMM-YY. The browser renders the value in its own locale
  //      format ("February 2026") and there is no API to change it.
  //   2. Use the site's typeface. The dropdown calendar lives in shadow DOM
  //      the page cannot reach, so it renders in the UA's font (Arial).
  //   3. Fit a narrow box. "September 2026" plus the picker indicator sets a
  //      183px floor, which is what stopped every entry box being one width.
  // The authored markup is only a hidden input carrying "YYYY-MM"; the widget
  // is built here. That is deliberate — a hidden input keeps the value in the
  // form where the rest of this file already looks for it, and the widget's
  // internals are chrome, not content, so they do not belong in the page the
  // way the cost-row templates do.
  var MP_OPEN = null;

  function upgradeMonthPicks(root) {
    (root || document).querySelectorAll('[data-monthpick]').forEach(function (wrap) {
      if (wrap.__mp) return;
      var input = wrap.querySelector('input[type="hidden"]');
      if (!input) return;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tf-input tf-monthpick-value';
      btn.setAttribute('aria-haspopup', 'dialog');
      btn.setAttribute('aria-expanded', 'false');
      var text = document.createElement('span');
      var caret = document.createElement('span');
      caret.className = 'tf-monthpick-caret';
      caret.setAttribute('aria-hidden', 'true');
      caret.textContent = '\u25BE';
      btn.appendChild(text);
      btn.appendChild(caret);

      var pop = document.createElement('div');
      pop.className = 'tf-monthpick-pop';
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', 'Choose a month and year');
      pop.hidden = true;
      pop.innerHTML =
        '<div class="tf-monthpick-year">' +
          '<button type="button" data-mp-year="-1" aria-label="Previous year">\u2039</button>' +
          '<span class="tf-monthpick-yearlabel"></span>' +
          '<button type="button" data-mp-year="1" aria-label="Next year">\u203A</button>' +
        '</div>' +
        '<div class="tf-monthpick-grid"></div>' +
        '<div class="tf-monthpick-foot">' +
          '<button type="button" data-mp-clear>Clear</button>' +
          '<button type="button" data-mp-now>This month</button>' +
        '</div>';

      wrap.appendChild(btn);
      wrap.appendChild(pop);

      var state = { wrap: wrap, input: input, btn: btn, text: text, pop: pop, year: null, floor: null };
      wrap.__mp = state;

      btn.addEventListener('click', function (e) { e.stopPropagation(); toggle(state); });
      pop.addEventListener('click', function (e) { e.stopPropagation(); });
      pop.querySelectorAll('[data-mp-year]').forEach(function (b) {
        b.addEventListener('click', function () {
          state.year += parseInt(b.getAttribute('data-mp-year'), 10);
          paintGrid(state);
        });
      });
      pop.querySelector('[data-mp-clear]').addEventListener('click', function () { commit(state, ''); });
      pop.querySelector('[data-mp-now]').addEventListener('click', function () {
        var now = new Date();
        commit(state, valueFromAbs(now.getFullYear() * 12 + now.getMonth()));
      });

      paintValue(state);
    });
  }

  function paintValue(state) {
    var abs = absFromValue(state.input.value);
    state.text.textContent = abs === null ? 'MMM-YY' : shortDate(abs);
    state.btn.classList.toggle('is-empty', abs === null);
  }

  function paintGrid(state) {
    state.pop.querySelector('.tf-monthpick-yearlabel').textContent = state.year;
    var chosen = absFromValue(state.input.value);
    var grid = state.pop.querySelector('.tf-monthpick-grid');
    grid.innerHTML = '';
    for (var m = 0; m < 12; m++) {
      var abs = state.year * 12 + m;
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = MONTHS[m];
      if (state.floor !== null && abs < state.floor) b.disabled = true;
      if (chosen === abs) b.className = 'is-chosen';
      (function (value) {
        b.addEventListener('click', function () { commit(state, valueFromAbs(value)); });
      })(abs);
      grid.appendChild(b);
    }
  }

  function commit(state, value) {
    state.input.value = value;
    paintValue(state);
    close(state);
    // Bubbling change is what the rest of the page listens for, so the picker
    // is indistinguishable from a typed field to every other rule here.
    state.input.dispatchEvent(new Event('change', { bubbles: true }));
    state.btn.focus();
  }

  function toggle(state) { state.pop.hidden ? open(state) : close(state); }

  function open(state) {
    if (MP_OPEN && MP_OPEN !== state) close(MP_OPEN);
    var chosen = absFromValue(state.input.value);
    // Open on the chosen year, else the floor's year, else the current one.
    state.year = chosen !== null ? yearOf(chosen)
      : state.floor !== null ? yearOf(state.floor)
      : new Date().getFullYear();
    paintGrid(state);
    state.pop.hidden = false;
    state.btn.setAttribute('aria-expanded', 'true');
    MP_OPEN = state;
  }

  function close(state) {
    state.pop.hidden = true;
    state.btn.setAttribute('aria-expanded', 'false');
    if (MP_OPEN === state) MP_OPEN = null;
  }

  document.addEventListener('click', function () { if (MP_OPEN) close(MP_OPEN); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && MP_OPEN) { var s = MP_OPEN; close(s); s.btn.focus(); }
  });

  // The floor is the start month: no other date on the page may precede it.
  // Months before it are DISABLED in the grid, so the block is visible in the
  // control rather than only reported afterwards.
  function setFloor(wrap, abs) {
    if (wrap && wrap.__mp) wrap.__mp.floor = abs;
  }

  function initDefaults() {
    // Nothing is prefilled — not the numbers, not the months, and no
    // placeholder standing in for a value either (a greyed "3" in the box
    // still reads as prefilled). This SUPERSEDES the original brief's defaults
    // (horizon 3, start month = the current machine month, sign lag 2,
    // duration 3, 50/50 terms): the page opens as a blank sheet and every
    // answer is the user's own. The month control keeps "MMM-YY", which
    // states a FORMAT rather than a value.
    upgradeMonthPicks(document);
    syncMonthBounds();
  }

  // The start month is the floor for every other date on the page.
  function syncMonthBounds() {
    var start = $('r-start');
    var floor = start ? absFromValue(start.value) : null;
    var approach = $('r-approach');
    if (approach) setFloor(approach.closest('[data-monthpick]'), floor);
    document.querySelectorAll('[data-row] [data-monthpick]').forEach(function (wrap) {
      setFloor(wrap, floor);
    });
  }

  // Payment terms: typing one side fills the other, so the pair totals 100 by
  // construction. Editing either still gets validated — auto-fill is a
  // convenience, not the guarantee.
  var upfront = $('r-upfront');
  var oncomplete = $('r-oncomplete');
  function linkTerms(from, to) {
    if (!from || !to) return;
    from.addEventListener('input', function () {
      var v = parseFloat(from.value);
      if (isFinite(v) && v >= 0 && v <= 100) to.value = String(Math.round((100 - v) * 100) / 100);
    });
  }
  linkTerms(upfront, oncomplete);
  linkTerms(oncomplete, upfront);

  // Repeatable cost rows -----------------------------------------------------
  function addRow(kind, preset) {
    var host = hosts[kind];
    var tpl = $('tpl-' + kind);
    if (!host || !tpl) return;
    var row = tpl.content.firstElementChild.cloneNode(true);
    if (preset) {
      Object.keys(preset).forEach(function (f) {
        var field = row.querySelector('[data-f="' + f + '"]');
        if (field) field.value = preset[f];
      });
    }
    host.appendChild(row);
    upgradeMonthPicks(row);
    syncMonthBounds();
    row.querySelector('[data-del]').addEventListener('click', function () {
      row.remove();
      renderEmptyStates();
      validateLive();
    });
    renderEmptyStates();
  }

  function renderEmptyStates() {
    COST_KINDS.forEach(function (kind) {
      var host = hosts[kind];
      if (!host) return;
      var existing = host.querySelector('.tf-repeat-empty');
      var rows = host.querySelectorAll('[data-row]').length;
      if (rows === 0 && !existing) {
        var p = document.createElement('p');
        p.className = 'tf-repeat-empty';
        p.textContent = 'None entered.';
        host.appendChild(p);
      } else if (rows > 0 && existing) {
        existing.remove();
      }
    });
  }

  document.querySelectorAll('[data-add]').forEach(function (btn) {
    btn.addEventListener('click', function () { addRow(btn.getAttribute('data-add')); });
  });

  function readRows(kind) {
    var host = hosts[kind];
    if (!host) return [];
    return Array.prototype.map.call(host.querySelectorAll('[data-row]'), function (row) {
      var get = function (f) {
        var el = row.querySelector('[data-f="' + f + '"]');
        return el ? el.value : '';
      };
      return {
        el: row,
        desc: get('desc').trim(),
        amount: num(get('amount'), 0),
        month: get('month'),
        monthOfYear: parseInt(get('monthOfYear'), 10) || 1
      };
    });
  }

  function num(v, fallback) {
    var n = parseFloat(v);
    return isFinite(n) ? n : fallback;
  }

  // The numeric fields, with the range each one is allowed. `unit` is the same
  // word shown beside the box, so the error message and the UOM agree.
  var NUMERIC = [
    { id: 'r-horizon',    key: 'horizonYears',     err: 'err-horizon',    label: 'Planning horizon',  min: 1, max: 10,  integer: true,  unit: ' years',  fallback: 3 },
    { id: 'r-leads',      key: 'leads',            err: 'err-leads',      label: 'Leads per month',   min: 0, max: 100000, integer: false, unit: '',      fallback: 0 },
    { id: 'r-conversion', key: 'conversion',       err: 'err-conversion', label: 'Conversion rate',   min: 0, max: 100, integer: false, unit: '%',       fallback: 0 },
    { id: 'r-tosign',     key: 'monthsToSign',     err: 'err-tosign',     label: 'Approach to signing', min: 0, max: 60, integer: true, unit: ' months', fallback: 2 },
    { id: 'r-charge',     key: 'charge',           err: 'err-charge',     label: 'Average charge',    min: 0, max: 1000000000, integer: false, unit: '', fallback: 0 },
    { id: 'r-tocomplete', key: 'monthsToComplete', err: 'err-tocomplete', label: 'Project duration',  min: 1, max: 60,  integer: true,  unit: ' months', fallback: 3 },
    { id: 'c-commission', key: 'commissionPct',    err: 'err-commission', label: 'Commission rate',   min: 0, max: 100, integer: false, unit: '%',       fallback: 0 }
  ];

  // Reading the whole form. Returns { a: assumptions, errors: [...] }; the
  // errors are the BLOCKING conditions — the projection refuses to draw rather
  // than clamping a bad value into a plausible-looking chart.
  function readAssumptions(reveal) {
    var errors = [];
    // `reveal` forces every message out regardless of what has been touched —
    // used when the projection is asked for, where a silent block would be
    // worse than a noisy one.
    var show = function (el, msg) { return shouldShow(el, reveal) ? msg : ''; };
    var startAbs = absFromValue($('r-start') ? $('r-start').value : '');
    var approachAbs = absFromValue($('r-approach') ? $('r-approach').value : '');

    if (startAbs === null) errors.push('Enter a start month in Step 1.');
    if (approachAbs === null) errors.push('Enter the month you start approaching leads in Step 1.');

    var up = num($('r-upfront').value, NaN);
    var oc = num($('r-oncomplete').value, NaN);
    var termsBad = !isFinite(up) || !isFinite(oc) || Math.abs(up + oc - 100) > 0.001;
    setError('err-terms', (termsBad && (shouldShow($('r-upfront'), reveal) || shouldShow($('r-oncomplete'), reveal)))
      ? 'Payment terms must total 100% — currently ' + (isFinite(up) && isFinite(oc) ? (up + oc) + '%' : 'incomplete') + '.'
      : '');
    if (termsBad) errors.push('Payment terms must total 100% (Step 1).');

    var approachBad = startAbs !== null && approachAbs !== null && approachAbs < startAbs;
    setError('err-approach', (approachBad && (shouldShow($('r-approach'), reveal) || shouldShow($('r-start'), reveal)))
      ? 'You cannot approach leads before the business starts. Change this to ' +
        longLabel(startAbs) + ' or later, or move the start month earlier.'
      : '');
    if (approachBad) errors.push('The month you start approaching leads is before the start month (Step 1).');

    // Every numeric field is range-checked and REPORTED rather than silently
    // clamped: a conversion rate typed as 150 used to become 150 and quietly
    // produce 1.5 clients per lead. Out of range now blocks and says so.
    var vals = {};
    NUMERIC.forEach(function (f) {
      var el = $(f.id);
      if (!el) { vals[f.key] = f.fallback; return; }
      var raw = el.value.trim();
      var n = parseFloat(raw);
      var bad = '';
      // validity.badInput catches what `.value` hides: a number input holding
      // "e45" or "1.2.3" reports an EMPTY value, so parseFloat alone would
      // report "needs a number" for a box that visibly contains something.
      if (el.validity && el.validity.badInput) bad = f.label + ' is not a number.';
      else if (raw === '' || !isFinite(n)) bad = f.label + ' needs a number.';
      else if (n < f.min || n > f.max) bad = f.label + ' must be between ' + f.min + ' and ' + f.max + f.unit + '.';
      else if (f.integer && Math.round(n) !== n) bad = f.label + ' must be a whole number of ' + f.unit.trim() + '.';
      el.setAttribute('aria-invalid', (bad && shouldShow(el, reveal)) ? 'true' : 'false');
      setError(f.err, show(el, bad));
      if (bad) { errors.push(bad); vals[f.key] = f.fallback; }
      else vals[f.key] = f.integer ? Math.round(n) : n;
    });

    var a = {
      horizonYears: vals.horizonYears,
      startAbs: startAbs,
      approachAbs: approachAbs,
      leads: vals.leads,
      conversion: vals.conversion,
      monthsToSign: vals.monthsToSign,
      charge: vals.charge,
      upfrontPct: up,
      monthsToComplete: vals.monthsToComplete,
      commissionPct: vals.commissionPct,
      oneTime: readRows('onetime'),
      annual: readRows('annual'),
      monthly: readRows('monthly')
    };
    a.N = a.horizonYears * 12;

    // A cost dated before the start month is BLOCKED and named, never silently
    // dropped or clamped forward — the user is told to change one date or the
    // other, because only they know which one is wrong.
    var dated = [
      { kind: 'onetime', label: 'One-time', rows: a.oneTime, errId: 'err-onetime' },
      { kind: 'monthly', label: 'Monthly', rows: a.monthly, errId: 'err-monthly' }
    ];
    // Cost AMOUNTS are validated too — this was missing. A <input type=number>
    // accepts exponent notation, so "e45" sits in the box looking like an
    // entry while `.value` reads "" and `validity.badInput` is true; the old
    // code turned that into 0 and said nothing. Every row is now checked for
    // both unparseable and negative amounts.
    var amountOffenders = [];
    [['One-time', a.oneTime, 'err-amt-onetime'],
     ['Annual', a.annual, 'err-amt-annual'],
     ['Monthly', a.monthly, 'err-amt-monthly']].forEach(function (g) {
      var shown = [];
      g[1].forEach(function (r) {
        var el = r.el.querySelector('[data-f="amount"]');
        if (!el) return;
        var raw = el.value.trim();
        var badNum = (el.validity && el.validity.badInput) || (raw !== '' && !isFinite(parseFloat(raw)));
        var negative = raw !== '' && parseFloat(raw) < 0;
        // EMPTY is not wrong, it is unfinished — a row the user has only just
        // added has an empty amount by definition. It still blocks the
        // projection, but it is never called out while the form is being
        // filled in.
        var bad = badNum || negative;
        var missing = raw === '';
        var showIt = bad && shouldShow(el, reveal);
        el.setAttribute('aria-invalid', showIt ? 'true' : 'false');
        var why = missing ? 'no amount entered' : badNum ? 'not a number' : 'cannot be negative';
        if (bad || missing) amountOffenders.push(g[0] + ' — ' + (r.desc || '(unnamed)') + ': ' + why);
        if (showIt) shown.push((r.desc || '(unnamed)') + ' — ' + why);
      });
      // The inline message names only amounts that are actually WRONG;
      // merely-unfilled ones just leave the projection with nothing to draw.
      setError(g[2], shown.length ? 'Amount ' + (shown.length > 1 ? 'problems' : 'problem') + ': ' + shown.join('; ') + '.' : '');
    });
    if (amountOffenders.length) {
      errors.push('Cost amounts need fixing (Step 2): ' + amountOffenders.join('; ') + '.');
    }

    dated.forEach(function (group) {
      var offenders = [], shown = [];
      var missing = [];
      group.rows.forEach(function (r) {
        var abs = absFromValue(r.month);
        r.abs = abs;
        var control = r.el.querySelector('.tf-monthpick-value');
        var hidden = r.el.querySelector('[data-f="month"]');
        // An UNCHOSEN month is not "dated before the start month" — it is not
        // dated at all. Saying otherwise is what told a freshly added row that
        // its empty Month field was too early, before the user had touched it.
        if (abs === null) { missing.push(r.desc || '(unnamed)'); if (control) control.setAttribute('aria-invalid', reveal ? 'true' : 'false'); return; }
        var bad = startAbs !== null && abs < startAbs;
        var showIt = bad && shouldShow(hidden, reveal);
        if (control) control.setAttribute('aria-invalid', showIt ? 'true' : 'false');
        if (bad) offenders.push(r.desc || '(unnamed)');
        if (showIt) shown.push(r.desc || '(unnamed)');
      });
      if (missing.length) {
        errors.push(group.label + ' cost' + (missing.length > 1 ? 's' : '') +
          ' with no month chosen (Step 2): ' + missing.join(', ') + '.');
      }
      setError(group.errId, shown.length
        ? group.label + ' cost' + (shown.length > 1 ? 's' : '') + ' dated before the start month: ' +
          shown.join(', ') + '. Change the cost date to ' + (startAbs !== null ? longLabel(startAbs) : 'the start month') +
          ' or later, or move the start month earlier.'
        : '');
      if (offenders.length) {
        errors.push(group.label + ' cost' + (offenders.length > 1 ? 's' : '') +
          ' dated before the start month (Step 2): ' + offenders.join(', ') + '.');
      }
    });

    return { a: a, errors: errors };
  }

  function setError(id, message) {
    var el = $(id);
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  // --- 3. The model --------------------------------------------------------
  function computeModel(a) {
    var N = a.N;
    var i;

    // Signings. A lead approached in relative month m signs in m + monthsToSign,
    // so signings begin at approachOffset + monthsToSign. Cohort sizes are
    // fractional by design and are never rounded.
    var approachOffset = a.approachAbs - a.startAbs + 1;   // 1-based
    var cohort = a.leads * a.conversion / 100;
    var signings = new Array(N + 2).join(',').split(',').map(function () { return 0; });
    var leadsOutsideWindow = 0, clientsOutsideWindow = 0;

    for (var m = approachOffset; m <= N; m++) {
      var s = m + a.monthsToSign;
      if (s >= 1 && s <= N) {
        signings[s] += cohort;
      } else {
        // Approached inside the horizon, signs after it — footnote 2.
        leadsOutsideWindow += a.leads;
        clientsOutsideWindow += cohort;
      }
    }

    // Cash. Each signing cohort pays upfront in its signing month and the
    // balance when the work finishes: a project starting in month t and taking
    // `monthsToComplete` months occupies t .. t+k-1 and completes at the end of
    // t+k-1, so the completion cash lands in month t + k - 1. No collection lag.
    var revenue = zeros(N + 1);
    var upfrontCash = zeros(N + 1);
    var completionCash = zeros(N + 1);
    var completionAfterN = 0;

    for (var t = 1; t <= N; t++) {
      var c = signings[t];
      if (!c) continue;
      var up = c * a.charge * a.upfrontPct / 100;
      var bal = c * a.charge * (100 - a.upfrontPct) / 100;
      upfrontCash[t] += up;
      revenue[t] += up;
      var done = t + a.monthsToComplete - 1;
      if (done <= N) {
        completionCash[done] += bal;
        revenue[done] += bal;
      } else {
        completionAfterN += bal;          // footnote 1
      }
    }

    // Stocks: projects in flight, and clients won to date.
    var active = zeros(N + 1);
    var cumClients = zeros(N + 1);
    var running = 0;
    for (i = 1; i <= N; i++) {
      running += signings[i];
      cumClients[i] = running;
      var from = Math.max(1, i - a.monthsToComplete + 1);
      var sum = 0;
      for (var j = from; j <= i; j++) sum += signings[j];
      active[i] = sum;
    }

    // Costs.
    var oneTime = zeros(N + 1), annual = zeros(N + 1), monthly = zeros(N + 1), commission = zeros(N + 1);
    var excludedOneTime = [];

    a.oneTime.forEach(function (r) {
      if (r.abs === null || r.abs === undefined) return;
      var rel = r.abs - a.startAbs + 1;
      if (rel >= 1 && rel <= N) oneTime[rel] += r.amount;
      else if (rel > N) excludedOneTime.push(r);   // beyond the horizon, so outside every total
    });

    // Annual costs recur every 12 months from the FIRST occurrence on or after
    // the start month. delta is how many months forward the anchor first falls;
    // a start month that already matches the anchor gives delta 0, i.e. month 1.
    var annualFirsts = [];
    a.annual.forEach(function (r) {
      var delta = (r.monthOfYear - monthOfYear(a.startAbs) + 12) % 12;
      var first = delta + 1;
      annualFirsts.push({ desc: r.desc, first: first, monthOfYear: r.monthOfYear });
      for (var k = first; k <= N; k += 12) annual[k] += r.amount;
    });

    a.monthly.forEach(function (r) {
      if (r.abs === null || r.abs === undefined) return;
      var rel = Math.max(1, r.abs - a.startAbs + 1);
      for (var k = rel; k <= N; k++) monthly[k] += r.amount;
    });

    // Commission follows the CASH, not the signing — so a client on split terms
    // generates it twice, once against each payment.
    for (i = 1; i <= N; i++) commission[i] = revenue[i] * a.commissionPct / 100;

    var months = [];
    var cum = 0;
    for (i = 1; i <= N; i++) {
      // `opex` is every entered cost EXCEPT commission; `costs` is the two
      // together. Both are carried because the table, the summary and the
      // chart all now show them apart — commission is the one cost that moves
      // with revenue rather than with the plan.
      var opex = oneTime[i] + annual[i] + monthly[i];
      var total = opex + commission[i];
      var net = revenue[i] - total;
      cum += net;
      months.push({
        idx: i,
        abs: a.startAbs + i - 1,
        active: active[i],
        cumClients: cumClients[i],
        revenue: revenue[i],
        upfrontCash: upfrontCash[i],
        completionCash: completionCash[i],
        oneTime: oneTime[i],
        annual: annual[i],
        monthly: monthly[i],
        commission: commission[i],
        opex: opex,
        costs: total,
        net: net,
        cum: cum
      });
    }

    return {
      a: a,
      N: N,
      months: months,
      signings: signings,
      approachOffset: approachOffset,
      cohort: cohort,
      totals: {
        revenue: sumOf(months, 'revenue'),
        costs: sumOf(months, 'costs'),
        opex: sumOf(months, 'opex'),
        net: sumOf(months, 'net'),
        oneTime: sumOf(months, 'oneTime'),
        annual: sumOf(months, 'annual'),
        monthly: sumOf(months, 'monthly'),
        commission: sumOf(months, 'commission'),
        endCum: months.length ? months[months.length - 1].cum : 0,
        endClients: months.length ? months[months.length - 1].cumClients : 0,
        peakActive: months.reduce(function (p, x) { return Math.max(p, x.active); }, 0)
      },
      excluded: {
        completionAfterN: completionAfterN,
        leadsOutsideWindow: leadsOutsideWindow,
        clientsOutsideWindow: clientsOutsideWindow,
        oneTimeAfterN: excludedOneTime
      },
      annualFirsts: annualFirsts
    };
  }

  function zeros(n) {
    var out = [];
    for (var i = 0; i < n + 1; i++) out.push(0);
    return out;
  }
  function sumOf(rows, key) {
    return rows.reduce(function (t, r) { return t + r[key]; }, 0);
  }

  // --- 4. Aggregation ------------------------------------------------------
  // Quarters are CALENDAR-anchored (Jan–Mar, Apr–Jun, …), not horizon-anchored,
  // so a March start yields a one-month first quarter. Flow columns sum; the
  // stock columns take the period's closing value, except active projects,
  // which takes the period PEAK (see the header tooltip — a quarter's busiest
  // month is the operationally useful figure; its last month is not).
  function aggregate(model, mode) {
    if (mode === 'month') {
      return model.months.map(function (m) {
        return {
          label: shortLabel(m.abs), sublabel: yy(m.abs), full: shortDate(m.abs),
          active: m.active, cumClients: m.cumClients,
          revenue: m.revenue, opex: m.opex, commission: m.commission,
          costs: m.costs, net: m.net, cum: m.cum
        };
      });
    }
    var out = [];
    var current = null;
    model.months.forEach(function (m) {
      var q = Math.floor((monthOfYear(m.abs) - 1) / 3) + 1;
      var y = yearOf(m.abs);
      if (!current || current.q !== q || current.y !== y) {
        current = {
          q: q, y: y,
          label: 'Q' + q, sublabel: yy(m.abs), full: 'Q' + q + '-' + yy(m.abs),
          active: 0, cumClients: 0, revenue: 0, opex: 0, commission: 0,
          costs: 0, net: 0, cum: 0
        };
        out.push(current);
      }
      current.revenue += m.revenue;
      current.opex += m.opex;
      current.commission += m.commission;
      current.costs += m.costs;
      current.net += m.net;
      current.cum = m.cum;                              // closing balance
      current.cumClients = m.cumClients;                // closing count
      current.active = Math.max(current.active, m.active);   // peak in quarter
    });
    return out;
  }

  // --- 5. The chart --------------------------------------------------------
  // Hand-built SVG, no charting library. ONE shared zero line, drawn in ink:
  // revenue rises above it, total costs hang BELOW it, and cumulative net cash
  // — a dashed line on a secondary right axis — crosses it whenever the
  // business is in the red. Bars carry no stroke; the side of the zero line
  // they sit on is the non-colour cue, and the dash is the line's.
  //
  // The two axes are pinned so that zero falls at the SAME height on both.
  // Without that pinning the ink line would be truthful for the bars and a lie
  // for the dashed line, which is the one thing a two-axis chart must not do.
  var GEO = { padL: 58, padR: 58, padT: 14, padB: 44, plotH: 230, groupW: 46 };

  // A scale that always spans zero and always puts a TICK on zero, so the ink
  // line lands on a gridline rather than between two.
  function zeroScale(min, max) {
    min = Math.min(0, isFinite(min) ? min : 0);
    max = Math.max(0, isFinite(max) ? max : 0);
    var span = max - min;
    if (span <= 0) return { lo: 0, hi: 1, step: 1 };
    var raw = span / 4;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
    return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step: step };
  }

  function belowFrac(s) { return (s.hi - s.lo) === 0 ? 0 : (0 - s.lo) / (s.hi - s.lo); }

  // Give the two scales a common zero position by EXTENDING whichever one has
  // less room on the short side. Only ever grows a range, so no data point can
  // be pushed outside the plot.
  function alignZero(a, b) {
    // One axis entirely on one side of zero while the other needs the opposite
    // side would force a 0% or 100% split and defeat the pinning; open a single
    // step of room so both fractions land strictly inside (0, 1).
    if (a.hi === 0 && b.hi > 0) a.hi = a.step;
    if (b.hi === 0 && a.hi > 0) b.hi = b.step;
    if (a.lo === 0 && b.lo < 0) a.lo = -a.step;
    if (b.lo === 0 && a.lo < 0) b.lo = -b.step;

    var f = Math.max(belowFrac(a), belowFrac(b));
    if (f <= 0 || f >= 1) return;                    // both wholly above or below zero
    if (belowFrac(a) < f) a.lo = -f * a.hi / (1 - f);
    if (belowFrac(b) < f) b.lo = -f * b.hi / (1 - f);
  }

  // Ticks generated OUTWARD from zero, so zero is always present and the
  // spacing stays even after alignZero has stretched a bound off the step grid.
  function ticksOf(s) {
    var out = [0], v;
    for (v = s.step; v <= s.hi + s.step / 1000; v += s.step) out.push(round6(v));
    for (v = -s.step; v >= s.lo - s.step / 1000; v -= s.step) out.push(round6(v));
    return out;
  }
  function round6(v) { return Math.round(v * 1e6) / 1e6; }

  function buildChart(periods, mode) {
    var t = tokens();
    var n = periods.length;
    var width = GEO.padL + n * GEO.groupW + GEO.padR;
    var height = GEO.padT + GEO.plotH + GEO.padB;
    var top = GEO.padT, bottom = GEO.padT + GEO.plotH;
    var plotL = GEO.padL, plotR = width - GEO.padR;

    var maxRev = 0, maxCost = 0, minCum = 0, maxCum = 0;
    periods.forEach(function (p) {
      maxRev = Math.max(maxRev, p.revenue);
      maxCost = Math.max(maxCost, p.costs);   // the stack's full depth: opex + commission
      minCum = Math.min(minCum, p.cum);
      maxCum = Math.max(maxCum, p.cum);
    });

    // Costs are plotted DOWNWARD, so they enter the scale as negatives.
    var left = zeroScale(-maxCost, maxRev);
    var right = zeroScale(minCum, maxCum);
    alignZero(left, right);

    var yL = function (v) { return bottom - (v - left.lo) / (left.hi - left.lo) * GEO.plotH; };
    var yR = function (v) { return bottom - (v - right.lo) / (right.hi - right.lo) * GEO.plotH; };
    var yZero = yL(0);

    var s = '';

    // Gridlines + left axis labels. Zero is skipped here — it gets the ink line
    // below, drawn last so nothing overlaps it.
    ticksOf(left).forEach(function (v) {
      var y = yL(v);
      if (v !== 0) {
        s += '<line x1="' + plotL + '" y1="' + r2(y) + '" x2="' + plotR + '" y2="' + r2(y) +
             '" stroke="' + t.grid + '" stroke-width="1"/>';
      }
      s += '<text x="' + (plotL - 6) + '" y="' + r2(y + 3) + '" text-anchor="end" font-size="10" fill="' +
           t.inkSoft + '" font-family="' + FONT + '">' + esc(moneyCompact(v)) + '</text>';
    });

    // Right axis labels only — its gridlines would double the left's, and its
    // zero is the same ink line by construction.
    ticksOf(right).forEach(function (v) {
      s += '<text x="' + (plotR + 6) + '" y="' + r2(yR(v) + 3) + '" text-anchor="start" font-size="10" fill="' +
           t.inkSoft + '" font-family="' + FONT + '">' + esc(moneyCompact(v)) + '</text>';
    });

    // Bars — ONE column per period, not two side by side. Revenue stacks upward
    // from zero and total costs stack downward from the same x, so a month's
    // money in and money out are read on a single vertical rather than
    // compared across a gap. No stroke.
    var barW = 22;
    periods.forEach(function (p, i) {
      var x = plotL + i * GEO.groupW + (GEO.groupW - barW) / 2;
      s += bar(x, yL(p.revenue), barW, yZero - yL(p.revenue), t.revenueFill,
               p.full + ' revenue ' + money(p.revenue));
      // The below-zero bar is STACKED: entered costs first, then commission
      // beneath them. Commission is the one outgoing that moves with revenue
      // rather than with the plan, so seeing its share of a month's costs is
      // the point of splitting it out.
      var yOpexEnd = yL(-p.opex);
      s += bar(x, yZero, barW, yOpexEnd - yZero, t.costsFill,
               p.full + ' costs ' + money(p.opex));
      s += bar(x, yOpexEnd, barW, yL(-p.costs) - yOpexEnd, t.commissionFill,
               p.full + ' commission ' + money(p.commission));
    });

    // Cumulative net cash — dashed, right axis, crossing the ink line when the
    // running position is negative.
    var pts = periods.map(function (p, i) {
      return r2(plotL + i * GEO.groupW + GEO.groupW / 2) + ',' + r2(yR(p.cum));
    }).join(' ');
    s += '<polyline points="' + pts + '" fill="none" stroke="' + t.ink +
         '" stroke-width="2" stroke-dasharray="6 4" stroke-linejoin="round"/>';
    periods.forEach(function (p, i) {
      s += '<circle cx="' + r2(plotL + i * GEO.groupW + GEO.groupW / 2) + '" cy="' + r2(yR(p.cum)) +
           '" r="2.5" fill="' + t.ink + '"><title>' + esc(p.full + ' cumulative ' + money(p.cum)) + '</title></circle>';
    });

    // The $0 line — ink, 2px, full width, drawn LAST so it reads as the chart's
    // spine rather than something the bars sit on top of.
    s += '<line x1="' + plotL + '" y1="' + r2(yZero) + '" x2="' + plotR + '" y2="' + r2(yZero) +
         '" stroke="' + t.ink + '" stroke-width="2"/>';

    // X labels sit under the PLOT, not under the zero line, which is now
    // somewhere in the middle.
    periods.forEach(function (p, i) {
      var cx = plotL + i * GEO.groupW + GEO.groupW / 2;
      s += '<text x="' + r2(cx) + '" y="' + (bottom + 15) + '" text-anchor="middle" font-size="10" fill="' + t.inkSoft +
           '" font-family="' + FONT + '">' + esc(p.label) + '</text>';
      s += '<text x="' + r2(cx) + '" y="' + (bottom + 27) + '" text-anchor="middle" font-size="10" fill="' + t.inkSoft +
           '" font-family="' + FONT + '">' + esc(p.sublabel) + '</text>';
    });

    var last = periods[periods.length - 1];
    var label = 'Per ' + (mode === 'month' ? 'month' : 'quarter') + ', revenue is drawn above a zero line and ' +
      'total costs below it, with cumulative net cash as a dashed line on a secondary axis. Revenue peaks at ' +
      money(maxRev) + ', costs at ' + money(maxCost) + '; cumulative net cash runs from ' + money(minCum) +
      ' at its lowest to ' + money(last ? last.cum : 0) + ' at the end of the horizon. ' +
      'The table below carries the same figures.';

    // width/height attributes (not only a viewBox) so the PDF path can load the
    // serialized SVG into an Image at a known size.
    var open = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height +
      '" viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="' + esc(label) + '">' +
      '<rect x="0" y="0" width="' + width + '" height="' + height + '" fill="' + t.paper + '"/>';
    return { svg: open + s + '</svg>', width: width, height: height };
  }

  var FONT = "'Space Grotesk','Helvetica Neue',Arial,sans-serif";
  function r2(v) { return Math.round(v * 100) / 100; }
  // No stroke: the bars lost their outlines on review. Height is clamped at 0
  // so a zero-value period draws nothing rather than a 1px sliver.
  function bar(x, y, w, h, fill, title) {
    if (h < 0.5) return '';
    return '<rect x="' + r2(x) + '" y="' + r2(y) + '" width="' + w + '" height="' + r2(h) +
      '" fill="' + fill + '"><title>' + esc(title) + '</title></rect>';
  }

  function renderChart(periods, mode) {
    var host = $('chart-host');
    if (!host) return null;
    var built = buildChart(periods, mode);
    host.innerHTML = built.svg;
    var svg = host.querySelector('svg');
    if (svg) {
      // Monthly keeps its natural width and scrolls sideways at a readable bar
      // width; quarterly is scaled to fit the panel.
      if (mode === 'month') { svg.removeAttribute('style'); }
      else { svg.style.width = '100%'; svg.style.height = 'auto'; }
    }
    var legend = $('chart-legend');
    var t = tokens();
    if (legend) {
      legend.innerHTML =
        '<span><span class="tf-chart-swatch" style="background:' + t.revenueFill + '"></span>Revenue</span>' +
        '<span><span class="tf-chart-swatch" style="background:' + t.costsFill + '"></span>Cost</span>' +
        '<span><span class="tf-chart-swatch" style="background:' + t.commissionFill + '"></span>Commission</span>' +
        '<span><span class="tf-chart-swatch tf-chart-swatch-line"></span>Cumulative net cash (right axis)</span>';
    }
    return built;
  }

  // --- Table ---------------------------------------------------------------
  function renderProjectionTable(periods, mode, model) {
    var table = $('table-projection');
    if (!table) return;
    var head = mode === 'month' ? 'Month' : 'Quarter';
    var activeTitle = mode === 'month' ? 'Projects in flight that month' : 'Peak projects in flight during the quarter';

    // Cost and Commission are separate columns; the single-month Net cash
    // column is gone — it was the arithmetic of the three columns beside it,
    // and Cumulative cash is the figure a reader actually follows down the
    // page.
    var html =
      '<colgroup><col><col><col><col><col><col><col></colgroup>' +
      '<thead><tr>' +
      '<th>' + head + '</th>' +
      '<th title="' + activeTitle + '">Active projects</th>' +
      '<th>Cumulative clients</th>' +
      '<th>Revenue</th>' +
      '<th>Cost</th>' +
      '<th>Commission</th>' +
      '<th>Cumulative cash</th>' +
      '</tr></thead><tbody>';

    periods.forEach(function (p) {
      html += '<tr>' +
        '<td>' + esc(p.full) + '</td>' +
        '<td>' + clients(p.active) + '</td>' +
        '<td>' + clients(p.cumClients) + '</td>' +
        '<td>' + money(p.revenue) + '</td>' +
        '<td>' + money(p.opex) + '</td>' +
        '<td>' + money(p.commission) + '</td>' +
        '<td>' + money(p.cum) + '</td>' +
        '</tr>';
    });

    // Totals. The three FLOW columns sum. The three stock/cumulative columns
    // cannot: cumulative clients and cumulative cash are already running
    // totals, so their horizon figure is the closing value, and summing active
    // projects across months would count each project once per month it runs.
    // Active projects therefore shows the horizon PEAK.
    var T = model.totals;
    html += '</tbody><tfoot><tr>' +
      '<td><strong>Horizon</strong></td>' +
      '<td title="Peak, not a sum">' + clients(T.peakActive) + '</td>' +
      '<td title="Closing count">' + clients(T.endClients) + '</td>' +
      '<td><strong>' + money(T.revenue) + '</strong></td>' +
      '<td><strong>' + money(T.opex) + '</strong></td>' +
      '<td><strong>' + money(T.commission) + '</strong></td>' +
      '<td title="Closing balance"><strong>' + money(T.endCum) + '</strong></td>' +
      '</tr></tfoot>';
    table.innerHTML = html;
  }

  // Horizon summary — the five headline figures, not the cost-type breakdown
  // this block first carried. Breakeven is the first period whose CUMULATIVE
  // cash is non-negative: the month the business has earned back everything it
  // has spent to date, which is the number a reader actually looks for.
  function breakeven(model) {
    for (var i = 0; i < model.months.length; i++) {
      if (model.months[i].cum >= 0) return model.months[i];
    }
    return null;
  }

  function renderSummary(model) {
    var host = $('summary');
    if (!host) return;
    var T = model.totals;
    var be = breakeven(model);
    // Two deliberate lines: the three horizon TOTALS, then the two figures that
    // answer "when does this turn, and where does it end". Splitting them stops
    // five equal-looking numbers reading as one undifferentiated row.
    var rows = [
      [['Total revenue', money(T.revenue)], ['Total cost', money(T.opex)], ['Total commission', money(T.commission)]],
      [['Breakeven month', be ? shortDate(be.abs) + ' (month ' + be.idx + ')' : 'Not within the horizon'],
       ['End cash', money(T.endCum)]]
    ];
    host.innerHTML = rows.map(function (row) {
      return '<div class="tf-summary-row">' + row.map(function (p) {
        return '<div><span class="tf-summary-label">' + esc(p[0]) + '</span>' +
          '<span class="tf-summary-value">' + esc(p[1]) + '</span></div>';
      }).join('') + '</div>';
    }).join('');
  }

  // --- Footnotes -----------------------------------------------------------
  // Six notes, every figure computed from the user's own inputs — nothing here
  // is a hardcoded number.
  function footnoteTexts(model) {
    var a = model.a, X = model.excluded, T = model.totals;
    var endLabel = longLabel(a.startAbs + model.N - 1);

    var n1 = 'The horizon total excludes completion payments from clients signed near the end, ' +
      'whose work finishes after ' + endLabel + ' — ' + money(X.completionAfterN) + ' of billed work ' +
      'falls outside the window on a ' + a.monthsToComplete + '-month project at ' +
      (100 - a.upfrontPct) + '% on completion.';

    var n2 = 'It also excludes leads approached in the final ' + a.monthsToSign + ' month' +
      (a.monthsToSign === 1 ? '' : 's') + ' of the horizon, which convert outside the window: ' +
      clients(X.leadsOutsideWindow) + ' leads, about ' + clients(X.clientsOutsideWindow) +
      ' clients and ' + money(X.clientsOutsideWindow * a.charge) + ' of billings.';

    var n3 = 'Commission is paid in the month the cash is received, not the month the client signs — ' +
      'so a client on ' + a.upfrontPct + '/' + (100 - a.upfrontPct) + ' terms generates it twice. At ' +
      a.commissionPct + '% that is ' + money(T.commission) + ' across the horizon.';

    var n4 = 'Monthly and annual costs run to the end of the horizon; neither is given an end date. ' +
      'Across ' + model.N + ' months that is ' + money(T.monthly) + ' of monthly costs from ' +
      a.monthly.length + ' line' + (a.monthly.length === 1 ? '' : 's') + ', and ' + money(T.annual) +
      ' of annual costs from ' + a.annual.length + ' line' + (a.annual.length === 1 ? '' : 's') + '.';

    var firsts = model.annualFirsts.map(function (f) {
      return (f.desc || MONTHS_LONG[f.monthOfYear - 1]) + ' in month ' + f.first;
    });
    var n5 = 'Annual costs recur every 12 months from the first occurrence on or after the start month, ' +
      'so a start month matching the anchor pays in month 1' +
      (firsts.length ? ' — ' + firsts.join('; ') + '.' : '. No annual costs are entered.');

    var n6 = 'No capacity limit is applied. Active projects peak at ' + clients(T.peakActive) +
      ' concurrently and are not checked for deliverability against the costs entered — ' +
      'if that peak needs more people than the monthly costs pay for, this model will not say so.';

    return [n1, n2, n3, n4, n5, n6];
  }

  function renderFootnotes(model) {
    var host = $('footnotes');
    if (!host) return;
    host.innerHTML = footnoteTexts(model).map(function (n) {
      return '<li>' + esc(n) + '</li>';
    }).join('');
  }

  // --- Assumptions recap (page 2 of the printed / PDF output) ---------------
  function recapRows(model) {
    var a = model.a;
    var rows = [
      ['Planning horizon', a.horizonYears + ' year' + (a.horizonYears === 1 ? '' : 's') + ' (' + model.N + ' months)'],
      ['Start month', longLabel(a.startAbs)],
      ['Start approaching leads', longLabel(a.approachAbs)],
      ['Leads approached per month', clients(a.leads)],
      ['Conversion to paying client', a.conversion + '%'],
      ['Months from approach to signing', String(a.monthsToSign)],
      ['Average charge per client', money(a.charge)],
      ['Payment terms', a.upfrontPct + '% upfront, ' + (100 - a.upfrontPct) + '% on completion'],
      ['Months to complete a project', String(a.monthsToComplete)],
      ['Sales commission', a.commissionPct + '% of revenue']
    ];
    var listOr = function (label, items, fmt) {
      rows.push([label, items.length ? items.map(fmt).join('; ') : 'None entered']);
    };
    listOr('One-time purchases', a.oneTime, function (r) {
      return (r.desc || '(unnamed)') + ' — ' + money(r.amount) + ', ' +
        (r.abs !== null && r.abs !== undefined ? longLabel(r.abs) : 'no date');
    });
    listOr('Annual costs', a.annual, function (r) {
      return (r.desc || '(unnamed)') + ' — ' + money(r.amount) + ', every ' + MONTHS_LONG[r.monthOfYear - 1];
    });
    listOr('Monthly costs', a.monthly, function (r) {
      return (r.desc || '(unnamed)') + ' — ' + money(r.amount) + '/mo from ' +
        (r.abs !== null && r.abs !== undefined ? longLabel(r.abs) : 'no date');
    });
    return rows;
  }

  function renderRecap(model) {
    var host = $('recap');
    if (!host) return;
    host.innerHTML = recapRows(model).map(function (r) {
      return '<dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd>';
    }).join('');
  }

  // --- Refresh -------------------------------------------------------------
  var VIEW = null;          // 'month' | 'quarter'; null until the first refresh
  var VIEW_CHOSEN = false;  // true once the user works the toggle themselves
  var LAST = null;          // { model, periods, mode } for the PDF path

  function refresh() {
    syncMonthBounds();
    // reveal=false: step 3 does not flood steps 1 and 2 with red on arrival.
    // Inline errors are earned by touching a field, and the quiet note below
    // covers the "nothing to show yet" case.
    var read = readAssumptions(false);
    var blocked = $('projection-blocked');
    var body = $('projection-body');

    if (read.errors.length) {
      // NO aggregated error list. Problems are caught inline, beside the field
      // that has them, as the form is filled in — restating all of them here
      // as a red wall was the thing review rejected, and after "Start over"
      // (which empties everything by design) it fired on every single field at
      // once. What is left is a plain statement of why there is nothing to
      // show, in body colour, with no icon and no alarm.
      if (blocked) {
        // One quiet sentence, and it names the step so an unfinished row left
        // somewhere in step 2 is not a silent dead end — but it stays a
        // statement of state, not a list of faults.
        var step1 = read.errors.some(function (e) { return /Step 1/.test(e); });
        var step2 = read.errors.some(function (e) { return /Step 2/.test(e); });
        var note = step1 && step2 ? 'Finish Steps 1 and 2 to see the projection.'
          : step2 ? 'Finish the cost entries in Step 2 to see the projection.'
          : 'Fill in Step 1 to see the projection.';
        blocked.hidden = false;
        blocked.innerHTML = '<p class="tf-empty-note">' + note + '</p>';
      }
      if (body) body.hidden = true;
      LAST = null;
      clearProjection();
      return;
    }

    if (blocked) { blocked.hidden = true; blocked.innerHTML = ''; }
    if (body) body.hidden = false;

    var model = computeModel(read.a);
    // Quarterly is the default whenever the horizon exceeds 24 months, monthly
    // otherwise. Re-derived on every refresh so that shortening the horizon
    // moves it back to monthly — until the user works the toggle themselves,
    // after which their choice stands and is never overridden.
    if (!VIEW_CHOSEN) VIEW = model.N > 24 ? 'quarter' : 'month';
    setViewButtons();

    var periods = aggregate(model, VIEW);
    renderChart(periods, VIEW);
    renderFootnotes(model);
    renderRecap(model);
    renderSummary(model);
    renderProjectionTable(periods, VIEW, model);
    LAST = { model: model, periods: periods, mode: VIEW };
  }

  // Empty every rendered part of step 3. Hiding the panel is not enough: the
  // markup survives inside it, so anything that shows the body again — a view
  // toggle, a stray refresh, a future code path — would flash the previous
  // model's chart and table. Clearing is the only state that cannot go stale.
  function clearProjection() {
    ['chart-host', 'chart-legend', 'footnotes', 'recap', 'summary'].forEach(function (id) {
      var el = $(id);
      if (el) el.innerHTML = '';
    });
    var table = $('table-projection');
    if (table) table.innerHTML = '';
  }

  function setViewButtons() {
    document.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-view') === VIEW ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-view]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      VIEW = btn.getAttribute('data-view');
      VIEW_CHOSEN = true;
      refresh();
    });
  });

  // --- 6. PDF --------------------------------------------------------------
  // Pagination is stated TWICE — here with addPage(), and in STYLE.css's
  // @media print block with break-before: page. They must stay in step:
  //   page 1  chart + footnotes
  //   page 2  assumptions recap
  //   page 3+ cost summary + the table
  // If the CDN is blocked or an SRI hash fails, window.jspdf is undefined and
  // we fall back to window.print(), which paginates the same way.

  // The SVG is rasterized through an <img> so jsPDF can place it. This is why
  // buildChart writes colours as attributes rather than CSS classes — an
  // external stylesheet does not apply inside an img-loaded SVG.
  function svgToPng(svgMarkup, width, height, scale) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        try {
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(width * scale);
          canvas.height = Math.round(height * scale);
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = tokens().paper;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) { reject(e); }
      };
      img.onerror = function () { reject(new Error('SVG rasterization failed')); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgMarkup);
    });
  }

  /* The page's own text, for the PDF. Scoped to .tf-tool-content so the
     selectors cannot pick up a panel's copy. Never restated in JS: editing the
     markup changes the PDF in the same edit, so the two cannot drift apart.
     Empty string rather than a stale fallback, so a markup change can never
     resurrect old wording. */
  function headText(sel) {
    var el = document.querySelector('.tf-tool-content ' + sel);
    return el ? el.textContent.trim() : '';
  }

  /* The foot-of-page disclaimer + privacy block, paragraph by paragraph. The
     .tf-meta heading is skipped — the PDF prints its own heading — and the
     paragraphs keep their source order (generic, privacy, tool-specific). */
  function legalParagraphs() {
    var block = document.querySelector('[data-tool-legal]');
    if (!block) return [];
    return [].map.call(block.querySelectorAll('p:not(.tf-meta)'), function (p) {
      return p.textContent.trim();
    }).filter(Boolean);
  }

  function writeWrapped(doc, text, x, y, maxWidth, lineHeight) {
    var lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + lines.length * lineHeight;
  }

  function buildPdf() {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor || !LAST) { window.print(); return; }

    var model = LAST.model, periods = LAST.periods, mode = LAST.mode;
    // compress: true is not cosmetic — the chart goes in as a raster, and
    // without it jsPDF embeds the bitmap uncompressed (a 36-month chart
    // produced a 7.7MB file before this was added).
    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4', compress: true });
    var margin = 34;                                   // 12mm ≈ 34pt, matching @page
    var width = doc.internal.pageSize.getWidth();
    var inner = width - margin * 2;
    var ink = [38, 34, 31], inkSoft = [85, 80, 77], sand = [229, 223, 215];

    // --- page 1: byline, then chart + footnotes
    var y0 = margin;
    y0 = drawByline(doc, margin, y0, width - margin);

    // Title + intro + disclaimer — READ FROM THE DOM, never restated here. The
    // page's header is the single source, so editing the markup changes the PDF
    // in the same edit. The disclaimer previously carried a hand-tightened
    // PARAPHRASE of the page's; it now prints the page's own sentence verbatim.
    var y = y0;
    doc.setFont('times', 'bold').setFontSize(20).setTextColor.apply(doc, ink);
    doc.text(headText('h1'), margin, y);
    y += 18;
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor.apply(doc, ink);
    y = writeWrapped(doc, headText('.tf-prose-intro'), margin, y, inner, 13);
    y += 10;

    // Disclaimer + privacy block, at the TOP of the document, ahead of the chart
    // and tables. Read from the page's own foot block, paragraph for paragraph;
    // this replaces the hand-tightened paraphrase that used to live here.
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor.apply(doc, inkSoft);
    doc.text(headText('[data-tool-legal] .tf-meta'), margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    legalParagraphs().forEach(function (para) {
      y = writeWrapped(doc, para, margin, y, inner, 10);
      y += 5;
    });
    y += 5;

    var chart = buildChart(periods, mode);
    // Rasterize at 2x the size it will actually be DRAWN at, not 2x the SVG's
    // own pixel width — a 36-month chart is ~1772px wide on screen but lands in
    // a 527pt column, so sampling off the source width oversamples it by ~3x
    // for no visible gain.
    var drawW = inner;
    var drawH = chart.height * (drawW / chart.width);
    var scale = Math.min(3, Math.max(0.5, (drawW * 2) / chart.width));

    svgToPng(chart.svg, chart.width, chart.height, scale).then(function (png) {
      doc.addImage(png, 'PNG', margin, y, drawW, drawH);
      return y + drawH + 16;
    }, function () {
      doc.setFont('helvetica', 'italic').setFontSize(9).setTextColor.apply(doc, inkSoft);
      doc.text('Chart could not be rendered in this export — the figures are in the table on the following pages.', margin, y);
      return y + 20;
    }).then(function (yAfter) {
      // Footnotes, still page 1.
      doc.setFont('times', 'bold').setFontSize(11).setTextColor.apply(doc, ink);
      doc.text('Notes', margin, yAfter);
      yAfter += 12;
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, inkSoft);
      footnoteTexts(model).forEach(function (note, i) {
        yAfter = writeWrapped(doc, (i + 1) + '. ' + note, margin, yAfter, inner, 10) + 3;
      });

      // --- page 2: assumptions recap
      doc.addPage();
      var y2 = margin;
      doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, ink);
      doc.text('Assumptions', margin, y2);
      y2 += 8;
      doc.autoTable({
        startY: y2 + 6,
        margin: { left: margin, right: margin },
        head: [['Assumption', 'Value']],
        body: recapRows(model),
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: ink, lineColor: sand, lineWidth: 0.5, valign: 'top' },
        headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
        columnStyles: { 0: { cellWidth: 150, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } }
      });

      // --- page 3+: cost summary + the projection table
      doc.addPage();
      var y3 = margin;
      doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, ink);
      doc.text('Projection', margin, y3);
      y3 += 16;
      var T = model.totals;
      var be = breakeven(model);
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, inkSoft);
      doc.text('Total revenue ' + money(T.revenue) + '   total cost ' + money(T.opex) +
        '   commission ' + money(T.commission) +
        '   breakeven ' + (be ? longLabel(be.abs) : 'not within the horizon') +
        '   end cash ' + money(T.endCum), margin, y3);
      y3 += 12;

      doc.autoTable({
        startY: y3,
        margin: { left: margin, right: margin },
        head: [[mode === 'month' ? 'Month' : 'Quarter', 'Active', 'Cum. clients', 'Revenue', 'Cost', 'Commission', 'Cumulative']],
        body: periods.map(function (p) {
          return [p.full, clients(p.active), clients(p.cumClients), money(p.revenue),
                  money(p.opex), money(p.commission), money(p.cum)];
        }),
        foot: [['Horizon', clients(T.peakActive) + ' peak', clients(T.endClients), money(T.revenue),
                money(T.opex), money(T.commission), money(T.endCum)]],
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: ink, lineColor: sand, lineWidth: 0.5, valign: 'top' },
        headStyles: { fillColor: false, textColor: inkSoft, fontStyle: 'bold', lineColor: sand },
        footStyles: { fillColor: false, textColor: ink, fontStyle: 'bold', lineColor: sand },
        columnStyles: { 0: { cellWidth: 62 }, 1: { halign: 'right' }, 2: { halign: 'right' },
                        3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } }
      });

      doc.save('general-cashflow-' + mode + 'ly.pdf');
    })['catch'](function () { window.print(); });
  }

  document.querySelectorAll('[data-pdf]').forEach(function (btn) {
    btn.addEventListener('click', buildPdf);
  });

  // --- Live validation -----------------------------------------------------
  // Errors surface WHERE and WHEN they are made, not only on arriving at step
  // 3. readAssumptions() is already the single place every rule lives, and it
  // writes each field's own message as a side effect — so validating live is
  // just calling it and throwing the result away. One definition of "valid",
  // two moments of use.
  function validateLive() {
    readAssumptions(false);
    // Keep step 3 honest if it happens to be the visible panel.
    if (panels.projection && !panels.projection.hidden) refresh();
  }
  // `input` re-validates but never PROMOTES a field to touched — so a wrong
  // value is cleared from the screen the moment it becomes right, while a
  // half-typed one is never called out. `change` and `focusout` are what mark
  // a field as finished with. The month picker's commit dispatches `change` on
  // its hidden input, so choosing a month counts as finishing too.
  document.addEventListener('input', function (e) {
    if (e.target.closest('[data-assume], [data-row]')) validateLive();
  });
  function finishField(e) {
    var el = e.target;
    if (!el.closest || !el.closest('[data-assume], [data-row]')) return;
    TOUCHED.add(el);
    validateLive();
  }
  document.addEventListener('change', finishField);
  document.addEventListener('focusout', finishField);

  // --- Start over ----------------------------------------------------------
  // Clears everything entered and puts the tool back to its opening state.
  // Nothing here is persisted (no storage, no server), so "start over" means
  // this page's current contents — but a model can be twenty entries deep, so
  // the control ASKS before it wipes. The confirmation is the button relabelling
  // itself rather than a modal: the sheet has no dialog pattern, and inventing
  // one for a single control would be the larger change. It reverts on a second
  // thought (blur, or any other click on the page).
  function startOver() {
    // EVERY box is emptied, the prefilled ones included — "start over" means a
    // blank sheet, not the opening defaults back again. The page's own
    // `value=` attributes still prefill on FIRST load, which is where a
    // sensible starting point helps; this is the explicit request for none.
    // Placeholders keep the expected shape of each answer visible while empty.
    document.querySelectorAll('[data-assume]').forEach(function (el) {
      el.value = '';
      el.setAttribute('aria-invalid', 'false');
    });
    document.querySelectorAll('[data-monthpick]').forEach(function (wrap) {
      if (wrap.__mp) paintValue(wrap.__mp);
    });
    // Must stay a WeakSet. Reassigning `{}` here (a leftover from when this was
    // keyed by id) made TOUCHED.has() throw on the next validation pass, which
    // took refresh() down with it — so step 3 kept its previous chart and
    // table and never even reached the "nothing to show" note.
    TOUCHED = new WeakSet();             // nothing has been asked yet, so nothing is wrong yet
    COST_KINDS.forEach(function (kind) {
      var host = hosts[kind];
      if (host) host.querySelectorAll('[data-row]').forEach(function (row) { row.remove(); });
    });
    ['err-terms', 'err-approach', 'err-onetime', 'err-monthly'].forEach(function (id) { setError(id, ''); });
    NUMERIC.forEach(function (f) { setError(f.err, ''); });
    VIEW = null;
    VIEW_CHOSEN = false;                 // the horizon rule governs again
    LAST = null;
    clearProjection();
    syncMonthBounds();                   // no start month yet, so no floor to apply
    renderEmptyStates();
    location.hash = 'revenue';
    activate('revenue');
  }

  // One click, no confirmation step. An "are you sure?" relabel was tried and
  // rejected on review: it read as the button not working, especially from
  // step 3 where the second click often landed after something else had
  // already disarmed it. Start over clears EVERY step, not the visible one —
  // it always has, and removing the two-step made that legible.
  document.querySelectorAll('[data-reset]').forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.stopPropagation(); startOver(); });
  });

  // --- Boot ----------------------------------------------------------------
  initDefaults();
  renderEmptyStates();
  // Re-floor every date control when the start month moves, so the block is
  // enforced from the moment the start month changes rather than at submit.
  if ($('r-start')) $('r-start').addEventListener('change', function () {
    syncMonthBounds();
    validateLive();
  });
  activate(currentTab());
})();
