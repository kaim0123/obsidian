---
title: JavaScriptとバンドルの最適化
created: 2026-10-12
tags:
  - パフォーマンス
  - フロントエンド
---

# JavaScriptとバンドルの最適化

[[MOC_パフォーマンス体系|📚 目次]] ｜ [[02_ブラウザのレンダリングと描画|← 前へ]] ｜ [[04_画像とフォントの最適化|次へ →]]

> [!abstract] この記事で分かること
> - JavaScript が同じサイズの画像より「重い」理由（ダウンロード・パース・コンパイル・実行）
> - バンドル分析ツールで「何が大きいのか」を見つける方法
> - コード分割と dynamic import、tree shaking が効く条件
> - 依存ライブラリ・サードパーティスクリプトの見直し方
> - ハイドレーションのコストと React Server Components、パフォーマンスバジェット
>
> **前提**：[[02_ブラウザのレンダリングと描画]] を読んでいると理解しやすいです。

## 1. ひとことで言うと

JavaScript は「**組み立て式の家具**」です。画像は届いたらそのまま飾れる完成品ですが、JS は届いた後に説明書を読み（パース）、部品を加工し（コンパイル）、組み立てる（実行）必要があります。しかもその作業をするのは、お客さんの対応もしている 1 人の職人（メインスレッド）です。だから **同じ 100KB でも、JS は画像よりはるかにユーザーを待たせます**。

- 一番効く最適化は「**送らない**」こと。次が「**後で送る**」こと
- まず **バンドル分析** で何が大きいかを測る。推測で削らない
- 減らした量は **パフォーマンスバジェット** で CI に守らせる

## 2. JavaScript が重い理由

```
  同じ 170KB（圧縮後）でも…（処理時間は説明用の例。低スペックスマホ想定）

  JPEG 画像: [ダウンロード ■■■■ ][デコード ■ ] → 表示（メインスレッドはほぼ使わない）
  JS:        [ダウンロード ■■■■ ][パース ■■ ][コンパイル ■■ ][実行 ■■■■■■■■ ]
                                   └――――――――― メインスレッドを占有 ―――――――――┘
```

| 工程 | 何が起きるか | 効く対策 |
|---|---|---|
| ダウンロード | 圧縮後サイズと RTT に比例 | 圧縮（Brotli）、分割、キャッシュ |
| パース・コンパイル | 展開後のサイズに比例。V8 は遅延パースやバックグラウンドコンパイルで軽減しているが、ゼロにはならない | コードの総量を減らす |
| 実行 | トップレベルの初期化、フレームワークの起動、ハイドレーション | 不要な初期化をしない、遅延実行 |

ポイントは、**圧縮後 200KB の JS は展開すると 1MB 近くになることがある** という点です。ネットワークの転送量だけ見ていると、パース・実行のコストを過小評価します。そして実行中のメインスレッドは入力に応答できないため、**INP と TBT** に直撃します（[[01_Core_Web_Vitals]]）。

## 3. どう測るか：バンドル分析

### 3-1. まず全体量を見る

```bash
# Next.js のビルド出力には、ルートごとのサイズが表示される（2026 年時点）
npx next build
# Route (app)                    Size     First Load JS
# ┌ ○ /                          5.2 kB        112 kB
# └ ƒ /products/[id]             48 kB         310 kB   ← 怪しい
```

Chrome DevTools の **Coverage** タブ（Ctrl+Shift+P →「Show Coverage」）でページを読み込むと、ダウンロードした JS のうち **実際に実行されなかった割合** が分かります。50% 以上が未使用なら分割の余地が大きいです。

### 3-2. バンドルの中身を見る

```bash
# webpack ビルドの Next.js：@next/bundle-analyzer
npm i -D @next/bundle-analyzer
```

```ts
// next.config.ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });
const nextConfig: NextConfig = {};
export default withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npx next build --webpack   # client / server / edge のツリーマップが開く

# Turbopack ビルドの場合（Next.js 16.1 以降、2026 年時点で experimental）
npx next experimental-analyze
```

Next.js 以外の webpack プロジェクトでは `webpack-bundle-analyzer`、Vite では `rollup-plugin-visualizer` が同様のツリーマップを出します。**面積の大きい四角** から疑い、「なぜこれが入っているのか（誰が import しているのか）」を調べます。

## 4. 送る量を減らす

### 4-1. コード分割と dynamic import

すべてのページ・機能を 1 つのバンドルにすると、商品詳細ページを見るだけの人にも管理画面やレビュー投稿フォームのコードを送ることになります。**コード分割（Code Splitting）** は、バンドルを小さな塊（チャンク）に分け、必要になったときに読み込む仕組みです。

- **ルート単位**：Next.js などは自動でページごとに分割します。
- **コンポーネント単位**：重くて最初は使わない部品は `dynamic import` で遅延読み込みします。

```tsx
// app/products/[id]/ReviewSection.tsx（Client Component）
"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

// レビュー投稿用のリッチエディタ（約 150KB）はボタンを押すまで読まない
const ReviewEditor = dynamic(() => import("./ReviewEditor"), {
  ssr: false,
  loading: () => <p>エディタを読み込み中…</p>,
});

export function ReviewSection() {
  const [open, setOpen] = useState(false);
  return (
    <section>
      <button onClick={() => setOpen(true)}>レビューを書く</button>
      {open && <ReviewEditor />}
    </section>
  );
}
```

```ts
// フレームワークを使わない素の dynamic import
button.addEventListener("click", async () => {
  const { exportCsv } = await import("./export-csv"); // このときだけ取得
  exportCsv(orders);
});
```

注意点として、**ファーストビューに必要なものまで遅延させると LCP が悪化** します。分割するのは「最初の画面に不要なもの」だけです。

### 4-2. tree shaking が効く条件

**tree shaking** は、import されていても使われていないコード（デッドコード）をビルド時に取り除く最適化です。ただし次の条件がそろわないと効きません。

| 条件 | 理由 |
|---|---|
| ライブラリが **ES Modules（`import`/`export`）** で提供されている | CommonJS（`require`）は動的なので、使っていない部分を静的に判定できない |
| **名前付き import** を使う（`import { debounce } from "lodash-es"`） | `import _ from "lodash"` は全体を使うと見なされる |
| `package.json` に `"sideEffects": false`（または副作用のあるファイルのリスト）がある | import しただけで何かが起きる（副作用がある）可能性があると、バンドラーは安全のため残す |
| 本番ビルド（minify 有効）である | 未使用コードの最終削除は minifier が行う |

```ts
// ❌ lodash（CommonJS）全体が入る：約 70KB（minify 後、gzip 前の目安）
import _ from "lodash";
_.debounce(search, 300);

// ✅ lodash-es から名前付き import：debounce とその依存だけ
import { debounce } from "lodash-es";
```

Next.js にはアイコンライブラリなど「バレルファイル（index.ts で大量に re-export するファイル）」を持つパッケージ向けに `optimizePackageImports` 設定があり、一部の有名ライブラリには既定で適用されています（2026 年時点）。

### 4-3. 依存ライブラリを見直す

バンドル分析で大きく見えるのは、たいてい **自分のコードではなく依存ライブラリ** です。

| よくある大物 | 問題 | 代替の例 |
|---|---|---|
| moment.js | 全ロケールを含みやすく、tree shaking が効かない（公式もメンテナンスモードで新規利用を非推奨） | date-fns（関数単位で import）、Day.js、標準の `Intl.DateTimeFormat` |
| lodash（CommonJS） | 全体が入りやすい | lodash-es、ネイティブ（`Array.prototype.flatMap`、`structuredClone` など） |
| 巨大な UI / グラフライブラリ | 1 機能のために全体が入る | 個別 import、軽量な代替、dynamic import |
| polyfill の過剰同梱 | 古いブラウザ向けの変換が最新ブラウザにも送られる | `browserslist` を実際の対象ブラウザに合わせる |

新しく依存を足す前に、[bundlephobia.com](https://bundlephobia.com/) などでそのパッケージの minify 後・gzip 後のサイズと tree shaking 対応（ESM か、副作用なしか）を調べる習慣をつけると、後から削る手間が減ります。

## 5. サードパーティスクリプト

広告・解析・チャット・A/B テストなどの外部スクリプトは、**自分では中身を最適化できない** うえにメインスレッドを占有します。Shop でも、計測タグを 1 つ足しただけで INP が悪化することは珍しくありません。

対策の優先順位：

1. **本当に必要か棚卸しする**（使われていないタグが残っていることが多い）
2. **読み込みタイミングを遅らせる**
3. **メインスレッドから追い出す**

```tsx
// Next.js の next/script（2026 年時点）
import Script from "next/script";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        {/* afterInteractive（既定）：ハイドレーション後に読む。解析タグ向け */}
        <Script src="https://analytics.example.com/tag.js" strategy="afterInteractive" />
        {/* lazyOnload：ブラウザが暇になってから。チャットウィジェット向け */}
        <Script src="https://chat.example.com/widget.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
```

| strategy | タイミング | 用途 |
|---|---|---|
| `beforeInteractive` | ハイドレーション前（ページの初期 HTML に挿入） | Bot 検知、Cookie 同意など本当に先に必要なもの |
| `afterInteractive` | ハイドレーション後（既定） | タグマネージャー、解析 |
| `lazyOnload` | アイドル時 | チャット、SNS 埋め込み |
| `worker` | **Partytown** で Web Worker 上で実行 | 実験的。2026 年時点で App Router では未対応 |

**Partytown** はサードパーティスクリプトを Web Worker で動かし、メインスレッドを空ける OSS です。ただし DOM へのアクセスを同期的にプロキシする仕組みのため、すべてのスクリプトが正しく動くわけではありません。導入するなら動作検証が必須です。

## 6. ハイドレーションと React Server Components

### 6-1. ハイドレーションのコスト

SSR（サーバーサイドレンダリング）では、サーバーが HTML を作って送るので表示は速くなります。しかしその HTML を操作可能にするには、ブラウザ側で **同じコンポーネントの JS をダウンロードして再実行し、イベントハンドラを結び付ける**（ハイドレーション）必要があります。

```
  SSR + ハイドレーション（時間は説明用の例）
  |―HTML―|  ← ここで見える（LCP は良い）
          |――― JS ダウンロード ―――|―― ハイドレーション 400ms ――|  ← この間クリックしても反応しない
                                                              ↑ ここで初めて操作可能
```

「見えているのに押せない」時間が長いと、読み込み直後の操作で INP が悪化します。

### 6-2. React Server Components（RSC）

RSC は、**サーバーでだけ実行され、JS をブラウザに送らない** コンポーネントです。Next.js の App Router では既定で Server Component になり、`"use client"` を付けたものだけがブラウザに JS として送られ、ハイドレーションされます。

```tsx
// app/products/[id]/page.tsx — Server Component（JS はブラウザに送られない）
import { getProduct } from "@/lib/api";
import { AddToCartButton } from "./AddToCartButton"; // ← これだけ "use client"

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);   // サーバーで直接取得
  return (
    <article>
      <h1>{product.name}</h1>
      <p>{product.description}</p>         {/* Markdown 変換ライブラリもサーバー側だけ */}
      <AddToCartButton productId={product.id} />
    </article>
  );
}
```

設計のコツは **`"use client"` の境界をできるだけ葉（末端）に寄せる** ことです。ページ全体に `"use client"` を付けると、その下のすべてがクライアントバンドルに入り、RSC の利点が消えます。境界設計の考え方は [[03_パフォーマンスを設計で作り込む]] も参照してください。

## 7. パフォーマンスバジェット

**パフォーマンスバジェット** は「JS は 1 ページあたり圧縮後 ○KB まで」「LCP は ○秒まで」といった **超えてはいけない上限** を決めて、CI で自動チェックする仕組みです。最適化しても、機能追加のたびにじわじわ太るのを防ぎます。

```json
// package.json — size-limit でバンドルサイズの上限を CI で守る例
{
  "scripts": { "size": "size-limit" },
  "size-limit": [
    { "path": ".next/static/chunks/app/products/**/*.js", "limit": "120 kB" }
  ]
}
```

```bash
npx size-limit
# ✖ .next/static/chunks/app/products/**/*.js
#   Size limit: 120 kB
#   Size:       163 kB  ← 超過で CI を失敗させる
```

バジェットの決め方：現状を計測し、目標（例：中位の Android 端末・4G で LCP 2.5 秒）から逆算して決めます。指標ベースのバジェット（LCP・TBT）は Lighthouse CI で守ります（[[06_LighthouseとRUMで計測する]]）。

Shop 商品詳細ページでの改善イメージ（**数値は説明用の例**）：

| 施策 | First Load JS | TBT（Lighthouse モバイル） |
|---|---|---|
| Before | 310KB | 850ms |
| moment → date-fns | 255KB | 720ms |
| レビューエディタを dynamic import | 190KB | 520ms |
| ページを Server Component 化し、カートボタンのみ Client | 125KB | 260ms |

## よくある誤解・つまずき

- ❌ gzip 後のサイズが小さければ問題ない
  ✅ パース・実行のコストは **展開後のサイズ** と処理内容で決まります。
- ❌ `import { x } from "lib"` と書けば必ず tree shaking される
  ✅ ライブラリが CommonJS だったり、`sideEffects` 指定がなかったりすると全体が入ります。分析ツールで確認します。
- ❌ dynamic import はすればするほど良い
  ✅ 細かく分けすぎるとリクエストが増え、ファーストビューの部品まで遅延すると LCP が悪化します。
- ❌ SSR にすれば JS のコストはなくなる
  ✅ ハイドレーションのために同じ JS が送られます。JS を減らすのは RSC やアイランド型の設計です。
- ❌ サードパーティタグはマーケティング部門の管轄だから触れない
  ✅ 性能への影響を数値で示し、棚卸しと読み込み方法の改善を一緒に進めます。

## まとめ

- JS はダウンロード後にパース・コンパイル・実行が必要で、メインスレッドを占有する
- 削る前に **バンドル分析**（@next/bundle-analyzer / `next experimental-analyze` / Coverage）で測る
- コード分割・dynamic import は「最初の画面に不要なもの」に使う
- tree shaking は ESM・名前付き import・`sideEffects` 指定がそろって初めて効く
- サードパーティは棚卸し → 遅延 → Worker 化の順で対処
- RSC で「送らない JS」を増やし、パフォーマンスバジェットで太るのを防ぐ

## 確認クイズ

1. `import _ from "lodash"` を `import { debounce } from "lodash"`（CommonJS 版のまま）に変えましたが、バンドルサイズが変わりません。なぜですか？
> [!tip]- 答え
> `lodash` パッケージは CommonJS で提供されているため、名前付き import にしても静的解析で未使用部分を判定できず、tree shaking が効きません。ESM 版の `lodash-es` を使うか、ネイティブ機能に置き換えます。

2. 商品詳細ページの LCP 画像を表示するコンポーネントを dynamic import（`ssr: false`）にしたところ、JS は減ったのに LCP が悪化しました。なぜですか？
> [!tip]- 答え
> LCP 要素が初期 HTML に含まれなくなり、JS チャンクのダウンロード・実行後に初めて画像のリクエストが始まるためです（LCP の「読み込み遅延」区間が伸びる）。ファーストビューの要素は遅延させてはいけません。

3. App Router でページファイルの先頭に `"use client"` を付けると、何が起きますか？
> [!tip]- 答え
> そのページと、そこから import されるコンポーネントがすべて Client Component になり、JS がブラウザに送られてハイドレーションされます。サーバーだけで使っていたライブラリまでバンドルに入り、RSC の「JS を送らない」利点が失われます。

## 関連ノート

- [[02_ブラウザのレンダリングと描画]] — メインスレッドとロングタスク、タスク分割
- [[04_画像とフォントの最適化]] — JS 以外の大きなリソース
- [[06_LighthouseとRUMで計測する]] — バジェットを Lighthouse CI で守る
- [[03_パフォーマンスを設計で作り込む]] — Client / Server 境界など設計段階での判断
- [[06_パフォーマンス（Lighthouse CI）]] — QA プロセスでの Lighthouse CI 運用
- [[Webサイトの「遅い」は3種類ある｜Web Vitalsを図で理解する]] — 「見えているのに押せない」体験の解説

## 参考

- [The cost of JavaScript in 2019（V8 blog）](https://v8.dev/blog/cost-of-javascript-2019)
- [Reduce JavaScript payloads with code splitting（web.dev）](https://web.dev/articles/reduce-javascript-payloads-with-code-splitting)
- [Reduce JavaScript payloads with tree shaking（web.dev）](https://web.dev/articles/reduce-javascript-payloads-with-tree-shaking)
- [Tree Shaking（webpack docs）](https://webpack.js.org/guides/tree-shaking/)
- [Optimizing package bundling（Next.js docs）](https://nextjs.org/docs/app/guides/package-bundling)
- [Next.js 16.1（Next.js blog）](https://nextjs.org/blog/next-16-1)
- [Lazy Loading（Next.js docs）](https://nextjs.org/docs/app/guides/lazy-loading)
- [Script Component（Next.js docs）](https://nextjs.org/docs/app/api-reference/components/script)
- [Server and Client Components（Next.js docs）](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Partytown（QwikDev）](https://partytown.qwik.dev/)
- [Moment.js Project Status](https://momentjs.com/docs/#/-project-status/)
- [Performance budgets 101（web.dev）](https://web.dev/articles/performance-budgets-101)
- [size-limit（GitHub）](https://github.com/ai/size-limit)
