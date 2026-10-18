# fetchとは

`fetch`は、JavaScriptでHTTPリクエストを送信するための組み込みAPIです。この章では、`fetch`の基本概念と使い方について初心者向けに解説します。

## 📖 fetchとは何か

**fetch（フェッチ）**は、ブラウザに組み込まれているJavaScriptのAPIで、サーバーにHTTPリクエストを送信し、レスポンスを受け取るための機能です。

### 日常生活での例え

`fetch`は、電話をかけて情報を聞く行為に似ています。

- **電話をかける**: `fetch()`を呼び出す
- **相手が応答する**: サーバーがレスポンスを返す
- **情報を聞く**: データを取得する

## 🔍 fetchの基本

### 基本的な使い方

```javascript
// 最もシンプルな例
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => console.log(data));
```

### fetchの特徴

1. **Promiseを返す**: 非同期処理を扱いやすい
2. **ブラウザに組み込まれている**: 追加のライブラリが不要
3. **モダンなAPI**: 古い`XMLHttpRequest`の代替

## 💻 基本的な使い方

### 1. GETリクエスト（データ取得）

```javascript
// ユーザー一覧を取得
fetch('https://api.example.com/users')
  .then(response => {
    // レスポンスが成功したか確認
    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }
    // JSONデータに変換
    return response.json();
  })
  .then(users => {
    console.log('ユーザー一覧:', users);
  })
  .catch(error => {
    console.error('エラー:', error);
  });
```

### 2. async/awaitを使った書き方

```javascript
// より読みやすい書き方
async function getUsers() {
  try {
    const response = await fetch('https://api.example.com/users');
    
    if (!response.ok) {
      throw new Error('エラーが発生しました');
    }
    
    const users = await response.json();
    console.log('ユーザー一覧:', users);
    return users;
  } catch (error) {
    console.error('エラー:', error);
  }
}

// 使用例
getUsers();
```

### 3. POSTリクエスト（データ送信）

```javascript
async function createUser(userData) {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('ユーザーの作成に失敗しました');
    }
    
    const newUser = await response.json();
    console.log('作成されたユーザー:', newUser);
    return newUser;
  } catch (error) {
    console.error('エラー:', error);
  }
}

// 使用例
createUser({
  name: '山田太郎',
  email: 'yamada@example.com',
});
```

## 📋 fetchのオプション

`fetch`の第2引数で、リクエストの詳細を設定できます。

```javascript
fetch(url, {
  method: 'POST',           // HTTPメソッド（GET, POST, PUT, DELETEなど）
  headers: {                // リクエストヘッダー
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123',
  },
  body: JSON.stringify(data), // リクエストボディ
  mode: 'cors',             // CORSモード
  cache: 'no-cache',        // キャッシュの設定
});
```

### 主なオプション

| オプション | 説明 | 例 |
|-----------|------|-----|
| `method` | HTTPメソッド | `'GET'`, `'POST'`, `'PUT'`, `'DELETE'` |
| `headers` | リクエストヘッダー | `{ 'Content-Type': 'application/json' }` |
| `body` | リクエストボディ | `JSON.stringify(data)` |
| `mode` | リクエストモード | `'cors'`, `'no-cors'`, `'same-origin'` |
| `cache` | キャッシュの設定 | `'no-cache'`, `'reload'`, `'force-cache'` |

## 🔄 レスポンスの処理

### レスポンスオブジェクトの主なメソッド

```javascript
const response = await fetch('https://api.example.com/users');

// JSONデータを取得
const jsonData = await response.json();

// テキストデータを取得
const textData = await response.text();

// バイナリデータを取得
const blobData = await response.blob();

// ステータスコードを確認
console.log(response.status);      // 200, 404, 500など
console.log(response.ok);          // true（200-299の場合）
console.log(response.statusText);  // "OK", "Not Found"など
```

## 💡 実践例

### 完全なユーザー管理の例

```javascript
// ユーザー一覧を取得
async function fetchUsers() {
  try {
    const response = await fetch('https://api.example.com/users');
    if (!response.ok) throw new Error('ユーザー一覧の取得に失敗しました');
    const users = await response.json();
    return users;
  } catch (error) {
    console.error('エラー:', error);
    return [];
  }
}

// 特定のユーザーを取得
async function fetchUser(userId) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`);
    if (!response.ok) throw new Error('ユーザーの取得に失敗しました');
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// ユーザーを作成
async function createUser(userData) {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('ユーザーの作成に失敗しました');
    const newUser = await response.json();
    return newUser;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// ユーザーを更新
async function updateUser(userId, userData) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) throw new Error('ユーザーの更新に失敗しました');
    const updatedUser = await response.json();
    return updatedUser;
  } catch (error) {
    console.error('エラー:', error);
    return null;
  }
}

// ユーザーを削除
async function deleteUser(userId) {
  try {
    const response = await fetch(`https://api.example.com/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('ユーザーの削除に失敗しました');
    return true;
  } catch (error) {
    console.error('エラー:', error);
    return false;
  }
}
```

## ⚠️ よくある間違いと注意点

### 1. レスポンスを待たずに処理する

```javascript
// ❌ 間違い
let users;
fetch('/api/users')
  .then(res => res.json())
  .then(data => users = data);
console.log(users); // undefined（まだデータが取得できていない）

// ✅ 正しい
fetch('/api/users')
  .then(res => res.json())
  .then(data => {
    console.log(data); // データが取得できた後に処理
  });
```

### 2. エラーハンドリングを忘れる

```javascript
// ❌ 間違い
fetch('/api/users')
  .then(res => res.json())
  .then(data => console.log(data));

// ✅ 正しい
fetch('/api/users')
  .then(res => {
    if (!res.ok) throw new Error('エラーが発生しました');
    return res.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('エラー:', error));
```

### 3. ヘッダーを正しく設定しない

```javascript
// ❌ 間違い（JSONを送信するのにContent-Typeを設定していない）
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: '山田太郎' })
});

// ✅ 正しい
fetch('/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: '山田太郎' })
});
```

### 4. CORSエラー

```javascript
// 異なるオリジンからのアクセスでエラーが発生する場合
// サーバー側でCORSを許可する必要がある

// クライアント側（ブラウザ）
fetch('https://api.example.com/users')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(error => console.error('CORSエラー:', error));
```

## 🔄 fetchとXMLHttpRequestの違い

### XMLHttpRequest（古い方法）

```javascript
// 複雑で読みにくい
const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://api.example.com/users');
xhr.onload = function() {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log(data);
  }
};
xhr.send();
```

### fetch（モダンな方法）

```javascript
// シンプルで読みやすい
fetch('https://api.example.com/users')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🎯 まとめ

- **fetch**は、JavaScriptでHTTPリクエストを送信するためのAPI
- **Promiseを返す**ため、`then()`や`async/await`で処理できる
- **ブラウザに組み込まれている**ため、追加のライブラリが不要
- **エラーハンドリング**を忘れずに実装する
- **ヘッダーを正しく設定**することが重要
- **CORSエラー**に注意する

## 📚 次のステップ

fetchの基本を理解したら、次は以下を学習しましょう：

- [リクエストとレスポンスとは](./03_リクエストとレスポンスとは.md) - fetchが送受信するリクエストとレスポンス
- [APIとは](./08_APIとは.md) - fetchを使ったAPIの呼び出し
- [HTTP・CORS完全ガイド](../06_HTTP・CORS/README.md) - HTTPプロトコルの詳細とCORS

