/**
 * <gdpr-quiz> · Privacidade · 3 variantes, mastery learning (2 acertos
 * consecutivos para dominar). Shuffled options.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

interface Option {
  text: string;
  correct: boolean;
  fb: string;
}

interface Variant {
  stem: string;
  options: Option[];
}

const VARIANTS: Variant[] = [
  {
    stem: "Tens uma nota de alta com nome, morada, idade, diagnósticos e exames. Queres usar um LLM público para traduzir o resumo. Qual é a opção certa?",
    options: [
      { text: "Colas tudo. O fornecedor tem política de privacidade, está coberto.", correct: false, fb: "Política de privacidade não é o mesmo que conformidade com o RGPD. Mesmo sem treino, transferes dados pessoais de saúde para um terceiro sem base legal nem consentimento." },
      { text: "Tiras o nome e o apelido, mas mantens morada e idade exacta.", correct: false, fb: "Insuficiente. Morada + idade exacta + diagnóstico + localidade reidentificam com facilidade. O RGPD considera pseudonimização ainda como dados pessoais." },
      { text: "Usas dados sintéticos, ou removes identificadores directos e indirectos antes de colar.", correct: true, fb: "Defensável. Anonimização real cobre directos (nome, NIF) e indirectos (morada, idade exacta, datas, profissão rara). Para dados sensíveis: modelo local ou contrato com BAA." },
      { text: 'Colas tudo, mas avisas o LLM que é confidencial.', correct: false, fb: 'Dizer "isto é confidencial" não tem efeito legal nem técnico. Os dados saem da instituição na mesma.' },
    ],
  },
  {
    stem: "Vais pedir ao ChatGPT um resumo de uma nota com nome, NIF, idade exacta e diagnósticos múltiplos. Qual é a opção segura?",
    options: [
      { text: "Substituis o nome por iniciais (M.S.) e mantens NIF, idade e diagnósticos.", correct: false, fb: "Iniciais não são anonimização. NIF é identificador directo. Idade exacta + diagnósticos múltiplos é uma assinatura única." },
      { text: "Garantes que a tua conta paga não treina e colas tal qual.", correct: false, fb: "Opt-out de treino reduz risco residual mas não elimina a transferência ilegal de dados pessoais de saúde para terceiro sem base legal." },
      { text: "Substituis nome+NIF+idade exacta por placeholders ([NOME], [ID], [GRUPO ETÁRIO]); revês se a combinação restante reidentifica.", correct: true, fb: "Correcto. Placeholders + reavaliação da combinação restante. Se um diagnóstico raro num distrito pequeno ainda identifica, anonimização não chega: usa modelo local." },
      { text: 'Pedes ao ChatGPT para "esquecer" a conversa no final.', correct: false, fb: 'O modelo não tem memória entre sessões, mas isso não muda o problema: os dados foram transferidos. "Esquecer" não desfaz uma transferência.' },
    ],
  },
  {
    stem: "Colaste por engano uma nota com PII num LLM público. Qual é o passo seguinte certo?",
    options: [
      { text: "Não mexes; o fornecedor garante deleção em 30 dias na política.", correct: false, fb: "Mesmo que delete, a transferência sem base legal já ocorreu. RGPD requer acção independentemente da política do fornecedor." },
      { text: "Apagas a conversa do histórico e dás o assunto por resolvido.", correct: false, fb: "Apagar do teu lado não recolhe os dados que já saíram. E não satisfaz o dever de notificar." },
      { text: "Mudas a password da tua conta.", correct: false, fb: "Irrelevante para o incidente. O problema é a transferência, não o acesso à conta." },
      { text: "Consideras data breach: notificas EPD e CNPD se aplicável, documentas, avalias risco para o titular.", correct: true, fb: "Correcto. RGPD art. 33 exige notificação à autoridade de controlo em 72 h se houver risco para direitos e liberdades. Documentar é mandatório, mesmo que decidas não notificar (com justificação)." },
    ],
  },
];

const HITS_NEEDED = 2;

function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export class GDPRQuiz extends IaElement {
  static readonly PREFIX = "gq";

  @property({ type: Number }) v = 0;
  @property({ type: Array, state: true }) shuffledOpts: number[] = shuffleIndices(4);
  @property({ type: Number, state: true }) picked: number | null = null;
  @property({ type: Number, state: true }) consec = 0;
  @property({ type: Boolean, state: true }) done = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.v = readUrlParam(GDPRQuiz.PREFIX, "v", 0) as number;
  }

  private pick = (displayIdx: number) => {
    if (this.picked !== null) return;
    const variant = VARIANTS[this.v];
    const opt = variant.options[this.shuffledOpts[displayIdx]];
    this.picked = displayIdx;
    if (opt.correct) {
      this.consec = this.consec + 1;
      if (this.consec >= HITS_NEEDED) {
        setTimeout(() => (this.done = true), 1500);
      }
    } else {
      this.consec = 0;
    }
  };

  private nextVariant = () => {
    this.v = (this.v + 1) % VARIANTS.length;
    writeUrlParam(GDPRQuiz.PREFIX, "v", this.v);
    this.shuffledOpts = shuffleIndices(4);
    this.picked = null;
  };

  private retry = () => {
    this.shuffledOpts = shuffleIndices(4);
    this.picked = null;
  };

  private reset = () => {
    this.v = 0;
    writeUrlParam(GDPRQuiz.PREFIX, "v", 0);
    this.shuffledOpts = shuffleIndices(4);
    this.picked = null;
    this.consec = 0;
    this.done = false;
  };

  protected render() {
    if (this.done) {
      return html`<div class="space-y-3">
        <div class="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
          <div class="mb-2 text-lg font-bold text-slate-900">Dominado.</div>
          <p class="text-sm leading-relaxed text-slate-700">
            Acertaste ${HITS_NEEDED} variantes seguidas e o conceito ficou
            consolidado. Anonimizar a sério é tirar identificadores directos
            <strong>e</strong> indirectos, depois reavaliar a combinação
            restante. “Política do fornecedor” e “avisar o LLM” não têm efeito
            legal.
          </p>
        </div>
        <button
          type="button"
          @click=${this.reset}
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Recomeçar
        </button>
      </div>`;
    }

    const variant = VARIANTS[this.v];
    const opts = this.shuffledOpts.map((i) => variant.options[i]);

    return html`<div>
      <div class="mb-3 flex items-baseline justify-between">
        <span
          class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >variante ${this.v + 1} / ${VARIANTS.length}</span
        >
        <span class="text-xs text-slate-500"
          >acertos consecutivos:
          <strong class="text-blue-600"
            >${this.consec} / ${HITS_NEEDED}</strong
          ></span
        >
      </div>

      <div class="mb-1 flex gap-1">
        ${Array.from(
          { length: HITS_NEEDED },
          (_, i) => html`<div
            class="${i < this.consec
              ? "bg-green-500"
              : "bg-slate-200"} h-1.5 flex-1 rounded"
          ></div>`,
        )}
      </div>

      <p class="my-4 text-sm leading-relaxed text-slate-800">${variant.stem}</p>

      <div class="space-y-2">
        ${opts.map((o, i) => {
          const isPicked = this.picked === i;
          let cls = "border-slate-200 bg-white hover:border-slate-300";
          if (this.picked !== null) {
            if (o.correct) cls = "border-green-500 bg-green-50";
            else if (isPicked) cls = "border-red-500 bg-red-50";
            else cls = "border-slate-200 bg-white opacity-60";
          }
          return html`<button
            type="button"
            @click=${() => this.pick(i)}
            ?disabled=${this.picked !== null}
            class="${cls} block w-full rounded-lg border-2 p-3 text-left text-sm transition"
          >
            ${o.text}
          </button>`;
        })}
      </div>

      ${this.picked !== null
        ? html`<div class="mt-4 space-y-3">
            <div
              class="${opts[this.picked].correct
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"} rounded-lg border-l-4 p-3 text-sm leading-relaxed text-slate-700"
            >
              <strong>${opts[this.picked].correct ? "Certo. " : "Errado. "}</strong
              >${opts[this.picked].fb}
            </div>
            <div class="flex gap-2">
              ${opts[this.picked].correct
                ? html`<button
                    type="button"
                    @click=${this.nextVariant}
                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Próxima variante →
                  </button>`
                : html`<button
                    type="button"
                    @click=${this.retry}
                    class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Tenta de novo ↻
                  </button>`}
            </div>
          </div>`
        : ""}
    </div>`;
  }
}

customElements.define("gdpr-quiz", GDPRQuiz);
