/* js/bots.js: the live bot pages (/bots, /bots/polymarket, /bots/kalshi).
   Reads the public JSON that the bots' publisher replaces about every 5 minutes on the repo's `bots-data` branch,
   and redraws every minute. That JSON holds counts and percentages only: no money amounts, bet sizes or prices,
   no strategy names or rules (strategies and bots have anonymous labels). Plain JS + inline SVG, no libraries
   (the site's CSP only allows its own scripts). Everything shown is escaped text. */
(function () {
  'use strict';
  var BASE = 'https://raw.githubusercontent.com/akashreddyv/akashreddyv.github.io/bots-data/';
  var root = document.querySelector('[data-bots]');
  if (!root) return;
  var page = root.getAttribute('data-bots');

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(id) { return root.querySelector('[data-slot="' + id + '"]'); }
  function set(id, html) { var e = el(id); if (e) e.innerHTML = html; }
  function ret(v) { return v == null ? '–' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + '%'; }
  function sign(v) { return v == null ? '' : v > 0 ? 'bots-pos' : v < 0 ? 'bots-neg' : ''; }
  function pct(v) { return v == null ? '–' : v.toFixed(1) + '%'; }
  function num(v) { return v == null ? '–' : Number(v).toLocaleString(); }
  function ago(iso) {
    var s = (Date.now() - Date.parse(iso)) / 1000;
    if (!isFinite(s)) return '';
    if (s < 90) return 'just now';
    if (s < 3600) return Math.round(s / 60) + ' min ago';
    return Math.round(s / 3600) + ' h ago';
  }
  function tile(label, value, note, cls) {
    return '<div class="bots-tile"><div class="bots-tile-value ' + (cls || '') + '">' + value + '</div>' +
      '<div class="bots-tile-label">' + esc(label) + '</div>' + (note ? '<div class="bots-tile-note">' + note + '</div>' : '') + '</div>';
  }
  function badge(text, kind) { return '<span class="bots-badge bots-badge-' + kind + '">' + esc(text) + '</span>'; }
  function fresh(d) {
    var age = (Date.now() - Date.parse(d.generated_at)) / 60000;
    return age < 15 ? badge('Updated ' + ago(d.generated_at), 'live') : badge('Data is ' + ago(d.generated_at).replace(' ago', '') + ' old', 'stale');
  }
  function online(sec) {
    return sec != null && sec < 300 ? badge('Recorder online', 'live') : badge('Recorder offline', 'stale');
  }

  /* A small line chart of percentages: series = [{name, points: [[ms, value], ...]}], with a zero line. */
  function chart(series, opts) {
    opts = opts || {};
    var W = 720, H = opts.height || 220, L = 52, R = 12, T = 12, B = 26;
    var all = [];
    series.forEach(function (s) { s.points.forEach(function (p) { all.push(p); }); });
    if (all.length < 2) return '<p class="bots-muted">Not enough data for a chart yet.</p>';
    var x0 = Math.min.apply(null, all.map(function (p) { return p[0]; }));
    var x1 = Math.max.apply(null, all.map(function (p) { return p[0]; }));
    var y0 = Math.min(0, Math.min.apply(null, all.map(function (p) { return p[1]; })));
    var y1 = Math.max(0, Math.max.apply(null, all.map(function (p) { return p[1]; })));
    if (y1 === y0) y1 = y0 + 1;
    var pad = (y1 - y0) * 0.08; y0 -= pad; y1 += pad;
    function X(t) { return L + (x1 === x0 ? 0 : (t - x0) / (x1 - x0)) * (W - L - R); }
    function Y(v) { return T + (1 - (v - y0) / (y1 - y0)) * (H - T - B); }
    var out = '<svg class="bots-chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(opts.label || 'Chart') + '">';
    [y0 + pad, (y0 + y1) / 2, y1 - pad].forEach(function (v) {
      out += '<line class="bots-grid" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(v) + '" y2="' + Y(v) + '"/>' +
        '<text class="bots-axis" x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + esc(ret(v)) + '</text>';
    });
    out += '<line class="bots-zero" x1="' + L + '" x2="' + (W - R) + '" y1="' + Y(0) + '" y2="' + Y(0) + '"/>';
    var fmt = function (t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); };
    out += '<text class="bots-axis" x="' + L + '" y="' + (H - 6) + '">' + fmt(x0) + '</text>' +
      '<text class="bots-axis" x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">' + fmt(x1) + '</text>';
    series.forEach(function (s, i) {
      if (s.points.length < 1) return;
      var d = s.points.map(function (p, j) { return (j ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1); }).join(' ');
      out += '<path class="bots-line bots-line-' + (i % 8) + '" d="' + d + '"><title>' + esc(s.name) + '</title></path>';
    });
    out += '</svg>';
    if (series.length > 1) {
      out += '<div class="bots-legend">' + series.map(function (s, i) {
        var last = s.points.length ? s.points[s.points.length - 1][1] : null;
        return '<span><i class="bots-swatch bots-line-' + (i % 8) + '"></i>' + esc(s.name) + ' <b class="' + sign(last) + '">' + ret(last) + '</b></span>';
      }).join('') + '</div>';
    }
    return out;
  }

  function table(head, rows, caption) {
    return '<div class="bots-table-wrap"><table class="bots-table">' + (caption ? '<caption>' + esc(caption) + '</caption>' : '') +
      '<thead><tr>' + head.map(function (h) { return '<th scope="col">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (rows.length ? rows.join('') : '<tr><td colspan="' + head.length + '" class="bots-muted">Nothing yet.</td></tr>') + '</tbody></table></div>';
  }

  /* ---------- Polymarket ---------- */
  var PERIODS = [['last_24h', 'Last 24 hours', 'us_live'], ['last_7d', 'Last 7 days', 'us_live'], ['all', 'Since recording began', 'us_live'],
                 ['all', '28-day backtest · Polymarket US', 'us_backtest'], ['all', '28-day backtest · polymarket.com', 'pm_backtest']];
  var period = 2;

  function polymarket(d) {
    set('updated', fresh(d) + ' ' + online(d.recorder.heartbeat_age_s));
    var live = d.live || {}, tot = live.totals || {}, rec = d.recorder || {}, tested = d.tested || {};
    var wt = rec.windows_today || {};
    set('status', tile(live.bots_live > 1 ? 'Bots live' : 'Bot live', live.active ? esc(live.bots_live || 1) : 'Paused',
        live.active ? 'trading with real money' : 'no real bets right now', live.active ? 'bots-pos' : '') +
      tile('Strategies tested', esc(tested.variants || '–'), esc(tested.dropped || 0) + ' dropped, ' + esc(tested.in_race || 0) + ' still in the race') +
      tile('Windows recorded today', esc(num(wt.polymarket_us || 0)), 'per venue, all four coins') +
      tile('Results vs the exchange', rec.resolved_today ? pct(100 * (1 - rec.result_mismatches_today / rec.resolved_today)) : '–', 'our result = official result today'));
    set('real', tile('Real bets', esc(num(tot.bets || 0)), 'since ' + esc(tot.first || '')) +
      tile('Won / lost', esc(tot.won || 0) + ' / ' + esc(tot.lost || 0), '') +
      tile('Win rate', pct(tot.win_pct), 'of settled bets') +
      tile('Return', ret(tot.return_pct), 'on the money staked, after fees', sign(tot.return_pct)));
    set('per-bot', (live.bots || []).length ? table(['Bot (current run)', 'Trades', 'Bets', 'Won / lost', 'Win rate', 'Return'],
      live.bots.map(function (b) {
        return '<tr><td><b>' + esc(b.name) + '</b></td><td>' + esc((b.strategies || []).join(' + ')) + '</td><td>' + esc(b.bets) + '</td><td>' +
          esc(b.won) + ' / ' + esc(b.lost) + '</td><td>' + pct(b.win_pct) + '</td><td class="' + sign(b.return_pct) + '">' + ret(b.return_pct) + '</td></tr>';
      })) : '');
    set('real-chart', chart([{ name: 'Return on real bets', points: live.curve || [] }], { label: 'Running return of the real bets, in percent', height: 200 }));
    set('daily', table(['Day (ET)', 'Bets', 'Won / lost', 'Win rate', 'Return'],
      (live.daily || []).map(function (x) {
        return '<tr><td>' + esc(x.day) + '</td><td>' + esc(x.bets) + '</td><td>' + esc(x.won) + ' / ' + esc(x.lost) + '</td><td>' +
          pct(x.win_pct) + '</td><td class="' + sign(x.return_pct) + '">' + ret(x.return_pct) + '</td></tr>';
      })));
    scoreboard(d);
    var curves = (d.strategies.us_live || []).filter(function (r) { return r.curve && r.curve.length > 1; })
      .map(function (r) { return { name: r.name, points: r.curve }; });
    set('strat-chart', chart(curves, { label: 'Running return of each strategy, in percent', height: 240 }));
  }

  function scoreboard(d) {
    var p = PERIODS[period];
    var tabs = PERIODS.map(function (q, i) {
      return '<button type="button" class="bots-tab" data-period="' + i + '" aria-pressed="' + (i === period) + '">' + esc(q[1]) + '</button>';
    }).join('');
    var rows = (d.strategies[p[2]] || []).map(function (r) {
      var s = r[p[0]] || {};
      return '<tr><td><b>' + esc(r.name) + '</b></td><td>' + esc(num(s.bets || 0)) + '</td><td>' + pct(s.win_pct) + '</td><td class="' + sign(s.return_pct) + '">' +
        ret(s.return_pct) + (s.range_pct ? '<span class="bots-ci">' + ret(s.range_pct[0]) + ' to ' + ret(s.range_pct[1]) + '</span>' : '') + '</td></tr>';
    });
    set('scoreboard', '<div class="bots-tabs" role="group" aria-label="Period">' + tabs + '</div>' +
      table(['Strategy', 'Bets', 'Win rate', 'Return (95% range)'], rows));
    root.querySelectorAll('[data-period]').forEach(function (b) {
      b.addEventListener('click', function () { period = +b.getAttribute('data-period'); scoreboard(d); });
    });
  }

  /* ---------- Kalshi ---------- */
  function kalshi(d) {
    set('updated', fresh(d) + ' ' + online(d.recorder.heartbeat_age_s));
    var rc = d.results_check || {}, rec = d.recorder || {};
    var med = Object.keys(rc.per_coin || {}).map(function (c) { return rc.per_coin[c].median_bps; }).filter(function (v) { return v != null; });
    set('status', tile('Windows recorded', esc(num(rec.windows || 0)), 'since ' + esc((rec.recording_since || '').replace(' ET', '') + ' ET')) +
      tile('Market snapshots', esc(num(rec.snapshots || 0)), 'one every 5 seconds per coin') +
      tile('Our result = Kalshi\'s', rc.total ? esc(rc.agree) + ' / ' + esc(rc.total) : '–', rc.total ? pct(100 * rc.agree / rc.total) + ' of windows' : '') +
      tile('Typical gap to Kalshi\'s number', med.length ? esc((med.reduce(function (a, b) { return a + b; }, 0) / med.length).toFixed(1)) + ' bp' : '–', '1 bp = 0.01%'));
    set('stage', esc(d.stage || ''));
    set('latest', table(['Coin', 'Window ends', 'Time left', 'Up (bid / ask)', 'Down (bid / ask)', 'Price vs target'],
      (d.latest || []).map(function (m) {
        var c = function (v) { return v == null ? '–' : Math.round(v * 1000) / 10 + '¢'; };
        return '<tr><td><b>' + esc(m.coin) + '</b></td><td>' + esc(m.window_end) + '</td><td>' + esc(Math.max(0, Math.round(m.secs_left / 60))) + ' min</td><td>' +
          c(m.up_bid) + ' / ' + c(m.up_ask) + '</td><td>' + c(m.down_bid) + ' / ' + c(m.down_ask) + '</td><td class="' + sign(m.move_pct) + '">' +
          (m.move_pct == null ? '–' : (m.move_pct > 0 ? '+' : '') + m.move_pct.toFixed(3) + '%') + '</td></tr>';
      }), 'Market prices as of ' + ((d.latest || [])[0] || {}).as_of));
    set('recent', table(['Coin', 'Window', 'Target', 'End', 'Official', 'Ours'],
      (d.recent || []).slice(0, 20).map(function (w) {
        var n = function (v) { return v == null ? '–' : (v >= 100 ? v.toLocaleString(undefined, { maximumFractionDigits: 2 }) : v); };
        var match = w.ours == null ? badge('not checked', 'dry') : w.ours === w.official ? badge(w.ours + ' ✓', 'live') : badge(w.ours + ' ✗', 'stale');
        return '<tr><td><b>' + esc(w.coin) + '</b></td><td>' + esc(w.window) + '</td><td>' + esc(n(w.target)) + '</td><td>' + esc(n(w.end)) + '</td><td>' +
          esc(w.official) + '</td><td>' + match + '</td></tr>';
      })));
  }

  /* ---------- Hub ---------- */
  function hub(p, k) {
    if (p) {
      var t = (p.live || {}).totals || {};
      set('pm-summary', tile('Real bets', esc(num(t.bets || 0)), '') + tile('Win rate', pct(t.win_pct), '') +
        tile('Return', ret(t.return_pct), 'after fees', sign(t.return_pct)));
      set('pm-updated', fresh(p));
    }
    if (k) {
      var rc = k.results_check || {};
      set('k-summary', tile('Windows recorded', esc(num(k.recorder.windows || 0)), '') +
        tile('Our result = Kalshi\'s', rc.total ? esc(rc.agree) + ' / ' + esc(rc.total) : '–', '') +
        tile('Snapshots', esc(num(k.recorder.snapshots || 0)), ''));
      set('k-updated', fresh(k));
    }
  }

  /* ---------- Live picks (venue pages) ----------
     The publisher pushes <page>-picks.json about 2 seconds after each pick moment (90 and 60 s before a window's
     close), with a `checked` marker naming the latest moment it covers. raw.githubusercontent.com caches files for
     5 minutes, so picks are read from GitHub's API (fresh with a unique query string). GitHub allows 60 such requests
     an hour per visitor, so the page asks in a short burst just after each pick moment and stops as soon as the
     marker shows that moment, once just after a window starts (new window, last result), not while the tab is
     hidden, and falls back to the cached copy when GitHub says to slow down. */
  var API = 'https://api.github.com/repos/akashreddyv/akashreddyv.github.io/contents/';
  var CYCLE = page === 'kalshi' ? 900000 : 300000;              // window length, ms
  var MOMENTS = [90000, 60000];                                  // pick moments, ms before the close
  var BURST = [2200, 3500, 5000, 7500, 11000];                   // asks after a pick moment until it shows up
  var AFTER_START = page === 'kalshi' ? [16000, 75000, 150000] : [16000, 55000];   // new window (pushed at :12), results
  var picksData = null, picksSlow = false, apiBlockedUntil = 0, pollTimer = null, polling = false;

  function loadPicks() {
    var name = page + '-picks.json';
    var raw = function () {
      return fetch(BASE + name + '?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
    };
    if (Date.now() < apiBlockedUntil) { picksSlow = true; return raw(); }
    // a unique query string: GitHub's API caches each URL for up to a minute
    return fetch(API + name + '?ref=bots-data&n=' + Date.now(), { headers: { Accept: 'application/vnd.github.raw+json' }, cache: 'no-store' })
      .then(function (r) {
        if (r.status === 403 || r.status === 429) {                // over the hourly limit: wait for its reset
          var reset = +r.headers.get('X-RateLimit-Reset');
          apiBlockedUntil = reset ? reset * 1000 + 2000 : Date.now() + 600000;
        }
        if (!r.ok) throw new Error(r.status);
        picksSlow = false;
        return r.json();
      })
      .catch(function () { picksSlow = true; return raw(); });
  }
  function covered(close, cp) {                                  // does the data include this pick moment?
    var c = picksData && picksData.checked;
    if (!c) return false;
    var cc = Date.parse(c.closes_at);
    return cc > close || (cc === close && c.seconds_before_close * 1000 <= cp);
  }
  function resultsIn(close) {                                    // are the results of the window closing then in?
    var ws = (picksData && picksData.windows) || [];
    var done = ws.filter(function (w) { return Date.parse(w.closes_at) === close; });
    return done.length > 0 && done.every(function (w) { return w.result != null; });
  }
  function nextPoll(now) {
    var base = now - now % CYCLE, best = null;
    function consider(at, skip) { if (at > now + 250 && !skip && (best === null || at < best)) best = at; }
    [base, base + CYCLE].forEach(function (start) {
      var close = start + CYCLE;
      AFTER_START.forEach(function (o, i) { consider(start + o, i > 0 && resultsIn(start)); });
      MOMENTS.forEach(function (cp) {
        BURST.forEach(function (b) { consider(close - cp + b, covered(close, cp)); });
      });
    });
    return best;
  }
  function nextMoment(now) {
    var base = now - now % CYCLE, out = null;
    [base, base + CYCLE].forEach(function (start) {
      MOMENTS.forEach(function (cp) { var m = start + CYCLE - cp; if (m > now && (out === null || m < out)) out = m; });
    });
    return out;
  }
  function mmss(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  function sideBadge(side) {
    return '<span class="bots-pick bots-pick-' + (side === 'Up' ? 'up' : 'down') + '">' + (side === 'Up' ? '▲ Up' : '▼ Down') + '</span>';
  }
  function pickState(w, now) {
    var close = Date.parse(w.closes_at);
    if (w.best) return '';
    if (!w.open) return '<span class="bots-muted">No pick</span>';
    var last = (picksData.pick_minutes_before_close || [1]).slice(-1)[0] * 60000;
    return now < close - last + 20000 ? '<span class="bots-muted">Waiting…</span>' : '<span class="bots-muted">No pick this window</span>';
  }
  function renderPicks() {
    var d = picksData;
    if (!d) return;
    var now = Date.now();
    var rules = d.rules || [];
    var rec = {};
    rules.forEach(function (r) { rec[r.label] = r; });
    var ws = d.windows || [];
    var firstOpen = Math.min.apply(null, ws.filter(function (w) { return w.open; }).map(function (w) { return Date.parse(w.closes_at); }));
    var lastDone = Math.max.apply(null, ws.filter(function (w) { return !w.open; }).map(function (w) { return Date.parse(w.closes_at); }));
    var open = ws.filter(function (w) { return w.open && Date.parse(w.closes_at) === firstOpen; });
    var done = ws.filter(function (w) { return !w.open && Date.parse(w.closes_at) === lastDone; });
    var close = open.length ? Date.parse(open[0].closes_at) : null;
    var nm = nextMoment(now);
    var head = close ? '<div class="bots-pick-head"><b>Current window closes ' + esc(open[0].closes_et) + ' ET</b> · ' +
      '<span data-countdown="' + close + '">' + mmss(close - now) + '</span> left' +
      (nm && nm < close ? ' · next pick check in <span data-countdown="' + nm + '">' + mmss(nm - now) + '</span>' : '') + '</div>'
      : '<div class="bots-pick-head"><b>New window starting…</b> its picks load in a few seconds</div>';
    var row = function (w, withResult) {
      var b = w.best, r = b ? rec[b.by] || {} : {};
      var res = '';
      if (withResult) {
        res = w.result == null ? '<span class="bots-muted">waiting for the result</span>'
          : !b ? esc(w.result)
          : w.result === b.side ? badge(w.result + ' · pick won', 'live') : badge(w.result + ' · pick lost', 'stale');
      }
      var also = (w.others || []).map(function (o) { return esc(o.by) + ': ' + esc(o.side); }).join(', ');
      return '<tr><td><b>' + esc(w.coin) + '</b></td><td>' + (b ? sideBadge(b.side) : pickState(w, now)) + '</td><td>' +
        (b ? esc(b.price_c) + '¢' : '–') + '</td><td>' + (b ? esc(b.at_et) + ' ET' : '–') + '</td><td>' +
        (b ? esc(b.by) + (r.win_pct != null ? '<span class="bots-ci">' + pct(r.win_pct) + ' won · ' + ret(r.return_pct) + '</span>' : '') : '–') +
        (also ? '<span class="bots-ci">also ' + also + '</span>' : '') + '</td>' + (withResult ? '<td>' + res + '</td>' : '') + '</tr>';
    };
    var html = head + table(['Coin', 'Pick', 'Price then', 'Picked at', 'By'], open.map(function (w) { return row(w, false); }),
      'Picks refresh by themselves. ' + (picksSlow ? 'GitHub is limiting live updates right now, so picks may show up to 5 minutes late.' :
        'A new pick shows up here within a few seconds of being made.'));
    if (done.length) {
      html += '<p class="bots-sub">Previous window (closed ' + esc(done[0].closes_et) + ' ET)</p>' +
        table(['Coin', 'Pick', 'Price then', 'Picked at', 'By', 'Result'], done.map(function (w) { return row(w, true); }));
    }
    html += '<p class="bots-sub">How the picking rules have done</p>' +
      table(['Rule', 'Picks', 'Won / lost', 'Win rate', 'Return', '1st half / 2nd half'], rules.map(function (r) {
        var h = r.halves_pct || [];
        return '<tr><td><b>' + esc(r.label) + '</b>' + (r.uses ? '<span class="bots-ci">' + esc(r.uses.join(' + ')) + '</span>' : '') +
          (r.coins && r.coins.length < 4 ? '<span class="bots-ci">' + esc(r.coins.join(', ')) + ' only</span>' : '') + '</td><td>' +
          esc(num(r.bets)) + '</td><td>' + esc(num(r.bets - r.lost)) + ' / ' + esc(num(r.lost)) + '</td><td>' + pct(r.win_pct) +
          '</td><td class="' + sign(r.return_pct) + '">' + ret(r.return_pct) + '</td><td>' + ret(h[0]) + ' / ' + ret(h[1]) + '</td></tr>';
      }), 'Every pick since ' + ((rules[0] || {}).since || 'the start') + ', at the price on offer then, fee included. ' + (d.note || ''));
    set('picks', html);
    set('picks-updated', picksSlow ? badge('Slow updates (GitHub limit) · last change ' + ago(d.generated_at), 'stale')
      : badge('Live · last change ' + ago(d.generated_at), 'live'));
  }
  function refreshPicks() {
    return loadPicks().then(function (d) { picksData = d; renderPicks(); })
      .catch(function () { set('picks-updated', badge('Picks unavailable right now', 'stale')); });
  }
  function schedulePicks() {
    clearTimeout(pollTimer);
    var now = Date.now(), at = nextPoll(now);
    pollTimer = setTimeout(function () {
      if (document.visibilityState === 'hidden' || polling) { schedulePicks(); return; }
      polling = true;
      refreshPicks().then(function () { polling = false; schedulePicks(); });
    }, at - now);
  }
  document.addEventListener('visibilitychange', function () {   // back on the tab: catch up at once
    if (document.visibilityState === 'visible' && el('picks') && !polling) {
      polling = true;
      refreshPicks().then(function () { polling = false; schedulePicks(); });
    }
  });
  function tick() {
    root.querySelectorAll('[data-countdown]').forEach(function (e) {
      e.textContent = mmss(+e.getAttribute('data-countdown') - Date.now());
    });
    if (picksData && (picksData.windows || []).some(function (w) { return w.open && Date.parse(w.closes_at) <= Date.now(); })) {
      picksData.windows.forEach(function (w) { if (w.open && Date.parse(w.closes_at) <= Date.now()) w.open = false; });
      renderPicks();                                         // the window just closed: move it down until new data comes
    }
  }

  function load(name) {
    return fetch(BASE + name + '.json?t=' + Math.floor(Date.now() / 60000), { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function fail() { set('updated', badge('Live data unavailable right now', 'stale')); }
  function refresh() {
    if (page === 'polymarket') load('polymarket').then(polymarket).catch(fail);
    else if (page === 'kalshi') load('kalshi').then(kalshi).catch(fail);
    else Promise.all([load('polymarket').catch(function () { return null; }), load('kalshi').catch(function () { return null; })])
      .then(function (r) { hub(r[0], r[1]); });
  }
  refresh();
  setInterval(refresh, 60000);
  if (el('picks')) {
    refreshPicks();
    schedulePicks();
    setInterval(tick, 1000);
  }
})();
