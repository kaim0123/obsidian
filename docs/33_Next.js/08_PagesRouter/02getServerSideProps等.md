# getServerSideProps 等（Pages Router のデータ取得）

App Router の `await fetch` 1 行で済む話が、Pages Router では**4 つの関数**に分かれていました。
歴史を理解しておくと、レガシーコードを読むときに迷いません。

---

## 1. 4 つのデータ取得方式

| 関数 / 方式 | 実行タイミング | 結果 |
|------------|---------------|------|
| **`getStaticProps`** | ビルド時 | 静的 HTML 生成（SSG） |
| **`getStaticPaths`** | ビルド時 | 動的ルートで生成する URL を列挙 |
| **`getServerSideProps`** | リクエストごと | サーバー側で生成（SSR） |
| **クライアントサイド** | ブラウザで | `useEffect` + `fetch` |

App Router では、これら全てが **「Server Component で `await fetch`」** に統合されました。

---

## 2. `getStaticProps`：ビルド時にデータ取得

ブログ記事一覧など、**頻繁に変わらないデータ**で使う。

```tsx
// pages/blog/index.tsx
import { GetStaticProps } from "next";

type Post = { id: string; title: string };

export default function Blog({ posts }: { posts: Post[] }) {
  return (
    <ul>
      {posts.map(p => <li key={p.id}>{p.title}</li>)}
    </ul>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return {
    props: { posts },
    revalidate: 60, // 60 秒で再生成（ISR）
  };
};
```

### 流れ

1. `next build` 時に `getStaticProps` が実行される
2. 返した `props` で React コンポーネントが描画され、HTML として保存
3. アクセスされたら **HTML をそのまま返す**（爆速）
4. `revalidate` 経過後の最初のアクセスで、**バックグラウンドで再生成**

これが **ISR（Incremental Static Regeneration）** です。

---

## 3. `getStaticPaths`：動的ルートで静的生成

`[slug]` のような動的ルートでは、**どの URL を事前に生成するか**を `getStaticPaths` で指定します。

```tsx
// pages/blog/[slug].tsx
import { GetStaticPaths, GetStaticProps } from "next";

export const getStaticPaths: GetStaticPaths = async () => {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return {
    paths: posts.map((p: any) => ({ params: { slug: p.slug } })),
    fallback: "blocking", // ★
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const res = await fetch(`https://api.example.com/posts/${params!.slug}`);
  const post = await res.json();
  return { props: { post }, revalidate: 60 };
};

export default function BlogPost({ post }: any) {
  return <h1>{post.title}</h1>;
}
```

### `fallback` の挙動

| 値 | 振る舞い |
|----|---------|
| `false` | `paths` に無い URL は **404** |
| `true` | アクセス時に **生成する**（生成中はローディング表示） |
| `"blocking"` | アクセス時に **生成完了まで待ってから返す** |

App Router の `generateStaticParams` + `dynamicParams` の元祖。

---

## 4. `getServerSideProps`：毎リクエストで実行

ユーザー固有のページ・常に最新が必要なページで使う。

```tsx
// pages/dashboard.tsx
import { GetServerSideProps } from "next";

export default function Dashboard({ user }: any) {
  return <h1>こんにちは {user.name}</h1>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSessionFromCookie(context.req);
  if (!session) {
    return { redirect: { destination: "/login", permanent: false } };
  }
  const user = await db.users.findUnique({ where: { id: session.userId } });
  return { props: { user } };
};
```

### 渡される `context`

```ts
{
  req: NextApiRequest,
  res: NextApiResponse,
  params: { slug: "..." },
  query: { q: "..." },
  preview: boolean,
  resolvedUrl: string,
}
```

### 戻り値の選択肢

```ts
return { props: { ... } };                  // 通常
return { redirect: { destination: "/", permanent: false } };  // リダイレクト
return { notFound: true };                  // 404
```

---

## 5. クライアントサイドフェッチ

ログイン後の動的データなど、SEO に関係ないデータは普通に `useEffect` で取得。

```tsx
import { useState, useEffect } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/me")
      .then(r => r.json())
      .then(setUser);
  }, []);

  if (!user) return <p>読み込み中...</p>;
  return <p>{user.name}</p>;
}
```

実務では **SWR** や **TanStack Query** を組み合わせるのが定番。

```tsx
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Profile() {
  const { data, error } = useSWR("/api/me", fetcher);
  if (error) return <p>エラー</p>;
  if (!data) return <p>...</p>;
  return <p>{data.name}</p>;
}
```

---

## 6. App Router との対応関係

| Pages Router | App Router での書き方 |
|-------------|---------------------|
| `getStaticProps` | Server Component で `await fetch`（自動でキャッシュ） |
| `getStaticPaths` | `generateStaticParams` |
| `getServerSideProps` | Server Component で `await fetch` + `cache: 'no-store'` |
| `useEffect` + `fetch` | Client Component（`'use client'`）で同様 |
| `revalidate: 60` | `next: { revalidate: 60 }` |

---

## 7. ISR の更新パターン

### 時間ベース

```ts
return { props: {...}, revalidate: 60 };
```

### オンデマンド再検証

```ts
// pages/api/revalidate.ts
export default async function handler(req, res) {
  if (req.query.secret !== process.env.SECRET) return res.status(401).end();
  await res.revalidate("/blog");
  return res.json({ revalidated: true });
}
```

App Router の `revalidatePath` の前身。

---

## 8. つまずきポイント

### Q. `getStaticProps` と `getServerSideProps` を同じページで使える？

→ 不可。**どちらか片方**だけ。

### Q. クライアントから `getServerSideProps` を呼びたい

→ 不可。代わりに `pages/api/...` を作って `fetch` で叩く。

### Q. `getStaticPaths` で全件返すのが重い

→ `fallback: 'blocking'` で必要なときだけ生成する。

### Q. `getStaticProps` が `useEffect` のように毎回走らない

→ ビルド時に 1 回だけ。再生成したいなら `revalidate` を設定。

### Q. App Router に書き換えたい

→ 移行ガイドは [[03App-Routerへの移行メモ]] を参照。

---

## まとめ

- Pages Router のデータ取得は **4 種類**：SSG / ISR / SSR / CSR
- `getStaticProps` + `getStaticPaths` で静的サイトを構築
- `getServerSideProps` で毎リクエスト処理（認証ページなど）
- App Router では全部 **Server Components の `await fetch`** に統合
- 既存コードを読むときは「いつ実行されるか」を関数名で判断

次は移行のヒント → [[03App-Routerへの移行メモ]]
