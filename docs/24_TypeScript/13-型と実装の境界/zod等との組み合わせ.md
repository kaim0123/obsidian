# Zod 等との組み合わせ

## なぜバリデーションが必要？

外から来るデータ（API、フォーム、`localStorage`、JSON ファイルなど）は、
**TypeScript の型を信用できません**。

```typescript
const data = JSON.parse(json) as User; // 中身が本当に User かは未保証
```

`as` で型を付けただけでは、**実行時の安全性はゼロ**。
ここで活躍するのが **ランタイムバリデーションライブラリ**、代表格が **Zod** です。

## Zod とは？

`zod` は、**スキーマを定義するだけで「ランタイムチェック + TypeScript 型」が両方手に入る**ライブラリです。

```typescript
import { z } from "zod";

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;
// {
//   id: number;
//   name: string;
//   email: string;
// }
```

- **`UserSchema`**：実行時のバリデーションに使う
- **`z.infer<typeof UserSchema>`**：そこから自動的に TypeScript 型を取り出す

**スキーマと型を 1 か所で定義** できるのが最大の魅力です。

## バリデーションの基本

```typescript
const result = UserSchema.safeParse(json);

if (result.success) {
  const user = result.data; // User 型
  console.log(user.name);
} else {
  console.error(result.error.issues);
}
```

`safeParse` は **Result 型風** に成否を返してくれます。
`parse` を使うと失敗時に例外を投げます（場面で使い分け）。

## API レスポンスの型付け

```typescript
async function fetchUser(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  const json = await res.json();        // any
  return UserSchema.parse(json);         // ここで User 型に
}
```

外部からの JSON は `any` で来ますが、Zod を通せば「**型 + 実体**」の両方が確かなものになります。

## 入力フォームでの活用

```typescript
const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(18),
});

function onSubmit(input: unknown) {
  const r = SignupSchema.safeParse(input);
  if (!r.success) {
    return showErrors(r.error.flatten());
  }
  registerUser(r.data); // SignupInput 型で安全に渡せる
}
```

**フォーム入力 → スキーマ検証 → 型付き値で処理** という流れが鉄板。

## 変換も書ける（transform）

「文字列を Date に変換する」「全角を半角に直す」など、**型と一緒に変換** もできます。

```typescript
const DateSchema = z.string().transform((s) => new Date(s));
type DateOut = z.infer<typeof DateSchema>; // Date
```

## 判別可能ユニオン

`z.discriminatedUnion` で、判別可能ユニオンも書けます。

```typescript
const Event = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("login"),  userId: z.string() }),
  z.object({ kind: z.literal("logout"), userId: z.string() }),
]);
```

スキーマもタイプもキレイに保てます。

## 他の選択肢

- **valibot**：軽量で tree-shakable な代替
- **arktype**：TypeScript の構文に近い書き味
- **io-ts**：fp-ts 系の関数型ライブラリ

「**チームで 1 つに揃える**」ことが何より大切です。

## ベストプラクティス

- **境界（外部入力）でのみ使う**：内部ロジックでは普通の TS 型で十分
- **型の二重定義を避ける**：`z.infer` で自動取得すれば DRY
- **エラー UI と組み合わせる**：`flatten()` でフィールド単位エラーが取れる
- **API レスポンスは保守的に**：未知のキーは `.passthrough()` か `.strip()` で扱う

## まとめ

- 外部から来るデータは **TypeScript の型では守れない**
- **Zod** などのバリデーションで、ランタイムと型を同時に固める
- スキーマから `z.infer` で型を自動取得すれば、二重定義がなくなる
- フォーム・API レスポンス・設定ファイルなど **境界**で活用する
- 大事なのは「**1 つに揃える**」こと。チーム全体で同じ書き味に
