/**
 * <pii-detector> · Privacidade · regex detector de identificadores em nota
 * clínica + score de reidentificação.
 *
 * Heurístico: nomes, NIF/SNS (números 9-12 dígitos), idade, morada, datas.
 * Anonimiza com placeholders.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface Item {
  type: "name" | "date" | "id" | "address" | "age";
  text: string;
  start: number;
  end: number;
  risk: "high" | "medium";
}

const SEED_PT =
  "Maria Joaquina dos Santos, 64 anos, NIF 213456789, n.º SNS 988765432, residente na Rua das Flores 24, Porto. Internada a 15/03/2026 por dor torácica e dispneia. Antecedentes: HTA, DM2 mal controlada (HbA1c 9,1 %), ex-fumadora 30 maços-ano. Alta a 22/03/2026 após cateterismo electivo, sob dupla antiagregação.";

const COMMON_LOCS = new Set([
  "Portugal", "Espanha", "França", "Brasil", "Lisboa", "Porto", "Sintra",
  "Cascais", "Coimbra", "Braga", "Aveiro", "Faro", "Évora", "Rua", "Avenida",
  "Praceta", "Travessa", "Largo", "Cardiologia", "Pneumologia", "Internamento",
  "HTA", "DM",
]);

function detectPII(text: string): Item[] {
  const items: Item[] = [];

  const dateRe =
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b|(\d{1,2}\s+de\s+(Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro)\s+de\s+\d{4})/gi;
  let m: RegExpExecArray | null;
  while ((m = dateRe.exec(text)) !== null) {
    items.push({
      type: "date",
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      risk: "high",
    });
  }

  const idRe = /\b\d{9,12}\b/g;
  while ((m = idRe.exec(text)) !== null) {
    items.push({
      type: "id",
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      risk: "high",
    });
  }

  const ageRe = /\b\d{1,3}\s+(anos?|years?\s+old|years?)\b/gi;
  while ((m = ageRe.exec(text)) !== null) {
    items.push({
      type: "age",
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      risk: "medium",
    });
  }

  const addrRe =
    /\b(Rua|Avenida|Av\.|Travessa|Praceta|Largo|\d+\s+Rua|\d+\s+Avenida)\s+[A-ZÀ-Úa-zà-ú\s\d,]+?(?=[\.,]|$)/g;
  while ((m = addrRe.exec(text)) !== null) {
    items.push({
      type: "address",
      text: m[0].trim(),
      start: m.index,
      end: m.index + m[0].length,
      risk: "high",
    });
  }

  const nameRe =
    /\b[A-ZÀ-Ú][a-zà-ú]+(?:\s+(?:dos|das|do|da|de)\s+[A-ZÀ-Ú][a-zà-ú]+|\s+[A-ZÀ-Ú][a-zà-ú]+)+\b/g;
  while ((m = nameRe.exec(text)) !== null) {
    const words = m[0].split(/\s+/);
    if (words.every((w) => COMMON_LOCS.has(w))) continue;
    items.push({
      type: "name",
      text: m[0],
      start: m.index,
      end: m.index + m[0].length,
      risk: "high",
    });
  }

  return items
    .sort((a, b) => a.start - b.start)
    .filter((item, i, arr) => {
      const overlap = arr.findIndex(
        (other, j) =>
          j < i && other.start <= item.start && other.end > item.start,
      );
      return overlap === -1;
    });
}

function computeRisk(items: Item[]): {
  score: number;
  label: string;
  color: string;
} {
  const types = new Set(items.map((i) => i.type));
  let score = 0;
  if (types.has("name")) score += 30;
  if (types.has("id")) score += 30;
  if (types.has("address")) score += 20;
  if (types.has("date")) score += 10;
  if (types.has("age")) score += 10;
  score = Math.min(score, 100);

  if (score >= 70)
    return { score, label: "ALTO · reidentificável", color: "red" };
  if (score >= 40)
    return {
      score,
      label: "MÉDIO · reidentificável em combinação",
      color: "amber",
    };
  if (score > 0) return { score, label: "BAIXO", color: "yellow" };
  return { score: 0, label: "SEM IDENTIFICADORES", color: "green" };
}

const COLORS: Record<string, { bg: string; text: string }> = {
  name: { bg: "bg-red-100 border-red-300", text: "text-red-800" },
  id: { bg: "bg-purple-100 border-purple-300", text: "text-purple-800" },
  address: { bg: "bg-orange-100 border-orange-300", text: "text-orange-800" },
  date: { bg: "bg-blue-100 border-blue-300", text: "text-blue-800" },
  age: { bg: "bg-yellow-100 border-yellow-300", text: "text-yellow-800" },
};

const LABELS: Record<string, string> = {
  name: "nome",
  id: "NIF/SNS",
  address: "morada",
  date: "data",
  age: "idade",
};

const PLACEHOLDERS: Record<string, string> = {
  name: "[NOME]",
  id: "[ID]",
  address: "[MORADA]",
  date: "[DATA]",
  age: "[GRUPO ETÁRIO]",
};

export class PIIDetector extends IaElement {
  @property({ type: String, state: true }) text = SEED_PT;

  private setText = (e: Event) => {
    this.text = (e.target as HTMLTextAreaElement).value;
  };

  private anonymize = () => {
    const items = detectPII(this.text);
    let result = this.text;
    const sorted = [...items].sort((a, b) => b.start - a.start);
    for (const it of sorted) {
      result =
        result.substring(0, it.start) +
        PLACEHOLDERS[it.type] +
        result.substring(it.end);
    }
    this.text = result;
  };

  private reset = () => {
    this.text = SEED_PT;
  };

  protected render() {
    const items = detectPII(this.text);
    const risk = computeRisk(items);

    const parts: ReturnType<typeof html>[] = [];
    let last = 0;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.start > last) parts.push(html`${this.text.substring(last, it.start)}`);
      const c = COLORS[it.type];
      parts.push(
        html`<mark class="${c.bg} ${c.text} rounded border px-1">${it.text}</mark>`,
      );
      last = it.end;
    }
    if (last < this.text.length) parts.push(html`${this.text.substring(last)}`);

    const counts = {
      name: items.filter((i) => i.type === "name").length,
      id: items.filter((i) => i.type === "id").length,
      address: items.filter((i) => i.type === "address").length,
      date: items.filter((i) => i.type === "date").length,
      age: items.filter((i) => i.type === "age").length,
    };

    const riskColorClass =
      risk.color === "red"
        ? "border-red-500 bg-red-50 text-red-900"
        : risk.color === "amber"
          ? "border-amber-500 bg-amber-50 text-amber-900"
          : risk.color === "yellow"
            ? "border-yellow-500 bg-yellow-50 text-yellow-900"
            : "border-green-500 bg-green-50 text-green-900";
    const barColor =
      risk.color === "red"
        ? "bg-red-500"
        : risk.color === "amber"
          ? "bg-amber-500"
          : risk.color === "yellow"
            ? "bg-yellow-500"
            : "bg-green-500";

    return html`
      <div>
        <textarea
          aria-label="texto a analisar para dados identificáveis"
          class="w-full rounded-md border border-slate-300 p-3 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows="5"
          .value=${this.text}
          @input=${this.setText}
        ></textarea>

        <div class="mt-4">
          <div
            class="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500"
          >
            texto marcado
          </div>
          <div
            class="rounded-lg border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-800"
          >
            ${items.length === 0 ? this.text : parts}
          </div>
        </div>

        <div class="${riskColorClass} mt-4 rounded-lg border-l-4 p-4">
          <div
            class="text-xs font-bold uppercase tracking-wider opacity-80"
          >
            risco de reidentificação
          </div>
          <div class="mt-1 flex items-baseline justify-between">
            <span class="text-lg font-bold">${risk.label}</span>
            <span class="font-mono text-2xl font-bold">${risk.score}</span>
          </div>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div
              class="${barColor} h-full transition-all"
              style="width:${risk.score}%"
            ></div>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          ${(Object.keys(LABELS) as Array<keyof typeof LABELS>).map(
            (t) => html`<div
              class="${COLORS[t].bg} rounded-lg border p-2 text-center"
            >
              <div class="${COLORS[t].text} text-xs">${LABELS[t]}</div>
              <div class="${COLORS[t].text} text-xl font-bold">
                ${counts[t as keyof typeof counts]}
              </div>
            </div>`,
          )}
        </div>

        <div class="mt-4 flex gap-2">
          <button
            type="button"
            @click=${this.anonymize}
            ?disabled=${items.length === 0}
            class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Anonimizar
          </button>
          <button
            type="button"
            @click=${this.reset}
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Repor original
          </button>
        </div>

        <p class="mt-4 text-xs italic text-slate-500">
          Detector heurístico para fins pedagógicos. Em produção, usa um
          pipeline validado (ferramentas de de-identificação reconhecidas
          pela CNPD). Anonimizar a sério é reavaliar se a combinação restante
          ainda reidentifica.
        </p>
      </div>
    `;
  }
}

customElements.define("pii-detector", PIIDetector);
