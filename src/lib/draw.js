/**
 * Cosmic Review — le vocabulaire du trait à la main.
 *
 * Ces quelques primitives sont la « main » du site : elles produisent des
 * chemins volontairement tremblés, et surtout des chemins *traçables* — chaque
 * trait porte `pathLength="1"`, ce qui permet à `stroke-dashoffset` de passer
 * de 1 à 0 avec le même timing quelle que soit la longueur réelle du trait.
 * Sans ça, une ligne courte se dessinerait plus vite qu'une longue.
 *
 * Partagé entre le tableau noir de l'Équipe (`chalk.js`) et les objets du
 * Projet (`projet.js`) : les deux scènes doivent avoir la même écriture.
 *
 * Rien de tout ça ne tourne dans le navigateur — ces fonctions sont appelées
 * au build et produisent des chaînes de SVG.
 */

/** Générateur pseudo-aléatoire déterministe : le tracé est le même à chaque build. */
export function rng(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const n = (v) => Math.round(v * 10) / 10;

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Trait « tracé à la main » : le segment est découpé et chaque point est
 * décalé perpendiculairement de quelques dixièmes. C'est ce qui empêche les
 * lignes de ressembler à du vectoriel propre.
 */
export function wobble(x1, y1, x2, y2, amp, segs, r) {
  return `M${n(x1)},${n(y1)}` + wobbleTo(x1, y1, x2, y2, amp, segs, r);
}

/** Même trait, mais sans le `M` initial : pour enchaîner des segments. */
export function wobbleTo(x1, y1, x2, y2, amp, segs, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  let d = "";
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    // l'écart s'annule aux extrémités : les traits se rejoignent proprement
    const k = Math.sin(t * Math.PI) * amp * (r() * 2 - 1);
    d += ` L${n(x1 + dx * t + px * k)},${n(y1 + dy * t + py * k)}`;
  }
  return d;
}

/** Cercle un peu bancal, comme tracé d'un geste. */
export function circle(cx, cy, rad, r, wob = 0.05) {
  const steps = 26;
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = rad * (1 + (r() * 2 - 1) * wob);
    const x = cx + Math.cos(a) * rr;
    const y = cy + Math.sin(a) * rr * 0.98;
    d += (i ? " L" : "M") + n(x) + "," + n(y);
  }
  return d + " Z";
}

/**
 * Une ligne brisée qui passe par une suite de points, tremblée à chaque
 * segment. `close` referme le contour.
 */
export function path(points, r, amp = 1.1, segs = 5, close = false) {
  if (!points.length) return "";
  let d = `M${n(points[0][0])},${n(points[0][1])}`;
  for (let i = 1; i < points.length; i++) {
    d += wobbleTo(points[i - 1][0], points[i - 1][1], points[i][0], points[i][1], amp, segs, r);
  }
  if (close) {
    const a = points[points.length - 1];
    const b = points[0];
    d += wobbleTo(a[0], a[1], b[0], b[1], amp, segs, r) + " Z";
  }
  return d;
}

/**
 * Les petits traits perpendiculaires qui donnent aux membres leur texture de
 * craie perlée. C'est la signature du dessin de l'équipe (`team.jpg`) : sans
 * eux, un trait reste du vectoriel propre.
 *
 * `segs` : une suite de [x1, y1, x2, y2, nombre de traits].
 */
export function ticks(segs, r) {
  const out = [];
  for (const [x1, y1, x2, y2, count] of segs) {
    for (let i = 1; i < count; i++) {
      const t = i / count;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
      const l = 1.9 + r() * 1.2;
      out.push(
        `M${n(x - Math.cos(a) * l)},${n(y - Math.sin(a) * l)} L${n(x + Math.cos(a) * l)},${n(y + Math.sin(a) * l)}`
      );
    }
  }
  return out.join(" ");
}
