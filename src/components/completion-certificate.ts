/**
 * <completion-certificate> · Aprofundar · gate de progresso (14 secções
 * visitadas) + certificado imprimível com nome.
 *
 * localStorage keys:
 *   - ia-saude-visited (Set serialised as JSON array, written by chrome.js)
 *   - ia-saude-completed-at (ISO timestamp)
 *   - ia-saude-cert-name (string)
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { SECTION_IDS } from "../lib/sections";

const STORAGE = {
  visited: "ia-saude-visited",
  completedAt: "ia-saude-completed-at",
  certName: "ia-saude-cert-name",
};

function loadVisited(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE.visited) || "[]"));
  } catch {
    return new Set();
  }
}

function safeGet(k: string): string | null {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}

function safeSet(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* ignored */
  }
}

function safeRemove(k: string) {
  try {
    localStorage.removeItem(k);
  } catch {
    /* ignored */
  }
}

export class CompletionCertificate extends IaElement {
  @property({ type: Object, state: true }) visited: Set<string> = new Set();
  @property({ type: String, state: true }) name = "";
  @property({ type: String, state: true }) completedAt: string | null = null;
  @property({ type: Boolean, state: true }) pendingReset = false;

  private storageHandler = (e: StorageEvent) => {
    if (!e.key) {
      this.refresh();
      return;
    }
    if (e.key === STORAGE.visited) this.visited = loadVisited();
    if (e.key === STORAGE.completedAt)
      this.completedAt = safeGet(STORAGE.completedAt);
    if (e.key === STORAGE.certName) this.name = safeGet(STORAGE.certName) || "";
  };

  private sameTabHandler = () => this.refresh();

  connectedCallback(): void {
    super.connectedCallback();
    this.refresh();
    window.addEventListener("storage", this.storageHandler);
    window.addEventListener("iasaude:visited-cleared", this.sameTabHandler);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("storage", this.storageHandler);
    window.removeEventListener("iasaude:visited-cleared", this.sameTabHandler);
  }

  private refresh() {
    this.visited = loadVisited();
    this.name = safeGet(STORAGE.certName) || "";
    this.completedAt = safeGet(STORAGE.completedAt);
  }

  private saveName(n: string) {
    this.name = n;
    safeSet(STORAGE.certName, n);
  }

  private doReset = () => {
    safeRemove(STORAGE.visited);
    safeRemove(STORAGE.completedAt);
    safeRemove(STORAGE.certName);
    this.visited = new Set();
    this.completedAt = null;
    this.name = "";
    document.body.classList.remove("aula-completa");
    this.pendingReset = false;
    window.dispatchEvent(new CustomEvent("iasaude:visited-cleared"));
  };

  private printCert = () => {
    document.body.classList.add("cert-print");
    let done = false;
    const cleanup = () => {
      if (done) return;
      done = true;
      document.body.classList.remove("cert-print");
      window.removeEventListener("afterprint", cleanup);
      mql?.removeEventListener?.("change", onMqlChange);
    };
    const mql = window.matchMedia?.("print");
    const onMqlChange = (e: MediaQueryListEvent) => {
      if (!e.matches) cleanup();
    };
    window.addEventListener("afterprint", cleanup);
    mql?.addEventListener?.("change", onMqlChange);
    requestAnimationFrame(() => {
      try {
        window.print();
      } catch {
        cleanup();
      }
    });
    setTimeout(cleanup, 30000);
  };

  protected render() {
    const count = SECTION_IDS.filter((id) => this.visited.has(id)).length;
    const pct = Math.round((count / SECTION_IDS.length) * 100);
    const complete = count === SECTION_IDS.length;
    const dateStr = (this.completedAt
      ? new Date(this.completedAt)
      : new Date()
    ).toLocaleDateString("pt-PT", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return html`
      <div>
        <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="mb-3 flex items-baseline justify-between">
            <div>
              <div class="text-xs font-bold uppercase tracking-wider text-blue-700">o teu progresso</div>
              <div class="text-sm text-slate-500">${count} / ${SECTION_IDS.length} secções visitadas · ${pct}%</div>
            </div>
            ${!this.pendingReset
              ? html`<button
                  type="button"
                  @click=${() => (this.pendingReset = true)}
                  class="text-xs font-medium text-slate-500 hover:text-red-600"
                >
                  apagar
                </button>`
              : html`<div class="flex items-center gap-1 text-xs">
                  <span class="text-slate-500">apagar mesmo?</span>
                  <button
                    type="button"
                    @click=${this.doReset}
                    class="rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white hover:bg-red-700"
                  >
                    sim
                  </button>
                  <button
                    type="button"
                    @click=${() => (this.pendingReset = false)}
                    class="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    cancelar
                  </button>
                </div>`}
          </div>
          <div class="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style="width:${pct}%"
            ></div>
          </div>
          <div class="mt-3 grid grid-cols-7 gap-1">
            ${SECTION_IDS.map(
              (id) => html`<div
                title=${id}
                class="${this.visited.has(id)
                  ? "bg-green-500"
                  : "bg-slate-200"} h-2 rounded"
              ></div>`,
            )}
          </div>
        </div>

        ${complete
          ? html`<div id="cert-print-area" class="mt-6">
              <div class="cert-card rounded-2xl text-center">
                <div
                  class="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-500"
                >
                  CERTIFICADO DE CONCLUSÃO
                </div>
                <div
                  class="font-display mb-6 text-sm tracking-widest text-blue-700"
                >
                  IA · SAÚDE
                </div>

                <p class="mb-2 text-sm uppercase tracking-wider text-slate-500">
                  Este documento confirma que
                </p>
                ${this.name
                  ? html`<h3
                      class="font-display mb-4 text-3xl font-bold tracking-tight text-slate-900"
                      style="letter-spacing:-0.025em"
                    >
                      ${this.name}
                    </h3>`
                  : html`<input
                      type="text"
                      placeholder="o teu nome"
                      .value=${this.name}
                      @input=${(e: Event) =>
                        this.saveName((e.target as HTMLInputElement).value)}
                      class="font-display mb-4 w-full border-0 border-b-2 border-dashed border-slate-300 bg-transparent text-center text-3xl font-bold tracking-tight text-slate-900 focus:border-blue-500 focus:outline-none"
                      style="letter-spacing:-0.025em"
                      aria-label="nome no certificado"
                    />`}

                <p class="mb-1 text-sm leading-relaxed text-slate-700">
                  concluiu as <strong>14 secções</strong> do curso
                  <strong>Inteligência Artificial para Profissionais de Saúde</strong>,
                </p>
                <p class="mb-6 text-sm text-slate-500">
                  cobrindo princípios, mecanismo, limitações e quadro
                  ético-legal de IA aplicada a contexto clínico.
                </p>

                <div class="my-6 mx-auto h-px w-32 bg-slate-300"></div>

                <p class="text-sm text-slate-600">
                  concluído em <strong>${dateStr}</strong>
                </p>
                <p class="mt-1 text-xs text-slate-500">
                  auto-estudo · sem fim curricular oficial · imprime ou guarda
                  PDF
                </p>

                ${this.name
                  ? html`<div class="mt-6">
                      <button
                        type="button"
                        @click=${this.printCert}
                        class="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow hover:bg-blue-700"
                      >
                        ⎙ imprimir / guardar PDF
                      </button>
                      <button
                        type="button"
                        @click=${() => this.saveName("")}
                        class="ml-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                      >
                        mudar nome
                      </button>
                    </div>`
                  : ""}
              </div>
            </div>`
          : html`<p class="mt-4 text-xs italic text-slate-500">
              Visita todas as ${SECTION_IDS.length} secções para desbloquear o
              certificado. O progresso fica guardado no browser (localStorage).
            </p>`}
      </div>
    `;
  }
}

customElements.define("completion-certificate", CompletionCertificate);
