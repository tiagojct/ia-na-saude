/**
 * <model-scale-chart> · História · escala log de parâmetros 2017-2026.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Model {
  year: number;
  params: number;
  name: string;
  blurb: string;
}

const MODELS: Model[] = [
  { year: 2017, params: 65e6, name: "Transformer", blurb: 'Transformer (Vaswani et al., 2017) — 65 milhões de parâmetros. O paper "Attention is all you need" introduz a arquitectura que sustenta tudo o que veio depois.' },
  { year: 2018, params: 340e6, name: "BERT", blurb: "BERT (Google, 2018) — 340 M. Pré-treino bidireccional. Domina tarefas de compreensão de texto durante anos." },
  { year: 2019, params: 1.5e9, name: "GPT-2", blurb: 'GPT-2 (OpenAI, 2019) — 1,5 mil milhões. OpenAI hesita em publicar o modelo completo "por ser perigoso". Em retrospectiva, era pequeno.' },
  { year: 2020, params: 175e9, name: "GPT-3", blurb: "GPT-3 (OpenAI, 2020) — 175 mil milhões. 100× maior que o GPT-2 em 1 ano. Capacidades emergentes sem treino específico (few-shot)." },
  { year: 2022, params: 540e9, name: "PaLM", blurb: "PaLM (Google, 2022) — 540 mil milhões. Marca o pico de modelos densos publicados. A partir daqui, mistura de especialistas (MoE) substitui o crescimento monolítico." },
  { year: 2023, params: 1.8e12, name: "GPT-4", blurb: "GPT-4 (OpenAI, 2023) — estimado ~1,8 bili. (mistura de especialistas). OpenAI deixa de publicar tamanhos. Multimodal: texto, imagem, áudio." },
  { year: 2024, params: 405e9, name: "LLaMA 3.1", blurb: "LLaMA 3.1 405B (Meta, 2024) — 405 mil milhões. O maior modelo aberto da sua data. Treinado em ~15 biliões de tokens." },
  { year: 2025, params: 5e12, name: "fronteira 2025", blurb: "Fronteira 2025 — GPT-5, Claude Opus 4, Gemini 2.5 Pro. Estimativas convergem para ~5 biliões de parâmetros efectivos (mistura de especialistas)." },
  { year: 2026, params: 10e12, name: "fronteira 2026", blurb: "Fronteira 2026 (estimativa) — ~10 biliões de parâmetros efectivos. Mais importante que tamanho: tempo de raciocínio em inferência (modelos com thinking)." },
];

function fmt(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)} bi.`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(0)} mil M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} M`;
  return `${n}`;
}

const minLog = Math.log10(65e6);
const maxLog = Math.log10(10e12);

export class ModelScaleChart extends IaElement {
  @property({ type: String, state: true }) activeName: string = MODELS[3].name;

  protected render() {
    const active = MODELS.find((m) => m.name === this.activeName) ?? MODELS[3];
    return html`
      <div>
        <p class="mb-4 text-sm text-slate-600">
          Um <strong>parâmetro</strong> é um botão ajustável dentro do modelo —
          como uma sinapse com força regulável. Em 2017, ~65 milhões. Hoje,
          ~10 biliões.
          <span class="text-slate-500">eixo Y · log</span>
        </p>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 600 220" class="w-full h-auto">
            ${[7, 8, 9, 10, 11, 12, 13].map((p) => {
              const y = 200 - ((p - minLog) / (maxLog - minLog)) * 180;
              return html`<g>
                <line
                  x1="40"
                  x2="590"
                  y1=${y}
                  y2=${y}
                  stroke="#e2e8f0"
                  stroke-dasharray="2,3"
                ></line>
                <text
                  x="34"
                  y=${y + 4}
                  text-anchor="end"
                  font-size="9"
                  fill="#94a3b8"
                >
                  10^${p}
                </text>
              </g>`;
            })}
            <polyline
              points=${MODELS.map((m, i) => {
                const x = 40 + (i / (MODELS.length - 1)) * 550;
                const y =
                  200 -
                  ((Math.log10(m.params) - minLog) / (maxLog - minLog)) * 180;
                return `${x},${y}`;
              }).join(" ")}
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
            ></polyline>
            ${MODELS.map((m, i) => {
              const x = 40 + (i / (MODELS.length - 1)) * 550;
              const y =
                200 -
                ((Math.log10(m.params) - minLog) / (maxLog - minLog)) * 180;
              const isActive = m.name === this.activeName;
              return html`<g
                style="cursor:pointer"
                @click=${() => (this.activeName = m.name)}
              >
                <circle
                  cx=${x}
                  cy=${y}
                  r=${isActive ? 7 : 5}
                  fill=${isActive ? "#2563eb" : "#60a5fa"}
                  stroke="white"
                  stroke-width="2"
                ></circle>
                <text
                  x=${x}
                  y=${y - 12}
                  text-anchor="middle"
                  font-size="10"
                  font-weight=${isActive ? "700" : "400"}
                  fill="#1e293b"
                >
                  ${m.year}
                </text>
              </g>`;
            })}
          </svg>
        </div>

        <div class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div class="mb-1 flex items-baseline gap-3">
            <span class="font-bold text-slate-900">${active.name}</span>
            <span class="font-mono text-sm text-blue-700"
              >${fmt(active.params)}</span
            >
          </div>
          <p class="text-sm leading-relaxed text-slate-700">${active.blurb}</p>
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Dimensões publicadas ou estimadas. A partir do GPT-4 (2023), as
          fronteiras deixaram de divulgar tamanhos. Em 2025–2026, parâmetros
          deixou de ser o eixo dominante: tempo de raciocínio em inferência
          começa a importar tanto.
        </p>
      </div>
    `;
  }
}

customElements.define("model-scale-chart", ModelScaleChart);
