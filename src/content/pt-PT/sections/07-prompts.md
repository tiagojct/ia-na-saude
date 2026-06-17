---
num: "07"
id: prompts
title: "Prompts · papel · público · formato · restrições"
time: "4 min"
lead: "Quanto mais explícito o prompt, menos espaço para o modelo improvisar."
idea: "Não é magia. É especificação. Cobertura clínica é uma forma de prompt."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, profBridges %}

{{ objectives([
  "Aplicar a receita papel · público · formato · restrições.",
  "Reconhecer few-shot como prompt-engineering sem treino.",
  "Identificar quando vale a pena escrever um prompt longo."
]) }}

<p>Não há talento mágico em prompt-engineering. Há uma receita: <strong>papel · público · formato · restrições</strong>. Cada elemento que adicionas reduz a ambiguidade.</p>

{% demo "prompt-level-demo" %}

<p>FRACO ("explica asma") devolve Wikipedia. MÉDIO ("a um doente recém-diagnosticado") adapta tom. BOM ("és um pneumologista a explicar a um doente recém-diagnosticado com asma moderada · 3 parágrafos curtos · sem jargão · não dês doses") devolve algo accionável.</p>

{% demo "few-shot-demo" %}

<p>Few-shot — exemplos rotulados <em>dentro</em> do prompt — é fine-tuning sem treino. Custa só mais tokens. Para codificação clínica em ICD-10, 5 exemplos bem escolhidos saltam a acuidade de 20% (zero-shot) para 100% nas notas testadas. Custo: ~500 tokens extra por chamada.</p>

{{ profBridges(
  enf="A nota de enfermagem é uma forma de prompt para o turno seguinte. Quanto mais explícita, menos retrabalho.",
  farm="Um receituário electrónico bem estruturado faz menos perguntas ao farmacêutico. Mesma lógica.",
  psi="A formulação clínica é o prompt mais elaborado da consulta — define enquadramento para o trabalho posterior."
) }}

{% call bridge() %}
Bom prompt, bom output? Nem sempre. O modelo ainda inventa, ainda enviesa. Vamos a isso.
{% endcall %}
