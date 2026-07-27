"""Gera favicon/ícones da HCE a partir do logo 1x1 (frigideira 'hce' em fundo azul).

- Recorta a marca justa (remove excesso de azul), centraliza num quadrado azul
  com respiro e exporta os tamanhos usados pelo Next.js App Router.
"""
from PIL import Image

SRC = "public/brand/logos/logo-1x1.png"
BLUE = (0, 50, 136)  # #003288 (azul da marca)

img = Image.open(SRC).convert("RGB")
w, h = img.size
px = img.load()

# 1) Bounding box do conteúdo (pixels diferentes do azul de fundo).
bg = px[2, 2]
thr = 40


def difere(c):
    return abs(c[0] - bg[0]) + abs(c[1] - bg[1]) + abs(c[2] - bg[2]) > thr


minx, miny, maxx, maxy = w, h, 0, 0
step = 2
for y in range(0, h, step):
    for x in range(0, w, step):
        if difere(px[x, y]):
            if x < minx:
                minx = x
            if x > maxx:
                maxx = x
            if y < miny:
                miny = y
            if y > maxy:
                maxy = y

cw = maxx - minx
ch = maxy - miny
cx = (minx + maxx) / 2
cy = (miny + maxy) / 2

# 2) Quadrado com respiro (~16% de padding sobre o maior lado da marca).
lado = int(max(cw, ch) * 1.16)
half = lado // 2
box = (int(cx - half), int(cy - half), int(cx + half), int(cy + half))

# 3) Recorta com fundo azul onde extrapolar a imagem original.
canvas = Image.new("RGB", (lado, lado), BLUE)
sx0, sy0, sx1, sy1 = box
ox = -sx0 if sx0 < 0 else 0
oy = -sy0 if sy0 < 0 else 0
crop_box = (max(0, sx0), max(0, sy0), min(w, sx1), min(h, sy1))
piece = img.crop(crop_box)
canvas.paste(piece, (ox, oy))

# 4) Exporta.
# Ícone principal (Next: src/app/icon.png)
canvas.resize((512, 512), Image.LANCZOS).save("src/app/icon.png")
# Apple touch icon (Next: src/app/apple-icon.png)
canvas.resize((180, 180), Image.LANCZOS).save("src/app/apple-icon.png")
# favicon.ico multi-tamanho (RGBA: exigido pelo Turbopack/Next).
canvas.convert("RGBA").save(
    "src/app/favicon.ico",
    sizes=[(16, 16), (32, 32), (48, 48), (64, 64)],
)
print("Ícones gerados. Crop box:", box, "lado:", lado)
