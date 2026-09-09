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

/**
 * Le décor du sol, en deux versions.
 *
 * `bands` ne garde que ce qui est invariant horizontalement — la crête
 * lointaine et la plaine. Cette version-là est étirée sur toute la largeur de
 * l'écran, derrière le cadre : c'est elle qui fait que le désert touche les
 * bords même quand le cadre, lui, reste entier au milieu.
 *
 * La version complète (buttes, craquelures, buissons) reste dans le cadre, à
 * son échelle : on n'étire jamais une forme reconnaissable.
 */
function terrain(mode = "full") {
  const wide = mode === "bands";
  const id = (name) => name + (wide ? "W" : "");
  if (wide) return `<svg class="pj-bands" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="${id("pjPlain")}" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#77502f" />
      <stop offset="0.1" stop-color="#5a3a20" />
      <stop offset="0.3" stop-color="#2e1c10" />
      <stop offset="0.62" stop-color="#120b06" />
      <stop offset="1" stop-color="#060404" />
    </linearGradient>
    <linearGradient id="${id("pjFar")}" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON - 40}" x2="0" y2="${HORIZON}">
      <stop offset="0" stop-color="#4a3020" stop-opacity="0.55" />
      <stop offset="1" stop-color="#3a2416" />
    </linearGradient>
  </defs>
  <path fill="url(#${id("pjFar")})" d="M0,${HORIZON - 7} L120,${HORIZON - 10} L280,${HORIZON - 6} L420,${HORIZON - 12} L560,${HORIZON - 7} L700,${HORIZON - 11} L860,${HORIZON - 6} L1000,${HORIZON - 12} L1160,${HORIZON - 7} L1300,${HORIZON - 10} L1440,${HORIZON - 6} L1440,${HORIZON + 2} L0,${HORIZON + 2} Z" />
  <path fill="url(#${id("pjPlain")})" d="M0,${HORIZON} L1440,${HORIZON - 2} L1440,${H} L0,${H} Z" />
  <!-- premier plan presque noir : il court d'un bord de l'écran à l'autre -->
  <path fill="#080605" d="M0,846 L180,840 L380,852 L560,844 L760,856 L960,846 L1160,858 L1340,848 L1440,855 L1440,${H} L0,${H} Z" />
</svg>`;

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

</svg>`;
}


/* --------------------------------------------------- le décor de la cour */

/**
 * La cour, nord de la France. Un bâtiment long et bas, deux fenêtres
 * allumées, une haie, un champ. On ne marque pas la ferme : pas de tracteur,
 * pas de bottes de paille — c'est une maison, on ne dit pas laquelle.
 *
 * Les fenêtres sont la seule source chaude de l'image : ce sont elles qui
 * détourent les deux amis, et c'est leur absence qui rendra le désert froid.
 */
function cour(mode = "full") {
  const wide = mode === "bands";
  const id = (name) => name + (wide ? "W" : "");

  const defs = `
    <linearGradient id="${id("cSol")}" gradientUnits="userSpaceOnUse" x1="0" y1="${HORIZON}" x2="0" y2="${H}">
      <stop offset="0" stop-color="#1b1a1e" />
      <stop offset="0.14" stop-color="#141317" />
      <stop offset="0.46" stop-color="#0c0b0f" />
      <stop offset="1" stop-color="#050508" />
    </linearGradient>`;

  if (wide) return `<svg class="pj-bands pj-bands--cour" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>${defs}</defs>
  <path fill="#0e0e12" d="M0,${HORIZON - 5} L1440,${HORIZON - 5} L1440,${HORIZON + 2} L0,${HORIZON + 2} Z" />
  <path fill="url(#${id("cSol")})" d="M0,${HORIZON} L1440,${HORIZON} L1440,${H} L0,${H} Z" />
</svg>`;

  const r = rng(4041);
  // haie et champ, à droite du bâtiment
  let haie = "";
  for (let x = 690; x < 1470; x += 17) {
    const h = 11 + r() * 17;
    haie += `<path d="M${x},${HORIZON + 4} q${8.5},-${n(h)} ${17},0 Z" />`;
  }

  // gravier de la cour : quelques éclats qui accrochent la lumière des fenêtres
  let gravier = "";
  for (let i = 0; i < 40; i++) {
    const t = r();
    const y = HORIZON + 20 + Math.pow(t, 1.5) * 200;
    const x = 40 + r() * 900;
    gravier += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(1.6 + t * 3)}" ry="${n(0.7 + t * 1.2)}" opacity="${n(0.05 + 0.13 * (1 - t))}" />`;
  }

  return `<svg class="pj-decor pj-decor--cour" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
  <defs>${defs}
    <radialGradient id="cChaud" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#ffb15e" stop-opacity="0.5" />
      <stop offset="0.55" stop-color="#c9762e" stop-opacity="0.16" />
      <stop offset="1" stop-color="#c9762e" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- le champ derrière la haie -->
  <path fill="#101015" d="M0,${HORIZON - 5} L1440,${HORIZON - 7} L1440,${HORIZON + 2} L0,${HORIZON + 2} Z" />

  <!-- la cour -->
  <path fill="url(#cSol)" d="M0,${HORIZON} L1440,${HORIZON} L1440,${H} L0,${H} Z" />

  <!-- la haie -->
  <g fill="#0b0b0e">${haie}</g>

  <!-- le bâtiment : long, bas, deux niveaux de toiture -->
  <g fill="#0a0a0d">
    <path d="M18,${HORIZON} L18,522 L352,424 L688,522 L688,${HORIZON} Z" />
    <path d="M4,528 L352,414 L700,528 L688,540 L352,432 L16,540 Z" />
    <rect x="214" y="392" width="34" height="58" />
    <path d="M688,${HORIZON} L688,568 L768,540 L846,568 L846,${HORIZON} Z" />
    <path d="M678,572 L768,532 L856,572 L846,582 L768,544 L688,582 Z" />
  </g>

  <!-- la lueur des fenêtres, projetée dans la cour -->
  <ellipse cx="300" cy="${HORIZON + 46}" rx="330" ry="86" fill="url(#cChaud)" />

  <g fill="#0d0d10">${gravier}</g>

  <!-- premier plan, d'un bord à l'autre -->
  <path fill="#07070a" d="M0,842 L200,836 L420,848 L640,840 L880,852 L1120,842 L1340,852 L1440,846 L1440,${H} L0,${H} Z" />
</svg>`;
}

/* -------------------------------------------------------- les silhouettes */

/** Un membre : trait épais à bouts ronds. Les traits se fondent en une masse. */

/** Debout, de profil, en train de parler à la caméra : un bras qui commente. */
function debout({ arm = "talk", hat = false } = {}) {
  let bras;
  if (arm === "talk") {
    bras =
      `<circle cx="118" cy="96" r="13" />` +
      limb(118, 96, 150, 132, 19) +
      limb(150, 132, 142, 84, 15);
  } else {
    // bras qui tombent le long du corps : c'est la posture de quelqu'un qui
    // attend, seul, et qui ne commente plus rien
    bras =
      `<circle cx="118" cy="96" r="13" />` +
      limb(118, 98, 126, 152, 18) +
      limb(126, 152, 124, 206, 14);
  }

  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="104" cy="290" rx="66" ry="6" />
    <!-- jambe éloignée -->
    ${limb(98, 176, 82, 232, 25)}
    ${limb(82, 232, 78, 286, 18)}
    ${limb(78, 286, 54, 290, 13)}
    <!-- bras éloigné -->
    ${limb(84, 98, 76, 150, 17)}
    ${limb(76, 150, 78, 202, 14)}
    <!-- torse -->
    ${limb(102, 178, 100, 92, 50)}
    ${limb(78, 94, 124, 96, 34)}
    <!-- jambe proche -->
    ${limb(106, 178, 120, 230, 26)}
    ${limb(120, 230, 124, 288, 19)}
    ${limb(124, 288, 150, 292, 14)}
    <!-- cou et tête -->
    ${limb(100, 76, 102, 92, 13)}
    <circle cx="100" cy="52" r="20" />
    ${hat ? `<path d="M77,49 a23,23 0 0 1 46,-4 l2,8 z" />` : ""}
    ${bras}
  </g>`;
}

/** Penché sur l'oculaire : le dos rond, une main sur la molette de mise au point. */
function penche() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="120" cy="290" rx="70" ry="6" />
    <!-- jambes écartées, appui avant -->
    ${limb(126, 186, 106, 236, 25)}
    ${limb(106, 236, 100, 286, 18)}
    ${limb(100, 286, 76, 291, 13)}
    ${limb(130, 188, 152, 234, 26)}
    ${limb(152, 234, 158, 288, 19)}
    ${limb(158, 288, 184, 292, 14)}
    <!-- torse penché vers l'avant-gauche -->
    ${limb(128, 190, 90, 112, 48)}
    ${limb(70, 110, 112, 118, 33)}
    <!-- bras qui tient la molette -->
    ${limb(78, 116, 54, 146, 17)}
    ${limb(54, 146, 42, 112, 14)}
    <!-- bras qui pend -->
    ${limb(104, 120, 116, 168, 17)}
    ${limb(116, 168, 110, 202, 14)}
    <!-- cou et tête, baissés vers l'oculaire -->
    ${limb(84, 100, 92, 114, 14)}
    <circle cx="72" cy="82" r="22" />
  </g>`;
}

/** Le télescope sur sa monture : tube pointé vers le haut à droite. */
function telescope() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="104" cy="292" rx="76" ry="6" />
    ${limb(104, 168, 38, 290, 8)}
    ${limb(104, 168, 106, 292, 8)}
    ${limb(104, 168, 170, 286, 8)}
    ${limb(48, 226, 104, 240, 5)}
    ${limb(104, 240, 160, 224, 5)}
    <rect x="86" y="146" width="36" height="30" rx="5" />
    <!-- le tube -->
    ${limb(64, 200, 178, 52, 34)}
    <!-- chercheur -->
    ${limb(96, 168, 150, 98, 9)}
    <!-- oculaire -->
    ${limb(72, 194, 44, 214, 13)}
  </g>`;
}

/** Le carnet ouvert sur une caisse : la seule tache claire au sol. */
function carnet() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="100" cy="196" rx="72" ry="6" />
    <path d="M38,132 L162,132 L156,192 L44,192 Z" />
    ${limb(50, 138, 56, 190, 9)}
    ${limb(150, 138, 144, 190, 9)}
    <!-- le carnet, pages ouvertes : la seule tache claire de toute la scène -->
    <g class="pj-paper">
      <path d="M34,130 L100,108 L100,126 L38,142 Z" />
      <path d="M166,130 L100,108 L100,126 L162,142 Z" />
    </g>
    <g class="pj-scribble">
      <path d="M50,132 L88,120 M54,137 L84,127 M112,120 L150,132 M116,127 L146,137" />
    </g>
  </g>`;
}

/** La fenêtre allumée : la seule chose chaude de toute la scène. */
function fenetre() {
  return `<g class="pj-window">
    <rect class="pj-pane" x="16" y="14" width="66" height="72" rx="2" />
    <rect class="pj-pane" x="98" y="14" width="66" height="72" rx="2" />
    <g class="pj-mullion">
      <path d="M49,14 L49,86 M16,48 L82,48 M131,14 L131,86 M98,48 L164,48" />
    </g>
    <rect class="pj-frame" x="10" y="8" width="78" height="84" rx="3" />
    <rect class="pj-frame" x="92" y="8" width="78" height="84" rx="3" />
  </g>`;
}

/**
 * La jeep, de trois quarts arrière. Caisse carrée, capote, roue de secours
 * sur le hayon, deux feux ronds : la silhouette doit se lire d'un coup et ne
 * pas pouvoir être confondue avec le pickup de la clé d'affiche.
 */
function jeep() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="240" cy="252" rx="196" ry="9" />

    <!-- roues : garde au sol franche, c'est ce qui distingue une jeep -->
    <ellipse cx="372" cy="222" rx="33" ry="34" />
    <ellipse cx="120" cy="204" rx="27" ry="28" />

    <!-- capot, le plus loin -->
    <path d="M52,126 L56,108 L98,104 L100,126 Z" />

    <!-- caisse : flanc qui fuit vers la gauche, hayon face à nous -->
    <path d="M90,116 L250,106 L250,204 L90,190 Z" />
    <path d="M248,104 L400,100 L402,210 L248,204 Z" />

    <!-- capote : mêmes flancs droits que la caisse, arête franche -->
    <path d="M96,118 L106,56 L246,48 L250,106 Z" />
    <path d="M246,48 L394,44 L400,100 L248,104 Z" />
    <path class="pj-rail" d="M96,116 L106,56 L246,48 L394,44" />
    <path class="pj-rail" d="M250,106 L250,204" />

    <!-- lunette arrière -->
    <path class="pj-glass" d="M274,58 L378,53 L380,90 L274,94 Z" />

    <!-- roue de secours boulonnée sur le hayon -->
    <circle class="pj-tyre" cx="326" cy="152" r="39" />
    <circle class="pj-rim" cx="326" cy="152" r="20" />

    <!-- pare-chocs -->
    <path d="M242,206 L410,212 L410,230 L242,224 Z" />

    <!-- feux ronds -->
    <g class="pj-lamps">
      <circle cx="264" cy="184" r="11" />
      <circle cx="386" cy="188" r="11" />
    </g>

    <!-- plaque, décalée sous la roue -->
    <g class="pj-plate">
      <rect x="288" y="196" width="56" height="21" rx="3" />
      <text x="316" y="212" text-anchor="middle">R57-A11</text>
    </g>

    <!-- fumée d'échappement -->
    <g class="pj-smoke">
      <ellipse cx="426" cy="222" rx="24" ry="15" />
      <ellipse cx="448" cy="206" rx="16" ry="11" />
    </g>
  </g>`;
}

/** Caméra sur trépied, objectif tourné vers les deux amis. */
function tripod() {
  return `<g class="pj-body">
    <ellipse class="pj-contact" cx="80" cy="256" rx="70" ry="6" />
    ${limb(80, 92, 16, 254, 7)}
    ${limb(80, 92, 82, 256, 7)}
    ${limb(80, 92, 144, 250, 7)}
    ${limb(34, 190, 76, 202, 4)}
    ${limb(76, 202, 128, 188, 4)}
    <rect x="62" y="74" width="36" height="20" rx="4" />
    <rect x="44" y="34" width="76" height="44" rx="7" />
    <path d="M44,44 L20,36 L20,68 L44,60 Z" />
    <rect x="82" y="20" width="30" height="12" rx="5" />
    <circle class="pj-rec" cx="116" cy="42" r="4.5" />
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

/* ------------------------------------------------------------ la scène   */

/**
 * Où chaque élément se pose, dans le repère 1440 × 900.
 *
 * La cour en compte six, le désert trois. Aucun n'occupe la place d'un autre :
 * après l'éclair, ce ne sont pas des remplacements, ce sont des absences.
 */
const ART = {
  cour: {
    fenetre: { vb: [180, 100], x: 262, y: 616, w: 232, art: fenetre },
    telescope: { vb: [220, 300], x: 806, y: 742, w: 196, art: telescope },
    arthur: { vb: [220, 300], x: 902, y: 748, w: 190, art: penche },
    axel: { vb: [200, 300], x: 1042, y: 762, w: 186, art: () => debout({ arm: "talk", hat: true }) },
    carnet: { vb: [200, 200], x: 620, y: 796, w: 150, art: carnet },
    camera: { vb: [160, 262], x: 1276, y: 812, w: 148, art: tripod },
  },
  desert: {
    panneau: { vb: [150, 214], x: 214, y: 690, w: 150, art: roadsign },
    "axel-seul": { vb: [200, 300], x: 636, y: 772, w: 224, art: () => debout({ arm: "rest", hat: true }) },
    jeep: { vb: [440, 262], x: 1128, y: 806, w: 412, art: jeep },
  },
};

/** Un élément cliquable de la scène. */
function element(el, state) {
  const a = ART[state][el.id];
  return `<button type="button" class="pj-el pj-el--${esc(el.id)}" data-el="${esc(el.id)}"
    style="${place(a.x, a.y, a.w, a.vb)}">
    <svg class="pj-art" viewBox="0 0 ${a.vb[0]} ${a.vb[1]}" aria-hidden="true" focusable="false">${a.art()}</svg>
    <span class="sr-only">${esc(el.label)} — afficher sa réplique</span>
  </button>`;
}

/**
 * Les répliques, en clair dans la page mais réservées aux lecteurs d'écran.
 * C'est la source unique : le bandeau vient y puiser plutôt que de recopier
 * les textes dans le script. Sans JavaScript, le contenu reste lisible.
 */
function transcriptSource(elements) {
  const bloc = (state, list) => `<section>
      <h3>${state === "cour" ? "Vlog 50 — la cour" : "Vlog 51 — Jean Dry Lake"}</h3>
      ${list
        .map(
          (el) => `<article id="pj-src-${esc(el.id)}">
        <h4>${esc(el.label)}</h4>
        ${el.lines.map((line) => `<p class="pj-say">${esc(line)}</p>`).join("")}
        <p class="pj-cred">${esc(el.credit)}</p>
      </article>`
        )
        .join("\n      ")}
    </section>`;

  return `<div class="pj-source sr-only">
    <h2>Les éléments de la scène</h2>
    ${bloc("cour", elements.cour)}
    ${bloc("desert", elements.desert)}
  </div>`;
}

const SYNOPSIS = [
  `<strong>L'Incident d'Indian Springs</strong> est un long métrage indépendant français, found footage horreur / thriller, tourné entre le nord de la France et le désert du Nevada — à Jean Dry Lake, à quelques dizaines de kilomètres d'Indian Springs.`,
  `Axel et Arthur partageaient depuis des années leur passion du ciel sur leur chaîne YouTube, Cosmic Review. Après la mort d'Arthur, Axel rallume une dernière fois la caméra et part seul dans le désert tourner leur 51ᵉ vlog, resté en projet. En suivant des coordonnées laissées par son ami, il s'enfonce dans une région où plus rien ne tourne rond.`,
  `Le désert y est traité comme un personnage à part entière : plans-séquences, lumière naturelle, mise en scène discrète, et une bascule progressive de l'énergie du vlog vers l'horreur brute.`,
];

export function sceneProjet(data) {
  const { elements, slate, hint } = data;

  return `<section class="scene scene--projet" id="scene-le-projet" data-scene="le-projet" data-state="cour"
  data-slate="${esc(JSON.stringify(slate))}" data-hints="${esc(JSON.stringify(hint))}"
  aria-labelledby="projet-title">
  <h1 class="sr-only" id="projet-title">Le Projet</h1>

  <!-- Le ciel couvre tout l'écran : c'est du décor, il peut être rogné.
       Au-dessus de la cour il est voilé ; l'éclair l'ouvre en grand. -->
  <div class="pj-sky" aria-hidden="true"></div>
  <div class="pj-haze" aria-hidden="true"></div>

  <div class="pj-viewport" tabindex="-1">
    <div class="pj-stage">
      ${cour("bands")}
      ${terrain("bands")}
      <div class="pj-horizonglow" aria-hidden="true"></div>
      ${cour()}
      ${terrain()}
      <div class="pj-groundlight" aria-hidden="true"></div>
      <div class="pj-lightspill" aria-hidden="true"></div>

      <div class="pj-elements pj-elements--cour">
        ${elements.cour.map((el) => element(el, "cour")).join("\n        ")}
      </div>
      <div class="pj-elements pj-elements--desert">
        ${elements.desert.map((el) => element(el, "desert")).join("\n        ")}
      </div>

      <img class="pj-wordmark" src="/cosmic-logo.webp" alt="" width="900" height="339" aria-hidden="true" />
      <p class="pj-filmtitle" aria-hidden="true">L'Incident d'Indian Springs</p>
    </div>
  </div>

  <div class="pj-vignette" aria-hidden="true"></div>
  <div class="pj-grain" aria-hidden="true"></div>
  <div class="pj-flash" aria-hidden="true"></div>

  <div class="pj-transcript" id="pj-transcript">
    <div class="pj-slate" aria-hidden="true">
      <span class="pj-rec-dot"></span>
      <span class="pj-vlog" data-slate="vlog">${esc(slate.cour.vlog)}</span>
      <span class="pj-tc" data-slate="tc">${esc(slate.cour.tc)}</span>
      <span class="pj-date" data-slate="date">${esc(slate.cour.date)}</span>
      <span class="pj-place" data-slate="lieu">${esc(slate.cour.lieu)}</span>
      <span class="pj-count" data-count>0/${elements.cour.length}</span>
    </div>
    <p class="pj-line" aria-hidden="true"></p>
    <p class="pj-credit" aria-hidden="true"></p>
    <p class="pj-cue"><span data-hint>${esc(hint.cour)}</span><span class="pj-swipe">Faites glisser la scène pour la voir en entier</span></p>
    <p class="sr-only" id="pj-live" aria-live="polite"></p>
    <div class="pj-actions">
      <button type="button" class="pj-act pj-act--end" data-end hidden>Fin de l'enregistrement</button>
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
