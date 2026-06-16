/**
 * Volatile facts · one file to update each year.
 *
 * Things that drift fast in AI + health regulation:
 *   - Model names and prices
 *   - EU AI Act phasing dates
 *   - Drug examples (only if guidelines change)
 *   - Course snapshot year (cited in disclaimers + "last updated" badges)
 *
 * Demos and prose import from here. Update once → propagates everywhere.
 * Last review: 2026-06-02
 */

export const COURSE_YEAR = 2026;
export const LAST_FACTS_REVIEW = "2026-06-02";

/** USD → EUR conversion · update twice per year. */
export const USD_TO_EUR = 0.92;

export interface ModelTier {
  id: string;
  name: string;
  pricePerMTokensIn: number;
  pricePerMTokensOut: number;
  /** Has signed Business Associate Agreement (PT institutional contract). */
  baa: boolean;
  notes: string;
}

export const MODEL_TIERS: ModelTier[] = [
  {
    id: "free",
    name: "Free tier (ChatGPT, Claude.ai)",
    pricePerMTokensIn: 0,
    pricePerMTokensOut: 0,
    baa: false,
    notes:
      "Sem custo monetário. Dados podem ser usados para treino. Sem BAA. Não usar com PHI.",
  },
  {
    id: "paid",
    name: "Paid individual (~€20/mês plano)",
    pricePerMTokensIn: 0,
    pricePerMTokensOut: 0,
    baa: false,
    notes:
      "€20/mês fixo (≈ €240/ano). Opt-out de treino disponível. Continua sem BAA — não usar com PHI.",
  },
  {
    id: "api-gpt5",
    name: "API · frontier (GPT-5 / Claude Opus 4)",
    pricePerMTokensIn: 15,
    pricePerMTokensOut: 60,
    baa: false,
    notes: "API standard. Sem BAA pré-assinado. Útil para protótipos sem PHI.",
  },
  {
    id: "api-mid",
    name: "API · mid (GPT-5-mini, Sonnet)",
    pricePerMTokensIn: 3,
    pricePerMTokensOut: 15,
    baa: false,
    notes:
      "Tier intermédio. Boa relação custo/qualidade para tarefas estruturadas (codificação, sumários).",
  },
  {
    id: "baa",
    name: "Institucional · BAA assinado",
    pricePerMTokensIn: 20,
    pricePerMTokensOut: 80,
    baa: true,
    notes:
      "Premium ~30% sobre API standard. BAA permite tratar PHI. Negociação institucional.",
  },
  {
    id: "onprem",
    name: "On-premise · LLaMA 3.1 70B / Mistral",
    pricePerMTokensIn: 0,
    pricePerMTokensOut: 0,
    baa: true,
    notes:
      "Custo zero por token mas infraestrutura: ~€50-200/mês servidor GPU + horas DevOps. Vale acima de ~5M tokens/dia.",
  },
];

/**
 * EU AI Act key phasing dates. Article 5 (prohibited practices) already in
 * force; GPAI obligations rolling through 2025-2026; high-risk health-AI
 * full conformity by 2027-08-02.
 */
export const AI_ACT_DATES: Array<{ date: string; article: string; what: string }> = [
  {
    date: "2025-02-02",
    article: "Art. 5",
    what: "Práticas proibidas em vigor (social scoring, manipulação cognitiva).",
  },
  {
    date: "2025-08-02",
    article: "Art. 51-56",
    what: "Obrigações GPAI (general-purpose AI) entram em vigor.",
  },
  {
    date: "2026-08-02",
    article: "maior parte",
    what: "Aplicação geral do regulamento.",
  },
  {
    date: "2027-08-02",
    article: "Art. 6 + Anexo III",
    what: "Sistemas de alto risco em saúde · conformidade total exigida.",
  },
];

/** Reference frameworks cited across the lecture · update only if dissolved. */
export const FRAMEWORKS = {
  DGS: "Direcção-Geral da Saúde",
  INFARMED: "Autoridade Nacional do Medicamento e Produtos de Saúde",
  CNPD: "Comissão Nacional de Protecção de Dados",
  EDPB: "European Data Protection Board",
  EMA: "European Medicines Agency",
} as const;
