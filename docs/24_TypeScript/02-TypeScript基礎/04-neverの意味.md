# `never` の意味（到達不能・網羅性）

> `never` は「**絶対に値が存在しない**」という型です。一見使い道が分かりにくいですが、**「ここに到達したらバグ」という意図をコンパイラに伝える道具**として、保守性の高いコードに不可欠です。

## 目次
- [[01Programming/目次|← 教材目次に戻る]]
- 前: [[03-unknownと安全な取り扱い]]
- 次: [[05-リテラル型とas-const]]

---

## 1. `never` とは何か

`never` は **「絶対に存在しない値」** を表す型です。`null` や `undefined` ですら値ですが、`never` は**値そのものがない**状態を表します。

```typescript
let n: never;
n = 1;          // ❌ Type 'number' is not assignable to type 'never'.
n = undefined;  // ❌
n = null;       // ❌
n = "anything"; // ❌
```

**何も代入できない**型 ── それが `never` です。

---

## 2. `never` が現れる3つのパターン

### パターン1: 例外を投げて戻ってこない関数

```typescript
function fail(message: string): never {
  throw new Error(message);
}
```

`throw` で関数が終了するので、戻り値は**存在しません**。

### パターン2: 無限ループの関数

```typescript
function loop(): never {
  while (true) {
    // 終わらない
  }
}
```

戻ってこないので、戻り値の型も `never`。

### パターン3: 矛盾した型の交差・絞り込み結果

```typescript
type Impossible = string & number; // never（重なる値がない）

function process(v: string) {
  if (typeof v === "number") {
    // ここでは v: never（string でかつ number は不可能）
    v;
  }
}
```

「**論理的にあり得ない型**」は自動で `never` になります。

---

## 3. なぜ `never` 型の戻り値を明示するのか

```typescript
function fail(msg: string): never {
  throw new Error(msg);
}

function getUser(id: string): User {
  if (id === "") {
    fail("id is empty"); // ここで終わる
  }
  // ↓ コンパイラは「failの後は到達しない」と理解する
  return loadUser(id);
}
```

戻り値型が `never` だと、**コンパイラが「この関数の後ろは到達しない」と認識**してくれます。これにより:

- 「return 文がない」エラーが出なくなる
- 後続コードの型推論が正しく続く
- 関数の意図（必ずthrowする）が型で明示される

戻り値型を書かないと、上記の効果が得られません。

```typescript
// ❌ 推論結果は void（throwすることが伝わらない）
function fail(msg: string) {
  throw new Error(msg);
}

function getUser(id: string): User {
  if (id === "") {
    fail("id is empty");
  }
  return loadUser(id); // ✅ 通るが、failがthrowしないと信じている
}
```

> **アサーション関数とアサーション系の戻り値**は `never` でないと正しく機能しません。`asserts` 構文（後述）と組み合わせて初めて真価を発揮します。

---

## 4. 網羅性チェック（exhaustiveness check）── `never` 最大の使いどころ

`never` の最重要用途は **「switch文の漏れをコンパイル時に検出する」** ことです。

### 例: 図形の面積計算

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "square":
      return s.side ** 2;
    default:
      const _exhaustive: never = s; // ✅ ここに到達したらバグ
      throw new Error(`unhandled: ${_exhaustive}`);
  }
}
```

このコードはOK。

### 後で `triangle` を追加すると…

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number }
  | { kind: "triangle"; base: number; height: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "square":
      return s.side ** 2;
    default:
      const _exhaustive: never = s;
      // ❌ Type '{ kind: "triangle"; ... }' is not assignable to type 'never'.
      throw new Error(`unhandled: ${_exhaustive}`);
  }
}
```

`triangle` ケースを書き忘れた瞬間に **コンパイルエラー** になります。

> **これがTypeScriptで最も価値のあるパターンの1つ**。型を1か所変えれば、対応漏れが全部炙り出される。

### ヘルパー関数化

毎回 `_exhaustive: never` を書くのが面倒なら、ヘルパーにまとめる。

```typescript
function assertNever(x: never): never {
  throw new Error(`unhandled value: ${JSON.stringify(x)}`);
}

function area(s: Shape): number {
  switch (s.kind) {
    case "circle": return Math.PI * s.radius ** 2;
    case "square": return s.side ** 2;
    default: return assertNever(s);
  }
}
```

---

## 5. ユニオン型と `never` の関係

`never` は**ユニオン型に含まれていても消える**性質があります。

```typescript
type T = string | never; // 結果: string
type U = number | never | boolean; // 結果: number | boolean
```

理由: `never` は「値が存在しない」ので、合併集合に何も追加しないから。

### 応用: `Exclude` の動作

```typescript
type Without<T, U> = T extends U ? never : T;
type Result = Without<"a" | "b" | "c", "b">;
//   ^ "a" | "c"
```

`extends U` だった分岐は `never` になり、ユニオンから消える。これは TypeScript の `Exclude<T, U>` の中身そのものです。

---

## 6. `never[]` と空配列

```typescript
const empty = []; // 型: any[]（noImplicitAny でも警告されない）

const typed: never[] = []; // 型: never[]（何も入れられない）
typed.push(1); // ❌
```

`never[]` は「**何も入っていない、入れることもできない配列**」。型推論で意図せず現れることがあるので注意。

---

## 7. `asserts` と `never` の組み合わせ

TypeScript 3.7以降の **アサーション関数**は `never` と相性抜群。

```typescript
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    throw new Error("not a string");
  }
}

function process(v: unknown) {
  assertIsString(v);
  v.toUpperCase(); // ✅ string として扱える
}
```

`assertIsString` の中で投げる関数を `never` 型にすれば、型システムが正しく追従できます。

```typescript
function fail(msg: string): never {
  throw new Error(msg);
}

function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    fail("not a string"); // never なのでここで終わると認識される
  }
}
```

---

## 8. `never` を見たら疑うこと

開発中、意図せず変数が `never` になることがあります。原因を整理しておきましょう。

### (1) 矛盾する narrowing

```typescript
function f(x: string) {
  if (typeof x === "number") {
    x; // never（string が number になることはない）
  }
}
```

→ ロジックの間違い。条件を見直す。

### (2) 空配列の推論

```typescript
const arr = []; // any[]
arr.push(1);
const filtered = arr.filter((x): x is never => false); // never[]
```

→ 意図しない `never[]` になっていないか確認。

### (3) 型エラーの結果

```typescript
type T = "a" | "b";
type U = Exclude<T, "a" | "b">; // never（全部除外された）
```

→ ジェネリクスの組み立てミスでよくある。

---

## 9. `void` との違い

`never` と `void` は混同されやすいので整理。

| 観点 | `void` | `never` |
|---|---|---|
| 意味 | 戻り値を「使わない」 | 戻り値が「存在しない」 |
| 関数が終わる | 終わる（暗黙の `undefined` を返す） | 終わらない（throw / 無限ループ） |
| 代入 | `undefined` のみ可 | 何も代入できない |
| サブタイプ | `void` は他のすべての型のスーパータイプ的扱い | `never` は他のすべての型の**サブタイプ** |

```typescript
function logMessage(msg: string): void {
  console.log(msg); // 戻り値はundefined
}

function fail(msg: string): never {
  throw new Error(msg); // 戻ってこない
}
```

---

## 10. まとめ

- `never` = **「絶対に存在しない値」の型**
- 現れる場面: **throw する関数 / 無限ループ / 矛盾した型**
- 最大の用途: **網羅性チェック**（switch文の漏れを型で防ぐ）
- ヘルパー: `function assertNever(x: never): never` を1個用意して使い回す
- ユニオンに混ぜると消える（`string | never` → `string`）
- `asserts` 関数と組み合わせると、ランタイム検証が型に反映される

> `never` を使いこなせるようになると、**「コードに穴ができたらコンパイラが教えてくれる」**世界に住めます。これは保守性において革命的な体験です。

---

## 関連
- [[02-anyを避ける理由と最小限の逃げ道]]
- [[03-unknownと安全な取り扱い]]
- [[any_unknown_never]]
