/**
 * Inline glossary · keyed by slug. Rendered via {% term "key" %} macro and
 * injected as JSON in main.njk for chrome.js popover.
 */

export default {
  parametros: {
    term: "parâmetros",
    def: "Botões ajustáveis dentro do modelo. Como sinapses com força regulável.",
  },
  bpe: {
    term: "BPE",
    def: "Byte-Pair Encoding. Algoritmo que constrói o vocabulário do tokenizador a partir dos pares de caracteres mais frequentes.",
  },
  smart: {
    term: "SMART",
    def: "Single Maintenance And Reliever Therapy. Mesmo inalador usado para manutenção e alívio.",
  },
  pce: {
    term: "PCE",
    def: "Processo Clínico Electrónico (SClínico, ALERT, Sigla).",
  },
  rgpd: {
    term: "RGPD",
    def: "Regulamento Geral de Protecção de Dados (UE 2016/679).",
  },
  xor: {
    term: "XOR",
    def: "Situação em que duas variáveis só informam em conjunto. Mostrou em 1969 a limitação do perceptron de uma camada.",
  },
  transformer: {
    term: "Transformer",
    def: "Arquitectura de rede neuronal com atenção. Vaswani et al., 2017. Base do ChatGPT, Claude, Gemini.",
  },
  atencao: {
    term: "atenção",
    def: "Mecanismo que decide a que partes do contexto o modelo presta atenção para prever o próximo token.",
  },
  embedding: {
    term: "embedding",
    def: "Vector numérico (300-1000 dimensões) que representa um token. Palavras de significado próximo ficam próximas no espaço.",
  },
  vector: {
    term: "vector",
    def: "Lista ordenada de números. Os sinais vitais já são um vector de 5 dimensões.",
  },
  softmax: {
    term: "softmax",
    def: "Função que converte logits em probabilidades que somam 1.",
  },
  gradiente: {
    term: "gradiente",
    def: "Direcção em que ajustar os parâmetros para reduzir o erro.",
  },
  backprop: {
    term: "retropropagação",
    def: "Algoritmo de treino que distribui o erro da saída para as camadas anteriores.",
  },
  loss: {
    term: "loss",
    def: "Função de perda. Mede o quão errado está o modelo num exemplo. Treinar = baixar a loss.",
  },
  temperatura: {
    term: "temperatura",
    def: "Parâmetro de amostragem. Baixa = conservador, alta = criativo.",
  },
  tokenizacao: {
    term: "tokenização",
    def: "Processo de partir texto em tokens. Em pt-PT usa sub-palavras.",
  },
  contexto: {
    term: "janela de contexto",
    def: "Limite máximo de tokens que o modelo vê de uma vez.",
  },
  pretreino: {
    term: "pré-treino",
    def: "Primeira fase: prever a próxima palavra em milhares de milhões de textos não rotulados.",
  },
  sft: {
    term: "SFT",
    def: "Supervised Fine-Tuning. Segunda fase: ensinar o modelo a seguir instruções.",
  },
  rlhf: {
    term: "RLHF",
    def: "Reinforcement Learning from Human Feedback. Terceira fase: humanos comparam respostas.",
  },
};
