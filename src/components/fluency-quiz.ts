/**
 * <fluency-quiz> · Aprofundar · 5 perguntas + calibração de confiança
 * (Dunning-Kruger detector).
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Q {
  q: string;
  opts: string[];
  correct: number;
  why: string;
}

const QUESTIONS: Q[] = [
  {
    q: "Um LLM com temperatura próxima de zero…",
    opts: [
      "Não consegue ser usado em tarefas clínicas.",
      "Escolhe quase sempre o token mais provável — comportamento mais determinista.",
      "Aprende mais rapidamente com novos dados.",
    ],
    correct: 1,
    why: "Temperatura controla a aleatoriedade da amostragem, não o aprender. Próxima de zero = quase determinista, ideal para uso clínico onde queres consistência.",
  },
  {
    q: "Sobre tokens e português:",
    opts: [
      "O português é tokenizado em menos peças que o inglês — é mais barato.",
      "Tokenização não tem impacto no custo — é só pré-processamento.",
      "O português é tokenizado em mais peças porque os tokenizadores foram treinados sobretudo em texto inglês.",
    ],
    correct: 2,
    why: 'O tokenizador BPE foi optimizado em texto inglês. Termos como "pneumonectomia" partem-se em várias subpalavras em pt mas numa só em en.',
  },
  {
    q: "Uma referência produzida por um LLM em medicina deve ser…",
    opts: [
      "Confiada se vier de uma revista de prestígio (e.g., NEJM, Lancet).",
      "Sempre verificada — abrir o DOI ou o PubMed antes de usar.",
      "Confiada se incluir IC 95 % e p-value.",
    ],
    correct: 1,
    why: "A fluência não é evidência. Os LLMs fabricam citações com nomes de revista de prestígio, números plausíveis e DOIs com formato correcto mas inválidos.",
  },
  {
    q: "RAG (retrieval-augmented generation):",
    opts: [
      "Substitui o treino do modelo por uma base de dados.",
      "Adiciona documentos relevantes ao prompt antes de o modelo responder, reduzindo alucinações.",
      "É uma técnica para aumentar a velocidade do modelo.",
    ],
    correct: 1,
    why: "RAG injecta no prompt trechos recuperados de um corpus controlado. Reduz alucinações em 30–60 % em medicina, mas não as elimina. A qualidade do corpus define o tecto.",
  },
  {
    q: "Antes de delegar uma acção a um agente, a heurística mais útil é:",
    opts: [
      "Quanto mais preciso o modelo, mais tarefas pode fazer sozinho.",
      "Se a acção for errada, quanto custa reverter?",
      "Se o agente passa em USMLE, pode prescrever.",
    ],
    correct: 1,
    why: "A delegação cresce com a reversibilidade — não com a precisão. Acções fáceis de reverter (marcar consulta) podem ser autónomas. Acções catastróficas se erradas (prescrever) precisam de autoria humana clara.",
  },
];

type Conf = "low" | "med" | "high";

export class FluencyQuiz extends IaElement {
  @property({ type: Number, state: true }) idx = 0;
  @property({ type: Array, state: true }) answers: (
    { pick: number; conf: Conf } | null
  )[] = QUESTIONS.map(() => null);
  @property({ type: Number, state: true }) pickIdx: number | null = null;
  @property({ type: String, state: true }) conf: Conf | null = null;
  @property({ type: Boolean, state: true }) showFeedback = false;
  @property({ type: Boolean, state: true }) done = false;

  private submit = () => {
    if (this.pickIdx === null || this.conf === null) return;
    const next = [...this.answers];
    next[this.idx] = { pick: this.pickIdx, conf: this.conf };
    this.answers = next;
    this.showFeedback = true;
  };

  private nextQ = () => {
    this.showFeedback = false;
    this.pickIdx = null;
    this.conf = null;
    if (this.idx === QUESTIONS.length - 1) {
      this.done = true;
    } else {
      this.idx = this.idx + 1;
    }
  };

  private reset = () => {
    this.answers = QUESTIONS.map(() => null);
    this.idx = 0;
    this.pickIdx = null;
    this.conf = null;
    this.showFeedback = false;
    this.done = false;
  };

  protected render() {
    if (this.done) {
      const correct = this.answers.filter(
        (a, i) => a && a.pick === QUESTIONS[i].correct,
      ).length;
      const highWrong = this.answers.filter(
        (a, i) => a && a.conf === "high" && a.pick !== QUESTIONS[i].correct,
      ).length;
      const lowRight = this.answers.filter(
        (a, i) => a && a.conf === "low" && a.pick === QUESTIONS[i].correct,
      ).length;

      let msg = "";
      if (correct === 5)
        msg = "Domínio sólido. Pronto para usar IA na clínica com vigilância adulta.";
      else if (correct === 4)
        msg = "Bom alicerce. Revê as perguntas onde escorregaste: provavelmente é onde mais facilmente vais cair em prática.";
      else if (correct >= 2)
        msg = "Tens o esqueleto. Volta às secções correspondentes; cada erro corresponde a uma decisão que vais tomar a sério em medicina.";
      else
        msg = "Sem pressa. Volta à aula. A IA em medicina recompensa quem se demora a aprender, e penaliza quem decide depressa.";

      return html`<div class="space-y-3">
        <div class="text-3xl font-bold text-slate-900">
          ${correct} / ${QUESTIONS.length}
        </div>
        <p
          class="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-sm leading-relaxed text-slate-700"
        >
          ${msg}
        </p>
        <div
          class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm"
        >
          <div class="mb-2 font-bold text-slate-900">
            Calibração de confiança
          </div>
          ${highWrong > 0
            ? html`<p class="mb-2 rounded bg-amber-100 p-2 text-amber-900">
                <strong>${highWrong}</strong> com alta confiança e erradas:
                território Dunning-Kruger. São onde mais provavelmente erras em
                prática.
              </p>`
            : ""}
          ${lowRight > 0
            ? html`<p class="mb-2 rounded bg-slate-100 p-2 text-slate-700">
                <strong>${lowRight}</strong> com baixa confiança e acertaste:
                provavelmente sorte. Revê os conceitos correspondentes.
              </p>`
            : ""}
          ${highWrong === 0 && lowRight === 0
            ? html`<p class="rounded bg-green-100 p-2 text-green-900">
                Calibração saudável: o que dizes saber, sabes mesmo.
              </p>`
            : ""}
        </div>
        <button
          type="button"
          @click=${this.reset}
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Tentar novamente
        </button>
      </div>`;
    }

    const q = QUESTIONS[this.idx];
    const currentAnswer = this.answers[this.idx];

    return html`<div>
      <div
        class="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500"
      >
        pergunta ${this.idx + 1} / ${QUESTIONS.length}
      </div>
      <h4 class="mb-4 text-lg font-bold text-slate-900">${q.q}</h4>

      <div class="space-y-2">
        ${q.opts.map((o, i) => {
          let cls = "border-slate-200 bg-white hover:border-slate-300";
          if (this.showFeedback) {
            if (i === q.correct) cls = "border-green-500 bg-green-50";
            else if (this.pickIdx === i) cls = "border-red-500 bg-red-50";
            else cls = "border-slate-200 bg-white opacity-60";
          } else if (this.pickIdx === i) {
            cls = "border-blue-500 bg-blue-50";
          }
          return html`<button
            type="button"
            ?disabled=${this.showFeedback}
            @click=${() => (this.pickIdx = i)}
            class="${cls} block w-full rounded-lg border-2 p-3 text-left text-sm transition"
          >
            ${o}
          </button>`;
        })}
      </div>

      ${!this.showFeedback
        ? html`<div class="mt-4">
              <div
                class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Antes de submeter · qual a tua confiança?
              </div>
              <div class="flex flex-wrap gap-2">
                ${(
                  [
                    { v: "low", label: "Baixa · estou a chutar" },
                    { v: "med", label: "Média · acho que sei" },
                    { v: "high", label: "Alta · tenho a certeza" },
                  ] as Array<{ v: Conf; label: string }>
                ).map(
                  (c) => html`<button
                    type="button"
                    @click=${() => (this.conf = c.v)}
                    class="${this.conf === c.v
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"} rounded-full border px-3 py-1 text-xs font-medium"
                  >
                    ${c.label}
                  </button>`,
                )}
              </div>
            </div>

            <button
              type="button"
              @click=${this.submit}
              ?disabled=${this.pickIdx === null || this.conf === null}
              class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Confirmar
            </button>`
        : html`<div class="mt-4 space-y-3">
            ${this.pickIdx === q.correct
              ? html`<div
                  class="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 text-sm text-slate-700"
                >
                  <strong>Certo.</strong> ${q.why}
                </div>`
              : html`<div
                  class="rounded-lg border-l-4 border-red-500 bg-red-50 p-3 text-sm text-slate-700"
                >
                  <strong>Errado.</strong> ${q.why}
                </div>`}
            ${currentAnswer?.conf === "high" && this.pickIdx !== q.correct
              ? html`<div
                  class="rounded bg-amber-100 px-3 py-2 text-xs text-amber-900"
                >
                  ⚠ Alta confiança + errado: território Dunning-Kruger.
                  Atenção a este tópico.
                </div>`
              : ""}
            ${currentAnswer?.conf === "low" && this.pickIdx === q.correct
              ? html`<div
                  class="rounded bg-slate-100 px-3 py-2 text-xs text-slate-700"
                >
                  Baixa confiança + acertaste: pode ser sorte. Revê o conceito.
                </div>`
              : ""}
            ${currentAnswer?.conf === "high" && this.pickIdx === q.correct
              ? html`<div
                  class="rounded bg-green-100 px-3 py-2 text-xs text-green-900"
                >
                  Alta confiança + acertaste: calibração saudável.
                </div>`
              : ""}
            <button
              type="button"
              @click=${this.nextQ}
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              ${this.idx === QUESTIONS.length - 1
                ? "Ver resultado"
                : "Próxima →"}
            </button>
          </div>`}
    </div>`;
  }
}

customElements.define("fluency-quiz", FluencyQuiz);
