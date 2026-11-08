# NE0NNi 公式サイト｜history.md

## 2026-11-08
- 参考6サイトと素材を確認し、方向性をまとめた（`design-direction.md`）。地は白に決定
- デザインシステム v0.1（`design-system.md`、見本 `design-system/`）。書体は Bodoni Moda（opsz 24 に固定）・Inter Tight・Shippori Mincho B1・Zen Kaku Gothic New
- 見本ページを GitHub `postkeimocore/ne0nni-demo` と Cloudflare Pages（Coveremo のアカウント）で公開
- カーソルのアスタリスク、光の粒、静止のグレイン、ヒーローの音の波形（録音のように入力位置は固定、声ごとに長さ・大きさ・荒さが変わる）
- 文字は灰色で差をつけない、入力欄の線は 1px、SNS はアイコン、と決定
- **本番サイトに移行**。リポジトリは同じ `ne0nni-demo`。git のルートを `web/` に上げ、Astro を入れた。見本ページは `/design-system/` に移動
- 「いつも通り」の構成（Astro＋Cloudflare Pages＋microCMS 前提＋Pages Functions→Turnstile→GAS、公開まで noindex）。CMS は若林さんの意向で未確定なので、データの入口を `src/lib/cms.ts` にまとめた
- HOME・WORKS・WORK DETAIL（No.001〜003）・ABOUT・CONTACT・お礼・404 を実装。PC・タブレット・スマホで確認
- No.003 に、お団子髪・チャイナ服の子（アニメのキャラクターを描いた作品）を追加。呼び名は未決定のため仮に「Cover」
