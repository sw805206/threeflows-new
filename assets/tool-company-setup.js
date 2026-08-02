/* tool-company-setup.js — the Company Setup Checklist tool's engine (its own
   file from day one, per SCOPE.md, so a future paid app can share the same
   logic). Three pieces:

   1. Step switching — a vertical step rail (.tf-step-nav) acting as a
      role=tablist; only the active step's panel shows, deep-linkable via
      location.hash (#decide / #prep / #post, default #decide) — the same
      [hidden]-attribute + hashchange idiom references.js established, just
      with the nav rendered as a left rail instead of top tabs.
   2. Entity-type recommendation — reads the three-question radio form and
      renders a recommendation into #qa-result. Logic ported as-is from the
      human-reviewed reference implementation (source of truth for content).
   3. The two data tables (Prep & filing, Post-filing setup) — rendered from
      plain arrays. The first column is the step NUMBER, colour-coded by
      responsibility (You / Assist / We) with the meaning in a title tooltip
      and named in the page's legend. "Download PDF" routes through
      window.print(): the print stylesheet IS the PDF layout, and every
      browser's print dialog offers "Save as PDF", so one code path serves
      both.

   No network calls; all content is local. Soft-fail: a missing DOM node is
   checked before use, so the page still renders if a marker is absent. */
(function () {
  'use strict';

  // --- 1. Step switching -------------------------------------------------
  var TAB_KEYS = ['decide', 'prep', 'post'];
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
  activate(currentTab());

  // --- 2. Entity-type recommendation ------------------------------------
  var qaResult = document.getElementById('qa-result');
  var qaSubmit = document.getElementById('qa-submit');

  function getChecked(name) {
    var el = document.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : null;
  }

  function computeResult() {
    if (!qaResult) return;
    var citizenship = getChecked('citizenship');
    var driver = getChecked('driver');
    var licensed = getChecked('licensed');

    if (!driver || (driver === 'self' && !licensed)) {
      qaResult.innerHTML = '<p class="tf-choice-hint">Answer &ldquo;What&rsquo;s driving formation?&rdquo;' +
        (driver === 'self' ? ' and the licensed-professional question' : '') +
        ' to see a recommendation.</p>';
      return;
    }

    var entity, note;
    if (driver === 'capital') {
      entity = 'C-Corp';
      note = 'Institutional investors typically require the share structure and stock classes a C-Corp provides. Note: an S-Corp election is not available here regardless of citizenship — the investor stock structure blocks it.';
    } else if (driver === 'nonprofit') {
      entity = 'Non-profit';
      note = 'No owners or shareholders, no profit distribution. Pursuing federal tax-exempt status (501(c)(3) or similar) is a separate process from state formation.';
    } else if (licensed === 'yes') {
      entity = 'LLP';
      note = 'Fits a licensed-professional partnership where each partner needs protection from the others’ malpractice, with pass-through taxation. Confirm your state permits LLPs — many restrict them to licensed professions.';
    } else {
      entity = 'LLC';
      note = 'The default for most small businesses — flexible ownership, liability protection, pass-through taxation.';
      if (citizenship === 'Yes') {
        note += ' As a US citizen/green card holder, an S-Corp election becomes available once profit justifies it — that’s a later decision with your CPA, not a formation-day one.';
      } else if (citizenship === 'No') {
        note += ' S-Corp election is not available to non-US citizens — an LLC or C-Corp are the realistic paths.';
      } else {
        note += ' Whether an S-Corp election is available later depends on citizenship — confirm this with your CPA once you’re past formation.';
      }
    }

    qaResult.innerHTML =
      '<div class="tf-callout tf-callout-warn">' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
      '<div><div class="tf-callout-title">Recommended: ' + entity + '</div>' +
      '<p class="tf-callout-body">' + note + '</p></div></div>';
  }

  if (qaSubmit) qaSubmit.addEventListener('click', computeResult);

  // --- 3. Data tables ------------------------------------------------------
  // Row shape: [who, step, time, cost estimate, cost type].
  // `who` is one of: you (you must own it) / assist (we can do it together) /
  // we (we can execute it). Content, ordering and cost estimates all supplied
  // by the human (2026-07-29) — this array IS the source of truth for the
  // table; do not re-sort it.
  var STEP_PREP = [
    ['assist', 'Brainstorm names; check state name availability + USPTO trademark conflicts', '3–5 days', 'Public search, no charge', 'Free'],
    ['we', 'Once name decided: register the domain', 'Same day', '$10–20/yr', '3rd party charge'],
    ['we', 'Privacy layer: virtual mailbox, business phone, business email', '1–3 days', '$100–300/yr agent + $10–50/mo mailbox + $10–20/mo phone', '3rd party charge'],
    ['you', 'Decide who files: CPA, formation service, or yourself', '1–2 days', '$50–300 formation service, or $150–400/hr CPA', '3rd party charge'],
    ['you', 'Confirm calendar vs. fiscal tax year with your CPA', '15 min', 'Part of CPA relationship, or $0', 'Included'],
    ['assist', 'Submit formation documents + pay filing fee', 'Same day', '$50–500, state-set', 'Gov charge'],
    ['assist', 'Wait for state approval / certificate of formation', '1 day – 6 weeks', '$0–200 optional expedite', 'Gov charge'],
    ['assist', 'If operating outside filing state: foreign-entity registration', '1–4 weeks (parallel)', '$50–300, state-set', 'Gov charge'],
    ['you', 'Obtain EIN from IRS', 'Same day – 4 weeks', 'IRS, no charge', 'Free']
  ];
  var STEP_POST = [
    ['assist', 'Draft operating agreement (LLC/LLP) or bylaws (corp)', '1–3 days – 2 weeks', '$0 template – $500–1,500 attorney', '3rd party charge'],
    ['you', 'Open business bank account (EIN + formation docs)', '1–3 days', '$0–25 to open, some monthly fees', '3rd party charge'],
    ['assist', 'Disclose beneficial ownership (BOIR), if your state requires it', 'Same day', 'No charge', 'Free'],
    ['you', 'Fund the account', 'Same day', 'n/a', 'Your own capital'],
    ['we', 'Set up Google/Office Workspace', 'Same day', '$10/mo', '3rd party charge'],
    ['we', 'Set up bookkeeping/accounting software', '1–2 days', '$15–70/mo', '3rd party charge'],
    ['we', 'Design logo + wordmark', 'Same day – 2 weeks', '$0 DIY – $500–5,000+ designer', '3rd party charge'],
    ['we', 'File USPTO trademark application (optional)', '1 day to file; 8–14 mo. to register', '$250–350/class + $0–2,000 attorney (optional)', 'Gov charge'],
    ['we', 'Build website', '1–4 weeks', '$0–500/yr DIY – $5,000+ custom', '3rd party charge'],
    ['assist', 'Acquire business licenses/permits (state, local, industry)', '1–4 weeks', '$50–500, varies by state/industry', 'Gov charge'],
    ['assist', 'Acquire business insurance (general liability, E&O, etc.)', '1–5 days', '$300–3,000+/yr, varies widely by industry', '3rd party charge'],
    ['assist', 'Register for sales tax where nexus is crossed', '1–3 days per state', 'No charge to register', 'Free']
  ];
  var WHO_TITLE = {
    you: 'You must own it',
    assist: 'We can do it together',
    we: 'We can execute it'
  };

  function renderTable(id, rows) {
    var table = document.getElementById(id);
    if (!table) return;
    var html =
      '<colgroup><col class="tf-col-num"><col class="tf-col-step">' +
      '<col class="tf-col-time"><col class="tf-col-cost"></colgroup>' +
      '<thead><tr>' +
      '<th class="tf-col-num">#</th><th>Step</th><th>Est. time</th><th>Est. cost</th>' +
      '</tr></thead><tbody>';
    rows.forEach(function (r, i) {
      html += '<tr>' +
        '<td class="tf-col-num tf-fit-' + r[0] + '" title="' + WHO_TITLE[r[0]] + '">' + (i + 1) + '</td>' +
        '<td>' + r[1] + '</td>' +
        '<td>' + r[2] + '</td>' +
        '<td>' + r[3] + '<span class="tf-cost-badge">' + r[4] + '</span></td>' +
        '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;
  }
  renderTable('table-prep', STEP_PREP);
  renderTable('table-post', STEP_POST);

  // --- PDF generation ------------------------------------------------------
  // Real one-click .pdf via jsPDF + autoTable (loaded from CDN with SRI on
  // this page only — the site's first third-party JS, an explicit SCOPE.md
  // exception taken by human decision). If the CDN is blocked or the SRI
  // check fails, window.jspdf is undefined and we fall back to
  // window.print(), whose "Save as PDF" destination reaches the same place —
  // so the button is never dead.

  // Brand colours as RGB triples — jsPDF takes numeric arrays, not CSS vars.
  // Values are the same tokens the table uses on screen, so the PDF and the
  // page agree: wash backgrounds + deep text per responsibility.
  var PDF_FIT = {
    you:    { bg: [247, 228, 225], fg: [143, 30, 18] },   // --tf-wash-brick / brick-dark
    assist: { bg: [244, 234, 212], fg: [122, 84, 16] },   // --tf-wash-ochre / ochre-deep
    we:     { bg: [221, 237, 237], fg: [23, 83, 85] }     // --tf-wash-teal  / teal-deep
  };
  var PDF_INK = [38, 34, 31];        // --tf-ink
  var PDF_INK_SOFT = [85, 80, 77];   // --tf-ink-soft
  var PDF_SAND = [229, 223, 215];    // --tf-sand (the table's frame colour)

  var PANEL_TITLE = {
    decide: 'Decide Entity Type',
    prep: 'Prep & Filing',
    post: 'Post-Filing Setup'
  };

  function buildPdf(which) {
    var jsPDFCtor = window.jspdf && window.jspdf.jsPDF;
    if (!jsPDFCtor) { window.print(); return; }          // soft fallback

    var doc = new jsPDFCtor({ unit: 'pt', format: 'a4' });
    var margin = 34;                                      // 12mm ≈ 34pt, matching @page
    var width = doc.internal.pageSize.getWidth();
    var y = margin;

    // Byline first — the head of the document, above everything else.
    y = drawByline(doc, margin, y, width - margin);

    // Title + intro + disclaimer — READ FROM THE DOM, never restated here. The
    // page's header is the single source: editing the markup changes the PDF in
    // the same edit, so the two cannot drift apart. Each falls back to '' rather
    // than a stale copy, so a markup change can never resurrect old wording.
    doc.setFont('times', 'bold').setFontSize(20).setTextColor.apply(doc, PDF_INK);
    doc.text(headText('h1'), margin, y);
    y += 20;
    doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor.apply(doc, PDF_INK);
    y = writeWrapped(doc, headText('.tf-prose-intro'), margin, y, width - margin * 2, 13);
    y += 10;

    // Disclaimer + privacy block, at the TOP of the document, ahead of the panel
    // content. Read from the page's own foot block, paragraph for paragraph.
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor.apply(doc, PDF_INK_SOFT);
    doc.text(headText('[data-tool-legal] .tf-meta'), margin, y);
    y += 10;
    doc.setFont('helvetica', 'normal');
    legalParagraphs().forEach(function (para) {
      y = writeWrapped(doc, para, margin, y, width - margin * 2, 10);
      y += 5;
    });
    y += 9;

    // Step eyebrow + heading — the same two-line relationship the rail uses, so
    // the panel identifies itself on paper where no rail sits beside it.
    doc.setFont('helvetica', 'bold').setFontSize(8).setTextColor.apply(doc, PDF_INK_SOFT);
    doc.text(stepLabel(which).toUpperCase(), margin, y);
    y += 11;
    doc.setFont('times', 'bold').setFontSize(14).setTextColor.apply(doc, PDF_INK);
    doc.text(PANEL_TITLE[which], margin, y);
    y += 16;

    if (which === 'decide') {
      var result = qaResult && qaResult.querySelector('.tf-callout-title');
      var body = qaResult && qaResult.querySelector('.tf-callout-body');
      doc.setFont('helvetica', 'normal').setFontSize(10).setTextColor.apply(doc, PDF_INK);
      if (result && body) {
        doc.setFont('helvetica', 'bold');
        doc.text(result.textContent, margin, y);
        y += 14;
        doc.setFont('helvetica', 'normal');
        writeWrapped(doc, body.textContent, margin, y, width - margin * 2, 13);
      } else {
        doc.setTextColor.apply(doc, PDF_INK_SOFT);
        writeWrapped(doc, 'No recommendation reached yet — answer the questions on the page and click "See recommendation" first.', margin, y, width - margin * 2, 13);
      }
    } else {
      var rows = which === 'prep' ? STEP_PREP : STEP_POST;
      // Legend, so the number column's colours mean something on paper.
      doc.setFont('helvetica', 'normal').setFontSize(8).setTextColor.apply(doc, PDF_INK_SOFT);
      doc.text('You — you must own it     Assist — we can do it together     We — we can execute it', margin, y);
      y += 10;

      doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Step', 'Est. time', 'Est. cost']],
        body: rows.map(function (r, i) {
          return [String(i + 1), r[1], r[2], r[3] + '\n' + r[4]];
        }),
        styles: { font: 'helvetica', fontSize: 8, cellPadding: 4, textColor: PDF_INK, lineColor: PDF_SAND, lineWidth: 0.5, valign: 'top' },
        headStyles: { fillColor: false, textColor: PDF_INK_SOFT, fontStyle: 'bold', lineColor: PDF_SAND },
        columnStyles: {
          0: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 220 },
          2: { cellWidth: 80 },
          3: { cellWidth: 'auto' }
        },
        // Colour ONLY the number cell, matching the on-screen coding.
        didParseCell: function (data) {
          if (data.section === 'body' && data.column.index === 0) {
            var fit = PDF_FIT[rows[data.row.index][0]];
            data.cell.styles.fillColor = fit.bg;
            data.cell.styles.textColor = fit.fg;
          }
        }
      });
    }

    doc.save('company-setup-' + which + '.pdf');
  }

  // jsPDF has no built-in "wrap and advance"; splitTextToSize + a line
  // counter is the documented idiom.
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

  document.querySelectorAll('[data-pdf]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      /* The action row now sits ABOVE the panels and outside them, so the button
         can no longer find its step with closest('[data-tool-panel]'). The
         tablist is the same source the panels themselves switch on: the one tab
         with aria-selected="true" names the visible step. Falls back to the
         first step, as the old closest() lookup did. */
      var tab = document.querySelector('.tf-step-nav [role="tab"][aria-selected="true"]');
      buildPdf(tab ? tab.getAttribute('data-tab') : 'decide');
    });
  });
})();
