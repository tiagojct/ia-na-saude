/**
 * <next-word-demo> · Mecanismo · softmax + temperature sampling.
 *
 * Distribuição base de 8 candidatos. Slider de temperatura achata ou
 * colapsa. Botão "sortear" usa amostragem multinomial. Repetition penalty
 * (-1.2 por ocorrência) previne loops "sudorese · sudorese · …".
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam, buildShareURL } from "./_state";
import { softmax } from "../lib/math";

interface Candidate {
  word: string;
  logit: number;
}

const BASE_DIST: Candidate[] = [
  { word: "sudorese", logit: 1.3 },
  { word: "dispneia", logit: 1.0 },
  { word: "irradiação para o braço esquerdo", logit: 0.5 },
  { word: "náuseas", logit: 0.2 },
  { word: "ansiedade", logit: -0.1 },
  { word: "palpitações", logit: -0.5 },
  { word: "tonturas", logit: -0.9 },
  { word: "indigestão", logit: -1.4 },
];

const PROMPT = "Maria, 64, HTA + DM2, dor torácica e";
const REPETITION_PENALTY = 1.2;
const MAX_SAMPLES = 8;

export class NextWordDemo extends IaElement {
  static readonly PREFIX = "nw";

  @property({ type: Number }) t = 0.7;
  @property({ type: Array, state: true }) picked: string[] = [];
  @property({ type: Boolean, state: true }) copied = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.t = readUrlParam(NextWordDemo.PREFIX, "t", 0.7) as number;
  }

  private setT = (e: Event) => {
    const v = parseFloat((e.target as HTMLInputElement).value);
    this.t = v;
    writeUrlParam(NextWordDemo.PREFIX, "t", v);
  };

  private sample = () => {
    if (this.picked.length >= MAX_SAMPLES) return;
    const probs = this.computeProbs();
    const r = Math.random();
    let acc = 0;
    for (let i = 0; i < probs.length - 1; i++) {
      acc += probs[i];
      if (r < acc) {
        this.picked = [...this.picked, BASE_DIST[i].word];
        return;
      }
    }
    this.picked = [...this.picked, BASE_DIST[BASE_DIST.length - 1].word];
  };

  private reset = () => {
    this.picked = [];
  };

  private shareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareURL("funciona"));
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* ignored */
    }
  };

  private computeProbs(): number[] {
    const counts = new Map<string, number>();
    for (const w of this.picked) counts.set(w, (counts.get(w) ?? 0) + 1);
    const logits = BASE_DIST.map(
      (c) => c.logit - (counts.get(c.word) ?? 0) * REPETITION_PENALTY,
    );
    return softmax(logits, this.t);
  }

  protected render() {
    const probs = this.computeProbs();
    const atCap = this.picked.length >= MAX_SAMPLES;

    return html`
      <div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            prompt
          </div>
          <div
            class="mt-1 font-mono text-sm leading-relaxed text-slate-800"
          >
            ${PROMPT}
            ${this.picked.length > 0
              ? html`<span
                  class="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700"
                >
                  ${this.picked.join(" · ")}</span
                >`
              : ""}
            <span
              class="ml-1 inline-block h-4 w-2 animate-pulse bg-blue-500"
            ></span>
          </div>
        </div>

        <div class="mt-4">
          <div class="mb-2 flex items-baseline justify-between">
            <label
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
              >temperatura</label
            >
            <span class="font-mono text-sm font-bold text-slate-700"
              >T = ${this.t.toFixed(2)}</span
            >
          </div>
          <input
            type="range"
            aria-label="temperatura de amostragem"
            min="0.05"
            max="2"
            step="0.05"
            .value=${String(this.t)}
            @input=${this.setT}
            class="w-full accent-blue-600"
          />
          <div class="mt-1 flex justify-between text-xs text-slate-500">
            <span>determinista (T≈0)</span>
            <span>criativo / mais alucinação (T≫1)</span>
          </div>
        </div>

        <div class="mt-5">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            distribuição de probabilidade · próximo token
          </div>
          <div class="space-y-1">
            ${BASE_DIST.map((c, i) => {
              const p = probs[i];
              const pct = (p * 100).toFixed(1);
              const w = Math.max(p * 100, 0.5);
              return html`<div class="flex items-center gap-3">
                <div class="w-48 truncate text-xs text-slate-700">
                  ${c.word}
                </div>
                <div class="flex-1">
                  <div class="h-5 overflow-hidden rounded bg-slate-100">
                    <div
                      class="${i === 0 ? "bg-blue-600" : "bg-blue-300"} h-full rounded"
                      style="width:${w}%;transition:width 200ms"
                    ></div>
                  </div>
                </div>
                <div
                  class="w-12 text-right font-mono text-xs text-slate-600"
                >
                  ${pct}%
                </div>
              </div>`;
            })}
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            @click=${this.sample}
            ?disabled=${atCap}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            ▶ Sortear próximo token
          </button>
          <button
            type="button"
            @click=${this.reset}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reiniciar
          </button>
          <span class="self-center text-xs text-slate-500">
            ${this.picked.length} / ${MAX_SAMPLES}
            ${this.picked.length === 1 ? "amostra" : "amostras"}
            ${atCap ? " · reinicia para continuar" : ""}
          </span>
          <button
            type="button"
            @click=${this.shareLink}
            class="ml-auto rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100"
            title="partilhar este demo com esta temperatura"
          >
            ${this.copied ? "✓ link copiado" : "🔗 partilhar"}
          </button>
        </div>

        <p class="mt-4 text-xs italic text-slate-500">
          Distribuição ilustrativa. Move o T e vê a distribuição achatar
          (T alta) ou colapsar no topo (T baixa). Após cada amostragem
          aplica-se <strong>repetition penalty</strong> (−${REPETITION_PENALTY.toFixed(1)}
          no logit por ocorrência) — é por isso que os modelos reais não
          ficam presos em “sudorese · sudorese · sudorese”. Em clínica,
          queres T próximo de zero — reprodutibilidade vence criatividade.
        </p>
      </div>
    `;
  }
}

customElements.define("next-word-demo", NextWordDemo);
