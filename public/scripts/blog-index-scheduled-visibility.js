/**
 * Blog index: show cards when publish instant <= now (main thread only; not Partytown).
 * Loaded from /scripts/ — never use type="text/partytown" for DOM access.
 */
(function () {
  let blogIndexPublishIntervalId;
  document.addEventListener('astro:page-load', function () {
    if (blogIndexPublishIntervalId !== undefined) {
      window.clearInterval(blogIndexPublishIntervalId);
      blogIndexPublishIntervalId = undefined;
    }
    var syncBlogPublishVisibility = function () {
      var now = Date.now();
      document.querySelectorAll('.blog-index-card[data-blog-publish-at]').forEach(function (el) {
        var raw = el.getAttribute('data-blog-publish-at');
        var at = raw ? Date.parse(raw) : NaN;
        var published = !Number.isFinite(at) || at <= now;
        if (published) {
          el.classList.add('blog-published');
          el.removeAttribute('hidden');
        }
      });
    };
    syncBlogPublishVisibility();
    blogIndexPublishIntervalId = window.setInterval(syncBlogPublishVisibility, 30000);
  });
})();
