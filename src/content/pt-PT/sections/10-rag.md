---
num: "10"
id: rag
title: "RAG · biblioteca antes da resposta"
time: "4 min"
lead: "Retrieval-Augmented Generation: o modelo procura antes de responder."
idea: "RAG bem desenhado corta alucinações em 30-60 %. Mal desenhado pode piorar."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Explicar o pipeline RAG: query → retrieve → generate.",
  "Reconhecer quando RAG ajuda e quando RAG <em>introduz</em> alucinações.",
  "Identificar tools clínicas baseadas em RAG (Open Evidence, Glass, Elicit)."
]) }}

<p>{{ term("rag", "RAG") | safe }} = Retrieval-Augmented Generation. Antes de responder, o modelo procura no corpus que tu controlaste (GINA 2024, normas DGS, PubMed) e injecta os trechos relevantes no prompt. A resposta vem com fonte invocada.</p>

{% demo "rag-demo" %}

<p>Lado a lado: LLM puro vs LLM+RAG. Toggle "bem desenhado" vs "mal desenhado". <strong>RAG mal desenhado é pior que LLM puro</strong>: o modelo soa confiante, agora com fonte invocada — mas a fonte é o trecho pediátrico errado em vez do protocolo de adulto. A qualidade do retrieval (filtros, embeddings, scoping etário) define o tecto.</p>

{% call aside("Onde RAG ajuda mesmo", "ok") %}
<strong>Doses ajustadas a função renal.</strong> RAG com corpus farmacológico actualizado bate ChatGPT puro.<br/>
<strong>Guidelines locais.</strong> Em Portugal, normas DGS vencem Mayo Clinic — RAG permite isso.<br/>
<strong>Literatura recente.</strong> O modelo congelado em 2024 não viu o NEJM de 2026. RAG sim.
{% endcall %}

{% call anchor("Amugongo et al., 2025 · npj Digital Medicine", "evidence") %}
Revisão sistemática de RAG em medicina: redução média de 38 % nas alucinações em tarefas clínicas (com IC 95 % 28–48 %). <a href="https://www.nature.com/articles/s41746-025-01670-7" target="_blank" rel="noopener">npj-digital-medicine</a>
{% endcall %}

{% call aside("Ferramentas que já fazem isto", "info") %}
<a href="https://www.openevidence.com" target="_blank" rel="noopener">Open Evidence</a> · RAG sobre PubMed orientado a clínicos.<br/>
<a href="https://glass.health" target="_blank" rel="noopener">Glass Health</a> · apoio à decisão com fontes.<br/>
<a href="https://elicit.com" target="_blank" rel="noopener">Elicit</a> · RAG para revisão de literatura.
{% endcall %}

{% call bridge() %}
Mas o que acontece quando o modelo passa de conversar a <em>fazer</em>? Aí entra o conceito de agente — e com ele a porta humana.
{% endcall %}
