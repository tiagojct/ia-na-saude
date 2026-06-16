/**
 * <tokenizer-demo> · Tokens · pt-PT vs en BPE comparison.
 *
 * Pedagogical tokenizer using morpheme prefix matching (not a real BPE
 * model). Designed to show the consistent 25-35 % pt-PT penalty against
 * English in clinical text, plus the BPE-like sub-word cuts on long terms.
 *
 * Source: ports src/components/demos/TokenizerDemo.tsx from learning-health-ai.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam, buildShareURL } from "./_state";

const PT_MORPHEMES = [
  "pneumo", "necto", "mia", "cardio", "patia", "ologia", "ologo", "scopia",
  "graphia", "centese", "ectomia", "plastia", "stomia", "tomia", "rrágica",
  "rrágia", "anti", "hipo", "hiper", "endo", "epi", "para", "peri", "pré",
  "pós", "trans", "intra", "extra", "sub", "supra", "inter", "intro",
  "anti", "auto", "bi", "tri", "tetra", "poli", "mono", "iso", "macro",
  "micro", "mega", "mini", "tor", "torá", "cica", "diabe", "tes", "ção",
  "ções", "mente", "ável", "ível", "ado", "ido", "endo", "ando", "ar",
  "er", "ir", "co", "ca", "os", "as", "es",
].sort((a, b) => b.length - a.length);

const EN_MORPHEMES = [
  "pneumo", "nect", "omy", "ectomy", "ology", "ologist", "scopy", "graphy",
  "centesis", "plasty", "stomy", "tomy", "rrhag", "anti", "hypo", "hyper",
  "endo", "epi", "para", "peri", "trans", "intra", "extra", "sub", "supra",
  "inter", "auto", "ic", "ical", "ation", "tion", "ing", "ed", "er", "or",
].sort((a, b) => b.length - a.length);

interface Preset {
  label: string;
  pt: string;
  en: string;
}

const PRESETS: Preset[] = [
  {
    label: "frase curta",
    pt: "O doente apresenta tosse produtiva há 3 dias.",
    en: "Patient presents with productive cough for 3 days.",
  },
  {
    label: "termo composto",
    pt: "Pneumonectomia urgente por carcinoma broncopulmonar.",
    en: "Urgent pneumonectomy for bronchopulmonary carcinoma.",
  },
  {
    label: "nota da Maria",
    pt: "Maria Joaquina, 64 anos. Antecedentes: HTA, DM2 (HbA1c 9,1 %), ex-fumadora 30 maços-ano. Presente: dor retroesternal, dispneia, sudorese.",
    en: "Maria Joaquina, 64 years. History: hypertension, T2D (HbA1c 9.1%), ex-smoker 30 pack-years. Now: retrosternal pain, dyspnea, sweating.",
  },
];

function tokenize(text: string, isEnglish: boolean): string[] {
  if (!text) return [];
  const morphemes = isEnglish ? EN_MORPHEMES : PT_MORPHEMES;
  const out: string[] = [];
  const parts = text.split(/(\s+|[.,!?;:()\[\]\-\/])/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) continue;
    if (/^[.,!?;:()\[\]\-\/]$/.test(part)) {
      out.push(part);
      continue;
    }
    if (part.length <= 4) {
      out.push(part);
      continue;
    }
    let remaining = part;
    const subs: string[] = [];
    while (remaining.length > 0) {
      let matched = false;
      for (const m of morphemes) {
        if (
          remaining.length >= m.length &&
          remaining.toLowerCase().startsWith(m)
        ) {
          subs.push(remaining.slice(0, m.length));
          remaining = remaining.slice(m.length);
          matched = true;
          break;
        }
      }
      if (!matched) {
        const chunk = Math.min(4, remaining.length);
        subs.push(remaining.slice(0, chunk));
        remaining = remaining.slice(chunk);
      }
    }
    if (subs.length === 0) subs.push(part);
    out.push(...subs);
  }
  return out;
}

export class TokenizerDemo extends IaElement {
  static readonly PREFIX = "tk";

  @property({ type: String }) pt = "";
  @property({ type: String }) en = "";
  @property({ type: Boolean, state: true }) copied = false;

  connectedCallback(): void {
    super.connectedCallback();
    const initial = PRESETS[0];
    this.pt = readUrlParam(TokenizerDemo.PREFIX, "pt", initial.pt) as string;
    this.en = readUrlParam(TokenizerDemo.PREFIX, "en", initial.en) as string;
  }

  private setPt = (e: Event) => {
    const v = (e.target as HTMLTextAreaElement).value;
    this.pt = v;
    writeUrlParam(TokenizerDemo.PREFIX, "pt", v);
  };

  private setEn = (e: Event) => {
    const v = (e.target as HTMLTextAreaElement).value;
    this.en = v;
    writeUrlParam(TokenizerDemo.PREFIX, "en", v);
  };

  private loadPreset = (p: Preset) => () => {
    this.pt = p.pt;
    this.en = p.en;
    writeUrlParam(TokenizerDemo.PREFIX, "pt", p.pt);
    writeUrlParam(TokenizerDemo.PREFIX, "en", p.en);
  };

  private shareLink = async () => {
    const url = buildShareURL("tokens");
    try {
      const nav = navigator as Navigator & {
        canShare?: (data: { url: string }) => boolean;
      };
      if (nav.share && nav.canShare?.({ url })) {
        await nav.share({ url, title: "Tokenizador · IA · Saúde" });
      } else {
        await navigator.clipboard.writeText(url);
      }
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* ignore · user cancelled or clipboard refused */
    }
  };

  protected render() {
    const ptTokens = tokenize(this.pt, false);
    const enTokens = tokenize(this.en, true);
    const ratioPct =
      enTokens.length > 0
        ? Math.round((ptTokens.length / enTokens.length - 1) * 100)
        : 0;
    return html`
      <div>
        <div class="mb-3 flex flex-wrap items-center gap-2">
          ${PRESETS.map(
            (p) => html`<button
              type="button"
              @click=${this.loadPreset(p)}
              class="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            >
              ${p.label}
            </button>`,
          )}
          <button
            type="button"
            @click=${this.shareLink}
            class="ml-auto rounded-full border border-blue-300 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:border-blue-400 hover:bg-blue-100"
            aria-label="partilhar estado actual deste demo"
            title="partilhar este demo com estes inputs"
          >
            ${this.copied ? "✓ link copiado" : "🔗 partilhar este demo"}
          </button>
        </div>

        <div class="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >pt-PT</label
            >
            <textarea
              aria-label="texto pt-PT a tokenizar"
              class="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="3"
              .value=${this.pt}
              @input=${this.setPt}
            ></textarea>
          </div>
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >inglês equivalente</label
            >
            <textarea
              aria-label="inglês equivalente a tokenizar"
              class="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              rows="3"
              .value=${this.en}
              @input=${this.setEn}
            ></textarea>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-lg border border-blue-300 bg-blue-50 p-3">
            <div class="mb-2 flex items-baseline justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-blue-700"
                >pt-PT</span
              >
              <span class="font-mono text-2xl font-bold text-blue-700"
                >${ptTokens.length}</span
              >
            </div>
            <div class="text-xs text-slate-600">tokens</div>
            <div class="mt-3 flex flex-wrap gap-1">
              ${ptTokens.map(
                (t) => html`<span
                  class="${/^[.,!?;:()]+$/.test(t)
                    ? "bg-slate-200 text-slate-500"
                    : "bg-white text-blue-800 border border-blue-200"} rounded px-1.5 py-0.5 text-xs font-mono"
                  >${t}</span
                >`,
              )}
            </div>
          </div>

          <div class="rounded-lg border border-slate-300 bg-slate-50 p-3">
            <div class="mb-2 flex items-baseline justify-between">
              <span
                class="text-xs font-bold uppercase tracking-wider text-slate-700"
                >inglês</span
              >
              <span class="font-mono text-2xl font-bold text-slate-700"
                >${enTokens.length}</span
              >
            </div>
            <div class="text-xs text-slate-600">tokens</div>
            <div class="mt-3 flex flex-wrap gap-1">
              ${enTokens.map(
                (t) => html`<span
                  class="${/^[.,!?;:()]+$/.test(t)
                    ? "bg-slate-200 text-slate-500"
                    : "bg-white text-slate-700 border border-slate-300"} rounded px-1.5 py-0.5 text-xs font-mono"
                  >${t}</span
                >`,
              )}
            </div>
          </div>
        </div>

        <div
          class="mt-4 rounded-lg p-3 text-sm ${ratioPct > 0
            ? "border-l-4 border-amber-500 bg-amber-50 text-slate-700"
            : "border-l-4 border-green-500 bg-green-50 text-slate-700"}"
        >
          pt-PT custa
          <strong>${ratioPct > 0 ? `+${ratioPct}%` : `${ratioPct}%`}</strong>
          face ao inglês equivalente.
          ${ratioPct > 0
            ? " Em 1 000 chamadas, são tokens (e custo) extra que o inglês evita."
            : ""}
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Tokenizador heurístico para fins pedagógicos. O BPE real produz
          cortes próximos mas não iguais. A penalização do pt face ao en é
          consistente em todos os tokenizadores treinados em corpora
          maioritariamente ingleses.
        </p>
      </div>
    `;
  }
}

customElements.define("tokenizer-demo", TokenizerDemo);
