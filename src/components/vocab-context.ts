/**
 * <vocab-context> · Tokens · janela de contexto 4 096 tokens.
 *
 * Selector de corpus mostra barra de uso e quanto fica fora da janela.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

const CONTEXT_LIMIT = 4096;

interface Corpus {
  key: string;
  label: string;
  tokens: number;
}

const CORPORA: Corpus[] = [
  { key: "1", label: "uma frase", tokens: 14 },
  { key: "2", label: "um parágrafo", tokens: 78 },
  { key: "3", label: "três casos", tokens: 410 },
  { key: "4", label: "manhã de relatórios", tokens: 3850 },
  { key: "5", label: "aula inteira", tokens: 10800 },
];

function comment(tokens: number): { type: "ok" | "warn"; msg: string } {
  if (tokens <= CONTEXT_LIMIT) {
    const pct = Math.round((tokens / CONTEXT_LIMIT) * 100);
    return {
      type: "ok",
      msg: `${tokens} tokens · ${pct} % usado. O modelo lê tudo.`,
    };
  }
  const lost = tokens - CONTEXT_LIMIT;
  const lostPct = Math.round((lost / tokens) * 100);
  return {
    type: "warn",
    msg: `Janela cheia · ${lostPct} % perdido. ${lost} tokens estão fora da janela. O modelo só vê os últimos ${CONTEXT_LIMIT}. O início desaparece silenciosamente.`,
  };
}

export class VocabContext extends IaElement {
  @property({ type: String, state: true }) active = "1";

  protected render() {
    const corpus = CORPORA.find((c) => c.key === this.active) ?? CORPORA[0];
    const tokens = corpus.tokens;
    const fit = Math.min(tokens, CONTEXT_LIMIT);
    const fitPct = (fit / CONTEXT_LIMIT) * 100;
    const overflow = Math.max(tokens - CONTEXT_LIMIT, 0);
    const cmt = comment(tokens);

    return html`
      <div>
        <p class="mb-3 text-sm text-slate-600">
          Aumenta o corpus. A janela é fixa em
          <strong>4 096 tokens</strong> (modelo de gama média). Vê o que
          acontece quando o teu texto é maior.
        </p>

        <div class="mb-4 flex flex-wrap gap-2">
          ${CORPORA.map(
            (c) => html`<button
              type="button"
              @click=${() => (this.active = c.key)}
              class="${this.active === c.key
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"} rounded-full border px-3 py-1 text-xs font-medium transition"
            >
              ${c.label}
            </button>`,
          )}
        </div>

        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div class="mb-2 flex items-baseline justify-between">
            <span
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Janela de contexto · 4 096 tokens
            </span>
            <span class="font-mono text-sm text-slate-700"
              >${tokens.toLocaleString()} tokens</span
            >
          </div>
          <div class="relative h-8 overflow-hidden rounded-md bg-slate-200">
            <div
              class="h-full bg-blue-500"
              style="width:${fitPct}%"
            ></div>
            ${overflow > 0
              ? html`<div
                  class="absolute right-0 top-0 h-full bg-red-500 opacity-70"
                  style="width:${Math.min((overflow / tokens) * 100, 100)}%"
                ></div>`
              : ""}
          </div>
          <div class="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <div class="text-slate-500">cabem na janela</div>
              <div class="font-mono font-bold text-blue-700">
                ${fit.toLocaleString()}
              </div>
            </div>
            <div>
              <div class="text-slate-500">cortados</div>
              <div
                class="${overflow > 0
                  ? "text-red-600"
                  : "text-slate-500"} font-mono font-bold"
              >
                ${overflow.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div
          class="${cmt.type === "warn"
            ? "border-l-4 border-red-500 bg-red-50"
            : "border-l-4 border-green-500 bg-green-50"} mt-3 rounded-lg p-3 text-sm leading-relaxed text-slate-700"
        >
          ${cmt.msg}
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Tokens estimados em pt-PT médico (~1.3× palavras).
        </p>
      </div>
    `;
  }
}

customElements.define("vocab-context", VocabContext);
