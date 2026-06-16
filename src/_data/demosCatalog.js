/**
 * Demo gallery catalogue · single source for /pt-PT/demos/ page.
 *
 * 34 demos × { name, anchor (section id), category, summary, highlight? }.
 */

const DEMOS = [
  { name: "Tokenizer · pt-PT vs en", anchor: "tokens", category: "como funciona", summary: "Mostra como o BPE corta texto clínico. Comparação directa pt-PT vs inglês: pt custa ~30 % mais tokens.", highlight: "presets clínicos" },
  { name: "Embedding · clusters semânticos", anchor: "tokens", category: "como funciona", summary: "Termos médicos (cardio/pulm/neuro/farma) convergem em clusters durante o treino. Liga reduced-motion: vai directo ao estado treinado.", highlight: "animação reduced-motion" },
  { name: "Similaridade semântica", anchor: "funciona", category: "como funciona", summary: "Escolhe 2 termos clínicos · vê cosseno + 5 vizinhos mais próximos.", highlight: "presets ↔ presets" },
  { name: "Janela de contexto", anchor: "tokens", category: "como falha", summary: "Aumenta corpus até janela rebentar. Mostra perda silenciosa do início." },
  { name: "Atenção · cabeças sobre Maria", anchor: "funciona", category: "como funciona", summary: "4 cabeças de atenção sobre a história clínica da Maria. Cada cabeça atende a um padrão diferente." },
  { name: "Próximo token · top-5 + temperatura", anchor: "funciona", category: "como funciona", summary: "Softmax sobre logits clínicos. Move temperatura, vê distribuição achatar/colapsar. Botão sortear.", highlight: "matemática real" },
  { name: "Chain-of-thought", anchor: "funciona", category: "como funciona", summary: "Mesma pergunta clínica, directo vs 5-passos. Vancomicina + ClCr · TEP pleurítica." },
  { name: "Curva de loss · 4 fotos do treino", anchor: "treino", category: "treino", summary: "Vê output do modelo evoluir de ruído alfabético a português clínico fluente." },
  { name: "Modelo · escala log 2017-2026", anchor: "historia", category: "história", summary: "65M (Transformer 2017) → 10 bi (2026). Cada salto Y é 10×." },
  { name: "Corpora · carreira vs LLM", anchor: "treino", category: "treino", summary: "Tu, 40 anos a ler · vs PubMed · GPT-3 · LLaMA 3. A barra mais pequena és tu." },
  { name: "Quem escreve a resposta ideal · SFT", anchor: "treino", category: "treino", summary: "Generalista vs anotador clínico. Mesma pergunta, dois destinatários." },
  { name: "Vota tu · alinhamento RLHF", anchor: "treino", category: "treino", summary: "3 pares A/B. No fim revela se votas como clínico ou generalista." },
  { name: "Três fases · pré-treino · SFT · RLHF", anchor: "treino", category: "treino", summary: "Liga/desliga cada fase. Vê output transformar-se." },
  { name: "Perceptron 6×6 · aprender a ver", anchor: "aprendizagem", category: "aprendizagem", summary: "Treina classificador de lesões. Pesos a verde/vermelho mostram onde olha." },
  { name: "Três níveis de prompt", anchor: "prompts", category: "como usar", summary: "FRACO · MÉDIO · BOM com highlights do que mudou no prompt." },
  { name: "Few-shot · 0/1/3/5 exemplos", anchor: "prompts", category: "como usar", summary: "Tarefa ICD-10 · acuidade salta de 20% a 100% com 5 exemplos no prompt." },
  { name: "Apanha as falsas · 4 citações", anchor: "alucinacoes", category: "como falha", summary: "4 referências (2 reais · 2 fabricadas). Marca antes de revelar." },
  { name: "Mesma queixa, doentes diferentes", anchor: "vieses", category: "como falha", summary: "Mesma dor torácica · muda sexo+idade · vê resposta mudar." },
  { name: "Prompt injection", anchor: "agentes", category: "como falha", summary: "Mensagem inocente com instrução escondida · liga/desliga guarda de sistema." },
  { name: "LLM puro vs LLM+RAG", anchor: "rag", category: "como usar", summary: "Side-by-side pipeline. Toggle 'RAG bem desenhado vs mal desenhado'." },
  { name: "Simulador de triagem · 3 cenários", anchor: "agentes", category: "como usar", summary: "Maria · antibiótico-mãe (erro deliberado) · Pedro HF familiar. Tool log + porta humana." },
  { name: "Detector de PII", anchor: "privacidade", category: "como usar", summary: "Cola nota clínica · marca nomes/datas/IDs/moradas/idades · score de reidentificação." },
  { name: "Quiz RGPD · 3 variantes (mastery)", anchor: "privacidade", category: "como usar", summary: "Mastery learning: 2 acertos consecutivos para dominar." },
  { name: "Custo · 6 tiers", anchor: "privacidade", category: "como usar", summary: "Free · paid · API · BAA · on-prem. Overhead pt-PT. Custo mensal+anual." },
  { name: "Sensibilidade vs especificidade", anchor: "quando", category: "como usar", summary: "Slider · histograma · matriz 2×2 actualiza em directo." },
  { name: "Bayes · pré-teste vs pós-teste", anchor: "quando", category: "como usar", summary: "Pre-test prob → LR+/LR− → post-test. 6 testes clínicos pré-definidos." },
  { name: "Drift · 4 anos", anchor: "quando", category: "como usar", summary: "Modelo aprovado 2023 sem recalibração vs com recalibração anual." },
  { name: "Delegação · 6 cenários", anchor: "quando", category: "como usar", summary: "Cada tarefa → autónomo/revisão/só humano. Why explica cada resposta." },
  { name: "Teste de fluência · 5 perguntas", anchor: "aprofundar", category: "consolida", summary: "5 Q · calibração de confiança (Dunning-Kruger detector)." },
  { name: "Flashcards · 14 termos · Leitner", anchor: "aprofundar", category: "consolida", summary: "5 caixas, intervalos 4h-14d, persistente em localStorage." },
  { name: "Certificado de conclusão", anchor: "aprofundar", category: "consolida", summary: "Desbloqueia ao visitar 14 secções. Imprimível em PDF." },
  { name: "ELIZA (1966) · pattern matching", anchor: "historia", category: "história", summary: "Conversa com replica do chatbot de Joseph Weizenbaum. Após 5 turnos: lição." },
  { name: "MYCIN (1972) · assinar?", anchor: "historia", category: "história", summary: "Regras → recomendação de vancomicina. Decide se assinas." },
  { name: "Timeline filtrável · 20 marcos", anchor: "historia", category: "história", summary: "1950-2026. Filtra por era: Clássica · Invernos · Deep Learning · Generativa." },
];

const CATEGORIES = [
  { key: "como funciona", icon: "🧮" },
  { key: "como falha", icon: "⚠️" },
  { key: "como usar", icon: "🛡" },
  { key: "treino", icon: "⚙️" },
  { key: "aprendizagem", icon: "🎓" },
  { key: "história", icon: "🕰" },
  { key: "consolida", icon: "🎯" },
];

export default {
  list: DEMOS,
  categories: CATEGORIES,
  count: DEMOS.length,
};
