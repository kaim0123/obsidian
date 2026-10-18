# GraphQLの基本概念

GraphQLを理解するために、重要な4つの概念を学びましょう。

## 1. スキーマ（Schema）

**スキーマ**は、GraphQL APIのデータ構造と操作を定義する設計図です。スキーマを見るだけで、APIで何ができるかが分かります。

### 基本的な型

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  age: Int
  isActive: Boolean!
}
```

**説明:**
- `type`: オブジェクト型を定義
- `ID!`: 必須のID型（`!`は必須を意味する）
- `String!`: 必須の文字列型
- `Int`: オプショナルな整数型（`!`がない）
- `Boolean!`: 必須の真偽値型

### スカラー型

GraphQLには以下の組み込みスカラー型があります：

- `String`: 文字列
- `Int`: 整数
- `Float`: 浮動小数点数
- `Boolean`: 真偽値
- `ID`: 一意の識別子（文字列として扱われる）

## 2. クエリ（Query）

**クエリ**は、データを**取得**するためのリクエストです。REST APIのGETリクエストに相当します。

### 基本的なクエリ

```graphql
{
  user(id: "1") {
    name
    email
  }
}
```

**説明:**
- `user(id: "1")`: ユーザーIDが"1"のユーザーを取得
- `{ name email }`: 名前とメールアドレスのフィールドだけを取得

### 複数のデータを取得

```graphql
{
  users {
    id
    name
    email
  }
}
```

### ネストしたデータの取得

```graphql
{
  user(id: "1") {
    name
    posts {
      title
      content
    }
  }
}
```

## 3. ミューテーション（Mutation）

**ミューテーション**は、データを**作成、更新、削除**するためのリクエストです。REST APIのPOST、PUT、DELETEに相当します。

### データの作成

```graphql
mutation {
  createUser(name: "太郎", email: "taro@example.com") {
    id
    name
    email
  }
}
```

**説明:**
- `mutation`: ミューテーションであることを示すキーワード
- `createUser(...)`: 新しいユーザーを作成
- `{ id name email }`: 作成されたユーザーの情報を返す

### データの更新

```graphql
mutation {
  updateUser(id: "1", name: "花子") {
    id
    name
    email
  }
}
```

### データの削除

```graphql
mutation {
  deleteUser(id: "1") {
    id
  }
}
```

## 4. サブスクリプション（Subscription）

**サブスクリプション**は、リアルタイムでデータの変更を**監視**するための仕組みです。WebSocketを使用して、データが変更されたときに自動的に通知を受け取ります。

### 基本的なサブスクリプション

```graphql
subscription {
  newUser {
    id
    name
    email
  }
}
```

**説明:**
- `subscription`: サブスクリプションであることを示すキーワード
- `newUser`: 新しいユーザーが作成されたときに通知を受け取る
- 接続が確立されると、新しいユーザーが作成されるたびに自動的にデータが送信される

## スキーマ定義の例

実際のスキーマ定義を見てみましょう：

```graphql
type Query {
  user(id: ID!): User
  users: [User!]!
}

type Mutation {
  createUser(name: String!, email: String!): User!
  updateUser(id: ID!, name: String): User!
  deleteUser(id: ID!): User!
}

type Subscription {
  newUser: User!
}

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
}
```

**説明:**
- `Query`: データ取得の操作を定義
- `Mutation`: データ変更の操作を定義
- `Subscription`: リアルタイム監視の操作を定義
- `[User!]!`: ユーザーの配列（空でない、null要素を含まない）
- `User!`: 必須のユーザー型

## 変数の使用

クエリやミューテーションで変数を使用できます：

```graphql
query GetUser($userId: ID!) {
  user(id: $userId) {
    name
    email
  }
}
```

**変数の値:**
```json
{
  "userId": "1"
}
```

## エイリアス（別名）

同じクエリで異なる引数を使用する場合、エイリアスを使います：

```graphql
{
  firstUser: user(id: "1") {
    name
  }
  secondUser: user(id: "2") {
    name
  }
}
```

## フラグメント（Fragment）

再利用可能なフィールドセットを定義できます：

```graphql
fragment UserInfo on User {
  id
  name
  email
}

{
  user(id: "1") {
    ...UserInfo
  }
}
```

## まとめ

- **スキーマ**: APIの設計図
- **クエリ**: データの取得
- **ミューテーション**: データの作成・更新・削除
- **サブスクリプション**: リアルタイム監視

これらの基本概念を理解すれば、GraphQLを使い始める準備が整いました！

次のステップ: [[03_RESTとGraphQLの違い|REST APIとの違い]]

