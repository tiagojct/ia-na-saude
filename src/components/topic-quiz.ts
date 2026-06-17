/**
 * <topic-quiz topic="historia"> · Quiz page · per-topic 4-5 questions
 * with explanations.
 *
 * Pulls quiz data from lib/quizData. Topic id passed as attribute.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { QUIZ_TOPICS, type QuizTopic } from "../lib/quizData";

interface Answer {
  pick: number;
  correct: boolean;
}

export class TopicQuiz extends IaElement {
  @property({ type: String }) topic = "";
  @property({ type: String }) reviewHref = "";

  @property({ type: Number, state: true }) idx = 0;
  @property({ type: Array, state: true }) answers: (Answer | null)[] = [];
  @property({ type: Number, state: true }) pickIdx: number | null = null;
  @property({ type: Boolean, state: true }) showFeedback = false;
  @property({ type: Boolean, state: true }) done = false;

  private getTopic(): QuizTopic | undefined {
    return QUIZ_TOPICS.find((t) => t.id === this.topic);
  }

  connectedCallback(): void {
    super.connectedCallback();
    const t = this.getTopic();
    if (t) this.answers = Array.from({ length: t.questions.length }, () => null);
  }

  private submit = () => {
    const t = this.getTopic();
    if (!t || this.pickIdx === null) return;
    const q = t.questions[this.idx];
    const next = [...this.answers];
    next[this.idx] = { pick: this.pickIdx, correct: this.pickIdx === q.correct };
    this.answers = next;
    this.showFeedback = true;
  };

  private nextQ = () => {
    const t = this.getTopic();
    if (!t) return;
    this.showFeedback = false;
    this.pickIdx = null;
    if (this.idx === t.questions.length - 1) {
      this.done = true;
    } else {
      this.idx = this.idx + 1;
    }
  };

  private reset = () => {
    const t = this.getTopic();
    if (!t) return;
    this.answers = Array.from({ length: t.questions.length }, () => null);
    this.idx = 0;
    this.pickIdx = null;
    this.showFeedback = false;
    this.done = false;
  };

  protected render() {
    const t = this.getTopic();
    if (!t) {
      return html`<div class="text-sm text-red-700">
        Tópico desconhecido: ${this.topic}
      </div>`;
    }

    const total = t.questions.length;

    if (this.done) {
      const correct = this.answers.filter((a) => a?.correct).length;
      const pct = Math.round((correct / total) * 100);
      let msg = "";
      if (pct === 100)
        msg = "Domínio sólido neste tópico. Pronto para a próxima secção.";
      else if (pct >= 75) msg = "Boa base. Revê as perguntas onde falhaste.";
      else if (pct >= 50)
        msg = "Esqueleto está cá, faltam articulações. Volta à secção da aula.";
      else
        msg =
          "Volta à aula antes de avançar. O tópico não está consolidado e não vais notar onde escorregas.";

      return html`<div class="space-y-3">
        <div class="text-3xl font-bold text-slate-900">${correct} / ${total}</div>
        <p
          class="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-sm leading-relaxed text-slate-700"
        >
          ${msg}
        </p>
        <details
          class="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
        >
          <summary class="cursor-pointer font-bold text-slate-700">
            Rever as ${total} respostas
          </summary>
          <ol class="mt-3 space-y-3">
            ${t.questions.map((qq, i) => {
              const a = this.answers[i];
              const ok = a?.correct;
              return html`<li
                class="${ok
                  ? "border-green-400 bg-green-50"
                  : "border-red-400 bg-red-50"} rounded border-l-4 p-3"
              >
                <div
                  class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  Q${i + 1} · ${ok ? "certa" : "errada"}
                </div>
                <div class="mb-1 text-sm font-medium text-slate-900">
                  ${unsafeHTML(qq.q)}
                </div>
                <div class="text-xs text-slate-600">
                  <strong>Correcta:</strong> ${qq.opts[qq.correct]}
                </div>
                <div class="mt-1 text-xs italic text-slate-600">${qq.why}</div>
              </li>`;
            })}
          </ol>
        </details>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            @click=${this.reset}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Repetir
          </button>
          ${this.reviewHref
            ? html`<a
                href=${this.reviewHref}
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 no-underline"
              >
                Rever a secção →
              </a>`
            : ""}
        </div>
      </div>`;
    }

    const q = t.questions[this.idx];

    return html`<div>
      <div class="mb-3 flex items-baseline justify-between">
        <span
          class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >pergunta ${this.idx + 1} / ${total}</span
        >
        <div class="flex gap-1">
          ${t.questions.map((_, i) => {
            const a = this.answers[i];
            const cls =
              a === null
                ? i === this.idx
                  ? "bg-blue-300"
                  : "bg-slate-200"
                : a.correct
                  ? "bg-green-500"
                  : "bg-red-400";
            return html`<span class="${cls} h-1.5 w-6 rounded"></span>`;
          })}
        </div>
      </div>

      <h4 class="mb-4 text-lg font-bold text-slate-900">
        ${unsafeHTML(q.q)}
      </h4>

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
        ? html`<button
            type="button"
            @click=${this.submit}
            ?disabled=${this.pickIdx === null}
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
                  <strong>Errado.</strong> A opção correcta era:
                  <em>${q.opts[q.correct]}</em>. ${q.why}
                </div>`}
            <button
              type="button"
              @click=${this.nextQ}
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
            >
              ${this.idx === total - 1 ? "Ver resultado" : "Próxima →"}
            </button>
          </div>`}
    </div>`;
  }
}

customElements.define("topic-quiz", TopicQuiz);
