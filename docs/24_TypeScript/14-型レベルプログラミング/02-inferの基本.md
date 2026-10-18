# `infer` の基本

> `infer` は条件型の中で「**型の一部を取り出して名前を付ける**」キーワード。`Promise<T>` の `T`、関数の戻り値、配列の要素型 ── これらを抽出するすべての標準ユーティリティ型は `infer` を使っています。最初は魔法に見えますが、構造は驚くほどシンプル。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-条件型]]
- 次: [[03-テンプレートリテラル型]]

---

## 1. `infer` とは

条件型 `T extends パターン ? X : Y` の**パターン部分**で、型の一部を**変数（`infer X`）として取り出す**仕組み。

```typescript
type ArrayElement<T> = T extends (infer E)[] ? E : never;

type A = ArrayElement<number[]>;  // number
type B = ArrayElement<string[]>;  // string
type C = ArrayElement<boolean>;    // never （配列でない）
```

→ 「`T` が **`E[]` の形**なら、**E** を返す」。

---

## 2. 構文の理解

```typescript
T extends Pattern<infer X> ? X : Y
```

- `Pattern` の中で **`infer X`** と書くと、その位置の型を取り出して `X` という型変数に**バインド**
- 条件にマッチしたら `X` が使える
- マッチしなければ `Y`

### 直感的な読み方

```typescript
T extends Promise<infer U> ? U : T
//                ↑ ここが「U」として取り出される
```

「**T が `Promise<何か>` の形なら、その「何か」を U として返す**」。

---

## 3. 標準ユーティリティ型での使われ方

### `ReturnType<T>`

```typescript
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

→ 関数型 `(...args: any) => R` の `R` を取り出す。

### `Parameters<T>`

```typescript
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
```

→ 引数のタプル `P` を取り出す。

### `Awaited<T>`（簡易版）

```typescript
type Awaited<T> = T extends Promise<infer U> ? U : T;
```

→ `Promise<X>` の `X` を取り出す。

### `ConstructorParameters<T>`

```typescript
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;
```

→ コンストラクタの引数を取り出す。

---

## 4. 様々な「位置」での `infer`

### 関数戻り値

```typescript
type RT<T> = T extends (...args: any) => infer R ? R : never;
```

### 関数引数（タプル）

```typescript
type PT<T> = T extends (...args: infer P) => any ? P : never;
```

### 配列の要素

```typescript
type AE<T> = T extends (infer E)[] ? E : never;
```

### Promise の中身

```typescript
type PV<T> = T extends Promise<infer V> ? V : never;
```

### オブジェクトのプロパティ

```typescript
type GetName<T> = T extends { name: infer N } ? N : never;

type A = GetName<{ name: "Alice"; age: 30 }>; // "Alice"
type B = GetName<{ age: 30 }>;                 // never
```

### タプルの先頭・末尾

```typescript
type Head<T> = T extends [infer H, ...any[]] ? H : never;
type Tail<T> = T extends [any, ...infer R] ? R : never;
type Last<T> = T extends [...any[], infer L] ? L : never;

type A = Head<[1, 2, 3]>; // 1
type B = Tail<[1, 2, 3]>; // [2, 3]
type C = Last<[1, 2, 3]>; // 3
```

---

## 5. 複数の `infer`

1つの条件型に**複数の `infer`** を書ける:

```typescript
type Pair<T> = T extends [infer A, infer B] ? { first: A; second: B } : never;

type R = Pair<[string, number]>;
// { first: string; second: number }
```

### 関数の引数と戻り値を同時に取り出す

```typescript
type FnInfo<T> = T extends (...args: infer P) => infer R
  ? { params: P; returns: R }
  : never;

type Info = FnInfo<(a: string, b: number) => boolean>;
// { params: [string, number]; returns: boolean }
```

---

## 6. 実例: 様々な抽出

### 配列の最初の要素

```typescript
type FirstOf<T> = T extends [infer F, ...any[]] ? F : never;

type A = FirstOf<[1, 2, 3]>; // 1
```

### Promise を再帰的に剥がす

```typescript
type DeepAwait<T> = T extends Promise<infer U> ? DeepAwait<U> : T;

type A = DeepAwait<Promise<Promise<string>>>; // string
```

### Map のキーと値

```typescript
type MapKeys<T> = T extends Map<infer K, any> ? K : never;
type MapValues<T> = T extends Map<any, infer V> ? V : never;

type K = MapKeys<Map<string, number>>;   // string
type V = MapValues<Map<string, number>>; // number
```

### イベントハンドラの引数型

```typescript
type EventArg<T> = T extends (event: infer E) => void ? E : never;

type A = EventArg<(e: MouseEvent) => void>; // MouseEvent
```

---

## 7. `infer extends X` ── 型制約付き infer (TS 4.7+)

抽出する型に**制約**を付けられる:

```typescript
type ToNumber<T> = T extends `${infer N extends number}` ? N : never;

type A = ToNumber<"42">;    // 42
type B = ToNumber<"hello">; // never
```

→ テンプレートリテラル型と組み合わせると強力。詳しくは [[03-テンプレートリテラル型]]。

---

## 8. ユニオン型と `infer`

「裸の型変数」と組み合わさると、**分配法則**が働く:

```typescript
type ArrayOf<T> = T extends (infer E)[] ? E : never;

type R = ArrayOf<string[] | number[]>;
// → ArrayOf<string[]> | ArrayOf<number[]>
// = string | number
```

→ 各メンバーごとに `infer` が動く。

### 一括で取り出したいときは `[T]` で包む

```typescript
type AllElements<T> = [T] extends [(infer E)[]] ? E : never;
```

---

## 9. ジェネリクス関数の `infer`

呼び出し時の型推論にも `infer` が使われている:

```typescript
function first<T>(arr: T[]): T { return arr[0]; }
//             ↑ T は呼び出し時に推論される
```

これは表面的には `infer` を書かないが、**TypeScript内部では同じ仕組み**。

---

## 10. 実例: `Get`（深いプロパティ取得）

```typescript
type Get<T, P extends string> =
  P extends `${infer Key}.${infer Rest}`
    ? Key extends keyof T
      ? Get<T[Key], Rest>
      : never
    : P extends keyof T
    ? T[P]
    : never;

type A = Get<{ a: { b: { c: number } } }, "a.b.c">; // number
```

→ テンプレートリテラル型 + `infer` + 再帰の組み合わせ。詳細は [[03-テンプレートリテラル型]]・[[04-再帰型]]。

---

## 11. 実例: `Promisify`（コールバックを Promise に）

```typescript
type Promisify<T> = T extends (
  ...args: [...infer Args, (err: any, result: infer R) => any]
) => any
  ? (...args: Args) => Promise<R>
  : never;

type Original = (a: string, cb: (err: Error | null, result: number) => void) => void;
type Promised = Promisify<Original>;
// (a: string) => Promise<number>
```

→ Node.js の `util.promisify` の型定義はこんな感じ。

---

## 12. `infer` の落とし穴

### (1) パターンに合わないと `never`

```typescript
type AE<T> = T extends (infer E)[] ? E : never;
type R = AE<string>; // never
```

→ `: never` ブランチを意識する。

### (2) `infer` の位置を間違える

```typescript
type Wrong<T> = T extends infer E ? E[] : never;
// 何を取り出してるか不明瞭
```

→ `infer` は**抽出したい位置**に置く。

### (3) 複数の `infer` で同じ名前

```typescript
type Wrong<T> = T extends [infer A, infer A] ? A : never;
// A が ユニオンになる: T = [string, number] なら A = string | number
```

→ 同じ名前で複数書くと**ユニオン**として推論される。意図的でなければ別名に。

### (4) 共変・反変位置の挙動

```typescript
type Param<T> = T extends (x: infer P) => any ? P : never;
// 引数位置（反変）の infer は intersection 的に動くことも
```

→ 関数引数で複数のオーバーロードがあると、`infer` が予想外の動きをすることがある。

### (5) `any` への extends

```typescript
type T<X> = X extends any ? X : never; // 分配のためだけに使う
```

→ `extends any` は何にでもマッチする（分配を起こす目的）。

---

## 13. デバッグのコツ

### VSCode のホバーで型展開を確認

```typescript
type R = ReturnType<typeof someFn>;
//   ↑ ホバーで確認
```

### 中間型に切り出して確認

```typescript
type Step1<T> = T extends (...args: any) => infer R ? R : never;
type Step2 = Step1<typeof fn>;
```

複雑な条件型は段階的に。

### `Prettify<T>` で展開

```typescript
type Prettify<T> = { [K in keyof T]: T[K] } & {};

type R = Prettify<ComplexType>;
// VSCodeで全プロパティが展開されて見える
```

---

## 14. ベストプラクティス

### (1) **シンプルに保つ**

```typescript
// ✅ 1段階
type AE<T> = T extends (infer E)[] ? E : never;

// △ 多段
type AE2<T> = T extends infer X ? X extends (infer E)[] ? E : never : never;
```

→ 必要以上に複雑にしない。

### (2) **JSDocで意図と例を書く**

```typescript
/**
 * 配列型から要素型を取り出す。配列でなければ never。
 * @example
 * type T = ArrayElement<number[]>; // number
 */
type ArrayElement<T> = T extends (infer E)[] ? E : never;
```

### (3) **標準ユーティリティ型を再発明しない**

`ReturnType` `Parameters` `Awaited` などは標準にある。`type-fest` も豊富。

### (4) **「アプリコード」では使わない**

`infer` は**ライブラリ型・ユーティリティ型**で活躍。アプリの業務ロジックでは登場頻度低い。

### (5) **複雑になったら中間型に分解**

可読性のため、3段階以上にネストしたら分解。詳しくは [[05-読める型のための命名と分割]]。

---

## 15. アンチパターン

### (1) **使わなくてよい場面で使う**

```typescript
type T<X> = X extends infer Y ? Y : never; // = X
```

→ 何の意味もない。

### (2) **同じものを `infer` で抽出して `keyof` で取れる**

```typescript
type GetKeys<T> = T extends { [K: string]: infer V } ? string : never;

// シンプルに:
type GetKeys<T> = keyof T;
```

### (3) **`infer` を多重ネスト**

```typescript
type X<T> = T extends Promise<infer A>
  ? A extends (...args: infer B) => infer C
    ? C extends Promise<infer D>
      ? D
      : C
    : A
  : T;
```

→ 読めない。**型をテストにかける** + **JSDoc必須**。

### (4) **エラーメッセージが残念な型**

```typescript
type Bad<T> = T extends ... ? ... : never;
// バグった時、利用側で `never` だけ返ってくる
```

→ 失敗時にもう少し情報が残るような設計を考える（`{ error: "..." }` を返すなど）。

---

## 16. まとめ

- **`infer X`** = 条件型のパターンの中で「**型の一部を取り出して名前を付ける**」
- 関数戻り値・引数・配列要素・Promise中身・タプル要素など、**様々な位置**で使える
- 複数の `infer` も同時に使える
- TS 4.7+ の **`infer X extends Y`** で型制約付き
- 標準ユーティリティ型 (`ReturnType` / `Parameters` / `Awaited`) はすべてこれ
- 落とし穴: パターン不一致で `never` / 同名 `infer` がユニオン化 / 過度なネストで読めなくなる

> `infer` は「**型から型を取り出す万能ツール**」。Promise/関数/配列など**構造を持つ型から中身を抽出**できると、ライブラリの型が読めるようになり、自作型の表現力が一気に広がります。

---

## 関連
- [[01-条件型]]
- [[03-テンプレートリテラル型]]
- [[04-再帰型]]
- [[05-読める型のための命名と分割]]
- [[04-ReturnType_Parameters]]
