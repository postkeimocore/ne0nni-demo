# NE0NNi 公式サイト｜作品データと CMS

2026-11-08 更新。サイトは作品データを `src/lib/cms.ts` の1か所から受け取る。

- microCMS の `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` があれば microCMS から、なければ `src/data/works.ts` から読む。
- 使う CMS は未確定（イラスト担当の若林さんが使っている CMS を使う意向）。別の CMS にするときは `src/lib/cms.ts` だけを書き換える。ページと部品は `src/lib/types.ts` の形しか見ない。

## 情報の分け方

| 情報 | 管理する内容 |
|---|---|
| CHARACTER | キャラクター A／B。それぞれの人格・嗜好・好きなアーティスト群 |
| WORK | イラストごとの作品情報。ORIGINAL／TRIBUTE |
| MUSIC | その作品に紐づけたアーティスト・楽曲 |
| GEAR | その作品に登場するオーディオ製品（ブランド・型番） |

## データの形（`src/lib/types.ts`）

| まとまり | 項目 | 内容 |
|---|---|---|
| 作品 Work | 号数 `no` | 1, 2, 3 …。シリーズをまたいだ公開順の通し番号。URL は `/works/001/` |
| | シリーズ `series` | 現在は Headphones Girl |
| | 種類 `kind` | `original`（NE0NNi のキャラクター A／B）／`tribute`（アニメ・漫画・映画のキャラクターを描いた作品）。表示する言葉は `KIND_LABEL`（`src/lib/cms.ts`）の1か所 |
| | キャラクター `character` | original のとき。Character を参照 |
| | 元のキャラクター `tribute` | tribute のときだけ。キャラクター名と作品名 |
| | 曲 `music` | 繰り返し。アーティストと曲名 |
| | ギア `gear` | 複数参照 |
| | 公開日 `date` | 分かれば。あるときだけ表示 |
| | 一言 `lead` | 明朝の1行。14字まで（スマホ・タブレットで1行に収まる長さ） |
| | 画像 | `key`（背景つきの全体）必須、`cut`（切り抜き）、`face`（顔などの寄り）、`scene`（背景を描いた場面）。それぞれ alt つき |
| | `focus` | 一覧で 4:5 に切るときの位置（例 `50% 18%`） |
| | 投稿 `posts` | 繰り返し。下の「投稿」 |
| キャラクター Character | `name` | 今は「A」「B」。サイトでは「Character A」と出す |
| | `personality` `taste` `genre` | 人格、嗜好、音楽のジャンル（1行） |
| | `artists` | 好きなアーティスト。CMS では1行に1組 |
| | `image` | 寄りの画像（作品の face から） |
| ギア Gear | `brand` `model` `thumb` | 同じ製品を複数の作品から参照する。WORKS の絞り込みと「このギアを描いた作品」のボタンになる |
| サイト Site | `heroWork` `description` | HOME のヒーローに出す作品（切り抜きがある作品）、サイトの説明文 |

- WORKS の絞り込みのキー：`kind-original` `kind-tribute` `character-a` `music-{アーティストのキー}` `gear-{ギアのID}`。アーティストのキーは名前から作る（英数字の名前はそのまま小文字のスラッグ、それ以外は短いハッシュ。`keyOf()`）。

### 投稿（posts）

1つの投稿を TikTok と Instagram に同時に出しているので、1件に媒体ごとのURLを持たせる。サイトは動画・画像を自前の枠で見せ、下に媒体のアイコンを置く（design-system.md 5「SNS投稿の取り込み」）。

| 項目 | 内容 |
|---|---|
| `kind` | `short`（縦動画 9:16）／`photo`（写真投稿 4:5） |
| `video` | short の動画ファイル。作品のアニメーションで、曲は入れない（サイトではミュートで再生） |
| `image` | 写真投稿の1枚目、または動画のポスター |
| `links` | 媒体とURL（TikTok・Instagram・YouTube） |

## microCMS のスキーマ（作るとき）

API は4つ（Hobby プランの上限5つの中に収める）。シリーズはセレクトにして API を使わない。

| API | 種類 | フィールドID |
|---|---|---|
| `works` | リスト | `number`（数字）、`series`（セレクト Headphones Girl）、`kind`（セレクト original / tribute）、`character`（コンテンツ参照 characters）、`tributeCharacter` `tributeTitle`（テキスト）、`music`（繰り返し：カスタムフィールド `track`）、`gear`（複数コンテンツ参照 gear）、`date`（日時）、`lead`（テキスト）、`key` `cut` `face` `scene`（画像）と `keyAlt` `cutAlt` `faceAlt` `sceneAlt`（テキスト）、`focus`（テキスト）、`posts`（繰り返し：カスタムフィールド `post`） |
| `track`（カスタムフィールド） | — | `artist` `title`（テキスト） |
| `post`（カスタムフィールド） | — | `kind`（セレクト short / photo）、`video`（ファイル。使えないプランなら動画のURLをテキストで）、`image`（画像）、`alt`（テキスト）、`tiktokUrl` `instagramUrl` `youtubeUrl`（テキスト） |
| `characters` | リスト | `name`（テキスト）、`personality` `taste`（テキストエリア）、`genre`（テキスト）、`artists`（テキストエリア、1行に1組）、`image`（画像）、`imageAlt`（テキスト） |
| `gear` | リスト | `brand` `model`（テキスト）、`thumb`（画像） |
| `site` | オブジェクト | `heroWork`（コンテンツ参照 works）、`description`（テキストエリア） |

- 画像は microCMS から直接配信しない。ビルド時に長辺2400px・WebP で取り込み、Pages から配信する（無料プランの転送量を超えると API ごと止まるため）。
- 共有画像（OGP）は今は `scripts/make-og.mjs` で作った `public/og/{号数}.jpg`。microCMS にしたら、作品の `key` を画像 API で 1200×630 に切った URL に替える。
- 更新したら Webhook で Cloudflare Pages のデプロイフックを呼んで、サイトを作り直す。

## 画像の作り直し

手元の元画像（`../01` `../02` `../amgw5_2.PNG` `../SNS`）から作る。

```
python3 scripts/make-assets.py   # src/assets/art/*.webp と public/video/*.mp4
node scripts/make-og.mjs         # public/og/*.jpg
```
