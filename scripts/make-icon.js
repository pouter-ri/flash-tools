// Generates assets/icon.png: a 1024x1024 solid dark PNG with a lighter
// rounded-square glyph area. No dependencies (uses node:zlib).
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const W = 1024;
const H = 1024;

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32 ? 0 : 0, 0);
  // Compute CRC32 manually (small dependency-free implementation).
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

const CRC_TABLE = (() => {
  const t = new Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i += 1) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Pixel layout: dark navy background (#0a0a18), centered amber rounded
// square (flashlight glyph block) with a white bolt-ish column.
const raw = Buffer.alloc((W * 3 + 1) * H);
let bg = [10, 10, 24];
let sq = [255, 176, 32];
let fg = [255, 255, 255];
const S0 = 312;
const S1 = 712;
const R = 96;
for (let y = 0; y < H; y += 1) {
  const rowStart = y * (W * 3 + 1);
  raw[rowStart] = 0; // filter byte: none
  for (let x = 0; x < W; x += 1) {
    let [r, g, b] = bg;
    const inX = x >= S0 && x < S1;
    const inY = y >= S0 && y < S1;
    if (inX && inY) {
      // rounded corners
      const cx = Math.min(x - S0, S1 - 1 - x);
      const cy = Math.min(y - S0, S1 - 1 - y);
      const corner = Math.min(cx, cy);
      const edge = cx < R && cy < R && (cx * cx + cy * cy < R * R) ? false : true;
      if (edge || corner >= 0) {
        if (corner >= 0 && cx < R && cy < R && cx * cx + cy * cy >= R * R) {
          // outside rounded corner: keep bg
        } else {
          [r, g, b] = sq;
          // white bolt column in the middle
          if (x >= 472 && x < 552 && y >= 392 && y < 632) [r, g, b] = fg;
        }
      }
    }
    const o = rowStart + 1 + x * 3;
    raw[o] = r;
    raw[o + 1] = g;
    raw[o + 2] = b;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // truecolor
ihdr[10] = 0;
ihdr[11] = 0;
ihdr[12] = 0;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

const out = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(out, png);
console.log(`wrote ${out} (${png.length} bytes)`);
