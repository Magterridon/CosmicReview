/**
 * Cosmic Review — la scène « Le Projet ».
 *
 * Un seul écran : le ciel photographique de l'accueil, le désert de Jean Dry
 * Lake, deux amis assis qui regardent les étoiles, le pickup à l'arrière-plan
 * droit. Chaque élément est un bouton ; au clic, une réplique s'écrit dans le
 * bandeau de transcription, comme un rush de found footage.
 *
 * Comme `chalk.js`, ce module produit des chaînes de HTML/SVG au moment du
 * build : rien ici ne tourne dans le navigateur. Les interactions sont dans
 * `src/scripts/projet.js`.
 *
 * Repère de la scène : 1440 × 900, horizon à y = 690. Les silhouettes sont
 * ancrées par leur point d'appui au sol : `place()` convertit ce repère en
 * pourcentages, donc tout reste solidaire du décor à n'importe quelle taille.
 */

const W = 1440;
const H = 900;
const HORIZON = 668;

/* ---------------------------------------------------------------- outils */

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Générateur déterministe : le décor est identique à chaque build. */
function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v) => Math.round(v * 100) / 100;
const pc = (v, total) => n((v / total) * 100) + "%";

/** Un membre : trait épais à bouts ronds. Les traits se fondent en une masse. */
function limb(x1, y1, x2, y2, w) {
  return `<path d="M${x1},${y1}L${x2},${y2}" stroke-width="${w}" />`;
}

/**
 * Place un élément dans le repère de la scène.
 * `x` / `y` : point d'appui au sol ; `w` : largeur voulue ; `vb` : sa boîte.
 */
function place(x, y, w, vb) {
  const h = (w * vb[1]) / vb[0];
  return `left:${pc(x - w / 2, W)};top:${pc(y - h, H)};width:${pc(w, W)}`;
}

/* ------------------------------------------------------------- le décor  */

/** Craquelures du lac asséché : le sol de Jean Dry Lake. */
function cracks() {
  const r = rng(20260908);
  const out = [];
  for (let i = 0; i < 26; i++) {
    const t = r();
    // plus on est près, plus les écailles sont larges et basses
    const y = HORIZON + 14 + Math.pow(t, 1.6) * (H - HORIZON - 20);
    const span = 40 + Math.pow(t, 1.4) * 320;
    const x = r() * W;
    const k = (r() * 2 - 1) * 14 * t;
    out.push(
      `<path d="M${n(x)},${n(y)} L${n(x + span * 0.4)},${n(y + k)} L${n(x + span)},${n(y + k * 0.3 + 6 * t)}" opacity="${n(0.1 + 0.16 * (1 - t))}" />`
    );
  }
  return `<g class="pj-cracks" fill="none" stroke="#d8a86f" stroke-width="1.1">${out.join("")}</g>`;
}

/** Buissons secs, posés le long de l'horizon. */
function bushes() {
  const spots = [
    [96, 706, 1.1], [332, 716, 0.85], [468, 700, 0.7],
    [880, 704, 0.95], [1006, 726, 1.25], [1290, 712, 0.8],
  ];
  const d = "M0,15 L3,6 L6,11 L8,2 L11,9 L14,0 L17,9 L20,3 L23,11 L26,15 Z";
  return `<g fill="#0b0705">${spots
    .map(([x, y, s]) => `<path d="${d}" transform="translate(${x},${y - 15 * s}) scale(${s})" />`)
    .join("")}</g>`;
}

function terrain() {
  return `<svg class="pj-terrain" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="pjPlain" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#77502f" />
      <stop offset="0.1" stop-color="#5a3a20" />
      <stop offset="0.3" stop-color="#2e1c10" />
      <stop offset="0.62" stop-color="#120b06" />
      <stop offset="1" stop-color="#060404" />
    </linearGradient>
    <linearGradient id="pjFar" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON - 40}" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#4a3020" stop-opacity="0.55" />
      <stop offset="1" stop-color="#3a2416" />
    </linearGradient>
    <linearGradient id="pjButte" gradientUnits="userSpaceOnUse" x1="0" y1="580" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#0a0708" />
      <stop offset="1" stop-color="#1b110b" />
    </linearGradient>
    <linearGradient id="pjEdge" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#04050c" stop-opacity="0.82" />
      <stop offset="0.26" stop-color="#04050c" stop-opacity="0" />
      <stop offset="0.74" stop-color="#04050c" stop-opacity="0" />
      <stop offset="1" stop-color="#04050c" stop-opacity="0.82" />
    </linearGradient>
  </defs>

  <!-- crêtes lointaines, voilées par la distance -->
  <path fill="url(#pjFar)" d="M0,${HORIZON - 7} L74,${HORIZON - 11} L132,${HORIZON - 5} L168,${HORIZON - 21} L214,${HORIZON - 26} L268,${HORIZON - 19} L300,${HORIZON - 6} L392,${HORIZON - 9} L446,${HORIZON - 4} L520,${HORIZON - 8} L556,${HORIZON - 24} L612,${HORIZON - 30} L668,${HORIZON - 22} L700,${HORIZON - 7} L812,${HORIZON - 5} L884,${HORIZON - 12} L942,${HORIZON - 6} L996,${HORIZON - 27} L1064,${HORIZON - 33} L1132,${HORIZON - 24} L1166,${HORIZON - 8} L1268,${HORIZON - 6} L1330,${HORIZON - 13} L1440,${HORIZON - 6} L1440,${HORIZON + 2} L0,${HORIZON + 2} Z" />

  <!-- la plaine : chaude à l'horizon, presque noire au premier plan -->
  <path fill="url(#pjPlain)" d="M0,${HORIZON} L1440,${HORIZON - 2} L1440,${H} L0,${H} Z" />

  ${cracks()}

  <!-- buttes en contre-jour -->
  <g fill="url(#pjButte)">
    <path d="M46,${HORIZON} L112,650 L140,638 L144,592 L158,584 L258,582 L270,592 L274,638 L300,650 L364,${HORIZON} Z" />
    <path d="M840,${HORIZON} L866,668 L878,660 L880,634 L890,628 L946,627 L955,634 L957,660 L970,668 L996,${HORIZON} Z" />
    <path d="M1148,${HORIZON} L1206,656 L1234,644 L1238,600 L1252,591 L1382,589 L1396,600 L1400,644 L1428,656 L1440,${HORIZON} Z" />
  </g>

  ${bushes()}

  <rect x="0" y="${HORIZON - 60}" width="${W}" height="200" fill="url(#pjEdge)" />

  <!-- premier plan, presque noir -->
  <path fill="#080605" d="M0,848 L150,842 L320,852 L470,845 L620,856 L780,848 L940,858 L1100,850 L1260,860 L1400,852 L1440,857 L1440,${H} L0,${H} Z" />
</svg>`;
}

/* -------------------------------------------------------- les silhouettes */

/**
 * Une personne assise, de profil, tournée vers la droite : appuyée en
 * arrière sur un bras, l'autre levé. Le corps est fait de traits épais à
 * bouts ronds qui se fondent en une seule masse noire.
 *
 * `arm` : "point" (index tendu vers le ciel), "camera" (caméscope à hauteur
 * d'œil) ou "rest" (bras retombé, état d'après).
 */
function seated({ arm = "point", hat = false, lean = 0 } = {}) {
  const hipX = 96 + lean;
  const shX = 78 + lean;

  let front = "";
  if (arm === "point") {
    front =
      `<circle cx="${shX + 6}" cy="148" r="12" />` +
      limb(shX + 4, 146, 118, 110, 18) +
      limb(118, 110, 155, 58, 14) +
      `<path d="M155,58L168,39" stroke-width="8" />`;
  } else if (arm === "camera") {
    front = `<circle cx="${shX + 8}" cy="151" r="12" />` + limb(shX + 6, 150, 122, 158, 18) + limb(122, 158, 140, 124, 14);
  } else {
    front =
      `<circle cx="${shX + 8}" cy="152" r="12" />` +
      limb(shX + 6, 152, 112, 186, 18) +
      limb(112, 186, 152, 196, 14);
  }

  // La caméra ne quitte jamais sa main : elle est simplement plus basse
  // dans la pose d'après. C'est le film, la caméra ne s'arrête pas.
  const rig =
    arm === "camera"
      ? `<g class="pj-rig">
           <rect x="128" y="100" width="42" height="27" rx="4" />
           <rect x="168" y="106" width="14" height="16" rx="3" />
           <rect x="134" y="91" width="18" height="10" rx="3" />
           <circle class="pj-rec" cx="176" cy="97" r="4" />
         </g>`
      : arm === "rest"
      ? `<g class="pj-rig">
           <rect x="150" y="176" width="40" height="26" rx="4" />
           <rect x="188" y="182" width="13" height="15" rx="3" />
           <circle class="pj-rec" cx="196" cy="173" r="4" />
         </g>`
      : "";

  return `<g class="pj-body">
    <!-- appui au sol -->
    <ellipse class="pj-contact" cx="${hipX + 16}" cy="250" rx="76" ry="5" />
    <!-- jambe éloignée : genou plus bas, pied plus loin -->
    ${limb(hipX - 2, 214, 138, 196, 23)}
    ${limb(138, 196, 145, 243, 16)}
    ${limb(145, 243, 170, 248, 12)}
    <!-- bras d'appui, en arrière -->
    ${limb(shX - 4, 150, 50, 192, 14)}
    ${limb(50, 192, 36, 241, 11)}
    <!-- torse -->
    ${limb(hipX, 212, shX, 140, 42)}
    ${limb(shX - 15, 143, shX + 13, 147, 33)}
    <!-- jambe proche : genou haut, tibia franchement vertical -->
    ${limb(hipX + 10, 216, 174, 166, 26)}
    ${limb(174, 166, 179, 243, 19)}
    ${limb(179, 243, 209, 249, 14)}
    <!-- cou, puis la tête : le cou est plus fin, sinon la tête fusionne -->
    ${limb(shX - 3, 128, shX + 1, 142, 13)}
    <circle cx="${shX - 8}" cy="107" r="21" />
    ${hat ? `<path d="M${shX - 32},103 a24,24 0 0 1 48,-5 l2,8 z" />` : ""}
    ${front}
    ${rig}
  </g>`;
}

/** Caméra sur trépied, objectif tourné vers le ciel. */
function tripod() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="80" cy="256" rx="70" ry="6" />
    ${limb(80, 92, 16, 254, 7)}
    ${limb(80, 92, 82, 256, 7)}
    ${limb(80, 92, 144, 250, 7)}
    ${limb(34, 190, 76, 202, 4)}
    ${limb(76, 202, 128, 188, 4)}
    <rect x="62" y="74" width="36" height="20" rx="4" />
    <rect x="40" y="34" width="76" height="44" rx="7" />
    <path d="M116,44 L140,36 L140,68 L116,60 Z" />
    <rect x="52" y="20" width="30" height="12" rx="5" />
    <circle class="pj-rec" cx="46" cy="42" r="4.5" />
  </g>`;
}

/**
 * Pickup vu de trois quarts arrière, comme sur la clé d'affiche : la masse
 * sombre, les deux feux rouges, la plaque, la fumée d'échappement.
 */
function pickup() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="272" cy="236" rx="216" ry="9" />
    <!-- roues : la plus proche à droite, la plus lointaine plus haute et plus petite -->
    <ellipse cx="306" cy="212" rx="30" ry="32" />
    <ellipse cx="132" cy="190" rx="23" ry="25" />
    <!-- capot, le plus loin : plus haut, plus petit -->
    <path d="M48,126 L52,100 L112,94 L114,126 Z" />
    <!-- cabine -->
    <path d="M106,124 L112,66 L146,54 L212,52 L232,70 L240,124 Z" />
    <!-- flanc de benne, qui fuit vers la gauche -->
    <path d="M110,118 L306,112 L306,201 L110,189 Z" />
    <!-- face arrière : le hayon, tourné vers nous -->
    <path d="M300,110 L456,104 L458,209 L300,201 Z" />
    <!-- ridelle : le liseré haut de la benne accroche la lumière -->
    <path class="pj-rail" d="M110,118 L306,111 L456,104" />
    <!-- pare-chocs -->
    <path d="M294,203 L462,211 L462,231 L294,223 Z" />
    <!-- feux arrière : celui de droite est plus près, donc plus grand -->
    <g class="pj-lamps">
      <rect x="318" y="138" width="26" height="30" rx="6" />
      <rect x="406" y="130" width="32" height="34" rx="6" />
    </g>
    <!-- plaque -->
    <g class="pj-plate">
      <rect x="344" y="174" width="58" height="22" rx="3" />
      <text x="373" y="190" text-anchor="middle">R57-A11</text>
    </g>
    <!-- fumée d'échappement -->
    <g class="pj-smoke">
      <ellipse cx="476" cy="218" rx="26" ry="16" />
      <ellipse cx="500" cy="200" rx="17" ry="12" />
      <ellipse cx="516" cy="186" rx="10" ry="8" />
    </g>
  </g>`;
}

/** Panneau routier — le vrai panneau des repérages. */
function roadsign() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="75" cy="207" rx="28" ry="4" />
    ${limb(75, 76, 75, 207, 7)}
    <rect class="pj-signplate" x="3" y="6" width="144" height="70" rx="3" />
    <g class="pj-signtext">
      <text x="12" y="27">INDIAN SPRINGS</text>
      <text x="138" y="27" text-anchor="end">13</text>
      <text x="12" y="48">JCT SR-160</text>
      <text x="138" y="48" text-anchor="end">36</text>
      <text x="12" y="69">TONOPAH</text>
      <text x="138" y="69" text-anchor="end">175</text>
    </g>
  </g>`;
}

/** L'étoile filante : un trait qui se retrace tout seul, de loin en loin. */
function meteor() {
  return `<g class="pj-meteor-art">
    <defs>
      <linearGradient id="pjTrail" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#fffaee" stop-opacity="0" />
        <stop offset="0.72" stop-color="#fffaee" stop-opacity="0.36" />
        <stop offset="1" stop-color="#fffdf4" stop-opacity="0.95" />
      </linearGradient>
    </defs>
    <path class="pj-mhit" d="M14,18 L268,140" stroke="transparent" stroke-width="36" stroke-linecap="round" fill="none" />
    <path class="pj-trail" d="M14,18 L268,140" stroke="url(#pjTrail)" stroke-width="2.2" stroke-linecap="round" fill="none" pathLength="1" />
    <circle class="pj-head" cx="268" cy="140" r="3.4" />
  </g>`;
}

/* ------------------------------------------------------------ la scène   */

const ART = {
  arthur: { vb: [220, 260], x: 574, y: 730, w: 208, art: () => seated({ arm: "point" }) },
  axel: { vb: [220, 260], x: 708, y: 740, w: 212, art: () => seated({ arm: "camera", hat: true }), alt: () => seated({ arm: "rest", hat: true }) },
  camera: { vb: [160, 262], x: 388, y: 708, w: 128, art: tripod },
  pickup: { vb: [500, 262], x: 1118, y: 792, w: 428, art: pickup },
  panneau: { vb: [150, 214], x: 156, y: 686, w: 144, art: roadsign },
  meteore: { vb: [290, 160], x: 1046, y: 336, w: 300, art: meteor },
  logo: { vb: [900, 339], x: 690, y: 272, w: 330 },
};

/** Un élément cliquable de la scène. */
function element(el) {
  const a = ART[el.id];
  const style = place(a.x, a.y, a.w, a.vb);
  const inner =
    el.id === "logo"
      ? `<img class="pj-wordmark" src="/cosmic-logo.webp" alt="" width="900" height="339" />`
      : `<svg class="pj-art" viewBox="0 0 ${a.vb[0]} ${a.vb[1]}" aria-hidden="true" focusable="false">
      ${a.alt
        ? `<g class="pj-avant">${a.art()}</g><g class="pj-apres">${a.alt()}</g>`
        : a.art()}
    </svg>`;

  return `<button type="button" class="pj-el pj-el--${esc(el.id)}" data-el="${esc(el.id)}" style="${style}">
    ${inner}
    <span class="sr-only">${esc(el.label)} — afficher sa réplique</span>
  </button>`;
}

/**
 * Les répliques, en clair dans la page mais réservées aux lecteurs d'écran.
 * C'est la source unique : le bandeau vient y puiser plutôt que de recopier
 * les textes dans le script. Sans JavaScript, le contenu reste lisible.
 */
function transcriptSource(elements) {
  const blocks = elements
    .map(
      (el) => `<article id="pj-src-${esc(el.id)}">
      <h3>${esc(el.label)}</h3>
      ${["avant", "apres"]
        .map(
          (state) => `<div data-state="${state}">
        ${el[state].map((line) => `<p class="pj-say">${esc(line)}</p>`).join("")}
        <p class="pj-cred">${esc(el.credit[state])}</p>
      </div>`
        )
        .join("")}
    </article>`
    )
    .join("\n    ");

  return `<div class="pj-source sr-only">
    <h2>Les éléments de la scène</h2>
    ${blocks}
  </div>`;
}

const SYNOPSIS = [
  `<strong>L'Incident d'Indian Springs</strong> est un long métrage indépendant français, found footage horreur / thriller, tourné entre la France et le désert du Nevada — à Jean Dry Lake, à quelques dizaines de kilomètres d'Indian Springs.`,
  `Axel et Arthur partageaient depuis des années leur passion du ciel sur leur chaîne YouTube, Cosmic Review. Après la mort d'Arthur, Axel rallume une dernière fois la caméra et part seul dans le désert tourner leur 51ᵉ vlog, resté en projet. En suivant des coordonnées laissées par son ami, il s'enfonce dans une région où plus rien ne tourne rond.`,
  `Le désert y est traité comme un personnage à part entière : plans-séquences, lumière naturelle, mise en scène discrète, et une bascule progressive de l'énergie du vlog vers l'horreur brute.`,
];

export function sceneProjet(data) {
  const { elements, slate, hint } = data;

  return `<section class="scene scene--projet" id="scene-le-projet" data-scene="le-projet" data-state="avant"
  data-slate="${esc(JSON.stringify(slate))}" data-hints="${esc(JSON.stringify(hint))}"
  aria-labelledby="projet-title">
  <h1 class="sr-only" id="projet-title">Le Projet</h1>

  <div class="pj-viewport" tabindex="-1">
    <div class="pj-stage">
      <div class="pj-sky" aria-hidden="true"></div>
      <div class="pj-horizonglow" aria-hidden="true"></div>
      ${terrain()}
      <div class="pj-groundlight" aria-hidden="true"></div>
      <div class="pj-lightspill" aria-hidden="true"></div>
      <div class="pj-elements">
        ${elements.map(element).join("\n        ")}
      </div>
      <p class="pj-filmtitle" aria-hidden="true">L'Incident d'Indian Springs</p>
      <div class="pj-grain" aria-hidden="true"></div>
    </div>
  </div>

  <div class="pj-transcript" id="pj-transcript">
    <div class="pj-slate" aria-hidden="true">
      <span class="pj-rec-dot"></span>
      <span class="pj-vlog" data-slate="vlog">${esc(slate.avant.vlog)}</span>
      <span class="pj-tc" data-slate="tc">${esc(slate.avant.tc)}</span>
      <span class="pj-date" data-slate="date">${esc(slate.avant.date)}</span>
      <span class="pj-place">JEAN DRY LAKE · NV</span>
      <span class="pj-count" data-count>0/${elements.length}</span>
    </div>
    <p class="pj-line" aria-hidden="true"></p>
    <p class="pj-credit" aria-hidden="true"></p>
    <p class="pj-cue"><span data-hint>${esc(hint.avant)}</span><span class="pj-swipe">Faites glisser le désert pour voir toute la scène</span></p>
    <p class="sr-only" id="pj-live" aria-live="polite"></p>
    <div class="pj-actions">
      <button type="button" class="pj-act pj-act--end" data-end hidden>Fin de l'enregistrement</button>
      <button type="button" class="pj-act pj-act--rewind" data-rewind hidden>Revoir le vlog 50</button>
      <button type="button" class="pj-act pj-act--info" data-info aria-expanded="false" aria-controls="pj-panel">Le film en trois lignes</button>
    </div>
  </div>

  <div class="pj-panel" id="pj-panel" hidden>
    <div class="pj-panel-card" role="dialog" aria-modal="true" aria-labelledby="pj-panel-title">
      <button type="button" class="pj-panel-close" data-close aria-label="Fermer">×</button>
      <p class="eyebrow">Le film</p>
      <h2 id="pj-panel-title">L'Incident d'Indian Springs</h2>
      ${SYNOPSIS.map((p) => `<p>${p}</p>`).join("\n      ")}
      <a class="pj-panel-link" href="/partenaires" data-goto="partenaires">Soutenir le film</a>
    </div>
  </div>

  <a class="scene-back" href="/" data-goto="ciel">Retour au ciel</a>

${transcriptSource(elements)}
</section>`;
}
