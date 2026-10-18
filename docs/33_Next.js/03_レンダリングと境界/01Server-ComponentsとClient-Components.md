# Server Components と Client Components

App Router で**最も重要かつ最初は混乱しやすい**概念です。
ここを理解すると、Next.js の設計思想が一気に腑に落ちます。

---

## 1. ざっくり結論

| 種類 | どこで動く？ | 用途 |
|------|------------|------|
| **Server Components（RSC）** | サーバー側でのみ実行 | データ取得・DB アクセス・秘密情報の利用 |
| **Client Components** | サーバーでも実行 + ブラウザでもう一度 | 状態（useState）・イベント・ブラウザ API |

App Router では **デフォルトで「Server Component」** になります。
**`"use client"`** をファイルの先頭に書くと、そのコンポーネントから先は「Client Component」になります。

---

## 2. Server Components とは

ブラウザに JavaScript を送らず、**サーバー側で HTML を組み立てて返す**コンポーネントです。

### 特徴

- **`fetch` を直接 await できる**（async コンポーネント OK）
- **DB に直接アクセスできる**（API を経由しなくていい）
- **API キーや秘密情報を安全に使える**（クライアントに送られない）
- **JS バンドルサイズが減る**（クライアントに送らない）
- ❌ `useState` / `useEffect` などの**フックは使えない**
- ❌ `onClick` などの**イベントハンドラを書けない**
- ❌ ブラウザ API（`window`、`localStorage` 等）は使えない

### 書き方

```tsx
// app/posts/page.tsx（特に何も書かなければ Server Component）
async function getPosts() {
  const res = await fetch("https://api.example.com/posts");
  return res.json();
}

export default async function Posts() {
  const posts = await getPosts(); // 直接 await できる！
  return (
    <ul>
      {posts.map((p: any) => (
        <li key={p.id}>{p.title}</li>
      ))}
    </ul>
  );
}
```

これが Server Component です。`async` 関数として書ける、`fetch` を直接できる、というのが大きな違い。

---

## 3. Client Components とは

ブラウザでもう一度実行されて、**ユーザー操作や状態を扱う**コンポーネントです。

### 特徴

- **`useState`、`useEffect`、`useReducer` など全てのフックが使える**
- **`onClick`、`onChange` などのイベントが書ける**
- **`window`、`localStorage` などブラウザ API が使える**
- ❌ `async` コンポーネントにはできない
- ❌ DB に直接アクセスはできない（API 経由）
- ❌ サーバー専用の秘密情報は使えない

### 書き方

ファイルの**一番上**に `"use client"` を書きます。

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      クリック数: {count}
    </button>
  );
}
```

これで Client Component になります。

---

## 4. なぜ 2 種類あるの？

「全部 Client Component で書けばいいじゃん」と思うかもしれません。
でも、**サーバーで完結する処理をクライアントに送るのは無駄が多い**んです。

| 観点 | サーバー側でやる利点 |
|------|---------------------|
| バンドルサイズ | クライアントに JS を送らずに済む（重い `markdown` パーサーなど） |
| データ取得 | DB に直接アクセス可、複数 API のまとめが速い |
| セキュリティ | API キーがブラウザに漏れない |
| パフォーマンス | サーバー側はスペックが安定、CDN キャッシュも使える |

Server Component は **「初期表示専用の HTML を高速に作る」**ことに特化しています。

---

## 5. 「境界」を意識する

App Router は、**どこまでがサーバーで、どこからクライアントか**を「境界」として捉えます。

```text
Server Component（RootLayout）
  └─ Server Component（Page）
       ├─ Server Component（PostList）
       └─ Client Component（Counter）  ← ここから先は client
            └─ Client Component（Button）
```

### ルール

1. **Server Component から Client Component を呼べる**（OK）
2. **Client Component の `import` 先で書いた Server Component は、自動で Client Component 扱いになる**
3. **`children` 経由なら、Client Component の中に Server Component を「差し込む」ことができる**

### よくあるパターン：children でサーバーを差し込む

```tsx
// app/page.tsx（Server Component）
import ClientWrapper from "./ClientWrapper";
import ServerContent from "./ServerContent";

export default function Page() {
  return (
    <ClientWrapper>
      <ServerContent /> {/* これは Server のまま！ */}
    </ClientWrapper>
  );
}
```

```tsx
// app/ClientWrapper.tsx
"use client";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fancy">{children}</div>;
}
```

`children` として渡される `<ServerContent />` は、**Server Component のまま**実行されます。これにより「クライアントで装飾だけしつつ、中身はサーバー」が実現できます。

---

## 6. データを「サーバーから渡す」とき

Server から Client へは **シリアライズ可能な値だけ** props で渡せます。

| 渡せるもの | 渡せないもの |
|-----------|-------------|
| 文字列、数値、真偽値 | 関数 |
| 配列、オブジェクト | クラスのインスタンス |
| Date | Map、Set（一部 OK だが要注意） |
| null、undefined | Symbol |

**関数を渡したい場合は Server Actions** を使います（後述）。

---

## 7. 動的レンダリング vs 静的レンダリング

Server Component は、**書き方によって**ビルド時に静的に生成されたり、毎回サーバーで動いたりします。

### 静的（Static）になる条件

- `fetch` のオプションに `cache: 'force-cache'`（デフォルト）
- DB やヘッダ・クッキーを読んでいない
- `searchParams` を使っていない

### 動的（Dynamic）になる条件

- `cookies()` や `headers()` を呼んでいる
- `searchParams` を使っている
- `fetch` で `cache: 'no-store'` を指定
- `dynamic = "force-dynamic"` を export している

これは [[01fetchとキャッシュ境界]] で詳しく扱います。

---

## 8. 実践例

### ❌ NG：Server で `useState`

```tsx
// app/page.tsx
import { useState } from "react";

export default function Page() {
  const [n, setN] = useState(0); // エラー！
}
```

### ✅ OK：Counter だけ Client にする

```tsx
// app/page.tsx（Server Component）
import Counter from "./Counter";

export default async function Page() {
  const data = await fetch("...").then(r => r.json());
  return (
    <>
      <h1>こんにちは</h1>
      <Counter initial={data.count} />
    </>
  );
}
```

```tsx
// app/Counter.tsx
"use client";
import { useState } from "react";

export default function Counter({ initial }: { initial: number }) {
  const [n, setN] = useState(initial);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}
```

---

## 9. 設計の鉄則

1. **デフォルトは Server Component**
2. **状態・イベントが必要な部分だけ** `"use client"` を付ける
3. **境界はできるだけ「葉っぱ」に近づける**（=ツリーの末端でクライアント化）
4. **重いライブラリは Server で完結**させる（`markdown` 変換、画像処理など）
5. **DB や秘密情報は必ず Server で**

---

## 10. つまずきポイント

### Q. `"use client"` をどこに書けばいい？

→ **そのファイルの一番上**（import より前）。1 行目です。

### Q. Server Component に `useState` を書いたらエラー

→ そのコンポーネントを Client にするか、状態を持つ部分だけ別ファイルに切り出して `"use client"` を付ける。

### Q. Client Component に `await fetch` を書いたら動かない

→ Client は async 不可。`useEffect` で取得するか、Server で取って props で渡す。

### Q. Client Component の中に Server Component を入れたい

→ 直接 import は不可。**`children` 経由**で渡す。

### Q. どっちにすればいいか迷う

→ まず Server で書いて、必要になったら Client に変える、が鉄則。

---

## まとめ

- App Router は **デフォルト Server Component**
- 状態・イベントが要る所だけ **`"use client"`**
- Server は **データ取得・DB・秘密**、Client は **インタラクション**
- 「**境界をできるだけ葉に近づける**」と JS バンドルが小さく速くなる
- Client → Server を入れたいなら `children` 経由

次は実際にデータを渡す方法 → [[02サーバーとクライアントのデータの渡し方]]
