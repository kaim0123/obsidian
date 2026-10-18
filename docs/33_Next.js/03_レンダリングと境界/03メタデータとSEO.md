# メタデータと SEO

検索エンジン（Google など）や SNS シェアで**見栄えよく表示される**には、HTML の `<head>` 要素を適切に設定する必要があります。
App Router では **`metadata` を export するだけ**でほぼすべて完結します。

---

## 1. SEO に効く要素を整理

| 要素 | 役割 |
|------|------|
| `<title>` | ブラウザタブ・検索結果のタイトル |
| `<meta name="description">` | 検索結果の説明文 |
| `<meta property="og:*">` | OGP（SNS シェア時のサムネイル・タイトル） |
| `<meta name="twitter:*">` | X（Twitter）でのカード設定 |
| `<link rel="canonical">` | 重複ページの正規 URL を伝える |
| `robots`、`sitemap.xml`、`robots.txt` | クローラーへの指示 |
| 構造化データ（JSON-LD） | 検索結果のリッチスニペット |

App Router はこれらを **TS/JS のオブジェクトとして書く**だけで、自動的に `<head>` に挿入してくれます。

---

## 2. `metadata` を export

`layout.tsx` または `page.tsx` で `metadata` を export します。

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | My Site",
  description: "私たちについて",
};

export default function AboutPage() {
  return <h1>About</h1>;
}
```

これだけで `<head>` に `<title>` と `<meta name="description">` が入ります。

### Layout で設定すると配下に継承

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "My Site",
    template: "%s | My Site", // 子ページの title を「○○ | My Site」にしてくれる
  },
  description: "デフォルトの説明",
};
```

子ページで上書き：

```tsx
// app/about/page.tsx
export const metadata: Metadata = {
  title: "About", // → "About | My Site" になる
};
```

---

## 3. `generateMetadata`：動的にメタデータを生成

ブログ記事など、**URL パラメータに応じてタイトルを変えたい**場合は関数で書きます。

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetch(`https://api.example.com/posts/${slug}`).then(r => r.json());
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // ...
}
```

`fetch` は **page 側と自動的に重複排除**されるので、データ取得が 2 回走ることはありません。

---

## 4. OGP / Twitter Card

SNS シェア時のサムネイルやタイトルは `openGraph` と `twitter` で設定します。

```ts
export const metadata: Metadata = {
  title: "記事タイトル",
  description: "記事の概要",
  openGraph: {
    title: "記事タイトル",
    description: "記事の概要",
    url: "https://example.com/blog/hello",
    siteName: "My Site",
    images: [
      {
        url: "https://example.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "...",
      },
    ],
    locale: "ja_JP",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "記事タイトル",
    description: "記事の概要",
    images: ["https://example.com/og-image.png"],
    creator: "@your_account",
  },
};
```

OGP 画像のサイズは **1200×630px** が定番。

---

## 5. 動的 OG 画像（`opengraph-image`）

App Router では、**コードで画像を生成**することもできます。

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(r => r.json());
  return new ImageResponse(
    (
      <div style={{ fontSize: 64, color: "white", background: "black", display: "flex", padding: 40 }}>
        {post.title}
      </div>
    ),
    size
  );
}
```

これで記事ごとに OG 画像が自動生成されます。

---

## 6. canonical URL

同じ内容に複数の URL があるとき、「**正規はこれ**」と検索エンジンに伝えます。

```ts
export const metadata: Metadata = {
  alternates: {
    canonical: "https://example.com/blog/hello",
  },
};
```

---

## 7. `robots.txt` と `sitemap.xml`

App Router では特別なファイル名で出力できます。

### `robots.ts`

```ts
// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/admin/" }],
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

### `sitemap.ts`

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetch("https://api.example.com/posts").then(r => r.json());
  return [
    { url: "https://example.com", lastModified: new Date(), priority: 1.0 },
    ...posts.map((p: any) => ({
      url: `https://example.com/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      priority: 0.7,
    })),
  ];
}
```

---

## 8. 構造化データ（JSON-LD）

リッチスニペット（評価の星とか）を出したい場合に。

```tsx
export default function ProductPage({ product }: any) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.image,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.5",
      reviewCount: "120",
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1>{product.name}</h1>
    </>
  );
}
```

---

## 9. 言語・viewport

```ts
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: "...",
};

// viewport は別 export（Next.js 14+）
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};
```

```tsx
export default function RootLayout({ children }: any) {
  return (
    <html lang="ja"> {/* lang は <html> に直接書く */}
      <body>{children}</body>
    </html>
  );
}
```

---

## 10. SEO の基本チェック

| 項目 | できているか |
|------|-------------|
| 各ページにユニークな `title` がある |
| `description` が 100〜160 文字程度 |
| OGP 画像（1200×630）が設定されている |
| `<html lang="...">` が設定されている |
| `sitemap.xml` を提供している |
| canonical を設定している |
| 表示速度（LCP）が 2.5 秒以下 |
| モバイル対応している（viewport meta） |

---

## 11. つまずきポイント

### Q. `metadata` を Client Component で export してもエラー

→ Server Component（または `layout.tsx`/`page.tsx` のトップ）でのみ使えます。

### Q. `generateMetadata` で fetch したのに、ページ側でも fetch するのは無駄では？

→ 同じ URL の `fetch` は自動的に重複排除されるので、コストはかかりません。

### Q. OG 画像が SNS で反映されない

→ シェア後にキャッシュされるので、OGP デバッガ（[Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) など）で**強制リフレッシュ**が必要。

### Q. `metadataBase` が必要と警告が出る

→ `app/layout.tsx` の metadata に `metadataBase: new URL("https://example.com")` を追加。

---

## まとめ

- メタデータは **`metadata` または `generateMetadata`** を export するだけ
- Layout で設定 → 子ページで上書き、`template` を使うと自動で「○○ | サイト名」
- OGP 画像は **1200×630px**、`opengraph-image.tsx` で動的生成も可能
- `robots.ts` / `sitemap.ts` で SEO 周辺ファイルもコードで管理
- `<html lang="...">` と viewport は忘れずに

次はデータ取得の本丸 → [[01fetchとキャッシュ境界]]
