/**
 * <eliza-chat> · História · ELIZA pattern-matching chatbot (1966 réplica).
 *
 * Padrões pt-PT: estados emocionais, verbos afectivos, família, meta.
 * Fallbacks rotativos para evitar "continua, estou a ouvir" eterno.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Msg {
  who: "user" | "eliza";
  text: string;
}

interface Pattern {
  re: RegExp;
  pre?: string;
  post?: string;
  static?: string;
  use_group?: boolean;
}

const PATTERNS: Pattern[] = [
  { re: /(?:sinto-me|estou|ando|fico|tenho-me sentido)\s+(?:muito\s+|um pouco\s+|bastante\s+|sempre\s+)?(.+)/i, pre: "Há quanto tempo te sentes ", post: "?", use_group: true },
  { re: /(?:eu\s+)?(?:tenho|ando com|tive)\s+(.+)/i, pre: "Conta-me mais sobre esse(a) ", post: ".", use_group: true },
  { re: /(?:eu\s+)?(?:quero|queria|gostava de|gostaria de|preciso de)\s+(.+)/i, pre: "Porque ", post: "?", use_group: true },
  { re: /(?:eu\s+)?não\s+(?:consigo|posso|sei)\s+(.+)/i, pre: "O que te impede de ", post: "?", use_group: true },
  { re: /(?:eu\s+)?sou\s+(.+)/i, pre: "Há quanto tempo te consideras ", post: "?", use_group: true },
  { re: /(?:eu\s+)?(?:acho|penso|creio|julgo|sinto)\s+que\s+(.+)/i, pre: "Por que razão ", post: "?", use_group: true },
  { re: /(?:tu\s+)?(?:és|estás)\s+(.+)/i, pre: "Por que dizes que sou ", post: "?", use_group: true },
  { re: /^\s*não\s*[.!]?$/i, static: "Porque não?" },
  { re: /^\s*sim\s*[.!]?$/i, static: "Pareces seguro disso. Conta-me mais." },
  { re: /talvez|se calhar|provavelmente/i, static: "Não te queres comprometer?" },
  { re: /(?:minha\s+|a\s+)?mãe|mamã|mamãe/i, static: "Conta-me mais sobre a tua família. Como é a relação?" },
  { re: /(?:meu\s+|o\s+)?pai|papá/i, static: "Conta-me mais sobre a tua família. Como é a relação?" },
  { re: /irmão|irmã|filho|filha|marido|esposa|namorad[oa]|companheir[oa]/i, static: "Como é essa relação para ti?" },
  { re: /\b(triste|deprimid[oa]|infeliz|em baixo|sem energia)\b/i, static: "Diz-me em que momentos essa tristeza aparece mais." },
  { re: /\b(ansios[oa]|nervos[oa]|preocupad[oa]|stressad[oa]|stress)\b/i, static: "O que costuma despoletar essa ansiedade?" },
  { re: /\b(zangad[oa]|irritad[oa]|frustrad[oa]|com raiva)\b/i, static: "Com quem ou com o quê estás zangad@?" },
  { re: /\b(sozinh[oa]|isolad[oa])\b/i, static: "Há quanto tempo te sentes assim?" },
  { re: /\b(cansad[oa]|exaust[oa]|esgotad[oa])\b/i, static: "Esse cansaço é físico, mental, ou ambos?" },
  { re: /\b(medo|receio|assustad[oa])\b/i, static: "De que tens medo, especificamente?" },
  { re: /\b(culpa|culpad[oa])\b/i, static: "Por que sentes essa culpa?" },
  { re: /\b(amor|amo|amava|gosto de)\b/i, static: "Fala-me dessa pessoa." },
  { re: /\b(dor|dói|magoa)\b/i, static: "Essa dor é física ou emocional?" },
  { re: /\b(porque|porquê|pra que|para que)\b/i, static: "Por que te parece importante essa razão?" },
  { re: /\?$/, static: "Porque perguntas isso?" },
  { re: /\b(tu|você)\b/i, static: "Estamos a falar de ti, não de mim." },
  { re: /\b(sempre|nunca)\b/i, static: "Sempre? Consegues lembrar-te de uma excepção?" },
  { re: /\b(ninguém|todos|toda a gente)\b/i, static: "Toda a gente? De quem em particular falas?" },
];

const FALLBACKS = [
  "Continua, estou a ouvir.",
  "E o que sentes em relação a isso?",
  "Diz-me um exemplo concreto.",
  "Por que escolheste essa palavra?",
  "Como é que isso te afecta no dia-a-dia?",
  "Há quanto tempo te ocupas com este assunto?",
  "Que mais te vem à cabeça quando pensas nisso?",
];

export class ElizaChat extends IaElement {
  @property({ type: Array, state: true }) messages: Msg[] = [
    { who: "eliza", text: "Olá. Como te sentes hoje?" },
  ];
  @property({ type: String, state: true }) input = "";

  private fallbackIdx = 0;

  private reply(text: string): string {
    for (const p of PATTERNS) {
      const m = text.match(p.re);
      if (m) {
        if (p.static) return p.static;
        const group = p.use_group && m[1] ? m[1].replace(/[.?!]+$/, "") : "";
        return `${p.pre ?? ""}${group}${p.post ?? ""}`;
      }
    }
    const r = FALLBACKS[this.fallbackIdx % FALLBACKS.length];
    this.fallbackIdx++;
    return r;
  }

  private send = () => {
    const t = this.input.trim();
    if (!t) return;
    this.messages = [
      ...this.messages,
      { who: "user", text: t },
      { who: "eliza", text: this.reply(t) },
    ];
    this.input = "";
  };

  updated() {
    const c = this.querySelector("[data-eliza-log]");
    if (c) c.scrollTop = c.scrollHeight;
  }

  protected render() {
    const userTurns = this.messages.filter((m) => m.who === "user").length;
    return html`
      <div>
        <div
          data-eliza-log
          class="max-h-72 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3"
        >
          ${this.messages.map(
            (m) => html`<div
              class="${m.who === "user" ? "justify-end" : "justify-start"} flex"
            >
              <div
                class="${m.who === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-slate-800 border border-slate-200"} max-w-[80%] rounded-2xl px-3 py-2 text-sm"
              >
                <div class="mb-0.5 text-xs opacity-70">
                  ${m.who === "user" ? "tu" : "eliza"}
                </div>
                ${m.text}
              </div>
            </div>`,
          )}
        </div>
        <div class="mt-3 flex gap-2">
          <input
            aria-label="Mensagem para ELIZA"
            class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            placeholder="Conta-me como te sentes..."
            .value=${this.input}
            @input=${(e: Event) =>
              (this.input = (e.target as HTMLInputElement).value)}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === "Enter") this.send();
            }}
          />
          <button
            type="button"
            @click=${this.send}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Enviar
          </button>
        </div>
        ${userTurns >= 5
          ? html`<p class="mt-3 text-xs italic text-slate-500">
              Em 1966, doentes contavam coisas íntimas a este script. Pattern
              matching, nada mais.
            </p>`
          : ""}
      </div>
    `;
  }
}

customElements.define("eliza-chat", ElizaChat);
