/**
 * Cosmic Review — passage d'une scène à l'autre, sans jamais recharger.
 *
 * Les quatre scènes sont déjà dans le document. Naviguer consiste à déplacer
 * l'attribut `data-active` de l'une à l'autre : le CSS fait le reste (fondu
 * et mouvement de caméra), et l'History API garde l'URL, le titre et le
 * bouton Précédent en phase.
 *
 * Les liens conservent leur `href` : si ce script ne tourne pas, ils
 * redeviennent de simples liens et le site fonctionne page par page.
 */

import { SCENES, TITLES, LABELS, sceneFromPath } from "../lib/routes.js";

const FLARE = 200; // temps laissé à l'étoile pour s'embraser avant le départ

export function initRouter(hooks = {}) {
  const body = document.body;
  const scenes = new Map();
  document.querySelectorAll(".scene[data-scene]").forEach((el) => {
    scenes.set(el.dataset.scene, el);
    const heading = el.querySelector("h1");
    if (heading) heading.tabIndex = -1;
  });

  const live = document.getElementById("scene-live");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let current = sceneFromPath(location.pathname);
  if (!scenes.has(current)) current = "ciel";

  /** Applique une scène. `initial` : au chargement, on ne vole pas le focus. */
  function apply(id, { initial = false } = {}) {
    const next = scenes.get(id);
    if (!next) return;

    scenes.forEach((el, key) => {
      if (key === id) el.setAttribute("data-active", "");
      else el.removeAttribute("data-active");
    });

    body.dataset.scene = id;
    document.title = TITLES[id] || document.title;
    current = id;

    // Une scène qu'on quitte repart du haut la prochaine fois.
    scenes.forEach((el, key) => {
      if (key !== id && el.scrollTop) el.scrollTop = 0;
    });

    if (hooks.onEnter) hooks.onEnter(id, { initial });

    if (!initial) {
      if (live) live.textContent = LABELS[id] || id;
      // On attend la fin du fondu : déplacer le focus pendant que la scène
      // est encore invisible ferait sauter la page chez certains lecteurs.
      const heading = next.querySelector("h1");
      if (heading) {
        window.setTimeout(() => {
          if (current === id) heading.focus({ preventScroll: true });
        }, reduce.matches ? 40 : 480);
      }
    }
  }

  /** Change de scène et écrit l'URL correspondante. */
  function go(id, { push = true } = {}) {
    if (id === current || !scenes.has(id)) return;
    if (push) history.pushState({ scene: id }, "", SCENES[id]);
    apply(id);
  }

  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const trigger = event.target.closest("[data-goto]");
    if (!trigger) return;
    if (trigger.target && trigger.target !== "_self") return;

    const id = trigger.dataset.goto;
    if (!scenes.has(id) || id === current) {
      if (id === current) event.preventDefault();
      return;
    }

    event.preventDefault();

    // Depuis le ciel, l'étoile s'embrase le temps d'un souffle avant qu'on
    // ne parte : le départ se lit, au lieu d'être un simple fondu.
    if (trigger.classList.contains("star") && !reduce.matches) {
      trigger.classList.add("is-launching");
      window.setTimeout(() => {
        trigger.classList.remove("is-launching");
        go(id);
      }, FLARE);
      return;
    }

    go(id);
  }

  function onPop() {
    apply(sceneFromPath(location.pathname));
  }

  document.addEventListener("click", onClick);
  window.addEventListener("popstate", onPop);

  history.replaceState({ scene: current }, "", location.pathname + location.search);
  apply(current, { initial: true });

  return { go, get current() { return current; } };
}
