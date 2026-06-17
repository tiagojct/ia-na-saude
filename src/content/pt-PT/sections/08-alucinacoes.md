---
num: "08"
id: alucinacoes
title: "Alucinações · fluência ≠ verdade"
time: "6 min"
lead: "30–60 % das citações fabricadas em medicina, com DOIs plausíveis."
idea: "Se a citação parece demasiado conveniente, suspeita. Abre o DOI. Se não existir, não existe."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, mariaCloser %}

{{ objectives([
  "Reconhecer a estrutura de uma alucinação fluente.",
  "Distinguir alucinação de fronteira (raciocínio errado) de fabricação (citação inventada).",
  "Saber verificar antes de assinar."
]) }}

<p>"Alucinação" é o termo curto. A versão longa: <strong>respostas fluentes, confiantes, e factualmente incorrectas</strong>. Citações inventadas, doses erradas, guidelines fabricadas. Tudo com a confiança de um colega senior.</p>

{% demo "fake-citations" %}

<p>Quatro referências sobre azitromicina em DPOC. Duas reais. Duas fabricadas com formato perfeito — DOI, autores portugueses, números plausíveis, IC 95 %. <strong>Apanhaste as duas?</strong> A pista clínica para as fabricadas: parecem demasiado convenientes. Em prática, a defesa é abrir o DOI. Se não existir, não existe.</p>

{% call anchor("Walters &amp; Wilder, 2023 · JMIR", "evidence") %}
ChatGPT fabricou 47 % das citações em consultas médicas, com taxa de erro bibliográfico de 76 % nas restantes. <a href="https://www.jmir.org/2023/1/e48009" target="_blank" rel="noopener">jmir.org/2023/1/e48009</a>
{% endcall %}

{% call anchor("Athaluri et al., 2023 · Cureus", "evidence") %}
69 % das referências bibliográficas geradas pelo ChatGPT em consultas clínicas eram falsas. <a href="https://www.cureus.com/articles/148611" target="_blank" rel="noopener">cureus.com/articles/148611</a>
{% endcall %}

{% call mariaCloser() %}
Se pedires ao ChatGPT recomendações para a Maria, há ~50 % de hipótese de uma das referências citadas não existir. Se assinares a carta com essa referência, vai sair com o teu nome em baixo. <strong>Verificar uma a uma é a única defesa.</strong>
{% endcall %}

{% call aside("Defesa em camadas", "ok") %}
1. T baixa (≈0) reduz variabilidade.
2. RAG com corpus fechado e citação obrigatória (próxima secção).
3. Lista de defesas externa: ferramentas como Open Evidence, Glass Health, Elicit que <strong>citam</strong> e permitem clicar.
4. Revisão humana antes de assinar. <strong>Sempre.</strong>
{% endcall %}

{% call bridge() %}
E quando o modelo não inventa, mas reproduz preconceitos? Os vieses são mais subtis e mais perigosos.
{% endcall %}
