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

import { rng, n, esc, circle, path, wobble, ticks, ch, pen } from "./draw.js";
import { calquesCarnet } from "./carnet.js";

export { esc };
const pc = (v, total) => n((v / total) * 100) + "%";

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


/* ----------------------------------------------- les objets, à la craie ----

 Exactement le trait du dessin de l'équipe (`Présentation projet/Photos/
 team.jpg`) et de la scène Équipe : mêmes classes CSS (`ch`, `ch-limb`,
 `ch-tick`, `ch-doodle`…), même craie, mêmes épaisseurs, mêmes opacités. Les
 règles vivent dans `chalk.css` — on ne les redéfinit pas ici, on s'en sert.

 La signature, ce sont les petits traits perpendiculaires (`ch-tick`) le long
 de chaque membre : sans eux, un trait reste du vectoriel propre.

 Chaque trait porte `pathLength="1"` et un délai `--d` : le dessin se fait —
 et se défait — trait après trait, à vitesse constante.
 --------------------------------------------------------------------------- */

/* ----------------------------------------------------------- les personnes */

/**
 * Une figure en bâton, dans le style exact de `team.jpg` : un trait par
 * membre, une tête ronde, et la texture perlée par-dessus.
 * `arm` : "talk" (bras qui commente) ou "rest" (bras le long du corps).
 */
function debout({ arm = "talk", hat = false, seed = 21 } = {}) {
  const p = pen(seed);
  const HEAD = 78, SHO = 104, HIP = 186, FOOT = 290;
  const cx = 100;
  const brasAv = arm === "talk" ? [152, 78] : [128, 208];

  return `<g class="pj-draw">
    ${p.round(cx, 54, 22, { cls: "ch-limb ch-draw", wob: 0.05 })}
    ${hat ? p.line([[cx - 24, 48], [cx - 18, 32], [cx + 18, 30], [cx + 24, 46]], { cls: "ch-limb ch-draw", amp: 1 }) : ""}
    ${p.seg(cx, HEAD, cx, HIP)}
    ${p.seg(cx, SHO, 58, 196)}
    ${p.seg(cx, SHO, brasAv[0], brasAv[1])}
    ${p.seg(cx, HIP, 62, FOOT)}
    ${p.seg(cx, HIP, 138, FOOT)}
    ${p.seg(56, FOOT, 38, FOOT - 4, { amp: 0.6 })}
    ${p.seg(144, FOOT, 162, FOOT - 4, { amp: 0.6 })}
    ${p.grain([
      [cx, HEAD, cx, HIP, 6],
      [cx, SHO, 58, 196, 5],
      [cx, SHO, brasAv[0], brasAv[1], 5],
      [cx, HIP, 62, FOOT, 6],
      [cx, HIP, 138, FOOT, 6],
    ])}
    ${p.hit()}
  </g>`;
}

/** Penché sur l'oculaire : le dos incliné, une main sur la molette. */
function penche() {
  const p = pen(33);
  const HEAD = 104, SHO = 122, HIP = 190, FOOT = 292;
  return `<g class="pj-draw">
    ${p.round(72, 82, 21, { cls: "ch-limb ch-draw", wob: 0.05 })}
    ${p.seg(78, HEAD, 128, HIP)}
    ${p.seg(88, SHO, 44, 112)}
    ${p.seg(92, SHO, 112, 202)}
    ${p.seg(128, HIP, 96, FOOT)}
    ${p.seg(128, HIP, 160, FOOT)}
    ${p.seg(90, FOOT, 72, FOOT - 4, { amp: 0.6 })}
    ${p.seg(166, FOOT, 186, FOOT - 4, { amp: 0.6 })}
    ${p.grain([
      [78, HEAD, 128, HIP, 6],
      [88, SHO, 44, 112, 5],
      [92, SHO, 112, 202, 5],
      [128, HIP, 96, FOOT, 6],
      [128, HIP, 160, FOOT, 6],
    ])}
    ${p.hit()}
  </g>`;
}

/* -------------------------------------------------------------- les objets */

/** Le télescope sur son trépied, tube pointé vers le haut à droite. */
function telescope() {
  const p = pen(47);
  const a = [66, 198], b = [176, 54];
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
  const ox = (-dy / len) * 15, oy = (dx / len) * 15;
  return `<g class="pj-draw">
    ${p.seg(104, 166, 40, 290)}
    ${p.seg(104, 166, 106, 292)}
    ${p.seg(104, 166, 168, 286)}
    ${p.seg(52, 230, 158, 226, { cls: "ch-doodle ch-draw", amp: 1.8 })}
    ${p.line([[a[0] + ox, a[1] + oy], [b[0] + ox, b[1] + oy], [b[0] - ox, b[1] - oy], [a[0] - ox, a[1] - oy]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.seg(b[0] + ox, b[1] + oy, b[0] - ox, b[1] - oy, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.seg(100, 160, 150, 96, { cls: "ch-doodle ch-draw" })}
    ${p.line([[76, 190], [52, 206], [60, 218], [84, 202]], { cls: "ch-doodle ch-draw", close: true, amp: 0.8 })}
    ${p.grain([[104, 166, 40, 290, 5], [104, 166, 106, 292, 5], [104, 166, 168, 286, 5]])}
    ${p.hit()}
  </g>`;
}

/** La caméra sur son trépied, objectif tourné vers les deux amis. */
function tripod() {
  const p = pen(59);
  return `<g class="pj-draw">
    ${p.seg(80, 92, 16, 254)}
    ${p.seg(80, 92, 82, 256)}
    ${p.seg(80, 92, 144, 250)}
    ${p.seg(36, 192, 126, 188, { cls: "ch-doodle ch-draw", amp: 1.8 })}
    ${p.line([[62, 74], [98, 74], [98, 94], [62, 94]], { cls: "ch-doodle ch-draw", close: true, amp: 0.9 })}
    ${p.line([[44, 34], [120, 34], [120, 78], [44, 78]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.line([[44, 44], [20, 36], [20, 68], [44, 60]], { cls: "ch-doodle ch-draw", close: true, amp: 0.8 })}
    ${p.line([[82, 20], [112, 20], [112, 32], [82, 32]], { cls: "ch-doodle ch-draw", close: true, amp: 0.7 })}
    ${p.fill('M112,38 a5,5 0 1 0 0.1,0 Z', 'pj-rec')}
    ${p.grain([[80, 92, 16, 254, 5], [80, 92, 82, 256, 5], [80, 92, 144, 250, 5]])}
    ${p.hit()}
  </g>`;
}

/** La fenêtre allumée : la lumière est réelle, le châssis est à la craie. */
function fenetre() {
  const p = pen(71);
  return `<g class="pj-draw pj-draw--window">
    ${p.fill('M16,14 L82,14 L82,86 L16,86 Z', 'pj-pane')}
    ${p.fill('M98,14 L164,14 L164,86 L98,86 Z', 'pj-pane')}
    ${p.line([[10, 8], [88, 8], [88, 92], [10, 92]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.line([[92, 8], [170, 8], [170, 92], [92, 92]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.seg(49, 10, 49, 90, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.seg(12, 48, 86, 48, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.seg(131, 10, 131, 90, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.seg(94, 48, 168, 48, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.hit()}
  </g>`;
}

/** Le carnet d'Arthur, ouvert au sol : un dessin dans le dessin. */
function carnet() {
  const p = pen(83);
  return `<g class="pj-draw">
    ${p.fill('M98,32 L46,38 L16,80 L98,74 Z', 'pj-paper')}
    ${p.fill('M102,32 L154,38 L184,80 L102,74 Z', 'pj-paper pj-paper--lit')}
    ${p.line([[98, 32], [46, 38], [16, 80], [98, 74]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.line([[102, 32], [154, 38], [184, 80], [102, 74]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.seg(100, 33, 100, 74, { cls: "ch-doodle ch-draw", amp: 0.6 })}
    ${p.seg(54, 45, 92, 42, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.seg(48, 53, 92, 50, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.seg(42, 61, 92, 58, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.seg(36, 69, 74, 66, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.seg(108, 44, 146, 47, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.seg(108, 68, 166, 72, { cls: "ch-tick ch-draw", amp: 0.5 })}
    ${p.round(136, 58, 24, { cls: "ch-doodle ch-or ch-draw", wob: 0.13 })}
    ${p.hit()}
  </g>`;
}

/**
 * La jeep, de profil et vue de loin. De trois quarts arrière, une jeep est une
 * boîte ; de profil, c'est le capot court, le pare-brise droit, la capote
 * carrée et les deux roues nues qui la rendent reconnaissable d'un coup d'œil.
 * À cette distance, quelques traits suffisent — et doivent suffire.
 */
function jeep() {
  const p = pen(97, 0.12);
  // Proportions d'un Wrangler ramenées à l'échelle du dessin : 4,24 m de long
  // pour 1,83 m de haut, une roue qui fait 43 % de la hauteur totale, et le
  // bas de caisse à peine plus haut que le sommet des roues. C'est ce rapport
  // -là qui distingue une jeep d'un fourgon — pas les détails.
  return `<g class="pj-draw">
    <!-- La caisse d'un seul tenant : face avant droite, capot court,
         pare-brise presque vertical, capote carrée. Les passages de roue sont
         creusés dans le bas de caisse, pas posés dessus. -->
    ${p.line([
      [26, 112], [26, 84], [40, 78], [106, 76], [122, 40], [226, 38], [240, 80], [250, 84], [250, 112],
      [226, 112], [222, 100], [198, 90], [174, 100], [170, 112],
      [92, 112], [88, 100], [62, 90], [38, 100], [34, 112],
    ], { cls: "ch-limb ch-draw", close: true, amp: 1.1, segs: 3 })}

    <!-- montants et ouverture latérale -->
    ${p.seg(122, 42, 108, 76, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.seg(226, 40, 238, 78, { cls: "ch-doodle ch-draw", amp: 0.8 })}
    ${p.line([[128, 48], [220, 46], [220, 72], [130, 74]], { cls: "ch-doodle ch-draw", close: true, amp: 0.8 })}
    ${p.seg(172, 76, 172, 112, { cls: "ch-doodle ch-draw", amp: 0.7 })}

    <!-- les roues, nues sous la caisse -->
    ${p.round(62, 120, 26, { cls: "ch-limb ch-draw", wob: 0.04 })}
    ${p.round(198, 120, 26, { cls: "ch-limb ch-draw", wob: 0.04 })}
    ${p.round(62, 120, 9, { cls: "ch-doodle ch-draw", wob: 0.12 })}
    ${p.round(198, 120, 9, { cls: "ch-doodle ch-draw", wob: 0.12 })}

    <!-- la roue de secours, montée à l'arrière -->
    ${p.round(262, 88, 18, { cls: "ch-limb ch-draw", wob: 0.06 })}

    <!-- phare avant, et le feu arrière resté allumé -->
    ${p.round(32, 88, 5, { cls: "ch-doodle ch-draw", wob: 0.14 })}
    ${p.fill('M242,92 a5,5 0 1 0 0.1,0 Z', 'pj-lamp')}

    ${p.grain([[34, 112, 92, 112, 4], [170, 112, 226, 112, 4], [122, 41, 226, 39, 6]])}
    ${p.hit()}
  </g>`;
}

/** Le panneau routier — le vrai panneau des repérages. */
function roadsign() {
  const p = pen(109);
  return `<g class="pj-draw">
    ${p.seg(75, 76, 75, 207, { cls: "ch-limb ch-draw" })}
    ${p.line([[3, 6], [147, 6], [147, 76], [3, 76]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
    ${p.line([[9, 12], [141, 12], [141, 70], [9, 70]], { cls: "ch-doodle ch-draw", close: true, amp: 0.8 })}
    <g class="pj-signtext">
      <text x="16" y="29">INDIAN SPRINGS</text>
      <text x="134" y="29" text-anchor="end">13</text>
      <text x="16" y="48">JCT SR-160</text>
      <text x="134" y="48" text-anchor="end">36</text>
      <text x="16" y="67">TONOPAH</text>
      <text x="134" y="67" text-anchor="end">175</text>
    </g>
    ${p.grain([[75, 76, 75, 207, 7]])}
    ${p.hit()}
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
    carnet: { vb: [200, 110], x: 546, y: 806, w: 208, art: carnet },
    camera: { vb: [160, 262], x: 1276, y: 812, w: 148, art: tripod },
  },
  desert: {
    panneau: { vb: [150, 214], x: 214, y: 690, w: 150, art: roadsign },
    "axel-seul": { vb: [200, 300], x: 636, y: 772, w: 224, art: () => debout({ arm: "rest", hat: true }) },
    jeep: { vb: [290, 152], x: 1180, y: 716, w: 226, art: jeep },
  },
};

/** Décalage de départ de chaque objet : la main les trace l'un après l'autre. */
const ORDER = {
  fenetre: 0, telescope: 0.5, arthur: 1.1, axel: 1.9, carnet: 2.7, camera: 3.4,
  panneau: 0, "axel-seul": 0.4, jeep: 0.9,
};

/** Un élément cliquable de la scène. */
function element(el, state) {
  const a = ART[state][el.id];
  return `<button type="button" class="pj-el pj-el--${esc(el.id)}" data-el="${esc(el.id)}"
    style="${place(a.x, a.y, a.w, a.vb)};--o:${ORDER[el.id] || 0}s">
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

export function sceneProjet(data, carnet) {
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
  <div class="pj-milk" aria-hidden="true"></div>
  <div class="pj-wash" aria-hidden="true"></div>

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

  <!-- Ce qu'on trouve en insistant : le carnet d'Arthur et la cassette
       vierge. Les deux restent masquées jusqu'au second clic. -->
  ${carnet ? calquesCarnet(carnet) : ""}

${transcriptSource(elements)}
</section>`;
}
