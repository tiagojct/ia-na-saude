/**
 * <scale-corpora> · Treino · 5 itens (tu, Wikipedia, PubMed, GPT-3, LLaMA 3).
 *
 * Barra horizontal escala linear, analog em livros equivalentes.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Item {
  name: string;
  sub: string;
  tokens: number;
  you?: boolean;
  desc: string;
}

const ITEMS: Item[] = [
  { name: "Tu, ao longo da carreira", sub: "40 anos · 1 h/dia · 250 wpm", tokens: 100e6, you: true, desc: "Estimativa generosa: 1 hora de leitura clínica diária a 250 palavras por minuto, durante 40 anos." },
  { name: "Wikipedia (EN)", sub: "~7 milhões de artigos", tokens: 6e9, desc: "Um dos pilares clássicos do treino. Pequena em escala absoluta, grande em densidade factual. Quase todos os modelos a memorizam por inteiro." },
  { name: "PubMed (todos os abstracts)", sub: "~33 milhões de abstracts", tokens: 10e9, desc: "O corpus de referência em medicina. Mesmo todo o saber biomédico indexado é uma fracção minúscula do que entra num modelo de fronteira." },
  { name: "GPT-3 (2020)", sub: "Common Crawl + livros + Wikipedia", tokens: 300e9, desc: "A primeira vez que ficou claro que escala sozinha desbloqueia capacidades. ~50× toda a Wikipedia inglesa, ~30× todo o PubMed." },
  { name: "LLaMA 3 (2024)", sub: "web filtrada · código · multilíngue", tokens: 15e12, desc: "Cerca de 50× o GPT-3, 2 500× toda a Wikipedia inglesa." },
];

function fmt(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(0)} bi.`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(0)} mil M`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} M`;
  return `${n}`;
}

function analog(tokens: number): string {
  const books = tokens / 60000;
  if (books < 5000) return "cabe numa estante doméstica.";
  if (books < 50000) return "aprox. uma livraria de bairro.";
  if (books < 200000) return "aprox. uma biblioteca municipal.";
  if (books < 2e6) return "aprox. uma biblioteca universitária inteira.";
  if (books < 5e7) return `aprox. ${Math.round(books / 2e6)}× a biblioteca universitária.`;
  if (books < 5e8) return "aprox. todos os livros publicados em inglês até 1900.";
  if (books < 5e9) return "aprox. todos os livros já publicados na história.";
  return "mais livros do que alguma vez foram escritos, várias vezes.";
}

const maxTokens = Math.max(...ITEMS.map((i) => i.tokens));

export class ScaleCorpora extends IaElement {
  @property({ type: String, state: true }) activeName: string = ITEMS[3].name;

  protected render() {
    const active = ITEMS.find((i) => i.name === this.activeName) ?? ITEMS[3];
    return html`
      <div>
        <p class="mb-4 text-sm text-slate-600">
          “Biliões de frases” é abstracto. Em escala linear, compara o que um
          clínico assimila numa carreira com os corpora de treino. A barra
          mais pequena és tu.
        </p>

        <div class="space-y-2">
          ${ITEMS.map((it) => {
            const w = (it.tokens / maxTokens) * 100;
            const isActive = it.name === this.activeName;
            return html`<button
              type="button"
              @click=${() => (this.activeName = it.name)}
              class="${isActive
                ? "border-blue-500 bg-blue-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300"} block w-full text-left rounded-lg border p-3 transition"
            >
              <div
                class="mb-1 flex flex-wrap items-baseline justify-between gap-2"
              >
                <span
                  class="${it.you
                    ? "text-amber-700"
                    : "text-slate-900"} text-sm font-bold"
                  >${it.you ? "★ " : ""}${it.name}</span
                >
                <span class="font-mono text-xs text-slate-500"
                  >${fmt(it.tokens)} tokens</span
                >
              </div>
              <div class="text-xs text-slate-500">${it.sub}</div>
              <div
                class="mt-2 h-3 overflow-hidden rounded-full bg-slate-100"
              >
                <div
                  class="${it.you
                    ? "bg-amber-500"
                    : "bg-blue-500"} h-full rounded-full"
                  style="width:${Math.max(w, 0.1)}%"
                ></div>
              </div>
            </button>`;
          })}
        </div>

        <div class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div class="mb-1 font-bold text-slate-900">${active.name}</div>
          <p class="mb-2 text-sm leading-relaxed text-slate-700">
            ${active.desc}
          </p>
          <p class="text-xs italic text-slate-600">
            Em livros equivalentes: ${analog(active.tokens)}
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define("scale-corpora", ScaleCorpora);
