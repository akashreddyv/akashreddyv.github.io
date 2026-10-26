/* Pixel size of a JPEG, PNG or WebP, read from its header (no dependencies).
   Used by _build/build.js and _build/process-photos.js. */
'use strict';

const fs = require('fs');

function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b[0] === 0x89 && b.toString('ascii', 1, 4) === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
    const kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3FFF), 1 + ((v >> 14) & 0x3FFF)]; }
    return [b.readUInt16LE(26) & 0x3FFF, b.readUInt16LE(28) & 0x3FFF];
  }
  for (let i = 2; i < b.length;) {                       // JPEG: walk to the SOF marker
    const marker = b[i + 1];
    if (marker >= 0xC0 && marker <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(marker)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + b.readUInt16BE(i + 2);
  }
  throw new Error(`can't read the size of ${file}`);
}

module.exports = { imageSize };
