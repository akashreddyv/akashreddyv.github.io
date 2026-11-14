#!/usr/bin/env node
/* ============================================================
   Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) that
   pages changed, so they recrawl without waiting. Bing's index also
   feeds ChatGPT search and Copilot. Google doesn't use IndexNow: use
   Search Console for Google.

     node _build/indexnow.js                            every URL in sitemap.xml
     node _build/indexnow.js /services                  just these paths
     node _build/indexnow.js --changed-since old.xml    URLs that are new, or whose
                                                        date differs, compared with an
                                                        older copy of sitemap.xml

   .github/workflows/build.yml runs the last form after every push, once
   the new pages are live. The key file must be reachable at
   https://reachakash.com/<key>.txt. The key is public by design.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'reachakash.com';
const KEY = '6ff2dd73f330de5c848b33484ad81918';

// loc -> lastmod for every <url> in a sitemap
const sitemapDates = (xml) => new Map([...xml.matchAll(/<loc>([^<]+)<\/loc>\s*(?:<lastmod>([^<]+)<\/lastmod>)?/g)].map((m) => [m[1], m[2] || '']));

(async () => {
  const keyFile = path.join(ROOT, `${KEY}.txt`);
  if (!fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf8').trim() !== KEY) {
    throw new Error(`${KEY}.txt is missing or does not contain the key`);
  }

  const now = sitemapDates(fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8'));
  const args = process.argv.slice(2);
  let urlList;
  if (args[0] === '--changed-since') {
    const before = sitemapDates(fs.readFileSync(args[1], 'utf8'));
    urlList = [...now].filter(([loc, date]) => before.get(loc) !== date).map(([loc]) => loc);
    if (!urlList.length) { console.log('IndexNow: no page changed, nothing to send'); return; }
  } else if (args.length) {
    urlList = args.map((p) => `https://${HOST}${p.startsWith('/') ? p : '/' + p}`);
  } else {
    urlList = [...now.keys()];
  }

  const live = await fetch(`https://${HOST}/${KEY}.txt`);
  if (!live.ok || (await live.text()).trim() !== KEY) throw new Error('the key file is not live yet; push and wait for the deploy');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList })
  });
  // 200 = received, 202 = received and the key is still being checked
  console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URL(s)`);
  urlList.forEach((u) => console.log('  ' + u));
  if (res.status >= 300) { console.log(await res.text()); process.exitCode = 1; }
})().catch((e) => { console.error('IndexNow: ' + e.message); process.exitCode = 1; });
