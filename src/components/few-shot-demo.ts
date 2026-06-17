/**
 * <few-shot-demo> · Prompts · 0/1/3/5 exemplos antes da nota a codificar.
 *
 * Acuidade simulada por matrix hardcoded. Mostra como acuidade evolui
 * com K exemplos no prompt.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

interface Note {
  text: string;
  trueCode: string;
}

const NOTES: Note[] = [
  {
    text: "Doente com tosse produtiva há 5 dias, febre 38.5°C, crepitações na base direita. Rx: condensação.",
    trueCode: "J18.1 · pneumonia lobar",
  },
  {
    text: "Sibilos bilaterais, dispneia, doente conhecida da pneumologia, refratária a SABA. Sat 91 %.",
    trueCode: "J45.901 · asma com exacerbação aguda",
  },
  {
    text: "Doente HTA + DM2, dor torácica há 1h, irradiada, sudorese. ECG: supra ST em V2-V4. Trop elevada.",
    trueCode: "I21.0 · enfarte agudo do miocárdio anterior",
  },
  {
    text: "Mulher 28a, queimação retroesternal pós-prandial, melhora com IBP. Sem disfagia.",
    trueCode: "K21.9 · doença de refluxo gastroesofágico",
  },
  {
    text: "Edema dos MI, dispneia de esforço, S3 audível, RX com congestão. Pró-BNP 4500.",
    trueCode: "I50.1 · insuficiência cardíaca esquerda",
  },
];

const EXAMPLES: Note[] = [
  {
    text: "Doente HTA + DM2, dor torácica irradiada para braço esquerdo, sudorese, ECG com supra ST.",
    trueCode: "I21.9 · enfarte agudo do miocárdio",
  },
  {
    text: "Doente com sibilos, dispneia paroxística, melhora com salbutamol.",
    trueCode: "J45.909 · asma sem complicações",
  },
  {
    text: "Doente com tosse, febre, crepitações lobares, Rx com condensação.",
    trueCode: "J18.9 · pneumonia adquirida na comunidade",
  },
  {
    text: "Doente diabético com hiperglicemia mantida, HbA1c 9.5 %, sem cetose.",
    trueCode: "E11.65 · DM2 com hiperglicemia",
  },
  {
    text: "Edema MI, congestão pulmonar, S3, pró-BNP elevado.",
    trueCode: "I50.9 · insuficiência cardíaca",
  },
];

const ACCURACY_MATRIX: Record<number, boolean[]> = {
  0: [false, false, true, true, true, true],
  1: [false, true, true, true, true, true],
  2: [false, false, false, true, true, true],
  3: [false, false, false, false, true, true],
  4: [false, false, true, true, true, true],
};

function getCorrect(k: number, noteIdx: number): boolean {
  return ACCURACY_MATRIX[noteIdx][Math.min(k, 5)];
}

const PRESETS = [
  { k: 0, label: "zero-shot", sub: "sem exemplos" },
  { k: 1, label: "1-shot", sub: "1 exemplo" },
  { k: 3, label: "3-shot", sub: "3 exemplos" },
  { k: 5, label: "5-shot", sub: "5 exemplos" },
];

export class FewShotDemo extends IaElement {
  static readonly PREFIX = "fs";

  @property({ type: Number }) k = 0;
  @property({ type: Number }) n = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.k = readUrlParam(FewShotDemo.PREFIX, "k", 0) as number;
    this.n = readUrlParam(FewShotDemo.PREFIX, "n", 0) as number;
  }

  private setK = (v: number) => {
    this.k = v;
    writeUrlParam(FewShotDemo.PREFIX, "k", v);
  };

  private setN = (v: number) => {
    this.n = v;
    writeUrlParam(FewShotDemo.PREFIX, "n", v);
  };

  protected render() {
    const note = NOTES[this.n];
    const correct = getCorrect(this.k, this.n);
    const accuracyAll = NOTES.map((_, i) => getCorrect(this.k, i)).filter(
      Boolean,
    ).length;
    const accuracyPct = Math.round((accuracyAll / NOTES.length) * 100);

    return html`
      <div>
        <p class="mb-3 text-sm leading-relaxed text-slate-600">
          Tarefa: codificar uma nota clínica em <strong>ICD-10</strong>. O
          modelo é o mesmo em todos os casos — só muda o número de exemplos
          que vê no prompt antes da nota a codificar.
        </p>

        <div class="mb-4 grid gap-1 sm:grid-cols-4">
          ${PRESETS.map(
            (p) => html`<button
              type="button"
              @click=${() => this.setK(p.k)}
              class="${this.k === p.k
                ? "border-blue-600 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"} rounded-lg border-2 p-2 text-center transition"
            >
              <div
                class="${this.k === p.k
                  ? "text-blue-700"
                  : "text-slate-700"} text-sm font-bold"
              >
                ${p.label}
              </div>
              <div class="text-xs text-slate-500">${p.sub}</div>
            </button>`,
          )}
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            prompt enviado ao modelo
          </div>

          ${this.k > 0
            ? html`<div class="mt-2 space-y-2">
                <div
                  class="text-[10px] font-bold uppercase tracking-wider text-blue-700"
                >
                  exemplos no prompt (${this.k})
                </div>
                ${EXAMPLES.slice(0, this.k).map(
                  (ex) => html`<div
                    class="rounded border border-blue-200 bg-blue-50 p-2 font-mono text-xs"
                  >
                    <div class="text-slate-700">
                      <span class="text-blue-700">Nota:</span> ${ex.text}
                    </div>
                    <div class="mt-1 text-slate-700">
                      <span class="text-blue-700">Código:</span>
                      <strong>${ex.trueCode}</strong>
                    </div>
                  </div>`,
                )}
              </div>`
            : ""}

          <div
            class="mt-3 rounded border-2 border-amber-300 bg-amber-50 p-2"
          >
            <div
              class="mb-1 text-[10px] font-bold uppercase tracking-wider text-amber-700"
            >
              nota a codificar
            </div>
            <div class="font-mono text-sm text-slate-800">${note.text}</div>
          </div>
        </div>

        <div class="mt-2 flex flex-wrap gap-1">
          ${NOTES.map(
            (_, i) => html`<button
              type="button"
              @click=${() => this.setN(i)}
              class="${i === this.n
                ? "bg-slate-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"} rounded px-2 py-0.5 text-xs"
              aria-label="nota ${i + 1}"
            >
              nota ${i + 1}
            </button>`,
          )}
        </div>

        <div
          class="${correct
            ? "border-green-500 bg-green-50"
            : "border-red-500 bg-red-50"} mt-4 rounded-lg border-l-4 p-4"
        >
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            resposta do modelo (esta nota)
          </div>
          <div class="font-mono text-sm">
            ${correct
              ? html`<span class="font-bold text-green-800"
                  >✓ ${note.trueCode}</span
                >`
              : html`<span class="font-bold text-red-800"
                  >✗ ${this.k === 0
                    ? "J18 · pneumonia (não-específica)"
                    : "código próximo, mas errado de subcategoria"}</span
                >`}
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div class="mb-2 flex items-baseline justify-between">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
              >acuidade em ${NOTES.length} notas</span
            >
            <span class="font-mono text-2xl font-bold text-blue-700"
              >${accuracyPct}%</span
            >
          </div>
          <div class="flex gap-1">
            ${NOTES.map(
              (_, i) => html`<div
                class="${getCorrect(this.k, i)
                  ? "bg-green-500"
                  : "bg-red-300"} h-3 flex-1 rounded"
                title="nota ${i + 1}: ${getCorrect(this.k, i) ? "✓" : "✗"}"
              ></div>`,
            )}
          </div>
        </div>

        <p class="mt-4 text-xs italic text-slate-500">
          <em>Few-shot learning</em>: o modelo aprende o padrão em segundos a
          partir de poucos exemplos. Sem fine-tuning, sem treino. Custa só
          mais tokens no prompt. Para codificação clínica, 3-5 exemplos
          rotulados bem escolhidos costumam bater zero-shot por uma boa
          margem — e permitem corrigir o output para o vocabulário local.
        </p>
      </div>
    `;
  }
}

customElements.define("few-shot-demo", FewShotDemo);
