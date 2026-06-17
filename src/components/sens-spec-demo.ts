/**
 * <sens-spec-demo> · Quando usar · histograma + slider de limiar.
 *
 * Gera 200 pontos sintéticos (80 doentes, 120 saudáveis). Slider move
 * limiar; matriz 2×2 + sens/spec/VPP/VPN actualizam em tempo real.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam, buildShareURL } from "./_state";
import { confusionStats } from "../lib/math";

interface Point {
  score: number;
  disease: boolean;
}

function gaussian(mean: number, std: number, seed: number): number {
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const u1 = rand();
  const u2 = rand();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

function generateData(): Point[] {
  const points: Point[] = [];
  let seed = 1234;
  for (let i = 0; i < 80; i++) {
    const score = Math.max(0, Math.min(1, gaussian(0.65, 0.16, seed)));
    seed = Math.floor(score * 1e7);
    points.push({ score, disease: true });
  }
  for (let i = 0; i < 120; i++) {
    const score = Math.max(0, Math.min(1, gaussian(0.35, 0.16, seed)));
    seed = Math.floor(score * 1e7);
    points.push({ score, disease: false });
  }
  return points;
}

const DATA = generateData();

const BINS = 20;
const HISTOGRAM = (() => {
  const bins: { mid: number; disease: number; healthy: number }[] = [];
  for (let b = 0; b < BINS; b++) {
    const lo = b / BINS;
    const hi = (b + 1) / BINS;
    const mid = (lo + hi) / 2;
    let d = 0;
    let h = 0;
    for (const p of DATA) {
      if (p.score >= lo && p.score < hi) {
        if (p.disease) d++;
        else h++;
      }
    }
    bins.push({ mid, disease: d, healthy: h });
  }
  return bins;
})();
const MAX_COUNT = Math.max(...HISTOGRAM.flatMap((b) => [b.disease, b.healthy]));

export class SensSpecDemo extends IaElement {
  static readonly PREFIX = "ss";

  @property({ type: Number }) threshold = 0.5;
  @property({ type: Boolean, state: true }) copied = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.threshold = readUrlParam(SensSpecDemo.PREFIX, "t", 0.5) as number;
  }

  private setThreshold = (e: Event) => {
    const v = parseFloat((e.target as HTMLInputElement).value);
    this.threshold = v;
    writeUrlParam(SensSpecDemo.PREFIX, "t", v);
  };

  private shareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareURL("quando"));
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* ignored */
    }
  };

  private computeStats() {
    let TP = 0, FN = 0, FP = 0, TN = 0;
    for (const p of DATA) {
      const predicted = p.score >= this.threshold;
      if (p.disease && predicted) TP++;
      else if (p.disease && !predicted) FN++;
      else if (!p.disease && predicted) FP++;
      else TN++;
    }
    const { sensitivity, specificity, ppv, npv } = confusionStats(
      TP, FN, FP, TN,
    );
    return { TP, FN, FP, TN, sens: sensitivity, spec: specificity, ppv, npv };
  }

  protected render() {
    const s = this.computeStats();

    return html`
      <div>
        <p class="mb-4 text-sm leading-relaxed text-slate-600">
          Modelo a prever doença coronária a partir de um biomarcador.
          <strong>200 doentes</strong> na população:
          <strong class="text-red-600">80 doentes</strong>,
          <strong class="text-green-700">120 saudáveis</strong>. Onde colocas
          o limiar?
        </p>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 400 180" class="h-auto w-full">
            ${HISTOGRAM.map((b, i) => {
              const x = (i / BINS) * 380 + 10;
              const w = 380 / BINS - 2;
              const diseaseH = (b.disease / MAX_COUNT) * 80;
              const healthyH = (b.healthy / MAX_COUNT) * 80;
              const above = b.mid >= this.threshold;
              return html`<g>
                <rect
                  x=${x}
                  y=${80 - healthyH}
                  width=${w}
                  height=${healthyH}
                  fill=${above ? "#fca5a5" : "#86efac"}
                  opacity=${above ? 0.85 : 1}
                ></rect>
                <rect
                  x=${x}
                  y=${90}
                  width=${w}
                  height=${diseaseH}
                  fill=${above ? "#dc2626" : "#fca5a5"}
                  opacity=${above ? 1 : 0.5}
                ></rect>
              </g>`;
            })}
            <line
              x1=${10 + this.threshold * 380}
              y1="5"
              x2=${10 + this.threshold * 380}
              y2="175"
              stroke="#2563eb"
              stroke-width="2"
              stroke-dasharray="4,2"
            ></line>
            <text
              x=${10 + this.threshold * 380}
              y="3"
              text-anchor="middle"
              font-size="9"
              font-weight="700"
              fill="#1d4ed8"
            >
              limiar ${this.threshold.toFixed(2)}
            </text>
            <text x="5" y="40" font-size="9" fill="#16a34a">saudáveis</text>
            <text x="5" y="130" font-size="9" fill="#dc2626">doentes</text>
            <line
              x1="10"
              y1="85"
              x2="390"
              y2="85"
              stroke="#cbd5e1"
              stroke-width="0.5"
            ></line>
          </svg>
        </div>

        <div class="mt-4">
          <label class="mb-2 flex items-baseline justify-between">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
              >limiar de diagnóstico</span
            >
            <span class="font-mono text-sm font-bold text-blue-700"
              >${this.threshold.toFixed(2)}</span
            >
          </label>
          <input
            type="range"
            aria-label="limiar de diagnóstico"
            min="0"
            max="1"
            step="0.02"
            .value=${String(this.threshold)}
            @input=${this.setThreshold}
            class="w-full accent-blue-600"
          />
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              @click=${this.shareLink}
              class="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              title="partilhar este limiar"
            >
              ${this.copied ? "✓ link copiado" : "🔗 partilhar este limiar"}
            </button>
          </div>
        </div>

        <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          ${this.statCard("sensibilidade", "VP / (VP+FN)", s.sens, "blue")}
          ${this.statCard("especificidade", "VN / (VN+FP)", s.spec, "green")}
          ${this.statCard("VPP", "VP / (VP+FP)", s.ppv, "purple")}
          ${this.statCard("VPN", "VN / (VN+FN)", s.npv, "orange")}
        </div>

        <div class="mt-5">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            matriz 2×2
          </div>
          <div class="grid grid-cols-3 gap-1 text-xs">
            <div></div>
            <div
              class="rounded bg-slate-100 p-2 text-center font-bold text-slate-700"
            >
              PREV +
            </div>
            <div
              class="rounded bg-slate-100 p-2 text-center font-bold text-slate-700"
            >
              PREV −
            </div>
            <div
              class="rounded bg-slate-100 p-2 text-center font-bold text-red-700"
            >
              DOENTE
            </div>
            <div
              class="rounded border-2 border-green-400 bg-green-50 p-3 text-center"
            >
              <div class="text-xs text-slate-500">VP</div>
              <div class="text-xl font-bold text-green-700">${s.TP}</div>
            </div>
            <div
              class="rounded border-2 border-red-400 bg-red-50 p-3 text-center"
            >
              <div class="text-xs text-slate-500">FN</div>
              <div class="text-xl font-bold text-red-700">${s.FN}</div>
            </div>
            <div
              class="rounded bg-slate-100 p-2 text-center font-bold text-green-700"
            >
              SAUDÁVEL
            </div>
            <div
              class="rounded border-2 border-red-400 bg-red-50 p-3 text-center"
            >
              <div class="text-xs text-slate-500">FP</div>
              <div class="text-xl font-bold text-red-700">${s.FP}</div>
            </div>
            <div
              class="rounded border-2 border-green-400 bg-green-50 p-3 text-center"
            >
              <div class="text-xs text-slate-500">VN</div>
              <div class="text-xl font-bold text-green-700">${s.TN}</div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-xs leading-relaxed text-slate-600">
          Rastreio (não falhar doentes) → limiar baixo, alta sensibilidade.
          Confirmação (não rotular saudáveis) → limiar alto, alta
          especificidade. Não há óptimo universal: depende do custo de cada
          erro.
        </p>
      </div>
    `;
  }

  private statCard(
    label: string,
    sub: string,
    value: number,
    color: "blue" | "green" | "purple" | "orange",
  ) {
    const colorMap = {
      blue: "text-blue-700",
      green: "text-green-700",
      purple: "text-purple-700",
      orange: "text-orange-700",
    };
    return html`<div
      class="rounded-lg border border-slate-200 bg-white p-3 text-center"
    >
      <div
        class="${colorMap[color]} text-xs font-bold uppercase tracking-wider"
      >
        ${label}
      </div>
      <div class="${colorMap[color]} text-2xl font-bold">
        ${(value * 100).toFixed(1)}%
      </div>
      <div class="font-mono text-[10px] text-slate-500">${sub}</div>
    </div>`;
  }
}

customElements.define("sens-spec-demo", SensSpecDemo);
