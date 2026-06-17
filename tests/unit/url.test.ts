import { describe, it, expect } from "vitest";

// Replicate the production p() logic with explicit base to avoid the
// runtime dependence on window.__IA_BASE__.
function pWith(base: string, path: string): string {
  const b = base || "/";
  const stripped = path.startsWith("/") ? path.slice(1) : path;
  return b + stripped;
}

describe("p() helper (algorithm)", () => {
  it("prefixes with base", () => {
    expect(pWith("/ia-na-saude/", "pt-PT/")).toBe("/ia-na-saude/pt-PT/");
  });

  it("strips leading slash before concatenation", () => {
    expect(pWith("/ia-na-saude/", "/pt-PT/")).toBe("/ia-na-saude/pt-PT/");
  });

  it("empty string returns just base", () => {
    expect(pWith("/ia-na-saude/", "")).toBe("/ia-na-saude/");
  });

  it("preserves hash fragments", () => {
    expect(pWith("/ia-na-saude/", "pt-PT/#historia")).toBe(
      "/ia-na-saude/pt-PT/#historia",
    );
  });

  it("works with root base", () => {
    expect(pWith("/", "pt-PT/")).toBe("/pt-PT/");
  });

  it("falsy base falls back to /", () => {
    expect(pWith("", "pt-PT/")).toBe("/pt-PT/");
  });
});
