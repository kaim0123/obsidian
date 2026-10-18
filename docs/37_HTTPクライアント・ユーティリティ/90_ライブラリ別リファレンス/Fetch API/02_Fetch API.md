# Fetch API（フェッチ・エーピーアイ）

## Fetch APIとは

**Fetch API**は、ブラウザに標準装備されているHTTP通信を行うためのAPIです。追加のライブラリが不要で、Promiseベースのインターフェースを提供します。

### 基本情報

- **開発元**: Web標準（WHATWG）
- **対応開始**: Chrome 42+, Firefox 39+, Safari 10.1+
- **標準**: ブラウザ標準API
- **言語**: JavaScript
- **MDNドキュメント**: https://developer.mozilla.org/ja/docs/Web/API/Fetch_API

## Fetch APIの特徴

### ✅ メリット

1. **ブラウザ標準**
   - 追加のライブラリが不要
   - バンドルサイズが増えない

2. **Promiseベース**
   - async/awaitが使える
   - コールバック地獄を回避できる

3. **モダンなAPI**
   - 現在のJavaScriptの標準的な方法

4. **Stream対応**
   - 大きなデータをストリーミングで扱える

### ⚠️ デメリット

1. **機能が限定的**
   - Axiosほど機能が豊富ではない
   - インターセプターがない

2. **エラーハンドリング**
   - HTTPエラーステータスコードでも例外を投げない
   - 手動でエラーチェックが必要

3. **JSON変換**
   - 自動的にJSONをパースしない
   - 手動で`.json()`を呼ぶ必要がある

4. **リクエストのキャンセル**
   - AbortControllerを使用する必要がある（やや複雑）

## Fetch APIの基本例

### 基本的なGETリクエスト

```javascript
// Promiseチェーン
fetch('https://api.example.com/users')
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('エラー:', error);
  });

// async/await
async function fetchUsers() {
  try {
    const response = await fetch('https://api.example.com/users');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('エラー:', error);
  }
}
```

### POSTリクエスト

```javascript
async function createUser(userData) {
  try {
    const response = await fetch('https://api.example.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

// 使用
const newUser = await createUser({
  name: '太郎',
  email: 'taro@example.com'
});
```

### リクエストオプション

```javascript
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: '太郎',
    email: 'taro@example.com'
  }),
  mode: 'cors', // cors, no-cors, same-origin
  cache: 'no-cache', // default, no-cache, reload, force-cache
  credentials: 'include', // include, same-origin, omit
  redirect: 'follow', // manual, follow, error
  referrerPolicy: 'no-referrer'
});
```

### エラーハンドリング

```javascript
async function fetchWithErrorHandling(url) {
  try {
    const response = await fetch(url);

    // HTTPエラーステータスコードをチェック
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

// より詳細なエラーハンドリング
async function fetchWithDetailedErrorHandling(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      // エラーレスポンスの内容を取得
      const errorData = await response.json().catch(() => ({
        message: 'エラーが発生しました'
      }));

      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData.message}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      // ネットワークエラー
      console.error('ネットワークエラー:', error.message);
    } else {
      // その他のエラー
      console.error('エラー:', error.message);
    }
    throw error;
  }
}
```

### リクエストのキャンセル

```javascript
// AbortControllerを使用
const controller = new AbortController();

fetch('https://api.example.com/users', {
  signal: controller.signal
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('リクエストがキャンセルされました');
    } else {
      console.error('エラー:', error);
    }
  });

// リクエストをキャンセル
controller.abort();
```

### タイムアウトの実装

```javascript
function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, {
    ...options,
    signal: controller.signal
  })
    .then(response => {
      clearTimeout(timeoutId);
      return response;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました');
      }
      throw error;
    });
}

// 使用
try {
  const response = await fetchWithTimeout('https://api.example.com/users');
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error('エラー:', error.message);
}
```

### 並列リクエスト

```javascript
async function fetchMultipleUrls(urls) {
  try {
    const responses = await Promise.all(
      urls.map(url => fetch(url).then(res => res.json()))
    );
    return responses;
  } catch (error) {
    console.error('エラー:', error);
    throw error;
  }
}

// 使用
const urls = [
  'https://api.example.com/users',
  'https://api.example.com/posts',
  'https://api.example.com/comments'
];

const [users, posts, comments] = await fetchMultipleUrls(urls);
```

### カスタムFetchラッパー

```javascript
class FetchClient {
  constructor(baseURL, defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...defaultOptions.headers
      },
      ...defaultOptions
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...this.defaultOptions,
      ...options,
      headers: {
        ...this.defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Content-Typeに応じて適切なメソッドを呼ぶ
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// 使用
const api = new FetchClient('https://api.example.com', {
  headers: {
    'Authorization': 'Bearer token123'
  }
});

const users = await api.get('/users');
const newUser = await api.post('/users', { name: '太郎', email: 'taro@example.com' });
```

## Axiosとの比較

### Fetch API

```javascript
// エラーチェックが必要
const response = await fetch('/api/users');
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
const data = await response.json();
```

### Axios

```javascript
// 自動的にエラーハンドリング
const response = await axios.get('/api/users');
const data = response.data; // 自動的にJSONをパース
```

## まとめ

- Fetch APIはブラウザ標準のHTTP通信API
- 追加のライブラリが不要で、バンドルサイズが増えない
- Promiseベースで、async/awaitが使える
- エラーハンドリングやJSON変換は手動で行う必要がある
- シンプルな用途には十分だが、高度な機能が必要な場合はAxiosを検討

**初心者の方へ**: Fetch APIはブラウザ標準の機能なので、追加のライブラリをインストールせずにHTTP通信を行えます。まずはFetch APIを使って基本的なHTTP通信を覚えてから、必要に応じてAxiosなどのライブラリを検討することをおすすめします。


## 2026年時点の補足

- タイムアウトは `AbortSignal.timeout(ms)`、キャンセルとの併用は `AbortSignal.any([...])` で書ける（[[02_タイムアウトとキャンセル]]）
- Node.js 18+ では fetch が標準（中身は undici）。サーバー側では相対URLが使えない・Cookie が自動では付かない点に注意（[[02_リクエストとレスポンスの組み立て]]）

## 関連
- [[01_HTTPエラーの扱い]] — `res.ok` を見てエラーに変換する
- [[01_Axios]]・[[03_ky]]
