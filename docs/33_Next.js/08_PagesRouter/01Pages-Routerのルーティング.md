# Pages Router のルーティング

App Router 登場前から使われてきた、**伝統的なルーティング方式**です。
新規開発で選ぶ理由はあまりありませんが、

- 既存プロジェクトが Pages Router で書かれている
- App Router にまだ無い機能を使いたい（少数）
- 学習・既存コードを読むため

…といった場面で読めるようにしておく価値があります。

---

## 1. App Router との大きな違い

| 項目 | Pages Router | App Router |
|------|-------------|------------|
| フォルダ | `pages/` | `app/` |
| ページ | ファイル `Hoge.tsx` がそのまま 1 ページ | `page.tsx` を置く |
| データ取得 | `getServerSideProps` / `getStaticProps` | Server Components の `await fetch` |
| レイアウト | `_app.tsx` で全体ラップ | `layout.tsx` で階層的に |
| API | `pages/api/` | `app/api/.../route.ts` |
| Client Component の概念 | なし（全部クライアント） | あり（Server / Client 境界） |

---

## 2. ファイル = URL

`pages/` 配下のファイルが、そのまま URL になります。

```text
pages/
├── index.tsx              → "/"
├── about.tsx              → "/about"
├── blog/
│   ├── index.tsx          → "/blog"
│   └── [slug].tsx         → "/blog/任意"
└── shop/
    └── [...path].tsx      → "/shop/* 何階層でも"
```

App Router と違って、**ファイル名がそのまま URL の最後**になります（`page.tsx` 不要）。

### 簡単な例

```tsx
// pages/about.tsx
export default function About() {
  return <h1>About</h1>;
}
```

これだけで `/about` が動きます。

---

## 3. 動的ルート

App Router と同じく `[slug]` を使います。

```tsx
// pages/blog/[slug].tsx
import { useRouter } from "next/router";

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query; // string | string[] | undefined

  return <h1>{slug}</h1>;
}
```

App Router と異なり、`useRouter()` フックでクエリ・パラメータを取得します。

### キャッチオール

```tsx
// pages/docs/[...path].tsx
const { path } = router.query; // string[]
```

### オプショナルキャッチオール

```tsx
// pages/docs/[[...path]].tsx
const { path } = router.query; // string[] | undefined
```

---

## 4. リンク

App Router と同じ `next/link` を使います。

```tsx
import Link from "next/link";

<Link href="/about">About</Link>
<Link href={`/blog/${slug}`}>記事</Link>
```

---

## 5. `_app.tsx`：全ページ共通のラッパー

`pages/_app.tsx` は **すべてのページをラップする**特別なコンポーネント。
グローバル CSS の import や Provider はここに書きます。

```tsx
// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <header>共通ヘッダー</header>
      <Component {...pageProps} />
      <footer>共通フッター</footer>
    </>
  );
}
```

App Router の **`layout.tsx` の元祖**ですが、こちらは**1 つしか持てない**（階層レイアウトはない）。

---

## 6. `_document.tsx`：HTML 全体をカスタム

`<html>` `<body>` `<head>` などをカスタマイズする場合。

```tsx
// pages/_document.tsx
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
```

App Router では `app/layout.tsx` で `<html>` `<body>` を直接書くので、`_document.tsx` 相当のものは不要に。

---

## 7. `_error.tsx` / `404.tsx` / `500.tsx`

エラーページは特定のファイル名で配置。

```tsx
// pages/404.tsx
export default function Custom404() {
  return <h1>404 - ページが見つかりません</h1>;
}

// pages/500.tsx
export default function Custom500() {
  return <h1>500 - サーバーエラー</h1>;
}
```

App Router の `not-found.tsx` / `error.tsx` の前身。

---

## 8. ナビゲーション：`useRouter`

```tsx
import { useRouter } from "next/router";

const router = useRouter();
router.push("/about");
router.replace("/login");
router.back();
router.query.slug;
router.pathname; // "/blog/[slug]"
router.asPath;   // "/blog/hello"
```

App Router では `next/navigation` の `useRouter` に分離されています（API も少し違う）。

---

## 9. ヘッド（メタデータ）

`next/head` を使います。

```tsx
import Head from "next/head";

export default function Page() {
  return (
    <>
      <Head>
        <title>About | My Site</title>
        <meta name="description" content="..." />
      </Head>
      <h1>About</h1>
    </>
  );
}
```

App Router の `metadata` export より自由度は高いが、書く量は多い。

---

## 10. API Routes

`pages/api/` 配下に置くファイルが API として動きます。

```ts
// pages/api/hello.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ message: "hello" });
}
```

App Router の `route.ts` と比べて、**1 関数で全 HTTP メソッドを処理**します（`req.method` で分岐）。

```ts
export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({ ... });
  } else if (req.method === "POST") {
    // ...
  } else {
    res.status(405).end();
  }
}
```

---

## 11. データ取得（次ページで詳細）

Pages Router では「データ取得関数」を export してデータを得ます：

- `getServerSideProps`：毎リクエストで実行（SSR）
- `getStaticProps`：ビルド時に実行（SSG）
- `getStaticPaths`：静的生成する URL を列挙
- クライアント側：`useEffect` + `fetch`

詳しくは [[02getServerSideProps等]] へ。

---

## 12. App Router と共存可能

実は **同じプロジェクトに `pages/` と `app/` を共存**させられます。
`app/` のルートが優先されます。

```text
my-app/
├── pages/         ← レガシー部分
└── app/           ← 新規追加
```

段階的に移行する場合に有効。

---

## 13. つまずきポイント

### Q. Pages Router に Server Components はある？

→ ありません。Pages Router の全ページは Client Component として動きます。

### Q. ページが API 化してしまう

→ `pages/api/` 以下は API、それ以外はページ。配置場所に注意。

### Q. `useRouter` が undefined を返す

→ `next/router`（Pages 用）と `next/navigation`（App 用）を間違えていませんか？

### Q. `getServerSideProps` を `app/` 内で書けない

→ App Router では使えません。代わりに `async` Server Component として書きます。

---

## まとめ

- **`pages/` フォルダ + ファイル = URL**
- 全ページに共通の `_app.tsx`、HTML カスタムは `_document.tsx`
- データ取得は `getServerSideProps` / `getStaticProps`（次ページ）
- API は `pages/api/handler.ts`、req/res 形式
- App Router とは**共存可能**だが、新規は App Router 推奨

次は Pages Router のデータ取得 → [[02getServerSideProps等]]
