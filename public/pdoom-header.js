/* The site nav, ported from the Header component in src/App.jsx so the
   hand-rolled pages under public/ carry the same bar as the React site: the
   same top-level items, the same dropdowns and the same mobile drawer. Keep
   navItems in step with the array of the same name in src/App.jsx.

   The React site renders no nav at all without JavaScript, and these pages
   already need JavaScript for their forms, so building the markup here beats
   repeating it in seven files. */
(function () {
  var header = document.querySelector('.site-header');
  var navHost = header && header.querySelector('.desktop-nav');
  var toggle = header && header.querySelector('.menu-toggle');
  if (!header || !navHost || !toggle) return;

  var navItems = [
    { label: 'Research', href: '/research/' },
    {
      label: 'Releases',
      groups: [
        {
          label: 'Latest releases',
          items: [
            { label: 'Inverse Dynamics Model', description: 'Action-labeling unlabeled videos', href: '/research/inverse-dynamics-model/' },
            { label: 'omegalax', description: 'VLM training codebase', href: 'https://github.com/p-doom/omegalax' },
            { label: 'crowd-cast', description: 'Screen capture infrastructure', href: '/research/crowd-cast/' },
            { label: 'AGI-CAST', description: 'Long-horizon research dataset', href: '/research/agi-cast/' },
            { label: 'crowd-code', description: 'Data for product-feedback loops', href: '/research/crowd-code/' },
            { label: 'Jasmine', description: 'JAX world-modeling codebase and dataset', href: '/research/jasmine/' },
          ],
        },
        {
          label: 'Browse',
          items: [
            { label: 'All research', description: 'Publications and release notes', href: '/research/' },
            { label: 'Models and datasets', description: 'Weights and open data', href: 'https://huggingface.co/p-doom' },
          ],
        },
      ],
    },
    {
      label: 'Resources',
      groups: [
        {
          label: 'Resources',
          items: [
            { label: 'Documentation', description: 'Guides and reference', href: '/docs/crowd-cast/' },
            { label: 'Research', description: 'Publications and releases', href: '/research/' },
            { label: 'GitHub', description: 'Open source code', href: 'https://github.com/p-doom' },
            { label: 'Hugging Face', description: 'Models and datasets', href: 'https://huggingface.co/p-doom' },
            { label: 'Discord', description: 'Community and discussion', href: 'https://discord.gg/G4JNuPX2VR' },
          ],
        },
        {
          label: 'Company',
          items: [
            { label: 'About us', description: 'Methods that unblock scaling', href: '/about/' },
            { label: 'Careers', description: 'Work with us', href: '/careers/' },
            { label: 'Merch', description: 'Support the work', href: '/merch/' },
            { label: 'Imprint', description: 'Legal information', href: '/imprint/' },
          ],
        },
      ],
    },
  ];

  /* lucide-react icon nodes, so the strokes match the ones React renders */
  function icon(size, paths) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var chevronDown = icon(13, '<path d="m6 9 6 6 6-6"/>');
  var closeIcon = icon(24, '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>');
  var menuIcon = icon(22, '<path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>');
  function arrowRight(size) {
    return icon(size, '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>');
  }

  var brandMark = '<img src="/assets/pdoom-mark.webp"' +
    ' srcset="/assets/pdoom-mark-128.webp 128w, /assets/pdoom-mark-256.webp 256w, /assets/pdoom-mark.webp 512w"' +
    ' sizes="38px" alt="" aria-hidden="true" width="512" height="512" decoding="async">';

  function esc(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---- desktop nav ---- */

  toggle.innerHTML = menuIcon;

  navHost.innerHTML = '<ul class="nav-list">' + navItems.map(function (item) {
    if (!item.groups) {
      return '<li class="nav-entry"><a href="' + esc(item.href) + '">' + esc(item.label) + '</a></li>';
    }
    var groups = item.groups.map(function (group) {
      var links = group.items.map(function (entry) {
        return '<li><a href="' + esc(entry.href) + '"><span class="nav-dropdown-copy">' +
          '<strong>' + esc(entry.label) + '</strong>' +
          '<small>' + esc(entry.description) + '</small>' +
          '</span></a></li>';
      }).join('');
      return '<section class="nav-dropdown-group" aria-label="' + esc(group.label) + '">' +
        '<span class="nav-dropdown-heading">' + esc(group.label) + '</span>' +
        '<ul>' + links + '</ul></section>';
    }).join('');
    return '<li class="nav-entry">' +
      '<button class="nav-trigger" type="button" aria-expanded="false" data-state="closed">' +
      esc(item.label) + chevronDown + '</button>' +
      '<div class="nav-dropdown nav-dropdown--grouped" hidden>' + groups + '</div>' +
      '</li>';
  }).join('') + '</ul>';

  var triggers = [].slice.call(navHost.querySelectorAll('.nav-trigger'));

  function setOpen(trigger, open) {
    var dropdown = trigger.nextElementSibling;
    trigger.setAttribute('data-state', open ? 'open' : 'closed');
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (dropdown) dropdown.hidden = !open;
  }
  function closeAll(except) {
    for (var i = 0; i < triggers.length; i += 1) {
      if (triggers[i] !== except) setOpen(triggers[i], false);
    }
  }

  triggers.forEach(function (trigger) {
    var entry = trigger.parentElement;
    entry.addEventListener('mouseenter', function () {
      closeAll(trigger);
      setOpen(trigger, true);
    });
    trigger.addEventListener('click', function () {
      var open = trigger.getAttribute('data-state') === 'open';
      closeAll(trigger);
      setOpen(trigger, !open);
    });
  });

  navHost.addEventListener('mouseleave', function () { closeAll(); });
  navHost.addEventListener('focusout', function (event) {
    if (!navHost.contains(event.relatedTarget)) closeAll();
  });
  document.addEventListener('pointerdown', function (event) {
    if (!navHost.contains(event.target)) closeAll();
  });

  /* ---- mobile drawer ---- */

  var drawer = document.createElement('div');
  drawer.className = 'mobile-drawer';
  drawer.id = 'mobile-navigation';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-label', 'Mobile navigation');
  drawer.setAttribute('aria-modal', 'true');
  drawer.innerHTML = '<div class="drawer-top">' +
    '<span class="pdoom-brand">' + brandMark + '<span>p(doom)</span></span>' +
    '<button type="button" class="icon-button light" aria-label="Close navigation">' + closeIcon + '</button>' +
    '</div><nav aria-label="Mobile navigation">' + navItems.map(function (item) {
      if (!item.groups) {
        return '<a href="' + esc(item.href) + '">' + esc(item.label) + arrowRight(18) + '</a>';
      }
      return '<section class="drawer-nav-section"><h2>' + esc(item.label) + '</h2>' +
        item.groups.map(function (group) {
          return '<div class="drawer-nav-group"><span>' + esc(group.label) + '</span>' +
            group.items.map(function (entry) {
              return '<a href="' + esc(entry.href) + '"><span>' +
                '<strong>' + esc(entry.label) + '</strong>' +
                '<small>' + esc(entry.description) + '</small>' +
                '</span>' + arrowRight(17) + '</a>';
            }).join('') + '</div>';
        }).join('') + '</section>';
    }).join('') + '</nav>';

  header.insertAdjacentElement('afterend', drawer);

  var closeButton = drawer.querySelector('.icon-button');
  var background = [
    header,
    document.querySelector('.site-announcement'),
    document.querySelector('main'),
    document.querySelector('.footer-canvas'),
  ].filter(Boolean);

  function setMenu(open, moveFocus) {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    drawer.inert = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('menu-locked', open);
    for (var i = 0; i < background.length; i += 1) background[i].inert = open;
    if (!moveFocus) return;
    if (open) closeButton.focus();
    else toggle.focus();
  }

  setMenu(false, false);
  toggle.addEventListener('click', function () { setMenu(true, true); });
  closeButton.addEventListener('click', function () { setMenu(false, true); });
  drawer.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false, false);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (drawer.classList.contains('is-open')) {
      event.preventDefault();
      setMenu(false, true);
      return;
    }
    var openTrigger = navHost.querySelector('.nav-trigger[data-state="open"]');
    if (openTrigger) {
      event.preventDefault();
      setOpen(openTrigger, false);
      openTrigger.focus();
    }
  });
})();
