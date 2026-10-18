# loading / error / not-found

App Router では、特定のファイル名を置くだけで「**読み込み中**」「**エラー時**」「**見つからない時**」の画面を**自動で**表示できます。
React の `<Suspense>` や `ErrorBoundary` をフレームワークが裏でうまく組み立ててくれる仕組みです。

---

## 1. `loading.tsx`：読み込み中の表示

データ取得などで時間がかかる間、自動で表示されるローディング画面です。

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <p>読み込み中...</p>;
}
```

### どんな時に表示される？

- **同じフォルダ or 子フォルダの `page.tsx`** が**サーバー側のデータ取得待ち**のとき
- ナビゲーション時にも表示される

### 仕組み

裏側では React の `<Suspense>` で `page.tsx` をラップしてくれています。

```text
<Suspense fallback={<Loading />}>
  <Page />
</Suspense>
```

### 部分ローディング（ページの一部だけ）

`loading.tsx` はページ全体に対するものですが、もっと細かく制御したい場合は **手動で `<Suspense>`** を書きます。

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <h1>ダッシュボード</h1>
      <Suspense fallback={<p>注文を読み込み中...</p>}>
        <Orders />
      </Suspense>
      <Suspense fallback={<p>通知を読み込み中...</p>}>
        <Notifications />
      </Suspense>
    </>
  );
}

async function Orders() {
  const data = await fetch("...").then(r => r.json());
  return <ul>{data.map(...)}</ul>;
}
```

これで「注文」と「通知」が **別々に** ストリーミングされて表示されます。

---

## 2. `error.tsx`：エラー時の表示

データ取得失敗・例外発生など、**ページの描画中にエラーが起きた**ときに表示されます。

```tsx
// app/dashboard/error.tsx
"use client"; // ← 必須！クライアントコンポーネント

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>エラーが発生しました</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>もう一度試す</button>
    </div>
  );
}
```

### ポイント

- **必ず `"use client"`** を付ける（エラー境界は Client Components のみ）
- `reset()` を呼ぶと、エラー境界の中身を**再描画**しようとする
- `error.digest` には Next.js が割り振った識別子が入る（本番ログで原因特定に使える）

### スコープ

- `app/dashboard/error.tsx` は `app/dashboard/**` のエラーをキャッチ
- ただし**そのフォルダの `layout.tsx` のエラーはキャッチできない**（より上の `error.tsx` が必要）

### `global-error.tsx`：ルートレイアウトのエラー用

```tsx
// app/global-error.tsx
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>致命的エラー</h2>
        <button onClick={() => reset()}>再試行</button>
      </body>
    </html>
  );
}
```

`<html>` と `<body>` も自前で書く必要があります（ルートレイアウトが死んでいるため）。

---

## 3. `not-found.tsx`：404 ページ

存在しない URL や、コード内で `notFound()` を呼んだ時に表示されます。

```tsx
// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div>
      <h2>ページが見つかりません</h2>
      <Link href="/">トップへ戻る</Link>
    </div>
  );
}
```

### コード内から 404 を出す

```tsx
import { notFound } from "next/navigation";

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound(); // ← ここで 404 へ
  return <article>{post.title}</article>;
}
```

`notFound()` は例外を投げる仕組みなので、それ以降のコードは実行されません（`return` 不要）。

### スコープごとの 404

`not-found.tsx` もフォルダごとに置けます。

```text
app/
├── not-found.tsx           ← 全体共通の 404
└── dashboard/
    └── not-found.tsx       ← /dashboard 配下用の 404
```

---

## 4. 4 つを組み合わせた典型構造

```text
app/
├── layout.tsx
├── page.tsx
├── loading.tsx          ← 全体ローディング
├── error.tsx            ← 全体エラー
├── not-found.tsx        ← 全体 404
└── dashboard/
    ├── layout.tsx
    ├── page.tsx
    ├── loading.tsx      ← /dashboard 専用ローディング
    └── error.tsx        ← /dashboard 専用エラー
```

URL に応じて、適切な fallback / boundary が**自動で組み立て**られます。

```html
<RootLayout>
  <ErrorBoundary fallback={<RootError />}>
    <Suspense fallback={<RootLoading />}>
      <DashboardLayout>
        <ErrorBoundary fallback={<DashboardError />}>
          <Suspense fallback={<DashboardLoading />}>
            <DashboardPage />
          </Suspense>
        </ErrorBoundary>
      </DashboardLayout>
    </Suspense>
  </ErrorBoundary>
</RootLayout>
```

---

## 5. Streaming（ストリーミング）

`loading.tsx` や `<Suspense>` を使うと、Next.js は**準備できた部分から少しずつ HTML を送る**ことができます。

- ヘッダーや静的部分は即送信
- 重いデータ取得部分は後から追加で送信
- ユーザーは「真っ白の画面で待つ」必要がない

これが「**ストリーミング**」です。詳細は [[01Server-ComponentsとClient-Components]] を参照。

---

## 6. つまずきポイント

### Q. `loading.tsx` を置いたのに何も表示されない

→ ページが**サーバーで `await`** していないと表示されません（即座に終わる場合は出ない）。

### Q. `error.tsx` でエラーが出ない

→ `"use client"` を付け忘れていませんか？

### Q. `notFound()` を呼んでも 404 にならない

→ try-catch で囲んでしまっていませんか？例外を投げる仕組みなので catch すると無効化されます。

### Q. 子コンポーネントだけローディングしたい

→ `loading.tsx`（フォルダ単位）ではなく **手動で `<Suspense>`** を使ってください。

---

## まとめ

- **`loading.tsx`**：データ待ちの間に自動表示
- **`error.tsx`**：エラー発生時に表示（`"use client"` 必須）
- **`not-found.tsx`**：404、`notFound()` でも発火
- **`global-error.tsx`**：ルートレイアウトのエラー用
- 細かく制御したいときは手動で **`<Suspense>`** や `try/catch` を使う

次は高度なルーティング → [[05並列ルートとインターセプト]]
