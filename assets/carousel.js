/* carousel.js — arrow controls for a scroll-snap carousel (about.html clients).

   The track itself is pure CSS (.tf-carousel): it scrolls natively with touch,
   trackpad, and keyboard whether or not this file loads. This script adds only
   the prev/next buttons — one CARD per click, and end-muting.

   Soft-fail, matching references.js / toc.js / the partials fetch: JS enhances,
   its absence never breaks the page. No marker, missing buttons, or a thrown
   error leaves a fully working swipe/scroll carousel with inert arrows. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* One card's travel = its rendered width + the track's flex gap. Measured from
     the DOM rather than read from the CSS variable, so re-pitching the row
     (--tf-carousel-card-w) needs no change here, and the 75vw mobile width works
     the same way. */
  function stepWidth(track) {
    var card = track.firstElementChild;
    if (!card) return track.clientWidth;
    var cs = getComputedStyle(track);
    var gap = parseFloat(cs.columnGap || cs.gap) || 0;
    return card.getBoundingClientRect().width + gap;
  }

  /* Mute an arrow when the track can travel no further that way. Disabled, not
     hidden — the blog pager's absent-neighbour idiom. The 1px tolerance absorbs
     sub-pixel scroll positions, which otherwise leave an arrow live at an end. */
  function syncArrows(track, prev, next) {
    var max = track.scrollWidth - track.clientWidth;
    var x = track.scrollLeft;
    prev.disabled = x <= 1;
    next.disabled = x >= max - 1;
  }

  try {
    var roots = document.querySelectorAll('[data-carousel]');

    Array.prototype.forEach.call(roots, function (root) {
      var track = root.querySelector('[data-carousel-track]');
      var prev = root.querySelector('[data-carousel-prev]');
      var next = root.querySelector('[data-carousel-next]');
      if (!track || !prev || !next) return;   // markup incomplete: leave it alone

      function go(direction) {
        var by = stepWidth(track) * direction;
        if (reduceMotion || !track.scrollBy) {
          track.scrollLeft += by;             // jump, no animation
        } else {
          track.scrollBy({ left: by, behavior: 'smooth' });
        }
      }

      prev.addEventListener('click', function () { go(-1); });
      next.addEventListener('click', function () { go(1); });

      /* Sync straight from the scroll event — deliberately NOT rAF-throttled.
         A "skip while one is pending" guard deadlocks: if the scheduled frame
         never runs (backgrounded or throttled tab), the pending flag never
         clears and every later scroll event is dropped, freezing the arrows in
         a stale state for the life of the page. sync reads three scroll
         properties and writes two booleans, which is cheap enough at scroll
         frequency that the throttle bought nothing worth that risk. */
      track.addEventListener('scroll', function () {
        syncArrows(track, prev, next);
      });

      // Re-measure on resize: the card width changes at the 820px breakpoint,
      // which moves the end positions.
      window.addEventListener('resize', function () {
        syncArrows(track, prev, next);
      });

      syncArrows(track, prev, next);          // initial state: prev starts muted
    });
  } catch (e) {
    /* soft-fail: native scrolling still works; the arrows simply stay inert */
  }
})();
