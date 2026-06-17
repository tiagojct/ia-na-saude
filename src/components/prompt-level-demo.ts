/**
 * <prompt-level-demo> · Prompts · FRACO / MÉDIO / BOM, highlighted diffs.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { readUrlParam, writeUrlParam } from "./_state";

type Level = "weak" | "mid" | "strong";

interface LevelData {
  grade: string;
  sub: string;
  promptHtml: string;
  response: string;
  notes: string[];
}

const LEVELS: Record<Level, LevelData> = {
  weak: {
    grade: "FRACO",
    sub: "vago",
    promptHtml: "explica asma",
    response:
      "A asma é uma doença respiratória crónica caracterizada por inflamação das vias aéreas. Os sintomas incluem dispneia, sibilos, tosse e aperto no peito. Pode ser desencadeada por alergénios, exercício, infecções ou stress. O tratamento envolve broncodilatadores e corticoides inalados…",
    notes: [
      "Resposta genérica, longa, tipo Wikipédia",
      "Sem público definido — tom flutua",
      "Sem formato — texto corrido sem estrutura",
    ],
  },
  mid: {
    grade: "MÉDIO",
    sub: "específico",
    promptHtml:
      'explica asma <mark class="rounded bg-amber-200 px-1 py-0.5">a um doente recém-diagnosticado</mark>',
    response:
      "As suas vias aéreas estão mais sensíveis do que o normal. Quando entram em contacto com algo que as irrita — fumo, ácaros, ar frio — apertam e produzem muco, e isso explica a falta de ar e o pieiro. Há dois tipos de medicação: a de manutenção, que toma todos os dias para manter as vias aéreas calmas, e a de alívio, para usar quando os sintomas aparecem…",
    notes: [
      "Tom adaptado ao leitor",
      "Ainda demasiado longa para uma consulta",
      "Sem formato definido",
    ],
  },
  strong: {
    grade: "BOM",
    sub: "estruturado",
    promptHtml:
      '<mark class="rounded bg-green-200 px-1 py-0.5">És um pneumologista a explicar a um doente adulto recém-diagnosticado com asma moderada.</mark> Em <mark class="rounded bg-green-200 px-1 py-0.5">3 parágrafos curtos</mark>, cobre: o que é, o que evitar, como usar o inalador. <mark class="rounded bg-green-200 px-1 py-0.5">Linguagem simples, sem jargão. Não dês doses concretas — refere o médico assistente.</mark>',
    response:
      "A asma é uma irritação crónica das vias aéreas. Em quem a tem, o tubo por onde o ar passa torna-se sensível e estreita-se com facilidade. Não há cura, mas com a medicação certa muitos doentes vivem sem sintomas durante anos.\n\nEvite o que sabe que o desencadeia. Os gatilhos mais comuns são fumo de tabaco, pó da casa, pêlos de animais, ar frio e infecções respiratórias. Pratique exercício — não o evite — mas converse com o médico sobre como o fazer com segurança.\n\nO inalador funciona se for usado bem. Agite, expire fora, sele os lábios, inspire devagar e profundamente enquanto carrega, segure a respiração 10 segundos. Para as doses, siga o que o seu médico assistente lhe prescreveu — eu não as posso fixar.",
    notes: [
      "Papel definido (pneumologista)",
      "Público explícito (adulto recém-diagnosticado)",
      "Formato definido (3 parágrafos)",
      "Restrições claras (sem jargão, sem doses)",
    ],
  },
};

export class PromptLevelDemo extends IaElement {
  static readonly PREFIX = "pl";

  @property({ type: String }) lvl: Level = "weak";

  connectedCallback(): void {
    super.connectedCallback();
    this.lvl = readUrlParam(PromptLevelDemo.PREFIX, "lvl", "weak") as Level;
  }

  private setLevel = (v: Level) => {
    this.lvl = v;
    writeUrlParam(PromptLevelDemo.PREFIX, "lvl", v);
  };

  protected render() {
    const meta = LEVELS[this.lvl];
    return html`
      <div>
        <div class="mb-4 flex gap-2">
          ${(Object.keys(LEVELS) as Level[]).map((l) => {
            const m = LEVELS[l];
            const active = this.lvl === l;
            const colors = active
              ? l === "weak"
                ? "border-red-500 bg-red-50 text-red-700"
                : l === "mid"
                  ? "border-amber-500 bg-amber-50 text-amber-700"
                  : "border-green-500 bg-green-50 text-green-700"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50";
            return html`<button
              type="button"
              @click=${() => this.setLevel(l)}
              class="${colors} flex-1 rounded-lg border-2 px-3 py-2 text-sm font-bold transition"
            >
              <div>${m.grade}</div>
              <div class="text-xs font-medium opacity-70">${m.sub}</div>
            </button>`;
          })}
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Prompt
            </div>
            <div
              class="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-800"
            >
              ${unsafeHTML(meta.promptHtml)}
            </div>
          </div>
          <div>
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Resposta
            </div>
            <div
              class="rounded-lg border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800"
            >
              <pre class="whitespace-pre-wrap font-sans">${meta.response}</pre>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-blue-700"
          >
            o que mudou
          </div>
          <ul class="space-y-1 text-sm text-slate-700">
            ${meta.notes.map((n) => html`<li>· ${n}</li>`)}
          </ul>
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          Receita: <strong>papel · público · formato · restrições</strong>.
          Quanto mais explícito, menos espaço para o modelo improvisar.
        </p>
      </div>
    `;
  }
}

customElements.define("prompt-level-demo", PromptLevelDemo);
