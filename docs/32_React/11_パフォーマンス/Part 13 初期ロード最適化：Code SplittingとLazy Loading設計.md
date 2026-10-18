---
title: "[Frontend Performance - Part 13] 初期ロード最適化：Code SplittingとLazy Loading設計"
source: "https://qiita.com/tuanphan/items/fb0e061b31545cb3c0c4"
author:
  - "[[tuanphan]]"
published: 2026-05-07
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 0. はじめに：なぜすべてのJavaScriptを同時に読み込む必要があるのか？ 1. Code Splittingとは？3つの主要戦..."
tags:
  - "clippings"
---
[![ChatGPT Image May 7, 2026, 10_06_36 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/2a03b787-e829-4b5c-904c-8ec362dd49c6.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F2a03b787-e829-4b5c-904c-8ec362dd49c6.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=964c24703876c082ad0418abf6e9749a)

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 0\. はじめに：なぜすべてのJavaScriptを同時に読み込む必要があるのか？

こんな経験はありませんか？

- 再レンダリング、メモ化、state設計を徹底的に最適化したのに **FCP（First Contentful Paint）が依然として遅い**
- Lighthouseで **「未使用JavaScriptを削減」** と警告されるが、どこから手をつければいいかわからない
- アプリが読み込まれた後の動作は速いのに、 **初期読み込みが極端に遅い**
<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__523bc4da0d99138fc246e82fa2eb96da" frameborder="0" height="253"></iframe>

もしこのような問題に直面しているなら、その原因は多くの場合 `useMemo` や `React.memo` ではありません。根本的な原因は多くの場合：

> **初回アクセス時に、ユーザーが必要とするのはごく一部のコードで十分なのに、全JavaScriptコードを送り込んでいることです。**

**Part 13** では次の問いに答えます：

> **「必要なコードを必要なタイミングだけ読み込むにはどうすればよいか？ そして残りのコードは実際に必要になったときに読み込むには？」**

**実際の事例（eコマースプロジェクトより）** ：

| 指標 | 分割前 | ルートベース分割後 | 改善率 |
| --- | --- | --- | --- |
| 初期バンドルJS (gzip) | 1.2 MB | 180KB (main) + 95KB (shopルート) | mainバンドル−68% |
| LCP (3G) | 2.4秒 | 1.1秒 | −54% |
| TBT (Total Blocking Time) 中堅スマホ | 450ms | 120ms | −73% |

---

## 1\. Code Splittingとは？3つの主要戦略

**Code Splitting** は、JavaScriptバンドルを複数の小さなチャンクに分割する手法です。すべてを1つのファイルにまとめるのではなく、必要なタイミングで必要なチャンクだけを読み込みます。

**1.1. Code Splittingが必要な理由**

| モノリシックバンドルの問題点 | 説明 |
| --- | --- |
| ダウンロード遅延 | 1MBのバンドルを1Mbps回線でダウンロードするのに約1秒、さらにパースと実行が必要 |
| パース/コンパイル遅延 | ブラウザはJSのパース中にレンダリングをブロックする；未使用コードが多いほど無駄が大きい |
| キャッシュ効率の低下 | 1行のコード変更でバンドル全体のキャッシュが無効になり、ユーザーは再ダウンロードが必要 |
| 帯域の無駄遣い | ユーザーが決して使わない管理画面のコードも最初から読み込まなければならない |

**1.2. Code Splittingの3つの戦略**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__3a75551711c930ee8dde1e01eb5e2967" frameborder="0" height="314"></iframe>

| 戦略 | 仕組み | 使用するタイミング |
| --- | --- | --- |
| **Entry Points** | 設定ファイルで複数のエントリを定義 (main, admin, vendor) | アプリに複数の独立したページ/ロールがある場合 |
| **SplitChunksPlugin** | Webpackが自動的に共有モジュール（node\_modules、共通コンポーネント）を抽出 | 常に有効推奨；コードの重複を削減 |
| **Dynamic Imports** | `import()` をコード内で使用し、必要な時にチャンクを分割・読み込み | すぐに不要なコンポーネント（モーダル、チャート、ルート） |

> **過分割（over‑splitting）の警告** ：あまりに細かくチャンクを分割しすぎると（例：20KB未満のコンポーネントをすべて個別チャンクに）、リクエスト数の増加、TLSハンドシェイク、ヘッダ圧縮、スケジューリングのオーバーヘッドが顕著になります。現実的な目安として、チャンクサイズは（gzip後）20KB〜100KB程度が適切です。

**1.3. Code Splittingが改善するパフォーマンス指標**

| 指標 | Code Splittingとの関連 |
| --- | --- |
| **LCP (Largest Contentful Paint)** | mainバンドルが小さくなり、ブラウザのJSロード・パースが高速化 → 最大要素が早期に表示される |
| **TBT (Total Blocking Time)** | 特に低スペック端末で効果大：大きなチャンクがメインスレッドを長時間ブロックするのを防ぐ |
| **INP (Interaction to Next Paint)** | 間接的効果：mainスレッドのブロックが減り、操作への応答性が向上 |
| **不要JSの削減** | 未使用コードをそもそもダウンロードしない |

**具体的な計測例（50コンポーネントのダッシュボード）** ：

| 指標 | Webpackデフォルト | ＋ルート分割 | ＋コンポーネント遅延読み込み |
| --- | --- | --- | --- |
| LCP | 2.1秒 | 1.3秒 | 1.1秒 |
| TBT | 380ms | 140ms | 90ms |
| mainバンドル | 980KB | 210KB | 210KB（変わらず） |

---

## 2\. WebpackとViteでのCode Splitting設定

**2.1. Webpack – optimization.splitChunks**

Webpack 4以降では、 `CommonsChunkPlugin` に代わり `SplitChunksPlugin` を使用します。このプラグインは、共有可能なモジュールや `node_modules` 内のモジュールを自動的にグループ化します（デフォルトでは新しいチャンクサイズが30KB以上の場合）。

**基本設定** ：

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',                      // 静的・動的importの両方に適用
      minSize: 20000,                     // 20KB – これ以下のチャンクは分割しない
      maxSize: 244000,                    // ~240KB – 大きなチャンクは分割推奨
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        commons: {
          test: /[\\/]src[\\/]components[\\/]/,
          name: 'common-components',
          minChunks: 2,
          priority: 5
        }
      }
    }
  }
};
```

**2.2. Vite – manualChunks**

Viteは現在、プロダクションビルドに **Rollup** を主に使用しています。 **Rolldown** （Rust製のバンドラ）はViteエコシステムの将来の方向性ですが、まだ完全に普及しておらず、すべてのプロダクション環境でRollupを置き換えているわけではありません。したがって、以下の設定が現時点では安定した方法です。

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['@mui/material', '@emotion/react'],
          'vendor-charts': ['recharts', 'd3']
        }
      }
    }
  }
});
```

関数を使った柔軟な設定：

```typescript
manualChunks(id: string) {
  if (id.includes('node_modules')) {
    if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
    if (id.includes('moment')) return 'vendor-moment';
    return 'vendor';
  }
}
```

---

## 3\. Code splitting ≠ Tree shaking – 両方とも必要

これら2つの用語は混同されがちですが、本質は異なります。

| 手法 | 目的 | タイミング |
| --- | --- | --- |
| **Tree Shaking** | 完全に **使われないコード** を削除 | ビルド時（静的） |
| **Code Splitting** | **使用するコード** をチャンクに分割し、必要な時に読み込む | ランタイム／動的import |

Tree shakingはES Modulesの静的解析に基づき、実際に使用されているエクスポートだけを残してデッドコードを除去します。Code splittingはコードを削除するのではなく、 **コードの読み込みタイミング** を変更するものです。

**例** ：

```tsx
// library.ts – unusedFnはTree shakingで除去される
export const usedFn = () => console.log('used');
export const unusedFn = () => console.log('unused');

// main.ts
import { usedFn } from './library';   // unusedFnはバンドルから除去される

// コンポーネントの遅延読み込み
const HeavyChart = lazy(() => import('./HeavyChart'));
```

両手法は相互補完的です：Tree shakingでバンドルを小さくし、Code splittingでバンドルを時間的に分散します。

---

## 4\. React.lazyとSuspense – コンポーネントの遅延読み込み

**4.1. React.lazyの基本**

`React.lazy()` を使うと、コンポーネントを動的importで定義できます。そのコンポーネントは **初めてレンダリングされるとき** にのみ読み込まれます。

```tsx
import { lazy, Suspense, useState } from 'react';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  const [showChart, setShowChart] = useState(false);
  return (
    <div>
      <button onClick={() => setShowChart(true)}>チャート表示</button>
      {showChart && (
        <Suspense fallback={<div>読み込み中...</div>}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  );
}
```

**4.2. default exportである必要あり**

`React.lazy()` はモジュールの **default export** でのみ動作します。名前付きエクスポートの場合は、手動でマッピングが必要です：

```tsx
const MyComponent = lazy(() =>
  import('./MyComponent').then(module => ({ default: module.MyComponent }))
);
```

**4.3. ErrorBoundary – チャンク読み込みエラーへの対処**

動的importはネットワーク障害やサーバーエラーで失敗することがあります。ErrorBoundaryを組み合わせましょう：

```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary fallback={<div>チャートを読み込めませんでした</div>}>
  <Suspense fallback={<div>読み込み中...</div>}>
    <HeavyChart />
  </Suspense>
</ErrorBoundary>
```

**4.4. React.lazyを使うべきでないケース**

| 状況 | 理由 |
| --- | --- |
| コンポーネントが非常に小さい (<10KB) | 個別チャンクのオーバーヘッド（リクエスト、パース）の方が大きい |
| コンポーネントがビューポート内にすぐ表示される | LCP悪化、UX低下の可能性 |
| 過分割 | チャンク数が数百になるとリクエスト数・TLSオーバーヘッドが増大 |
| SEOクリティカルなabove‑the‑foldコンテンツ | クライアントレンダリングページで遅延読み込みするとSEOやハイドレーションに影響する可能性がある |

> **SSRに関する注意** ：サーバーサイドレンダリングを行うアプリでは、above‑the‑foldのUIを遅延読み込みするとハイドレーションやユーザー体験に悪影響を及ぼす可能性があります。導入前に慎重に検討してください。

---

## 5\. ルートベース遅延読み込みと高度なテクニック

**5.1. ルート全体の遅延読み込み（推奨）**

各ルートを個別のチャンクにし、遷移時にのみ読み込むのが最もシンプルで効果的な方法です。

**React Router v6（基本）** ：

```tsx
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<GlobalSpinner />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**React Router Data Router API（粒度の細かい遅延読み込み）** ：  
一部のバージョンでは loader/action/component を個別に遅延読み込みできます。実際に使用する際は最新のドキュメントを参照してください。

**5.2. モーダル/ダイアログの遅延読み込み**

```tsx
const SettingsModal = lazy(() => import('./modals/SettingsModal'));

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(true)}>設定</button>
      {isOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <SettingsModal onClose={() => setIsOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__c6245d870496db9c4d637365d3c54e09" frameborder="0" height="166"></iframe>

**5.3. non‑Reactコード（プレーンJSモジュール）の遅延読み込み**

```tsx
const loadHeavyMath = () => import('./utils/heavyMath');

function Calculator() {
  const handleCalculate = async () => {
    const { fibonacci } = await loadHeavyMath();
    console.log(fibonacci(40));
  };
  return <button onClick={handleCalculate}>計算</button>;
}
```

---

## 6\. Next.js App Router – 自動Code Splittingと遅延読み込み

**6.1. ルート単位での自動分割**

Next.js App Routerは各ルートセグメントを自動的にコード分割します。フォルダ構造を作るだけで完了です：

```text
app/
├── layout.tsx        // 共有レイアウト
├── page.tsx          // ホームチャンク
├── products/
│   └── page.tsx      // 商品一覧チャンク
└── admin/
    └── page.tsx      // 管理画面チャンク
```

**6.2. `next/dynamic` によるClient Componentの遅延読み込み**

```tsx
'use client';
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>読み込み中...</div>,
  ssr: false,
});
```

**6.3. Next.jsのプリフェッチ動作**

プリフェッチの動作はバージョンや設定に依存します。プロダクションモードでは、Next.jsはビューポート内の `<Link>` を自動的にプリフェッチします。 `prefetch={false}` で無効化したり、 `useRouter().prefetch()` で手動制御も可能です。

**6.4. React Server Components（RSC） – クライアントバンドル削減**

RSCでは、コンポーネントはデフォルトでサーバー上で実行され、クライアントへはJSが送信されません。インタラクティブなコンポーネントだけに `"use client"` を付ければよいのです。これにより、アーキテクチャによっては **クライアントサイドのJavaScriptを大幅に削減** できます。

---

## 7\. パース/実行コスト – 見落とされがちな落とし穴

昨今の4G/5Gネットワークでは、 **ボトルネックはダウンロードだけではありません** 。バンドルサイズが大きいと、特に低スペック端末では **パース・コンパイル・実行** がメインスレッドを長時間ブロックします。Code splittingによって最初にパースされるチャンクサイズを小さくすることで、TBTやINPを改善できます。

実際のコストを計測するには、Chrome DevToolsのPerformanceタブでページ読み込みを記録し、 **Parse/Compile/Evaluation** のセクションを確認しましょう。

---

## 8\. Bundle分析とパフォーマンスバジェット

**8.1. バンドル分析ツール**

| ツール | 対応フレームワーク | 使い方 |
| --- | --- | --- |
| `webpack-bundle-analyzer` | Webpack | プラグイン、ビジュアライズサーバーを起動 |
| `vite-bundle-visualizer` | Vite | プラグイン、HTMLレポートを生成 |
| `@next/bundle-analyzer` | Next.js | プラグイン、 `ANALYZE=true next build` で実行 |

**8.2. パフォーマンスバジェット – 予算の設定**

| バンドル | 推奨サイズ |
| --- | --- |
| **初期JS (main)** | `<200KB` (gzip圧縮後) |
| **初期CSS** | `<50KB` (gzip後) |
| **ベンダーチャンク** | `<150KB` (gzip後) |
| **各ルートチャンク** | `<100KB` (gzip後) |

CIへのバジェット統合例：

```json
{
  "bundlesize": [
    { "path": "./dist/static/js/main.*.js", "maxSize": "200 kB" }
  ]
}
```

**8.3. 大きな依存関係と代替案**

| 依存関係 | サイズ | 代替案 |
| --- | --- | --- |
| `moment.js` | ~200KB+ | `Day.js` (2KB) または `date-fns` |
| `lodash` (full) | ~72KB | `import debounce from 'lodash/debounce'` と個別インポート |
| `chart.js/auto` | ~242KB | 動的importでチャート表示時にのみ読み込む |

---

## 9\. Prefetching, Preloading、そしてHTTP/2/3のニュアンス

**9.1. `webpackMagicComments`**

```tsx
// Prefetch – ブラウザがアイドル時に読み込む（安全）
const AdminPanel = lazy(() => import(/* webpackPrefetch: true */ './AdminPanel'));

// Preload – mainバンドルと並行して読み込む、帯域を競合
const CriticalChart = lazy(() => import(/* webpackPreload: true */ './CriticalChart'));
```

> **Preloadの注意点** ：Preloadを誤って使うとLCPが悪化することがあります。初期レンダリング直後に確実に必要なチャンクだけに限定してください。多くの場合、 **prefetchの方が安全** です。

**9.2. HTTP/2とHTTP/3**

HTTP/2やHTTP/3の多重化（multiplexing）により、多数のリクエストのオーバーヘッドは減少しています。しかしそれでも、過剰な分割によるTLSハンドシェイクやヘッダ圧縮、ブラウザのスケジューリングコストは無視できません。細かすぎる分割は避けるべきです。

**9.3. React Routerでのプリフェッチパターン**

```tsx
function NavLink({ to, children }) {
  const prefetch = () => import(/* webpackPrefetch: true */ \`./pages/${to}.tsx\`);
  return <Link to={to} onMouseEnter={prefetch}>{children}</Link>;
}
```

---

## 10\. SuspenseのUX – レイアウトシフトを避ける

Suspenseは強力ですが、使い方を誤るとレイアウトシフトやちらつきを引き起こします。

- **スケルトンスクリーン** を使う（単なるスピナーより良い）
- フォールバックのために **スペースを確保** する（正確な幅・高さ）
- Suspenseの **過剰なネスト** を避ける

```tsx
// 良い例 – 正確なサイズのスケルトン、レイアウトシフト防止
<div style={{ minHeight: 400 }}>
  <Suspense fallback={<ChartSkeleton width={800} height={400} />}>
    <HeavyChart />
  </Suspense>
</div>

// 悪い例 – フォールバックが小さすぎる
<Suspense fallback={<div>読み込み中...</div>}>
  <HeavyChart />
</Suspense>
```

---

## 11\. アーキテクト向けチェックリスト

**プロジェクト開始前**

- バンドラを選択し、splitChunksの基本設定を行う
- バンドル分析ツールを初期設定する
- パフォーマンスバジェットを定義する
- Tree shakingが機能することを確認する（ES Modules、 `sideEffects` 、productionモード）

**開発中**

- ホームページ以外の全ルートでルートベース遅延読み込みを実施する
- 30KB超の重いコンポーネントは `React.lazy` + `Suspense` を適用する
- ビューポート内に即表示されるコンポーネントの遅延読み込みは避ける
- 大きなベンダーライブラリは `manualChunks` で個別チャンクに分離する
- 重いプレーンJSモジュール（d3、チャート、暗号処理など）も遅延読み込みする
- レイアウトシフトを防ぐため、Skeleton＋スペース確保を徹底する
- Next.jsを使用している場合はRSCを活用する

**確認と最適化**

- バンドルアナライザを実行し、大きな依存関係トップ5を特定する
- Parse/Compile/EvaluationコストをDevTools Performanceで計測する
- 不要または重い依存関係を代替品に置き換える（例：moment.js → dayjs）
- チャンク間のモジュール重複をチェックする（Webpack splitChunks）
- LCP、TBT、INPを分割前後で計測し、改善を定量化する

**Prefetching**

- `webpackPrefetch` を、次に遷移する可能性の高いルートに対して使用する
- `preload` は本当に初期レンダリング直後に必要な場合のみに制限する
- Next.jsやReact Routerのプリフェッチ機能を適宜活用する

---

## 12\. まとめと次回予告

| 手法 | 実装方法 | 効果 |
| --- | --- | --- |
| **Tree Shaking** | ES Modules、productionモード | 未使用コードをビルド時除去 |
| **Entry Points** | 複数エントリの設定 | ページごとに不要コードを削減 |
| **SplitChunksPlugin** | `optimization.splitChunks` | コード重複排除、キャッシュ効率向上 |
| **Dynamic Imports** | `import()`, `React.lazy` | 必要な時だけコードを読み込む |
| **React Router lazy** | ルートの遅延読み込み | ルート単位での分割 |
| **RSC (Next.js)** | Server Componentsをデフォルトで使用 | クライアントバンドル大幅削減 |
| **Bundle Analysis** | 各種バンドルアナライザ | バンドルの中身を正確に把握 |
| **Performance Budget** | チャンクサイズの上限設定 | バンドルの肥大化を防止 |
| **Prefetch** | `webpackPrefetch: true` | 遷移時の待ち時間を軽減 |
| **Suspense UX** | スケルトン、スペース確保 | レイアウトシフトを防止 |

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__d8c7256d7a7412b3dece387c22e7b9a3" frameborder="0" height="1179"></iframe>

---

👉 **次回予告（Part 14）** ：  
**\[Frontend Performance - Part 14\] キャッシュ戦略：ブラウザキャッシュとService Workerを活用する**

---

[0](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)