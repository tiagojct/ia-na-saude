# CLAUDE.md

Guia para Claude Code a trabalhar neste repo.

## Stack

- **11ty v3 (ESM)** · static site generator
- **Nunjucks** · templating
- **Markdown** · uma secção da aula por ficheiro (`src/content/pt-PT/sections/NN-id.md`)
- **Web Components (Lit ~5KB)** · 36 demos interactivos, vanilla custom elements
- **Tailwind v4 via PostCSS** · CSS
- **Vite** · bundla os componentes em `_site/assets/components/*.js`
- **Vitest + Playwright + axe-core** · testes
- **GH Pages** · deploy em `https://tiagojct.github.io/ia-na-saude/`

## Comandos

```bash
npm run dev      # eleventy --serve, port 8080
npm run build    # vite (components) + postcss (css) + eleventy + og + epub + sitemap
npm test         # vitest unit
npm run test:e2e # playwright
```

## Convenções

- **Só pt-PT.** Sem en-US. Sem i18n no data cascade.
- **Section IDs invariantes:** abertura · historia · aprendizagem · tokens · treino · funciona · prompts · alucinacoes · vieses · rag · agentes · privacidade · quando · aprofundar.
- **`p()` em Nunjucks:** `{% p "pt-PT/sobre/" %}` prefixa com `BASE_URL`. Nunca hardcode `/ia-na-saude/`.
- **`section` paired shortcode:** abre `<section>` com header + QR async. Fecha com `{% endsection %}`.
- **`demo` shortcode:** `{% demo "tokenizer-demo" %}` emite `<tokenizer-demo></tokenizer-demo>`. O custom element é registado pelo loader em `assets/js/components-loader.js`.

## Origem

Port de `~/github/learning-health-ai/` (Astro). Conteúdo clínico (Maria, exemplos, citações) copiado 1:1.

Plano de migração:
- `/Users/tiagojct/.claude/plans/iterative-painting-canyon.md`

## Footguns

- **Sem `client:visible` directive.** Em 11ty, o components-loader.js usa IntersectionObserver para registar os custom elements quando entram no viewport.
- **`p()` é shortcode, não filter.** Use `{% p "..." %}` não `{{ "..." | p }}`.
- **QR codes são async filter.** `{{ url | qr | safe }}` dentro de Nunjucks.
- **Markdown engine é Nunjucks.** Shortcodes funcionam dentro de `.md`.
