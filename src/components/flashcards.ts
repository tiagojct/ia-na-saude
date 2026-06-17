/**
 * <flashcards> · Aprofundar · 14 termos · Leitner spaced repetition.
 *
 * Boxes 0..5. Intervals: 4h, 1d, 3d, 7d, 14d. Box 5 = mastered.
 * localStorage key: ia-saude-flashcards.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { LEITNER_INTERVALS_MS, leitnerNext } from "../lib/math";

interface Card {
  id: string;
  term: string;
  def: string;
  app: string;
}

const CARDS: Card[] = [
  { id: "token", term: "Token", def: "Unidade mínima que o modelo lê e escreve. Pode ser palavra, pedaço de palavra ou sinal de pontuação.", app: "Maria: a nota dela em pt-PT custa cerca de 30 % mais tokens que a versão inglesa, porque “anti-inflamatórios” parte em mais sub-tokens que “anti-inflammatories”." },
  { id: "tokenizador", term: "Tokenizador", def: "Algoritmo (BPE) que parte texto em tokens. Treinado num corpus específico; fora desse corpus, parte mal.", app: "Tokenizadores treinados em inglês fragmentam o pt-PT em pedaços absurdos, originando sobrecusto e perda de janela." },
  { id: "parametro", term: "Parâmetro", def: "Número aprendido durante o treino: um peso na rede neuronal. Modelos modernos têm milhares de milhões.", app: "GPT-3 tem 175 mil milhões de parâmetros. Cérebro humano: ~86 mil milhões de neurónios. Escalas comparáveis, mecanismos diferentes." },
  { id: "pretreino", term: "Pré-treino", def: "Fase 1 do treino. O modelo lê quase toda a internet e aprende a prever o próximo token.", app: "É aqui que o modelo “ganha” linguagem, mas ainda não sabe obedecer a instruções." },
  { id: "sft", term: "SFT (supervised fine-tuning)", def: "Fase 2. Humanos escrevem milhares de exemplos pergunta→resposta-ideal. O modelo aprende o formato de obediência.", app: "É a SFT que transforma “papagaio estatístico” em “assistente que segue instruções”." },
  { id: "rlhf", term: "RLHF", def: "Fase 3. Humanos comparam pares de respostas; o modelo aprende a preferência. Afina tom, segurança, recusa.", app: "É o RLHF que evita que o modelo te dê instruções perigosas, e também o que por vezes o torna excessivamente cauteloso." },
  { id: "softmax", term: "Softmax", def: "Função que converte logits (números crus) em probabilidades sobre o vocabulário.", app: "Cada palavra que vês foi escolhida por uma softmax: probabilidade, sem compreensão." },
  { id: "temperatura", term: "Temperatura", def: "Hiperparâmetro que controla a aleatoriedade da amostragem. T=0 escolhe sempre o mais provável; T>1 dá variedade, com mais risco.", app: "Para tarefas clínicas verificáveis (DD, doses), T baixo. Para brainstorm, T alto." },
  { id: "alucinacao", term: "Alucinação", def: "Resposta fluente e confiante mas factualmente incorrecta: citações inventadas, doses erradas.", app: "O LLM moderno está quase sempre na linha de cima do mapa fluência×veracidade. Verifica antes de assinar." },
  { id: "rag", term: "RAG", def: "Retrieval-Augmented Generation. O modelo procura fontes externas antes de responder e cita-as.", app: "Em uso clínico, RAG bem desenhado corta alucinações em 30–60 %. Mas RAG mal desenhado pode até alucinar mais." },
  { id: "agente", term: "Agente", def: "LLM que actua para além de conversar: marca consultas, lê processos, escreve cartas. Cada acção crítica passa por gate humano.", app: "Erro do chatbot fica no ecrã, erro do agente vai parar à doente." },
  { id: "rgpd", term: "RGPD · anonimização", def: "Tirar nome e data de nascimento não chega. Morada, idade e diagnóstico raro reidentificam em conjunto.", app: "Antes de colar nota num LLM público: corre detector de PII, substitui placeholders, reavalia se a combinação restante reidentifica." },
  { id: "sens-spec", term: "Sensibilidade vs especificidade", def: 'Sens = capta os doentes. Spec = não alarma os saudáveis. O cursor mexe-se; não há "óptimo" universal.', app: "Rastreio de cancro: sensibilidade alta. Confirmação de diagnóstico raro: especificidade alta." },
  { id: "delegacao", term: "Delegação por reversibilidade", def: "Erro reversível (resumir, traduzir): autonomia. Erro irreversível (prescrever, decidir alta): revisão humana.", app: "Em medicina, quase tudo o que importa é irreversível. Daí a regra: o modelo apoia, o médico assina." },
];

interface CardState {
  box: number;
  dueAt: number;
  reviews: number;
}

type Store = Record<string, CardState>;

function loadStore(): Store {
  try {
    return JSON.parse(localStorage.getItem("ia-saude-flashcards") || "{}");
  } catch {
    return {};
  }
}

function saveStore(s: Store) {
  try {
    localStorage.setItem("ia-saude-flashcards", JSON.stringify(s));
  } catch {
    /* ignored */
  }
}

export class Flashcards extends IaElement {
  @property({ type: Object, state: true }) store: Store = {};
  @property({ type: Boolean, state: true }) flipped = false;
  @property({ type: Boolean, state: true }) showAll = false;
  @property({ type: Boolean, state: true }) pendingReset = false;

  private timer: number | null = null;

  private storageHandler = (e: StorageEvent) => {
    if (e.key === "ia-saude-flashcards" || e.key === null) {
      this.store = loadStore();
    }
  };

  connectedCallback(): void {
    super.connectedCallback();
    this.store = loadStore();
    window.addEventListener("storage", this.storageHandler);
    this.scheduleNextDue();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("storage", this.storageHandler);
    if (this.timer) window.clearTimeout(this.timer);
  }

  updated() {
    this.scheduleNextDue();
  }

  private scheduleNextDue() {
    if (this.timer) window.clearTimeout(this.timer);
    const now = Date.now();
    const nextDue = Object.values(this.store)
      .filter((s) => s.box < 5 && s.dueAt > now)
      .map((s) => s.dueAt)
      .sort((a, b) => a - b)[0];
    if (!nextDue) return;
    const delay = Math.min(Math.max(nextDue - now, 1000), 60 * 60 * 1000);
    this.timer = window.setTimeout(() => this.requestUpdate(), delay);
  }

  private queue() {
    const now = Date.now();
    const items = CARDS.map((c) => {
      const s = this.store[c.id] || { box: 0, dueAt: 0, reviews: 0 };
      return { card: c, state: s };
    });
    if (this.showAll) return items;
    return items
      .filter((i) => i.state.box < 5 && i.state.dueAt <= now)
      .sort((a, b) => {
        if (a.state.reviews === 0 && b.state.reviews > 0) return -1;
        if (b.state.reviews === 0 && a.state.reviews > 0) return 1;
        return a.state.dueAt - b.state.dueAt;
      });
  }

  private rate = (known: boolean) => {
    const q = this.queue();
    const cur = q[0];
    if (!cur) return;
    const { box, dueAt } = leitnerNext(cur.state.box, known);
    const next: Store = {
      ...this.store,
      [cur.card.id]: { box, dueAt, reviews: cur.state.reviews + 1 },
    };
    this.store = next;
    saveStore(next);
    this.flipped = false;
  };

  private doReset = () => {
    try {
      localStorage.removeItem("ia-saude-flashcards");
    } catch {
      /* ignored */
    }
    this.store = {};
    this.flipped = false;
    this.pendingReset = false;
  };

  protected render() {
    const q = this.queue();
    const current = q[0];
    const nowMs = Date.now();
    const mastered = CARDS.filter(
      (c) => (this.store[c.id]?.box ?? 0) >= 5,
    ).length;
    const dueNow = CARDS.filter((c) => {
      const s = this.store[c.id];
      if (!s) return false;
      return s.box < 5 && s.dueAt <= nowMs;
    }).length;
    const learning = CARDS.length - mastered;
    const newCards = CARDS.filter((c) => !this.store[c.id]).length;

    return html`
      <div>
        <div class="mb-3 grid grid-cols-4 gap-2 text-xs">
          ${this.stat(newCards, "novas", "blue")}
          ${this.stat(dueNow, "para rever", "amber")}
          ${this.stat(learning, "a aprender", "slate")}
          ${this.stat(mastered, "dominadas", "green")}
        </div>

        ${!current && !this.showAll
          ? html`<div
              class="rounded-2xl border-2 border-green-300 bg-green-50 p-6 text-center"
            >
              <div class="mb-2 text-3xl">✓</div>
              <div class="mb-2 text-lg font-bold text-slate-900">
                ${mastered === CARDS.length
                  ? "Todas dominadas."
                  : "Sem cartas para rever agora."}
              </div>
              <p class="mb-4 text-sm leading-relaxed text-slate-600">
                ${mastered === CARDS.length
                  ? "Volta daqui a 30 dias para um repasso final."
                  : "Volta mais tarde — o intervalo de Leitner protege a memória de longo prazo."}
              </p>
              <button
                type="button"
                @click=${() => (this.showAll = true)}
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Rever mesmo assim
              </button>
            </div>`
          : ""}
        ${current
          ? html`<button
                type="button"
                @click=${() => (this.flipped = !this.flipped)}
                class="block min-h-44 w-full rounded-2xl border border-slate-300 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
                aria-label="Carta. Click para virar."
              >
                ${!this.flipped
                  ? html`<div class="text-center">
                      <div
                        class="mb-2 text-xs uppercase tracking-wider text-slate-500"
                      >
                        termo · caixa ${current.state.box} / 5
                      </div>
                      <div
                        class="font-display text-3xl font-bold tracking-tight text-slate-900"
                      >
                        ${current.card.term}
                      </div>
                      <div class="mt-4 text-xs italic text-slate-500">
                        click ou espaço · vira a carta
                      </div>
                    </div>`
                  : html`<div>
                      <div
                        class="mb-2 text-xs uppercase tracking-wider text-slate-500"
                      >
                        definição
                      </div>
                      <p class="mb-3 text-sm leading-relaxed text-slate-800">
                        ${current.card.def}
                      </p>
                      <div
                        class="mb-1 text-xs uppercase tracking-wider text-blue-700"
                      >
                        em prática
                      </div>
                      <p class="text-sm leading-relaxed text-slate-600">
                        ${current.card.app}
                      </p>
                    </div>`}
              </button>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  @click=${() => this.rate(false)}
                  ?disabled=${!this.flipped}
                  class="rounded-lg border-2 border-red-300 bg-white px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  ↻ não sei
                  <div class="text-[10px] font-normal text-red-500">
                    revê em ~4h
                  </div>
                </button>
                <button
                  type="button"
                  @click=${() => this.rate(true)}
                  ?disabled=${!this.flipped}
                  class="rounded-lg bg-green-600 px-4 py-3 text-sm font-bold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  ✓ sei
                  <div class="text-[10px] font-normal text-green-100">
                    ${current.state.box + 1 < LEITNER_INTERVALS_MS.length
                      ? `revê em ~${Math.round(LEITNER_INTERVALS_MS[current.state.box + 1] / (24 * 60 * 60 * 1000))}d`
                      : "dominada"}
                  </div>
                </button>
              </div>

              ${current.state.reviews > 0
                ? html`<p class="mt-2 text-center text-xs text-slate-500">
                    ${current.state.reviews} revisões ·
                    ${current.state.box + 1 < LEITNER_INTERVALS_MS.length
                      ? `próximo intervalo se acertares: caixa ${current.state.box + 1}`
                      : "no topo da escada — próxima revisão certa marca como dominada"}
                  </p>`
                : ""}`
          : ""}

        <div class="mt-4 flex items-center justify-between text-xs">
          <span class="text-slate-500">
            ${this.showAll
              ? "modo livre · sem efeito espaçado"
              : "Leitner · intervalos 4h / 1d / 3d / 7d / 14d"}
          </span>
          <div class="flex gap-2">
            ${this.showAll
              ? html`<button
                  type="button"
                  @click=${() => (this.showAll = false)}
                  class="font-medium text-blue-700 underline underline-offset-2 hover:no-underline"
                >
                  voltar a Leitner
                </button>`
              : ""}
            ${!this.pendingReset
              ? html`<button
                  type="button"
                  @click=${() => (this.pendingReset = true)}
                  class="font-medium text-slate-500 hover:text-red-600"
                >
                  apagar progresso
                </button>`
              : html`<div class="flex items-center gap-1">
                  <span class="text-slate-500">apagar mesmo?</span>
                  <button
                    type="button"
                    @click=${this.doReset}
                    class="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white hover:bg-red-700"
                  >
                    sim
                  </button>
                  <button
                    type="button"
                    @click=${() => (this.pendingReset = false)}
                    class="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    cancelar
                  </button>
                </div>`}
          </div>
        </div>
      </div>
    `;
  }

  private stat(n: number, label: string, color: string) {
    const colors = {
      blue: "border-slate-200 bg-white text-blue-700",
      amber: "border-amber-200 bg-amber-50 text-amber-700",
      slate: "border-slate-200 bg-white text-slate-700",
      green: "border-green-200 bg-green-50 text-green-700",
    } as const;
    const labelColor = color === "amber" || color === "green" ? `text-${color}-700` : "text-slate-500";
    return html`<div
      class="${colors[color as keyof typeof colors]} rounded-lg border p-2 text-center"
    >
      <div class="font-mono text-lg font-bold">${n}</div>
      <div class="${labelColor} text-[10px] uppercase tracking-wider">
        ${label}
      </div>
    </div>`;
  }
}

customElements.define("flashcards", Flashcards);
