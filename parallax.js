/**
 * 3D Parallax Card Effect
 * Inspired by OpenAI's 2018 research page cards.
 */
(function () {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const defaults = {
    angle: 6.5,
    scale: 1.05,
    childMovement: 2.5,
    transition: 'transform .4s cubic-bezier(.4,0,.2,1)',
    activeTransition: 'transform .4s cubic-bezier(0,0,.2,1)',
  };

  function initCard(el, opts) {
    const cfg = Object.assign({}, defaults, opts);
    const glare = el.querySelector('.card-glare');
    const depthEls = el.querySelectorAll('[data-depth]');
    let rect;
    let active = false;

    el.style.transformStyle = 'preserve-3d';
    el.style.perspective = '1000px';

    const inner = el.firstElementChild;
    if (!inner) return;

    inner.style.transition = cfg.transition;
    inner.style.willChange = 'transform';
    inner.style.transform = 'rotateY(0.0000001deg) rotateX(0deg) scale(1)';

    el.addEventListener('mouseenter', function () {
      rect = el.getBoundingClientRect();
      inner.style.transition = cfg.activeTransition;
    });

    el.addEventListener('mousemove', function (e) {
      if (!rect) rect = el.getBoundingClientRect();

      const x = (e.clientX - rect.left) / rect.width * 2 - 1;
      const y = (e.clientY - rect.top) / rect.height * 2 - 1;

      const rotY = x * cfg.angle;
      const rotX = y * -cfg.angle;

      inner.style.transform =
        'rotateY(' + rotY + 'deg) rotateX(' + rotX + 'deg) scale(' + cfg.scale + ')';

      if (glare) {
        const gx = -x * (0.2 * rect.width);
        const gy = -y * (0.2 * rect.height);
        glare.style.transform = 'translate(' + gx + 'px, ' + gy + 'px)';
      }

      for (var i = 0; i < depthEls.length; i++) {
        var d = depthEls[i];
        var depth = parseFloat(d.getAttribute('data-depth')) || 1;
        var mv = cfg.childMovement * depth;
        d.style.transform =
          'translateX(' + (x * mv) + 'px) translateY(' + (y * mv) + 'px)';
      }

      active = true;
    });

    el.addEventListener('mouseleave', function () {
      inner.style.transition = cfg.transition;
      inner.style.transform = 'rotateY(0.0000001deg) rotateX(0deg) scale(1)';

      if (glare) {
        glare.style.transform = 'translate(0px, 0px)';
      }

      for (var i = 0; i < depthEls.length; i++) {
        depthEls[i].style.transform = 'none';
      }

      active = false;
      rect = null;
    });
  }

  // Auto-init
  document.addEventListener('DOMContentLoaded', function () {
    var cards = document.querySelectorAll('[data-parallax]');
    cards.forEach(function (card) {
      var angle = parseFloat(card.getAttribute('data-parallax-angle')) || defaults.angle;
      var scale = parseFloat(card.getAttribute('data-parallax-scale')) || defaults.scale;
      initCard(card, { angle: angle, scale: scale });
    });
  });
})();
