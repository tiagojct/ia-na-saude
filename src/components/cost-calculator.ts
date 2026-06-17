/**
 * <cost-calculator> · Privacidade · estimativa custo mensal/anual em 6 tiers
 * (free, paid, API, BAA, on-prem). Overhead pt-PT togglável.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";
import { readUrlParam, writeUrlParam, buildShareURL } from "./_state";
import { MODEL_TIERS, USD_TO_EUR, type ModelTier } from "../lib/facts";

const TIERS = MODEL_TIERS;

interface Result {
  monthlyCostEUR: number;
  annualCostEUR: number;
}

function calcCost(
  tier: ModelTier,
  consultsPerDay: number,
  tokIn: number,
  tokOut: number,
  daysPerMonth: number,
): Result {
  const monthlyIn = consultsPerDay * daysPerMonth * tokIn;
  const monthlyOut = consultsPerDay * daysPerMonth * tokOut;
  const usd =
    (monthlyIn / 1e6) * tier.pricePerMTokensIn +
    (monthlyOut / 1e6) * tier.pricePerMTokensOut;
  const effective =
    tier.id === "paid"
      ? 22
      : tier.id === "onprem"
        ? 130
        : tier.id === "free"
          ? 0
          : usd;
  const flat = tier.id === "paid" || tier.id === "onprem";
  return {
    monthlyCostEUR: effective * (flat ? 1 : USD_TO_EUR),
    annualCostEUR: effective * (flat ? 12 : 12 * USD_TO_EUR),
  };
}

const PRESETS = [
  { label: "MGF · 20 consultas/dia", consultsPerDay: 20, tokensIn: 2000, tokensOut: 800 },
  { label: "Hospital ENF · 50 consultas/dia", consultsPerDay: 50, tokensIn: 1500, tokensOut: 600 },
  { label: "Especialidade · 12 consultas/dia", consultsPerDay: 12, tokensIn: 3500, tokensOut: 1500 },
  { label: "Serviço grande · 200/dia", consultsPerDay: 200, tokensIn: 2000, tokensOut: 800 },
];

export class CostCalculator extends IaElement {
  static readonly PREFIX = "cc";

  @property({ type: String }) tier: string = "baa";
  @property({ type: Number }) n = 20;
  @property({ type: Number }) tokIn = 2000;
  @property({ type: Number }) tokOut = 800;
  @property({ type: Boolean }) ptOverhead = true;
  @property({ type: Boolean, state: true }) copied = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.tier = readUrlParam(CostCalculator.PREFIX, "tier", "baa") as string;
    this.n = readUrlParam(CostCalculator.PREFIX, "n", 20) as number;
    this.tokIn = readUrlParam(CostCalculator.PREFIX, "in", 2000) as number;
    this.tokOut = readUrlParam(CostCalculator.PREFIX, "out", 800) as number;
    this.ptOverhead = readUrlParam(CostCalculator.PREFIX, "pt", true) as boolean;
  }

  private setTier = (v: string) => {
    this.tier = v;
    writeUrlParam(CostCalculator.PREFIX, "tier", v);
  };

  private setN = (v: number) => {
    this.n = Math.max(1, v);
    writeUrlParam(CostCalculator.PREFIX, "n", this.n);
  };

  private setTokIn = (v: number) => {
    this.tokIn = Math.max(100, v);
    writeUrlParam(CostCalculator.PREFIX, "in", this.tokIn);
  };

  private setTokOut = (v: number) => {
    this.tokOut = Math.max(50, v);
    writeUrlParam(CostCalculator.PREFIX, "out", this.tokOut);
  };

  private setPtOverhead = (v: boolean) => {
    this.ptOverhead = v;
    writeUrlParam(CostCalculator.PREFIX, "pt", v);
  };

  private applyPreset = (p: (typeof PRESETS)[number]) => {
    this.setN(p.consultsPerDay);
    this.setTokIn(p.tokensIn);
    this.setTokOut(p.tokensOut);
  };

  private shareLink = async () => {
    try {
      await navigator.clipboard.writeText(buildShareURL("privacidade"));
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    } catch {
      /* ignored */
    }
  };

  protected render() {
    const tier = TIERS.find((t) => t.id === this.tier) ?? TIERS[0];
    const adjustedIn = this.ptOverhead ? Math.round(this.tokIn * 1.3) : this.tokIn;
    const adjustedOut = this.ptOverhead
      ? Math.round(this.tokOut * 1.3)
      : this.tokOut;
    const result = calcCost(tier, this.n, adjustedIn, adjustedOut, 22);
    const allTierResults = TIERS.map((t) => ({
      tier: t,
      result: calcCost(t, this.n, adjustedIn, adjustedOut, 22),
    })).sort((a, b) => a.result.monthlyCostEUR - b.result.monthlyCostEUR);

    return html`
      <div>
        <p class="mb-4 text-sm leading-relaxed text-slate-600">
          Estimativa de custo mensal e anual de IA na tua prática.
          <strong>22 dias úteis</strong> por mês. Preços API são aproximados a
          2026-Q2; verifica fornecedor antes de adoptar.
        </p>

        <div class="mb-3 flex flex-wrap gap-2">
          <span class="text-xs text-slate-500">presets:</span>
          ${PRESETS.map(
            (p) => html`<button
              type="button"
              @click=${() => this.applyPreset(p)}
              class="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50"
            >
              ${p.label}
            </button>`,
          )}
        </div>

        <div class="grid gap-3 sm:grid-cols-3">
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >consultas/dia</label
            >
            <input
              type="number"
              aria-label="consultas por dia"
              min="1"
              max="500"
              .value=${String(this.n)}
              @input=${(e: Event) =>
                this.setN(parseInt((e.target as HTMLInputElement).value) || 1)}
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >tokens IN/consulta</label
            >
            <input
              type="number"
              aria-label="tokens de entrada por consulta"
              min="100"
              max="20000"
              step="100"
              .value=${String(this.tokIn)}
              @input=${(e: Event) =>
                this.setTokIn(
                  parseInt((e.target as HTMLInputElement).value) || 100,
                )}
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div class="mt-1 text-[10px] text-slate-500">
              nota clínica + prompt
            </div>
          </div>
          <div>
            <label
              class="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500"
              >tokens OUT/consulta</label
            >
            <input
              type="number"
              aria-label="tokens de saída por consulta"
              min="50"
              max="10000"
              step="50"
              .value=${String(this.tokOut)}
              @input=${(e: Event) =>
                this.setTokOut(
                  parseInt((e.target as HTMLInputElement).value) || 50,
                )}
              class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <div class="mt-1 text-[10px] text-slate-500">
              resumo + sugestões
            </div>
          </div>
        </div>

        <label class="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            aria-label="aplicar penalização de tokens pt-PT"
            .checked=${this.ptOverhead}
            @change=${(e: Event) =>
              this.setPtOverhead((e.target as HTMLInputElement).checked)}
            class="h-4 w-4 accent-blue-600"
          />
          <span class="text-slate-700">
            pt-PT · +30% tokens (penalização do BPE em português)
          </span>
        </label>

        <div class="mt-5">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            escolhe tier
          </div>
          <div class="grid gap-2 sm:grid-cols-2">
            ${TIERS.map(
              (t) => html`<button
                type="button"
                @click=${() => this.setTier(t.id)}
                class="${this.tier === t.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-slate-300"} rounded-lg border-2 p-3 text-left transition"
              >
                <div class="flex items-baseline justify-between">
                  <span class="text-sm font-bold text-slate-900"
                    >${t.name}</span
                  >
                  <span
                    class="${t.baa
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"} rounded-full px-2 py-0.5 text-[10px] font-bold"
                    >${t.baa ? "PHI OK" : "sem BAA"}</span
                  >
                </div>
                <div class="mt-1 text-xs text-slate-500">${t.notes}</div>
              </button>`,
            )}
          </div>
        </div>

        <div class="mt-5 rounded-lg border-2 border-blue-300 bg-blue-50 p-5">
          <div
            class="mb-1 text-xs font-bold uppercase tracking-wider text-blue-700"
          >
            ${tier.name}
          </div>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <div class="text-xs text-slate-500">mensal</div>
              <div class="font-mono text-3xl font-bold text-blue-700">
                €${Math.round(result.monthlyCostEUR).toLocaleString("pt-PT")}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500">anual</div>
              <div class="font-mono text-3xl font-bold text-blue-700">
                €${Math.round(result.annualCostEUR).toLocaleString("pt-PT")}
              </div>
            </div>
            <div>
              <div class="text-xs text-slate-500">tokens/mês</div>
              <div class="font-mono text-base font-bold text-slate-700">
                ${((this.n * 22 * (adjustedIn + adjustedOut)) / 1e6).toFixed(1)}M
              </div>
            </div>
          </div>
          ${this.ptOverhead
            ? html`<p class="mt-3 text-xs text-amber-700">
                ⚠ Overhead pt-PT activo: estás a pagar ~30% mais que a versão
                inglesa. Em on-prem ou modelo local é zero.
              </p>`
            : ""}
        </div>

        <div class="mt-5">
          <div class="mb-2 flex items-baseline justify-between">
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              comparação de tiers · este perfil
            </div>
            <button
              type="button"
              @click=${this.shareLink}
              class="rounded border border-blue-300 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
              title="partilhar este cenário"
            >
              ${this.copied ? "✓ copiado" : "🔗 partilhar"}
            </button>
          </div>
          <div class="space-y-1">
            ${allTierResults.map(
              ({ tier: t, result: r }) => html`<div
                class="${t.id === this.tier
                  ? "bg-blue-100"
                  : "bg-slate-50"} flex items-center gap-3 rounded p-2 text-xs"
              >
                <span class="w-56 truncate text-slate-800">${t.name}</span>
                <span
                  class="${t.baa
                    ? "bg-green-200 text-green-800"
                    : "bg-red-200 text-red-800"} rounded px-1.5 py-0.5 text-[10px] font-bold"
                  >${t.baa ? "BAA" : "no PHI"}</span
                >
                <span class="ml-auto font-mono font-bold text-slate-700"
                  >€${Math.round(r.monthlyCostEUR).toLocaleString(
                    "pt-PT",
                  )}/mês</span
                >
              </div>`,
            )}
          </div>
        </div>

        <p class="mt-4 text-xs italic text-slate-500">
          Estimativas. API: preços publicados aproximados (input 15 USD/M out
          60 USD/M para frontier, 3/15 para mid-tier). On-prem inclui infra
          (€100-200/mês) + amortização do hardware. Não inclui custo humano
          de prompt-engineering, validação clínica, monitorização contínua.
        </p>
      </div>
    `;
  }
}

customElements.define("cost-calculator", CostCalculator);
