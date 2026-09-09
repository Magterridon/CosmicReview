# La scène « Les Partenaires » — doc technique et fonctionnelle

Développée le 2026-09-08. Quatrième et dernière scène de la Phase 1 : elle
remplace le texte posé sur un dégradé qui tenait la place jusqu'ici.

---

## 1. Ce que vit le visiteur

1. Depuis l'accueil, il clique l'étoile **Les Partenaires**.
2. **Saut en hyperespace** (~1,2 s) : les étoiles s'étirent en traits
   lumineux, accélèrent, puis freinent — on arrive ailleurs.
3. **La galaxie.** Le logotype Cosmic Review a disparu ; à sa place,
   **Cosmic Partenaires** s'inscrit au centre d'un noyau galactique, et les
   partenaires apparaissent l'un après l'autre en orbite autour du titre.
4. **Clic sur un partenaire** : son **dossier** s'ouvre en grand — chemise
   kraft, onglet à son nom, fiche tapée à la machine, logo agrafé comme une
   photo d'identité. On y lit qui ils sont, ce qu'ils font, leur
   contribution au film et leur mot.
5. **Échap** ou la croix referme le dossier ; **Retour au ciel** ramène à
   l'accueil. Jamais de rechargement de page.

### Registre visuel

Le **photographique** (accueil, Le Projet), pas la craie de L'Équipe : c'est
le `sky.webp` déjà chargé par l'accueil, poussé vers le bleu profond et mis
en rotation lente, avec deux bras de galaxie et un noyau lumineux. On reste
donc dans les deux registres existants, sans en inventer un troisième
(cf. `CLAUDE.md`).

Le titre « Cosmic Partenaires » est un **titre de scène composé en Jost**,
pas une variante du logotype. Le logotype script doré reste une image, jamais
redessinée ni recomposée en texte — contrainte non négociable du projet.

---

## 2. Ajouter un partenaire

**Deux gestes, aucun code à toucher.**

1. Ouvrir `src/data/partenaires.json` et ajouter un bloc dans `partenaires` :

```json
{
  "id": "nom-court",
  "placeholder": false,
  "nom": "Nom du partenaire",
  "secteur": "Ce qu'ils font, en trois mots",
  "ville": "Ville, Pays",
  "depuis": "2026",
  "logo": "/partners/nom-court.svg",
  "couleur": "#e8c07a",
  "description": "Qui ils sont, deux ou trois phrases.",
  "produits": ["Produit ou service", "Un autre"],
  "contribution": "Ce qu'ils apportent concrètement au film.",
  "mot": "Leur phrase, telle qu'ils l'ont écrite.",
  "motPar": "Prénom Nom, fonction"
}
```

2. Déposer le logo dans `public/partners/`.

**La galaxie se met à jour toute seule** : les positions d'orbite sont
calculées à partir du nombre de partenaires (voir §4), il n'y a jamais de
coordonnée à écrire à la main.

### Les champs

| Champ | Obligatoire | Rôle |
|---|---|---|
| `id` | oui | identifiant interne (minuscules, sans espace) ; sert aussi à la référence de dossier |
| `placeholder` | oui | `true` = fiche de démonstration (voir §3) ; `false` = vrai partenaire |
| `nom` | oui | affiché sous le logo, sur l'onglet et en titre du dossier |
| `secteur`, `ville`, `depuis` | non | les lignes d'en-tête de la fiche |
| `logo` | oui | chemin depuis `public/` |
| `couleur` | non | teinte du halo au survol et du filet de citation ; doré par défaut |
| `description` | non | « Qui sont-ils » |
| `produits` | non | liste « Ce qu'ils font » |
| `contribution` | non | « Leur contribution au film » |
| `mot` / `motPar` | non | la citation et sa signature — **le bloc entier disparaît si `mot` est vide** |

Un champ vide ne casse rien : la section correspondante ne s'affiche pas.

### La règle sur les citations

`mot` est une **citation attribuée à une personne réelle** et `contribution`
un **engagement**. N'y écrire que des propos réellement tenus et validés par
le partenaire, jamais un texte rédigé à sa place « en attendant » : une fois
en ligne, la page fait foi. Dans le doute, laisser le champ vide — la fiche
tient très bien sans.

---

## 3. Les trois partenaires actuels sont des placeholders

Le projet n'a pas encore de partenaire. La scène est donc peuplée de **trois
sociétés inventées**, uniquement pour montrer la mise en page :

| Nom | Secteur | Fichier logo |
|---|---|---|
| Atelier Vela | optiques et location caméra | `vela.svg` |
| Studio Coriolis | son et post-production | `coriolis.svg` |
| Quillon Field Services | logistique de tournage | `quillon.svg` |

Ces noms ont été **vérifiés comme ne correspondant à aucune société réelle**
du secteur (un premier nom, « Halo Nevada », a été écarté parce qu'il frôlait
des sociétés de production existantes). Les logos sont des **dessins SVG
abstraits originaux**, pas des reprises de marques.

Pour que personne ne prenne la démo pour un vrai soutien, trois marqueurs
sont en place tant que `placeholder` vaut `true` :

- un **tampon « SPÉCIMEN »** sur la fiche ;
- un **avis en clair** dans le dossier : « Cette société est fictive… » ;
- une **note sous la galaxie** : « Partenaires de démonstration ».

Les marqueurs disparaissent d'eux-mêmes dès qu'une entrée passe à
`"placeholder": false`. La note sous la galaxie s'efface quand plus aucune
entrée n'est un placeholder.

**Au moment de mettre de vrais partenaires** : remplacer les trois entrées
(ou les supprimer), déposer les vrais logos, passer `placeholder` à `false`.

---

## 4. Les fichiers

| Fichier | Rôle |
|---|---|
| `src/data/partenaires.json` | **la seule chose à éditer** — les partenaires |
| `public/partners/*.svg` | les logos |
| `src/lib/partenaires.js` | le HTML de la scène + le calcul des orbites |
| `src/scripts/partenaires.js` | l'hyperespace et l'ouverture du dossier |
| `src/styles/partenaires.css` | la galaxie, les orbites, le dossier |

Branchements dans l'existant : `src/lib/site.js` (la scène entre dans la
pile), `src/scripts/main.js` (`enter`/`leave`), `src/layouts/Layout.astro`
(la feuille de style), les quatre pages `src/pages/*.astro` et
`tools/build-preview.mjs` (les données passent à `siteMarkup`).

### Le calcul des orbites

`orbites(n)` dans `src/lib/partenaires.js` répartit `n` partenaires :

- **jusqu'à 6** : un seul anneau, rayon 30 % ;
- **au-delà** : deux anneaux (37 % et 20 %), le second décalé d'un demi-pas
  pour éviter les alignements.

L'anneau est **elliptique** (`ry = rx × 0,62`) : l'orbite est vue de biais,
pas de face. Chaque logo reçoit une profondeur `--z` (taille et opacité) et
un délai `--d` (apparition en cascade, flottement désynchronisé). Tout est en
pourcentages, donc juste à toutes les tailles d'écran.

Testé de 1 à 11 partenaires : tout reste dans le cadre. Au-delà d'une dizaine,
la galaxie se densifie — ce sera le moment de passer à trois anneaux ou de
réduire les logos.

### Le saut en hyperespace

Canvas 2D, 420 traits partant du centre. La vitesse suit une courbe
accélération/freinage (`t < 0,62` puis freinage) et la longueur de traînée
suit la vitesse : c'est ce qui fait lire le voyage. Le canvas ne tourne que
pendant le saut, s'efface à l'arrivée, et s'arrête net quand on quitte la
scène — rien ne tourne en fond.

Le saut **se rejoue à chaque arrivée**, y compris quand on ouvre
`/partenaires` directement : le lien partageable a droit au même voyage.

---

## 5. Accessibilité

- **Sans JavaScript** : la galaxie ne s'anime pas, mais tout le contenu des
  dossiers est dans la page (bloc `.pa-source`, réservé aux lecteurs
  d'écran) — lisible et indexable. Les liens redeviennent de vrais liens.
- **`prefers-reduced-motion`** : pas de saut en hyperespace (le canvas est
  retiré du rendu), pas de rotation de galaxie, pas de flottement. On arrive
  directement, tout en place.
- **Clavier** : chaque partenaire est un `<button>` ; le dossier piège le
  focus, se ferme par Échap, et rend le focus au partenaire d'où l'on venait.
- **Lecteur d'écran** : `#pa-live` annonce l'ouverture d'un dossier et
  précise « fiche de démonstration » le cas échéant.
- **Petits écrans** : sous 560 px l'orbite devient une grille à deux colonnes
  et la scène défile normalement. Pas de défilement horizontal.

---

## 6. Vérifications passées

Aperçu construit avec `node tools/build-preview.mjs`, servi en statique et
piloté dans Chromium :

- rendu 1440×900, 820×1180 et 390×844 (mobile tactile) — regardé, pas
  seulement mesuré ;
- les trois dossiers s'ouvrent avec le bon nom, le bon nombre de produits,
  le tampon et l'avis ;
- ouverture au clavier, focus piégé, Échap, focus rendu à l'orbe ;
- navigation ciel → partenaires → ciel **sans rechargement** (`window` conservé),
  URL et scène active correctes, saut rejoué à la ré-arrivée ;
- empilement astuce / note / retour sans chevauchement aux trois tailles ;
- `prefers-reduced-motion` : arrivée directe, canvas retiré ;
- **aucune erreur JavaScript**.

Les seuls 404 de l'aperçu concernent les portraits de L'Équipe (non copiés
dans l'environnement de test) et Google Fonts (bloqué par le proxy) — sans
rapport avec cette scène.

---

## 7. Ce qui reste ouvert

- **Les vrais partenaires**, quand ils arriveront (§2 et §3).
- **Le lien vers la campagne de financement** : le texte des paliers (Film 97,
  15 000 € → 22 000 €) qui vivait dans l'ancienne page de texte **n'a pas été
  repris** dans la galaxie. À trancher avec Eury : un « astre » dédié au
  financement participatif dans cette scène, un bandeau sous la galaxie, ou
  une cinquième scène. L'URL exacte de la campagne reste à récupérer.
- **Au-delà d'une dizaine de partenaires** : passer à trois anneaux.
- `tools/selftest.html` ne couvre que la scène Le Projet ; y ajouter des
  points sur celle-ci si le fichier reste la méthode de test du projet.
