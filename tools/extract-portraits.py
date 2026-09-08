#!/usr/bin/env python3
"""
Cosmic Review — extraction des portraits de l'equipe depuis team.jpg.

team.jpg est le dessin a la craie de l'equipe : 8 tetes decoupees, collees
sur fond noir au-dessus de figures en baton. Ce script isole chaque tete
en PNG/WebP transparent, en gardant le bord decoupe irregulier d'origine
(on ne force pas un cercle : le collage fait partie du style).

Methode : detection des blobs "photo" dans la bande des tetes (ouverture
morphologique pour eliminer les traits fins de craie), puis suppression du
fond par remplissage depuis le bord de la vignette — les pixels sombres
connectes au bord deviennent transparents, les cheveux et lunettes sombres
a l'interieur restent opaques.

Usage : python tools/extract-portraits.py [chemin/vers/team.jpg]
Extrait aussi le logotype CosmicReview a la craie present dans le meme
dessin. Ce sont les pixels d'origine de l'oeuvre de l'equipe — le logo
n'est jamais redessine ni vectorise (contrainte fixe du projet).

"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.dirname(HERE)
DEFAULT_SRC = os.path.normpath(os.path.join(
    PROJECT, "..", "Presentation projet", "Photos", "team.jpg"))
OUT_DIR = os.path.join(PROJECT, "public", "team", "portraits")

# Ordre de gauche a droite dans team.jpg (identique a la rangee du dessin).
IDS = ["alexis-c", "alix", "louis", "benjamin",
       "thomas", "damien", "julie", "alexis-m"]

BAND = (0.55, 0.79)     # bande ou se trouvent les tetes, en fraction de hauteur
BG_MAX = 46             # au-dela : considere comme sujet, pas comme fond
OPEN = 9                # taille de l'ouverture : efface les traits de craie
REGROW = 5              # dilatation qui rattrape le bord erode par l'ouverture


def head_masks(img):
    """Masques des 8 tetes, de gauche a droite, sans fleches ni bras de craie.

    L'ouverture morphologique supprime les traits fins (fleches au-dessus,
    bras et corps en dessous) et ne laisse que les blobs pleins des photos.
    On redilate ensuite chaque blob en le reintersectant avec le masque
    d'origine : le bord exact de la decoupe revient, sans que le masque
    puisse redescendre le long des bras.
    """
    h, w = img.shape[:2]
    solid = img.max(axis=2) > BG_MAX
    opened = ndimage.binary_opening(solid, np.ones((OPEN, OPEN), bool))

    lab, n = ndimage.label(opened)
    if n == 0:
        raise SystemExit("Aucune tete detectee — verifier BAND / BG_MAX.")

    ymin, ymax = h * BAND[0], h * BAND[1]
    cands = []
    for comp, (sy, sx) in enumerate(ndimage.find_objects(lab), start=1):
        area = int((lab[sy, sx] == comp).sum())
        cy = (sy.start + sy.stop) / 2
        if area > 900 and ymin <= cy <= ymax:
            cands.append({"comp": comp, "area": area,
                          "x0": sx.start, "x1": sx.stop})

    # Une frange ou une monture sombre peut couper une tete en deux blobs.
    # On regroupe donc les blobs qui se superposent nettement en x : c'est
    # la meme personne, les figures voisines ne se chevauchent pas.
    cands.sort(key=lambda c: c["x0"])
    groups = []
    for c in cands:
        prev = groups[-1] if groups else None
        if prev:
            overlap = min(prev["x1"], c["x1"]) - max(prev["x0"], c["x0"])
            narrower = min(prev["x1"] - prev["x0"], c["x1"] - c["x0"])
            if overlap > 0.4 * narrower:
                prev["comps"].append(c["comp"])
                prev["area"] += c["area"]
                prev["x0"] = min(prev["x0"], c["x0"])
                prev["x1"] = max(prev["x1"], c["x1"])
                continue
        groups.append({"comps": [c["comp"]], "area": c["area"],
                       "x0": c["x0"], "x1": c["x1"]})

    groups.sort(key=lambda g: g["area"], reverse=True)
    keep = sorted(groups[:len(IDS)], key=lambda g: g["x0"])
    if len(keep) < len(IDS):
        raise SystemExit("%d tetes trouvees, %d attendues." % (len(keep), len(IDS)))

    out = []
    for g in keep:
        blob = np.isin(lab, g["comps"])
        grown = ndimage.binary_dilation(blob, iterations=REGROW) & solid
        # une seule composante : evite de rattraper un trait voisin isole
        gl, gn = ndimage.label(grown)
        if gn > 1:
            sizes = ndimage.sum(grown, gl, range(1, gn + 1))
            grown = gl == (int(np.argmax(sizes)) + 1)
        grown = ndimage.binary_fill_holes(grown)
        out.append(grown)
    return out


def cut_out(img, mask, pad=6):
    """Vignette RGBA : la tete opaque, tout le reste transparent."""
    ys, xs = np.where(mask)
    h, w = mask.shape
    y0 = max(0, ys.min() - pad); y1 = min(h, ys.max() + 1 + pad)
    x0 = max(0, xs.min() - pad); x1 = min(w, xs.max() + 1 + pad)

    rgba = np.dstack([img[y0:y1, x0:x1],
                      np.where(mask[y0:y1, x0:x1], 255, 0).astype(np.uint8)])
    im = Image.fromarray(rgba, "RGBA")
    # adoucit tres legerement le bord de decoupe, sinon il crenele
    im.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(0.7)))
    return im


WORDMARK_BOX = (315, 100, 1015, 360)   # zone du logotype dans team.jpg


def extract_wordmark(img, out_path):
    """Isole le logotype a la craie, sans les doodles alentour.

    On ne garde que les composantes entierement contenues dans la zone du
    logotype : la galaxie en haut a gauche et la planete au-dessus en
    depassent, elles sont donc ecartees d'office.
    """
    x0, y0, x1, y1 = WORDMARK_BOX
    solid = img.max(axis=2) > 55
    lab, n = ndimage.label(solid, structure=np.ones((3, 3)))

    keep = np.zeros(lab.shape, bool)
    for comp, (sy, sx) in enumerate(ndimage.find_objects(lab), start=1):
        if (sx.start >= x0 and sx.stop <= x1 and
                sy.start >= y0 and sy.stop <= y1 and
                int((lab[sy, sx] == comp).sum()) > 240):
            keep |= lab == comp

    ys, xs = np.where(keep)
    cy0, cy1 = ys.min() - 6, ys.max() + 7
    cx0, cx1 = xs.min() - 6, xs.max() + 7
    rgba = np.dstack([img[cy0:cy1, cx0:cx1],
                      np.where(keep[cy0:cy1, cx0:cx1], 255, 0).astype(np.uint8)])
    im = Image.fromarray(rgba, "RGBA")
    im.putalpha(im.getchannel("A").filter(ImageFilter.GaussianBlur(0.5)))
    # ~1100 px de large suffit : il est affiché sur 536 unités de scène
    scale = 1100 / im.width
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    im.save(out_path, "WEBP", quality=82, method=6)
    return im.size


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.exists(src):
        raise SystemExit("Introuvable : %s" % src)

    img = np.asarray(Image.open(src).convert("RGB"))
    masks = head_masks(img)

    os.makedirs(OUT_DIR, exist_ok=True)
    for pid, mask in zip(IDS, masks):
        head = cut_out(img, mask)
        # x2 : les tetes d'origine font ~90 px, on double pour les ecrans HiDPI
        head = head.resize((head.width * 2, head.height * 2), Image.LANCZOS)
        head = head.filter(ImageFilter.UnsharpMask(radius=1.6, percent=55, threshold=3))
        out = os.path.join(OUT_DIR, pid + ".webp")
        head.save(out, "WEBP", quality=88, method=6)
        print("%-10s %4dx%-4d  %5.1f Ko" % (pid, head.width, head.height,
                                            os.path.getsize(out) / 1024))
    wm = os.path.join(PROJECT, "public", "team", "chalk-wordmark.webp")
    size = extract_wordmark(img, wm)
    print("%-10s %4dx%-4d  %5.1f Ko" % ("wordmark", size[0], size[1],
                                        os.path.getsize(wm) / 1024))


if __name__ == "__main__":
    main()
