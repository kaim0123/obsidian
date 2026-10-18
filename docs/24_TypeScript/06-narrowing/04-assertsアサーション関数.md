# `asserts` によるアサーション関数

> アサーション関数は「**条件を満たさなければ throw する**」関数を書くための仕組み。型ガード（`is T`）と並ぶ narrowing の手段で、「**この行を通過したら型は確定している**」というスタイルが書けます。テスト・バリデーション・防御的プログラミングで威力を発揮します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[03-ユーザー定義型ガード]]
- 次: [[05-null安全とstrictNullChecks]]

---

## 1. アサーション関数とは

戻り値型に **`asserts ...`** と書く特殊な関数。「**この関数が正常に終わったら、引数は指定の型である**」とTypeScriptに伝える。

```typescript
function assertIsString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    throw new Error("Expected string");
  }
}

function f(v: unknown) {
  assertIsString(v);
  v.toUpperCase(); // ✅ ここでは v: string
}
```

`assertIsString(v)` を呼んだ後の行は、**`v` が `string` だと仮定して扱える**。

### 構文の種類

```typescript
// (1) 型を絞り込む
function assertIsT(v: unknown): asserts v is T { ... }

// (2) 真偽値を保証する（条件アサーション）
function assert(condition: unknown): asserts condition { ... }
```

---

## 2. 型ガード（`is T`）との違い

| 観点 | 型ガード（`is T`） | アサーション（`asserts T`） |
|---|---|---|
| 戻り値 | `boolean` | `void`（外れたら throw） |
| 使い方 | `if (isT(v)) { /* ↓ T として扱える */ }` | `assertT(v); /* ↓ 以降ずっと T */ |
| narrowing 範囲 | `if` ブロック内のみ | 関数呼び出し**以降**全部 |
| 継続できる | 失敗してもコードが続く | 失敗で throw・関数終了 |

### 型ガードの例

```typescript
function isString(v: unknown): v is string { return typeof v === "string"; }

function f(v: unknown) {
  if (isString(v)) {
    v.toUpperCase(); // ✅ ここだけ
  }
  // ここでは v: unknown に戻る
}
```

### アサーションの例

```typescript
function assertString(v: unknown): asserts v is string {
  if (typeof v !== "string") throw new Error("not string");
}

function f(v: unknown) {
  assertString(v);
  v.toUpperCase(); // ✅ ここから先ずっと string
  v.length;        // ✅
}
```

→ **コードがフラットになる**（`if` ネストがいらない）。

---

## 3. 「条件アサーション」: `asserts condition`

引数が **truthy** であることを保証する書き方。型を直接指定しない。

```typescript
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

function f(v: string | undefined) {
  assert(v !== undefined, "v should not be undefined");
  v.toUpperCase(); // ✅ undefined が除外される
}
```

これは Node.js の `assert` モジュールや、テストの `expect` のような使い方ができる便利な構文。

### 標準ライブラリにも存在する

Node.jsの `node:assert/strict` の `assert` 関数は、TS 4.x の型定義で `asserts` を使っています。

```typescript
import { strict as assert } from "node:assert";

function f(v: string | undefined) {
  assert(v !== undefined);
  v.toUpperCase(); // ✅
}
```

---

## 4. 実装の正しさは検査されない（型ガードと同じ罠）

アサーション関数も、**実装が正しいかは検査されない**。

```typescript
function assertString(v: unknown): asserts v is string {
  // throw しない（嘘の保証）
}

function f(v: unknown) {
  assertString(v);
  v.toUpperCase(); // 実行時エラー（実は string ではない）
}
```

→ **必ず throw する**ロジックを書く。

---

## 5. 戻り値型は必須（`function` 宣言）

アサーション関数は **`function` 宣言** で書く必要があります。アロー関数では書けません。

```typescript
// ❌ アロー関数は assert できない
const assertString = (v: unknown): asserts v is string => { ... };

// ✅ 関数宣言
function assertString(v: unknown): asserts v is string { ... }
```

または **明示的な型注釈** で書く回避策もあります:

```typescript
type AssertString = (v: unknown) => asserts v is string;
const assertString: AssertString = (v) => {
  if (typeof v !== "string") throw new Error("not string");
};
```

---

## 6. 使い所

### (1) 「**ここから先は絶対この型**」と保証したい

```typescript
function process(input: string | undefined) {
  assert(input !== undefined, "input is required");
  // ↓ ここから先 input は必ず string
  return input.trim().toLowerCase();
}
```

防御的プログラミングと型narrowingが両立する。

### (2) **テスト/開発時のチェック**

```typescript
function debugAssert(condition: unknown, msg: string): asserts condition {
  if (!condition) throw new Error(`[DEBUG] ${msg}`);
}

function process(user: User) {
  debugAssert(user.id, "User must have id");
  // user.id を non-null として扱える
}
```

### (3) **APIレスポンスの最低限のチェック**

```typescript
function assertIsUser(v: unknown): asserts v is User {
  if (typeof v !== "object" || v === null) throw new Error("not object");
  if (!("id" in v) || typeof (v as any).id !== "string") throw new Error("invalid id");
  // ...
}

const data: unknown = await fetch(...).then(r => r.json());
assertIsUser(data);
data.id; // ✅
```

ただし複雑な検証は **Zod等のバリデータ** を推奨（後述）。

### (4) **クラスの不変条件**を確認

```typescript
class Order {
  private items: Item[] = [];

  checkout() {
    assert(this.items.length > 0, "cart is empty");
    // ↓ items.length > 0 が保証される
    const total = this.items.reduce((s, i) => s + i.price, 0);
    return total;
  }
}
```

---

## 7. Zodと組み合わせる

Zodの `parse` は失敗時に throw するので、それ自体がアサーション的に使えます。

```typescript
const UserSchema = z.object({ id: z.string(), name: z.string() });
type User = z.infer<typeof UserSchema>;

function assertUser(v: unknown): asserts v is User {
  UserSchema.parse(v); // 失敗で throw
}

const data: unknown = await loadData();
assertUser(data);
data.name; // ✅
```

または直接:

```typescript
const data: unknown = await loadData();
const user: User = UserSchema.parse(data); // 検証して型を確定
```

→ **Zodなら型ガードもアサーションも要らない**ことが多い。

---

## 8. アサーションと `never` の関係

アサーション関数の中で **`never` を返す関数** を呼ぶと、TypeScript はそこで実行が止まることを認識する。

```typescript
function fail(msg: string): never {
  throw new Error(msg);
}

function assertString(v: unknown): asserts v is string {
  if (typeof v !== "string") {
    fail("not string"); // never なのでここで終わる
  }
}
```

→ `throw` を直接書かなくてもよい。共通エラー関数を使うときに便利。

---

## 9. 落とし穴

### (1) 戻り値型を書き忘れる

```typescript
function assertString(v: unknown) { // ❌ 戻り値型なし
  if (typeof v !== "string") throw new Error();
}

function f(v: unknown) {
  assertString(v);
  v.toUpperCase(); // ❌ narrowing されない
}
```

→ `asserts v is string` を必ず書く。

### (2) アロー関数で書けない

```typescript
const assertString = (v: unknown): asserts v is string => { ... }; // ❌
```

→ `function` 宣言、または型注釈付きの代入。

### (3) アサーション関数を `try/catch` で囲んで握りつぶす

```typescript
try {
  assertString(v);
} catch {
  // 何もしない
}
v.toUpperCase(); // ❌ narrowing されない（try の外なのでリセット）
```

→ アサーションは「**外れたら処理を止める**」前提なので、握りつぶしは設計が悪い。

### (4) 関数を**間接呼び出し**すると narrowing されない

```typescript
function indirectAssert(fn: typeof assertString, v: unknown) {
  fn(v); // narrowing されない（型情報が失われる）
}
```

直接呼び出しでないと narrowing は効かない。

### (5) テストランナーの `expect` は narrowing しない

```typescript
test("foo", () => {
  expect(v).toBeDefined();
  v.toUpperCase(); // ❌ expect は assert ではない
});
```

`expect` は通常 `boolean` のチェックなので narrowing しない。テスト中は `if (!v) throw new Error()` で代用するか、ヘルパを書く。

---

## 10. アサーション関数と型ガードの使い分け

| 使い分け | アサーション | 型ガード |
|---|---|---|
| 「絶対にこの型のはず」と保証したい | ✅ | △ |
| 「もし違ったら別ルートで処理」 | × | ✅ |
| `filter` のコールバック | ❌ できない | ✅ |
| if/elseで分岐 | △（throw が前提） | ✅ |
| ガード句的に書きたい | ✅ 最適 | △（else 不要なら） |

→ **「失敗したら止める」ならアサーション、「失敗してもコードを続ける」なら型ガード**。

---

## 11. アサーション関数を書くときのチェックリスト

- [ ] 戻り値型に `asserts ...` を書いた？
- [ ] 失敗時に**必ず throw** する実装？
- [ ] `function` 宣言で書いた？（または型注釈付き代入）
- [ ] エラーメッセージは**具体的**？（デバッグしやすい）
- [ ] **try/catch で握りつぶされない**前提のコード？
- [ ] 複雑な構造のチェックなら **Zod等のバリデータ** に任せられない？

---

## 12. 標準的な実装パターン

### 汎用 `assert` ユーティリティ

```typescript
export function assert(
  condition: unknown,
  message: string = "Assertion failed"
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

// 使い方
assert(user, "User is required");
assert(user.id !== "", "User id must not be empty");
```

### `assertNonNull` ヘルパー

```typescript
export function assertNonNull<T>(
  v: T | null | undefined,
  msg = "Value is nullable"
): asserts v is T {
  if (v === null || v === undefined) throw new Error(msg);
}

const u = users.find(u => u.id === id);
assertNonNull(u, `User ${id} not found`);
u.name; // ✅
```

`Array.find` の戻り値が `T | undefined` を `T` に絞れる。

---

## 13. まとめ

- アサーション関数 = **`asserts ... `** を戻り値型に持つ関数
- 「**正常終了したらこの型である**」とTSに伝える
- 型ガードと違い、**呼び出し以降の全コードに narrowing が及ぶ**
- 用途: 防御的プログラミング、ガード句、内部不変条件の確認
- 落とし穴: 戻り値型必須・実装の正しさは検査されない・アロー関数で書けない
- **Zod等のバリデータ**で代替できる場面は多い

> アサーション関数を使うと、コードが「**保証された型で進む**」フラットな構造になります。型ガードのネストが煩わしいときに思い出すと、設計が一段スッキリします。

---

## 関連
- [[01-typeof_instanceof_in]]
- [[02-判別可能ユニオン]]
- [[03-ユーザー定義型ガード]]
- [[04-neverの意味]]
