/**
 * Cosmic Review — la scène « Les Partenaires ».
 *
 * Trois choses : jouer le saut en hyperespace quand on arrive, faire
 * apparaître « Cosmic Partenaires » à l'atterrissage, et ouvrir le dossier
 * d'un partenaire au clic.
 *
 * Les textes des dossiers ne sont pas dupliqués ici : ils sont dans la page,
 * dans un bloc réservé aux lecteurs d'écran (`.pa-source`). Le dossier va les
 * y chercher. Une seule source, et le contenu reste lisible sans JavaScript.
 */

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

const WARP = 1200;   // durée du saut, en ms
const ETOILES = 420; // traits lumineux pendant le saut

export function initPartenaires() {
  const scene = document.querySelector(".scene--partenaires");
  const dossier = document.getElementById("pa-dossier");
  if (!scene || !dossier) return { enter() {}, leave() {} };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const carte = dossier.querySelector(".pa-dossier-carte");
  const canvas = scene.querySelector("#pa-warp");
  const live = scene.querySelector("#pa-live");
  const champs = {};
  dossier.querySelectorAll("[data-d]").forEach((el) => { champs[el.dataset.d] = el; });

  let opener = null;
  let closing = 0;
  let raf = 0;
  let fermeture = 0;

  /* ------------------------------------------------------- l'hyperespace */

  /**
   * Le saut : des traits qui filent du centre vers les bords, de plus en
   * plus vite, puis qui ralentissent d'un coup — on arrive.
   *
   * Le canvas ne sert qu'à ça : il est masqué le reste du temps, et rien ne
   * tourne quand on n'est pas sur la scène.
   */
  function warp() {
    if (!canvas || reduce.matches) {
      scene.classList.add("is-landed");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) { scene.classList.add("is-landed"); return; }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = scene.clientWidth;
    const h = scene.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const rayon = Math.hypot(cx, cy);

    // Chaque étoile part d'un angle et d'une distance au centre.
    const etoiles = [];
    for (let i = 0; i < ETOILES; i++) {
      etoiles.push({
        a: Math.random() * Math.PI * 2,
        d: Math.random() * rayon * 0.55,
        v: 0.45 + Math.random() * 0.9,
        teinte: Math.random() < 0.18 ? "#f6e3b6" : "#dfe8f5",
      });
    }

    scene.classList.add("is-warping");
    canvas.style.opacity = "1";

    const t0 = performance.now();

    const frame = (now) => {
      const t = Math.min((now - t0) / WARP, 1);
      // Accélération franche puis freinage : le voyage se lit.
      const vitesse = t < 0.62
        ? Math.pow(t / 0.62, 2.1)
        : 1 - Math.pow((t - 0.62) / 0.38, 1.6);

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const e of etoiles) {
        e.d += e.v * (2 + vitesse * 46);
        if (e.d > rayon * 1.15) { e.d = Math.random() * 40; }

        const cos = Math.cos(e.a);
        const sin = Math.sin(e.a);
        // La traînée s'allonge avec la vitesse : c'est ça, l'effet.
        const trainee = 4 + vitesse * 130 * e.v;
        const d2 = Math.max(e.d - trainee, 0);

        const prox = Math.min(e.d / rayon, 1);
        ctx.strokeStyle = e.teinte;
        ctx.globalAlpha = Math.min(0.15 + prox * 0.85, 1) * (0.25 + vitesse * 0.75);
        ctx.lineWidth = 0.6 + prox * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + cos * e.d, cy + sin * e.d);
        ctx.lineTo(cx + cos * d2, cy + sin * d2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (t < 1) { raf = requestAnimationFrame(frame); return; }

      // Arrivée : le canvas s'efface, la galaxie et le titre prennent la main.
      raf = 0;
      canvas.style.opacity = "0";
      ctx.clearRect(0, 0, w, h);
      scene.classList.remove("is-warping");
      scene.classList.add("is-landed");
    };

    raf = requestAnimationFrame(frame);
  }

  function stopWarp() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    if (canvas) {
      canvas.style.opacity = "0";
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    scene.classList.remove("is-warping");
  }

  /* ------------------------------------------------------------ le dossier */

  const texte = (el, sel) => {
    const n = el.querySelector(sel);
    return n ? n.textContent.trim() : "";
  };

  function open(button) {
    const id = button.dataset.partner;
    const src = document.getElementById("pa-src-" + id);
    if (!src) return;

    const nom = texte(src, ".pa-nom");
    const demo = src.dataset.placeholder === "1";

    champs.nom.textContent = nom;
    champs.onglet.textContent = nom;
    champs.secteur.textContent = texte(src, ".pa-secteur");
    champs.ville.textContent = texte(src, ".pa-ville");
    champs.depuis.textContent = texte(src, ".pa-depuis");
    champs.desc.textContent = texte(src, ".pa-desc");
    champs.contrib.textContent = texte(src, ".pa-contrib");

    // Référence de dossier : décorative et volontairement neutre — elle ne
    // suit le format d'aucune administration réelle.
    champs.ref.textContent = "CR-" + String(id).slice(0, 3).toUpperCase();

    champs.produits.innerHTML = "";
    src.querySelectorAll(".pa-produit").forEach((li) => {
      const item = document.createElement("li");
      item.textContent = li.textContent.trim();
      champs.produits.appendChild(item);
    });

    // Le mot du partenaire n'apparaît que s'il existe vraiment.
    const mot = texte(src, ".pa-mot");
    if (mot) {
      champs.mot.textContent = mot;
      champs.motpar.textContent = texte(src, ".pa-mot-par");
      champs["bloc-mot"].hidden = false;
    } else {
      champs["bloc-mot"].hidden = true;
    }

    // Une fiche de démonstration le dit, dans la page comme à la voix.
    champs.specimen.hidden = !demo;
    champs.avis.hidden = !demo;

    const img = button.querySelector(".pa-orb-logo");
    if (img) { champs.logo.src = img.currentSrc || img.src; champs.logo.alt = ""; }

    carte.style.setProperty("--c", getComputedStyle(button).getPropertyValue("--c"));

    opener = button;
    window.clearTimeout(closing);
    dossier.hidden = false;
    document.body.classList.add("is-modal-open");
    requestAnimationFrame(() => dossier.classList.add("is-open"));

    if (live) {
      live.textContent = demo
        ? `Dossier ${nom}. Fiche de démonstration : société fictive.`
        : `Dossier ${nom}.`;
    }

    const fermer = dossier.querySelector(".pa-dossier-fermer");
    if (fermer) fermer.focus({ preventScroll: true });
  }

  function close() {
    if (dossier.hidden) return;
    dossier.classList.remove("is-open");
    document.body.classList.remove("is-modal-open");

    const back = opener;
    opener = null;
    closing = window.setTimeout(() => { dossier.hidden = true; },
                               reduce.matches ? 20 : 340);
    if (back && back.isConnected) back.focus({ preventScroll: true });
  }

  /* --------------------------------------------------------------- écoutes */

  scene.addEventListener("click", (event) => {
    const orb = event.target.closest(".pa-orb");
    if (orb) open(orb);
  });

  dossier.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) close();
  });

  document.addEventListener("keydown", (event) => {
    if (dossier.hidden) return;

    if (event.key === "Escape") { event.preventDefault(); close(); return; }

    // Le focus reste dans le dossier tant qu'il est ouvert.
    if (event.key === "Tab") {
      const items = [...carte.querySelectorAll(FOCUSABLE)].filter(
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

  window.addEventListener("resize", () => {
    // Un canvas redimensionné en plein saut repart de travers : on le relance
    // seulement s'il est effectivement en train de jouer.
    if (raf) { stopWarp(); warp(); }
  });

  return {
    enter() {
      window.clearTimeout(fermeture);
      scene.classList.remove("is-landed");
      stopWarp();
      // Un tick pour que le retrait de `is-landed` soit pris en compte avant
      // que le saut ne reparte : sinon le titre ne réapparaît pas.
      fermeture = window.setTimeout(warp, 20);
    },
    leave() {
      stopWarp();
      window.clearTimeout(fermeture);
      scene.classList.remove("is-landed");
      close();
    },
  };
}
