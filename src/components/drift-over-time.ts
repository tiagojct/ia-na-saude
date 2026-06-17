/**
 * <drift-over-time> · Quando usar · modelo aprovado 2023 sem recalibração
 * vs com recalibração anual. SVG line chart, 2 polylines.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam } from "./_state";

interface Snapshot {
  year: number;
  populationShift: string;
  accuracy: number;
  sensitivity: number;
  specificity: number;
  note: string;
}

const NEVER_RECAL: Snapshot[] = [
  { year: 2023, populationShift: "população de treino · sem covid · ICS dominante em DPOC", accuracy: 0.91, sensitivity: 0.89, specificity: 0.92, note: "Modelo validado e aprovado. FDA / marcação CE. Métricas em alta." },
  { year: 2024, populationShift: "pós-covid · 12% utentes com long-covid · novos beta-lactâmicos", accuracy: 0.88, sensitivity: 0.85, specificity: 0.9, note: "Ligeira degradação. Long-covid muda padrão de queixas respiratórias. Modelo nunca viu durante treino." },
  { year: 2025, populationShift: "Ozempic em ~8% utentes · GLP-1 muda metabolismo", accuracy: 0.83, sensitivity: 0.79, specificity: 0.87, note: "GLP-1 agonistas alteram apresentação clínica de DM2, peso e factores cardiovasculares. Modelo treinado num mundo sem semaglutida em massa." },
  { year: 2026, populationShift: "ARS pediátrico novo · variantes virais pós-vacinas atualizadas", accuracy: 0.79, sensitivity: 0.73, specificity: 0.85, note: "Sensibilidade abaixo do limiar de aprovação original. 16 pontos abaixo de 2023. Deveria ter sido recalibrado há 1 ano." },
];

const RECAL: Snapshot[] = [
  { ...NEVER_RECAL[0] },
  { ...NEVER_RECAL[1], accuracy: 0.9, sensitivity: 0.88, specificity: 0.91, note: "Re-treinado com dados pós-covid." },
  { ...NEVER_RECAL[2], accuracy: 0.89, sensitivity: 0.87, specificity: 0.91, note: "Recalibração com coorte GLP-1." },
  { ...NEVER_RECAL[3], accuracy: 0.89, sensitivity: 0.86, specificity: 0.91, note: "Mantém-se válido. Custo: pipeline trimestral de validação local." },
];

function yScale(v: number): number {
  return 20 + (1 - v) * 600;
}

export class DriftOverTime extends IaElement {
  static readonly PREFIX = "dr";

  @property({ type: String }) md: "never" | "recal" = "never";

  connectedCallback(): void {
    super.connectedCallback();
    this.md = readUrlParam(DriftOverTime.PREFIX, "md", "never") as
      | "never"
      | "recal";
  }

  private setMode = (v: "never" | "recal") => {
    this.md = v;
    writeUrlParam(DriftOverTime.PREFIX, "md", v);
  };

  protected render() {
    const data = this.md === "never" ? NEVER_RECAL : RECAL;
    const final = data[data.length - 1];
    const drift = NEVER_RECAL[0].sensitivity - final.sensitivity;

    return html`
      <div>
        <p class="mb-3 text-sm leading-relaxed text-slate-600">
          Modelo aprovado em 2023. Validado anualmente em coorte real. Vê o que
          acontece <strong>sem recalibração</strong> vs
          <strong>com recalibração</strong>.
        </p>

        <div class="mb-4 flex gap-2">
          <button
            type="button"
            @click=${() => this.setMode("never")}
            class="${this.md === "never"
              ? "border-red-500 bg-red-50"
              : "border-slate-200 bg-white hover:border-slate-300"} flex-1 rounded-lg border-2 p-2 text-left text-sm transition"
          >
            <div class="font-bold">sem recalibração</div>
            <div class="text-xs text-slate-500">
              modelo congelado em 2023 · validado mas nunca actualizado
            </div>
          </button>
          <button
            type="button"
            @click=${() => this.setMode("recal")}
            class="${this.md === "recal"
              ? "border-green-500 bg-green-50"
              : "border-slate-200 bg-white hover:border-slate-300"} flex-1 rounded-lg border-2 p-2 text-left text-sm transition"
          >
            <div class="font-bold">recalibração anual</div>
            <div class="text-xs text-slate-500">
              re-treinado anualmente na população local
            </div>
          </button>
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 400 200" class="h-auto w-full">
            ${[0.7, 0.8, 0.9, 1.0].map(
              (y) => html`<g>
                <line
                  x1="40"
                  x2="380"
                  y1=${yScale(y)}
                  y2=${yScale(y)}
                  stroke="#e2e8f0"
                  stroke-dasharray="2,3"
                ></line>
                <text
                  x="35"
                  y=${yScale(y) + 4}
                  text-anchor="end"
                  font-size="9"
                  fill="#94a3b8"
                >
                  ${Math.round(y * 100)}%
                </text>
              </g>`,
            )}

            <polyline
              points=${data
                .map(
                  (s, i) =>
                    `${40 + (i / (data.length - 1)) * 340},${yScale(s.sensitivity)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#dc2626"
              stroke-width="2"
            ></polyline>

            <polyline
              points=${data
                .map(
                  (s, i) =>
                    `${40 + (i / (data.length - 1)) * 340},${yScale(s.specificity)}`,
                )
                .join(" ")}
              fill="none"
              stroke="#16a34a"
              stroke-width="2"
            ></polyline>

            <line
              x1="40"
              x2="380"
              y1=${yScale(0.85)}
              y2=${yScale(0.85)}
              stroke="#f59e0b"
              stroke-width="1"
              stroke-dasharray="4,2"
            ></line>
            <text
              x="380"
              y=${yScale(0.85) - 3}
              text-anchor="end"
              font-size="9"
              fill="#d97706"
            >
              limiar aprovação · sens ≥ 85%
            </text>

            ${data.map((s, i) => {
              const x = 40 + (i / (data.length - 1)) * 340;
              return html`<g>
                <circle
                  cx=${x}
                  cy=${yScale(s.sensitivity)}
                  r="4"
                  fill="#dc2626"
                ></circle>
                <circle
                  cx=${x}
                  cy=${yScale(s.specificity)}
                  r="4"
                  fill="#16a34a"
                ></circle>
                <text
                  x=${x}
                  y="195"
                  text-anchor="middle"
                  font-size="9"
                  fill="#475569"
                >
                  ${s.year}
                </text>
              </g>`;
            })}
          </svg>
          <div class="mt-2 flex justify-center gap-4 text-xs">
            <span class="flex items-center gap-1">
              <span class="inline-block h-2 w-3 rounded bg-red-600"></span>
              sensibilidade
            </span>
            <span class="flex items-center gap-1">
              <span class="inline-block h-2 w-3 rounded bg-green-600"></span>
              especificidade
            </span>
          </div>
        </div>

        <div class="mt-4 grid gap-2">
          ${data.map((s, i) => {
            const last = i === data.length - 1;
            const cls = last
              ? this.md === "never"
                ? s.sensitivity < 0.85
                  ? "border-red-500 bg-red-50"
                  : "border-amber-500 bg-amber-50"
                : "border-green-500 bg-green-50"
              : "border-slate-200 bg-white";
            return html`<div class="${cls} rounded-lg border-l-4 p-3 text-xs">
              <div class="flex flex-wrap items-baseline justify-between gap-2">
                <span class="font-mono font-bold text-slate-900">${s.year}</span>
                <span class="font-mono text-[11px] text-slate-600"
                  >sens ${Math.round(s.sensitivity * 100)}% · spec
                  ${Math.round(s.specificity * 100)}%</span
                >
              </div>
              <div class="mt-1 text-slate-500">${s.populationShift}</div>
              <div class="mt-1 text-slate-700">${s.note}</div>
            </div>`;
          })}
        </div>

        <div
          class="${this.md === "never"
            ? "border-red-500 bg-red-50"
            : "border-green-500 bg-green-50"} mt-4 rounded-lg border-l-4 p-4 text-sm"
        >
          ${this.md === "never"
            ? html`<strong
                  >Drift de ${Math.round(drift * 100)} pontos em 3 anos.</strong
                >
                Sensibilidade caiu de
                ${Math.round(NEVER_RECAL[0].sensitivity * 100)}% para
                ${Math.round(final.sensitivity * 100)}% — abaixo do limiar de
                aprovação original. Doentes negativos falsos sobem.
                <strong>O modelo está aprovado mas já não funciona.</strong>`
            : html`<strong>Estável em ~88% sensibilidade.</strong>
                Recalibração anual mantém o modelo dentro do limiar. Custo:
                pipeline de validação local trimestral + processo de re-treino.
                Vale a pena.`}
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Números ilustrativos baseados em padrão observado em modelos de
          imagem médica desde 2018 (Finlayson et al., 2021). A pergunta certa à
          direcção clínica:
          <em>“há monitorização contínua de performance? Re-validação trimestral em coorte local?”</em>
          Sem isso, qualquer modelo aprovado torna-se obsoleto sem ninguém
          notar.
        </p>
      </div>
    `;
  }
}

customElements.define("drift-over-time", DriftOverTime);
