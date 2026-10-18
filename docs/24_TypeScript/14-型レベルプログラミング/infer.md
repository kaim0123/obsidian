# infer

## infer とは？

`infer` は、**条件型の中で「型の一部を変数として取り出す」**ためのキーワードです。
直訳すると「推論する」で、まさに「ここの型をなんでもいいので変数 `X` に取り出して」と TypeScript に指示します。

```typescript
type ReturnTypeOf<T> =
  T extends (...args: any[]) => infer R ? R : never;
```

「`T` が関数型だったら、その戻り値型を `R` として取り出して返す」という意味です。

## 一番身近な例：ReturnType

```typescript
function getUser() {
  return { name: "Alice", age: 25 };
}

type User = ReturnType<typeof getUser>;
// { name: string; age: number }
```

`ReturnType` は内部で `infer` を使って戻り値型を抽出しています。

## Parameters：引数の型を取り出す

```typescript
type Parameters<T> =
  T extends (...args: infer P) => any ? P : never;

type Args = Parameters<(a: string, b: number) => void>;
// [a: string, b: number]
```

引数全体を 1 つのタプル `P` として取り出しています。

## 配列の要素型を取り出す

```typescript
type ElementOf<T> = T extends (infer E)[] ? E : never;

type N = ElementOf<number[]>;            // number
type S = ElementOf<string[]>;            // string
type X = ElementOf<(string | number)[]>; // string | number
```

`(infer E)[]` で「**この配列の要素**を `E` に取り出す」と書けます。

## Promise の中身を取り出す

```typescript
type Awaited<T> = T extends Promise<infer R> ? R : T;

type R1 = Awaited<Promise<string>>;          // string
type R2 = Awaited<Promise<Promise<number>>>; // Promise<number>（1段だけ剥く）
```

> 標準の `Awaited<T>` はもっと再帰的で、入れ子の Promise も剥がしてくれます。

## 関数のオーバーロードと infer

複数のシグネチャがある関数では、`infer` は「**最後のシグネチャ**」にマッチします。

```typescript
function f(a: string): number;
function f(a: number): string;
function f(a: any): any { return a; }

type R = ReturnType<typeof f>; // string（最後のシグネチャの戻り値）
```

「想定していない型が出てきた」ときは、これを疑ってみてください。

## 文字列パターンからの抽出（テンプレートリテラル型）

`infer` は文字列リテラル型のマッチにも使えます。

```typescript
type GetUserId<S> = S extends `user:${infer Id}` ? Id : never;

type A = GetUserId<"user:123">;  // "123"
type B = GetUserId<"product:9">; // never
```

URL パターンや S3 キーなどから型レベルで情報を取り出せます（→ `template_literal_types.md`）。

## extends 句で制約を付ける

`infer` の隣に `extends` を書くと、「**この形で取り出せたものだけ**」を絞れます（TS 4.7 以降）。

```typescript
type FirstNumber<T> =
  T extends [infer First extends number, ...any[]] ? First : never;

type A = FirstNumber<[1, "a", 2]>; // 1
type B = FirstNumber<["a", 1]>;     // never
```

## 使うときのコツ

- **まず標準ユーティリティ型で十分か確認**（`ReturnType`, `Parameters`, `Awaited` など）
- **書いたら型コメントで意図を残す**（読み手の負荷が高い）
- **`never` フォールバックを忘れずに**（マッチしなかったときに何が返るかを明示）

## まとめ

- `infer` は条件型の中で「ここの型を取り出す」と書く
- 関数の戻り値、引数、配列要素、Promise の中身、文字列パターンなどに使える
- 強力だが読みにくくなりやすいので、必要最小限に
- 標準ユーティリティ型（`ReturnType`/`Parameters`/`Awaited`）は内部で `infer` を使った好例
