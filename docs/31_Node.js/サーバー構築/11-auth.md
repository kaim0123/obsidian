# 認証とセキュリティ

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[10-database|← 前章: データベース連携]]
- [[12-deploy|次章: デプロイと運用 →]]

## 認証とは？
- ユーザーが誰であるかを確認する仕組み
- 例：ログイン、トークン認証

## 認可とは？
- 認証済みユーザーがどの操作を許可されているかを制御
- 例：管理者のみがアクセスできるページ

## セッション認証

### express-sessionの導入
```bash
npm install express-session
```

### 基本的な使い方
```javascript
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
```

### ログイン・ログアウト例
```javascript
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // ユーザー認証処理（省略）
  req.session.user = { username };
  res.send('ログイン成功');
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('ログアウトしました');
});

app.get('/private', (req, res) => {
  if (req.session.user) {
    res.send('認証済みページ');
  } else {
    res.status(401).send('未認証');
  }
});
```

## JWT認証

### jsonwebtokenの導入
```bash
npm install jsonwebtoken
```

### JWTの発行と検証
```javascript
const jwt = require('jsonwebtoken');
const secret = 'your-secret-key';

// トークン発行
const token = jwt.sign({ username: 'alice' }, secret, { expiresIn: '1h' });

// トークン検証
try {
  const decoded = jwt.verify(token, secret);
  console.log(decoded);
} catch (err) {
  console.error('トークン無効');
}
```

### JWT認証ミドルウェア
```javascript
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

app.get('/protected', authenticateJWT, (req, res) => {
  res.send('保護されたページ');
});
```

## パスワード管理

### bcryptによるハッシュ化
```bash
npm install bcrypt
```

```javascript
const bcrypt = require('bcrypt');
const password = 'myPassword';

// ハッシュ化
bcrypt.hash(password, 10, (err, hash) => {
  // 保存
});

// 検証
bcrypt.compare('入力値', hash, (err, result) => {
  if (result) {
    // 一致
  }
});
```

## セキュリティ対策

| 対策 | 内容 |
|------|------|
| helmet | HTTPヘッダー強化 |
| cors | CORS制御 |
| rate-limit | リクエスト回数制限 |
| XSS対策 | 入力値のエスケープ |
| CSRF対策 | トークンによる検証 |

### helmetの導入
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

### CORSの導入
```bash
npm install cors
```

```javascript
const cors = require('cors');
app.use(cors());
```

### レートリミットの導入
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);
```

## 練習問題

### 問題1
1. express-sessionを使ったログイン・ログアウト機能を実装してください。
2. JWTを使ったAPI認証を実装してください。

### 問題2
1. bcryptでパスワードをハッシュ化し、検証する処理を作成してください。
2. helmet, cors, rate-limitを導入し、用途を説明してください。

### 問題3
1. 認証が必要なルートと不要なルートを分けて実装してください。

## まとめ
- セッション認証とJWT認証の違いと使い分け
- パスワードの安全な管理方法
- helmet, cors, rate-limit等のセキュリティ対策

---

**前の章**: [[10-database|データベース連携]]
**次の章**: [[12-deploy|デプロイと運用]] 