# コードの重複とDRY原則違反

AIが生成するコードには、同じロジックが複数箇所に重複している場合があります。この章では、DRY原則とコードの重複を避ける方法について解説します。

## 📖 DRY原則とは

**DRY（Don't Repeat Yourself）**は、「同じことを繰り返すな」という原則です。同じコードが複数箇所に存在すると、以下のような問題が発生します：

**よくある問題**:

- 同じコードが複数箇所に存在
- 関数やクラスの再利用がされていない
- 修正時に複数箇所を変更する必要がある
- バグが複数箇所に存在する可能性がある
- コードの保守性が低下する

## 1. バリデーションロジックの重複

### ❌ 問題のあるコード例

```javascript
// ❌ 悪い例: コードの重複
// controllers/user_controller.js
async function createUser(req, res) {
  const { name, email } = req.body;
  
  // ❌ バリデーションロジックが重複
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: '名前が必要です' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '有効なメールアドレスが必要です' });
  }
  
  // ユーザー作成処理
  const result = await db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  
  res.status(201).json({ userId: result.insertId });
}

async function updateUser(req, res) {
  const { name, email } = req.body;
  
  // ❌ 同じバリデーションロジックが重複
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: '名前が必要です' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '有効なメールアドレスが必要です' });
  }
  
  // ユーザー更新処理
  await db.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, req.params.id]
  );
  
  res.json({ success: true });
}
```

**問題点**:
- バリデーションロジックが2箇所に存在
- バリデーションルールを変更する際、2箇所を修正する必要がある
- バグが発生した場合、2箇所で修正が必要

### ✅ 正しい実装例

```javascript
// ✅ 良い例: バリデーションロジックを共通化
// validators/user_validator.js
function validateUser(name, email) {
  const errors = [];
  
  if (!name || name.trim() === '') {
    errors.push('名前が必要です');
  }
  if (!email || !email.includes('@')) {
    errors.push('有効なメールアドレスが必要です');
  }
  
  return errors;
}

module.exports = { validateUser };
```

```javascript
// ✅ 良い例: 共通のバリデーションを使用
// controllers/user_controller.js
const { validateUser } = require('../validators/user_validator');

async function createUser(req, res) {
  const { name, email } = req.body;
  
  // ✅ 共通のバリデーションを使用
  const errors = validateUser(name, email);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // ユーザー作成処理
  const result = await db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email]
  );
  
  res.status(201).json({ userId: result.insertId });
}

async function updateUser(req, res) {
  const { name, email } = req.body;
  
  // ✅ 共通のバリデーションを使用
  const errors = validateUser(name, email);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  // ユーザー更新処理
  await db.query(
    'UPDATE users SET name = ?, email = ? WHERE id = ?',
    [name, email, req.params.id]
  );
  
  res.json({ success: true });
}
```

## 2. データベースクエリの重複

### ❌ 問題のあるコード例

```javascript
// ❌ 悪い例: データベースクエリが重複
// controllers/user_controller.js
async function getUserById(req, res) {
  const userId = req.params.id;
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  
  if (!users || users.length === 0) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }
  
  res.json(users[0]);
}

async function updateUser(req, res) {
  const userId = req.params.id;
  // ❌ 同じクエリが重複
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  
  if (!users || users.length === 0) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }
  
  // 更新処理
  // ...
}

async function deleteUser(req, res) {
  const userId = req.params.id;
  // ❌ 同じクエリが重複
  const [users] = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  
  if (!users || users.length === 0) {
    return res.status(404).json({ error: 'ユーザーが見つかりません' });
  }
  
  // 削除処理
  // ...
}
```

### ✅ 正しい実装例

```javascript
// ✅ 良い例: データベース操作をモデルに集約
// models/User.js
class User {
  static async findById(id) {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (!users || users.length === 0) {
      return null;
    }
    return new User(users[0]);
  }
  
  static async findByIdOrFail(id) {
    const user = await User.findById(id);
    if (!user) {
      throw new Error('ユーザーが見つかりません');
    }
    return user;
  }
}

module.exports = User;
```

```javascript
// ✅ 良い例: モデルを使用
// controllers/user_controller.js
const User = require('../models/User');

async function getUserById(req, res) {
  try {
    const user = await User.findByIdOrFail(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await User.findByIdOrFail(req.params.id);
    // 更新処理
    // ...
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await User.findByIdOrFail(req.params.id);
    // 削除処理
    // ...
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}
```

## 3. エラーハンドリングの重複

### ❌ 問題のあるコード例

```javascript
// ❌ 悪い例: エラーハンドリングが重複
async function createUser(req, res) {
  try {
    // 処理
  } catch (error) {
    console.error('エラー:', error);
    res.status(500).json({ error: 'エラーが発生しました' });
  }
}

async function updateUser(req, res) {
  try {
    // 処理
  } catch (error) {
    // ❌ 同じエラーハンドリングが重複
    console.error('エラー:', error);
    res.status(500).json({ error: 'エラーが発生しました' });
  }
}
```

### ✅ 正しい実装例

```javascript
// ✅ 良い例: エラーハンドリングミドルウェアを使用
// middleware/error_handler.js
function errorHandler(error, req, res, next) {
  console.error('エラー:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'NotFoundError') {
    return res.status(404).json({ error: error.message });
  }
  
  res.status(500).json({ error: 'エラーが発生しました' });
}

module.exports = errorHandler;
```

```javascript
// ✅ 良い例: エラーハンドリングミドルウェアを使用
// app.js
const errorHandler = require('./middleware/error_handler');

// ルート定義
app.use('/api/users', userRoutes);

// エラーハンドリングミドルウェア（最後に配置）
app.use(errorHandler);
```

```javascript
// ✅ コントローラーはシンプルに
// controllers/user_controller.js
async function createUser(req, res, next) {
  try {
    // 処理
    res.status(201).json({ userId: result.insertId });
  } catch (error) {
    next(error); // エラーハンドリングミドルウェアに渡す
  }
}
```

## 4. フォーマット処理の重複

### ❌ 問題のあるコード例

```javascript
// ❌ 悪い例: フォーマット処理が重複
// controllers/product_controller.js
async function getProduct(req, res) {
  const product = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  
  // ❌ 価格のフォーマット処理が重複
  const formattedPrice = `¥${product.price.toLocaleString()}`;
  
  res.json({
    ...product,
    formattedPrice
  });
}

async function getProducts(req, res) {
  const products = await db.query('SELECT * FROM products');
  
  // ❌ 同じフォーマット処理が重複
  const formattedProducts = products.map(product => ({
    ...product,
    formattedPrice: `¥${product.price.toLocaleString()}`
  }));
  
  res.json(formattedProducts);
}
```

### ✅ 正しい実装例

```javascript
// ✅ 良い例: フォーマット処理を共通化
// utils/formatter.js
function formatPrice(price) {
  return `¥${price.toLocaleString()}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('ja-JP');
}

module.exports = { formatPrice, formatDate };
```

```javascript
// ✅ 良い例: 共通のフォーマット処理を使用
// controllers/product_controller.js
const { formatPrice } = require('../utils/formatter');

async function getProduct(req, res) {
  const product = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
  
  res.json({
    ...product,
    formattedPrice: formatPrice(product.price)
  });
}

async function getProducts(req, res) {
  const products = await db.query('SELECT * FROM products');
  
  const formattedProducts = products.map(product => ({
    ...product,
    formattedPrice: formatPrice(product.price)
  }));
  
  res.json(formattedProducts);
}
```

## 5. 設定値の重複

### ❌ 問題のあるコード例

```javascript
// ❌ 悪い例: 設定値が重複
// services/email_service.js
const MAX_RETRY = 3;
const TIMEOUT = 5000;

async function sendEmail(email) {
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      await fetch(email.url, { timeout: TIMEOUT });
      return;
    } catch (error) {
      if (i === MAX_RETRY - 1) throw error;
    }
  }
}

// services/sms_service.js
// ❌ 同じ設定値が重複
const MAX_RETRY = 3;
const TIMEOUT = 5000;

async function sendSMS(phone) {
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      await fetch(phone.url, { timeout: TIMEOUT });
      return;
    } catch (error) {
      if (i === MAX_RETRY - 1) throw error;
    }
  }
}
```

### ✅ 正しい実装例

```javascript
// ✅ 良い例: 設定値を共通化
// config/constants.js
module.exports = {
  MAX_RETRY: 3,
  TIMEOUT: 5000,
  PAGE_SIZE: 20
};
```

```javascript
// ✅ 良い例: 共通の設定値を使用
// services/email_service.js
const { MAX_RETRY, TIMEOUT } = require('../config/constants');

async function sendEmail(email) {
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      await fetch(email.url, { timeout: TIMEOUT });
      return;
    } catch (error) {
      if (i === MAX_RETRY - 1) throw error;
    }
  }
}

// services/sms_service.js
const { MAX_RETRY, TIMEOUT } = require('../config/constants');

async function sendSMS(phone) {
  for (let i = 0; i < MAX_RETRY; i++) {
    try {
      await fetch(phone.url, { timeout: TIMEOUT });
      return;
    } catch (error) {
      if (i === MAX_RETRY - 1) throw error;
    }
  }
}
```

## ✅ DRY原則チェックリスト

コードを書く際に、以下の点を確認しましょう：

- [ ] 同じコードが複数箇所に存在していないか
- [ ] 共通のロジックを関数やクラスに抽出できているか
- [ ] 設定値が一箇所に集約されているか
- [ ] エラーハンドリングが共通化されているか
- [ ] バリデーションロジックが共通化されているか
- [ ] データベース操作がモデルに集約されているか

## 🎯 まとめ

DRY原則に従うことで、コードの保守性と品質を向上させることができます。以下の点に注意することが重要です：

1. **共通化**: 同じロジックを関数やクラスに抽出
2. **集約**: 関連する処理を一箇所に集約
3. **再利用**: 既存のコードを再利用
4. **設定の一元化**: 設定値を一箇所で管理

ただし、過度な共通化は避けることも重要です。適度な共通化を心がけましょう。

## 📖 関連資料

- [命名規則の不統一](08_命名規則の不統一.md)
- [リファクタリングの考え方](../02_プログラミング周辺知識/17_リファクタリングの考え方.md)
- [コードの読みやすさ](../02_プログラミング周辺知識/04_コードの読みやすさ.md)

