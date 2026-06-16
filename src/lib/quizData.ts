/**
 * Topic quiz bank · 12 topics × 4-5 questions, with explanations.
 * Used by /pt-PT/quiz/ page. Each question references the section it tests
 * so the page can deep-link back when the learner gets it wrong.
 */

export interface QuizQ {
  q: string;
  opts: string[];
  correct: number;
  why: string;
}

export interface QuizTopic {
  id: string;
  num: string;
  title: string;
  blurb: string;
  questions: QuizQ[];
}

export const QUIZ_TOPICS: QuizTopic[] = [
  {
    id: "historia",
    num: "02",
    title: "História",
    blurb: "Quatro eras de IA · de regras a generativa.",
    questions: [
      {
        q: "Porque é que o MYCIN (1972) — apesar de bom — nunca foi usado em clínica?",
        opts: [
          "A precisão diagnóstica era baixa.",
          "Interface impraticável, sem integração no registo, e a pergunta jurídica do quem assina ficou sem resposta.",
          "Os médicos da época não confiavam em computadores.",
        ],
        correct: 1,
        why: "MYCIN bateu residentes e empatou com especialistas em ensaios controlados. O problema foi sistémico: dezenas de perguntas por consulta, sem ligação aos registos, e a responsabilidade clínica não estava resolvida. O padrão repete-se em cada onda.",
      },
      {
        q: "Qual destas ondas de IA foi caracterizada por algoritmos baseados em regras explícitas escritas por especialistas?",
        opts: [
          "Era 1 · 1950-1980 · Sistemas periciais.",
          "Era 3 · 2010-2020 · Deep learning.",
          "Era 4 · 2020-2026 · Generativa.",
        ],
        correct: 0,
        why: "A primeira era da IA codificava conhecimento em regras (se-então) escritas por especialistas. MYCIN é o exemplo paradigmático. Falhou na complexidade dos casos reais e na pergunta da assinatura.",
      },
      {
        q: "O que distingue a era generativa (2020-2026) das ondas anteriores em saúde?",
        opts: [
          "A acuidade dos modelos é finalmente superior à humana em todas as tarefas.",
          "É a primeira tecnologia médica usada por dezenas de milhões antes de qualquer regulação ou ensaio clínico.",
          "Foi a primeira a obter aprovação da FDA.",
        ],
        correct: 1,
        why: "Sem precedente histórico: gravadores ambient, ChatGPT, scribes — tudo chegou aos utentes antes de chegar aos médicos. A regulação corre atrás do uso real.",
      },
      {
        q: "ELIZA (1966) era…",
        opts: [
          "Um sistema pericial que diagnosticava depressão.",
          "Um chatbot baseado em substituição de padrões que reflectia a linguagem do utente.",
          "Um precursor dos LLMs com pré-treino em texto.",
        ],
        correct: 1,
        why: "ELIZA fazia pattern matching: reconhecia frases-chave e reformulava-as como perguntas. Doentes contavam-lhe coisas íntimas. A lição é sobre fluência aparente, não inteligência.",
      },
    ],
  },
  {
    id: "aprendizagem",
    num: "03",
    title: "Aprendizagem",
    blurb: "Supervisionada · não-supervisionada · auto-supervisionada.",
    questions: [
      {
        q: "Qual a vantagem técnica da aprendizagem auto-supervisionada (a base dos LLMs)?",
        opts: [
          "Não precisa de dados — gera-os a partir de regras.",
          "O próprio texto fornece os rótulos (prever a próxima palavra), tornando os dados de treino virtualmente infinitos.",
          "Aprende mais depressa que a supervisionada.",
        ],
        correct: 1,
        why: "Auto-supervisionada usa estrutura intrínseca dos dados: prever o token seguinte. Sem necessidade de humanos a rotular cada exemplo, escala para corpora gigantes.",
      },
      {
        q: "Um classificador supervisionado para retinopatia diabética foi treinado em ~129 000 imagens classificadas por 3-7 oftalmologistas (Gulshan, 2015). O que limita o tecto da acuidade do modelo?",
        opts: [
          "A arquitectura da rede.",
          "O número de imagens.",
          "A qualidade do consenso entre os oftalmologistas que rotularam.",
        ],
        correct: 2,
        why: "Em supervisionada, a qualidade dos rótulos é o tecto. Se os oftalmologistas concordam só em 95% dos casos, o modelo nunca pode ser mais consistente que o consenso.",
      },
      {
        q: "Quando uma única recta não separa doentes de saudáveis no espaço de variáveis clínicas (o problema XOR), a solução é:",
        opts: [
          "Recolher mais dados até funcionar.",
          "Empilhar camadas — redes profundas aprendem combinações automaticamente.",
          "Reduzir o número de variáveis.",
        ],
        correct: 1,
        why: "Foi o que terminou o primeiro inverno da IA. Minsky & Papert mostraram a limitação do perceptron simples; redes multi-camada resolvem o XOR e generalizam para qualquer fronteira não-linear.",
      },
      {
        q: "Qual destes é um exemplo de aprendizagem não-supervisionada útil em saúde?",
        opts: [
          "Treinar um classificador de pneumonia em raios-X rotulados.",
          "Descobrir fenótipos de sépsis em UCI sem rótulos pré-definidos.",
          "Pedir feedback humano para alinhar respostas.",
        ],
        correct: 1,
        why: "Não-supervisionada procura estrutura latente sem rótulos. Clustering de doentes por trajectória, fenótipos de sépsis, agrupamento de doenças raras — todos exemplos clássicos.",
      },
    ],
  },
  {
    id: "tokens",
    num: "04",
    title: "Tokens",
    blurb: "BPE · janela de contexto · custo do pt-PT.",
    questions: [
      {
        q: "Porque o pt-PT clínico custa ~30% mais tokens que o inglês equivalente?",
        opts: [
          "O pt-PT tem palavras mais longas.",
          "O tokenizador BPE foi treinado sobretudo em corpora ingleses; palavras pt frequentes partem-se em mais sub-tokens.",
          "Os modelos em pt-PT são treinados separadamente e custam mais energia.",
        ],
        correct: 1,
        why: "O vocabulário BPE optimiza-se para o que viu mais. Inglês domina os corpora → tokens curtos para palavras inglesas, tokens mais longos para morfemas pt. A penalização é consistente em quase todos os tokenizadores comerciais.",
      },
      {
        q: "O que acontece se um input exceder a janela de contexto do modelo?",
        opts: [
          "O modelo devolve erro e pede para reduzir o texto.",
          "O início do texto é silenciosamente cortado — o modelo só vê os últimos tokens.",
          "O modelo resume o início automaticamente.",
        ],
        correct: 1,
        why: "Risco subestimado em medicina: notas concatenadas + bibliografia + histórico longo facilmente excedem janelas pequenas. O modelo continua a responder, mas com contexto incompleto. Sem aviso.",
      },
      {
        q: "Embeddings em LLMs codificam significado pela…",
        opts: [
          "Dicionário traduzido para vectores.",
          "Geometria: termos que aparecem em contextos parecidos ficam próximos no espaço.",
          "Hash criptográfico do token.",
        ],
        correct: 1,
        why: "É a hipótese distribucional, formalizada por Mikolov et al. 2013. \"Dispneia\" e \"falta de ar\" co-ocorrem em contextos parecidos → ficam próximas. RAG, k-NN clínico, deduplicação — tudo assenta nisto.",
      },
      {
        q: "Qual o compromisso vencedor entre tokenização por letra, por palavra inteira e por sub-palavra?",
        opts: [
          "Letra a letra é o mais barato.",
          "Palavra inteira lida melhor com termos novos.",
          "Sub-palavra (BPE) — vocabulário fixo, morfemas reconhecíveis, palavras novas sempre decomponíveis.",
        ],
        correct: 2,
        why: "Letra produz sequências longas sem significado. Palavra deixa termos novos fora do vocabulário. Sub-palavra combina os dois — palavra rara como \"semaglutida\" parte-se em pedaços conhecidos. É o padrão actual.",
      },
    ],
  },
  {
    id: "treino",
    num: "05",
    title: "Treino",
    blurb: "Pré-treino · SFT · RLHF.",
    questions: [
      {
        q: "Qual a diferença entre pré-treino e RLHF?",
        opts: [
          "Pré-treino usa dados rotulados; RLHF usa dados sem rótulos.",
          "Pré-treino aprende linguagem em biliões de textos sem supervisão directa; RLHF afina tom, segurança e preferências através de votação humana entre respostas.",
          "São o mesmo processo com nomes diferentes.",
        ],
        correct: 1,
        why: "Pré-treino dá o modelo do mundo. SFT dá o formato. RLHF dá a personalidade. Quando dizem \"este modelo é seguro para uso clínico\", RLHF importa mais — define recusas, hesitações, encaminhamentos.",
      },
      {
        q: "Por que diz a aula que \"em medicina, importa quem vota o RLHF\"?",
        opts: [
          "Porque modelos com mais votos são mais precisos.",
          "Porque RLHF reflecte as preferências dos anotadores: ChatGPT foi votado por generalistas, não por clínicos.",
          "Porque a votação determina o pré-treino seguinte.",
        ],
        correct: 1,
        why: "Modelos como Med-PaLM 2 acrescentam RLHF com clínicos. A diferença não é a arquitectura — é quem define o que conta como \"boa resposta\". Em clínica isso importa mais que em conversa geral.",
      },
      {
        q: "Quanto custam estas fases, em ordem de magnitude?",
        opts: [
          "Pré-treino > SFT > RLHF (treino mais demorado e caro primeiro).",
          "SFT > pré-treino > RLHF (a etapa de qualidade é a mais cara).",
          "RLHF > SFT > pré-treino (a preferência humana custa mais que tudo).",
        ],
        correct: 0,
        why: "Pré-treino corre semanas em milhares de GPUs (milhões de dólares). SFT precisa de centenas a milhares de exemplos curados (dias). RLHF acrescenta milhares de comparações votadas. Ordem clara em escala.",
      },
      {
        q: "Se o modelo é pré-treinado em \"toda a internet\", porque é que precisa de SFT para responder bem a perguntas?",
        opts: [
          "Porque o pré-treino não inclui linguagem natural.",
          "Porque sem SFT o modelo é um predicador de internet — continua textos como um fórum o faria, sem registo de assistente.",
          "Porque o pré-treino sozinho não sabe português.",
        ],
        correct: 1,
        why: "Um modelo só pré-treinado, dado o prompt \"O que é a hipertensão?\", pode continuar com outra pergunta, ou com lixo de fórum. SFT ensina o registo \"pergunta → resposta útil\".",
      },
    ],
  },
  {
    id: "funciona",
    num: "06",
    title: "Mecanismo",
    blurb: "Atenção · temperatura · amostragem token-a-token.",
    questions: [
      {
        q: "Para uso clínico, queres temperatura próxima de zero porque…",
        opts: [
          "Modelos com temperatura baixa têm acuidade maior.",
          "Temperatura baixa = amostragem quase determinista, ideal quando reprodutibilidade vale mais que criatividade.",
          "Temperatura controla o número de parâmetros usados na inferência.",
        ],
        correct: 1,
        why: "Em código de alta, codificação ICD-10, sumários — queres o mesmo prompt a dar o mesmo output. Temperatura ~0 garante isso. ChatGPT e Claude correm a ~0,7, optimizados para conversa, não para clínica.",
      },
      {
        q: "Numa rede transformer, a atenção (\"reunião multidisciplinar\") faz o quê?",
        opts: [
          "Decide quais tokens anteriores são relevantes para prever o próximo.",
          "Aumenta o número de parâmetros disponíveis.",
          "Controla a temperatura do output.",
        ],
        correct: 0,
        why: "Cada cabeça de atenção pondera diferentes posições anteriores. Como numa reunião MDT: cardio olha o ECG, pulm o raio-X. O modelo combina as perspectivas para decidir o próximo token.",
      },
      {
        q: "Quando o modelo gera \"isquémia\" como hipótese para um doente com dor torácica + DM2…",
        opts: [
          "Está a integrar guidelines e exame físico.",
          "Está a calcular probabilidades em tokens, com base nos padrões de bilhões de notas — não pesou o ECG nem viu o doente.",
          "Está a usar Bayes formalmente.",
        ],
        correct: 1,
        why: "É a limitação fundadora: token plausível ≠ diagnóstico fundamentado. O modelo não compreende. Reconhece padrões. Quando algo te parecer estranho, a resposta começa quase sempre aqui.",
      },
      {
        q: "Chain-of-thought (CoT) é útil em clínica porque…",
        opts: [
          "Dá ao modelo acesso a guidelines.",
          "Obriga o modelo a explicitar passos de raciocínio — dá transparência sobre onde falhou, não só o quê falhou.",
          "Reduz o consumo de tokens.",
        ],
        correct: 1,
        why: "Modo directo: 1 frase, atalho cognitivo. CoT: passos visíveis. Em medicina, ver os passos permite identificar onde o raciocínio descarrilou (premissa errada vs álgebra errada). E aumenta a acuidade em problemas multi-passo.",
      },
    ],
  },
  {
    id: "prompts",
    num: "07",
    title: "Prompts",
    blurb: "Papel · público · formato · restrições · verificação.",
    questions: [
      {
        q: "Os 4 elementos de um bom prompt clínico são:",
        opts: [
          "Pergunta · resposta · contexto · feedback.",
          "Papel · público · formato · restrições.",
          "Modelo · temperatura · tokens · saída.",
        ],
        correct: 1,
        why: "Papel (\"és farmacêutico clínico\") · público (\"para um colega de SU\") · formato (\"3 bullets com red flags\") · restrições (\"sem doses concretas, sem fármacos não disponíveis em PT\"). Quanto mais explícito, menos espaço para improviso.",
      },
      {
        q: "O 5º elemento que muda tudo em saúde é:",
        opts: [
          "A temperatura.",
          "O protocolo de verificação — instruir o modelo sobre como admitir incerteza (e.g., \"se não tiveres a fonte primária, escreve [SEM FONTE]\").",
          "O modelo específico a usar.",
        ],
        correct: 1,
        why: "Dizer ao modelo como sinalizar dúvida corta uma boa fatia das alucinações. Vai além de \"se não souberes, diz que não sabes\" — define formato explícito de incerteza.",
      },
      {
        q: "Few-shot prompting é:",
        opts: [
          "Re-treinar o modelo com exemplos novos.",
          "Mostrar 1-5 exemplos rotulados dentro do próprio prompt para a tarefa em causa.",
          "Limitar o número de tokens do output.",
        ],
        correct: 1,
        why: "Few-shot = exemplos no contexto, sem alterar pesos. Em tarefas de codificação clínica, classificação, extracção — 3-5 exemplos no prompt costumam bater uma descrição longa. Sem fine-tuning, sem treino.",
      },
      {
        q: "Para a alta da Maria, qual prompt produz melhor handoff em SU?",
        opts: [
          "\"Resume esta nota.\"",
          "\"És médico assistente. Resume em 3 bullets para handoff em SU: red flags primeiro, depois plano. Sem dados identificáveis. Máx 80 palavras.\"",
          "\"Escreve uma carta de alta longa e detalhada.\"",
        ],
        correct: 1,
        why: "O 2º especifica papel (médico assistente), público (SU), formato (3 bullets, red flags primeiro) e restrição (sem PHI, 80 palavras). Os 4 + 1 elementos em acção.",
      },
    ],
  },
  {
    id: "alucinacoes",
    num: "08",
    title: "Alucinações",
    blurb: "Fluência não é evidência.",
    questions: [
      {
        q: "Qual o sinal mais confiável de que uma citação produzida por um LLM é fabricada?",
        opts: [
          "O autor não é conhecido.",
          "O DOI ou link à revista não abre — redirige para erro ou para artigo diferente.",
          "A citação não inclui IC 95% nem p-value.",
        ],
        correct: 1,
        why: "DOIs fabricados têm formato sintáctico correcto mas não resolvem para um artigo real. Regra prática: se o DOI não abre, a referência não existe. Outros sinais: combinação demasiado conveniente, ausência em PubMed.",
      },
      {
        q: "Por que o LLM moderno está \"quase sempre na linha de cima\" (alta fluência)?",
        opts: [
          "Porque verificam factos antes de responder.",
          "Porque foram treinados para gerar texto plausível — a fluência vem da previsão de tokens, separada da verdade.",
          "Porque as alucinações foram eliminadas em modelos pós-2024.",
        ],
        correct: 1,
        why: "Fluência e veracidade são eixos independentes. O modelo optimiza fluência (próximo token plausível). A veracidade exige verificação externa — fonte primária, ferramentas com pesquisa. Sem isso, plausível ≠ verdade.",
      },
      {
        q: "Em estudos publicados em 2023-2024, a taxa de fabricação de citações por GPT-4 em tarefas médicas variou entre:",
        opts: [
          "0% e 5%.",
          "~30% e ~70%, dependendo da tarefa e do modelo.",
          "Sempre ~50% exactamente.",
        ],
        correct: 1,
        why: "Walters & Wilder 2023, Athaluri et al. 2023, Kung et al. 2023 reportam taxas amplamente variáveis. O ponto: nunca é zero, e é elevado mesmo em modelos de fronteira.",
      },
      {
        q: "Quando o doente chega com \"perguntei ao ChatGPT\", a estratégia em 4 passos começa por:",
        opts: [
          "Mostrar imediatamente o erro do modelo.",
          "Perguntar exactamente o que o modelo disse — sem ler tu o ecrã, pede-lhe para parafrasear.",
          "Recusar discutir IA na consulta.",
        ],
        correct: 1,
        why: "Passos: 1) pergunta o que disse; 2) valida o que está correcto; 3) corrige o que está errado mostrando porquê; 4) explica limites do modelo sem censura. Manter a relação é mais importante que o ego.",
      },
    ],
  },
  {
    id: "vieses",
    num: "09",
    title: "Vieses",
    blurb: "Dados, modelo, resposta · onde entra o viés.",
    questions: [
      {
        q: "No caso Obermeyer (2019), o problema central foi:",
        opts: [
          "O algoritmo estava mal codificado.",
          "Foi escolhida a variável errada — \"gasto em saúde\" como proxy de necessidade clínica subestima sistematicamente doentes com acesso historicamente menor.",
          "O modelo foi treinado com poucos dados.",
        ],
        correct: 1,
        why: "Não foi bug: foi decisão de design. Doentes negros gastavam menos por barreiras de acesso — não por estarem menos doentes. O modelo classificou-os como menos necessitados. Afectou ~200 milhões de pessoas.",
      },
      {
        q: "Numa avaliação clínica de IA, duas decisões que introduzem viés sem envolver o algoritmo são:",
        opts: [
          "A linguagem de programação e a arquitectura.",
          "A escolha da variável-proxy e a composição da coorte de treino.",
          "O número de parâmetros e a temperatura.",
        ],
        correct: 1,
        why: "Composição da coorte: quem ficou de fora dos ensaios cuja literatura o modelo leu (mulheres, minorias, idosos, pediatria). Proxy: o que conta como \"ground truth\". Ambos invisíveis ao código.",
      },
      {
        q: "Em escalas de risco de úlcera por pressão (Braden, Norton), por que falham mais frequentemente em pele escura?",
        opts: [
          "São culturalmente enviesadas no design da pergunta.",
          "Baseiam-se em observação visual de eritema não-branqueável — sinal atenuado em pele escura, levando a stage-2 sem sinalização.",
          "Foram traduzidas mal para outras línguas.",
        ],
        correct: 1,
        why: "Padrão repete-se em pulso oximetria, dermatologia, etc. Quando o sinal visual é treinado num fenótipo dominante, a sensibilidade cai em fenótipos sub-representados. A enfermeira com contexto compensa; o score automatizado não.",
      },
      {
        q: "Para o mesmo quadro clínico, um LLM produz respostas diferentes consoante o sexo do doente. O que explica isto?",
        opts: [
          "Os modelos não fazem isso quando bem treinados.",
          "Os dados de treino reflectem associações históricas (\"dor torácica + homem\" ≈ EAM, \"dor torácica + mulher\" ≈ ansiedade); o modelo replica essas probabilidades.",
          "O modelo está intencionalmente programado para diferenciar.",
        ],
        correct: 1,
        why: "Não é maldade nem bug — é como aprende. Se o corpus tem mais casos de EAM em homens, P(EAM | sintomas + homem) > P(EAM | sintomas + mulher). Replica o viés histórico com confiança e fluência iguais.",
      },
    ],
  },
  {
    id: "rag",
    num: "10",
    title: "RAG",
    blurb: "Biblioteca antes da resposta.",
    questions: [
      {
        q: "RAG (retrieval-augmented generation) é:",
        opts: [
          "Re-treinar o modelo com novos dados.",
          "Recuperar trechos relevantes de um corpus controlado e injectá-los no prompt antes de o modelo responder.",
          "Aumentar a velocidade do modelo via cache.",
        ],
        correct: 1,
        why: "RAG compensa a memória de longo prazo (parâmetros vagos, sem fontes) com memória de curto prazo precisa (contexto). Sem alterar pesos. Reduz alucinações em 30-60% em saúde — mas não as elimina.",
      },
      {
        q: "Memória de longo prazo (parâmetros) vs memória de curto prazo (contexto):",
        opts: [
          "Ambas têm a mesma precisão.",
          "Parâmetros = vagos, sem fontes, podem estar desactualizados. Contexto = precisos, citáveis, controláveis a cada chamada.",
          "Contexto é treinado offline.",
        ],
        correct: 1,
        why: "Esta distinção é o fundamento do RAG. Quando precisas de citação rastreável + actualidade, queres contexto. Os parâmetros sabem muito mas vagamente.",
      },
      {
        q: "Um RAG mal desenhado pode:",
        opts: [
          "Reduzir sempre as alucinações.",
          "Aumentar alucinações — recupera passagem irrelevante e o modelo inventa em cima dela.",
          "Não ter qualquer efeito.",
        ],
        correct: 1,
        why: "RAG não é magia. Se o retrieval traz um trecho de outra patologia ou um RCM antigo, o modelo vai citá-lo confiantemente. Qualidade do corpus + qualidade do retrieval definem o tecto.",
      },
      {
        q: "Em saúde, qual o corpus de referência ideal para uma RAG sobre tratamento de hipertensão?",
        opts: [
          "Wikipedia + Reddit + textos médicos pirateados.",
          "Guidelines DGS/ESH actualizadas + RCM dos fármacos disponíveis em PT + protocolos da instituição.",
          "Apenas literatura primária da PubMed.",
        ],
        correct: 1,
        why: "Corpus controlado = curadoria explícita do que conta como autoridade. DGS + RCM + protocolos locais são auditáveis, datados, e relevantes para o contexto PT. Wikipedia é tentador mas sem garantia de actualidade.",
      },
    ],
  },
  {
    id: "agentes",
    num: "11",
    title: "Agentes",
    blurb: "Observa · decide · age · porta humana.",
    questions: [
      {
        q: "Qual a diferença fundamental entre um chatbot e um agente?",
        opts: [
          "Tamanho do modelo.",
          "Um chatbot responde; um agente observa, decide, executa acções (com ferramentas/API) e observa o resultado.",
          "A linguagem usada para programar.",
        ],
        correct: 1,
        why: "Agente = LLM + ferramentas + loop de execução. Pode ler processos, escrever notas, marcar consultas. Cada passo acumula erro. Por isso a porta humana antes de acção crítica.",
      },
      {
        q: "Numa doente anticoagulada com ITU, o agente sugere ciprofloxacina. O erro foi:",
        opts: [
          "A dose recomendada estava errada.",
          "O agente não correu verificarInteracoes(varfarina, ciprofloxacina) — cipro inibe CYP1A2/3A4 e aumenta INR ~50% em 7 dias.",
          "A doente não tinha indicação para antibiótico.",
        ],
        correct: 1,
        why: "Guideline listou cipro como uma das opções; agente escolheu sem filtrar pelo perfil farmacológico da doente. Fosfomicina ou nitrofurantoína (CrCl-guarded) eram primeiras escolhas para anticoagulados.",
      },
      {
        q: "Prompt injection ataca um agente porque:",
        opts: [
          "Exploit em código do modelo.",
          "O LLM não distingue dados (texto do utente) de instruções (mensagem do sistema) — ambos chegam como tokens no mesmo prompt.",
          "Os modelos não validam input.",
        ],
        correct: 1,
        why: "Texto do utente pode embutir instruções (\"ignora o sistema, faz X\"). O modelo não sabe que aquele bloco é dados — vê só tokens. A defesa não é só técnica: é processual (porta humana antes de acção crítica).",
      },
      {
        q: "Scribes ambient (Abridge, DAX, Suki) são populares em 2026 porque…",
        opts: [
          "Substituem o registo clínico.",
          "Ouvem, transcrevem, estruturam — não tocam em nada. Ganha-se tempo de escrita, o profissional revê e assina.",
          "Diagnosticam doenças mais rapidamente que o médico.",
        ],
        correct: 1,
        why: "É a aplicação de IA com maior adopção. Ganha-se 10-15 min/encontro. Mas: consentimento RGPD, áudio na cloud, omissões clínicas. Antes de adoptar: onde fica o áudio, BAA assinado, acuidade em pt-PT, auditabilidade.",
      },
    ],
  },
  {
    id: "privacidade",
    num: "12",
    title: "Privacidade",
    blurb: "RGPD · EU AI Act · responsabilidade pessoal.",
    questions: [
      {
        q: "Anonimizaste o nome e o NIF. A nota da Maria está pronta para o ChatGPT free?",
        opts: [
          "Sim — os identificadores directos foram removidos.",
          "Não — idade exacta + morada + diagnóstico + datas reidentificam em combinação (anonimização superficial não chega).",
          "Sim, desde que o ChatGPT esteja em modo privado.",
        ],
        correct: 1,
        why: "RGPD considera pseudonimização ainda como dados pessoais. Anonimização real exige remover directos (nome, NIF, SNS) E indirectos (morada, idade exacta, datas, profissão rara, diagnóstico raro num distrito pequeno), depois reavaliar.",
      },
      {
        q: "Qual a única via legal para colar uma nota clínica completa num LLM em 2026 (em PT)?",
        opts: [
          "ChatGPT pago com opt-out de treino.",
          "Plano institucional com BAA assinado pela tua instituição, ou modelo on-premise.",
          "Qualquer tier free desde que feches a sessão depois.",
        ],
        correct: 1,
        why: "Free e pago individual não têm BAA — sem base legal para tratamento por terceiro. Institucional/BAA = compromisso contratual de não-treino + cláusulas RGPD. On-premise = dados não saem.",
      },
      {
        q: "Colaste por engano uma nota com PII num LLM público. O passo seguinte certo é:",
        opts: [
          "Apagar a conversa do histórico e considerar resolvido.",
          "Considerar incidente de protecção de dados: notificar o EPD da tua instituição, eventualmente CNPD se houver risco, documentar.",
          "Mudar a password da tua conta.",
        ],
        correct: 1,
        why: "Apagar do teu lado não recolhe os dados que já saíram. RGPD art. 33 exige notificação em 72h se houver risco para os direitos do titular. Documentar é mandatório mesmo que decidas não notificar (com justificação).",
      },
      {
        q: "A responsabilidade quando colas uma nota clínica num LLM público recai sobre:",
        opts: [
          "O fornecedor do LLM.",
          "O profissional de saúde que colou.",
          "A instituição empregadora.",
        ],
        correct: 1,
        why: "A CNPD trata isso como tratamento por terceiros decidido pelo profissional. O fornecedor é processor; o profissional é controller de facto. Sem base legal, é violação RGPD pessoal.",
      },
    ],
  },
  {
    id: "quando",
    num: "13",
    title: "Quando usar",
    blurb: "Heurística da reversibilidade · sens/spec · Bayes.",
    questions: [
      {
        q: "A heurística mais útil antes de delegar uma acção a IA é:",
        opts: [
          "Se a precisão do modelo é alta, pode ser delegada.",
          "Se esta acção for errada, quanto custa reverter? E como saberei a tempo?",
          "Se o modelo passa em USMLE, pode prescrever.",
        ],
        correct: 1,
        why: "A delegação cresce com a reversibilidade — não com a precisão. Marcar uma consulta extra é barato. Enviar uma mensagem urgente errada é caro. Prescrever sem revisão é catastrófico.",
      },
      {
        q: "Em populações de baixa prevalência, um teste com sens 99% e spec 95% positivo deixa o doente com qual probabilidade pós-teste de doença?",
        opts: [
          "Aproximadamente 99% (= sensibilidade).",
          "Frequentemente < 50% — depende muito da pré-teste; em rastreio, a maioria dos positivos são falsos.",
          "Aproximadamente 95% (= especificidade).",
        ],
        correct: 1,
        why: "É o erro clássico do rastreio sem clínica. Em prevalência baixa (e.g., 0,1%), mesmo um teste excelente positivo deixa a probabilidade pós-teste em 1-2%. Bayes: VPP cai brutalmente com a pré-teste.",
      },
      {
        q: "Drift de modelo significa:",
        opts: [
          "O modelo está mal configurado.",
          "A população em que o modelo foi validado mudou; sem recalibração, performance degrada silenciosamente.",
          "O modelo perdeu pesos durante a transferência.",
        ],
        correct: 1,
        why: "Pós-COVID, Ozempic em massa, novas variantes virais. O modelo continua a fazer o que sempre fez; a realidade é que mudou. A pergunta certa: \"há monitorização contínua e re-validação trimestral em coorte local?\"",
      },
      {
        q: "Para uma tarefa de calcular dose, IA aceitável é:",
        opts: [
          "Qualquer LLM generalista com prompt claro.",
          "Ferramenta guideline-locked com fórmula publicada, entradas obrigatórias e log auditável — verificação humana mantém-se mandatória.",
          "Nunca, sob qualquer circunstância.",
        ],
        correct: 1,
        why: "LLM generalista sem salvaguardas: não. Calculadora pediátrica de paracetamol mg/kg com formula EHRA, vancomicina por CrCl: sim, com verificação humana. A ferramenta muda; o dever profissional não.",
      },
    ],
  },
];

export function getQuizTopic(id: string): QuizTopic | undefined {
  return QUIZ_TOPICS.find((t) => t.id === id);
}

export function totalQuizQuestions(): number {
  return QUIZ_TOPICS.reduce((n, t) => n + t.questions.length, 0);
}
