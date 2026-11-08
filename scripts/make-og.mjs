/**
 * Share images (1200 x 630) for the site and each work, written to public/og/.
 * Run from web/ after scripts/make-assets.py:  node scripts/make-og.mjs
 * Layout: white paper, the wordmark on the left, the work on the right (cutout for the site, key picture per work).
 * With microCMS, work pages can use the image API instead (?fit=crop&w=1200&h=630); see docs/cms.md.
 */
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const W = 1200, H = 630, PAD = 64;
const INK = '#0E0E12', PAPER = '#FFFFFF';   // same values as tokens.css (--color-ink / --color-paper)
const art = (n) => fileURLToPath(new URL(`../src/assets/art/${n}.webp`, import.meta.url));
const out = (n) => new URL(`../public/og/${n}.jpg`, import.meta.url);
await mkdir(new URL('../public/og/', import.meta.url), { recursive: true });

const logoSvg = (await readFile(new URL('../public/assets/logo.svg', import.meta.url), 'utf8')).replace(/currentColor/g, INK);
const logo = async (width) => sharp(Buffer.from(logoSvg.replace('<svg', `<svg width="${width}"`))).png().toBuffer();

async function card(name, layers) {
  await sharp({ create: { width: W, height: H, channels: 4, background: PAPER } })
    .composite(layers).flatten({ background: PAPER }).jpeg({ quality: 86, mozjpeg: true }).toFile(fileURLToPath(out(name)));
  console.log(`og/${name}.jpg`);
}

// site: wordmark + the No.002 cutout bleeding off the bottom right
{
  const cut = await sharp(art('002-cut')).resize({ height: 760 }).toBuffer();
  const meta = await sharp(cut).metadata();
  const crop = await sharp(cut).extract({ left: 0, top: 0, width: meta.width, height: H - 24 }).toBuffer();
  await card('default', [
    { input: crop, left: W - meta.width + 40, top: 24 },
    { input: await logo(560), left: PAD, top: H - PAD - 76 },
  ]);
}

// works: key picture on the right, wordmark on the left
for (const id of ['001', '002', '003']) {
  const key = await sharp(art(`${id}-key`)).resize({ height: H, width: 504, fit: 'cover', position: 'top' }).toBuffer();
  await card(id, [
    { input: key, left: W - 504, top: 0 },
    { input: await logo(480), left: PAD, top: H - PAD - 64 },
  ]);
}
