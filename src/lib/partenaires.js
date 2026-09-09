/**
 * Cosmic Review — la scène « Les Partenaires ».
 *
 * On quitte le ciel de l'accueil par un saut en hyperespace et on arrive
 * dans une galaxie : le logotype Cosmic Review s'efface pour laisser
 * « Cosmic Partenaires », et les partenaires tournent autour en orbite.
 * Choisir un partenaire ouvre son dossier — chemise kraft, fiche
 * dactylographiée, photo agrafée.
 *
 * Registre : le photographique (accueil, Le Projet), pas la craie de
 * L'Équipe. Le fond est le même `sky.webp`, poussé vers le bleu profond et
 * mis en rotation lente.
 *
 * AJOUTER UN PARTENAIRE : uniquement `src/data/partenaires.json` et un logo
 * dans `public/partners/`. Rien à toucher ici : les positions d'orbite sont
 * calculées à partir du nombre de partenaires (voir `orbites()`), et le
 * dossier est rendu à partir des mêmes données.
 *
 * Comme pour les autres scènes, les textes ne sont pas dupliqués dans le
 * script : ils sont écrits dans la page (`.pa-source`, réservé aux lecteurs
 * d'écran) et le dossier va les y chercher. Une seule source, et la page
 * reste lisible et indexable sans JavaScript.
 */

import { esc } from "./chalk.js";

/* --------------------------------------------------------------- orbites */

/**
 * Place les partenaires autour du titre.
 *
 * Le but est qu'ajouter un partenaire ne demande jamais d'écrire des
 * coordonnées à la main. On répartit donc les logos sur un ou deux anneaux
 * selon leur nombre, en partant du haut et en décalant chaque anneau d'un
 * demi-pas pour éviter les alignements trop réguliers.
 *
 * Retourne des pourcentages : le CSS positionne en % du cadre, ce qui reste
 * juste à toutes les tailles d'écran.
 */
export function orbites(n) {
  if (n <= 0) return [];

  // Jusqu'à 6 partenaires : un seul anneau. Au-delà : deux, le plus grand
  // à l'extérieur, pour que la galaxie ne se resserre pas indéfiniment.
  const anneaux = n <= 6 ? [n] : [Math.ceil(n / 2), Math.floor(n / 2)];
  const rayons = anneaux.length === 1 ? [30] : [37, 20];

  const out = [];
  anneaux.forEach((compte, i) => {
    const rx = rayons[i];
    const ry = rx * 0.62; // l'orbite est vue de biais, pas de face
    // Un anneau seul démarre en haut ; le second est décalé d'un demi-pas.
    const depart = -Math.PI / 2 + (i * Math.PI) / compte;

    for (let k = 0; k < compte; k++) {
      const a = depart + (k * 2 * Math.PI) / compte;
      out.push({
        x: +(50 + Math.cos(a) * rx).toFixed(2),
        y: +(50 + Math.sin(a) * ry).toFixed(2),
        // Les logos du fond sont légèrement plus petits et plus sombres :
        // c'est ce qui donne la profondeur.
        z: +(0.82 + 0.18 * ((Math.sin(a) + 1) / 2)).toFixed(3),
        anneau: i,
        delai: +(k * 0.9 + i * 0.45).toFixed(2),
      });
    }
  });

  return out;
}

/* ---------------------------------------------------------------- la vue */

function logo(p, pos, index) {
  const nom = esc(p.nom);
  return `<button
      class="pa-orb"
      type="button"
      data-partner="${esc(p.id)}"
      style="left:${pos.x}%; top:${pos.y}%; --z:${pos.z}; --d:${pos.delai}s; --c:${esc(p.couleur || "#e8c07a")};"
      aria-label="${nom} — ouvrir le dossier">
      <span class="pa-orb-halo" aria-hidden="true"></span>
      <img class="pa-orb-logo" src="${esc(p.logo)}" alt="" width="120" height="120" loading="${index < 4 ? "eager" : "lazy"}" />
      <span class="pa-orb-nom">${nom}</span>
    </button>`;
}

/**
 * Les fiches, en clair dans la page mais réservées aux lecteurs d'écran.
 * Source unique du dossier : le script vient y puiser.
 */
function sources(liste) {
  const blocs = liste
    .map((p) => {
      const produits = (p.produits || [])
        .map((x) => `<li class="pa-produit">${esc(x)}</li>`)
        .join("");

      // Le mot du partenaire est une citation : on ne l'affiche que s'il y
      // en a réellement un. Voir la règle dans partenaires.json.
      const mot = p.mot
        ? `<blockquote class="pa-mot">${esc(p.mot)}</blockquote>
        <p class="pa-mot-par">${esc(p.motPar || "")}</p>`
        : "";

      return `<article id="pa-src-${esc(p.id)}" data-placeholder="${p.placeholder ? "1" : "0"}">
      <h3 class="pa-nom">${esc(p.nom)}</h3>
      <p class="pa-secteur">${esc(p.secteur || "")}</p>
      <p class="pa-ville">${esc(p.ville || "")}</p>
      <p class="pa-depuis">${esc(p.depuis || "")}</p>
      <p class="pa-desc">${esc(p.description || "")}</p>
      <ul class="pa-produits">${produits}</ul>
      <p class="pa-contrib">${esc(p.contribution || "")}</p>
      ${mot}
    </article>`;
    })
    .join("\n    ");

  return `  <div class="pa-source sr-only">
    <h2>Nos partenaires</h2>
    ${blocs}
  </div>`;
}

/**
 * Le dossier, vide au départ : le script le remplit à l'ouverture.
 *
 * Registre « dossier d'enquête » : chemise kraft, onglet, fiche tapée à la
 * machine, photo agrafée. Volontairement générique — aucun sigle, aucune
 * administration réelle, aucun numéro de dossier imitant un vrai service.
 * C'est un objet de fiction qui sert la mise en page, pas la reproduction
 * d'un document officiel.
 */
function dossier() {
  return `<div class="pa-dossier" id="pa-dossier" hidden>
  <div class="pa-dossier-fond" data-close></div>

  <div class="pa-dossier-carte" role="dialog" aria-modal="true" aria-labelledby="pa-d-nom">
    <div class="pa-chemise">
      <span class="pa-onglet" aria-hidden="true"><span data-d="onglet"></span></span>

      <button class="pa-dossier-fermer" type="button" data-close aria-label="Fermer le dossier">
        <span aria-hidden="true">&times;</span>
      </button>

      <div class="pa-feuille">
        <!-- Tampon affiché uniquement pour une fiche de démonstration. -->
        <p class="pa-specimen" data-d="specimen" hidden aria-hidden="true">Spécimen</p>

        <header class="pa-entete">
          <div class="pa-photo">
            <span class="pa-trombone" aria-hidden="true"></span>
            <img data-d="logo" src="" alt="" width="120" height="120" />
          </div>
          <div class="pa-identite">
            <p class="pa-champ"><span>Dossier</span><em data-d="ref"></em></p>
            <h2 id="pa-d-nom" data-d="nom" tabindex="-1"></h2>
            <p class="pa-champ"><span>Secteur</span><em data-d="secteur"></em></p>
            <p class="pa-champ"><span>Base</span><em data-d="ville"></em></p>
            <p class="pa-champ"><span>Au dossier depuis</span><em data-d="depuis"></em></p>
          </div>
        </header>

        <p class="pa-avis" data-d="avis" hidden>
          Fiche de démonstration. Cette société est fictive : ni son nom, ni ses
          propos, ni son soutien au film ne sont réels. Elle occupe la place
          d'un futur partenaire.
        </p>

        <section class="pa-bloc">
          <h3>Qui sont-ils</h3>
          <p data-d="desc"></p>
        </section>

        <section class="pa-bloc">
          <h3>Ce qu'ils font</h3>
          <ul data-d="produits"></ul>
        </section>

        <section class="pa-bloc">
          <h3>Leur contribution au film</h3>
          <p data-d="contrib"></p>
        </section>

        <section class="pa-bloc pa-bloc--mot" data-d="bloc-mot" hidden>
          <h3>Un mot de leur part</h3>
          <blockquote data-d="mot"></blockquote>
          <p class="pa-signature" data-d="motpar"></p>
        </section>
      </div>
    </div>
  </div>
</div>`;
}

/** La scène complète. */
export function scenePartenaires(data) {
  const liste = (data && data.partenaires) || [];
  const pos = orbites(liste.length);
  const demo = liste.some((p) => p.placeholder);

  const orbes = liste.map((p, i) => logo(p, pos[i], i)).join("\n    ");

  return `<section class="scene scene--partenaires" id="scene-partenaires" data-scene="partenaires" aria-labelledby="partenaires-title">
  <div class="pa-galaxie" aria-hidden="true">
    <div class="pa-fond"></div>
    <div class="pa-bras"></div>
    <div class="pa-coeur"></div>
  </div>

  <canvas class="pa-warp" id="pa-warp" aria-hidden="true"></canvas>

  <div class="pa-scene-inner">
    <h1 class="pa-titre" id="partenaires-title">
      <span class="pa-titre-cosmic">Cosmic</span>
      <span class="pa-titre-mot">Partenaires</span>
    </h1>

    <div class="pa-orbites">
      ${orbes}
    </div>

    <p class="pa-hint"><span class="hint-tap">Choisissez un partenaire pour ouvrir son dossier</span><span class="hint-swipe">Touchez un partenaire</span></p>

    ${demo ? `<p class="pa-demo-note">Partenaires de démonstration — les vraies sociétés viendront prendre leur place ici.</p>` : ""}

    <a class="scene-back" href="/" data-goto="ciel">Retour au ciel</a>
  </div>

${sources(liste)}
  <p class="sr-only" id="pa-live" aria-live="polite"></p>
</section>
${dossier()}`;
}
