# Partial / Required / Readonly

「型のすべてのプロパティを一括で書き換える」ユーティリティ型のうち、**もっとも使う 3 つ**を解説します。

## Partial<T>：すべてのプロパティを「省略可」に

```typescript
type User = {
  id: number;
  name: string;
  email: string;
};

type PartialUser = Partial<User>;
// {
//   id?: number;
//   name?: string;
//   email?: string;
// }
```

### 使いどころ

「**一部のプロパティだけ更新する**」関数で大活躍します。

```typescript
function updateUser(id: number, patch: Partial<User>) {
  // patch には User の任意の項目だけが入る
}

updateUser(1, { name: "Bob" });               // OK
updateUser(1, { name: "Bob", email: "x@y" }); // OK
updateUser(1, {});                             // OK（注意：何も更新しない可能性）
```

### 注意

`Partial` は「**1 階層だけ**」省略可にします。ネストされたオブジェクトの中までは効きません。

```typescript
type Config = {
  server: { host: string; port: number };
};

type P = Partial<Config>;
// { server?: { host: string; port: number } }
// server の中の host/port はオプショナルにならない
```

深く適用したいなら `DeepPartial` を自作することになります（→ `自作ユーティリティ型.md`）。

## Required<T>：すべてのプロパティを「必須」に

`Partial` の逆です。`?` がついていたプロパティを全部必須にします。

```typescript
type Settings = {
  theme?: "light" | "dark";
  fontSize?: number;
};

type StrictSettings = Required<Settings>;
// {
//   theme: "light" | "dark";
//   fontSize: number;
// }
```

### 使いどころ

「**最終的にすべて埋まっていることを保証したい**」シーンで使います。

```typescript
const defaults: Required<Settings> = {
  theme: "light",
  fontSize: 14,
};

function applyDefaults(s: Settings): Required<Settings> {
  return { ...defaults, ...s };
}
```

「ユーザー入力時はオプショナル → 内部処理では必須」のように、**境界を超えるタイミング**で使うのが鉄則です。

## Readonly<T>：すべてのプロパティを「読み取り専用」に

代入や上書きを禁止します。

```typescript
type Point = { x: number; y: number };

const origin: Readonly<Point> = { x: 0, y: 0 };
// origin.x = 10; // エラー：代入できない
```

### 使いどころ

- 設定オブジェクト・定数
- 関数の引数を **「中身をいじらない」** ことを宣言したいとき

```typescript
function distance(p: Readonly<Point>) {
  // p.x = 0; // エラー：誤って書き換えるバグを防げる
  return Math.hypot(p.x, p.y);
}
```

### 注意

`Readonly` も **1 階層だけ**です。深い不変は `DeepReadonly` を自作するか、`as const` を組み合わせます。

```typescript
const config = { server: { host: "localhost" } } as const;
// config.server.host = "x"; // エラー
```

## 組み合わせ例

```typescript
type FormDraft = Partial<Required<User>>;
// 一度すべて必須にしてから省略可にする
// → 結果は Partial<User> と同じだが、意図を表現できる

type FrozenPartialUser = Readonly<Partial<User>>;
// 部分指定で、しかも書き換え不可
```

## まとめ

|ユーティリティ型|やること|よく使う場面|
|---|---|---|
|`Partial<T>`|全プロパティを `?` に|更新用 patch オブジェクト|
|`Required<T>`|全プロパティから `?` を除去|デフォルト値マージ後の型|
|`Readonly<T>`|全プロパティに `readonly` を付与|引数の不変保証、定数|

- どれも「**1 階層だけ**」変換することに注意
- 深い変換が必要なら自作ユーティリティ型を検討
- 「外部入力 → 内部処理」のような境界で使い分けると、型の安全度が一段上がる
