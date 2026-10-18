# Server Actions（フォーム・ミューテーション）

Server Actions は App Router の**目玉機能**の 1 つです。
**「ボタンを押したらサーバー側の関数が直接呼ばれる」**という、API ルートを書かずに済む仕組みです。

---

## 1. ざっくり何ができるか

- **フォーム送信** → サーバー側で DB 保存（API 不要）
- **ボタンクリック** → サーバー側で処理 → 自動で再描画
- **Progressive Enhancement**：JS が無効でもフォームが動く
- **キャッシュ無効化と連動**：処理後に `revalidateTag` で UI 更新

これにより、**「フロントとバックエンドの境界」が薄くなる**設計が可能になります。

---

## 2. 一番シンプルな例：フォーム

### Step 1：Server Action を書く

ファイルの**先頭**に `"use server"` を付けます。

```ts
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";

export async function addTodo(formData: FormData) {
  const title = formData.get("title") as string;

  // DB に保存（Prisma 等）
  await db.todos.create({ data: { title } });

  // /todos のキャッシュを無効化
  revalidatePath("/todos");
}
```

### Step 2：フォームから呼ぶ

```tsx
// app/todos/page.tsx
import { addTodo } from "@/app/actions";

export default function TodosPage() {
  return (
    <form action={addTodo}>
      <input name="title" required />
      <button type="submit">追加</button>
    </form>
  );
}
```

`<form action={...}>` に **直接 Server Action を渡せる**のがポイント。
これだけで、

1. ユーザーが送信
2. `addTodo` がサーバー側で実行
3. DB に保存
4. キャッシュ無効化 → 一覧が自動更新

…まで完結します。

---

## 3. インラインで書くこともできる

別ファイルにせず、コンポーネント内に直接書くことも可能です。

```tsx
// app/page.tsx（Server Component）
export default function Page() {
  async function addTodo(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    await db.todos.create({ data: { title } });
  }

  return (
    <form action={addTodo}>
      <input name="title" />
      <button>追加</button>
    </form>
  );
}
```

ただし**再利用しやすさ**を考えると、`actions.ts` のような別ファイルにまとめるのがおすすめ。

---

## 4. ボタンクリックから呼ぶ

```tsx
// app/posts/LikeButton.tsx
"use client";

import { likePost } from "@/app/actions";

export default function LikeButton({ postId }: { postId: string }) {
  return <button onClick={() => likePost(postId)}>いいね</button>;
}
```

```ts
// app/actions.ts
"use server";
import { revalidateTag } from "next/cache";

export async function likePost(postId: string) {
  await db.likes.create({ data: { postId } });
  revalidateTag(`post:${postId}`);
}
```

Client Component から Server Action を import するだけで使えます。
**裏で HTTP 通信が発生**しますが、書き味としては「ただの関数呼び出し」。

---

## 5. 状態を管理する：`useFormStatus` / `useActionState`

### `useFormStatus`：送信中かどうか

```tsx
// app/SubmitButton.tsx
"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送信中..." : "送信"}
    </button>
  );
}
```

### `useActionState`（旧 `useFormState`）：戻り値とエラーを管理

```tsx
// app/actions.ts
"use server";

export async function createPost(prevState: any, formData: FormData) {
  const title = formData.get("title") as string;
  if (!title) return { error: "タイトル必須" };
  await db.posts.create({ data: { title } });
  return { success: true };
}
```

```tsx
// app/CreatePost.tsx
"use client";
import { useActionState } from "react";
import { createPost } from "@/app/actions";

export default function CreatePost() {
  const [state, formAction] = useActionState(createPost, null);
  return (
    <form action={formAction}>
      <input name="title" />
      {state?.error && <p style={{ color: "red" }}>{state.error}</p>}
      {state?.success && <p style={{ color: "green" }}>作成しました！</p>}
      <button>送信</button>
    </form>
  );
}
```

---

## 6. 楽観的 UI：`useOptimistic`

サーバー応答を待たずに UI を更新したいときに。

```tsx
"use client";
import { useOptimistic } from "react";
import { addTodo } from "@/app/actions";

export default function TodoList({ todos }: { todos: { id: string; title: string }[] }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo: { id: string; title: string }) => [...state, newTodo]
  );

  async function action(formData: FormData) {
    const title = formData.get("title") as string;
    addOptimisticTodo({ id: Math.random().toString(), title }); // 即時 UI 反映
    await addTodo(formData); // 実際のサーバー処理
  }

  return (
    <>
      <form action={action}>
        <input name="title" />
      </form>
      <ul>{optimisticTodos.map(t => <li key={t.id}>{t.title}</li>)}</ul>
    </>
  );
}
```

---

## 7. バリデーション

複雑なバリデーションは [Zod](https://zod.dev/) などのライブラリと組み合わせます。

```ts
// app/actions.ts
"use server";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "必須").max(100, "100 文字以内"),
});

export async function createPost(prevState: any, formData: FormData) {
  const parsed = schema.safeParse({
    title: formData.get("title"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.posts.create({ data: parsed.data });
  return { success: true };
}
```

---

## 8. 認証チェック

Server Action 内で認可も。

```ts
"use server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function deletePost(id: string) {
  const session = await auth();
  if (!session) redirect("/login");

  const post = await db.posts.findUnique({ where: { id } });
  if (post?.authorId !== session.user.id) {
    throw new Error("権限がありません");
  }

  await db.posts.delete({ where: { id } });
  revalidatePath("/posts");
}
```

---

## 9. リダイレクト・通知

```ts
"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createPost(formData: FormData) {
  const post = await db.posts.create({ data: { title: formData.get("title") as string } });
  revalidatePath("/posts");
  redirect(`/posts/${post.id}`); // 作成後に詳細ページへ
}
```

`redirect` は内部的に例外を投げるので、その後のコードは実行されません。

---

## 10. セキュリティ上の注意

Server Actions は **HTTP エンドポイントとして公開**されます（CSRF 対策は Next が組み込みでやってくれる）。
ただし以下に注意：

- **必ず認可チェック**：誰でも呼べるとして、ユーザーがその操作をする権限があるか
- **入力を信用しない**：型注釈は信用せず、Zod 等でバリデーション
- **機密データを返さない**：戻り値はクライアントに送られる

---

## 11. つまずきポイント

### Q. `"use server"` を書いたのに動かない

→ ファイル全体に書く場合は**ファイル冒頭**、関数内に書く場合は**関数の中の最初の行**。位置を間違えるとエラー。

### Q. `formData.get("title")` が `null` になる

→ input に `name="title"` が付いているか確認。

### Q. クライアントから直接 import すると怒られる

→ `"use server"` の関数は Client Component から import OK ですが、**型 `FormData` などはちゃんと渡す**必要あり。

### Q. 戻り値が消える / 反映されない

→ `useActionState` を使う必要があります。

### Q. ファイルアップロードはどうする？

→ `<input type="file" name="avatar" />` の値も `FormData.get("avatar")` で `File` として取れます。

### Q. テストはどう書く？

→ Server Actions は普通の async 関数なので、引数に `FormData` を作って呼ぶだけ。

---

## まとめ

- **`"use server"`** で「サーバー側でだけ動く関数」を作る
- フォームの `action={fn}`、ボタンの `onClick={() => fn(...)}` で呼べる
- 処理後に **`revalidateTag` / `revalidatePath`** でキャッシュ更新 → UI 即反映
- **`useFormStatus` / `useActionState` / `useOptimistic`** で UX を磨く
- **必ず認可とバリデーションを Server 側で**

次は API として外から叩ける Route Handler → [[01Route-Handlers]]
