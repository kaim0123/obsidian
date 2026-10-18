# App Router への移行メモ

既存の Pages Router プロジェクトを App Router に移すときの**実践ガイド**です。
一気に全部やる必要はなく、**並行運用しながら少しずつ**移すのが現実的。

---

## 1. 大方針：段階的に移行

App Router と Pages Router は **同じプロジェクトに共存**できます。

```text
my-app/
├── pages/         ← 既存（残す）
│   ├── _app.tsx
│   ├── index.tsx
│   └── ...
└── app/           ← 新規追加
    ├── layout.tsx
    └── new-page/
        └── page.tsx
```

優先順位：**`app/` のルートが優先**されます。同じ URL があった場合は app 側が勝ち。

### 推奨ステップ

1. `app/layout.tsx` を最低限で作る
2. **新規ページ**は `app/` で書く
3. 既存ページを **重要度の低い順**に `app/` へ書き換える
4. 全部移ったら `pages/` を削除

---

## 2. 最初に作るもの：`app/layout.tsx`

```tsx
// app/layout.tsx
import "../styles/globals.css";

export const metadata = {
  title: "My App",
  description: "...",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
```

これで、`app/` に置いたページは自動的にこのレイアウトに包まれます。

---

## 3. ファイル名の対応表

| Pages Router | App Router |
|-------------|------------|
| `pages/index.tsx` | `app/page.tsx` |
| `pages/about.tsx` | `app/about/page.tsx` |
| `pages/blog/[slug].tsx` | `app/blog/[slug]/page.tsx` |
| `pages/_app.tsx` | `app/layout.tsx` |
| `pages/_document.tsx` | `app/layout.tsx`（`<html>` を含む） |
| `pages/_error.tsx` | `app/error.tsx` |
| `pages/404.tsx` | `app/not-found.tsx` |
| `pages/500.tsx` | `app/global-error.tsx` |
| `pages/api/hello.ts` | `app/api/hello/route.ts` |

---

## 4. 関数の対応

| Pages Router | App Router |
|-------------|------------|
| `getStaticProps` | Server Component で `await fetch`（自動キャッシュ） |
| `getStaticPaths` | `generateStaticParams` |
| `getServerSideProps` | Server Component で `await fetch` + `cache: 'no-store'` または `cookies()` 使用 |
| `useRouter`（`next/router`） | `useRouter`（`next/navigation`） |
| `router.query.slug` | `useParams()` または `searchParams` |
| `next/head` の `<Head>` | `metadata` export |

### `useRouter` の API 変更

```ts
// Pages
import { useRouter } from "next/router";
router.push("/about?q=1");
router.query.slug;
router.pathname;

// App
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
const router = useRouter();
router.push("/about?q=1");
const params = useParams();   // { slug: "..." }
const search = useSearchParams(); // .get("q")
const path = usePathname();   // "/about"
```

---

## 5. 移行例：シンプルなページ

### Before（Pages Router）

```tsx
// pages/blog/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await fetch("...").then(r => r.json());
  return {
    paths: posts.map((p: any) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await fetch(`.../${params!.slug}`).then(r => r.json());
  return { props: { post }, revalidate: 60 };
};

export default function BlogPost({ post }: any) {
  return (
    <>
      <Head>
        <title>{post.title}</title>
      </Head>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </>
  );
}
```

### After（App Router）

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await fetch("...").then(r => r.json());
  return posts.map((p: any) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(`.../${slug}`).then(r => r.json());
  return { title: post.title };
}

export default async function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await fetch(`.../${slug}`, { next: { revalidate: 60 } }).then(r => r.json());
  return (
    <>
      <h1>{post.title}</h1>
      <p>{post.body}</p>
    </>
  );
}
```

ポイント：
- `getStaticPaths` → `generateStaticParams`
- `getStaticProps` → コンポーネント内に直接 `await fetch`
- `<Head>` → `generateMetadata`
- `params` は **Promise** になっている（v15+）

---

## 6. データ取得の置き換え方針

### A. SSG（`getStaticProps` + `revalidate`）

```tsx
// Before
export const getStaticProps = async () => {
  const data = await fetch(url).then(r => r.json());
  return { props: { data }, revalidate: 60 };
};

// After（Server Component）
export default async function Page() {
  const data = await fetch(url, { next: { revalidate: 60 } }).then(r => r.json());
  return <Comp data={data} />;
}
```

### B. SSR（`getServerSideProps`）

```tsx
// Before
export const getServerSideProps = async ({ req }) => {
  const session = getSession(req);
  return { props: { session } };
};

// After
export default async function Page() {
  const session = await getSession(); // cookies() を使うので動的になる
  return <Comp session={session} />;
}
```

### C. クライアントフェッチ

`useEffect` + `fetch` のままでも OK ですが、**`'use client'` を付ける**のを忘れずに。

---

## 7. レイアウトの移行

### Before：`_app.tsx`

```tsx
// pages/_app.tsx
import "../styles/globals.css";
import { ThemeProvider } from "../theme";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </ThemeProvider>
  );
}
```

### After：`app/layout.tsx`

```tsx
// app/providers.tsx
"use client";
export function ThemeProvider({ children }: any) { /* ... */ }

// app/layout.tsx
import "../styles/globals.css";
import { ThemeProvider } from "./providers";

export default function RootLayout({ children }: any) {
  return (
    <html lang="ja">
      <body>
        <ThemeProvider>
          <Header />
          {children}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

ポイント：Provider は **`'use client'`** で別ファイルに切り出して、Layout は Server Component のままに。

---

## 8. API Routes の移行

### Before

```ts
// pages/api/posts/[id].ts
export default function handler(req, res) {
  if (req.method === "GET") {
    res.json({ id: req.query.id });
  }
}
```

### After

```ts
// app/api/posts/[id]/route.ts
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return Response.json({ id });
}
```

---

## 9. 移行中の注意

### A. 依存ライブラリの App Router 対応を確認

特に **CSS-in-JS**（styled-components など）、**状態管理ライブラリ**は App Router で動かすのに追加設定が必要なことがあります。

### B. `'use client'` を入れる場所

「とりあえず全部 `'use client'`」でも動きますが、それでは App Router の旨みが消えます。
**葉っぱから少しずつ Server Component 化**する戦略が現実的。

### C. ハイドレーションエラーに注意

サーバーとクライアントで描画結果が違うとエラーになります。`Date.now()`、`Math.random()`、`localStorage` 依存などは要注意。

### D. Cookies / Headers の API 変更

```ts
// Before
const cookie = req.cookies.token;

// After
import { cookies } from "next/headers";
const cookie = (await cookies()).get("token")?.value;
```

`cookies()` / `headers()` は Server 専用、`await` 必須（v15+）。

---

## 10. 移行の優先順位

| 順序 | 移すページ | 理由 |
|------|-----------|------|
| 1 | **新規ページ** | App Router で書き始める |
| 2 | **静的ページ**（About, Privacy 等） | 影響少、慣れに最適 |
| 3 | **公開ブログ** | SEO の恩恵大 |
| 4 | **認証ありの管理画面** | クッキー周りの違いを慎重に |
| 5 | **複雑なフォーム / Wizard** | テストしながら丁寧に |

---

## 11. つまずきポイント

### Q. `_app.tsx` を消したら全ページが壊れた

→ `_app.tsx` は Pages Router 全ページに必要。`pages/` を完全に消した後でないと削除しないこと。

### Q. App Router の `useRouter` を pages 側で使ったらエラー

→ pages では `next/router`、app では `next/navigation`。混同しない。

### Q. `getServerSideProps` 内で使ってた req オブジェクトを app 側で使いたい

→ `cookies()` / `headers()` で代替。または Middleware で `request.headers` を加工して後段に渡す。

### Q. SWR / TanStack Query は使い続けられる？

→ 使えます。ただし、初期データは Server Component で取得して props で渡せば「待ち時間ゼロ」にできるのが App Router の旨み。

### Q. 全部移行するのにどれくらいかかる？

→ ページ数による。**「重要 + 静的」から少しずつ**、合間に新規ページは App で。半年〜1 年単位を見込んで。

---

## まとめ

- Pages Router と App Router は **共存できる**ので段階移行が現実的
- 関数名（`getServerSideProps` など）は廃止、**Server Component の `await fetch`** に集約
- `params` は **Promise**、`cookies()` / `headers()` も **async**
- Provider は `'use client'`、Layout は Server のままが理想形
- 新規ページから始めて、影響の小さい順に移すのが安全

これで Pages Router の章は完了 → 早見表は [[01API・設定クイックリファレンス]] へ
