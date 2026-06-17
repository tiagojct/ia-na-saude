/**
 * <sft-cards> · Treino · cartões generalista vs clínico para SFT.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Example {
  prompt: string;
  gen: { answer: string; reasons: string[] };
  clin: { answer: string; reasons: string[] };
}

const EXAMPLES: Example[] = [
  {
    prompt: "Qual é a dose habitual de paracetamol em adultos?",
    gen: {
      answer:
        "A dose habitual de paracetamol em adultos é 500–1000 mg, de 4 em 4 ou 6 em 6 horas, sem ultrapassar 4 g por dia. É importante seguir as instruções da embalagem ou do médico, e não tomar durante mais de uma semana sem consultar um profissional de saúde.",
      reasons: [
        "frase completa, tom tranquilizador",
        "sem abreviaturas clínicas",
        "fecha com encaminhamento (“consultar profissional”)",
      ],
    },
    clin: {
      answer:
        "500–1000 mg PO 6/6h, máx 4 g/24h. Insuf. hepática: 2 g/24h. Uso crónico: monitorizar AST/ALT (hepatotoxicidade dose-dependente). Potencia varfarina (vigiar INR). Pediatria: 15 mg/kg/dose.",
      reasons: [
        "telegráfico, abreviaturas standard",
        "inclui populações especiais e interacções",
        "sem encaminhamento — assume formação prévia",
      ],
    },
  },
  {
    prompt: "Como abordar uma doente com sintomas que podem ser de síndrome coronária aguda?",
    gen: {
      answer:
        "É fundamental avaliar bem a doente. Faça uma boa história clínica, observe os sintomas, meça a tensão e, se houver suspeita de síndrome coronária aguda, encaminhe rapidamente para um serviço de urgência. A SCA é uma emergência e deve ser sempre tratada com a maior atenção.",
      reasons: [
        "conselho geral, sem passos accionáveis",
        "sem timings nem exames específicos",
        "reforça a urgência mas não diz como agir",
      ],
    },
    clin: {
      answer:
        "ECG 12 derivações <10 min. Troponina I (0/3h). Acesso EV, monitor, O₂ se SatO₂ <90 %. AAS 300 mg PO mastigado salvo CI. Estratificar GRACE/TIMI. Elevação ST → activar STEMI pathway. Sem elevação → diferenciar AI vs NSTEMI por troponina.",
      reasons: [
        "protocolo accionável com timings",
        "pontos de decisão clínicos (elevação ST, troponina)",
        "pressupõe acesso a ECG, EV, troponina",
      ],
    },
  },
  {
    prompt: "Como explico a um doente que precisa de fazer uma colonoscopia?",
    gen: {
      answer:
        "Sugiro explicar com calma e empatia. Diga que é um exame que permite ver o interior do intestino para detectar problemas precocemente. Pode mencionar que vai ter de fazer uma preparação especial nas vésperas, mas que estará acompanhado por médicos durante todo o procedimento. Esteja disponível para perguntas.",
      reasons: [
        "foca em comunicação, não em conteúdo",
        "sem indicações nem riscos concretos",
        "tom de orientação para profissional não-médico",
      ],
    },
    clin: {
      answer:
        "Indicação concreta (rastreio CCR >50a, hematoquézias, anemia ferropénica, alteração trânsito, FH). Jejum 8 h. Prep PEG ou picosulfato 24 h antes — eficácia depende do cumprimento. Sedação consciente (midazolam/fentanil). Risco perfuração ~1:1000. Biópsias e polipectomia possíveis no mesmo acto.",
      reasons: [
        "critérios de indicação por linha",
        "preparação concreta, com fármacos",
        "risco numérico (1:1000) — consentimento informado",
      ],
    },
  },
];

export class SFTCards extends IaElement {
  @property({ type: Number, state: true }) idx = 0;
  @property({ type: Boolean, state: true }) revealed = false;

  private cycle = () => {
    this.idx = (this.idx + 1) % EXAMPLES.length;
    this.revealed = false;
  };

  protected render() {
    const ex = EXAMPLES[this.idx];
    return html`
      <div>
        <div class="mb-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">prompt do exemplo</div>
          <div class="mt-1 text-sm text-slate-800">${ex.prompt}</div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700">para o utente</div>
            <div class="mb-3 text-sm font-bold text-slate-900">Anotador generalista</div>
            <div class="text-xs italic text-slate-500">escreve para público geral, sem formação clínica</div>
            ${this.revealed
              ? html`<p class="mt-3 text-sm leading-relaxed text-slate-700">${ex.gen.answer}</p>
                  <ul class="mt-3 space-y-1 text-xs text-slate-500">
                    ${ex.gen.reasons.map((r) => html`<li>· ${r}</li>`)}
                  </ul>`
              : html`<div class="mt-3 text-xs italic text-slate-500">↓ clica para revelar</div>`}
          </div>

          <div class="rounded-lg border border-slate-200 bg-white p-4">
            <div class="mb-1 text-xs font-bold uppercase tracking-wider text-green-700">para a equipa</div>
            <div class="mb-3 text-sm font-bold text-slate-900">Anotador clínico</div>
            <div class="text-xs italic text-slate-500">escreve para outro profissional de saúde</div>
            ${this.revealed
              ? html`<p class="mt-3 text-sm leading-relaxed text-slate-700">${ex.clin.answer}</p>
                  <ul class="mt-3 space-y-1 text-xs text-slate-500">
                    ${ex.clin.reasons.map((r) => html`<li>· ${r}</li>`)}
                  </ul>`
              : ""}
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            @click=${() => (this.revealed = true)}
            ?disabled=${this.revealed}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Ver as duas
          </button>
          <button
            type="button"
            @click=${this.cycle}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            ↻ Trocar exemplo
          </button>
        </div>

        ${this.revealed
          ? html`<p class="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed text-slate-700">
              <strong>Os generalistas que treinaram o ChatGPT escolhem quase sempre o cartão da esquerda.</strong>
              Por isso o ChatGPT, mesmo quando perguntas como profissional de saúde, te responde como se fosses utente.
              Med-PaLM, MedLM e similares mudaram <strong>só uma coisa</strong>: quem escreve os exemplos.
            </p>`
          : ""}
      </div>
    `;
  }
}

customElements.define("sft-cards", SFTCards);
