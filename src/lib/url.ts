/**
 * Component-side · prefix a path with the configured base.
 *
 * In Astro this read `import.meta.env.BASE_URL`. In 11ty the base is
 * injected at build time into `window.__IA_BASE__` via the base.njk
 * inline bootstrap, so components can read it without bundler magic.
 *
 * Usage in a Web Component:
 *   const href = p("pt-PT/quiz/");
 */
export function p(path: string): string {
  let base = "/";
  if (typeof window !== "undefined") {
    const w = window as unknown as { __IA_BASE__?: string };
    if (w.__IA_BASE__) base = w.__IA_BASE__;
  }
  if (!base.endsWith("/")) base = base + "/";
  const stripped = path.startsWith("/") ? path.slice(1) : path;
  return base + stripped;
}
