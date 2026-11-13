/**
 * Content kept in the repository. Used while no CMS is connected (see src/lib/cms.ts).
 * Sources: the posts on TikTok / Instagram (music, gear), Notion「キャラクター設計」(Character A / B).
 * Anything not confirmed is listed in current.md.
 */
import type { Character, Gear, Series, Track, Work } from '../lib/types';

import k1 from '../assets/art/001-key.webp';
import c1 from '../assets/art/001-cut.webp';
import f1 from '../assets/art/001-face.webp';
import g1 from '../assets/art/001-gear.webp';
import p1 from '../assets/art/001-short-poster.webp';
import k2 from '../assets/art/002-key.webp';
import c2 from '../assets/art/002-cut.webp';
import f2 from '../assets/art/002-face.webp';
import g2 from '../assets/art/002-gear.webp';
import s2 from '../assets/art/002-city.webp';
import ig2 from '../assets/art/002-ig-feed.webp';
import p2 from '../assets/art/002-short-poster.webp';
import k3 from '../assets/art/003-key.webp';
import c3 from '../assets/art/003-cut.webp';
import f3 from '../assets/art/003-face.webp';

const img = (src: ImageMetadata, alt: string) => ({ src, width: src.width, height: src.height, alt });
const tiktok = (path: string) => ({ platform: 'tiktok' as const, url: `https://www.tiktok.com/@ne0nni/${path}` });
const instagram = (path: string) => ({ platform: 'instagram' as const, url: `https://www.instagram.com/${path}/` });
const youtube = (id: string) => ({ platform: 'youtube' as const, url: `https://www.youtube.com/shorts/${id}` });

export const series: Series[] = [{ id: 'headphones-girl', name: 'HEADPHONES GIRL' }];
const HG = series[0];

export const characters: Character[] = [
  {
    id: 'a',
    name: 'A',
    personality: '自分のペースを大切にして、人との距離は自分で選ぶ。まわりからは、ちょっと不思議で独特に見える。',
    taste: '流行っていても、自分の感性に合うものを選ぶ。好きな音楽は、その周りまで掘り下げる。',
    genre: 'ダーク・オルタナ／ハイパーポップ／インディー',
    artists: ['4s4ki', 'Яu-a', 'nyamura', 'ずっと真夜中でいいのに。', 'ヨルシカ', 'あたらよ', 'なとり', 'きのこ帝国', 'ひとひら', '羊文学', 'No Buses', 'aespa', 'XG'],
    image: img(f1, 'Character A：黒いヘッドホンをつけた、ボブの女の子'),
  },
  {
    id: 'b',
    name: 'B',
    personality: '人との距離を自然に縮めて、まわりと楽しさを分け合う。明るくて、一緒にいて楽しい。',
    taste: '流行を楽しんで、気に入ったものを取り入れる。SNS や毎日の中から、幅広く音楽を見つける。',
    genre: 'ポップ・メロウ／SNS で話題の曲／邦楽・K‑POP',   // non-breaking hyphen: K-POP never splits
    artists: ['ILLIT', 'CUTIE STREET', 'CANDY TUNE', 'M!LK', 'モナキ', 'MISAMO', 'BLACKPINK', 'BTS', '藤井 風', 'サカナクション', 'RADWIMPS', 'Suchmos', 'ちゃんみな', 'HANA', 'aespa', 'XG', 'KANA-BOON'],
    image: img(f2, 'Character B：首にヘッドホンをかけた、長い髪の女の子'),
  },
];
const [A, B] = characters;

const music: Record<string, Track> = {
  akanesasu: { id: 'zutomayo', artist: 'ずっと真夜中でいいのに。', title: 'あかねさす頃' },
  musubi: { id: 'ayumu-imazu', artist: 'Ayumu Imazu', title: '結び' },
};

export const gear: Gear[] = [
  { id: 'audio-technica-ath-hl7bt', brand: 'audio-technica', model: 'ATH-HL7BT', thumb: img(g1, 'audio-technica ATH-HL7BT') },
  { id: 'fiio-eh11', brand: 'FiiO', model: 'EH11', thumb: img(g2, 'FiiO EH11') },
];
const [HL7BT, EH11] = gear;

export const works: Work[] = [
  {
    no: 1,
    id: '001',
    series: HG,
    kind: 'original',
    character: A,
    key: img(k1, '枕に頬をのせ、うつぶせでスマートフォンを見る、黒いヘッドホンの女の子'),
    cut: img(c1, '枕に頬をのせ、うつぶせでスマートフォンを見る女の子'),
    face: img(f1, 'スマートフォンの光に照らされた、黒いヘッドホンの女の子の顔'),
    focus: '62% 50%',
    music: [music.akanesasu],
    gear: [HL7BT],
    posts: [
      {
        kind: 'short',
        image: { ...img(p1, '雨の夜の部屋で、うつぶせでスマートフォンを見る女の子のショート動画'), focus: '50% 100%' },
        links: [tiktok('video/7703174687689559317'), instagram('reel/DfMuF0Rh-FX'), youtube('gaGauU1kXLc')],
      },
      {
        kind: 'photo',
        image: img(k1, 'うつぶせでスマートフォンを見る、黒いヘッドホンの女の子の写真投稿'),
        links: [tiktok('photo/7703943576702635285'), instagram('p/DfR9lD7mon3')],
      },
    ],
  },
  {
    no: 2,
    id: '002',
    series: HG,
    kind: 'original',
    character: B,
    key: img(k2, 'ラベンダーの背景に、首にオレンジのヘッドホンをかけた長い髪の女の子'),
    cut: img(c2, '首にオレンジのヘッドホンをかけ、手すりにもたれる女の子'),
    face: img(f2, '首にヘッドホンをかけて微笑む女の子の顔'),
    scene: { ...img(s2, '夜の街を背にした屋上の女の子'), focus: '50% 15%' },
    focus: '40% 30%',
    music: [music.musubi],
    gear: [EH11],
    posts: [
      {
        kind: 'short',
        image: img(p2, '屋上で夜の街を背にした女の子のショート動画'),
        links: [tiktok('video/7704655287642262836'), instagram('reel/DfW-wUqPzyd'), youtube('9Y-M0b5ffgM')],
      },
      {
        kind: 'photo',
        image: img(ig2, 'HEADPHONES GIRL のロゴと、FiiO EH11 を首にかけた女の子の写真投稿'),
        links: [tiktok('photo/7705420626323983637'), instagram('p/DfcSmkhmiPx')],
      },
    ],
  },
  {
    no: 3,
    id: '003',
    series: HG,
    kind: 'tribute',
    tribute: { character: 'シャンプー', title: 'らんま1/2' },
    key: img(k3, '紫の背景に、お団子髪とチャイナ服の女の子が両手でヘッドホンを押さえる'),
    cut: img(c3, 'お団子髪とチャイナ服の女の子が、両手でヘッドホンを押さえる'),
    face: img(f3, 'ヘッドホンを押さえて舌を出す、お団子髪の女の子の顔'),
    focus: '50% 18%',
    music: [],
    gear: [],
    posts: [],
  },
];

export const site = {
  hero: '002',
  /** which platform plays the shorts on the site (the one with the most plays); the other is used when a post lacks it */
  player: 'tiktok' as const,
  description:
    'NE0NNi*（ネオンニ）は、ヘッドホンで音楽を聴く女の子を描くイラストレーションです。作品ごとに、キャラクター、曲、描いたヘッドホンなどのギアを掲載しています。',
};
