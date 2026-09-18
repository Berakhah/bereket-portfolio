"""assets/linkedin.jpg -> site/assets/img/bereket-{1200,600,192}.{webp,jpg}
Crops to 3:4 around the face (upper third), strips EXIF, writes sRGB.
Run: python src/og/portrait.py"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "assets" / "linkedin.jpg"
OUT = ROOT / "site" / "assets" / "img"
SIZES = [1200, 600, 192]

im = ImageOps.exif_transpose(Image.open(SRC)).convert("RGB")
w, h = im.size
# 3:4 crop, anchored so the head sits in the upper 40% of the frame.
target_h = int(w * 4 / 3)
if target_h > h:
    target_w = int(h * 3 / 4)
    left = (w - target_w) // 2
    box = (left, 0, left + target_w, h)
else:
    top = max(0, int(h * 0.05))
    box = (0, top, w, min(h, top + target_h))
im = im.crop(box)

OUT.mkdir(parents=True, exist_ok=True)
for s in SIZES:
    r = im.resize((s, int(s * 4 / 3)), Image.LANCZOS)
    r.save(OUT / f"bereket-{s}.webp", "WEBP", quality=82, method=6)
    r.save(OUT / f"bereket-{s}.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    print("wrote", f"bereket-{s}", r.size)
