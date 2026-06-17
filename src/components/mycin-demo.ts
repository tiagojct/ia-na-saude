/**
 * <mycin-demo> · História · MYCIN (1972) regra-de-decisão e gate humano.
 *
 * Cenário hard-coded: meningite + alergia → vancomicina. Utilizador escolhe
 * "assinar" ou "recusar". Mostra a lição associada.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

const SIGN =
  "Quem assina assume. Em 1972, sem médico no loop, MYCIN foi recusado em produção apesar de bater os internos. A regra ainda vigora: a IA recomenda; o clínico assina.";
const REFUSE =
  "Boa. Mesmo que a recomendação seja correcta, a responsabilidade clínica não delega. MYCIN nunca chegou ao doente — não pelo desempenho, mas por esta razão.";

export class MycinDemo extends IaElement {
  @property({ type: String, state: true }) choice: "sign" | "refuse" | "" = "";

  protected render() {
    return html`
      <div>
        <div
          class="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800"
        >
          <div>
            <span class="font-bold text-slate-900">Doente:</span> suspeita de
            meningite, gram+ cocci, alergia a penicilina
          </div>
          <div class="mt-2">
            <span class="font-bold text-slate-900">Regra 1:</span>
            <span class="text-blue-600 font-bold">if</span> gram+ cocci
            <span class="text-blue-600 font-bold">and</span> meningite
            <span class="text-blue-600 font-bold">→</span> cobertura ampla
          </div>
          <div>
            <span class="font-bold text-slate-900">Regra 2:</span>
            <span class="text-blue-600 font-bold">if</span> cobertura ampla
            <span class="text-blue-600 font-bold">and</span> alergia penicilina
            <span class="text-blue-600 font-bold">→</span> vancomicina
          </div>
          <div>
            <span class="font-bold text-slate-900">Regra 3:</span>
            <span class="text-blue-600 font-bold">if</span> vancomicina
            <span class="text-blue-600 font-bold">and</span> idade &gt; 18
            <span class="text-blue-600 font-bold">→</span> 1 g EV 12/12h
          </div>
          <div
            class="mt-3 rounded bg-amber-100 px-3 py-2 font-bold text-amber-900"
          >
            RECOMENDAÇÃO → vancomicina 1 g EV 12/12h
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            @click=${() => (this.choice = "sign")}
            class="${this.choice === "sign"
              ? "bg-blue-700"
              : "bg-blue-600 hover:bg-blue-700"} rounded-lg px-4 py-2 text-sm font-bold text-white"
          >
            Assinar a receita
          </button>
          <button
            type="button"
            @click=${() => (this.choice = "refuse")}
            class="${this.choice === "refuse"
              ? "border-slate-400 bg-slate-100 text-slate-900"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} rounded-lg border px-4 py-2 text-sm font-bold"
          >
            Recusar
          </button>
        </div>

        ${this.choice
          ? html`<p
              class="${this.choice === "refuse"
                ? "border-l-4 border-green-500 bg-green-50"
                : "border-l-4 border-amber-500 bg-amber-50"} mt-4 rounded-lg p-4 text-sm leading-relaxed text-slate-700"
            >
              ${this.choice === "sign" ? SIGN : REFUSE}
            </p>`
          : ""}
      </div>
    `;
  }
}

customElements.define("mycin-demo", MycinDemo);
