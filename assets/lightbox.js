/* Body-figure behaviour: (1) size each .tf-figure-aside image to match its
   adjacent text block's height on desktop (Option B), and (2) a click-to-enlarge
   lightbox for any .tf-figure-zoom thumbnail. Vanilla, no deps. Fails silent —
   if the script never loads, the aside falls back to its CSS max-height cap and
   the thumbnail stays a static image. */
(function () {

  /* ---- (1) fit the aside image to the text height ---------------------- */
  function fitAsides() {
    var wide = window.matchMedia('(min-width: 820px)').matches;
    var asides = document.querySelectorAll('.tf-figure-aside');
    for (var i = 0; i < asides.length; i++) {
      var body = asides[i].querySelector('.tf-figure-aside-body');
      var img = asides[i].querySelector('img');
      if (!body || !img) continue;
      if (!wide) { img.style.maxHeight = ''; continue; }
      /* Collapse the image first so the text lays out at ~full width, then set
         the image to that height. A second set converges the small feedback
         (image width = height x ratio nibbles into the text column). */
      img.style.maxHeight = '1px';
      img.style.maxHeight = body.offsetHeight + 'px';
      img.style.maxHeight = body.offsetHeight + 'px';
    }
  }

  /* ---- (2) lightbox ---------------------------------------------------- */
  var overlay = null;
  var lastFocus = null;

  function close() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    overlay.remove();
    overlay = null;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }

  function open(src, alt) {
    if (overlay) close();
    lastFocus = document.activeElement;

    overlay = document.createElement('div');
    overlay.className = 'tf-lightbox';

    var img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';

    var btn = document.createElement('button');
    btn.className = 'tf-lightbox-close';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Close enlarged image');
    btn.textContent = '×'; /* × */

    overlay.appendChild(btn);
    overlay.appendChild(img);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === btn) close();
    });

    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    btn.focus();
  }

  document.addEventListener('click', function (e) {
    var zoom = e.target.closest && e.target.closest('.tf-figure-zoom');
    if (!zoom) return;
    e.preventDefault();
    var img = zoom.querySelector('img');
    if (!img) return;
    open(zoom.getAttribute('data-full') || img.currentSrc || img.src, img.alt);
  });

  /* ---- run ------------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fitAsides);
  } else {
    fitAsides();
  }
  window.addEventListener('load', fitAsides); /* re-fit once fonts/images settle */
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(fitAsides, 150);
  });
})();
