/**
 * <three-stages> · Treino · liga/desliga pré-treino + SFT + RLHF.
 *
 * 3 prompts · 3 fases. Cada fase é um string com o output ilustrativo
 * do modelo nessa altura. O output mostrado é da última fase ligada.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Prompt {
  text: string;
  stages: [string, string, string];
}

const PROMPTS: Prompt[] = [
  {
    text: "Maria, 64 anos, HTA + DM2, dor torácica. Próximo passo?",
    stages: [
      "? Tem irradiação para o braço esquerdo? Tem náuseas?\n\nPergunta seguinte: Qual é a TA no momento? Que medicação domiciliária toma?\n\nVer também: Síndrome coronária aguda — Wikipédia. Índice: 1. Definição. 2. Epidemiologia. 3. Fisiopatologia.",
      "ECG de 12 derivações em <10 min. Troponina I seriada (0 e 3 h). Acesso EV, monitorização cardíaca contínua, O₂ se SatO₂ <90 %. AAS 300 mg PO mastigado, salvo contra-indicação. Estratificação de risco (GRACE, TIMI). Se SCA confirmada, contactar hemodinâmica.",
      "Sou um modelo de linguagem e não posso prestar aconselhamento médico. Os sintomas descritos podem indicar uma condição grave que necessita de avaliação urgente. Recomendo contactar o 112 ou dirigir-se ao serviço de urgência mais próximo. ⚠️",
    ],
  },
  {
    text: "Como tratar pneumonia adquirida na comunidade?",
    stages: [
      "? Que antibiótico? Em ambulatório ou internamento?\n\nPergunta relacionada: Qual a diferença entre PAC e pneumonia nosocomial?\n\nVer também: Streptococcus pneumoniae, Mycoplasma pneumoniae, vacina pneumocócica conjugada 13.",
      "Estratificar gravidade (CURB-65 ou CRB-65). Ambulatório (CURB-65 0–1): amoxicilina 1 g PO 8/8h, 5 dias; alternativa doxiciclina 100 mg 12/12h. Internamento (≥2): ceftriaxone 2 g EV + macrolido (azitromicina 500 mg). UCI: associar cobertura atípica. Reavaliar 48–72 h.",
      "O tratamento da pneumonia adquirida na comunidade depende de vários factores como gravidade, idade, comorbilidades e factores de risco para microrganismos resistentes. Aconselho-te a consultar um médico para avaliação clínica e prescrição adequada. Não tomes antibióticos sem indicação.",
    ],
  },
  {
    text: "Posso tomar este antibiótico que sobrou da minha mãe?",
    stages: [
      "? Sim ou não?\n\nResponder a este tópico:\n@anonimo123: Eu tomei e correu bem, não custa nada experimentar.\n@enf_maria_pt: Depende do antibiótico, mas eu não recomendaria sem prescrição.\n@drsilva_md: Como médico, gostaria de alertar para…",
      "Não. Antibióticos não são intermutáveis: dose, duração e espectro têm de ser específicos para a infecção, microrganismo provável e características do doente (peso, função renal, alergias, gravidez). Tomar antibiótico antigo é ineficaz, mascara sintomas e promove resistências.",
      "Compreendo a tua preocupação, mas é importante não tomar medicação prescrita a outra pessoa, mesmo um familiar próximo. Cada antibiótico é receitado para uma situação clínica específica. Recomendo-te que consultes o teu médico ou farmacêutico antes de qualquer decisão. 💙",
    ],
  },
];

const STAGE_LABELS = [
  {
    title: "fase 1 · só pré-treino",
    sub: "biliões de frases · zero supervisão",
    behavior:
      "predicador de texto. Continua a frase como continuaria um fórum ou um livro.",
  },
  {
    title: "fase 2 · + SFT",
    sub: "milhares de exemplos prompt → resposta",
    behavior:
      "assistente bruto. Tem o formato. Sem filtros, sem cautelas, sem encaminhamentos.",
  },
  {
    title: "fase 3 · + RLHF",
    sub: "humanos votam preferências",
    behavior:
      "assistente alinhado. Recusa, hesita, encaminha. É o ChatGPT que conheces.",
  },
];

export class ThreeStages extends IaElement {
  @property({ type: Number, state: true }) promptIdx = 0;
  @property({ type: Array, state: true }) stages: boolean[] = [true, false, false];

  private toggleStage = (i: number) => {
    const next = [...this.stages];
    next[i] = !next[i];
    this.stages = next;
  };

  protected render() {
    const prompt = PROMPTS[this.promptIdx];
    const lastEnabled = this.stages.lastIndexOf(true);
    const output =
      lastEnabled >= 0
        ? prompt.stages[lastEnabled]
        : "(activa pelo menos uma fase)";

    return html`
      <div>
        <div class="mb-3 flex flex-wrap gap-2">
          ${PROMPTS.map(
            (p, i) => html`<button
              type="button"
              @click=${() => (this.promptIdx = i)}
              class="${i === this.promptIdx
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"} rounded-full border px-3 py-1 text-xs font-medium transition"
            >
              ${p.text.length > 40 ? p.text.slice(0, 38) + "…" : p.text}
            </button>`,
          )}
        </div>

        <div class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            prompt
          </div>
          <div class="mt-1 text-sm text-slate-800">${prompt.text}</div>
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          ${STAGE_LABELS.map(
            (s, i) => html`<label
              class="${this.stages[i]
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white"} block cursor-pointer rounded-lg border p-3 transition"
            >
              <div class="mb-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  aria-label=${s.title}
                  .checked=${this.stages[i]}
                  @change=${() => this.toggleStage(i)}
                  class="h-4 w-4 accent-blue-600"
                />
                <span class="text-sm font-bold text-slate-900">${s.title}</span>
              </div>
              <div class="text-xs text-slate-500">${s.sub}</div>
              <div class="mt-2 text-xs leading-relaxed text-slate-600">
                ${s.behavior}
              </div>
            </label>`,
          )}
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            output (último estágio activo)
          </div>
          <pre
            class="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-800"
          >
${output}</pre
          >
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Outputs ilustrativos, escritos para mostrar a diferença qualitativa
          entre fases. Em modelos reais a tendência é a mesma; o estilo varia
          consoante anotador, política e versão.
        </p>
      </div>
    `;
  }
}

customElements.define("three-stages", ThreeStages);
