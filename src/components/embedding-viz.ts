/**
 * <embedding-viz> · Tokens · convergência de termos clínicos em clusters
 * semânticos durante o treino. Animação respeita reduced-motion.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { prefersReducedMotion } from "./_base";

interface Cluster {
  cx: number;
  cy: number;
  label: string;
  labelX: number;
  labelY: number;
  color: string;
}

const WIDTH = 600;
const HEIGHT = 340;

const CLUSTERS: Record<string, Cluster> = {
  cardio: { cx: 155, cy: 90, label: "cardio", labelX: 155, labelY: 38, color: "#dc2626" },
  pulm: { cx: 445, cy: 110, label: "pulmonar", labelX: 445, labelY: 58, color: "#2563eb" },
  neuro: { cx: 160, cy: 250, label: "neuro", labelX: 160, labelY: 320, color: "#7c3aed" },
  farma: { cx: 430, cy: 250, label: "fármacos", labelX: 430, labelY: 320, color: "#16a34a" },
};

const TERMS: Array<{ t: string; c: keyof typeof CLUSTERS; tx: number; ty: number }> = [
  { t: "enfarte", c: "cardio", tx: 100, ty: 88 },
  { t: "angina", c: "cardio", tx: 180, ty: 68 },
  { t: "ECG", c: "cardio", tx: 135, ty: 115 },
  { t: "troponina", c: "cardio", tx: 220, ty: 108 },
  { t: "SCA", c: "cardio", tx: 88, ty: 60 },
  { t: "asma", c: "pulm", tx: 400, ty: 110 },
  { t: "DPOC", c: "pulm", tx: 460, ty: 90 },
  { t: "pneumonia", c: "pulm", tx: 500, ty: 130 },
  { t: "sibilos", c: "pulm", tx: 425, ty: 145 },
  { t: "tosse", c: "pulm", tx: 380, ty: 84 },
  { t: "AVC", c: "neuro", tx: 115, ty: 235 },
  { t: "enxaqueca", c: "neuro", tx: 180, ty: 220 },
  { t: "convulsão", c: "neuro", tx: 222, ty: 255 },
  { t: "afasia", c: "neuro", tx: 135, ty: 275 },
  { t: "paracetamol", c: "farma", tx: 378, ty: 240 },
  { t: "ibuprofeno", c: "farma", tx: 478, ty: 226 },
  { t: "AAS", c: "farma", tx: 510, ty: 262 },
  { t: "varfarina", c: "farma", tx: 395, ty: 275 },
];

const STAGES = [
  "antes do treino · posições aleatórias",
  "passo 1 / 5 · pesos aleatórios",
  "passo 2 / 5 · termos próximos atraem-se",
  "passo 3 / 5 · começam a formar-se grupos",
  "passo 4 / 5 · clusters consolidam",
  "passo 5 / 5 · convergência",
  "treinado · clusters semânticos formados",
];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const rand = seededRandom(42);
const INITIAL_POS = TERMS.map(() => ({
  x: 60 + rand() * 480,
  y: 50 + rand() * 280,
}));

function pctX(x: number): number {
  return (x / WIDTH) * 100;
}

function pctY(y: number): number {
  return (y / HEIGHT) * 100;
}

export class EmbeddingViz extends IaElement {
  @property({ type: Number, state: true }) step = 0;
  @property({ type: Boolean, state: true }) running = false;

  private timer: number | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearTimeout(this.timer);
  }

  updated() {
    if (!this.running) return;
    if (this.step >= 6) {
      this.running = false;
      return;
    }
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => (this.step = this.step + 1), 700);
  }

  private train = () => {
    if (prefersReducedMotion()) {
      this.step = 6;
      return;
    }
    this.step = 0;
    this.running = true;
  };

  private reset = () => {
    if (this.timer) window.clearTimeout(this.timer);
    this.step = 0;
    this.running = false;
  };

  protected render() {
    const positions = TERMS.map((term, i) => {
      const progress = Math.min(this.step / 6, 1);
      return {
        x: INITIAL_POS[i].x + (term.tx - INITIAL_POS[i].x) * progress,
        y: INITIAL_POS[i].y + (term.ty - INITIAL_POS[i].y) * progress,
      };
    });

    return html`
      <div>
        <p
          class="mb-3 text-xs uppercase tracking-wider text-slate-500 font-bold"
        >
          ${STAGES[this.step]}
        </p>

        <div
          class="relative h-[340px] overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
          role="img"
          aria-label="Mapa de embeddings clínicos com termos a convergir para clusters semânticos"
        >
          ${this.step >= 6
            ? Object.values(CLUSTERS).map(
                (c) => html`<div
                    class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed opacity-80"
                    style="left:${pctX(c.cx)}%;top:${pctY(c.cy)}%;width:${pctX(230)}%;height:${pctY(124)}%;border-color:${c.color};background:${c.color}14;"
                    aria-hidden="true"
                  ></div>
                  <div
                    class="absolute -translate-x-1/2 text-xs font-bold uppercase tracking-wider"
                    style="left:${pctX(c.labelX)}%;top:${pctY(c.labelY)}%;color:${c.color};"
                  >
                    ${c.label}
                  </div>`,
              )
            : ""}
          ${TERMS.map((term, i) => {
            const c = CLUSTERS[term.c];
            const p = positions[i];
            return html`<div
              class="absolute transition-all duration-700 ease-out"
              style="left:${pctX(p.x)}%;top:${pctY(p.y)}%;"
            >
              <span
                class="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm ring-2 ring-white"
                style="background:${c.color};"
                aria-hidden="true"
              ></span>
              <span
                class="ml-2 inline-block -translate-y-1/2 rounded bg-white/90 px-1.5 py-0.5 text-xs font-medium text-slate-800 shadow-sm"
              >
                ${term.t}
              </span>
            </div>`;
          })}
        </div>

        <div class="mt-3 flex gap-2">
          <button
            type="button"
            @click=${this.train}
            ?disabled=${this.running}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            ${this.running
              ? "a treinar…"
              : this.step >= 6
                ? "▶ Re-treinar"
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

        <p class="mt-4 text-sm leading-relaxed text-slate-600">
          Antes do treino, posições aleatórias. À medida que o modelo lê
          biliões de frases, descobre que <em>“enfarte”</em> aparece nos
          mesmos contextos que <em>“angina”</em> e <em>“troponina”</em> — e
          move-os para perto.
          <strong>Não lhe é dito o que significam: aprende-o pela companhia.</strong>
        </p>
      </div>
    `;
  }
}

customElements.define("embedding-viz", EmbeddingViz);
