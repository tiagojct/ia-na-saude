/**
 * Test helper: prepend GH Pages base path to goto/request URLs.
 *
 * Playwright's baseURL interacts oddly with leading-slash paths (they
 * reset to origin). We bypass by exposing `b("/pt-PT/")` →
 * "/ia-na-saude/pt-PT/".
 */

export const BASE = process.env.PLAYWRIGHT_BASE_PATH ?? "";

export function b(path: string): string {
  if (!path.startsWith("/")) path = "/" + path;
  return BASE + path;
}
