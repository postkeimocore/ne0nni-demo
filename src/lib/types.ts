import type { ImageMetadata } from 'astro';

/**
 * What the site keeps, in four groups (2026-11-08):
 *   CHARACTER  NE0NNi's own characters A / B: personality, taste, favourite artists
 *   WORK       each illustration: Original / Tribute, its pictures and posts
 *   MUSIC      the artist and song tied to a work
 *   GEAR       the audio products drawn in a work (brand / model under "Gear")
 */

/** A local image (imported, resized by Astro) or a remote one (CMS URL with its size). */
export type Img = {
  src: ImageMetadata | string;
  width: number;
  height: number;
  alt: string;
};

/** HEADPHONES GIRL today; EARPHONES GIRLS etc. later. */
export type Series = { id: string; name: string };

/** One of NE0NNi's own characters. Name is "A" / "B" until they get names. */
export type Character = {
  id: string;
  name: string;
  /** 人格 */
  personality: string;
  /** 嗜好 */
  taste: string;
  /** the kind of music, one line */
  genre?: string;
  /** 好きなアーティスト群 */
  artists: string[];
  /** a close crop from one of her works */
  image?: Img;
};

/** The artist and song tied to a work. `id` is the artist's key (works by the same artist are filtered together). */
export type Track = { id: string; artist: string; title: string };

/** An audio product drawn in the works. Kept apart from works, because one model appears in many. */
export type Gear = { id: string; brand: string; model: string; thumb?: Img };

/**
 * original: NE0NNi's own characters (Character A / B).
 * tribute: a character from an anime, manga or film, drawn by NE0NNi (the word shown is KIND_LABEL).
 */
export type WorkKind = 'original' | 'tribute';

/** A link to the same post on one platform. */
export type PostLink = { platform: 'tiktok' | 'instagram' | 'youtube'; url: string };

/**
 * One post about the work, usually put up on TikTok and Instagram at the same time.
 * short: vertical video (9:16). photo: feed image (4:5).
 * The site shows the video or image in its own frame (TikTok's Embed Player always shows the account bar and
 * like counts) and links to each platform with an icon.
 */
export type Post = {
  kind: 'short' | 'photo';
  /** the photo, or the poster frame of a short */
  image?: Img;
  links: PostLink[];
};

export type Work = {
  /** 1, 2, 3 … the number across all series, in order of publication */
  no: number;
  /** "001" — used in the URL /works/001/ */
  id: string;
  series: Series;
  kind: WorkKind;
  /** an original: which of NE0NNi's characters */
  character?: Character;
  /** a tribute: the character and the work she comes from */
  tribute?: { character: string; title: string };
  /** YYYY-MM-DD, when known */
  date?: string;
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
  music: Track[];
  gear: Gear[];
  posts: Post[];
};

export type Site = {
  /** the work whose cutout fills the HOME hero */
  hero: Work;
  /** the newest three, in order of number (oldest of them first), for the HOME chapters */
  latest: Work[];
  description: string;
};
