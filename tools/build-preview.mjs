/**
 * Cosmic Review — aperçu statique, sans Astro.
 *
 * Astro reste le vrai build (`npm run build`). Ce script sert quand on n'a
 * pas de registre npm sous la main : il assemble les mêmes modules de
 * `src/lib`, les mêmes feuilles de style et les mêmes scripts que les pages
 * `.astro`, et écrit un dossier `preview/` qu'on peut ouvrir avec n'importe
 * quel serveur statique.
 *
 * Comme il appelle exactement les mêmes fonctions que les pages, ce qu'on
 * voit ici est ce que produira Astro.
 *
 *   node tools/build-preview.mjs
 *   python3 -m http.server 8080 --directory preview
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "preview");

const { siteMarkup, TITLES, DESCRIPTIONS } = await import(
  path.join(ROOT, "src/lib/site.js")
);
const team = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/team.json"), "utf8"));
const projet = JSON.parse(fs.readFileSync(path.join(ROOT, "src/data/projet.json"), "utf8"));
const partenaires = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/partenaires.json"), "utf8")
);

function page(scene) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="${DESCRIPTIONS[scene]}" />
<title>${TITLES[scene]}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<meta name="theme-color" content="#04050c" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/styles/global.css" />
<link rel="stylesheet" href="/styles/chalk.css" />
<link rel="stylesheet" href="/styles/projet.css" />
<link rel="stylesheet" href="/styles/partenaires.css" />
<link rel="preload" as="image" href="/sky.webp" />
<link rel="preload" as="image" href="/cosmic-logo.webp" />
</head>
<body data-scene="${scene}">
${siteMarkup(team.members, projet, partenaires, scene)}
<script type="module" src="/scripts/main.js"></script>
</body>
</html>
`;
}

function copy(from, to) {
  fs.cpSync(path.join(ROOT, from), path.join(OUT, to), { recursive: true });
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

copy("public", ".");
copy("src/styles", "styles");
copy("src/scripts", "scripts");
fs.mkdirSync(path.join(OUT, "lib"), { recursive: true });
copy("src/lib/routes.js", "lib/routes.js");

for (const [scene, url] of Object.entries({
  ciel: "index.html",
  "le-projet": "le-projet/index.html",
  equipe: "equipe/index.html",
  partenaires: "partenaires/index.html",
})) {
  const file = path.join(OUT, url);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, page(scene));
  console.log("preview/" + url);
}
