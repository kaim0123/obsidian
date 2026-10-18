# `void` / `Promise<T>` / `async` と型

> 「戻り値を使わない」関数、非同期処理、`async` 関数 ── ここはJavaScriptとTypeScriptの差分が大きく、初心者がハマりやすい領域です。`void` と `undefined` の違い、`Promise<T>` の型、`async` の戻り値、エラーハンドリングまで、ひと通り押さえます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-関数型とコールバック]]
- 次: [[04-オーバーロード]]

---

## 1. `void` 戻り値

「**戻り値を使わない**」関数を表す型。

```typescript
function log(msg: string): void {
  console.log(msg);
}
```

`void` を明示しなくても、`return` 文がない関数は自動で `void` と推論されます。

```typescript
function log(msg: string) {  // 推論: void
  console.log(msg);
}
```

---

## 2. `void` と `undefined` の違い

似ているようで意味が違う。

| 観点 | `void` | `undefined` |
|---|---|---|
| 意味 | 「戻り値を使わない」（呼び出し側の意図） | `undefined` という値そのもの |
| 関数の戻り値型 | 戻り値があっても無視される | 戻り値が `undefined` でなければエラー |
| 変数の型 | `void` 型変数は `undefined` のみ代入可 | `undefined` のみ代入可 |
| 実行時 | 実体は同じ（`undefined`） | 同上 |

```typescript
function f1(): void { return undefined; }    // ✅
function f1b(): void { return 42; }           // ❌ 値を返している
function f2(): undefined { return undefined; } // ✅
function f2b(): undefined { return; }          // ✅（暗黙のundefined）
function f2c(): undefined {}                   // ✅（returnなし＝undefined）
```

→ **「使わない」なら `void`、「明示的に undefined を返す」なら `undefined`** を使う。普段は `void` でOK。

---

## 3. コールバックの `void` 戻り値の罠（再掲・重要）

`void` を戻り値とするコールバック型は、**実際に値を返す関数も受け入れます**。

```typescript
type Handler = (n: number) => void;

const h: Handler = (n) => n * 2; // ✅ 通る（戻り値は使われない契約）
```

これは `forEach` などで便利な仕様ですが、**意図せずバグになることもある**:

```typescript
[1, 2, 3].forEach(async n => {  // async は Promise を返す
  await something(n);            // forEach は Promise を待たない！
});
```

`forEach` のコールバック型は `(item: T, index: number, array: T[]) => void`。戻り値の `Promise` が**そのまま捨てられる**ため、`await` は外側に効きません。

### 対策

```typescript
// ✅ for...of
for (const n of arr) {
  await something(n);
}

// ✅ Promise.all + map
await Promise.all(arr.map(n => something(n)));
```

→ `forEach` で非同期処理を書かない。

---

## 4. `Promise<T>` の型

非同期処理は `Promise<T>` で表現します。`T` が「最終的に成功時に得られる値」の型。

```typescript
const p1: Promise<number> = Promise.resolve(42);
const p2: Promise<string> = fetch("/api").then(r => r.text());
```

### `Promise` 内部のチェーン

```typescript
fetch("/api/user")
  .then(res => res.json())     // res: Response → Promise<any>
  .then(data => data.name)      // data: any → any
  .then(name => name.toUpperCase()); // name: any → ...
```

→ `res.json()` の戻り値は標準で `Promise<any>`。**ここで型が崩れる**ので、自前で型を付けるか、`unknown` で受け直すのが安全。

```typescript
fetch("/api/user")
  .then(res => res.json() as Promise<unknown>)
  .then(data => UserSchema.parse(data));
```

詳しくは「13. 型と実装の境界」で扱います。

---

## 5. `async` 関数

`async` を付けると、**戻り値が自動で `Promise` にラップ**されます。

```typescript
async function loadUser(): Promise<User> {
  const res = await fetch("/api/user");
  return res.json(); // Promise<any> → 戻り値型が Promise<User>
}
```

### `async` の戻り値型は常に `Promise<T>`

```typescript
async function f(): number { ... }       // ❌ async は Promise<...> を返さねばならない
async function f(): Promise<number> { ... } // ✅
```

### 推論される

```typescript
async function f() {
  return 42; // 推論: Promise<number>
}
```

明示しなくても **`Promise<T>` で推論**される。

### `async` 関数の中で `return` する値

```typescript
async function f(): Promise<number> {
  return 42;             // ✅ Promise<number> にラップされる
  return Promise.resolve(42); // ✅ 同じ（Promise を返してもネストしない）
}
```

`Promise<Promise<number>>` のようにネストしない仕様。これは `await` も同じ。

---

## 6. `await` の挙動

`await` は **`Promise<T>` を `T` に変える**演算子。

```typescript
const p: Promise<number> = Promise.resolve(42);
const n: number = await p; // ✅
```

ただし `await` は `async` 関数の中（または ES2022以降のトップレベル）でのみ使える。

### `await` は `Promise` 以外も受け付ける

```typescript
const a = await 42; // ✅ 42 が返る
const b = await "hello"; // ✅ "hello" が返る
```

`Promise` でない値は**そのまま**返される（ただし1tickは消費する）。

### `Promise.all` / `Promise.race` の型

```typescript
const [user, posts] = await Promise.all([
  fetchUser(),    // Promise<User>
  fetchPosts(),   // Promise<Post[]>
]);
// user: User, posts: Post[]
```

`Promise.all` は配列の各要素の `Promise<T>` から `T` を取り出した**タプルを返す**。型推論が強力。

---

## 7. `async` 関数のエラーハンドリング

`async` 関数内のエラーは `try/catch` で。

```typescript
async function loadUser(id: string): Promise<User | null> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    // err: unknown（useUnknownInCatchVariables: true）
    if (err instanceof Error) {
      console.error(err.message);
    }
    return null;
  }
}
```

### `catch (err)` の `err` は `unknown`

TS 4.4以降、`useUnknownInCatchVariables: true`（または `strict: true`）で `catch` の引数が `unknown` になります。

```typescript
try { ... } catch (err) {
  // err: unknown
  err.message; // ❌
  if (err instanceof Error) {
    err.message; // ✅
  }
}
```

これは正しい仕様（エラーは `Error` インスタンスとは限らない）。

---

## 8. `Promise` の3つのよくあるパターン

### (1) シリアル（順番に）

```typescript
const a = await fetchA();
const b = await fetchB(a.id); // a の結果を使う
```

### (2) パラレル（同時に）

```typescript
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

依存しない処理は `Promise.all` で並列化すると速い。

### (3) 失敗してもまとめて結果を取る

```typescript
const results = await Promise.allSettled([fetchA(), fetchB()]);
// results: PromiseSettledResult<...>[]
results.forEach(r => {
  if (r.status === "fulfilled") {
    r.value;
  } else {
    r.reason;
  }
});
```

「**1つでも失敗したら全部失敗**」の `Promise.all` と違い、`allSettled` は**全部の結果を取る**。

---

## 9. `void` の関数を `Promise<void>` にしたいとき

```typescript
async function save(data: Data): Promise<void> {
  await fetch("/api/save", { method: "POST", body: JSON.stringify(data) });
  // 戻り値なし
}
```

`async` 関数で `return;` または `return undefined;`、またはreturnなしなら、戻り値型は `Promise<void>` または `Promise<undefined>` になります。

---

## 10. `void` 戻り値とイベントハンドラ

DOM イベントハンドラの戻り値は `void`。

```typescript
button.addEventListener("click", () => {
  console.log("clicked");
  // 戻り値は無視される
});
```

ただし `async` ハンドラは要注意:

```typescript
button.addEventListener("click", async () => {
  await something();
  // 内部のエラーは uncaught Promise rejection に
});
```

`async` ハンドラの中で **必ず try/catch** を書く（外部に漏れない）。

---

## 11. 古いコールバックスタイルから `Promise` への変換

Node.js のような callback-based APIを Promise化したいときは `util.promisify` か手書きラッパー:

```typescript
import { promisify } from "util";
import * as fs from "fs";

const readFile = promisify(fs.readFile);
const data = await readFile("file.txt", "utf-8"); // string
```

または手動:

```typescript
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

await delay(1000);
```

---

## 12. `Promise<T>` を返す関数の型

```typescript
type AsyncFetcher<T> = () => Promise<T>;
type AsyncTransformer<T, U> = (input: T) => Promise<U>;
```

ジェネリクスと組み合わせると、汎用な非同期処理ヘルパが書けます。

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError;
}
```

---

## 13. よくある間違い

### (1) `async` 関数の戻り値を `Promise<T>` でラップしてしまう

```typescript
async function f(): Promise<Promise<number>> {  // ❌ 二重ラップ
  return Promise.resolve(42);
}

async function f(): Promise<number> {  // ✅
  return Promise.resolve(42);
}
```

`async` の中の `Promise` は自動でフラット化されます。

### (2) `await` を忘れる

```typescript
async function f() {
  const data = fetch("/api"); // ❌ Promise<Response> のまま
  console.log(data.status);     // status は Promise には無い
}
```

`fetch` の戻り値を使うときは必ず `await`。エディタが警告してくれることが多い。

### (3) `forEach` で `await`

```typescript
arr.forEach(async item => {
  await save(item); // 待たれない
});
```

→ `for...of` か `Promise.all`。

### (4) `Promise` を `void` 関数で返す

```typescript
function start(): void {
  fetch("/api"); // ❌ 戻り値が捨てられる（unhandled rejection）
}

async function start(): Promise<void> {  // ✅
  await fetch("/api");
}
```

→ `no-floating-promises` ESLintルールで検出可能。

### (5) `then` のチェーンで型が崩れる

```typescript
fetch("/api")
  .then(res => res.json())   // res.json() は Promise<any>
  .then(data => data.name);   // any のまま
```

→ 自前で型を付けるか、`async`/`await` + Zod等で型を確保。

---

## 14. まとめ

- **`void`** = 「戻り値を使わない」（`undefined` と意味が違う）
- **コールバックの `void` 戻り値**は値を返す関数も受け入れる（`forEach`の罠に注意）
- **`Promise<T>`** = 非同期処理の型、`T` は成功時の値の型
- **`async` 関数**は自動で戻り値を `Promise` にラップ。ネストしない
- **`await`** は `Promise<T>` を `T` に変える
- **`catch (err)`** の `err` は `unknown`（`useUnknownInCatchVariables: true`）
- 並列化は `Promise.all`、失敗込みなら `Promise.allSettled`

> `Promise<T>` と `async`/`await` の型が読めるようになると、現代的な非同期コードは**ほぼ全部安全に書ける**ようになります。`forEach + async` だけは絶対やらない、これだけ覚えてください。

---

## 関連
- [[02-関数型とコールバック]]
- [[01-引数と戻り値]]
- [[03-unknownと安全な取り扱い]]
