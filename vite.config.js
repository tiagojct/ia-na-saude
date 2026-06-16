/**
 * Vite config · component bundles.
 *
 * Each `src/components/*.ts` (skipping `_*.ts` private helpers) is one
 * entry point and gets bundled into `_site/assets/components/<name>.js`
 * as an ES module. Shared code (lit, base, state) goes into a single
 * `_shared-<hash>.js` chunk that browsers cache once per visit.
 *
 * The components-loader.js reads `assets/components/manifest.json` to
 * map element names to bundle paths, then dynamically imports them as
 * elements enter the viewport.
 */

import { defineConfig } from "vite";
import { readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, basename } from "node:path";

const COMPONENTS_DIR = resolve("src/components");
const OUT_DIR = resolve("_site/assets/components");

function discoverEntries() {
  const files = readdirSync(COMPONENTS_DIR)
    .filter((f) => f.endsWith(".ts") && !f.startsWith("_"));
  /** @type {Record<string, string>} */
  const map = {};
  for (const f of files) {
    const name = basename(f, ".ts");
    map[name] = resolve(COMPONENTS_DIR, f);
  }
  return map;
}

export default defineConfig({
  build: {
    target: "es2020",
    outDir: OUT_DIR,
    emptyOutDir: true,
    sourcemap: false,
    minify: "esbuild",
    cssCodeSplit: false,
    lib: false,
    rollupOptions: {
      input: discoverEntries(),
      output: {
        format: "es",
        entryFileNames: "[name].js",
        chunkFileNames: "_shared-[hash].js",
        manualChunks(id) {
          if (id.includes("node_modules") || id.includes("/components/_")) {
            return "_shared";
          }
        },
      },
    },
  },
  // Write a manifest at the end of the build so components-loader can
  // map `<tokenizer-demo>` → `assets/components/tokenizer-demo.js`.
  plugins: [
    {
      name: "ia-component-manifest",
      writeBundle(_options, bundle) {
        if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
        /** @type {Record<string, string>} */
        const manifest = {};
        for (const key of Object.keys(bundle)) {
          const chunk = bundle[key];
          if (chunk.type !== "chunk" || !chunk.isEntry) continue;
          const name = chunk.name;
          manifest[name] = `assets/components/${chunk.fileName}`;
        }
        writeFileSync(
          resolve(OUT_DIR, "manifest.json"),
          JSON.stringify(manifest, null, 2),
        );
      },
    },
  ],
});
