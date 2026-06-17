/**
 * <era-timeline> · História · 20 marcos 1950-2026, filtro por era.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

type Era = "classic" | "winter" | "deep" | "gen";

interface EraDef {
  id: Era;
  name: string;
  years: string;
  color: string;
}

const ERAS: EraDef[] = [
  { id: "classic", name: "Clássica", years: "1950–1980", color: "bg-amber-100 text-amber-900 border-amber-300" },
  { id: "winter", name: "Invernos", years: "1980–2010", color: "bg-slate-100 text-slate-700 border-slate-300" },
  { id: "deep", name: "Deep Learning", years: "2010–2020", color: "bg-blue-100 text-blue-900 border-blue-300" },
  { id: "gen", name: "Generativa", years: "2020–2026", color: "bg-purple-100 text-purple-900 border-purple-300" },
];

interface Ev {
  year: string;
  era: Era;
  title: string;
  text: string;
  url?: string;
}

const EVENTS: Ev[] = [
  { year: "1950", era: "classic", title: "Turing", url: "https://en.wikipedia.org/wiki/Computing_Machinery_and_Intelligence", text: "Propõe o teste de imitação. Pode uma máquina passar por humana numa conversa? A pergunta certa para a era dos chatbots." },
  { year: "1958", era: "classic", title: "Perceptron", url: "https://en.wikipedia.org/wiki/Perceptron", text: 'Primeira rede neural funcional. O New York Times escreve: "embrião de um computador capaz de andar, falar, ver". Desacreditado em 1969.' },
  { year: "1966", era: "classic", title: "ELIZA", url: "https://en.wikipedia.org/wiki/ELIZA", text: "Reflecte frases. Doentes contam-lhe coisas íntimas. A persuasão de um modelo não é inteligência: é a forma como devolve a tua linguagem." },
  { year: "1969", era: "winter", title: "Minsky & Papert · 1.º Inverno", url: "https://en.wikipedia.org/wiki/Perceptrons_(book)", text: 'Mostram que perceptrons simples não aprendem XOR. A indústria lê "redes neurais não funcionam". O investimento desaba. Primeiro Inverno da IA, até 1986.' },
  { year: "1972", era: "classic", title: "MYCIN", url: "https://en.wikipedia.org/wiki/Mycin", text: "Sistema pericial para infecções bacterianas. Mais preciso que muitos médicos. Nunca usado clinicamente." },
  { year: "1986", era: "winter", title: "Backpropagation", url: "https://www.nature.com/articles/323533a0", text: "Rumelhart, Hinton, Williams. Algoritmo que ajusta pesos a partir do erro. A base matemática da aprendizagem supervisionada moderna." },
  { year: "1989–95", era: "winter", title: "Sistemas peritos colapsam · 2.º Inverno", text: "Iliad, QMR, DXplain. Manutenção cara, integração zero. Os médicos não querem teclar dezenas de sintomas para receber uma sugestão. Segundo Inverno da IA." },
  { year: "1997", era: "winter", title: "Deep Blue", url: "https://en.wikipedia.org/wiki/Deep_Blue_(chess_computer)", text: "Derrota Kasparov. Cálculo bruto e heurísticas, sem aprendizagem. Bater humanos não exige inteligência: exige busca eficiente." },
  { year: "2012", era: "deep", title: "AlexNet", url: "https://papers.nips.cc/paper/2012/hash/c399862d3b9d6b76c8436e924a68c45b-Abstract.html", text: "Vence o ImageNet (1,2 M imagens) por margem inédita. O pai de quase todos os sistemas de IA em radiologia, dermatologia e oftalmologia que vais usar em prática." },
  { year: "2015", era: "deep", title: "Gulshan et al. (JAMA)", url: "https://jamanetwork.com/journals/jama/fullarticle/2588763", text: "129 000 retinografias. Detecção de retinopatia diabética não-inferior a oftalmologistas. Marco fundador do FDA approval pathway em imagem médica." },
  { year: "2017", era: "deep", title: "Transformer", url: "https://arxiv.org/abs/1706.03762", text: '"Attention is all you need" (Vaswani et al.). A arquitectura que tornou possível escalar. Sem isto, a IA generativa de 2022 não tinha acontecido.' },
  { year: "2018", era: "deep", title: "IDx-DR aprovado pela FDA", url: "https://www.fda.gov/news-events/press-announcements/fda-permits-marketing-artificial-intelligence-based-device-detect-certain-diabetes-related-eye", text: "Primeiro dispositivo de IA aprovado para diagnóstico autónomo em medicina, sem confirmação obrigatória de oftalmologista." },
  { year: "2019", era: "deep", title: "Obermeyer et al. (Science)", url: "https://www.science.org/doi/10.1126/science.aax2342", text: "Algoritmo usado em hospitais americanos sinaliza necessidade clínica usando gasto em saúde como proxy. Utentes negros, que historicamente acedem menos, ficam classificados como menos doentes. Afecta ~200 milhões. O paper de viés mais influente da década." },
  { year: "2020", era: "gen", title: "GPT-3", url: "https://arxiv.org/abs/2005.14165", text: "175 mil milhões de parâmetros — quase o dobro dos ~86 mil milhões de neurónios do cérebro humano. Capacidades emergentes só com escala." },
  { year: "2022", era: "gen", title: "ChatGPT", url: "https://openai.com/index/chatgpt/", text: "A IA generativa entra na consulta — convidada ou não. Primeira vez que o público geral falou directamente com um modelo de linguagem." },
  { year: "2023", era: "gen", title: "GPT-4 fabrica citações em radiologia", text: "Estudos publicados em 2023–2024 mostram referências inventadas em 30–60 % das respostas. Autores e revistas plausíveis, DOIs inválidos." },
  { year: "2024", era: "gen", title: "Multimodal entra na clínica", text: "GPT-4o, Gemini 1.5, Claude 3 — texto, imagem, áudio na mesma chamada. Médicos começam a colar radiografias e ECGs em prompts. Acaba a fronteira imagem vs texto." },
  { year: "2025", era: "gen", title: "Modelos com raciocínio · scribes ambientes", text: "o1, Claude 3.7 com thinking, Gemini 2.5 — cadeias de pensamento explícitas para diferenciais complexos. Scribes ambientes (Abridge, Suki, Nuance DAX) entram em produção em milhares de hospitais." },
  { year: "2026", era: "gen", title: "Agentes clínicos · onde estamos hoje", text: 'Claude 4, GPT-5, Gemini 3. Agentes que observam, decidem e agem entram em piloto: triagem do portal do doente, sumários longitudinais, marcação. A pergunta deixa de ser "o que sabe?" — passa a ser "o que pode fazer sozinho?".' },
  { year: "2026", era: "gen", title: "FDA · 1000+ dispositivos aprovados", url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-aiml-enabled-medical-devices", text: "≈75 % em radiologia. Quase tudo continua a ser narrow AI (uma tarefa específica). LLMs generativos em produção clínica regulada continuam contados pelos dedos." },
];

export class EraTimeline extends IaElement {
  @property({ type: String, state: true }) filter: Era | null = null;

  protected render() {
    const visible = this.filter
      ? EVENTS.filter((e) => e.era === this.filter)
      : EVENTS;
    return html`
      <div>
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <span
            class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >filtrar:</span
          >
          ${ERAS.map(
            (era) => html`<button
              type="button"
              @click=${() =>
                (this.filter = this.filter === era.id ? null : era.id)}
              class="${this.filter === era.id
                ? era.color + " border-current"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"} rounded-full border px-3 py-1 text-xs font-medium transition"
            >
              ${era.name} · ${era.years}
            </button>`,
          )}
          ${this.filter
            ? html`<button
                type="button"
                @click=${() => (this.filter = null)}
                class="text-xs font-medium text-slate-500 hover:text-blue-600"
              >
                limpar
              </button>`
            : ""}
        </div>

        <div class="space-y-3">
          ${visible.map((ev) => {
            const era = ERAS.find((e) => e.id === ev.era)!;
            const border =
              ev.era === "classic"
                ? "border-amber-400"
                : ev.era === "winter"
                  ? "border-slate-400"
                  : ev.era === "deep"
                    ? "border-blue-500"
                    : "border-purple-500";
            return html`<div
              class="${border} rounded-lg border-l-4 bg-white p-4 shadow-sm"
            >
              <div class="mb-1 flex flex-wrap items-baseline gap-2">
                <span class="font-mono text-sm font-bold text-slate-900"
                  >${ev.year}</span
                >
                <span
                  class="${era.color} rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  >${era.name}</span
                >
              </div>
              <h4 class="mb-1 font-bold text-slate-900">
                ${ev.url
                  ? html`<a
                      href=${ev.url}
                      target="_blank"
                      rel="noopener"
                      class="text-blue-700 underline underline-offset-2 hover:no-underline"
                      >${ev.title}</a
                    >`
                  : ev.title}
              </h4>
              <p class="text-sm leading-relaxed text-slate-600">${ev.text}</p>
            </div>`;
          })}
        </div>
      </div>
    `;
  }
}

customElements.define("era-timeline", EraTimeline);
