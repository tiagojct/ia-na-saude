/**
 * <bias-demo> · Vieses · mesma queixa, doentes diferentes.
 *
 * Quatro respostas pré-escritas para combinações (sexo × idade). Mostra
 * onde a literatura clínica enviesa o output do modelo.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

type Sex = "M" | "F";
type Age = "young" | "old";

interface Response {
  text: string;
  flag: string | null;
  label: string;
}

const RESPONSES: Record<string, Response> = {
  "M-old": {
    label: "Homem · 64 anos",
    text: "Quadro clínico altamente sugestivo de síndrome coronário agudo. Recomendar ECG imediato, marcadores de necrose miocárdica e activação da via verde coronária.",
    flag: null,
  },
  "M-young": {
    label: "Homem · 35 anos",
    text: "Em homem jovem com dor torácica desencadeada por esforço, considerar causa cardiovascular se houver factores de risco, mas também musculoesqueléticas e refluxo. ECG e estratificação de risco indicados.",
    flag: null,
  },
  "F-old": {
    label: "Mulher · 64 anos · esta é a Maria",
    text: "Em mulher de idade avançada com este quadro, há risco real de SCA, mas a apresentação pode ser atípica. Pedir ECG e troponinas mesmo que pareça benigno: historicamente a doença coronária é subdiagnosticada nestas doentes.",
    flag: "A literatura mostra que mulheres com sintomas coronários são, em média, avaliadas com menor intensidade e mais tarde do que homens com igual quadro. Modelos treinados nessa literatura reproduzem a lacuna se não forem desenhados para a corrigir.",
  },
  "F-young": {
    label: "Mulher · 35 anos",
    text: "Em mulher jovem com dor torácica, a probabilidade de doença coronária é geralmente baixa. Considerar causas musculoesqueléticas, ansiedade, refluxo. ECG é razoável para tranquilizar.",
    flag: "Este tipo de resposta normaliza causas benignas para mulheres jovens. Em populações reais, atrasa o diagnóstico de eventos coronários atípicos, dissecção espontânea da artéria coronária e miocardite. O viés está em assumir baixa probabilidade como certeza.",
  },
};

export class BiasDemo extends IaElement {
  static readonly PREFIX = "bi";

  @property({ type: String }) sex: Sex = "M";
  @property({ type: String }) age: Age = "old";

  connectedCallback(): void {
    super.connectedCallback();
    this.sex = readUrlParam(BiasDemo.PREFIX, "sex", "M") as Sex;
    this.age = readUrlParam(BiasDemo.PREFIX, "age", "old") as Age;
  }

  private setSex = (v: Sex) => {
    this.sex = v;
    writeUrlParam(BiasDemo.PREFIX, "sex", v);
  };

  private setAge = (v: Age) => {
    this.age = v;
    writeUrlParam(BiasDemo.PREFIX, "age", v);
  };

  protected render() {
    const key = `${this.sex}-${this.age}`;
    const r = RESPONSES[key];
    const isMaria = key === "F-old";

    return html`
      <div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            mesma queixa, palavra por palavra
          </div>
          <div class="mt-1 text-sm leading-relaxed text-slate-800">
            “Doente com dor torácica há 2 horas, irradiada para o braço
            esquerdo, sudorese.”
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <div
              class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Sexo
            </div>
            <div class="flex gap-2">
              ${(["M", "F"] as const).map(
                (s) => html`<button
                  type="button"
                  @click=${() => this.setSex(s)}
                  class="${this.sex === s
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} flex-1 rounded-lg py-2 text-sm font-bold transition"
                >
                  ${s === "M" ? "Homem" : "Mulher"}
                </button>`,
              )}
            </div>
          </div>
          <div>
            <div
              class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Idade
            </div>
            <div class="flex gap-2">
              ${(
                [
                  ["young", "35 anos"],
                  ["old", "64 anos"],
                ] as const
              ).map(
                ([v, label]) => html`<button
                  type="button"
                  @click=${() => this.setAge(v)}
                  class="${this.age === v
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} flex-1 rounded-lg py-2 text-sm font-bold transition"
                >
                  ${label}
                </button>`,
              )}
            </div>
          </div>
        </div>

        <div
          class="${isMaria
            ? "border-amber-400 bg-amber-50"
            : "border-slate-200 bg-white"} mt-4 rounded-lg border p-4"
        >
          <div
            class="${isMaria
              ? "text-amber-700"
              : "text-slate-500"} mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-wider"
          >
            <span>resposta do modelo · ${r.label}</span>
            ${isMaria ? html`<span>★ Maria</span>` : ""}
          </div>
          <p class="text-sm leading-relaxed text-slate-800">${r.text}</p>
        </div>

        ${r.flag
          ? html`<div
              class="mt-3 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm leading-relaxed text-slate-700"
            >
              <div class="mb-1 font-bold text-red-700">Onde está o viés</div>
              ${r.flag}
            </div>`
          : ""}
      </div>
    `;
  }
}

customElements.define("bias-demo", BiasDemo);
