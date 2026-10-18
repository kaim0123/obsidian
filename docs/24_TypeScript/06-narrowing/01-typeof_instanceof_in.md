# `typeof` / `instanceof` / `in` ── 3つの基本 narrowing

> **narrowing（型の絞り込み）** とは、ユニオン型などの広い型を `if` 文で「より狭い型」に絞り込むこと。`typeof` / `instanceof` / `in` はその基本3演算子です。これらを使いこなすと、`as` で無理やりキャストせずに型安全なコードが書けます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-判別可能ユニオン]]

---

## 1. narrowing とは

ユニオン型などの「**広い型**」を、特定のスコープで「**狭い型**」として扱う仕組み。

```typescript
function f(v: string | number) {
  v.toUpperCase(); // ❌ string | number にこのメソッドはない

  if (typeof v === "string") {
    v.toUpperCase(); // ✅ ここでは string に絞られる
  }
}
```

TypeScriptは `if` 文の条件を解析し、**そのブロック内では型が絞られる**と判断してくれます。これが narrowing の基本動作。

---

## 2. `typeof` 演算子

JavaScriptの `typeof` 演算子で、**プリミティブ型**を判定。

### `typeof` の戻り値（文字列）

| 値 | `typeof` の結果 |
|---|---|
| `"hello"` | `"string"` |
| `42` | `"number"` |
| `true` | `"boolean"` |
| `42n` | `"bigint"` |
| `Symbol()` | `"symbol"` |
| `undefined` | `"undefined"` |
| `() => {}` | `"function"` |
| `null` | `"object"`（仕様の歴史的バグ） |
| `{}`, `[]` | `"object"` |

### narrowing 例

```typescript
function process(v: string | number | boolean | null) {
  if (typeof v === "string") {
    v.toUpperCase();    // ✅ string
  } else if (typeof v === "number") {
    v.toFixed(2);       // ✅ number
  } else if (typeof v === "boolean") {
    v.valueOf();        // ✅ boolean
  } else {
    v;                  // ✅ null（残り）
  }
}
```

### 関数の判定

```typescript
function call(v: (() => void) | string) {
  if (typeof v === "function") {
    v();         // ✅ () => void
  } else {
    v.length;    // ✅ string
  }
}
```

### `typeof null === "object"` の罠

```typescript
function f(v: object | null) {
  if (typeof v === "object") {
    v;     // ❌ object | null（null も入る！）
    v.toString(); // 実行時エラーの可能性
  }
}
```

→ **`null` を別途チェック**する。

```typescript
if (typeof v === "object" && v !== null) {
  v; // ✅ object
}
```

---

## 3. `instanceof` 演算子

JavaScriptの `instanceof` で、**クラスのインスタンス**を判定。

```typescript
class Dog { bark() {} }
class Cat { meow() {} }

function pet(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark();  // ✅ Dog
  } else {
    animal.meow();  // ✅ Cat
  }
}
```

### 組み込みクラスの判定

```typescript
function handle(v: Date | Error | string) {
  if (v instanceof Date) {
    v.toISOString();
  } else if (v instanceof Error) {
    v.message;
  } else {
    v.toUpperCase();
  }
}
```

### catch 節での Error 判定

```typescript
try {
  // ...
} catch (err) {
  // err: unknown
  if (err instanceof Error) {
    console.error(err.message);
    console.error(err.stack);
  } else {
    console.error("non-Error thrown:", err);
  }
}
```

`err` は `unknown` なので、`instanceof Error` で絞り込むのが定番。

### `instanceof` の落とし穴

#### (1) クラス継承の階層

```typescript
class Animal {}
class Dog extends Animal {}

const d = new Dog();
d instanceof Dog;     // true
d instanceof Animal;  // true（親クラスのインスタンスでもある）
```

「`Dog` のみ」の判定にはならない。

#### (2) 別 realm（iframe など）からの値

```typescript
// iframe からもらった配列
const fromFrame = ...;
fromFrame instanceof Array; // false（別realm の Array コンストラクタ）

Array.isArray(fromFrame);   // true（こちらが堅牢）
```

→ 配列判定は `Array.isArray` を使う。

#### (3) インターフェース・type は instanceof 不可

```typescript
type User = { name: string };
const u: User = { name: "Alice" };
u instanceof User; // ❌ User はランタイムには存在しない（型のみ）
```

→ ユーザー定義型ガードか `in` を使う（後述）。

---

## 4. `in` 演算子

オブジェクトに**特定のプロパティが存在するか**を判定。

```typescript
type Bird = { fly(): void };
type Fish = { swim(): void };

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly();   // ✅ Bird
  } else {
    animal.swim();  // ✅ Fish
  }
}
```

### 用途

- **クラスでない**オブジェクト型を絞り込みたい（`instanceof` が使えない）
- **判別子フィールドがない**ユニオン型を絞り込みたい

### 注意: プロパティの「存在」だけ見る

```typescript
type A = { x: number };
type B = { x: string };

function f(v: A | B) {
  if ("x" in v) {
    v; // ❌ どちらも x を持つので絞り込めない
  }
}
```

`in` は**プロパティの有無**しか判定しない。型の違いには使えない。

### `null`/`undefined` には使えない

```typescript
function f(v: { x: number } | null) {
  if ("x" in v) { // ❌ TypeError: Cannot use 'in' operator to search for 'x' in null
  }
}
```

→ 先に `null` チェックが必要。

```typescript
if (v !== null && "x" in v) {
  // ✅
}
```

---

## 5. 3つの使い分け

| 演算子 | 用途 | 例 |
|---|---|---|
| `typeof` | **プリミティブ型** の判定 | `typeof v === "string"` |
| `instanceof` | **クラスのインスタンス** | `v instanceof Date` |
| `in` | **プロパティの存在** | `"name" in v` |

### 判断フロー

```
narrowingしたい
  ├─ プリミティブか？
  │    → typeof
  ├─ クラスのインスタンスか？
  │    → instanceof（ただし配列は Array.isArray）
  ├─ オブジェクトのプロパティ有無か？
  │    → in
  └─ 上記で表現できない複雑な構造？
       → 判別可能ユニオン or ユーザー定義型ガード
```

---

## 6. その他の narrowing パターン

### (1) 等価性チェック

```typescript
function f(x: string | number, y: string | boolean) {
  if (x === y) {
    x; // string（両方の型に共通する型）
    y; // string
  }
}
```

`===` での比較も narrowing に効く。

### (2) リテラルとの比較

```typescript
function f(s: "a" | "b" | "c") {
  if (s === "a") {
    s; // "a"
  } else {
    s; // "b" | "c"
  }
}
```

### (3) `Array.isArray`

```typescript
function f(v: string | string[]) {
  if (Array.isArray(v)) {
    v; // string[]
  } else {
    v; // string
  }
}
```

`instanceof Array` より**安全**（別realm問題を回避）。

### (4) truthiness チェック（`if (v)`）

```typescript
function f(v: string | undefined) {
  if (v) {
    v; // string（undefined と空文字を除外）
  }
}
```

ただし `0` `""` も falsy なので注意:

```typescript
function f(n: number | undefined) {
  if (n) {
    n; // number（ただし 0 も除外される！）
  }
  if (n !== undefined) {
    n; // number（0 も含む）
  }
}
```

→ `null`/`undefined` を弾きたいなら `!== undefined` / `!= null` を使う方が安全。

### (5) discriminant property（判別子）

```typescript
type Action = { type: "ADD" } | { type: "REMOVE" };

function reducer(a: Action) {
  if (a.type === "ADD") {
    a; // { type: "ADD" }
  }
}
```

→ [[02-判別可能ユニオン]] で詳述。

---

## 7. narrowing のスコープ

絞り込まれた型は **そのブロックの中**だけ有効。

```typescript
function f(v: string | number) {
  if (typeof v === "string") {
    v.toUpperCase(); // ✅
  }
  v.toUpperCase(); // ❌ ここでは string | number に戻っている
}
```

### 早期リターンで広く使う（**型ガード型のリターン**）

```typescript
function f(v: string | number) {
  if (typeof v !== "string") return;
  // ↓ 以降は string として扱える
  v.toUpperCase();
  v.split("");
}
```

「**否定で早期リターン**」のパターンは可読性が高く、ネストも浅くなる。

---

## 8. narrowing が「リセット」されるケース

### (1) 関数呼び出しを挟むと

```typescript
function f(v: { name?: string }) {
  if (v.name !== undefined) {
    v.name.toUpperCase();  // ✅
    doSomething();
    v.name.toUpperCase();  // ❌ name が undefined に戻ってる可能性
  }
}
```

`doSomething()` の中で `v.name` が `undefined` に書き換えられた可能性をTypeScriptは想定する。**ローカル変数に取り出す**のが安全:

```typescript
const name = v.name;
if (name !== undefined) {
  name.toUpperCase();
  doSomething();
  name.toUpperCase(); // ✅
}
```

### (2) 別のスコープに入る

```typescript
function f(v: string | undefined) {
  if (v !== undefined) {
    const handler = () => {
      v.toUpperCase(); // ❌ クロージャ内では undefined の可能性
    };
  }
}
```

→ ローカル変数に取り出す。

```typescript
const s = v;
if (s !== undefined) {
  const handler = () => {
    s.toUpperCase(); // ✅
  };
}
```

---

## 9. よくある間違い

### (1) `typeof null === "object"` を忘れる

```typescript
if (typeof v === "object") {
  v.toString(); // null の可能性
}
```

→ `&& v !== null`。

### (2) `instanceof Array` を使う

```typescript
if (v instanceof Array) { ... } // 別realm問題
```

→ `Array.isArray(v)`。

### (3) `if (v)` で `0` や `""` を弾いてしまう

```typescript
function isReady(n: number | undefined): boolean {
  if (n) return true; // n === 0 も false 扱い
  return false;
}
```

→ `n !== undefined`。

### (4) `as` で済ませる

```typescript
function f(v: string | number) {
  const s = v as string; // ❌
  s.toUpperCase();
}
```

→ `typeof` で絞る。

### (5) narrowing が効かないパターンに気付かない

```typescript
function f(v: { x?: number }) {
  if (v.x !== undefined) {
    [1].forEach(() => v.x.toFixed()); // ❌ コールバック内で再評価される
  }
}
```

→ ローカル変数に取り出す。

---

## 10. まとめ

- **narrowing** = ユニオン型を `if` 文で狭める仕組み
- **`typeof`**: プリミティブ判定（ただし `typeof null === "object"`）
- **`instanceof`**: クラスインスタンス判定（配列は `Array.isArray`）
- **`in`**: プロパティ存在判定（型の違いは見ない）
- **早期リターン**で広く絞り込むのが読みやすい
- **関数呼び出し / クロージャ**で narrowing がリセットされることに注意 → ローカル変数化

> 3つの基本 narrowing を使いこなせると、`as` の出番がほぼ無くなります。「絞り込めない型は設計が悪い」と疑える力が、ここから育ちます。

---

## 関連
- [[02-判別可能ユニオン]]
- [[03-ユーザー定義型ガード]]
- [[04-assertsアサーション関数]]
- [[05-null安全とstrictNullChecks]]
