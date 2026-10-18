# ReturnType / Parameters

関数の **戻り値の型** や **引数の型** を、関数自身から取り出すユーティリティ型です。
「型を二重に書きたくない」DRY な型設計に欠かせません。

## ReturnType<T>：関数の戻り値型を取り出す

```typescript
function fetchUser(id: number) {
  return { id, name: "Alice", email: "a@example.com" };
}

type User = ReturnType<typeof fetchUser>;
// {
//   id: number;
//   name: string;
//   email: string;
// }
```

`typeof fetchUser` で関数の型を取り出し、`ReturnType` で戻り値型を抽出しています。

### 何が嬉しい？

戻り値の `User` 型を別途宣言しておくと、関数の実装と二重管理になります。
`ReturnType` を使えば、**関数の中身を変えただけで型も自動的に追従** します。

### Promise の中身を取り出す

`async` 関数の戻り値は `Promise<T>` なので、ひと工夫いります。

```typescript
async function fetchData() {
  return { ok: true, data: [1, 2, 3] };
}

type Result = Awaited<ReturnType<typeof fetchData>>;
// { ok: boolean; data: number[] }
```

`Awaited<T>` は Promise の中身を取り出すユーティリティ型です。

## Parameters<T>：関数の引数型を取り出す

```typescript
function createUser(name: string, age: number, email?: string) {
  return { name, age, email };
}

type Args = Parameters<typeof createUser>;
// [name: string, age: number, email?: string | undefined]
```

引数は **タプル型**（順序つきの配列型）として返ってきます。

### 個別に取り出す

```typescript
type FirstArg = Parameters<typeof createUser>[0]; // string
type SecondArg = Parameters<typeof createUser>[1]; // number
```

インデックスアクセスでひとつずつ取り出せます。

### 引数だけ流用したいときに便利

```typescript
function logCall(...args: Parameters<typeof createUser>) {
  console.log("calling createUser with", args);
  return createUser(...args);
}
```

ラッパー関数を書くときに、引数の型をそっくりそのまま受け継げます。

## ConstructorParameters / InstanceType（クラス用）

クラスにも対応するユーティリティ型があります。

```typescript
class Point {
  constructor(public x: number, public y: number) {}
}

type Args = ConstructorParameters<typeof Point>;
// [x: number, y: number]

type P = InstanceType<typeof Point>;
// Point（クラスのインスタンス型）
```

## 仕組み（中身を覗く）

これらはすべて、**条件型 + `infer`** で実装されています。

```typescript
// 標準ライブラリの定義（簡略）
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : never;

type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
```

`infer R` で「ここの型を一時変数 `R` に取り出す」と宣言しています（→ `03-高度な型/infer.md`）。

## 実務でのコツ

- ライブラリ関数の戻り値を再利用したいとき、まず `ReturnType` を試す
- ただし **「公開 API の型」は明示的に書く**（リファクタで意図せず型が変わるのを防ぐため）
- 関数を渡し回すラッパーには `Parameters` + spread が定石

## まとめ

|ユーティリティ型|やること|
|---|---|
|`ReturnType<T>`|関数の戻り値型を取り出す|
|`Parameters<T>`|関数の引数型をタプルで取り出す|
|`ConstructorParameters<T>`|クラスのコンストラクタ引数|
|`InstanceType<T>`|クラスのインスタンス型|
|`Awaited<T>`|Promise の中身を取り出す|

- 関数 → 型の **流用** に使うと、型の二重管理がなくなる
- `typeof 関数名` を組み合わせて使うのが鉄則
- 公開 API では、明示的に型を書く方が安全な場合もある
