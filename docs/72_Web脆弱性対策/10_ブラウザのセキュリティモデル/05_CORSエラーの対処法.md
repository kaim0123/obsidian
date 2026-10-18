# CORSエラーの対処法

実際にCORSエラーが発生した場合の対処方法を解説します。

## よくあるCORSエラー

### エラーメッセージ1: No 'Access-Control-Allow-Origin' header

```
Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present 
on the requested resource.
```

**原因**: サーバーが`Access-Control-Allow-Origin`ヘッダーを返していない

**解決策**: サーバー側でCORSヘッダーを設定する

### エラーメッセージ2: Credentials flag is true

```
Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com' 
has been blocked by CORS policy: The value of the 'Access-Control-Allow-Origin' header 
in the response must not be the wildcard '*' when the request's credentials mode is 'include'.
```

**原因**: `credentials: 'include'`を使用しているのに、`Access-Control-Allow-Origin`が`*`になっている

**解決策**: 具体的なオリジンを指定する

### エラーメッセージ3: Method not allowed

```
Access to fetch at 'https://api.example.com/users' from origin 'https://myapp.com' 
has been blocked by CORS policy: Method PUT is not allowed by Access-Control-Allow-Methods.
```

**原因**: 使用しようとしているHTTPメソッドが許可されていない

**解決策**: `Access-Control-Allow-Methods`に該当メソッドを追加する

## サーバー側での対処法

### Node.js (Express) の場合

#### 方法1: corsパッケージを使用（推奨）

```bash
npm install cors
```

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// 全てのオリジンを許可（開発環境のみ）
app.use(cors());

// 特定のオリジンのみ許可
app.use(cors({
  origin: 'https://myapp.com',
  credentials: true
}));

// 複数のオリジンを許可
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true
}));
```

#### 方法2: 手動でヘッダーを設定

```javascript
const express = require('express');
const app = express();

// 全てのリクエストに適用
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// プリフライトリクエストの処理
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});
```

### Next.js (API Routes) の場合

```javascript
// pages/api/users.js または app/api/users/route.js
export default function handler(req, res) {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', 'https://myapp.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // プリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 実際の処理
  if (req.method === 'GET') {
    res.status(200).json({ message: 'Success' });
  }
}
```

### Python (Flask) の場合

```bash
pip install flask-cors
```

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# 全てのオリジンを許可
CORS(app)

# 特定のオリジンのみ許可
CORS(app, origins=['https://myapp.com'])

# より詳細な設定
CORS(app, 
     origins=['https://myapp.com'],
     methods=['GET', 'POST', 'PUT', 'DELETE'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)
```

### Python (FastAPI) の場合

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORSミドルウェアを追加
app.add_middleware(
    CORSMiddleware,
    allow_origins=['https://myapp.com'],  # 許可するオリジン
    allow_credentials=True,
    allow_methods=['GET', 'POST', 'PUT', 'DELETE'],
    allow_headers=['Content-Type', 'Authorization'],
)
```

## クライアント側での対処法

### 開発環境での一時的な対処

#### 方法1: ブラウザの拡張機能（非推奨）

開発中のみ使用する場合：
- CORS Unblock などの拡張機能を使用
- **本番環境では使用しない**

#### 方法2: プロキシサーバーを使用

Next.jsの場合、`next.config.js`でプロキシを設定：

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ];
  },
};
```

これにより、同じオリジンからのリクエストとして扱われます。

### credentialsを含むリクエスト

クッキーや認証情報を含める場合：

```javascript
fetch('https://api.example.com/users', {
  credentials: 'include'  // クッキーを含める
});

// または
fetch('https://api.example.com/users', {
  credentials: 'same-origin'  // 同じオリジンの場合のみ
});
```

サーバー側でも対応が必要：

```javascript
// Expressの場合
app.use(cors({
  origin: 'https://myapp.com',  // *は使えない
  credentials: true
}));
```

## 環境別の設定

### 開発環境

```javascript
// 開発環境では全てのオリジンを許可
const corsOptions = {
  origin: process.env.NODE_ENV === 'development' ? '*' : 'https://myapp.com',
  credentials: process.env.NODE_ENV === 'production'
};
```

### 本番環境

```javascript
// 本番環境では特定のオリジンのみ許可
const corsOptions = {
  origin: ['https://myapp.com', 'https://www.myapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

## トラブルシューティング

### 問題1: プリフライトリクエストが失敗する

**確認ポイント**:
1. OPTIONSメソッドのハンドラーが正しく設定されているか
2. `Access-Control-Allow-Methods`に使用するメソッドが含まれているか
3. `Access-Control-Allow-Headers`に使用するヘッダーが含まれているか

### 問題2: credentialsが送信されない

**確認ポイント**:
1. クライアント側で`credentials: 'include'`を指定しているか
2. サーバー側で`Access-Control-Allow-Credentials: true`を返しているか
3. `Access-Control-Allow-Origin`が`*`ではなく、具体的なオリジンになっているか

### 問題3: 開発環境では動くが本番環境で動かない

**確認ポイント**:
1. 環境変数の設定が正しいか
2. 本番環境のオリジンが正しく設定されているか
3. HTTPS/HTTPの違いがないか

## セキュリティのベストプラクティス

### 1. 最小限のオリジンを許可する

```javascript
// 悪い例
app.use(cors({
  origin: '*'  // 全て許可（本番環境では非推奨）
}));

// 良い例
app.use(cors({
  origin: ['https://myapp.com', 'https://www.myapp.com']
}));
```

### 2. 必要最小限のメソッドとヘッダーを許可する

```javascript
// 悪い例
app.use(cors({
  allowMethods: ['*'],
  allowHeaders: ['*']
}));

// 良い例
app.use(cors({
  allowMethods: ['GET', 'POST'],  // 実際に使うメソッドのみ
  allowHeaders: ['Content-Type']  // 実際に使うヘッダーのみ
}));
```

### 3. 環境変数で管理する

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins
}));
```

## まとめ

### サーバー側での対処
- CORSミドルウェアを使用する（推奨）
- 必要に応じて手動でヘッダーを設定
- プリフライトリクエスト（OPTIONS）を処理する

### クライアント側での対処
- 開発環境ではプロキシを使用する
- credentialsを含む場合は適切に設定する

### セキュリティ
- 本番環境では具体的なオリジンのみを許可
- 必要最小限のメソッドとヘッダーのみを許可
- 環境変数で設定を管理する

次は「08_実践例.md」で、実際のコード例を見ながら学習しましょう。

