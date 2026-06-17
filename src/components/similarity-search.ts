/**
 * <similarity-search> · Mecanismo · vocabulário em espaço 2D, cosseno
 * entre 2 termos + 5 vizinhos mais próximos.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Vec {
  x: number;
  y: number;
  cat: string;
}

const VOCAB: Record<string, Vec> = {
  enfarte: { x: 0.18, y: 0.2, cat: "cardio" },
  angina: { x: 0.22, y: 0.18, cat: "cardio" },
  ECG: { x: 0.2, y: 0.3, cat: "cardio" },
  troponina: { x: 0.16, y: 0.28, cat: "cardio" },
  SCA: { x: 0.14, y: 0.22, cat: "cardio" },
  isquemia: { x: 0.24, y: 0.24, cat: "cardio" },
  asma: { x: 0.78, y: 0.22, cat: "pulm" },
  DPOC: { x: 0.82, y: 0.18, cat: "pulm" },
  pneumonia: { x: 0.74, y: 0.28, cat: "pulm" },
  sibilos: { x: 0.8, y: 0.3, cat: "pulm" },
  dispneia: { x: 0.7, y: 0.26, cat: "pulm" },
  "falta de ar": { x: 0.72, y: 0.3, cat: "pulm" },
  tosse: { x: 0.76, y: 0.24, cat: "pulm" },
  AVC: { x: 0.18, y: 0.72, cat: "neuro" },
  enxaqueca: { x: 0.22, y: 0.76, cat: "neuro" },
  convulsão: { x: 0.26, y: 0.74, cat: "neuro" },
  afasia: { x: 0.18, y: 0.78, cat: "neuro" },
  paracetamol: { x: 0.78, y: 0.72, cat: "farma" },
  ibuprofeno: { x: 0.82, y: 0.74, cat: "farma" },
  AAS: { x: 0.76, y: 0.78, cat: "farma" },
  varfarina: { x: 0.74, y: 0.76, cat: "farma" },
  anticoagulante: { x: 0.8, y: 0.78, cat: "farma" },
};

const ALL_TERMS = Object.keys(VOCAB);

const COLORS: Record<string, string> = {
  cardio: "#dc2626",
  pulm: "#2563eb",
  neuro: "#7c3aed",
  farma: "#16a34a",
};

function cosineSim(a: Vec, b: Vec) {
  const dot = a.x * b.x + a.y * b.y;
  const magA = Math.sqrt(a.x ** 2 + a.y ** 2);
  const magB = Math.sqrt(b.x ** 2 + b.y ** 2);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function euclidDist(a: Vec, b: Vec) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

const PRESET_PAIRS = [
  ["dispneia", "falta de ar"],
  ["enfarte", "AVC"],
  ["asma", "DPOC"],
  ["paracetamol", "varfarina"],
];

export class SimilaritySearch extends IaElement {
  @property({ type: String, state: true }) a = "dispneia";
  @property({ type: String, state: true }) b = "falta de ar";

  protected render() {
    const va = VOCAB[this.a];
    const vb = VOCAB[this.b];
    const sim = va && vb ? cosineSim(va, vb) : 0;
    const neighbours = va
      ? ALL_TERMS.filter((t) => t !== this.a)
          .map((t) => ({ term: t, dist: euclidDist(va, VOCAB[t]) }))
          .sort((x, y) => x.dist - y.dist)
          .slice(0, 5)
      : [];

    return html`
      <div>
        <p class="mb-3 text-sm leading-relaxed text-slate-600">
          Cada termo clínico vive como vector num espaço aprendido. Termos
          semanticamente próximos ficam próximos no espaço — mesmo que nunca
          co-ocorram no mesmo texto.
        </p>

        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >termo A</label
            >
            <select
              .value=${this.a}
              @change=${(e: Event) =>
                (this.a = (e.target as HTMLSelectElement).value)}
              aria-label="termo A"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
            >
              ${ALL_TERMS.map(
                (t) => html`<option value=${t}>${t}</option>`,
              )}
            </select>
          </div>
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >termo B</label
            >
            <select
              .value=${this.b}
              @change=${(e: Event) =>
                (this.b = (e.target as HTMLSelectElement).value)}
              aria-label="termo B"
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-mono"
            >
              ${ALL_TERMS.map(
                (t) => html`<option value=${t}>${t}</option>`,
              )}
            </select>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          <span class="text-xs text-slate-500">testar par:</span>
          ${PRESET_PAIRS.map(
            ([x, y]) => html`<button
              type="button"
              @click=${() => {
                this.a = x;
                this.b = y;
              }}
              class="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              ${x} ↔ ${y}
            </button>`,
          )}
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <svg
            viewBox="0 0 400 400"
            class="h-auto w-full"
            aria-label="espaço de embeddings"
          >
            ${[
              { cat: "cardio", x: 80, y: 50 },
              { cat: "pulm", x: 320, y: 50 },
              { cat: "neuro", x: 80, y: 310 },
              { cat: "farma", x: 320, y: 310 },
            ].map(
              (c) => html`<text
                x=${c.x}
                y=${c.y}
                text-anchor="middle"
                font-size="10"
                font-weight="700"
                fill=${COLORS[c.cat]}
                opacity="0.5"
              >
                ${c.cat}
              </text>`,
            )}
            ${va && vb
              ? html`<line
                  x1=${va.x * 400}
                  y1=${va.y * 400}
                  x2=${vb.x * 400}
                  y2=${vb.y * 400}
                  stroke="#0f172a"
                  stroke-width="2"
                  stroke-dasharray="3,2"
                ></line>`
              : ""}
            ${ALL_TERMS.map((t) => {
              const v = VOCAB[t];
              const isA = t === this.a;
              const isB = t === this.b;
              const inNeighbours = neighbours.some((n) => n.term === t);
              return html`<g>
                <circle
                  cx=${v.x * 400}
                  cy=${v.y * 400}
                  r=${isA || isB ? 6 : inNeighbours ? 4 : 3}
                  fill=${COLORS[v.cat]}
                  opacity=${isA || isB ? 1 : inNeighbours ? 0.7 : 0.35}
                  stroke=${isA || isB ? "#0f172a" : "none"}
                  stroke-width="2"
                ></circle>
                <text
                  x=${v.x * 400 + 8}
                  y=${v.y * 400 + 3}
                  font-size=${isA || isB ? "12" : "10"}
                  font-weight=${isA || isB ? "700" : "400"}
                  fill=${isA || isB ? "#0f172a" : "#475569"}
                >
                  ${t}
                </text>
              </g>`;
            })}
          </svg>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              similaridade cosseno
            </div>
            <div
              class="${sim > 0.9
                ? "text-green-700"
                : sim > 0.7
                  ? "text-amber-700"
                  : "text-slate-700"} mt-1 font-mono text-3xl font-bold"
            >
              ${sim.toFixed(3)}
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                class="${sim > 0.9
                  ? "bg-green-500"
                  : sim > 0.7
                    ? "bg-amber-500"
                    : "bg-slate-400"} h-full"
                style="width:${sim * 100}%"
              ></div>
            </div>
            <p class="mt-2 text-xs leading-relaxed text-slate-600">
              ${sim > 0.95
                ? "Quase idênticos — modelo trata-os como sinónimos."
                : sim > 0.85
                  ? "Muito próximos — pertencem ao mesmo conceito clínico."
                  : sim > 0.7
                    ? "Relacionados — partilham contexto frequente."
                    : "Distantes — conceitos diferentes."}
            </p>
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              vizinhos mais próximos de “${this.a}”
            </div>
            <ul class="mt-2 space-y-1">
              ${neighbours.map(
                (n, i) => html`<li
                  class="flex items-center justify-between text-xs"
                >
                  <span class="font-mono text-slate-700"
                    >${i + 1}. ${n.term}</span
                  >
                  <span class="font-mono text-slate-500"
                    >d = ${n.dist.toFixed(2)}</span
                  >
                </li>`,
              )}
            </ul>
          </div>
        </div>

        <p class="mt-4 text-xs italic text-slate-500">
          Em 2D só vês a ponta do iceberg — os modelos reais usam 300-1000
          dimensões. Mas o princípio é o mesmo:
          <strong>significado é geometria</strong>. A pesquisa de fármacos
          similares, a recuperação RAG, o k-NN clínico — tudo assenta nesta
          ideia.
        </p>
      </div>
    `;
  }
}

customElements.define("similarity-search", SimilaritySearch);
