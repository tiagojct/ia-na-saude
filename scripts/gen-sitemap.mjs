#!/usr/bin/env node
/**
 * Generate sitemap.xml after Eleventy build.
 *
 * Scans _site/ for index.html files and emits a sitemap. Excludes
 * 404, drafts, anything inside _site/assets/.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE_DIR = path.join(ROOT, "_site");

const ORIGIN = process.env.SITE ?? "https://tiagojct.github.io";
const BASE = process.env.BASE ?? "/ia-na-saude/";

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "assets") continue;
      out.push(...(await walk(full)));
    } else if (e.name === "index.html") {
      out.push(full);
    }
  }
  return out;
}

const files = await walk(SITE_DIR);
const urls = files
  .map((f) => path.relative(SITE_DIR, f))
  .map((rel) => {
    const dir = path.dirname(rel);
    return dir === "." ? "" : dir + "/";
  })
  .map((p) => ORIGIN + BASE.replace(/\/$/, "") + "/" + p)
  .sort();

const stat = await Promise.all(
  files.map(async (f) => (await fs.stat(f)).mtime),
);
const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u, i) =>
      `  <url><loc>${u}</loc><lastmod>${stat[i].toISOString().slice(0, 10)}</lastmod></url>`,
  )
  .join("\n")}
</urlset>
`;

await fs.writeFile(path.join(SITE_DIR, "sitemap.xml"), xml, "utf8");
console.log(`✓ sitemap.xml · ${urls.length} URLs (last build ${today})`);
