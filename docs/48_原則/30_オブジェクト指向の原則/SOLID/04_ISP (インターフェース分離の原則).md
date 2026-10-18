# Interface Segregation Principle (インターフェース分離の原則)

## 概要

**Interface Segregation Principle (ISP)** は、SOLID原則の4番目の原則です。

> **「クライアントは、自分が使用しないメソッドに依存することを強制されるべきではない」**

つまり、**大きなインターフェースを複数の小さなインターフェースに分割し、クライアントが必要なものだけに依存させる**という原則です。

---

## なぜ重要なのか

### 問題点

大きなインターフェース（太ったインターフェース）があると：
- **不要な依存関係** - 使わないメソッドにも依存してしまう
- **実装の負担** - 使わないメソッドも実装しなければならない
- **変更の影響** - 使わないメソッドの変更が、使っているクラスにも影響する
- **インターフェースの汚染** - インターフェースが肥大化し、理解が困難

### メリット

- **必要なものだけに依存** - クライアントは必要なメソッドだけに依存
- **実装の簡素化** - 使わないメソッドを実装する必要がない
- **変更の局所化** - 変更の影響範囲が限定的
- **インターフェースの明確化** - 各インターフェースの役割が明確

---

## 悪い例

### 例1: 太ったインターフェース

```javascript
// ❌ 悪い例: すべての機能を1つのインターフェースに詰め込む
class Worker {
  work() {
    throw new Error('work must be implemented');
  }

  eat() {
    throw new Error('eat must be implemented');
  }

  sleep() {
    throw new Error('sleep must be implemented');
  }
}

// 人間の労働者: すべてのメソッドを実装する必要がある
class HumanWorker extends Worker {
  work() {
    console.log('Human is working...');
  }

  eat() {
    console.log('Human is eating...');
  }

  sleep() {
    console.log('Human is sleeping...');
  }
}

// ロボットの労働者: eat()とsleep()は不要だが、実装しなければならない
class RobotWorker extends Worker {
  work() {
    console.log('Robot is working...');
  }

  eat() {
    // ロボットは食べない！でも実装しなければならない ❌
    throw new Error('Robots do not eat');
  }

  sleep() {
    // ロボットは眠らない！でも実装しなければならない ❌
    throw new Error('Robots do not sleep');
  }
}
```

**問題点:**
- `RobotWorker`は`eat()`と`sleep()`を使わないのに、実装しなければならない
- 使わないメソッドに依存してしまう
- インターフェースが肥大化している

---

## 良い例

### インターフェースを分離する

```javascript
// ✅ 良い例: インターフェースを分離

// 労働者のインターフェース
class Workable {
  work() {
    throw new Error('work must be implemented');
  }
}

// 食事可能なインターフェース
class Eatable {
  eat() {
    throw new Error('eat must be implemented');
  }
}

// 睡眠可能なインターフェース
class Sleepable {
  sleep() {
    throw new Error('sleep must be implemented');
  }
}

// 人間の労働者: すべてのインターフェースを実装
class HumanWorker extends Workable {
  work() {
    console.log('Human is working...');
  }
}

class HumanEater extends Eatable {
  eat() {
    console.log('Human is eating...');
  }
}

class HumanSleeper extends Sleepable {
  sleep() {
    console.log('Human is sleeping...');
  }
}

// または、多重継承が可能な言語では
class Human implements Workable, Eatable, Sleepable {
  work() { console.log('Human is working...'); }
  eat() { console.log('Human is eating...'); }
  sleep() { console.log('Human is sleeping...'); }
}

// ロボットの労働者: Workableだけを実装
class RobotWorker extends Workable {
  work() {
    console.log('Robot is working...');
  }
  // eat()やsleep()を実装する必要がない ✅
}

// 使用例
function manageWork(worker) {
  worker.work();  // Workableインターフェースだけが必要
}

const human = new HumanWorker();
const robot = new RobotWorker();

manageWork(human);   // ✅ OK
manageWork(robot);   // ✅ OK - eat()やsleep()は不要
```

### JavaScriptでの実装例

```javascript
// ✅ 良い例: JavaScriptでの実装
class Workable {
  work() {
    throw new Error('work must be implemented');
  }
}

class Eatable {
  eat() {
    throw new Error('eat must be implemented');
  }
}

class Sleepable {
  sleep() {
    throw new Error('sleep must be implemented');
  }
}

// ミックスイン（Mixin）パターンを使用
class Human {
  work() {
    console.log('Human is working...');
  }

  eat() {
    console.log('Human is eating...');
  }

  sleep() {
    console.log('Human is sleeping...');
  }
}

class Robot {
  work() {
    console.log('Robot is working...');
  }
  // eat()やsleep()は実装しない ✅
}

// 使用例
function manageWork(worker) {
  if (typeof worker.work !== 'function') {
    throw new Error('Worker must implement work()');
  }
  worker.work();
}

const human = new Human();
const robot = new Robot();

manageWork(human);   // ✅ OK
manageWork(robot);   // ✅ OK
```

---

## 実践的な例

### 例2: プリンターインターフェース

```javascript
// ❌ 悪い例: すべての機能を1つのインターフェースに
class Printer {
  print() {
    throw new Error('print must be implemented');
  }

  scan() {
    throw new Error('scan must be implemented');
  }

  fax() {
    throw new Error('fax must be implemented');
  }
}

// シンプルなプリンター: scan()とfax()は不要
class SimplePrinter extends Printer {
  print() {
    console.log('Printing...');
  }

  scan() {
    // スキャン機能がない！でも実装しなければならない ❌
    throw new Error('Scan not supported');
  }

  fax() {
    // ファックス機能がない！でも実装しなければならない ❌
    throw new Error('Fax not supported');
  }
}
```

```javascript
// ✅ 良い例: インターフェースを分離
class Printable {
  print() {
    throw new Error('print must be implemented');
  }
}

class Scannable {
  scan() {
    throw new Error('scan must be implemented');
  }
}

class Faxable {
  fax() {
    throw new Error('fax must be implemented');
  }
}

// シンプルなプリンター: Printableだけを実装
class SimplePrinter extends Printable {
  print() {
    console.log('Printing...');
  }
  // scan()やfax()を実装する必要がない ✅
}

// 多機能プリンター: すべてのインターフェースを実装
class MultiFunctionPrinter extends Printable {
  print() {
    console.log('Printing...');
  }
}

class MultiFunctionPrinterScanner extends Scannable {
  scan() {
    console.log('Scanning...');
  }
}

// または、コンポジションを使用
class MultiFunctionPrinter {
  constructor() {
    this.printer = new SimplePrinter();
    this.scanner = new Scanner();
    this.fax = new Fax();
  }

  print() {
    this.printer.print();
  }

  scan() {
    this.scanner.scan();
  }

  fax() {
    this.fax.fax();
  }
}
```

---

## 例3: データベース操作インターフェース

```javascript
// ❌ 悪い例: すべての操作を1つのインターフェースに
class Database {
  connect() {
    throw new Error('connect must be implemented');
  }

  disconnect() {
    throw new Error('disconnect must be implemented');
  }

  read() {
    throw new Error('read must be implemented');
  }

  write() {
    throw new Error('write must be implemented');
  }

  delete() {
    throw new Error('delete must be implemented');
  }
}

// 読み取り専用データベース: write()とdelete()は不要
class ReadOnlyDatabase extends Database {
  connect() { }
  disconnect() { }
  read() { }

  write() {
    // 書き込み不可！でも実装しなければならない ❌
    throw new Error('Write not allowed');
  }

  delete() {
    // 削除不可！でも実装しなければならない ❌
    throw new Error('Delete not allowed');
  }
}
```

```javascript
// ✅ 良い例: インターフェースを分離
class Connectable {
  connect() {
    throw new Error('connect must be implemented');
  }

  disconnect() {
    throw new Error('disconnect must be implemented');
  }
}

class Readable {
  read() {
    throw new Error('read must be implemented');
  }
}

class Writable {
  write() {
    throw new Error('write must be implemented');
  }
}

class Deletable {
  delete() {
    throw new Error('delete must be implemented');
  }
}

// 読み取り専用データベース: ConnectableとReadableだけを実装
class ReadOnlyDatabase extends Connectable {
  connect() {
    console.log('Connecting to read-only database...');
  }

  disconnect() {
    console.log('Disconnecting from read-only database...');
  }
}

class ReadOnlyDatabaseReader extends Readable {
  read() {
    console.log('Reading from database...');
  }
  // write()やdelete()を実装する必要がない ✅
}

// 読み書き可能なデータベース: すべてのインターフェースを実装
class ReadWriteDatabase extends Connectable {
  connect() { }
  disconnect() { }
}

class ReadWriteDatabaseReader extends Readable {
  read() { }
}

class ReadWriteDatabaseWriter extends Writable {
  write() { }
}

class ReadWriteDatabaseDeleter extends Deletable {
  delete() { }
}
```

---

## 実装パターン

### 1. インターフェースの分離

```javascript
// 大きなインターフェースを小さなインターフェースに分割
class LargeInterface {
  method1() { }
  method2() { }
  method3() { }
  method4() { }
}

// 分離後
class Interface1 {
  method1() { }
  method2() { }
}

class Interface2 {
  method3() { }
  method4() { }
}
```

### 2. ロールインターフェース

```javascript
// 各ロール（役割）ごとにインターフェースを定義
class UserReader {
  read() { }
}

class UserWriter {
  write() { }
}

class UserDeleter {
  delete() { }
}

// 必要に応じて組み合わせる
class UserRepository extends UserReader {
  read() { }
}

class FullUserRepository extends UserReader {
  read() { }
}

// UserWriterとUserDeleterも実装
```

### 3. アダプターパターンとの組み合わせ

```javascript
// 既存の大きなインターフェースを、小さなインターフェースに適応
class LargeInterface {
  method1() { }
  method2() { }
  method3() { }
}

class SmallInterface {
  method1() { }
}

class Adapter extends SmallInterface {
  constructor(large) {
    super();
    this.large = large;
  }

  method1() {
    return this.large.method1();
  }
}
```

---

## よくある間違い

### 1. 過度な分割

```javascript
// ❌ やりすぎ: 1つのメソッドごとにインターフェースを作る
class Method1Interface {
  method1() { }
}

class Method2Interface {
  method2() { }
}

class Method3Interface {
  method3() { }
}
```

**適切な粒度:**
- 関連するメソッドは1つのインターフェースにまとめる
- クライアントが一緒に使うメソッドは同じインターフェースに

### 2. インターフェースの意味のない分離

```javascript
// ❌ 意味のない分離: 関連性の高いメソッドを分離
class GetNameInterface {
  getName() { }
}

class SetNameInterface {
  setName() { }
}
```

**適切な分離:**
- 意味的に異なる責任を持つメソッドを分離
- クライアントが別々に使うメソッドを分離

---

## 判断基準

### ISPを適用すべきか判断する質問

1. **クライアントが使わないメソッドがあるか？**
   - ある → ISPを適用
   - ない → 現状のままで良い

2. **実装クラスが使わないメソッドを実装しているか？**
   - 実装している → ISPを適用
   - 実装していない → 現状のままで良い

3. **インターフェースが肥大化しているか？**
   - 肥大化している → ISPを適用
   - 適切なサイズ → 現状のままで良い

---

## 適用のヒント

### 1. 使わないメソッドを探す

```javascript
// 実装クラスで、例外を投げているメソッドを探す
class SomeClass extends LargeInterface {
  method1() { }
  method2() {
    throw new Error('Not supported');  // ← これがヒント
  }
}
```

### 2. クライアントの使用パターンを確認

```javascript
// クライアントが使うメソッドの組み合わせを確認
client1.method1();  // method1だけを使う
client2.method2();  // method2だけを使う
client3.method1(); client3.method2();  // method1とmethod2を一緒に使う
```

### 3. インターフェースのサイズを確認

- 5つ以上のメソッドがある → 分割を検討
- メソッドが異なる責任を持っている → 分割を検討

---

## まとめ

### 重要なポイント

1. **クライアントは必要なものだけに依存** - 使わないメソッドに依存しない
2. **インターフェースを小さく保つ** - 1つの責任だけを持つ
3. **関連するメソッドをまとめる** - 一緒に使うメソッドは同じインターフェースに
4. **過度な分割は避ける** - 適切な粒度を保つ

### チェックリスト

- [ ] 実装クラスが使わないメソッドを実装しているか？
- [ ] インターフェースが肥大化していないか？
- [ ] クライアントが使わないメソッドに依存していないか？
- [ ] インターフェースの責任が明確か？

---

## 関連原則

- **Single Responsibility Principle** - ISPはSRPをインターフェースに適用したもの
- **Dependency Inversion Principle** - ISPを守ることで、DIPも守りやすくなる

---

## 参考

- Robert C. Martin, "Clean Architecture"
- "Design Patterns: Elements of Reusable Object-Oriented Software" by Gang of Four

