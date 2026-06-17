/**
 * Topic quiz catalogue · mirrors lib/quizData.ts for the quiz page.
 * Only id + num + title + blurb · the actual questions stay in
 * lib/quizData.ts (bundled into <topic-quiz> via Vite).
 */

export default [
  { id: "historia", num: "02", title: "História", blurb: "4 eras · 20 marcos · MYCIN a Claude 4" },
  { id: "aprendizagem", num: "03", title: "Como as máquinas aprendem", blurb: "Supervisada, não-supervisada, auto-supervisada" },
  { id: "tokens", num: "04", title: "Tokens · BPE · contexto", blurb: "Como o modelo parte texto · custo do pt-PT" },
  { id: "treino", num: "05", title: "Treino · pré-treino · SFT · RLHF", blurb: "Como nasce um LLM em três fases" },
  { id: "funciona", num: "06", title: "Mecanismo · softmax · atenção", blurb: "Como prevê o próximo token, um a um" },
  { id: "prompts", num: "07", title: "Prompts · papel · público · formato", blurb: "Receita para reduzir ambiguidade" },
  { id: "alucinacoes", num: "08", title: "Alucinações · fluência ≠ verdade", blurb: "30-60 % das citações fabricadas em medicina" },
  { id: "vieses", num: "09", title: "Vieses · dados, design, implantação", blurb: "Obermeyer 2019 · onde os modelos discriminam" },
  { id: "rag", num: "10", title: "RAG · biblioteca antes da resposta", blurb: "Corta alucinações em 30-60 %" },
  { id: "agentes", num: "11", title: "Agentes · porta humana", blurb: "Observa · decide · age" },
  { id: "privacidade", num: "12", title: "Privacidade · RGPD · EU AI Act", blurb: "Combinação ainda reidentifica" },
  { id: "quando", num: "13", title: "Quando usar · reversibilidade", blurb: "Sens vs spec · Bayes · drift · delegação" },
];
