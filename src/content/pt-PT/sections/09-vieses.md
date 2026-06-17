---
num: "09"
id: vieses
title: "Vieses · onde os modelos discriminam"
time: "5 min"
lead: "Obermeyer 2019: ~200 milhões afectados por um algoritmo que usou gasto como proxy de necessidade."
idea: "Vieses não vêm do modelo. Vêm dos dados. E os dados clínicos reflectem desigualdades históricas."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge %}

{{ objectives([
  "Reconhecer 3 tipos de viés algorítmico em medicina.",
  "Distinguir viés de dados de viés de design.",
  "Identificar onde a tua prática pode estar a reproduzir um."
]) }}

<p>O modelo não inventa preconceitos. Reproduz os que estão nos dados. Se a literatura clínica historicamente excluiu mulheres de ensaios cardiovasculares, o LLM treinado nessa literatura também os exclui — com a mesma confiança.</p>

{% demo "bias-demo" %}

<p>Mesma queixa, palavra por palavra. Muda só sexo + idade. A resposta muda. Em mulher jovem, "considerar causas musculoesqueléticas, ansiedade, refluxo" normaliza. Em homem idoso, "activar via verde coronária". <strong>O modelo aprendeu isto da literatura clínica.</strong> Que aprendeu na coorte que cobria sobretudo homens.</p>

{% call anchor("Obermeyer et al., 2019 · Science", "evidence") %}
Algoritmo americano usado em milhões de doentes para sinalizar necessidade clínica. Usou <em>gasto em saúde</em> como proxy. Utentes negros, que historicamente acedem menos ao sistema (e gastam menos), foram classificados como menos doentes — para a mesma carga de doença. Estimativa: ~200 milhões afectados. <a href="https://www.science.org/doi/10.1126/science.aax2342" target="_blank" rel="noopener">science.org/doi/10.1126/science.aax2342</a>
{% endcall %}

{% call aside("Três classes de viés", "warn") %}
<strong>Dados:</strong> a coorte de treino sub-representa um grupo (mulheres, minorias, idosos).<br/>
<strong>Design:</strong> a variável-objectivo é um <em>proxy</em> defeituoso (gasto vs necessidade).<br/>
<strong>Implantação:</strong> o modelo é aplicado fora da população onde foi validado (modelo de Boston em Bragança).
{% endcall %}

{% call aside("O que podes fazer", "info") %}
Pergunta sempre: <em>em que coorte foi este modelo validado?</em> Para a Maria, mulher de 64 anos, com a sua presentação atípica de SCA, o modelo treinado em coorte maioritariamente masculina pode subestimar.
{% endcall %}

{% call bridge() %}
E se desse fontes verificáveis? Reduzir alucinações em 30-60 % é possível: RAG.
{% endcall %}
