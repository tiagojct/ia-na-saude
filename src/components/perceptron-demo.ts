/**
 * <perceptron-demo> · Aprendizagem · 6×6 grid, classificador linear,
 * 6 exemplos rotulados, loop de treino com setInterval.
 */

import { IaElement, html, prefersReducedMotion } from "./_base";
import { property } from "lit/decorators.js";

const SIZE = 6;
const TOTAL = SIZE * SIZE;

interface Sample {
  pattern: number[];
  label: 1 | -1;
  name: string;
}

function fromString(s: string): number[] {
  return s.split("").map((c) => (c === "1" ? 1 : 0));
}

const SAMPLES: Sample[] = [
  { pattern: fromString("000000011110011110011110011110000000"), label: 1, name: "benigna · contida" },
  { pattern: fromString("000000001100011110011110011110001100"), label: 1, name: "benigna · simétrica" },
  { pattern: fromString("001100011110011110011110011110001100"), label: 1, name: "benigna · redonda" },
  { pattern: fromString("100001010000001000000100000010100001"), label: -1, name: "suspeita · dispersa" },
  { pattern: fromString("100001000010010000000100001000100001"), label: -1, name: "suspeita · assimétrica" },
  { pattern: fromString("100001001000000010010000000100100001"), label: -1, name: "suspeita · irregular" },
];

const PRESETS = {
  benign: fromString("000000011110011110011110011110000000"),
  suspicious: fromString("100001010010010100001010010010100001"),
  clear: fromString("000000000000000000000000000000000000"),
};

function predict(weights: number[], bias: number, pattern: number[]): number {
  let z = bias;
  for (let i = 0; i < pattern.length; i++) z += weights[i] * pattern[i];
  return z;
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

function trainStep(w: number[], b: number) {
  const nw = [...w];
  let nb = b;
  let errs = 0;
  const lr = 0.1;
  for (const s of SAMPLES) {
    const z = predict(nw, nb, s.pattern);
    const pred = z >= 0 ? 1 : -1;
    if (pred !== s.label) {
      errs++;
      for (let i = 0; i < TOTAL; i++) {
        nw[i] += lr * s.label * s.pattern[i];
      }
      nb += lr * s.label;
    }
  }
  return { w: nw, b: nb, errs };
}

export class PerceptronDemo extends IaElement {
  @property({ type: Array, state: true }) weights: number[] = Array(TOTAL).fill(0);
  @property({ type: Number, state: true }) bias = 0;
  @property({ type: Number, state: true }) iter = 0;
  @property({ type: Boolean, state: true }) training = false;
  @property({ type: Number, state: true }) errors: number | null = null;
  @property({ type: Array, state: true }) testPattern: number[] = Array(TOTAL).fill(0);

  private timer: number | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearInterval(this.timer);
  }

  private startTraining = () => {
    if (this.training) return;
    this.iter = 0;
    this.weights = Array(TOTAL).fill(0);
    this.bias = 0;
    let curW: number[] = Array(TOTAL).fill(0);
    let curB = 0;

    if (prefersReducedMotion()) {
      let finalErrors = 0;
      let finalI = 0;
      for (let i = 1; i <= 30; i++) {
        const r = trainStep(curW, curB);
        curW = r.w;
        curB = r.b;
        finalI = i;
        finalErrors = r.errs;
        if (r.errs === 0) break;
      }
      this.weights = curW;
      this.bias = curB;
      this.iter = finalI;
      this.errors = finalErrors;
      return;
    }

    this.training = true;
    let i = 0;
    this.timer = window.setInterval(() => {
      const r = trainStep(curW, curB);
      curW = r.w;
      curB = r.b;
      i++;
      this.weights = curW;
      this.bias = curB;
      this.iter = i;
      this.errors = r.errs;
      if (i >= 30 || r.errs === 0) {
        if (this.timer) window.clearInterval(this.timer);
        this.timer = null;
        this.training = false;
      }
    }, 80);
  };

  private reset = () => {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.training = false;
    this.weights = Array(TOTAL).fill(0);
    this.bias = 0;
    this.iter = 0;
    this.errors = null;
  };

  private togglePixel = (i: number) => {
    const next = [...this.testPattern];
    next[i] = next[i] === 1 ? 0 : 1;
    this.testPattern = next;
  };

  private weightColor(w: number, maxAbsW: number): string {
    if (Math.abs(w) < 0.01) return "#e2e8f0";
    const intensity = Math.min(Math.abs(w) / maxAbsW, 1);
    if (w > 0) return `rgba(22, 163, 74, ${0.2 + 0.8 * intensity})`;
    return `rgba(220, 38, 38, ${0.2 + 0.8 * intensity})`;
  }

  private renderGrid(
    cells: number[],
    cellRender: (val: number, idx: number) => string,
    onClick?: (i: number) => void,
  ) {
    return html`<div
      class="grid gap-px rounded border border-slate-300 bg-slate-300 p-px"
      style="grid-template-columns:repeat(${SIZE},1fr)"
    >
      ${cells.map(
        (v, i) => html`<button
          type="button"
          @click=${onClick ? () => onClick(i) : null}
          ?disabled=${!onClick}
          class="${onClick
            ? "cursor-pointer"
            : "cursor-default"} aspect-square"
          style="background-color:${cellRender(v, i)}"
          aria-label="pixel ${i}"
        ></button>`,
      )}
    </div>`;
  }

  protected render() {
    const z = predict(this.weights, this.bias, this.testPattern);
    const benignProb = sigmoid(z);
    const suspProb = 1 - benignProb;
    const maxAbsW = Math.max(...this.weights.map((w) => Math.abs(w)), 0.01);

    return html`
      <div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              treinar · 6 exemplos rotulados
            </div>
            <div class="grid grid-cols-3 gap-2">
              ${SAMPLES.map(
                (s) => html`<div>
                  ${this.renderGrid(s.pattern, (v) =>
                    v === 1 ? "#1e293b" : "#f8fafc",
                  )}
                  <div
                    class="${s.label === 1
                      ? "text-green-700"
                      : "text-red-700"} mt-1 text-center text-[10px] font-bold"
                  >
                    ${s.label === 1 ? "benigna" : "suspeita"}
                  </div>
                </div>`,
              )}
            </div>

            <div class="mt-3 text-xs text-slate-500">
              iteração
              <strong class="text-slate-900">${this.iter} / 30</strong>
              ${this.errors !== null
                ? html`<span>
                    ·
                    ${this.errors === 0
                      ? "todos correctos"
                      : `${this.errors} erro${this.errors === 1 ? "" : "s"}`}
                  </span>`
                : ""}
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                @click=${this.startTraining}
                ?disabled=${this.training}
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                ${this.training
                  ? "a treinar…"
                  : this.iter > 0
                    ? "▶ Treinar de novo"
                    : "▶ Treinar"}
              </button>
              <button
                type="button"
                @click=${this.reset}
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Reiniciar
              </button>
            </div>

            <div class="mt-4">
              <div
                class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                pesos aprendidos
              </div>
              ${this.renderGrid(this.weights, (_, i) =>
                this.weightColor(this.weights[i], maxAbsW),
              )}
              <div
                class="mt-1 flex items-center gap-2 text-[10px] text-slate-500"
              >
                <span
                  class="inline-block h-2 w-2 rounded"
                  style="background:#16a34a"
                ></span>
                vota benigna
                <span
                  class="ml-2 inline-block h-2 w-2 rounded"
                  style="background:#dc2626"
                ></span>
                vota suspeita
              </div>
            </div>
          </div>

          <div>
            <div class="mb-2 flex items-baseline justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-slate-500"
                >testar · desenha uma lesão</span
              >
            </div>
            ${this.renderGrid(
              this.testPattern,
              (v) => (v === 1 ? "#1e293b" : "#f8fafc"),
              this.togglePixel,
            )}

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                @click=${() => (this.testPattern = [...PRESETS.benign])}
                class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                desenhar benigna
              </button>
              <button
                type="button"
                @click=${() => (this.testPattern = [...PRESETS.suspicious])}
                class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                desenhar suspeita
              </button>
              <button
                type="button"
                @click=${() => (this.testPattern = [...PRESETS.clear])}
                class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                limpar
              </button>
            </div>

            <div class="mt-4 space-y-2">
              <div>
                <div class="mb-1 flex items-baseline justify-between text-xs">
                  <span class="font-bold text-green-700">benigna</span>
                  <span class="font-mono"
                    >${(benignProb * 100).toFixed(1)} %</span
                  >
                </div>
                <div class="h-3 overflow-hidden rounded bg-slate-100">
                  <div
                    class="h-full rounded bg-green-500 transition-all"
                    style="width:${benignProb * 100}%"
                  ></div>
                </div>
              </div>
              <div>
                <div class="mb-1 flex items-baseline justify-between text-xs">
                  <span class="font-bold text-red-700">suspeita</span>
                  <span class="font-mono"
                    >${(suspProb * 100).toFixed(1)} %</span
                  >
                </div>
                <div class="h-3 overflow-hidden rounded bg-slate-100">
                  <div
                    class="h-full rounded bg-red-500 transition-all"
                    style="width:${suspProb * 100}%"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p class="mt-4 text-xs leading-relaxed text-slate-600">
          Pesos a verde votam “benigna”; a vermelho votam “suspeita”. Antes do
          treino são todos cinzentos (modelo ignorante). Após convergência, a
          rede revela <em>onde olhou</em> — pixels centrais para benigno,
          satélites e bordos para suspeito.
        </p>
      </div>
    `;
  }
}

customElements.define("perceptron-demo", PerceptronDemo);
