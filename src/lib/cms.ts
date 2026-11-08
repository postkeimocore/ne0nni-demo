/**
 * The one place pages get content from.
 * microCMS when MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are set, otherwise src/data/works.ts.
 * Field IDs follow docs/cms.md. Swapping the CMS means rewriting this file only.
 */
import type { Gear, Img, Post, Series, Site, Work, WorkKind } from './types';
import * as local from '../data/works';

const DOMAIN = import.meta.env.MICROCMS_SERVICE_DOMAIN as string | undefined;
const KEY = import.meta.env.MICROCMS_API_KEY as string | undefined;
export const usingCms = Boolean(DOMAIN && KEY);

/** The word shown for each kind of work. One place, so the name can change without touching pages. */
export const KIND_LABEL: Record<WorkKind, string> = { original: 'Original', cover: 'Cover' };

// ---------- microCMS ----------
type RawImage = { url: string; width: number; height: number };
type RawRef = { id: string };
type RawSeries = RawRef & { name: string };
type RawGear = RawRef & { brand: string; model: string; thumb?: RawImage };
type RawPost = { fieldId: 'post'; kind: string[]; platform: string[]; postId?: string; url?: string; image?: RawImage; alt?: string };
type RawWork = RawRef & {
  number: number; series: RawSeries; kind: string[];
  originalCharacter?: string; originalTitle?: string; date?: string; lead?: string;
  key: RawImage; keyAlt: string; cut?: RawImage; cutAlt?: string; face?: RawImage; faceAlt?: string;
  scene?: RawImage; sceneAlt?: string; focus?: string; gear?: RawGear[]; posts?: RawPost[];
};

async function request<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`https://${DOMAIN}.microcms.io/api/v1/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { headers: { 'X-MICROCMS-API-KEY': KEY! } });
  if (!res.ok) throw new Error(`[cms] ${endpoint} → ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}
async function list<T>(endpoint: string): Promise<T[]> {
  const out: T[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await request<{ contents: T[]; totalCount: number }>(endpoint, { limit: '100', offset: String(offset), depth: '2' });
    out.push(...page.contents);
    if (out.length >= page.totalCount || !page.contents.length) return out;
  }
}

/** microCMS images are fetched already shrunk (long side 2400px, WebP) so builds stay inside the free transfer. */
const toImg = (i: RawImage, alt = ''): Img => {
  const scale = Math.min(1, 2400 / Math.max(i.width, i.height));
  const url = new URL(i.url);
  if (scale < 1) url.searchParams.set(i.width >= i.height ? 'w' : 'h', '2400');
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('q', '90');
  return { src: url.toString(), width: Math.round(i.width * scale), height: Math.round(i.height * scale), alt };
};
const first = (v?: string[]) => (Array.isArray(v) ? v[0] : v);
const toSeries = (s: RawSeries): Series => ({ id: s.id, name: s.name });
const toGear = (g: RawGear): Gear => ({ id: g.id, brand: g.brand, model: g.model, thumb: g.thumb ? toImg(g.thumb, `${g.brand} ${g.model}`) : undefined });
const toPost = (p: RawPost): Post => {
  const kind = first(p.kind) === 'photo' ? 'photo' : 'short';
  return {
    kind, platform: (first(p.platform) ?? 'tiktok') as Post['platform'], postId: p.postId || undefined, url: p.url || undefined,
    image: p.image ? toImg(p.image, p.alt ?? '') : undefined, label: kind === 'photo' ? 'Photo' : 'Short',
  };
};
const toWork = (w: RawWork): Work => ({
  no: w.number, id: String(w.number).padStart(3, '0'),
  series: toSeries(w.series), kind: first(w.kind) === 'cover' ? 'cover' : 'original',
  original: w.originalCharacter ? { character: w.originalCharacter, title: w.originalTitle ?? '' } : undefined,
  date: w.date?.slice(0, 10), lead: w.lead || undefined,
  key: toImg(w.key, w.keyAlt), cut: w.cut ? toImg(w.cut, w.cutAlt) : undefined,
  face: w.face ? toImg(w.face, w.faceAlt) : undefined, scene: w.scene ? toImg(w.scene, w.sceneAlt) : undefined,
  focus: w.focus || undefined, gear: (w.gear ?? []).map(toGear), posts: (w.posts ?? []).map(toPost),
});

// ---------- public API ----------
let worksCache: Promise<Work[]> | undefined;
/** Newest first. */
export function getWorks(): Promise<Work[]> {
  worksCache ??= (usingCms ? list<RawWork>('works').then((r) => r.map(toWork)) : Promise.resolve(local.works))
    .then((w) => [...w].sort((a, b) => b.no - a.no));
  return worksCache;
}

export async function getSeries(): Promise<Series[]> {
  return usingCms ? (await list<RawSeries>('series')).map(toSeries) : local.series;
}

export async function getGear(): Promise<Gear[]> {
  return usingCms ? (await list<RawGear>('gear')).map(toGear) : local.gear;
}

export async function getSite(): Promise<Site> {
  const works = await getWorks();
  const raw = usingCms
    ? await request<{ heroWork?: { number?: number }; description?: string }>('site', { depth: '1' })
    : { heroWork: { number: Number(local.site.hero) }, description: local.site.description };
  // the chosen work, or the newest original that has a cutout
  const hero = works.find((w) => w.no === raw.heroWork?.number && w.cut)
    ?? works.find((w) => w.kind === 'original' && w.cut) ?? works[0];
  return { hero, latest: works.slice(0, 3), description: raw.description ?? '' };
}

export const label = (w: Work) => `No.${w.id}`;
export const pathOf = (w: Work) => `/works/${w.id}/`;
/** filter keys shared by the WORKS filter and links to it */
export const filterKey = {
  series: (s: Series) => `series-${s.id}`,
  kind: (k: WorkKind) => `kind-${k}`,
  gear: (g: Gear) => `gear-${g.id}`,
};
