# ORMとは

ORMは、データベース操作を簡単にするためのツールです。この章では、ORMの概念と使い方について初心者向けに解説します。

## 📖 ORMとは何か

**ORM（Object-Relational Mapping）**は、「オブジェクト・リレーショナル・マッピング」と読み、データベースのテーブルをオブジェクト（クラス）として扱えるようにする技術です。

### 日常生活での例え

ORMは、「通訳」のようなものです。

- **データベース**: 外国語（SQL）
- **プログラミング言語**: 日本語（JavaScript、Pythonなど）
- **ORM**: 通訳（SQLを自動的に生成）

プログラマーは、SQLを直接書かずに、プログラミング言語のオブジェクトとしてデータベースを操作できます。

## 🔍 ORMのメリット

### 1. SQLを書かなくて良い

```javascript
// ❌ ORMなし（SQLを直接書く）
const [rows] = await connection.execute(
  'SELECT * FROM users WHERE email = ?',
  ['yamada@example.com']
);

// ✅ ORMあり（オブジェクトとして操作）
const user = await User.findOne({ where: { email: 'yamada@example.com' } });
```

### 2. データベースに依存しない

```javascript
// 同じコードで異なるデータベースを使える
// MySQL、PostgreSQL、SQLiteなど
const user = await User.findById(1);
```

### 3. 型安全性

```typescript
// TypeScriptで型が保証される
interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = await User.findById(1);
```

## 💻 主要なORM

### 1. Sequelize（Node.js）

```javascript
const { Sequelize, DataTypes } = require('sequelize');

// データベース接続
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// モデルの定義
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

// データの作成
const user = await User.create({
  name: '山田太郎',
  email: 'yamada@example.com'
});

// データの取得
const users = await User.findAll();
const user = await User.findOne({ where: { email: 'yamada@example.com' } });

// データの更新
await user.update({ name: '山田花子' });

// データの削除
await user.destroy();
```

### 2. Prisma（Node.js）

```javascript
// schema.prisma
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
}

// 使用例
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// データの作成
const user = await prisma.user.create({
  data: {
    name: '山田太郎',
    email: 'yamada@example.com'
  }
});

// データの取得
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({
  where: { email: 'yamada@example.com' }
});

// データの更新
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: '山田花子' }
});

// データの削除
await prisma.user.delete({ where: { id: 1 } });
```

### 3. Django ORM（Python）

```python
from django.db import models

# モデルの定義
class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

# データの作成
user = User.objects.create(
    name='山田太郎',
    email='yamada@example.com'
)

# データの取得
users = User.objects.all()
user = User.objects.get(email='yamada@example.com')

# データの更新
user.name = '山田花子'
user.save()

# データの削除
user.delete()
```

## 🔄 ORMの基本操作（CRUD）

### Create（作成）

```javascript
// Sequelize
const user = await User.create({
  name: '山田太郎',
  email: 'yamada@example.com'
});

// Prisma
const user = await prisma.user.create({
  data: {
    name: '山田太郎',
    email: 'yamada@example.com'
  }
});
```

### Read（読み取り）

```javascript
// Sequelize
// すべて取得
const users = await User.findAll();

// 条件で検索
const user = await User.findOne({
  where: { email: 'yamada@example.com' }
});

// Prisma
const users = await prisma.user.findMany();
const user = await prisma.user.findUnique({
  where: { email: 'yamada@example.com' }
});
```

### Update（更新）

```javascript
// Sequelize
await user.update({ name: '山田花子' });

// Prisma
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: '山田花子' }
});
```

### Delete（削除）

```javascript
// Sequelize
await user.destroy();

// Prisma
await prisma.user.delete({ where: { id: 1 } });
```

## 🔗 リレーション（関連）

### 1対多の関係

```javascript
// Sequelize
const User = sequelize.define('User', {
  name: DataTypes.STRING
});

const Post = sequelize.define('Post', {
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  userId: {
    type: DataTypes.INTEGER,
    references: { model: User, key: 'id' }
  }
});

User.hasMany(Post);
Post.belongsTo(User);

// 使用例
const user = await User.findByPk(1, {
  include: [Post] // ユーザーの投稿も一緒に取得
});
```

### 多対多の関係

```javascript
// Sequelize
const User = sequelize.define('User', {
  name: DataTypes.STRING
});

const Role = sequelize.define('Role', {
  name: DataTypes.STRING
});

User.belongsToMany(Role, { through: 'UserRoles' });
Role.belongsToMany(User, { through: 'UserRoles' });

// 使用例
const user = await User.findByPk(1);
await user.addRole(role);
```

## ⚠️ ORMの注意点

### 1. N+1問題

```javascript
// ❌ 悪い例（N+1問題）
const users = await User.findAll();
for (const user of users) {
  const posts = await user.getPosts(); // 各ユーザーごとにクエリが実行される
}

// ✅ 良い例（一括取得）
const users = await User.findAll({
  include: [Post] // 一度のクエリで取得
});
```

### 2. パフォーマンス

複雑なクエリは、ORMよりも生のSQLの方が速い場合があります。

```javascript
// 複雑な集計クエリは生SQLの方が速い場合がある
const result = await sequelize.query(
  'SELECT category_id, COUNT(*) as count, AVG(price) as avg_price FROM products GROUP BY category_id',
  { type: QueryTypes.SELECT }
);
```

### 3. 学習コスト

ORMを学ぶ必要がありますが、長期的には開発効率が向上します。

## 💡 実践例：Express.js + Sequelize

```javascript
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const app = express();

// データベース接続
const sequelize = new Sequelize('myapp', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});

// モデルの定義
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

// APIエンドポイント
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'ユーザーの作成に失敗しました' });
  }
});

app.listen(3000);
```

## 🎯 まとめ

- **ORM**は、データベースをオブジェクトとして操作できるようにする技術
- **SQLを書かなくて良い**ため、開発効率が向上
- **データベースに依存しない**コードが書ける
- **リレーション**を簡単に扱える
- **N+1問題**などの注意点がある
- **複雑なクエリ**は生SQLの方が速い場合がある

## 📚 次のステップ

ORMの基本を理解したら、次は以下を学習しましょう：

- [[01_データベースとは|データベースとは]] - ORMが操作するデータベース
- [APIとは](./08_APIとは.md) - ORMを使ったAPI開発
- [[三層アーキテクチャ]] — データ層での ORM の使い方の文脈

