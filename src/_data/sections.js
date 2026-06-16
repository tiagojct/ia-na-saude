/**
 * Canonical 14-section catalogue. Single source for:
 *   - TOC in layouts/main.njk
 *   - Completion gate in chrome.js
 *   - Homepage section grid
 *   - Sitemap generator
 *
 * pt-PT only (en-US dropped during 11ty migration).
 */

const SECTIONS = [
  {
    id: "abertura",
    num: "01",
    time: 3,
    icon: "▶",
    label: "Abertura",
    sub: "hero · Maria · onde a IA já está hoje",
    slots: ["30", "60", "90"],
  },
  {
    id: "historia",
    num: "02",
    time: 8,
    icon: "🕰️",
    label: "História",
    sub: "4 eras · 20 marcos · MYCIN a ChatGPT",
    slots: ["60", "90"],
  },
  {
    id: "aprendizagem",
    num: "03",
    time: 7,
    icon: "🎓",
    label: "Aprendizagem",
    sub: "supervisada · não-supervisada · auto-supervisada",
    slots: ["60", "90"],
  },
  {
    id: "tokens",
    num: "04",
    time: 5,
    icon: "🔤",
    label: "Tokens",
    sub: "BPE · janela de contexto · custo do pt",
    slots: ["30", "60", "90"],
  },
  {
    id: "treino",
    num: "05",
    time: 8,
    icon: "⚙️",
    label: "Treino",
    sub: "pré-treino · SFT · RLHF",
    slots: ["60", "90"],
  },
  {
    id: "funciona",
    num: "06",
    time: 5,
    icon: "🧮",
    label: "Mecanismo",
    sub: "softmax · temperatura · atenção",
    slots: ["30", "60", "90"],
  },
  {
    id: "prompts",
    num: "07",
    time: 4,
    icon: "✏️",
    label: "Prompts",
    sub: "papel · público · formato · restrições",
    slots: ["60", "90"],
  },
  {
    id: "alucinacoes",
    num: "08",
    time: 6,
    icon: "⚠️",
    label: "Alucinações",
    sub: "30–60% citações fabricadas em medicina",
    slots: ["30", "60", "90"],
  },
  {
    id: "vieses",
    num: "09",
    time: 5,
    icon: "⚖️",
    label: "Vieses",
    sub: "Obermeyer 2019 · ~200M afectados",
    slots: ["60", "90"],
  },
  {
    id: "rag",
    num: "10",
    time: 4,
    icon: "📚",
    label: "RAG",
    sub: "biblioteca antes da resposta",
    slots: ["60", "90"],
  },
  {
    id: "agentes",
    num: "11",
    time: 6,
    icon: "🤖",
    label: "Agentes",
    sub: "observa · decide · age · com porta humana",
    slots: ["90"],
  },
  {
    id: "privacidade",
    num: "12",
    time: 6,
    icon: "🔒",
    label: "Privacidade",
    sub: "RGPD · EU AI Act · CNPD",
    slots: ["90"],
  },
  {
    id: "quando",
    num: "13",
    time: 7,
    icon: "🎯",
    label: "Quando usar",
    sub: "heurística da reversibilidade",
    slots: ["30", "60", "90"],
  },
  {
    id: "aprofundar",
    num: "14",
    time: 4,
    icon: "📖",
    label: "Recursos",
    sub: "5 lições · papers · ferramentas",
    slots: ["90"],
  },
];

const SECTION_IDS = SECTIONS.map((s) => s.id);

function totalReadingTime() {
  return SECTIONS.reduce((a, s) => a + s.time, 0);
}

export default {
  list: SECTIONS,
  ids: SECTION_IDS,
  totalTime: totalReadingTime(),
};
