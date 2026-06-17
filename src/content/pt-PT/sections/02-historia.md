---
num: "02"
id: historia
title: "História"
time: "8 min"
lead: "4 eras · 20 marcos · de MYCIN (1972) a Claude 4 (2026)."
idea: "A IA em saúde já passou por dois invernos. O terceiro virá se prometermos demais."
---

{% from "macros/ui.njk" import objectives, aside, anchor, bridge, term %}

{{ objectives([
  "Reconhecer as 4 eras da IA: clássica, invernos, deep learning, generativa.",
  "Distinguir narrow AI (radiologia) de IA generativa (LLMs).",
  "Identificar 3 padrões que se repetem em cada hype-cycle."
]) }}

<p>A história da IA é cíclica: cada salto é seguido de uma decepção, e cada decepção esquecida pelo próximo salto. Conhecer o padrão é a primeira defesa contra promessas inflacionadas — incluindo as que estão a ser feitas em saúde agora.</p>

{% demo "era-timeline" %}

<p>Quatro eras estruturam a leitura. A <strong>Clássica</strong> (1950-1980) testou os limites da lógica simbólica. Os <strong>Invernos</strong> (1980-2010) mostraram que sistemas peritos, sem escala nem aprendizagem, não chegam à clínica. O <strong>Deep Learning</strong> (2010-2020) trouxe a primeira IA que bate clínicos em tarefas estreitas. A <strong>Generativa</strong> (2020-) trouxe os LLMs — e a pergunta nova: o que pode esta máquina <em>fazer</em> sozinha?</p>

{% demo "mycin-demo" %}

{% call anchor("MYCIN · 1972", "case") %}
Edward Shortliffe constrói no Stanford um sistema pericial para infecções bacterianas. Mais preciso que muitos clínicos. Nunca usado em produção — ninguém quis assinar uma recomendação que não fosse sua. A regra ainda vigora: <strong>a IA recomenda; o clínico assina</strong>.
{% endcall %}

{% demo "eliza-chat" %}

<p>Joseph Weizenbaum, MIT 1966. Eliza reflectia a frase do utilizador como pergunta. Doentes contaram-lhe coisas íntimas — sem perceber que era um script de 200 linhas. <strong>A persuasão de um modelo não é inteligência.</strong> É a forma como devolve a tua linguagem.</p>

{% demo "model-scale-chart" %}

<p>De 2017 a 2026: 65 milhões → 10 biliões de parâmetros. Cinco ordens de magnitude. Cada salto Y é 10×. Acima de certa escala, emergem capacidades que ninguém programou: tradução zero-shot, cadeia de raciocínio, código funcional. Daí o nome <em>capacidades emergentes</em>.</p>

{% call bridge() %}
Como é que uma máquina aprende, afinal? A história não chega. Precisamos do mecanismo.
{% endcall %}
