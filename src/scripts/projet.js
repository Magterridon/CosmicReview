/**
 * Cosmic Review — la scène « Le Projet ».
 *
 * Trois choses : écrire les répliques dans le bandeau comme une transcription
 * de rush, tenir le compte des éléments déjà visités, et jouer la bascule —
 * le moment où la scène se rejoue sept mois plus tard, sans Arthur.
 *
 * Les textes ne sont pas dupliqués ici : ils vivent dans la page, dans un
 * bloc réservé aux lecteurs d'écran (`.pj-source`). Le bandeau va les y
 * chercher. Une seule source, et la page reste lisible sans JavaScript.
 */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initProjet() {
  const scene = document.querySelector(".scene--projet");
  if (!scene) return { enter() {}, leave() {} };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const viewport = scene.querySelector(".pj-viewport");
  const lineEl = scene.querySelector(".pj-line");
  const creditEl = scene.querySelector(".pj-credit");
  const cueEl = scene.querySelector("[data-hint]");
  const cueWrap = scene.querySelector(".pj-cue");
  const liveEl = scene.querySelector("#pj-live");
  const countEl = scene.querySelector("[data-count]");
  const endBtn = scene.querySelector("[data-end]");
  const rewindBtn = scene.querySelector("[data-rewind]");
  const infoBtn = scene.querySelector("[data-info]");
  const panel = scene.querySelector(".pj-panel");
  const panelCard = panel && panel.querySelector(".pj-panel-card");
  const buttons = [...scene.querySelectorAll(".pj-el")];
  const total = buttons.length;

  const HINTS = JSON.parse(scene.dataset.hints || "null") || {
    avant: cueEl ? cueEl.textContent : "",
    apres: "",
  };

  const seen = new Set();
  let current = null;
  let token = 0;      // annule proprement une réplique en cours
  let step = null;    // avancer d'une ligne, ou terminer celle en cours
  let ticker = 0;
  let active = false;
  let panelOpener = null;

  /* ------------------------------------------------------- le compte-rendu */

  /** Les répliques de `id` pour l'état courant, telles qu'elles sont dans la page. */
  function script(id) {
    const src = document.getElementById("pj-src-" + id);
    if (!src) return null;
    const block = src.querySelector(`[data-state="${scene.dataset.state}"]`);
    if (!block) return null;
    return {
      lines: [...block.querySelectorAll(".pj-say")].map((p) => p.textContent.trim()),
      credit: (block.querySelector(".pj-cred") || {}).textContent || "",
    };
  }

  const wait = (ms, my) =>
    new Promise((resolve) => {
      const t = window.setTimeout(resolve, ms);
      step = () => { window.clearTimeout(t); if (my === token) resolve(); };
    });

  /** Écrit un texte caractère par caractère ; un clic termine la ligne. */
  function type(text, my) {
    return new Promise((resolve) => {
      if (reduce.matches) { lineEl.textContent = text; resolve(); return; }
      let i = 0;
      lineEl.textContent = "";
      lineEl.classList.add("is-typing");

      const tick = () => {
        if (my !== token) return;
        i += 1;
        lineEl.textContent = text.slice(0, i);
        if (i >= text.length) { lineEl.classList.remove("is-typing"); step = null; resolve(); return; }
        // une virgule ou un point laisse le temps de respirer
        const c = text[i - 1];
        const pause = c === "." || c === "?" || c === "!" ? 260 : c === "," || c === ";" ? 130 : 18;
        timer = window.setTimeout(tick, pause);
      };

      let timer = window.setTimeout(tick, 90);
      step = () => {
        window.clearTimeout(timer);
        lineEl.textContent = text;
        lineEl.classList.remove("is-typing");
        step = null;
        resolve();
      };
    });
  }

  /** Joue la réplique complète d'un élément. */
  async function say(id) {
    const data = script(id);
    if (!data) return;
    const my = ++token;

    creditEl.classList.remove("is-on");
    if (cueWrap) cueWrap.classList.add("is-off");
    if (liveEl) liveEl.textContent = data.lines.join(" ") + " — " + data.credit;

    for (let i = 0; i < data.lines.length; i++) {
      await type(data.lines[i], my);
      if (my !== token) return;
      if (i < data.lines.length - 1) {
        await wait(reduce.matches ? 900 : 1500, my);
        if (my !== token) return;
      }
    }

    creditEl.textContent = data.credit;
    creditEl.classList.add("is-on");
    step = null;

    // Dernier élément de l'état « avant » : la nuit bascule d'elle-même.
    if (scene.dataset.state === "avant" && seen.size >= total) {
      await wait(reduce.matches ? 600 : 2200, my);
      if (my === token && scene.dataset.state === "avant") shift("apres");
    }
  }

  /* ----------------------------------------------------------- la sélection */

  function select(button) {
    const id = button.dataset.el;
    if (current === button && step) { step(); return; }  // relancer = accélérer

    buttons.forEach((b) => b.classList.toggle("is-on", b === button));
    current = button;

    if (!seen.has(id)) {
      seen.add(id);
      button.classList.add("is-seen");
      updateCount();
    }
    say(id);
  }

  function updateCount() {
    if (countEl) countEl.textContent = seen.size + "/" + total;
    if (endBtn) endBtn.hidden = !(scene.dataset.state === "avant" && seen.size >= 3 && seen.size < total);
  }

  /* ------------------------------------------------------------ la bascule */

  function shift(to) {
    token += 1;
    step = null;
    scene.classList.add("is-shifting");

    const half = reduce.matches ? 60 : 640;
    window.setTimeout(() => {
      scene.dataset.state = to;
      setSlate(to);
      seen.clear();
      buttons.forEach((b) => b.classList.remove("is-seen", "is-on"));
      current = null;
      lineEl.textContent = "";
      lineEl.classList.remove("is-typing");
      creditEl.classList.remove("is-on");
      if (cueEl) cueEl.textContent = HINTS[to];
      if (cueWrap) cueWrap.classList.remove("is-off");
      if (liveEl) liveEl.textContent = to === "apres"
        ? "Sept mois plus tard. La scène a changé : Arthur n'est plus là."
        : "Retour au vlog 50.";
      if (rewindBtn) rewindBtn.hidden = to !== "apres";
      updateCount();
    }, half);

    window.setTimeout(() => scene.classList.remove("is-shifting"), reduce.matches ? 120 : 2150);
  }

  /* ------------------------------------------------------- l'ardoise / le TC */

  const slate = {};
  scene.querySelectorAll("[data-slate]").forEach((el) => { slate[el.dataset.slate] = el; });
  const SLATE = JSON.parse(scene.dataset.slate || "null") || null;
  let seconds = 0;

  function parseTc(tc) {
    const [h, m, s] = String(tc).split(":").map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }

  const pad = (v) => String(v).padStart(2, "0");

  function setSlate(state) {
    if (!SLATE || !SLATE[state]) return;
    seconds = parseTc(SLATE[state].tc);
    if (slate.vlog) slate.vlog.textContent = SLATE[state].vlog;
    if (slate.date) slate.date.textContent = SLATE[state].date;
    paintTc();
  }

  function paintTc() {
    if (!slate.tc) return;
    slate.tc.textContent =
      pad(Math.floor(seconds / 3600)) + ":" + pad(Math.floor(seconds / 60) % 60) + ":" + pad(seconds % 60);
  }

  /* --------------------------------------------------- le film en trois lignes */

  function openPanel() {
    if (!panel) return;
    panelOpener = document.activeElement;
    panel.hidden = false;
    document.body.classList.add("is-modal-open");
    infoBtn.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => panel.classList.add("is-open"));
    const close = panel.querySelector(".pj-panel-close");
    if (close) close.focus({ preventScroll: true });
  }

  function closePanel() {
    if (!panel || panel.hidden) return;
    panel.classList.remove("is-open");
    document.body.classList.remove("is-modal-open");
    infoBtn.setAttribute("aria-expanded", "false");
    window.setTimeout(() => { panel.hidden = true; }, reduce.matches ? 20 : 320);
    if (panelOpener && panelOpener.isConnected) panelOpener.focus({ preventScroll: true });
    panelOpener = null;
  }

  /* ---------------------------------------------------------------- écoutes */

  scene.addEventListener("click", (event) => {
    if (event.target.closest(".pj-panel")) {
      if (event.target.closest("[data-close]")) closePanel();
      else if (event.target.closest("[data-goto]")) closePanel();
      else if (event.target === panel) closePanel();
      return;
    }

    const el = event.target.closest(".pj-el");
    if (el) { select(el); return; }

    if (event.target.closest("[data-end]")) { shift("apres"); return; }
    if (event.target.closest("[data-rewind]")) { shift("avant"); return; }
    if (event.target.closest("[data-info]")) { openPanel(); return; }

    // Ailleurs dans le bandeau : on presse la réplique en cours.
    if (event.target.closest(".pj-transcript") && step) step();
  });

  document.addEventListener("keydown", (event) => {
    if (!panel || panel.hidden) return;
    if (event.key === "Escape") { event.preventDefault(); closePanel(); return; }
    if (event.key !== "Tab" || !panelCard) return;

    const items = [...panelCard.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null || el === document.activeElement
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  /* ------------------------------------------------- arrivée sur la scène */

  /** Sur petit écran la scène déborde : on arrive au milieu du désert. */
  function centre() {
    if (!viewport) return;
    const extra = viewport.scrollWidth - viewport.clientWidth;
    if (extra > 0) viewport.scrollLeft = extra * 0.5;
  }

  setSlate(scene.dataset.state || "avant");
  updateCount();

  return {
    enter() {
      active = true;
      centre();
      window.clearInterval(ticker);
      ticker = window.setInterval(() => { if (active) { seconds += 1; paintTc(); } }, 1000);
    },
    leave() {
      // On quitte la scène : la réplique en cours se termine d'un coup
      // plutôt que de continuer à s'écrire dans le vide.
      if (step) step();
      active = false;
      window.clearInterval(ticker);
      ticker = 0;
      closePanel();
    },
  };
}
