/**
 * Cosmic Review — le carnet d'Arthur et la cassette.
 *
 * Deux calques posés sur la scène « Le Projet ». Ils s'ouvrent au *second*
 * clic sur un objet déjà visité : le premier clic garde son rôle — la
 * réplique s'écrit dans le bandeau — et le suivant ouvre l'objet. Les six
 * éléments de la cour continuent donc de se comporter comme avant pour qui
 * ne cherche rien.
 *
 * Le carnet écrit ses pages à partir de `src/data/carnet.json`, embarqué dans
 * la page. Le tremblé de chaque ligne vient d'une graine fixe : une page est
 * exactement la même à chaque ouverture, et pourtant aucune ligne n'est
 * droite.
 *
 * La cassette n'a qu'une chose à faire : accepter un mot sur son étiquette.
 * Le bon numéro déclenche le fondu vers le désert, à n'importe quel moment.
 */

import { rng } from "../lib/draw.js";

/** Ce qu'il faut écrire sur l'étiquette. Le 51ᵉ vlog, celui qui reste. */
const CODE = "51";

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * `strike` : le fondu vers le désert, prêté par `projet.js`.
 * `busy`   : prévient la scène qu'un calque est ouvert — elle retient alors
 *            son fondu automatique plutôt que de le jouer dans notre dos.
 */
export function initCarnet(scene, { strike, busy } = {}) {
  const vide = { ouvrir() { return false; }, fermer() {}, ouvert: () => false };
  if (!scene) return vide;

  const source = scene.querySelector("#cn-data");
  const cn = scene.querySelector(".cn");
  const cs = scene.querySelector(".cs");
  if (!cn || !cs || !source) return vide;

  let PAGES = [];
  try {
    PAGES = JSON.parse(source.textContent).pages || [];
  } catch (err) {
    return vide;
  }
  if (!PAGES.length) return vide;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const book = cn.querySelector(".cn-book");
  const gauche = cn.querySelector('[data-leaf="gauche"]');
  const droite = cn.querySelector('[data-leaf="droite"]');
  const sketch = cn.querySelector("[data-sketch]");
  const bank = scene.querySelector(".cn-bank");
  const tabs = [...cn.querySelectorAll(".cn-tab")];
  const numEl = cn.querySelector("[data-num]");
  const prevBtn = cn.querySelector("[data-prev]");
  const nextBtn = cn.querySelector("[data-next]");
  const input = cs.querySelector(".cs-input");
  const help = cs.querySelector(".cs-help");

  const ETIQUETTE = { vlog: "Vidéo", obs: "Relevé", note: "Note" };

  let page = 0;
  let opened = null;       // le calque ouvert, ou null
  let opener = null;       // à qui rendre le focus en refermant
  let armed = false;

  /* --------------------------------------------------------- l'écriture */

  /** Une ligne manuscrite, penchée juste ce qu'il faut. */
  function ligne(texte, r) {
    const el = document.createElement("span");
    el.className = "cn-line";
    el.textContent = texte;
    el.style.setProperty("--r", ((r() * 2 - 1) * 0.85).toFixed(2) + "deg");
    el.style.setProperty("--x", ((r() * 2 - 1) * 0.5).toFixed(2) + "%");
    el.style.setProperty("--y", ((r() * 2 - 1) * 1.6).toFixed(1) + "px");
    return el;
  }

  /** Un bloc de lignes : chacune sur la sienne, chacune de travers. */
  function bloc(cls, lignes, r) {
    const box = document.createElement("p");
    box.className = cls;
    lignes.filter(Boolean).forEach((t, i) => {
      if (i) box.appendChild(document.createElement("br"));
      box.appendChild(ligne(t, r));
    });
    return box;
  }

  /** Pose une page sur les deux feuillets. */
  function ecrire(i) {
    const pg = PAGES[i];
    if (!pg) return;
    // Une graine par page : le tremblé est le même à chaque ouverture.
    const r = rng(9000 + pg.n * 37);

    gauche.textContent = "";
    droite.textContent = "";
    droite.classList.toggle("cn-leaf--autre", pg.main === "autre");
    gauche.classList.toggle("cn-leaf--autre", pg.main === "autre");
    book.dataset.raye = pg.raye ? "oui" : "non";

    if (pg.date) gauche.appendChild(bloc("cn-date", [pg.date], r));
    if (pg.lieu) gauche.appendChild(bloc("cn-lieu", [pg.lieu], r));
    if (pg.meta && pg.meta.length) gauche.appendChild(bloc("cn-meta", pg.meta, r));

    const type = document.createElement("p");
    type.className = "cn-type";
    type.textContent = ETIQUETTE[pg.type] || "";
    droite.appendChild(type);

    if (pg.titre) droite.appendChild(bloc("cn-title", [pg.titre], r));
    if (pg.notes && pg.notes.length) droite.appendChild(bloc("cn-notes", pg.notes, r));
    if (pg.indice) droite.appendChild(bloc("cn-indice", [pg.indice], r));
    droite.appendChild(bloc("cn-page", [String(pg.n)], r));

    // Le croquis vient de la banque dessinée au build : on le clone, on ne
    // le redessine pas — sinon il changerait à chaque page tournée.
    sketch.textContent = "";
    if (pg.croquis && bank) {
      const src = bank.querySelector('[data-croquis="' + pg.croquis + '"]');
      if (src) sketch.appendChild(src.cloneNode(true));
    }
  }

  /* ------------------------------------------------------ la navigation */

  function aller(i, { focusTab = false } = {}) {
    page = Math.max(0, Math.min(PAGES.length - 1, i));
    ecrire(page);
    if (numEl) numEl.textContent = String(PAGES[page].n);
    tabs.forEach((t, k) => {
      if (k === page) t.setAttribute("aria-current", "true");
      else t.removeAttribute("aria-current");
    });
    if (prevBtn) prevBtn.disabled = page === 0;
    if (nextBtn) nextBtn.disabled = page === PAGES.length - 1;
    if (focusTab && tabs[page]) tabs[page].focus({ preventScroll: true });
    dire(cn, "Page " + PAGES[page].n + " sur " + PAGES.length);
  }

  function dire(calque, texte) {
    const live = calque.querySelector("[data-live]");
    if (live) live.textContent = texte;
  }

  /* ------------------------------------------------------- ouverture    */

  function ouvrirCalque(calque) {
    if (opened) fermer();
    opener = document.activeElement;
    opened = calque;
    calque.hidden = false;
    document.body.classList.add("is-modal-open");
    if (busy) busy(true);

    // Le dessin se trace à l'ouverture, comme les objets de la scène.
    if (!reduce.matches) {
      calque.classList.remove("is-drawing");
      void calque.offsetWidth;
      calque.classList.add("is-drawing");
      window.setTimeout(() => calque.classList.remove("is-drawing"), 3200);
    }

    // Un cadre plein écran a besoin d'un tick pour que la transition parte ;
    // `requestAnimationFrame` ne tourne pas dans un onglet en arrière-plan,
    // d'où le minuteur de secours.
    const reveal = () => calque.classList.add("is-open");
    requestAnimationFrame(reveal);
    window.setTimeout(reveal, 40);

    const cible = calque === cs && input ? input : calque.querySelector("[data-close]");
    if (cible) cible.focus({ preventScroll: true });
  }

  function fermer() {
    if (!opened) return;
    const calque = opened;
    opened = null;
    calque.classList.remove("is-open", "is-drawing");
    document.body.classList.remove("is-modal-open");
    window.setTimeout(() => { calque.hidden = true; }, reduce.matches ? 20 : 420);
    if (opener && opener.isConnected) opener.focus({ preventScroll: true });
    opener = null;
    if (busy) busy(false);
  }

  /** Le carnet s'ouvre là où on l'avait laissé. */
  function ouvrirCarnet() {
    ecrire(page);
    aller(page);
    ouvrirCalque(cn);
    return true;
  }

  function ouvrirCassette() {
    ouvrirCalque(cs);
    return true;
  }

  /* -------------------------------------------------------- l'étiquette */

  /**
   * Le bon numéro. La cassette se met en route, le calque s'efface, et le
   * fondu part — même si l'on n'a rien cliqué d'autre dans la cour.
   */
  function armer() {
    if (armed) return;
    armed = true;
    cs.classList.add("is-armed");
    if (help) help.textContent = "Vlog 51 — enregistrement";
    dire(cs, "La cassette porte enfin un numéro. L'enregistrement commence.");
    if (input) input.blur();
    window.setTimeout(() => {
      fermer();
      window.setTimeout(() => { if (strike) strike(); }, reduce.matches ? 40 : 420);
    }, reduce.matches ? 300 : 1400);
  }

  if (input) {
    input.addEventListener("input", () => {
      if (armed) return;
      const v = input.value.trim();
      if (help) help.textContent = v ? "" : "L'étiquette est vierge.";
      if (v === CODE) armer();
    });
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (input.value.trim() === CODE) armer();
      }
    });
  }

  /* ------------------------------------------------------------ écoutes */

  [cn, cs].forEach((calque) => {
    calque.addEventListener("click", (event) => {
      if (event.target.closest("[data-close]")) { fermer(); return; }
      const tab = event.target.closest(".cn-tab");
      if (tab) { aller(Number(tab.dataset.page)); return; }
      if (event.target.closest("[data-prev]")) { aller(page - 1); return; }
      if (event.target.closest("[data-next]")) { aller(page + 1); return; }
      // Le fond, hors du carnet et hors de la barre : on referme.
      if (event.target === calque) fermer();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (!opened) return;

    if (event.key === "Escape") { event.preventDefault(); fermer(); return; }

    if (opened === cn) {
      // Si l'on parcourt la tranche au clavier, le focus suit la page ; sinon
      // il reste où il est. (`event.target` peut être le document lui-même,
      // qui n'a pas de `closest` — d'où le passage par l'élément actif.)
      const actif = document.activeElement;
      const surTranche = !!(actif && actif.closest && actif.closest(".cn-edge"));
      if (event.key === "ArrowLeft" || event.key === "PageUp") {
        event.preventDefault(); aller(page - 1, { focusTab: surTranche }); return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        event.preventDefault(); aller(page + 1, { focusTab: surTranche }); return;
      }
      if (event.key === "Home") { event.preventDefault(); aller(0); return; }
      if (event.key === "End") { event.preventDefault(); aller(PAGES.length - 1); return; }
    }

    if (event.key !== "Tab") return;
    const cadre = opened.querySelector(".cn-frame, .cs-frame");
    if (!cadre) return;
    const items = [...cadre.querySelectorAll(FOCUSABLE)].filter(
      (el) => !el.disabled && (el.offsetParent !== null || el === document.activeElement)
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });

  aller(0);

  return {
    /** Ce que la scène appelle au second clic sur un objet. */
    ouvrir(id) {
      if (id === "carnet") return ouvrirCarnet();
      if (id === "camera") return ouvrirCassette();
      return false;
    },
    fermer,
    ouvert: () => opened !== null,
  };
}
