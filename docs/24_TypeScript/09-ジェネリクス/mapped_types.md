# マップ型（Mapped Types）

## マップ型とは？

**マップ型（mapped types）**は、「**既存の型のキーを 1 つずつまわって、新しい型を作る**」しくみです。
配列でいう `map()` の **型版** だと思ってください。

```typescript
type Original = { name: string; age: number };

type ReadonlyOriginal = {
  readonly [K in keyof Original]: Original[K];
};
// {
//   readonly name: string;
//   readonly age: number;
// }
```

`[K in keyof T]` がポイント。`T` のキーをひとつずつ `K` にバインドし、その値型を `T[K]` で参照します。

## 標準ユーティリティ型はマップ型でできている

```typescript
// 標準の定義（簡略）
type Partial<T>  = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
```

`?` や `readonly` を **付ける/外す**ことで、既存型を変換しています。

## モディファイア（修飾子）の付与・除去

- `?` を付ける：オプショナルにする
- `-?` を付ける：オプショナル指定を **外す**
- `readonly` を付ける：読み取り専用にする
- `-readonly` を付ける：読み取り専用を **外す**

```typescript
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type Frozen = { readonly x: number };
type Unfrozen = Mutable<Frozen>; // { x: number }
```

## キーの再マップ（as 句）：TS 4.1 以降

`as` を使うと、**キー名そのものを変換**できます。

```typescript
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

type User = { name: string; age: number };

type UserGetters = Getters<User>;
// {
//   getName: () => string;
//   getAge: () => number;
// }
```

「すべてのプロパティに `get` を付けた getter 関数群を作る」が型だけで書けます。

### キーをふるい落とす

`as` の結果が `never` になったキーは、**結果から消えます**。

```typescript
type StringKeys<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

type Mixed = { a: string; b: number; c: string };
type Only = StringKeys<Mixed>;
// { a: string; c: string }
```

## 値の型を変換する

キーを保ったまま、値だけ全部別の型にすることもできます。

```typescript
type Stringify<T> = {
  [K in keyof T]: string;
};

type S = Stringify<{ x: number; y: boolean }>;
// { x: string; y: string }
```

「全プロパティを `Promise` でくるむ」「全部 `null` 許容にする」など応用は無限です。

## ホモモーフィック（homomorphic）マップ型

`{ [K in keyof T]: ... }` のように **`keyof T` を直接** まわすマップ型を「ホモモーフィック」と呼びます。
このとき、`readonly` や `?` のような **元の修飾子を保持** する特性があります。

```typescript
type T = { readonly a: string; b?: number };

type Copy = { [K in keyof T]: T[K] };
// { readonly a: string; b?: number | undefined }
```

`Pick<T, "a">` などはこの性質を持ちます。`Pick` で取り出した型が `readonly` を保つのもこのおかげです。

## 注意点

- 複雑なマップ型は **読み手にも IDE にも重い**ので、用途を限定する
- `as` は強力ですが、`never` で意図せず大量のプロパティが消える事故に注意
- 標準ユーティリティ型で済むなら、まずそれを使う

## まとめ

- マップ型は型版の `map()`：**キーをまわって新しい型を作る**
- `?` と `readonly` は **`-?` / `-readonly`** で外せる
- `as` 句でキー名を再マップしたり、`never` でふるい落としたりできる
- ホモモーフィックなマップ型は元の修飾子を保つ
- 標準ユーティリティ型を読めば、マップ型の使い方が一気に身につく
