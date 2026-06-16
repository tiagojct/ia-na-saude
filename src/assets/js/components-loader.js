/* IA · Saúde · components-loader
 *
 * Lazy-registers Web Components as they enter the viewport.
 *
 * Strategy:
 *   1. Fetch /assets/components/manifest.json once.
 *   2. Scan the DOM for unknown custom elements (any tag containing "-").
 *   3. For each unknown tag found in the manifest, set up an
 *      IntersectionObserver. When the first instance comes within
 *      300 px of the viewport, dynamic-import its bundle. The bundle's
 *      side-effect call to customElements.define() upgrades all
 *      pre-rendered instances of that tag automatically.
 *
 * Non-goals:
 *   - This loader does not poll for new tags appended after load. Demos
 *     in the lecture are server-rendered as static HTML; dynamic insertion
 *     is not part of the flow.
 */
(() => {
  "use strict";

  const BASE = (typeof window !== "undefined" && window.__IA_BASE__) || "/";
  const MANIFEST_URL = BASE.replace(/\/$/, "") + "/assets/components/manifest.json";

  function uniqueCustomTagsInDOM() {
    const seen = new Set();
    const all = document.querySelectorAll("*");
    for (const el of all) {
      const tag = el.tagName.toLowerCase();
      if (tag.indexOf("-") !== -1 && !customElements.get(tag)) {
        seen.add(tag);
      }
    }
    return Array.from(seen);
  }

  async function init() {
    let manifest;
    try {
      const res = await fetch(MANIFEST_URL);
      if (!res.ok) throw new Error("manifest fetch " + res.status);
      manifest = await res.json();
    } catch (e) {
      console.warn("[ia-components] manifest unavailable:", e);
      return;
    }

    const tags = uniqueCustomTagsInDOM();
    if (tags.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const tag = entry.target.tagName.toLowerCase();
          observer.unobserve(entry.target);
          const path = manifest[tag];
          if (!path) continue;
          const url = BASE.replace(/\/$/, "") + "/" + path.replace(/^\//, "");
          import(/* @vite-ignore */ url).catch((err) =>
            console.warn("[ia-components] load " + tag + " failed:", err),
          );
        }
      },
      { rootMargin: "300px 0px" },
    );

    for (const tag of tags) {
      if (!manifest[tag]) continue;
      const instances = document.querySelectorAll(tag);
      // Observe only one (the first) so we issue one import per tag.
      const first = instances[0];
      if (first) observer.observe(first);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
