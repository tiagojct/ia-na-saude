---
num: "13"
id: quando
title: "Quando usar · heurística da reversibilidade"
time: "7 min"
lead: "Pergunta única: se errar, quanto custa reverter?"
idea: "Reversível: autonomia. Irreversível: revisão humana."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, mariaCloser %}

{{ objectives([
  "Aplicar a heurística da reversibilidade a uma tarefa concreta.",
  "Distinguir sensibilidade (rastreio) de especificidade (confirmação).",
  "Reconhecer drift como motivo para recalibração contínua."
]) }}

<p>Toda a aula converge aqui: quando posso delegar? A pergunta certa não é <em>quão preciso é o modelo</em>. É <em>se errar, quanto custa reverter?</em></p>

{% demo "delegation-demo" %}

<p>Seis tarefas, três níveis (autónomo · com revisão · só humano). Resumir notas: reversível → autónomo. Sugerir diferencial: influencia decisão → revisão. Calcular dose vancomicina: catastrófico se errar → só humano com calculadora validada. <strong>A delegação cresce com a reversibilidade, não com a precisão.</strong></p>

{% demo "sens-spec-demo" %}

<p>Mesmo modelo, dois limiares, duas decisões diferentes. Rastreio (não falhar doentes): limiar baixo, alta sensibilidade. Confirmação (não rotular saudáveis): limiar alto, alta especificidade. <strong>Não há óptimo universal.</strong> Depende do custo de cada erro — o mesmo princípio da reversibilidade aplicado a métricas.</p>

{% demo "bayesian-update" %}

<p>Antes de pedir o teste, qual a tua estimativa? Para a Maria (HTA, DM2, dor torácica, ex-fumadora), a pré-teste de SCA é alta (≥ 50 %). Mesmo uma troponina inicialmente negativa não exclui — daí o algoritmo 0/3h. Para uma mulher jovem sem factores de risco, a mesma troponina positiva é mais provavelmente falso positivo. <strong>Probabilidade pré-teste não é opcional.</strong></p>

{% demo "drift-over-time" %}

<p>Modelo aprovado em 2023, validado anualmente. Sem recalibração, em 2026 a sensibilidade cai de 89 % para 73 % — abaixo do limiar de aprovação. <strong>O modelo está aprovado mas já não funciona.</strong> COVID, GLP-1 agonistas, variantes virais — o mundo muda. Recalibração trimestral em coorte local é o preço.</p>

{% call mariaCloser() %}
Voltamos à Maria. A pergunta certa para usar IA no caso dela não é "o que o modelo recomenda?" — é "<strong>onde, neste caso, o LLM ajuda sem decidir?</strong>". Documentar carta de alta, traduzir consentimento informado, sugerir investigação adicional para revisão: defensável. Decidir SCA vs não-SCA, prescrever AAS, decidir alta: tu.
{% endcall %}

{% call bridge() %}
Cinco lições para levar — e onde aprofundar.
{% endcall %}
