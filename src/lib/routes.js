/**
 * Cosmic Review — la table des scènes.
 *
 * Partagée entre le build (src/lib/site.js) et le navigateur
 * (src/scripts/router.js). Volontairement minuscule : c'est le seul module
 * de `lib/` qui est envoyé au client.
 */

export const SCENES = {
  ciel: "/",
  "le-projet": "/le-projet",
  equipe: "/equipe",
  partenaires: "/partenaires",
};

export const TITLES = {
  ciel: "Cosmic Review — L'Incident d'Indian Springs",
  "le-projet": "Le Projet — Cosmic Review",
  equipe: "L'Équipe — Cosmic Review",
  partenaires: "Les Partenaires — Cosmic Review",
};

export const DESCRIPTIONS = {
  ciel: "L'Incident d'Indian Springs — long métrage found footage tourné dans le désert du Nevada, porté par la chaîne Cosmic Review.",
  "le-projet": "Found footage horreur tourné entre la France et le désert du Nevada : le pitch, le ton et le parti pris de mise en scène.",
  equipe: "Les huit personnes qui font L'Incident d'Indian Springs : comédiens, réalisation, scénario, son, image et effets visuels.",
  partenaires: "Soutenir le film : la campagne de financement participatif portée par l'association Film 97, et ses paliers.",
};

/** Nom lu à voix haute au changement de scène. */
export const LABELS = {
  ciel: "Carte du ciel",
  "le-projet": "Le Projet",
  equipe: "L'Équipe",
  partenaires: "Les Partenaires",
};

/** Retrouve la scène correspondant à une URL ; `ciel` par défaut. */
export function sceneFromPath(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "/";
  for (const [id, path] of Object.entries(SCENES)) {
    if (path === clean) return id;
  }
  return "ciel";
}
