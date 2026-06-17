---
num: "01"
id: abertura
title: "Abertura"
time: "3 min"
lead: "Tens utentes à tua espera e o ChatGPT a um clique. O que muda no teu turno?"
idea: "O modelo prevê a próxima palavra. Tudo o que se segue vem desta limitação."
---

<p class="mt-4 text-sm font-medium text-blue-600">
Tens utentes à tua espera e o ChatGPT a um clique. O que muda no teu turno?
</p>

<p class="mt-4 text-xl leading-relaxed text-slate-600">
Catorze secções, trinta e quatro demos interactivos. O modelo prevê a próxima palavra; tudo o que se segue — alucinações, vieses, RAG, agentes, RGPD, delegação clínica — vem desta limitação.
</p>

<div class="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
  <div class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Caso que nos acompanha</div>
  <div class="text-lg font-bold text-slate-900">Maria, 64</div>
  <div class="mt-1 text-sm text-slate-500">utente #1234 · F · 64 anos</div>
  <div class="mt-4 grid gap-3 text-sm sm:grid-cols-2">
    <div>
      <div class="font-bold text-slate-700">Presente</div>
      <div class="text-slate-600">Acordou com falta de ar e dor no peito; ligou ao portal às 07:42.</div>
    </div>
    <div>
      <div class="font-bold text-slate-700">Antecedentes</div>
      <div class="text-slate-600">HTA · DM2 (HbA1c 9,1 %) · ex-fumadora 30 maços-ano · sem alergias conhecidas</div>
    </div>
  </div>
  <p class="mt-4 text-sm leading-relaxed text-slate-600">
    <strong>Em saúde, abstracções não existem: existem pessoas.</strong> Vamos voltar à Maria várias vezes. Quando a IA falhar, falha com ela; quando ajudar, ajuda-a a ela. Substitui mentalmente a profissão pela tua e a Maria continua a ser quem está à tua frente.
  </p>
</div>

{% from "macros/ui.njk" import pathChooser, dayMap, lectureSchema, recap %}

{{ pathChooser() }}
{{ dayMap() }}
{{ lectureSchema() }}
{{ recap() }}
