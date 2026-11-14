#!/usr/bin/env node
/* ============================================================
   Tell IndexNow search engines (Bing, Yandex, Seznam, Naver…) that
   pages changed, so they recrawl without waiting. Bing's index also
   feeds ChatGPT search and Copilot. Google doesn't use IndexNow: use
   Search Console for Google.

     node _build/indexnow.js                            every URL in sitemap.xml
     node _build/indexnow.js /services                  just these paths
     node _build/indexnow.js --changed-since old.json   pages that are new or whose
                                                        content changed, compared with
                                                        an older copy of
                                                        _build/data/page-dates.json

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

(async () => {
  const keyFile = path.join(ROOT, `${KEY}.txt`);
  if (!fs.existsSync(keyFile) || fs.readFileSync(keyFile, 'utf8').trim() !== KEY) {
    throw new Error(`${KEY}.txt is missing or does not contain the key`);
  }

  // Every published URL (drafts and redirects aren't in the sitemap).
  const all = [...fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const args = process.argv.slice(2);
  let urlList;
  if (args[0] === '--changed-since') {
    // page-dates.json keeps a hash of each page's own content: a different hash is a real change.
    const before = JSON.parse(fs.readFileSync(args[1], 'utf8'));
    const now = JSON.parse(fs.readFileSync(path.join(ROOT, '_build/data/page-dates.json'), 'utf8'));
    const pagePath = (loc) => loc.slice(`https://${HOST}`.length) || '/';
    urlList = all.filter((loc) => !before[pagePath(loc)] || before[pagePath(loc)].hash !== now[pagePath(loc)].hash);
    if (!urlList.length) { console.log('IndexNow: no page changed, nothing to send'); return; }

    // GitHub Pages publishes a minute or so after a push. Wait until the first changed page is
    // being served, so search engines aren't sent to fetch the old version.
    const file = (pagePath(urlList[0]) === '/' ? '/index' : pagePath(urlList[0])) + '.html';
    const built = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
    let isLive = false;
    for (let i = 0; i < 24 && !isLive; i++) {
      if (i) await new Promise((r) => setTimeout(r, 10000));
      const res = await fetch(`${urlList[0]}?nc=${Date.now()}`).catch(() => null);
      isLive = !!res && res.ok && (await res.text()) === built;
    }
    if (!isLive) { console.log(`IndexNow: ${urlList[0]} isn't live yet; nothing sent`); return; }
  } else if (args.length) {
    urlList = args.map((p) => `https://${HOST}${p.startsWith('/') ? p : '/' + p}`);
  } else {
    urlList = all;
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
