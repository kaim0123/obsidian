[[00-Express.js index]]

# APIサーバー構築

Express.jsはREST APIサーバーの構築に最適です。

## REST API設計の基本
- リソースごとにエンドポイントを設計
- HTTPメソッド（GET, POST, PUT, DELETE）を使い分け

## ルーティング例
```js
app.get('/api/items', ...);      // 一覧取得
app.post('/api/items', ...);     // 新規作成
app.put('/api/items/:id', ...);  // 更新
app.delete('/api/items/:id', ...); // 削除
```

## JSONレスポンス
- `res.json()`でデータを返す

## バリデーション
- `express-validator`などのミドルウェア活用

## CORS対応
- `cors`パッケージで他ドメインからのアクセス許可

## APIドキュメント化
- `swagger-ui-express`や`openapi`で自動生成

## ベストプラクティス
- ステータスコード・エラーハンドリングを明確に
- バリデーション・認証はミドルウェアで共通化

---

[[00-Express.js index]] 