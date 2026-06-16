/**
 * IaElement · base class for every IA · Saúde demo Web Component.
 *
 * Conventions:
 *   - Light DOM rendering so global Tailwind utilities + .lecture-prose
 *     work as they did in the Astro/React source. Trade-off: no style
 *     encapsulation. Demos rely on Tailwind classes and global CSS vars.
 *   - prefers-reduced-motion is honoured by every animation/timer demo.
 *   - Each demo registers itself: `customElements.define("tag", Class)`.
 *
 * Subclasses should:
 *   - Override `render()` returning Lit's html`` template
 *   - Use `@property()` for declarative reactive properties (string,
 *     number, boolean, object, array)
 *   - Use `useStoredState` / `useUrlState` for persistence
 */

import { LitElement } from "lit";

export class IaElement extends LitElement {
  /** Render to light DOM so global Tailwind utilities apply. */
  protected createRenderRoot() {
    return this;
  }
}

/** Respect prefers-reduced-motion. Defaults to reduced when unknown. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { html, css, nothing } from "lit";
