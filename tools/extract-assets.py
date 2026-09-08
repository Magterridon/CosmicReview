from PIL import Image, ImageFilter
import numpy as np
from scipy import ndimage

SRC = '/mnt/user-data/uploads/CosmicReview/Présentation projet/Photos/CosmicLogo.jpeg'
OUT = '/home/claude/assets'

img = Image.open(SRC).convert('RGB')
a = np.asarray(img).astype(np.float32) / 255.0

# ---------- 1. LOGO : extraction avec alpha (art clair sur fond noir) ----------
x0, y0, x1, y1 = 425, 425, 1115, 670
crop = a[y0:y1, x0:x1]

L = crop.max(axis=2)                      # luminance "additive"
lo, hi = 0.12, 0.42
alpha = np.clip((L - lo) / (hi - lo), 0, 1)
alpha = alpha * alpha * (3 - 2 * alpha)   # smoothstep

# retirer les petites étoiles du ciel restées dans le crop
solid = alpha > 0.30
lab, n = ndimage.label(solid)
sizes = ndimage.sum(solid, lab, range(1, n + 1))
keep = np.zeros(n + 1, bool)
keep[1:][sizes >= 150] = True
mask_keep = keep[lab]
mask_keep = ndimage.binary_dilation(mask_keep, np.ones((7, 7)))
alpha = alpha * mask_keep

# unpremultiply pour des bords nets sans halo noir
den = np.maximum(L, 1e-3)[..., None]
rgb = np.clip(crop / den, 0, 1)

logo = np.dstack([rgb, alpha])
logo_img = Image.fromarray((logo * 255).astype(np.uint8), 'RGBA')
bbox = logo_img.getbbox()
logo_img = logo_img.crop(bbox)
logo_img.save(f'{OUT}/cosmic-logo.png')
print('logo', logo_img.size, 'kept components:', int(keep.sum()))

# ---------- 2. CIEL : recomposé à partir des zones sans logo ----------
top = a[0:445]          # 445 lignes propres au-dessus du logo
bot = a[655:1024]       # 369 lignes propres en dessous
ov = 130                # fondu enchaîné
H = top.shape[0] + bot.shape[0] - ov
sky = np.zeros((H, a.shape[1], 3), np.float32)
sky[:top.shape[0]] = top
t = np.linspace(0, 1, ov)[:, None, None]
s = top.shape[0] - ov
sky[s:s + ov] = top[s:] * (1 - t) + bot[:ov] * t
sky[top.shape[0]:] = bot[ov:]

sky_img = Image.fromarray((np.clip(sky, 0, 1) * 255).astype(np.uint8))
sky_img = sky_img.resize((1600, int(1600 * sky_img.height / sky_img.width)), Image.LANCZOS)
sky_img.save(f'{OUT}/sky.jpg', quality=78, optimize=True)
print('sky', sky_img.size)
