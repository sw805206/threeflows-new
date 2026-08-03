/* blog.js — blog pages, driven by bloglist.json. Two independent blocks:
   the POST enhancements (a page marks itself with data-blog-id) and the INDEX
   render (blogs.html marks itself with data-blog-index). Exactly one applies per
   page — a post has no index marker and the index has no data-blog-id — so they
   never both fetch the manifest. Both fail soft and leave the page usable.

   ── POST ──────────────────────────────────────────────────────────────────
   A post identifies itself with data-blog-id="<blogID>". This script:
   1. Read + listen time — counts the article's words ONCE (DOM only, no manifest
      needed) and appends " · N min read · M min listen" to the date meta line.
      ~220 wpm and ~150 wpm, both rounded up, off the SAME count.
   2. Listen control — injects the .tf-listen read-aloud button at the end of that
      same meta line, using the browser's SpeechSynthesis. Nothing is marked up
      per post, so every post gets it with zero wiring. Renders only where speech
      actually works (see the block for what "works" means).
   3. Rail image — if the manifest entry carries an optional "image" path, renders
      it at the TOP of the rail (above "In this article"). Absent field → nothing
      rendered: no placeholder, no broken image.
   4. Top pager — wires the "← Previous | Next →" row: Previous = next older
      published post, Next = next newer. An absent neighbour renders muted, not
      hidden. Same-date collision among published posts → both muted + warn.

   Soft-fail: a missing marker, unreachable/malformed manifest, or any error
   leaves the page intact (reading time still applies if it ran first; the baked
   date renders regardless). blog-template.html has an empty data-blog-id and is
   not in the manifest, so it is never treated as a post. */
(function () {
  try {
    var host = document.querySelector('[data-blog-id]');
    if (!host) return;
    var selfId = host.getAttribute('data-blog-id');
    if (!selfId) return;   // template / unidentified page

    var prose = document.querySelector('.tf-prose');

    // ── The body scope (BLOG.md §6) ────────────────────────────────────────
    // ONE definition of "the article body", returned as a detached clone: the
    // page keeps its own DOM untouched. Everything inside .tf-prose EXCEPT the
    // h1 (so editing a title never moves the count), the date/meta line, and the
    // top nav row (which sits INSIDE .tf-prose, not outside it). Scoping by
    // container-minus-exclusions rather than a tag list means body elements are
    // included automatically as they appear — list items are, and tables and
    // callouts were when they arrived.
    // style and script are excluded too: textContent returns their SOURCE, so a
    // post carrying a page-local component inside .tf-prose would have its CSS
    // and JS counted as prose (measured on blog-007: 1516 -> 1913 words, 7 min
    // shown as 9). They are code, never reader-visible text, so they never count
    // wherever an author places them.
    //
    // THREE consumers share this one function — the reading time, the listen
    // time, and what the Listen control actually reads aloud. They must never
    // drift: a second extractor written alongside it is how the meta line ends
    // up promising nine minutes of audio for a body the speech never reaches.
    function proseBody() {
      var body = prose.cloneNode(true);
      var skip = body.querySelectorAll('h1, .tf-meta, .tf-post-topnav, style, script');
      for (var i = 0; i < skip.length; i++) skip[i].remove();
      return body;
    }

    // 1. Read + listen time — DOM word count, independent of the manifest. Both
    //    figures come off the SAME count and differ only by divisor: 220 wpm for
    //    reading, 150 wpm for listening (a synthesized voice at rate 1 lands
    //    near there). The index card reads the listen figure from the manifest's
    //    listenMinutes instead, precomputed with this identical scope.
    (function () {
      if (!prose) return;
      var meta = prose.querySelector('.tf-meta');
      if (!meta) return;
      var body = proseBody();
      var parts = body.textContent.trim().split(/\s+/);
      var words = 0;
      for (var k = 0; k < parts.length; k++) if (parts[k]) words++;
      if (words > 0) {
        var readMins = Math.max(1, Math.ceil(words / 220));
        var listenMins = Math.ceil(words / 150);                     // words > 0 here, so this is already >= 1
        meta.textContent += ' · ' + readMins + ' min read · ' + listenMins + ' min listen';
        mountListen(meta, body);                                     // may mount nothing; see the block
      }
    })();

    /* 2. Listen control — browser text-to-speech, injected, never marked up.
       ────────────────────────────────────────────────────────────────────────
       TWO STATES ONLY: Listen and Stop. There is deliberately no pause. Safari's
       speechSynthesis.pause() is unreliable — it can leave the queue wedged with
       no way back short of a cancel — so a three-state control would behave
       differently per browser, which is worse than a control that does less.
       Stop cancels the queue outright; pressing Listen again starts from the top.

       CHUNKING IS LOAD-BEARING, not a nicety. Chrome silently truncates an
       utterance somewhere past ~15 seconds: the voice simply stops mid-sentence
       and the queue moves on, with no error and no onend. So the body is split
       into one utterance per block element, and any block over ~200 characters is
       split again at sentence boundaries (then clause, then word — see split()).
       Every chunk therefore lands well inside the window. Queue them in document
       order and the browser plays them back to back.

       TABLES ARE SKIPPED. A table read aloud is a stream of unattached cell
       values — "Processing Path, What Triggers It, What Happens, Standard, ..." —
       which is worse than silence. Each one is replaced by a single spoken line
       pointing the listener at the page.

       VOICES. getVoices() returns [] on the first call in Chrome and fills in
       asynchronously, so selection waits on voiceschanged. The voice itself is
       RANKED rather than taken first — see score() for why that distinction is
       load-bearing. A localService voice still wins: it synthesizes on the
       device, so nothing leaves the machine. The fallback to a network voice is
       why privacy.html carries a sentence about this. If there is no
       speechSynthesis at all, or no voice after the wait, NO BUTTON IS RENDERED
       — a control that does nothing when pressed is worse than no control.

       Quality is capped by the visitor's device either way: ranking picks the
       best voice they HAVE, it cannot install a better one. */
    function mountListen(meta, body) {
      var synth = window.speechSynthesis;
      if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') return;

      var MAX_CHARS = 200;
      var TABLE_LINE = 'A table follows here — see it on the page.';
      var ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
      // Lucide volume-2 (Listen) and a square stop glyph — square corners per
      // STYLE.md §4, so Lucide's rounded `square` drops its rx.
      var ICON_LISTEN = ICON + '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
      var ICON_STOP = ICON + '<rect x="6" y="6" width="12" height="12"/></svg>';

      function tidy(s) { return (s || '').replace(/\s+/g, ' ').trim(); }

      /* Split one block's text into utterance-sized pieces. Three passes, each
         a fallback for the one before: sentences first (the natural break), then
         clause punctuation for a sentence that runs long on its own, then a hard
         word-boundary wrap so nothing can ever exceed the cap. Never splits
         mid-word. */
      function split(text) {
        if (text.length <= MAX_CHARS) return [text];
        var out = [];
        pack(text.match(/[^.!?]+(?:[.!?]+["'”’)\]]*\s*|$)/g) || [text], out, true);
        return out;
      }
      /* Greedily pack pieces up to the cap. Anything still over it on its own is
         re-split one level finer — clause punctuation while `finer` is set, then
         plain word boundaries. Both re-splits MATCH rather than split(), so the
         punctuation stays attached to the piece it ends and the voice keeps the
         pause it was carrying. */
      function pack(pieces, out, finer) {
        var buf = '';
        for (var i = 0; i < pieces.length; i++) {
          var piece = tidy(pieces[i]);
          if (!piece) continue;
          if (piece.length > MAX_CHARS) {
            if (buf) { out.push(buf); buf = ''; }
            if (finer) pack(piece.match(/[^,;:]+[,;:]*\s*/g) || [piece], out, false);
            else words(piece, out);
            continue;
          }
          if (buf && (buf + ' ' + piece).length > MAX_CHARS) { out.push(buf); buf = piece; }
          else buf = buf ? buf + ' ' + piece : piece;
        }
        if (buf) out.push(buf);
      }
      function words(text, out) {
        var parts = text.split(/\s+/), buf = '';
        for (var i = 0; i < parts.length; i++) {
          if (buf && (buf + ' ' + parts[i]).length > MAX_CHARS) { out.push(buf); buf = parts[i]; }
          else buf = buf ? buf + ' ' + parts[i] : parts[i];
        }
        if (buf) out.push(buf);
      }

      /* Walk the scoped body and return the chunks to speak, in document order.
         querySelectorAll gives document order, and a descendant of an element we
         have already spoken always follows it CONTIGUOUSLY — so tracking the one
         last-spoken element is enough to stop a <li>'s inner <p>, or a table's
         own cells, being read a second time. */
      function chunks(h1) {
        var out = [];
        if (h1) out = out.concat(split(h1));
        var nodes = body.querySelectorAll(
          'p, h2, h3, h4, h5, h6, li, blockquote, figcaption, dt, dd, pre, .tf-prose-table, table');
        var last = null;
        for (var i = 0; i < nodes.length; i++) {
          var el = nodes[i];
          if (last && last.contains(el)) continue;                   // already covered by an ancestor
          if (el.tagName === 'TABLE' || el.classList.contains('tf-prose-table')) {
            out.push(TABLE_LINE);
            last = el;                                               // and never descend into it
            continue;
          }
          var text = tidy(el.textContent);
          if (text) { out = out.concat(split(text)); last = el; }
        }
        return out;
      }

      /* Voices arrive late in Chrome (getVoices() is [] until voiceschanged
         fires) but are ready synchronously in Safari and Firefox, which may then
         never fire the event at all. Check first, listen second, and give up
         after a beat so a browser that does neither cannot leave us waiting
         forever with a half-promise of a button. */
      function withVoices(cb) {
        var ready = synth.getVoices();
        if (ready && ready.length) { cb(ready); return; }
        var done = false, timer;
        function settle() {
          if (done) return;
          done = true;
          synth.removeEventListener('voiceschanged', settle);
          clearTimeout(timer);
          cb(synth.getVoices() || []);
        }
        synth.addEventListener('voiceschanged', settle);
        timer = setTimeout(settle, 2000);
      }

      /* Voice ranking — RANK, don't take the first.
         The order getVoices() returns is unspecified, and on macOS the list
         interleaves 40+ languages with the legacy novelty set. Measured on one
         Mac: 180 voices, of which the 41 English ones include Zarvox, Bad News,
         Bubbles, Jester, Organ and Trinoids, with Alice (it-IT), Alva (sv-SE)
         and Anna (de-DE) sitting third, fourth and seventh in the raw list.
         "First localService voice" therefore reads a visitor's post in German,
         or by a cartoon robot, entirely depending on whose machine it is.

         Scored, highest wins. The two structural weights dominate the two
         taste weights on purpose, so no amount of "nice voice" can outrank
         either of them:
           +32 speaks the page's language — a wrong-language voice is the worst
               outcome available and outranks everything else
           +16 on-device (localService) — the privacy preference: nothing leaves
               the machine. Strictly greater than QUALITY + KNOWN combined, so a
               network voice can never win against a local one that speaks the
               language, however good it claims to be. The network fallback is
               real but last, which is what privacy.html discloses.
            +4 an Enhanced / Premium / Neural / Natural engine — the modern
               voices, markedly better than the compact defaults
            +2 a known-good platform default, by name
            -8 a legacy novelty voice, by name — reachable only if the machine
               offers literally nothing else */
      var QUALITY = /enhanced|premium|neural|natural|siri/i;
      var KNOWN = /^(samantha|alex|ava|allison|susan|zoe|evan|nathan|joelle|noelle|tom|daniel|karen|moira|tessa|rishi|serena|google (uk|us) english|microsoft (aria|guy|jenny|zira|david))/i;
      var NOVELTY = /^(albert|agnes|bad news|bahh|bells|boing|bruce|bubbles|cellos|deranged|fred|good news|hysterical|jester|junior|kathy|organ|pipe organ|princess|ralph|superstar|trinoids|victoria|whisper|wobble|zarvox)\b/i;
      function primaryLang(tag) { return (tag || '').toLowerCase().split(/[-_]/)[0]; }
      var pageLang = primaryLang(document.documentElement.lang) || 'en';
      function score(v) {
        var name = v.name || '', s = 0;
        if (primaryLang(v.lang) === pageLang) s += 32;
        if (v.localService) s += 16;
        if (QUALITY.test(name)) s += 4;
        if (KNOWN.test(name)) s += 2;
        if (NOVELTY.test(name)) s -= 8;
        return s;
      }

      withVoices(function (voices) {
        if (!voices.length) return;                                  // nothing can speak — render nothing
        var voice = voices[0], best = score(voices[0]);
        for (var i = 1; i < voices.length; i++) {
          var s = score(voices[i]);
          if (s > best) { best = s; voice = voices[i]; }              // > not >=: a tie keeps the platform's own order
        }

        var h1 = prose.querySelector('h1');
        var queue = null;                                            // built on first press, then reused
        var speaking = false;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'tf-listen';

        function paint() {
          btn.classList.toggle('is-speaking', speaking);
          // The LABEL is the accessible name, so it changes with the state and a
          // screen reader announces the new one. The icon is decorative.
          btn.innerHTML = (speaking ? ICON_STOP : ICON_LISTEN) +
            '<span>' + (speaking ? 'Stop' : 'Listen') + '</span>';
        }
        function idle() { speaking = false; paint(); }

        function start() {
          if (!queue) queue = chunks(h1 ? tidy(h1.textContent) : '');
          if (!queue.length) return;
          synth.cancel();                                            // clear anything stale before queueing
          for (var i = 0; i < queue.length; i++) {
            var u = new SpeechSynthesisUtterance(queue[i]);
            u.voice = voice;
            u.lang = voice.lang || document.documentElement.lang || 'en';
            if (i === queue.length - 1) u.onend = idle;               // the whole post finished
            u.onerror = idle;                                        // also fires on cancel; idle is right either way
            synth.speak(u);
          }
          speaking = true;
          paint();
        }
        function stop() { synth.cancel(); idle(); }                  // cancel drops the queue: Listen restarts from the top

        btn.addEventListener('click', function () { speaking ? stop() : start(); });
        // Chrome can carry speech across a navigation — the voice keeps reading
        // the post you just left. pagehide covers both a normal unload and the
        // back/forward cache.
        window.addEventListener('pagehide', function () { synth.cancel(); });

        paint();
        meta.appendChild(btn);
      });
    }

    fetch('bloglist.json').then(function (r) {
      if (!r.ok) throw new Error('bloglist ' + r.status);
      return r.json();
    }).then(function (posts) {
      if (!Array.isArray(posts)) throw new Error('malformed manifest');

      var self = null;
      for (var i = 0; i < posts.length; i++) { if (posts[i].blogID === selfId) { self = posts[i]; break; } }

      // 3. Rail image — optional per-post "image" in the manifest. Absent → no
      //    element at all, so the rail top stays clean. "imageAlt" carries the
      //    post's alt text; with no imageAlt the image renders alt="" (decorative),
      //    which is the correct fallback — never a filename or a guess.
      var rail = document.querySelector('.tf-toc');
      if (rail && self && self.image) {
        var img = document.createElement('img');
        img.className = 'tf-rail-img tf-photo';
        img.src = self.image;
        img.alt = self.imageAlt || '';
        img.loading = 'eager';        // above the fold at the rail top — the LCP candidate; lazy would only cost a flash of empty space
        rail.insertBefore(img, rail.firstChild);
      }

      // 4. Top pager (Previous | Next), wired to published neighbours.
      var pager = document.querySelector('.tf-post-pager');
      if (!pager) return;

      var published = posts.filter(function (p) { return p && p.status === 'published'; });
      var collision = false, seen = {};
      for (var j = 0; j < published.length; j++) {
        if (seen[published[j].date]) { collision = true; break; }
        seen[published[j].date] = true;
      }
      if (collision) console.warn('blog.js: same-date collision among published posts; prev/next muted');

      published.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
      var idx = -1;
      for (var m = 0; m < published.length; m++) { if (published[m].blogID === selfId) { idx = m; break; } }
      var newer = (!collision && idx > 0) ? published[idx - 1] : null;                       // Next
      var older = (!collision && idx !== -1 && idx < published.length - 1) ? published[idx + 1] : null;  // Previous

      function item(post, label) {
        if (post) {
          var a = document.createElement('a');
          a.href = post.filename;
          a.textContent = label;
          return a;
        }
        var s = document.createElement('span');
        s.className = 'is-disabled';
        s.textContent = label;
        return s;
      }
      var sep = document.createElement('span');
      sep.className = 'tf-pager-sep';
      sep.textContent = '|';

      pager.textContent = '';
      pager.appendChild(item(older, '← Previous'));
      pager.appendChild(sep);
      pager.appendChild(item(newer, 'Next →'));
    }).catch(function () { /* soft-fail: no tags/pager; reading time already applied */ });
  } catch (e) {
    /* soft-fail */
  }
})();

/* ── INDEX ──────────────────────────────────────────────────────────────────
   blogs.html marks its container with data-blog-index. This block renders one
   card per PUBLISHED post, date-descending (newest first), from the manifest:
   image cap (image/imageAlt) → date · read · listen meta → title → recap.

   The whole card is a single <a> to the post. Card text comes from the manifest
   only — `recap` is the post's own intro copied verbatim, and `readMinutes` and
   `listenMinutes` are precomputed with the same scope the post page counts with,
   so the index and the post always show the same figures. The card's date is
   abbreviated to three letters; the post page keeps the full month (BLOG.md §3).

   Soft-fail: the container ships with a static "Posts are unavailable right
   now." line baked into the HTML. It is replaced ONLY on a successful render, so
   an unreachable or malformed manifest (or no JS at all) leaves that line
   standing rather than a blank page. */
(function () {
  try {
    var host = document.querySelector('[data-blog-index]');
    if (!host) return;   // not the index page

    // Format an ISO date without Date() — parsing 'YYYY-MM-DD' as a Date is
    // UTC-based and can render the previous day west of Greenwich.
    //
    // THREE-LETTER MONTHS, and only here. The card meta line now carries three
    // items (date · read · listen) at a fixed card width, and the full month name
    // is what pushes the worst case onto a second line. The POST page keeps the
    // full month — its meta is baked into the HTML per BLOG.md §3, and it has a
    // whole column to run in. The asymmetry between card and post is deliberate.
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function fmtDate(iso) {
      var p = (iso || '').split('-');
      if (p.length !== 3) return iso || '';
      return MONTHS[(+p[1]) - 1] + ' ' + (+p[2]) + ', ' + p[0];
    }

    function card(post) {
      var a = document.createElement('a');
      a.className = 'tf-card tf-card-link';
      a.href = post.filename;

      if (post.image) {
        var img = document.createElement('img');
        img.className = 'tf-card-cap tf-photo';
        img.src = post.image;
        img.alt = post.imageAlt || '';     // no imageAlt -> decorative, never a guess
        img.loading = 'lazy';              // a growing list; the browser still fetches in-view cards immediately
        a.appendChild(img);
      }

      var meta = document.createElement('p');
      meta.className = 'tf-meta';          // meta treatment in the kicker slot: ink-soft, never brick
      // Both figures come from the manifest — the card has no body to count.
      // They are precomputed with the post page's own scope (BLOG.md §6), so the
      // card and the post always show the same two numbers.
      meta.textContent = fmtDate(post.date) +
        (post.readMinutes ? ' · ' + post.readMinutes + ' min read' : '') +
        (post.listenMinutes ? ' · ' + post.listenMinutes + ' min listen' : '');
      a.appendChild(meta);

      var title = document.createElement('h2');
      title.className = 'tf-card-title';
      title.textContent = post.title;
      a.appendChild(title);

      if (post.recap) {
        var recap = document.createElement('p');
        recap.className = 'tf-card-body';
        recap.textContent = post.recap;
        a.appendChild(recap);
      }
      return a;
    }

    fetch('bloglist.json').then(function (r) {
      if (!r.ok) throw new Error('bloglist ' + r.status);
      return r.json();
    }).then(function (posts) {
      if (!Array.isArray(posts)) throw new Error('malformed manifest');

      var published = posts.filter(function (p) { return p && p.status === 'published'; });
      published.sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
      if (!published.length) return;       // nothing to show: keep the baked line

      var grid = document.createElement('div');
      // tf-blog-grid is a STYLE HOOK, not a layout class: it scopes the card
      // meta's smaller type (STYLE.css) to this grid alone, so the shared
      // .tf-meta treatment is unchanged on post pages, privacy.html and the
      // tool pages. Layout still comes entirely from .tf-card-grid.
      grid.className = 'tf-card-grid tf-blog-grid';
      published.forEach(function (p) { grid.appendChild(card(p)); });

      host.textContent = '';               // drop the baked soft-fail line
      host.appendChild(grid);
    }).catch(function () { /* soft-fail: the baked "unavailable" line stands */ });
  } catch (e) {
    /* soft-fail */
  }
})();
