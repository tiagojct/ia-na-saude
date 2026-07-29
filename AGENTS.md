# Repository Guidelines

## Project Structure & Module Organization

This is an Eleventy 3 static course site for `IA na Saúde`, with canonical
content in pt-PT. Source files live in `src/`: `_data/` holds shared site data,
`_includes/` contains Nunjucks layouts, macros, and partials, `content/pt-PT/`
contains pages and the 14 markdown course sections, `components/` contains Lit
Web Components, and `lib/` contains framework-agnostic TypeScript helpers.
Static assets are under `src/assets/` and passthrough public files are in
`src/public/`. Tests live in `tests/unit/` and `tests/e2e/`; generated output is
written to `_site/`.

## Build, Test, and Development Commands

- `npm install`: install project dependencies.
- `npm run dev`: build components and CSS, then serve Eleventy at
  `http://localhost:8080/ia-na-saude/`.
- `npm run build`: clean `_site/`, generate images, build Vite bundles, CSS,
  Eleventy pages, sitemap, and EPUB.
- `npm test`: run Vitest unit tests without coverage.
- `npm run test:e2e`: run Playwright browser tests.
- `npm run test:all`: run unit tests, full build, then e2e tests.
- `npm run lint` / `npm run format`: run ESLint or Prettier across the repo.

## Coding Style & Naming Conventions

Use TypeScript modules and existing local helpers before adding new abstractions.
Prettier enforces 2-space indentation, semicolons, double quotes, trailing
commas, LF endings, and 80-character print width. Web Components are kebab-case
custom elements implemented in `src/components/*.ts`; shared pure logic belongs
in `src/lib/`. Keep localStorage keys prefixed with `ia-saude-` and same-tab
events prefixed with `iasaude:`.

## Testing Guidelines

Add Vitest tests in `tests/unit/*.test.ts` for pure helpers and Playwright specs
in `tests/e2e/*.spec.ts` for route, interaction, and accessibility behavior.
When touching components or content routing, run at least `npm test` and
`npm run build`; use `npm run test:e2e` for user-visible workflow changes.

## Commit & Pull Request Guidelines

Recent commits use short, imperative summaries, often prefixed by phase context
such as `Phase 13 · vitest unit ...`. Keep messages concise and scope-specific.
PRs should describe the change, list tests run, link relevant issues, and include
screenshots for visual or interactive updates.

## Content & Safety Notes

Keep pt-PT as the source of truth. Do not include real PHI or identifiable
patient details; clinical scenarios must be fictional. Cite factual medical or
technical claims, and verify links when editing bibliography-driven content.
