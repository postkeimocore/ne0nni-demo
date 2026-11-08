/**
 * The one place pages get content from.
 * microCMS when MICROCMS_SERVICE_DOMAIN and MICROCMS_API_KEY are set, otherwise src/data/works.ts.
 * Field IDs follow docs/cms.md. Swapping the CMS means rewriting this file only.
 */
import type { Character, Gear, Img, Post, PostLink, Series, Site, Track, Work, WorkKind } from './types';
import * as local from '../data/works';

const DOMAIN = import.meta.env.MICROCMS_SERVICE_DOMAIN as string | undefined;
const KEY = import.meta.env.MICROCMS_API_KEY as string | undefined;
export const usingCms = Boolean(DOMAIN && KEY);

/** The word shown for each kind of work. One place, so the name can change without touching pages. */
export const KIND_LABEL: Record<WorkKind, string> = { original: 'Original', tribute: 'Tribute' };

/** A URL-safe key: ASCII names become slugs, others a short hash (the same name always gives the same key). */
export function keyOf(name: string): string {
  const ascii = name.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (ascii && /^[\x00-\x7f]+$/.test(name)) return ascii;
  let h = 0x811c9dc5;
  for (const c of name) { h ^= c.codePointAt(0)!; h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(36);
}

// ---------- microCMS ----------
type RawImage = { url: string; width: number; height: number };
type RawRef = { id: string };
type RawCharacter = RawRef & { name: string; personality?: string; taste?: string; genre?: string; artists?: string; image?: RawImage; imageAlt?: string };
type RawGear = RawRef & { brand: string; model: string; thumb?: RawImage };
type RawTrack = { fieldId: 'track'; artist: string; title: string };
type RawPost = { fieldId: 'post'; kind: string[]; image?: RawImage; alt?: string; tiktokUrl?: string; instagramUrl?: string; youtubeUrl?: string };
type RawWork = RawRef & {
  number: number; series: string[]; kind: string[]; character?: RawCharacter;
  tributeCharacter?: string; tributeTitle?: string; date?: string;
  key: RawImage; keyAlt: string; cut?: RawImage; cutAlt?: string; face?: RawImage; faceAlt?: string;
  scene?: RawImage; sceneAlt?: string; focus?: string; music?: RawTrack[]; gear?: RawGear[]; posts?: RawPost[];
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
const first = (v?: string[] | string) => (Array.isArray(v) ? v[0] : v);
const toSeries = (name = 'Headphones Girl'): Series => ({ id: keyOf(name), name });
const toCharacter = (c: RawCharacter): Character => ({
  id: c.id, name: c.name, personality: c.personality ?? '', taste: c.taste ?? '', genre: c.genre || undefined,
  artists: (c.artists ?? '').split('\n').map((s) => s.trim()).filter(Boolean),
  image: c.image ? toImg(c.image, c.imageAlt ?? `Character ${c.name}`) : undefined,
});
const toGear = (g: RawGear): Gear => ({ id: g.id, brand: g.brand, model: g.model, thumb: g.thumb ? toImg(g.thumb, `${g.brand} ${g.model}`) : undefined });
const toTrack = (t: RawTrack): Track => ({ id: keyOf(t.artist), artist: t.artist, title: t.title });
const toPost = (p: RawPost): Post => {
  const links: PostLink[] = [];
  if (p.tiktokUrl) links.push({ platform: 'tiktok', url: p.tiktokUrl });
  if (p.instagramUrl) links.push({ platform: 'instagram', url: p.instagramUrl });
  if (p.youtubeUrl) links.push({ platform: 'youtube', url: p.youtubeUrl });
  return {
    kind: first(p.kind) === 'photo' ? 'photo' : 'short',
    image: p.image ? toImg(p.image, p.alt ?? '') : undefined,
    links,
  };
};
const toWork = (w: RawWork): Work => {
  const kind: WorkKind = first(w.kind) === 'tribute' ? 'tribute' : 'original';
  return {
    no: w.number, id: String(w.number).padStart(3, '0'),
    series: toSeries(first(w.series)), kind,
    character: kind === 'original' && w.character ? toCharacter(w.character) : undefined,
    tribute: kind === 'tribute' && w.tributeCharacter ? { character: w.tributeCharacter, title: w.tributeTitle ?? '' } : undefined,
    date: w.date?.slice(0, 10),
    key: toImg(w.key, w.keyAlt), cut: w.cut ? toImg(w.cut, w.cutAlt) : undefined,
    face: w.face ? toImg(w.face, w.faceAlt) : undefined, scene: w.scene ? toImg(w.scene, w.sceneAlt) : undefined,
    focus: w.focus || undefined,
    music: (w.music ?? []).map(toTrack), gear: (w.gear ?? []).map(toGear), posts: (w.posts ?? []).map(toPost),
  };
};

// ---------- public API ----------
let worksCache: Promise<Work[]> | undefined;
/** In order of number (= order of publication), No.001 first. Every list on the site keeps this order. */
export function getWorks(): Promise<Work[]> {
  worksCache ??= (usingCms ? list<RawWork>('works').then((r) => r.map(toWork)) : Promise.resolve(local.works))
    .then((w) => [...w].sort((a, b) => a.no - b.no));
  return worksCache;
}

/** Series in use, in the order they first appear. */
export async function getSeries(): Promise<Series[]> {
  if (!usingCms) return local.series;
  const seen = new Map<string, Series>();
  (await getWorks()).forEach((w) => seen.set(w.series.id, w.series));
  return [...seen.values()];
}

export async function getCharacters(): Promise<Character[]> {
  return usingCms ? (await list<RawCharacter>('characters')).map(toCharacter) : local.characters;
}

export async function getGear(): Promise<Gear[]> {
  return usingCms ? (await list<RawGear>('gear')).map(toGear) : local.gear;
}

/** Every track tied to a work, in order of number. */
export async function getMusic(): Promise<{ work: Work; track: Track }[]> {
  const works = await getWorks();
  return works.flatMap((work) => work.music.map((track) => ({ work, track })));
}

export async function getSite(): Promise<Site> {
  const works = await getWorks();
  const raw = usingCms
    ? await request<{ heroWork?: { number?: number }; description?: string }>('site', { depth: '1' })
    : { heroWork: { number: Number(local.site.hero) }, description: local.site.description };
  // the chosen work, or the newest original that has a cutout
  const newest = [...works].reverse();
  const hero = works.find((w) => w.no === raw.heroWork?.number && w.cut)
    ?? newest.find((w) => w.kind === 'original' && w.cut) ?? newest[0];
  return { hero, latest: works.slice(-3), description: raw.description ?? '' };
}

export const label = (w: Work) => `No.${w.id}`;
export const pathOf = (w: Work) => `/works/${w.id}/`;
export const characterName = (c: Character) => `Character ${c.name}`;
/** "ずっと真夜中でいいのに。「あかねさす頃」" */
export const trackName = (t: Track) => `${t.artist}「${t.title}」`;

/** Filter keys shared by the WORKS filter and the buttons that open it. */
export const filterKey = {
  series: (s: Series) => `series-${s.id}`,
  kind: (k: WorkKind) => `kind-${k}`,
  character: (c: Character) => `character-${c.id}`,
  music: (t: Track) => `music-${t.id}`,
  gear: (g: Gear) => `gear-${g.id}`,
};
/** Every filter key a work belongs to. */
export const keysOf = (w: Work) => [
  filterKey.series(w.series), filterKey.kind(w.kind),
  ...(w.character ? [filterKey.character(w.character)] : []),
  ...w.music.map(filterKey.music), ...w.gear.map(filterKey.gear),
];
/** /works/?f=… */
export const worksWith = (key: string) => `/works/?f=${encodeURIComponent(key)}`;
