# Axios（アクシオス）

## Axiosとは

**Axios**は、PromiseベースのHTTPクライアントライブラリです。ブラウザとNode.jsの両方で動作し、HTTPリクエストを簡単に送信できます。

### 基本情報

- **開発元**: Matt Zabriskie
- **リリース年**: 2014年
- **ライセンス**: MIT
- **言語**: JavaScript、TypeScript
- **公式サイト**: https://axios-http.com/
- **GitHub**: https://github.com/axios/axios

## Axiosの特徴

### ✅ メリット

1. **Promiseベース**
   - async/awaitが使える
   - コールバック地獄を回避できる

2. **豊富な機能**
   - リクエスト/レスポンスのインターセプター
   - 自動的なJSON変換
   - リクエスト/レスポンスの変換
   - タイムアウト設定

3. **エラーハンドリング**
   - ネットワークエラーを自動的に検出
   - HTTPステータスコードに基づくエラー処理

4. **ブラウザとNode.jsの両方で動作**
   - 同じAPIを両方で使える

5. **インターセプター**
   - リクエスト/レスポンスの前後に処理を追加できる
   - 認証トークンの追加などに便利

### ⚠️ デメリット

1. **依存関係**
   - 追加のライブラリが必要
   - バンドルサイズが増える

2. **標準ではない**
   - Fetch APIはブラウザ標準だが、Axiosはサードパーティ

## Axiosのインストール

```bash
npm install axios
```

## Axiosの基本例

### 基本的なリクエスト

```javascript
import axios from 'axios';

// GETリクエスト
axios.get('https://api.example.com/users')
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// async/awaitを使った場合
async function fetchUsers() {
  try {
    const response = await axios.get('https://api.example.com/users');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### 各種HTTPメソッド

```javascript
import axios from 'axios';

// GET
const response = await axios.get('/api/users');

// POST
const response = await axios.post('/api/users', {
  name: '太郎',
  email: 'taro@example.com'
});

// PUT
const response = await axios.put('/api/users/1', {
  name: '太郎（更新）',
  email: 'taro-updated@example.com'
});

// PATCH
const response = await axios.patch('/api/users/1', {
  name: '太郎（部分更新）'
});

// DELETE
const response = await axios.delete('/api/users/1');
```

### リクエストの設定

```javascript
import axios from 'axios';

// 設定オブジェクトを使用
const response = await axios({
  method: 'POST',
  url: '/api/users',
  data: {
    name: '太郎',
    email: 'taro@example.com'
  },
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  timeout: 5000, // タイムアウト（ミリ秒）
  params: {
    page: 1,
    limit: 10
  }
});
```

### エラーハンドリング

```javascript
import axios from 'axios';

try {
  const response = await axios.get('/api/users');
} catch (error) {
  if (error.response) {
    // サーバーがレスポンスを返したが、エラーステータスコード
    console.error('ステータスコード:', error.response.status);
    console.error('データ:', error.response.data);
  } else if (error.request) {
    // リクエストは送信されたが、レスポンスが返ってこない
    console.error('リクエストエラー:', error.request);
  } else {
    // リクエストの設定中にエラーが発生
    console.error('エラー:', error.message);
  }
}
```

### インスタンスの作成

```javascript
import axios from 'axios';

// カスタムインスタンスを作成
const apiClient = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 使用
const response = await apiClient.get('/users');
```

### インターセプター

```javascript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api.example.com'
});

// リクエストインターセプター
apiClient.interceptors.request.use(
  config => {
    // リクエストの前に処理を追加
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
  response => {
    // レスポンスの前に処理を追加
    return response;
  },
  error => {
    // エラーハンドリング
    if (error.response?.status === 401) {
      // 認証エラーの場合、ログインページにリダイレクト
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### 並列リクエスト

```javascript
import axios from 'axios';

// 複数のリクエストを並列で実行
const [usersResponse, postsResponse] = await Promise.all([
  axios.get('/api/users'),
  axios.get('/api/posts')
]);

console.log(usersResponse.data);
console.log(postsResponse.data);
```

### リクエストのキャンセル

```javascript
import axios from 'axios';

// AbortControllerを使用（Axios 0.22.0以降）
const controller = new AbortController();

axios.get('/api/users', {
  signal: controller.signal
})
  .then(response => console.log(response.data))
  .catch(error => {
    if (axios.isCancel(error)) {
      console.log('リクエストがキャンセルされました');
    }
  });

// リクエストをキャンセル
controller.abort();
```

## 実用的な例

### APIクライアントクラスの作成

```javascript
import axios from 'axios';

class ApiClient {
  constructor(baseURL) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // インターセプターの設定
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get(url, config) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url, data, config) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url, data, config) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async delete(url, config) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// 使用
const api = new ApiClient('https://api.example.com');
const users = await api.get('/users');
```

## Fetch APIとの比較

### Axios

```javascript
import axios from 'axios';

const response = await axios.get('/api/users');
console.log(response.data); // 自動的にJSONをパース
```

### Fetch API

```javascript
const response = await fetch('/api/users');
const data = await response.json(); // 手動でJSONをパース
```

## まとめ

- AxiosはPromiseベースのHTTPクライアントライブラリ
- ブラウザとNode.jsの両方で動作
- インターセプター、自動的なJSON変換などの便利な機能
- エラーハンドリングが簡単
- 実用的なAPIクライアントを簡単に構築できる

**初心者の方へ**: Axiosは使いやすく、多くのプロジェクトで採用されているため、HTTP通信を扱う場合の標準的な選択肢の一つです。まずは基本的なGET/POSTリクエストから始めて、徐々にインターセプターやエラーハンドリングなどの高度な機能を使っていくことをおすすめします。


## 2026年時点の補足

- **キャンセルは `signal`（AbortController）で**。古い記事にある `CancelToken` は非推奨
- **リトライは内蔵されていない**。`axios-retry` を足すか、インターセプターで作る（[[03_リトライと指数バックオフ]]）
- **サプライチェーン攻撃に注意**：2026年3月31日、メンテナーの npm アカウントが乗っ取られ、不正な `axios@1.14.1`・`axios@0.30.4` が約3時間公開された（依存に紛れ込ませた `plain-crypto-js` の postinstall でマルウェアを入れる手口）。lockfile を固定して `npm ci` を使う、インストールスクリプトを制限する、などの対策をとる
- 新規プロジェクトでは fetch ベースの ky も比較する（[[HTTPクライアント・ユーティリティ比較]]）

## 関連
- [[01_共通クライアントを1つ作る]]・[[02_インターセプターとフック]]・[[01_トークンの付与と自動更新]]
- [[02_Fetch API]]・[[03_ky]]
