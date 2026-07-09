(function () {
  function init() {
    var sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (!sidebar.id) sidebar.id = 'mainSidebar';

    // Pull brand info from the existing sidebar so the mobile bar matches it
    var logoEl = sidebar.querySelector('.sidebar__logo');
    var nameEl = sidebar.querySelector('.sidebar__brand-name');
    var logoText = logoEl ? logoEl.textContent.trim() : '';
    var nameText = nameEl ? nameEl.textContent.trim() : '';

    // Build the mobile topbar
    var topbar = document.createElement('div');
    topbar.className = 'mobile-topbar';
    topbar.innerHTML =
      '<div class="mobile-topbar__brand">' +
        '<div class="mobile-topbar__logo" aria-hidden="true">' + logoText + '</div>' +
        '<span>' + nameText + '</span>' +
      '</div>' +
      '<button type="button" class="sidebar-toggle" id="sidebarToggle" ' +
        'aria-label="Open navigation" aria-expanded="false" aria-controls="' + sidebar.id + '">' +
        '<i class="fa-solid fa-bars"></i>' +
      '</button>';

    // Build the backdrop
    var overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebarOverlay';

    document.body.insertBefore(overlay, document.body.firstChild);
    document.body.insertBefore(topbar, document.body.firstChild);

    var toggleBtn = document.getElementById('sidebarToggle');
    var toggleIcon = toggleBtn.querySelector('i');

    function openSidebar() {
      sidebar.classList.add('is-open');
      overlay.classList.add('is-visible');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleIcon.className = 'fa-solid fa-xmark';
    }

    function closeSidebar() {
      sidebar.classList.remove('is-open');
      overlay.classList.remove('is-visible');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleIcon.className = 'fa-solid fa-bars';
    }

    toggleBtn.addEventListener('click', function () {
      sidebar.classList.contains('is-open') ? closeSidebar() : openSidebar();
    });

    overlay.addEventListener('click', closeSidebar);

    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeSidebar();
    });

    sidebar.querySelectorAll('.sidebar__link').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) closeSidebar();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();