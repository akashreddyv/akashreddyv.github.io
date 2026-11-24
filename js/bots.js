/* js/bots.js: the live bot pages (/bots, /bots/polymarket, /bots/kalshi).
   Reads the public JSON that the bots' publisher replaces about every 5 minutes on the repo's `bots-data`
   branch (no personal or account data is ever in it), and redraws every minute. Plain JS + inline SVG,
   no libraries (the site's CSP only allows its own scripts). Everything shown is escaped text. */
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
  function money(v) {
    if (v == null) return '–';
    return (v < 0 ? '−$' : '+$') + Math.abs(v).toFixed(2);
  }
  function cents(v) { return v == null ? '–' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + '¢'; }
  function sign(v) { return v == null ? '' : v > 0 ? 'bots-pos' : v < 0 ? 'bots-neg' : ''; }
  function pct(v) { return v == null ? '–' : v.toFixed(1) + '%'; }
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

  /* A small line chart: series = [{name, points: [[ms, value], ...]}], drawn into an SVG with a zero line. */
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
        '<text class="bots-axis" x="' + (L - 6) + '" y="' + (Y(v) + 4) + '" text-anchor="end">' + esc(money(v).replace('+', '')) + '</text>';
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
        return '<span><i class="bots-swatch bots-line-' + (i % 8) + '"></i>' + esc(s.name) + ' <b class="' + sign(last) + '">' + money(last) + '</b></span>';
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
    var run = d.run || {}, live = d.live || {}, tot = live.totals || {}, rec = d.recorder || {};
    var wt = rec.windows_today || {};
    var botNames = run.bots ? Object.keys(run.bots) : [];
    set('status', tile(botNames.length > 1 ? 'Live bots' : 'Live bot', run.active ? (botNames.length > 1 ? botNames.length + ' live' : 'Live') : 'Paused',
        run.active ? 'real money, small stakes' : 'no real bets right now', run.active ? 'bots-pos' : '') +
      (botNames.length > 1
        ? tile('Strategies trading now', esc(botNames.length + ' bots'), botNames.map(function (n) { return '<b>' + esc(n) + '</b>: ' + esc(run.bots[n].join(' + ')); }).join('<br>') +
            (run.active ? '<br>' + esc(run.shares) + ' shares a bet each' : ''))
        : tile('Strategies trading now', esc((run.strategies || []).join(' + ') || '–'), run.active ? esc(run.shares) + ' shares a bet' : '')) +
      tile('Windows recorded today', esc((wt.polymarket_us || 0).toLocaleString()), 'per venue, all four coins') +
      tile('Results vs the exchange', rec.resolved_today ? pct(100 * (1 - rec.result_mismatches_today / rec.resolved_today)) : '–', 'our result = official result today'));
    set('real', tile('Real bets', esc(tot.bets || 0), 'since ' + esc((tot.first || '').replace(' ET', ''))) +
      tile('Won / lost', esc(tot.won || 0) + ' / ' + esc(tot.lost || 0), tot.bets ? pct(100 * tot.won / Math.max(1, tot.won + tot.lost)) + ' won' : '') +
      tile('Profit', money(tot.pnl), 'after fees', sign(tot.pnl)) +
      tile('Per $1 staked', cents(tot.per_dollar_c), 'profit per dollar bet', sign(tot.per_dollar_c)));
    var pb = live.bots || {};
    set('per-bot', Object.keys(pb).length ? table(['Bot (this run, since ' + esc((run.since || '').replace(' ET', '')) + ' ET)', 'Strategies', 'Bets', 'Won / lost', 'Profit', 'Per $1'],
      Object.keys(pb).map(function (n) {
        var b = pb[n];
        return '<tr><td><b>' + esc(n) + '</b></td><td>' + esc(((run.bots || {})[n] || []).join(' + ')) + '</td><td>' + esc(b.bets) + '</td><td>' +
          esc(b.won) + ' / ' + esc(b.lost) + '</td><td class="' + sign(b.pnl) + '">' + money(b.pnl) + '</td><td class="' + sign(b.per_dollar_c) + '">' + cents(b.per_dollar_c) + '</td></tr>';
      })) : '');
    set('real-chart', chart([{ name: 'Real profit', points: live.cum || [] }], { label: 'Cumulative profit of the real bets', height: 200 }));
    set('trades', table(['Time', 'Coin', 'Bet', 'Price', 'Shares', 'Strategy', 'Bot', 'Result', 'Profit'],
      (live.trades || []).slice(0, 25).map(function (t) {
        return '<tr><td>' + esc(t.time) + '</td><td>' + esc(t.coin) + '</td><td>' + esc(t.side) + ' at T-' + esc(t.checkpoint) + 's</td><td>' +
          esc(Math.round(t.price * 100)) + '¢</td><td>' + esc(t.shares) + '</td><td>' + esc(t.strategies) + '</td><td>' + esc(t.bot || '–') + '</td><td>' +
          (t.result ? badge(t.result, t.result === 'won' ? 'live' : 'stale') : badge('waiting', 'dry')) + '</td><td class="' + sign(t.pnl) + '">' + money(t.pnl) + '</td></tr>';
      })));
    scoreboard(d);
    var cum = (d.strategies.us_live || []).filter(function (r) { return r.cum && r.cum.length > 1 && r.key !== 'S12'; })
      .map(function (r) { return { name: r.key, points: r.cum }; });
    set('strat-chart', chart(cum, { label: 'Cumulative profit per strategy at 2 shares a bet', height: 240 }));
  }

  function scoreboard(d) {
    var p = PERIODS[period];
    var tabs = PERIODS.map(function (q, i) {
      return '<button type="button" class="bots-tab" data-period="' + i + '" aria-pressed="' + (i === period) + '">' + esc(q[1]) + '</button>';
    }).join('');
    var rows = (d.strategies[p[2]] || []).map(function (r) {
      var s = r[p[0]] || {};
      return '<tr><td><b>' + esc(r.key) + '</b></td><td class="bots-rule">' + esc((d.strategy_rules || {})[r.key] || '') + '</td><td>' + esc(s.bets || 0) +
        '</td><td>' + pct(s.win_pct) + '</td><td>' + (s.avg_price != null ? esc(Math.round(s.avg_price * 100)) + '¢' : '–') + '</td><td class="' + sign(s.per_dollar_c) + '">' +
        cents(s.per_dollar_c) + (s.ci_c ? '<span class="bots-ci">' + cents(s.ci_c[0]) + ' to ' + cents(s.ci_c[1]) + '</span>' : '') + '</td><td class="' + sign(s.pnl_2sh) + '">' + money(s.pnl_2sh) + '</td></tr>';
    });
    set('scoreboard', '<div class="bots-tabs" role="group" aria-label="Period">' + tabs + '</div>' +
      table(['Strategy', 'Rule', 'Bets', 'Won', 'Avg price', 'Profit per $1 (95% range)', 'Profit at 2 shares'], rows));
    root.querySelectorAll('[data-period]').forEach(function (b) {
      b.addEventListener('click', function () { period = +b.getAttribute('data-period'); scoreboard(d); });
    });
  }

  /* ---------- Kalshi ---------- */
  function kalshi(d) {
    set('updated', fresh(d) + ' ' + online(d.recorder.heartbeat_age_s));
    var rc = d.results_check || {}, rec = d.recorder || {};
    var med = Object.keys(rc.per_coin || {}).map(function (c) { return rc.per_coin[c].median_bps; }).filter(function (v) { return v != null; });
    set('status', tile('Windows recorded', esc((rec.windows || 0).toLocaleString()), 'since ' + esc((rec.recording_since || '').replace(' ET', '') + ' ET')) +
      tile('Market snapshots', esc((rec.snapshots || 0).toLocaleString()), 'one every 5 seconds per coin') +
      tile('Our result = Kalshi\'s', rc.total ? esc(rc.agree) + ' / ' + esc(rc.total) : '–', rc.total ? pct(100 * rc.agree / rc.total) + ' of windows' : '') +
      tile('Typical gap to Kalshi\'s number', med.length ? esc((med.reduce(function (a, b) { return a + b; }, 0) / med.length).toFixed(1)) + ' bp' : '–', '1 bp = 0.01%'));
    set('stage', esc(d.stage || ''));
    set('latest', table(['Coin', 'Window ends', 'Time left', 'Up (bid / ask)', 'Down (bid / ask)', 'Price vs target'],
      (d.latest || []).map(function (m) {
        var c = function (v) { return v == null ? '–' : Math.round(v * 1000) / 10 + '¢'; };
        return '<tr><td><b>' + esc(m.coin) + '</b></td><td>' + esc(m.window_end) + '</td><td>' + esc(Math.max(0, Math.round(m.secs_left / 60))) + ' min</td><td>' +
          c(m.up_bid) + ' / ' + c(m.up_ask) + '</td><td>' + c(m.down_bid) + ' / ' + c(m.down_ask) + '</td><td class="' + sign(m.move_pct) + '">' +
          (m.move_pct == null ? '–' : (m.move_pct > 0 ? '+' : '') + m.move_pct.toFixed(3) + '%') + '</td></tr>';
      }), 'As of ' + ((d.latest || [])[0] || {}).as_of));
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
      var t = p.live.totals || {};
      set('pm-summary', tile('Real bets', esc(t.bets || 0), '') + tile('Won', t.bets ? pct(100 * t.won / Math.max(1, t.won + t.lost)) : '–', '') +
        tile('Profit', money(t.pnl), 'after fees', sign(t.pnl)));
      set('pm-updated', fresh(p));
    }
    if (k) {
      var rc = k.results_check || {};
      set('k-summary', tile('Windows recorded', esc((k.recorder.windows || 0).toLocaleString()), '') +
        tile('Our result = Kalshi\'s', rc.total ? esc(rc.agree) + ' / ' + esc(rc.total) : '–', '') + tile('Snapshots', esc((k.recorder.snapshots || 0).toLocaleString()), ''));
      set('k-updated', fresh(k));
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
})();
