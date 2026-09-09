# Cosmic Review — site web

Site vitrine de **L'Incident d'Indian Springs**. Astro statique, JS vanilla,
CSS natif (variables). Voir `CLAUDE.md` à la racine du dépôt pour le contexte
projet et `stack-technique.md` dans le projet Claude pour le détail des choix.

## Démarrer

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # génère dist/
npm run preview  # vérifie le build
```

## Architecture : un seul document, aucun rechargement

**Le site ne recharge jamais de page.** Les quatre scènes (ciel, Le Projet,
L'Équipe, Les Partenaires) sont toutes dans le même document, empilées au même
endroit. Naviguer, c'est déplacer l'attribut `data-active` de l'une à l'autre :
le CSS joue le fondu et le mouvement de caméra, et l'History API garde l'URL,
le titre et le bouton Précédent en phase.

```
src/lib/routes.js      table des scènes — le seul module de lib/ envoyé au client
src/lib/site.js        la pile de scènes, assemblée au build
src/lib/draw.js        le vocabulaire du trait, partagé par les deux scènes
src/lib/chalk.js       le monde à la craie de la scène Équipe
src/lib/projet.js      les deux mondes de la scène Le Projet, objets au trait
src/data/team.json     l'équipe : ordre, couleurs de craie, présentations
src/data/projet.json   les répliques de la scène Le Projet, avant et après
src/scripts/router.js  déplace data-active, écrit l'URL, gère le focus
src/scripts/team.js    rejoue le tracé, ouvre la fiche d'une personne
src/scripts/projet.js  écrit les répliques, compte les éléments vus, bascule
src/scripts/skyfx.js   météores et parallaxe, en pause hors de la scène ciel
```

Les quatre routes (`/`, `/le-projet`, `/equipe`, `/partenaires`) rendent
**exactement la même pile** ; seule la scène marquée active au chargement
change. D'où : liens partageables, site statique, et navigation sans
rechargement une fois la page ouverte.

Les liens gardent leur `href`. Sans JavaScript, ils redeviennent de vrais
liens et le site fonctionne page par page, transitions en moins.

**Ajouter une scène** : une entrée dans `SCENES`/`TITLES`/`DESCRIPTIONS`
(`src/lib/routes.js`), une fonction de rendu dans `src/lib/site.js`, un fichier
dans `src/pages/`, et l'état de repos de la scène dans `global.css`.

## Ce qui est en place (Phase 1)

- **Accueil** — ciel étoilé photographique, logotype Cosmic Review posé dans le
  ciel, désert du Nevada stylisé, navigation par trois étoiles qui révèlent leur
  nom au survol, et météores occasionnels (toutes les 7-18 s). Au clic,
  l'étoile s'embrase avant le départ.
- **Le Projet** — deux lieux séparés par un éclair : la cour dans le nord de la
  France, puis le désert du Nevada. Voir ci-dessous.
- **L'Équipe** — voir ci-dessous.
- **Les Partenaires** — texte rédigé à partir de
  `Présentation projet/Présentation.md`. Contenu à relire et compléter, et
  toujours en attente de l'URL de la campagne.

## La scène « Le Projet »

Deux lieux, séparés par un éclair. C'est le seul endroit du site où l'on
change de monde.

### Avant — la cour, nord de la France

Un bâtiment long et bas, deux fenêtres allumées, une haie, un champ. Aucun
signe de ferme : c'est une maison, on ne dit pas laquelle. Les deux amis dans
la cour avec le télescope, la caméra sur pied qui tourne. Les fenêtres sont la
seule source chaude de l'image — ce sont elles qui détourent les silhouettes,
et c'est leur absence qui rendra le désert froid.

Le ciel y est **volontairement pauvre** : la même photographie que l'accueil,
mais désaturée, assombrie, avec le halo orange des lampadaires bas sur
l'horizon. On ne voit rien d'ici. C'est pour ça qu'ils veulent partir.

**Six éléments** : Arthur (penché sur l'oculaire), Axel (qui parle à la
caméra), le télescope, la caméra, la fenêtre allumée, et le carnet d'Arthur —
celui où sont notées les coordonnées. C'est ce carnet qui enverra Axel dans le
désert, et sa réplique le dit sans le dire : « Il y a une page qu'il ne me
montre pas. »

### Le fondu

Il n'y a pas de coupe. Quand les six ont parlé — ou via « Fin de
l'enregistrement », proposé dès le troisième pour que personne ne reste
coincé — **tout fond, pendant neuf secondes** :

1. les traits de la cour **se dé-tracent**, dans l'ordre où on les avait posés
   (`stroke-dashoffset` de 0 à 1, l'animation du tracé jouée à l'envers) ;
2. l'image blanchit jusqu'au laiteux — un filtre qui monte le blanc et écrase
   le contraste, plus un voile pâle ;
3. à 3,6 s, au plus épais du lavis, `data-state` bascule : le monde est
   échangé pendant qu'on n'y voit rien ;
4. le désert émerge — et il émerge **délavé**, il ne redevient jamais net.

Ce qui fait peur ici n'est pas un à-coup, c'est que ça ne s'arrête pas de
fondre. En `prefers-reduced-motion` le fondu est raccourci à 2,4 s, sans
animation de filtre — il reste, parce qu'il est le pivot du récit.

### Après — Jean Dry Lake, Nevada

Le ciel s'ouvre — mais **délavé** : un filtre permanent sur le cadre
(`contrast(0.62) brightness(1.2) saturate(0.34)`) et un voile laiteux. On voit
enfin le ciel qu'ils voulaient, et il est blanchi, sans contraste, comme une
bande abîmée.

**Les traits du désert sont rompus** : `stroke-dasharray: 0.05 0.022` sur des
chemins de `pathLength` 1, donc une quinzaine de coupures par trait. Le dessin
ne s'y trace pas — il est déjà là, et déjà effacé par endroits.

**Trois éléments** : Axel seul, la jeep, le panneau. Rien là où il y avait
quelque chose. **Le compteur passe de six à trois**, et c'est lui qui dit ce
qui manque : le visiteur a cliqué six fois dans la cour, il n'a plus que trois
choses à toucher.

**Aucun retour.** L'éclair ne se rejoue pas ; recharger la page est le seul
moyen de revoir le vlog 50, comme on rembobine une cassette. Axel non plus ne
revient pas en arrière.

### Ce qu'on ne dit jamais

Le mot « suicide » n'apparaît nulle part, ni dans la cour ni dans le désert, et
il ne doit pas y apparaître. Ce qui le porte, c'est la mécanique : le vlog 50
se tourne à deux et parle d'un voyage en avril, le vlog 51 se tourne seul au
même point du ciel. Entre les deux, un éclair. Personne n'a besoin qu'on lui
explique.

### Le bandeau

Au clic, la réplique s'écrit dans un bandeau de transcription — timecode qui
avance en temps réel, témoin d'enregistrement, compteur : le found footage
comme langage, pas comme décor. Sous la réplique, une ligne de crédit
minuscule, façon incrustation de sous-titre (« Axel — rôle principal, joué par
Benjamin Cléry ») : c'est ce qui permet à la page de rester narrative tout en
restant lisible pour quelqu'un qui découvre le projet. « Le film en trois
lignes » complète, avec le synopsis et le lien vers Les Partenaires.

**Règle d'écriture** : chaque élément parle au présent, à la première personne,
dans l'instant. Jamais de notice.

### Comment c'est dessiné

**Une règle : le monde est photographique, ce qui appartient à l'histoire est
dessiné à la main par-dessus.** Le ciel et le sol sont du décor. Les neuf
objets — les deux amis, le télescope, la caméra, la fenêtre, le carnet, la
jeep, le panneau — sont des dessins au trait, jamais des aplats.

C'est la même main que le tableau noir de l'Équipe, et ce n'est pas qu'une
question de goût : une silhouette pleine est jugée comme une forme, donc la
moindre erreur de proportion s'y lit comme une erreur ; un dessin au trait est
jugé comme un dessin, et a le droit d'être schématique.

Le vocabulaire vit dans **`src/lib/draw.js`**, partagé par les deux scènes :
`wobble()` (le trait tremblé), `circle()` (le cercle bancal), `path()` (la
ligne brisée). `projet.js` y ajoute un « stylo » (`pen()`) qui garde la graine
aléatoire et le compteur de délai, pour que les traits d'un objet se tracent
dans l'ordre où on les écrit.

Chaque trait porte `pathLength="1"` : `stroke-dashoffset` va donc de 1 à 0 avec
le même timing quelle que soit la longueur réelle. **L'état par défaut est le
dessin fini** — sans JavaScript, ou en `prefers-reduced-motion`, la scène est
simplement là, déjà tracée.

Le tracé se rejoue à chaque arrivée sur la scène, objet après objet
(`--o` porte le décalage de chacun, de 0 à 3,4 s).

**Les contours se cliquent par l'intérieur** : `fill: transparent` et non
`fill: none`. Sans ça il faudrait viser un trait de deux pixels.

**Géométrie.** Repère 1440 × 900, horizon à y = 668 pour les deux mondes — ce
qui permet aux bandes de sol étirées de servir dans les deux cas. `place()`
convertit le point d'appui au sol de chaque élément en pourcentages, donc tout
reste solidaire du décor à n'importe quelle taille. Le cadre tient toujours
entier à l'écran et le sol se prolonge jusqu'aux bords — voir « Cadrage ».

**Zones cliquables.** Les boutons sont en `pointer-events: none` et seule la
silhouette peinte reçoit le clic — sinon les boîtes d'Arthur et du télescope,
qui se chevauchent, s'attraperaient les clics l'une l'autre.

**Les répliques ne sont pas dupliquées dans le script** : elles sont dans la
page, dans un bloc réservé aux lecteurs d'écran (`.pj-source`), et le bandeau
va les y chercher. Une seule source, et les 18 répliques restent lisibles et
indexables sans JavaScript.

**Petits écrans** (< 700 px de large, ou < 520 px de haut) : on ne réorganise
pas la scène, on l'agrandit pour qu'elle remplisse la hauteur et on la parcourt
du doigt — même choix que le désert de la page Équipe.

Modifier les répliques : `src/data/projet.json`, où les deux mondes sont
séparés. Les positions et les dessins sont dans `src/lib/projet.js` (table
`ART`, elle aussi en deux moitiés).

## La scène « L'Équipe »

Reprise du dessin de l'équipe (`Présentation projet/Photos/team.jpg`) : tableau
noir, doodles cosmiques, montagnes et cactus à la craie, huit figures en bâton
qui se tiennent la main, tête découpée en photo.

**L'arrivée depuis le ciel est la transition.** La caméra bascule vers le sol
(le ciel photographique s'éloigne et s'agrandit), puis le monde à la craie *se
dessine tout seul* : le sol d'abord, les crêtes, les cactus, puis chaque figure
de gauche à droite, les visages, les noms fléchés, les intitulés. Environ 2 s.

Techniquement : chaque trait porte `pathLength="1"`, donc `stroke-dashoffset`
passe de 1 à 0 avec le même timing quelle que soit sa longueur réelle. L'état
par défaut est l'état *final* — sans JavaScript, ou en `prefers-reduced-motion`,
la scène est simplement là, déjà dessinée.

**Géométrie.** La scène est un repère 1440 × 900 dont le conteneur garde
toujours le rapport, donc les coordonnées SVG et les pourcentages CSS coïncident
exactement. La rangée occupe x 144 → 1296, soit huit colonnes de 144 : chaque
colonne dessine la moitié du nœud qui tombe sur son bord, et deux voisins se
tiennent la main sans réglage. Aux deux bouts, le bras extérieur est levé et
fait signe, comme sur le dessin d'origine.

**Survol / focus** : la géométrie ne bouge pas — les mains restent jointes.
C'est la craie qui est appuyée plus fort et le visage qui se soulève d'un
cheveu. Au clic (ou Entrée / Espace), la fiche s'ouvre avec la photo, le nom,
le rôle et la présentation, dans la couleur de craie de la personne.

**Les textes des fiches ne sont pas dupliqués dans un JSON** : ils sont dans la
page, dans un bloc réservé aux lecteurs d'écran (`.team-bios`), et la fiche va
les y chercher. Une seule source, et le contenu reste lisible et indexable même
sans JavaScript.

**Petits écrans** (< 780 px de large, ou < 520 px de haut — ce qui attrape
aussi le téléphone couché) : on ne réorganise pas le dessin en grille, on
l'agrandit et on le parcourt du doigt. Au-dessus, les huit tiennent à l'écran.

Modifier l'équipe : `src/data/team.json` (ordre, noms courts, couleurs de
craie, intitulés, présentations). Tout le reste suit.

## Les images

- `public/sky.webp` — recomposé à partir de `Présentation projet/Photos/CosmicLogo.jpeg`
  (les bandes de ciel au-dessus et en dessous du logotype, fondues entre elles).
  Le ciel du site est donc littéralement celui de l'identité Cosmic Review.
  Il sert à l'accueil **et** à la scène Le Projet : un seul fichier chargé.
- `public/cosmic-logo.webp` — le logotype extrait de cette même image, détouré
  en transparence. **Il n'a pas été redessiné ni reconstitué avec une police :
  ce sont les pixels d'origine.** Si une version vectorielle (SVG/AI) existe,
  la substituer telle quelle donnera un rendu plus net en très grand format.
- Le désert est en SVG, dessiné à la main d'après `Nevada.jpeg` : buttes à cap
  plat, falaise verticale et talus évasé. Volontairement graphique, pas photo-
  réaliste — on doit reconnaître le désert sans que ce soit un décalque.

- `public/team/portraits/*.webp` — les huit visages, découpés depuis
  `team.jpg`. On garde le **bord de découpe irrégulier** d'origine (pas de
  cercle imposé) : le collage fait partie du style. Environ 90 px dans le
  dessin source, doublés et légèrement accentués — nets à la taille des
  figures, volontairement modestes dans la fiche. **À remplacer dès que de
  vrais portraits haute définition existent** : un fichier par personne, même
  nom, rien d'autre à changer.
- `public/team/chalk-wordmark.webp` — le logotype à la craie, extrait de
  `team.jpg`. Ce sont les pixels de l'œuvre de l'équipe : comme le logotype
  doré, **il n'est ni redessiné ni vectorisé**.

Régénérer : `tools/extract-assets.py` pour le ciel et le logotype doré,
`tools/extract-portraits.py` pour les visages et le logotype à la craie
(tous deux nécessitent Pillow, numpy et scipy).

## Cadrage : ce qui se rogne et ce qui ne se rogne pas

Une règle, valable pour tout le site :

> **Le décor peut être rogné. Ce qui porte du sens, jamais.**

Le ciel photographique est du décor : il couvre l'écran quelle qu'en soit la
forme, et un bout d'étoile en moins ne coûte rien. Le logotype, les étoiles de
navigation, les sept éléments de la scène Le Projet, les huit figures de
L'Équipe : eux tiennent toujours entiers.

D'où trois couches indépendantes plutôt qu'une image unique mise à l'échelle :

1. **le ciel** couvre l'écran (`cover`) ;
2. **la composition** s'inscrit *entière* dans la place disponible — elle
   rétrécit, elle ne se coupe pas — et se pose en bas, comme un sol ;
3. **le sol** déborde de part et d'autre de la composition pour rejoindre les
   bords de l'écran, de sorte qu'aucun ciel n'apparaisse sous l'horizon.

Trois pièges rencontrés, qui expliquent la forme du code :

- **Ne jamais faire dépendre une hauteur d'une largeur.** Le désert de
  l'accueil grandissait avec la largeur de la fenêtre pendant que sa position
  suivait la hauteur : il débordait par le bas sur les écrans panoramiques et
  se réduisait à un trait sur les écrans étroits. Il est maintenant ancré en
  bas et dimensionné en `dvh` — l'horizon tombe aux quatre cinquièmes de la
  hauteur, d'un téléphone à un 21/9.
- **Un voile de bord appartient à l'écran, pas au cadre.** Tant que la
  composition touchait les bords, les deux revenaient au même ; dès que le sol
  s'est mis à continuer au-delà, le voile dessinait une arête verticale en
  plein désert.
- **`overflow: hidden` crée une zone défilable ; `overflow: clip` non.** Les
  bandes de sol dépassent volontairement de plusieurs écrans : avec `hidden`,
  le recentrage tactile de la scène Le Projet déplaçait l'image sur *tous* les
  écrans, pas seulement sur les petits.

Sur petit écran — moins de 700 px de large, ou moins de 520 px de haut, ce qui
attrape aussi le téléphone couché — on renonce à tout montrer d'un coup :
la scène remplit la hauteur, déborde en largeur, et se parcourt au doigt.
C'est le seul cas où quelque chose sort du cadre, et on peut aller le chercher.

La scène Le Projet a une contrainte de plus : le bandeau de transcription ne
doit rien masquer. Sa hauteur dépend de son contenu, donc `projet.js` la mesure
(`ResizeObserver`) et la publie dans `--pj-bar`, que le CSS retire de la place
disponible. Sans JavaScript, une valeur par défaut volontairement large prend
le relais : l'image est un peu plus petite, rien n'est caché.

## Prévisualiser sans npm

`npm run dev` reste la bonne façon de travailler. Si le registre npm n'est pas
accessible, `tools/build-preview.mjs` assemble un aperçu statique à partir des
**mêmes** modules, feuilles de style et scripts que les pages Astro :

```bash
node tools/build-preview.mjs
python3 -m http.server 8080 --directory preview
```

## Vérifier

Deux outils, à copier dans `preview/` après un build (`sh tools/vp.sh` s'en
charge) :

- `tools/vp.sh` écrit `__vp.html` (rend une route à une taille d'écran exacte,
  via une iframe — indispensable, le navigateur sans tête refusant les fenêtres
  de moins de 500 px) et `__fit.html` (vérifie que les sept éléments de la
  scène Le Projet tiennent entiers, bandeau compris).
- `tools/shoot.sh <route> <préfixe>` capture la route à sept tailles et en
  assemble une planche-contact.

```bash
node tools/build-preview.mjs && sh tools/vp.sh
sh tools/shoot.sh /le-projet/ pj      # planche-contact
```

Cadrage vérifié sur 3440×1440, 2560×1080, 1920×1080, 1512×982, 1440×900,
1440×620, 1366×768, 1280×800, 1180×820, 1024×768, 1000×1300, 912×1368,
800×1280, 768×1024, et en téléphone debout comme couché.

### Interactions de la scène Le Projet

`tools/selftest.html` pilote la scène dans une iframe et vérifie 48 points :
zones réellement cliquables dans les deux mondes, écriture des répliques,
crédits, compteur qui tombe de six à trois, fondu automatique et manuel,
absence de retour, délavé du désert, traits rompus, panneau synopsis (focus
piégé, Échap), navigation sans rechargement, timecode. À copier dans `preview/` puis
à ouvrir dans un navigateur :

```bash
node tools/build-preview.mjs && cp tools/selftest.html preview/
python3 -m http.server 8080 --directory preview   # → /selftest.html
```

## Typographie

**Jost** (Google Fonts) — géométrique, esprit National Geographic / club
d'exploration des années 70-80, cohérent avec le registre du logotype. Le
logotype script, lui, reste toujours une image. Le bandeau de transcription
utilise la monospace du système : c'est un rush, pas une page de livre.

## Accessibilité

Chaque figure et chaque élément de la scène Le Projet est un vrai `<button>` :
tabulation, Entrée/Espace, contour de focus visible. Les fiches et le panneau
synopsis piègent le focus tant qu'ils sont ouverts, se ferment avec Échap et
rendent le focus à l'endroit d'où l'on vient. Le changement de scène est annoncé
(`aria-live`) et le focus va au titre de la scène une fois le fondu terminé ;
les répliques de la scène Le Projet sont annoncées en entier plutôt que lettre
par lettre. `prefers-reduced-motion` coupe le tracé, l'effet machine à écrire,
les mouvements de caméra, les météores et la parallaxe — il reste un fondu
court.

## À faire

- Relire et compléter le contenu des trois pages.
- **Faire réécrire les répliques de la scène Le Projet par Benjamin et Julie** :
  ce sont des lignes de scénario, les textes actuels sont des placeholders.
- Remplacer les huit portraits par des photos haute définition quand elles
  existent (voir « Les images »).
- Récupérer l'URL de la campagne de financement (page Les Partenaires).
- Créer le repo GitHub puis brancher Vercel + `cosmicreview.fr`.
