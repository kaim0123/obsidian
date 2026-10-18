# Exclude / Extract

ユニオン型から **特定のメンバーだけ抜き出す/除く** ためのユーティリティ型です。
`Pick`/`Omit` がオブジェクトの「キー」に対する操作だったのに対し、`Exclude`/`Extract` は **ユニオンそのもの** に対する操作です。

## Exclude<T, U>：T から U に該当するものを取り除く

```typescript
type Status = "pending" | "approved" | "rejected" | "draft";

type FinalStatus = Exclude<Status, "pending" | "draft">;
// "approved" | "rejected"
```

「**マイナスする**」イメージです。

### よくある使い方

```typescript
type Mixed = string | number | boolean;
type WithoutBoolean = Exclude<Mixed, boolean>;
// string | number

type NotNull<T> = Exclude<T, null | undefined>;
// （標準には NonNullable<T> もあるが、自作するときの定石）
```

## Extract<T, U>：T から U に該当するものだけを残す

```typescript
type Status = "pending" | "approved" | "rejected" | "draft";

type Pending = Extract<Status, "pending" | "draft">;
// "pending" | "draft"
```

「**フィルタする**」イメージです。

### 関数型から関数だけ抜き出す

```typescript
type Mixed = string | (() => void) | number | (() => string);

type FunctionsOnly = Extract<Mixed, Function>;
// (() => void) | (() => string)
```

## 仕組み：分配（distributive）条件型

`Exclude` / `Extract` の中身はとてもシンプルで、**条件型 + ユニオンの分配** の組み合わせです。

```typescript
// 標準ライブラリの定義（簡略版）
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
```

ユニオン型に対して条件型を適用すると、各メンバーごとに分配されて評価されます。

```typescript
// "a" extends "a"|"b" → never
// "b" extends "a"|"b" → never
// "c" extends "a"|"b" → "c"
// 結果: never | never | "c" = "c"
type R = Exclude<"a" | "b" | "c", "a" | "b">; // "c"
```

`never` を含むユニオンは、`never` が消滅するというルールがあります。

## 実務での組み合わせ例

### キーの一部を抜き出す

```typescript
type User = { id: number; name: string; email: string; password: string };

type SensitiveKeys = "password";
type SafeKeys = Exclude<keyof User, SensitiveKeys>;
// "id" | "name" | "email"

type SafeUser = Pick<User, SafeKeys>;
// = Omit<User, "password"> と同等
```

`Omit<T, K>` は内部的にこのパターンで実装されています。

### 関数のシグネチャから特定オーバーロードを除く

```typescript
type Handler =
  | ((x: number) => void)
  | ((x: string) => void)
  | ((x: boolean) => void);

type StringHandler = Extract<Handler, (x: string) => void>;
// (x: string) => void
```

## まとめ

|ユーティリティ型|やること|イメージ|
|---|---|---|
|`Exclude<T, U>`|`T` から `U` のメンバーを **除く**|引き算|
|`Extract<T, U>`|`T` から `U` のメンバーを **残す**|フィルタ|

- 操作対象は **ユニオン型のメンバー**（`Pick`/`Omit` のキーとは別）
- 中身は条件型 + 分配のシンプルな仕組み
- `keyof` と組み合わせると、`Omit` 相当の処理を自分で書ける
- ユニオン型の整理には強力な武器になる
