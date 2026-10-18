# layout / page / template

App Router の中核となる 3 つの特別ファイルを区別して理解しましょう。
- `page.tsx`：そのフォルダの **URL の中身**
- `layout.tsx`：そのフォルダ以下で**共通に使うラッパー**（一度作って使い回す）
- `template.tsx`：layout に似ているが、**遷移ごとに作り直す**ラッパー

---

## 1. `page.tsx`（ページの中身）

これは前のノートで触れた通り、**ある URL でアクセスされたときに表示する内容**を書くファイルです。

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return <h1>About ページです</h1>;
}
```

**ルール：**

- `default export` で 1 つのコンポーネントを export する
- 引数として `params` や `searchParams` を受け取れる（動的ルートやクエリ用）

---

## 2. `layout.tsx`（共通の枠）

「**ヘッダー、サイドバー、フッターなど、複数ページで共通の部分**」を書く場所です。

### ルートレイアウト（必須）

`app/layout.tsx` は **必ず存在しないとアプリが動きません**。HTML の `<html>` と `<body>` をここで定義します。

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header>共通ヘッダー</header>
        <main>{children}</main>
        <footer>共通フッター</footer>
      </body>
    </html>
  );
}
```

### `children` とは何か？

`children` には **その下の階層の `page.tsx` や、ネストしたレイアウト**が自動的に入ってきます。

```text
app/
├── layout.tsx        ← ルートレイアウト
├── page.tsx          ← children に入る（"/" のとき）
└── about/
    └── page.tsx      ← children に入る（"/about" のとき）
```

- `/` にアクセス → `RootLayout` の `children` に `app/page.tsx` の中身が入る
- `/about` → `RootLayout` の `children` に `app/about/page.tsx` の中身が入る

### ネストしたレイアウト（フォルダごとの専用枠）

サブフォルダにも `layout.tsx` を置けます。**親レイアウトの中にさらに子レイアウトが入れ子になります**。

```text
app/
├── layout.tsx              ← 全体の枠（ヘッダー、フッター）
└── dashboard/
    ├── layout.tsx          ← ダッシュボード専用の枠（サイドバー）
    ├── page.tsx            ← /dashboard
    └── settings/
        └── page.tsx        ← /dashboard/settings
```

`/dashboard/settings` にアクセスすると、構造はこうなります：

```html
<RootLayout>
  <DashboardLayout>
    <SettingsPage />
  </DashboardLayout>
</RootLayout>
```

### レイアウトの最大の特徴：**遷移時に再描画されない**

`/dashboard` から `/dashboard/settings` に移動しても、**`DashboardLayout` は描画し直されません**。
- サイドバーの状態（折りたたみなど）は保たれる
- スクロール位置も保たれる

これにより、SPA らしい「サクサクした遷移」が実現できます。

---

## 3. `template.tsx`（毎回作り直すラッパー）

`layout.tsx` とほぼ同じ書き方ですが、**遷移するたびに新しく作り直されます**。

```tsx
// app/dashboard/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
```

### いつ template を使うのか？

- ページ遷移ごとに **アニメーションを再生したい**
- ページ遷移ごとに **`useEffect` を再実行したい**
- ログ出力・アクセス計測など、**遷移ごとに発火させたい処理がある**

普通のレイアウト目的なら **`layout.tsx`** で十分。`template.tsx` は「明確に再生成が必要なときだけ」使います。

---

## 4. layout / template の比較表

| 項目 | `layout.tsx` | `template.tsx` |
|------|-------------|----------------|
| 遷移時の挙動 | **保持される**（再生成されない） | **再生成される** |
| ステートの保持 | 保持される | リセットされる |
| `useEffect` | 再実行されない | 再実行される |
| スクロール位置 | 保持される | リセットされる |
| ユースケース | 共通枠、サイドバー、ナビ | アニメーション、計測 |
| 共存 | 同時に置ける（template が layout の内側に入る） | 同上 |

両方置いた場合の入れ子順：

```html
<Layout>
  <Template>
    <Page />
  </Template>
</Layout>
```

---

## 5. layout でデータ取得もできる

レイアウトも Server Component なので、データ取得を書けます。

```tsx
// app/dashboard/layout.tsx
async function getUser() {
  // DB やセッションからユーザー取得
  return { name: "Taro" };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <div className="flex">
      <aside>こんにちは、{user.name} さん</aside>
      <main>{children}</main>
    </div>
  );
}
```

ただし、`children` 側のページに値を **props で渡すことはできません**。
共有データは **React Context**（クライアント側）や **`headers()` / `cookies()`**（サーバー側）で受け渡します。

---

## 6. メタデータも layout / page で設定

`metadata` という変数を export すると、`<head>` の中身を Next.js が自動で挿入してくれます。

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

詳しくは [[03メタデータとSEO]] で扱います。

---

## 7. つまずきポイント

### Q. ルートレイアウトを消したらエラーになった

→ ルートレイアウトは**必須**。`<html>` と `<body>` を含めて必ず存在させてください。

### Q. ページ間でステートが消えてしまう

→ `template.tsx` を置いていませんか？`layout.tsx` に変えれば保持されます。

### Q. layout でデータを取得して page に渡したい

→ props 経由は不可。Server Components なら**同じ関数を page でもう一度呼ぶだけ**で OK。
Next.js の `fetch` は同一リクエスト内で**自動的に重複排除**されるので、コストはほぼゼロです。

---

## まとめ

- **`page.tsx`** は URL の中身、必ず必要
- **`layout.tsx`** は共通ラッパー、遷移しても**保持される**
- **`template.tsx`** は遷移ごとに**作り直す**ラッパー
- ルートレイアウトは必須（`<html>`, `<body>` を含む）
- レイアウトはネスト可能で、自動的に入れ子に組み立てられる

次は URL に変数を含む動的ルート → [[03動的セグメントとgenerateStaticParams]]
