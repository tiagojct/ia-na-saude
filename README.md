# IA · Saúde

Curso aberto sobre inteligência artificial e LLMs em saúde, para profissionais portugueses (médicos, enfermeiros, farmacêuticos, fisioterapeutas, psicólogos, nutricionistas, terapeutas, técnicos).

**14 secções · 36 demos interactivos · ~80 min · pt-PT canónico · sem dados de doentes.**

Construído com [Eleventy v3](https://www.11ty.dev/) + Web Components + Tailwind v4. Estático, sem backend, com PWA offline.

## Setup local

```bash
npm install
npm run dev      # http://localhost:8080/
npm run build    # _site/
npm test         # vitest
npm run test:e2e # playwright
```

## Estrutura

```
src/
  _data/        # contexto Eleventy (site, sections, glossary)
  _includes/    # layouts + macros Nunjucks
  content/
    pt-PT/      # páginas + secções (Markdown por secção)
  components/   # Web Components (36 demos vanilla via Lit)
  lib/          # math, sections catalog, quiz data
  assets/       # css, js (chrome), fonts
  public/       # sw.js, manifest, icons, og.png
scripts/        # gen-og, gen-epub, gen-sitemap
tests/          # vitest unit + playwright e2e
```

## Status

Em migração desde [`learning-health-ai`](../learning-health-ai/) (Astro).

Ver [`/Users/tiagojct/.claude/plans/iterative-painting-canyon.md`](file:///Users/tiagojct/.claude/plans/iterative-painting-canyon.md) para o plano de migração faseado.

## Licença

- Código: MIT.
- Conteúdo: CC-BY-4.0.
