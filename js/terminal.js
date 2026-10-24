/* ============================================================
   reachakash.com — Interactive Terminal
   A keyboard-driven CLI easter egg. Open with the `~` / backtick
   key, the footer "terminal" link, or the floating launcher.
   100% static — no backend. `cd` navigates to the real page URLs,
   and `theme` uses the same theme switch as the nav's sun/moon button.
   ============================================================ */
(function () {
  'use strict';

  // ── Static "filesystem" of facts, sourced from the site content ──
  const ME = {
    name:    'Akash Reddy',
    full:    'Vurenuka Akash Reddy',
    role:    'AI Software Developer @ Molex',
    where:   'Detroit, MI, USA',
    origin:  'Hyderabad, India',
    email:   'mail@reachakash.com',
    skills:  ['C#', '.NET Framework', 'SQL Server', 'T-SQL', 'LabVIEW', 'PostgreSQL', 'WinForms', 'NI-VISA', 'NI-DAQmx', 'SQL', 'JavaScript', 'Git', 'GitLab'],
    edu: [
      'M.S. Engineering Management — Arkansas State University',
      'Amity University',
      'Malla Reddy College of Engineering and Technology'
    ],
    work: [
      ['Jun 2026 — Present',   'AI Software Developer',        'Molex (GRTS)',              'Database systems for connector reliability test stations.'],
      ['Jan 2026 — Jun 2026',  'Software Developer',           'Zoetis (VMRD)',             'ZAHM — .NET app for manufacturing test workflows.'],
      ['Nov 2024 — Dec 2025',  'Software Developer',           'Raptor Consultants Group',  ''],
      ['Aug 2022 — Aug 2023',  'Software Engineer',            'Tata Consultancy Services', 'AWS cloud infrastructure; AWS Certified Cloud Practitioner.'],
      ['',                     'Associate Software Developer', 'Persistent Systems Ltd.',   '']
    ],
    projects: [
      ['reachakash.com', 'This site: static pages built from one template by a small build script, vanilla JS, hosted on GitHub Pages.'],
      ['Logo Designs',   'Interactive 3D logo viewer built with Three.js: the reachAkash mark and a crystal variant.']
    ],
    socials: [
      ['LinkedIn',  'https://www.linkedin.com/in/akashreddyv/'],
      ['GitHub',    'https://github.com/akashreddyv'],
      ['Instagram', 'https://www.instagram.com/ak.r48'],
      ['X',         'https://x.com/AkReddy48'],
      ['YouTube',   'https://www.youtube.com/@ak.r48'],
      ['Threads',   'https://www.threads.com/@ak.r48'],
      ['Snapchat',  'https://www.snapchat.com/@ak.r48'],
      ['Facebook',  'https://www.facebook.com/ak.r48']
    ]
  };

  // Every place `cd` can go (and `ls` lists), in the same order as the site's nav, then the rest.
  const PAGES = {
    home: '/', services: '/services', projects: '/projects', referrals: '/referrals', socials: '/socials',
    about: '/about', personal: '/personal', professional: '/professional', contact: '/contact',
    gallery: '/gallery', logos: '/gallery#logos', merch: '/gallery#merch', suggestions: '/suggestions',
    'logo-viewer': '/projects/logodesigns', privacy: '/privacy'
  };
  const PAGE_NAMES = Object.keys(PAGES);
  // The opening menu: commands worth one click, so nobody has to type `help` first.
  const QUICK = ['whoami', 'work', 'projects', 'skills', 'socials', 'suggest', 'theme', 'play', 'matrix', 'help'];

  // What `matrix` and `play` draw with on their dark canvases: --term-fx in css/styles.css,
  // which stays light in every theme (the page accent is black in light mode).
  function fxColor() {
    return getComputedStyle(term || document.body).getPropertyValue('--term-fx').trim() || '#FFFFFF';
  }
  const THEMES = ['dark', 'light', 'retro', 'space'];
  function currentTheme() {
    const cur = document.documentElement.className.match(/\btheme-(\w+)/);
    return cur && THEMES.includes(cur[1]) ? cur[1] : 'dark';
  }
  // The themes as one-click choices (each runs `theme <name>`), with the current one ticked.
  function themeChoices() {
    const cur = currentTheme();
    write(THEMES.map(t => t === cur
      ? `<span class="term-run is-current" data-cmd="theme ${t}" role="button" tabindex="0" aria-current="true">${t}</span>`
      : `<span class="term-run" data-cmd="theme ${t}" role="button" tabindex="0">${t}</span>`).join(''), 'term-menu');
  }

  const BANNER = [
    '    _    _  __     _    ____  _   _ ',
    '   / \\  | |/ /    / \\  / ___|| | | |',
    '  / _ \\ | \' /    / _ \\ \\___ \\| |_| |',
    ' / ___ \\| . \\   / ___ \\ ___) |  _  |',
    '/_/   \\_\\_|\\_\\ /_/   \\_\\____/|_| |_|'
  ];

  // ── Build DOM ──
  let term, out, input, promptEl, launcher;
  let isOpen = false;
  const history = [];
  let histIdx = -1;
  let matrixStop = null;
  let gameStop = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
    ));
  }

  function build() {
    term = document.createElement('div');
    term.id = 'terminal';
    term.setAttribute('role', 'dialog');
    term.setAttribute('aria-label', 'Interactive terminal');
    term.setAttribute('aria-hidden', 'true');
    term.innerHTML = `
      <div class="term-window">
        <div class="term-bar">
          <span class="term-dot term-dot-r"></span>
          <span class="term-dot term-dot-y"></span>
          <span class="term-dot term-dot-g"></span>
          <span class="term-title">akash@reachakash: ~</span>
          <button class="term-close" aria-label="Close terminal">✕</button>
        </div>
        <div class="term-body" id="term-out" tabindex="0"></div>
        <div class="term-inputline">
          <span class="term-prompt" id="term-prompt">akash@reachakash:~$</span>
          <input class="term-input" id="term-input" type="text"
                 autocomplete="off" autocorrect="off" autocapitalize="off"
                 spellcheck="false" aria-label="Terminal command input" />
        </div>
      </div>`;
    document.body.appendChild(term);

    out      = term.querySelector('#term-out');
    input    = term.querySelector('#term-input');
    promptEl = term.querySelector('#term-prompt');

    term.querySelector('.term-close').addEventListener('click', close);
    term.querySelector('.term-window').addEventListener('click', () => input.focus());
    input.addEventListener('keydown', onKey);

    // Floating launcher (also gives mobile users a way in)
    launcher = document.createElement('button');
    launcher.id = 'term-launcher';
    launcher.setAttribute('aria-label', 'Open terminal');
    launcher.title = 'Open terminal  (press ~)';
    launcher.innerHTML =
      '<span class="tl-prompt">&gt;_</span>' +
      '<span class="tl-label">Open the terminal</span>' +
      '<span class="tl-key">press ~</span>';
    launcher.addEventListener('click', open);
    document.body.appendChild(launcher);
  }

  // ── Output helpers ──
  function write(html, cls) {
    const line = document.createElement('div');
    line.className = 'term-line' + (cls ? ' ' + cls : '');
    line.innerHTML = html;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }
  function gap() { write('&nbsp;'); }

  // ── Command implementations ──
  const COMMANDS = {
    help() {
      write('Available commands (click one, or type it):', 'term-head');
      // [what to show, what a click runs (null: needs an argument, so it can't be one click), description]
      const rows = [
        ['help',               'help',     'show this list'],
        ['whoami / about',     'whoami',   'who is Akash?'],
        ['ls',                 'ls',       'list every page'],
        ['cd &lt;page&gt;',          null,       'open a page (e.g. cd projects)'],
        ['work',               'work',     'where I have worked'],
        ['skills',             'skills',   'tech I work with'],
        ['projects',           'projects', 'things I have built'],
        ['edu',                'edu',      'education'],
        ['socials',            'socials',  'find me online'],
        ['contact',            'contact',  'how to reach me'],
        ['suggest [idea]',     'suggest',  'send an idea (on its own: open the suggestion box)'],
        ['theme &lt;name&gt;',       'theme',    'dark | light | retro | space (click to pick one)'],
        ['banner',             'banner',   'show the ASCII banner'],
        ['play',               'play',     'shoot down the 404s 👾'],
        ['matrix',             'matrix',   'enter the matrix 🟢'],
        ['date',               'date',     'current date'],
        ['clear',              'clear',    'clear the screen'],
        ['exit',               'exit',     'close the terminal']
      ];
      rows.forEach(([label, cmd, d]) => write(
        (cmd ? `<span class="term-cmd term-run" data-cmd="${cmd}" role="button" tabindex="0">${label}</span>`
             : `<span class="term-cmd">${label}</span>`) +
        `<span class="term-cmddesc">${d}</span>`, 'term-help-row'));
      gap();
      write('Tip: <span class="term-kbd">Tab</span> completes, <span class="term-kbd">↑/↓</span> recalls history, <span class="term-kbd">Esc</span> closes.', 'term-dim');
    },

    // The opening screen: every page and the most-used commands, one click each.
    menu() {
      write('Go to', 'term-head');
      write(PAGE_NAMES.map(p => `<span class="term-link" data-page="${p}" role="button" tabindex="0">${p}</span>`).join(''), 'term-menu');
      gap();
      write('Try', 'term-head');
      write(QUICK.map(c => `<span class="term-run" data-cmd="${c}" role="button" tabindex="0">${c}</span>`).join(''), 'term-menu');
      gap();
      write('Click any of these, or type. <span class="term-cmd">suggest your idea</span> sends an idea straight to Akash.', 'term-dim');
    },

    whoami() { this.about(); },
    about() {
      write(`<span class="term-accent">${ME.full}</span> — ${ME.role}`);
      write(`📍 ${ME.where}  ·  originally from ${ME.origin}`);
      gap();
      write('Techie, builder, and travel-seeker. This whole site is hand-rolled');
      write("vanilla JS — type <span class='term-cmd'>cd projects</span> to see what else I've made.");
    },

    ls() {
      write('pages/', 'term-dim');
      write(PAGE_NAMES.map(p => `<span class="term-link" data-page="${p}" role="button" tabindex="0">${p}</span>`).join(''), 'term-menu');
      write('Use <span class="term-cmd">cd &lt;name&gt;</span> or just click one.', 'term-dim');
    },

    cd(arg) {
      if (!arg) { write('cd: missing page. Try: ' + PAGE_NAMES.join(', '), 'term-err'); return; }
      const target = arg.replace(/^\/+/, '').toLowerCase();
      if (!Object.prototype.hasOwnProperty.call(PAGES, target)) {
        write(`cd: no such page: ${esc(arg)}`, 'term-err');
        return;
      }
      const dest = PAGES[target];
      write(`→ opening ${dest} …`, 'term-accent');
      setTimeout(function () { location.href = dest; }, 250);
    },
    open(a) { this.cd(a); },
    goto(a) { this.cd(a); },

    work() {
      ME.work.forEach(([when, title, org, desc], i) => {
        write(`<span class="term-accent">${esc(title)}</span> · ${esc(org)}${i === 0 ? '  <span class="term-tag">current</span>' : ''}`);
        if (when) write(`  ${esc(when)}`, 'term-dim');
        if (desc) write(`  ${esc(desc)}`, 'term-dim');
      });
      write('Full timeline: <span class="term-cmd">cd professional</span>', 'term-dim');
    },
    jobs() { this.work(); },

    skills() {
      write('skills --list', 'term-dim');
      write(ME.skills.map(s => `<span class="term-tag">${esc(s)}</span>`).join(' '));
    },

    projects() {
      ME.projects.forEach(([name, desc]) => {
        write(`<span class="term-accent">▸ ${esc(name)}</span>`);
        write('  ' + esc(desc), 'term-dim');
      });
      write('Full portfolio: <span class="term-cmd">cd projects</span>', 'term-dim');
    },

    edu() { ME.edu.forEach(e => write('🎓 ' + esc(e))); },

    social()  { this.socials(); },
    socials() {
      ME.socials.forEach(([name, url]) =>
        write(`<span class="term-accent">${name}</span> → <a href="${url}" target="_blank" rel="noopener" class="term-href">${esc(url)}</a>`)
      );
    },

    contact() {
      write(`📧 <a href="mailto:${ME.email}" class="term-href">${ME.email}</a>`);
      write('Or the form: <span class="term-cmd">cd contact</span>', 'term-dim');
    },
    email() { this.contact(); },

    // `suggest` on its own opens the suggestion box; `suggest <idea>` sends it from here,
    // anonymously, through the same sender as the page (window.sendSuggestion in main.js).
    suggest(a, raw) {
      const idea = (raw || '').trim();
      if (!idea) { this.cd('suggestions'); return; }
      if (idea.length < 3) { write('suggest: write a few words, e.g. <span class="term-cmd">suggest add a dark mode to the 3D logo viewer</span>', 'term-err'); return; }
      if (typeof window.sendSuggestion !== 'function') {
        write('→ opening the suggestion box with your idea filled in …', 'term-accent');
        setTimeout(function () { location.href = '/suggestions?idea=' + encodeURIComponent(idea.slice(0, 4000)); }, 250);
        return;
      }
      write('dropping it in the box …', 'term-dim');
      window.sendSuggestion({ idea: idea.slice(0, 4000), via: 'the terminal' }).then(
        function () { write('✓ Sent. Thanks for the idea! (It went anonymously; <span class="term-cmd">cd suggestions</span> if you want to add your name or email.)', 'term-accent'); },
        function (err) { write('suggest: ' + esc(err.message) + ' You can also use <span class="term-cmd">cd suggestions</span>.', 'term-err'); }
      );
    },
    suggestion(a, raw) { this.suggest(a, raw); },
    suggestions(a, raw) { this.suggest(a, raw); },
    idea(a, raw) { this.suggest(a, raw); },

    // `theme` on its own lists the themes to click; `theme <name>` (typed or clicked) switches.
    theme(arg) {
      const name = (arg || '').toLowerCase();
      if (!name) {
        write(`current theme: <span class="term-accent">${currentTheme()}</span>`);
        themeChoices();
        write('Click one, or type <span class="term-cmd">theme &lt;name&gt;</span>.', 'term-dim');
        return;
      }
      if (!THEMES.includes(name)) { write(`theme: unknown "${esc(arg)}". Pick one:`, 'term-err'); themeChoices(); return; }
      if (typeof window.setSiteTheme === 'function') {
        window.setSiteTheme(name);
      } else {
        document.documentElement.classList.remove('theme-light', 'theme-retro', 'theme-space');
        if (name !== 'dark') document.documentElement.classList.add('theme-' + name);
        try { localStorage.setItem('theme', name); localStorage.removeItem('retro-theme'); } catch (e) {}
      }
      write(`theme set to <span class="term-accent">${name}</span> ✨`);
      themeChoices();
    },

    banner() { BANNER.forEach(l => write(esc(l), 'term-banner')); write(`${ME.role}`, 'term-accent'); },

    date() { write(new Date().toString()); },
    pwd()  { write('/home/akash' + (location.pathname === '/' ? '' : location.pathname)); },
    echo(a, raw) { write(esc(raw || '')); },
    history() { history.forEach((h, i) => write(`${String(i + 1).padStart(3)}  ${esc(h)}`)); },

    matrix() { startMatrix(); },
    play() { startGame(); },

    sudo()  { write('We trust you have received the usual lecture. 🙂 Permission denied — but A+ for effort.', 'term-err'); },
    coffee() { write('☕ Brewing… your move. (Caffeine: the only true dependency.)'); },
    hire()  { write(`Always open to a good conversation → <a href="mailto:${ME.email}" class="term-href">${ME.email}</a>`, 'term-accent'); },
    clear() { out.innerHTML = ''; },
    exit()  { close(); },
    q()     { close(); }
  };

  function run(raw) {
    const line = raw.trim();
    write(`<span class="term-prompt-sm">akash@reachakash:~$</span> ${esc(line)}`, 'term-echo');
    if (!line) return;
    history.push(line);
    histIdx = history.length;

    const parts = line.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts[1];
    const rest = line.slice(parts[0].length).trim();

    if (cmd === 'rm' && /-rf?\b/.test(line) && /\/(\s|$)/.test(line + ' ')) {
      write('Nice try. 😏 This site is immutable — born of pure vanilla JS.', 'term-err');
      return;
    }

    const fn = COMMANDS[cmd];
    if (fn) { fn.call(COMMANDS, arg, rest); }
    else    { write(`command not found: ${esc(cmd)} — type <span class="term-cmd">help</span>`, 'term-err'); }
  }

  // ── Key handling: history, tab-complete, enter ──
  function onKey(e) {
    if (e.key === 'Enter') {
      const v = input.value;
      input.value = '';
      run(v);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (matrixStop) matrixStop();
      else close();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histIdx > 0) { histIdx--; input.value = history[histIdx] || ''; setCaretEnd(); }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIdx < history.length - 1) { histIdx++; input.value = history[histIdx] || ''; }
      else { histIdx = history.length; input.value = ''; }
      setCaretEnd();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    }
  }

  function setCaretEnd() {
    requestAnimationFrame(() => { const n = input.value.length; input.setSelectionRange(n, n); });
  }

  function complete() {
    const parts = input.value.split(/\s+/);
    if (parts.length === 1) {
      const pool = Object.keys(COMMANDS);
      const hits = pool.filter(c => c.startsWith(parts[0]));
      if (hits.length === 1) input.value = hits[0] + ' ';
      else if (hits.length > 1) { write(hits.join('   '), 'term-dim'); }
    } else if (/^(cd|open|goto)$/.test(parts[0])) {
      const hits = PAGE_NAMES.filter(p => p.startsWith((parts[1] || '').toLowerCase()));
      if (hits.length === 1) input.value = parts[0] + ' ' + hits[0];
      else if (hits.length > 1) write(hits.join('   '), 'term-dim');
    } else if (parts[0] === 'theme') {
      const hits = THEMES.filter(t => t.startsWith((parts[1] || '').toLowerCase()));
      if (hits.length === 1) input.value = 'theme ' + hits[0];
      else if (hits.length > 1) write(hits.join('   '), 'term-dim');
    }
  }

  // ── Matrix rain easter egg ──
  function startMatrix() {
    if (matrixStop) return;
    const ACC = fxColor();
    const cv = document.createElement('canvas');
    cv.id = 'term-matrix';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');
    let w, h, cols, drops;
    function size() {
      w = cv.width = window.innerWidth;
      h = cv.height = window.innerHeight;
      cols = Math.floor(w / 16);
      drops = Array(cols).fill(1);
    }
    size();
    const glyphs = 'アカシュレディAKASH01<>/{}#$=+*'.split('');
    let raf;
    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.08)';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = ACC;
      ctx.font = '15px monospace';
      for (let i = 0; i < drops.length; i++) {
        const ch = glyphs[Math.floor(Math.random() * glyphs.length)];
        ctx.fillText(ch, i * 16, drops[i] * 16);
        if (drops[i] * 16 > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    write('entering the matrix… press <span class="term-kbd">Esc</span> or click to exit.', 'term-accent');
    window.addEventListener('resize', size);
    function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      cv.removeEventListener('click', stop);
      cv.remove();
      matrixStop = null;
      input.focus();
    }
    cv.addEventListener('click', stop);
    matrixStop = stop;
  }

  // ── Mini-game: shoot down the 404s 👾 ──
  function startGame() {
    if (gameStop) return;
    const ACC = fxColor();
    input.blur();
    const cv = document.createElement('canvas');
    cv.id = 'term-game';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    // Crisp on high-DPI screens; draw in logical (CSS) pixels.
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
    let w, h;
    function size() {
      w = window.innerWidth; h = window.innerHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      cv.style.width = w + 'px'; cv.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();

    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const player = { x: 0, y: 0, w: 46, h: 16, speed: 7 };
    let bullets = [], enemies = [], score = 0, lives = 3, over = false;
    let left = false, right = false, lastShot = 0, lastSpawn = 0, raf;
    let touching = false, targetX = null;   // touch: drag-to-aim + auto-fire
    player.x = w / 2 - player.w / 2;

    function spawn() {
      enemies.push({ x: 20 + Math.random() * (w - 80), y: -24, w: 38, h: 24, vy: 0.6 + Math.random() * 0.9 });
    }
    function fire() {
      const now = performance.now();
      if (!over && now - lastShot > 220) { bullets.push({ x: player.x + player.w / 2 - 2, y: player.y }); lastShot = now; }
    }

    function onDown(e) {
      if (e.key === 'ArrowLeft')  { left = true;  e.preventDefault(); }
      else if (e.key === 'ArrowRight') { right = true; e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); fire(); }
      else if (e.key === 'Escape' || e.key === 'q') { e.preventDefault(); stop(); }
    }
    function onUp(e) {
      if (e.key === 'ArrowLeft')  left = false;
      else if (e.key === 'ArrowRight') right = false;
    }

    // Touch: drag anywhere to move the ship; it auto-fires while held.
    function aim(e) { const t = e.touches && e.touches[0]; if (t) targetX = t.clientX - player.w / 2; }
    function onTouchStart(e) { e.preventDefault(); if (over) { stop(); return; } touching = true; aim(e); }
    function onTouchMove(e)  { e.preventDefault(); aim(e); }
    function onTouchEnd(e)   { e.preventDefault(); if (!(e.touches && e.touches.length)) touching = false; }

    window.addEventListener('resize', size);
    window.addEventListener('keydown', onDown, true);
    window.addEventListener('keyup', onUp, true);
    cv.addEventListener('touchstart', onTouchStart, { passive: false });
    cv.addEventListener('touchmove',  onTouchMove,  { passive: false });
    cv.addEventListener('touchend',   onTouchEnd,   { passive: false });
    cv.addEventListener('touchcancel', onTouchEnd,  { passive: false });

    function loop(t) {
      ctx.fillStyle = 'rgba(8,10,13,0.55)';
      ctx.fillRect(0, 0, w, h);
      player.y = h - 60;

      if (!over) {
        if (left)  player.x -= player.speed;
        if (right) player.x += player.speed;
        if (targetX !== null) player.x += (targetX - player.x) * 0.4;   // smooth follow
        player.x = Math.max(8, Math.min(w - player.w - 8, player.x));
        if (touching) fire();   // auto-fire on mobile while holding

        if (t - lastSpawn > Math.max(420, 1100 - score * 6)) { spawn(); lastSpawn = t; }

        bullets.forEach(b => b.y -= 9);
        bullets = bullets.filter(b => b.y > -12);
        enemies.forEach(en => en.y += en.vy * 2);

        enemies.forEach(en => bullets.forEach(b => {
          if (b.x < en.x + en.w && b.x + 4 > en.x && b.y < en.y + en.h && b.y > en.y) {
            en.dead = true; b.dead = true; score += 10;
          }
        }));
        bullets = bullets.filter(b => !b.dead);

        enemies.forEach(en => {
          if (en.y + en.h >= player.y + player.h) { en.dead = true; lives--; if (lives <= 0) over = true; }
        });
        enemies = enemies.filter(en => !en.dead);
      }

      ctx.textBaseline = 'top';
      ctx.font = 'bold 16px "Courier New", monospace';
      enemies.forEach(en => {
        ctx.fillStyle = '#ff5f57';
        ctx.fillRect(en.x, en.y, en.w, en.h);
        ctx.fillStyle = '#0b0d10';
        ctx.fillText('404', en.x + 5, en.y + 4);
      });

      ctx.fillStyle = ACC;
      bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 12));

      ctx.beginPath();
      ctx.moveTo(player.x + player.w / 2, player.y);
      ctx.lineTo(player.x, player.y + player.h);
      ctx.lineTo(player.x + player.w, player.y + player.h);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#cfd6dd';
      ctx.font = '14px "Courier New", monospace';
      ctx.fillText('SCORE ' + score, 16, 14);
      ctx.fillText('LIVES ' + '♥'.repeat(Math.max(0, lives)), 16, 34);
      ctx.fillStyle = '#6c747d';
      ctx.fillText(isTouch ? 'drag to move · auto-fires · tap to quit' : '← → move   space fire   esc quit', 16, h - 26);

      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = 'center';
        ctx.fillStyle = ACC;
        ctx.font = 'bold 34px "Courier New", monospace';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 30);
        ctx.fillStyle = '#cfd6dd';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText('Score: ' + score, w / 2, h / 2 + 12);
        ctx.fillStyle = '#6c747d';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText(isTouch ? 'tap to return to the terminal' : 'press Esc to return to the terminal', w / 2, h / 2 + 46);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    write(isTouch
      ? '👾 shoot the 404s — drag to move, it auto-fires. Tap to quit.'
      : '👾 shoot the 404s — ← → to move, space to fire, Esc to quit.', 'term-accent');

    function stop() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      window.removeEventListener('keydown', onDown, true);
      window.removeEventListener('keyup', onUp, true);
      cv.remove();
      gameStop = null;
      write('score: ' + score + (score >= 100 ? ' 🏆 nice shooting!' : ''), 'term-accent');
      input.focus();
    }
    gameStop = stop;
  }

  // Keep the terminal sized to the visible area above the mobile keyboard
  function fitViewport() {
    const vv = window.visualViewport;
    if (!isOpen || !vv) return;
    term.style.top = vv.offsetTop + 'px';
    term.style.height = vv.height + 'px';
    term.style.bottom = 'auto';
    out.scrollTop = out.scrollHeight;
  }

  // ── Open / close ──
  function open() {
    if (isOpen) return;
    isOpen = true;
    term.classList.add('open');
    term.setAttribute('aria-hidden', 'false');
    document.body.classList.add('term-active');
    if (!out.dataset.greeted) {
      out.dataset.greeted = '1';
      BANNER.forEach(l => write(esc(l), 'term-banner'));
      write(`Welcome — you found the terminal. ${ME.role}.`, 'term-accent');
      gap();
      COMMANDS.menu();
      gap();
    }
    setTimeout(() => { input.focus(); fitViewport(); }, 60);
  }

  function close() {
    if (!isOpen) return;
    if (matrixStop) matrixStop();
    if (gameStop) gameStop();
    isOpen = false;
    term.classList.remove('open');
    term.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('term-active');
    term.style.top = term.style.height = term.style.bottom = '';
  }

  function toggle() { isOpen ? close() : open(); }

  // ── Global wiring ──
  function isTyping(el) {
    return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' ||
                  el.tagName === 'SELECT' || el.isContentEditable);
  }

  document.addEventListener('keydown', function (e) {
    // `~` / backtick toggles — but never while typing in a field
    if ((e.key === '`' || e.key === '~') && !isOpen && !isTyping(e.target)) {
      e.preventDefault();
      open();
    }
  });

  // Click (or Enter/Space on) a page link or a command printed in the terminal output.
  // A command runs as if typed, so it shows up in the output and the history.
  function activate(el) {
    if (el.dataset.page) COMMANDS.cd(el.dataset.page);
    else if (el.dataset.cmd) { run(el.dataset.cmd); input.focus(); }
  }
  document.addEventListener('click', function (e) {
    const el = e.target.closest('#terminal .term-link[data-page], #terminal .term-run[data-cmd]');
    if (!el) return;
    e.preventDefault();
    activate(el);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const el = e.target.closest && e.target.closest('#terminal .term-link[data-page], #terminal .term-run[data-cmd]');
    if (!el) return;
    e.preventDefault();
    activate(el);
  });

  // Optional footer launcher hook (added in index.html)
  function wireFooter() {
    const f = document.getElementById('footer-term');
    if (!f) return;
    f.addEventListener('click', function (e) { e.preventDefault(); open(); });
    f.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  }

  function init() {
    build();
    wireFooter();
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', fitViewport);
      window.visualViewport.addEventListener('scroll', fitViewport);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
