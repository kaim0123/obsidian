# 7-2 fetchの基本（GET/POST、エラーハンドリング）

## 🎯 この章で学ぶこと

- `fetch` API の使い方を理解できます
- GET と POST の違い、それぞれの書き方を学びます
- HTTPステータスコード（200番台、400番台、500番台）の意味が分かります
- `try/catch` を使ったエラーハンドリングの典型パターンを覚えます
- JSONの送受信、ヘッダーの指定、認証トークンの付け方を知ります

## 📖 概念の説明

### fetchって何？

`fetch` はブラウザに組み込まれた **HTTPリクエストを送るためのAPI** です。サーバーに「データちょうだい」「これ保存して」と頼むときに使います。

例えるなら、**宅配便の注文** のようなものです。

- 宛先（URL）
- 配送方法（GET、POSTなどのメソッド）
- 中身（リクエストボディ）
- ラベル（ヘッダー）

を指定して「送ってください」とブラウザに頼むイメージ。

### Promiseが返ってくる

`fetch` は **Promise** を返します。Promiseは「**今は結果が出ていないけど、いつか結果が出る**」を表すオブジェクトです。

```js
fetch('/api/users')  // ← この時点ではまだリクエスト送ったばかり
  .then(response => response.json()) // ← レスポンスが返ってきたら処理
  .then(data => console.log(data));   // ← JSONに変換できたら処理
```

`async/await` を使うと、もっとスッキリ書けます。

```js
async function getUsers() {
  const response = await fetch('/api/users');
  const data = await response.json();
  console.log(data);
}
```

`await` は「**この行の結果が出るまで待ってね**」と書けるキーワード。`async` 関数の中でだけ使えます。

### HTTPメソッドの基本

| メソッド | 意味 | 使う場面 |
|---|---|---|
| GET | 取得 | データを読み出す |
| POST | 作成 | 新しいデータを作る |
| PUT | 全置換 | リソース全体を上書きする |
| PATCH | 部分更新 | 一部のフィールドだけ更新 |
| DELETE | 削除 | リソースを消す |

`fetch` のデフォルトはGETなので、GETの場合はメソッド指定を省略できます。

### ステータスコードの読み方

サーバーからの返事には **3桁のステータスコード** が付いています。

- **2xx 成功**：200 OK、201 Created、204 No Content
- **3xx 転送**：301 Moved Permanently、302 Found
- **4xx クライアントエラー**：400 Bad Request、401 Unauthorized、403 Forbidden、404 Not Found
- **5xx サーバーエラー**：500 Internal Server Error、503 Service Unavailable

ざっくり、**2系：成功**、**4系：あなたの送り方が悪い**、**5系：サーバーの調子が悪い**、と覚えれば十分です。

### fetchの「罠」：4xx / 5xx でも reject されない

`fetch` の重要なポイント：

> **HTTPエラー（404、500など）でもPromiseはrejectされず、resolveされる**

`response.ok`（200〜299の範囲なら true）を自分でチェックしないと、エラーをスルーしてしまいます。これは初心者がよく踏む地雷です。

### 用語の整理

- **fetch**：HTTPリクエストを送るブラウザAPI
- **Promise**：将来の値を表すオブジェクト
- **async/await**：Promiseを同期的に書ける糖衣構文
- **HTTPメソッド**：GET、POSTなどの動作種別
- **ステータスコード**：レスポンスの結果を表す3桁の数字
- **JSON**：JavaScript Object Notation。データの一般的な交換形式

## 💻 コード例

### 例1：GET の基本

```js
async function getUsers() {
  const res = await fetch('/api/users'); // GETリクエスト

  if (!res.ok) {
    // ステータスが2xx以外
    throw new Error(`HTTP ${res.status}`);
  }

  const users = await res.json(); // JSONをパース
  return users;
}
```

`res.ok` のチェックを忘れずに。

### 例2：URLパラメータ付きのGET

```js
async function searchProducts(query, page = 1) {
  const params = new URLSearchParams({ q: query, page: String(page) });
  const res = await fetch(`/api/products?${params}`);
  if (!res.ok) throw new Error('検索失敗');
  return res.json();
}
```

`URLSearchParams` は値を自動でエスケープしてくれるので便利です。

### 例3：POSTでJSONを送る

```js
async function createUser(user) {
  const res = await fetch('/api/users', {
    method: 'POST',                                  // メソッド指定
    headers: {
      'Content-Type': 'application/json',            // ボディはJSON
    },
    body: JSON.stringify(user),                       // オブジェクトを文字列化
  });

  if (!res.ok) {
    // エラーレスポンスから詳細を取り出す
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody.message || `HTTP ${res.status}`);
  }

  return res.json();
}

// 使用例
createUser({ name: '太郎', email: 'taro@example.com' });
```

POSTの定番パターン。ヘッダーに `Content-Type: application/json` を付け、bodyを `JSON.stringify` で文字列化します。

### 例4：認証トークンを付ける

```js
async function getMe() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('認証失敗');
  return res.json();
}
```

`Authorization: Bearer xxx` がもっとも一般的なトークン付けの形式です。

### 例5：try/catch でエラーをまとめて処理

```js
async function safelyFetchUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // ネットワークエラー、JSONパースエラー、HTTPエラーすべてここに来る
    console.error('ユーザー取得失敗:', err);
    throw err; // 呼び出し側にも知らせる
  }
}
```

`try/catch` を使うと、ネットワーク障害もJSONエラーもまとめてキャッチできます。

### 例6：Reactコンポーネントから使う

```jsx
import { useEffect, useState } from 'react';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setUsers(data);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error.message}</p>;
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
```

「アンマウント後setState問題」を `cancelled` フラグで防いでいます。

### 例7：DELETE と PATCH

```js
// DELETE
async function deletePost(id) {
  const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('削除失敗');
}

// PATCH
async function renamePost(id, newTitle) {
  const res = await fetch(`/api/posts/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle }),
  });
  if (!res.ok) throw new Error('更新失敗');
  return res.json();
}
```

### 例8：FormData（ファイルアップロードなど）

```js
async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  formData.append('userId', '123');

  // ⚠️ Content-Type は付けない（ブラウザが自動で設定する）
  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('アップロード失敗');
  return res.json();
}
```

ファイルを送るときは `FormData`。`Content-Type` ヘッダーは **自動設定に任せる** のがコツ（boundaryが必要なため）。

## ❌ よくある間違い

### 1. `res.ok` のチェックを忘れる

```js
// ❌ 404でも素通り
const res = await fetch('/api/users');
const data = await res.json(); // 404のHTMLをJSON.parseしようとして失敗
```

必ず `if (!res.ok) throw new Error(...)` を入れる。

### 2. POSTで `JSON.stringify` を忘れる

```js
// ❌ オブジェクトをそのまま渡しても送れない
fetch('/api/users', {
  method: 'POST',
  body: { name: '太郎' }, // ここがダメ
});

// ✅ 文字列化する
fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '太郎' }),
});
```

### 3. `Content-Type` の付け忘れ・付けすぎ

- JSONを送る → `Content-Type: application/json` 必須
- FormDataを送る → 付けない（ブラウザが自動設定）

### 4. 例外を握りつぶす

```js
// ❌ エラーを無視
try {
  await fetch(...);
} catch {} // 何も書かない
```

最低でも `console.error` で出力、できればユーザーに知らせる仕組みを作りましょう。

### 5. 認証情報をURLに入れる

```js
// ❌ トークンをURLに付ける
fetch(`/api/me?token=xxx`); // ログに残る、危険
```

トークンは必ず `Authorization` ヘッダーで送る。

## ✅ ベストプラクティス

1. **`res.ok` チェックを習慣化**：fetchの罠を回避。
2. **try/catch でまとめてエラー処理**：呼び出し側で扱いやすくなる。
3. **API呼び出しはサービス関数に集約**：UIから直接書かない。
4. **環境変数でAPI baseURLを管理**：`VITE_API_BASE` など。
5. **エラーレスポンスのbodyからメッセージを取り出す**：ユーザーに親切な表示が可能に。

## 🔬 実践演習

### お題：シンプルなTODOアプリ

- GET `/api/todos` で一覧取得
- POST `/api/todos` で新規作成
- DELETE `/api/todos/:id` で削除

の3つを `fetch` で実装してみましょう。エラー時には `try/catch` でメッセージを画面に出す。

### 発展課題

- API呼び出しを `services/todoApi.js` にまとめましょう
- 認証トークンを `Authorization` ヘッダーで送るようにしてみましょう

## 📝 まとめ

- `fetch` はブラウザ組み込みのHTTPリクエストAPI
- `res.ok` のチェックを忘れない（fetchの罠）
- POSTでは `Content-Type: application/json` と `JSON.stringify` を忘れない
- `try/catch` でネットワーク・パース・HTTPエラーをまとめて処理
- 認証はURLでなくヘッダーで

## 🔗 関連ページ

- [[7-1-フロントのデータフロー]]
- [[7-3-ローディング-エラー-空状態]]
- [[7-4-AbortControllerでキャンセル]]
- [[7-7-エラーとログ]]
- [[01_fetchとは]]
- [[01Programming/06_Frameworks/02_React/14_エラーハンドリングと品質/05-エラーとログ]]
