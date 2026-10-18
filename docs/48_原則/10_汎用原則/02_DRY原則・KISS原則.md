# DRY原則・KISS原則

## DRY原則（Don't Repeat Yourself）

**同じことを繰り返さない**という原則です。

### 基本的な考え方

> すべての知識はシステム内で単一、明確、信頼できる表現を持つべきである

### 悪い例: 重複コード

```javascript
function calculatePrice1() {
  const price = 1000;
  const tax = price * 0.1;
  const shippingFee = 500;
  return price + tax + shippingFee;
}

function calculatePrice2() {
  const price = 2000;
  const tax = price * 0.1;  // 重複！
  const shippingFee = 500;  // 重複！
  return price + tax + shippingFee;
}

function calculatePrice3() {
  const price = 3000;
  const tax = price * 0.1;  // 重複！
  const shippingFee = 500;  // 重複！
  return price + tax + shippingFee;
}
```

**問題点**:
- 税率や送料が変わったら、全箇所を修正する必要がある
- 修正漏れが発生しやすい
- バグが混入しやすい

### 良い例: DRYを適用

```javascript
const TAX_RATE = 0.1;
const SHIPPING_FEE = 500;

function calculateTax(price) {
  return price * TAX_RATE;
}

function calculateTotalPrice(price) {
  const tax = calculateTax(price);
  return price + tax + SHIPPING_FEE;
}

// 使用
console.log(calculateTotalPrice(1000));  // 1600
console.log(calculateTotalPrice(2000));  // 2700
console.log(calculateTotalPrice(3000));  // 3800
```

**メリット**:
- 税率や送料の変更が1箇所で済む
- バグが入りにくい
- コードが短くなる

---

## DRYの適用例

### 例1: データの重複を避ける

```javascript
// NG: データの重複
const users = [
  { id: 1, name: "太郎", email: "taro@example.com" },
  { id: 2, name: "花子", email: "hanako@example.com" }
];

const userEmails = [
  "taro@example.com",  // 重複！
  "hanako@example.com"  // 重複！
];

// OK: データソースを1つに
const users = [
  { id: 1, name: "太郎", email: "taro@example.com" },
  { id: 2, name: "花子", email: "hanako@example.com" }
];

const userEmails = users.map(user => user.email);
```

### 例2: ロジックの重複を避ける

```javascript
// NG: 同じバリデーションロジックが複数箇所に
function registerUser(email) {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
  // ユーザー登録処理
}

function updateEmail(email) {
  if (!email.includes('@')) {  // 重複！
    throw new Error('Invalid email');
  }
  // メール更新処理
}

// OK: バリデーションを共通化
function validateEmail(email) {
  if (!email.includes('@')) {
    throw new Error('Invalid email');
  }
}

function registerUser(email) {
  validateEmail(email);
  // ユーザー登録処理
}

function updateEmail(email) {
  validateEmail(email);
  // メール更新処理
}
```

### 例3: 設定の一元化

```javascript
// NG: 設定が散らばっている
const API_URL = 'https://api.example.com';
const TIMEOUT = 5000;

function fetchUsers() {
  fetch('https://api.example.com/users', { timeout: 5000 });  // 重複！
}

function fetchPosts() {
  fetch('https://api.example.com/posts', { timeout: 5000 });  // 重複！
}

// OK: 設定を一元化
const config = {
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000
};

function fetchUsers() {
  fetch(`${config.API_URL}/users`, { timeout: config.TIMEOUT });
}

function fetchPosts() {
  fetch(`${config.API_URL}/posts`, { timeout: config.TIMEOUT });
}
```

---

## DRYの注意点

### 過度な抽象化を避ける

```javascript
// やりすぎ
function processData(data, operation) {
  return data.map(operation);
}

const doubled = processData([1, 2, 3], x => x * 2);
const squared = processData([1, 2, 3], x => x * x);

// 適度
const doubled = [1, 2, 3].map(x => x * 2);
const squared = [1, 2, 3].map(x => x * x);
```

### 偶然の重複に注意

同じコードでも、**意味が違う**場合は無理に共通化しない。

```javascript
// これらは偶然同じコードだが、意味が違う
function calculateShippingFee(weight) {
  return weight * 100;  // 重量ベース
}

function calculateStorageFee(weight) {
  return weight * 100;  // 重量ベース（でも別の意味）
}

// 共通化すべきではない（将来、計算式が変わる可能性がある）
```

---

## KISS原則（Keep It Simple, Stupid）

**シンプルに保つ**という原則です。

### 基本的な考え方

> 複雑さは敵である。シンプルなシステムの方が理解しやすく、保守しやすい。

### 悪い例: 複雑すぎる

```javascript
function processUser(user) {
  return user && user.name && user.name.length > 0
    ? user.age && user.age >= 20
      ? user.isActive !== false
        ? { ...user, status: 'valid' }
        : { ...user, status: 'inactive' }
      : { ...user, status: 'underage' }
    : null;
}
```

**問題点**:
- ネストが深い
- 読みにくい
- デバッグが難しい

### 良い例: シンプルに

```javascript
function processUser(user) {
  if (!user || !user.name || user.name.length === 0) {
    return null;
  }

  if (user.age < 20) {
    return { ...user, status: 'underage' };
  }

  if (user.isActive === false) {
    return { ...user, status: 'inactive' };
  }

  return { ...user, status: 'valid' };
}
```

**メリット**:
- フラットな構造
- 読みやすい
- デバッグしやすい

---

## KISSの適用例

### 例1: 早期リターン

```javascript
// NG: ネストが深い
function getDiscount(user) {
  if (user) {
    if (user.isPremium) {
      if (user.purchases > 10) {
        return 0.2;
      } else {
        return 0.1;
      }
    } else {
      return 0.05;
    }
  } else {
    return 0;
  }
}

// OK: 早期リターン
function getDiscount(user) {
  if (!user) return 0;
  if (!user.isPremium) return 0.05;
  if (user.purchases > 10) return 0.2;
  return 0.1;
}
```

### 例2: シンプルなロジック

```javascript
// NG: 複雑
function isWeekend(date) {
  const day = date.getDay();
  if (day === 0) {
    return true;
  } else if (day === 6) {
    return true;
  } else {
    return false;
  }
}

// OK: シンプル
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}
```

### 例3: 過度な抽象化を避ける

```javascript
// NG: 汎用的すぎて複雑
class DataProcessor {
  process(data, config) {
    const strategy = this.getStrategy(config.type);
    const validator = this.getValidator(config.validation);
    const transformer = this.getTransformer(config.transformation);

    // 複雑な処理...
  }
}

// OK: シンプルに
function doubleNumbers(numbers) {
  return numbers.map(n => n * 2);
}

function filterEvenNumbers(numbers) {
  return numbers.filter(n => n % 2 === 0);
}
```

---

## YAGNI原則（You Aren't Gonna Need It）

**今必要ないものは作らない**という原則です。

### 悪い例: 将来のために作りすぎ

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.preferences = {};  // まだ使わない
    this.history = [];      // まだ使わない
    this.metadata = {};     // まだ使わない
    this.settings = {};     // まだ使わない
    this.cache = {};        // まだ使わない
  }

  // まだ使わないメソッド
  exportData() { /* ... */ }
  importData() { /* ... */ }
  migrate() { /* ... */ }
}
```

### 良い例: 必要なものだけ

```javascript
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// 必要になったら追加する
```

---

## 原則の組み合わせ

### 実践例: ユーザー登録機能

```javascript
// 設定（DRY）
const config = {
  MIN_PASSWORD_LENGTH: 8,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// バリデーション（DRY + KISS）
function validateEmail(email) {
  if (!config.EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email format');
  }
}

function validatePassword(password) {
  if (password.length < config.MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${config.MIN_PASSWORD_LENGTH} characters`);
  }
}

// ユーザー登録（KISS + YAGNI）
function registerUser(email, password) {
  validateEmail(email);
  validatePassword(password);

  // シンプルな実装（必要なものだけ）
  const user = {
    email,
    password: hashPassword(password),
    createdAt: new Date()
  };

  return saveUser(user);
}
```

---

## まとめ

### DRY（Don't Repeat Yourself）
- **重複を避ける**
- 変更は1箇所で済むようにする
- ただし、過度な抽象化は避ける

### KISS（Keep It Simple, Stupid）
- **シンプルに保つ**
- 複雑さは敵
- 早期リターンでネストを減らす

### YAGNI（You Aren't Gonna Need It）
- **今必要ないものは作らない**
- 将来の予測に時間をかけない
- 必要になったら追加する

**これらの原則を意識することで、保守しやすいコードが書けるようになります！**

次は「デザインパターン入門」で、よくある問題の解決策を学びましょう！
