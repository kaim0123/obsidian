# 09. 非同期：Promiseとasync/await

---

## この章で学ぶこと

- 同期処理と非同期処理の違い
- Promiseの仕組み（then / catch / finally）
- async / await の使い方
- 並列・直列の制御（Promise.all / allSettled）
- タイムアウトとキャンセルの基本
- 非同期でよくあるバグ

---

## 09-1. 同期 / 非同期とは

### 同期処理：上から順番に実行

```javascript
console.log("1番目");
console.log("2番目");
console.log("3番目");
// → 1番目 → 2番目 → 3番目（必ずこの順番）
```

### 非同期処理：待たずに次へ進む

```javascript
console.log("1番目");
setTimeout(() => {
  console.log("2番目（1秒後）");
}, 1000);
console.log("3番目");
// → 1番目 → 3番目 → 2番目（1秒後）
```

**なぜ非同期が必要なのか？**

- API通信：サーバーからデータを取得する間、画面が固まってほしくない
- ファイル読み込み：大きなファイルを読む間、他の処理を止めたくない
- タイマー：一定時間後に処理を実行したい

**イメージ**：
- 同期 = レジに並ぶ。前の人が終わるまで待つ
- 非同期 = 番号札をもらって待つ。呼ばれるまで別のことができる

---

## 09-2. Promise の基本（then / catch / finally）

### Promise とは

Promiseは**「今はまだ結果がわからないけど、いずれ結果が出る」**ことを表すオブジェクトです。

```javascript
// Promise の3つの状態
// pending  : まだ結果が出ていない（待機中）
// fulfilled: 成功した（resolved）
// rejected : 失敗した
```

### Promise を作る

```javascript
const promise = new Promise((resolve, reject) => {
  // 非同期な処理
  setTimeout(() => {
    const success = true;

    if (success) {
      resolve("成功しました！");  // 成功を通知
    } else {
      reject("失敗しました…");   // 失敗を通知
    }
  }, 1000);
});
```

### then / catch / finally で結果を受け取る

```javascript
promise
  .then((result) => {
    console.log(result);  // → "成功しました！"
  })
  .catch((error) => {
    console.log(error);   // 失敗時に実行
  })
  .finally(() => {
    console.log("完了");  // 成功でも失敗でも実行
  });
```

### then のチェーン

```javascript
fetch("https://api.example.com/user/1")
  .then(response => response.json())    // レスポンスをJSONに変換
  .then(user => {
    console.log(user.name);             // ユーザー名を表示
    return fetch(`/api/posts?userId=${user.id}`);
  })
  .then(response => response.json())    // 投稿データを取得
  .then(posts => {
    console.log(posts);
  })
  .catch(error => {
    console.error("エラー:", error);     // どこかで失敗したら
  });
```

> thenチェーンは読みにくくなりがちです。次の `async/await` で解決します。

---

## 09-3. async / await

### async / await とは

Promiseを**同期処理のように書ける**構文です。現在の標準的な書き方。

```javascript
// async をつけた関数は Promise を返す
async function fetchUser() {
  // await で Promise の結果を待つ
  const response = await fetch("https://api.example.com/user/1");
  const user = await response.json();
  return user;
}
```

### then チェーンとの比較

```javascript
// ❌ then チェーン（読みにくい）
function getUser() {
  return fetch("/api/user/1")
    .then(res => res.json())
    .then(user => {
      return fetch(`/api/posts?userId=${user.id}`);
    })
    .then(res => res.json())
    .then(posts => {
      console.log(posts);
    });
}

// ✅ async/await（読みやすい）
async function getUser() {
  const res1 = await fetch("/api/user/1");
  const user = await res1.json();

  const res2 = await fetch(`/api/posts?userId=${user.id}`);
  const posts = await res2.json();

  console.log(posts);
}
```

### エラーハンドリング

```javascript
async function fetchData() {
  try {
    const response = await fetch("/api/data");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("通信エラー:", error.message);
    return null;  // エラー時のデフォルト値
  }
}
```

### async/await の注意点

```javascript
// ❌ await は async 関数の中でしか使えない
// const data = await fetch("/api");  // トップレベルではエラー（モジュールを除く）

// ✅ async 関数の中で使う
async function main() {
  const data = await fetch("/api");
}
main();

// ✅ ES Modules のトップレベルなら使える
// （type="module" のscriptタグ、または .mjs ファイル）
const data = await fetch("/api");  // OK
```

---

## 09-4. 並列・直列（Promise.all / allSettled）

### 直列（順番に実行）

```javascript
// 1つずつ順番に実行する（遅い）
async function sequential() {
  const user = await fetchUser();    // 1秒
  const posts = await fetchPosts();  // 1秒
  const comments = await fetchComments();  // 1秒
  // 合計: 3秒
}
```

### 並列（同時に実行）

```javascript
// 同時に実行する（速い）
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),      // 1秒
    fetchPosts(),     // 1秒
    fetchComments(),  // 1秒
  ]);
  // 合計: 1秒（一番遅いものに合わせる）
}
```

### Promise.all：全部成功を待つ

```javascript
const results = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/tags"),
]);

// 1つでも失敗すると、全体が失敗（catch に入る）
```

### Promise.allSettled：全部の完了を待つ（成功・失敗問わず）

```javascript
const results = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),     // これが失敗しても...
  fetch("/api/tags"),
]);

// すべての結果が返る
results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("成功:", result.value);
  } else {
    console.log("失敗:", result.reason);
  }
});
```

### Promise.race：最初に完了したものだけ

```javascript
const fastest = await Promise.race([
  fetch("/api/server1"),
  fetch("/api/server2"),
]);
// 先に返ってきたほうの結果だけ取得
```

---

## 09-5. タイムアウト・キャンセルの考え方（入門）

### タイムアウト

```javascript
// タイムアウト付きfetch
async function fetchWithTimeout(url, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`リクエストがタイムアウトしました（${timeoutMs}ms）`);
    }
    throw error;
  }
}
```

### AbortController でキャンセル

```javascript
const controller = new AbortController();

// キャンセル可能なリクエスト
fetch("/api/data", { signal: controller.signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("リクエストがキャンセルされました");
    }
  });

// キャンセルする
controller.abort();
```

---

## 09-6. 非同期の順序バグ

### await し忘れ

```javascript
// ❌ await を忘れると Promise オブジェクトがそのまま入る
async function getUser() {
  const response = fetch("/api/user");  // await がない！
  console.log(response);  // → Promise { <pending> }（データじゃない！）
}

// ✅ await をつける
async function getUser() {
  const response = await fetch("/api/user");
  const user = await response.json();
  console.log(user);  // → { name: "太郎", ... }
}
```

### 競合状態（race condition）

```javascript
// ❌ ユーザーが素早くボタンを連打すると、古いリクエストの結果が後から来る
let latestData;

button.addEventListener("click", async () => {
  const response = await fetch(`/api/search?q=${input.value}`);
  const data = await response.json();
  latestData = data;  // 古い結果で上書きされるかも！
  render(data);
});

// ✅ リクエストIDで最新かチェック
let currentRequestId = 0;

button.addEventListener("click", async () => {
  const requestId = ++currentRequestId;
  const response = await fetch(`/api/search?q=${input.value}`);
  const data = await response.json();

  // 最新のリクエストでなければ無視
  if (requestId !== currentRequestId) return;

  render(data);
});
```

### forループの中の await

```javascript
// ❌ for の中で await すると1つずつ順番に実行される（遅い）
async function fetchAll(ids) {
  const results = [];
  for (const id of ids) {
    const data = await fetchItem(id);  // 1つずつ順番に待つ
    results.push(data);
  }
  return results;
}

// ✅ 並列で実行する（速い）
async function fetchAll(ids) {
  const results = await Promise.all(
    ids.map(id => fetchItem(id))
  );
  return results;
}
```

---

## よくある間違い

```javascript
// ❌ async 関数の戻り値を直接使おうとする
const data = fetchData();  // Promise が返る
console.log(data.name);   // undefined

// ✅ await するか .then() を使う
const data = await fetchData();
console.log(data.name);

// ❌ catch を書かない（エラーが握りつぶされる）
async function run() {
  const data = await fetch("/api/data");
}
// ✅ try/catch で囲む
async function run() {
  try {
    const data = await fetch("/api/data");
  } catch (error) {
    console.error("エラー:", error);
  }
}
```

---

## 重要ポイント

1. **非同期処理**：結果を待たずに次の処理に進む仕組み
2. **Promise**：「いずれ結果が出る」ことを表すオブジェクト
3. **async/await**：Promiseを同期処理のように書ける構文。**基本はこれを使う**
4. **try/catch** でエラーをキャッチする。catch を省略しない
5. 独立したPromiseは **`Promise.all`** で並列実行して高速化
6. **await 忘れ**と**競合状態**に注意

---

## 練習問題

1. 以下のコードの出力順を予想しよう：
   ```javascript
   console.log("A");
   setTimeout(() => console.log("B"), 0);
   Promise.resolve().then(() => console.log("C"));
   console.log("D");
   ```

2. `wait(ms)` 関数を作ろう（指定ミリ秒待つPromiseを返す）：
   ```javascript
   async function main() {
     console.log("開始");
     await wait(2000);
     console.log("2秒後");
   }
   ```

3. 3つのURLから並列でデータを取得し、すべての結果を表示するコードを書こう（Promise.allを使う）。

---

## ミニ課題

**「非同期クイズアプリ」の骨格を作ろう**

以下の仕様でクイズデータを非同期で取得・表示するプログラムを書こう：

```javascript
// クイズデータを返す疑似API
function fetchQuiz(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const quizzes = {
        1: { question: "1 + 1 = ?", answer: 2 },
        2: { question: "JSの正式名称は?", answer: "JavaScript" },
        3: { question: "typeof null は?", answer: "object" },
      };
      resolve(quizzes[id]);
    }, 500);  // 500ms の遅延
  });
}

// 全クイズを並列で取得して表示する
// Promise.all を使うこと
```
