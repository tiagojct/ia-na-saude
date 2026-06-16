/* IA · Saúde · chrome
 *
 * Single bundle of all site-chrome interactivity. Feature-detects each
 * subsystem so missing DOM elements don't crash the whole script.
 *
 * Subsystems (in order):
 *   1. Theme toggle + auto detection
 *   2. Font scale toggle
 *   3. Reading-progress bar
 *   4. Visited tracking + completion gate
 *   5. Reading + projection mode toggles
 *   6. Slot toggle (?slot=30/60/90)
 *   7. Deep-start (?from=section)
 *   8. Click-to-expand skipped sections
 *   9. Notes toggle (?notes=1)
 *  10. TOC drawer + focus trap
 *  11. Cmd-K palette
 *  12. Keyboard shortcuts (j/k/g/t/m/p/?)
 *  13. Section share (copy link)
 *  14. Print
 *  15. Service worker registration
 */

(() => {
  "use strict";

  const ls = {
    visited: "ia-saude-visited",
    completedAt: "ia-saude-completed-at",
    theme: "ia-saude-theme",
    fontscale: "ia-saude-fontscale",
  };

  // ============================================================
  // 1. Theme
  // ============================================================
  function applyTheme(value) {
    if (value === "auto") {
      localStorage.removeItem(ls.theme);
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      document.documentElement.setAttribute("data-theme", value);
      localStorage.setItem(ls.theme, value);
    }
    document.querySelectorAll(".theme-btn").forEach((b) => {
      const v = b.dataset.theme;
      const active = (v === "auto" && !localStorage.getItem(ls.theme)) || v === value;
      b.classList.toggle("bg-blue-100", active);
      b.classList.toggle("border-blue-400", active);
      b.classList.toggle("text-blue-700", active);
    });
  }
  document.querySelectorAll(".theme-btn").forEach((b) => {
    b.addEventListener("click", () => applyTheme(b.dataset.theme));
  });
  // Sync from system change when user picks auto
  matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => {
    if (!localStorage.getItem(ls.theme)) applyTheme("auto");
  });

  // ============================================================
  // 2. Font scale
  // ============================================================
  function applyFont(value) {
    if (value === "lg" || value === "xl") {
      document.documentElement.setAttribute("data-fontscale", value);
      localStorage.setItem(ls.fontscale, value);
    } else {
      document.documentElement.removeAttribute("data-fontscale");
      localStorage.removeItem(ls.fontscale);
    }
    document.querySelectorAll(".font-btn").forEach((b) => {
      const active = (b.dataset.fontscale ?? "") === (value ?? "");
      b.classList.toggle("bg-blue-100", active);
      b.classList.toggle("border-blue-400", active);
      b.classList.toggle("text-blue-700", active);
    });
  }
  document.querySelectorAll(".font-btn").forEach((b) => {
    b.addEventListener("click", () => applyFont(b.dataset.fontscale ?? ""));
  });

  // ============================================================
  // 3. Reading progress bar
  // ============================================================
  const progress = document.getElementById("read-progress");
  if (progress) {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h > 0 ? (window.scrollY / h) * 100 : 0;
      progress.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ============================================================
  // 4. Visited tracking + completion gate
  // ============================================================
  const SECTIONS = Array.from(document.querySelectorAll("[data-section]")).map(
    (el) => el.id,
  );
  const visited = new Set();
  try {
    JSON.parse(localStorage.getItem(ls.visited) || "[]").forEach((v) =>
      visited.add(v),
    );
  } catch {}
  function persistVisited() {
    try {
      localStorage.setItem(ls.visited, JSON.stringify([...visited]));
    } catch {}
  }
  function checkCompletion() {
    if (SECTIONS.length === 0) return;
    const allSeen = SECTIONS.every((id) => visited.has(id));
    if (allSeen) {
      try {
        if (!localStorage.getItem(ls.completedAt)) {
          localStorage.setItem(ls.completedAt, new Date().toISOString());
        }
      } catch {}
      document.body.classList.add("aula-completa");
    }
  }
  if ("IntersectionObserver" in window && SECTIONS.length > 0) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            visited.add(e.target.id);
            e.target.classList.add("visited");
            const toc = document.querySelector(`[data-toc] a[data-section="${e.target.id}"]`);
            if (toc) {
              document
                .querySelectorAll("[data-toc] a")
                .forEach((a) => a.classList.remove("active"));
              toc.classList.add("active", "visited");
              toc.setAttribute("aria-current", "true");
            }
          }
        }
        persistVisited();
        checkCompletion();
      },
      { threshold: 0.25 },
    );
    document.querySelectorAll("[data-section]").forEach((s) => io.observe(s));
  }
  window.addEventListener("storage", (e) => {
    if (e.key === ls.visited) {
      visited.clear();
      try {
        JSON.parse(e.newValue || "[]").forEach((v) => visited.add(v));
      } catch {}
      if (e.newValue === null) {
        document.body.classList.remove("aula-completa");
      }
      checkCompletion();
    } else if (e.key === ls.completedAt) {
      document.body.classList.toggle("aula-completa", !!e.newValue);
    }
  });
  window.addEventListener("iasaude:visited-cleared", () => {
    visited.clear();
    document.body.classList.remove("aula-completa");
    document
      .querySelectorAll("[data-section].visited")
      .forEach((el) => el.classList.remove("visited"));
  });
  checkCompletion();

  // ============================================================
  // 5. Reading + projection modes
  // ============================================================
  function syncModeBtn(id, cls) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const on = document.body.classList.contains(cls);
    btn.classList.toggle("bg-blue-100", on);
    btn.classList.toggle("border-blue-400", on);
    btn.classList.toggle("text-blue-700", on);
  }
  function syncReadingBtn() {
    syncModeBtn("reading-btn", "reading-mode");
  }
  function syncProjectionBtn() {
    syncModeBtn("projection-btn", "projection-mode");
  }
  function applyMode(name) {
    const url = new URL(window.location.href);
    if (name === "read") {
      document.body.classList.add("reading-mode");
      document.body.classList.remove("projection-mode");
      url.searchParams.set("mode", "read");
    } else if (name === "projection") {
      document.body.classList.add("projection-mode");
      document.body.classList.remove("reading-mode");
      url.searchParams.set("mode", "projection");
    } else {
      document.body.classList.remove("reading-mode");
      document.body.classList.remove("projection-mode");
      url.searchParams.delete("mode");
    }
    history.replaceState(null, "", url.toString());
    syncReadingBtn();
    syncProjectionBtn();
  }
  {
    const init = new URLSearchParams(window.location.search).get("mode");
    if (init === "read") applyMode("read");
    else if (init === "projection") applyMode("projection");
    else applyMode("");
  }
  document.getElementById("reading-btn")?.addEventListener("click", () => {
    applyMode(document.body.classList.contains("reading-mode") ? "" : "read");
  });
  document.getElementById("projection-btn")?.addEventListener("click", () => {
    applyMode(
      document.body.classList.contains("projection-mode") ? "" : "projection",
    );
  });

  // ============================================================
  // 6. Slot toggle (?slot=30/60/90)
  // ============================================================
  function applySlot(slot) {
    document.body.classList.remove("slot-30", "slot-60", "slot-90");
    if (slot === "30" || slot === "60" || slot === "90") {
      document.body.classList.add(`slot-${slot}`);
    }
    document.querySelectorAll(".slot-btn").forEach((b) => {
      const v = b.dataset.slot ?? "";
      const active = v === slot;
      b.classList.toggle("bg-blue-100", active);
      b.classList.toggle("border-blue-400", active);
      b.classList.toggle("text-blue-700", active);
    });
  }
  {
    const init = new URLSearchParams(window.location.search).get("slot") ?? "";
    applySlot(init);
  }
  document.querySelectorAll(".slot-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const v = b.dataset.slot ?? "";
      const url = new URL(window.location.href);
      if (v) url.searchParams.set("slot", v);
      else url.searchParams.delete("slot");
      history.replaceState(null, "", url.toString());
      applySlot(v);
    });
  });

  // ============================================================
  // 7. Deep-start (?from=)
  // ============================================================
  {
    const fromId = new URLSearchParams(window.location.search).get("from");
    if (fromId) {
      const all = document.querySelectorAll("[data-section]");
      let stop = false;
      for (const s of all) {
        if (s.id === fromId) {
          stop = true;
          continue;
        }
        if (!stop) s.classList.add("from-skipped");
      }
      if (stop) {
        const target = document.getElementById(fromId);
        setTimeout(() => target?.scrollIntoView({ behavior: "instant", block: "start" }), 0);
      }
    }
  }

  // ============================================================
  // 8. Click-to-expand skipped sections
  // ============================================================
  document.addEventListener("click", (e) => {
    const tgt = e.target;
    if (tgt.closest("a, button, input, textarea, select")) return;
    const sec = tgt.closest("[data-section]");
    if (!sec) return;
    const slotActive = ["30", "60", "90"].find((s) =>
      document.body.classList.contains(`slot-${s}`),
    );
    const slots = (sec.dataset.slots ?? "").split(/\s+/);
    const slotSkips = slotActive && !slots.includes(slotActive);
    const fromSkips = sec.classList.contains("from-skipped");
    if (slotSkips || fromSkips) sec.classList.toggle("slot-expanded");
  });

  // ============================================================
  // 9. Notes toggle (?notes=1)
  // ============================================================
  function applyNotes(on) {
    document.body.classList.toggle("show-notes", on);
    const btn = document.getElementById("notes-btn");
    if (btn) {
      btn.textContent = on ? "🗒 esconder notas" : "🗒 mostrar notas";
      btn.classList.toggle("bg-blue-100", on);
      btn.classList.toggle("border-blue-400", on);
      btn.classList.toggle("text-blue-700", on);
    }
  }
  {
    const init = new URLSearchParams(window.location.search).get("notes") === "1";
    applyNotes(init);
  }
  document.getElementById("notes-btn")?.addEventListener("click", () => {
    const next = !document.body.classList.contains("show-notes");
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("notes", "1");
    else url.searchParams.delete("notes");
    history.replaceState(null, "", url.toString());
    applyNotes(next);
  });

  // ============================================================
  // 10. TOC drawer + focus trap
  // ============================================================
  const drawer = document.getElementById("toc-drawer");
  const tocToggle = document.getElementById("toc-toggle");
  let lastFocused = null;
  function openDrawer() {
    if (!drawer) return;
    lastFocused = document.activeElement;
    drawer.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
    const first = drawer.querySelector("a, button");
    if (first) first.focus();
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.add("hidden");
    drawer.setAttribute("aria-hidden", "true");
    lastFocused?.focus?.();
  }
  tocToggle?.addEventListener("click", openDrawer);
  drawer?.addEventListener("click", (e) => {
    if (e.target === drawer || e.target?.closest?.("[data-toc-close]")) closeDrawer();
  });
  drawer?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
    if (e.key === "Tab") {
      const f = drawer.querySelectorAll("a, button");
      if (f.length === 0) return;
      const first = f[0],
        last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  // ============================================================
  // 11. Cmd-K palette
  // ============================================================
  const palette = document.getElementById("cmdk-palette");
  const cmdkInput = document.getElementById("cmdk-input");
  const cmdkList = document.getElementById("cmdk-list");
  let paletteIndex = [];

  function buildPaletteIndex() {
    const items = [];
    document.querySelectorAll("[data-toc] a").forEach((a) => {
      items.push({
        href: a.getAttribute("href"),
        label: a.textContent.trim(),
        kind: "secção",
      });
    });
    document.querySelectorAll("[data-glossary-item]").forEach((el) => {
      items.push({
        href: "#" + el.id,
        label: el.dataset.label || el.textContent.trim(),
        kind: "glossário",
      });
    });
    document.querySelectorAll("[data-demo-label]").forEach((el) => {
      items.push({
        href: "#" + (el.closest("[data-section]")?.id ?? ""),
        label: el.dataset.demoLabel,
        kind: "demo",
      });
    });
    return items;
  }
  function renderPalette(query) {
    if (!cmdkList) return;
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? paletteIndex.slice(0, 12)
      : paletteIndex
          .filter((i) => i.label.toLowerCase().includes(q))
          .slice(0, 12);
    cmdkList.innerHTML = filtered
      .map(
        (i) =>
          `<a href="${i.href}" class="block px-3 py-2 text-sm hover:bg-slate-100"><span class="text-xs text-slate-500">${i.kind}</span> · ${i.label}</a>`,
      )
      .join("");
  }
  function openPalette() {
    if (!palette) return;
    paletteIndex = buildPaletteIndex();
    renderPalette("");
    palette.classList.remove("hidden");
    cmdkInput?.focus();
    cmdkInput && (cmdkInput.value = "");
  }
  function closePalette() {
    palette?.classList.add("hidden");
    cmdkInput?.classList.remove("ring-red-400");
  }
  cmdkInput?.addEventListener("input", (e) => renderPalette(e.target.value));
  cmdkInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePalette();
    if (e.key === "Enter") {
      const first = cmdkList?.querySelector("a");
      if (first) {
        e.preventDefault();
        window.location.href = first.getAttribute("href");
        closePalette();
      } else {
        cmdkInput.classList.add("ring-red-400");
        setTimeout(() => cmdkInput.classList.remove("ring-red-400"), 600);
      }
    }
  });
  palette?.addEventListener("click", (e) => {
    if (e.target === palette) closePalette();
  });

  // ============================================================
  // 12. Keyboard shortcuts
  // ============================================================
  function inField(e) {
    const t = e.target;
    return (
      t instanceof HTMLInputElement ||
      t instanceof HTMLTextAreaElement ||
      t instanceof HTMLSelectElement ||
      t?.isContentEditable
    );
  }
  function getActiveSectionIdx() {
    const ss = document.querySelectorAll("[data-section]");
    let active = 0;
    for (let i = 0; i < ss.length; i++) {
      const r = ss[i].getBoundingClientRect();
      if (r.top < window.innerHeight * 0.4) active = i;
    }
    return active;
  }
  function scrollToSection(idx) {
    const ss = document.querySelectorAll("[data-section]");
    if (idx < 0 || idx >= ss.length) return;
    ss[idx].scrollIntoView({ behavior: "smooth", block: "start" });
  }
  window.addEventListener("keydown", (e) => {
    if (inField(e)) return;
    if (e.metaKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openPalette();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "k") {
      e.preventDefault();
      openPalette();
      return;
    }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "?" || (e.shiftKey && e.key === "/")) {
      e.preventDefault();
      openPalette();
    } else if (e.key === "j") {
      e.preventDefault();
      scrollToSection(getActiveSectionIdx() + 1);
    } else if (e.key === "k") {
      e.preventDefault();
      scrollToSection(getActiveSectionIdx() - 1);
    } else if (e.key === "g") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (e.key === "G") {
      e.preventDefault();
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } else if (e.key === "t") {
      e.preventDefault();
      openDrawer();
    } else if (e.key === "m") {
      e.preventDefault();
      const maria = document.querySelector(".maria-ref");
      maria?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (e.key === "p") {
      e.preventDefault();
      applyMode(
        document.body.classList.contains("projection-mode") ? "" : "projection",
      );
    }
  });

  // ============================================================
  // 13. Section share (copy link)
  // ============================================================
  document.addEventListener("click", async (e) => {
    const btn = e.target?.closest?.(".section-share");
    if (!btn) return;
    e.preventDefault();
    const id = btn.dataset.sectionId;
    if (!id) return;
    const url = new URL(window.location.href);
    url.hash = id;
    const shareUrl = url.toString();
    const span = btn.querySelector("span");
    const original = span?.textContent ?? "copiar link";
    try {
      if (navigator.share && navigator.canShare?.({ url: shareUrl })) {
        await navigator.share({ url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }
      if (span) {
        span.textContent = "copiado ✓";
        btn.classList.add("text-green-600", "border-green-300");
        setTimeout(() => {
          span.textContent = original;
          btn.classList.remove("text-green-600", "border-green-300");
        }, 1800);
      }
    } catch {
      if (span) {
        span.textContent = "falhou";
        setTimeout(() => (span.textContent = original), 1800);
      }
    }
  });

  // ============================================================
  // 14. Print
  // ============================================================
  document.getElementById("print-btn")?.addEventListener("click", () => {
    window.print();
  });

  // ============================================================
  // 15. Service worker
  // ============================================================
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      const swPath = "/ia-na-saude/sw.js";
      navigator.serviceWorker
        .register(swPath, { scope: "/ia-na-saude/" })
        .catch((err) => console.warn("SW register failed:", err));
    });
  }
})();
