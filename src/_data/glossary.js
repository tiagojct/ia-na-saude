/**
 * Inline glossary · keyed by slug. Used by:
 *   - {% term "key" %} macro in macros/ui.njk
 *   - chrome.js term-popover (via #ia-glossary JSON script)
 *   - pt-PT/glossario.njk full listing
 *
 * Each entry: { term, def, sections[] }. `sections` lists which section IDs
 * introduce the term, used for jump links on the glossary page.
 */

export default {
  parametros: {
    term: "parâmetros",
    def: "Botões ajustáveis dentro do modelo. Como sinapses com força regulável.",
    sections: ["funciona", "treino"],
  },
  bpe: {
    term: "BPE",
    def: "Byte-Pair Encoding. Algoritmo que constrói o vocabulário do tokenizador a partir dos pares de caracteres mais frequentes.",
    sections: ["tokens"],
  },
  smart: {
    term: "SMART",
    def: "Single Maintenance And Reliever Therapy. Mesmo inalador usado para manutenção e alívio.",
    sections: ["rag"],
  },
  pce: {
    term: "PCE",
    def: "Processo Clínico Electrónico (SClínico, ALERT, Sigla).",
    sections: ["agentes"],
  },
  rgpd: {
    term: "RGPD",
    def: "Regulamento Geral de Protecção de Dados (UE 2016/679).",
    sections: ["privacidade"],
  },
  xor: {
    term: "XOR",
    def: "Situação em que duas variáveis só informam em conjunto. Mostrou em 1969 a limitação do perceptron de uma camada.",
    sections: ["aprendizagem"],
  },
  transformer: {
    term: "Transformer",
    def: "Arquitectura de rede neuronal com atenção. Vaswani et al., 2017. Base do ChatGPT, Claude, Gemini.",
    sections: ["historia", "funciona"],
  },
  atencao: {
    term: "atenção",
    def: "Mecanismo que decide a que partes do contexto o modelo presta atenção para prever o próximo token.",
    sections: ["funciona"],
  },
  embedding: {
    term: "embedding",
    def: "Vector numérico (300-1000 dimensões) que representa um token. Palavras de significado próximo ficam próximas no espaço.",
    sections: ["tokens", "funciona"],
  },
  vector: {
    term: "vector",
    def: "Lista ordenada de números. Os sinais vitais já são um vector de 5 dimensões.",
    sections: ["tokens"],
  },
  softmax: {
    term: "softmax",
    def: "Função que converte logits em probabilidades que somam 1.",
    sections: ["funciona"],
  },
  gradiente: {
    term: "gradiente",
    def: "Direcção em que ajustar os parâmetros para reduzir o erro.",
    sections: ["treino"],
  },
  backprop: {
    term: "retropropagação",
    def: "Algoritmo de treino que distribui o erro da saída para as camadas anteriores.",
    sections: ["historia"],
  },
  loss: {
    term: "loss",
    def: "Função de perda. Mede o quão errado está o modelo num exemplo. Treinar = baixar a loss.",
    sections: ["treino"],
  },
  temperatura: {
    term: "temperatura",
    def: "Parâmetro de amostragem. Baixa = conservador, alta = criativo.",
    sections: ["funciona", "alucinacoes"],
  },
  tokenizacao: {
    term: "tokenização",
    def: "Processo de partir texto em tokens. Em pt-PT usa sub-palavras.",
    sections: ["tokens"],
  },
  contexto: {
    term: "janela de contexto",
    def: "Limite máximo de tokens que o modelo vê de uma vez.",
    sections: ["tokens", "rag"],
  },
  pretreino: {
    term: "pré-treino",
    def: "Primeira fase: prever a próxima palavra em milhares de milhões de textos não rotulados.",
    sections: ["treino"],
  },
  sft: {
    term: "SFT",
    def: "Supervised Fine-Tuning. Segunda fase: ensinar o modelo a seguir instruções.",
    sections: ["treino"],
  },
  rlhf: {
    term: "RLHF",
    def: "Reinforcement Learning from Human Feedback. Terceira fase: humanos comparam respostas.",
    sections: ["treino"],
  },
};
