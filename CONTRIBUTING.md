# Contributing to IA · Saúde

Thanks for considering a contribution. Aim of this project: keep an open, accurate, pedagogically useful introduction to AI/LLMs for health professionals, in pt-PT (canonical) and en-US (condensed).

## Quick paths

| You want to… | Open a |
|---|---|
| Report a factual error / citation that doesn't open | **issue** with the `correction` label |
| Suggest a new demo or section | **issue** with the `enhancement` label |
| Fix typo / improve copy | **PR** straight against `main` |
| Add a translation | **issue** first to scope |
| Submit a new clinical scenario | **issue** first; we keep clinical narrative tight |

## Local setup

```bash
git clone https://github.com/tiagojct/learning-health-ai
cd learning-health-ai
npm install --legacy-peer-deps      # @testing-library peers
npm run dev                         # http://localhost:4321/
```

Astro 6 SSG + React 19 + Tailwind v4 + Sharp (asset gen) + Vitest + Playwright.

## Tests must pass

```bash
npm run test          # vitest · 30 unit specs (math, sections, url, demoState)
npm run typecheck     # astro check · TS
npm run build         # static dist/ (also regenerates og.png + epub)
npm run test:e2e      # playwright · 54 specs · routes, demos, settings, a11y
npm run test:all      # all of the above in sequence (build → unit → e2e)
```

Other playwright modes for debugging a failure:

```bash
npm run test:e2e:ui       # interactive debugger
npm run test:e2e:headed   # see the browser
npm run test:e2e:report   # open the last HTML report
```

E2E suite spec files:

| File | What it covers |
|---|---|
| `tests/e2e/routes.spec.ts` | 7 routes load + H1, 12 static assets, manifest JSON, SEO/CSP/JSON-LD |
| `tests/e2e/demos.spec.ts` | 14 section anchors, share buttons, hydration, visited tracking, Tokenizer/Bayes/RAG state, EN page, demo gallery filters |
| `tests/e2e/settings.spec.ts` | Theme, font scale, reading + projection modes |
| `tests/e2e/a11y.spec.ts` | axe-core sweep · critical + serious WCAG 2.1 AA across 7 routes |
| `tests/e2e/smoke.spec.ts` | Keyboard shortcuts (j/k/g/Cmd-K/?), palette, section share, mobile drawer |

A11y advisory rules `color-contrast` and `link-in-text-block` are tracked as
non-blocking warnings (the interactive demos use intentional colour-coded UI
that conflicts with a strict 4.5:1 sweep). Review the advisory output before
each release · see `tests/MANUAL-CHECKLIST.md` for the printable 10-minute
smoke list run end-to-end before publishing.

CI runs the full chain on every PR. PRs that drop coverage on `src/lib/**` will be flagged.

## Code style

- Astro components for prose pages, React `.tsx` for interactive demos
- Demos must declare `client:visible` (or `client:load` for above-fold only) — otherwise they ship dead HTML
- Internal absolute links use `p()` from `src/lib/url.ts`
- Section IDs are language-invariant (Portuguese roots) — keep deep links surviving language switch
- New glossary terms go into `src/components/ui/Term.astro` + `/pt-PT/glossario/`
- New citations go into `/pt-PT/bibliografia/`
- Pure math/state helpers belong in `src/lib/`, unit-tested under `tests/unit/`
- Reduced motion respected · check `prefersReducedMotion()` if you add animation
- localStorage keys prefixed `ia-saude-…`
- Same-tab updates dispatch `iasaude:*` custom events

## Content rules

- **No PHI in demos.** All scenarios fictional (Maria, Tiago, Pedro). Real clinicians/utentes never used as examples.
- **Every claim cites or doesn't make it.** If a number lacks a source, drop or qualify.
- **PT-PT canonical.** EN-US is a condensed mirror.
- **Maria thread.** A demo can show several patients but Maria appears at least once per section that involves a patient persona. New personas only when pedagogically necessary.
- **Tone.** Direct, no hedging. Source style is Hemingway-ish.

## Adding a demo

1. New `.tsx` in `src/components/demos/` · default export the component
2. Pure logic to `src/lib/math.ts` (or new lib file) with unit tests
3. Wire into `src/pages/pt-PT/index.astro` inside a `<DemoFrame>` with `label`, `preview`, optional `notice`
4. Add entry to `src/pages/pt-PT/demos.astro` `DEMOS` array
5. Mirror into `src/pages/en-US/index.astro` (condensed)

## Pull request checklist

- [ ] Tests pass (`npm test && npm run build`)
- [ ] No CJK/Spanish/leftover characters in PT-PT text (we've been bitten before)
- [ ] Citations open (verify DOI / URL is alive)
- [ ] Maria still appears in affected sections
- [ ] CHANGELOG updated under `## [Unreleased]`
- [ ] Demos have `client:visible` and (where relevant) `useDemoState`

## Code of Conduct

We follow the [Contributor Covenant 2.1](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). See `CODE_OF_CONDUCT.md`. Report incidents to <tiago@tiagojct.eu>.

## Licence

Code: MIT. Content: CC-BY-4.0. By contributing you agree to release under the same.
