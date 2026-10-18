# MVC違反とは

（MVC 系ノートの戸口: [[02_MVC_UI分離のまとめ]]）

AIを使用してコードを生成する際に、MVC（Model-View-Controller）アーキテクチャの原則を無視したコードが生成されることがあります。この章では、よくあるMVC違反のパターンと、正しい実装方法について解説します。

## 📖 MVC違反とは何か

**MVC違反**とは、MVCアーキテクチャの原則に従わず、各層の責務が混在している状態を指します。

MVCアーキテクチャでは、以下のように責務が分離されています：

```
┌─────────────────────────────────────┐
│         View（ビュー）               │
│      （表示のみ、ロジックなし）       │
├─────────────────────────────────────┤
│      Controller（コントローラー）     │
│      （入力処理、モデルとビューの橋渡し）│
├─────────────────────────────────────┤
│         Model（モデル）              │
│      （データとビジネスロジック）     │
└─────────────────────────────────────┘
```

### 各層の正しい責務

- **Model**: データの管理、ビジネスロジック、データベース操作
- **View**: ユーザーインターフェースの表示のみ
- **Controller**: ユーザー入力の処理、モデルとビューの調整

## ❌ よくあるMVC違反のパターン

### 1. ビューにビジネスロジックを含める

**問題のあるコード例**:

```javascript
// ❌ 悪い例: ビューにビジネスロジックが含まれている
// views/user_profile.html
<div class="user-profile">
  <h1>ユーザープロフィール</h1>
  <p>名前: {{ user.name }}</p>
  <p>年齢: {{ calculateAge(user.birthDate) }}</p>
  <p>会員ランク: {{ determineMembershipLevel(user.points) }}</p>
</div>

<script>
  // ❌ ビューにビジネスロジックが含まれている
  function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  function determineMembershipLevel(points) {
    if (points >= 10000) return 'ゴールド';
    if (points >= 5000) return 'シルバー';
    if (points >= 1000) return 'ブロンズ';
    return '一般';
  }
</script>
```

**問題点**:
- ビューにビジネスロジック（年齢計算、会員ランク判定）が含まれている
- このロジックを他のビューで再利用できない
- テストが困難
- ロジックの変更時に複数のビューを修正する必要がある

**正しい実装例**:

```javascript
// ✅ 良い例: モデルにビジネスロジックを配置
// models/User.js
class User {
  constructor(id, name, birthDate, points) {
    this.id = id;
    this.name = name;
    this.birthDate = birthDate;
    this.points = points;
  }

  // 年齢を計算するメソッド（モデルに配置）
  getAge() {
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  // 会員ランクを判定するメソッド（モデルに配置）
  getMembershipLevel() {
    if (this.points >= 10000) return 'ゴールド';
    if (this.points >= 5000) return 'シルバー';
    if (this.points >= 1000) return 'ブロンズ';
    return '一般';
  }
}

module.exports = User;
```

```javascript
// ✅ 良い例: コントローラーでモデルを使用
// controllers/user_controller.js
const User = require('../models/User');

async function getUserProfile(req, res) {
  const userId = req.params.id;
  const userData = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  const user = new User(
    userData.id,
    userData.name,
    userData.birth_date,
    userData.points
  );

  // モデルのメソッドを使用してデータを準備
  res.render('user_profile', {
    user: {
      name: user.name,
      age: user.getAge(),           // モデルのメソッドを使用
      membershipLevel: user.getMembershipLevel()  // モデルのメソッドを使用
    }
  });
}

module.exports = { getUserProfile };
```

```html
<!-- ✅ 良い例: ビューは表示のみ -->
<!-- views/user_profile.html -->
<div class="user-profile">
  <h1>ユーザープロフィール</h1>
  <p>名前: {{ user.name }}</p>
  <p>年齢: {{ user.age }}</p>
  <p>会員ランク: {{ user.membershipLevel }}</p>
</div>
```

### 2. コントローラーに過度なロジックを実装する

**問題のあるコード例**:

```javascript
// ❌ 悪い例: コントローラーにビジネスロジックが含まれている
// controllers/order_controller.js
async function createOrder(req, res) {
  const { userId, items } = req.body;

  // ❌ コントローラーにビジネスロジックが含まれている
  let total = 0;
  for (const item of items) {
    const product = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
    const price = product.price;
    const discount = product.discount || 0;
    const itemTotal = price * item.quantity * (1 - discount / 100);
    total += itemTotal;
  }

  // ❌ ビジネスルールがコントローラーに含まれている
  let shippingFee = 0;
  if (total < 5000) {
    shippingFee = 500;
  } else if (total < 10000) {
    shippingFee = 300;
  }

  // ❌ ポイント計算ロジックがコントローラーに含まれている
  const pointsEarned = Math.floor(total * 0.01);
  const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);
  const newPoints = user.points + pointsEarned;
  await db.query('UPDATE users SET points = ? WHERE id = ?', [newPoints, userId]);

  const order = await db.query(
    'INSERT INTO orders (user_id, total, shipping_fee, points_earned) VALUES (?, ?, ?, ?)',
    [userId, total, shippingFee, pointsEarned]
  );

  res.json({ orderId: order.insertId });
}
```

**問題点**:
- コントローラーにビジネスロジックが含まれている
- 価格計算、送料計算、ポイント計算などのロジックが混在
- テストが困難（コントローラーのテストが複雑になる）
- ロジックの再利用ができない

**正しい実装例**:

```javascript
// ✅ 良い例: モデルにビジネスロジックを配置
// models/Order.js
class Order {
  constructor(userId, items) {
    this.userId = userId;
    this.items = items;
    this.total = 0;
    this.shippingFee = 0;
    this.pointsEarned = 0;
  }

  // 注文合計を計算（ビジネスロジック）
  async calculateTotal() {
    let total = 0;
    for (const item of this.items) {
      const product = await Product.findById(item.productId);
      const price = product.price;
      const discount = product.discount || 0;
      const itemTotal = price * item.quantity * (1 - discount / 100);
      total += itemTotal;
    }
    this.total = total;
    return total;
  }

  // 送料を計算（ビジネスロジック）
  calculateShippingFee() {
    if (this.total < 5000) {
      this.shippingFee = 500;
    } else if (this.total < 10000) {
      this.shippingFee = 300;
    } else {
      this.shippingFee = 0;
    }
    return this.shippingFee;
  }

  // 獲得ポイントを計算（ビジネスロジック）
  calculatePointsEarned() {
    this.pointsEarned = Math.floor(this.total * 0.01);
    return this.pointsEarned;
  }

  // 注文を保存
  async save() {
    await db.query(
      'INSERT INTO orders (user_id, total, shipping_fee, points_earned) VALUES (?, ?, ?, ?)',
      [this.userId, this.total, this.shippingFee, this.pointsEarned]
    );
  }
}

module.exports = Order;
```

```javascript
// ✅ 良い例: コントローラーは制御のみ
// controllers/order_controller.js
const Order = require('../models/Order');
const User = require('../models/User');

async function createOrder(req, res) {
  try {
    const { userId, items } = req.body;

    // モデルを作成
    const order = new Order(userId, items);

    // モデルのメソッドを使用して計算
    await order.calculateTotal();
    order.calculateShippingFee();
    order.calculatePointsEarned();

    // 注文を保存
    await order.save();

    // ユーザーのポイントを更新（これもモデルのメソッドにすべき）
    const user = await User.findById(userId);
    await user.addPoints(order.pointsEarned);

    res.json({ orderId: order.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createOrder };
```

### 3. モデルがビューに直接依存する

**問題のあるコード例**:

```javascript
// ❌ 悪い例: モデルがビューに依存している
// models/User.js
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // ❌ モデルがHTMLを生成している（ビュー層の責務）
  toHTML() {
    return `
      <div class="user-card">
        <h2>${this.name}</h2>
        <p>${this.email}</p>
      </div>
    `;
  }

  // ❌ モデルがJSON形式のHTMLを生成している
  toJSONHTML() {
    return {
      html: `<div>${this.name}</div>`,
      css: '.user-card { color: blue; }'
    };
  }
}
```

**問題点**:
- モデルがプレゼンテーション層（HTML）に依存している
- モデルを他のビュー（モバイルアプリ、APIなど）で再利用できない
- 関心の分離が崩れている

**正しい実装例**:

```javascript
// ✅ 良い例: モデルはデータのみ
// models/User.js
class User {
  constructor(id, name, email) {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  // ✅ データのみを返す
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

```javascript
// ✅ 良い例: ビューでHTMLを生成
// views/user_view.js
function renderUserCard(user) {
  return `
    <div class="user-card">
      <h2>${user.name}</h2>
      <p>${user.email}</p>
    </div>
  `;
}

module.exports = { renderUserCard };
```

### 4. モデルに HTML・CSS・イベントを含める（拡張パターン）

「モデルがビューに直接依存する」違反の、AI 生成で特に多いバリエーションです。

#### 4.1 モデルが `toHTML()` やテーブル行を返す

```javascript
// ❌ 悪い例: モデルがHTMLを生成している
// models/Product.js
class Product {
  constructor(id, name, price, description) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.description = description;
  }

  toHTML() {
    return `
      <div class="product-card">
        <h3>${this.name}</h3>
        <p class="price">¥${this.price.toLocaleString()}</p>
        <button onclick="addToCart(${this.id})">カートに追加</button>
      </div>
    `;
  }
}
```

**問題点**: 同じデータを API・モバイル・PDF で出し分けにくい。HTML 変更のたびにモデルを直す。HTML 生成のテストが必要になる。

#### 4.2 モデルが CSS やインラインスタイルを持つ

モデルが `getStyles()` のように **見た目の都合** を返すと、デザイン変更がドメイン層に波及する。

#### 4.3 モデルが `<form>` と `<script>` を文字列で返す

モデルに `onsubmit` や `fetch` を埋め込むと、**フロントの振る舞い**がドメインに混ざり、テストと再利用が難しくなる。

#### 4.4 モデルが JSON で `html` / `css` / `js` をまとめて返す

プレゼン層の要素をデータとして束ねると、関心の分離が一箇所で崩れる。

#### 正しい分離（要約）

- モデルは **`toJSON()` やドメイン操作** にとどめる（表示用の軽い整形はチーム規約で許容する場合あり）
- HTML の組み立ては **テンプレート／View／コンポーネント** へ
- スタイルは **CSS やデザインシステム** へ
- イベントと通信は **ビュー層またはコントローラー** へ

```javascript
// ✅ 良い例: モデルはデータとルール
// models/Product.js
class Product {
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      price: this.price,
      description: this.description,
      formattedPrice: `¥${this.price.toLocaleString()}`,
    };
  }
  isOnSale() {
    return this.price < 1000;
  }
}
```

```javascript
// ✅ 良い例: ビュー側でHTMLを組み立てる
// views/product_view.js
function renderProductCard(product) {
  const saleBadge = product.isOnSale() ? '<span class="badge">セール中</span>' : '';
  return `
    <div class="product-card">
      ${saleBadge}
      <h3>${product.name}</h3>
      <p class="price">${product.formattedPrice}</p>
    </div>
  `;
}
```

**なぜ分離するか**: 同じモデルを Web・API・別クライアントで使い回せる。モデルの単体テストが HTML に引きずられない。見た目変更がドメインに波及しにくい。

## ✅ MVC違反を防ぐためのチェックリスト

コードを書く際に、以下の点を確認しましょう：

### Model（モデル）のチェック
- [ ] ビジネスロジックが含まれているか
- [ ] HTML・CSS・`onclick=` などのプレゼンテーション要素が含まれていないか
- [ ] ViewやControllerに依存していないか
- [ ] データの検証ロジックが含まれているか
- [ ] データベース操作が適切に抽象化されているか

### View（ビュー）のチェック
- [ ] 表示のみを担当しているか
- [ ] ビジネスロジックが含まれていないか
- [ ] データの計算や変換を行っていないか
- [ ] コントローラーから渡されたデータをそのまま表示しているか

### Controller（コントローラー）のチェック
- [ ] ユーザー入力の処理のみを担当しているか
- [ ] ビジネスロジックが含まれていないか
- [ ] モデルとビューの橋渡しのみを行っているか
- [ ] 過度に複雑な処理が含まれていないか

## 🎯 まとめ

MVC違反を防ぐためには、各層の責務を明確に理解し、適切に分離することが重要です。

**重要な原則**:
1. **Model**: データとビジネスロジックのみ
2. **View**: 表示のみ
3. **Controller**: 入力処理と調整のみ

AIを使用する際も、生成されたコードがこれらの原則に従っているか確認し、必要に応じて修正することが大切です。

## 📖 関連資料

- [[02_MVC_UI分離のまとめ]]
- [[33_MVCアーキテクチャとは]]
- [[MVCとMVVM]]

