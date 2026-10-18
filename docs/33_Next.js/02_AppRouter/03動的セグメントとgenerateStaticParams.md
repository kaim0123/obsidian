# 動的セグメントと generateStaticParams

URL の一部に **変数（記事 ID やスラッグ）を含めたい**ときに使うのが「動的セグメント」です。
さらに、その変数で作られるページを **ビルド時に静的に生成しておきたい**場合は `generateStaticParams` を使います。

---

## 1. 動的セグメントの基本

フォルダ名を `[ ]`（角括弧）で囲むと、その階層は変数になります。

```text
app/
└── blog/
    └── [slug]/
        └── page.tsx
```

- `/blog/hello` → `slug = "hello"`
- `/blog/abc-123` → `slug = "abc-123"`

```tsx
// app/blog/[slug]/page.tsx
export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <h1>記事スラッグ: {slug}</h1>;
}
```

> **重要**：Next.js 15 以降、`params` は **Promise になりました**。必ず `await` してください。

---

## 2. 複数の動的セグメント

階層を重ねて複数の変数を持てます。

```text
app/
└── shop/
    └── [category]/
        └── [productId]/
            └── page.tsx
```

- `/shop/shoes/123` → `{ category: "shoes", productId: "123" }`

```tsx
export default async function Product({
  params,
}: {
  params: Promise<{ category: string; productId: string }>;
}) {
  const { category, productId } = await params;
  return <p>カテゴリ: {category} / 商品 ID: {productId}</p>;
}
```

---

## 3. キャッチオールセグメント `[...slug]`

任意の階層数をまとめて受けます。

```text
app/
└── docs/
    └── [...slug]/
        └── page.tsx
```

- `/docs/a` → `slug = ["a"]`
- `/docs/a/b/c` → `slug = ["a", "b", "c"]`

```tsx
export default async function Docs({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <p>パス: {slug.join("/")}</p>;
}
```

ドキュメントサイトや、ヘッドレス CMS で構造が可変なときに便利です。

---

## 4. オプショナルキャッチオール `[[...slug]]`

二重括弧にすると、**スラッグなしの URL でも一致**します。

```text
app/
└── docs/
    └── [[...slug]]/
        └── page.tsx
```

- `/docs` → `slug = undefined`
- `/docs/a` → `slug = ["a"]`
- `/docs/a/b` → `slug = ["a", "b"]`

ドキュメントのトップページも同じファイルで処理したいときに使います。

---

## 5. クエリ文字列（`?key=value`）の取得

クエリ文字列は **`searchParams`** で受け取ります。これも Promise です。

```tsx
// /blog?page=2 のとき
export default async function BlogList({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNum = Number(page ?? 1);
  return <p>ページ: {pageNum}</p>;
}
```

> ⚠ クエリ文字列を持つ Server Component は **動的レンダリング**になります（毎回サーバーで実行）。詳しくは後述。

---

## 6. ビルド時に静的生成する：`generateStaticParams`

ブログのように **記事の一覧が決まっている** 場合、各 URL を**ビルド時に HTML にしておく**ことで超高速にできます。

```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  // ここで「全記事のスラッグ一覧」を返す
  const posts = await fetch("https://api.example.com/posts").then(r => r.json());
  return posts.map((post: { slug: string }) => ({ slug: post.slug }));
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json());
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </article>
  );
}
```

### 何が起こる？

- `next build` 時に `generateStaticParams` が実行される
- 返した配列の数だけ HTML が生成される（例：100 記事なら 100 ページ）
- アクセス時はその HTML を返すだけなので**爆速**

### 動的に増える記事はどうする？

`dynamicParams`（デフォルト `true`）を残すと、**`generateStaticParams` で返さなかった URL でもアクセス時に生成**されます（ISR：Incremental Static Regeneration）。

```tsx
// 一覧で返さなかった URL は 404 にしたい場合
export const dynamicParams = false;
```

---

## 7. レンダリング戦略のまとめ

| パターン | 挙動 | 用途 |
|----------|------|------|
| `generateStaticParams` あり | ビルド時に生成 | 記事数が固定 or 多すぎない場合 |
| `generateStaticParams` あり + `dynamicParams: true`（デフォルト） | ビルド時 + 初アクセス時に生成 | 数が増え続けるブログ |
| `generateStaticParams` なし | アクセスのたびに生成 | ユーザー固有・頻繁に変化 |

---

## 8. 静的か動的かを明示する

ファイル単位で動作を強制できます。

```tsx
// 必ず動的（毎リクエストでサーバー実行）
export const dynamic = "force-dynamic";

// 必ず静的（ビルド時に生成）
export const dynamic = "force-static";

// 1 時間ごとに再生成
export const revalidate = 3600;
```

詳しくは [[02revalidateとタグ]] で扱います。

---

## 9. つまずきポイント

### Q. `params.slug` で `undefined` になる

→ `await params` していますか？Next.js 15 以降は必須です。

### Q. ビルドはできたのに、`generateStaticParams` で返してない URL が 404 にならない

→ `dynamicParams = false` を明示すると 404 になります。

### Q. `generateStaticParams` が遅すぎてビルドが終わらない

→ 全件生成しないで、人気記事だけ静的生成 + 残りは ISR にする手があります。

### Q. クライアントから動的ルートのパラメータを取りたい

→ Client Component では `useParams()` フックを使います。

```tsx
"use client";
import { useParams } from "next/navigation";

export default function Comp() {
  const { slug } = useParams<{ slug: string }>();
  return <p>{slug}</p>;
}
```

---

## まとめ

- **`[slug]`** で動的セグメント、**`[...slug]`** で複数階層、**`[[...slug]]`** でオプショナル
- `params` は **Promise**、`await` 必須
- 一覧が決まっているなら **`generateStaticParams`** で静的生成して高速化
- 動的か静的かは `dynamic` / `revalidate` で制御できる

次は loading・error・not-found の便利な仕組み → [[04loading-error-not-found]]
