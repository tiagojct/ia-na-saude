#!/usr/bin/env node
/**
 * Pre-build asset generator (Sharp).
 *
 * Writes to src/public/ so Eleventy's passthrough-copy carries the
 * artefacts to _site/. Runs as `npm run prebuild` before the main build,
 * and locally via `npm run gen:og`.
 *
 * Produces: og.png · cover.png · favicon.{svg,ico,16,32}.png ·
 * apple-touch-icon.png · icon-{192,512}.png.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src/public");

const BRAND_PRIMARY = "#2563eb";
const BRAND_DARK = "#0f172a";
const SITE_URL = "tiagojct.github.io/ia-na-saude";

const OG_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND_DARK}"/>
      <stop offset="55%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.2" r="0.6">
      <stop offset="0%" stop-color="${BRAND_PRIMARY}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${BRAND_PRIMARY}" stop-opacity="0"/>
    </radialGradient>
    <style>
      .display { font-family: 'Instrument Sans', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.03em; }
      .meta { font-family: 'Instrument Sans', system-ui, sans-serif; font-weight: 500; letter-spacing: 0.02em; }
      .mono { font-family: 'SF Mono', ui-monospace, monospace; }
    </style>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g opacity="0.06" stroke="#60a5fa" stroke-width="1">
    ${Array.from({ length: 24 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="630"/>`).join("")}
    ${Array.from({ length: 13 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="1200" y2="${i * 50}"/>`).join("")}
  </g>

  <g transform="translate(80, 80)">
    <rect width="48" height="48" rx="10" fill="${BRAND_PRIMARY}"/>
    <text x="24" y="32" text-anchor="middle" fill="white" font-size="22" class="display">IA</text>
    <text x="64" y="32" fill="white" font-size="22" class="display">IA · Saúde</text>
  </g>

  <text x="80" y="280" fill="white" font-size="78" class="display">Inteligência artificial</text>
  <text x="80" y="370" fill="#60a5fa" font-size="78" class="display">para profissionais</text>
  <text x="80" y="460" fill="white" font-size="78" class="display">de saúde.</text>

  <g transform="translate(80, 540)">
    <text fill="#94a3b8" font-size="22" class="meta">14 secções · 34 demos interactivos · ~80 min</text>
    <text y="36" fill="#64748b" font-size="18" class="mono">${SITE_URL}</text>
  </g>

  <g transform="translate(880, 80)">
    <rect width="240" height="80" rx="14" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
    <text x="20" y="32" fill="#92400e" font-size="12" class="meta">CASO QUE NOS ACOMPANHA</text>
    <text x="20" y="60" fill="#0f172a" font-size="24" class="display">Maria, 64</text>
  </g>
</svg>
`;

const ICON_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="${BRAND_PRIMARY}"/>
  <text x="256" y="316" text-anchor="middle" font-family="'Instrument Sans', system-ui, sans-serif" font-weight="700" font-size="240" fill="white" letter-spacing="-12">IA</text>
</svg>
`;

const MASKABLE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${BRAND_PRIMARY}"/>
  <text x="256" y="316" text-anchor="middle" font-family="'Instrument Sans', system-ui, sans-serif" font-weight="700" font-size="200" fill="white" letter-spacing="-10">IA</text>
</svg>
`;

const COVER_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="2400" viewBox="0 0 1600 2400">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND_DARK}"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${BRAND_DARK}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.18" r="0.55">
      <stop offset="0%" stop-color="${BRAND_PRIMARY}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="${BRAND_PRIMARY}" stop-opacity="0"/>
    </radialGradient>
    <style>
      .display { font-family: 'Instrument Sans', system-ui, sans-serif; font-weight: 700; letter-spacing: -0.03em; }
      .meta { font-family: 'Instrument Sans', system-ui, sans-serif; font-weight: 500; }
      .mono { font-family: 'SF Mono', ui-monospace, monospace; }
    </style>
  </defs>
  <rect width="1600" height="2400" fill="url(#bg)"/>
  <rect width="1600" height="2400" fill="url(#glow)"/>

  <g opacity="0.06" stroke="#60a5fa" stroke-width="2">
    ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="2400"/>`).join("")}
    ${Array.from({ length: 24 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="1600" y2="${i * 100}"/>`).join("")}
  </g>

  <g transform="translate(140, 160)">
    <rect width="84" height="84" rx="18" fill="${BRAND_PRIMARY}"/>
    <text x="42" y="58" text-anchor="middle" fill="white" font-size="40" class="display">IA</text>
    <text x="110" y="58" fill="white" font-size="36" class="display">IA · Saúde</text>
  </g>

  <text x="140" y="950" fill="white" font-size="118" class="display">Inteligência</text>
  <text x="140" y="1080" fill="white" font-size="118" class="display">artificial</text>
  <text x="140" y="1240" fill="#60a5fa" font-size="118" class="display">para</text>
  <text x="140" y="1370" fill="#60a5fa" font-size="118" class="display">profissionais</text>
  <text x="140" y="1530" fill="white" font-size="118" class="display">de saúde.</text>

  <line x1="140" y1="1700" x2="540" y2="1700" stroke="#60a5fa" stroke-width="3"/>

  <text x="140" y="1780" fill="#94a3b8" font-size="42" class="meta">14 secções · 34 demos interactivos</text>
  <text x="140" y="1840" fill="#94a3b8" font-size="42" class="meta">~80 minutos</text>

  <text x="140" y="2150" fill="#cbd5e1" font-size="48" class="display">Tiago Jacinto</text>
  <text x="140" y="2210" fill="#64748b" font-size="32" class="mono">v1 · 2026</text>
  <text x="140" y="2270" fill="#64748b" font-size="28" class="mono">CC-BY-4.0 · tiagojct.eu</text>
</svg>
`;

await fs.mkdir(OUT_DIR, { recursive: true });

await fs.writeFile(path.join(OUT_DIR, "og.svg"), OG_SVG, "utf8");
await fs.writeFile(path.join(OUT_DIR, "favicon.svg"), ICON_SVG, "utf8");

async function render(svg, size, file) {
  const buf = await sharp(Buffer.from(svg))
    .resize(size, size, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await fs.writeFile(path.join(OUT_DIR, file), buf);
  return buf.length;
}

const ogPng = await sharp(Buffer.from(OG_SVG))
  .png({ compressionLevel: 9 })
  .toBuffer();
await fs.writeFile(path.join(OUT_DIR, "og.png"), ogPng);

const coverPng = await sharp(Buffer.from(COVER_SVG))
  .png({ compressionLevel: 9 })
  .toBuffer();
await fs.writeFile(path.join(OUT_DIR, "cover.png"), coverPng);

await render(ICON_SVG, 32, "favicon-32.png");
await render(ICON_SVG, 16, "favicon-16.png");
await render(ICON_SVG, 180, "apple-touch-icon.png");
await render(MASKABLE_SVG, 192, "icon-192.png");
await render(MASKABLE_SVG, 512, "icon-512.png");

const ico16 = await sharp(Buffer.from(ICON_SVG)).resize(16, 16).png().toBuffer();
const ico32 = await sharp(Buffer.from(ICON_SVG)).resize(32, 32).png().toBuffer();

function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const { size, buf } of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0);
    entry.writeUInt8(size === 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += buf.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((i) => i.buf)]);
}

const icoBuffer = buildIco([
  { size: 16, buf: ico16 },
  { size: 32, buf: ico32 },
]);
await fs.writeFile(path.join(OUT_DIR, "favicon.ico"), icoBuffer);

console.log(`✓ og.png ${ogPng.length} bytes`);
console.log(`✓ cover.png ${coverPng.length} bytes (1600x2400 · ePub)`);
console.log(`✓ favicon.svg favicon.ico favicon-{16,32}.png`);
console.log(`✓ apple-touch-icon.png icon-{192,512}.png`);
