# ファイル規約と URL

App Router の最大の特徴は、**フォルダ構造そのものが URL になる**ことです。
これを「**ファイルベースルーティング**」と呼びます。設定ファイルを書く必要はなく、フォルダを作るだけでルートが追加されます。

---

## 1. 基本ルール：`page.tsx` が「そのフォルダの URL」になる

ルートは `src/app/`（または `app/`）配下にあります。

```text
app/
├── page.tsx                  → "/"           （トップ）
├── about/page.tsx            → "/about"
├── blog/page.tsx             → "/blog"
└── blog/posts/page.tsx       → "/blog/posts"
```

**ポイント：**

- フォルダ名 = URL の階層
- フォルダの中に `page.tsx` を置くと、その階層が「アクセスできる URL」になる
- `page.tsx` を**置かなければ URL としてはアクセスできない**（フォルダだけあっても 404）

### `page.tsx` の最小例

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About</h1>;
}
```

これだけで `/about` にアクセスすると「About」と表示されます。

---

## 2. 特別な意味を持つファイル名

App Router には**予約されたファイル名**がいくつかあります。これを置くと自動的に特別な役割を果たします。

| ファイル名 | 役割 |
|-----------|------|
| **`page.tsx`** | そのフォルダの URL でアクセスされたときの中身 |
| **`layout.tsx`** | そのフォルダ以下で**共通のラッパー**（ヘッダー・サイドバーなど） |
| **`loading.tsx`** | データ取得中などに自動表示されるローディング画面 |
| **`error.tsx`** | エラーが発生したときに表示される画面 |
| **`not-found.tsx`** | 404（見つからない）ページ |
| **`template.tsx`** | `layout` に似ているが、毎回再生成されるラッパー |
| **`route.ts`** | API エンドポイント（HTML ではなく JSON などを返す） |
| **`default.tsx`** | 並列ルートのフォールバック |
| **`middleware.ts`** | リクエスト前に走る処理（プロジェクトルート直下） |

---

## 3. URL のパターン

### 静的ルート（固定の URL）

```text
app/
├── page.tsx              → "/"
├── about/page.tsx        → "/about"
└── contact/page.tsx      → "/contact"
```

### 動的ルート（URL に変数を含む）

フォルダ名を `[ ]`（角括弧）で囲むと、その部分が変数になります。

```text
app/
└── blog/
    └── [slug]/
        └── page.tsx      → "/blog/任意の文字列"
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
  const { slug } = await params; // Next.js 15+ では Promise になっている
  return <h1>記事: {slug}</h1>;
}
```

### キャッチオール（複数階層をまるごと受ける）

```text
app/
└── docs/
    └── [...slug]/
        └── page.tsx      → "/docs/a", "/docs/a/b", "/docs/a/b/c" すべて
```

`slug` は配列になります（`["a", "b", "c"]`）。

### オプショナルキャッチオール

`[[...slug]]` のように 2 重括弧にすると、**スラッグなしでも一致**します。

- `/docs` → `slug = undefined`
- `/docs/a` → `slug = ["a"]`

---

## 4. ルートグループ（URL に出ないフォルダ）

フォルダ名を `( )`（丸括弧）で囲むと、**そのフォルダ名は URL に含まれません**。

```text
app/
├── (marketing)/
│   ├── about/page.tsx    → "/about"
│   └── contact/page.tsx  → "/contact"
└── (shop)/
    ├── products/page.tsx → "/products"
    └── cart/page.tsx     → "/cart"
```

なんのために？

- **コード上の整理**：マーケ系とショップ系をフォルダで分けたい
- **レイアウトを分けたい**：`(marketing)/layout.tsx` と `(shop)/layout.tsx` で別ヘッダー

---

## 5. プライベートフォルダ（ルーティング対象外）

フォルダ名を **アンダースコア `_` で始める**と、URL の対象になりません。
共通コンポーネントやヘルパーを置く場所として使えます。

```text
app/
├── _components/          ← URL にならない（ただ置いてあるだけ）
│   └── Button.tsx
└── about/page.tsx
```

---

## 6. リンクの貼り方：`<Link>`

ページ間のリンクは `<a>` ではなく **`<Link>` コンポーネント**を使います。

```tsx
import Link from "next/link";

export default function Nav() {
  return (
    <nav>
      <Link href="/">トップ</Link>
      <Link href="/about">About</Link>
      <Link href="/blog/hello">記事1</Link>
    </nav>
  );
}
```

### `<Link>` のメリット

- **クライアント側遷移**：ページ全体をリロードせずに切り替えるので速い
- **プリフェッチ**：画面に表示されたリンクの遷移先を**先読み**してくれる

### `<a>` を使うべきケース

- **外部サイトへのリンク**（Next.js の管理外）
- ファイルのダウンロードリンクなど

---

## 7. URL に対応するフォルダ早見表

| URL | フォルダ |
|-----|----------|
| `/` | `app/page.tsx` |
| `/about` | `app/about/page.tsx` |
| `/blog/hello` | `app/blog/[slug]/page.tsx`（slug = "hello"） |
| `/docs/a/b` | `app/docs/[...slug]/page.tsx`（slug = ["a","b"]） |
| `/products`（ルートグループ内） | `app/(shop)/products/page.tsx` |

---

## 8. つまずきポイント

### Q. フォルダを作ったのにアクセスできない

→ `page.tsx` を置き忘れている可能性大。フォルダだけでは URL になりません。

### Q. URL に `(marketing)` が出てしまう

→ 丸括弧 `( )` ではなく、**全角の（）**になっていませんか？必ず半角括弧で。

### Q. `[slug]` の中身が取れない

→ Next.js 15 以降は `params` が Promise になりました。`await params` が必要です。

```tsx
// ✅ 新しい書き方
const { slug } = await params;

// ❌ 古い書き方（13/14 系のもの）
const slug = params.slug;
```

---

## まとめ

- **フォルダ = URL 階層**、**`page.tsx` = そのフォルダの中身**
- `[slug]` で動的ルート、`[...slug]` で複数階層キャッチ
- `(group)` は URL に出ないフォルダ、`_private` はルーティング対象外
- リンクは必ず **`<Link>`** を使う

次は、共通レイアウトを学びます → [[02layout-page-template]]
