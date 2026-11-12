# NE0NNi 公式サイト｜current.md

最終更新：2026-11-08 ／ フェーズ：**本番サイトの実装（v0.2、確認用URLで公開中・noindex）** ／ 次：下の「確認事項」をもらって中身を確定、CMS の決定

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

## 情報の分け方（2026-11-08）
CHARACTER（A／B の人格・嗜好・好きなアーティスト群）／WORK（Original・Tribute）／MUSIC（作品に紐づけたアーティスト・楽曲）／GEAR（作品に登場するオーディオ製品。下に Brand・Model）。ラベル・絞り込み・章をこの4つで揃えた。導線は文字リンクにせず、ボタンかアイコンにする。

## ページ
- HOME：ヒーロー（若林さんのサイトのロゴのステッカー。線が走って塗りが入り、スクロールで顔の寄りから全体に戻る。地・ヘッダー・書体はこのサイトのまま）→ Works（作品の一覧：最新作を左に大きく＋4:5の2列。並べ方は若林さんのサイトから、カードはこのサイトの形で、押すと作品詳細へ → 新しい作品3点を号数順に章で。1本のケーブルが作品の後ろを通る）→ ABOUT（黒の反転）→ CONTACT
- WORKS：号数順（どのページの並びも No.001 が先）。All／Work／Character／Music／Gear で絞り込み（URL `?f=`）。中央・2枚並び・裁ち落としのリズム
- WORK DETAIL（`/works/001/`〜）：キービジュアル＋データ → 切り抜き・寄り・場面 → Character・Music・Gear のノート → SNS投稿（1件ずつ黒いスマホに入れる。ショート動画は押すと埋め込みが再生される。TikTok か YouTube かは CMS の `site.player` で切り替える（再生数が多い方にする。いまは TikTok）。下のアイコンで各投稿へ）→ お問い合わせ（作品を選んだ状態でフォームへ）→ 前後の作品
- ABOUT：黒の反転でステートメント → Series／Character／Music／Gear／SNS／For business
- CONTACT：用件（ラジオボタン）・会社名・お名前・メール・対象の作品・内容・個人情報の同意 → `/contact/thanks/`
- 404、sitemap.xml、robots.txt、作品ごとの OGP と構造化データ（VisualArtwork・BreadcrumbList）

## 確認事項（中身を確定するために必要なもの）
1. **キャラクターの紹介文と好きなアーティスト**：Notion「キャラクター設計｜2026-10-19」の人物像・音楽の方向性・アーティストの参考例から書いた（ABOUT の Character 章）。そのまま公開してよいか、名前はいつ付くか
2. **No.003 のキャラクター表記**：「シャンプー（らんま1/2）」とデータ欄に出している。出すか、出さないか
3. **号数の順**：お団子髪の子を No.003 にした。公開順と合っているか
4. **`amgw5のコピー.PNG`（体育座りのボブの子）**：No.001 と同じキャラクターに見える。作品として載せるか、号数は何番か。若林さんのサイトの一覧にも入っている（img4）
13. **若林さんのサイトの一覧にあって、こちらにない絵**：グレーの長い髪でピースをする子（img1）と、No.002 の子の全身の縦長の版（img3）。HOME の作品の一覧はこちらの作品データ（No.001〜003）で出しているので、入っていない。作品として載せるなら号数・キャラクター・曲・ギア
5. **公開日**：各作品の日付（データ欄と構造化データに入る）
6. **No.003 のヘッドホンと曲**：No.001（audio-technica ATH-HL7BT）と No.002（FiiO EH11）は投稿のタグから入れた。No.003 は投稿が未着でギア・曲なし
7. **ブランドの表記**：公式の表記に合わせて「FiiO」「audio-technica」にした（以前は FIIO）
8. **No.003 の投稿**：TikTok・Instagram・YouTube の URL（No.001・No.002 は3つとも入れ済み）
9. **CMS**：若林さんが使っている CMS の名前
10. **運営表記と個人情報の文面**：ABOUT・CONTACT・フッターに「Casterisk」と出している。表記（会社名の正式表記など）
11. **お問い合わせの通知先**：受け取るメールアドレス（GAS の Script Properties に入れる）
12. **独自ドメイン**

決まったこと（2026-11-08）：No.001＝Character A、No.002＝Character B（A／B は仮の名前で、あとで変える）。No.001 の曲名は「あかねさす頃」。作品にタイトルや一言は付けない（号数で呼ぶ）。YouTube は @NE0NNi-z（Notion の @ne0nni_z は誤り）。ショート動画の再生は TikTok（再生が伸びている方。数字を見て YouTube に切り替えることもある）。導線ボタンの円はテキストの右。名前の表記は NE0NNi*（どこでも同じ。大文字にしない）。

決まったこと（2026-11-09）：アイコンは見出し・ラベルの横に小さく置く。割り当ては Series＝本、Character＝キャラクター、Music＝CD、Gear＝斜め向きのヘッドフォン（ケーブル付き）、Posts／SNS＝スマホ、Contact＝封筒、Works＝ペンを持つ手、For business＝ペン（Works はユーザーの指示でペンから替え、For business と入れ替えた）。置く側は文字の左。線はファイルのまま（サイト側で太くしない）。アイコンは黒く塗った版（白地でも）。ヘッダーは塗りなし・ぼかしなし。ロゴとナビの文字のまわりにフチも線も付けない（白いフチ、その外の線は不採用。design-system.md 4-10）。ロゴとナビの文字は、黒い要素に重なった部分だけ白、ほかは黒。HOME の作品の見出しと作品データも塗りを外す（ケーブルの線が後ろで見えるように）。スマホではケーブルの線の先を画面の上寄りにする（PC はそのまま）。

決まったこと（2026-11-12）：HOME のヒーローを若林さんのサイトのものにする（ロゴのステッカーの出し方と動きはそのまま、地の色・ヘッダーのロゴとナビ・書体はこのサイトのまま）。若林さんのサイトの作品の一覧の並べ方を、Works の見出しと No.001 の章のあいだに入れる（見た目はこのサイトのトンマナに揃える。2026-11-13）。Works の見出しの下の文章は外す。大見出しの横のアイコンは、PC で小文字と同じくらいの大きさ（SP はバランスを見て大きく）。

確認中（2026-11-09）：ヘッダーの文字を、後ろの明るさで白か黒にする形でよいか。iPhone の実機ではまだ見ていない。
確認中（2026-11-12）：ヒーローのステッカーは、白い台紙が白い地と同じ色なので、縁は影だけで見えている。若林さんのサイトはライラックの壁で台紙の白が立っていた。

## 公開までの作業
- GAS をデプロイして Cloudflare に `GAS_WEBHOOK_URL`・`GAS_SECRET` を入れる（それまで *.pages.dev では送信を受け付けて捨てる）
- Turnstile のサイトキー（`PUBLIC_TURNSTILE_SITE_KEY`）とシークレット（`TURNSTILE_SECRET`）
- 独自ドメイン、`SITE_URL`、`PUBLIC_ALLOW_INDEX=true`、Cloudflare Web Analytics
- 本公開（noindex を外す・ドメインをつなぐ）の前にユーザーに確認する
