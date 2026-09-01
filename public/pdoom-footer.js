/* The footer backdrop parallax, ported from the Footer effect in src/App.jsx so
   the standalone pages under public/ scroll the same way the React site does.
   Without this the backdrop sits frozen at the top of its travel. */
(function () {
  var footer = document.querySelector('.site-footer');
  var backdrop = document.querySelector('.footer-backdrop');
  if (!footer || !backdrop) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var frame = 0;
  function update() {
    frame = 0;
    var rect = footer.getBoundingClientRect();
    var progress = Math.max(0, Math.min(1,
      (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    backdrop.style.transform = 'translate3d(0, ' + (-36 + progress * 36) + 'px, 0) scale(1.08)';
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }

  update();
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
})();
