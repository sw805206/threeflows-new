/* Overall Tax Estimator (tool-003) — shell wiring only.
   ==========================================================================
   NO TAX ENGINE, NO DATASET, NO CALCULATION. Every figure on the page is a
   hardcoded placeholder authored in the markup; nothing here computes one and
   nothing here writes one. What this file does is the four jobs the shell
   cannot do in static HTML:

     1. Step navigation — the rail tablist, the panels, the pager and the URL
        hash driven as ONE state (TOOLS.md §5).
     2. The derived labels — the panel eyebrow and both pager labels are read
        off the rail's own .tf-step-nav-num, so the step number is authored
        ONCE and renumbering the rail cannot leave them disagreeing.
     3. Show/hide wiring — the entity election revealing the owner-salary row,
        the scenario toggles swapping chart variants, the state picker's
        select-all / deselect-all.
     4. Start over — clears the inputs back to their authored defaults.

   NO PERSISTENCE of any kind: no localStorage, no sessionStorage, no cookies
   (TOOLS.md §7). Entries live only as long as the page is open.

   The engine — rates, brackets, the state dataset and every figure now sitting
   as a placeholder — lands in a later pass. The placeholder variables it will
   fill are marked in the markup with data-var (a string) and data-row (a whole
   line that may be absent for a given state); this file does not touch them,
   so the engine has an unclaimed surface to write into.
   ========================================================================== */
(function () {
  'use strict';

  var root = document.querySelector('[data-tool-id="tool-003"]');
  if (!root) return;

  /* ---------------------------------------------------------------- steps */

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('[data-tool-panel]'));
  var pager = root.querySelector('[data-step-pager]');
  var prevLink = pager && pager.querySelector('[data-pager-prev]');
  var nextLink = pager && pager.querySelector('[data-pager-next]');

  /* The step number as the RAIL states it — "Step 1", "Step 4". Read, never
     re-derived from the index, so the eyebrow and the pager quote the rail
     verbatim rather than agreeing with it by coincidence. */
  function stepLabel(tab) {
    var num = tab.querySelector('.tf-step-nav-num');
    return num ? num.textContent.trim() : '';
  }

  function panelFor(tab) {
    return root.querySelector('#' + tab.getAttribute('aria-controls'));
  }

  function activate(index, focus) {
    if (index < 0 || index >= tabs.length) return;

    tabs.forEach(function (tab, i) {
      var on = i === index;
      tab.setAttribute('aria-selected', on ? 'true' : 'false');
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (panel) { panel.hidden = true; });

    var active = panelFor(tabs[index]);
    if (active) {
      active.hidden = false;
      /* The eyebrow slot is empty in the static HTML by design (TOOLS.md §5):
         the number lands here, at runtime, from the rail. */
      var eyebrow = active.querySelector('[data-step-eyebrow]');
      if (eyebrow) eyebrow.textContent = stepLabel(tabs[index]);
    }

    writePager(index);
    if (focus) tabs[index].focus();

    var id = tabs[index].getAttribute('data-tab');
    if (id && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  /* Ends are DISABLED, not hidden, so the action row does not jump as you page
     (TOOLS.md §5). An <a> with no href is non-focusable, which is the point. */
  function writePager(index) {
    if (!prevLink || !nextLink) return;

    if (index > 0) {
      prevLink.textContent = '← ' + stepLabel(tabs[index - 1]);
      prevLink.href = '#' + tabs[index - 1].getAttribute('data-tab');
      prevLink.classList.remove('is-disabled');
    } else {
      prevLink.textContent = '← ' + stepLabel(tabs[0]);
      prevLink.removeAttribute('href');
      prevLink.classList.add('is-disabled');
    }

    var last = tabs.length - 1;
    if (index < last) {
      nextLink.textContent = stepLabel(tabs[index + 1]) + ' →';
      nextLink.href = '#' + tabs[index + 1].getAttribute('data-tab');
      nextLink.classList.remove('is-disabled');
    } else {
      nextLink.textContent = stepLabel(tabs[last]) + ' →';
      nextLink.removeAttribute('href');
      nextLink.classList.add('is-disabled');
    }
  }

  function indexOfTab(id) {
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-tab') === id) return i;
    }
    return -1;
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(i, false); });
    tab.addEventListener('keydown', function (e) {
      var next = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = tabs.length - 1;
      if (next >= 0) { e.preventDefault(); activate(next, true); }
    });
  });

  if (pager) {
    pager.addEventListener('click', function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link) return;
      e.preventDefault();
      var i = indexOfTab(link.getAttribute('href').slice(1));
      if (i >= 0) activate(i, false);
    });
  }

  /* ------------------------------------------------------- show/hide wiring */

  /* Entity election. The owner W-2 salary field EXISTS ONLY under S-corp — a
     sole proprietor cannot be on their own payroll — so the row is removed
     rather than disabled, and the draws footnote takes its place. */
  var ownerRow = root.querySelector('[data-owner-salary-row]');
  var drawsNote = root.querySelector('[data-draws-note]');

  function applyElection() {
    var scorp = root.querySelector('[data-election="s-corp"]');
    var on = !!(scorp && scorp.checked);
    if (ownerRow) ownerRow.hidden = !on;
    if (drawsNote) drawsNote.hidden = on;
  }

  root.querySelectorAll('[data-election]').forEach(function (input) {
    input.addEventListener('change', applyElection);
  });

  /* Scenario toggles. Each .tf-view-toggle owns a set of variant blocks keyed
     by data-scenario within the group named by data-scenario-group. */
  root.querySelectorAll('[data-scenario-group]').forEach(function (group) {
    var name = group.getAttribute('data-scenario-group');
    var targets = Array.prototype.slice.call(
      root.querySelectorAll('[data-scenario-for="' + name + '"]')
    );
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-scenario]');
      if (!btn) return;
      var want = btn.getAttribute('data-scenario');
      group.querySelectorAll('[data-scenario]').forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
      targets.forEach(function (t) {
        t.hidden = t.getAttribute('data-scenario') !== want;
      });
    });
  });

  /* State picker — select-all / deselect-all over the checkbox list. */
  root.querySelectorAll('[data-picker-all], [data-picker-none]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.getAttribute('data-picker-all') || btn.getAttribute('data-picker-none');
      var on = btn.hasAttribute('data-picker-all');
      var list = root.querySelector('#' + id);
      if (!list) return;
      list.querySelectorAll('input[type="checkbox"]').forEach(function (box) {
        box.checked = on;
      });
    });
  });

  /* ---------------------------------------------------------- action row */

  /* Start over — back to the authored defaults. No stored state to clear:
     there is none, by rule. */
  var reset = root.querySelector('[data-reset]');
  if (reset) {
    reset.addEventListener('click', function () {
      root.querySelectorAll('input, select').forEach(function (el) {
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = el.defaultChecked;
        } else if (el.tagName === 'SELECT') {
          Array.prototype.slice.call(el.options).forEach(function (opt) {
            opt.selected = opt.defaultSelected;
          });
        } else {
          el.value = el.defaultValue;
        }
      });
      applyElection();
    });
  }

  /* Download PDF. tool-001 and tool-002 generate a real file with jsPDF, built
     from their computed model; there is no model here yet, so this page does
     NOT take the SCOPE.md §3 CDN exception — it is not listed as a consumer —
     and the button falls through to the print path those pages already use as
     their fallback. It becomes a real download in the engine pass. */
  var pdf = root.querySelector('[data-pdf]');
  if (pdf) {
    pdf.addEventListener('click', function () { window.print(); });
  }

  /* ---------------------------------------------------------------- start */

  var fromHash = window.location.hash ? indexOfTab(window.location.hash.slice(1)) : -1;
  activate(fromHash >= 0 ? fromHash : 0, false);
  applyElection();
})();
