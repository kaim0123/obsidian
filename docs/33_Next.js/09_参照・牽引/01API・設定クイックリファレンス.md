# API・設定クイックリファレンス

「あれ、どう書くんだっけ？」を 1 秒で見つけるための早見表です。
本格的な解説は各章を、これは**コピペで動く形のスニペット集**として活用してください。

---

## 1. ファイル規約（App Router）

```text
app/
├── layout.tsx              共通ラッパー（必須）
├── page.tsx                URL の中身
├── loading.tsx             ローディング
├── error.tsx               エラー（'use client' 必須）
├── not-found.tsx           404
├── global-error.tsx        ルートレイアウトの致命的エラー
├── template.tsx            毎回再生成のラッパー
├── route.ts                API エンドポイント
├── default.tsx             並列ルートのフォールバック
├── opengraph-image.tsx     OG 画像（動的生成）
├── icon.tsx / favicon.ico  アイコン
├── robots.ts               robots.txt
├── sitemap.ts              sitemap.xml
└── middleware.ts           ルート直下に配置
```

---

## 2. ルーティング記法

| 記法 | 意味 |
|------|------|
| `[slug]` | 動的セグメント |
| `[...slug]` | キャッチオール |
| `[[...slug]]` | オプショナルキャッチオール |
| `(group)` | URL に出ないルートグループ |
| `_private` | URL に出ないプライベートフォルダ |
| `@slot` | 並列ルート |
| `(.)foo` | 同じ階層をインターセプト |
| `(..)foo` | 1 つ上の階層をインターセプト |
| `(...)foo` | ルートからインターセプト |

---

## 3. ナビゲーション

```ts
// Server Component から
import { redirect, notFound } from "next/navigation";
redirect("/login");
notFound();

// Client Component から
"use client";
import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
const router = useRouter();
router.push("/about");
router.replace("/login");
router.back();
router.refresh();           // 現在のページを再取得

const pathname = usePathname();           // "/about"
const params = useParams();               // { slug: "..." }
const search = useSearchParams();
search.get("q");
```

```tsx
import Link from "next/link";
<Link href="/about">About</Link>
<Link href={{ pathname: "/blog", query: { page: 2 } }}>...</Link>
<Link href="/" prefetch={false}>...</Link>
```

---

## 4. データ取得（Server Components）

```tsx
// 基本
const data = await fetch(url).then(r => r.json());

// キャッシュなし（毎回取得）
fetch(url, { cache: "no-store" });

// 静的キャッシュ
fetch(url, { cache: "force-cache" });

// 60 秒で再検証
fetch(url, { next: { revalidate: 60 } });

// タグ付け
fetch(url, { next: { tags: ["posts"] } });

// 動的を強制
export const dynamic = "force-dynamic";
// 静的を強制
export const dynamic = "force-static";
// ファイル単位の再検証
export const revalidate = 60;
```

---

## 5. キャッシュ無効化

```ts
import { revalidatePath, revalidateTag } from "next/cache";

revalidatePath("/blog");                  // パス
revalidatePath("/blog/[slug]", "page");   // 動的全ページ
revalidatePath("/", "layout");            // レイアウト以下全部

revalidateTag("posts");                   // タグ
```

---

## 6. Server Actions

```tsx
// app/actions.ts
"use server";

export async function createPost(formData: FormData) {
  const title = formData.get("title") as string;
  await db.posts.create({ data: { title } });
  revalidateTag("posts");
}

// フォーム
<form action={createPost}>
  <input name="title" />
  <button>送信</button>
</form>

// クライアントから
"use client";
import { createPost } from "@/app/actions";
<button onClick={() => createPost(formData)}>...</button>
```

```tsx
// 状態管理
"use client";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "送信中" : "送信"}</button>;
}

const [state, action] = useActionState(myAction, initialState);
```

---

## 7. メタデータ

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Title | My Site",
  description: "...",
  openGraph: {
    title: "...",
    images: [{ url: "...", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "https://example.com/..." },
};

// 動的
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: "..." };
}

// 全体（layout）
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: { default: "My Site", template: "%s | My Site" },
};

// viewport は別 export
export const viewport = {
  width: "device-width",
  initialScale: 1,
};
```

---

## 8. Route Handlers

```ts
// app/api/foo/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  return NextResponse.json({ q });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ ok: true }, { status: 201 });
}

// 動的セグメント
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ id });
}
```

---

## 9. クッキー / ヘッダ

```ts
import { cookies, headers } from "next/headers";

// 読み取り
const c = await cookies();
const token = c.get("session")?.value;

const h = await headers();
const ua = h.get("user-agent");

// 書き込み（Server Action / Route Handler 内）
c.set("session", "xxx", {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});

c.delete("session");
```

---

## 10. Middleware

```ts
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (!request.cookies.get("session")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
```

---

## 11. Image / Font / Script

```tsx
import Image from "next/image";
import logo from "@/public/logo.png";

<Image src={logo} alt="" />
<Image src="/foo.jpg" alt="" width={800} height={600} priority />
<Image src="https://..." alt="" fill sizes="100vw" />
```

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
<html className={inter.className}>
```

```tsx
import Script from "next/script";
<Script src="..." strategy="lazyOnload" />
```

---

## 12. `next.config.ts` 主要設定

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  // 出力モード
  output: "standalone",   // Docker 用
  // output: "export",    // 静的サイト

  // 画像
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "example.com" },
    ],
  },

  // 環境変数（クライアント公開）
  env: {
    APP_VERSION: "1.0.0",
  },

  // リダイレクト / リライト
  async redirects() {
    return [
      { source: "/old", destination: "/new", permanent: true },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/proxy/:path*", destination: "https://api.example.com/:path*" },
    ];
  },

  // ヘッダ
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },

  // 実験的機能
  experimental: {
    // ppr: true,
    // useCache: true,
  },
};

export default config;
```

---

## 13. TypeScript 型のチート

```ts
// Server Component の props
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string }>;
};

// Layout
type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

// 並列ルート
type LayoutProps = {
  children: React.ReactNode;
  modal: React.ReactNode;
};

// generateStaticParams
export async function generateStaticParams() {
  return [{ slug: "a" }, { slug: "b" }];
}

// generateMetadata
import type { Metadata, ResolvingMetadata } from "next";
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  return { title: "..." };
}
```

---

## 14. よく使うフック（Client Component）

```tsx
"use client";

// React 標準
useState, useEffect, useRef, useMemo, useCallback, useTransition,
useDeferredValue, useId, useReducer, useContext, useSyncExternalStore

// React 19+
useActionState, useOptimistic, useFormStatus

// Next.js
useRouter, usePathname, useSearchParams, useParams, useSelectedLayoutSegment(s)
```

---

## 15. 環境変数

```bash
# .env.local
DATABASE_URL=...                  # サーバー専用
OPENAI_API_KEY=...                # サーバー専用
NEXT_PUBLIC_SITE_URL=https://...  # クライアントでも読める
```

```ts
process.env.DATABASE_URL          // サーバーのみ
process.env.NEXT_PUBLIC_SITE_URL  // どこでも
```

---

## 16. デプロイ前の最終チェック

- [ ] `npm run build` が通る
- [ ] `npx tsc --noEmit` が通る
- [ ] `npm run lint` が通る
- [ ] 環境変数が本番用に設定されている
- [ ] `metadata` で title / description / OG 設定済み
- [ ] `not-found.tsx` / `error.tsx` がある
- [ ] Sentry / Vercel Analytics 設定済み
- [ ] favicon、manifest あり
- [ ] `robots.ts` / `sitemap.ts` あり（SEO 対象）

---

次は CLI と環境変数の一覧 → [[02よく使うCLIと環境変数一覧]]
