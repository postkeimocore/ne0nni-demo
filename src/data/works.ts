/**
 * Works kept in the repository. Used when microCMS is not configured (see src/lib/cms.ts).
 * Facts only: anything not confirmed (titles, dates, the headphones of No.001 and No.003) is left out
 * and listed in current.md.
 */
import type { Gear, Series, Work } from '../lib/types';

import k1 from '../assets/art/001-key.webp';
import c1 from '../assets/art/001-cut.webp';
import f1 from '../assets/art/001-face.webp';
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

export const series: Series[] = [{ id: 'headphones-girl', name: 'Headphones Girl' }];
const HG = series[0];

export const gear: Gear[] = [
  { id: 'fiio-eh11', brand: 'FIIO', model: 'EH11', thumb: img(g2, 'FIIO EH11') },
];
const EH11 = gear[0];

export const works: Work[] = [
  {
    no: 1,
    id: '001',
    series: HG,
    kind: 'original',
    lead: 'うつぶせで、スマホを見る。',
    key: img(k1, '枕に頬をのせ、うつぶせでスマートフォンを見る、黒いヘッドホンの女の子'),
    cut: img(c1, '枕に頬をのせ、うつぶせでスマートフォンを見る女の子'),
    face: img(f1, 'スマートフォンの光に照らされた、黒いヘッドホンの女の子の顔'),
    focus: '62% 50%',
    gear: [],
    posts: [
      { kind: 'short', platform: 'tiktok', video: '/video/001-short.mp4', image: img(p1, '夜の部屋で、うつぶせでスマートフォンを見る女の子のショート動画'), label: 'Short' },
    ],
  },
  {
    no: 2,
    id: '002',
    series: HG,
    kind: 'original',
    lead: '屋上で、首にヘッドホン。',
    key: img(k2, 'ラベンダーの背景に、首にオレンジのヘッドホンをかけた長い髪の女の子'),
    cut: img(c2, '首にオレンジのヘッドホンをかけ、手すりにもたれる女の子'),
    face: img(f2, '首にヘッドホンをかけて微笑む女の子の顔'),
    scene: img(s2, '夜の街を背にした屋上の女の子'),
    focus: '40% 30%',
    gear: [EH11],
    posts: [
      { kind: 'short', platform: 'tiktok', video: '/video/002-short.mp4', image: img(p2, '屋上で夜の街を背にした女の子のショート動画'), label: 'Short' },
      { kind: 'photo', platform: 'instagram', image: img(ig2, 'HEADPHONES GIRL のロゴと、FIIO EH11 を首にかけた女の子のフィード投稿'), label: 'Photo' },
    ],
  },
  {
    no: 3,
    id: '003',
    series: HG,
    kind: 'cover',
    original: { character: 'シャンプー', title: 'らんま1/2' },
    lead: '両手でヘッドホンを押さえる。',
    key: img(k3, '紫の背景に、お団子髪とチャイナ服の女の子が両手でヘッドホンを押さえる'),
    cut: img(c3, 'お団子髪とチャイナ服の女の子が、両手でヘッドホンを押さえる'),
    face: img(f3, 'ヘッドホンを押さえて舌を出す、お団子髪の女の子の顔'),
    focus: '50% 18%',
    gear: [],
    posts: [],
  },
];

export const site = {
  hero: '002',
  description:
    'NE0NNi（ネオンニ）は、ヘッドホンで音楽を聴く女の子を描くイラストレーションです。作品と、描いたヘッドホンのメーカー・型番を掲載しています。',
};
