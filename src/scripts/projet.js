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

import { initCarnet } from "./carnet.js";
import { initGemeaux } from "./gemeaux.js";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * `audio` : la régie sonore de `audio.js`, prêtée par `main.js`. Absente (par
 * exemple si le module a échoué à charger), elle est remplacée par un objet
 * muet : rien dans cette scène ne doit dépendre du son pour fonctionner.
 */
export function initProjet(audio) {
  const scene = document.querySelector(".scene--projet");
  if (!scene) return { enter() {}, leave() {} };

  const snd = audio || { playLoop() {}, stopLoops() {}, playFx() {} };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const viewport = scene.querySelector(".pj-viewport");
  const lineEl = scene.querySelector(".pj-line");
  const creditEl = scene.querySelector(".pj-credit");
  const cueEl = scene.querySelector("[data-hint]");
  const cueWrap = scene.querySelector(".pj-cue");
  const liveEl = scene.querySelector("#pj-live");
  const countEl = scene.querySelector("[data-count]");
  const infoBtn = scene.querySelector("[data-info]");
  const carnetBtn = scene.querySelector(".pj-actions [data-consulter]");
  const panel = scene.querySelector(".pj-panel");
  const panelCard = panel && panel.querySelector(".pj-panel-card");
  const sets = {
    cour: [...scene.querySelectorAll(".pj-elements--cour .pj-el")],
    desert: [...scene.querySelectorAll(".pj-elements--desert .pj-el")],
  };
  const buttons = [...sets.cour, ...sets.desert];
  const current_set = () => sets[scene.dataset.state] || sets.cour;
  const total = () => current_set().length;

  const HINTS = JSON.parse(scene.dataset.hints || "null") || {
    cour: cueEl ? cueEl.textContent : "",
    desert: "",
  };

  const seen = new Set();
  let current = null;
  let token = 0;      // annule proprement une réplique en cours
  let step = null;    // avancer d'une ligne, ou terminer celle en cours
  let ticker = 0;
  let active = false;
  let panelOpener = null;
  // Un calque ouvert (le carnet, la cassette) retient le fondu automatique :
  // il ne doit pas se déclencher pendant qu'on lit une page.
  let eggOpen = 0;
  let pendingStrike = false;
  let melting = false;

  /* ------------------------------------------------------- le compte-rendu */

  /** Les répliques de `id` pour l'état courant, telles qu'elles sont dans la page. */
  function script(id) {
    const src = document.getElementById("pj-src-" + id);
    if (!src) return null;
    return {
      lines: [...src.querySelectorAll(".pj-say")].map((p) => p.textContent.trim()),
      credit: (src.querySelector(".pj-cred") || {}).textContent || "",
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
    return sayLines(data.lines, data.credit);
  }

  /**
   * Écrit une réplique dans le bandeau. Les objets du décor y passent par
   * `say()` ; les secrets (le carnet, les Gémeaux) apportent leurs propres
   * lignes, qui ne vivent pas dans `.pj-source`.
   */
  async function sayLines(lines, credit) {
    const data = { lines, credit: credit || "" };
    const my = ++token;

    creditEl.classList.remove("is-on");
    if (cueWrap) cueWrap.classList.add("is-off");
    if (liveEl) liveEl.textContent = data.lines.join(" ") + (data.credit ? " — " + data.credit : "");

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

    // Avoir tout visité ne fait plus rien passer : le seul chemin vers le
    // désert est la cassette, étiquetée du bon numéro. Quand les six ont
    // parlé, l'amorce le dit — sans dire comment.
    if (scene.dataset.state === "cour" && seen.size >= total() && HINTS.complet) {
      await wait(reduce.matches ? 400 : 1400, my);
      if (my === token && scene.dataset.state === "cour") setAmorce(HINTS.complet);
    }
  }

  /* ----------------------------------------------------------- la sélection */

  function select(button) {
    const id = button.dataset.el;

    // Second clic sur un objet déjà visité : il s'ouvre. Le carnet montre ses
    // cinquante et une pages, la caméra sort sa cassette. Le premier clic,
    // lui, garde son rôle — la réplique s'écrit dans le bandeau.
    if (seen.has(id) && (egg.ouvrir(id) || gem.ouvrir(id))) {
      if (step) step();
      majCarnet();
      return;
    }

    if (current === button && step) { step(); return; }  // relancer = accélérer

    // Le moteur de la jeep se fait entendre à chaque fois qu'on la touche —
    // « ici, on laisse toujours le moteur tourner. »
    if (id === "jeep") snd.playFx("car-start");

    current_set().forEach((b) => b.classList.toggle("is-on", b === button));
    current = button;

    if (!seen.has(id)) {
      seen.add(id);
      button.classList.add("is-seen");
      if (id === "carnet" || id === "camera" || id === "axel-seul") {
        // Rien ne le dit à l'écran — mais le lecteur d'écran, lui, le dit.
        button.dataset.egg = "1";
        const nom = button.querySelector(".sr-only");
        if (nom) nom.textContent = nom.textContent.replace(" — afficher sa réplique", " — l'ouvrir");
      }
      updateCount();
    }
    say(id);
  }

  function updateCount() {
    if (countEl) countEl.textContent = seen.size + "/" + total();
  }

  /* ------------------------------------------------------------ la bascule */

  /**
   * Le fondu. Il n'y a pas de coupe : la cour s'efface trait par trait,
   * l'image blanchit jusqu'au laiteux, le monde est échangé pendant qu'on n'y
   * voit rien, puis le désert émerge — délavé, et il le restera.
   *
   * Rien ne ramène en arrière : recharger la page est le seul moyen de revoir
   * le vlog 50.
   */
  function strike() {
    if (melting || scene.dataset.state !== "cour") return;
    // Un calque est ouvert : le fondu attend qu'on ait refermé.
    if (eggOpen > 0) { pendingStrike = true; return; }
    melting = true;
    token += 1;
    step = null;
    scene.classList.remove("is-drawing");
    scene.classList.add("is-melting");

    // L'éclair part avec le fondu. Le moteur, lui, ne se déclenche plus ici :
    // c'est maintenant un clic sur la jeep, dans le désert, qui le fait
    // entendre (voir `select()`).
    snd.playFx("lightning");

    // au plus épais du lavis, quand l'image est laiteuse, on échange tout
    const swap = reduce.matches ? 700 : 3600;
    window.setTimeout(() => {
      scene.dataset.state = "desert";
      setSlate("desert");
      snd.playLoop("desert");
      seen.clear();
      buttons.forEach((b) => b.classList.remove("is-seen", "is-on"));
      current = null;
      lineEl.textContent = "";
      lineEl.classList.remove("is-typing");
      creditEl.classList.remove("is-on");
      if (cueEl) cueEl.textContent = HINTS.desert;
      // l'amorce ne revient qu'une fois le désert installé
      window.setTimeout(() => {
        if (cueWrap && scene.dataset.state === "desert") cueWrap.classList.remove("is-off");
      }, reduce.matches ? 300 : 4200);
      if (liveEl) {
        liveEl.textContent =
          "La scène a changé. Le désert du Nevada, la nuit. Il ne reste qu'une personne, une jeep et un panneau.";
      }
      updateCount();
      centre();
    }, swap);

    window.setTimeout(() => scene.classList.remove("is-melting"),
                      reduce.matches ? 2500 : 9300);
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
    if (slate.lieu) slate.lieu.textContent = SLATE[state].lieu;
    paintTc();
  }

  function paintTc() {
    if (!slate.tc) return;
    slate.tc.textContent =
      pad(Math.floor(seconds / 3600)) + ":" + pad(Math.floor(seconds / 60) % 60) + ":" + pad(seconds % 60);
  }

  /** L'amorce sous le bandeau : ce qu'on suggère de faire, sans le dire. */
  function setAmorce(texte) {
    if (!cueEl) return;
    cueEl.textContent = texte;
    if (cueWrap) cueWrap.classList.remove("is-off");
  }

  /* ------------------------------------------------- le carnet, la cassette

   Deux calques qui vivent dans `carnet.js`. Ils empruntent le fondu à la
   scène (la cassette le déclenche) et lui rendent la politesse : tant qu'un
   calque est ouvert, le fondu automatique attend. */

  function eggBusy(open) {
    eggOpen = Math.max(0, eggOpen + (open ? 1 : -1));
    if (eggOpen === 0 && pendingStrike) {
      pendingStrike = false;
      window.setTimeout(strike, reduce.matches ? 60 : 500);
    }
  }

  const egg = initCarnet(scene, { strike: () => strike(), busy: eggBusy, audio: snd });

  /**
   * Le carnet reste consultable. Le bouton apparaît dès qu'on l'a ouvert une
   * fois — et de toute façon dès que l'énigme commence : ses réponses sont
   * dedans, personne ne doit rester bloqué faute de l'avoir trouvé plus tôt.
   */
  function majCarnet(force) {
    if (!carnetBtn) return;
    if (force || egg.vu()) carnetBtn.hidden = false;
  }

  const gem = initGemeaux(scene, {
    dire: (lignes, credit) => sayLines(lignes, credit),
    busy: eggBusy,
    amorce: setAmorce,
    carnet: (retour) => egg.consulter(retour),
    montrerCarnet: () => majCarnet(true),
    audio: snd,
  });

  /* --------------------------------------------------- le film en trois lignes */

  function openPanel() {
    if (!panel) return;
    panelOpener = document.activeElement;
    panel.hidden = false;
    document.body.classList.add("is-modal-open");
    infoBtn.setAttribute("aria-expanded", "true");
    // Un cadre plein écran a besoin d'un tick pour que la transition parte.
    // `requestAnimationFrame` ne tourne pas dans un onglet en arrière-plan :
    // le minuteur de secours garantit que le panneau finit par s'ouvrir.
    const reveal = () => panel.classList.add("is-open");
    requestAnimationFrame(reveal);
    window.setTimeout(reveal, 40);
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
    // Le carnet et la cassette gèrent leurs propres clics : la scène ne doit
    // surtout pas les interpréter comme un clic sur un objet du décor.
    if (event.target.closest(".cn, .cs, .cn-bank, .gx, .lb, .fin, .gx-twin, .gx-boite")) return;

    if (event.target.closest(".pj-panel")) {
      if (event.target.closest("[data-close]")) closePanel();
      else if (event.target.closest("[data-goto]")) closePanel();
      else if (event.target === panel) closePanel();
      return;
    }

    const el = event.target.closest(".pj-el");
    if (el) { select(el); return; }

    if (event.target.closest(".pj-actions [data-consulter]")) { egg.consulter(); return; }
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

  /* ---------------------------------------------- la place que prend le bandeau

   Le cadre doit tenir dans ce qui reste au-dessus du bandeau. La hauteur du
   bandeau dépend de son contenu et de la largeur de l'écran : on la mesure
   plutôt que de la deviner, et le CSS s'en sert pour dimensionner le cadre.
   Sans JavaScript, la valeur par défaut du CSS prend le relais. */

  const bar = scene.querySelector(".pj-transcript");

  function measureBar() {
    if (!bar) return;
    const h = Math.round(bar.getBoundingClientRect().height);
    if (h > 0) scene.style.setProperty("--pj-bar", h + "px");
  }

  if (bar && "ResizeObserver" in window) {
    new ResizeObserver(measureBar).observe(bar);
  } else {
    window.addEventListener("resize", measureBar);
  }
  measureBar();

  /* ----------------------------------------------------------- le tracé

   Le monde dessiné se trace à l'arrivée, objet après objet. Retirer puis
   remettre la classe ne suffit pas : sans lecture forcée du layout entre les
   deux, le navigateur fusionne les deux changements et l'animation ne repart
   pas. */

  let drawing = 0;

  function draw() {
    if (reduce.matches || scene.dataset.state !== "cour") return;
    scene.classList.remove("is-drawing");
    void scene.offsetWidth;
    scene.classList.add("is-drawing");
    window.clearTimeout(drawing);
    drawing = window.setTimeout(() => scene.classList.remove("is-drawing"), 5200);
  }

  /* ------------------------------------------------- arrivée sur la scène */

  /**
   * Sur petit écran seulement, la scène déborde et se parcourt au doigt : on
   * arrive alors au milieu du désert. Ailleurs le cadre tient tout entier, et
   * y toucher décalerait l'image — c'est ce que faisait la première version.
   */
  const pan = window.matchMedia("(max-width: 860px)");

  function centre() {
    if (!viewport || !pan.matches) return;
    const extra = viewport.scrollWidth - viewport.clientWidth;
    if (extra > 0) viewport.scrollLeft = extra * 0.5;
  }

  setSlate(scene.dataset.state || "cour");
  updateCount();

  return {
    enter() {
      active = true;
      measureBar();
      centre();
      draw();
      // L'ambiance de la cour reprend à chaque arrivée sur la scène ; si l'on
      // revient après la bascule, c'est celle du désert qui doit jouer.
      snd.playLoop(scene.dataset.state === "desert" ? "desert" : "cour");
      window.clearInterval(ticker);
      ticker = window.setInterval(() => { if (active) { seconds += 1; paintTc(); } }, 1000);
    },
    leave() {
      // On quitte la scène : la réplique en cours se termine d'un coup
      // plutôt que de continuer à s'écrire dans le vide.
      if (step) step();
      active = false;
      window.clearTimeout(drawing);
      scene.classList.remove("is-drawing");
      window.clearInterval(ticker);
      ticker = 0;
      snd.stopLoops();
      closePanel();
      egg.fermer();
      gem.fermer();
    },
  };
}
