/**
 * <triage-simulator> · Agentes · 3 cenários clínicos com tool-calls,
 * decisões, porta humana e desfechos.
 */

import { IaElement, html } from "./_base";
import { property } from "lit/decorators.js";

interface ToolCall {
  call: string;
  response: string;
  warn?: boolean;
}

interface Decision {
  text: string;
  badge: "auto" | "review";
  gate?: { action: string; hint: string };
  outcome: Outcome;
}

interface Outcome {
  kind: "good" | "bad" | "borderline";
  title: string;
  body: string[];
}

interface Scenario {
  id: number;
  patient: string;
  message: string;
  time: string;
  context: string;
  observation: string;
  toolCalls: ToolCall[];
  think: string;
  decisions: Decision[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    patient: "Maria · utente #1234",
    message: "Acordei com falta de ar e dor no peito. Tenho 64 anos.",
    time: "07:42",
    context: "Doente conhecida: HTA, DM2, ex-fumadora 30 maços-ano.",
    observation: "Mensagem do portal · 07:42 · sintomas torácicos novos",
    toolCalls: [
      { call: "lerProcesso(id=1234)", response: `{ nome:"Maria", idade:64, antecedentes:["HTA","DM2","ex-fumadora 30AM"], alergias:[] }` },
      { call: "avaliarRisco(sintomas, idade, antecedentes)", response: `{ score:0.82, dx:["SCA","TEP","dissecção"], urgencia:"alta" }` },
    ],
    think:
      "Sintomas compatíveis com síndrome coronário agudo. Idade + antecedentes + dor torácica + dispneia elevam a probabilidade pré-teste. Não é razoável esperar.",
    decisions: [
      {
        text: 'Enviar mensagem urgente: "ligue 112 já"',
        badge: "review",
        gate: {
          action:
            'enviarMensagem(para: Maria #1234, texto: "Ligue 112 imediatamente. Sintomas exigem avaliação urgente.", prioridade: ALTA)',
          hint: "Esta mensagem chega à Maria. Verifica antes de aprovar.",
        },
        outcome: {
          kind: "good",
          title: "Boa decisão.",
          body: [
            "A Maria chamou o 112. Chegou ao SU em 18 min. ECG com supra de ST em V2-V4. Troponina elevada. Cateterismo realizado.",
            "A delegação funcionou porque a acção crítica (mensagem urgente) foi escalada a porta humana antes de sair.",
          ],
        },
      },
      {
        text: "Notificar médico de família e marcar SU em 24h",
        badge: "auto",
        outcome: {
          kind: "borderline",
          title: "Resposta abaixo da urgência.",
          body: [
            "Notificar MF e marcar SU 24h é prudente em casos limítrofes — não neste. Idade + antecedentes + dor torácica em curso elevam muito a probabilidade pré-teste de SCA.",
            "O agente deveria ter activado via verde. Atrasou-se o cuidado.",
          ],
        },
      },
      {
        text: "Pedir mais informação à Maria",
        badge: "auto",
        outcome: {
          kind: "borderline",
          title: "Pediste mais informação.",
          body: [
            "É razoável em alguns casos. Aqui, o quadro já é suficiente para activar — pedir mais info atrasa.",
            "Em medicina, o tempo de pensar tem valor — mas tem custo.",
          ],
        },
      },
    ],
  },
  {
    id: 2,
    patient: "Lurdes · utente #5821",
    message:
      "Tenho ardor a urinar há 2 dias. Posso começar antibiótico antes da consulta?",
    time: "14:18",
    context:
      "Lurdes, 71 anos. FA crónica anticoagulada com varfarina. INR alvo 2–3, INR última semana 2,3 (lábil nos últimos meses).",
    observation: "Mensagem do portal · 14:18 · suspeita de ITU não complicada",
    toolCalls: [
      { call: "lerProcesso(id=5821)", response: `{ idade:71, sexo:"F", antecedentes:["FA","HTA"], medicacao:["varfarina 5mg","bisoprolol 2,5mg"], INR_ult:2.3 }` },
      { call: 'consultarGuideline("ITU não complicada mulher >70")', response: `{ opcoes:["fosfomicina 3g dose única","nitrofurantoína 100mg 6/6h x 5d (se CrCl>30)","ciprofloxacina 500mg 12/12h x 3d"] }` },
      { call: 'verificarPosologia("ciprofloxacina 500", peso=68)', response: `{ dose_padrão:"500 mg 12/12h x 3 dias" }`, warn: true },
    ],
    think:
      "Tenho indicação clínica. Guideline lista 3 opções. Doses verificadas. Sem alergia documentada. Vou pela última opção da guideline — a mais conhecida.",
    decisions: [
      {
        text: "Recomendar ciprofloxacina 500 mg 12/12h x 3 dias",
        badge: "review",
        gate: {
          action:
            'enviarMensagem(para: utente #5821, texto: "Pode iniciar ciprofloxacina 500 mg 12/12h, 3 dias.")',
          hint: "⚠ A guideline lista 3 antibióticos. Olha para a medicação crónica antes de aprovar.",
        },
        outcome: {
          kind: "bad",
          title: "INR 5,8 ao 6.º dia · hemorragia gastrointestinal.",
          body: [
            "Ciprofloxacina inibe o CYP1A2 (e parcialmente o CYP3A4) e desloca varfarina da albumina. Em doentes anticoagulados, eleva o INR em ~50 % numa semana e o risco hemorrágico em 2-3×.",
            'O agente não correu verificarInteracoes(["varfarina", "ciprofloxacina"]). A guideline listou ciprofloxacina como opção sem filtrar pelo perfil da doente.',
            "A pista estava no log: medicação inclui varfarina, INR lábil. Fosfomicina dose única ou nitrofurantoína (se CrCl > 30) têm interacção mínima e eram as primeiras escolhas para esta doente.",
            "Lição: em quem está anticoagulado, a primeira pergunta do agente devia ser sobre interacções, não sobre dose.",
          ],
        },
      },
      {
        text: "Sugerir fosfomicina 3g dose única (ou nitrofurantoína se CrCl > 30)",
        badge: "auto",
        outcome: {
          kind: "good",
          title: "Decisão clínica robusta.",
          body: [
            "Ambas têm interacção clinicamente irrelevante com varfarina e cobertura adequada para ITU não complicada na mulher.",
            "Nitrofurantoína exige CrCl > 30 — confirma. Fosfomicina dose única simplifica adesão.",
            "Em geral: numa doente anticoagulada, escolher o antibiótico com menor interacção medicamentosa é o critério dominante, mesmo que o agente sugira outro.",
          ],
        },
      },
      {
        text: "Adiar antibiótico, pedir tira-teste de urina + consulta presencial",
        badge: "review",
        outcome: {
          kind: "borderline",
          title: "Defensável mas atrasa cuidado.",
          body: [
            "Confirmar piúria/nitritos é boa prática — reduz uso desnecessário de antibiótico. Mas em ITU não complicada com clínica típica em mulher idosa, atrasar 24-48h aumenta desconforto.",
            "Razoável se a tua instituição protocoliza diagnóstico antes de tratar. Não é a opção mais elegante quando a alternativa segura (fosfomicina) está à mão.",
          ],
        },
      },
    ],
  },
  {
    id: 3,
    patient: "Pedro · utente #7401",
    message: "Tive uma dor no peito quando subi escadas. Já passou.",
    time: "19:55",
    context:
      "Pedro, 45 anos, sem antecedentes pessoais. História familiar de morte súbita aos 50.",
    observation: "Mensagem do portal · 19:55 · dor torácica de esforço",
    toolCalls: [
      { call: "lerProcesso(id=7401)", response: `{ idade:45, antecedentes:[], hist_familiar:"morte súbita aos 50 (pai)" }` },
      { call: 'consultarGuideline("dor torácica esforço HF positiva")', response: `{ recomendação:"avaliação cardiológica em 1-2 semanas, ECG + prova de esforço" }` },
    ],
    think:
      "Dor torácica de esforço transitória em homem 45a com HF de morte súbita aos 50 exige investigação. Não é urgência — é marcação prioritária.",
    decisions: [
      {
        text: "Mandar ao SU agora",
        badge: "review",
        outcome: {
          kind: "borderline",
          title: "Encaminhamento ao SU.",
          body: [
            "Defensável, mas talvez excessivo: dor curta, em esforço, sem antecedentes pessoais — mesmo com HF positiva, probabilidade pré-teste de evento agudo é baixa.",
            "Em casos limítrofes, marcação prioritária em ambulatório é o equilíbrio certo.",
          ],
        },
      },
      {
        text: "Marcar consulta cardiologia em 7-10 dias + mensagem ao doente",
        badge: "review",
        gate: {
          action:
            'marcarConsulta(#7401, cardiologia, prioritária, 7-10d) + enviarMensagem("Marquei consulta em 7 dias. Se a dor voltar, ligue 112.")',
          hint: "Acção razoável para um caso limítrofe. Aprovas?",
        },
        outcome: {
          kind: "good",
          title: "Decisão proporcionada.",
          body: [
            "Marcação prioritária + mensagem ao doente é a resposta certa. O agente reconheceu que não é urgência aguda — mas pediu revisão porque mensagem ao doente afecta directamente comportamento.",
            "Os casos limítrofes são os mais difíceis: nem urgência clara nem caso simples.",
          ],
        },
      },
      {
        text: "Sugerir esperar e ver se repete",
        badge: "auto",
        outcome: {
          kind: "bad",
          title: "Esperar e ver — desaconselhado.",
          body: [
            'Em homem de 45 com HF de morte súbita e dor de esforço, "esperar e ver" não é estratégia activa: é omissão.',
            "A acção certa é investigar em ambulatório com prioridade.",
          ],
        },
      },
    ],
  },
];

type Phase = "observe" | "tools" | "think" | "decide" | "gate" | "done";

export class TriageSimulator extends IaElement {
  @property({ type: Number, state: true }) scenarioIdx: number | null = null;
  @property({ type: String, state: true }) phase: Phase = "observe";
  @property({ type: Number, state: true }) decisionIdx: number | null = null;
  @property({ type: String, state: true }) gateChoice:
    | "approve"
    | "reject"
    | null = null;

  private pickScenario = (i: number) => {
    this.scenarioIdx = i;
    this.phase = "observe";
    this.decisionIdx = null;
    this.gateChoice = null;
  };

  private back = () => {
    this.scenarioIdx = null;
  };

  protected render() {
    if (this.scenarioIdx === null) {
      return html`<div class="space-y-3">
        <p class="mb-2 text-sm text-slate-600">
          Escolhe um cenário. O agente observa, decide e age. Aprovar sem ler
          o log de ferramentas pode dar mau resultado.
        </p>
        ${SCENARIOS.map(
          (s, i) => html`<button
            type="button"
            @click=${() => this.pickScenario(i)}
            class="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
          >
            <div
              class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              ${s.time} · ${s.patient}
            </div>
            <div class="font-bold text-slate-900">“${s.message}”</div>
            <div class="mt-1 text-xs text-slate-500">${s.context}</div>
          </button>`,
        )}
      </div>`;
    }

    const sc = SCENARIOS[this.scenarioIdx];
    const decision =
      this.decisionIdx !== null ? sc.decisions[this.decisionIdx] : null;
    const showOutcome =
      this.phase === "done" ||
      (decision !== null && !decision.gate) ||
      (decision !== null && !!decision.gate && this.gateChoice !== null);

    return html`<div>
      <button
        type="button"
        @click=${this.back}
        class="mb-3 text-xs font-medium text-slate-500 hover:text-blue-600"
      >
        ← voltar à inbox
      </button>

      <div class="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div class="text-xs font-bold uppercase tracking-wider text-blue-700">
          ${sc.time} · ${sc.patient}
        </div>
        <div class="mt-1 text-sm font-bold text-slate-900">“${sc.message}”</div>
        <div class="mt-1 text-xs text-slate-600">${sc.context}</div>
      </div>

      <div
        class="mt-4 space-y-2 rounded-lg border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-slate-200"
      >
        <div class="text-amber-400">
          <span class="opacity-60">observa →</span> ${sc.observation}
        </div>

        ${["tools", "think", "decide", "gate", "done"].includes(this.phase)
          ? sc.toolCalls.map(
              (tc) => html`<div
                  class="${tc.warn ? "text-red-400" : "text-cyan-400"}"
                >
                  <span class="opacity-60">tool →</span> ${tc.call}
                  ${tc.warn
                    ? html`<span class="ml-1">⚠ sem id explícito</span>`
                    : ""}
                </div>
                <div class="pl-4 text-green-400">↳ ${tc.response}</div>`,
            )
          : ""}
        ${["think", "decide", "gate", "done"].includes(this.phase)
          ? html`<div class="text-blue-300">
              <span class="opacity-60">pensa →</span> ${sc.think}
            </div>`
          : ""}
        ${showOutcome && decision?.gate && this.gateChoice
          ? html`<div
              class="${this.gateChoice === "approve"
                ? "text-amber-300"
                : "text-slate-500"}"
            >
              <span class="opacity-60">porta humana →</span>
              ${this.gateChoice === "approve" ? "APROVADO" : "RECUSADO"}
            </div>`
          : ""}
      </div>

      ${this.phase === "observe"
        ? html`<button
            type="button"
            @click=${() => (this.phase = "tools")}
            class="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            ▶ Iniciar
          </button>`
        : ""}
      ${this.phase === "tools"
        ? html`<button
            type="button"
            @click=${() => (this.phase = "think")}
            class="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Próximo passo →
          </button>`
        : ""}
      ${this.phase === "think"
        ? html`<button
            type="button"
            @click=${() => (this.phase = "decide")}
            class="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Próximo passo →
          </button>`
        : ""}
      ${this.phase === "decide"
        ? html`<div class="mt-4 space-y-2">
            <div
              class="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              decide · escolhe uma acção
            </div>
            ${sc.decisions.map(
              (d, i) => html`<button
                type="button"
                @click=${() => {
                  this.decisionIdx = i;
                  this.phase = d.gate ? "gate" : "done";
                }}
                class="block w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-sm hover:border-blue-400"
              >
                <span
                  class="${d.badge === "auto"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"} mr-2 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                  >${d.badge === "auto" ? "autónoma" : "revisão"}</span
                >
                ${d.text}
              </button>`,
            )}
          </div>`
        : ""}
      ${this.phase === "gate" && decision?.gate
        ? html`<div
            class="mt-4 rounded-lg border-2 border-amber-400 bg-amber-50 p-4"
          >
            <div
              class="mb-2 text-xs font-bold uppercase tracking-wider text-amber-700"
            >
              porta humana
            </div>
            <pre
              class="mb-3 whitespace-pre-wrap rounded bg-white p-3 font-mono text-xs text-slate-800"
            >
${decision.gate.action}</pre
            >
            <p class="mb-3 text-sm text-slate-700">${decision.gate.hint}</p>
            <div class="flex gap-2">
              <button
                type="button"
                @click=${() => {
                  this.gateChoice = "approve";
                  this.phase = "done";
                }}
                class="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white hover:bg-green-700"
              >
                Aprovar
              </button>
              <button
                type="button"
                @click=${() => {
                  this.gateChoice = "reject";
                  this.phase = "done";
                }}
                class="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                Recusar
              </button>
            </div>
          </div>`
        : ""}
      ${showOutcome && decision
        ? html`<div
            class="${decision.outcome.kind === "good"
              ? "border-green-500 bg-green-50"
              : decision.outcome.kind === "bad"
                ? "border-red-500 bg-red-50"
                : "border-amber-500 bg-amber-50"} mt-4 rounded-lg border-l-4 p-4"
          >
            <div
              class="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              desfecho ·
              ${decision.outcome.kind === "good"
                ? "bom"
                : decision.outcome.kind === "bad"
                  ? "evitável"
                  : "razoável"}
            </div>
            <div class="mb-2 font-bold text-slate-900">
              ${decision.outcome.title}
            </div>
            ${decision.outcome.body.map(
              (b) =>
                html`<p class="mt-1 text-sm leading-relaxed text-slate-700">
                  ${b}
                </p>`,
            )}
            <button
              type="button"
              @click=${() => this.pickScenario(this.scenarioIdx!)}
              class="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              ↻ tentar outra decisão
            </button>
          </div>`
        : ""}
    </div>`;
  }
}

customElements.define("triage-simulator", TriageSimulator);
