/**
 * Cosmic Review — les Gémeaux, et l'énigme de la boîte.
 *
 * L'enchaînement du désert. Un second clic sur Axel ouvre la carte du ciel ;
 * on y cherche la constellation dont il parle sans la nommer. Les Gémeaux
 * trouvés, ils viennent se poser en haut à droite — deux figures debout, la
 * main dans la main. Castor, celui de gauche, est le frère mortel : chaque
 * fois qu'on le touche, la pellicule se griffe un peu plus. Au cinquième, il
 * n'y a plus de ciel de ce côté-là, plus rien au sol, et une boîte.
 *
 * Dans la boîte, trois carrés vides. Trois questions dont les réponses sont
 * dans le carnet — qui reste consultable à tout moment, y compris d'ici.
 * Les trois trouvées, tout devient blanc.
 *
 * Les textes viennent de `src/data/gemeaux.json`, embarqué dans la page.
 */

/** Combien de fois il faut toucher Castor pour que le ciel cède. */
const GRIFFES = 5;

/** Le temps mort après un clic : la bande ne saute pas deux fois de suite. */
const REPOS = 620;

const FOCUSABLE = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Compare deux réponses sans être tatillon : la casse, les accents, la
 * ponctuation et l'article de tête ne comptent pas. « Le Lion », « lion » et
 * « LION » sont la même réponse.
 */
function norm(v) {
  return String(v == null ? "" : v)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/^(les|le|la|l|un|une|des|du|de)\s+/, "");
}

/**
 * `dire`          : écrire une réplique dans le bandeau, prêté par `projet.js`.
 * `busy`          : prévenir la scène qu'un calque est ouvert.
 * `amorce`        : changer la ligne d'amorce sous le bandeau.
 * `carnet`        : ouvrir le carnet, avec un retour.
 * `montrerCarnet` : rendre le bouton « Le carnet » visible dans le bandeau.
 * `audio`         : la régie sonore ; muette si absente.
 */
export function initGemeaux(scene, { dire, busy, amorce, carnet, montrerCarnet, audio } = {}) {
  const vide = { ouvrir() { return false; }, fermer() {}, ouvert: () => false };
  if (!scene) return vide;

  const snd = audio || { playLoop() {}, playFx() {} };

  const source = scene.querySelector("#gx-data");
  const roue = scene.querySelector(".gx");
  const boite = scene.querySelector(".lb");
  const gemini = scene.querySelector(".gx-gemini");
  const posee = scene.querySelector(".gx-boite");
  const finale = scene.querySelector(".fin");
  if (!source || !roue || !boite || !gemini || !posee || !finale) return vide;

  let G = null;
  try { G = JSON.parse(source.textContent); } catch (err) { return vide; }
  if (!G || !G.constellations || !G.lunchbox || !G.lunchbox.cases) return vide;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const amorceEl = roue.querySelector("[data-amorce]");
  const centreEl = roue.querySelector("[data-centre]");
  const centreOrigine = centreEl ? centreEl.innerHTML : "";
  const fiche = boite.querySelector("[data-fiche]");
  const ficheTitre = boite.querySelector("[data-fiche-titre]");
  const ficheTexte = boite.querySelector("[data-fiche-texte]");
  const form = boite.querySelector("[data-form]");
  const input = boite.querySelector("[data-input]");
  const label = boite.querySelector("[data-label]");
  const btnRoue = boite.querySelector("[data-roue]");
  const etat = boite.querySelector("[data-etat]");
  const motEl = boite.querySelector("[data-mot]");

  const parId = Object.fromEntries(G.constellations.map((c) => [c.id, c]));
  const CASES = G.lunchbox.cases;
  const parCase = Object.fromEntries(CASES.map((c) => [c.id, c]));

  let trouve = false;      // les Gémeaux ont été reconnus
  let griffe = 0;          // combien de fois Castor a été touché
  let fini = false;        // le ciel a cédé
  let vu = false;          // la boîte a déjà dit sa réplique
  let dernier = 0;         // horodatage du dernier coup, pour le temps mort
  let ouvert = null;       // le calque ouvert
  let opener = null;       // à qui rendre le focus
  let revenir = null;      // ce qu'on rouvre en refermant
  let modeRoue = "decouverte";
  let caseCourante = null;
  const resolues = new Set();
  let acheve = false;
  const minuteries = [];   // les temps du générique, pour pouvoir les couper
  let cale = -1;           // sur combien de figures la rangée est centrée
  let recale = null;       // le rappel de redimensionnement, s'il est posé

  /* --------------------------------------------------------- les libellés */

  const dit = (calque, texte) => {
    const live = calque.querySelector("[data-live]");
    if (live) live.textContent = texte;
  };

  const lignes = (el, textes) => {
    el.textContent = "";
    (textes || []).forEach((t) => {
      const s = document.createElement("span");
      s.textContent = t;
      el.appendChild(s);
    });
  };

  {
    const c = gemini.querySelector("[data-castor]");
    const p = gemini.querySelector("[data-pollux]");
    if (c) c.textContent = G.gemeaux.castor;
    if (p) p.textContent = G.gemeaux.pollux;
    const b = posee.querySelector("[data-boite]");
    if (b) b.textContent = G.lunchbox.label + " — l'ouvrir";
  }

  /* ------------------------------------------------------- les calques    */

  function ouvrirCalque(calque, retour) {
    if (ouvert && ouvert !== calque) fermerSec();
    if (!opener || !ouvert) opener = document.activeElement;
    revenir = typeof retour === "function" ? retour : null;
    ouvert = calque;
    calque.hidden = false;
    document.body.classList.add("is-modal-open");
    if (busy) busy(true);

    if (!reduce.matches) {
      calque.classList.remove("is-drawing");
      void calque.offsetWidth;
      calque.classList.add("is-drawing");
      window.setTimeout(() => calque.classList.remove("is-drawing"), 3600);
    }

    const reveal = () => calque.classList.add("is-open");
    requestAnimationFrame(reveal);
    window.setTimeout(reveal, 40);

    const cible = calque.querySelector("[data-close]");
    if (cible) cible.focus({ preventScroll: true });
  }

  /** Fermer sans rendre la main : quand on enchaîne sur un autre calque. */
  function fermerSec() {
    if (!ouvert) return;
    const calque = ouvert;
    ouvert = null;
    calque.classList.remove("is-open", "is-drawing");
    window.setTimeout(() => { calque.hidden = true; }, reduce.matches ? 20 : 500);
    if (busy) busy(false);
  }

  function fermer() {
    if (!ouvert) return;
    const suite = revenir;
    revenir = null;
    fermerSec();
    document.body.classList.remove("is-modal-open");
    if (!suite && opener && opener.isConnected) opener.focus({ preventScroll: true });
    if (!suite) opener = null;
    if (suite) window.setTimeout(suite, reduce.matches ? 30 : 300);
  }

  /* ---------------------------------------------------------- la carte    */

  function poserAmorce(texte, parle) {
    if (!amorceEl) return;
    amorceEl.textContent = texte;
    amorceEl.classList.toggle("is-dit", !!parle);
  }

  /** La carte, en mode découverte : on cherche celle dont Axel parle. */
  function ouvrirRoue() {
    modeRoue = "decouverte";
    if (centreEl) centreEl.innerHTML = centreOrigine;
    poserAmorce(trouve ? G.gemeaux.trouvee : G.roue.amorce, trouve);
    ouvrirCalque(roue);
  }

  /** La carte, en mode réponse : elle pose la question du premier carré. */
  function ouvrirRoueEnigme(c) {
    modeRoue = "enigme";
    if (centreEl) lignes(centreEl, [c.question || c.titre]);
    poserAmorce(G.roue.amorce, false);
    ouvrirCalque(roue, () => rouvrirBoite(c.id));
  }

  function choisir(id) {
    const c = parId[id];
    if (!c) return;
    const fig = roue.querySelector(".gx-fig--" + id);

    if (modeRoue === "enigme") {
      const cas = parCase[caseCourante];
      if (!cas) return;
      if (bonneReponse(cas, c.nom) || bonneReponse(cas, c.id)) {
        if (fig) { fig.classList.remove("is-refusee"); fig.classList.add("is-trouvee"); }
        poserAmorce(c.nom, true);
        dit(roue, c.nom + ". " + (cas.reussite || []).join(" "));
        window.setTimeout(() => { reussir(cas); fermer(); }, reduce.matches ? 300 : 1100);
        return;
      }
      roue.querySelectorAll(".gx-fig.is-refusee").forEach((f) => f.classList.remove("is-refusee"));
      void roue.offsetWidth;
      if (fig) fig.classList.add("is-refusee");
      poserAmorce(c.refus || G.lunchbox.faux, true);
      dit(roue, c.nom + ". " + (c.refus || G.lunchbox.faux));
      return;
    }

    if (id !== G.roue.juste) {
      // On en montre une autre. Elle s'allume le temps d'une phrase, puis
      // s'éteint : ce n'est pas celle-là.
      roue.querySelectorAll(".gx-fig.is-refusee").forEach((f) => f.classList.remove("is-refusee"));
      void roue.offsetWidth;
      if (fig) fig.classList.add("is-refusee");
      poserAmorce(c.refus || G.roue.refusDefaut, true);
      dit(roue, c.nom + ". " + (c.refus || G.roue.refusDefaut));
      return;
    }

    if (trouve) { fermer(); return; }
    trouve = true;
    roue.classList.add("is-trouve");
    if (fig) { fig.classList.remove("is-refusee"); fig.classList.add("is-trouvee"); }
    poserAmorce(G.gemeaux.trouvee, true);
    dit(roue, G.gemeaux.trouvee + " " + G.gemeaux.amorce);

    window.setTimeout(() => {
      fermer();
      window.setTimeout(() => {
        gemini.hidden = false;
        requestAnimationFrame(() => scene.setAttribute("data-gemini", "1"));
        window.setTimeout(() => scene.setAttribute("data-gemini", "1"), 60);
        if (amorce) amorce(G.gemeaux.amorce);
      }, reduce.matches ? 40 : 520);
    }, reduce.matches ? 400 : 1900);
  }

  /* ------------------------------------------------------- la pellicule   */

  async function toucher(twin) {
    if (fini) return;
    if (twin === "pollux") { if (dire) dire([G.gemeaux.pollucLigne], ""); return; }

    // Un temps mort entre deux coups : personne ne doit pouvoir faire
    // clignoter l'écran en cliquant vite.
    const t = Date.now();
    if (t - dernier < REPOS) return;
    dernier = t;

    snd.playFx("scratch");
    griffe = Math.min(GRIFFES, griffe + 1);
    scene.setAttribute("data-griffe", String(griffe));

    if (!reduce.matches) {
      scene.classList.remove("is-griffe");
      void scene.offsetWidth;
      scene.classList.add("is-griffe");
      window.setTimeout(() => scene.classList.remove("is-griffe"), 300);
    }

    const ligne = G.gemeaux.griffes[griffe - 1];
    const p = dire ? dire([ligne], "") : Promise.resolve();

    if (griffe >= GRIFFES) {
      fini = true;
      await p;
      window.setTimeout(vider, reduce.matches ? 300 : 1500);
    }
  }

  /** Le sol se vide. Il ne reste que la boîte. */
  function vider() {
    scene.setAttribute("data-fin", "1");
    posee.hidden = false;
    if (amorce) amorce(G.gemeaux.apres);
    const live = scene.querySelector("#pj-live");
    if (live) live.textContent = G.gemeaux.apres + " Une boîte, posée là où quelqu'un se tenait.";
  }

  /* -------------------------------------------------- les trois carrés    */

  const marque = (id) => boite.querySelector('.gx-case[data-case="' + id + '"]');

  function bonneReponse(cas, valeur) {
    const v = norm(valeur);
    if (!v) return false;
    return (cas.reponses || []).some((r) => norm(r) === v);
  }

  /** Ouvre la fiche d'un carré : la question, et de quoi répondre. */
  function ouvrirCase(id) {
    const cas = parCase[id];
    if (!cas || !fiche) return;
    caseCourante = id;

    boite.querySelectorAll(".gx-case").forEach((g) => g.classList.toggle("is-en-cours", g.dataset.case === id && !resolues.has(id)));

    fiche.hidden = false;
    if (ficheTitre) ficheTitre.textContent = cas.titre || "";
    if (ficheTexte) lignes(ficheTexte, cas.texte);

    const fait = resolues.has(id);
    const parRoue = cas.type === "roue";

    if (form) form.hidden = parRoue || fait;
    if (btnRoue) {
      btnRoue.hidden = !parRoue || fait;
      btnRoue.textContent = cas.champ || "Ouvrir la carte du ciel";
    }
    if (input && !parRoue) {
      input.value = "";
      input.placeholder = cas.champ || "";
      input.inputMode = cas.type === "numero" ? "numeric" : "text";
      if (label) label.textContent = cas.titre || "Votre réponse";
    }

    if (etat) {
      etat.classList.toggle("is-faux", false);
      if (fait) { lignes(etat, cas.reussite); etat.classList.add("is-on"); }
      else { etat.textContent = ""; etat.classList.remove("is-on"); }
    }

    dit(boite, (cas.nom || "") + ". " + (cas.titre || "") + " " + (cas.texte || []).join(" "));
    if (!fait && !parRoue && input) window.setTimeout(() => input.focus({ preventScroll: true }), 60);
  }

  function reussir(cas) {
    if (resolues.has(cas.id)) return;
    resolues.add(cas.id);
    const g = marque(cas.id);
    if (g) { g.classList.add("is-ok"); g.classList.remove("is-en-cours"); }
    if (form) form.hidden = true;
    if (btnRoue) btnRoue.hidden = true;
    if (etat) { lignes(etat, cas.reussite); etat.classList.remove("is-faux"); etat.classList.add("is-on"); }
    dit(boite, (cas.reussite || []).join(" "));
    if (resolues.size >= CASES.length) window.setTimeout(finir, reduce.matches ? 600 : 2200);
  }

  function rater(cas) {
    if (!etat) return;
    lignes(etat, [G.lunchbox.faux]);
    etat.classList.add("is-on", "is-faux");
    dit(boite, G.lunchbox.faux);
  }

  /** Rouvre la boîte, et la fiche qu'on était en train de lire. */
  function rouvrirBoite(id) {
    ouvrirCalque(boite);
    if (id) window.setTimeout(() => ouvrirCase(id), reduce.matches ? 10 : 120);
  }

  /* ------------------------------------------------------------- la fin   */

  /** Les trois retrouvées : le mot d'Arthur, puis tout devient blanc. */
  function finir() {
    if (acheve) return;
    acheve = true;
    if (fiche) fiche.hidden = true;
    if (motEl) {
      motEl.hidden = false;
      requestAnimationFrame(() => motEl.classList.add("is-on"));
      window.setTimeout(() => motEl.classList.add("is-on"), 60);
    }
    dit(boite, (G.lunchbox.mot.texte || []).join(" "));
    window.setTimeout(blanchir, reduce.matches ? 1400 : 7600);
  }

  function blanchir() {
    fermerSec();
    revenir = null;
    finale.hidden = false;
    const reveal = () => finale.classList.add("is-on");
    requestAnimationFrame(reveal);
    window.setTimeout(reveal, 40);
    scene.setAttribute("data-acheve", "1");
    const live = scene.querySelector("#pj-live");
    if (live) live.textContent = G.lunchbox.fin.titre;
    snd.playLoop("fin");
    generique();
  }

  /**
   * Le générique. Le titre monte, les cartes s'allument l'une après l'autre,
   * et à la fin il ne reste que le titre — comme quand la salle se rallume.
   *
   * Les minuteries sont retenues : quitter la scène en plein générique ne
   * doit pas laisser des cartes s'allumer dans le vide.
   */
  function generique() {
    const f = G.lunchbox.fin || {};
    const cartes = [...finale.querySelectorAll(".fin-carte")];
    if (!cartes.length) return;

    const rang = finale.querySelector("[data-rang]");
    const figures = rang ? [...rang.querySelectorAll(".fin-membre")] : [];

    // Le mouvement réduit retire les glissements et les fondus — pas le temps
    // de lire. Un générique qui défile deux fois plus vite serait moins
    // accessible, pas plus : les durées ne changent pas.
    const avant = f.avant || 4600;
    const duree = f.duree || 4600;

    minuteries.push(window.setTimeout(() => finale.classList.add("is-credits"), avant - 900));

    cartes.forEach((carte, i) => {
      minuteries.push(window.setTimeout(() => {
        cartes.forEach((c) => c.classList.toggle("is-on", c === carte));
        entrer(i);
      }, avant + i * duree));
    });

    // La dernière carte s'efface, mais la troupe reste : l'équipe entière
    // sous le titre, c'est la dernière image du site. La musique de fin,
    // elle, s'installe bien plus tôt — dès `blanchir()`, à l'instant même
    // où l'écran blanc et le titre apparaissent, pas ici.
    minuteries.push(window.setTimeout(() => {
      cartes.forEach((c) => c.classList.remove("is-on"));
      figures.forEach((g) => { g.classList.remove("is-scene"); g.classList.add("is-rangee"); });
      caler(figures.length - 1);
    }, avant + cartes.length * duree));

    /**
     * La i-ème personne entre. Celles d'avant restent, en retrait, et la
     * rangée glisse d'une demi-place pour que le groupe reste centré.
     */
    function entrer(i) {
      if (!figures.length) return;
      figures.forEach((g, k) => {
        g.classList.toggle("is-scene", k === i);
        g.classList.toggle("is-rangee", k < i);
      });
      caler(Math.min(i, figures.length - 1));
    }

    /**
     * Recentre la rangée sur les `k + 1` premières figures. Les huit sont
     * toujours dans le flux — c'est ce qui garantit que personne ne bouge
     * autrement qu'en glissant tous ensemble.
     */
    function caler(k) {
      if (!rang || figures.length < 2) return;
      const n = figures.length;
      // `offsetLeft` vient de la mise en page : il ne bouge pas pendant que
      // la rangée glisse, contrairement à `getBoundingClientRect`.
      const pas = (figures[n - 1].offsetLeft - figures[0].offsetLeft) / (n - 1);
      rang.style.setProperty("--dx", ((n - 1 - k) * pas) / 2 + "px");
      cale = k;
    }

    // Une fenêtre qui change de taille change le pas : on recale.
    if (rang && !recale) {
      recale = () => { if (cale >= 0) caler(cale); };
      window.addEventListener("resize", recale);
    }
  }

  /* ------------------------------------------------------------ écoutes   */

  roue.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) { fermer(); return; }
    const s = event.target.closest(".gx-secteur");
    if (s) { choisir(s.dataset.cons); return; }
    if (event.target === roue) fermer();
  });

  boite.addEventListener("click", (event) => {
    if (event.target.closest("[data-close]")) { fermer(); return; }
    if (event.target.closest("[data-consulter]")) {
      const id = caseCourante;
      if (carnet) { fermerSec(); revenir = null; carnet(() => rouvrirBoite(id)); }
      return;
    }
    if (event.target.closest("[data-roue]")) {
      const cas = parCase[caseCourante];
      if (cas) ouvrirRoueEnigme(cas);
      return;
    }
    const b = event.target.closest(".gx-case-btn");
    if (b) { ouvrirCase(b.dataset.case); return; }
    if (event.target === boite) fermer();
  });

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const cas = parCase[caseCourante];
      if (!cas || !input) return;
      if (bonneReponse(cas, input.value)) reussir(cas);
      else { rater(cas); input.select(); }
    });
  }

  // Les deux jumeaux, et la boîte au sol : ils vivent dans la scène.
  scene.addEventListener("click", (event) => {
    const twin = event.target.closest(".gx-twin");
    if (twin) { toucher(twin.dataset.twin); return; }

    const b = event.target.closest(".gx-boite");
    if (b) {
      // Même grammaire que le carnet : la réplique d'abord, l'objet ensuite.
      if (!vu) {
        vu = true;
        if (amorce) amorce(G.lunchbox.amorce);
        if (dire) dire(G.lunchbox.lignes, G.lunchbox.credit);
        // Les réponses sont dans le carnet : à partir d'ici, il est à portée.
        if (montrerCarnet) montrerCarnet();
      } else {
        ouvrirCalque(boite);
      }
    }
  });

  document.addEventListener("keydown", (event) => {
    if (!ouvert) return;
    if (event.key === "Escape") { event.preventDefault(); fermer(); return; }
    if (event.key !== "Tab") return;
    const cadre = ouvert.querySelector(".gx-frame");
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

  return {
    /** Ce que la scène appelle au second clic sur un objet du désert. */
    ouvrir(id) {
      if (id !== "axel-seul" || fini) return false;
      ouvrirRoue();
      return true;
    },
    fermer() {
      revenir = null;
      fermer();
      minuteries.splice(0).forEach(window.clearTimeout);
      finale.querySelectorAll(".fin-carte.is-on").forEach((c) => c.classList.remove("is-on"));
      finale.querySelectorAll(".fin-membre").forEach((g) => g.classList.remove("is-scene", "is-rangee"));
      const r = finale.querySelector("[data-rang]");
      if (r) r.style.removeProperty("--dx");
      if (recale) { window.removeEventListener("resize", recale); recale = null; }
      cale = -1;
      finale.classList.remove("is-on", "is-credits");
      finale.hidden = true;
    },
    ouvert: () => ouvert !== null,
  };
}
