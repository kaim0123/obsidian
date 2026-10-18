# ルーティングの応用

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[08-middleware|← 前章: ミドルウェアの基礎]]
- [[10-database|次章: データベース連携 →]]

## ルーティングとは？

### 基本的な概念
- クライアントからのリクエストURLやHTTPメソッドに応じて処理を振り分ける仕組み
- Web APIやWebアプリの基盤

## ルーティングのパターン

### パスパラメータ
```javascript
app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`ユーザーID: ${userId}`);
});
```

### クエリパラメータ
```javascript
app.get('/search', (req, res) => {
  const keyword = req.query.q;
  res.send(`検索キーワード: ${keyword}`);
});
```

### ワイルドカード
```javascript
app.get('/files/*', (req, res) => {
  res.send(`ファイルパス: ${req.params[0]}`);
});
```

### 複数メソッド対応
```javascript
app.route('/book')
  .get((req, res) => res.send('本の取得'))
  .post((req, res) => res.send('本の作成'))
  .put((req, res) => res.send('本の更新'))
  .delete((req, res) => res.send('本の削除'));
```

## ルーターの分割

### ルーターモジュールの作成
```javascript
// routes/users.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('ユーザー一覧');
});

router.get('/:id', (req, res) => {
  res.send(`ユーザーID: ${req.params.id}`);
});

module.exports = router;
```

### ルーターモジュールの利用
```javascript
const usersRouter = require('./routes/users');
app.use('/users', usersRouter);
```

## ミドルウェアとの組み合わせ
```javascript
const auth = (req, res, next) => {
  if (req.headers.authorization) {
    next();
  } else {
    res.status(401).send('認証エラー');
  }
};

app.use('/admin', auth, (req, res) => {
  res.send('管理者ページ');
});
```

## RESTful API設計

### RESTの基本原則
- リソース指向のURL設計
- HTTPメソッドの使い分け（GET, POST, PUT, DELETE など）
- ステータスコードの適切な利用

### 例：ユーザーAPI
```javascript
app.get('/api/users', (req, res) => { /* 一覧取得 */ });
app.get('/api/users/:id', (req, res) => { /* 詳細取得 */ });
app.post('/api/users', (req, res) => { /* 新規作成 */ });
app.put('/api/users/:id', (req, res) => { /* 更新 */ });
app.delete('/api/users/:id', (req, res) => { /* 削除 */ });
```

## 練習問題

### 問題1
1. `/products/:id` で商品IDを取得し、レスポンスに表示するルートを作成してください。
2. `/search?q=キーワード` でクエリパラメータを取得し、検索結果を返すルートを作成してください。

### 問題2
1. ルーターモジュールを作成し、`/users`配下のルーティングを分割してください。
2. `/admin`配下に認証ミドルウェアを適用してください。

### 問題3
1. RESTfulなAPI設計に従い、`/api/books`のCRUDルートを作成してください。

## まとめ
- Expressのルーティング応用を理解
- パス・クエリパラメータ、ワイルドカードの使い方
- ルーター分割とミドルウェアの組み合わせ
- RESTful API設計の基本

---

**前の章**: [[08-middleware|ミドルウェアの基礎]]
**次の章**: [[10-database|データベース連携]] 