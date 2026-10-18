# revalidate とタグ（キャッシュの再検証）

データが**いつ古くなるか／いつ更新するか**をコントロールするのが「再検証（revalidate）」です。
時間ベース（一定間隔で更新）と、タグ／パスベース（特定の変更に応じて更新）の 2 通りがあります。

---

## 1. 用語の整理

| 用語 | 意味 |
|------|------|
| **revalidate（再検証）** | キャッシュされた内容を「もう古いから再生成しろ」と指示すること |
| **時間ベース** | 「○○ 秒経ったら次のアクセス時に更新」 |
| **タグベース** | 「`'posts'` というタグが付いた全キャッシュを今すぐ更新」 |
| **パスベース** | 「`/blog/hello` のキャッシュを今すぐ更新」 |
| **ISR**（Incremental Static Regeneration） | 上記の仕組みで、**静的ページを部分的・段階的に更新**する手法 |

---

## 2. 時間ベースの再検証

### `fetch` 単位

```ts
const res = await fetch("https://api.example.com/posts", {
  next: { revalidate: 60 }, // 60 秒
});
```

挙動：
1. 1 回目アクセス：取得して**キャッシュ**に保存
2. 60 秒以内のアクセス：**キャッシュ**から返す（速い）
3. 60 秒経過後の最初のアクセス：**古いキャッシュをまず返しつつ、裏で再取得して更新**（stale-while-revalidate）
4. その次以降：新しいキャッシュを返す

### ファイル単位（Page / Layout）

```tsx
// app/blog/page.tsx
export const revalidate = 60; // このページのデフォルト
```

### `0` の意味

```ts
fetch(url, { next: { revalidate: 0 } });
// または
export const revalidate = 0;
```

**毎回再生成**＝動的レンダリング（cache: 'no-store' と同じ）。

---

## 3. タグベースの再検証

時間で待たず、**「データが変わったタイミング」で即更新**したい場合に使います。

### A. `fetch` にタグを付ける

```ts
const res = await fetch("https://api.example.com/posts", {
  next: { tags: ["posts"] },
});
```

### B. データを更新する処理から `revalidateTag` を呼ぶ

```ts
// app/actions.ts
"use server";
import { revalidateTag } from "next/cache";

export async function createPost(formData: FormData) {
  // 1. DB に保存
  await db.posts.create({
    data: { title: formData.get("title") as string },
  });

  // 2. "posts" タグの付いたキャッシュを全て無効化
  revalidateTag("posts");
}
```

これで、`tags: ["posts"]` を付けて `fetch` していた**全ての場所**のキャッシュが一斉に無効化されます。

### 複数タグを付けられる

```ts
fetch(url, { next: { tags: ["posts", "post:123"] } });
```

「全記事の更新時」と「特定記事の更新時」を別々に管理できる、賢い使い方。

---

## 4. パスベースの再検証

特定の URL のキャッシュだけを無効化。

```ts
import { revalidatePath } from "next/cache";

revalidatePath("/blog");           // /blog のキャッシュを無効化
revalidatePath("/blog/[slug]", "page"); // /blog/[slug] にマッチする全ページ
revalidatePath("/", "layout");     // ルートレイアウト以下全部
```

`revalidatePath` はシンプルですが、**フォルダ単位で無効化**するので**範囲が広くなりがち**。
細かく制御したいときは `revalidateTag` の方が便利です。

---

## 5. オンデマンド再検証の典型パターン

### Server Action から再検証

```ts
// app/actions.ts
"use server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function deletePost(id: string) {
  await db.posts.delete({ where: { id } });
  revalidateTag("posts");
  // または revalidatePath("/blog");
}
```

### 外部 Webhook から再検証（CMS の更新通知など）

CMS（Contentful、microCMS 等）が記事を更新したときに、Webhook で Next.js に通知 → キャッシュ無効化。

```ts
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = await req.json();
  revalidateTag(body.tag); // body.tag に基づいて再検証
  return NextResponse.json({ revalidated: true });
}
```

---

## 6. 全体像：3 つのキャッシュ層

Next.js のキャッシュは何層にもなっています。

| 層 | 内容 | 制御方法 |
|----|------|----------|
| **Request Memoization** | 1 リクエスト中に同じ `fetch` を 1 回に | 自動 |
| **Data Cache** | `fetch` 結果のサーバー側キャッシュ | `cache` / `revalidate` / `tags` |
| **Full Route Cache** | レンダリング済み HTML のキャッシュ | `dynamic` / `revalidate` / 動的関数の使用 |
| **Router Cache** | ブラウザ側、遷移時のページキャッシュ | デフォルトで一定時間保持 |

普段は Data Cache と Full Route Cache を意識すれば十分。

---

## 7. ベストプラクティス

### 「タグ付け」は積極的に

`fetch` には**ほぼ全部**タグを付けておくと、後から無効化しやすくなります。

```ts
fetch(`/api/posts/${id}`, { next: { tags: [`post:${id}`, "posts"] } });
```

### `revalidate` は使い分け

| 用途 | 推奨 |
|------|------|
| 公開ブログ・ランディングページ | `revalidate: 3600`（1 時間など） |
| EC サイトの商品在庫 | `revalidateTag` で更新時即時無効化 |
| ユーザー個別データ | `cache: 'no-store'`（キャッシュしない） |
| 管理画面 | `dynamic: 'force-dynamic'` |

### 「絶対に新しいデータが必要」な場面

```ts
import { unstable_noStore as noStore } from "next/cache";

export default async function Page() {
  noStore(); // この関数を呼ぶと、このコンポーネント以下は動的になる
  const data = await fetch("/api/realtime").then(r => r.json());
  return ...;
}
```

---

## 8. つまずきポイント

### Q. `revalidateTag` を呼んだのに更新されない

→ そのタグを `fetch` 側で付けていますか？両方そろって初めて動きます。

### Q. `revalidate: 60` なのに 60 秒経っても古いまま

→ アクセスが無いと再生成されません。誰かがアクセスして初めてバックグラウンドで更新されます。

### Q. 開発中はキャッシュが邪魔

→ `next dev`（開発サーバー）では Data Cache は基本的に無効です。本番ビルドで初めて効きます。

### Q. 一部のページだけキャッシュ無効にしたい

→ そのページに `export const dynamic = "force-dynamic"` を書く。

### Q. CDN（Vercel）でもキャッシュされている？

→ はい。Vercel の Edge Network も再検証に対応しています。`revalidateTag` で連動します。

---

## まとめ

- **時間ベース**：`revalidate: N` で N 秒ごと
- **タグベース**：`tags: [...]` を付け、`revalidateTag` で一斉更新
- **パスベース**：`revalidatePath` で URL 単位の無効化
- ベストプラクティスは **fetch に必ずタグを付けておく** + **更新処理で `revalidateTag`**
- 開発時はキャッシュが効かないので、本番で動作確認を

次はフォーム送信の本命機能 → [[03Server-Actions（フォーム・ミューテーション）]]
