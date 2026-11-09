# -*- coding: utf-8 -*-
"""
Turns the NE0NNi* icons (drawn in Illustrator, ../SNS/icons/NE0NNi_icons.ai → ../SNS/icons/svg/) into files the
site draws with <use>, so the colors come from tokens.css and not from the files.
Run from web/:  python3 scripts/make-icons.py

Writes
  public/icons/{name}.svg   one file per icon: <g id="solid"> (the _invert drawing: black inside, white lines; the site
                            shows this one, on white and black grounds alike — 2026-11-09) and <g id="line"> (white
                            inside, black lines). The shapes differ, not only the colors. Each has two shapes: the
                            inside (fill: var(--icon-fill)) and the lines (fill: var(--icon-ink)). The lines stay as drawn.
  src/lib/icons.ts          the names and each drawing's own bounds (`box`). The files leave different margins round
                            each drawing, so the site sizes and lines up an icon by its drawn edge.
An icon is referenced, not written into the page: a page can show the same one many times (the work data on HOME).
"""
import math, os, re

WEB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(os.path.dirname(WEB), 'SNS', 'icons', 'svg')
OUT = os.path.join(WEB, 'src', 'lib', 'icons.ts')
PUB = os.path.join(WEB, 'public', 'icons')

NAMES = {                                  # site name: file name (named by what is drawn, not by where it is used)
    'headphones': 'headphones_b',          # side view with the cable
    'headphones-front': 'headphones_front',
    'stylus': 'stylus_a',
    'stylus-hand': 'stylus_hand',
    'character': 'character',              # the girl's head: fringe, bob, headphones
    'cards': 'series_cards',               # three cards, a headphones card on top
    'books': 'series_books',               # three books standing
    'cd': 'music_cd',
    'phone': 'post_phone',                 # a phone with a play mark
    'letter': 'contact_letter',            # an envelope sealed with the asterisk
}

def paths(fname):
    s = open(os.path.join(SRC, fname)).read()
    out = {}
    for m in re.finditer(r'<path id="[^"]*_x5F_(fill|ink)" d="([^"]+)"', s):
        out[m.group(1)] = re.sub(r'\s+', ' ', m.group(2)).strip()
    assert set(out) == {'fill', 'ink'}, fname
    return out

NUM = re.compile(r'-?(?:\d+\.?\d*|\.\d+)(?:[eE]-?\d+)?')
ARITY = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4, 'T': 2, 'Z': 0}


def bounds(*ds):
    """Bounds of path data (M L H V C S Q T Z, absolute and relative). Curves are sampled, so the box is the
    drawn edge, not the control points."""
    xs, ys = [], []

    def cubic(p0, c1, c2, e):
        for k in range(1, 17):
            t = k / 16; u = 1 - t
            xs.append(u**3 * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t**3 * e[0])
            ys.append(u**3 * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t**3 * e[1])

    def quad(p0, c, e):
        for k in range(1, 17):
            t = k / 16; u = 1 - t
            xs.append(u * u * p0[0] + 2 * u * t * c[0] + t * t * e[0])
            ys.append(u * u * p0[1] + 2 * u * t * c[1] + t * t * e[1])

    for d in ds:
        x = y = sx = sy = 0.0
        prev, last_c, last_q = '', None, None
        for cmd, args in re.findall(r'([MLHVCSQTZmlhvcsqtz])([^MLHVCSQTZmlhvcsqtz]*)', d):
            up, rel = cmd.upper(), cmd.islower()
            n = [float(v) for v in NUM.findall(args)]
            if up == 'Z':
                x, y = sx, sy; last_c = last_q = None; prev = 'Z'; continue
            step = ARITY[up]
            for i in range(0, len(n), step):
                a = n[i:i + step]
                ox, oy = (x, y) if rel else (0.0, 0.0)
                pt = lambda j: (ox + a[j], oy + a[j + 1])
                if up == 'M':
                    x, y = pt(0)
                    if i == 0: sx, sy = x, y
                    xs.append(x); ys.append(y); last_c = last_q = None
                elif up == 'L':
                    x, y = pt(0); xs.append(x); ys.append(y); last_c = last_q = None
                elif up == 'H':
                    x = ox + a[0]; xs.append(x); ys.append(y); last_c = last_q = None
                elif up == 'V':
                    y = oy + a[0]; xs.append(x); ys.append(y); last_c = last_q = None
                elif up in 'CS':
                    if up == 'C':
                        c1, c2, e = pt(0), pt(2), pt(4)
                    else:
                        c1 = (2 * x - last_c[0], 2 * y - last_c[1]) if last_c else (x, y)
                        c2, e = pt(0), pt(2)
                    cubic((x, y), c1, c2, e); last_c = c2; last_q = None; x, y = e
                elif up in 'QT':
                    if up == 'Q':
                        c, e = pt(0), pt(2)
                    else:
                        c = (2 * x - last_q[0], 2 * y - last_q[1]) if last_q else (x, y)
                        e = pt(0)
                    quad((x, y), c, e); last_q = c; last_c = None; x, y = e
    l, t, r, b = math.floor(min(xs)), math.floor(min(ys)), math.ceil(max(xs)), math.ceil(max(ys))
    return [l, t, r - l, b - t]

os.makedirs(PUB, exist_ok=True)
for f in os.listdir(PUB):
    if f.endswith('.svg'): os.remove(os.path.join(PUB, f))

lines = [
    '/** Generated by scripts/make-icons.py from ../SNS/icons/svg (NE0NNi_icons.ai). Do not edit by hand.',
    ' *  The drawings are public/icons/{name}.svg (#solid, #line); `box` is the bounds of each drawing [x, y, w, h]. */',
    "export type IconName = " + ' | '.join(f"'{k}'" for k in NAMES) + ';',
    'export type Box = [number, number, number, number];',
    'export const ICONS: Record<IconName, { solid: Box; line: Box }> = {',
]
for key, base in NAMES.items():
    solid, line = paths(f'NE0NNi_icons_{base}_invert.svg'), paths(f'NE0NNi_icons_{base}.svg')
    boxes = {}
    groups = []
    for name, v in (('solid', solid), ('line', line)):
        boxes[name] = bounds(v['fill'], v['ink'])
        groups.append(f'<g id="{name}"><path style="fill:var(--icon-fill)" d="{v["fill"]}"/><path style="fill:var(--icon-ink)" d="{v["ink"]}"/></g>')
        print(key, name, boxes[name])
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">{"".join(groups)}</svg>\n'
    open(os.path.join(PUB, f'{key}.svg'), 'w').write(svg)
    lines.append(f"  '{key}': {{ solid: {boxes['solid']}, line: {boxes['line']} }},")
lines.append('};')
open(OUT, 'w').write('\n'.join(lines) + '\n')
print(OUT, os.path.getsize(OUT), 'B;', PUB, sum(os.path.getsize(os.path.join(PUB, f)) for f in os.listdir(PUB)) // 1024, 'KB')
