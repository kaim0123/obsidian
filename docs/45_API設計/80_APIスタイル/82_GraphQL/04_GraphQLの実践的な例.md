# GraphQLの実践的な例

実際のコード例を通じて、GraphQLの使い方を学びましょう。

## 例1: ブログアプリケーション

### スキーマ定義

```graphql
type Query {
  # すべての投稿を取得
  posts: [Post!]!
  
  # 特定の投稿を取得
  post(id: ID!): Post
  
  # ユーザー情報を取得
  user(id: ID!): User
  
  # すべてのユーザーを取得
  users: [User!]!
}

type Mutation {
  # 新しい投稿を作成
  createPost(title: String!, content: String!, authorId: ID!): Post!
  
  # 投稿を更新
  updatePost(id: ID!, title: String, content: String): Post!
  
  # 投稿を削除
  deletePost(id: ID!): Boolean!
  
  # ユーザーを作成
  createUser(name: String!, email: String!): User!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: String!
  updatedAt: String!
  comments: [Comment!]!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Comment {
  id: ID!
  content: String!
  author: User!
  post: Post!
  createdAt: String!
}
```

### クエリの例

#### 1. すべての投稿のタイトルと作成日を取得

```graphql
{
  posts {
    title
    createdAt
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "posts": [
      {
        "title": "GraphQL入門",
        "createdAt": "2024-01-01T10:00:00Z"
      },
      {
        "title": "ReactとGraphQL",
        "createdAt": "2024-01-02T14:30:00Z"
      }
    ]
  }
}
```

#### 2. 投稿とその著者情報を取得

```graphql
{
  post(id: "1") {
    title
    content
    author {
      name
      email
    }
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "post": {
      "title": "GraphQL入門",
      "content": "GraphQLは...",
      "author": {
        "name": "太郎",
        "email": "taro@example.com"
      }
    }
  }
}
```

#### 3. ユーザーとその投稿一覧を取得

```graphql
{
  user(id: "1") {
    name
    posts {
      title
      createdAt
    }
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "user": {
      "name": "太郎",
      "posts": [
        {
          "title": "GraphQL入門",
          "createdAt": "2024-01-01T10:00:00Z"
        },
        {
          "title": "ReactとGraphQL",
          "createdAt": "2024-01-02T14:30:00Z"
        }
      ]
    }
  }
}
```

### ミューテーションの例

#### 1. 新しい投稿を作成

```graphql
mutation {
  createPost(
    title: "GraphQLの実践例"
    content: "これは実践的な例です..."
    authorId: "1"
  ) {
    id
    title
    content
    author {
      name
    }
    createdAt
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "createPost": {
      "id": "3",
      "title": "GraphQLの実践例",
      "content": "これは実践的な例です...",
      "author": {
        "name": "太郎"
      },
      "createdAt": "2024-01-03T09:00:00Z"
    }
  }
}
```

#### 2. 投稿を更新

```graphql
mutation {
  updatePost(
    id: "1"
    title: "更新されたタイトル"
    content: "更新された内容"
  ) {
    id
    title
    content
    updatedAt
  }
}
```

#### 3. 投稿を削除

```graphql
mutation {
  deletePost(id: "1")
}
```

**レスポンス:**
```json
{
  "data": {
    "deletePost": true
  }
}
```

## 例2: 変数を使用したクエリ

### 変数を使ったクエリ

```graphql
query GetPost($postId: ID!) {
  post(id: $postId) {
    title
    content
    author {
      name
    }
  }
}
```

**変数:**
```json
{
  "postId": "1"
}
```

### 変数を使ったミューテーション

```graphql
mutation CreatePost($title: String!, $content: String!, $authorId: ID!) {
  createPost(title: $title, content: $content, authorId: $authorId) {
    id
    title
    content
  }
}
```

**変数:**
```json
{
  "title": "新しい投稿",
  "content": "投稿内容です...",
  "authorId": "1"
}
```

## 例3: エイリアスとフラグメント

### エイリアスの使用

同じクエリで異なる引数を使用：

```graphql
{
  firstPost: post(id: "1") {
    title
    content
  }
  secondPost: post(id: "2") {
    title
    content
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "firstPost": {
      "title": "最初の投稿",
      "content": "..."
    },
    "secondPost": {
      "title": "2番目の投稿",
      "content": "..."
    }
  }
}
```

### フラグメントの使用

再利用可能なフィールドセット：

```graphql
fragment PostInfo on Post {
  id
  title
  content
  createdAt
}

fragment AuthorInfo on User {
  name
  email
}

{
  post(id: "1") {
    ...PostInfo
    author {
      ...AuthorInfo
    }
  }
}
```

## 例4: エラーハンドリング

### エラーが発生した場合

**クエリ:**
```graphql
{
  post(id: "999") {
    title
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "post": null
  },
  "errors": [
    {
      "message": "投稿が見つかりません",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["post"]
    }
  ]
}
```

### 部分的なエラー

一部のフィールドでエラーが発生しても、他のデータは取得できます：

**クエリ:**
```graphql
{
  post(id: "1") {
    title
    content
    author {
      name
      invalidField
    }
  }
}
```

**レスポンス:**
```json
{
  "data": {
    "post": {
      "title": "GraphQL入門",
      "content": "...",
      "author": {
        "name": "太郎",
        "invalidField": null
      }
    }
  },
  "errors": [
    {
      "message": "フィールド 'invalidField' は存在しません",
      "locations": [
        {
          "line": 6,
          "column": 7
        }
      ],
      "path": ["post", "author", "invalidField"]
    }
  ]
}
```

## 例5: 実践的なユースケース

### モバイルアプリ用の軽量なクエリ

```graphql
{
  posts {
    id
    title
    author {
      name
    }
  }
}
```

必要な最小限のデータだけを取得します。

### 管理画面用の詳細なクエリ

```graphql
{
  posts {
    id
    title
    content
    author {
      id
      name
      email
    }
    createdAt
    updatedAt
    comments {
      id
      content
      author {
        name
      }
      createdAt
    }
  }
}
```

詳細な情報を一度に取得します。

## まとめ

これらの例を通じて、以下を学びました：

- ✅ 基本的なクエリとミューテーションの書き方
- ✅ 変数の使用方法
- ✅ エイリアスとフラグメントの活用
- ✅ エラーハンドリング
- ✅ 実際のユースケースに応じたクエリの書き分け

次のステップ: [[05_GraphQLをはじめよう|はじめに]]

