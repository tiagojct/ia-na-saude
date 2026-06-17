/**
 * <chain-of-thought> · Mecanismo · resposta directa vs CoT step-by-step.
 *
 * 2 cenários (vanco, dor torácica jovem). Modo "CoT" revela passos com
 * setInterval (700ms). Timer cleanup em disconnectedCallback.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { readUrlParam, writeUrlParam } from "./_state";
import { prefersReducedMotion } from "./_base";

interface Scenario {
  id: string;
  prompt: string;
  direct: { answer: string; correct: boolean; note: string };
  cot: { steps: string[]; answer: string; correct: boolean; noteHtml: string };
}

const SCENARIOS: Scenario[] = [
  {
    id: "vanco",
    prompt:
      "Homem 78 anos, 62 kg, ClCr 35 mL/min. Suspeita de meningite bacteriana. Que dose inicial de vancomicina?",
    direct: {
      answer: "1 g EV 12/12h.",
      correct: false,
      note: "Errado. O modelo deu a dose standard sem ajustar à função renal. Resultado: subdose ou toxicidade.",
    },
    cot: {
      steps: [
        "1. Identificar parâmetros: 78a, 62 kg, ClCr 35 (insuficiência renal moderada).",
        "2. Dose de carga padrão: 25–30 mg/kg → 1500–1860 mg.",
        "3. Em ClCr 30–50 mL/min: manter dose de carga, ajustar manutenção.",
        "4. Manutenção: 15–20 mg/kg → 930–1240 mg, mas intervalo alargado (24-36h).",
        "5. Monitorizar Cmin após 3.ª dose; alvo 15–20 mg/L para meningite.",
      ],
      answer:
        "Carga 1500 mg EV (≈25 mg/kg). Manutenção 1000 mg EV cada 24h. Doseamento após 3.ª dose. Confirmar com farmacêutico.",
      correct: true,
      noteHtml:
        "Correcto. Mas <strong>cálculos de dose não devem ser delegados ao LLM</strong> — use calculadora validada (Sanford, UpToDate, módulo do PCE).",
    },
  },
  {
    id: "dd",
    prompt:
      "Mulher 35 anos, sem antecedentes, dor torácica pleurítica de início súbito após viagem longa. SatO2 96 %. Diagnóstico mais provável?",
    direct: {
      answer: "Pleurite. Considerar AINE.",
      correct: false,
      note: "Falha. Saltou o factor crítico — viagem longa eleva fortemente a probabilidade pré-teste de TEP.",
    },
    cot: {
      steps: [
        "1. Listar pistas: dor pleurítica súbita, viagem longa (imobilização), mulher jovem.",
        "2. Aplicar score: Wells PE — viagem (+1.5), dor pleurítica (+1.5), DD provável (+3).",
        "3. Diferenciais: TEP, pneumotórax espontâneo, pleurite vírica, pericardite.",
        "4. TEP é a hipótese mais consequente — falhar custa muito.",
        "5. Investigação imediata: D-dímeros + ECG; se positivos, angio-TC.",
      ],
      answer:
        "Tromboembolismo pulmonar — investigar com D-dímeros e ECG, escalar para angio-TC se necessário. Não é razoável esperar.",
      correct: true,
      noteHtml:
        "Correcto. CoT obrigou o modelo a integrar a viagem como factor de risco em vez de fixar-se na palavra “pleurítica”.",
    },
  },
];

export class ChainOfThought extends IaElement {
  static readonly PREFIX = "ct";

  @property({ type: String }) sc: string = SCENARIOS[0].id;
  @property({ type: String }) md: "direct" | "cot" = "direct";
  @property({ type: Number, state: true }) revealed = 0;

  private timer: number | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearInterval(this.timer);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.sc = readUrlParam(ChainOfThought.PREFIX, "sc", SCENARIOS[0].id) as string;
    this.md = readUrlParam(ChainOfThought.PREFIX, "md", "direct") as
      | "direct"
      | "cot";
  }

  private pickScenario = (id: string) => {
    if (this.timer) window.clearInterval(this.timer);
    this.sc = id;
    this.md = "direct";
    this.revealed = 0;
    writeUrlParam(ChainOfThought.PREFIX, "sc", id);
    writeUrlParam(ChainOfThought.PREFIX, "md", "direct");
  };

  private setMode = (m: "direct" | "cot") => {
    this.md = m;
    writeUrlParam(ChainOfThought.PREFIX, "md", m);
  };

  private runCot = () => {
    if (this.timer) window.clearInterval(this.timer);
    this.revealed = 0;
    this.setMode("cot");
    const sc = SCENARIOS.find((s) => s.id === this.sc)!;
    if (prefersReducedMotion()) {
      this.revealed = sc.cot.steps.length;
      return;
    }
    this.timer = window.setInterval(() => {
      if (this.revealed >= sc.cot.steps.length) {
        if (this.timer) window.clearInterval(this.timer);
        return;
      }
      this.revealed = this.revealed + 1;
    }, 700);
  };

  private setDirect = () => {
    if (this.timer) window.clearInterval(this.timer);
    this.revealed = 0;
    this.setMode("direct");
  };

  protected render() {
    const sc = SCENARIOS.find((s) => s.id === this.sc) ?? SCENARIOS[0];

    return html`
      <div>
        <div class="mb-3 flex flex-wrap gap-2">
          ${SCENARIOS.map(
            (s) => html`<button
              type="button"
              @click=${() => this.pickScenario(s.id)}
              class="${s.id === this.sc
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"} rounded-full border px-3 py-1 text-xs font-medium transition"
            >
              ${s.id === "vanco" ? "Dose vancomicina" : "Dor torácica jovem"}
            </button>`,
          )}
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">
            pergunta
          </div>
          <div class="mt-1 text-sm leading-relaxed text-slate-800">
            ${sc.prompt}
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            @click=${this.setDirect}
            class="${this.md === "direct"
              ? "border-slate-700 bg-white shadow"
              : "border-slate-200 bg-slate-50 hover:border-slate-400"} rounded-lg border-2 p-4 text-left transition"
          >
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              modo directo
            </div>
            <div class="text-sm text-slate-600">
              resposta imediata · gera tokens da resposta directamente
            </div>
          </button>
          <button
            type="button"
            @click=${this.runCot}
            class="${this.md === "cot"
              ? "border-blue-600 bg-blue-50 shadow"
              : "border-slate-200 bg-slate-50 hover:border-slate-400"} rounded-lg border-2 p-4 text-left transition"
          >
            <div
              class="text-xs font-bold uppercase tracking-wider text-blue-700"
            >
              ▶ chain-of-thought · “pensa antes”
            </div>
            <div class="text-sm text-slate-600">
              decompõe em passos · cada passo é texto antes da resposta
            </div>
          </button>
        </div>

        ${this.md === "direct"
          ? html`<div
              class="mt-4 rounded-lg border-l-4 border-red-500 bg-red-50 p-4"
            >
              <div
                class="mb-1 text-xs font-bold uppercase tracking-wider text-red-700"
              >
                resposta directa
              </div>
              <div class="my-2 font-mono text-sm text-slate-800">
                “${sc.direct.answer}”
              </div>
              <p class="text-sm leading-relaxed text-slate-700">
                <span
                  class="${sc.direct.correct
                    ? "text-green-700"
                    : "text-red-700"} font-bold"
                  >${sc.direct.correct ? "✓ Aceitável. " : "✗ Errado. "}</span
                >${sc.direct.note}
              </p>
            </div>`
          : ""}
        ${this.md === "cot"
          ? html`<div
              class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4"
            >
              <div
                class="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700"
              >
                cadeia de raciocínio · token a token
              </div>
              <ol class="space-y-2 font-mono text-xs leading-relaxed">
                ${sc.cot.steps.map(
                  (s, i) => html`<li
                    class="${i < this.revealed
                      ? "text-slate-800 opacity-100"
                      : "text-slate-500 opacity-50"} transition-opacity duration-500"
                  >
                    ${s}
                  </li>`,
                )}
              </ol>

              ${this.revealed >= sc.cot.steps.length
                ? html`<div
                    class="mt-4 rounded border-2 border-blue-300 bg-white p-3"
                  >
                    <div
                      class="text-xs font-bold uppercase tracking-wider text-blue-700"
                    >
                      resposta final
                    </div>
                    <p class="mt-1 font-mono text-sm text-slate-800">
                      ${sc.cot.answer}
                    </p>
                    <p
                      class="mt-2 border-t border-slate-100 pt-2 text-xs leading-relaxed text-slate-600"
                    >
                      ${unsafeHTML(sc.cot.noteHtml)}
                    </p>
                  </div>`
                : ""}
            </div>`
          : ""}

        <p class="mt-4 text-xs italic text-slate-500">
          Modelos com <em>thinking</em> (Claude, o1, Gemini) fazem isto
          internamente, sem mostrar. Mas tu podes forçá-lo em qualquer modelo
          com “<em>Pensa passo a passo antes de responder.</em>” Em clínica,
          dá-te transparência sobre <strong>onde</strong> falhou — não só
          <em>que</em> falhou.
        </p>
      </div>
    `;
  }
}

customElements.define("chain-of-thought", ChainOfThought);
