/**
 * <delegation-demo> · Quando usar · 6 tarefas, 3 níveis de autonomia.
 *
 * Para cada tarefa o utilizador escolhe: autónomo / com revisão / só humano.
 * Botão "revelar" mostra a resposta correcta + porquê.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

type Level = 0 | 1 | 2;

interface Task {
  text: string;
  correct: Level;
  why: string;
}

const TASKS: Task[] = [
  {
    text: "Resumir notas dispersas de uma consulta em pontos para o relatório.",
    correct: 0,
    why: "O resumo é reversível: tu rescreves se não estiver bem. O modelo poupa tempo, tu validas no fim. Autónomo é razoável.",
  },
  {
    text: "Traduzir uma carta de alta para inglês a pedido do doente.",
    correct: 0,
    why: "Tradução é uma das tarefas em que os LLMs são mais fiáveis. O risco é baixo, a reversão é trivial (revisar antes de enviar).",
  },
  {
    text: "Sugerir três diagnósticos diferenciais a partir da história clínica.",
    correct: 1,
    why: "Útil como segunda opinião — mas o output influencia decisão clínica. Tem de passar pelo médico. Revisão humana obrigatória.",
  },
  {
    text: "Calcular dose de vancomicina ajustada a função renal e enviar receita.",
    correct: 2,
    why: "Cálculo de dose é onde os LLMs falham mais (números, unidades, interacções). Combinar com prescrição autónoma é catastrófico se errar. Só humano, com calculadora validada.",
  },
  {
    text: "Marcar consulta de seguimento conforme protocolo da especialidade.",
    correct: 0,
    why: "Acção administrativa, reversível (cancelar e remarcar é trivial). Boa candidata a delegação total.",
  },
  {
    text: "Decidir se o doente tem alta hospitalar.",
    correct: 2,
    why: "Decisão clínica de alto impacto, integra dados que o modelo não vê (impressão clínica, contexto social, capacidade de auto-cuidado). Só humano. O LLM pode preparar a carta — não decidir o momento.",
  },
];

const LABELS: Record<Level, { label: string; sub: string; icon: string }> = {
  0: { label: "Agente sozinho", sub: "autónomo", icon: "🤖" },
  1: { label: "Com revisão", sub: "humano valida", icon: "👁️" },
  2: { label: "Só humano", sub: "modelo não actua", icon: "👤" },
};

export class DelegationDemo extends IaElement {
  @property({ type: Array, state: true }) choices: (Level | null)[] = TASKS.map(
    () => null,
  );
  @property({ type: Boolean, state: true }) revealed = false;

  private pick = (taskIdx: number, level: Level) => {
    if (this.revealed) return;
    const next = [...this.choices];
    next[taskIdx] = level;
    this.choices = next;
  };

  private reveal = () => (this.revealed = true);
  private reset = () => {
    this.choices = TASKS.map(() => null);
    this.revealed = false;
  };

  protected render() {
    const correctCount = this.revealed
      ? this.choices.filter((c, i) => c === TASKS[i].correct).length
      : 0;
    const allPicked = this.choices.every((c) => c !== null);

    return html`
      <div>
        <p class="mb-4 text-sm leading-relaxed text-slate-600">
          Para cada tarefa, escolhe o nível de autonomia que aceitarias.
          Depois revela.
        </p>

        <div class="space-y-3">
          ${TASKS.map((task, i) => {
            const choice = this.choices[i];
            const isCorrect = this.revealed && choice === task.correct;
            const isWrong =
              this.revealed && choice !== null && choice !== task.correct;
            const cls = isCorrect
              ? "border-green-500 bg-green-50"
              : isWrong
                ? "border-red-500 bg-red-50"
                : "border-slate-300";
            return html`<div
              class="${cls} rounded-lg border-l-4 bg-white p-4 shadow-sm"
            >
              <div class="mb-2 flex items-start justify-between gap-3">
                <div class="text-sm font-bold text-slate-900">
                  ${i + 1}. ${task.text}
                </div>
                ${this.revealed
                  ? html`<span
                      class="${isCorrect
                        ? "bg-green-200 text-green-800"
                        : choice === null
                          ? "bg-slate-200 text-slate-700"
                          : "bg-red-200 text-red-800"} shrink-0 rounded-full px-2 py-0.5 text-xs font-bold"
                      >${isCorrect ? "✓" : choice === null ? "—" : "✗"}</span
                    >`
                  : ""}
              </div>

              <div class="grid grid-cols-3 gap-1 sm:gap-2">
                ${([0, 1, 2] as Level[]).map((lvl) => {
                  const meta = LABELS[lvl];
                  const isPicked = choice === lvl;
                  const isAnswer = this.revealed && lvl === task.correct;
                  let cls2 =
                    "border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
                  if (this.revealed) {
                    if (isAnswer)
                      cls2 = "border-green-500 bg-green-100 text-green-800";
                    else if (isPicked)
                      cls2 = "border-red-500 bg-red-100 text-red-800";
                    else cls2 = "border-slate-200 bg-white text-slate-500";
                  } else if (isPicked) {
                    cls2 = "border-blue-500 bg-blue-50 text-blue-700";
                  }
                  return html`<button
                    type="button"
                    @click=${() => this.pick(i, lvl)}
                    ?disabled=${this.revealed}
                    class="${cls2} rounded border px-2 py-2 text-left transition"
                  >
                    <div class="text-base">${meta.icon}</div>
                    <div class="text-xs font-bold">${meta.label}</div>
                    <div class="text-[10px] opacity-70">${meta.sub}</div>
                  </button>`;
                })}
              </div>

              ${this.revealed
                ? html`<div
                    class="mt-3 rounded bg-white p-3 text-xs leading-relaxed text-slate-700"
                  >
                    <span class="font-bold text-slate-900">Porquê: </span>
                    ${task.why}
                  </div>`
                : ""}
            </div>`;
          })}
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-2">
          ${!this.revealed
            ? html`<button
                type="button"
                @click=${this.reveal}
                ?disabled=${!allPicked}
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Revelar respostas
                ${!allPicked
                  ? html`<span class="ml-1 text-xs opacity-70"
                      >(${this.choices.filter((c) => c !== null).length}/${TASKS.length})</span
                    >`
                  : ""}
              </button>`
            : html`<div
                  class="rounded-lg border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700"
                >
                  ${correctCount} / ${TASKS.length} certas
                </div>
                <button
                  type="button"
                  @click=${this.reset}
                  class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Reiniciar
                </button>`}
        </div>
      </div>
    `;
  }
}

customElements.define("delegation-demo", DelegationDemo);
