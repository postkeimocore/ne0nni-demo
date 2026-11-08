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
- 情報を CHARACTER／WORK／MUSIC／GEAR の4つに整理（ユーザー）。アニメ等のキャラクターを描いた作品の呼び名は **Tribute** に決定。楽曲・アーティストも MUSIC としてテキストで載せる方針に変更。ギアを上の言葉にして、その下に Brand／Model
- 実際の投稿（TikTok・Instagram 各4件）を No.001・No.002 に入れた。No.001 のギアは audio-technica ATH-HL7BT、曲はずっと真夜中でいいのに。「akanesasu」（同日あとで正式名「あかねさす頃」に修正）、No.002 は Ayumu Imazu「結び」（投稿のタグと音源から）
- TikTok Embed Player は、設定を全部切ってもアカウント名の帯といいね数などが消えなかった。投稿は自前の枠で見せ、媒体のアイコンから各投稿を開く方式に変更
- 文字リンクの導線をやめ、円の矢印ボタン（Go）にした。お問い合わせの用件をラジオボタンに。カーソルにキラン・スパーク・ゴシックのアスタリスクを混ぜた（ロゴの「*」が半分）
- A／B の割り当て（No.001＝A、No.002＝B）が確定。No.001 の曲名を「あかねさす頃」に直した（検索で出た正式名）
- 仮で付けていた作品の一言（「うつぶせで、スマホを見る。」など）を、データの項目ごと外した。作品にタイトルは付けず、号数で呼ぶ
- 作品の並びをどのページでも号数の順（No.001 が先）に揃えた。ABOUT の作品の並びで No.002 が先になっていた
- スマホでスクロールするとヒーローの波形が上下にずれていたのを直した（アドレスバーの出入りで `innerHeight` が変わって描き直していた。`100svh` から計算するようにした）。背景の光の粒も同じ理由で並び直っていたので止めた
- SNS投稿を、サイトに置いた動画から埋め込みに戻した（容量のため）。YouTube・TikTok（2種）・Instagram の埋め込みを並べて比べ、再生中に何も出ない YouTube ショートを優先、URL がない間は TikTok Embed Player。押したときに読み込む。各投稿をコードで描いた黒いスマホに入れた（参考：studio15 のクリエイター紹介）。Magnific のストック素材はダウンロードにクレジットを使うので使っていない
- YouTube の @ne0nni_z が開けない（404）ことが分かった。確認事項に追加
- YouTube のチャンネルは @NE0NNi-z と分かった（ショートの投稿者から）。フッターなどのアイコンを直し、No.001（gaGauU1kXLc）・No.002（9Y-M0b5ffgM）のショートを投稿に入れた
- ショート動画をどちらで再生するかを、サイト設定 `player`（TikTok／YouTube）で切り替えられるようにした。再生数が多い方にする方針で、いまは TikTok
- 導線ボタンの円をテキストの右に移した（ユーザーの指示）。戻る導線（パンくずの Works）だけは左向きの矢印なので左のまま
