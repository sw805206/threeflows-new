/* references.js — renders the References directory (references.html) from
   references.json: a segmented tab control, and per tab a set of cream group
   panels each holding a card grid.

   Tabs are deep-linkable via location.hash (#insights / #management /
   #marketplaces, default #insights); the hash updates on switch and
   back/forward is honoured through the hashchange event.

   Soft-fail, matching partials.js / toc.js: JS enhances, its absence never
   breaks the page. If the marker is missing, the fetch fails, or the manifest
   is empty/malformed, the page still renders its header, heading, intro, and
   footer with an empty directory slot — no thrown error reaches the user. */
(function () {
  'use strict';

  // Tab order = the tab-bar order of the old page. Keys are the hash fragments.
  var TABS = [
    { key: 'insights',     label: 'Insights & Compliance' },
    { key: 'management',   label: 'Business Management' },
    { key: 'marketplaces', label: 'Marketplaces' }
  ];
  var TAB_KEYS = TABS.map(function (t) { return t.key; });

  try {
    var app = document.querySelector('[data-ref-app]');
    if (!app) return;

    fetch('references.json').then(function (r) {
      if (!r.ok) throw new Error('references.json ' + r.status);
      return r.json();
    }).then(function (data) {
      if (!Array.isArray(data) || !data.length) return; // nothing to render
      render(app, data);
    }).catch(function () {
      /* soft-fail: page renders without the directory */
    });
  } catch (e) {
    /* soft-fail */
  }

  function el(tag, className) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    return n;
  }

  function render(app, data) {
    // Group the manifest by tab, preserving first-seen order for both the tabs
    // and the groups within them.
    var byTab = {};      // key -> { order: [groupName], groups: { name: [entry] } }
    data.forEach(function (entry) {
      var t = entry.tab;
      if (TAB_KEYS.indexOf(t) === -1) return; // unknown tab: skip defensively
      if (!byTab[t]) byTab[t] = { order: [], groups: {} };
      var bucket = byTab[t];
      if (!bucket.groups[entry.group]) {
        bucket.groups[entry.group] = [];
        bucket.order.push(entry.group);
      }
      bucket.groups[entry.group].push(entry);
    });

    // --- segmented tab control ---
    var tablist = el('div', 'tf-tabs');
    tablist.setAttribute('role', 'tablist');
    tablist.setAttribute('aria-label', 'Reference categories');

    var tabs = {};      // key -> button
    var panels = {};    // key -> section

    TABS.forEach(function (tab) {
      if (!byTab[tab.key]) return; // no entries for this tab
      var btn = el('button', 'tf-tab');
      btn.type = 'button';
      btn.textContent = tab.label;
      btn.id = 'tab-' + tab.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('data-tab', tab.key);
      btn.setAttribute('aria-controls', 'panel-' + tab.key);
      btn.addEventListener('click', function () {
        // Clicks and back/forward share one path: set the hash, let the
        // hashchange handler perform the switch. (Re-activate if already there.)
        if (currentTab() === tab.key) activate(tab.key);
        else location.hash = tab.key;
      });
      tablist.appendChild(btn);
      tabs[tab.key] = btn;
    });
    app.appendChild(tablist);

    // --- one panel per tab; each panel is a stack of cream group panels ---
    TABS.forEach(function (tab) {
      var bucket = byTab[tab.key];
      if (!bucket) return;

      var panel = el('section', 'tf-ref-panel');
      panel.id = 'panel-' + tab.key;
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', 'tab-' + tab.key);

      bucket.order.forEach(function (groupName) {
        var group = el('div', 'tf-ref-group');

        var label = el('div', 'tf-ref-group-label');
        label.textContent = groupName;
        group.appendChild(label);

        var grid = el('div', 'tf-ref-grid');
        bucket.groups[groupName].forEach(function (entry) {
          grid.appendChild(card(entry));
        });
        group.appendChild(grid);

        panel.appendChild(group);
      });

      app.appendChild(panel);
      panels[tab.key] = panel;
    });

    // --- tab switching -----------------------------------------------------
    function activate(key) {
      if (!panels[key]) key = firstTab();
      TABS.forEach(function (tab) {
        var on = tab.key === key;
        if (panels[tab.key]) panels[tab.key].hidden = !on;
        if (tabs[tab.key]) {
          tabs[tab.key].setAttribute('aria-selected', on ? 'true' : 'false');
          tabs[tab.key].tabIndex = on ? 0 : -1;
        }
      });
    }

    function firstTab() {
      for (var i = 0; i < TABS.length; i++) {
        if (panels[TABS[i].key]) return TABS[i].key;
      }
      return TAB_KEYS[0];
    }

    // The tab is taken straight from the hash (an exact tab key), else default.
    function currentTab() {
      var h = (location.hash || '').replace(/^#/, '');
      return panels[h] ? h : firstTab();
    }

    function syncFromHash() { activate(currentTab()); }

    window.addEventListener('hashchange', syncFromHash);
    syncFromHash(); // initial state (default #insights when no/unknown hash)
  }

  function card(entry) {
    // Whole card is one <a> — single tab stop, whole surface clickable. Uses the
    // .tf-card-link idiom (colour pinned to inherit); hover colours are in CSS.
    var a = el('a', 'tf-ref-card tf-card-link');
    a.href = entry.url;
    a.target = '_blank';
    a.rel = 'noopener';

    var head = el('div', 'tf-ref-card-head');
    var favicon = el('img', 'tf-ref-favicon');
    favicon.src = 'https://www.google.com/s2/favicons?sz=32&domain=' + encodeURIComponent(entry.domain || '');
    favicon.alt = '';
    favicon.loading = 'lazy';
    favicon.width = 20;
    favicon.height = 20;
    // A blocked/failed favicon should not leave a broken-image glyph in the head.
    favicon.addEventListener('error', function () { favicon.style.visibility = 'hidden'; });
    head.appendChild(favicon);

    var name = el('span', 'tf-ref-card-name');
    name.textContent = entry.name;
    head.appendChild(name);
    a.appendChild(head);

    var desc = el('p', 'tf-ref-card-desc');
    desc.textContent = entry.description || '';
    a.appendChild(desc);

    var action = el('span', 'tf-ref-card-action');
    action.textContent = entry.action || 'Visit';
    a.appendChild(action);

    return a;
  }
})();
