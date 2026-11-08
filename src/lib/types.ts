import type { ImageMetadata } from 'astro';

/** A local image (imported, resized by Astro) or a remote one (microCMS URL with its size). */
export type Img = {
  src: ImageMetadata | string;
  width: number;
  height: number;
  alt: string;
};

/** HEADPHONES GIRL today; EARPHONES GIRLS etc. later. */
export type Series = { id: string; name: string };

/** A real headphone drawn in the works. Kept apart from works, because one model appears in many. */
export type Gear = { id: string; brand: string; model: string; thumb?: Img };

/**
 * original: NE0NNi's own characters.
 * cover: a character from an anime, manga or film, drawn by NE0NNi (the word shown on the site is KIND_LABEL).
 */
export type WorkKind = 'original' | 'cover';

/**
 * A post on Instagram / TikTok / YouTube about the work.
 * short: vertical video. photo: feed image (4:5).
 * A TikTok short or photo post plays in TikTok's Embed Player once `postId` is set; until then the stand-in
 * clip `video` (or the image) is shown. Instagram photos are fetched with the Instagram API at build time.
 */
export type Post = {
  kind: 'short' | 'photo';
  platform: 'tiktok' | 'instagram' | 'youtube';
  postId?: string;
  url?: string;
  image?: Img;
  video?: string;
  label: string;
};

export type Work = {
  /** 1, 2, 3 … the number across all series, in order of publication */
  no: number;
  /** "001" — used in the URL /works/001/ */
  id: string;
  series: Series;
  kind: WorkKind;
  /** for a cover: the character and the work it comes from */
  original?: { character: string; title: string };
  /** YYYY-MM-DD, when known */
  date?: string;
  /** one plain line about the picture (Mincho) */
  lead?: string;
  /** the full picture with its background */
  key: Img;
  /** the figure cut out of the background */
  cut?: Img;
  /** a close crop (face, headphones) */
  face?: Img;
  /** a scene version (background drawn in) */
  scene?: Img;
  /** object-position for 4:5 crops of the key picture in lists */
  focus?: string;
  gear: Gear[];
  posts: Post[];
};

export type Site = {
  /** the work whose cutout fills the HOME hero */
  hero: Work;
  /** newest first, for the HOME chapters */
  latest: Work[];
  description: string;
};
