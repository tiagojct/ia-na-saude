import { describe, expect, it } from "vitest";
import { PRESETS, tokenize } from "../../src/components/tokenizer-demo";

describe("tokenizer demo heuristic", () => {
  it("Maria preset shows pt-PT overhead over the English equivalent", () => {
    const preset = PRESETS.find((p) => p.label === "nota da Maria");
    expect(preset).toBeTruthy();
    if (!preset) return;

    const pt = tokenize(preset.pt, false);
    const en = tokenize(preset.en, true);
    const overheadPct = Math.round((pt.length / en.length - 1) * 100);

    expect(pt.length).toBeGreaterThan(en.length);
    expect(overheadPct).toBeGreaterThanOrEqual(20);
  });

  it("keeps punctuation as visible token chips", () => {
    expect(tokenize("HbA1c 9,1 %.", false)).toContain("%");
  });
});
