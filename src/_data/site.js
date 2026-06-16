export default {
  name: "IA · Saúde",
  fullName: "IA na Saúde — Inteligência Artificial para Profissionais de Saúde",
  description:
    "Curso aberto sobre IA e LLMs em saúde para profissionais portugueses. 14 secções, 36 demos interactivos, ~80 min.",
  lang: "pt-PT",
  base: process.env.BASE ?? "/ia-na-saude/",
  origin: process.env.SITE ?? "https://tiagojct.github.io",
  get url() {
    return this.origin + this.base.replace(/\/$/, "");
  },
  courseYear: 2026,
  author: {
    name: "Tiago Jacinto",
    url: "https://tiagojct.eu",
  },
  // Estimated total reading time (minutes) · derived from sections meta.
  totalTimeMin: 80,
};
