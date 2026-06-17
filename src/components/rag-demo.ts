/**
 * <rag-demo> · RAG · side-by-side LLM puro vs LLM+RAG (good/broken).
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

const PROMPT = "Qual o esquema MART para asma moderada num adulto?";

const PURE_STEPS = [
  "recebe pergunta",
  "procura no que decorou (parâmetros)",
  "gera com base em padrões",
];

const RAG_STEPS_GOOD = [
  "recebe pergunta",
  "procura no corpus GINA 2024",
  "recupera 2 trechos relevantes",
  "gera apoiada nos trechos",
];

const RAG_STEPS_BROKEN = [
  "recebe pergunta",
  "procura no corpus interno",
  "recupera trecho sobre asma pediátrica · ≠ pergunta",
  "gera com fluência sobre o trecho errado",
];

const PURE_ANSWER =
  "Em adultos com asma moderada, a abordagem SMART recomenda budesonida-formoterol 200/6 µg, uma inalação duas vezes ao dia, com inalações adicionais conforme necessário até 8–12 ao dia.";

const RAG_ANSWER_GOOD =
  "Para asma moderada em adultos, a guideline GINA recomenda budesonida-formoterol 200/6 µg como inalador único de manutenção e alívio (MART), 1 inalação 2× ao dia, e adicionais conforme sintomas, até 12 inalações por dia.";

const RAG_ANSWER_BROKEN =
  "Para adultos com asma moderada, segue-se o esquema MART pediátrico em <12 anos com fluticasona/salmeterol 50/25 µg, conforme protocolo recuperado da norma local. Doses adicionais máximas: 4/dia.";

export class RAGDemo extends IaElement {
  static readonly PREFIX = "rg";

  @property({ type: String }) mode: "good" | "broken" = "good";
  @property({ type: Number, state: true }) step = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.mode = readUrlParam(RAGDemo.PREFIX, "mode", "good") as "good" | "broken";
  }

  private setMode = (v: "good" | "broken") => {
    this.mode = v;
    this.step = 0;
    writeUrlParam(RAGDemo.PREFIX, "mode", v);
  };

  protected render() {
    const ragSteps = this.mode === "good" ? RAG_STEPS_GOOD : RAG_STEPS_BROKEN;
    const ragAnswer =
      this.mode === "good" ? RAG_ANSWER_GOOD : RAG_ANSWER_BROKEN;
    const maxStep = Math.max(PURE_STEPS.length, ragSteps.length);
    const showAnswers = this.step >= maxStep;

    return html`
      <div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            pergunta
          </div>
          <div class="mt-1 text-sm font-medium text-slate-800">${PROMPT}</div>
        </div>

        <div class="mt-3 flex gap-2 text-xs">
          <button
            type="button"
            @click=${() => this.setMode("good")}
            class="${this.mode === "good"
              ? "border-green-500 bg-green-50"
              : "border-slate-200 bg-white hover:border-slate-300"} flex-1 rounded-lg border-2 p-2 text-left transition"
          >
            <div class="font-bold">RAG bem desenhado</div>
            <div class="text-slate-500">
              corpus alinhado · retrieval com filtro etário
            </div>
          </button>
          <button
            type="button"
            @click=${() => this.setMode("broken")}
            class="${this.mode === "broken"
              ? "border-red-500 bg-red-50"
              : "border-slate-200 bg-white hover:border-slate-300"} flex-1 rounded-lg border-2 p-2 text-left transition"
          >
            <div class="font-bold">RAG mal desenhado</div>
            <div class="text-slate-500">
              retrieval recupera passagem pediátrica · modelo confia
            </div>
          </button>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          ${this.column(
            "LLM puro",
            "sem fontes externas",
            "red",
            PURE_STEPS,
            this.step,
            showAnswers
              ? html`<p class="mb-2 text-sm leading-relaxed text-slate-800">
                    ${PURE_ANSWER}
                  </p>
                  <p
                    class="rounded border border-dashed border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700"
                  >
                    Sem fonte. Os números podem estar errados ou
                    desactualizados.
                  </p>`
              : null,
          )}
          ${this.column(
            "LLM + RAG",
            this.mode === "good"
              ? "corpus: GINA 2024"
              : "corpus: norma interna · indexação fraca",
            this.mode === "good" ? "green" : "amber",
            ragSteps,
            this.step,
            showAnswers
              ? html`<p class="mb-2 text-sm leading-relaxed text-slate-800">
                    ${ragAnswer}
                  </p>
                  ${this.mode === "good"
                    ? html`<p
                        class="rounded border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-800"
                      >
                        <strong>Fonte:</strong> GINA Main Report 2024, secção
                        sobre tratamento por <em>steps</em>, abordagem
                        SMART/MART.
                      </p>`
                    : html`<p
                        class="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-800"
                      >
                        <strong>Fonte invocada:</strong> protocolo pediátrico
                        ≠ pergunta sobre adulto. RAG <em>com fonte errada</em>
                        é mais perigoso que LLM puro — soa autoritário.
                      </p>`}`
              : null,
          )}
        </div>

        <div class="mt-4 flex gap-2">
          ${!showAnswers
            ? html`<button
                type="button"
                @click=${() =>
                  (this.step = Math.min(this.step + 1, maxStep))}
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                ${this.step === 0 ? "▶ Comparar" : "Próximo passo →"}
              </button>`
            : html`<button
                type="button"
                @click=${() => (this.step = 0)}
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Reiniciar
              </button>`}
        </div>

        <p class="mt-4 text-xs leading-relaxed text-slate-500">
          RAG não é magia. Liga “mal desenhado”: o modelo continua a soar
          confiante, agora <strong>com fonte invocada</strong> — pior que o
          LLM puro. Em produção, a qualidade do retrieval (filtros,
          embeddings, dedup, scoping) define o tecto. Falhar isso é fácil;
          testar isso requer validação clínica como qualquer outro
          instrumento.
        </p>
      </div>
    `;
  }

  private column(
    title: string,
    subtitle: string,
    tone: "red" | "green" | "amber",
    steps: string[],
    revealed: number,
    answer: ReturnType<typeof html> | null,
  ) {
    const border =
      tone === "red"
        ? "border-red-300 bg-red-50"
        : tone === "amber"
          ? "border-amber-300 bg-amber-50"
          : "border-green-300 bg-green-50";
    const accent =
      tone === "red"
        ? "text-red-700"
        : tone === "amber"
          ? "text-amber-700"
          : "text-green-700";
    return html`<div class="${border} rounded-lg border-2 p-3">
      <div
        class="${accent} text-xs font-bold uppercase tracking-wider"
      >
        ${title}
      </div>
      <div class="text-xs italic text-slate-500">${subtitle}</div>
      <ol class="mt-3 space-y-1 text-xs">
        ${steps.map(
          (s, i) => html`<li
            class="${i < revealed
              ? "text-slate-800"
              : "text-slate-500"} flex gap-2"
          >
            <span class="${accent} font-mono">${i < revealed ? "✓" : "○"}</span>
            <span>${s}</span>
          </li>`,
        )}
      </ol>
      ${answer
        ? html`<div class="mt-3 rounded border border-white bg-white p-3">
            ${answer}
          </div>`
        : ""}
    </div>`;
  }
}

customElements.define("rag-demo", RAGDemo);
