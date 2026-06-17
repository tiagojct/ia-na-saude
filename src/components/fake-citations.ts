/**
 * <fake-citations> · Alucinações · 4 referências (2 reais, 2 fabricadas).
 *
 * Utilizador marca as que acha fabricadas, depois revela. Mostra lição
 * em função do número de acertos.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Citation {
  text: string;
  meta: string;
  real: boolean;
  why: string;
}

const CITATIONS: Citation[] = [
  {
    text: '"Azithromycin for prevention of exacerbations of COPD." Albert RK et al. N Engl J Med 2011;365:689–698.',
    meta: "DOI: 10.1056/NEJMoa1104623 · 1142 doentes · 12 meses",
    real: true,
    why: "Real. Albert et al., NEJM 2011 — o ensaio clínico que estabeleceu azitromicina como prevenção de exacerbações em DPOC. 1142 doentes, 1 ano de follow-up. Marco da literatura.",
  },
  {
    text: '"Long-term azithromycin reduces exacerbation frequency in moderate COPD: the AZIVENT trial." Costa J, Sá-Couto P et al. Eur Respir J 2018;52:1801249.',
    meta: "DOI: 10.1183/13993003.01249-2018 · 487 doentes · IC 95 % 0,52–0,89",
    real: false,
    why: 'Fabricada. O DOI não corresponde a nada registado. O nome "AZIVENT", os autores portugueses, e os números são plausíveis. É exactamente o que o ChatGPT produz quando lhe falta a referência certa: invenção bem formada.',
  },
  {
    text: '"Inhaled corticosteroids and the risk of pneumonia in COPD." Suissa S et al. Lancet Respir Med 2014;2(10):812–820.',
    meta: "DOI: 10.1016/S2213-2600(14)70172-2 · estudo de coorte",
    real: true,
    why: "Real. Suissa et al., Lancet Respir Med 2014 — estudo de coorte clássico sobre risco de pneumonia com corticoides inalados em DPOC. Citado em milhares de papers desde então.",
  },
  {
    text: '"Macrolide therapy in COPD: meta-analysis of cardiovascular events." Ferreira M, Lopes T et al. Chest 2020;158(4):1428–1438.',
    meta: "DOI: 10.1378/chest.20.1438 · 14 estudos · n=8 921",
    real: false,
    why: "Fabricada. O DOI tem o formato certo da revista Chest, mas não está registado. Os autores portugueses, o n e o ano são plausíveis. Pista clínica: referências em meta-análises são facilmente verificáveis. Verifica antes de usar.",
  },
];

export class FakeCitations extends IaElement {
  @property({ type: Object, state: true }) marked: Record<number, boolean> = {};
  @property({ type: Boolean, state: true }) revealed = false;

  private toggle = (i: number) => {
    if (this.revealed) return;
    const next = { ...this.marked };
    if (next[i]) delete next[i];
    else next[i] = true;
    this.marked = next;
  };

  private reset = () => {
    this.marked = {};
    this.revealed = false;
  };

  protected render() {
    const fakeIdxs = CITATIONS.map((c, i) => ({ i, fake: !c.real }))
      .filter((x) => x.fake)
      .map((x) => x.i);
    const markedIdxs = Object.keys(this.marked).map(Number);
    const correctMarks = markedIdxs.filter((i) =>
      fakeIdxs.includes(i),
    ).length;
    const wrongMarks = markedIdxs.filter((i) => !fakeIdxs.includes(i)).length;

    return html`
      <div>
        <p class="mb-4 text-sm text-slate-600">
          Pediste ao ChatGPT referências sobre azitromicina em DPOC. Devolveu
          estas quatro. Clica nas que achas que são <strong>fabricadas</strong>.
          Depois revela.
        </p>

        <div class="space-y-3">
          ${CITATIONS.map((c, i) => {
            const cls = this.revealed
              ? c.real
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
              : this.marked[i]
                ? "border-amber-500 bg-amber-50"
                : "border-slate-200 bg-white hover:border-slate-300";
            return html`<button
              type="button"
              @click=${() => this.toggle(i)}
              class="${cls} block w-full rounded-lg border-2 p-4 text-left transition"
            >
              <p class="text-sm leading-relaxed text-slate-800">${c.text}</p>
              <p class="mt-2 font-mono text-xs text-slate-500">${c.meta}</p>
              ${this.revealed
                ? html`<div
                    class="${c.real
                      ? "bg-green-100 text-green-900"
                      : "bg-red-100 text-red-900"} mt-3 rounded p-2 text-xs"
                  >
                    <strong>${c.real ? "✓ Real." : "✗ Fabricada."}</strong>
                    ${c.why}
                  </div>`
                : this.marked[i]
                  ? html`<div class="mt-2 text-xs font-bold text-amber-700">
                      marcada como fabricada
                    </div>`
                  : ""}
            </button>`;
          })}
        </div>

        <div class="mt-4 flex gap-2">
          <button
            type="button"
            @click=${() => (this.revealed = true)}
            ?disabled=${this.revealed}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Revelar
          </button>
          <button
            type="button"
            @click=${this.reset}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reiniciar
          </button>
        </div>

        ${this.revealed
          ? html`<div
              class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 text-sm leading-relaxed text-slate-700"
            >
              ${correctMarks === 2 && wrongMarks === 0
                ? html`<strong>Apanhaste as duas.</strong> A pista para a
                    fabricada do meio: se a citação parece “demasiado
                    conveniente” para o que pediste, suspeita. Meta-análises
                    com números redondos e DOIs com formato perfeito são alvos
                    preferidos do modelo.`
                : correctMarks === 1
                  ? html`<strong>Apanhaste uma.</strong> Em prática clínica,
                      isto é a regra: o LLM mistura referências reais com
                      fabricadas, exactamente para parecer competente.
                      Verificar uma a uma é a única defesa.`
                  : html`<strong>As fabricadas passaram.</strong> Aconteceria à
                      maioria dos clínicos numa primeira leitura. Regra
                      prática: antes de usar uma referência de um LLM, abre o
                      DOI. Se não existir, não existe.`}
            </div>`
          : ""}
      </div>
    `;
  }
}

customElements.define("fake-citations", FakeCitations);
