/**
 * Pure math helpers used by the interactive demos.
 * Extracted so they can be unit-tested without React.
 */

/**
 * Numerically stable softmax with temperature.
 *
 * @param logits  Unnormalised scores
 * @param T       Temperature (T > 0). Lower → spikier. T=1 is plain softmax.
 * @returns       Probabilities summing to ≈ 1.
 */
export function softmax(logits: number[], T = 1): number[] {
  if (logits.length === 0) return [];
  const t = Math.max(T, 0.01);
  const scaled = logits.map((l) => l / t);
  const m = Math.max(...scaled);
  const exp = scaled.map((x) => Math.exp(x - m));
  const sum = exp.reduce((a, b) => a + b, 0);
  return exp.map((e) => e / sum);
}

/**
 * Bayesian post-test probability via likelihood ratios.
 *
 * @param pretest  Pre-test probability (0..1)
 * @param sens     Sensitivity (0..1)
 * @param spec     Specificity (0..1)
 * @returns        { lrPos, lrNeg, postPos, postNeg }
 */
export function bayes(pretest: number, sens: number, spec: number) {
  const lrPos = sens / Math.max(1 - spec, 1e-9);
  const lrNeg = (1 - sens) / Math.max(spec, 1e-9);
  const preOdds = pretest / Math.max(1 - pretest, 1e-9);
  const postOddsPos = preOdds * lrPos;
  const postOddsNeg = preOdds * lrNeg;
  return {
    lrPos,
    lrNeg,
    postPos: postOddsPos / (1 + postOddsPos),
    postNeg: postOddsNeg / (1 + postOddsNeg),
  };
}

/**
 * Sensitivity / specificity / PPV / NPV from a 2×2 confusion matrix.
 */
export function confusionStats(tp: number, fn: number, fp: number, tn: number) {
  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0);
  return {
    sensitivity: safeDiv(tp, tp + fn),
    specificity: safeDiv(tn, tn + fp),
    ppv: safeDiv(tp, tp + fp),
    npv: safeDiv(tn, tn + fn),
  };
}

/**
 * Leitner spaced-repetition intervals in milliseconds.
 * Index = box number (0..4). Box 5 = "mastered", interval handled separately.
 */
export const LEITNER_INTERVALS_MS = [
  4 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
];

/**
 * Compute next box + dueAt timestamp from a Leitner rating.
 */
export function leitnerNext(
  currentBox: number,
  known: boolean,
  now: number = Date.now(),
): { box: number; dueAt: number } {
  const nextBox = known ? Math.min(currentBox + 1, 5) : Math.max(currentBox - 1, 0);
  const dueAt =
    nextBox < LEITNER_INTERVALS_MS.length
      ? now + LEITNER_INTERVALS_MS[nextBox]
      : now + 30 * 24 * 60 * 60 * 1000;
  return { box: nextBox, dueAt };
}
