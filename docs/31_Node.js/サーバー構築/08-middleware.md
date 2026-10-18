# ミドルウェアの基礎

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[07-express-basics|← 前章: Express入門]]
- [[09-routing|次章: ルーティングの応用 →]]

## ミドルウェアとは？

### 基本的な概念

**ミドルウェア**
- リクエストとレスポンスの間で処理を行う関数
- ログ記録、認証、エラーハンドリングなど多用途
- Expressアプリの柔軟な拡張を実現

### ミドルウェアの特徴
- 複数のミドルウェアをチェーンできる
- `next()`で次のミドルウェアへ処理を渡す
- 順序が重要

## ミドルウェアの使い方

### 基本構文
```javascript
app.use((req, res, next) => {
  // 何らかの処理
  next(); // 次のミドルウェアへ
});
```

### ログ出力ミドルウェアの例
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
```

### ルート限定ミドルウェア
```javascript
app.use('/api', (req, res, next) => {
  console.log('APIへのアクセス');
  next();
});
```

### 複数ミドルウェアのチェーン
```javascript
function mw1(req, res, next) {
  console.log('ミドルウェア1');
  next();
}
function mw2(req, res, next) {
  console.log('ミドルウェア2');
  next();
}
app.use(mw1, mw2);
```

## 組み込みミドルウェア

| ミドルウェア | 説明 |
|--------------|------|
| express.json() | JSONボディのパース |
| express.urlencoded() | URLエンコードデータのパース |
| express.static() | 静的ファイルの配信 |

### 例
```javascript
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
```

## サードパーティミドルウェア

| パッケージ | 用途 |
|------------|------|
| morgan | ログ出力 |
| cors | CORS対応 |
| helmet | セキュリティ強化 |
| cookie-parser | Cookieのパース |
| body-parser | リクエストボディのパース |

### 例
```javascript
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

app.use(morgan('dev'));
app.use(cors());
app.use(helmet());
```

## エラーハンドリングミドルウェア

### 基本構文
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('サーバーエラー');
});
```

### 404エラーハンドリング
```javascript
app.use((req, res) => {
  res.status(404).send('ページが見つかりません');
});
```

## カスタムミドルウェアの作成

### 認証ミドルウェア例
```javascript
function auth(req, res, next) {
  if (req.headers.authorization === 'Bearer secret') {
    next();
  } else {
    res.status(401).send('認証エラー');
  }
}
app.use('/private', auth);
```

## 練習問題

### 問題1
1. すべてのリクエストをログ出力するミドルウェアを作成してください。
2. `/admin`配下のみ認証を行うミドルウェアを作成してください。

### 問題2
1. サードパーティミドルウェア（morgan, cors, helmet）を導入し、用途を説明してください。

### 問題3
1. エラーハンドリングミドルウェアを追加し、500エラーと404エラーの処理を実装してください。

## まとめ
- ミドルウェアの基本と使い方を理解
- 組み込み・サードパーティ・カスタムミドルウェアの活用
- エラーハンドリングの実装方法

---

**前の章**: [[07-express-basics|Express入門]]
**次の章**: [[09-routing|ルーティングの応用]] 