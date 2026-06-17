---
num: "06"
id: funciona
title: "Mecanismo · como funciona"
time: "5 min"
lead: "Softmax sobre o vocabulário · temperatura controla a aleatoriedade."
idea: "Prevê o próximo token. Um a um. Sem ver o doente, sem abrir uma guideline."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Explicar como o {{ softmax converte logits em probabilidades.",
  "Demonstrar o efeito da temperatura na amostragem.",
  "Reconhecer atenção multi-cabeça como o motor do Transformer."
]) }}

<p>O LLM produz texto <strong>um token de cada vez</strong>. Para cada posição, calcula uma distribuição de probabilidade sobre todo o vocabulário (~50 000 tokens) com a {{ term("softmax") | safe }}. A {{ term("temperatura") | safe }} decide se ele escolhe sempre o topo (T baixa, determinista) ou se diversifica (T alta, criativo / mais alucinação).</p>

{% demo "next-word-demo" %}

<p>Move o slider. T=0,05 colapsa quase toda a probabilidade no top-1 (sempre "sudorese"); T=1,5 achata a distribuição (qualquer dos 8 candidatos é plausível). Em clínica, queres T próximo de zero — reprodutibilidade vence criatividade. Com penalização de repetição (−1.2 por ocorrência), evitas o loop "sudorese · sudorese · sudorese".</p>

{% demo "attention-viz" %}

<p>O {{ term("transformer") | safe }} (Vaswani et al., 2017) usa {{ term("atencao", "atenção") | safe }} multi-cabeça: cada cabeça aprende a olhar para padrões diferentes (cardio, demografia, sintaxe, comorbilidades). 96 cabeças × 80 camadas em modelos modernos. Cada uma especializa-se em padrões que emergem do treino — não são programados à mão.</p>

{% demo "chain-of-thought" %}

<p>Chain-of-thought (CoT) força o modelo a decompor passo a passo. Em prompts clínicos sem CoT, o modelo salta para a resposta com base em padrões superficiais (saltou a "viagem" porque fixou "pleurítica"). Com "<em>Pensa passo a passo antes de responder</em>", obriga-se a integrar todos os pistas.</p>

{% demo "similarity-search" %}

<p>O modelo "sabe" que enfarte e angina são parecidos porque os seus vectores estão próximos. O cosseno entre dois embeddings é a forma técnica de medir essa proximidade. <strong>Significado é geometria</strong> — fundamento de RAG, k-NN clínico, descoberta de fármacos similares.</p>

{% call bridge() %}
Se o modelo só prevê o próximo token, como mudar o que ele responde sem treinar? <em>Prompts.</em>
{% endcall %}
