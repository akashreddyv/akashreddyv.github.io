#!/usr/bin/env node
/* ============================================================
   Tag the photos in _build/data/photos.json with XMP metadata, so the
   files themselves say who is in them, even when copied elsewhere:
     Iptc4xmpExt:PersonInImage  "Vurenuka Akash Reddy"  (IPTC "Person Shown")
     dc:title / dc:description  the photo's title and alt text
     photoshop:Credit           "Akash Reddy (reachakash.com)"  (IPTC "Credit Line")
     xmpRights:WebStatement     the Gallery page
   No creator or copyright claim: whoever took a photo owns it.

     node _build/photo-meta.js           tag every JPEG in photos.json
     node _build/photo-meta.js --check   exit 1 if any is untagged or out of date

   Re-runnable: it replaces its own XMP block and leaves the pixels alone.
   No dependencies.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECK = process.argv.includes('--check');
const PERSON = 'Vurenuka Akash Reddy';
const CREDIT = 'Akash Reddy (reachakash.com)';
const WEB = 'https://reachakash.com/gallery';
const XMP_NS = Buffer.from('http://ns.adobe.com/xap/1.0/\0');

const xmlEsc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function packet(p) {
  const alt = (v) => `<rdf:Alt><rdf:li xml:lang="x-default">${xmlEsc(v)}</rdf:li></rdf:Alt>`;
  return [
    '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
    '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
    ' <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
    '  <rdf:Description rdf:about=""',
    '    xmlns:dc="http://purl.org/dc/elements/1.1/"',
    '    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"',
    '    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"',
    '    xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"',
    `    photoshop:Credit="${xmlEsc(CREDIT)}"`,
    `    xmpRights:WebStatement="${xmlEsc(WEB)}">`,
    `   <dc:title>${alt(p.title)}</dc:title>`,
    `   <dc:description>${alt(p.alt)}</dc:description>`,
    `   <Iptc4xmpExt:PersonInImage><rdf:Bag><rdf:li>${xmlEsc(PERSON)}</rdf:li></rdf:Bag></Iptc4xmpExt:PersonInImage>`,
    '  </rdf:Description>',
    ' </rdf:RDF>',
    '</x:xmpmeta>',
    '<?xpacket end="w"?>'
  ].join('\n');
}

// Split a JPEG into SOI + segments up to the image data, and the rest.
function segments(buf) {
  if (buf[0] !== 0xFF || buf[1] !== 0xD8) throw new Error('not a JPEG');
  const segs = [];
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xFF) throw new Error('bad JPEG marker at byte ' + i);
    const marker = buf[i + 1];
    if (marker === 0xDA) break;                       // start of scan: image data follows
    const len = buf.readUInt16BE(i + 2);
    segs.push({ marker, bytes: buf.subarray(i, i + 2 + len) });
    i += 2 + len;
  }
  return { segs, rest: buf.subarray(i) };
}

function tag(buf, p) {
  const { segs, rest } = segments(buf);
  const isXmp = (s) => s.marker === 0xE1 && s.bytes.subarray(4, 4 + XMP_NS.length).equals(XMP_NS);
  const body = Buffer.concat([XMP_NS, Buffer.from(packet(p), 'utf8')]);
  if (body.length + 2 > 0xFFFF) throw new Error('XMP block too large');
  const head = Buffer.alloc(4);
  head.writeUInt16BE(0xFFE1, 0);
  head.writeUInt16BE(body.length + 2, 2);
  const xmp = { marker: 0xE1, bytes: Buffer.concat([head, body]) };
  const kept = segs.filter((s) => !isXmp(s));
  // After APP0 (JFIF) if there is one, else first.
  const at = kept.length && kept[0].marker === 0xE0 ? 1 : 0;
  kept.splice(at, 0, xmp);
  return Buffer.concat([Buffer.from([0xFF, 0xD8]), ...kept.map((s) => s.bytes), rest]);
}

const photos = JSON.parse(fs.readFileSync(path.join(ROOT, '_build/data/photos.json'), 'utf8')).photos;
let bad = 0;
for (const p of photos) {
  if (!/\.jpe?g$/i.test(p.file)) { console.log(`skip (not a JPEG): ${p.file}`); continue; }
  const file = path.join(ROOT, p.file);
  const before = fs.readFileSync(file);
  const after = tag(before, p);
  if (before.equals(after)) { console.log(`ok: ${p.file}`); continue; }
  if (CHECK) { bad++; console.error(`untagged or out of date: ${p.file}`); continue; }
  fs.writeFileSync(file, after);
  console.log(`tagged: ${p.file} (+${after.length - before.length} bytes)`);
}
if (CHECK && bad) { console.error(`\n${bad} photo(s) need tagging. Run: node _build/photo-meta.js`); process.exit(1); }
