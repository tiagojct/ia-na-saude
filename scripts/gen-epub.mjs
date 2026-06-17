#!/usr/bin/env node
/**
 * Build _site/ia-na-saude.epub from the rendered _site/pt-PT/index.html.
 *
 * Approach:
 *   - Parse 11ty output with cheerio
 *   - Strip nav, footer, scripts, demo islands (replace with placeholder)
 *   - Split by <section id> · one chapter per section
 *   - Emit EPUB 3 structure (zipped)
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import JSZip from "jszip";
import * as cheerio from "cheerio";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = path.join(ROOT, "_site");
const PT_HTML = path.join(SITE, "pt-PT", "index.html");
const COVER = path.join(SITE, "cover.png");
const OUT = path.join(SITE, "ia-na-saude.epub");

const SECTION_IDS = [
  "abertura", "historia", "aprendizagem", "tokens", "treino", "funciona",
  "prompts", "alucinacoes", "vieses", "rag", "agentes", "privacidade",
  "quando", "aprofundar",
];

const SECTION_LABELS = {
  abertura: "Abertura",
  historia: "História",
  aprendizagem: "Como aprende uma máquina",
  tokens: "Tokens",
  treino: "Como nasce um LLM",
  funciona: "Como funciona um LLM",
  prompts: "Engenharia de prompt",
  alucinacoes: "Alucinações",
  vieses: "Vieses",
  rag: "RAG",
  agentes: "Agentes",
  privacidade: "Privacidade e RGPD",
  quando: "Quando usar",
  aprofundar: "Onde continuar",
};

const SITE_URL = "https://tiagojct.github.io/ia-na-saude/";

let html;
try {
  html = await fs.readFile(PT_HTML, "utf8");
} catch {
  console.error("_site/pt-PT/index.html not found. Run npm run build first.");
  process.exit(1);
}

let coverBuf;
try {
  coverBuf = await fs.readFile(COVER);
} catch {
  console.warn("_site/cover.png not found · ePub will lack a cover.");
}

const $ = cheerio.load(html);

$("nav.fixed, footer, #read-progress, #toc-drawer, #cmdk-palette, .skip-link, script, link, meta, style[data-vite-dev-id]").remove();
$("[id=toc-toggle], [id=print-btn]").remove();

$(".demo-frame").each((_, el) => {
  const $el = $(el);
  const label = $el.find(".text-sm.font-bold").first().text().trim() || "demo interactivo";
  const preview = $el.find(".text-sm.leading-relaxed.text-slate-500").first().text().trim();
  const notice = $el.find(".bg-amber-50\\/50, .bg-amber-50\\/40").text().trim();
  const note = `
    <aside class="demo-placeholder">
      <p class="demo-label">demo interactivo · ${escapeHtml(label)}</p>
      ${preview ? `<p class="demo-preview">${escapeHtml(preview)}</p>` : ""}
      ${notice ? `<p class="demo-notice">o que reparar — ${escapeHtml(notice)}</p>` : ""}
      <p class="demo-link">→ abrir versão online: <a href="${SITE_URL}pt-PT/">${SITE_URL}pt-PT/</a></p>
    </aside>
  `;
  $el.replaceWith(note);
});

$("script").remove();

$("*").each((_, el) => {
  if (el.type !== "tag") return;
  $(el).removeAttr("class");
  for (const a of Object.keys(el.attribs ?? {})) {
    if (a.startsWith("data-") || a === "style" || a === "tabindex") {
      $(el).removeAttr(a);
    }
  }
});

const chapters = [];
for (const id of SECTION_IDS) {
  const el = $(`#${id}`);
  if (!el.length) continue;
  let body = el.html() || "";
  body = body.replace(/<button[^>]*>.*?<\/button>/gs, "");
  body = body.replace(/<details[^>]*>.*?<\/details>/gs, (block) => {
    const $det = cheerio.load("<div>" + block + "</div>");
    const text = $det.root().text().trim();
    return `<aside class="pause">${escapeHtml(text)}</aside>`;
  });
  const title = SECTION_LABELS[id] || id;
  chapters.push({ id, title, body });
}

const zip = new JSZip();
const bookId = "urn:uuid:" + randomUUID();
const now = new Date().toISOString().slice(0, 19) + "Z";

zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

zip.file(
  "META-INF/container.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>
`,
);

zip.file(
  "OEBPS/styles.css",
  `
@charset "utf-8";
body { font-family: serif; line-height: 1.6; max-width: 38em; margin: 1em auto; color: #1e293b; padding: 0 1.2em; }
h1, h2, h3, h4 { font-family: sans-serif; color: #0f172a; line-height: 1.25; }
h1 { font-size: 1.8em; margin-top: 1.5em; }
h2 { font-size: 1.4em; margin-top: 2em; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.3em; }
h3 { font-size: 1.1em; margin-top: 1.5em; }
p { margin: 0.8em 0; }
em { font-style: italic; }
strong { font-weight: 700; }
a { color: #2563eb; text-decoration: underline; }
ul, ol { padding-left: 1.5em; }
li { margin: 0.3em 0; }
blockquote { margin: 1em 1.5em; padding-left: 1em; border-left: 3px solid #2563eb; color: #475569; font-style: italic; }
code { background: #fce7f3; color: #be185d; padding: 0.1em 0.3em; border-radius: 3px; font-family: monospace; font-size: 0.92em; }
pre { background: #f8fafc; padding: 0.8em; overflow-x: auto; border-radius: 6px; font-size: 0.85em; }
table { border-collapse: collapse; margin: 1em 0; font-size: 0.92em; }
th, td { padding: 0.45em 0.7em; border: 1px solid #cbd5e1; text-align: left; }
th { background: #f8fafc; }
aside { margin: 1em 0; padding: 0.8em 1em; border-left: 4px solid #94a3b8; background: #f8fafc; font-size: 0.92em; }
aside.demo-placeholder { border-left-color: #2563eb; background: #eff6ff; }
aside.demo-placeholder .demo-label { font-weight: 700; color: #1d4ed8; margin: 0 0 0.3em; text-transform: uppercase; font-size: 0.8em; letter-spacing: 0.05em; }
aside.demo-placeholder .demo-preview { margin: 0.3em 0; color: #334155; }
aside.demo-placeholder .demo-notice { margin: 0.3em 0; color: #92400e; font-style: italic; }
aside.demo-placeholder .demo-link { margin: 0.5em 0 0; font-size: 0.85em; }
aside.pause { border-left-color: #7c3aed; background: #faf5ff; }
img { max-width: 100%; height: auto; }
hr { border: none; border-top: 1px solid #cbd5e1; margin: 2em 0; }
.cover { text-align: center; margin: 0; padding: 0; }
.cover img { width: 100%; height: auto; max-height: 100vh; }
`,
);

zip.file(
  "OEBPS/cover.xhtml",
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-PT">
<head>
  <meta charset="utf-8"/>
  <title>Capa</title>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body epub:type="cover">
  <div class="cover">
    ${coverBuf ? `<img src="cover.png" alt="IA na Saúde · Inteligência artificial para profissionais de saúde"/>` : `<h1>IA na Saúde</h1>`}
  </div>
</body>
</html>
`,
);

if (coverBuf) {
  zip.file("OEBPS/cover.png", coverBuf);
}

for (const ch of chapters) {
  zip.file(
    `OEBPS/ch-${ch.id}.xhtml`,
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-PT">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(ch.title)}</title>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>
  <h1 id="${ch.id}">${escapeHtml(ch.title)}</h1>
  ${ch.body}
</body>
</html>
`,
  );
}

const navLis = chapters
  .map((ch) => `    <li><a href="ch-${ch.id}.xhtml">${escapeHtml(ch.title)}</a></li>`)
  .join("\n");

zip.file(
  "OEBPS/nav.xhtml",
  `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="pt-PT">
<head>
  <meta charset="utf-8"/>
  <title>Índice</title>
  <link rel="stylesheet" href="styles.css"/>
</head>
<body>
  <h1>Índice</h1>
  <nav epub:type="toc" id="toc">
    <ol>
${navLis}
    </ol>
  </nav>
</body>
</html>
`,
);

const ncxNav = chapters
  .map(
    (ch, i) => `    <navPoint id="np-${ch.id}" playOrder="${i + 2}">
      <navLabel><text>${escapeHtml(ch.title)}</text></navLabel>
      <content src="ch-${ch.id}.xhtml"/>
    </navPoint>`,
  )
  .join("\n");

zip.file(
  "OEBPS/toc.ncx",
  `<?xml version="1.0" encoding="UTF-8"?>
<ncx version="2005-1" xmlns="http://www.daisy.org/z3986/2005/ncx/">
  <head>
    <meta name="dtb:uid" content="${bookId}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>IA na Saúde</text></docTitle>
  <navMap>
    <navPoint id="np-cover" playOrder="1">
      <navLabel><text>Capa</text></navLabel>
      <content src="cover.xhtml"/>
    </navPoint>
${ncxNav}
  </navMap>
</ncx>
`,
);

const manifestItems = [
  `    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
  `    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
  `    <item id="css" href="styles.css" media-type="text/css"/>`,
  `    <item id="cover-page" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
  coverBuf
    ? `    <item id="cover-img" href="cover.png" media-type="image/png" properties="cover-image"/>`
    : "",
  ...chapters.map(
    (ch) =>
      `    <item id="ch-${ch.id}" href="ch-${ch.id}.xhtml" media-type="application/xhtml+xml"/>`,
  ),
].filter(Boolean).join("\n");

const spineItems = [
  `    <itemref idref="cover-page" linear="yes"/>`,
  `    <itemref idref="nav" linear="yes"/>`,
  ...chapters.map((ch) => `    <itemref idref="ch-${ch.id}" linear="yes"/>`),
].join("\n");

zip.file(
  "OEBPS/content.opf",
  `<?xml version="1.0" encoding="UTF-8"?>
<package version="3.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" xml:lang="pt-PT">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${bookId}</dc:identifier>
    <dc:title>IA na Saúde · Inteligência Artificial para Profissionais de Saúde</dc:title>
    <dc:creator>Tiago Jacinto</dc:creator>
    <dc:language>pt-PT</dc:language>
    <dc:date>${now.slice(0, 10)}</dc:date>
    <dc:rights>CC-BY-4.0</dc:rights>
    <dc:description>Curso aberto · 14 secções · 34 demos interactivos (versão offline · demos com placeholder + link).</dc:description>
    <dc:publisher>Tiago Jacinto · tiagojct.eu</dc:publisher>
    <dc:subject>Artificial Intelligence</dc:subject>
    <dc:subject>Healthcare</dc:subject>
    <dc:subject>Medical Education</dc:subject>
    <meta property="dcterms:modified">${now}</meta>
    ${coverBuf ? `<meta name="cover" content="cover-img"/>` : ""}
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
  </spine>
</package>
`,
);

const buffer = await zip.generateAsync({
  type: "nodebuffer",
  compression: "DEFLATE",
  compressionOptions: { level: 9 },
  mimeType: "application/epub+zip",
});

await fs.writeFile(OUT, buffer);
console.log(
  `✓ ${path.relative(ROOT, OUT)} · ${(buffer.length / 1024).toFixed(0)} KB · ${chapters.length} chapters`,
);

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
