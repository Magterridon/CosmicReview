/**
 * Cosmic Review — le carnet d'Arthur et la cassette.
 *
 * L'easter egg de la scène « Le Projet ». Dans la cour, un second clic sur le
 * carnet l'ouvre en grand — cinquante et une pages, écrites à la main ; un
 * second clic sur la caméra sort une cassette dont l'étiquette est vierge.
 *
 * Même main que le reste du site : `draw.js` fournit le trait, `chalk.css` les
 * épaisseurs. Ce module ne produit que des chaînes au moment du build ; les
 * pages, elles, sont écrites côté navigateur par `src/scripts/carnet.js` à
 * partir de `src/data/carnet.json`.
 *
 * Repère du carnet ouvert : 1200 × 780, reliure à x = 600.
 * Repère de la cassette  : 640 × 400.
 */

import { esc, pen } from "./draw.js";

/* ---------------------------------------------------- le carnet, ouvert  */

const BW = 1200;
const BH = 780;

/** Les bords des deux feuillets, en unités du repère — le CSS s'en ressert. */
export const LEAF = {
  top: 26,
  bottom: 754,
  left: [26, 578],
  right: [622, 1174],
  gutter: 600,
  rule: 44,   // pas des réglures : l'interligne du texte s'y cale
  first: 188, // la première réglure
};

/** Un anneau de la spirale : un ovale posé de travers sur la reliure. */
function anneau(p, y) {
  const pts = [];
  const tilt = -0.42;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const x = Math.cos(a) * 40;
    const yy = Math.sin(a) * 10;
    pts.push([
      LEAF.gutter + x * Math.cos(tilt) - yy * Math.sin(tilt),
      y + x * Math.sin(tilt) + yy * Math.cos(tilt),
    ]);
  }
  return p.line(pts, { cls: "ch-limb ch-draw", close: true, amp: 0.7, segs: 2 });
}

/**
 * Le carnet grand ouvert : deux feuillets de papier, la reliure à spirale, la
 * marge, les réglures. Le papier est une surface pleine (`chf`), tout le reste
 * est du trait — donc tout se trace à l'ouverture.
 */
function book() {
  const p = pen(20260909, 0.04);
  const [l0, l1] = LEAF.left;
  const [r0, r1] = LEAF.right;
  const { top: T, bottom: B } = LEAF;

  // Les réglures du feuillet de droite : le texte manuscrit vient s'y poser.
  const rules = [];
  for (let y = LEAF.first; y <= B - 34; y += LEAF.rule) {
    rules.push(p.seg(r0 + 64, y, r1 - 26, y + (p.r() * 2 - 1) * 1.4, {
      cls: "ch-tick ch-draw", amp: 0.7, segs: 3,
    }));
  }

  // La spirale, et les trous qu'elle traverse.
  const rings = [];
  const trous = [];
  for (let i = 0; i < 12; i++) {
    const y = T + 30 + i * ((B - T - 60) / 11);
    rings.push(anneau(p, y));
    trous.push([l1 - 22, y, 4], [r0 + 22, y, 4]);
  }

  return `<svg class="cn-art" viewBox="0 0 ${BW} ${BH}" aria-hidden="true" focusable="false">
    <!-- le papier : la lumière tombe de la droite, comme dans la cour -->
    ${p.fill(`M${l0},${T} L${l1},${T + 5} L${l1},${B - 5} L${l0},${B} Z`, "cn-paper")}
    ${p.fill(`M${r0},${T + 5} L${r1},${T} L${r1},${B} L${r0},${B - 5} Z`, "cn-paper cn-paper--lit")}

    <!-- le bord des feuillets -->
    ${p.line([[l0, T], [l1, T + 5], [l1, B - 5], [l0, B]], { cls: "ch-limb ch-draw", close: true, amp: 1.3, segs: 5 })}
    ${p.line([[r0, T + 5], [r1, T], [r1, B], [r0, B]], { cls: "ch-limb ch-draw", close: true, amp: 1.3, segs: 5 })}

    <!-- la marge du feuillet de droite, et le trait qui coupe celui de gauche -->
    ${p.seg(r0 + 56, T + 20, r0 + 56, B - 16, { cls: "ch-doodle ch-or ch-draw", amp: 0.9 })}
    ${p.seg(l0 + 42, 230, l1 - 34, 230, { cls: "ch-doodle ch-draw", amp: 0.9 })}
    ${rules.join("\n    ")}

    <!-- un coin qui se relève, en bas à droite : le carnet a vécu -->
    ${p.line([[r1 - 4, B - 62], [r1 - 44, B - 4], [r1 - 2, B - 2]], { cls: "ch-doodle ch-draw", amp: 1.1 })}
    ${p.grain([[l0, T, l0, B, 10], [r1, T, r1, B, 10]])}

    <!-- la reliure passe par-dessus les deux feuillets -->
    ${trous.map(([x, y, rad]) => p.round(x, y, rad, { cls: "ch-tick ch-draw", wob: 0.1 })).join("")}
    ${rings.join("\n    ")}
  </svg>`;
}

/* ------------------------------------------------------ les croquis      */

/**
 * La petite banque de dessins que les pages appellent par leur nom
 * (`croquis` dans le JSON). Ils sont posés une fois dans la page, cachés ; le
 * script en clone un par page. Dessinés au build, donc toujours les mêmes.
 */
const CROQUIS = {
  lune(p) {
    return `${p.round(72, 60, 40, { cls: "ch-limb ch-draw", wob: 0.05 })}
      ${p.line([[92, 26], [78, 44], [76, 74], [92, 94]], { cls: "ch-doodle ch-draw", amp: 1 })}
      ${p.round(58, 48, 8, { cls: "ch-tick ch-draw", wob: 0.2 })}
      ${p.round(50, 74, 5, { cls: "ch-tick ch-draw", wob: 0.08 })}
      ${p.round(70, 84, 4, { cls: "ch-tick ch-draw", wob: 0.26 })}`;
  },
  etoiles(p) {
    const pts = [[24, 88], [52, 40], [80, 62], [112, 28], [128, 74], [96, 100]];
    return `${p.line(pts, { cls: "ch-tick ch-draw", amp: 0.6, segs: 2 })}
      ${pts.map((q) => p.round(q[0], q[1], 3.4, { cls: "ch-limb ch-draw", wob: 0.3 })).join("")}`;
  },
  spirale(p) {
    const pts = [];
    for (let i = 0; i <= 70; i++) {
      const a = (i / 70) * Math.PI * 4.6;
      const rad = 4 + (i / 70) * 46;
      pts.push([80 + Math.cos(a) * rad, 60 + Math.sin(a) * rad * 0.62]);
    }
    return p.line(pts, { cls: "ch-doodle ch-draw", amp: 0.5, segs: 1 });
  },
  antenne(p) {
    return `${p.line([[42, 24], [116, 46], [96, 78], [42, 24]], { cls: "ch-limb ch-draw", close: true, amp: 1.1 })}
      ${p.seg(78, 52, 96, 22, { cls: "ch-doodle ch-draw" })}
      ${p.round(97, 20, 5, { cls: "ch-doodle ch-draw", wob: 0.2 })}
      ${p.seg(78, 54, 74, 100, { cls: "ch-limb ch-draw" })}
      ${p.seg(52, 108, 74, 100, { cls: "ch-limb ch-draw" })}
      ${p.seg(98, 108, 74, 100, { cls: "ch-limb ch-draw" })}`;
  },
  horizon(p) {
    return `${p.seg(14, 84, 146, 82, { cls: "ch-limb ch-draw", amp: 0.8, segs: 7 })}
      ${p.round(102, 40, 6, { cls: "ch-limb ch-or ch-draw", wob: 0.16 })}
      ${p.round(102, 40, 15, { cls: "ch-tick ch-draw", wob: 0.22 })}
      ${p.seg(102, 60, 102, 78, { cls: "ch-tick ch-draw", amp: 0.5 })}
      ${p.grain([[14, 84, 146, 82, 10]])}`;
  },
  fleche(p) {
    return `${p.seg(20, 62, 132, 58, { cls: "ch-limb ch-draw", amp: 1.1 })}
      ${p.line([[108, 40], [134, 58], [108, 78]], { cls: "ch-limb ch-draw", amp: 1 })}`;
  },
  cible(p) {
    return `${p.round(80, 60, 46, { cls: "ch-tick ch-draw", wob: 0.06 })}
      ${p.round(80, 60, 28, { cls: "ch-doodle ch-draw", wob: 0.08 })}
      ${p.round(80, 60, 9, { cls: "ch-limb ch-or ch-draw", wob: 0.16 })}
      ${p.seg(80, 4, 80, 116, { cls: "ch-tick ch-draw", amp: 0.6 })}
      ${p.seg(16, 60, 144, 60, { cls: "ch-tick ch-draw", amp: 0.6 })}`;
  },
  mesa(p) {
    return `${p.line([[8, 104], [34, 74], [48, 66], [50, 40], [58, 34], [112, 33], [120, 40], [122, 66], [138, 76], [152, 104]], { cls: "ch-limb ch-draw", amp: 1.2 })}
      ${p.seg(4, 104, 156, 104, { cls: "ch-doodle ch-draw", amp: 0.7, segs: 7 })}
      ${p.grain([[58, 36, 112, 35, 6], [4, 104, 156, 104, 12]])}`;
  },
  cassette(p) {
    return `${p.line([[16, 26], [144, 26], [144, 96], [16, 96]], { cls: "ch-limb ch-draw", close: true, amp: 1 })}
      ${p.line([[28, 34], [132, 34], [132, 56], [28, 56]], { cls: "ch-tick ch-draw", close: true, amp: 0.7 })}
      ${p.round(56, 76, 13, { cls: "ch-doodle ch-draw", wob: 0.1 })}
      ${p.round(104, 76, 13, { cls: "ch-doodle ch-draw", wob: 0.1 })}
      ${p.seg(56, 76, 104, 76, { cls: "ch-tick ch-draw", amp: 0.5 })}`;
  },
  grille(p) {
    const out = [];
    for (let i = 0; i <= 4; i++) {
      out.push(p.seg(20 + i * 30, 14, 20 + i * 30, 106, { cls: "ch-tick ch-draw", amp: 0.5, segs: 3 }));
      out.push(p.seg(16, 18 + i * 22, 144, 18 + i * 22, { cls: "ch-tick ch-draw", amp: 0.5, segs: 3 }));
    }
    return `${out.join("")}
      ${p.round(80, 62, 8, { cls: "ch-limb ch-or ch-draw", wob: 0.18 })}
      ${p.seg(80, 62, 128, 22, { cls: "ch-doodle ch-or ch-draw", amp: 0.7 })}`;
  },
};

/** La banque, posée une fois dans la page. */
function croquisBank() {
  let seed = 3100;
  const items = Object.entries(CROQUIS).map(([key, make]) => {
    const p = pen((seed += 137), 0.05);
    return `<svg data-croquis="${key}" viewBox="0 0 160 120" aria-hidden="true" focusable="false">${make(p)}</svg>`;
  });
  return `<div class="cn-bank" hidden>${items.join("")}</div>`;
}

/**
 * La grande croix d'une page refusée. Elle est toujours dans la page ; c'est
 * `data-raye` sur le carnet qui la montre. Deux traits d'un geste, pas une
 * croix bien faite : on barre une page en colère, pas à la règle.
 */
function rature() {
  const p = pen(2811, 0.16);
  return `<svg viewBox="0 0 552 728" aria-hidden="true" focusable="false">
    ${p.seg(30, 48, 526, 684, { cls: "ch-limb ch-draw", amp: 5.5, segs: 7 })}
    ${p.seg(520, 60, 36, 672, { cls: "ch-limb ch-draw", amp: 5.5, segs: 7 })}
  </svg>`;
}

/* ------------------------------------------------------ la cassette      */

/** La cassette, dessinée à la main. L'étiquette est laissée vierge. */
function tape() {
  const p = pen(5109, 0.06);
  return `<svg class="cs-art" viewBox="0 0 640 400" aria-hidden="true" focusable="false">
    <!-- le boîtier -->
    ${p.line([[24, 24], [616, 24], [616, 376], [24, 376]], { cls: "ch-limb ch-draw", close: true, amp: 1.4, segs: 6 })}
    ${p.line([[38, 38], [602, 38], [602, 362], [38, 362]], { cls: "ch-tick ch-draw", close: true, amp: 0.9, segs: 5 })}

    <!-- l'étiquette : du papier collé, vierge -->
    ${p.fill("M62,58 L578,58 L578,186 L62,186 Z", "cs-label")}
    ${p.line([[62, 58], [578, 58], [578, 186], [62, 186]], { cls: "ch-limb ch-draw", close: true, amp: 1.1, segs: 5 })}
    ${p.seg(84, 168, 556, 168, { cls: "ch-tick ch-draw", amp: 0.7, segs: 6 })}

    <!-- la fenêtre et les deux bobines -->
    ${p.line([[188, 224], [452, 224], [452, 340], [188, 340]], { cls: "ch-limb ch-draw", close: true, amp: 1.1, segs: 5 })}
    ${p.round(246, 282, 40, { cls: "ch-doodle ch-draw", wob: 0.035, steps: 54 })}
    ${p.round(394, 282, 40, { cls: "ch-doodle ch-draw", wob: 0.035, steps: 54 })}
    ${p.round(246, 282, 15, { cls: "ch-limb ch-draw", wob: 0.04, steps: 30 })}
    ${p.round(394, 282, 15, { cls: "ch-limb ch-draw", wob: 0.04, steps: 30 })}
    <!-- la bande, presque entièrement sur la bobine de gauche : rien n'a
         encore été tourné avec -->
    ${p.seg(206, 282, 434, 282, { cls: "ch-tick ch-draw", amp: 0.6, segs: 4 })}

    <!-- les vis, et l'ergot de protection resté ouvert -->
    ${p.round(58, 350, 6, { cls: "ch-tick ch-draw", wob: 0.08 })}
    ${p.round(582, 350, 6, { cls: "ch-tick ch-draw", wob: 0.08 })}
    ${p.round(58, 210, 6, { cls: "ch-tick ch-draw", wob: 0.08 })}
    ${p.round(582, 210, 6, { cls: "ch-tick ch-draw", wob: 0.08 })}
    ${p.line([[96, 226], [140, 226], [140, 250], [96, 250]], { cls: "ch-tick ch-draw", close: true, amp: 0.6 })}
    ${p.line([[500, 226], [544, 226], [544, 250], [500, 250]], { cls: "ch-tick ch-draw", close: true, amp: 0.6 })}
    ${p.grain([[38, 38, 602, 38, 22], [38, 362, 602, 362, 22]])}
  </svg>`;
}

/* ------------------------------------------------------ le balisage      */

/**
 * Les deux calques, posés dans la scène. Ils sortent `hidden` : le carnet et
 * la cassette ne sont là que si l'on va les chercher.
 *
 * Le contenu des pages voyage dans un `<script type="application/json">`
 * plutôt qu'en clair : la page reste légère, et l'on ne tombe pas sur les
 * cinquante et une pages en lisant la source d'un œil distrait.
 */
export function calquesCarnet(carnet) {
  const total = carnet.pages.length;
  const data = JSON.stringify({ pages: carnet.pages }).replace(/</g, "\\u003c");

  const onglets = carnet.pages
    .map((pg, i) => `<button type="button" class="cn-tab" data-page="${i}"
        aria-label="Page ${pg.n} sur ${total}"${i === 0 ? ' aria-current="true"' : ""}></button>`)
    .join("");

  return `
  <div class="cn" id="cn-carnet" hidden>
    <div class="cn-frame" role="dialog" aria-modal="true" aria-labelledby="cn-title">
      <h2 class="sr-only" id="cn-title">${esc(carnet.titre)} — ${total} pages</h2>

      <div class="cn-book">
        ${book()}
        <div class="cn-leaf cn-leaf--g" data-leaf="gauche"></div>
        <div class="cn-leaf cn-leaf--d" data-leaf="droite"></div>
        <div class="cn-sketch" data-sketch aria-hidden="true"></div>
        <div class="cn-cross" data-cross aria-hidden="true">${rature()}</div>
      </div>

      <div class="cn-edge" role="group" aria-label="Aller à une page">${onglets}</div>

      <div class="cn-bar">
        <button type="button" class="cn-nav" data-prev aria-label="Page précédente">‹</button>
        <p class="cn-num"><span data-num>1</span> / ${total}</p>
        <button type="button" class="cn-nav" data-next aria-label="Page suivante">›</button>
      </div>

      <button type="button" class="cn-close" data-close aria-label="${esc(carnet.fermer)}">×</button>
      <p class="sr-only" aria-live="polite" data-live></p>
    </div>
  </div>

  <div class="cs" id="cn-cassette" hidden>
    <div class="cs-frame" role="dialog" aria-modal="true" aria-labelledby="cs-title">
      <h2 class="sr-only" id="cs-title">Une cassette vierge</h2>
      <div class="cs-tape">
        ${tape()}
        <label class="sr-only" for="cs-label">Écrire sur l'étiquette de la cassette</label>
        <input class="cs-input" id="cs-label" type="text" maxlength="18" autocomplete="off"
               spellcheck="false" enterkeyhint="done" aria-describedby="cs-help" />
      </div>
      <p class="cs-help" id="cs-help">L'étiquette est vierge.</p>
      <button type="button" class="cn-close" data-close aria-label="Ranger la cassette">×</button>
      <p class="sr-only" aria-live="polite" data-live></p>
    </div>
  </div>

  ${croquisBank()}

  <script type="application/json" id="cn-data">${data}</script>`;
}
