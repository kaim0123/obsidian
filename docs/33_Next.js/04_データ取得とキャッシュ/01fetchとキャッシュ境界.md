# fetch とキャッシュ境界

App Router でのデータ取得は、**「取得方法」より「キャッシュをどう扱うか」**が肝です。
Next.js は `fetch` を**拡張**していて、HTTP 標準にはない「キャッシュ・再検証」機能を組み込んでいます。

---

## 1. 基本：Server Component で `fetch` を使う

App Router の Server Component は **async 関数で書ける**ため、`await fetch` を直接使えます。

```tsx
// app/posts/page.tsx
export default async function Posts() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return (
    <ul>
      {posts.map((p: any) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

これだけです。`useEffect` も `useState` もいりません。

---

## 2. Next.js の `fetch` は「キャッシュを内蔵」している

普通のブラウザ `fetch` と違い、Next.js の `fetch` は **取得結果をサーバー側でキャッシュ**します。

### 2 つのキャッシュ

| キャッシュ | スコープ | 例 |
|-----------|---------|-----|
| **Request Memoization** | 1 リクエスト中のみ | 同じ URL を 2 回 fetch しても 1 回しか走らない |
| **Data Cache**（旧 fetch cache） | リクエスト跨ぎ | ビルド時の値が次のアクセスでも使い回される |

### Request Memoization の例

```ts
// 同じリクエスト内
const a = await fetch("https://api.example.com/user");
const b = await fetch("https://api.example.com/user"); // ネットワーク呼ばない
```

これにより、Layout と Page の両方で同じ API を呼んでも安全。

---

## 3. キャッシュの ON/OFF を制御する

### `cache` オプション

```ts
// 永続キャッシュ（デフォルト＝Next 14 までは force-cache、15+ は明示推奨）
fetch(url, { cache: "force-cache" });

// キャッシュしない（毎回フェッチ）
fetch(url, { cache: "no-store" });
```

### 時間ベースの再検証

```ts
fetch(url, { next: { revalidate: 60 } }); // 60 秒経ったら次のアクセス時に更新
```

### タグベースの再検証

```ts
fetch(url, { next: { tags: ["posts"] } });
```

詳細は [[02revalidateとタグ]] へ。

---

## 4. Next.js 16 で何が変わった？

Next.js 16 では、**`fetch` のデフォルトが「キャッシュしない」**に変わりました（13/14 系の `force-cache` から方針転換）。

理由は「**気づかないうちにキャッシュされて、データが更新されない**」というハマりどころが多かったため。

### 推奨：`use cache` ディレクティブ

Next.js 16+ では、新しい `"use cache"` ディレクティブが導入されています。

```tsx
"use cache";

export default async function Posts() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return <ul>...</ul>;
}
```

これで **このコンポーネント全体がキャッシュ対象**になります。`fetch` 単位ではなく**コンポーネント単位**でキャッシュをコントロールできるのが特徴。

---

## 5. Server Component の「動的」と「静的」

Next.js は Server Component を、**動的（毎回サーバーで実行）**か**静的（ビルド時 or 初回アクセス時に生成し、以後使い回し）**かに自動で判別します。

### 静的になる条件（Static）

- `cookies()` / `headers()` を使っていない
- `searchParams` を使っていない
- すべての `fetch` がキャッシュ可能

### 動的になる条件（Dynamic）

- `cookies()` / `headers()` を使っている
- `searchParams` を引数で受けている
- `noStore()` または `cache: 'no-store'` を呼んでいる

これを **「キャッシュ境界」** と呼びます。境界を意識すると、どこが速くてどこが遅いか把握できます。

### 明示的に動作を強制

```tsx
// app/some/page.tsx
export const dynamic = "force-dynamic";  // 必ず毎回サーバー実行
// or
export const dynamic = "force-static";   // 必ず静的
```

---

## 6. `fetch` 以外のデータ取得

### DB（Prisma など）

```tsx
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const posts = await prisma.post.findMany();
  return <ul>...</ul>;
}
```

DB 呼び出しはデフォルトでキャッシュ**されない**ので、必要なら手動で `unstable_cache`（Next 14） や `"use cache"`（Next 16+）でラップします。

```tsx
import { unstable_cache } from "next/cache";

const getCachedPosts = unstable_cache(
  async () => prisma.post.findMany(),
  ["posts"],
  { revalidate: 60, tags: ["posts"] }
);
```

---

## 7. ストリーミング：`<Suspense>` と組み合わせる

「重いデータ取得は後回し、軽い部分は先に表示」を実現できます。

```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <>
      <h1>ダッシュボード</h1>
      <Suspense fallback={<p>注文を取得中...</p>}>
        <Orders />
      </Suspense>
      <Suspense fallback={<p>通知を取得中...</p>}>
        <Notifications />
      </Suspense>
    </>
  );
}

async function Orders() {
  const data = await fetch("/api/orders").then(r => r.json());
  return <ul>...</ul>;
}

async function Notifications() {
  const data = await fetch("/api/notifications").then(r => r.json());
  return <ul>...</ul>;
}
```

これにより、**ヘッダー** → **注文（先に届いた方）** → **通知**、という順で部分的に画面が描画されます。
ユーザーは「真っ白の待ち時間」を感じません。

---

## 8. PPR（Partial Prerendering）

Next.js 15+ で安定した機能。**1 ページ内で「静的部分」と「動的部分」を混在**できます。

```tsx
export const experimental_ppr = true; // ファイル単位で有効化（v15）

export default function Page() {
  return (
    <>
      <StaticHeader /> {/* ビルド時に生成 */}
      <Suspense fallback={<Skeleton />}>
        <DynamicCart /> {/* リクエスト時に生成 */}
      </Suspense>
    </>
  );
}
```

メリット：
- 静的部分は CDN から即返せる
- 動的部分はストリーミングで遅れて届く
- 「速い + 最新」を両立

---

## 9. 同時並行で取得：`Promise.all`

複数の `fetch` を同時に走らせると、合計時間が短縮されます。

```tsx
export default async function Page() {
  const [posts, users] = await Promise.all([
    fetch("/api/posts").then(r => r.json()),
    fetch("/api/users").then(r => r.json()),
  ]);
  return <>...</>;
}
```

逐次（`await` を順に書く）だと **A 完了 → B 開始**になるので、並列の方が速いです。

---

## 10. つまずきポイント

### Q. キャッシュが効きすぎてデータが古いまま

→ 該当 `fetch` に `cache: 'no-store'` か `revalidate: 60` を付ける。

### Q. キャッシュが効かないので毎回遅い

→ Next.js 16 はデフォルトで no-store。`"use cache"` か `cache: 'force-cache'` を明示。

### Q. Client Component で `fetch` してもキャッシュされない

→ Next の `fetch` 拡張は **Server Component** のみ。Client では普通の `fetch`（ブラウザ標準）になります。

### Q. 環境変数を `fetch` のヘッダに使ったら動作しない

→ サーバー側変数（`NEXT_PUBLIC_` なし）が必要。クライアントには露出しません。

### Q. ローディングが表示されない

→ サーバーで一気に await すると瞬時に終わる場合は出ません。`<Suspense>` + 重いコンポーネントの分割を検討。

---

## まとめ

- Server Component で **`await fetch`** を直接使える
- Next.js の `fetch` は **キャッシュ機能内蔵**（メモ化 + データキャッシュ）
- バージョンでデフォルト挙動が違う：**14 まで `force-cache`、16 から `no-store`**
- キャッシュ制御：`cache`、`next.revalidate`、`next.tags`、または `"use cache"`
- 並列取得（`Promise.all`）と Streaming（`<Suspense>`）で体感速度を高められる

次は再検証の仕組み → [[02revalidateとタグ]]
