/**
 * <bayesian-update> · Quando usar · pré-teste → pós-teste com 6 testes
 * clínicos pré-definidos. Usa lib/math bayes.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam, buildShareURL } from "./_state";
import { bayes } from "../lib/math";

interface Test {
  id: string;
  name: string;
  sens: number;
  spec: number;
  description: string;
}

const TESTS: Test[] = [
  { id: "trop", name: "hs-cTnI · 0h", sens: 0.85, spec: 0.95, description: "Troponina I de alta sensibilidade na admissão. Per ESC 2023: bom para excluir EAM em algoritmo 0/1h ou 0/3h; isoladamente não exclui." },
  { id: "trop3h", name: "hs-cTnI · 3h", sens: 0.99, spec: 0.95, description: "Troponina I de alta sensibilidade a 3h. Sensibilidade quase perfeita; uma 3h negativa em doente com pré-teste baixa-intermédia exclui." },
  { id: "ddim", name: "D-dímeros (TEP)", sens: 0.95, spec: 0.4, description: "Só validado para excluir TEP em doentes Wells low/intermédio ou PERC negativo. Em pré-teste alta, não exclui (Wells 2024 ESC)." },
  { id: "ecg-st", name: "ECG · supra-ST (STEMI)", sens: 0.65, spec: 0.99, description: "Sensibilidade para STEMI em apresentação típica ~60-75%; menor em mulheres, idosos, IC prévia. Especificidade altíssima." },
  { id: "rapid-strep", name: "TDR estreptococo", sens: 0.86, spec: 0.96, description: "Teste rápido para faringoamigdalite por GAS. Cochrane 2016: sens 86%, spec 96% (varia com prevalência local)." },
  { id: "ca", name: "CA 125 · ovário (avançado)", sens: 0.78, spec: 0.78, description: "Sensibilidade 78% global, mas só ~50% em estádio I. Para rastreio em mulheres assintomáticas pré-menopausa: VPP <5% — não usar isolado." },
];

export class BayesianUpdate extends IaElement {
  static readonly PREFIX = "bx";

  @property({ type: Number }) pre = 0.3;
  @property({ type: String }) test: string = TESTS[0].id;
  @property({ type: Boolean, state: true }) copied = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.pre = readUrlParam(BayesianUpdate.PREFIX, "pre", 0.3) as number;
    this.test = readUrlParam(BayesianUpdate.PREFIX, "test", TESTS[0].id) as string;
  }

  private setPre = (e: Event) => {
    const v = parseFloat((e.target as HTMLInputElement).value);
    this.pre = v;
    writeUrlParam(BayesianUpdate.PREFIX, "pre", v);
  };

  private setTest = (e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    this.test = v;
    writeUrlParam(BayesianUpdate.PREFIX, "test", v);
  };

  private shareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareURL("quando"));
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* ignored */
    }
  };

  protected render() {
    const test = TESTS.find((t) => t.id === this.test) ?? TESTS[0];
    const r = bayes(this.pre, test.sens, test.spec);

    let pista = "";
    if (this.pre < 0.05 && r.postPos < 0.5)
      pista =
        "Em prevalência baixa, mesmo um teste “bom” positivo continua a deixar o doente mais provavelmente saudável que doente. Cuidado com rastreio sem clínica.";
    else if (this.pre > 0.7 && r.postNeg > 0.2)
      pista =
        "Probabilidade pré-teste alta + teste negativo ainda deixa risco substancial. Considera um segundo teste antes de excluir.";
    else if (this.pre >= 0.05 && this.pre <= 0.7)
      pista =
        "Está na zona em que o teste mexe mesmo a decisão. É aqui que faz sentido pedir.";

    return html`
      <div>
        <p class="mb-3 text-sm leading-relaxed text-slate-600">
          Antes de pedir o teste, qual a tua estimativa?
          <strong>Probabilidade pré-teste</strong> + resultado
          positivo/negativo + características do teste →
          <strong>probabilidade pós-teste</strong>. É a base do raciocínio
          clínico moderno.
        </p>

        <div class="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label class="flex items-baseline justify-between">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
              >probabilidade pré-teste · o teu palpite clínico</span
            >
            <span class="font-mono text-base font-bold text-blue-700"
              >${Math.round(this.pre * 100)}%</span
            >
          </label>
          <input
            type="range"
            aria-label="probabilidade pré-teste"
            min="0.01"
            max="0.99"
            step="0.01"
            .value=${String(this.pre)}
            @input=${this.setPre}
            class="mt-2 w-full accent-blue-600"
          />
          <div class="mt-1 flex justify-between text-[10px] text-slate-500">
            <span>baixa (rastreio populacional)</span>
            <span>alta (paciente com clínica clássica)</span>
          </div>
        </div>

        <div class="mb-4">
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            teste a aplicar
          </div>
          <select
            .value=${this.test}
            @change=${this.setTest}
            aria-label="teste a aplicar"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            ${TESTS.map(
              (t) => html`<option value=${t.id}>
                ${t.name} · sens ${Math.round(t.sens * 100)}% · spec
                ${Math.round(t.spec * 100)}%
              </option>`,
            )}
          </select>
          <div class="mt-1 text-xs text-slate-500">${test.description}</div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border-2 border-green-300 bg-green-50 p-4">
            <div
              class="text-xs font-bold uppercase tracking-wider text-green-700"
            >
              se POSITIVO
            </div>
            <div class="my-1 font-mono text-3xl font-bold text-green-700">
              ${Math.round(r.postPos * 100)}%
            </div>
            <div class="text-xs text-slate-600">
              LR+ = <strong>${r.lrPos.toFixed(2)}</strong> ·
              ${this.pre > 0 && r.postPos > this.pre
                ? `+${Math.round((r.postPos - this.pre) * 100)} pp`
                : "≈"}
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-green-100">
              <div
                class="h-full bg-green-500"
                style="width:${r.postPos * 100}%"
              ></div>
            </div>
          </div>

          <div class="rounded-lg border-2 border-red-300 bg-red-50 p-4">
            <div
              class="text-xs font-bold uppercase tracking-wider text-red-700"
            >
              se NEGATIVO
            </div>
            <div class="my-1 font-mono text-3xl font-bold text-red-700">
              ${Math.round(r.postNeg * 100)}%
            </div>
            <div class="text-xs text-slate-600">
              LR− = <strong>${r.lrNeg.toFixed(2)}</strong> ·
              ${this.pre > 0 && r.postNeg < this.pre
                ? `−${Math.round((this.pre - r.postNeg) * 100)} pp`
                : "≈"}
            </div>
            <div class="mt-2 h-2 overflow-hidden rounded-full bg-red-100">
              <div
                class="h-full bg-red-500"
                style="width:${r.postNeg * 100}%"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-lg border border-slate-200 bg-white p-3">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            visualização · trajectória da probabilidade
          </div>
          <svg viewBox="0 0 400 60" class="h-auto w-full">
            <line
              x1="20"
              y1="30"
              x2="380"
              y2="30"
              stroke="#e2e8f0"
              stroke-width="1"
            ></line>
            ${[0, 25, 50, 75, 100].map(
              (p) => html`<g>
                <line
                  x1=${20 + p * 3.6}
                  y1="26"
                  x2=${20 + p * 3.6}
                  y2="34"
                  stroke="#cbd5e1"
                ></line>
                <text
                  x=${20 + p * 3.6}
                  y="48"
                  font-size="9"
                  fill="#94a3b8"
                  text-anchor="middle"
                >
                  ${p}
                </text>
              </g>`,
            )}
            <circle
              cx=${20 + this.pre * 360}
              cy="30"
              r="5"
              fill="#3b82f6"
            ></circle>
            <text
              x=${20 + this.pre * 360}
              y="18"
              font-size="9"
              fill="#1d4ed8"
              text-anchor="middle"
            >
              pré
            </text>
            <circle
              cx=${20 + r.postNeg * 360}
              cy="30"
              r="4"
              fill="#dc2626"
            ></circle>
            <text
              x=${20 + r.postNeg * 360}
              y="10"
              font-size="9"
              fill="#b91c1c"
              text-anchor="middle"
            >
              neg
            </text>
            <circle
              cx=${20 + r.postPos * 360}
              cy="30"
              r="4"
              fill="#16a34a"
            ></circle>
            <text
              x=${20 + r.postPos * 360}
              y="10"
              font-size="9"
              fill="#15803d"
              text-anchor="middle"
            >
              pos
            </text>
          </svg>
        </div>

        ${pista
          ? html`<div
              class="mt-4 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-3 text-sm text-slate-700"
            >
              <strong>Pista clínica:</strong> ${pista}
            </div>`
          : ""}

        <div class="mt-3 flex justify-end">
          <button
            type="button"
            @click=${this.shareLink}
            class="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
            title="partilhar este caso"
          >
            ${this.copied ? "✓ link copiado" : "🔗 partilhar este caso"}
          </button>
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Fagan, 1975. Bayes a sério: nenhum teste “diagnostica” sozinho —
          todos actualizam uma probabilidade. Para a Maria (HTA, DM2, dor
          torácica, ex-fumadora), a pré-teste de SCA é alta (≥ 50 %) —
          mesmo uma troponina inicialmente negativa não exclui. Por isso
          fazes sériada.
        </p>
      </div>
    `;
  }
}

customElements.define("bayesian-update", BayesianUpdate);
