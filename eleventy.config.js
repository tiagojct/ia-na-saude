// @ts-check
/**
 * Eleventy v3 config for IA · Saúde.
 *
 * Conventions:
 *   - Source: src/
 *   - Includes: src/_includes/
 *   - Data: src/_data/
 *   - Output: _site/
 *   - Templating: Nunjucks for HTML + Markdown body engine = Nunjucks (so
 *     shortcodes work inside .md too).
 *
 * Pages live under src/content/. Per-section Markdown collections under
 * src/content/pt-PT/sections/ get pulled into the lecture page via
 * `collections.sections` sorted by frontmatter `num`.
 *
 * Shortcodes (server-side, render-time):
 *   - {% p "path" %}                → BASE prefixed URL
 *   - {% section id, num, ... %}    → opens <section> + header + QR
 *   - {% endsection %}              → closes </section>
 *   - {% demo "name" %}             → <demo-name></demo-name> custom element
 *
 * Async filters:
 *   - "qr" | qr  → SVG QR code string (cached)
 */

import qrcode from "qrcode";

const BASE = process.env.BASE ?? "/ia-na-saude/";
const SITE = process.env.SITE ?? "https://tiagojct.github.io";

// Strip trailing slash for joining
function joinUrl(base, path) {
  if (!path) return base;
  const b = base.endsWith("/") ? base.slice(0, -1) : base;
  const p = path.startsWith("/") ? path : "/" + path;
  return b + p;
}

// Async QR code cache
const qrCache = new Map();
async function generateQr(url) {
  if (qrCache.has(url)) return qrCache.get(url);
  const svg = await qrcode.toString(url, {
    type: "svg",
    margin: 0,
    width: 72,
    errorCorrectionLevel: "M",
    color: { dark: "#0f172a", light: "#ffffff" },
  });
  qrCache.set(url, svg);
  return svg;
}

export default function (eleventyConfig) {
  // Directory layout
  eleventyConfig.setInputDirectory("src");
  eleventyConfig.setIncludesDirectory("_includes");
  eleventyConfig.setDataDirectory("_data");
  eleventyConfig.setOutputDirectory("_site");

  // Process Markdown bodies through Nunjucks (so shortcodes work inside .md)
  eleventyConfig.setTemplateFormats(["njk", "md", "html"]);

  // Passthrough copy: public assets keep their relative paths
  eleventyConfig.addPassthroughCopy({ "src/public": "/" });
  eleventyConfig.addPassthroughCopy({
    "src/assets/fonts": "assets/fonts",
  });
  eleventyConfig.addPassthroughCopy({
    "src/assets/js": "assets/js",
  });

  // ---- Shortcodes ----------------------------------------------------------

  eleventyConfig.addShortcode("p", (path) => joinUrl(BASE, path));

  eleventyConfig.addShortcode("base", () => BASE);

  // {% section "id", "num / title", "5 min", "lead", "idea" %}
  eleventyConfig.addPairedShortcode(
    "section",
    function (content, id, num, title, time, lead, idea) {
      return `<section id="${id}" data-section data-num="${num ?? ""}" class="border-t border-slate-100 py-14 sm:py-16">
  <header class="mb-8">
    <div class="mb-3 flex flex-wrap items-baseline gap-2">
      <span class="section-num">${num ?? ""}</span>
      ${time ? `<span class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">~${time}</span>` : ""}
    </div>
    <div class="mb-4 flex items-baseline gap-3">
      <h2 class="text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl" style="letter-spacing:-0.025em;">
        <a href="#${id}" class="group relative no-underline" aria-label="link directo · ${title}">
          ${title}
          <span aria-hidden="true" class="ml-2 align-middle text-base text-slate-300 opacity-0 transition-opacity group-hover:opacity-100">#</span>
        </a>
      </h2>
      <button type="button" class="section-share rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-500" data-section-id="${id}" data-section-title="${title}" aria-label="copiar link · ${title}" title="copiar link">
        <span>copiar link</span>
      </button>
    </div>
    ${lead ? `<p class="max-w-[68ch] text-lg leading-relaxed text-slate-600">${lead}</p>` : ""}
    ${idea ? `<aside class="mt-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-4"><div class="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">30 segundos · a ideia central</div><p class="text-base font-medium leading-relaxed text-slate-800">${idea}</p></aside>` : ""}
  </header>
  <div class="lecture-prose">
${content}
  </div>
</section>`;
    },
  );

  // {% demo "tokenizer-demo" %} → <tokenizer-demo></tokenizer-demo>
  // {% demo "tokenizer-demo", { foo: 'bar' } %} → attributes
  eleventyConfig.addShortcode("demo", (name, attrs) => {
    const attrStr = attrs
      ? Object.entries(attrs)
          .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, "&quot;")}"`)
          .join("")
      : "";
    return `<${name}${attrStr}></${name}>`;
  });

  // ---- Filters -------------------------------------------------------------

  eleventyConfig.addAsyncFilter("qr", async (url) => {
    return await generateQr(url);
  });

  // ---- Collections ---------------------------------------------------------

  // Lecture sections collection · sorted by frontmatter `num` numeric.
  eleventyConfig.addCollection("sections", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/content/pt-PT/sections/*.md")
      .sort((a, b) => {
        const an = parseInt(a.data.num ?? "0", 10);
        const bn = parseInt(b.data.num ?? "0", 10);
        return an - bn;
      });
  });

  return {
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    pathPrefix: BASE,
  };
}

export { BASE, SITE };
