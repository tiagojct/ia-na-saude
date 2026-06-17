---
num: "14"
id: aprofundar
title: "Aprofundar · 5 lições · papers · ferramentas"
time: "4 min"
lead: "Cinco coisas que ficam. Onde ler mais. E o teu certificado."
idea: "Não substitui formação formal. Junta-se a ela."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, recap %}

{{ objectives([
  "Recuperar 5 lições-chave do curso.",
  "Reconhecer 5 papers fundadores que vale a pena ler.",
  "Identificar tools clínicas para usar a partir de amanhã."
]) }}

{{ recap() }}

{% demo "fluency-quiz" %}

<p>5 perguntas + calibração de confiança. Alta confiança + errado é território Dunning-Kruger — onde mais provavelmente vais cair em prática. Baixa confiança + acertaste pode ser sorte: revê o conceito.</p>

{% demo "flashcards" %}

<p>14 termos · Leitner spaced repetition (4h / 1d / 3d / 7d / 14d). O progresso fica no browser. Volta daqui a uns dias para consolidar memória de longo prazo.</p>

{% demo "completion-certificate" %}

<p>Visita todas as 14 secções para desbloquear. Imprime ou guarda em PDF. <strong>Auto-estudo sem fim curricular oficial</strong> — usa-o como prova interna de que cobriste o material.</p>

<h3 class="mt-8 text-xl font-bold text-slate-900">5 papers para ler</h3>

<ul class="mt-3 space-y-3">
  <li><strong>Vaswani et al., 2017</strong> · <em>Attention is all you need</em>. <a href="https://arxiv.org/abs/1706.03762" target="_blank" rel="noopener">arxiv.org/abs/1706.03762</a> · A arquitectura Transformer. Curto, técnico, fundador.</li>
  <li><strong>Obermeyer et al., 2019</strong> · <em>Dissecting racial bias in an algorithm</em>. <a href="https://www.science.org/doi/10.1126/science.aax2342" target="_blank" rel="noopener">science.org</a> · O paper de viés mais influente da década.</li>
  <li><strong>Lewis et al., 2020</strong> · <em>Retrieval-Augmented Generation</em>. <a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noopener">arxiv.org/abs/2005.11401</a> · A origem do RAG.</li>
  <li><strong>Singhal et al., 2023</strong> · <em>Med-PaLM 2</em>. <a href="https://www.nature.com/articles/s41586-023-06291-2" target="_blank" rel="noopener">nature.com</a> · LLM treinado por anotadores clínicos.</li>
  <li><strong>Amugongo et al., 2025</strong> · <em>RAG in medicine — systematic review</em>. <a href="https://www.nature.com/articles/s41746-025-01670-7" target="_blank" rel="noopener">npj-digital-medicine</a> · Onde RAG ajuda e onde introduz risco.</li>
</ul>

<h3 class="mt-8 text-xl font-bold text-slate-900">Tools clínicas para experimentar</h3>

<ul class="mt-3 space-y-2">
  <li><a href="https://www.openevidence.com" target="_blank" rel="noopener">Open Evidence</a> · RAG sobre PubMed orientado a clínicos.</li>
  <li><a href="https://glass.health" target="_blank" rel="noopener">Glass Health</a> · apoio à decisão clínica com fontes.</li>
  <li><a href="https://elicit.com" target="_blank" rel="noopener">Elicit</a> · RAG para revisão de literatura.</li>
  <li><a href="https://ai.nejm.org" target="_blank" rel="noopener">NEJM AI</a> · revista dedicada a IA em medicina.</li>
  <li><a href="https://transformer-circuits.pub" target="_blank" rel="noopener">Transformer Circuits</a> · mecanismos internos dos LLMs.</li>
</ul>

<h3 class="mt-8 text-xl font-bold text-slate-900">Páginas relacionadas</h3>

<ul class="mt-3 space-y-2">
  <li><a href="{% p 'pt-PT/quiz/' %}">Quiz por tópico</a> · perguntas + explicações por secção.</li>
  <li><a href="{% p 'pt-PT/glossario/' %}">Glossário</a> · 20 termos com definição.</li>
  <li><a href="{% p 'pt-PT/bibliografia/' %}">Bibliografia</a> · 34 referências + BibTeX.</li>
  <li><a href="{% p 'pt-PT/demos/' %}">Galeria de demos</a> · saltar para o demo que interessa.</li>
</ul>

{% call aside("Próximo passo", "info") %}
Volta dentro de 1 semana e refaz o quiz de fluência. Vê se a calibração de confiança melhorou. A IA em medicina recompensa quem se demora a aprender.
{% endcall %}
