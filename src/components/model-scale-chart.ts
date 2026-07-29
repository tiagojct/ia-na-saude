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
const plot = {
  left: 72,
  right: 24,
  top: 44,
  bottom: 62,
  width: 720,
  height: 340,
};

function xFor(i: number): number {
  return plot.left + (i / (MODELS.length - 1)) * (plot.width - plot.left - plot.right);
}

function yFor(params: number): number {
  return (
    plot.top +
    (1 - (Math.log10(params) - minLog) / (maxLog - minLog)) *
      (plot.height - plot.top - plot.bottom)
  );
}

function labelYFor(y: number, i: number): number {
  const preferred = i % 2 === 0 ? y - 16 : y + 28;
  return Math.max(plot.top - 18, Math.min(plot.height - plot.bottom - 18, preferred));
}

function labelAnchorFor(i: number): "start" | "middle" | "end" {
  if (i === 0) return "start";
  if (i === MODELS.length - 1) return "end";
  return "middle";
}

export class ModelScaleChart extends IaElement {
  @property({ type: String, state: true }) activeName: string = MODELS[3].name;

  protected render() {
    const active = MODELS.find((m) => m.name === this.activeName) ?? MODELS[3];
    return html`
      <div class="mx-auto max-w-3xl">
        <p class="mb-4 max-w-2xl text-sm leading-relaxed text-slate-600">
          Um <strong>parâmetro</strong> é um botão ajustável dentro do modelo —
          como uma sinapse com força regulável. Em 2017, ~65 milhões. Hoje,
          ~10 biliões. <span class="text-slate-500">Eixo Y em escala log.</span>
        </p>

        <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <svg
            viewBox="0 0 ${plot.width} ${plot.height}"
            class="block h-auto w-full bg-slate-50"
            role="img"
            aria-label="Escala logarítmica de parâmetros em modelos de linguagem de 2017 a 2026"
          >
            <rect width=${plot.width} height=${plot.height} fill="#f8fafc"></rect>
            <text
              x=${plot.left}
              y="22"
              font-size="11"
              font-weight="700"
              fill="#64748b"
            >
              PARÂMETROS
            </text>
            ${[8, 9, 10, 11, 12, 13].map((p) => {
              const y = yFor(10 ** p);
              return html`<g>
                <line
                  x1=${plot.left}
                  x2=${plot.width - plot.right}
                  y1=${y}
                  y2=${y}
                  stroke="#e2e8f0"
                ></line>
                <text
                  x=${plot.left - 12}
                  y=${y + 4}
                  text-anchor="end"
                  font-size="12"
                  fill="#64748b"
                >
                  ${p === 8 ? "100 M" : p === 9 ? "1 mil M" : p === 12 ? "1 bi." : `10^${p}`}
                </text>
              </g>`;
            })}
            <line
              x1=${plot.left}
              x2=${plot.left}
              y1=${plot.top}
              y2=${plot.height - plot.bottom}
              stroke="#cbd5e1"
            ></line>
            <line
              x1=${plot.left}
              x2=${plot.width - plot.right}
              y1=${plot.height - plot.bottom}
              y2=${plot.height - plot.bottom}
              stroke="#cbd5e1"
            ></line>
            <polyline
              points=${MODELS.map((m, i) => {
                return `${xFor(i)},${yFor(m.params)}`;
              }).join(" ")}
              fill="none"
              stroke="#3b82f6"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></polyline>
            ${MODELS.map((m, i) => {
              const x = xFor(i);
              const y = yFor(m.params);
              const labelY = labelYFor(y, i);
              const anchor = labelAnchorFor(i);
              const isActive = m.name === this.activeName;
              return html`<g>
                <line
                  x1=${x}
                  x2=${x}
                  y1=${labelY + (i % 2 === 0 ? 4 : -12)}
                  y2=${y + (i % 2 === 0 ? -8 : 10)}
                  stroke=${isActive ? "#2563eb" : "#cbd5e1"}
                  stroke-width="1"
                ></line>
                <text
                  x=${x}
                  y=${labelY}
                  text-anchor=${anchor}
                  font-size="12"
                  font-weight=${isActive ? "700" : "600"}
                  fill=${isActive ? "#1d4ed8" : "#334155"}
                >
                  ${m.name}
                </text>
                <text
                  x=${x}
                  y=${labelY + 14}
                  text-anchor=${anchor}
                  font-size="10"
                  fill="#64748b"
                >
                  ${m.year} · ${fmt(m.params)}
                </text>
              </g>`;
            })}
            ${MODELS.map((m, i) => {
              const x = xFor(i);
              const y = yFor(m.params);
              const isActive = m.name === this.activeName;
              return html`<g
                style="cursor:pointer"
                @click=${() => (this.activeName = m.name)}
              >
                <circle
                  cx=${x}
                  cy=${y}
                  r=${isActive ? 8 : 5}
                  fill=${isActive ? "#2563eb" : "#60a5fa"}
                  stroke="white"
                  stroke-width="3"
                ></circle>
                <text
                  x=${x}
                  y=${plot.height - 20}
                  text-anchor="middle"
                  font-size="11"
                  font-weight=${isActive ? "700" : "400"}
                  fill=${isActive ? "#1d4ed8" : "#64748b"}
                >
                  ${m.year}
                </text>
              </g>`;
            })}
          </svg>

          <div class="border-t border-slate-200 bg-white p-4">
            <div class="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span class="text-lg font-bold text-slate-900">${active.name}</span>
              <span class="font-mono text-sm font-bold text-blue-700">
                ${fmt(active.params)}
              </span>
            </div>
            <p class="max-w-2xl text-sm leading-relaxed text-slate-700">
              ${active.blurb}
            </p>
          </div>
        </div>

        <div class="mt-3 flex flex-wrap gap-2">
          ${MODELS.map(
            (m) => html`<button
              type="button"
              @click=${() => (this.activeName = m.name)}
              class="${m.name === this.activeName
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"} rounded-full border px-3 py-1 text-xs font-medium"
            >
              ${m.name}
            </button>`,
          )}
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
