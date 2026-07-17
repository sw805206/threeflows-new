/* blog.js — blog post enhancements, driven by bloglist.json.

   A post identifies itself with data-blog-id="<blogID>". This script:
   1. Reading time — counts the article's words (DOM only, no manifest needed),
      ~220 wpm rounded up, and appends " · N min read" to the date meta line.
   2. Rail image — if the manifest entry carries an optional "image" path, renders
      it at the TOP of the rail (above "In this article"). Absent field → nothing
      rendered: no placeholder, no broken image.
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

    // 1. Reading time — DOM word count, independent of the manifest. Counts the
    //    reader-visible article body: everything inside .tf-prose EXCEPT the h1
    //    (so editing a title never moves the count), the date/meta line, and the
    //    top nav row (which sits INSIDE .tf-prose, not outside it). Scoping by
    //    container-minus-exclusions rather than a tag list means body elements
    //    count automatically as they appear — list items do now, and tables or
    //    callouts will when they arrive.
    (function () {
      if (!prose) return;
      var meta = prose.querySelector('.tf-meta');
      if (!meta) return;
      var body = prose.cloneNode(true);                              // count off a copy; the page keeps its DOM
      var skip = body.querySelectorAll('h1, .tf-meta, .tf-post-topnav');
      for (var i = 0; i < skip.length; i++) skip[i].remove();
      var parts = body.textContent.trim().split(/\s+/);
      var words = 0;
      for (var k = 0; k < parts.length; k++) if (parts[k]) words++;
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

      // 2. Rail image — optional per-post "image" in the manifest. Absent → no
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
