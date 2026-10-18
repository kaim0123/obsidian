# 1-2. SPA/MPA・CSR/SSR/SSG（ざっくり比較）

## 🎯 この章で学ぶこと

- SPA・MPAの違い（Webサイトの作り方の2スタイル）
- CSR・SSR・SSG・ISRの違い（HTMLをどこで作るか）
- それぞれの長所・短所と使い分け

---

## 📖 概念の説明

### まず用語の整理

略語が多くて混乱しやすいのですが、**「画面をどこで・いつ作るか」**の話だと覚えてください。

| 略語 | 何の略 | 一言で言うと |
| --- | --- | --- |
| **SPA** | Single Page Application | 1枚のHTMLでJSが画面を切り替える |
| **MPA** | Multi Page Application | 画面ごとに別のHTMLを返す（昔ながら） |
| **CSR** | Client Side Rendering | ブラウザで画面を組み立てる |
| **SSR** | Server Side Rendering | サーバで画面を組み立ててから送る |
| **SSG** | Static Site Generation | ビルド時にHTMLを作っておく |
| **ISR** | Incremental Static Regeneration | SSGを後から更新できるバージョン |

### SPA vs MPA：画面遷移のスタイル

#### MPA（昔ながら）

ページごとにサーバから別のHTMLを取りに行きます。

```
[ホーム] → サーバが home.html を返す
[商品]   → サーバが product.html を返す（ページ全体が再ロード）
```

#### SPA（Reactの基本）

1枚のHTMLにJavaScriptが入っていて、JSが画面を切り替えます。

```
[最初の1回]   → サーバが index.html + JS をまとめて返す
[ホーム→商品] → JSが画面の中身だけ書き換え（ページ全体は再ロードしない）
```

ページが切り替わるとき**チラつかない**のがSPAの利点です。

### CSR vs SSR vs SSG：画面をどこで組み立てる？

これは「**HTMLを誰がいつ作るか**」の違いです。

#### CSR（Client Side Rendering）

```
[ブラウザ]
  ↓ 「下さい」
[サーバ]: 空のHTML + 大きなJS
  ↓
[ブラウザ]: JSを実行して画面を組み立てる
```

- 長所：作りやすい・操作が軽快
- 短所：最初の表示が遅い・SEOに弱い

#### SSR（Server Side Rendering）

```
[ブラウザ]
  ↓ 「下さい」
[サーバ]: その場で画面を組み立てて、完成HTMLを返す
  ↓
[ブラウザ]: すぐ表示できる
```

- 長所：初回表示が速い・SEOに強い
- 短所：サーバ負荷が高い・実装が複雑

#### SSG（Static Site Generation）

```
[ビルド時]: あらかじめ全ページのHTMLを作っておく
[ブラウザ]: 完成済みHTMLをそのまま受け取る
```

- 長所：超高速・サーバ不要（CDNだけでOK）
- 短所：内容が頻繁に変わるサイトには不向き

#### ISR（Incremental Static Regeneration）

SSGを「ある時間ごとに作り直す」仕組み。Next.jsで使われます。

---

## 💻 比較表

| 比較軸 | CSR（素のReact） | SSR（Next.js等） | SSG（Next.js等） |
| --- | --- | --- | --- |
| 初回表示 | 遅い | 速い | 最速 |
| サーバ負荷 | 低い | 高い | なし |
| SEO | 弱い | 強い | 強い |
| 動的データ | 得意 | 得意 | 苦手 |
| 実装難易度 | 簡単 | 中〜難 | 中 |

---

## 🛠 どれを選ぶ？

### この教材ではCSR（素のReact + Vite）を使う

**理由**：

- 環境構築が一番シンプル
- React の本質（state, hooks, render）に集中できる
- 実装した内容はそのままNext.js（SSR/SSG対応）でも使える

### Next.jsはいつ学ぶ？

「素のReactで作れる」ようになってから [[A-3-学習ロードマップ]] のステップに沿って学ぶのが効率的です。

---

## ❌ よくある間違い

### 「Reactはサーバレンダリング必須」と思い込む

→ 違います。素のReactはCSRです。SSR/SSGはNext.jsなどのフレームワークが提供します。

### SEO目的で何でもSSRにする

→ 管理画面のような「ログイン後しか見ない画面」はSEO不要。CSRで十分。

---

## ✅ ベストプラクティス

1. 学習中は**CSR + Vite**で進める
2. 公開サイト・ブログのSEOが必要なら**Next.js（SSR/SSG）**を検討
3. **「初回表示の速さ」と「サーバコスト」のバランス**で選ぶ
4. 内部ツールは**CSRで十分**なことが多い
5. 迷ったら**SSG → SSR → CSR**の順に検討する（軽い順）

---

## 📝 まとめ

- SPA/MPA = 画面遷移のスタイル
- CSR/SSR/SSG = HTMLをどこで作るか
- 素のReactはCSR、Next.jsはSSR/SSG/ISRに対応
- 学習中はCSR（Vite）でOK、公開サイトの種類でNext.jsを検討

---

## 🔗 関連ページ

- [[1-1-Reactとは何か]]
- [[1-3-Reactのレンダーとは]]
- [[2-2-ViteでReactアプリ作成]]
- [[A-3-学習ロードマップ]]
