---
num: "04"
id: tokens
title: "Tokens · BPE · contexto"
time: "5 min"
lead: "Pneumonectomia parte em 6 tokens em pt e 2 em en. Pagas a diferença."
idea: "O modelo não vê palavras. Vê tokens. E o pt-PT custa ~30 % mais que o inglês."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, demoFrame, term %}

{{ objectives([
  "Explicar o que é um token e como o BPE constrói o vocabulário.",
  "Reconhecer o sobrecusto do pt-PT face ao inglês em LLMs.",
  "Compreender a janela de contexto e o que acontece quando rebenta."
]) }}

<p>Um modelo de linguagem não lê <em>palavras</em>. Lê <strong>tokens</strong> — pedaços de palavras descobertos por um algoritmo de <strong>Byte-Pair Encoding</strong> ({{ term("bpe") | safe }}) treinado num corpus específico. Quando esse corpus é maioritariamente inglês, palavras médicas portuguesas partem em muitos pedaços; o custo computacional e o orçamento de janela inflam.</p>

{% demo "tokenizer-demo" %}

<p>Carrega "nota da Maria" e compara: ~85 tokens em pt vs ~60 em en para o mesmo texto. Em mil chamadas, são tokens (e custo) extra que a versão inglesa evita. Em on-premise ou modelo local, este overhead é zero — outra razão para considerar modelos treinados em corpora multilingues.</p>

{% demo "embedding-viz" %}

<p>Cada token converte-se num {{ term("embedding") | safe }} — um {{ term("vector") | safe }} de centenas de dimensões. Termos próximos no sentido ficam próximos no espaço. O modelo aprende-o pela <strong>companhia</strong>: nunca lhe é dito que <em>enfarte</em> e <em>angina</em> são parecidos; aprende-o por aparecerem nos mesmos contextos.</p>

{% demo "vocab-context" %}

<p>A {{ term("contexto", "janela de contexto") | safe }} é finita. Modelos de gama média: 4 096 tokens. Frontier 2026: ~200 000 tokens. Quando rebentar, o início desaparece sem aviso. Em prática clínica, isto significa que notas longas + histórico podem cortar precisamente o que importava.</p>

{% call bridge() %}
Como é que estes pesos se aprendem em primeiro lugar? Três fases · uma sequência.
{% endcall %}
