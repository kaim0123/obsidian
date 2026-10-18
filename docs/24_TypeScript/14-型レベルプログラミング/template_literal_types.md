# テンプレートリテラル型（Template Literal Types）

## テンプレートリテラル型とは？

JavaScript のテンプレートリテラル `` `Hello, ${name}` `` を **型レベル** で再現したものです。
**文字列リテラル型をパターンとして組み立て・分解**できる、強力な機能です。

```typescript
type Greeting = `Hello, ${string}`;

const a: Greeting = "Hello, Alice"; // OK
const b: Greeting = "Hi, Alice";    // エラー
```

## ユニオン型と組み合わせる

ユニオンを埋めると、自動的に **全パターン展開** されます。

```typescript
type Color = "red" | "blue";
type Size = "S" | "M" | "L";

type Variant = `${Color}-${Size}`;
// "red-S" | "red-M" | "red-L" | "blue-S" | "blue-M" | "blue-L"
```

ボタンや CSS クラスのような「全組み合わせ型」を 1 行で生成できます。

## 標準のユーティリティ：大文字/小文字変換

|型|意味|例|
|---|---|---|
|`Uppercase<S>`|全部大文字|`Uppercase<"abc">` → `"ABC"`|
|`Lowercase<S>`|全部小文字|`Lowercase<"ABC">` → `"abc"`|
|`Capitalize<S>`|先頭だけ大文字|`Capitalize<"abc">` → `"Abc"`|
|`Uncapitalize<S>`|先頭だけ小文字|`Uncapitalize<"Abc">` → `"abc"`|

```typescript
type Method = "get" | "post" | "delete";
type Handler = `handle${Capitalize<Method>}`;
// "handleGet" | "handlePost" | "handleDelete"
```

## infer と組み合わせる：パターン抽出

`infer` を組み合わせると、**文字列の一部分を取り出す**型が書けます。

```typescript
type GetParam<S> =
  S extends `${string}:${infer Param}` ? Param : never;

type A = GetParam<"id:42">;       // "42"
type B = GetParam<"user:alice">; // "alice"
```

URL ルーティングや S3 キーから情報を取り出すのに便利です。

```typescript
type RouteParams<S> =
  S extends `${string}:${infer P}/${infer Rest}`
    ? P | RouteParams<`/${Rest}`>
  : S extends `${string}:${infer P}`
    ? P
    : never;

type T = RouteParams<"/users/:id/posts/:postId">;
// "id" | "postId"
```

## キーリマップとの合わせ技

マップ型の `as` 句と組み合わせれば、**プロパティ名を文字列パターンで生成**できます。

```typescript
type EventHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (v: T[K]) => void;
};

type State = { name: string; age: number };

type H = EventHandlers<State>;
// {
//   onNameChange: (v: string) => void;
//   onAgeChange: (v: number) => void;
// }
```

React の Props 型を自動生成するときの定石です。

## よくあるユースケース

- **HTTP メソッド × パス**：`` `${Method} ${Path}` `` 形式の型を作る
- **CSS クラス**：`` `bg-${Color}-${Shade}` `` のようなユニオン展開
- **イベント名**：`` `on${EventName}` `` の生成
- **国際化キー**：`"home.title"` のようなドット区切り文字列の検証

## 注意点

- ユニオンの組み合わせは **型の本数を爆発** させる（`O(N×M)`）
- `string` を入れるとパターンマッチがゆるくなりすぎることがある
- 複雑になったら **コメント** で意図を残す

## まとめ

- テンプレートリテラル型は **文字列パターンを型で扱える**
- ユニオン型と組み合わせると全パターンが展開される
- `Uppercase` / `Capitalize` 系で大文字小文字を制御できる
- `infer` でパターン抽出、`as` 句でキー再マップが可能
- 強力だが、組み合わせ爆発と可読性に注意
