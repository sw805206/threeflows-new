/* toc.js — "On this page" table-of-contents rail for long-form prose pages.
   Opt-in: a page wraps its .tf-prose in an element carrying [data-toc]. This
   script scans that prose for h2/h3, builds a sticky rail, inserts it before
   the prose, flips the layout to two columns (.is-railed), and highlights the
   active section on scroll via IntersectionObserver.

   Soft-fail: any error, a missing marker, or no headings leaves the page
   rendering normally with no rail — the same posture as the partials fetch.
   Pages without [data-toc] get no rail. */
(function () {
  try {
    var layout = document.querySelector('[data-toc]');
    if (!layout) return;
    var prose = layout.querySelector('.tf-prose');
    if (!prose) return;
    // Heading levels are configurable via the marker's value; default is H2-only
    // (main sections). e.g. data-toc="h2, h3" to include subsections.
    var sel = (layout.getAttribute('data-toc') || '').trim() || 'h2';
    var headings = [].slice.call(prose.querySelectorAll(sel));
    if (!headings.length) return;

    function slug(text) {
      return text.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }

    // Ensure every heading has an id (generate a unique one from its text if not).
    var order = [];
    headings.forEach(function (h) {
      if (!h.id) {
        var base = slug(h.textContent) || 'section', id = base, n = 2;
        while (document.getElementById(id)) { id = base + '-' + n; n++; }
        h.id = id;
      }
      order.push(h.id);
    });

    // Build the rail.
    var nav = document.createElement('nav');
    nav.className = 'tf-toc';
    nav.setAttribute('aria-label', 'On this page');

    var label = document.createElement('div');
    label.className = 'tf-meta tf-toc-label';
    label.textContent = 'In this article';
    nav.appendChild(label);

    var ul = document.createElement('ul');
    var links = {};
    headings.forEach(function (h) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      if (h.tagName === 'H3') a.className = 'tf-toc-sub';
      li.appendChild(a);
      ul.appendChild(li);
      links[h.id] = a;
    });
    nav.appendChild(ul);

    layout.insertBefore(nav, layout.firstChild);
    layout.classList.add('is-railed');

    // Active section = the last heading whose top has passed the trigger line.
    var TRIGGER = 120;
    function setActive() {
      var activeId = order[0];
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top - TRIGGER <= 0) activeId = headings[i].id;
        else break;
      }
      order.forEach(function (id) {
        links[id].classList.toggle('is-active', id === activeId);
      });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(setActive, {
        rootMargin: '-' + TRIGGER + 'px 0px 0px 0px',
        threshold: [0, 1]
      });
      headings.forEach(function (h) { io.observe(h); });
    }
    // Scroll / resize fallback (rAF-throttled) so the highlight tracks reliably
    // even in the gaps between IO callbacks.
    var ticking = false;
    function onScrollResize() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { ticking = false; setActive(); });
    }
    window.addEventListener('scroll', onScrollResize, { passive: true });
    window.addEventListener('resize', onScrollResize);
    setActive();
  } catch (e) {
    /* soft-fail: page renders without a rail */
  }
})();
