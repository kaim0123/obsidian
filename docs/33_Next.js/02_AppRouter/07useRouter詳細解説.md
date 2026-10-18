# useRouter（`next/navigation`）

App Router では、**クライアント側でプログラム的に遷移したい**ときに `next/navigation` の `useRouter` を使います。
`Link` で十分なケースが多い一方、フォーム送信後の遷移・条件付きリダイレクト・履歴操作などでは不可欠です。

---

## 1. 前提：`useRouter` は Client Component 専用

`useRouter` は React のフックなので、**Server Component では使えません**。先頭に `'use client'` が必要です。

```tsx
'use client';

import { useRouter } from 'next/navigation';

export function SubmitButton() {
  const router = useRouter();
  return <button type="button" onClick={() => router.push('/done')}>完了へ</button>;
}
```

サーバー側でリダイレクトしたい場合は、`redirect()`（Server Component / Route Handler / Server Action）を検討してください。

---

## 2. Pages Router の `next/router` との違い（重要）

| 観点 | Pages Router（`next/router`） | App Router（`next/navigation`） |
|------|-------------------------------|----------------------------------|
| インポート | `next/router` | `next/navigation` |
| 現在パス・クエリ | `router.pathname`、`router.query`、`router.asPath` などが使える | **これらは持たない** |
| ルート情報の取得 | `useRouter` に集約されがち | `usePathname`、`useSearchParams`、動的 `[id]` なら **`useParams`** に分割 |

App Router で「今どの URL か」「クエリは何か」を知りたいときは、次と組み合わせます。

- パスの文字列だけ → [`usePathname`](https://nextjs.org/docs/app/api-reference/functions/use-pathname)
- `?foo=bar` → [[10_パターンとつまづき/02クエリと検索パラメータ]]（`useSearchParams`）、または Server の `searchParams`
- `[slug]` などの動的値 → [[03動的セグメントとgenerateStaticParams]]（`useParams`）

Pages 時代との対応が必要なら → [[08_PagesRouter/01Pages-Routerのルーティング]]

---

## 3. メソッド一覧（App Router）

| メソッド | 役割 |
|----------|------|
| `push(href, options?)` | 指定 URL へ **遷移**（履歴に積む） |
| `replace(href, options?)` | 指定 URL へ **置き換え**（直前の履歴を残さない） |
| `back()` | ブラウザの「戻る」相当 |
| `forward()` | ブラウザの「進む」相当 |
| `refresh()` | 現在のルートを **サーバーから再取得**（Router Cache の再検証トリガとして動くこともある） |
| `prefetch(href)` | 該当ルートのコード・データを先読み |

`push` / `replace` の第 2 引数には、例として `scroll: false` を渡して **スクロール位置を維持**したり、レイアウトを保ったまま更新する UX を調整できます（公式ドキュメントの該当 API を参照）。

```tsx
router.push('/items/2', { scroll: false });
```

---

## 4. `href` の書き方

App Router の `push` / `replace` は、基本的に **`string` のパス**を渡します。動的セグメントは **実際の値を埋めた URL** で問題ありません。

```tsx
router.push(`/posts/${slug}`);
router.replace(`/login?from=${encodeURIComponent(pathname)}`);
```

クエリを組み立てるときは `URLSearchParams` を挟むと安全です。

```tsx
const sp = new URLSearchParams({ q: keyword, page: String(page) });
router.push(`/search?${sp.toString()}`);
```

---

## 5. `refresh()` を使う場面のイメージ

`refresh()` は「**現在のページのサーバー由来の結果を撮り直す**」ニュアンスです。例として次のようなときに検討します。

- Client からミューテーションしたあと、**同じページ上のサーバーフェッチ済みコンテンツ**を更新したい
- 細かく state を持たず、**サーバーが真実**の一覧・詳細に揃いたい

「別 URL へ行きたい」場合は `push` / `replace` が主役です。「データだけ更新したい」なら楽観的 UI、ミューテーション後のキャッシュ無効化（`revalidatePath` / `revalidateTag` 等）ともセットで検討してください（[[04_データ取得とキャッシュ/02revalidateとタグ]] など）。

---

## 6. `prefetch` と `Link`

`<Link prefetch={...} />` と同系の「先読み」です。ホバーで読み込みたい・カスタムボタンから先読みしたい、といったときに使います。通常の画面遷移は **`Link` で十分**なことが多いです。

---

## 7. よくあるつまずき

### 7.1 `router.pathname` や `router.query` がない

App Router の `useRouter` には **存在しません**。`usePathname` / `useSearchParams` / `useParams` に役割が分かれています。

### 7.2 Server Component でフックを呼ぶ

```tsx
// NG: 'use client' がない
import { useRouter } from 'next/navigation';
```

遷移ロジックだけクライアントに切り出す（小さな子コンポーネントに `'use client'`）のが定石です。

### 7.3 ミドルウェアや `redirect` と二重にリダイレクトしていないか

認証ガードは Middleware やサーバーの `redirect` でまとめると、クライアントの `useEffect` + `router.replace` より **フラッシュやちらつきが減る**ことがあります。[[06Middleware]]、[[05_バックエンド統合/02認証とセッションのパターン]] を参照してください。

---

## 8. 関連ノートと公式

| テーマ | ノート・リンク |
|--------|----------------|
| URL と `app` の対応 | [[01ファイル規約とURL]] |
| `[id]` と `generateStaticParams` | [[03動的セグメントとgenerateStaticParams]] |
| クエリ (`useSearchParams`) | [[10_パターンとつまづき/02クエリと検索パラメータ]] |
| Pages の `useRouter` | [[08_PagesRouter/01Pages-Routerのルーティング]] |
| App Router における関数 API | [useRouter (`next/navigation`)](https://nextjs.org/docs/app/api-reference/functions/use-router) |

Pages 時代と App Router を横断した長めの説明が必要なら、直下の旧ノート [[14-useRouter詳細解説]] を併読してください。
