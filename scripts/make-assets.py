# -*- coding: utf-8 -*-
"""
Builds the site's artwork files from the originals in the project folder (one level above web/).
Run from web/:  python3 scripts/make-assets.py

Writes
  src/assets/art/{no}-{kind}.webp   images Astro resizes into srcsets (long side up to 2400px)
  public/video/{no}-short.mp4       the short videos shown in the posts frame (same as the TikTok / Instagram posts)
Originals are never modified. Crops are written as boxes on the original image (left, top, right, bottom).
"""
import os
import subprocess
from PIL import Image, ImageDraw, ImageFilter

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.dirname(WEB)
ART = os.path.join(WEB, 'src', 'assets', 'art')
VID = os.path.join(WEB, 'public', 'video')
os.makedirs(ART, exist_ok=True)
os.makedirs(VID, exist_ok=True)

MAX = 2400


def src(*p):
    return os.path.join(SRC, *p)


def save(im, name, q=90):
    im = im.copy()
    if max(im.size) > MAX:
        im.thumbnail((MAX, MAX), Image.LANCZOS)
    out = os.path.join(ART, name + '.webp')
    im.save(out, 'WEBP', quality=q, method=6)
    print(f'{name:22s} {im.size[0]}x{im.size[1]}  {os.path.getsize(out) // 1024}KB')


def trim(im, pad=0):
    """Crop a cutout to its visible pixels."""
    box = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    l, t, r, b = box
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))


def cut_flat_bg(im, tol=18):
    """Cut out a figure drawn on a flat background: flood the background from the edges.
    The black outline stops the flood, so colours inside the figure close to the background stay."""
    rgb = im.convert('RGB')
    mask = Image.new('L', rgb.size, 0)
    key = (1, 255, 1)
    work = rgb.copy()
    bg = rgb.getpixel((4, 4))
    w, h = rgb.size
    seeds = [(x, 2) for x in range(0, w, 40)] + [(2, y) for y in range(0, h, 40)] + [(w - 3, y) for y in range(0, h, 40)]
    for s in seeds:
        px = work.getpixel(s)
        if px != key and all(abs(px[i] - bg[i]) <= tol for i in range(3)):
            ImageDraw.floodfill(work, s, key, thresh=tol)
    data = work.getdata()
    mask.putdata([0 if p == key else 255 for p in data])
    # soften the 1px stair-step along the outline
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = rgb.convert('RGBA')
    out.putalpha(mask)
    return out


# ---------------- No.001 (lying on her front, phone light) ----------------
k1 = Image.open(src('01', '02c74c27fee75e16.PNG')).convert('RGB')          # 2250 x 2813
save(k1, '001-key')
c1 = Image.open(src('01', '3350236aac97442e.png')).convert('RGBA')
save(trim(c1), '001-cut')
save(k1.crop((880, 900, 2080, 2400)), '001-face')                            # face, headphones and the lit phone
save(k1.crop((860, 820, 1560, 1520)), '001-gear')                            # the ear cup (audio-technica ATH-HL7BT)

# ---------------- No.002 (rooftop, headphones round the neck) ----------------
k2 = Image.open(src('02', 'R1.png')).convert('RGB')                         # 2500 x 3125
save(k2, '002-key')
c2 = Image.open(src('02', '1c8642b6915f0b6e.png')).convert('RGBA')
save(trim(c2), '002-cut')
save(k2.crop((180, 300, 1460, 1900)), '002-face')
save(k2.crop((650, 1430, 1170, 1950)), '002-gear')
save(Image.open(src('02', 'IMG_8343.jpg')).convert('RGB'), '002-city')
save(Image.open(src('SNS', 'NE0NNi_feed_headphones-girl.png')).convert('RGB'), '002-ig-feed')

# ---------------- No.003 (tribute: twin buns, china dress) ----------------
k3 = Image.open(src('amgw5_2.PNG')).convert('RGBA')                          # 2250 x 4000
save(k3.convert('RGB'), '003-key')
save(trim(cut_flat_bg(k3)), '003-cut')
save(k3.convert('RGB').crop((620, 560, 1700, 1910)), '003-face')


# ---------------- stand-in clips + posters ----------------
def clip(src_path, name, audio):
    out = os.path.join(VID, f'{name}.mp4')
    args = ['ffmpeg', '-y', '-loglevel', 'error', '-i', src_path, '-vf', 'scale=720:-2', '-c:v', 'libx264',
            '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']
    args += ['-c:a', 'aac', '-b:a', '96k'] if audio else ['-an']
    subprocess.run(args + [out], check=True)
    poster = os.path.join(ART, f'{name}-poster.png')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0.5', '-i', out, '-frames:v', '1', poster], check=True)
    im = Image.open(poster).convert('RGB')
    os.remove(poster)
    save(im, f'{name}-poster')
    print(f'{name}.mp4 {os.path.getsize(out) // 1024}KB')


clip(src('01', 'rain_btee_ztmy_chara_v5_6fps.MP4'), '001-short', audio=False)
clip(src('02', 'ne0nni-rooftop_city-ambience-test.MP4'), '002-short', audio=True)
