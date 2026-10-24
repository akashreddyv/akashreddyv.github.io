/* ============================================================
   Referrals: turns _build/data/referrals.json into
     - the cards and jump links on /referrals (static HTML, works with JS off)
     - one page per offer (/referrals/<id>) and per category (/referrals/<category id>),
       so a search for "<company> referral code" or "send money to India bonus" lands
       on a page about exactly that
     - /referrals.json, a public copy of the published entries
     - the "Referral codes" section of llms.txt
   Only publish:true entries appear anywhere; entries past `expires`
   are skipped. Every sentence on the generated pages comes from the data,
   so the pages can't say more than the cards do. Used by _build/build.js.
   ============================================================ */
'use strict';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const STALE_DAYS = 60;

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const human = (d) => { const [y, m, day] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${day}, ${y}`; };
const monthYear = (d) => { const [y, m] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
const sentence = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[.;]?$/, '.');
// Capitalised, without the closing full stop, for use inside a longer sentence.
const clause = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[.;]\s*$/, '');
const pagePath = (id) => `/referrals/${id}`;
const kind = (e) => (e.code ? 'code' : 'link');

// The first candidate that fits, else the last one cut at a word.
function fit(candidates, max) {
  const ok = candidates.find((c) => c.length <= max);
  if (ok) return ok;
  const last = candidates[candidates.length - 1];
  return last.slice(0, last.lastIndexOf(' ', max - 1)).replace(/[,;:]$/, '') + '…';
}
// Sentences added in order while the total stays within max.
function upTo(parts, max) {
  let out = '';
  for (const p of parts) {
    const next = out ? out + ' ' + p : p;
    if (next.length > max) break;
    out = next;
  }
  return out || fit([parts[0]], max);
}
function regionText(r) {
  if (/ to /.test(r)) {
    const [from, to] = r.split(/ to /);
    return `sending money from ${from.replace(/^US\b/, 'the US').replace(' & ', ' and ')} to ${to}`;
  }
  return `people in ${r.replace(/^US$/, 'the US')}`;
}

function load(json, today) {
  const data = JSON.parse(json);
  const cats = new Map(data.categories.map((c) => [c.id, c]));
  const errors = [], warnings = [], ids = new Set();

  for (const c of data.categories) {
    const where = `referrals.json category "${c.id}"`;
    for (const f of ['id', 'label', 'titleLead', 'intro']) if (!c[f]) errors.push(`${where}: missing ${f}`);
    if (!Array.isArray(c.h1) || c.h1.length !== 2) errors.push(`${where}: h1 must be [plain text, emphasised text]`);
    if (!/^[a-z0-9-]+$/.test(c.id || '')) errors.push(`${where}: id must be lowercase letters, digits and hyphens`);
  }
  for (const e of data.entries) {
    const where = `referrals.json "${e.id}"`;
    for (const f of ['id', 'name', 'category', 'forYou', 'termsUrl', 'lastVerified']) {
      if (!e[f]) errors.push(`${where}: missing ${f}`);
    }
    if (!/^[a-z0-9-]+$/.test(e.id || '')) errors.push(`${where}: id must be lowercase letters, digits and hyphens`);
    if (ids.has(e.id)) errors.push(`${where}: duplicate id`);
    ids.add(e.id);
    // Offer and category pages share /referrals/<id>.
    if (cats.has(e.id)) errors.push(`${where}: id is also a category id, so both pages would be /referrals/${e.id}`);
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
    if (e.headline != null && (typeof e.headline !== 'string' || e.headline.length > 30)) errors.push(`${where}: headline must be a string of 30 characters or fewer`);
    if (e.logo != null && !/^\/images\/referrals\/[a-z0-9-]+\.(png|svg|webp)$/.test(e.logo)) errors.push(`${where}: logo must be /images/referrals/<name>.png|svg|webp`);
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

// link: the company name links to the offer's own page (on /referrals and the category pages).
function card(e, { link = false } = {}) {
  const name = esc(e.name);
  const hidden = `<span class="visually-hidden"> for ${name}</span>`;
  const lines = [
    `      <article class="ref-card" id="${e.id}" aria-labelledby="${e.id}-name">`,
    '        <div class="ref-card-head">',
    e.logo ? `          <img class="ref-logo" src="${e.logo}" alt="" width="44" height="44" loading="lazy" decoding="async">` : null,
    `          <h3 class="ref-name" id="${e.id}-name">${link ? `<a href="${pagePath(e.id)}">${name}</a>` : name}</h3>`,
    e.region ? `          <span class="ref-region">${esc(e.region)}</span>` : null,
    '        </div>',
    `        <p class="ref-for"><strong>For you:</strong> ${esc(sentence(e.forYou))}` +
      (e.asOf ? ` <span class="ref-asof">As of ${human(e.asOf)}</span>` : '') + '</p>',
    e.note ? `        <p class="ref-note">${esc(e.note)}</p>` : null,
    // Visible "<name> referral code / link" wording matches what people search for.
    e.code
      ? [
          `        <p class="ref-code-label">${name} referral code</p>`,
          '        <div class="ref-code-row">',
          `          <code class="ref-code" aria-label="${name} referral code">${esc(e.code)}</code>`,
          `          <button class="btn btn-outline ref-copy" type="button" data-copy="${esc(e.code)}" data-copy-label="${name} referral code" hidden>Copy${hidden}</button>`,
          '        </div>'
        ].join('\n')
      : `        <p class="ref-nocode">No code needed. Sign up through my ${name} referral link.</p>`,
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
    '    <div class="ref-section-head">',
    `      <h2 class="ref-section-title" id="${g.id}-title">${esc(g.label)}</h2>`,
    `      <a class="ref-section-more" href="${pagePath(g.id)}">Compare side by side<span class="visually-hidden">: ${esc(g.label)}</span></a>`,
    '    </div>',
    '    <div class="ref-grid">',
    g.entries.map((e) => card(e, { link: true })).join('\n'),
    '    </div>',
    '  </section>'
  ].join('\n')).join('\n\n');
}

// ── Pages per offer and per category ──────────────────────────────

const DISCLOSURE = 'I earn a referral reward when you sign up through my links or codes. Each company sets its own offer, offers change often, and the official terms have the final say. Not financial advice.';

const faqItem = (q, a) => ['    <div class="faq-item">', `      <h3>${q}</h3>`, `      <p>${a}</p>`, '    </div>'].join('\n');

function crumbs(origin, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [['Home', '/'], ['Referrals', '/referrals'], ...items].map(([name, p], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: origin + p
    }))
  };
}

function otherCategories(loaded, exceptId) {
  const links = loaded.groups.filter((g) => g.id !== exceptId)
    .map((g) => `<a href="${pagePath(g.id)}">${esc(g.label)}</a>`);
  return links.length ? `    <p class="ref-related-links">Other categories: ${links.join(' · ')}</p>` : null;
}

function offerPage(e, loaded, origin) {
  const cat = loaded.groups.find((g) => g.id === e.category);
  const name = esc(e.name);
  const k = kind(e);
  const path = pagePath(e.id);
  const asOf = e.asOf ? `, as of ${human(e.asOf)}` : '';
  const when = monthYear(e.asOf || e.lastVerified);
  const base = `${e.name} Referral ${k === 'code' ? 'Code' : 'Link'}`;

  const title = fit([
    e.headline && `${base}: ${e.headline} (${when})`,
    e.headline && `${base}: ${e.headline}`,
    `${base} (${when}) | Akash Reddy`,
    `${base} (${when})`,
    base
  ].filter(Boolean), 60);
  const description = upTo([
    `${e.name} referral ${e.code ? `code ${e.code}` : 'link, no code needed'}: ${e.forYou.replace(/[.;]\s*$/, '')}.`,
    `Checked ${human(e.lastVerified)}, with the official terms.`,
    'From Akash Reddy, who earns a reward.'
  ], 155);

  const steps = [
    `Open my ${name} referral link with the <strong>Sign up</strong> button${e.code ? '' : ' (no code needed)'}.`,
    e.code ? `If ${name} asks for a referral or invite code, enter <code class="ref-inline-code">${esc(e.code)}</code>.` : null,
    `${e.category === 'credit-cards' ? 'Apply and get approved' : 'Finish signing up'}, then meet ${name}'s requirements for the bonus.`,
    `${name} pays the bonus, not me. Its <a href="${esc(e.termsUrl)}" target="_blank" rel="nofollow noopener">official terms</a> have the details and the final say.`
  ].filter(Boolean);

  const faq = [
    [`What is the ${name} referral code?`, e.code
      ? `It's <strong>${esc(e.code)}</strong>. Enter it if ${name} asks for a referral or invite code, or sign up through my ${name} referral link.`
      : `There isn't a code for this one. ${name} uses a referral link instead, so sign up through my ${name} referral link and the referral comes with it.`],
    [`What do I get with the ${name} referral?`, `${esc(clause(e.forYou))}${asOf}. Offers change, so check ${name}'s official terms before you sign up.`],
    ['Who can use it?', e.region
      ? `It's for ${esc(regionText(e.region))}. ${name}'s terms decide who qualifies.`
      : `Anyone ${name}'s terms allow. Its terms decide who qualifies.`],
    ['Does Akash Reddy get anything if I use it?', e.iGet
      ? `Yes: ${esc(e.iGet)}, paid by ${name}. It doesn't cost you anything.`
      : `Yes, ${name} gives me a referral reward when you qualify. It doesn't cost you anything.`],
    [`What if my ${name} referral doesn't work?`, `Offers end or change without notice. Use ${name}'s own sign-up page instead, and <a href="/contact">tell me</a> so I can fix it.`]
  ];

  const siblings = cat.entries.filter((x) => x.id !== e.id);
  const lead = e.code
    ? `Use code <strong>${esc(e.code)}</strong> or sign up through my link. ${esc(clause(e.forYou))}${asOf}.`
    : `No code needed, just sign up through my link. ${esc(clause(e.forYou))}${asOf}.`;

  const content = [
    '<div class="page-inner referrals-page ref-offer">',
    '',
    '  <div class="page-header">',
    `    <p class="page-eyebrow"><a href="/referrals">Referrals</a> <span aria-hidden="true">/</span> <a href="${pagePath(cat.id)}">${esc(cat.label)}</a></p>`,
    `    <h1 class="page-title">${name} referral <em>${k}</em></h1>`,
    `    <p class="page-subtitle">${lead}</p>`,
    '  </div>',
    '',
    '  <section class="ref-section" aria-labelledby="signup-title">',
    `    <h2 class="ref-section-title" id="signup-title">My ${name} referral ${k}</h2>`,
    '    <div class="ref-grid ref-grid-one">',
    card(e),
    '    </div>',
    '  </section>',
    '',
    '  <section class="ref-section" aria-labelledby="how-title">',
    '    <h2 class="ref-section-title" id="how-title">How to get the bonus</h2>',
    '    <ol class="ref-steps">',
    ...steps.map((s) => `      <li>${s}</li>`),
    '    </ol>',
    '  </section>',
    '',
    '  <section class="faq" aria-labelledby="faq-title">',
    `    <h2 class="faq-title" id="faq-title">Questions about the ${name} referral</h2>`,
    ...faq.map(([q, a]) => faqItem(q, a)),
    '  </section>',
    '',
    '  <section class="ref-section" aria-labelledby="more-title">',
    `    <h2 class="ref-section-title" id="more-title">${siblings.length ? `More in ${esc(cat.label)}` : 'More referral codes'}</h2>`,
    siblings.length ? '    <ul class="ref-related">' : null,
    ...siblings.map((x) => `      <li><a href="${pagePath(x.id)}">${esc(x.name)} referral ${kind(x)}</a><span>${esc(clause(x.forYou))}</span></li>`),
    siblings.length ? '    </ul>' : null,
    `    <p class="ref-related-links">${siblings.length ? `<a href="${pagePath(cat.id)}">Compare all ${esc(cat.label)} offers</a> · ` : ''}<a href="/referrals">All my referral codes</a></p>`,
    otherCategories(loaded, cat.id),
    '  </section>',
    '',
    `  <p class="ref-disclosure">${DISCLOSURE}</p>`,
    '  <p class="visually-hidden" id="copy-status" aria-live="polite"></p>',
    '',
    '</div>'
  ].filter((l) => l !== null).join('\n');

  return {
    slug: 'referral-offer', path, out: `referrals/${e.id}.html`, source: null,
    nav: 'referrals', navCurrent: 'true', faq: true,
    title, description, ogType: 'website', ogTitle: title, ogDesc: description,
    content,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': origin + path + '#webpage',
        url: origin + path,
        name: `${e.name} referral ${k}`,
        description,
        isPartOf: { '@id': origin + '/#website' },
        about: { '@type': 'Thing', name: e.name },
        author: { '@id': origin + '/#person' },
        dateModified: e.lastVerified,
        inLanguage: 'en'
      },
      crumbs(origin, [[cat.label, pagePath(cat.id)], [e.name, path]])
    ],
    sitemap: { changefreq: 'weekly', priority: '0.7', lastmod: e.lastVerified },
    llms: null
  };
}

function categoryPage(g, loaded, origin) {
  const path = pagePath(g.id);
  // Short names in titles and descriptions ("Abound", not "Abound (Times of India)") so more of them fit.
  const names = g.entries.map((e) => e.name.replace(/\s*\([^)]*\)$/, ''));
  const latest = g.entries.map((e) => e.lastVerified).sort().pop();
  const when = monthYear(latest);
  const titles = [`${g.titleLead}: ${names.join(', ')} (${when})`];
  for (let n = names.length; n >= 1; n--) titles.push(`${g.titleLead}: ${names.slice(0, n).join(', ')}`);
  titles.push(`${g.titleLead} (${when})`, g.titleLead);
  const title = fit(titles, 60);
  const description = upTo([
    `${g.label} referral codes and links: ${names.join(', ')}.`,
    `What you get, the codes and the official terms, checked ${when}.`,
    'From Akash Reddy, who earns a reward.'
  ], 155);

  const rows = g.entries.map((e) => [
    '          <tr>',
    `            <th scope="row"><a href="${pagePath(e.id)}">${esc(e.name)}</a></th>`,
    `            <td>${esc(clause(e.forYou))}</td>`,
    `            <td>${e.code ? `<code class="ref-inline-code">${esc(e.code)}</code>` : 'Link only'}</td>`,
    `            <td>${e.region ? esc(e.region) : 'Any'}</td>`,
    `            <td><time datetime="${e.lastVerified}">${human(e.lastVerified)}</time></td>`,
    '          </tr>'
  ].join('\n'));

  const listed = g.entries.map((e) => `<a href="${pagePath(e.id)}">${esc(e.name)}</a> (${esc(e.forYou.replace(/[.;]\s*$/, ''))})`).join('; ');
  const content = [
    '<div class="page-inner referrals-page ref-category">',
    '',
    '  <div class="page-header">',
    '    <p class="page-eyebrow"><a href="/referrals">Referrals</a></p>',
    `    <h1 class="page-title">${esc(g.h1[0])} <em>${esc(g.h1[1])}</em></h1>`,
    `    <p class="page-subtitle">${esc(g.intro)}</p>`,
    '  </div>',
    '',
    '  <section class="ref-section" aria-labelledby="compare-title">',
    '    <h2 class="ref-section-title" id="compare-title">Compare</h2>',
    '    <div class="ref-table-wrap" role="region" aria-labelledby="compare-title" tabindex="0">',
    '      <table class="ref-table">',
    '        <thead>',
    '          <tr><th scope="col">Company</th><th scope="col">What you get</th><th scope="col">Code</th><th scope="col">Where</th><th scope="col">Checked</th></tr>',
    '        </thead>',
    '        <tbody>',
    ...rows,
    '        </tbody>',
    '      </table>',
    '    </div>',
    '  </section>',
    '',
    '  <section class="ref-section" aria-labelledby="codes-title">',
    '    <h2 class="ref-section-title" id="codes-title">Codes and sign-up links</h2>',
    '    <div class="ref-grid">',
    g.entries.map((e) => card(e, { link: true })).join('\n'),
    '    </div>',
    '  </section>',
    '',
    '  <section class="faq" aria-labelledby="faq-title">',
    '    <h2 class="faq-title" id="faq-title">Questions</h2>',
    faqItem('Which offers are listed here?', `${listed}. Each one links to its own page with the code, the steps and the official terms.`),
    faqItem('Do you get something if I use these?', "Yes. When you sign up through one of these and meet the company's requirements, the company gives me a referral reward. It doesn't cost you anything."),
    faqItem('Are these the best offers?', "Not always. A referral offer can be better or worse than the company's public offer, and both change often, so compare them before you sign up."),
    '  </section>',
    '',
    '  <section class="ref-section" aria-labelledby="more-title">',
    '    <h2 class="ref-section-title" id="more-title">More referral codes</h2>',
    '    <p class="ref-related-links"><a href="/referrals">All my referral codes</a></p>',
    otherCategories(loaded, g.id),
    '  </section>',
    '',
    `  <p class="ref-disclosure">${DISCLOSURE}</p>`,
    '  <p class="visually-hidden" id="copy-status" aria-live="polite"></p>',
    '',
    '</div>'
  ].filter((l) => l !== null).join('\n');

  return {
    slug: 'referral-category', path, out: `referrals/${g.id}.html`, source: null,
    nav: 'referrals', navCurrent: 'true', faq: true,
    title, description, ogType: 'website', ogTitle: title, ogDesc: description,
    content,
    jsonld: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': origin + path + '#webpage',
        url: origin + path,
        name: `${g.label} referral codes`,
        description,
        isPartOf: { '@id': origin + '/#website' },
        author: { '@id': origin + '/#person' },
        dateModified: latest,
        inLanguage: 'en',
        mainEntity: itemList(g.entries, origin)
      },
      crumbs(origin, [[g.label, path]])
    ],
    sitemap: { changefreq: 'weekly', priority: '0.8', lastmod: latest },
    llms: null
  };
}

// The offer pages as a schema.org ItemList (on /referrals and each category page).
function itemList(entries, origin) {
  return {
    '@type': 'ItemList',
    numberOfItems: entries.length,
    itemListElement: entries.map((e, i) => ({
      '@type': 'ListItem', position: i + 1, url: origin + pagePath(e.id), name: `${e.name} referral ${kind(e)}`
    }))
  };
}

function pages(loaded, origin) {
  return [
    ...loaded.groups.map((g) => categoryPage(g, loaded, origin)),
    ...loaded.live.map((e) => offerPage(e, loaded, origin))
  ];
}

function renderJson(loaded, origin, note) {
  const out = {
    _generated: note,
    source: origin + '/referrals',
    disclosure: 'Akash Reddy earns a reward when you sign up through these links or codes. Offers are set by each company, change often, and can differ from public offers, so check the official page before applying. Not financial advice.',
    updated: loaded.updated,
    entries: loaded.live.map((e) => {
      const o = {
        id: e.id, name: e.name, logo: e.logo ? origin + e.logo : null, category: e.category, region: e.region || null,
        code: e.code || null, url: e.url, forYou: e.forYou, iGet: e.iGet || null,
        termsUrl: e.termsUrl, lastVerified: e.lastVerified
      };
      if (e.asOf) o.asOf = e.asOf;
      if (e.note) o.note = e.note;
      if (e.expires) o.expires = e.expires;
      o.page = origin + pagePath(e.id);
      return o;
    })
  };
  return JSON.stringify(out, null, 2) + '\n';
}

function llmsLines(loaded, origin) {
  return loaded.live.map((e) => `[${e.name} referral ${kind(e)}](${origin}${pagePath(e.id)}): ` +
    `${e.code ? 'code ' + e.code : 'no code, link only'}; for you: ${e.forYou}${e.asOf ? ` (as of ${e.asOf})` : ''}` +
    `${e.region ? `; where: ${e.region}` : ''}; sign up: ${e.url}; official terms: ${e.termsUrl}`);
}

function llmsCategories(loaded, origin) {
  return loaded.groups.map((g) => `[${g.label} referral codes](${origin}${pagePath(g.id)}): ${g.entries.map((e) => e.name).join(', ')}`);
}

module.exports = { load, renderJump, renderSections, renderJson, llmsLines, llmsCategories, pages, itemList };
