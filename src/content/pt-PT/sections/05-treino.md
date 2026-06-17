---
num: "05"
id: treino
title: "Treino · pré-treino · SFT · RLHF"
time: "8 min"
lead: "Lê toda a internet, aprende a obedecer com exemplos, afina por preferência."
idea: "Três fases, três janelas para introduzir erro. RLHF foi quem ensinou o ChatGPT a recusar."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Distinguir pré-treino, SFT e RLHF.",
  "Identificar o efeito da composição dos anotadores no tom final do modelo.",
  "Compreender porque é que recalibração contínua importa."
]) }}

<p>Pegar num modelo do zero e levá-lo a “ChatGPT” passa por três etapas. O {{ term("pretreino", "pré-treino") | safe }} ensina linguagem em milhares de milhões de textos. A {{ term("sft", "SFT") | safe }} ensina formato a obedecer instruções. O {{ term("rlhf", "RLHF") | safe }} afina por preferência humana — é onde o modelo aprende a recusar, a hesitar, a encaminhar.</p>

{% demo "loss-curve-demo" %}

<p>A loss desce de ~11 (ruído alfabético) para ~2 (texto clínico fluente) em escala log. Cada salto custa ordens de magnitude mais computação. Acima de certa escala, capacidades novas emergem sem ser programadas.</p>

{% demo "scale-corpora" %}

<p>Tu, em 40 anos, lês ~100 M tokens. GPT-3 viu ~300 000 M. LLaMA 3, ~15 000 000 M. <strong>A barra mais pequena és tu.</strong> A questão não é se o modelo sabe mais que tu; é se sabe <em>certo</em>.</p>

{% demo "sft-cards" %}

<p>Anotadores generalistas vs clínicos. Mesmo prompt, dois alvos. Os generalistas escolhem quase sempre o cartão "consulta um profissional"; os clínicos preferem o cartão telegráfico com doses e timings. <strong>O ChatGPT que conheces foi treinado pelos primeiros.</strong> Med-PaLM mudou só uma coisa: quem escreve os exemplos.</p>

{% demo "rlhf-vote" %}

{% demo "three-stages" %}

{% call anchor("Ouyang et al., 2022 · InstructGPT", "evidence") %}
~30 000 pares humano-rotulados foram a única coisa que mudou entre GPT-3 “bruto” e o ChatGPT. O conhecimento já estava lá. RLHF deu-lhe voz alinhada.
{% endcall %}

{% call bridge() %}
E quando o treino acaba, como é que o modelo escolhe a próxima palavra?
{% endcall %}
