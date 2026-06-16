/**
 * State helpers for IA · Saúde Web Components.
 *
 * `useUrlState(prefix, key, value)` — mirror a single reactive property to
 * a URL search-param namespaced by the demo's prefix. Replaces the React
 * `useDemoState` hook with imperative get/set used inside Lit
 * lifecycle/event handlers.
 *
 * `useStoredState(key, initial)` — localStorage-backed get/set. Persists
 * across reloads and tabs (storage event listener wires cross-tab sync).
 *
 * `buildShareURL(anchor)` — current URL with a section anchor appended.
 * Used by per-demo "copy link" buttons.
 */

type Primitive = string | number | boolean | null;

function encodeValue(v: Primitive): string {
  if (v === null) return "";
  if (typeof v === "boolean") return v ? "1" : "0";
  return String(v);
}

function decodeValue(raw: string, fallback: Primitive): Primitive {
  if (raw === "") return fallback;
  if (typeof fallback === "boolean") return raw === "1" || raw === "true";
  if (typeof fallback === "number") {
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  return raw;
}

/** Read a URL param namespaced as `${prefix}.${key}`. */
export function readUrlParam(
  prefix: string,
  key: string,
  fallback: Primitive,
): Primitive {
  if (typeof window === "undefined") return fallback;
  const sp = new URLSearchParams(window.location.search);
  const raw = sp.get(`${prefix}.${key}`);
  return raw === null ? fallback : decodeValue(raw, fallback);
}

/** Write/delete a URL param namespaced as `${prefix}.${key}`. */
export function writeUrlParam(prefix: string, key: string, value: Primitive) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const full = `${prefix}.${key}`;
  if (value === null || value === undefined || value === "") {
    url.searchParams.delete(full);
  } else {
    url.searchParams.set(full, encodeValue(value));
  }
  history.replaceState(null, "", url.toString());
}

/** Read a localStorage value with a typed fallback. */
export function readStored<T>(key: string, fallback: T): T {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Write a localStorage value (JSON-serialised). */
export function writeStored<T>(key: string, value: T): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota, sandboxed iframe, etc. */
  }
}

/** Build a shareable URL with a section anchor appended. */
export function buildShareURL(sectionAnchor: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.hash = sectionAnchor;
  return url.toString();
}
