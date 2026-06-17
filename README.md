# IA na Saúde

Curso aberto sobre inteligência artificial para profissionais de saúde portugueses. 14 secções, 36 demos interactivos, ~80 minutos. pt-PT.

Online em **https://tiagojct.eu/ia-na-saude/**.

## Stack

- **Eleventy 3** SSG · estático puro, sem servidor
- **Web Components** com **Lit** (~5 KB runtime) · todos os demos hidratam lazy via IntersectionObserver
- **Tailwind v4** via `@tailwindcss/postcss` · CSS-first em `src/assets/css/global.css`
- **Vite** · multi-entry build dos 36 demos
- **Nunjucks** templating · macros como componentes UI
- **Instrument Sans** (cabeçalhos) + **Atkinson Hyperlegible Next** (corpo) · self-hosted
- **GitHub Pages** · deploy automático via workflow

## Comandos

```bash
npm install              # uma vez
npm run dev              # http://localhost:8080/ia-na-saude/
npm run build            # build pipeline · _site/ pronto para deploy
npm test                 # vitest unit (math + url + sections)
npm run test:e2e         # playwright (precisa: npx playwright install chromium)
```

## Build pipeline

```
prebuild  →  gen-og        (Sharp · SVG → PNG · og + cover + favicons + ícones PWA)
build:components → vite    (36 bundles + _shared Lit)
build:css        → postcss (Tailwind v4)
build:eleventy   → 11ty    (7 páginas · 14 secções num único pt-PT/index)
postbuild        → gen-sitemap + gen-epub  (sitemap.xml + ia-na-saude.epub 14 capítulos)
```

## Arquitectura

```
src/
├── _data/                  globals: site, sections, glossary, bibliografia, quizTopics, ui
├── _includes/
│   ├── layouts/            base.njk (HTML shell) + main.njk (chrome)
│   ├── macros/ui.njk       13 macros: objectives, aside, anchor, bridge, demoFrame,
│   │                       checkpointPrompt, mariaCloser, recap, dayMap,
│   │                       lectureSchema, pathChooser, profBridges, term
│   └── partials/           nav, settings-menu, toc-drawer, toc-aside, footer,
│                           cmdk-palette, jsonld-course, progress-bar
├── assets/
│   ├── css/global.css      585 lines · Tailwind + custom (.lecture-prose, etc.)
│   ├── fonts/              self-hosted woff2
│   └── js/
│       ├── chrome.js       460 lines · 16 chrome subsystems
│       └── components-loader.js  IntersectionObserver registry
├── components/             36 Web Components (Lit · light DOM)
│   ├── _base.ts            IaElement base · prefersReducedMotion
│   ├── _state.ts           URL params + localStorage helpers
│   └── *.ts                36 demos
├── content/
│   ├── index.njk           landing
│   └── pt-PT/
│       ├── index.njk       iterates collections.sections
│       ├── sobre.njk
│       ├── glossario.njk   20 terms · search + jump pills
│       ├── bibliografia.njk 34 entries · 5 grouped categories · BibTeX
│       ├── demos.njk       34-card gallery · category filter
│       ├── quiz/index.njk  12 topic-quiz widgets
│       └── sections/       14 markdown files · frontmatter + demo shortcodes
├── lib/                    framework-agnostic TS (math, sections, facts, quizData,
│                           motion, url)
└── public/                 passthrough copy · sw, manifest, OG, icons, robots
```

## Web Components (Lit)

36 custom elements. Cada um:

- Extende `IaElement` (light DOM via `createRenderRoot` override → global Tailwind aplica)
- Usa `@property()` decorators para reactividade
- `_state.ts` para URL params (`tk.pt=...`) e localStorage
- `_base.ts` exporta `prefersReducedMotion()` para animações

Bundles ~3-12 KB cada (4-5 KB gzipped médio). `_shared` chunk com Lit ~17.5 KB (6.6 KB gz).

## Atalhos de teclado

- `j` / `k` · próxima / anterior secção
- `g` / `G` · topo / fim
- `t` · abrir TOC (mobile)
- `m` · saltar para Maria
- `p` · alternar modo projecção (instrutor)
- `⌘K` / `?` · paleta de pesquisa (secções, termos, demos)
- `Esc` · fechar paleta / drawer

## Funcionalidades pedagógicas

- **30-segundos · ideia central** em cada secção
- **CheckpointPrompt** colapsável com pergunta+pista
- **Term popover** glossário com 20 termos
- **Maria** caso clínico que atravessa as 14 secções
- **TOC sticky** marca secções visitadas com ✓
- **Read progress bar** no topo
- **Flashcards Leitner** (5 caixas, intervalos 4h–14d), persistente em localStorage
- **Certificado** desbloqueado ao visitar 14 secções, com nome + impressão
- **Modo projecção** (`?mode=projection`) para aulas presenciais
- **Slot facilitador** (`?slot=30|60|90`) para sessões de tempo limitado
- **Quiz por tópico** em `/pt-PT/quiz/` com 12 tópicos × 4 perguntas

## Deploy

GH Pages via workflow. Para repo diferente / domínio diferente, edita env vars:

```yaml
env:
  SITE: https://tiagojct.github.io
  BASE: /ia-na-saude/
```

Workflow `.github/workflows/deploy.yml` corre em cada push para `main`.

## Conteúdo

Conteúdo canónico em pt-PT. Cada secção é um ficheiro markdown em `src/content/pt-PT/sections/`. Editar é trocar palavras + adicionar `{% demo "nome" %}` para custom elements.

## Licença

- Código: MIT (ver [LICENSE](LICENSE))
- Conteúdo (texto, demos, ilustrações): CC-BY-4.0

Atribuição:

> "Adapted from IA na Saúde by Tiago Jacinto, CC-BY-4.0, https://tiagojct.eu/ia-na-saude/"
