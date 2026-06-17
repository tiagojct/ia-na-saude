/**
 * <attention-viz> · Mecanismo · 4 cabeças de atenção sobre frase clínica.
 *
 * Pesos hardcoded. Cada cabeça atende a um padrão diferente (cardio,
 * demografia, sintaxe, comorbilidades). Hover num token mostra peso.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

const TOKENS = [
  "Maria", ",", "64", "anos", ",", "HTA", "+", "DM2", ",", "dor",
  "torácica", "irradiada", ",", "sudorese", ".", "Próximo", "passo", "?",
];

const QUERY_TOKEN_IDX = 15;

interface Head {
  id: string;
  name: string;
  description: string;
  weights: number[];
  color: string;
  rgb: string;
}

const HEADS: Head[] = [
  {
    id: "cardio",
    name: "cabeça 1 · cardio-focada",
    description:
      "Atende sobretudo a antecedentes cardiovasculares e sintomas torácicos. Vai sugerir ECG, troponina.",
    color: "#dc2626",
    rgb: "220,38,38",
    weights: [
      0.02, 0, 0.03, 0.02, 0, 0.18, 0, 0.08, 0, 0.16, 0.2, 0.1, 0, 0.12, 0,
      0.05, 0.04, 0,
    ],
  },
  {
    id: "demog",
    name: "cabeça 2 · demografia",
    description:
      "Atende ao perfil do doente: nome, idade, sexo. Pondera probabilidade pré-teste.",
    color: "#2563eb",
    rgb: "37,99,235",
    weights: [
      0.28, 0, 0.25, 0.18, 0, 0.06, 0, 0.05, 0, 0.04, 0.03, 0.02, 0, 0.03, 0,
      0.03, 0.03, 0,
    ],
  },
  {
    id: "syntax",
    name: "cabeça 3 · sintáctica",
    description:
      "Atende a estrutura: pontuação, marcadores de lista, conector da pergunta. Não traz semântica clínica.",
    color: "#7c3aed",
    rgb: "124,58,237",
    weights: [
      0.02, 0.08, 0.01, 0.02, 0.1, 0.02, 0.04, 0.02, 0.1, 0.02, 0.02, 0.02,
      0.1, 0.02, 0.18, 0.1, 0.06, 0.08,
    ],
  },
  {
    id: "comorbid",
    name: "cabeça 4 · comorbilidades",
    description:
      "Atende a antecedentes que pesam no diagnóstico diferencial: HTA, DM2, idade.",
    color: "#16a34a",
    rgb: "22,163,74",
    weights: [
      0.02, 0, 0.2, 0.04, 0, 0.3, 0, 0.3, 0, 0.04, 0.03, 0.02, 0, 0.02, 0,
      0.02, 0.01, 0,
    ],
  },
];

export class AttentionViz extends IaElement {
  @property({ type: String, state: true }) activeHead = "cardio";
  @property({ type: Number, state: true }) hoverToken: number | null = null;

  protected render() {
    const head = HEADS.find((h) => h.id === this.activeHead)!;
    const maxW = Math.max(...head.weights);

    return html`
      <div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            contexto · cada token recebe atenção
          </div>
          <div class="mb-1 text-xs text-slate-500">
            a <strong>palavra a ser prevista</strong> está em azul. As outras
            são o que ela “olha”.
          </div>
          <div class="mt-3 flex flex-wrap gap-1 font-mono text-sm leading-loose">
            ${TOKENS.map((t, i) => {
              const isQuery = i === QUERY_TOKEN_IDX;
              const w = head.weights[i];
              const intensity = maxW > 0 ? w / maxW : 0;
              const bg = isQuery
                ? "#2563eb"
                : `rgba(${head.rgb}, ${0.08 + intensity * 0.85})`;
              const fg = isQuery ? "white" : intensity > 0.5 ? "white" : "#1e293b";
              return html`<span
                @mouseenter=${() => (this.hoverToken = i)}
                @mouseleave=${() => (this.hoverToken = null)}
                class="rounded px-1.5 py-0.5 transition-colors cursor-help"
                style="background:${bg};color:${fg}"
                title=${isQuery
                  ? "token a prever"
                  : `peso ${(w * 100).toFixed(1)}%`}
                >${t}</span
              >`;
            })}
          </div>

          ${this.hoverToken !== null && this.hoverToken !== QUERY_TOKEN_IDX
            ? html`<div
                class="mt-3 rounded border border-slate-300 bg-white px-3 py-2 font-mono text-xs"
              >
                <span class="font-bold text-slate-900"
                  >${TOKENS[this.hoverToken]}</span
                >
                <span class="ml-2 text-slate-500"
                  >peso:
                  ${(head.weights[this.hoverToken] * 100).toFixed(1)}%</span
                >
              </div>`
            : ""}
        </div>

        <div class="mt-4">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            escolhe a “cabeça” de atenção
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            ${HEADS.map(
              (h) => html`<button
                type="button"
                @click=${() => (this.activeHead = h.id)}
                class="${this.activeHead === h.id
                  ? "border-slate-700 bg-white shadow-sm"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"} rounded-lg border-2 p-3 text-left transition"
                style=${this.activeHead === h.id
                  ? `border-color:${h.color}`
                  : ""}
              >
                <div
                  class="text-xs font-bold uppercase tracking-wider"
                  style="color:${h.color}"
                >
                  ${h.name}
                </div>
                <div class="mt-1 text-xs leading-relaxed text-slate-600">
                  ${h.description}
                </div>
              </button>`,
            )}
          </div>
        </div>

        <div class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700"
          >
            o que o Transformer faz na prática
          </div>
          <p class="text-sm leading-relaxed text-slate-700">
            Cada token gera um peso para todos os outros, em
            <strong>paralelo</strong>, em dezenas de cabeças simultâneas. No
            fim, as cabeças combinam-se e o modelo gera a continuação.
            <strong>É esta paralelização</strong> que tornou possível treinar
            em milhões de notas — o RNN antigo ia palavra a palavra,
            sequencial.
          </p>
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Pesos ilustrativos. Modelos reais (Claude, GPT) têm ~96 cabeças por
          camada e ~80 camadas. Cada uma especializa-se em padrões diferentes
          que emergem do treino — não são programados à mão.
        </p>
      </div>
    `;
  }
}

customElements.define("attention-viz", AttentionViz);
