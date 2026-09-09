/**
 * Cosmic Review — la pile de scènes.
 *
 * Le site tient dans un seul document : les quatre scènes (ciel, projet,
 * équipe, partenaires) sont toutes présentes dans le DOM, empilées, et l'on
 * passe de l'une à l'autre par une transition — jamais par un chargement de
 * page. `src/scripts/router.js` fait basculer `data-scene` sur `<body>` et
 * met l'URL à jour via l'History API.
 *
 * Sans JavaScript, chaque page Astro rend la même pile avec un `data-scene`
 * différent et les liens redeviennent de vrais liens : le site fonctionne,
 * simplement sans transitions.
 */

import { chalkBackdrop, chalkPeople, memberDialog, esc } from "./chalk.js";
import { sceneProjet } from "./projet.js";
import { scenePartenaires } from "./partenaires.js";

export { SCENES, TITLES, DESCRIPTIONS } from "./routes.js";

/* ------------------------------------------------------------ scène ciel */

function sceneCiel() {
  return `<section class="scene scene--ciel" id="scene-ciel" data-scene="ciel" aria-labelledby="ciel-title">
  <h1 class="sr-only" id="ciel-title">Cosmic Review — L'Incident d'Indian Springs</h1>

  <div class="sky" id="sky"></div>
  <canvas id="fx" aria-hidden="true"></canvas>

  <div class="terrain" id="terrain" aria-hidden="true">
    <div class="glow"></div>
    <svg viewBox="0 0 1440 300" preserveAspectRatio="xMidYMax meet" role="presentation">
      <defs>
        <linearGradient id="gPlain" gradientUnits="userSpaceOnUse" x1="0" y1="204" x2="0" y2="300">
          <stop offset="0" stop-color="#482c19" />
          <stop offset="0.22" stop-color="#33200f" />
          <stop offset="0.62" stop-color="#150d08" />
          <stop offset="1" stop-color="#080505" />
        </linearGradient>
        <linearGradient id="gButte" gradientUnits="userSpaceOnUse" x1="0" y1="52" x2="0" y2="212">
          <stop offset="0" stop-color="#0a0708" />
          <stop offset="0.6" stop-color="#120c09" />
          <stop offset="1" stop-color="#1d130c" />
        </linearGradient>
        <linearGradient id="gFar" gradientUnits="userSpaceOnUse" x1="0" y1="182" x2="0" y2="210">
          <stop offset="0" stop-color="#3a2416" />
          <stop offset="1" stop-color="#2a1a10" />
        </linearGradient>
      </defs>

      <!-- mesas lointaines, voilées par la distance -->
      <path fill="url(#gFar)" d="M0,210 L110,208 L138,195 L250,193 L272,207 L470,206 L496,189 L604,187 L628,203 L940,207 L968,191 L1090,189 L1116,205 L1440,203 L1440,212 L0,212 Z" />

      <!-- la plaine : chaude à l'horizon, noire au premier plan -->
      <path fill="url(#gPlain)" d="M0,206 L1440,204 L1440,300 L0,300 Z" />

      <!-- buttes : cap plat, falaise verticale, talus évasé -->
      <g fill="url(#gButte)">
        <path d="M84,209 L148,168 L176,154 L180,68 L198,56 L318,54 L332,68 L336,154 L362,168 L424,209 Z" />
        <path d="M394,209 L416,178 L420,104 L436,94 L452,100 L456,178 L478,209 Z" />
        <path d="M654,207 L690,183 L706,174 L708,132 L719,123 L784,121 L793,132 L795,174 L810,183 L845,207 Z" />
        <path d="M1004,208 L1056,174 L1084,160 L1088,96 L1103,85 L1259,83 L1274,96 L1278,160 L1306,174 L1358,208 Z" />
      </g>

      <!-- buissons secs -->
      <g fill="#100a07">
        <path d="M0,14 L3,6 L6,10 L8,2 L11,9 L14,0 L17,9 L20,3 L23,10 L26,14 Z" transform="translate(150,232) scale(1.15)" />
        <path d="M0,14 L3,6 L6,10 L8,2 L11,9 L14,0 L17,9 L20,3 L23,10 L26,14 Z" transform="translate(556,238) scale(0.9)" />
        <path d="M0,14 L3,6 L6,10 L8,2 L11,9 L14,0 L17,9 L20,3 L23,10 L26,14 Z" transform="translate(988,234) scale(1.3)" />
        <path d="M0,14 L3,6 L6,10 L8,2 L11,9 L14,0 L17,9 L20,3 L23,10 L26,14 Z" transform="translate(1298,230) scale(1)" />
      </g>

      <!-- premier plan, presque noir -->
      <path fill="#0c0806" d="M0,252 L120,246 L260,255 L400,248 L520,258 L660,250 L800,260 L940,252 L1080,262 L1220,253 L1340,261 L1440,255 L1440,300 L0,300 Z" />
    </svg>
  </div>
  <div class="edge-veil" aria-hidden="true"></div>

  <img class="wordmark" src="/cosmic-logo.webp" alt="Cosmic Review" width="900" height="339" />

  <nav class="skymap" id="skymap" aria-label="Navigation principale">
    <a class="star" href="/le-projet" data-goto="le-projet" style="left: 19%; top: 26%;">
      <span class="star-point" aria-hidden="true"></span>
      <span class="star-label">Le Projet</span>
    </a>
    <a class="star" href="/equipe" data-goto="equipe" style="left: 47%; top: 11%;">
      <span class="star-point" aria-hidden="true"></span>
      <span class="star-label">L'Équipe</span>
    </a>
    <a class="star" href="/partenaires" data-goto="partenaires" style="left: 79%; top: 21%;">
      <span class="star-point" aria-hidden="true"></span>
      <span class="star-label">Les Partenaires</span>
    </a>
  </nav>

  <div class="footline">
    <p class="film">L'Incident d'Indian Springs</p>
    <p class="hint">Survolez les étoiles pour explorer</p>
  </div>
</section>`;
}

/* ---------------------------------------------------------- scène équipe */

function sceneEquipe(members) {
  return `<section class="scene scene--equipe" id="scene-equipe" data-scene="equipe" aria-labelledby="equipe-title">
  <div class="chalk-viewport" tabindex="-1">
    <div class="chalk-stage">
      ${chalkBackdrop()}
      <h1 class="chalk-title" id="equipe-title">L'Équipe</h1>
      ${chalkPeople(members)}
    </div>
  </div>
  <p class="chalk-hint"><span class="hint-tap">Choisissez quelqu'un pour faire connaissance</span><span class="hint-swipe">Faites glisser le désert · touchez quelqu'un</span></p>
  <a class="scene-back" href="/" data-goto="ciel">Retour au ciel</a>
${teamBios(members)}
</section>`;
}

/**
 * Les présentations, en clair dans la page mais réservées aux lecteurs
 * d'écran. C'est la source unique des fiches : le dialogue vient y puiser
 * plutôt que de recopier les textes dans un JSON. Sans JavaScript, le
 * contenu reste donc lisible et indexable.
 */
function teamBios(members) {
  const cards = members
    .map((m) => `<article id="bio-${esc(m.id)}">
      <h3 class="bio-name">${esc(m.fullName)}</h3>
      <p class="bio-role">${esc(m.roleLong)}</p>
      <p class="bio-text">${esc(m.description)}</p>
    </article>`)
    .join("\n    ");

  return `  <div class="team-bios sr-only">
    <h2>Qui fait quoi</h2>
    ${cards}
  </div>`;
}

/* ------------------------------------------------------------------ tout */

/** La pile complète, identique sur les quatre routes. */
export function siteMarkup(members, projet, partenaires, carnet, initial = "ciel") {
  const stack = [
    sceneCiel(),
    sceneProjet(projet, carnet),
    sceneEquipe(members),
    scenePartenaires(partenaires),
  ]
    // La scène de départ est marquée dès le HTML : sans JavaScript, la bonne
    // scène s'affiche quand même et les liens redeviennent de vrais liens.
    .map((html) => html.replace(`data-scene="${initial}"`, `data-scene="${initial}" data-active`))
    .join("\n");

  return `<a class="skip-link" href="#skymap">Aller à la navigation</a>
<main class="stage">
${stack}
</main>
${memberDialog()}
<p class="sr-only" id="scene-live" aria-live="polite"></p>`;
}
