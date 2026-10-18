# null安全（`strictNullChecks` 前提の思考）

> JavaScript の `null` / `undefined` は、世界のソフトウェアの相当数のバグの原因です。TypeScript はこれを **`strictNullChecks`** で完全に制御できます。「null かもしれない値を、null じゃないことを確認するまで使わない」 ── このシンプルな思考に切り替えるだけで、ヌルポバグはほぼ消えます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[04-assertsアサーション関数]]

---

## 1. `strictNullChecks` とは

`tsconfig.json` のオプションの1つ。`strict: true` を有効にすれば自動でオン。

```json
{
  "compilerOptions": {
    "strict": true
    // または
    "strictNullChecks": true
  }
}
```

これを有効にすると、**`null` と `undefined` が他の型と区別**されます。

### 無効時（昔のTS）

```typescript
let s: string = "hello";
s = null;       // ✅ 通る（危険）
s = undefined;  // ✅ 通る（危険）
```

→ JavaScriptと同じく、どこでも null になりうる地獄。

### 有効時（推奨）

```typescript
let s: string = "hello";
s = null;       // ❌ Type 'null' is not assignable to type 'string'.
s = undefined;  // ❌ 同様

let s2: string | null = "hello";
s2 = null;      // ✅ ユニオン型で明示すれば代入可
```

→ **null/undefinedは型で明示**しないと入らない。

**現代のTSプロジェクトでは必須**。

---

## 2. null安全の中心思想

> **「null かもしれない値は、null でないと保証されるまで使わない」**

これだけ。具体的には:

```typescript
function f(s: string | null) {
  s.toUpperCase(); // ❌ s は null かもしれない

  if (s !== null) {
    s.toUpperCase(); // ✅ ここでは string
  }
}
```

`if` などで **明示的に絞り込む** のが基本。

---

## 3. null安全のための narrowing パターン

### (1) 等価比較で絞る

```typescript
function f(s: string | null) {
  if (s !== null) {
    s; // string
  }
}

function g(s: string | undefined) {
  if (s !== undefined) {
    s; // string
  }
}

function h(s: string | null | undefined) {
  if (s != null) {  // ← != は loose equality（null と undefined 両方をカバー）
    s; // string
  }
}
```

`!= null` は **`null` と `undefined` の両方** をカバーする慣用句。意図的に loose equality を使う（ESLintで `eqeqeq` を緩和することが多い）。

### (2) truthiness で絞る（注意あり）

```typescript
function f(s: string | null | undefined) {
  if (s) {
    s; // string（ただし空文字 "" も除外される！）
  }
}
```

→ `0` や `""` も falsy なので、**「空文字を含めて存在チェック」したい場合は不適**。

### (3) アサーション関数で絞る

```typescript
function assertNonNull<T>(v: T | null | undefined): asserts v is T {
  if (v === null || v === undefined) throw new Error("null");
}

function f(s: string | null) {
  assertNonNull(s);
  s.toUpperCase(); // ✅
}
```

### (4) Optional Chaining `?.` で安全アクセス

```typescript
function f(user: { profile?: { name?: string } }) {
  const name = user.profile?.name; // string | undefined
  console.log(name?.toUpperCase()); // ?. を更にチェイン
}
```

「**途中で null/undefined になったら最終結果も undefined**」というショートカット。

### (5) Nullish Coalescing `??` でデフォルト値

```typescript
function f(name: string | null | undefined) {
  const display = name ?? "anonymous"; // null/undefined のときだけ "anonymous"
}
```

`||` と違い、`0` や `""` はそのまま使う:

```typescript
const a = "" || "default";    // "default"（空文字も falsy）
const b = "" ?? "default";    // ""（null/undefined ではないのでそのまま）

const c = 0 || 100;           // 100
const d = 0 ?? 100;           // 0
```

→ 「null/undefined のときだけ代替」したいなら **`??`** を使う。

---

## 4. `?` プロパティと `| undefined` の違い（再掲・重要）

```typescript
type A = { name?: string };           // プロパティ自体が省略可
type B = { name: string | undefined }; // プロパティは必須、値が undefined

const a1: A = {};                      // ✅
const a2: A = { name: "Alice" };       // ✅
const a3: A = { name: undefined };     // ✅（exactOptionalPropertyTypes が無効なら）

const b1: B = {};                      // ❌
const b2: B = { name: undefined };     // ✅
const b3: B = { name: "Alice" };       // ✅
```

`exactOptionalPropertyTypes: true` を有効にすると、`A` に `{ name: undefined }` は通らなくなる（**より厳密**）。

---

## 5. `null` と `undefined` の使い分け

### 一般論

- **`undefined`**: 「値が（まだ）ない」「未定義」
- **`null`**: 「意図的に値がない」「明示的にクリア」

### TypeScriptプロジェクトでの傾向

実務でよくある選択:

#### (1) `undefined` 派（多数派）

- JavaScriptが**自然に返す値**（未代入、関数戻り値なし、存在しないプロパティ）と一致
- API入力で省略 = `undefined` のように一貫させやすい
- React/Reduxなど主要ライブラリも `undefined` を多用

#### (2) `null` 派

- 「意図的に空」の意味で使う
- DB の `NULL` 値と直接マッピング
- Java/C# 経験者には馴染みやすい

### **チームで統一**するのが最重要

混在するとバグが増える。一貫性を優先。

```typescript
// ❌ 混在
type User = {
  name: string;
  email?: string;       // undefined
  middleName: string | null; // null
};
```

```typescript
// ✅ どちらかに統一
type User = {
  name: string;
  email?: string;       // 全部 undefined 派
  middleName?: string;
};
```

---

## 6. `Array.prototype.find` などの `T | undefined` 対策

JavaScriptの組み込みメソッドの多くは `T | undefined` を返します。

```typescript
const arr = [1, 2, 3];
const found = arr.find(n => n > 100); // number | undefined
found.toFixed(); // ❌
```

### 対策

#### (1) チェックする

```typescript
if (found !== undefined) {
  found.toFixed();
}
```

#### (2) デフォルト値

```typescript
const found = arr.find(n => n > 100) ?? 0;
```

#### (3) アサーション（「絶対あるはず」のとき）

```typescript
const u = users.find(u => u.id === id);
assertNonNull(u, "User must exist");
u.name; // ✅
```

---

## 7. `noUncheckedIndexedAccess` で配列・オブジェクトを安全に

`tsconfig.json` のオプション。

```json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
```

これを有効にすると、**インデックスアクセスの戻り値が `T | undefined` になる**。

```typescript
const arr: number[] = [1, 2, 3];
const x = arr[10];  // number | undefined（有効時）
x.toFixed();        // ❌

const dict: Record<string, string> = { a: "A" };
const v = dict.unknown; // string | undefined
v.toUpperCase();        // ❌
```

→ 配列・辞書アクセスがすべて `undefined` チェックを要する。**真の null安全**。

詳しくは [[noUncheckedIndexedAccess]]。

---

## 8. オブジェクトのオプショナルなフィールドの安全な扱い

### 例: ネストしたオプション

```typescript
type User = {
  profile?: {
    name?: string;
    address?: {
      city?: string;
    };
  };
};

function getCity(u: User): string | undefined {
  return u.profile?.address?.city;
}
```

### デフォルト値を取る

```typescript
function getCity(u: User): string {
  return u.profile?.address?.city ?? "unknown";
}
```

### 分割代入 + デフォルト値

```typescript
function f({ name = "anonymous", age = 0 }: { name?: string; age?: number }) {
  // name: string, age: number
}
```

オブジェクト引数 + デフォルトは **null安全な書き方**として実務で多用。

---

## 9. 「絶対 null じゃない」の禁止: `!` 演算子

`!` は **null/undefined を強制的に除外** するアサーション。

```typescript
function f(v: string | null) {
  v!.toUpperCase(); // ❌ 危険：v が null だったら実行時エラー
}
```

### 危険な理由

`!` は **コンパイラを黙らせるだけ**。実行時には何のチェックもしない。`as` と同じく嘘を埋め込める。

### 使ってよい場面

ほぼなし。**`if` チェック / アサーション関数 / Zodパースに置き換え**ること。

例外的に許される場面:

- `useRef` の `.current`（React 18以降は型が改善されているので不要なケースも多い）
- 「コードの構造上絶対 null になりえない」と確信できる短いスコープ

それ以外は **ESLintで禁止** するチームも多い（`@typescript-eslint/no-non-null-assertion`）。

---

## 10. null安全のためのチェックリスト

新しいコードを書くとき:

- [ ] `strictNullChecks: true`（`strict: true`）が有効？
- [ ] `noUncheckedIndexedAccess: true` を検討？
- [ ] `null` と `undefined` の使い分けがチームで統一されている？
- [ ] `!` を使う代わりに `if` / `assert` に置き換えられない？
- [ ] APIから来た値は `unknown` で受けて Zod で検証している？
- [ ] `Array.find` などの戻り値を**チェックなし**で使っていない？
- [ ] `?.` と `??` を活用している？

---

## 11. よくある間違い

### (1) `if (x)` で空文字や 0 が除外される

```typescript
if (n) { /* n === 0 のときも入らない */ }
```

→ `n !== undefined` / `n != null`。

### (2) `||` で代替値（空文字の罠）

```typescript
const display = name || "anonymous"; // name が "" でも "anonymous"
```

→ `name ?? "anonymous"`。

### (3) `!` を多用

```typescript
const u = users.find(...)!;
u.name;
```

→ アサーション関数か `if` でチェック。

### (4) 「optional だから undefined チェック不要」と勘違い

```typescript
type User = { name?: string };
function f(u: User) {
  u.name.toUpperCase(); // ❌ name は string | undefined
}
```

→ 必ずチェック。

### (5) `null` / `undefined` の混在

```typescript
function f(): string | null | undefined { ... } // 3パターンを返す混乱の温床
```

→ どちらかに統一。

---

## 12. null安全な設計のヒント

### (1) **「ありえない null」を型で表現する**

DBから読んだ User は `id` が必ずある。型でも表現する:

```typescript
// ❌ 表現不足
type User = { id?: string; name: string };

// ✅ id は必須
type User = { id: string; name: string };
```

### (2) **異なる文脈で異なる型を使う**

```typescript
// 入力（id はまだない）
type CreateUserInput = { name: string };

// 出力（id がある）
type User = { id: string; name: string };
```

「同じUserでも作る前と後で型が違う」を表現すると null安全になる。

### (3) **Result型で「失敗の可能性」を型に出す**

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

function findUser(id: string): Result<User> {
  // 失敗時は { ok: false, error: ... }
  // 成功時は { ok: true, value: user }
}
```

`null` / `undefined` を返さなくて済む設計。

---

## 13. まとめ

- `strictNullChecks: true` を**必須**で有効化
- 「null かもしれない値は、null じゃないと保証してから使う」
- narrowing 手段: `!== null` / `!= null` / `?.` / `??` / アサーション関数
- `?` と `| undefined` の違いに注意（`exactOptionalPropertyTypes` で厳密化）
- `null` / `undefined` の使い分けは**チームで統一**
- `!` 演算子は**禁止に近い**運用が安全
- `noUncheckedIndexedAccess: true` で配列・辞書も型安全に

> null安全の本質は「**not-null を型で約束させる**」こと。`strictNullChecks` を有効にして、`!` を使わない、`??` と `?.` を使い倒す ── これだけで「`Cannot read property of undefined`」が劇的に減ります。

---

## 関連
- [[01-typeof_instanceof_in]]
- [[03-ユーザー定義型ガード]]
- [[04-assertsアサーション関数]]
- [[noUncheckedIndexedAccess]]
- [[exactOptionalPropertyTypes]]
- [[strict系オプション]]
- [[non-null-assertion]]
