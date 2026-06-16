/**
 * Respect prefers-reduced-motion. Returns true when user has reduced-motion set
 * (or media query unavailable, e.g. SSR).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
