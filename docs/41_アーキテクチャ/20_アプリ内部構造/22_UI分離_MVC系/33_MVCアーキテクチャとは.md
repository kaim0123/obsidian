# MVCアーキテクチャとは

（MVC 系ノートの戸口: [[02_MVC_UI分離のまとめ]]）

MVCアーキテクチャは、Webアプリケーションを設計する際の代表的な設計パターンです。この章では、MVCの概念、各コンポーネントの役割、実装方法について初心者向けに詳しく解説します。

## 📖 MVCアーキテクチャとは何か

**MVC（Model-View-Controller）**は、アプリケーションを3つのコンポーネントに分けて設計するアーキテクチャパターンです。

```
┌─────────────────────────────────────┐
│         View（ビュー）               │
│      （ユーザーが見る部分）          │
├─────────────────────────────────────┤
│      Controller（コントローラー）     │
│      （処理の制御）                  │
├─────────────────────────────────────┤
│         Model（モデル）              │
│      （データとビジネスロジック）     │
└─────────────────────────────────────┘
```

### 日常生活での例え

レストランを例にすると：

- **View（ビュー）**: メニューやテーブル（お客様が見る部分）
- **Controller（コントローラー）**: ウェイター（注文を受け取り、キッチンに伝える）
- **Model（モデル）**: キッチンとシェフ（実際の料理を作る、食材を管理する）

お客様（ユーザー）はメニュー（View）を見て、ウェイター（Controller）に注文します。ウェイターはキッチン（Model）に伝え、料理ができたらお客様に提供します。

## 🏗️ MVCの各コンポーネント

### 1. Model（モデル）

**役割**: データとビジネスロジックを担当

**責任**:
- データベースとのやり取り
- データの検証
- ビジネスルールの実装
- データの取得・保存・更新・削除

**特徴**:
- ViewやControllerに依存しない
- 再利用可能
- テストしやすい

**例**:
```javascript
// models/User.js
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // データベースからユーザーを取得
  static async findById(id) {
    const result = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    return new User(result[0].id, result[0].name, result[0].email);
  }

  // ユーザーを保存
  async save() {
    if (this.id) {
      // 更新
      await db.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [this.name, this.email, this.id]
      );
    } else {
      // 新規作成
      const result = await db.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [this.name, this.email]
      );
      this.id = result.insertId;
    }
  }

  // バリデーション
  validate() {
    if (!this.name || this.name.trim() === '') {
      throw new Error('名前が必要です');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('有効なメールアドレスが必要です');
    }
  }

  // ユーザーを削除
  async delete() {
    await db.query('DELETE FROM users WHERE id = ?', [this.id]);
  }
}

module.exports = User;
```

### 2. View（ビュー）

**役割**: ユーザーインターフェースを担当

**責任**:
- データを表示する
- ユーザーからの入力を受け取る
- ユーザーに情報を提示する

**特徴**:
- ModelやControllerの詳細を知らない
- 表示のみを担当
- 再利用可能

**例**:
```javascript
// views/userView.js
class UserView {
  // ユーザー情報を表示
  displayUser(user) {
    console.log(`
      ユーザー情報:
      ID: ${user.id}
      名前: ${user.name}
      メール: ${user.email}
    `);
  }

  // HTMLで表示（サーバーサイドレンダリング）
  renderUserHTML(user) {
    return `
      <div class="user-profile">
        <h1>${user.name}</h1>
        <p>メールアドレス: ${user.email}</p>
      </div>
    `;
  }

  // Reactコンポーネント（クライアントサイド）
  renderUserComponent(user) {
    return (
      <div className="user-profile">
        <h1>{user.name}</h1>
        <p>メールアドレス: {user.email}</p>
      </div>
    );
  }

  // エラーメッセージを表示
  displayError(error) {
    console.error('エラー:', error.message);
  }
}

module.exports = UserView;
```

### 3. Controller（コントローラー）

**役割**: ModelとViewの間の仲介を担当

**責任**:
- ユーザーの入力を受け取る
- Modelに処理を依頼する
- Viewに表示を依頼する
- フローの制御

**特徴**:
- ModelとViewの両方に依存
- ビジネスロジックは含まない（Modelに委譲）
- リクエストのルーティングを担当

**例**:
```javascript
// controllers/userController.js
const User = require('../models/User');
const UserView = require('../views/userView');

class UserController {
  constructor() {
    this.view = new UserView();
  }

  // ユーザーを取得して表示
  async showUser(userId) {
    try {
      // Modelからデータを取得
      const user = await User.findById(userId);
      
      if (!user) {
        this.view.displayError(new Error('ユーザーが見つかりません'));
        return;
      }
      
      // Viewに表示を依頼
      this.view.displayUser(user);
    } catch (error) {
      this.view.displayError(error);
    }
  }

  // ユーザーを作成
  async createUser(name, email) {
    try {
      // Modelを作成
      const user = new User(null, name, email);
      
      // バリデーション
      user.validate();
      
      // 保存
      await user.save();
      
      // Viewに表示
      this.view.displayUser(user);
    } catch (error) {
      this.view.displayError(error);
    }
  }

  // ユーザーを更新
  async updateUser(userId, name, email) {
    try {
      // Modelからデータを取得
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }
      
      // データを更新
      user.name = name;
      user.email = email;
      
      // バリデーション
      user.validate();
      
      // 保存
      await user.save();
      
      // Viewに表示
      this.view.displayUser(user);
    } catch (error) {
      this.view.displayError(error);
    }
  }

  // ユーザーを削除
  async deleteUser(userId) {
    try {
      // Modelからデータを取得
      const user = await User.findById(userId);
      
      if (!user) {
        throw new Error('ユーザーが見つかりません');
      }
      
      // 削除
      await user.delete();
      
      console.log('ユーザーを削除しました');
    } catch (error) {
      this.view.displayError(error);
    }
  }
}

module.exports = UserController;
```

## 🔄 MVCのデータフロー

### 基本的な流れ

```
1. ユーザーがViewで操作（ボタンをクリックなど）
   ↓
2. ViewがControllerに通知
   ↓
3. ControllerがModelに処理を依頼
   ↓
4. Modelがデータベースとやり取り
   ↓
5. Modelが結果をControllerに返す
   ↓
6. ControllerがViewに表示を依頼
   ↓
7. Viewがユーザーに結果を表示
```

### 詳細な例：ユーザー作成

```
1. ユーザーがフォームに入力して送信
   View: フォームのデータを取得
   ↓
2. View → Controller: データを渡す
   Controller: createUser(name, email)を呼び出す
   ↓
3. Controller → Model: 新しいUserオブジェクトを作成
   Model: バリデーションを実行
   ↓
4. Model → データベース: INSERT文を実行
   データベース: ユーザーを保存
   ↓
5. データベース → Model: 保存されたデータを返す
   Model → Controller: Userオブジェクトを返す
   ↓
6. Controller → View: ユーザー情報を渡す
   View: ユーザー情報を表示
```

## 💻 実践例：Express.jsでのMVC実装

### プロジェクト構造

```
my-app/
├── models/
│   └── User.js
├── views/
│   └── userView.js
├── controllers/
│   └── userController.js
├── routes/
│   └── userRoutes.js
└── server.js
```

### Model（モデル）

```javascript
// models/User.js
const db = require('../config/database');

class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return null;
    }
    const row = rows[0];
    return new User(row.id, row.name, row.email);
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM users');
    return rows.map(row => new User(row.id, row.name, row.email));
  }

  async save() {
    if (this.id) {
      await db.query(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [this.name, this.email, this.id]
      );
    } else {
      const [result] = await db.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [this.name, this.email]
      );
      this.id = result.insertId;
    }
  }

  validate() {
    if (!this.name || this.name.trim() === '') {
      throw new Error('名前が必要です');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('有効なメールアドレスが必要です');
    }
  }

  async delete() {
    await db.query('DELETE FROM users WHERE id = ?', [this.id]);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email
    };
  }
}

module.exports = User;
```

### Controller（コントローラー）

```javascript
// controllers/userController.js
const User = require('../models/User');

class UserController {
  // ユーザー一覧を取得
  async index(req, res) {
    try {
      const users = await User.findAll();
      res.json(users.map(user => user.toJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // 特定のユーザーを取得
  async show(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }
      res.json(user.toJSON());
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // ユーザーを作成
  async create(req, res) {
    try {
      const { name, email } = req.body;
      const user = new User(null, name, email);
      
      user.validate();
      await user.save();
      
      res.status(201).json(user.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ユーザーを更新
  async update(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }
      
      const { name, email } = req.body;
      user.name = name;
      user.email = email;
      
      user.validate();
      await user.save();
      
      res.json(user.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // ユーザーを削除
  async delete(req, res) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'ユーザーが見つかりません' });
      }
      
      await user.delete();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
```

### Routes（ルーティング）

```javascript
// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ユーザー一覧
router.get('/', userController.index);

// 特定のユーザー
router.get('/:id', userController.show);

// ユーザー作成
router.post('/', userController.create);

// ユーザー更新
router.put('/:id', userController.update);

// ユーザー削除
router.delete('/:id', userController.delete);

module.exports = router;
```

### サーバー設定

```javascript
// server.js
const express = require('express');
const userRoutes = require('./routes/userRoutes');

const app = express();

app.use(express.json());
app.use('/api/users', userRoutes);

app.listen(3000, () => {
  console.log('サーバーが起動しました: http://localhost:3000');
});
```

## 🎨 フロントエンドでのMVC

### Reactでの例

```javascript
// components/UserList.jsx (View)
import { useState, useEffect } from 'react';
import UserService from '../services/UserService';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controller的な役割（サービス層）
    UserService.getAllUsers()
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  // View: 表示のみ
  if (loading) {
    return <div>読み込み中...</div>;
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>
          {user.name} - {user.email}
        </li>
      ))}
    </ul>
  );
}

// services/UserService.js (Controller的な役割)
class UserService {
  static async getAllUsers() {
    const response = await fetch('/api/users');
    return response.json();
  }

  static async getUser(id) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }

  static async createUser(userData) {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return response.json();
  }
}

export default UserService;
```

## 🔄 MVCと三層アーキテクチャの関係

MVCは、三層アーキテクチャの**ビジネスロジック層**をさらに細分化したものです。

```
三層アーキテクチャ:
┌─────────────────────────┐
│ プレゼンテーション層     │
├─────────────────────────┤
│ ビジネスロジック層       │ ← MVCはここを細分化
│  ┌───────────────────┐ │
│  │ Controller        │ │
│  ├───────────────────┤ │
│  │ Model             │ │
│  └───────────────────┘ │
├─────────────────────────┤
│ データ層                │
└─────────────────────────┘

MVCアーキテクチャ:
┌─────────────────────────┐
│ View（プレゼンテーション層）│
├─────────────────────────┤
│ Controller（制御）       │
├─────────────────────────┤
│ Model（ビジネスロジック + データアクセス）│
└─────────────────────────┘
```

## ✅ MVCのメリット

### 1. 責任の分離

各コンポーネントが明確な責任を持ちます。

- **Model**: データとビジネスロジック
- **View**: 表示
- **Controller**: 制御

### 2. 再利用性

各コンポーネントを独立して再利用できます。

```javascript
// 同じModelを複数のViewで使用
const user = await User.findById(1);
userView.displayUser(user);
adminView.displayUser(user);
```

### 3. テストしやすい

各コンポーネントを独立してテストできます。

```javascript
// Modelのテスト
describe('User Model', () => {
  it('should validate user data', () => {
    const user = new User(null, 'Test', 'test@example.com');
    expect(() => user.validate()).not.toThrow();
  });
});

// Controllerのテスト
describe('UserController', () => {
  it('should create a user', async () => {
    const user = await userController.createUser('Test', 'test@example.com');
    expect(user.name).toBe('Test');
  });
});
```

### 4. 保守性

変更の影響範囲が限定的です。

- Viewを変更してもModelやControllerに影響しない
- Modelを変更してもViewやControllerに影響しない（インターフェースが同じなら）

## ⚠️ MVCのデメリット

### 1. 複雑性

小規模なアプリケーションには過剰な場合があります。

### 2. 学習コスト

MVCの概念を理解する必要があります。

### 3. ファイル数の増加

各コンポーネントごとにファイルが必要です。

MVP・MVVM・Flux など**派生パターンの比較とコード例**は [[MVCとMVVM]] にまとめています。

## 💡 実践例：完全なアプリケーション

### プロジェクト構造

```
my-app/
├── models/
│   ├── User.js
│   └── Post.js
├── controllers/
│   ├── userController.js
│   └── postController.js
├── routes/
│   ├── userRoutes.js
│   └── postRoutes.js
├── views/
│   ├── userView.js
│   └── postView.js
├── middleware/
│   └── auth.js
└── server.js
```

### 複数のModelの連携

```javascript
// models/Post.js
const User = require('./User');

class Post {
  constructor(id, title, content, userId) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.userId = userId;
  }

  async getAuthor() {
    return await User.findById(this.userId);
  }

  static async findByUserId(userId) {
    const [rows] = await db.query(
      'SELECT * FROM posts WHERE userId = ?',
      [userId]
    );
    return rows.map(row => new Post(row.id, row.title, row.content, row.userId));
  }
}

// controllers/postController.js
const Post = require('../models/Post');

class PostController {
  async showWithAuthor(req, res) {
    try {
      const post = await Post.findById(req.params.id);
      const author = await post.getAuthor();
      
      res.json({
        post: post.toJSON(),
        author: author.toJSON()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

## 🎯 まとめ

- **MVC**は、アプリケーションをModel、View、Controllerの3つに分ける設計パターン
- **Model**: データとビジネスロジックを担当
- **View**: ユーザーインターフェースを担当
- **Controller**: ModelとViewの間の仲介を担当
- **責任の分離**により、保守性と再利用性が向上
- **三層アーキテクチャ**のビジネスロジック層を細分化したもの

## 📚 次のステップ

MVCアーキテクチャの基本を理解したら、次は以下を学習しましょう：

- [[三層アーキテクチャ]] — MVC が置かれることの多い全体像（層の話）
- [[06_Frameworks/02_React/01_Reactの全体像/02_コンポーネント・フックス・サービスとは|コンポーネント・フックス・サービスとは]] — フロントエンドでの MVC 的な設計
- [[09_Architecture/API設計/01-APIとは|APIとは]] — MVC での API 設計
- [[MVCとMVVM]] — MVVM や派生パターンとの比較
- [[01_MVC違反とは]] — 層の混在に注意

