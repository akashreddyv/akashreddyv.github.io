/* ============================================================
   reachakash.com — Time Machine
   A draggable slider that re-skins the site across web eras:
   1998 (GeoCities) → 2008 (Web 2.0) → 2026 (today).
   Pure CSS era classes on <body>. Open via the footer link or
   the terminal `era` command. 100% static.
   ============================================================ */
(function () {
  'use strict';

  const ERAS = [
    { year: '1998', cls: 'era-1998', name: 'GeoCities',  desc: 'Under construction. Best viewed in Netscape Navigator.' },
    { year: '2008', cls: 'era-2008', name: 'Web 2.0',    desc: 'Glossy gradients, rounded corners, and beta badges.' },
    { year: '2026', cls: '',         name: 'Today',      desc: 'The site exactly as it is now.' }
  ];

  let panel, slider, yearEl, nameEl, descEl, marquee = null;
  let isOpen = false;
  let idx = 2;

  function build() {
    panel = document.createElement('div');
    panel.id = 'timemachine';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Time machine — change the era of the site');
    panel.innerHTML = `
      <div class="tm-head">
        <span class="tm-icon" aria-hidden="true">🕰</span>
        <span class="tm-title">Time Machine</span>
        <button class="tm-close" aria-label="Close time machine">✕</button>
      </div>
      <div class="tm-year" id="tm-year">2026</div>
      <div class="tm-era-name" id="tm-name">Today</div>
      <input class="tm-slider" id="tm-slider" type="range" min="0" max="2" step="1" value="2"
             aria-label="Era selector" aria-valuetext="2026, Today" />
      <div class="tm-ticks"><span>1998</span><span>2008</span><span>2026</span></div>
      <div class="tm-desc" id="tm-desc">The site exactly as it is now.</div>`;
    document.body.appendChild(panel);

    slider = panel.querySelector('#tm-slider');
    yearEl = panel.querySelector('#tm-year');
    nameEl = panel.querySelector('#tm-name');
    descEl = panel.querySelector('#tm-desc');

    slider.addEventListener('input', () => applyEra(parseInt(slider.value, 10)));
    panel.querySelector('.tm-close').addEventListener('click', close);
  }

  function applyEra(i) {
    idx = i;
    const era = ERAS[i];
    document.body.classList.remove('era-1998', 'era-2008');
    if (era.cls) document.body.classList.add(era.cls);

    yearEl.textContent = era.year;
    nameEl.textContent = era.name;
    descEl.textContent = era.desc;
    slider.value = i;
    slider.setAttribute('aria-valuetext', era.year + ', ' + era.name);

    toggleMarquee(i === 0);
  }

  function toggleMarquee(on) {
    if (on && !marquee) {
      marquee = document.createElement('div');
      marquee.className = 'tm-marquee';
      marquee.setAttribute('aria-hidden', 'true');
      marquee.innerHTML = '<span>★ Welcome to Akash’s HomePage ★ Best viewed in Netscape Navigator at 800×600 ★ ' +
        'You are visitor #001,337 ★ Sign my guestbook! ★ Under Construction ★ ' +
        'This site is Y2K ready ★</span>';
      document.body.appendChild(marquee);
    } else if (!on && marquee) {
      marquee.remove();
      marquee = null;
    }
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    panel.classList.add('open');
    // Bring the home hero into view so the era change is visible
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    panel.classList.remove('open');
    // Reset to "today" so the rest of the site looks normal after closing
    applyEra(2);
  }

  function toggle() { isOpen ? close() : open(); }

  // Exposed so the terminal `era` command can launch it
  window.openTimeMachine = open;
  window.toggleTimeMachine = toggle;

  function wireFooter() {
    const f = document.getElementById('footer-tm');
    if (!f) return;
    f.addEventListener('click', function (e) { e.preventDefault(); toggle(); });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  }

  function init() {
    build();
    wireFooter();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
