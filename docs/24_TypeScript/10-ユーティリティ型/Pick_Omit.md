# Pick / Omit

「既存の型から **必要なプロパティだけ取り出したい・除きたい**」ときに使うユーティリティ型です。

## Pick<T, K>：必要なプロパティだけ取り出す

```typescript
type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type PublicUser = Pick<User, "id" | "name">;
// {
//   id: number;
//   name: string;
// }
```

`K` には「取り出したいキーのユニオン型」を指定します。

### 使いどころ

- API レスポンスから **公開してよい項目だけ**を選ぶ
- フォーム入力で **入力対象の項目だけ**型を作る

```typescript
type LoginInput = Pick<User, "email" | "password">;

function login(input: LoginInput) {
  // input.id にはアクセスできない
}
```

## Omit<T, K>：いらないプロパティを除く

```typescript
type SafeUser = Omit<User, "password">;
// {
//   id: number;
//   name: string;
//   email: string;
// }
```

複数除くこともできます。

```typescript
type CreateUserInput = Omit<User, "id" | "password">;
```

### 使いどころ

- DB から取り出した型から **機密情報** を取り除く
- `id` のような **自動生成項目** を入力型から除く

```typescript
function createUser(input: Omit<User, "id">) {
  const id = generateId();
  return { id, ...input };
}
```

## Pick と Omit、どちらを使う？

「**残したい項目が少ないなら Pick、捨てたい項目が少ないなら Omit**」と覚えると迷いません。

```typescript
// 5 個中 2 個だけほしい → Pick
type Mini = Pick<User, "id" | "name">;

// 5 個中 1 個だけ捨てる → Omit
type WithoutPassword = Omit<User, "password">;
```

## 拡張する：Omit のあとに新プロパティを追加

「**型の一部を差し替える**」パターンは Omit と交差型の組み合わせで書けます。

```typescript
type RawUser = {
  id: number;
  createdAt: string; // 文字列で来る
};

type User = Omit<RawUser, "createdAt"> & {
  createdAt: Date; // Date に変換した型
};
// {
//   id: number;
//   createdAt: Date;
// }
```

API から来た文字列日時を Date 型に変換するときに重宝します。

## 注意：存在しないキーは指定できない

`Pick` / `Omit` の第 2 引数は、対象型の `keyof` に含まれる必要があります。

```typescript
type X = Pick<User, "address">;
// エラー：'address' は User のキーではない
```

タイポを型レベルで防いでくれるのは大きなメリットです。

## まとめ

|ユーティリティ型|やること|たとえば|
|---|---|---|
|`Pick<T, K>`|`T` から `K` のキーだけ取り出す|`PublicUser`、`LoginInput`|
|`Omit<T, K>`|`T` から `K` のキーを除く|`SafeUser`、`CreateUserInput`|

- 「残したい/捨てたい」どちらが少ないかで使い分け
- `Omit + 交差型` でプロパティ差し替えが書ける
- 存在しないキーはコンパイル時に弾かれる
