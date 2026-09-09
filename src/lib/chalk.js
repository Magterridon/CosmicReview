/**
 * Cosmic Review — le monde à la craie de la scène « L'Équipe ».
 *
 * Ce module produit du HTML/SVG sous forme de chaînes, appelées au moment du
 * build par les pages Astro (`set:html`). Rien de tout ça ne tourne dans le
 * navigateur : la page livrée est du HTML statique.
 *
 * Le décor reprend `Présentation projet/Photos/team.jpg` — le dessin à la
 * craie de l'équipe : montagnes, cactus, doodles cosmiques, et les huit
 * figures en bâton qui se tiennent la main, tête découpée en photo.
 *
 * Repère de la scène : 1440 × 900. Le sol est à y = 706, les têtes autour de
 * y = 450. La bande des figures va de x = 144 à x = 1296, soit huit colonnes
 * de 144 : les mains tombent donc exactement sur les bords de colonne, et
 * deux voisins se rejoignent sans réglage manuel.
 */

const W = 1440;
const H = 900;
export const GROUND = 706;
export const BAND = { left: 144, right: 1296, columns: 8 };

/* ---------------------------------------------------------------- outils */

/* La main du site vit maintenant dans `draw.js` : le tableau noir de l'Équipe
   et les objets du Projet doivent avoir exactement la même écriture. */
import { rng, n, esc, wobble, wobbleTo, circle } from "./draw.js";

export { esc };

/** Un trait de craie animable. `d` = délai de tracé, en secondes. */
function line(d, cls, delay, extra = "") {
  return `<path class="ch ${cls}" d="${d}" pathLength="1" style="--d:${delay}s"${extra} />`;
}

/* ------------------------------------------------------------- le décor  */

function mountains(r) {
  const out = [];
  const ranges = [
    // gauche : crêtes qui descendent vers le centre
    [[0, 616], [34, 554], [68, 598], [104, 536], [140, 602], [176, 564], [212, 626], [250, 706]],
    // droite : miroir approximatif, jamais identique
    [[1440, 600], [1406, 546], [1372, 592], [1336, 530], [1300, 604], [1264, 558], [1228, 620], [1190, 706]],
  ];

  ranges.forEach((pts, ri) => {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x1, y1] = pts[i - 1];
      const [x2, y2] = pts[i];
      d += wobbleTo(x1, y1, x2, y2, 2.2, 4, r);
    }
    out.push(line(d, "ch-ridge ch-draw", 0.1 + ri * 0.06));

    // hachures : quelques traits qui descendent du versant, comme une ombre
    for (let i = 1; i < pts.length - 1; i += 2) {
      const [x, y] = pts[i];
      if (y > 620) continue;
      const h = 26 + r() * 40;
      out.push(
        line(wobble(x, y + 6, x - 8 + r() * 16, y + 6 + h, 1.6, 3, r),
             "ch-hatch ch-draw", 0.2 + ri * 0.06 + i * 0.015)
      );
    }
  });
  return out.join("");
}

function cactus(cx, flip, delay, r) {
  const s = flip ? -1 : 1;
  const top = 574 + r() * 14;
  const out = [];
  // tronc : deux montants et une calotte arrondie
  out.push(line(
    `${wobble(cx - 11, GROUND, cx - 11, top + 16, 1.4, 5, r)}` +
    ` Q${n(cx - 11)},${n(top)} ${n(cx)},${n(top)}` +
    ` Q${n(cx + 11)},${n(top)} ${n(cx + 11)},${n(top + 16)}` +
    ` L${n(cx + 11)},${GROUND}`,
    "ch-cactus ch-draw", delay));
  // bras : un de chaque côté, à des hauteurs différentes
  out.push(line(
    `M${n(cx - 11 * s)},${n(top + 78)} Q${n(cx - 34 * s)},${n(top + 78)} ${n(cx - 34 * s)},${n(top + 56)} L${n(cx - 34 * s)},${n(top + 26)}`,
    "ch-cactus ch-draw", delay + 0.12));
  out.push(line(
    `M${n(cx + 11 * s)},${n(top + 106)} Q${n(cx + 31 * s)},${n(top + 106)} ${n(cx + 31 * s)},${n(top + 86)} L${n(cx + 31 * s)},${n(top + 62)}`,
    "ch-cactus ch-draw", delay + 0.2));
  // épines
  for (let i = 0; i < 7; i++) {
    const y = top + 24 + i * 16;
    out.push(line(`M${n(cx - 11)},${n(y)} L${n(cx - 17)},${n(y - 3)}`, "ch-hatch ch-draw", delay + 0.3 + i * 0.02));
    out.push(line(`M${n(cx + 11)},${n(y + 8)} L${n(cx + 17)},${n(y + 5)}`, "ch-hatch ch-draw", delay + 0.32 + i * 0.02));
  }
  return out.join("");
}

function ground(r) {
  const out = [];
  out.push(line(
    `M0,706 C180,699 300,711 480,703 C660,695 790,709 960,701 C1130,694 1290,709 1440,700`,
    "ch-ground ch-draw", 0.02));

  const tuft = (x, y, delay) => {
    if (r() < 0.62) {
      let d = "";
      const blades = 3 + Math.floor(r() * 3);
      for (let b = 0; b < blades; b++) {
        const sx = x + b * 4 - blades * 2;
        d += ` ${wobble(sx, y, sx + (r() * 2 - 1) * 7, y - 7 - r() * 9, 1.2, 3, r)}`;
      }
      return line(d.trim(), "ch-tuft ch-draw", delay);
    }
    return line(circle(x, y, 3 + r() * 4, r, 0.22), "ch-tuft ch-draw", delay);
  };

  // Contre les pieds, mais seulement dans les marges : sous les figures, la
  // bande sous l'horizon est réservée aux intitulés de poste.
  for (let i = 0; i < 8; i++) {
    const left = i % 2 === 0;
    out.push(tuft(left ? 12 + r() * 128 : 1300 + r() * 128,
                  GROUND + 6 + r() * 22, 0.34 + i * 0.015));
  }
  // Plus bas, sur toute la largeur : le premier plan du désert.
  for (let i = 0; i < 22; i++) {
    out.push(tuft(20 + r() * 1400, GROUND + 56 + r() * 52, 0.4 + i * 0.012));
  }
  return out.join("");
}

/* -------------------------------------------------------- doodles du ciel */

function sparkle(x, y, s, delay) {
  const d =
    `M${n(x)},${n(y - s)} Q${n(x + s * 0.16)},${n(y - s * 0.16)} ${n(x + s)},${n(y)}` +
    ` Q${n(x + s * 0.16)},${n(y + s * 0.16)} ${n(x)},${n(y + s)}` +
    ` Q${n(x - s * 0.16)},${n(y + s * 0.16)} ${n(x - s)},${n(y)}` +
    ` Q${n(x - s * 0.16)},${n(y - s * 0.16)} ${n(x)},${n(y - s)} Z`;
  return line(d, "ch-star ch-draw", delay);
}

function galaxy(cx, cy, rad, tilt, delay, r) {
  const out = [];
  for (let arm = 0; arm < 2; arm++) {
    let d = "";
    for (let i = 0; i <= 30; i++) {
      const t = i / 30;
      const a = arm * Math.PI + t * Math.PI * 1.7;
      const rr = rad * (0.12 + t * 0.88);
      const x = cx + Math.cos(a) * rr;
      const y = cy + Math.sin(a) * rr * tilt;
      d += (i ? " L" : "M") + n(x) + "," + n(y);
    }
    out.push(line(d, "ch-doodle ch-violet ch-draw", delay + arm * 0.1));
  }
  out.push(line(circle(cx, cy, rad * 0.94, r, 0.04), "ch-doodle ch-violet ch-faint ch-draw", delay + 0.2));
  out.push(line(circle(cx, cy, rad * 0.16, r, 0.1), "ch-doodle ch-or ch-draw", delay + 0.26));
  return out.join("");
}

function saturn(cx, cy, rad, delay, r) {
  return (
    line(circle(cx, cy, rad, r), "ch-doodle ch-draw", delay) +
    line(
      `M${n(cx - rad * 1.9)},${n(cy + rad * 0.5)} C${n(cx - rad * 1.7)},${n(cy - rad * 0.75)} ${n(cx + rad * 1.7)},${n(cy - rad * 0.75)} ${n(cx + rad * 1.9)},${n(cy + rad * 0.5)}`,
      "ch-doodle ch-or ch-draw", delay + 0.1) +
    line(
      `M${n(cx - rad * 1.9)},${n(cy + rad * 0.5)} C${n(cx - rad * 1.6)},${n(cy + rad * 1.15)} ${n(cx + rad * 1.6)},${n(cy + rad * 1.15)} ${n(cx + rad * 1.9)},${n(cy + rad * 0.5)}`,
      "ch-doodle ch-or ch-draw", delay + 0.16)
  );
}

function moon(cx, cy, rad, delay, r) {
  const out = [line(circle(cx, cy, rad, r), "ch-doodle ch-draw", delay)];
  for (let i = 0; i < 6; i++) {
    const a = r() * Math.PI * 2;
    const rr = r() * rad * 0.6;
    out.push(line(circle(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 3 + r() * 6, r, 0.2),
                  "ch-doodle ch-faint ch-draw", delay + 0.12 + i * 0.04));
  }
  return out.join("");
}

function crescent(cx, cy, rad, delay) {
  return line(
    `M${n(cx + rad * 0.35)},${n(cy - rad)} A${n(rad)},${n(rad)} 0 1 0 ${n(cx + rad * 0.35)},${n(cy + rad)}` +
    ` A${n(rad * 0.78)},${n(rad * 0.78)} 0 1 1 ${n(cx + rad * 0.35)},${n(cy - rad)} Z`,
    "ch-doodle ch-draw", delay);
}

function earth(cx, cy, rad, delay, r) {
  const out = [line(circle(cx, cy, rad, r), "ch-doodle ch-bleu ch-draw", delay)];
  // continents : deux gribouillis, pas une carte
  out.push(line(
    `M${n(cx - rad * 0.55)},${n(cy - rad * 0.2)} q${n(rad * 0.3)},${n(-rad * 0.35)} ${n(rad * 0.55)},${n(-rad * 0.05)}` +
    ` q${n(rad * 0.2)},${n(rad * 0.25)} ${n(-rad * 0.1)},${n(rad * 0.4)} q${n(-rad * 0.4)},${n(rad * 0.1)} ${n(-rad * 0.45)},${n(-rad * 0.35)} Z`,
    "ch-doodle ch-vert ch-draw", delay + 0.12));
  out.push(line(
    `M${n(cx + rad * 0.1)},${n(cy + rad * 0.35)} q${n(rad * 0.3)},${n(-rad * 0.1)} ${n(rad * 0.4)},${n(rad * 0.2)}` +
    ` q${n(-rad * 0.25)},${n(rad * 0.3)} ${n(-rad * 0.45)},${n(rad * 0.05)} Z`,
    "ch-doodle ch-vert ch-draw", delay + 0.18));
  return out.join("");
}

function sunburst(cx, cy, rad, delay, r) {
  const out = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const long = i % 2 === 0 ? rad : rad * 0.55;
    out.push(line(
      wobble(cx + Math.cos(a) * rad * 0.18, cy + Math.sin(a) * rad * 0.18,
             cx + Math.cos(a) * long, cy + Math.sin(a) * long, 1.2, 2, r),
      "ch-doodle ch-or ch-draw", delay + i * 0.02));
  }
  out.push(line(circle(cx, cy, rad * 0.17, r, 0.12), "ch-doodle ch-or ch-draw", delay + 0.24));
  return out.join("");
}

function shootingStar(cx, cy, delay, r) {
  const out = [];
  for (let i = 0; i < 3; i++) {
    out.push(line(
      `M${n(cx - 150 - i * 14)},${n(cy + 42 + i * 7)} C${n(cx - 92)},${n(cy + 30 + i * 5)} ${n(cx - 40)},${n(cy + 8 + i * 3)} ${n(cx)},${n(cy)}`,
      "ch-doodle ch-faint ch-draw", delay + i * 0.06));
  }
  out.push(sparkle(cx + 6, cy - 4, 17, delay + 0.22));
  return out.join("");
}

function skyDoodles(r) {
  const out = [];
  // Marge gauche : rien ne descend dans la bande des figures (x 144 → 1296).
  out.push(galaxy(158, 128, 74, 0.42, 0.18, r));
  out.push(saturn(352, 96, 26, 0.22, r));
  out.push(moon(86, 306, 42, 0.26, r));
  out.push(earth(76, 462, 34, 0.3, r));
  // Marge droite.
  out.push(shootingStar(1092, 118, 0.2, r));
  out.push(sunburst(1330, 104, 62, 0.24, r));
  out.push(crescent(1340, 282, 38, 0.28));
  out.push(galaxy(1364, 452, 50, 0.4, 0.32, r));

  // Poussière d'étoiles : on évite le logotype, la rangée et les doodles.
  const skip = (x, y) =>
    (x > 396 && x < 1064 && y > 40 && y < 320) ||
    (x > 116 && x < 1324 && y > 322 && y < 812) ||
    (x > 30 && x < 250 && y > 40 && y < 520) ||
    (x > 1270 && x < 1430 && y > 40 && y < 660);

  let placed = 0;
  for (let i = 0; placed < 46 && i < 400; i++) {
    const x = 16 + r() * (W - 32);
    const y = 18 + r() * 660;
    if (skip(x, y)) continue;
    out.push(sparkle(x, y, 3 + r() * 7, 0.16 + placed * 0.009));
    placed++;
  }
  return out.join("");
}

/* -------------------------------------------------------- l'arrière-plan */

/** Le décor complet : ciel dessiné, logotype, montagnes, cactus, sol. */
export function chalkBackdrop() {
  const r = rng(20260908);
  return `<svg class="chalk-art" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true" focusable="false">
<g class="ch-layer ch-layer--sky">${skyDoodles(r)}</g>
<image class="ch-wordmark" href="/team/chalk-wordmark.webp" x="452" y="62" width="536" height="198" style="--d:0.12s" />
<g class="ch-layer ch-layer--land">${mountains(r)}${cactus(74, false, 0.26, r)}${cactus(1368, true, 0.3, r)}${ground(r)}</g>
</svg>`;
}

/* ------------------------------------------------------------ les figures */

/**
 * Une figure en bâton, dans son propre repère 144 × 420.
 * Les mains sortent exactement sur x = 0 et x = 144 : deux colonnes voisines
 * se tiennent donc la main sans calcul supplémentaire.
 */
function figure(index, r, isFirst, isLast) {
  const cx = 72;
  const HEAD = 174;   // bas de la découpe du visage
  const SHO = 194;    // épaules
  const HAND = 226;   // hauteur des mains tenues
  const HIP = 262;
  const FOOT = 350;   // le sol de la scène passe ici
  const base = 0.3 + index * 0.055;
  const out = [];

  out.push(line(wobble(cx, HEAD - 4, cx, HIP, 1.5, 5, r), "ch-limb ch-draw", base));

  // Bras. Aux deux bouts de la rangée, le bras extérieur est levé et fait
  // signe — comme sur le dessin d'origine. Partout ailleurs il descend vers
  // le bord de la colonne, où il rencontre la main du voisin.
  const wave = (x, y, delay) =>
    line(`M${n(x - 9)},${n(y + 4)} L${n(x - 11)},${n(y - 8)} M${n(x - 3)},${n(y + 2)} L${n(x - 3)},${n(y - 13)}` +
         ` M${n(x + 4)},${n(y + 2)} L${n(x + 5)},${n(y - 13)} M${n(x + 10)},${n(y + 3)} L${n(x + 13)},${n(y - 8)}` +
         ` M${n(x - 9)},${n(y + 4)} Q${n(x)},${n(y + 9)} ${n(x + 10)},${n(y + 3)}`,
         "ch-hand ch-draw", delay);
  // Chaque colonne dessine la moitié du nœud qui tombe sur son bord :
  // mises côte à côte, les deux moitiés forment une seule main tenue.
  const shake = (x, delay) => line(circle(x, HAND, 5.5, r, 0.12), "ch-hand ch-draw", delay);

  if (isFirst) {
    out.push(line(wobble(cx, SHO, 18, 116, 1.6, 5, r), "ch-limb ch-draw", base + 0.06));
    out.push(wave(18, 116, base + 0.2));
  } else {
    out.push(line(wobble(cx, SHO, 0, HAND, 1.8, 5, r), "ch-limb ch-draw", base + 0.06));
    out.push(shake(0, base + 0.2));
  }
  if (isLast) {
    out.push(line(wobble(cx, SHO, 126, 116, 1.6, 5, r), "ch-limb ch-draw", base + 0.06));
    out.push(wave(126, 116, base + 0.2));
  } else {
    out.push(line(wobble(cx, SHO, 144, HAND, 1.8, 5, r), "ch-limb ch-draw", base + 0.06));
    out.push(shake(144, base + 0.2));
  }

  out.push(line(wobble(cx, HIP, 40, FOOT, 1.8, 5, r), "ch-limb ch-draw", base + 0.12));
  out.push(line(wobble(cx, HIP, 104, FOOT, 1.8, 5, r), "ch-limb ch-draw", base + 0.12));
  out.push(line(`M34,${FOOT} l12,-3`, "ch-limb ch-draw", base + 0.18));
  out.push(line(`M110,${FOOT} l-12,-3`, "ch-limb ch-draw", base + 0.18));

  // Les petits traits perpendiculaires qui donnent aux membres leur texture
  // de craie perlée. Ils apparaissent une fois le trait principal tracé.
  const ticks = [];
  const seg = (x1, y1, x2, y2, count) => {
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
      const l = 1.9 + r() * 1.2;
      ticks.push(`M${n(x - Math.cos(a) * l)},${n(y - Math.sin(a) * l)} L${n(x + Math.cos(a) * l)},${n(y + Math.sin(a) * l)}`);
    }
  };
  seg(cx, HEAD - 4, cx, HIP, 6);
  seg(cx, SHO, isFirst ? 18 : 0, isFirst ? 116 : HAND, 5);
  seg(cx, SHO, isLast ? 126 : 144, isLast ? 116 : HAND, 5);
  seg(cx, HIP, 40, FOOT, 6);
  seg(cx, HIP, 104, FOOT, 6);
  out.push(`<path class="ch ch-tick" d="${ticks.join(" ")}" style="--d:${(base + 0.34).toFixed(2)}s" />`);

  return `<svg class="cm-figure" viewBox="0 0 144 420" preserveAspectRatio="none" aria-hidden="true" focusable="false">${out.join("")}</svg>`;
}

/** Les huit colonnes cliquables : figure, visage, nom fléché, rôle. */
export function chalkPeople(members) {
  const r = rng(778812);
  const cols = members
    .map((m, i) => {
      const label = `${m.fullName}, ${m.roleLong}`;
      return `<button type="button" class="cm" data-member="${esc(m.id)}" data-chalk="${esc(m.chalk)}" style="--i:${i};--rot:${(((i * 37) % 9) - 4) * 0.35}deg" aria-haspopup="dialog" aria-label="${esc(label)}">
<span class="cm-name">${esc(m.shortName)}</span>
<span class="cm-arrow" aria-hidden="true"><svg viewBox="0 0 18 30" preserveAspectRatio="none" focusable="false"><path class="ch ch-arrow" d="M9,1 L9,22 M3.5,16 L9,23.5 L14.5,16" pathLength="1" /></svg></span>
${figure(i, r, i === 0, i === members.length - 1)}
<img class="cm-face" src="${esc(m.image)}" alt="" width="180" height="220" fetchpriority="low" decoding="async" />
<span class="cm-role">${esc(m.role)}</span>
</button>`;
    })
    .join("\n");

  return `<div class="chalk-people">${cols}</div>`;
}

/** La fiche qui s'ouvre au clic. Un seul dialogue, rempli à la volée. */
export function memberDialog() {
  return `<div class="cm-modal" id="cm-modal" role="dialog" aria-modal="true" aria-labelledby="cm-modal-name" hidden>
<div class="cm-modal-veil" data-close></div>
<div class="cm-modal-card" role="document">
<svg class="cm-modal-frame" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path class="ch" d="M1.4,2.2 L98.4,1.1 L99,98.6 L1,98.9 Z" pathLength="1" vector-effect="non-scaling-stroke" /></svg>
<button type="button" class="cm-modal-close" data-close aria-label="Fermer">
<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path class="ch" d="M4,4 L20,20 M20,4 L4,20" pathLength="1" /></svg>
</button>
<img class="cm-modal-face" id="cm-modal-face" src="" alt="" width="180" height="220" />
<h2 class="cm-modal-name" id="cm-modal-name"></h2>
<p class="cm-modal-role" id="cm-modal-role"></p>
<p class="cm-modal-bio" id="cm-modal-bio"></p>
</div>
</div>`;
}
