/**
 * Cosmic Review — la scène « L'Équipe ».
 *
 * Deux choses : rejouer le tracé à la craie à chaque arrivée, et ouvrir la
 * fiche d'une personne au clic.
 *
 * Les textes des fiches ne sont pas dupliqués dans un JSON : ils sont dans
 * la page, dans un bloc réservé aux lecteurs d'écran (`.team-bios`). Le
 * dialogue va les y chercher. Une seule source, et le contenu reste lisible
 * même si ce script ne tourne jamais.
 */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initTeam() {
  const scene = document.querySelector(".scene--equipe");
  const modal = document.getElementById("cm-modal");
  if (!scene || !modal) return { draw() {}, close() {} };

  const card = modal.querySelector(".cm-modal-card");
  const faceEl = document.getElementById("cm-modal-face");
  const nameEl = document.getElementById("cm-modal-name");
  const roleEl = document.getElementById("cm-modal-role");
  const bioEl = document.getElementById("cm-modal-bio");
  const viewport = scene.querySelector(".chalk-viewport");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  let opener = null;
  let closing = 0;

  /* ---------------------------------------------------- le tracé à la craie */

  /**
   * Relance l'animation de tracé. Retirer puis remettre la classe ne suffit
   * pas : sans lecture forcée du layout entre les deux, le navigateur
   * fusionne les deux changements et l'animation ne repart pas.
   */
  function draw() {
    scene.classList.remove("is-drawing");
    if (reduce.matches) return;
    void scene.offsetWidth;
    scene.classList.add("is-drawing");
  }

  /* -------------------------------------------------------------- la fiche */

  function open(button) {
    const id = button.dataset.member;
    const bio = document.getElementById("bio-" + id);
    if (!bio) return;

    const face = button.querySelector(".cm-face");
    if (face) {
      faceEl.src = face.currentSrc || face.src;
      faceEl.alt = "";
    }
    nameEl.textContent = bio.querySelector(".bio-name").textContent;
    roleEl.textContent = bio.querySelector(".bio-role").textContent;
    bioEl.textContent = bio.querySelector(".bio-text").textContent;
    // la fiche emprunte la couleur de craie de la personne
    card.style.setProperty("--c", getComputedStyle(button).getPropertyValue("--c"));

    opener = button;
    window.clearTimeout(closing);
    modal.hidden = false;
    document.body.classList.add("is-modal-open");
    // un cadre plein écran a besoin d'un tick pour que la transition parte
    requestAnimationFrame(() => modal.classList.add("is-open"));

    const close = modal.querySelector(".cm-modal-close");
    if (close) close.focus({ preventScroll: true });
  }

  function close() {
    if (modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.classList.remove("is-modal-open");

    const back = opener;
    opener = null;
    closing = window.setTimeout(() => { modal.hidden = true; },
                                reduce.matches ? 20 : 340);
    if (back && back.isConnected) back.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------- écoutes */

  scene.addEventListener("click", (event) => {
    const button = event.target.closest(".cm");
    if (button) open(button);
  });

  modal.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;

    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }

    // Le focus reste dans la fiche tant qu'elle est ouverte.
    if (event.key === "Tab") {
      const items = [...card.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  /* --------------------------------------------------- arrivée sur la scène */

  /** Sur petit écran la rangée déborde : on arrive au milieu du désert. */
  function centre() {
    if (!viewport) return;
    const extra = viewport.scrollWidth - viewport.clientWidth;
    if (extra > 0) viewport.scrollLeft = extra / 2;
  }

  return {
    enter() {
      draw();
      centre();
    },
    close,
  };
}
