---
num: "12"
id: privacidade
title: "Privacidade · RGPD · EU AI Act"
time: "6 min"
lead: "Tirar nome e data não chega. A combinação restante reidentifica."
idea: "Política de privacidade ≠ conformidade. Sem BAA, sem PHI."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Distinguir identificadores directos de indirectos.",
  "Aplicar o teste de reidentificação por combinação.",
  "Conhecer as datas-chave do EU AI Act."
]) }}

<p>{{ term("rgpd") | safe }} considera <em>dados de saúde</em> como categoria especial (art. 9). Transferi-los para terceiro sem base legal é incumprimento — mesmo com "política de privacidade" do fornecedor a dizer que não treina.</p>

{% demo "pii-detector" %}

<p>Cola uma nota. O detector marca nomes, NIF/SNS, moradas, datas, idades. O score de reidentificação combina tudo: NIF sozinho = 30 pts; combinação completa pode chegar a 100 (ALTO). <strong>Anonimização real é tirar directos e indirectos, depois reavaliar</strong> se a combinação restante ainda reidentifica.</p>

{% demo "gdpr-quiz" %}

<p>Mastery learning: 2 acertos consecutivos para dominar. As três variantes cobrem os erros mais comuns — "iniciais não anonimizam", "política do fornecedor ≠ base legal", "data breach exige notificação".</p>

{% demo "cost-calculator" %}

<p>Em prática, o tier importa tanto quanto a anonimização. Free/paid sem BAA: <strong>não usar com PHI</strong>. API standard sem BAA pré-assinado: protótipos. BAA institucional ou on-premise: tratamento legítimo.</p>

{% call anchor("EU AI Act · datas-chave", "context") %}
<strong>2025-02-02:</strong> práticas proibidas em vigor.<br/>
<strong>2025-08-02:</strong> obrigações GPAI.<br/>
<strong>2026-08-02:</strong> aplicação geral do regulamento.<br/>
<strong>2027-08-02:</strong> sistemas de alto risco em saúde · conformidade total exigida.
{% endcall %}

{% call aside("CNPD · Portugal", "info") %}
Comissão Nacional de Protecção de Dados é a autoridade local. Em caso de data breach com risco para o titular, notificar em 72 h (RGPD art. 33). Documentar é mandatório, mesmo que decidas não notificar (com justificação).
{% endcall %}

{% call bridge() %}
Tudo o que vimos diz <em>como</em> a IA funciona. Falta o quando. Quando é razoável usar?
{% endcall %}
