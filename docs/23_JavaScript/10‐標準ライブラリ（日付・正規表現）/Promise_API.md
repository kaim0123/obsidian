# Promise API

## Promise とは

**Promise** は、「いつか結果が決まる値」を表すオブジェクトです。非同期処理（時間のかかる処理）の結果をラップし、`then` や `await` で取り出せるようにする仕組みです。

基本的な使い方は [[03_非同期処理]] で解説しているので、ここでは **Promise オブジェクトそのものと標準メソッド** を中心にまとめます。

## Promise の3つの状態

1. **pending（保留中）** … 結果が出ていない
2. **fulfilled（成功）** … 値が決まった
3. **rejected（失敗）** … エラーになった

一度 fulfilled / rejected になると、その状態は変わりません（**settled**）。

## Promise の作り方

### 手動で作る

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("成功");    // 成功として解決
    // reject(new Error("失敗"));
  }, 1000);
});
```

`resolve(value)` で成功、`reject(err)` で失敗。

### 即時の Promise

```js
Promise.resolve(42);      // 成功済みの Promise
Promise.reject("oh no");  // 失敗済みの Promise
```

テストや、すでに値を持っている時に Promise の API に合わせる目的で使います。

### async 関数

`async` を付けた関数は自動的に Promise を返します。

```js
async function load() {
  return "hello"; // Promise<"hello"> になる
}
```

## インスタンスメソッド

### then(onFulfilled, onRejected)

```js
p.then(
  (value) => console.log("成功:", value),
  (err) => console.error("失敗:", err) // 通常は .catch を推奨
);
```

第2引数はあまり使いません。代わりに `.catch` をチェーン。

### catch(onRejected)

```js
p.catch((err) => console.error(err));
```

### finally(onFinally)

```js
p.finally(() => {
  console.log("成功失敗関係なく実行");
});
```

ローディングの解除など、どちらでも行いたい後処理に。

### チェーン

`.then` の戻り値がさらに Promise なので、連ねられます。

```js
fetchUser(1)
  .then((user) => fetchPosts(user.id))
  .then((posts) => posts.length)
  .then((n) => console.log(`${n} 件`))
  .catch((err) => console.error(err))
  .finally(() => console.log("done"));
```

返した値が Promise なら、その Promise の結果が次に流れます（これが強力）。

## 静的メソッド

### Promise.all([...])

**全部成功したら成功、1つでも失敗したら即失敗**。

```js
const [u, p] = await Promise.all([fetchUser(), fetchPosts()]);
```

独立した非同期処理を **並列** に走らせる定番。片方でも失敗するとそこでキャンセル扱い。

### Promise.allSettled([...])

**全部の結果を待つ。成功も失敗も混ざっていて OK**。

```js
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);
results.forEach((r) => {
  if (r.status === "fulfilled") console.log(r.value);
  else console.error(r.reason);
});
```

「1つ失敗しても他は処理したい」ケースで使う。

### Promise.race([...])

**最初に決着（成功 or 失敗）したもの** で終わる。

```js
const fastest = await Promise.race([apiA(), apiB(), apiC()]);
```

タイムアウトなどに便利。

```js
function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms)
  );
}

const res = await Promise.race([fetch(url), timeout(3000)]);
```

### Promise.any([...])

**最初に成功したもの** で終わる。全部失敗したら `AggregateError`。

```js
try {
  const ok = await Promise.any([mirror1(), mirror2(), mirror3()]);
} catch (err) {
  // err は AggregateError
}
```

## 新しいメソッド（新しい ES 版）

### Promise.withResolvers()（ES2024）

外から `resolve` / `reject` を呼びたいケースに便利。

```js
const { promise, resolve, reject } = Promise.withResolvers();

someEmitter.on("data", resolve);
someEmitter.on("error", reject);

const data = await promise;
```

## async / await との関係

- `async` 関数は常に Promise を返す
- `await` は Promise の fulfilled 値を取り出す
- エラーは throw される（try/catch）

```js
async function foo() {
  try {
    const a = await fetchA();
    const b = await fetchB();
    return [a, b];
  } catch (err) {
    console.error(err);
    throw err;
  }
}
```

## 並列/逐次の使い分け

### 直列（依存関係あり）

```js
const user = await fetchUser(1);
const posts = await fetchPosts(user.id); // user 待ちで必要
```

### 並列（独立）

```js
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

依存がないのに `await` を2個続けると **直列になって遅い**ので、まとめられるものはまとめる。

## よくある落とし穴

### 1. await し忘れ

```js
const data = fetchUser(); // Promise そのもの
console.log(data); // Promise<pending>
```

### 2. 例外の握りつぶし

```js
const p = doSomething();
// どこにも .catch や try/catch がない
```

Node.js では `unhandledRejection` としてログに出たりプロセスが落ちたりします。

### 3. 非 Promise 関数を `.then` する

```js
"hello".then(...); // TypeError
```

値に対しては `Promise.resolve(value).then(...)` でラップ。

### 4. Promise の中で throw した場合

```js
new Promise((resolve, reject) => {
  throw new Error("oops"); // reject と同じ扱いになる
}).catch((err) => console.log(err.message));
```

### 5. Promise.all で1つ失敗すると他は結果を捨てる

`Promise.all` は拒否される早い者勝ちなので、他の成功結果にはアクセスできなくなる。全部見たいなら `Promise.allSettled`。

### 6. ループと Promise

```js
// 全部並列
await Promise.all(items.map(async (item) => process(item)));

// 1件ずつ逐次
for (const item of items) {
  await process(item);
}

// forEach は await を拾えない
items.forEach(async (item) => await process(item)); // 待たない
```

## まとめ

- Promise は「いつか決まる値」。pending → fulfilled/rejected に一度だけ遷移
- 主要メソッドは `.then` / `.catch` / `.finally`
- 並列は `Promise.all`、全結果は `allSettled`、早い者勝ちは `race`、最初に成功は `any`
- `async/await` で書くのが読みやすい
- 依存関係がなければ並列化するのがパフォーマンスの基本

Promise と async/await は JavaScript 非同期処理の心臓部。「配列の map に async を渡して await するとどうなる？」が即答できると一人前です。
