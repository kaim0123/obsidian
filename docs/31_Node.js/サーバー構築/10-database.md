# データベース連携

## 目次
- [[00-Node.js index|← 目次に戻る]]
- [[09-routing|← 前章: ルーティングの応用]]
- [[11-auth|次章: 認証とセキュリティ →]]

## データベースとは？

### 基本的な概念
- データを永続的に保存・管理するシステム
- 代表的な種類：RDB（MySQL, PostgreSQL等）、NoSQL（MongoDB等）

## Node.jsで使われる主なデータベース

| データベース | 特徴 | 代表的なライブラリ |
|-------------|------|-------------------|
| MongoDB | ドキュメント指向NoSQL | mongoose, mongodb |
| MySQL | RDB、広く普及 | mysql2, sequelize |
| PostgreSQL | RDB、高機能 | pg, sequelize |
| SQLite | 軽量RDB | sqlite3, sequelize |

## MongoDBとの連携

### mongooseの導入
```bash
npm install mongoose
```

### 接続例
```javascript
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '接続エラー:'));
db.once('open', () => {
  console.log('MongoDBに接続しました');
});
```

### スキーマとモデル
```javascript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
```

### CRUD操作例
```javascript
// 作成
const user = new User({ name: 'Alice', email: 'alice@example.com' });
user.save();

// 取得
User.find({}, (err, users) => {
  if (err) return console.error(err);
  console.log(users);
});

// 更新
User.updateOne({ name: 'Alice' }, { email: 'alice@new.com' });

// 削除
User.deleteOne({ name: 'Alice' });
```

## MySQLとの連携

### mysql2の導入
```bash
npm install mysql2
```

### 接続例
```javascript
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testdb'
});

connection.connect((err) => {
  if (err) {
    console.error('接続エラー:', err);
    return;
  }
  console.log('MySQLに接続しました');
});
```

### クエリ実行例
```javascript
// データ取得
connection.query('SELECT * FROM users', (err, results) => {
  if (err) throw err;
  console.log(results);
});

// データ挿入
connection.query('INSERT INTO users (name, email) VALUES (?, ?)', ['Bob', 'bob@example.com']);

// データ更新
connection.query('UPDATE users SET email = ? WHERE name = ?', ['bob@new.com', 'Bob']);

// データ削除
connection.query('DELETE FROM users WHERE name = ?', ['Bob']);
```

## データベース設計のポイント
- スキーマ設計（テーブル/コレクションの構造）
- インデックスの活用
- バリデーション
- リレーション（RDB）や参照（NoSQL）

## ORM/ODMの活用
- ORM（Object Relational Mapping）：RDBとオブジェクトの橋渡し（例：Sequelize）
- ODM（Object Document Mapping）：NoSQLとオブジェクトの橋渡し（例：Mongoose）

## 練習問題

### 問題1
1. mongooseを使ってユーザー情報を保存・取得するAPIを作成してください。
2. MySQLを使って商品情報を保存・取得するAPIを作成してください。

### 問題2
1. スキーマ設計のポイントを3つ挙げて説明してください。
2. ORM/ODMを使うメリットを説明してください。

### 問題3
1. MongoDBとMySQLの違いを表でまとめてください。

## まとめ
- Node.jsでの主要なデータベース連携方法を理解
- MongoDB（mongoose）とMySQL（mysql2）の基本操作
- スキーマ設計やORM/ODMの活用ポイント

---

**前の章**: [[09-routing|ルーティングの応用]]
**次の章**: [[11-auth|認証とセキュリティ]] 