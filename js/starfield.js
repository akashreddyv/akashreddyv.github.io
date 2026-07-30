/* ============================================================
   reachakash.com — Procedural starfield for the space theme
   Replaces the tiled CSS-gradient stars (which visibly repeat)
   with a non-repeating, physically-motivated star distribution:
   power-law magnitudes, stellar colour temperatures, diffraction
   spikes on the brightest, parallax drift, and rare meteors.

   Perf notes: the full star catalogue is painted once into an
   offscreen canvas; per frame we only blit that plus a small set
   of twinkling stars drawn from pre-rendered sprites (no gradient
   objects are allocated in the animation loop). Capped DPR, capped
   frame rate, and paused while the tab is hidden.
   Mounts only while <body> has .theme-space. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  const DENSITY     = 1 / 1600;  // stars per px² of viewport
  const MAX_STARS   = 1100;
  const MAX_BRIGHT  = 70;        // only these twinkle each frame
  const MAX_DPR     = 1.5;
  const FRAME_MS    = 1000 / 30; // cap at ~30fps; plenty for drifting stars

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let canvas = null, ctx = null, sky = null, skyCtx = null;
  let stars = [], bright = [], meteor = null;
  let glowSprites = [], spikeSprites = [];
  let w = 0, h = 0, dpr = 1, raf = null, running = false;
  let scrollY = 0, pointerX = 0, pointerY = 0;
  let nextMeteor = 0, lastFrame = 0;

  // Stellar colours weighted by how the naked-eye sky actually looks
  // (dim red dwarfs dominate by count but are invisible, so the visible
  // mix skews blue-white/white).
  const PALETTE = [
    { c: [255, 255, 255], w: 40 },  // A/F white
    { c: [202, 224, 255], w: 22 },  // B blue-white
    { c: [255, 244, 214], w: 18 },  // G yellow-white
    { c: [255, 210, 161], w: 12 },  // K orange
    { c: [255, 166, 129], w:  6 },  // M red-orange
    { c: [170, 200, 255], w:  2 }   // O hot blue
  ];
  const PALETTE_TOTAL = PALETTE.reduce((s, p) => s + p.w, 0);

  function pickColorIndex() {
    let r = Math.random() * PALETTE_TOTAL;
    for (let i = 0; i < PALETTE.length; i++) { if ((r -= PALETTE[i].w) <= 0) return i; }
    return 0;
  }

  function isSpace() { return document.body.classList.contains('theme-space'); }

  // ── Pre-rendered sprites, built once per palette colour ────────
  const GLOW_PX = 64, SPIKE_PX = 128;

  function buildSprites() {
    glowSprites = [];
    spikeSprites = [];
    for (const p of PALETTE) {
      const [r, g, b] = p.c;

      const gc = document.createElement('canvas');
      gc.width = gc.height = GLOW_PX;
      const gx = gc.getContext('2d');
      const grd = gx.createRadialGradient(GLOW_PX / 2, GLOW_PX / 2, 0, GLOW_PX / 2, GLOW_PX / 2, GLOW_PX / 2);
      grd.addColorStop(0,    `rgba(${r},${g},${b},1)`);
      grd.addColorStop(0.12, `rgba(${r},${g},${b},0.85)`);
      grd.addColorStop(0.35, `rgba(${r},${g},${b},0.22)`);
      grd.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      gx.fillStyle = grd;
      gx.fillRect(0, 0, GLOW_PX, GLOW_PX);
      glowSprites.push(gc);

      const sc = document.createElement('canvas');
      sc.width = sc.height = SPIKE_PX;
      const sx = sc.getContext('2d');
      const mid = SPIKE_PX / 2;
      // horizontal spike
      const hg = sx.createLinearGradient(0, mid, SPIKE_PX, mid);
      hg.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      hg.addColorStop(0.5,  `rgba(${r},${g},${b},0.55)`);
      hg.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      sx.fillStyle = hg;
      sx.fillRect(0, mid - 0.75, SPIKE_PX, 1.5);
      // vertical spike
      const vg = sx.createLinearGradient(mid, 0, mid, SPIKE_PX);
      vg.addColorStop(0,    `rgba(${r},${g},${b},0)`);
      vg.addColorStop(0.5,  `rgba(${r},${g},${b},0.45)`);
      vg.addColorStop(1,    `rgba(${r},${g},${b},0)`);
      sx.fillStyle = vg;
      sx.fillRect(mid - 0.75, 0, 1.5, SPIKE_PX);
      spikeSprites.push(sc);
    }
  }

  // ── Build the star catalogue ──────────────────────────────────
  function generate() {
    const count = Math.min(MAX_STARS, Math.round(w * h * DENSITY));
    stars = [];
    bright = [];
    for (let i = 0; i < count; i++) {
      // Power-law magnitude: many faint, very few brilliant.
      const m = Math.pow(Math.random(), 3.2);
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.35 + m * 1.5,
        a: 0.25 + m * 0.75,
        ci: pickColorIndex(),
        m: m,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.8
      });
    }
    // Take the brightest few for the animated pass.
    bright = stars.slice().sort((p, q) => q.m - p.m).slice(0, MAX_BRIGHT);
  }

  // ── Static layer: every star, painted once ────────────────────
  function paintSky() {
    sky.width = Math.round(w * dpr);
    sky.height = Math.round(h * dpr);
    skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    skyCtx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const sprite = glowSprites[s.ci];
      const size = s.r * 7;
      skyCtx.globalAlpha = s.a;
      skyCtx.drawImage(sprite, s.x - size / 2, s.y - size / 2, size, size);
    }
    skyCtx.globalAlpha = 1;
  }

  function spawnMeteor() {
    const fromLeft = Math.random() < 0.5;
    meteor = {
      x: fromLeft ? -60 : w * (0.3 + Math.random() * 0.7),
      y: Math.random() * h * 0.55,
      vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 5),
      vy: 3 + Math.random() * 2.5,
      life: 0,
      max: 60 + Math.random() * 40
    };
  }

  function frame(t) {
    if (!running) return;
    raf = requestAnimationFrame(frame);

    if (document.hidden) return;
    if (t - lastFrame < FRAME_MS) return;
    lastFrame = t;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Parallax: slow autonomous drift plus a little scroll/pointer offset.
    const dx = Math.sin(t / 42000) * 10 - pointerX * 9;
    const dy = Math.cos(t / 51000) * 7  - pointerY * 6 - scrollY * 0.015;

    ctx.globalAlpha = 1;
    ctx.drawImage(sky, dx, dy, w, h);

    // Twinkle only the brightest — cheap, and matches how the eye reads a sky.
    for (const s of bright) {
      const px = s.x + dx, py = s.y + dy;
      if (px < -30 || px > w + 30 || py < -30 || py > h + 30) continue;
      const tw = 0.62 + 0.38 * Math.sin(t / 1000 * s.speed + s.phase);

      const glow = glowSprites[s.ci];
      const size = s.r * 9 * (0.9 + tw * 0.2);
      ctx.globalAlpha = Math.min(1, s.a * tw);
      ctx.drawImage(glow, px - size / 2, py - size / 2, size, size);

      if (s.r > 1.5) {
        const spike = spikeSprites[s.ci];
        const sl = s.r * 26 * (0.85 + tw * 0.3);
        ctx.globalAlpha = Math.min(1, s.a * tw * 0.9);
        ctx.drawImage(spike, px - sl / 2, py - sl / 2, sl, sl);
      }
    }
    ctx.globalAlpha = 1;

    // Meteors
    if (!meteor && t > nextMeteor) {
      spawnMeteor();
      nextMeteor = t + 9000 + Math.random() * 16000;
    }
    if (meteor) {
      meteor.life++;
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;
      const p = meteor.life / meteor.max;
      const fade = p < 0.15 ? p / 0.15 : 1 - (p - 0.15) / 0.85;
      const tailX = meteor.x - meteor.vx * 9;
      const tailY = meteor.y - meteor.vy * 9;
      const g = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, `rgba(255,255,255,${Math.max(0, fade) * 0.85})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(meteor.x, meteor.y);
      ctx.stroke();
      if (meteor.life > meteor.max || meteor.x < -120 || meteor.x > w + 120 || meteor.y > h + 120) meteor = null;
    }
  }

  function renderStatic() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(sky, 0, 0, w, h);
  }

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    generate();
    paintSky();
    if (!running) renderStatic();
  }

  function onScroll() { scrollY = window.scrollY || 0; }
  function onPointer(e) {
    pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  function mount() {
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'space-starfield';
    canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d');
    sky = document.createElement('canvas');
    skyCtx = sky.getContext('2d');
    document.body.appendChild(canvas);
    document.body.classList.add('space-canvas-on');

    buildSprites();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });

    if (reduceMotion.matches) {
      renderStatic();
    } else {
      window.addEventListener('pointermove', onPointer, { passive: true });
      running = true;
      lastFrame = 0;
      raf = requestAnimationFrame(frame);
    }
  }

  function unmount() {
    if (!canvas) return;
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    window.removeEventListener('resize', resize);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('pointermove', onPointer);
    canvas.remove();
    canvas = null; ctx = null; sky = null; skyCtx = null;
    stars = []; bright = []; meteor = null;
    glowSprites = []; spikeSprites = [];
    document.body.classList.remove('space-canvas-on');
  }

  function sync() { isSpace() ? mount() : unmount(); }

  function init() {
    sync();
    // The AR-logo theme cycler toggles body classes — follow it.
    new MutationObserver(sync).observe(document.body, {
      attributes: true, attributeFilter: ['class']
    });
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', function () { unmount(); sync(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
