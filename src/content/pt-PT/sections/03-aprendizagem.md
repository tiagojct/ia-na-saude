---
num: "03"
id: aprendizagem
title: "Como as máquinas aprendem"
time: "7 min"
lead: "Supervisada, não-supervisada, auto-supervisada. Três regimes, uma intuição."
idea: "Aprender = ajustar pesos para reduzir erro. O resto é detalhe."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Distinguir aprendizagem supervisada de não-supervisada e auto-supervisada.",
  "Compreender o papel do gradiente e da retropropagação no ajuste de pesos.",
  "Explicar porque é que dados rotulados são escassos em medicina."
]) }}

<p>Aprender em IA é uma só coisa: <strong>ajustar parâmetros para reduzir erro</strong>. Muda o tipo de exemplos que o modelo vê (rotulados? não rotulados? auto-rotulados?), muda o que se chama. Mas a mecânica — softmax, loss, gradiente, retropropagação — é a mesma.</p>

{% demo "perceptron-demo" %}

<p>Aqui treinas um classificador linear (perceptron) em 6 imagens 6×6 rotuladas como benignas ou suspeitas. Os pesos a verde votam benigno, os a vermelho votam suspeito. Antes do treino, todos cinzentos (modelo ignorante). Após convergência, a rede revela <em>onde olhou</em>.</p>

{% call aside("Aprendizagem supervisada", "info") %}
Cada exemplo tem uma etiqueta. O modelo prediz, compara com a etiqueta, ajusta. Quase toda a IA médica aprovada (radiologia, dermatologia) é supervisada. <strong>Limite</strong>: precisa de rótulos humanos · custosos em saúde.
{% endcall %}

{% call aside("Aprendizagem não-supervisada", "info") %}
Sem rótulos. O modelo descobre estrutura sozinho (clusters, anomalias). Usada para descoberta de subtipos de doença, detecção de anomalias em sinais.
{% endcall %}

{% call aside("Auto-supervisada", "info") %}
Truque dos LLMs: o rótulo está dentro do texto. Esconder uma palavra e prever qual é. Não precisa de anotadores. <strong>Por isso escalou</strong>: usa toda a internet.
{% endcall %}

{% call anchor("Minsky & Papert · 1969", "evidence") %}
<a href="https://en.wikipedia.org/wiki/Perceptrons_(book)" target="_blank" rel="noopener">Perceptrons</a> mostra que uma rede de uma camada não aprende {{ term("xor", "XOR") | safe }}. Investimento desaba. Primeiro Inverno da IA, até 1986 (com a {{ term("backprop", "retropropagação") | safe }}).
{% endcall %}

{% call bridge() %}
Tudo isto soa abstracto. O que é, exactamente, um <em>token</em>?
{% endcall %}
