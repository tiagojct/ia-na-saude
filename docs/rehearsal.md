# Rehearsal checklist

Run through this list before each live teaching session. ~10 minutes.
Things you only catch in front of an audience.

## 1 · Browser + storage

- [ ] Open a fresh private/incognito window (or clear `localStorage` for `tiagojct.eu`).
- [ ] Visit the canonical URL with the slot you'll teach: e.g. `/ia-na-saude/pt-PT/?slot=60`.
- [ ] Confirm the greyed "saltado" strips appear for out-of-slot sections, and clicking one expands it.

## 2 · Projection mode

- [ ] Press `p` (or Settings → 🎤 projecção) before plugging in projector.
- [ ] Confirm:
  - [ ] Chrome (TOC, footer, progress bar) hides.
  - [ ] Section QR codes appear on each section header.
  - [ ] Headings scale up (h1 ~5rem, h2 ~4rem at 1080p).
- [ ] Plug projector. Verify aspect ratio (16:9). If 4:3, drop browser zoom to 110%.
- [ ] Walk away to the back of the room. Read the lead paragraph of one section. If you can't, bump font scale to A+ (or fix projector contrast).

## 3 · Network

- [ ] Open DevTools → Network → Throttle to "Slow 3G".
- [ ] Reload. Confirm:
  - [ ] First paint < 3s.
  - [ ] Cmd-K palette still opens (no network required after first load).
  - [ ] Tokenizer-demo or another visible demo hydrates within ~500ms after the IntersectionObserver triggers.
- [ ] Disable network (offline mode). Reload. Service worker should serve the page from cache. If it doesn't, run `npm run build` first to populate sw cache.

## 4 · Demos that need user input

These the ones to spot-check live:

- [ ] **tokenizer-demo** — type a clinical phrase. Confirm token chips render in both columns. URL gains `?tk.pt=`.
- [ ] **next-word-demo** — drop temperature to 0.05. Click "Sortear" 8 times. Confirm the picked tokens are NOT all "sudorese" (repetition penalty must shift the distribution).
- [ ] **rag-demo** — toggle between good / broken. Side-by-side outputs must differ visibly.
- [ ] **bayesian-update** — move pre-test slider. Posterior numbers must update without lag.
- [ ] **gdpr-quiz** — pick the correct answer twice in a row. "Dominado" celebration must fire.

## 5 · Facilitator affordances

- [ ] Toggle 🗒 "mostrar notas" in Settings. Confirm the purple sidecar notes appear under each section. (URL gains `?notes=1`.)
- [ ] Switch slot to "30m". Confirm only the 5 core sections expand by default.
- [ ] Test `?from=tokens` URL: prior sections collapse, page scrolls to `#tokens`.
- [ ] Cmd-K palette: type "RAG" → confirms section appears. Press Enter → jumps to `#rag`.

## 6 · Print + handout

- [ ] Cmd-P (print preview). Confirm:
  - [ ] Demos collapse to "[demo interactivo]" markers.
  - [ ] Sections don't break across pages mid-paragraph (mostly).
  - [ ] QR codes hidden.
- [ ] If handing out the ePub: `_site/ia-na-saude.epub` opens cleanly in Apple Books / Calibre.

## 7 · Audience mix

Pick the bridge that fits the room and call it out at section opens:

- Mostly nursing: emphasise the **Enfermagem** lines in the `profBridges` macro.
- Mostly pharmacy: emphasise the **Farmácia** lines.
- Mostly psychology: emphasise the **Psicologia** lines.
- Mixed: read one line each at the most relevant section (typically `vieses`, `privacidade`).

## 8 · One thing that always trips up

`Maria` is the recurring case. If you skip her opening in the 30m slot, drop a one-liner before §tokens: *"Maria, 64, HTA, DM2, dor torácica — every demo references her."* Otherwise the embedding/attention demos lose the thread.

## 9 · Recovery script

If a demo crashes mid-session:

1. Stay on the slide. Don't reload.
2. Use the verbal fallback: every demo has a corresponding `notice` attribute on `demoFrame` that explains what the demo would show. Read it out loud.
3. Move on. Reload at the next section break.

## 10 · Post-session hygiene

- [ ] Take note of which confusion in `facilitatorNote` actually surfaced. Add to the notes for next time.
- [ ] If a price / model / regulation came up that's now stale, log it. Update `src/lib/facts.ts` before the next session.
