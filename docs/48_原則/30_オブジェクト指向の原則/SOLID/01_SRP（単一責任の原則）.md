# Single Responsibility Principle (単一責任の原則)

## 概要

**Single Responsibility Principle (SRP)** は、SOLID原則の最初の原則です。

> **「1つのクラスは、変更される理由が1つだけであるべき」**

つまり、**1つのクラスは1つの責任（役割）だけを持つべき**という原則です。

---

## なぜ重要なのか

### 問題点

1つのクラスに複数の責任があると：
- **変更の影響範囲が広がる** - 1つの機能を変更するだけで、他の機能にも影響が出る
- **テストが困難** - 複数の責任が絡み合い、単体テストが書きにくい
- **再利用性が低い** - 必要な機能だけを取り出せない
- **理解が困難** - クラスの役割が不明確で、コードの理解が難しくなる

### メリット

- **変更の影響を局所化** - 1つの責任だけを変更すれば良い
- **テストしやすい** - 各責任を独立してテストできる
- **再利用性が高い** - 必要な機能だけを再利用できる
- **理解しやすい** - クラスの役割が明確

---

## 悪い例

### 例1: ユーザー管理とレポート生成が混在

```javascript
// ❌ 悪い例: 複数の責任を持つクラス
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  // 責任1: ユーザー情報の管理
  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }

  save() {
    // データベースに保存
    console.log(`Saving user ${this.name} to database...`);
  }

  // 責任2: レポート生成（本来は別の責任）
  generateReport() {
    console.log(`Report for ${this.name}:`);
    console.log(`Email: ${this.email}`);
    // レポート生成のロジック...
  }

  // 責任3: メール送信（これも別の責任）
  sendEmail(subject, body) {
    console.log(`Sending email to ${this.email}: ${subject}`);
    // メール送信のロジック...
  }
}
```

**問題点:**
- ユーザー情報の変更 → `User`クラスを変更
- レポート形式の変更 → `User`クラスを変更
- メール送信方法の変更 → `User`クラスを変更

**変更理由が3つある = SRP違反**

---

## 良い例

### 責任を分離する

```javascript
// ✅ 良い例: 各クラスが1つの責任だけを持つ

// 責任1: ユーザー情報の管理
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  getName() {
    return this.name;
  }

  getEmail() {
    return this.email;
  }
}

// 責任2: データベース操作
class UserRepository {
  save(user) {
    console.log(`Saving user ${user.getName()} to database...`);
    // データベース保存のロジック
  }

  findById(id) {
    // ユーザー検索のロジック
  }
}

// 責任3: レポート生成
class UserReportGenerator {
  generateReport(user) {
    console.log(`Report for ${user.getName()}:`);
    console.log(`Email: ${user.getEmail()}`);
    // レポート生成のロジック
  }
}

// 責任4: メール送信
class EmailService {
  sendEmail(to, subject, body) {
    console.log(`Sending email to ${to}: ${subject}`);
    // メール送信のロジック
  }
}

// 使用例
const user = new User('田中太郎', 'tanaka@example.com');
const userRepo = new UserRepository();
const reportGenerator = new UserReportGenerator();
const emailService = new EmailService();

userRepo.save(user);
reportGenerator.generateReport(user);
emailService.sendEmail(user.getEmail(), 'Welcome', 'Welcome to our service!');
```

**メリット:**
- ユーザー情報の変更 → `User`クラスのみ変更
- レポート形式の変更 → `UserReportGenerator`クラスのみ変更
- メール送信方法の変更 → `EmailService`クラスのみ変更

**各クラスの変更理由が1つ = SRP準拠**

---

## 実践的な例

### 例2: 注文処理システム

```javascript
// ❌ 悪い例
class Order {
  constructor(items, customer) {
    this.items = items;
    this.customer = customer;
    this.total = 0;
  }

  calculateTotal() {
    // 合計計算
    this.total = this.items.reduce((sum, item) => sum + item.price, 0);
  }

  save() {
    // データベース保存
    console.log('Saving order to database...');
  }

  sendConfirmationEmail() {
    // メール送信
    console.log('Sending confirmation email...');
  }

  printInvoice() {
    // 請求書印刷
    console.log('Printing invoice...');
  }
}
```

```javascript
// ✅ 良い例: 責任を分離
class Order {
  constructor(items, customer) {
    this.items = items;
    this.customer = customer;
  }

  getItems() {
    return this.items;
  }

  getCustomer() {
    return this.customer;
  }
}

// 合計計算の責任
class OrderCalculator {
  calculateTotal(order) {
    return order.getItems().reduce((sum, item) => sum + item.price, 0);
  }
}

// データベース操作の責任
class OrderRepository {
  save(order) {
    console.log('Saving order to database...');
    // データベース保存のロジック
  }
}

// メール送信の責任
class EmailService {
  sendConfirmation(order) {
    console.log('Sending confirmation email...');
    // メール送信のロジック
  }
}

// 請求書生成の責任
class InvoicePrinter {
  print(order) {
    console.log('Printing invoice...');
    // 請求書印刷のロジック
  }
}
```

---

## よくある間違い

### 1. 過度な分割

```javascript
// ❌ やりすぎ: 1つのメソッドごとにクラスを作る
class UserNameGetter {
  getName(user) {
    return user.name;
  }
}

class UserEmailGetter {
  getEmail(user) {
    return user.email;
  }
}
```

**適切な粒度:**
- 関連する責任は1つのクラスにまとめる
- 変更理由が異なる責任は分離する

### 2. 責任の誤解

「1つのクラスは1つのメソッドだけを持つべき」という誤解があります。

**正しい理解:**
- 1つのクラスは**1つの変更理由**だけを持つべき
- 関連する複数のメソッドは同じクラスに属して良い

```javascript
// ✅ これはOK: すべて「ユーザー情報の管理」という1つの責任
class User {
  getName() { }
  getEmail() { }
  setName(name) { }
  setEmail(email) { }
  validate() { }
}
```

---

## 判断基準

### 責任を分離すべきか判断する質問

1. **変更理由が異なるか？**
   - ユーザー情報の変更とレポート形式の変更は別の理由 → 分離すべき

2. **再利用性が異なるか？**
   - ユーザー情報は他の場所でも使うが、レポート生成は特定の場所だけ → 分離すべき

3. **テストの難易度は？**
   - 1つの責任をテストするために、他の責任のモックが必要 → 分離すべき

---

## 適用のヒント

### 1. クラス名から判断

クラス名に「and」や「or」が含まれる場合、複数の責任がある可能性が高い：

```javascript
// ❌ 複数の責任の可能性
class UserAndReportManager { }
class OrderAndEmailService { }
```

### 2. メソッドのグループ化

関連するメソッドをグループ化し、グループ間の関連性が低ければ分離を検討：

```javascript
class Order {
  // グループ1: 注文情報の取得
  getItems() { }
  getCustomer() { }
  
  // グループ2: 計算（別の責任かも？）
  calculateTotal() { }
  calculateTax() { }
  
  // グループ3: 永続化（別の責任かも？）
  save() { }
  load() { }
}
```

### 3. 変更の影響範囲

変更したときに、他の機能に影響が出るか確認：

- 影響が出る → 責任が混在している可能性
- 影響が出ない → 適切に分離されている

---

## まとめ

### 重要なポイント

1. **1つのクラス = 1つの変更理由**
2. **責任を明確に定義する**
3. **過度な分割は避ける**
4. **関連する責任はまとめる**

### チェックリスト

- [ ] クラス名に「and」や「or」が含まれていないか？
- [ ] 変更理由が1つだけか？
- [ ] テストが独立して書けるか？
- [ ] 再利用性が高いか？

---

## 関連原則

- **Open/Closed Principle** - SRPを守ることで、変更が局所化され、OCPも守りやすくなる
- **Separation of Concerns** - 関心の分離はSRPの基盤となる考え方

---

## 参考

- Robert C. Martin, "Clean Architecture"
- "Clean Code" by Robert C. Martin

