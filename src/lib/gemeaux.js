/**
 * Cosmic Review — les Gémeaux.
 *
 * Le second easter egg de la scène « Le Projet », dans le désert. Un second
 * clic sur Axel ouvre la carte du ciel ; on y choisit les Gémeaux ; la
 * constellation vient se poser en haut à droite ; cinq clics sur Castor — la
 * figure de gauche, le frère mortel — griffent la pellicule jusqu'à ne
 * laisser qu'un trou blanc, et il ne reste plus rien au sol qu'une boîte.
 *
 * Même main que le reste du site : `draw.js` fournit le trait, `chalk.css`
 * les épaisseurs. Ce module ne produit que des chaînes au moment du build ;
 * les interactions sont dans `src/scripts/gemeaux.js`.
 *
 * Repères : la roue 1000 × 1000, les Gémeaux 400 × 520, le ciel 1440 × 900,
 * la boîte fermée 200 × 160 et ouverte 800 × 520.
 */

import { rng, n, esc, pen, ch, circle, wobble } from "./draw.js";
import { figureSeule } from "./chalk.js";

/* --------------------------------------------------- les douze figures ---

 Chaque constellation est une poignée d'étoiles dans une boîte de 100 × 100,
 et la liste des traits qui les relient. Ce sont les figures conventionnelles
 des cartes du ciel, simplifiées : à la taille où elles sont posées sur la
 roue, ce qu'on doit reconnaître c'est une silhouette, pas un catalogue.
 ------------------------------------------------------------------------- */

const ASTERISMES = {
  belier: {
    p: [[82, 34], [62, 44], [54, 50], [36, 70]],
    l: [[0, 1], [1, 2], [2, 3]],
  },
  taureau: {
    p: [[46, 58], [34, 48], [24, 40], [14, 26], [52, 46], [58, 32], [66, 16], [18, 66]],
    l: [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 6]],
  },
  // Les deux frères : deux corps parallèles, et les mains qui se rejoignent.
  gemeaux: {
    p: [[30, 16], [26, 38], [20, 60], [14, 84], [8, 44], [56, 22], [60, 44], [66, 66], [74, 88], [86, 52], [43, 44]],
    l: [[0, 1], [1, 2], [2, 3], [1, 4], [1, 10], [5, 6], [6, 7], [7, 8], [6, 9], [6, 10]],
  },
  cancer: {
    p: [[50, 34], [36, 20], [62, 18], [48, 58], [30, 74]],
    l: [[1, 0], [2, 0], [0, 3], [3, 4]],
  },
  lion: {
    p: [[34, 74], [32, 60], [36, 46], [34, 34], [28, 24], [18, 30], [70, 38], [66, 56], [88, 50]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 7], [7, 6], [6, 8], [8, 7], [2, 6]],
  },
  vierge: {
    p: [[40, 84], [46, 64], [36, 50], [22, 42], [58, 52], [74, 44], [86, 34], [52, 34]],
    l: [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [5, 6], [2, 7]],
  },
  balance: {
    p: [[30, 58], [52, 34], [74, 50], [58, 74], [80, 26]],
    l: [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4]],
  },
  scorpion: {
    p: [[74, 16], [62, 20], [54, 26], [50, 40], [46, 54], [40, 66], [30, 76], [20, 80], [14, 72], [20, 64]],
    l: [[0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
  },
  sagittaire: {
    p: [[26, 64], [36, 48], [50, 42], [64, 50], [72, 64], [58, 72], [40, 72], [80, 48], [78, 66]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 6], [3, 7], [7, 8], [8, 4]],
  },
  capricorne: {
    p: [[18, 40], [46, 32], [78, 44], [62, 72], [34, 66]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]],
  },
  verseau: {
    p: [[36, 30], [50, 26], [62, 32], [50, 40], [46, 54], [54, 66], [44, 76], [56, 86], [24, 34], [74, 28]],
    l: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6], [6, 7], [0, 8], [2, 9]],
  },
  poissons: {
    p: [[86, 74], [68, 62], [50, 54], [34, 50], [22, 40], [14, 28], [26, 22], [34, 32],
        [80, 56], [72, 42], [68, 28], [58, 18], [50, 26], [58, 34]],
    l: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 13], [13, 10]],
  },
};

/**
 * Une constellation, à l'échelle voulue : les traits d'abord, les étoiles
 * par-dessus. Les étoiles sont plus grosses aux deux ou trois sommets du
 * dessin — sur une vraie carte, c'est la magnitude qui fait la silhouette.
 */
function asterisme(id, { size = 100, ox = 0, oy = 0, seed = 11, step = 0.012, big = [] } = {}) {
  const a = ASTERISMES[id];
  if (!a) return "";
  const p = pen(seed, step);
  const k = size / 100;
  const at = (i) => [ox + a.p[i][0] * k, oy + a.p[i][1] * k];

  const traits = a.l
    .map(([i, j]) => {
      const [x1, y1] = at(i);
      const [x2, y2] = at(j);
      return p.seg(x1, y1, x2, y2, { cls: "ch-tick ch-draw", amp: 0.5 * k, segs: 2 });
    })
    .join("");

  const etoiles = a.p
    .map((_, i) => {
      const [x, y] = at(i);
      const r = (big.includes(i) ? 3.4 : 2.2) * k;
      return p.round(x, y, r, { cls: "ch-star ch-draw", wob: 0.16, steps: 14 });
    })
    .join("");

  return traits + etoiles;
}

/* ------------------------------------------------------------- la roue ---

 Une carte du ciel tournante, comme celles qu'on achète en planétarium : un
 anneau de douze figures, leurs noms tout autour, et un trou au milieu. C'est
 dans ce trou qu'Axel parle.
 --------------------------------------------------------------------------*/

const RW = 1000;
const RC = 500;

/** Où se pose la i-ème constellation sur l'anneau (midi = la première). */
function surLAnneau(i, total, rayon) {
  const a = (i / total) * Math.PI * 2 - Math.PI / 2;
  return [RC + Math.cos(a) * rayon, RC + Math.sin(a) * rayon];
}

function roue(constellations) {
  const p = pen(51120, 0.03);
  const total = constellations.length;

  const figures = constellations
    .map((c, i) => {
      const [x, y] = surLAnneau(i, total, 364);
      const taille = 124;
      const dessin = asterisme(c.id, {
        size: taille,
        ox: x - taille / 2,
        oy: y - taille / 2,
        seed: 700 + i * 91,
        big: c.id === "gemeaux" ? [0, 5] : [],
      });
      // Le nom suit la courbe de l'anneau : posé à l'horizontale, il
      // traverserait le cercle extérieur à trois et à neuf heures.
      const deg = (i / total) * 360;
      const flip = deg > 90 && deg < 270;
      const [nx, ny] = surLAnneau(i, total, flip ? 472 : 450);
      const court = String(c.nom).replace(/^(Les|Le|La)\s+/i, "").toUpperCase();
      return `<g class="gx-fig gx-fig--${esc(c.id)}" style="--o:${n(0.55 + i * 0.07)}s">
        ${dessin}
        <text class="gx-nom" x="${n(nx)}" y="${n(ny)}" text-anchor="middle"
              transform="rotate(${n(flip ? deg + 180 : deg)} ${n(nx)} ${n(ny)})">${esc(court)}</text>
      </g>`;
    })
    .join("\n      ");

  // Les repères de la carte : deux cercles, et douze petites marques comme
  // les graduations d'un cadran.
  const marques = [];
  for (let i = 0; i < total; i++) {
    const a = ((i + 0.5) / total) * Math.PI * 2 - Math.PI / 2;
    marques.push(
      `M${n(RC + Math.cos(a) * 302)},${n(RC + Math.sin(a) * 302)} L${n(RC + Math.cos(a) * 486)},${n(RC + Math.sin(a) * 486)}`
    );
  }

  return `<svg class="gx-art" viewBox="0 0 ${RW} ${RW}" aria-hidden="true" focusable="false">
    ${p.round(RC, RC, 492, { cls: "ch-limb ch-draw", wob: 0.006, steps: 96 })}
    ${p.round(RC, RC, 480, { cls: "ch-doodle ch-draw", wob: 0.008, steps: 96 })}
    ${p.round(RC, RC, 300, { cls: "ch-doodle ch-draw", wob: 0.01, steps: 80 })}
    <path class="ch ch-tick gx-graduation" d="${marques.join(" ")}" pathLength="1" style="--d:0.4s" />
    ${figures}
  </svg>`;
}

/* --------------------------------------------------------- les Gémeaux ---

 En grand, posés dans le ciel du désert. Deux figures debout, côte à côte,
 la main dans la main — c'est le geste de la légende, et c'est ce qui fait
 qu'on lit deux personnes avant de lire une constellation.

 Castor est à gauche : le frère mortel, celui qui est mort le premier. C'est
 lui qu'on peut toucher.
 --------------------------------------------------------------------------*/

const CASTOR = { tete: [140, 56], epaule: [136, 122], bassin: [126, 252], piedG: [96, 470], piedD: [152, 460], bras: [52, 168] };
const POLLUX = { tete: [268, 88], epaule: [272, 152], bassin: [288, 278], piedG: [266, 486], piedD: [332, 468], bras: [356, 212] };
const MAINS = [204, 200];

function figureCeleste(s, main, seed, nom) {
  const p = pen(seed, 0.09);
  const os = [];
  os.push(p.seg(...s.tete, ...s.epaule, { cls: "ch-tick ch-draw", amp: 1.2, segs: 3 }));
  os.push(p.seg(...s.epaule, ...s.bassin, { cls: "ch-tick ch-draw", amp: 1.4, segs: 4 }));
  os.push(p.seg(...s.bassin, ...s.piedG, { cls: "ch-tick ch-draw", amp: 1.6, segs: 4 }));
  os.push(p.seg(...s.bassin, ...s.piedD, { cls: "ch-tick ch-draw", amp: 1.6, segs: 4 }));
  os.push(p.seg(...s.epaule, ...s.bras, { cls: "ch-tick ch-draw", amp: 1.4, segs: 3 }));
  os.push(p.seg(...s.epaule, ...MAINS, { cls: "ch-tick ch-draw", amp: 1.2, segs: 3 }));

  const pts = [s.tete, s.epaule, s.bassin, s.piedG, s.piedD, s.bras];
  os.push(
    pts
      .map((q, i) => p.round(q[0], q[1], i === 0 ? 11 : 6.5, { cls: "ch-star ch-draw", wob: 0.12, steps: 20 }))
      .join("")
  );

  return `<g class="gx-jumeau gx-jumeau--${main}" data-jumeau="${main}">
    ${os.join("")}
    <text class="gx-etoile-nom" x="${s.tete[0]}" y="${s.tete[1] - 26}" text-anchor="middle">${esc(nom)}</text>
    ${p.hit()}
  </g>`;
}

function gemini(noms = {}) {
  const p = pen(9051, 0.09);
  return `<svg class="gx-gemini-art" viewBox="0 0 400 520" aria-hidden="true" focusable="false">
    <!-- les mains qui se rejoignent : le trait appartient aux deux -->
    ${p.round(...MAINS, 5.5, { cls: "ch-star ch-draw", wob: 0.16, steps: 18 })}
    ${figureCeleste(CASTOR, "castor", 4413, noms.gauche || "CASTOR")}
    ${figureCeleste(POLLUX, "pollux", 7761, noms.droite || "POLLUX")}
  </svg>`;
}

/* ------------------------------------------------------- la pellicule ----

 Ce qui abîme une bobine, ce sont des rayures verticales : la bande frotte
 toujours dans le même sens. Elles ne se dessinent pas, elles apparaissent —
 une griffure n'a pas de geste, elle est là d'un coup.

 Cinq paliers. Le dernier ne montre plus rien : la couche a brûlé et il ne
 reste que la lumière de la lampe derrière.
 --------------------------------------------------------------------------*/

const SW = 1440;
const SH = 900;

/** Les rayures fines, à l'échelle de l'écran (jamais étirées). */
function griffures() {
  const r = rng(510511);
  const paliers = [];

  for (let k = 1; k <= 5; k++) {
    const largeur = 60 + k * 150;      // jusqu'où la rayure peut se poser
    const nombre = 5 + k * 7;
    const traits = [];
    for (let i = 0; i < nombre; i++) {
      // les plus longues au bord, les plus courtes vers l'intérieur
      const t = Math.pow(r(), 1.5);
      const x = t * largeur;
      const haut = r() * SH * 0.5;
      const bas = haut + SH * (0.3 + r() * 0.7);
      let d = `M${n(x)},${n(haut)}`;
      const pas = 6;
      for (let y = haut; y < bas; y += SH / pas) {
        d += ` L${n(x + (r() * 2 - 1) * 2.4)},${n(Math.min(bas, y + SH / pas))}`;
      }
      traits.push(
        `<path d="${d}" stroke-width="${n(0.7 + r() * 1.9)}" opacity="${n(0.25 + r() * 0.6)}" />`
      );
      // quelques éclats : la couche part par plaques
      if (r() > 0.72) {
        const w = 3 + r() * 9;
        const h = 8 + r() * 40;
        traits.push(
          `<path d="M${n(x)},${n(haut + 20)} l${n(w)},${n(-4)} l${n(1)},${n(h)} l${n(-w - 2)},${n(3)} Z" fill="#fff" stroke="none" opacity="${n(0.3 + r() * 0.5)}" />`
        );
      }
    }
    paliers.push(`<g class="gx-s gx-s${k}">${traits.join("")}</g>`);
  }

  return `<svg class="gx-lines" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false">
    <g fill="none" stroke="#fff" stroke-linecap="round">${paliers.join("")}</g>
  </svg>`;
}

/** La brûlure : la masse blanche qui mange le ciel par la gauche. */
function brulure() {
  const r = rng(770231);
  const paliers = [];
  // Les quatre premiers paliers rongent doucement ; le cinquième emporte la
  // moitié du cadre. C'est le dernier qui doit faire peur, pas les autres.
  const bords = [26, 78, 168, 330, 700];

  bords.forEach((bx, k) => {
    // Un bord jamais droit, et jamais deux fois la même dent : la couche se
    // retire par langues, pas au ciseau.
    let d = "M0,0";
    const pas = 56;
    const ampleur = 8 + k * 5;
    for (let i = 0; i <= pas; i++) {
      const y = (i / pas) * SH;
      const dents =
        Math.sin(i * 0.7) * ampleur * 0.5 +
        Math.sin(i * 2.3 + k) * ampleur * 0.3 +
        (r() * 2 - 1) * ampleur;
      d += ` L${n(Math.max(0, bx + dents))},${n(y)}`;
    }
    d += ` L0,${SH} Z`;

    // Quelques plaques détachées, un peu en avant du bord : la pellicule
    // part par éclats avant de partir tout à fait.
    const eclats = [];
    for (let i = 0; i < 4 + k * 3; i++) {
      const ex = bx + 10 + r() * (40 + k * 30);
      const ey = r() * SH;
      const ew = 4 + r() * (10 + k * 4);
      const eh = 12 + r() * (60 + k * 30);
      eclats.push(
        `<path d="M${n(ex)},${n(ey)} l${n(ew)},${n(-3)} l${n(2)},${n(eh)} l${n(-ew - 3)},${n(4)} Z" opacity="${n(0.25 + r() * 0.45)}" />`
      );
    }

    paliers.push(`<g class="gx-b gx-b${k + 1}">
      <path d="${d}" fill="#fff" />
      <path d="${d}" fill="url(#gxHalo)" transform="translate(${n(16 + k * 6)},0)" opacity="0.6" />
      <g fill="#fff">${eclats.join("")}</g>
    </g>`);
  });

  return `<svg class="gx-burn" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="gxHalo" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0.74" stop-color="#fff" stop-opacity="0.85" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>
    ${paliers.join("")}
  </svg>`;
}

/* ---------------------------------------------------------- la boîte -----*/

/** La lunchbox posée au sol, fermée. La fusée dessus est à moitié effacée. */
function boiteFermee() {
  const p = pen(6104, 0.1);
  return `<g class="gx-draw">
    ${p.line([[70, 62], [78, 30], [122, 30], [130, 62]], { cls: "ch-doodle ch-draw", amp: 1.1 })}
    ${p.line([[16, 60], [184, 60], [184, 148], [16, 148]], { cls: "ch-limb ch-draw", close: true, amp: 1.2 })}
    ${p.seg(16, 82, 184, 82, { cls: "ch-doodle ch-draw", amp: 0.9 })}
    ${p.line([[62, 76], [78, 76], [78, 92], [62, 92]], { cls: "ch-tick ch-draw", close: true, amp: 0.6 })}
    ${p.line([[122, 76], [138, 76], [138, 92], [122, 92]], { cls: "ch-tick ch-draw", close: true, amp: 0.6 })}
    <!-- la fusée : elle a presque disparu -->
    ${p.line([[92, 136], [100, 104], [108, 136]], { cls: "ch-tick ch-faint ch-draw", amp: 0.7 })}
    ${p.seg(92, 136, 108, 136, { cls: "ch-tick ch-faint ch-draw", amp: 0.6 })}
    ${p.grain([[16, 148, 184, 148, 7]])}
    ${p.hit()}
  </g>`;
}

/**
 * Où sont les trois carrés, dans le repère 800 × 520 de la boîte.
 *
 * Une seule déclaration pour le dessin ET pour les zones de clic : c'est la
 * seule façon qu'elles ne se décalent jamais l'une de l'autre.
 */
const CARRES = { vb: [800, 520], x: [244, 400, 556], y: 336, cote: 118 };

/** La boîte ouverte, et les trois carrés vides qui l'attendent. */
function boiteOuverte(cases) {
  const p = pen(6205, 0.05);

  const places = CARRES.x;
  const cote = CARRES.cote;
  const contenu = cases
    .map((c, i) => {
      const q = pen(3300 + i * 137, 0.06);
      const x = places[i] || places[0];
      const y = CARRES.y;
      const h = cote / 2;
      return `<g class="gx-case" data-case="${esc(c.id)}" style="--o:${n(0.7 + i * 0.2)}s">
        ${q.line([[x - h, y - h], [x + h, y - h], [x + h, y + h], [x - h, y + h]], { cls: "ch-limb ch-draw", close: true, amp: 1.5, segs: 4 })}
        ${q.line([[x - h + 9, y - h + 9], [x + h - 9, y - h + 9], [x + h - 9, y + h - 9], [x - h + 9, y + h - 9]], { cls: "ch-tick ch-draw", close: true, amp: 0.8, segs: 3 })}
        <text class="gx-case-num" x="${n(x - h + 20)}" y="${n(y - h + 32)}">${i + 1}</text>
        <g class="gx-case-ok">
          ${q.round(x, y, 20, { cls: "ch-star ch-or ch-draw", wob: 0.14, steps: 22 })}
          ${q.seg(x - 30, y, x + 30, y, { cls: "ch-tick ch-or ch-draw", amp: 0.7 })}
          ${q.seg(x, y - 30, x, y + 30, { cls: "ch-tick ch-or ch-draw", amp: 0.7 })}
        </g>
      </g>`;
    })
    .join("\n    ");

  return `<svg class="gx-boite-art" viewBox="0 0 800 520" aria-hidden="true" focusable="false">
    <!-- le couvercle, relevé derrière, avec la fusée à moitié effacée -->
    ${p.fill("M128,176 L672,176 L646,34 L154,34 Z", "gx-tole")}
    ${p.line([[128, 176], [672, 176], [646, 34], [154, 34]], { cls: "ch-doodle ch-draw", close: true, amp: 1.4 })}
    ${p.seg(160, 60, 640, 60, { cls: "ch-tick ch-draw", amp: 0.8 })}
    ${p.line([[372, 152], [400, 74], [428, 152]], { cls: "ch-tick ch-faint ch-draw", amp: 0.9 })}
    ${p.seg(372, 152, 428, 152, { cls: "ch-tick ch-faint ch-draw", amp: 0.7 })}
    ${p.seg(400, 74, 400, 118, { cls: "ch-tick ch-faint ch-draw", amp: 0.6 })}
    <!-- la boîte, ouverte vers nous -->
    ${p.fill("M96,200 L704,200 L676,470 L124,470 Z", "gx-tole gx-tole--fond")}
    ${p.line([[96, 200], [704, 200], [676, 470], [124, 470]], { cls: "ch-limb ch-draw", close: true, amp: 1.5 })}
    ${p.line([[126, 226], [674, 226], [652, 444], [148, 444]], { cls: "ch-doodle ch-draw", close: true, amp: 1.1 })}
    ${p.round(400, 188, 9, { cls: "ch-tick ch-draw", wob: 0.14, steps: 18 })}
    ${p.grain([[124, 470, 676, 470, 12], [128, 176, 672, 176, 12]])}
    ${contenu}
  </svg>`;
}

/* ------------------------------------------------------------ la fin -----

 Tout le site est noir ; la fin est blanche. Le même trait, à l'encre sombre
 sur le papier : quelques étoiles, quelques figures, et le titre au milieu.
 --------------------------------------------------------------------------*/

function finBlanche() {
  const r = rng(510510);
  const p = pen(31415, 0.02);

  // Les étoiles : semées, jamais alignées, et plus rares au centre pour
  // laisser le titre respirer.
  const etoiles = [];
  for (let i = 0; i < 130; i++) {
    const x = r() * SW;
    const y = r() * SH;
    const centre = Math.hypot((x - SW / 2) / (SW / 2), (y - SH / 2) / (SH / 2));
    if (centre < 0.52 && r() > centre * 1.5) continue;
    const rad = 1.1 + Math.pow(r(), 2.4) * 4.4;
    etoiles.push(
      `<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad)}" opacity="${n(0.2 + r() * 0.6)}" />`
    );
  }

  // Quelques figures, dont les Gémeaux : c'est d'eux qu'on vient.
  const figures = [
    ["gemeaux", 250, 96, 78, 1],
    ["lion", 210, 1080, 118, 0.72],
    ["taureau", 160, 168, 606, 0.6],
    ["scorpion", 150, 1172, 596, 0.55],
    ["verseau", 140, 612, 44, 0.45],
  ]
    .map(([id, taille, ox, oy, op], i) => {
      const q = pen(880 + i * 71, 0.02);
      return `<g opacity="${op}">${asterisme(id, { size: taille, ox, oy, seed: 880 + i * 71, step: 0.02, big: id === "gemeaux" ? [0, 5] : [] })}</g>`;
    })
    .join("");

  return `<svg class="fin-ciel" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g class="fin-etoiles">${etoiles.join("")}</g>
    <g class="fin-encre">${figures}</g>
  </svg>`;
}

/* ---------------------------------------------------------- le générique --

 Les cartes sont toutes dans la page dès le départ, éteintes, empilées au
 même endroit : c'est le script qui les allume l'une après l'autre. Un lecteur
 d'écran, lui, lit le générique entier d'un coup — ce qui vaut mieux que de
 lui faire attendre quarante secondes.
 --------------------------------------------------------------------------*/

function generique(credits, membres) {
  if (!credits || !credits.length) return "";
  const par = Object.fromEntries((membres || []).map((m) => [m.id, m]));

  // La rangée. Toutes les figures y sont dès le départ, éteintes : la place
  // de chacune est donc connue d'avance, et personne ne saute quand la
  // suivante arrive — le rang glisse, c'est tout.
  const rang = credits
    .map((c, i) => {
      const m = par[c.id];
      if (!m) return "";
      return `<div class="fin-membre" data-membre="${esc(c.id)}" data-rang="${i}">
          <span class="fin-corps">
            ${figureSeule(i)}
            <img class="fin-face" src="${esc(m.image)}" alt="" width="180" height="220"
                 loading="lazy" decoding="async" />
          </span>
        </div>`;
    })
    .filter(Boolean)
    .join("\n        ");

  const cartes = credits
    .map((c, i) => {
      const m = par[c.id];
      const nom = c.nom || (m ? m.fullName : "");
      return `<div class="fin-carte" data-carte="${i}">
          <span class="fin-role">${esc(c.role || "")}</span>
          <span class="fin-qui">${esc(nom)}</span>
          ${c.perso ? `<span class="fin-perso">${esc(c.perso)}</span>` : ""}
        </div>`;
    })
    .join("\n        ");

  return `<div class="fin-troupe" aria-hidden="true"><div class="fin-rang" data-rang>${rang}</div></div>
    <div class="fin-credits" data-credits>${cartes}</div>`;
}

/* ------------------------------------------------------- le balisage -----*/

/**
 * Tout ce que la scène doit porter : la constellation posée dans le ciel, les
 * deux couches de pellicule abîmée, la boîte au sol, et les deux calques.
 *
 * Comme le carnet, le contenu voyage dans un `<script type="application/json">`
 * plutôt qu'en clair.
 */
export function calquesGemeaux(g, place) {
  return `
  <!-- La constellation, une fois qu'on l'a trouvée. Elle se pose dans le
       ciel du désert, en haut à droite, et n'en repart plus. -->
  <div class="gx-gemini" hidden style="${place(1156, 486, 340, [400, 520])}">
    ${gemini({ gauche: g.gemeaux.nomGauche, droite: g.gemeaux.nomDroite })}
    <button type="button" class="gx-twin gx-twin--castor" data-twin="castor"><span class="sr-only" data-castor></span></button>
    <button type="button" class="gx-twin gx-twin--pollux" data-twin="pollux"><span class="sr-only" data-pollux></span></button>
  </div>

  <!-- La boîte, quand il ne reste plus qu'elle. -->
  <button type="button" class="gx-boite" data-el="lunchbox" hidden style="${place(884, 774, 128, [200, 160])}">
    <svg class="pj-art" viewBox="0 0 200 160" aria-hidden="true" focusable="false">${boiteFermee()}</svg>
    <span class="sr-only" data-boite></span>
  </button>`;
}

/** Les deux couches de pellicule abîmée, à l'échelle de l'écran. */
export function pellicule() {
  return `<div class="gx-pellicule" aria-hidden="true">
    ${brulure()}
    ${griffures()}
  </div>`;
}

/** Les calques : la carte du ciel, la boîte ouverte, et l'écran de la fin. */
export function calquesGemeauxOverlays(g, membres = []) {
  const data = JSON.stringify(g).replace(/</g, "\\u003c");
  const cs = g.constellations;
  const lb = g.lunchbox;

  const secteurs = cs
    .map((c, i) => {
      const [x, y] = surLAnneau(i, cs.length, 364);
      const d = 176;
      return `<button type="button" class="gx-secteur" data-cons="${esc(c.id)}"
          style="left:${n(((x - d / 2) / RW) * 100)}%;top:${n(((y - d / 2) / RW) * 100)}%;width:${n((d / RW) * 100)}%;height:${n((d / RW) * 100)}%">
          <span class="sr-only">${esc(c.nom)} — ${esc(c.latin)}</span></button>`;
    })
    .join("\n        ");

  // La zone de clic épouse le carré dessiné, avec une marge de confort de
  // quelques unités : on clique là où l'on voit.
  const marge = 12;
  const [VW, VH] = CARRES.vb;
  const cb = CARRES.cote + marge * 2;
  const boutons = lb.cases
    .map((c, i) => {
      const x = CARRES.x[i] != null ? CARRES.x[i] : CARRES.x[0];
      return `<button type="button" class="gx-case-btn" data-case="${esc(c.id)}"
          style="left:${n(((x - cb / 2) / VW) * 100)}%;top:${n(((CARRES.y - cb / 2) / VH) * 100)}%;width:${n((cb / VW) * 100)}%;height:${n((cb / VH) * 100)}%">
          <span class="sr-only">${esc(c.nom)} — ${esc(c.titre)}</span></button>`;
    })
    .join("\n        ");

  return `
  <div class="gx" id="gx-roue" hidden>
    <div class="gx-frame" role="dialog" aria-modal="true" aria-labelledby="gx-titre">
      <h2 class="sr-only" id="gx-titre">${esc(g.roue.titre)}</h2>
      <div class="gx-wheel">
        ${roue(cs)}
        <p class="gx-centre" data-centre>${g.reponse.lignes.map((l) => `<span>${esc(l)}</span>`).join("")}</p>
        ${secteurs}
      </div>
      <p class="gx-amorce" data-amorce>${esc(g.roue.amorce)}</p>
      <button type="button" class="gx-close" data-close aria-label="${esc(g.roue.fermer)}">×</button>
      <p class="sr-only" aria-live="polite" data-live></p>
    </div>
  </div>

  <div class="lb" id="gx-boite" hidden>
    <div class="gx-frame lb-frame" role="dialog" aria-modal="true" aria-labelledby="lb-titre">
      <h2 class="sr-only" id="lb-titre">${esc(lb.titre)}</h2>
      <div class="lb-boite">
        ${boiteOuverte(lb.cases)}
        ${boutons}
      </div>

      <!-- La fiche d'une case : la question, puis de quoi répondre. -->
      <div class="lb-fiche" data-fiche hidden>
        <p class="lb-fiche-titre" data-fiche-titre></p>
        <p class="lb-fiche-texte" data-fiche-texte></p>
        <form class="lb-form" data-form>
          <label class="sr-only" for="lb-input" data-label>Votre réponse</label>
          <input class="lb-input" id="lb-input" type="text" autocomplete="off" spellcheck="false"
                 maxlength="28" enterkeyhint="done" data-input />
          <button type="submit" class="lb-ok" data-valider>${esc(lb.valider)}</button>
        </form>
        <button type="button" class="lb-roue-ouvrir" data-roue hidden></button>
        <p class="lb-etat" data-etat aria-live="polite"></p>
      </div>

      <p class="lb-mot" data-mot hidden>${lb.mot.texte.map((l) => `<span>${esc(l)}</span>`).join("")}</p>

      <div class="lb-pied">
        <button type="button" class="lb-carnet" data-consulter>${esc(lb.consulter)}</button>
        <span class="lb-aide">${esc(lb.aide)}</span>
      </div>

      <button type="button" class="gx-close" data-close aria-label="${esc(lb.fermer)}">×</button>
      <p class="sr-only" aria-live="polite" data-live></p>
    </div>
  </div>

  <!-- L'écran de la fin : blanc, le titre, puis le générique. -->
  <div class="fin" id="gx-fin" hidden>
    ${finBlanche()}
    <p class="fin-titre">${esc(lb.fin.titre)}</p>
    ${lb.fin.sous ? `<p class="fin-sous">${esc(lb.fin.sous)}</p>` : ""}
    ${generique(lb.fin.credits, membres)}
    <a class="fin-retour" href="/" data-goto="ciel">${esc(lb.fin.retour)}</a>
  </div>

  <script type="application/json" id="gx-data">${data}</script>`;
}
