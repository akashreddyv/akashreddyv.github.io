#!/usr/bin/env node
/* ============================================================
   Get new photos in _build/data/photos.json ready for the site (the admin
   page uploads them as they come off the phone):
     - turn them upright, shrink to 1600px on the long side and save as JPEG.
       Saving afresh drops all camera data, including GPS location.
     - rename them name-first (images/photos/akash-reddy-<title>.jpg) for image search
     - write each photo's real width and height into photos.json
   Photos that already carry the XMP tag from _build/photo-meta.js are done, so
   they're only measured. Each rename is remembered in _build/data/photo-renames.json:
   the admin page can save photos.json again from a copy it loaded before the rename
   (two uploads in one visit), and the old path then just points at the new file.
   Runs in GitHub Actions before photo-meta.js and build.js
   (.github/workflows/build.yml), which installs sharp; without sharp it can only
   measure, and stops if a photo still needs processing.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const { imageSize } = require('./image-size.js');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, '_build/data/photos.json');
const RENAMES = path.join(ROOT, '_build/data/photo-renames.json');
const DONE_TAG = 'Iptc4xmpExt:PersonInImage';

const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60).replace(/-+$/, '');

function loadSharp() {
  try { return require('sharp'); } catch (e) { return null; }
}

(async () => {
  const raw = fs.readFileSync(DATA, 'utf8');
  const data = JSON.parse(raw);
  const sharp = loadSharp();
  const taken = new Set(data.photos.map((p) => p.file));
  const renames = fs.existsSync(RENAMES) ? JSON.parse(fs.readFileSync(RENAMES, 'utf8')) : {};
  let changed = false;
  let renamed = false;

  for (const p of data.photos) {
    if (!p.file) throw new Error('photos.json: a photo has no file');
    if (!fs.existsSync(path.join(ROOT, p.file)) && renames[p.file]) {
      console.log(`already processed: ${p.file} -> ${renames[p.file]}`);
      taken.delete(p.file);
      taken.add(renames[p.file]);
      p.file = renames[p.file];
      changed = true;
    }
    const abs = path.join(ROOT, p.file);
    if (!fs.existsSync(abs)) throw new Error(`photos.json: ${p.file} does not exist`);
    const done = /\.jpe?g$/i.test(p.file) && fs.readFileSync(abs).includes(DONE_TAG);

    if (!done) {
      if (!sharp) throw new Error(`${p.file} needs resizing and its camera data removed; that runs in GitHub Actions (needs sharp)`);
      let slug = slugify(p.title || p.caption || 'photo');
      if (!slug.startsWith('akash-reddy')) slug = 'akash-reddy-' + slug;
      let target = `/images/photos/${slug}.jpg`;
      const free = (t) => t === p.file || !(taken.has(t) || fs.existsSync(path.join(ROOT, t)));
      for (let n = 2; !free(target); n++) target = `/images/photos/${slug}-${n}.jpg`;
      const targetAbs = path.join(ROOT, target);
      fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
      const out = await sharp(abs)
        .rotate()                                                   // upright, from the camera's orientation flag
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 82, mozjpeg: true })                      // a fresh JPEG: no EXIF, no GPS
        .toBuffer();
      fs.writeFileSync(targetAbs, out);
      if (path.resolve(targetAbs) !== path.resolve(abs)) fs.unlinkSync(abs);   // the original upload
      console.log(`processed: ${p.file} -> ${target}`);
      if (target !== p.file) { renames[p.file] = target; renamed = true; }
      taken.delete(p.file);
      taken.add(target);
      p.file = target;
      changed = true;
    }

    const [w, h] = imageSize(path.join(ROOT, p.file));
    if (p.width !== w || p.height !== h) { p.width = w; p.height = h; changed = true; }
  }

  if (renamed) fs.writeFileSync(RENAMES, JSON.stringify(renames, null, 2) + '\n');
  if (changed) {
    fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n');
    console.log('updated _build/data/photos.json');
  } else {
    console.log('photos: nothing to do');
  }
})().catch((e) => { console.error('process-photos: ' + e.message); process.exitCode = 1; });
