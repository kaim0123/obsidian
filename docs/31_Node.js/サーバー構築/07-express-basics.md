# Express.js入門

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[Node.js/06-http-server|← 前章: HTTPサーバー]]
- [[Node.js/08-routing|次章: ルーティング →]]

## Express.jsとは？

### 基本的な概念

**Express.js**
- Node.js用のWebアプリケーションフレームワーク
- シンプルで柔軟なAPIを提供
- ミドルウェアアーキテクチャを採用
- 豊富なエコシステムとコミュニティ

### Express.jsの特徴

#### 1. シンプルなセットアップ
```javascript
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

app.listen(3000, () => {
  console.log('サーバーがポート3000で起動しました');
});
```

#### 2. ミドルウェアアーキテクチャ
```javascript
// ミドルウェアの例
app.use(express.json()); // JSONボディパーサー
app.use(express.static('public')); // 静的ファイル配信
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

#### 3. ルーティング
```javascript
// 基本的なルーティング
app.get('/users', (req, res) => {
  res.json({ users: [] });
});

app.post('/users', (req, res) => {
  res.status(201).json({ message: 'ユーザーが作成されました' });
});
```

## Express.jsのインストール

### プロジェクトの初期化
```bash
# プロジェクトディレクトリの作成
mkdir my-express-app
cd my-express-app

# package.jsonの初期化
npm init -y

# Express.jsのインストール
npm install express
```

### package.jsonの設定
```json
{
  "name": "my-express-app",
  "version": "1.0.0",
  "description": "Express.jsアプリケーション",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

## Express.jsの基本構造

### アプリケーションの作成
```javascript
const express = require('express');
const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ルートの定義
app.get('/', (req, res) => {
  res.send('Hello, Express!');
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});
```

## Express.jsの主要API関数

### アプリケーション関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `express()` | Expressアプリケーションを作成 | `const app = express()` |
| `app.listen()` | サーバーを起動 | `app.listen(3000, callback)` |
| `app.use()` | ミドルウェアを登録 | `app.use(express.json())` |
| `app.set()` | アプリケーション設定 | `app.set('view engine', 'ejs')` |
| `app.get()` | 設定値を取得 | `app.get('view engine')` |
| `app.locals` | ローカル変数を設定 | `app.locals.title = 'My App'` |

### ルーティング関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `app.get()` | GETリクエストを処理 | `app.get('/users', handler)` |
| `app.post()` | POSTリクエストを処理 | `app.post('/users', handler)` |
| `app.put()` | PUTリクエストを処理 | `app.put('/users/:id', handler)` |
| `app.delete()` | DELETEリクエストを処理 | `app.delete('/users/:id', handler)` |
| `app.patch()` | PATCHリクエストを処理 | `app.patch('/users/:id', handler)` |
| `app.all()` | すべてのHTTPメソッドを処理 | `app.all('/api/*', handler)` |
| `app.route()` | ルートチェーンを作成 | `app.route('/users').get().post()` |

### レスポンス関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `res.send()` | レスポンスを送信 | `res.send('Hello')` |
| `res.json()` | JSONレスポンスを送信 | `res.json({data: 'value'})` |
| `res.render()` | テンプレートをレンダリング | `res.render('index', {data})` |
| `res.redirect()` | リダイレクト | `res.redirect('/home')` |
| `res.status()` | ステータスコードを設定 | `res.status(404).send('Not Found')` |
| `res.set()` | ヘッダーを設定 | `res.set('Content-Type', 'text/html')` |
| `res.cookie()` | クッキーを設定 | `res.cookie('name', 'value')` |
| `res.clearCookie()` | クッキーを削除 | `res.clearCookie('name')` |
| `res.download()` | ファイルをダウンロード | `res.download('file.pdf')` |
| `res.sendFile()` | ファイルを送信 | `res.sendFile('/path/to/file')` |

### リクエスト関数

| 関数 | 説明 | 例 |
|------|------|-----|
| `req.params` | URLパラメータを取得 | `req.params.id` |
| `req.query` | クエリパラメータを取得 | `req.query.page` |
| `req.body` | リクエストボディを取得 | `req.body.name` |
| `req.headers` | リクエストヘッダーを取得 | `req.headers['user-agent']` |
| `req.cookies` | クッキーを取得 | `req.cookies.name` |
| `req.get()` | ヘッダー値を取得 | `req.get('Content-Type')` |
| `req.is()` | コンテンツタイプをチェック | `req.is('application/json')` |

## 組み込みミドルウェア

### 主要な組み込みミドルウェア

| ミドルウェア | 説明 | 例 |
|-------------|------|-----|
| `express.json()` | JSONボディパーサー | `app.use(express.json())` |
| `express.urlencoded()` | URLエンコードボディパーサー | `app.use(express.urlencoded({extended: true}))` |
| `express.static()` | 静的ファイル配信 | `app.use(express.static('public'))` |
| `express.raw()` | 生データパーサー | `app.use(express.raw())` |
| `express.text()` | テキストパーサー | `app.use(express.text())` |

### ミドルウェアの使用例
```javascript
const express = require('express');
const app = express();

// JSONボディパーサー
app.use(express.json());

// URLエンコードボディパーサー
app.use(express.urlencoded({ extended: true }));

// 静的ファイル配信
app.use(express.static('public'));

// カスタムミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});
```

## 基本的なアプリケーション例

### シンプルなWebサーバー
```javascript
const express = require('express');
const app = express();

// ミドルウェアの設定
app.use(express.json());
app.use(express.static('public'));

// ルートの定義
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to Express.js</h1>
    <p>This is a simple Express.js application.</p>
  `);
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newUser = { id: Date.now(), name };
  res.status(201).json(newUser);
});

// エラーハンドリング
app.use((req, res) => {
  res.status(404).send('Page not found');
});

// サーバーの起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`http://localhost:${PORT} にアクセスしてください`);
});
```

### 環境変数の設定
```javascript
// .envファイル
NODE_ENV=development
PORT=3000
DB_URL=mongodb://localhost:27017/myapp

// app.js
require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
  console.log(`環境: ${NODE_ENV}`);
});
```

## 開発環境の設定

### nodemonの設定
```json
// package.json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "debug": "nodemon --inspect app.js"
  }
}
```

### nodemon.jsonの設定
```json
{
  "watch": ["app.js", "routes/", "models/"],
  "ext": "js,json",
  "ignore": ["node_modules/", "public/"],
  "env": {
    "NODE_ENV": "development"
  }
}
```

## プロジェクト構造

### 推奨ディレクトリ構造
```
my-express-app/
├── app.js                 # メインアプリケーションファイル
├── package.json           # プロジェクト設定
├── .env                   # 環境変数
├── .gitignore            # Git除外設定
├── public/               # 静的ファイル
│   ├── css/
│   ├── js/
│   └── images/
├── views/                # テンプレートファイル
│   ├── layouts/
│   └── partials/
├── routes/               # ルートファイル
│   ├── index.js
│   ├── users.js
│   └── api.js
├── models/               # データモデル
├── controllers/          # コントローラー
├── middleware/           # カスタムミドルウェア
├── config/              # 設定ファイル
└── logs/                # ログファイル
```

### モジュール分割の例
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ users: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ message: 'User created' });
});

module.exports = router;

// app.js
const express = require('express');
const usersRouter = require('./routes/users');

const app = express();

app.use('/users', usersRouter);
```

## エラーハンドリング

### 基本的なエラーハンドリング
```javascript
// 404エラー
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});
```

### 非同期エラーハンドリング
```javascript
// 非同期関数のエラーハンドリング
app.get('/users/:id', async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});
```

## セキュリティの基本

### セキュリティミドルウェア
```javascript
const helmet = require('helmet');
const cors = require('cors');

// セキュリティヘッダーの設定
app.use(helmet());

// CORSの設定
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// レート制限
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100 // リクエスト制限
});
app.use(limiter);
```

## 練習問題

### 問題1
基本的なExpress.jsアプリケーションを作成し、以下の機能を実装してください：
1. GET / で「Welcome to Express.js」を表示
2. GET /api/status でサーバーの状態をJSONで返す
3. POST /api/echo で送信されたデータをそのまま返す

### 問題2
ユーザー管理APIを作成してください：
1. GET /api/users - ユーザー一覧を取得
2. POST /api/users - 新しいユーザーを作成
3. GET /api/users/:id - 特定のユーザーを取得
4. PUT /api/users/:id - ユーザー情報を更新
5. DELETE /api/users/:id - ユーザーを削除

### 問題3
以下の機能を持つミドルウェアを作成してください：
1. リクエストログを記録するミドルウェア
2. レスポンス時間を計測するミドルウェア
3. 認証チェックを行うミドルウェア

## まとめ

- Express.jsはNode.js用のWebアプリケーションフレームワーク
- シンプルで柔軟なAPIを提供
- ミドルウェアアーキテクチャで機能を拡張可能
- 豊富な組み込み関数とミドルウェア
- セキュリティとエラーハンドリングが重要

---

**前の章**: [[Node.js/06-http-server|HTTPサーバー]]
**次の章**: [[Node.js/08-routing|ルーティング]] 