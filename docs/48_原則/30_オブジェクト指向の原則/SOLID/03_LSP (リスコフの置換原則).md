# Liskov Substitution Principle (リスコフの置換原則)

## 概要

**Liskov Substitution Principle (LSP)** は、SOLID原則の3番目の原則です。

> **「派生クラス（サブクラス）のオブジェクトは、その基底クラス（スーパークラス）のオブジェクトと置き換え可能でなければならない」**

つまり、**基底クラスのオブジェクトを使っている場所で、派生クラスのオブジェクトに置き換えても、プログラムの動作が壊れてはいけない**という原則です。

この原則は、1987年にバーバラ・リスコフ（Barbara Liskov）によって提唱されました。

---

## なぜ重要なのか

### 問題点

LSPに違反すると：
- **予期しない動作** - 基底クラスを期待しているコードで、派生クラスを使うとエラーが発生
- **テストの失敗** - 基底クラスで動作していたテストが、派生クラスで失敗する
- **ポリモーフィズムの破綻** - オブジェクト指向の多態性が正しく機能しない
- **保守性の低下** - どの派生クラスが安全に使えるか判断が困難

### メリット

- **安全な置き換え** - 基底クラスと派生クラスを安全に交換できる
- **ポリモーフィズムの保証** - 多態性が正しく機能する
- **テストの一貫性** - 基底クラスのテストが派生クラスでも有効
- **拡張性の向上** - 新しい派生クラスを追加しやすい

---

## 基本的な考え方

### 契約（Contract）

基底クラスと派生クラスの間には**契約**があります：

1. **事前条件（Preconditions）** - メソッドを呼び出す前に満たすべき条件
2. **事後条件（Postconditions）** - メソッド実行後に保証される条件
3. **不変条件（Invariants）** - 常に保たれるべき条件

**派生クラスは、基底クラスの契約を弱めてはいけない**

---

## 悪い例

### 例1: 正方形と長方形の問題（クラシックな例）

```javascript
// ❌ 悪い例: LSP違反
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  setWidth(width) {
    this.width = width;
  }

  setHeight(height) {
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

// SquareはRectangleを継承しているが、置き換え不可能
class Square extends Rectangle {
  constructor(side) {
    super(side, side);
  }

  setWidth(width) {
    this.width = width;
    this.height = width;  // 正方形なので、高さも同じにする
  }

  setHeight(height) {
    this.width = height;
    this.height = height;  // 正方形なので、幅も同じにする
  }
}

// 問題: Rectangleを期待している関数で、Squareを使うと予期しない動作
function testRectangle(rectangle) {
  rectangle.setWidth(5);
  rectangle.setHeight(4);
  
  // Rectangleなら 5 * 4 = 20 を期待
  // しかしSquareなら 4 * 4 = 16 になってしまう！
  console.log(`Expected: 20, Got: ${rectangle.getArea()}`);
}

const rect = new Rectangle(10, 10);
testRectangle(rect);  // Expected: 20, Got: 20 ✅

const square = new Square(10);
testRectangle(square);  // Expected: 20, Got: 16 ❌ LSP違反！
```

**問題点:**
- `Square`は`Rectangle`の代わりに使えない
- `setWidth`と`setHeight`の動作が異なる
- 基底クラスを期待しているコードで、派生クラスを使うと予期しない動作

---

## 良い例

### 解決策1: 継承関係を変更

```javascript
// ✅ 良い例: 共通の基底クラスを作る
class Shape {
  getArea() {
    throw new Error('getArea must be implemented');
  }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }

  setWidth(width) {
    this.width = width;
  }

  setHeight(height) {
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

class Square extends Shape {
  constructor(side) {
    super();
    this.side = side;
  }

  setSide(side) {
    this.side = side;
  }

  getArea() {
    return this.side * this.side;
  }
}

// これで、Shapeを期待している関数で、RectangleもSquareも使える
function calculateTotalArea(shapes) {
  return shapes.reduce((total, shape) => total + shape.getArea(), 0);
}

const shapes = [
  new Rectangle(5, 4),
  new Square(3)
];

console.log(calculateTotalArea(shapes));  // 20 + 9 = 29 ✅
```

### 解決策2: 不変オブジェクトとして扱う

```javascript
// ✅ 良い例: 不変オブジェクトとして扱う
class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }

  getArea() {
    return this.width * this.height;
  }
}

class Square {
  constructor(side) {
    this.side = side;
  }

  getArea() {
    return this.side * this.side;
  }
}

// 共通のインターフェース（JavaScriptでは型がないので、暗黙的）
// 両方ともgetArea()メソッドを持つ
```

---

## 実践的な例

### 例2: 鳥クラスの問題

```javascript
// ❌ 悪い例: LSP違反
class Bird {
  fly() {
    console.log('Flying...');
  }

  eat() {
    console.log('Eating...');
  }
}

class Sparrow extends Bird {
  fly() {
    console.log('Sparrow is flying...');
  }
}

class Penguin extends Bird {
  // ペンギンは飛べない！
  fly() {
    throw new Error('Penguins cannot fly!');  // ❌ LSP違反
  }
}

// 問題: Birdを期待している関数で、Penguinを使うとエラー
function makeBirdFly(bird) {
  bird.fly();  // Penguinの場合、エラーが発生
}

const sparrow = new Sparrow();
makeBirdFly(sparrow);  // ✅ OK

const penguin = new Penguin();
makeBirdFly(penguin);  // ❌ エラー！LSP違反
```

```javascript
// ✅ 良い例: インターフェースを分離
class Bird {
  eat() {
    console.log('Eating...');
  }
}

// 飛べる鳥のインターフェース
class FlyingBird extends Bird {
  fly() {
    throw new Error('fly must be implemented');
  }
}

// 飛べない鳥のインターフェース
class NonFlyingBird extends Bird {
  swim() {
    throw new Error('swim must be implemented');
  }
}

class Sparrow extends FlyingBird {
  fly() {
    console.log('Sparrow is flying...');
  }
}

class Penguin extends NonFlyingBird {
  swim() {
    console.log('Penguin is swimming...');
  }
}

// これで、FlyingBirdを期待している関数で、Sparrowは使える
function makeBirdFly(bird) {
  bird.fly();  // FlyingBirdを期待
}

const sparrow = new Sparrow();
makeBirdFly(sparrow);  // ✅ OK

// PenguinはFlyingBirdではないので、この関数には渡せない（正しい）
```

---

## 例3: コレクションクラス

```javascript
// ❌ 悪い例: LSP違反
class Collection {
  add(item) {
    // コレクションに追加
    this.items.push(item);
  }

  remove(item) {
    // コレクションから削除
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
}

class ReadOnlyCollection extends Collection {
  add(item) {
    throw new Error('Cannot add to read-only collection');  // ❌ LSP違反
  }

  remove(item) {
    throw new Error('Cannot remove from read-only collection');  // ❌ LSP違反
  }
}

// 問題: Collectionを期待している関数で、ReadOnlyCollectionを使うとエラー
function addItems(collection, items) {
  items.forEach(item => collection.add(item));  // ReadOnlyCollectionの場合、エラー
}
```

```javascript
// ✅ 良い例: 継承関係を変更
class Collection {
  add(item) {
    this.items.push(item);
  }

  remove(item) {
    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
    }
  }
}

// ReadOnlyCollectionはCollectionを継承しない
class ReadOnlyCollection {
  constructor(items) {
    this.items = [...items];  // コピーを作成
  }

  getItems() {
    return [...this.items];  // コピーを返す
  }

  // addやremoveメソッドは提供しない
}

// または、共通のインターフェースを作る
class ReadableCollection {
  getItems() {
    throw new Error('getItems must be implemented');
  }
}

class MutableCollection extends ReadableCollection {
  add(item) { }
  remove(item) { }
  getItems() { }
}

class ReadOnlyCollection extends ReadableCollection {
  getItems() { }
  // addやremoveは提供しない
}
```

---

## LSP違反のパターン

### 1. 派生クラスが例外を投げる

```javascript
// ❌ 悪い例
class Base {
  method() {
    // 何か処理
  }
}

class Derived extends Base {
  method() {
    throw new Error('Not supported');  // ❌ LSP違反
  }
}
```

### 2. 派生クラスが事前条件を強める

```javascript
// ❌ 悪い例
class Base {
  method(value) {
    // valueは任意の数値を受け入れる
  }
}

class Derived extends Base {
  method(value) {
    if (value < 0) {
      throw new Error('Value must be positive');  // ❌ 事前条件を強めている
    }
    super.method(value);
  }
}
```

### 3. 派生クラスが事後条件を弱める

```javascript
// ❌ 悪い例
class Base {
  method() {
    return { result: 'success', data: 'some data' };
  }
}

class Derived extends Base {
  method() {
    return null;  // ❌ 事後条件を弱めている（nullを返す可能性）
  }
}
```

---

## 良い例のパターン

### 1. 契約を守る

```javascript
// ✅ 良い例
class Base {
  method(value) {
    if (value < 0) {
      throw new Error('Value must be non-negative');
    }
    return value * 2;
  }
}

class Derived extends Base {
  method(value) {
    // 事前条件を弱めない（同じか、より緩い条件）
    // 事後条件を弱めない（同じか、より強い保証）
    return super.method(value) + 1;
  }
}
```

### 2. 不変条件を保つ

```javascript
// ✅ 良い例
class Account {
  constructor(balance) {
    if (balance < 0) {
      throw new Error('Balance cannot be negative');
    }
    this.balance = balance;
  }

  withdraw(amount) {
    if (amount < 0) {
      throw new Error('Amount must be positive');
    }
    if (this.balance < amount) {
      throw new Error('Insufficient funds');
    }
    this.balance -= amount;
    // 不変条件: balance >= 0 が常に保たれる
  }
}

class SavingsAccount extends Account {
  withdraw(amount) {
    // 不変条件を保つ（balance >= 0）
    super.withdraw(amount);
  }
}
```

---

## 判断基準

### LSPを守っているか判断する質問

1. **基底クラスのオブジェクトを派生クラスに置き換えても動作するか？**
   - 動作する → LSP準拠
   - 動作しない → LSP違反

2. **派生クラスが例外を投げていないか？**
   - 投げていない → LSP準拠
   - 投げている → LSP違反の可能性

3. **事前条件・事後条件・不変条件を守っているか？**
   - 守っている → LSP準拠
   - 守っていない → LSP違反

---

## 適用のヒント

### 1. "is-a"関係を確認

```javascript
// "Square is a Rectangle" は数学的には正しいが、
// プログラム的には置き換え不可能な場合がある
```

**判断:**
- 数学的・概念的な"is-a"関係だけでなく、**動作的な"is-a"関係**を確認
- 基底クラスの代わりに使えるか？

### 2. テストで確認

```javascript
// 基底クラスのテストが、派生クラスでも通るか確認
function testBase(base) {
  // 基底クラスのテスト
}

// これが派生クラスでも通るべき
testBase(new Derived());  // エラーが出たらLSP違反
```

### 3. 契約を明確にする

- 事前条件、事後条件、不変条件を明確に定義
- コメントやドキュメントで契約を記述

---

## まとめ

### 重要なポイント

1. **派生クラスは基底クラスと置き換え可能** - 同じように動作する
2. **契約を守る** - 事前条件、事後条件、不変条件
3. **例外を投げない** - 基底クラスが例外を投げないなら、派生クラスも投げない
4. **動作の一貫性** - 基底クラスを期待しているコードで、派生クラスも動作する

### チェックリスト

- [ ] 基底クラスのオブジェクトを派生クラスに置き換えても動作するか？
- [ ] 派生クラスが例外を投げていないか？
- [ ] 事前条件・事後条件・不変条件を守っているか？
- [ ] 基底クラスのテストが派生クラスでも通るか？

---

## 関連原則

- **Open/Closed Principle** - LSPを守ることで、OCPも守りやすくなる
- **Interface Segregation Principle** - 適切なインターフェース設計がLSPを守る助けになる

---

## 参考

- Barbara Liskov, "Data Abstraction and Hierarchy" (1987)
- Robert C. Martin, "Clean Architecture"
- "Design by Contract" - 契約による設計

