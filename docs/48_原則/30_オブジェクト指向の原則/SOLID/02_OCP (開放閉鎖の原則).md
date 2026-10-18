# Open/Closed Principle (開放/閉鎖の原則)

## 概要

**Open/Closed Principle (OCP)** は、SOLID原則の2番目の原則です。

> **「ソフトウェアのエンティティ（クラス、モジュール、関数など）は、拡張に対して開いており、修正に対して閉じているべき」**

つまり：
- **拡張に対して開いている（Open）** - 新しい機能を追加しやすい
- **修正に対して閉じている（Closed）** - 既存のコードを変更せずに済む

---

## なぜ重要なのか

### 問題点

既存のコードを修正して新機能を追加すると：
- **既存機能への影響** - 動作していたコードが壊れる可能性
- **テストの再実行** - 既存のテストをすべて再実行する必要がある
- **リスクの増加** - 変更箇所が多いほど、バグが入り込む可能性が高い
- **保守性の低下** - コードが複雑になり、理解が困難になる

### メリット

- **既存コードの保護** - 動作しているコードを変更しない
- **拡張性の向上** - 新しい機能を追加しやすい
- **テストの簡素化** - 既存のテストを変更する必要がない
- **リスクの低減** - 新機能の追加が既存機能に影響しない

---

## 悪い例

### 例1: if-else文による分岐

```javascript
// ❌ 悪い例: 新しい図形を追加するたびに既存コードを修正
class AreaCalculator {
  calculateArea(shape) {
    if (shape.type === 'circle') {
      return Math.PI * shape.radius * shape.radius;
    } else if (shape.type === 'rectangle') {
      return shape.width * shape.height;
    } else if (shape.type === 'triangle') {
      return (shape.base * shape.height) / 2;
    }
    // 新しい図形を追加するたびに、このメソッドを修正する必要がある
  }
}

const calculator = new AreaCalculator();
const circle = { type: 'circle', radius: 5 };
const rectangle = { type: 'rectangle', width: 4, height: 6 };

console.log(calculator.calculateArea(circle));     // 78.54
console.log(calculator.calculateArea(rectangle));  // 24
```

**問題点:**
- 新しい図形（例: 楕円）を追加するたびに、`calculateArea`メソッドを修正する必要がある
- 既存のコードを変更するため、既存機能に影響が出る可能性がある

---

## 良い例

### 抽象化とポリモーフィズムを活用

```javascript
// ✅ 良い例: 抽象化により拡張に対して開いている

// 抽象クラス（インターフェース）
class Shape {
  calculateArea() {
    throw new Error('calculateArea must be implemented');
  }
}

// 各図形クラスがShapeを継承
class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }

  calculateArea() {
    return Math.PI * this.radius * this.radius;
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  calculateArea() {
    return this.width * this.height;
  }
}

class Triangle extends Shape {
  constructor(base, height) {
    super();
    this.base = base;
    this.height = height;
  }

  calculateArea() {
    return (this.base * this.height) / 2;
  }
}

// AreaCalculatorは既存コードを変更せずに済む
class AreaCalculator {
  calculateArea(shape) {
    return shape.calculateArea();
  }
}

// 使用例
const calculator = new AreaCalculator();
const circle = new Circle(5);
const rectangle = new Rectangle(4, 6);
const triangle = new Triangle(3, 4);

console.log(calculator.calculateArea(circle));     // 78.54
console.log(calculator.calculateArea(rectangle));   // 24
console.log(calculator.calculateArea(triangle));    // 6
```

**メリット:**
- 新しい図形（例: 楕円）を追加する場合、新しいクラスを作るだけで良い
- `AreaCalculator`クラスは変更不要
- 既存のコードに影響を与えない

### 新しい図形を追加する例

```javascript
// 新しい図形を追加（既存コードを変更せずに）
class Ellipse extends Shape {
  constructor(radiusX, radiusY) {
    super();
    this.radiusX = radiusX;
    this.radiusY = radiusY;
  }

  calculateArea() {
    return Math.PI * this.radiusX * this.radiusY;
  }
}

// 既存のコードは一切変更不要
const ellipse = new Ellipse(5, 3);
console.log(calculator.calculateArea(ellipse));  // 47.12
```

---

## 実践的な例

### 例2: 割引システム

```javascript
// ❌ 悪い例: 新しい割引タイプを追加するたびに修正が必要
class PriceCalculator {
  calculatePrice(price, discountType) {
    if (discountType === 'student') {
      return price * 0.9;  // 10%割引
    } else if (discountType === 'senior') {
      return price * 0.85;  // 15%割引
    } else if (discountType === 'member') {
      return price * 0.95;  // 5%割引
    }
    return price;
  }
}
```

```javascript
// ✅ 良い例: 戦略パターンを使用
class Discount {
  apply(price) {
    throw new Error('apply must be implemented');
  }
}

class StudentDiscount extends Discount {
  apply(price) {
    return price * 0.9;  // 10%割引
  }
}

class SeniorDiscount extends Discount {
  apply(price) {
    return price * 0.85;  // 15%割引
  }
}

class MemberDiscount extends Discount {
  apply(price) {
    return price * 0.95;  // 5%割引
  }
}

class NoDiscount extends Discount {
  apply(price) {
    return price;
  }
}

class PriceCalculator {
  calculatePrice(price, discount) {
    return discount.apply(price);
  }
}

// 使用例
const calculator = new PriceCalculator();
const studentDiscount = new StudentDiscount();
const seniorDiscount = new SeniorDiscount();

console.log(calculator.calculatePrice(1000, studentDiscount));  // 900
console.log(calculator.calculatePrice(1000, seniorDiscount));    // 850

// 新しい割引タイプを追加（既存コードを変更せずに）
class VIPDiscount extends Discount {
  apply(price) {
    return price * 0.8;  // 20%割引
  }
}

const vipDiscount = new VIPDiscount();
console.log(calculator.calculatePrice(1000, vipDiscount));  // 800
```

---

## 例3: 通知システム

```javascript
// ❌ 悪い例
class NotificationService {
  send(message, type) {
    if (type === 'email') {
      console.log(`Sending email: ${message}`);
    } else if (type === 'sms') {
      console.log(`Sending SMS: ${message}`);
    } else if (type === 'push') {
      console.log(`Sending push notification: ${message}`);
    }
  }
}
```

```javascript
// ✅ 良い例
class NotificationChannel {
  send(message) {
    throw new Error('send must be implemented');
  }
}

class EmailChannel extends NotificationChannel {
  send(message) {
    console.log(`Sending email: ${message}`);
    // メール送信のロジック
  }
}

class SMSChannel extends NotificationChannel {
  send(message) {
    console.log(`Sending SMS: ${message}`);
    // SMS送信のロジック
  }
}

class PushChannel extends NotificationChannel {
  send(message) {
    console.log(`Sending push notification: ${message}`);
    // プッシュ通知のロジック
  }
}

class NotificationService {
  send(message, channel) {
    channel.send(message);
  }
}

// 使用例
const service = new NotificationService();
const emailChannel = new EmailChannel();
const smsChannel = new SMSChannel();

service.send('Hello', emailChannel);
service.send('Hello', smsChannel);

// 新しい通知チャネルを追加（既存コードを変更せずに）
class SlackChannel extends NotificationChannel {
  send(message) {
    console.log(`Sending Slack message: ${message}`);
    // Slack送信のロジック
  }
}

const slackChannel = new SlackChannel();
service.send('Hello', slackChannel);
```

---

## 実装パターン

### 1. 継承（Inheritance）

```javascript
// 基底クラスを継承して拡張
class Animal {
  makeSound() {
    throw new Error('makeSound must be implemented');
  }
}

class Dog extends Animal {
  makeSound() {
    return 'Woof!';
  }
}

class Cat extends Animal {
  makeSound() {
    return 'Meow!';
  }
}
```

### 2. インターフェース（Interface）

```javascript
// TypeScriptの例
interface PaymentMethod {
  pay(amount: number): void;
}

class CreditCard implements PaymentMethod {
  pay(amount: number) {
    console.log(`Paying ${amount} with credit card`);
  }
}

class PayPal implements PaymentMethod {
  pay(amount: number) {
    console.log(`Paying ${amount} with PayPal`);
  }
}
```

### 3. 戦略パターン（Strategy Pattern）

```javascript
// アルゴリズムを交換可能にする
class SortStrategy {
  sort(data) {
    throw new Error('sort must be implemented');
  }
}

class QuickSort extends SortStrategy {
  sort(data) {
    // クイックソートの実装
    return data.sort((a, b) => a - b);
  }
}

class MergeSort extends SortStrategy {
  sort(data) {
    // マージソートの実装
    return this.mergeSort(data);
  }
  
  mergeSort(arr) {
    // マージソートのロジック
    return arr;
  }
}
```

---

## よくある間違い

### 1. 過度な抽象化

```javascript
// ❌ やりすぎ: まだ必要のない抽象化
class Shape {
  calculateArea() { }
  calculatePerimeter() { }
  draw() { }
  // ... まだ使わないメソッド
}
```

**適切なタイミング:**
- 実際に拡張が必要になったときに抽象化する
- YAGNI原則（You Aren't Gonna Need It）を考慮

### 2. すべてを拡張可能にする

```javascript
// ❌ すべてを拡張可能にする必要はない
class User {
  // このクラスは拡張する必要がないかもしれない
}
```

**判断基準:**
- 将来変更される可能性が高い部分だけを拡張可能にする
- 安定している部分はシンプルに保つ

---

## 判断基準

### OCPを適用すべきか判断する質問

1. **将来変更される可能性は高いか？**
   - 高い → OCPを適用
   - 低い → シンプルに保つ

2. **変更の頻度は？**
   - 頻繁に変更される → OCPを適用
   - ほとんど変更されない → シンプルに保つ

3. **複数のバリエーションが必要か？**
   - 必要 → OCPを適用
   - 不要 → シンプルに保つ

---

## 適用のヒント

### 1. if-else文やswitch文に注意

```javascript
// if-else文が多い場合、OCP違反の可能性
if (type === 'A') { }
else if (type === 'B') { }
else if (type === 'C') { }
```

→ ポリモーフィズムで置き換えることを検討

### 2. 変更される部分を特定

- **変更されやすい部分** → 抽象化して拡張可能にする
- **変更されにくい部分** → シンプルに保つ

### 3. 段階的な抽象化

最初はシンプルに始め、必要になったときに抽象化する：

```javascript
// 最初: シンプル
class Calculator {
  add(a, b) { return a + b; }
}

// 必要になったら抽象化
class Operation {
  execute(a, b) { }
}

class AddOperation extends Operation {
  execute(a, b) { return a + b; }
}
```

---

## まとめ

### 重要なポイント

1. **拡張に対して開いている** - 新しい機能を追加しやすい
2. **修正に対して閉じている** - 既存コードを変更しない
3. **抽象化を活用** - 継承、インターフェース、ポリモーフィズム
4. **適切なタイミングで適用** - 過度な抽象化は避ける

### チェックリスト

- [ ] 新しい機能を追加するときに既存コードを変更しているか？
- [ ] if-else文やswitch文が多すぎないか？
- [ ] 抽象化により拡張可能になっているか？
- [ ] 過度な抽象化になっていないか？

---

## 関連原則

- **Single Responsibility Principle** - 責任が明確でないと、OCPも守りにくい
- **Liskov Substitution Principle** - OCPを実現するための前提条件
- **Strategy Pattern** - OCPを実現するためのデザインパターン

---

## 参考

- Robert C. Martin, "Clean Architecture"
- "Design Patterns: Elements of Reusable Object-Oriented Software" by Gang of Four

