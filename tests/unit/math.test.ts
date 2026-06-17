import { describe, it, expect } from "vitest";
import {
  softmax,
  bayes,
  confusionStats,
  leitnerNext,
  LEITNER_INTERVALS_MS,
} from "../../src/lib/math";

describe("softmax", () => {
  it("returns empty for empty input", () => {
    expect(softmax([])).toEqual([]);
  });

  it("sums to ~1", () => {
    const p = softmax([1, 2, 3, 4]);
    const sum = p.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
  });

  it("preserves rank order", () => {
    const p = softmax([1, 3, 2]);
    expect(p[1]).toBeGreaterThan(p[2]);
    expect(p[2]).toBeGreaterThan(p[0]);
  });

  it("low temperature spikes top probability", () => {
    const cold = softmax([1, 2, 3], 0.1);
    const warm = softmax([1, 2, 3], 1.0);
    expect(cold[2]).toBeGreaterThan(warm[2]);
  });

  it("high temperature flattens", () => {
    const hot = softmax([1, 2, 3], 10);
    const range = Math.max(...hot) - Math.min(...hot);
    expect(range).toBeLessThan(0.1);
  });

  it("numerically stable with large logits", () => {
    const p = softmax([1000, 1001, 1002]);
    const sum = p.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 6);
    expect(p.every((x) => Number.isFinite(x))).toBe(true);
  });
});

describe("bayes", () => {
  it("perfect test: positive → 100%, negative → 0%", () => {
    const r = bayes(0.5, 1, 1);
    expect(r.postPos).toBeCloseTo(1, 6);
    expect(r.postNeg).toBeCloseTo(0, 6);
  });

  it("useless test (sens=spec=0.5): post = pre", () => {
    const r = bayes(0.3, 0.5, 0.5);
    expect(r.postPos).toBeCloseTo(0.3, 6);
    expect(r.postNeg).toBeCloseTo(0.3, 6);
  });

  it("low prevalence + good test: positive still leaves doubt", () => {
    // pretest 1%, sens 95%, spec 95% → LR+ = 19, post-positive ≈ 16%
    const r = bayes(0.01, 0.95, 0.95);
    expect(r.postPos).toBeGreaterThan(0.1);
    expect(r.postPos).toBeLessThan(0.25);
  });

  it("high pretest + negative test: still substantial risk", () => {
    // pretest 80%, sens 90%, spec 90% → LR− = 0.11, post-neg ≈ 31%
    const r = bayes(0.8, 0.9, 0.9);
    expect(r.postNeg).toBeGreaterThan(0.2);
    expect(r.postNeg).toBeLessThan(0.4);
  });

  it("LR+ correct for sens=0.9 spec=0.9", () => {
    const r = bayes(0.5, 0.9, 0.9);
    expect(r.lrPos).toBeCloseTo(9, 6);
    expect(r.lrNeg).toBeCloseTo(0.111, 2);
  });
});

describe("confusionStats", () => {
  it("classic 2x2 example", () => {
    // 90 TP, 10 FN, 5 FP, 95 TN → sens 0.9, spec 0.95, ppv 0.947, npv 0.905
    const r = confusionStats(90, 10, 5, 95);
    expect(r.sensitivity).toBeCloseTo(0.9, 6);
    expect(r.specificity).toBeCloseTo(0.95, 6);
    expect(r.ppv).toBeCloseTo(90 / 95, 6);
    expect(r.npv).toBeCloseTo(95 / 105, 6);
  });

  it("zero denominators safe", () => {
    const r = confusionStats(0, 0, 0, 0);
    expect(r.sensitivity).toBe(0);
    expect(r.specificity).toBe(0);
    expect(r.ppv).toBe(0);
    expect(r.npv).toBe(0);
  });
});

describe("leitner", () => {
  it("known: box advances + due in next interval", () => {
    const now = 1000;
    const r = leitnerNext(0, true, now);
    expect(r.box).toBe(1);
    expect(r.dueAt).toBe(now + LEITNER_INTERVALS_MS[1]);
  });

  it("unknown: box regresses, never below 0", () => {
    expect(leitnerNext(0, false, 0).box).toBe(0);
    expect(leitnerNext(3, false, 0).box).toBe(2);
  });

  it("known at box 5 stays at 5 with 30d due", () => {
    const r = leitnerNext(5, true, 0);
    expect(r.box).toBe(5);
    expect(r.dueAt).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("intervals are monotonically increasing", () => {
    for (let i = 1; i < LEITNER_INTERVALS_MS.length; i++) {
      expect(LEITNER_INTERVALS_MS[i]).toBeGreaterThan(LEITNER_INTERVALS_MS[i - 1]);
    }
  });
});
