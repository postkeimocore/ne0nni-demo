# NE0NNi 公式サイト｜作品データと CMS

2026-11-08。サイトは作品データを `src/lib/cms.ts` の1か所から受け取る。

- microCMS の `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` があれば microCMS から、なければ `src/data/works.ts` から読む。
- 使う CMS は未確定（イラスト担当の若林さんが使っている CMS を使う意向）。別の CMS にするときは `src/lib/cms.ts` だけを書き換える。ページと部品は `src/lib/types.ts` の形しか見ない。

## データの形（`src/lib/types.ts`）

| まとまり | 項目 | 内容 |
|---|---|---|
| 作品 Work | 号数 `no` | 1, 2, 3 …。シリーズをまたいだ公開順の通し番号。URL は `/works/001/` |
| | シリーズ `series` | 参照。現在は Headphones Girl |
| | 種類 `kind` | `original`（NE0NNi のキャラクター）／`cover`（アニメ・漫画・映画のキャラクターを描いた作品）。表示する言葉は `KIND_LABEL`（`src/lib/cms.ts`）の1か所 |
| | 元のキャラクター `original` | cover のときだけ。キャラクター名と作品名 |
| | 公開日 `date` | 分かれば。あるときだけ表示 |
| | 一言 `lead` | 明朝の1行。14字まで（スマホ・タブレットで1行に収まる長さ） |
| | 画像 | `key`（背景つきの全体）必須、`cut`（切り抜き）、`face`（顔などの寄り）、`scene`（背景を描いた場面）。それぞれ alt つき |
| | `focus` | 一覧で 4:5 に切るときの位置（例 `50% 18%`） |
| | ギア `gear` | 複数参照 |
| | 投稿 `posts` | 繰り返し。下の「投稿」 |
| ギア Gear | `brand` `model` `thumb` | 同じヘッドホンを複数の作品から参照する。WORKS の絞り込みと「○○の作品」のリンクになる |
| シリーズ Series | `name` | |
| サイト Site | `heroWork` `description` | HOME のヒーローに出す作品（切り抜きがある作品）、サイトの説明文 |

### 投稿（posts）

| 項目 | 内容 |
|---|---|
| `kind` | `short`（縦動画 9:16）／`photo`（フィード 4:5） |
| `platform` | `tiktok` `instagram` `youtube` |
| `postId` | TikTok の投稿ID。入れると TikTok Embed Player で再生する |
| `url` | 投稿のURL（アイコンのリンク先。なければアカウント） |
| `image` | 写真投稿の画像、または動画のポスター |
| `video` | 投稿IDがない間だけ使う、手元の動画（`public/video/`） |

## microCMS のスキーマ（作るとき）

API は4つ（無料プランの API 数の中に収める）。

| API | 種類 | フィールドID |
|---|---|---|
| `works` | リスト | `number`（数字）、`series`（コンテンツ参照 series）、`kind`（セレクト original / cover）、`originalCharacter` `originalTitle`（テキスト）、`date`（日時）、`lead`（テキスト）、`key` `cut` `face` `scene`（画像）と `keyAlt` `cutAlt` `faceAlt` `sceneAlt`（テキスト）、`focus`（テキスト）、`gear`（複数コンテンツ参照 gear）、`posts`（繰り返し：カスタムフィールド `post`） |
| `post`（カスタムフィールド） | — | `kind`（セレクト short / photo）、`platform`（セレクト tiktok / instagram / youtube）、`postId` `url`（テキスト）、`image`（画像）、`alt`（テキスト） |
| `gear` | リスト | `brand` `model`（テキスト）、`thumb`（画像） |
| `series` | リスト | `name`（テキスト） |
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
