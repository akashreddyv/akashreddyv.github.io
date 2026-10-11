/* ============================================================
   Referrals: turns _build/data/referrals.json into
     - the cards and jump links on /referrals (static HTML, works with JS off)
     - /referrals.json, a public copy of the published entries
     - the "Referral codes" section of llms.txt
   Only publish:true entries appear anywhere; entries past `expires`
   are skipped. Used by _build/build.js.
   ============================================================ */
'use strict';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STALE_DAYS = 60;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const human = (d) => { const [y, m, day] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${day}, ${y}`; };
const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[.;]?$/, '.');

function load(json, today) {
  const data = JSON.parse(json);
  const cats = new Map(data.categories.map((c) => [c.id, c]));
  const errors = [], warnings = [], ids = new Set();

  for (const e of data.entries) {
    const where = `referrals.json "${e.id}"`;
    for (const f of ['id', 'name', 'category', 'forYou', 'termsUrl', 'lastVerified']) {
      if (!e[f]) errors.push(`${where}: missing ${f}`);
    }
    if (!/^[a-z0-9-]+$/.test(e.id || '')) errors.push(`${where}: id must be lowercase letters, digits and hyphens`);
    if (ids.has(e.id)) errors.push(`${where}: duplicate id`);
    ids.add(e.id);
    if (!cats.has(e.category)) errors.push(`${where}: unknown category "${e.category}"`);
    if (typeof e.publish !== 'boolean') errors.push(`${where}: publish must be true or false`);
    for (const f of ['lastVerified', 'expires', 'asOf']) {
      if (e[f] != null && !isoDate.test(e[f])) errors.push(`${where}: ${f} must be YYYY-MM-DD`);
    }
    for (const f of ['url', 'termsUrl']) {
      if (e[f] && !/^https:\/\//.test(e[f])) errors.push(`${where}: ${f} must be https`);
      if (e[f] && /[?&]utm_/i.test(e[f])) errors.push(`${where}: ${f} has utm_ parameters; strip them`);
    }
    if (e.publish && !e.url) errors.push(`${where}: published entries need a url`);
  }

  const live = data.entries.filter((e) => e.publish && !(e.expires && e.expires < today));
  for (const e of live) {
    const age = (Date.parse(today) - Date.parse(e.lastVerified)) / 86400000;
    if (age > STALE_DAYS) warnings.push(`referrals.json "${e.id}": lastVerified ${e.lastVerified} is ${Math.floor(age)} days old (check the offer)`);
  }
  if (errors.length) throw new Error(errors.join('\n'));

  const groups = data.categories
    .map((c) => ({ ...c, entries: live.filter((e) => e.category === c.id) }))
    .filter((g) => g.entries.length);
  const updated = live.map((e) => e.lastVerified).sort().pop() || today;
  return { groups, live, updated, warnings };
}

function card(e) {
  const name = esc(e.name);
  const hidden = `<span class="visually-hidden"> for ${name}</span>`;
  const lines = [
    `      <article class="ref-card" id="${e.id}" aria-labelledby="${e.id}-name">`,
    '        <div class="ref-card-head">',
    `          <h3 class="ref-name" id="${e.id}-name">${name}</h3>`,
    e.region ? `          <span class="ref-region">${esc(e.region)}</span>` : null,
    '        </div>',
    `        <p class="ref-for"><strong>For you:</strong> ${esc(sentence(e.forYou))}` +
      (e.asOf ? ` <span class="ref-asof">As of ${human(e.asOf)}</span>` : '') + '</p>',
    e.note ? `        <p class="ref-note">${esc(e.note)}</p>` : null,
    e.code
      ? [
          '        <div class="ref-code-row">',
          `          <code class="ref-code" aria-label="${name} code">${esc(e.code)}</code>`,
          `          <button class="btn btn-outline ref-copy" type="button" data-copy="${esc(e.code)}" data-copy-label="${name} code" hidden>Copy${hidden}</button>`,
          '        </div>'
        ].join('\n')
      : '        <p class="ref-nocode">No code needed. Sign up through the link.</p>',
    '        <div class="ref-actions">',
    `          <a class="btn btn-primary" href="${esc(e.url)}" target="_blank" rel="sponsored nofollow noopener">Sign up${hidden}</a>`,
    `          <a class="ref-terms" href="${esc(e.termsUrl)}" target="_blank" rel="nofollow noopener">Official terms${hidden}</a>`,
    '        </div>',
    `        <p class="ref-checked">Checked <time datetime="${e.lastVerified}">${human(e.lastVerified)}</time></p>`,
    '      </article>'
  ];
  return lines.filter((l) => l !== null).join('\n');
}

function renderJump(groups) {
  return [
    // A div with the navigation role: the site's header styles target every <nav>.
    '  <div class="ref-jump" role="navigation" aria-label="Referral categories">',
    '    <ul>',
    ...groups.map((g) => `      <li><a href="#${g.id}">${esc(g.label)}</a></li>`),
    '    </ul>',
    '  </div>'
  ].join('\n');
}

function renderSections(groups) {
  return groups.map((g) => [
    `  <section class="ref-section" id="${g.id}" aria-labelledby="${g.id}-title">`,
    `    <h2 class="ref-section-title" id="${g.id}-title">${esc(g.label)}</h2>`,
    '    <div class="ref-grid">',
    g.entries.map(card).join('\n'),
    '    </div>',
    '  </section>'
  ].join('\n')).join('\n\n');
}

function renderJson(loaded, origin, note) {
  const out = {
    _generated: note,
    source: origin + '/referrals',
    disclosure: 'Akash Reddy earns a reward when you sign up through these links or codes. Offers are set by each company, change often, and can differ from public offers, so check the official page before applying. Not financial advice.',
    updated: loaded.updated,
    entries: loaded.live.map((e) => {
      const o = {
        id: e.id, name: e.name, category: e.category, region: e.region || null,
        code: e.code || null, url: e.url, forYou: e.forYou, iGet: e.iGet || null,
        termsUrl: e.termsUrl, lastVerified: e.lastVerified
      };
      if (e.asOf) o.asOf = e.asOf;
      if (e.note) o.note = e.note;
      if (e.expires) o.expires = e.expires;
      o.page = `${origin}/referrals#${e.id}`;
      return o;
    })
  };
  return JSON.stringify(out, null, 2) + '\n';
}

function llmsLines(loaded) {
  return loaded.live.map((e) => `${e.name}: ${e.code ? 'code ' + e.code : 'no code (link only)'}, ${e.url}`);
}

module.exports = { load, renderJump, renderSections, renderJson, llmsLines };
