/* blog.js — blog post enhancements, driven by bloglist.json.

   A post identifies itself with data-blog-id="<blogID>". This script:
   1. Reading time — counts the article's words (DOM only, no manifest needed),
      ~220 wpm rounded up, and appends " · N min read" to the date meta line.
   2. Filed-under tags — renders the FULL tag vocabulary (alphabetical union of
      every manifest entry's primaryTags + secondaryTags) into the rail, above
      "In this article": this post's primary tag(s) filled, secondary outlined,
      every other vocabulary tag muted.
   3. Top pager — wires the "← Previous | Next →" row: Previous = next older
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

    // 1. Reading time — DOM word count, independent of the manifest.
    (function () {
      if (!prose) return;
      var meta = prose.querySelector('.tf-meta');
      if (!meta) return;
      var words = 0;
      var els = prose.querySelectorAll('h1, h2, h3, p');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.classList.contains('tf-meta')) continue;
        if (el.closest('.tf-post-topnav')) continue;
        var parts = el.textContent.trim().split(/\s+/);
        for (var k = 0; k < parts.length; k++) if (parts[k]) words++;
      }
      if (words > 0) {
        var mins = Math.max(1, Math.ceil(words / 220));
        meta.textContent += ' · ' + mins + ' min read';
      }
    })();

    fetch('bloglist.json').then(function (r) {
      if (!r.ok) throw new Error('bloglist ' + r.status);
      return r.json();
    }).then(function (posts) {
      if (!Array.isArray(posts)) throw new Error('malformed manifest');

      var self = null;
      for (var i = 0; i < posts.length; i++) { if (posts[i].blogID === selfId) { self = posts[i]; break; } }

      // 2. Filed-under tags in the rail.
      var rail = document.querySelector('.tf-toc');
      if (rail && self) {
        var vocab = {};
        posts.forEach(function (p) {
          (p.primaryTags || []).concat(p.secondaryTags || []).forEach(function (t) { vocab[t] = true; });
        });
        var tags = Object.keys(vocab).sort();
        var prim = self.primaryTags || [];
        var sec = self.secondaryTags || [];

        var block = document.createElement('div');
        block.className = 'tf-toc-tags';
        var label = document.createElement('div');
        label.className = 'tf-meta tf-toc-tags-label';
        label.textContent = 'Filed under';
        var pills = document.createElement('div');
        pills.className = 'tf-pills';
        tags.forEach(function (t) {
          var span = document.createElement('span');
          var state = prim.indexOf(t) >= 0 ? 'tf-pill-primary'
                    : (sec.indexOf(t) >= 0 ? 'tf-pill-secondary' : 'tf-pill-muted');
          span.className = 'tf-pill ' + state;
          span.textContent = t;
          pills.appendChild(span);
        });
        block.appendChild(label);
        block.appendChild(pills);
        rail.insertBefore(block, rail.firstChild);
      }

      // 3. Top pager (Previous | Next), wired to published neighbours.
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
