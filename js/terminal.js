/* ============================================================
   reachakash.com — Interactive Terminal
   A keyboard-driven CLI easter egg. Open with the `~` / backtick
   key, the footer "terminal" link, or the floating launcher.
   100% static — no backend. Drives the existing SPA router and
   theme system in js/main.js.
   ============================================================ */
(function () {
  'use strict';

  // ── Static "filesystem" of facts, sourced from the site content ──
  const ME = {
    name:    'Akash Reddy',
    full:    'Vurenuka Akash Reddy',
    role:    'Software Developer @ Zoetis',
    where:   'Research Triangle Park, NC, USA',
    origin:  'Hyderabad, India',
    email:   'mail@reachakash.com',
    skills:  ['C#', '.NET Framework', 'WinForms', 'PostgreSQL', 'NI-VISA', 'NI-DAQmx', 'SQL', 'JavaScript', 'Git'],
    edu: [
      'M.S. Engineering Management — Arkansas State University',
      'Amity University',
      'Malla Reddy College of Engineering and Technology'
    ],
    projects: [
      ['reachakash.com', 'This site — multi-page SPA in vanilla JS, History API routing, hosted on GitHub Pages.'],
      ['RCG 3D Logo',    'Interactive 3D logo viewer built with Three.js (crystal + SVG extrusion modes).']
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

  const PAGES = ['home', 'personal', 'professional', 'projects', 'socials', 'contact', 'gallery'];
  const THEMES = ['dark', 'light', 'retro', 'space'];

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
      write('Available commands:', 'term-head');
      const rows = [
        ['help',            'show this list'],
        ['whoami / about',  'who is Akash?'],
        ['ls',              'list site sections'],
        ['cd &lt;page&gt;',       'open a page (e.g. cd projects)'],
        ['skills',          'tech I work with'],
        ['projects',        'things I have built'],
        ['edu',             'education'],
        ['social',          'find me online'],
        ['contact',         'how to reach me'],
        ['theme &lt;name&gt;',    'dark | light | retro | space'],
        ['banner',          'show the ASCII banner'],
        ['play',            'shoot down the 404s 👾'],
        ['matrix',          'enter the matrix 🟢'],
        ['era',             'time-travel the site 🕰'],
        ['date',            'current date'],
        ['clear',           'clear the screen'],
        ['exit',            'close the terminal']
      ];
      rows.forEach(([c, d]) => write(`<span class="term-cmd">${c}</span><span class="term-cmddesc">${d}</span>`, 'term-help-row'));
      gap();
      write('Tip: <span class="term-kbd">Tab</span> completes, <span class="term-kbd">↑/↓</span> recalls history, <span class="term-kbd">Esc</span> closes.', 'term-dim');
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
      write('sections/', 'term-dim');
      write(PAGES.map(p => `<span class="term-link" data-page="${p}">${p}</span>`).join('   '));
      write('Use <span class="term-cmd">cd &lt;name&gt;</span> or just click one.', 'term-dim');
    },

    cd(arg) {
      if (!arg) { write('cd: missing page. Try: ' + PAGES.join(', '), 'term-err'); return; }
      const target = arg.replace(/^\/+/, '').toLowerCase();
      if (!PAGES.includes(target)) {
        write(`cd: no such page: ${esc(arg)}`, 'term-err');
        return;
      }
      write(`→ opening /${target === 'home' ? '' : target} …`, 'term-accent');
      if (typeof window.showPage === 'function') window.showPage(target, true);
      setTimeout(close, 350);
    },
    open(a) { this.cd(a); },
    goto(a) { this.cd(a); },

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

    theme(arg) {
      const name = (arg || '').toLowerCase();
      if (!name) {
        const cur = document.body.className.match(/theme-(\w+)/);
        write('current theme: ' + (cur ? cur[1] : 'dark'));
        write('options: ' + THEMES.join(', '), 'term-dim');
        return;
      }
      if (!THEMES.includes(name)) { write(`theme: unknown "${esc(arg)}". Try: ${THEMES.join(', ')}`, 'term-err'); return; }
      document.body.classList.remove('theme-light', 'theme-retro', 'theme-space');
      if (name !== 'dark') document.body.classList.add('theme-' + name);
      try { localStorage.setItem('theme', name === 'dark' ? '' : name); } catch (e) {}
      write(`theme set to <span class="term-accent">${name}</span> ✨`);
    },

    banner() { BANNER.forEach(l => write(esc(l), 'term-banner')); write(`${ME.role}`, 'term-accent'); },

    date() { write(new Date().toString()); },
    pwd()  { write('/home/akash' + (location.pathname === '/' ? '' : location.pathname)); },
    echo(a, raw) { write(esc(raw || '')); },
    history() { history.forEach((h, i) => write(`${String(i + 1).padStart(3)}  ${esc(h)}`)); },

    matrix() { startMatrix(); },
    play() { startGame(); },
    era() {
      if (typeof window.openTimeMachine === 'function') {
        write('🕰 opening the time machine — drag the slider through the web eras.', 'term-accent');
        window.openTimeMachine();
        setTimeout(close, 350);
      } else {
        write('time machine unavailable.', 'term-err');
      }
    },
    timemachine() { this.era(); },

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
      const hits = PAGES.filter(p => p.startsWith((parts[1] || '').toLowerCase()));
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
      ctx.fillStyle = '#e8c97e';
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
    input.blur();
    const cv = document.createElement('canvas');
    cv.id = 'term-game';
    document.body.appendChild(cv);
    const ctx = cv.getContext('2d');

    let w, h;
    function size() { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; }
    size();

    const player = { x: 0, y: 0, w: 46, h: 16, speed: 7 };
    let bullets = [], enemies = [], score = 0, lives = 3, over = false;
    let left = false, right = false, lastShot = 0, lastSpawn = 0, raf;
    player.x = w / 2 - player.w / 2;

    function spawn() {
      enemies.push({ x: 20 + Math.random() * (w - 80), y: -24, w: 38, h: 24, vy: 0.6 + Math.random() * 0.9 });
    }

    function onDown(e) {
      if (e.key === 'ArrowLeft')  { left = true;  e.preventDefault(); }
      else if (e.key === 'ArrowRight') { right = true; e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        const now = performance.now();
        if (!over && now - lastShot > 220) { bullets.push({ x: player.x + player.w / 2 - 2, y: player.y }); lastShot = now; }
      } else if (e.key === 'Escape' || e.key === 'q') { e.preventDefault(); stop(); }
    }
    function onUp(e) {
      if (e.key === 'ArrowLeft')  left = false;
      else if (e.key === 'ArrowRight') right = false;
    }

    window.addEventListener('resize', size);
    window.addEventListener('keydown', onDown, true);
    window.addEventListener('keyup', onUp, true);

    function loop(t) {
      ctx.fillStyle = 'rgba(8,10,13,0.55)';
      ctx.fillRect(0, 0, w, h);
      player.y = h - 60;

      if (!over) {
        if (left)  player.x -= player.speed;
        if (right) player.x += player.speed;
        player.x = Math.max(8, Math.min(w - player.w - 8, player.x));

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

      ctx.fillStyle = '#e8c97e';
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
      ctx.fillText('← → move   space fire   esc quit', 16, h - 26);

      if (over) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, 0, w, h);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#e8c97e';
        ctx.font = 'bold 34px "Courier New", monospace';
        ctx.fillText('GAME OVER', w / 2, h / 2 - 30);
        ctx.fillStyle = '#cfd6dd';
        ctx.font = '18px "Courier New", monospace';
        ctx.fillText('Score: ' + score, w / 2, h / 2 + 12);
        ctx.fillStyle = '#6c747d';
        ctx.font = '14px "Courier New", monospace';
        ctx.fillText('press Esc to return to the terminal', w / 2, h / 2 + 46);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    write('👾 shoot the 404s — ← → to move, space to fire, Esc to quit.', 'term-accent');

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
      write("Type <span class='term-cmd'>help</span> to get started.", 'term-dim');
      gap();
    }
    setTimeout(() => input.focus(), 60);
  }

  function close() {
    if (!isOpen) return;
    if (matrixStop) matrixStop();
    if (gameStop) gameStop();
    isOpen = false;
    term.classList.remove('open');
    term.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('term-active');
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

  // Click on a page link printed inside the terminal output
  document.addEventListener('click', function (e) {
    const link = e.target.closest('#terminal .term-link[data-page]');
    if (!link) return;
    e.preventDefault();
    COMMANDS.cd(link.dataset.page);
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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
