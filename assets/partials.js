/* partials.js — injects the shared header and footer into every page.

   The header/footer markup lives once in partials.html; this script fetches it
   (relative path, so it works on localhost and under the github.io subpath) and
   injects it into the #tf-header / #tf-footer placeholders each page carries.
   It then marks the current page's nav link, and wires the hamburger and the
   nav dropdowns (Esc / outside-click / breakpoint-crossing resize).

   Centralized here by BL-024: this exact code was previously duplicated inline
   in 22 shell pages, in 3 variants that differed ONLY in comments and
   indentation (verified byte-identical after normalization). Behavior is
   unchanged from those inline copies.

   Fails silently — a fetch error leaves the page with no nav rather than a
   broken page. Loaded with `defer`, so it runs after the placeholders parse. */

(function () {
  fetch('partials.html').then(function (r) {
    if (!r.ok) throw new Error('partials ' + r.status);
    return r.text();
  }).then(function (html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    ['header', 'footer'].forEach(function (slot) {
      var src = doc.getElementById('tf-' + slot + '-partial');
      var dest = document.getElementById('tf-' + slot);
      if (src && dest) dest.innerHTML = src.innerHTML;
    });

    var header = document.getElementById('tf-header');
    if (!header) return;
    var navBar = header.querySelector('.tf-nav');

    // Mark the current page's nav link — nav links only (never the
    // lockup or the dropdown triggers), by exact filename match.
    var path = window.location.pathname;
    var file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    var links = header.querySelectorAll('.tf-nav-links a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].getAttribute('href') === file) {
        links[i].setAttribute('aria-current', 'page');
      }
    }

    // Hamburger toggle (mobile).
    var toggle = header.querySelector('.tf-nav-toggle');
    if (toggle && navBar) {
      toggle.addEventListener('click', function () {
        var open = navBar.classList.toggle('tf-nav-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    // Dropdowns: at most one open at a time. Open on the trigger's hover
    // (desktop) or click; close on mouse leave, outside click, or Esc.
    var items = header.querySelectorAll('.tf-has-dropdown');
    function isDesktop() { return window.matchMedia('(min-width: 820px)').matches; }
    function closeItem(item) {
      item.classList.remove('is-open');
      var t = item.querySelector('.tf-nav-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
    function closeAll() {
      for (var k = 0; k < items.length; k++) closeItem(items[k]);
    }
    function setOpen(item, open) {
      if (open) {
        for (var k = 0; k < items.length; k++) {
          if (items[k] !== item) closeItem(items[k]);
        }
      }
      item.classList.toggle('is-open', open);
      var t = item.querySelector('.tf-nav-trigger');
      if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    for (var j = 0; j < items.length; j++) {
      (function (item) {
        var trigger = item.querySelector('.tf-nav-trigger');
        if (trigger) {
          trigger.addEventListener('click', function () {
            setOpen(item, !item.classList.contains('is-open'));
          });
        }
        item.addEventListener('mouseenter', function () {
          if (isDesktop()) setOpen(item, true);
        });
        item.addEventListener('mouseleave', function () {
          if (isDesktop()) closeItem(item);
        });
      })(items[j]);
    }
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') closeAll();
    });
    // Reset transient state only when actually crossing the breakpoint —
    // not on every resize (mobile URL-bar show/hide fires resize too, and
    // must not collapse an open menu).
    var wasDesktop = isDesktop();
    window.addEventListener('resize', function () {
      var nowDesktop = isDesktop();
      if (nowDesktop === wasDesktop) return;
      wasDesktop = nowDesktop;
      closeAll();
      if (navBar) navBar.classList.remove('tf-nav-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }).catch(function () { /* fail silently: no nav rather than broken page */ });
})();
