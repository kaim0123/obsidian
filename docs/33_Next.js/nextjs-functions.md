# Next.js組み込み関数一覧

## 目次
- [[00-Next.js index|← 目次に戻る]]

## データ取得関数

### getServerSideProps
サーバーサイドレンダリング（SSR）でデータを取得

| パラメータ | 型 | 説明 |
|-----------|----|------|
| context | object | リクエストコンテキスト |
| context.params | object | 動的ルートパラメータ |
| context.query | object | クエリパラメータ |
| context.req | object | HTTPリクエストオブジェクト |
| context.res | object | HTTPレスポンスオブジェクト |
| context.preview | boolean | プレビューモード |
| context.previewData | object | プレビューデータ |

**戻り値**
```javascript
{
  props: {}, // ページコンポーネントに渡すプロパティ
  redirect: {}, // リダイレクト
  notFound: boolean // 404ページの表示
}
```

### getStaticProps
静的サイト生成（SSG）でデータを取得

| パラメータ | 型 | 説明 |
|-----------|----|------|
| params | object | getStaticPathsから取得したパラメータ |
| preview | boolean | プレビューモード |
| previewData | object | プレビューデータ |
| locale | string | ロケール |
| locales | string[] | 利用可能なロケール |
| defaultLocale | string | デフォルトロケール |

**戻り値**
```javascript
{
  props: {}, // ページコンポーネントに渡すプロパティ
  revalidate: number, // ISRの再生成間隔（秒）
  notFound: boolean, // 404ページの表示
  redirect: {} // リダイレクト
}
```

### getStaticPaths
動的SSGでパスを生成

| パラメータ | 型 | 説明 |
|-----------|----|------|
| locales | string[] | 利用可能なロケール |
| defaultLocale | string | デフォルトロケール |

**戻り値**
```javascript
{
  paths: [], // 生成するパスの配列
  fallback: boolean | 'blocking' // フォールバック動作
}
```

## ルーティング関数

### useRouter
Next.jsルーターのフック

| プロパティ | 型 | 説明 |
|-----------|----|------|
| route | string | 現在のルート |
| pathname | string | 現在のパス名 |
| query | object | クエリパラメータ |
| asPath | string | 実際のパス |
| push | function | ページ遷移 |
| replace | function | ページ置換 |
| back | function | 前のページに戻る |
| reload | function | ページ再読み込み |
| prefetch | function | ページのプリフェッチ |
| beforePopState | function | ブラウザバック前の処理 |
| events | object | ルーターイベント |
| isFallback | boolean | フォールバック中かどうか |

### Link
クライアントサイドナビゲーション

| プロパティ | 型 | 説明 |
|-----------|----|------|
| href | string | 遷移先のパス |
| as | string | 実際のURL |
| replace | boolean | 履歴を置換するか |
| scroll | boolean | スクロールするか |
| shallow | boolean | シャロールーティング |
| passHref | boolean | hrefを子要素に渡すか |
| prefetch | boolean | プリフェッチするか |

### Image
最適化された画像コンポーネント

| プロパティ | 型 | 説明 |
|-----------|----|------|
| src | string | 画像のソース |
| alt | string | 代替テキスト |
| width | number | 幅 |
| height | number | 高さ |
| layout | string | レイアウト（fill, fixed, intrinsic, responsive） |
| placeholder | string | プレースホルダー（blur, empty） |
| blurDataURL | string | ブラー画像のURL |
| priority | boolean | 優先読み込み |
| loading | string | 読み込み方法（lazy, eager） |
| sizes | string | レスポンシブサイズ |
| quality | number | 画質（1-100） |

## ヘッド管理関数

### Head
HTML head要素の管理

| プロパティ | 型 | 説明 |
|-----------|----|------|
| children | ReactNode | head要素の内容 |

### next/head
メタデータの設定

```javascript
import Head from 'next/head';

<Head>
  <title>ページタイトル</title>
  <meta name="description" content="説明" />
  <meta property="og:title" content="OGタイトル" />
</Head>
```

## 設定関数

### next.config.js
Next.jsの設定

| オプション | 型 | 説明 |
|-----------|----|------|
| env | object | 環境変数 |
| publicRuntimeConfig | object | 公開ランタイム設定 |
| serverRuntimeConfig | object | サーバーランタイム設定 |
| distDir | string | ビルド出力ディレクトリ |
| assetPrefix | string | アセットプレフィックス |
| basePath | string | ベースパス |
| trailingSlash | boolean | 末尾スラッシュ |
| compress | boolean | 圧縮 |
| poweredByHeader | boolean | X-Powered-Byヘッダー |
| generateEtags | boolean | ETag生成 |
| reactStrictMode | boolean | Strict Mode |
| swcMinify | boolean | SWC圧縮 |
| experimental | object | 実験的機能 |

## ミドルウェア関数

### middleware
Next.jsミドルウェア

```javascript
export function middleware(request) {
  // ミドルウェア処理
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

## 国際化関数

### useRouter (i18n)
国際化ルーター

| プロパティ | 型 | 説明 |
|-----------|----|------|
| locale | string | 現在のロケール |
| locales | string[] | 利用可能なロケール |
| defaultLocale | string | デフォルトロケール |
| domainLocales | object | ドメイン別ロケール |

### getStaticProps (i18n)
国際化対応のgetStaticProps

```javascript
export async function getStaticProps({ locale, locales, defaultLocale }) {
  return {
    props: {
      locale,
      locales,
      defaultLocale,
    },
  };
}
```

## エラーハンドリング関数

### _error.js
カスタムエラーページ

```javascript
function Error({ statusCode }) {
  return (
    <p>
      {statusCode
        ? `An error ${statusCode} occurred on server`
        : 'An error occurred on client'}
    </p>
  );
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
```

### _document.js
カスタムドキュメント

```javascript
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

## 動的インポート関数

### dynamic
動的コンポーネントインポート

| オプション | 型 | 説明 |
|-----------|----|------|
| loader | function | コンポーネント読み込み関数 |
| loading | component | ローディングコンポーネント |
| ssr | boolean | SSR有効化 |
| loading | function | ローディング関数 |

```javascript
const DynamicComponent = dynamic(() => import('../components/Heavy'), {
  loading: () => <p>Loading...</p>,
  ssr: false,
});
```

## ユーティリティ関数

### withRouter
ルーターをHOCで提供

```javascript
import { withRouter } from 'next/router';

function Page({ router }) {
  return <p>Current path: {router.pathname}</p>;
}

export default withRouter(Page);
```

### useRouter (App Router)
App Routerでのルーター

| プロパティ | 型 | 説明 |
|-----------|----|------|
| back | function | 前のページに戻る |
| forward | function | 次のページに進む |
| push | function | ページ遷移 |
| replace | function | ページ置換 |
| refresh | function | ページ更新 |
| prefetch | function | プリフェッチ |

## 設定関連関数

### next.config.js (詳細設定)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化
  images: {
    domains: ['example.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // リダイレクト
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },
  
  // リライト
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
  
  // ヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
  
  // Webpack設定
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // カスタムWebpack設定
    return config;
  },
};

module.exports = nextConfig;
```

## 関連リンク

- [[01_programming/05_React・フロントエンド開発/11_Next.js/01-basics|Next.jsの基礎]]
- [[03-pages|ページとルーティング]]
- [[06-data-fetching|データ取得]]
- [[07-api-routes|API Routes]]
- [[01_programming/05_React・フロントエンド開発/11_Next.js/11-optimization|最適化]]

---

**目次に戻る**: [[00-Next.js index|Next.js 初心者向け教科書]] 