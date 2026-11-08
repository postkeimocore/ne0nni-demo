# NE0NNi 公式サイト｜current.md

最終更新：2026-11-08 ／ フェーズ：**本番サイトの実装（v0.1、確認用URLで公開中・noindex）** ／ 次：下の「確認事項」をもらって中身を確定、CMS の決定

## 概要
- **誰の**：Casterisk の自社企画のイラストレーター IP「NE0NNi（ネオンニ）」。シリーズ HEADPHONES GIRL
- **何を**：作品を見てもらい、企業から問い合わせが来る公式サイト。仕様の正は Notion「NE0NNi｜公式サイト制作」
- **URL**：https://ne0nni-demo.pages.dev/ （公開まで noindex）。デザインシステムの見本は https://ne0nni-demo.pages.dev/design-system/

## ファイル
| ファイル | 中身 |
|---|---|
| `design-system.md` | デザインの正（色・書体・グリッド・署名要素・部品・動き） |
| `design-direction.md` | 参考サイトの読み取りと方向性 |
| `design-system/` | 見本ページ（ビルド時に `/design-system/` へコピー） |
| `docs/cms.md` | 作品データの形、microCMS のスキーマ、画像の作り直し |
| `research/` | 参考キャプチャ、白地と黒地の比較、書体の比較 |
| `src/` | Astro 本体。`lib/cms.ts` がデータの入口、`data/works.ts` が手元の作品データ |
| `functions/api/contact.js` | お問い合わせ（Pages Function → Turnstile → GAS） |
| `gas/contact-receiver.gs` | お問い合わせの受け口（スプレッドシート記録・通知・自動返信） |
| `scripts/` | 作品画像・共有画像を作るスクリプト |

## 構成
- Astro 7（静的）＋ Cloudflare Pages（Coveremo のアカウント、プロジェクト `ne0nni-demo`、GitHub `postkeimocore/ne0nni-demo` の main を自動デプロイ。ビルド `npm run build`／出力 `dist`）
- 作品データは microCMS 前提で作り、未接続の間は `src/data/works.ts`。CMS を変えるときは `src/lib/cms.ts` だけ
- 公開まで noindex（meta と `X-Robots-Tag`。`PUBLIC_ALLOW_INDEX=true` で外れる）。robots.txt は開けたまま
- フォント：Google Fonts ＋ YakuHanJP（jsDelivr）

## ページ
- HOME：ヒーロー（No.002 の切り抜き・ロゴ・言葉の散らし・波形）→ 新しい作品3点を章で（1本のケーブルが作品の後ろを通る）→ ABOUT（黒の反転）→ CONTACT
- WORKS：号数順。All／シリーズ／種類（Original・Cover）／ギアで絞り込み（URL `?f=`）。中央・2枚並び・裁ち落としのリズム
- WORK DETAIL（`/works/001/`〜）：キービジュアル＋データ → 切り抜き・寄り・場面 → ギア → SNS投稿 → お問い合わせ（作品を選んだ状態でフォームへ）→ 前後の作品
- ABOUT：黒の反転でステートメント → Series／Gear／SNS／For business
- CONTACT：用件・会社名・お名前・メール・対象の作品・内容・個人情報の同意 → `/contact/thanks/`
- 404、sitemap.xml、robots.txt、作品ごとの OGP と構造化データ（VisualArtwork・BreadcrumbList）

## 確認事項（中身を確定するために必要なもの）
1. **「Cover」の呼び名**：アニメ・漫画・映画のキャラクターを描いた作品の呼び方。今は仮に「Cover」。変えるときは `KIND_LABEL` の1か所
2. **No.003 のキャラクター表記**：「シャンプー（らんま1/2）」とデータ欄に出している。出すか、出さないか
3. **号数の順**：お団子髪の子を No.003 にした。公開順と合っているか
4. **`amgw5のコピー.PNG`（体育座りのボブの子）**：No.001 と同じキャラクターに見える。作品として載せるか、号数は何番か
5. **作品タイトル**：今は「号数＋シリーズ名」（例 No.002 Headphones Girl）。作品ごとのタイトルを付けるか
6. **公開日**：各作品の日付（データ欄と構造化データに入る）
7. **No.001・No.003 のヘッドホン**：メーカー・型番（今はギアなし）
8. **作品の一言**：絵から書いた説明（No.001「うつぶせで、スマホを見る。」No.002「屋上で、首にヘッドホン。」No.003「両手でヘッドホンを押さえる。」）でよいか
9. **SNS の投稿ID・URL**：TikTok の投稿ID（埋め込みに必要）、Instagram の投稿URL。今は手元の動画・画像で代わりに見せている
10. **CMS**：若林さんが使っている CMS の名前
11. **運営表記と個人情報の文面**：ABOUT・CONTACT・フッターに「Casterisk」と出している。表記（会社名の正式表記など）
12. **お問い合わせの通知先**：受け取るメールアドレス（GAS の Script Properties に入れる）
13. **独自ドメイン**

## 公開までの作業
- GAS をデプロイして Cloudflare に `GAS_WEBHOOK_URL`・`GAS_SECRET` を入れる（それまで *.pages.dev では送信を受け付けて捨てる）
- Turnstile のサイトキー（`PUBLIC_TURNSTILE_SITE_KEY`）とシークレット（`TURNSTILE_SECRET`）
- TikTok の投稿IDを入れて Embed Player を試す（ロゴを消せるか、上に重ねてよいか：design-system.md 5章の未確認）
- Instagram API with Instagram Login（プロアカウント化、Meta の開発者アプリ、長期トークンの定期更新）
- 独自ドメイン、`SITE_URL`、`PUBLIC_ALLOW_INDEX=true`、Cloudflare Web Analytics
- 本公開（noindex を外す・ドメインをつなぐ）の前にユーザーに確認する
