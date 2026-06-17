/**
 * <loss-curve-demo> · Treino · 4 fotos do treino · curva de loss + output.
 *
 * Animação setInterval (1.4s entre estágios). Reduced-motion salta para fim.
 */

import { IaElement, html, prefersReducedMotion } from "./_base";
import { property } from "lit/decorators.js";

interface Stage {
  step: number;
  stepLabel: string;
  loss: number;
  tag: string;
  title: string;
  desc: string;
  output: string;
}

const STAGES: Stage[] = [
  { step: 0, stepLabel: "0", loss: 11.2, tag: "fase 0 · ruído", title: "Modelo recém-iniciado", desc: "Pesos aleatórios. Não viu nenhum texto. Cada token é praticamente equiprovável.", output: "qrt asdf mnbv pwq xzcv lkjh fdsa qwerty" },
  { step: 500, stepLabel: "500", loss: 7.0, tag: "fase 1 · pré-treino inicial", title: "Começa a apanhar palavras frequentes", desc: 'Já viu alguns lotes. Sabe que "o" e "doente" aparecem muito. Sem gramática.', output: "o o o doente o o tem o doente o" },
  { step: 5000, stepLabel: "5 K", loss: 3.8, tag: "fase 2 · pré-treino avançado", title: "Constrói frases curtas com gramática", desc: "Frases curtas fazem sentido; respostas longas perdem-se.", output: "doente tem tosse e febre há dias com dificuldade respiratória." },
  { step: 32000, stepLabel: "32 K", loss: 2.4, tag: "fase 3 · pré-treino convergido", title: "Coerente, fluente, ainda sem assistência", desc: "Sabe gramática, sabe medicina superficial, sabe completar texto. Ainda não foi educado a responder a perguntas (isso vem em SFT).", output: "febre. Os sintomas sugerem infecção respiratória; recomenda-se avaliação clínica e auscultação para descartar pneumonia." },
];

const MAX_STEP_LOG = Math.log10(32000 + 1);

function xPos(step: number): number {
  const logS = Math.log10(step + 1);
  return 30 + (logS / MAX_STEP_LOG) * 360;
}

function yPos(loss: number): number {
  return 20 + (1 - loss / 12) * 120;
}

export class LossCurveDemo extends IaElement {
  @property({ type: Number, state: true }) activeIdx = 0;
  @property({ type: Boolean, state: true }) playing = false;

  private timer: number | null = null;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.timer) window.clearInterval(this.timer);
  }

  private play = () => {
    if (prefersReducedMotion()) {
      this.activeIdx = STAGES.length - 1;
      return;
    }
    if (this.timer) window.clearInterval(this.timer);
    this.playing = true;
    this.activeIdx = 0;
    let i = 0;
    this.timer = window.setInterval(() => {
      i++;
      if (i >= STAGES.length) {
        if (this.timer) window.clearInterval(this.timer);
        this.timer = null;
        this.playing = false;
      } else {
        this.activeIdx = i;
      }
    }, 1400);
  };

  private reset = () => {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.activeIdx = 0;
    this.playing = false;
  };

  protected render() {
    const active = STAGES[this.activeIdx];
    return html`
      <div>
        <div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <svg viewBox="0 0 400 160" class="h-auto w-full">
            ${[0, 3, 6, 9, 12].map(
              (l) => html`<g>
                <line
                  x1="30"
                  x2="395"
                  y1=${yPos(l)}
                  y2=${yPos(l)}
                  stroke="#e2e8f0"
                  stroke-dasharray="2,3"
                ></line>
                <text
                  x="25"
                  y=${yPos(l) + 4}
                  text-anchor="end"
                  font-size="9"
                  fill="#94a3b8"
                >
                  ${l}
                </text>
              </g>`,
            )}
            <text
              x="5"
              y="80"
              font-size="9"
              fill="#64748b"
              transform="rotate(-90 10 80)"
            >
              loss
            </text>

            <polyline
              points=${STAGES.map((s) => `${xPos(s.step)},${yPos(s.loss)}`).join(
                " ",
              )}
              fill="none"
              stroke="#3b82f6"
              stroke-width="2"
              opacity="0.5"
            ></polyline>
            <polyline
              points=${STAGES.slice(0, this.activeIdx + 1)
                .map((s) => `${xPos(s.step)},${yPos(s.loss)}`)
                .join(" ")}
              fill="none"
              stroke="#3b82f6"
              stroke-width="2.5"
            ></polyline>

            ${STAGES.map(
              (s, i) => html`<g
                style="cursor:pointer"
                @click=${() => (this.activeIdx = i)}
              >
                <circle
                  cx=${xPos(s.step)}
                  cy=${yPos(s.loss)}
                  r=${i === this.activeIdx ? 7 : 5}
                  fill=${i === this.activeIdx ? "#2563eb" : "#60a5fa"}
                  stroke="white"
                  stroke-width="2"
                ></circle>
                <text
                  x=${xPos(s.step)}
                  y="150"
                  text-anchor="middle"
                  font-size="9"
                  font-weight=${i === this.activeIdx ? "700" : "400"}
                  fill="#475569"
                >
                  ${s.stepLabel}
                </text>
              </g>`,
            )}

            <text x="210" y="158" text-anchor="middle" font-size="9" fill="#94a3b8">
              passos de treino (escala log)
            </text>
          </svg>
        </div>

        <div class="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700"
          >
            ${active.tag} · loss = ${active.loss.toFixed(1)}
          </div>
          <div class="mb-1 font-bold text-slate-900">${active.title}</div>
          <p class="text-sm leading-relaxed text-slate-700">${active.desc}</p>

          <div class="mt-3 rounded bg-white p-3">
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              prompt: o doente apresenta tosse e ___
            </div>
            <pre
              class="mt-2 whitespace-pre-wrap font-mono text-sm text-slate-800"
            >
${active.output}</pre
            >
          </div>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            @click=${this.play}
            ?disabled=${this.playing}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            ${this.playing ? "a animar…" : "▶ Animar treino"}
          </button>
          <button
            type="button"
            @click=${this.reset}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Reiniciar
          </button>
        </div>

        <p class="mt-3 text-xs italic text-slate-500">
          A curva é ilustrativa. Em treinos reais a loss decresce de forma
          análoga: rápida no início, lenta no fim.
        </p>
      </div>
    `;
  }
}

customElements.define("loss-curve-demo", LossCurveDemo);
