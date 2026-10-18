# 10. ネットワーク：APIを叩く

---

## この章で学ぶこと

- HTTPの基礎（GET / POST、ステータスコード）
- fetch APIの使い方
- エラーハンドリングの設計
- 認証の基本概念
- URLとクエリ文字列の組み立て方

---

## 10-1. HTTPの超基礎（GET / POST、ステータスコード）

### HTTPとは

HTTP（HyperText Transfer Protocol）は、ブラウザとサーバーが通信するためのルールです。

```
ブラウザ → リクエスト（お願い）→ サーバー
ブラウザ ← レスポンス（返答）← サーバー
```

### HTTPメソッド（何をしたいか）

| メソッド | 目的 | 例 |
|---------|------|-----|
| **GET** | データを取得 | ユーザー情報を取得 |
| **POST** | データを作成 | 新しいユーザーを登録 |
| **PUT** | データを全体更新 | ユーザー情報を更新 |
| **PATCH** | データを部分更新 | メールアドレスだけ変更 |
| **DELETE** | データを削除 | ユーザーを削除 |

### ステータスコード（結果を示す番号）

```
2xx：成功
  200 OK           → 成功
  201 Created      → 作成成功
  204 No Content   → 成功（返すデータなし）

3xx：リダイレクト
  301 Moved        → 恒久的に移動
  304 Not Modified → 変更なし（キャッシュを使え）

4xx：クライアントエラー（自分の間違い）
  400 Bad Request  → リクエストが不正
  401 Unauthorized → 認証が必要
  403 Forbidden    → アクセス権がない
  404 Not Found    → 見つからない
  429 Too Many Requests → リクエストが多すぎる

5xx：サーバーエラー（相手の問題）
  500 Internal Server Error → サーバー内部エラー
  503 Service Unavailable   → サービス一時停止
```

### リクエストとレスポンスの構造

```
【リクエスト】
メソッド URL
ヘッダー（メタ情報）
ボディ（送るデータ）※GETにはない

【レスポンス】
ステータスコード
ヘッダー（メタ情報）
ボディ（返ってきたデータ）
```

---

## 10-2. fetch（JSONの送受信）

### GETリクエスト（データ取得）

```javascript
async function getUser(id) {
  const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
  const user = await response.json();  // JSONをオブジェクトに変換
  console.log(user);
  return user;
}

await getUser(1);
// → { id: 1, name: "Leanne Graham", ... }
```

### POSTリクエスト（データ送信）

```javascript
async function createPost(title, body) {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",  // JSONを送ることを伝える
    },
    body: JSON.stringify({                 // オブジェクトをJSON文字列に変換
      title,
      body,
      userId: 1,
    }),
  });

  const data = await response.json();
  console.log("作成成功:", data);
  return data;
}

await createPost("テスト投稿", "これはテストです");
```

### PUT / PATCH / DELETE

```javascript
// PUT（全体更新）
await fetch("/api/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "太郎", age: 21, email: "taro@example.com" }),
});

// PATCH（部分更新）
await fetch("/api/users/1", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ age: 21 }),  // 変更したい部分だけ
});

// DELETE（削除）
await fetch("/api/users/1", {
  method: "DELETE",
});
```

### レスポンスの種類

```javascript
const response = await fetch(url);

// JSON
const json = await response.json();

// テキスト
const text = await response.text();

// Blob（画像やファイル）
const blob = await response.blob();
```

---

## 10-3. エラーハンドリング設計（失敗する前提）

### fetch はネットワークエラーでしか reject しない

```javascript
// ⚠️ fetch は 404 や 500 でもエラーを投げない！
const response = await fetch("/api/not-found");
console.log(response.ok);     // → false
console.log(response.status); // → 404
// でも catch には入らない！
```

### 正しいエラーハンドリング

```javascript
async function fetchJSON(url) {
  const response = await fetch(url);

  // ステータスコードをチェック
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// 使う側
try {
  const data = await fetchJSON("/api/users");
  console.log(data);
} catch (error) {
  console.error("データ取得に失敗:", error.message);
}
```

### API通信のラッパー関数

```javascript
// 共通のAPI呼び出し関数
async function apiRequest(url, options = {}) {
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // bodyがオブジェクトならJSON文字列に変換
  if (mergedOptions.body && typeof mergedOptions.body === "object") {
    mergedOptions.body = JSON.stringify(mergedOptions.body);
  }

  const response = await fetch(url, mergedOptions);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorBody}`);
  }

  // 204 No Content の場合はボディがない
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

// 使い方
const users = await apiRequest("/api/users");
const newUser = await apiRequest("/api/users", {
  method: "POST",
  body: { name: "太郎", age: 20 },
});
```

---

## 10-4. 認証の入口（トークン、Cookieの概念）

### なぜ認証が必要か

APIには「誰でもアクセスできるもの」と「ログインが必要なもの」があります。

### トークン認証（Bearer Token）

```javascript
// 1. ログインしてトークンを取得
const loginResponse = await fetch("/api/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "secret" }),
});
const { token } = await loginResponse.json();

// 2. 以降のリクエストにトークンを付ける
const userResponse = await fetch("/api/me", {
  headers: {
    "Authorization": `Bearer ${token}`,  // ← ここにトークンを入れる
  },
});
const user = await userResponse.json();
```

### Cookie認証

Cookieはブラウザが自動で送信してくれるので、明示的にヘッダーを設定する必要がありません。
サーバーがレスポンスで `Set-Cookie` ヘッダーを返すと、ブラウザが自動で保存し、同じオリジンへのリクエストに自動で付けます。

```javascript
// Cookie認証の場合、credentials を設定
await fetch("/api/me", {
  credentials: "include",  // Cookie を送信する
});
```

### 今の段階で覚えること

- **認証 = 「あなたは誰？」を証明する仕組み**
- **トークン**：ログイン後にもらう「通行証」。リクエストに毎回つける
- **Cookie**：ブラウザが自動で管理してくれる「通行証」

---

## 10-5. クエリ文字列（URL / URLSearchParams）でAPIを組み立てる

### クエリ文字列とは

URLの `?` 以降の部分。検索条件やフィルタをサーバーに伝えます。

```
https://api.example.com/users?page=1&limit=10&sort=name
                              ↑ クエリ文字列
```

### URLSearchParams

```javascript
// クエリ文字列を安全に組み立てる
const params = new URLSearchParams({
  page: 1,
  limit: 10,
  sort: "name",
  q: "太郎 花子",  // スペースも自動エンコード
});

console.log(params.toString());
// → "page=1&limit=10&sort=name&q=%E5%A4%AA%E9%83%8E+%E8%8A%B1%E5%AD%90"

const url = `https://api.example.com/users?${params}`;
const response = await fetch(url);
```

### URL オブジェクト

```javascript
const url = new URL("https://api.example.com/users");
url.searchParams.set("page", 1);
url.searchParams.set("limit", 10);
url.searchParams.append("tag", "javascript");
url.searchParams.append("tag", "react");  // 同じキーを複数

console.log(url.toString());
// → "https://api.example.com/users?page=1&limit=10&tag=javascript&tag=react"

// 既存のURLからパラメータを読み取る
const existingUrl = new URL("https://example.com/search?q=hello&page=2");
console.log(existingUrl.searchParams.get("q"));     // → "hello"
console.log(existingUrl.searchParams.get("page"));   // → "2"
```

### なぜ手動で文字列結合しないのか

```javascript
// ❌ 手動で組み立てると特殊文字でバグる
const query = "太郎&admin=true";
const url = `/api/search?q=${query}`;
// → /api/search?q=太郎&admin=true  ← & が区切りと解釈される！

// ✅ URLSearchParams を使えば自動エンコード
const params = new URLSearchParams({ q: query });
const safeUrl = `/api/search?${params}`;
// → /api/search?q=%E5%A4%AA%E9%83%8E%26admin%3Dtrue  ← 安全
```

---

## よくある間違い

```javascript
// ❌ fetch が 404 でエラーを投げると思っている
try {
  const response = await fetch("/not-found");
  // ここに来る（404でもcatchに入らない）
} catch (error) {
  // ネットワークエラーのときだけここに来る
}

// ❌ response.json() を2回呼ぶ
const response = await fetch("/api/data");
const data1 = await response.json();  // OK
const data2 = await response.json();  // エラー！（ボディは1回しか読めない）

// ❌ Content-Type ヘッダーを忘れる
await fetch("/api/users", {
  method: "POST",
  body: JSON.stringify({ name: "太郎" }),  // ヘッダーがないとサーバーが解釈できない
});
```

---

## 重要ポイント

1. **HTTPメソッド**：GET（取得）/ POST（作成）/ PUT（更新）/ DELETE（削除）
2. **ステータスコード**：2xx=成功、4xx=クライアントエラー、5xx=サーバーエラー
3. **fetch** はネットワークエラーでしかrejectしない。**`response.ok`** をチェックする
4. JSON送信時は **`Content-Type: application/json`** と **`JSON.stringify`** を忘れない
5. クエリ文字列は **`URLSearchParams`** で安全に組み立てる
6. 認証は **Authorization ヘッダー** にトークンを入れるのが一般的

---

## 練習問題

1. JSONPlaceholder（`https://jsonplaceholder.typicode.com`）から、ユーザー一覧（`/users`）を取得して、名前とメールアドレスだけを表示するプログラムを書こう。

2. 同じAPIに対して、POSTで新しい投稿を作成するプログラムを書こう。

3. エラーハンドリング付きの `fetchJSON` 関数を作り、存在しないURL（404）にアクセスしたときに適切なエラーメッセージを表示しよう。

---

## ミニ課題

**「ユーザー検索アプリ」を作ろう**

HTMLの入力欄にユーザー名を入力すると、JSONPlaceholder APIからユーザーを検索して表示するアプリを作ろう。

要件：
- 入力欄に名前を入れて「検索」ボタンを押す
- `/users` から全ユーザーを取得し、名前でフィルタリング
- 結果を画面に表示（名前、メール、所在地）
- 通信中は「読み込み中...」を表示
- エラー時は「エラーが発生しました」を表示
