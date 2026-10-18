# REST APIとGraphQLの違い

GraphQLを理解するために、従来のREST APIとの違いを比較してみましょう。

## 基本的な違い

| 項目 | REST API | GraphQL |
|------|----------|---------|
| エンドポイント | 複数（リソースごと） | 単一（通常は `/graphql`） |
| データ取得 | 固定されたデータ構造 | クライアントが指定 |
| HTTPメソッド | GET, POST, PUT, DELETE | POST（クエリ/ミューテーション） |
| バージョニング | URLで管理（`/v1/users`） | スキーマで管理 |
| エラーハンドリング | HTTPステータスコード | レスポンス内でエラーを返す |

## 具体例で比較

### シナリオ: ユーザー情報とその投稿を取得

#### REST APIの場合

**リクエスト1**: ユーザー情報を取得
```
GET /api/users/1
```

**レスポンス1**:
```json
{
  "id": "1",
  "name": "太郎",
  "email": "taro@example.com",
  "address": "東京都...",
  "phone": "090-1234-5678",
  "birthday": "1990-01-01",
  "profileImage": "..."
}
```

**リクエスト2**: ユーザーの投稿を取得
```
GET /api/users/1/posts
```

**レスポンス2**:
```json
[
  {
    "id": "1",
    "title": "投稿タイトル",
    "content": "投稿内容...",
    "createdAt": "2024-01-01",
    "updatedAt": "2024-01-02",
    "tags": ["tag1", "tag2"],
    "likes": 10,
    "comments": [...]
  }
]
```

**問題点:**
- 2回のリクエストが必要
- ユーザー情報に不要なデータ（住所、電話番号など）が含まれる
- 投稿情報にも不要なデータが含まれる可能性がある

#### GraphQLの場合

**リクエスト**:
```graphql
{
  user(id: "1") {
    name
    email
    posts {
      title
      content
    }
  }
}
```

**レスポンス**:
```json
{
  "data": {
    "user": {
      "name": "太郎",
      "email": "taro@example.com",
      "posts": [
        {
          "title": "投稿タイトル",
          "content": "投稿内容..."
        }
      ]
    }
  }
}
```

**メリット:**
- 1回のリクエストで完了
- 必要なデータだけを取得
- 関連データも一緒に取得できる

## オーバーフェッチ（Over-fetching）

### REST APIの問題

```
GET /api/users/1
```

このリクエストで、ユーザーの**すべての情報**が返されます：
- 名前（必要）
- メール（必要）
- 住所（不要）
- 電話番号（不要）
- 生年月日（不要）
- プロフィール画像（不要）

**結果**: ネットワーク帯域の無駄

### GraphQLの解決

```graphql
{
  user(id: "1") {
    name
    email
  }
}
```

必要なデータだけを指定できるため、無駄がありません。

## アンダーフェッチ（Under-fetching）

### REST APIの問題

ユーザー一覧画面を表示する場合：

1. ユーザー一覧を取得: `GET /api/users`
2. 各ユーザーの投稿数を取得: `GET /api/users/1/posts/count`, `GET /api/users/2/posts/count`, ...
3. 各ユーザーのフォロワー数を取得: `GET /api/users/1/followers/count`, ...

**結果**: 多数のリクエストが必要

### GraphQLの解決

```graphql
{
  users {
    id
    name
    postsCount
    followersCount
  }
}
```

1回のリクエストで必要なデータをすべて取得できます。

## エンドポイントの違い

### REST API

```
GET    /api/users          # ユーザー一覧
GET    /api/users/1        # ユーザー詳細
POST   /api/users          # ユーザー作成
PUT    /api/users/1        # ユーザー更新
DELETE /api/users/1        # ユーザー削除
GET    /api/posts          # 投稿一覧
GET    /api/posts/1        # 投稿詳細
...
```

エンドポイントが増えると管理が大変になります。

### GraphQL

```
POST /graphql
```

すべての操作が1つのエンドポイントで完結します。

## バージョニング

### REST API

```
/api/v1/users
/api/v2/users
/api/v3/users
```

URLでバージョンを管理する必要があります。

### GraphQL

スキーマ内でバージョンを管理します。新しいフィールドを追加しても、既存のクライアントには影響しません。

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  # 新しいフィールドを追加しても既存のクエリは動作する
  phone: String
}
```

## エラーハンドリング

### REST API

HTTPステータスコードでエラーを表現：

```
200 OK
400 Bad Request
404 Not Found
500 Internal Server Error
```

### GraphQL

レスポンス内でエラーを返します：

```json
{
  "data": null,
  "errors": [
    {
      "message": "ユーザーが見つかりません",
      "locations": [{"line": 2, "column": 3}],
      "path": ["user"]
    }
  ]
}
```

## キャッシュ

### REST API

HTTPのキャッシュメカニズムを活用できます：
- ETag
- Last-Modified
- Cache-Control

### GraphQL

単一のエンドポイントのため、HTTPキャッシュは使いにくいです。代わりに、クライアント側でキャッシュを実装する必要があります（Apollo Clientなど）。

## いつRESTを使うべきか

✅ **REST APIが適している場面:**
- シンプルなCRUD操作
- HTTPキャッシュが重要な場合
- 既存のREST APIが十分に機能している
- シンプルなデータ構造

## いつGraphQLを使うべきか

✅ **GraphQLが適している場面:**
- 複数のクライアント（Web、iOS、Android）が異なるデータを必要とする
- モバイルアプリなど、ネットワーク効率が重要
- 複雑なデータ構造とリレーション
- リアルタイム更新が必要
- フロントエンドとバックエンドのチームが分離している

## まとめ

| 特徴 | REST API | GraphQL |
|------|----------|---------|
| 柔軟性 | 低い（固定されたエンドポイント） | 高い（クライアントが指定） |
| 学習コスト | 低い | 中程度 |
| キャッシュ | 簡単 | 複雑 |
| 複雑なクエリ | 難しい | 簡単 |
| エコシステム | 成熟している | 成長中 |

**結論**: GraphQLはREST APIの代替ではなく、**適切な場面で選択すべきツール**です。プロジェクトの要件に応じて選択しましょう。

次のステップ: [[04_GraphQLの実践的な例|実践的な例]]

