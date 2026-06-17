/**
 * <hero-ticker> · Homepage · typing animation cycling clinical terms.
 *
 * Respeita reduced-motion (render estático da primeira frase).
 */

import { IaElement, html, prefersReducedMotion } from "./_base";
import { property } from "lit/decorators.js";

const PHRASES = ["expectoração", "sibilos", "dispneia", "febre", "ortopneia", "hemoptises"];
const PROMPT = "O doente apresenta dispneia, tosse e";

export class HeroTicker extends IaElement {
  @property({ type: Number, state: true }) phraseIdx = 0;
  @property({ type: String, state: true }) typed = "";
  @property({ type: String, state: true }) phase: "typing" | "hold" | "deleting" = "typing";

  private timer: number | null = null;
  private reduced = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.reduced = prefersReducedMotion();
    if (this.reduced) {
      this.typed = PHRASES[0];
      this.phase = "hold";
    } else {
      this.scheduleNext();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearTimeout(this.timer);
  }

  private scheduleNext() {
    if (this.reduced) return;
    if (this.timer) window.clearTimeout(this.timer);
    const phrase = PHRASES[this.phraseIdx];
    if (this.phase === "typing") {
      if (this.typed.length < phrase.length) {
        this.timer = window.setTimeout(() => {
          this.typed = phrase.slice(0, this.typed.length + 1);
          this.scheduleNext();
        }, 80 + Math.random() * 50);
      } else {
        this.timer = window.setTimeout(() => {
          this.phase = "hold";
          this.scheduleNext();
        }, 1400);
      }
    } else if (this.phase === "hold") {
      this.timer = window.setTimeout(() => {
        this.phase = "deleting";
        this.scheduleNext();
      }, 600);
    } else {
      if (this.typed.length > 0) {
        this.timer = window.setTimeout(() => {
          this.typed = this.typed.slice(0, -1);
          this.scheduleNext();
        }, 30);
      } else {
        this.phraseIdx = (this.phraseIdx + 1) % PHRASES.length;
        this.phase = "typing";
        this.scheduleNext();
      }
    }
  }

  protected render() {
    return html`
      <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-2 text-[10px] font-bold uppercase tracking-wider text-blue-700">
          o que o modelo prevê · letra a letra
        </div>
        <div class="font-mono text-base leading-relaxed text-slate-800 sm:text-lg">
          ${PROMPT}
          <span class="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-700">${this.typed}</span>
          <span class="ml-0.5 inline-block h-[1.1em] w-[2px] animate-pulse bg-blue-600 align-middle" aria-hidden="true"></span>
        </div>
        <p class="mt-3 text-xs italic text-slate-500">
          Sem ver o doente. Sem abrir uma guideline. Só padrões.
        </p>
      </div>
    `;
  }
}

customElements.define("hero-ticker", HeroTicker);
