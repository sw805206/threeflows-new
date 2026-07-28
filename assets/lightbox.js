/* Body-figure behaviour: (1) size each .tf-figure-aside image to match its
   adjacent text block's height on desktop (Option B), and (2) a click-to-enlarge
   lightbox — opens fit-to-viewport, then ZOOMS in/out (buttons, +/- keys, wheel)
   with drag-to-pan when zoomed past the viewport, so a dense heat map is readable.
   Vanilla, no deps. Fails silent — if the script never loads, the aside falls
   back to its CSS max-height cap and the thumbnail stays a static image. */
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
      img.style.maxHeight = '1px';
      img.style.maxHeight = body.offsetHeight + 'px';
      img.style.maxHeight = body.offsetHeight + 'px';
    }
  }

  /* ---- (2) zoomable lightbox ------------------------------------------- */
  var overlay = null, stage = null, img = null, lastFocus = null;
  var natW = 0, natH = 0, scale = 1, fitScale = 1, maxScale = 1;
  var panning = false, moved = false, startX = 0, startY = 0, sl = 0, st = 0;

  function clamp(s) { return Math.max(fitScale, Math.min(s, maxScale)); }

  function updateButtons() {
    if (!overlay) return;
    overlay.querySelector('.lb-out').disabled = scale <= fitScale + 1e-4;
    overlay.querySelector('.lb-in').disabled = scale >= maxScale - 1e-4;
  }

  function setScale(ns) {
    if (!img) return;
    ns = clamp(ns);
    var w = natW * scale, h = natH * scale;
    var cx = (stage.scrollLeft + stage.clientWidth / 2) / (w || 1);
    var cy = (stage.scrollTop + stage.clientHeight / 2) / (h || 1);
    scale = ns;
    img.style.width = (natW * scale) + 'px';
    img.style.height = (natH * scale) + 'px';
    stage.scrollLeft = cx * natW * scale - stage.clientWidth / 2;
    stage.scrollTop = cy * natH * scale - stage.clientHeight / 2;
    updateButtons();
  }

  function fit() {
    if (!natW || !natH) return;
    var sw = stage.clientWidth || window.innerWidth;
    var sh = stage.clientHeight || window.innerHeight;
    /* whole-image fit is the zoom-OUT floor; opening scale is readable — natural
       resolution, only shrunk if the image is wider than the viewport. So a tall
       heat map opens legible (scroll for the rest) rather than shrunk to a sliver. */
    fitScale = Math.min(sw / natW, sh / natH) * 0.94;
    if (!isFinite(fitScale) || fitScale <= 0) fitScale = 0.2;
    maxScale = Math.max(fitScale, 4);
    var openScale = Math.min(Math.max(Math.min(1, (sw / natW) * 0.96), fitScale), maxScale);
    scale = Infinity;      /* force setScale to clamp and centre */
    setScale(openScale);
  }

  function onMove(e) {
    if (!panning) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
    stage.scrollLeft = sl - dx;
    stage.scrollTop = st - dy;
  }
  function onUp() {
    if (!panning) return;
    panning = false;
    if (stage) stage.classList.remove('is-panning');
  }
  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === '+' || e.key === '=') { setScale(scale * 1.5); e.preventDefault(); }
    else if (e.key === '-' || e.key === '_') { setScale(scale / 1.5); e.preventDefault(); }
  }

  function close() {
    if (!overlay) return;
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    overlay.remove();
    overlay = stage = img = null;
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function mkbtn(cls, label, glyph) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = cls;
    b.setAttribute('aria-label', label); b.textContent = glyph;
    return b;
  }

  function open(src, alt) {
    if (overlay) close();
    lastFocus = document.activeElement;

    overlay = document.createElement('div');
    overlay.className = 'tf-lightbox';

    stage = document.createElement('div');
    stage.className = 'tf-lightbox-stage';
    img = document.createElement('img');
    img.alt = alt || '';
    stage.appendChild(img);

    var controls = document.createElement('div');
    controls.className = 'tf-lightbox-controls';
    var bOut = mkbtn('lb-out', 'Zoom out', '−');
    var bIn = mkbtn('lb-in', 'Zoom in', '+');
    var bClose = mkbtn('lb-close', 'Close enlarged image', '×');
    controls.appendChild(bOut); controls.appendChild(bIn); controls.appendChild(bClose);

    overlay.appendChild(stage);
    overlay.appendChild(controls);

    bOut.addEventListener('click', function (e) { e.stopPropagation(); setScale(scale / 1.5); });
    bIn.addEventListener('click', function (e) { e.stopPropagation(); setScale(scale * 1.5); });
    bClose.addEventListener('click', function (e) { e.stopPropagation(); close(); });

    stage.addEventListener('click', function (e) { if (e.target !== img && !moved) close(); });
    stage.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      panning = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      sl = stage.scrollLeft; st = stage.scrollTop;
      stage.classList.add('is-panning');
      e.preventDefault();
    });
    stage.addEventListener('wheel', function (e) {
      e.preventDefault();
      setScale(scale * (e.deltaY < 0 ? 1.15 : 0.87));
    }, { passive: false });
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);

    img.src = src;
    if (img.complete && img.naturalWidth) { natW = img.naturalWidth; natH = img.naturalHeight; fit(); }
    else { img.addEventListener('load', function () { natW = img.naturalWidth; natH = img.naturalHeight; fit(); }, { once: true }); }

    document.documentElement.style.overflow = 'hidden';
    document.body.appendChild(overlay);
    document.addEventListener('keydown', onKey);
    bClose.focus();
  }

  document.addEventListener('click', function (e) {
    var zoom = e.target.closest && e.target.closest('.tf-figure-zoom');
    if (!zoom) return;
    e.preventDefault();
    var thumb = zoom.querySelector('img');
    if (!thumb) return;
    open(zoom.getAttribute('data-full') || thumb.currentSrc || thumb.src, thumb.alt);
  });

  /* ---- run ------------------------------------------------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fitAsides);
  } else {
    fitAsides();
  }
  window.addEventListener('load', fitAsides);
  var t;
  window.addEventListener('resize', function () {
    clearTimeout(t);
    t = setTimeout(function () {
      fitAsides();
      if (overlay && natW) {
        fitScale = Math.min(stage.clientWidth / natW, stage.clientHeight / natH) * 0.94;
        maxScale = Math.max(fitScale, 4);
        setScale(scale);
      }
    }, 150);
  });
})();
