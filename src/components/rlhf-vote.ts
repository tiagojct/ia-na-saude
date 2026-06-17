/**
 * <rlhf-vote> · Treino · 3 pares A/B, revela perfil generalista vs clínico
 * no fim. URL state para o índice corrente.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

interface Pair {
  prompt: string;
  a: string;
  b: string;
  genPct: number;
  clinPct: number;
  takeaway: string;
}

const PAIRS: Pair[] = [
  {
    prompt: "Maria, 64 anos, HTA + DM2, dor torácica há 30 minutos. Próximo passo?",
    a: "Sou um modelo de linguagem e não posso prestar aconselhamento médico. Os sintomas descritos podem indicar uma condição grave. Recomendo procurar atenção médica de urgência (112) ou dirigir-se ao serviço de urgência mais próximo.",
    b: "ECG 12 derivações <10 min, troponina I seriada (0/3h), AAS 300 mg PO mastigado salvo CI. Estratificar por GRACE/TIMI. Se elevação ST → activar STEMI pathway e contactar hemodinâmica.",
    genPct: 84,
    clinPct: 12,
    takeaway:
      "Aqui o tom certo depende do leitor. Para um doente, A é apropriada. Para um colega, B é o que se espera. O ChatGPT, treinado por generalistas, escolhe sempre A — mesmo quando quem pergunta é claramente clínico.",
  },
  {
    prompt: "Tratamento empírico de pneumonia adquirida na comunidade num adulto sem comorbilidades?",
    a: "O tratamento da pneumonia adquirida na comunidade depende de vários factores, como gravidade, idade, comorbilidades e factores de risco para microrganismos resistentes. Recomendo consultar um médico para avaliação adequada e prescrição. Não tome antibióticos sem indicação clínica.",
    b: "CURB-65 para gravidade. Ambulatório (0–1): amoxicilina 1 g PO 8/8h, 5 dias; alternativa doxiciclina 100 mg 12/12h. Internamento (≥2): ceftriaxone 2 g EV + macrolido. Reavaliar 48–72 h.",
    genPct: 78,
    clinPct: 9,
    takeaway:
      'Para uma pergunta tecnicamente clínica, B é a única resposta útil — A é equivalente a "vai ao médico". Mas A é a que o anotador generalista vota, e portanto a que o modelo aprende a preferir.',
  },
  {
    prompt: "Posso tomar este antibiótico que sobrou da minha mãe?",
    a: "Compreendo a tua preocupação, mas é importante não tomar medicação prescrita a outra pessoa, mesmo um familiar próximo. Cada antibiótico é receitado para uma situação clínica específica. Recomendo-te que consultes o teu médico ou farmacêutico antes de qualquer decisão.",
    b: "Não. Antibióticos não são intermutáveis: dose, duração e espectro são específicos para a infecção, microrganismo provável e o doente (peso, função renal, alergias, gravidez). Tomar antibiótico antigo é ineficaz, mascara sintomas e promove resistências.",
    genPct: 68,
    clinPct: 41,
    takeaway:
      "Pergunta de leigo: ambos os anotadores gostam de A. Mas os clínicos dividem-se — muitos acham B mais educativo (explica porquê).",
  },
];

export class RLHFVote extends IaElement {
  static readonly PREFIX = "rl";

  @property({ type: Number }) i = 0;
  @property({ type: Array, state: true }) votes: ("a" | "b" | null)[] =
    PAIRS.map(() => null);
  @property({ type: Boolean, state: true }) done = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.i = readUrlParam(RLHFVote.PREFIX, "i", 0) as number;
  }

  private vote = (choice: "a" | "b") => {
    const next = [...this.votes];
    next[this.i] = choice;
    this.votes = next;
  };

  private nextPair = () => {
    if (this.i === PAIRS.length - 1) {
      this.done = true;
    } else {
      this.i = this.i + 1;
      writeUrlParam(RLHFVote.PREFIX, "i", this.i);
    }
  };

  private reset = () => {
    this.votes = PAIRS.map(() => null);
    this.i = 0;
    this.done = false;
    writeUrlParam(RLHFVote.PREFIX, "i", 0);
  };

  protected render() {
    if (this.done) {
      const bVotes = this.votes.filter((v) => v === "b").length;
      const total = this.votes.length;
      const clinPct = Math.round((bVotes / total) * 100);
      const isClin = bVotes > total / 2;
      return html`<div class="space-y-3">
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500">
          resultado
        </div>
        <div class="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div class="mb-2 text-lg font-bold text-slate-900">
            ${isClin
              ? `Votaste como um clínico (${clinPct} % das vezes).`
              : `Votaste como um generalista (${100 - clinPct} % das vezes).`}
          </div>
          <p class="text-sm leading-relaxed text-slate-700">
            ${isClin
              ? `A tua intuição alinha com o que um anotador médico marcaria como “melhor resposta” — e diverge da escolha mediana de um anotador generalista.`
              : "As tuas escolhas alinham com o que um anotador sem formação clínica preferiria — exactamente o perfil dos rotuladores que treinam o ChatGPT."}
          </p>
        </div>
        <p class="text-sm leading-relaxed text-slate-700">
          O ChatGPT foi treinado com cerca de 30 000 pares destes, votados
          <strong>maioritariamente por generalistas</strong>. Mudar quem
          vota — e só isso — produz um modelo com voz clínica diferente.
        </p>
        <button
          type="button"
          @click=${this.reset}
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Reiniciar
        </button>
      </div>`;
    }

    const pair = PAIRS[this.i];
    const current = this.votes[this.i];

    return html`
      <div>
        <div class="mb-3 flex items-baseline justify-between">
          <span
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >par ${this.i + 1} / ${PAIRS.length}</span
          >
        </div>

        <div class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            prompt
          </div>
          <div class="mt-1 text-sm text-slate-800">${pair.prompt}</div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            @click=${() => this.vote("a")}
            class="${current === "a"
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"} rounded-lg border p-4 text-left transition"
          >
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              opção A
            </div>
            <p class="text-sm leading-relaxed text-slate-700">${pair.a}</p>
          </button>
          <button
            type="button"
            @click=${() => this.vote("b")}
            class="${current === "b"
              ? "border-blue-500 bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"} rounded-lg border p-4 text-left transition"
          >
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              opção B
            </div>
            <p class="text-sm leading-relaxed text-slate-700">${pair.b}</p>
          </button>
        </div>

        ${current
          ? html`<div class="mt-4 space-y-3">
              <div
                class="rounded-lg border border-slate-200 bg-white p-4 text-sm"
              >
                <div class="mb-2 grid grid-cols-2 gap-3 text-center">
                  <div class="rounded bg-slate-50 p-2">
                    <div class="text-xs uppercase text-slate-500">A</div>
                    <div class="text-xs">
                      generalistas: <strong>${pair.genPct} %</strong>
                    </div>
                    <div class="text-xs">
                      clínicos: <strong>${pair.clinPct} %</strong>
                    </div>
                  </div>
                  <div class="rounded bg-slate-50 p-2">
                    <div class="text-xs uppercase text-slate-500">B</div>
                    <div class="text-xs">
                      generalistas: <strong>${100 - pair.genPct} %</strong>
                    </div>
                    <div class="text-xs">
                      clínicos: <strong>${100 - pair.clinPct} %</strong>
                    </div>
                  </div>
                </div>
                <p class="leading-relaxed text-slate-700">${pair.takeaway}</p>
              </div>
              <button
                type="button"
                @click=${this.nextPair}
                class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
              >
                ${this.i === PAIRS.length - 1
                  ? "Ver resultado"
                  : "Próximo par →"}
              </button>
            </div>`
          : ""}
      </div>
    `;
  }
}

customElements.define("rlhf-vote", RLHFVote);
