# Dependency Inversion Principle (依存性逆転の原則)

## 概要

**Dependency Inversion Principle (DIP)** は、SOLID原則の最後の原則です。

> **「高レベルのモジュールは低レベルのモジュールに依存すべきではない。両方とも抽象（インターフェース）に依存すべきである」**

つまり：
- **高レベルのモジュール** - ビジネスロジックなど、アプリケーションの核心部分
- **低レベルのモジュール** - データベース、ファイルシステム、外部APIなど、実装の詳細
- **抽象（インターフェース）** - 両者をつなぐ契約

**依存の方向を逆転させる**ことで、高レベルのモジュールが低レベルのモジュールの実装詳細に依存しないようにします。

---

## なぜ重要なのか

### 問題点

高レベルのモジュールが低レベルのモジュールに直接依存すると：
- **結合度が高い** - 実装の詳細に強く結びついている
- **テストが困難** - 実際のデータベースや外部サービスが必要
- **変更に弱い** - 低レベルの実装を変更すると、高レベルのコードも変更が必要
- **再利用性が低い** - 高レベルのロジックを他の環境で使えない

### メリット

- **疎結合** - 実装の詳細から独立している
- **テストしやすい** - モックやスタブを使いやすい
- **変更に強い** - 低レベルの実装を変更しても、高レベルのコードは変更不要
- **再利用性が高い** - 高レベルのロジックを他の環境でも使える

---

## 悪い例

### 例1: 高レベルのモジュールが低レベルのモジュールに直接依存

```javascript
// ❌ 悪い例: 高レベルのモジュールが低レベルのモジュールに直接依存

// 低レベルのモジュール（実装の詳細）
class MySQLDatabase {
  connect() {
    console.log('Connecting to MySQL database...');
  }

  query(sql) {
    console.log(`Executing query: ${sql}`);
    return [{ id: 1, name: 'John' }];
  }

  disconnect() {
    console.log('Disconnecting from MySQL database...');
  }
}

// 高レベルのモジュール（ビジネスロジック）
class UserService {
  constructor() {
    // 直接MySQLDatabaseに依存している ❌
    this.database = new MySQLDatabase();
  }

  getUser(id) {
    this.database.connect();
    const result = this.database.query(`SELECT * FROM users WHERE id = ${id}`);
    this.database.disconnect();
    return result[0];
  }
}

// 問題点:
// 1. UserServiceがMySQLDatabaseに直接依存している
// 2. データベースをPostgreSQLに変更する場合、UserServiceも変更が必要
// 3. テストするために実際のMySQLデータベースが必要
// 4. UserServiceを他の環境で使えない
```

**問題点:**
- `UserService`が`MySQLDatabase`に直接依存している
- データベースを変更する場合、`UserService`も変更が必要
- テストが困難（実際のデータベースが必要）

---

## 良い例

### 抽象（インターフェース）に依存する

```javascript
// ✅ 良い例: 抽象（インターフェース）に依存

// 抽象（インターフェース）を定義
class Database {
  connect() {
    throw new Error('connect must be implemented');
  }

  query(sql) {
    throw new Error('query must be implemented');
  }

  disconnect() {
    throw new Error('disconnect must be implemented');
  }
}

// 低レベルのモジュール（実装の詳細）
class MySQLDatabase extends Database {
  connect() {
    console.log('Connecting to MySQL database...');
  }

  query(sql) {
    console.log(`Executing query: ${sql}`);
    return [{ id: 1, name: 'John' }];
  }

  disconnect() {
    console.log('Disconnecting from MySQL database...');
  }
}

class PostgreSQLDatabase extends Database {
  connect() {
    console.log('Connecting to PostgreSQL database...');
  }

  query(sql) {
    console.log(`Executing query: ${sql}`);
    return [{ id: 1, name: 'John' }];
  }

  disconnect() {
    console.log('Disconnecting from PostgreSQL database...');
  }
}

// 高レベルのモジュール（ビジネスロジック）
class UserService {
  constructor(database) {
    // 抽象（Databaseインターフェース）に依存している ✅
    this.database = database;
  }

  getUser(id) {
    this.database.connect();
    const result = this.database.query(`SELECT * FROM users WHERE id = ${id}`);
    this.database.disconnect();
    return result[0];
  }
}

// 使用例
const mysqlDb = new MySQLDatabase();
const userService1 = new UserService(mysqlDb);
userService1.getUser(1);

// データベースを変更しても、UserServiceは変更不要 ✅
const postgresDb = new PostgreSQLDatabase();
const userService2 = new UserService(postgresDb);
userService2.getUser(1);
```

**メリット:**
- `UserService`が抽象（`Database`インターフェース）に依存している
- データベースを変更しても、`UserService`は変更不要
- テスト時にモックデータベースを使える

---

## 実践的な例

### 例2: 依存性注入（Dependency Injection）

```javascript
// ❌ 悪い例: 内部でインスタンスを作成
class EmailService {
  constructor() {
    // 直接SMTPSenderに依存している ❌
    this.sender = new SMTPSender();
  }

  sendEmail(to, subject, body) {
    this.sender.send(to, subject, body);
  }
}

class SMTPSender {
  send(to, subject, body) {
    console.log(`Sending email via SMTP to ${to}: ${subject}`);
  }
}
```

```javascript
// ✅ 良い例: 依存性を注入する
class EmailSender {
  send(to, subject, body) {
    throw new Error('send must be implemented');
  }
}

class SMTPSender extends EmailSender {
  send(to, subject, body) {
    console.log(`Sending email via SMTP to ${to}: ${subject}`);
  }
}

class SendGridSender extends EmailSender {
  send(to, subject, body) {
    console.log(`Sending email via SendGrid to ${to}: ${subject}`);
  }
}

class EmailService {
  constructor(sender) {
    // 抽象（EmailSenderインターフェース）に依存している ✅
    // 依存性を外部から注入（Dependency Injection）
    this.sender = sender;
  }

  sendEmail(to, subject, body) {
    this.sender.send(to, subject, body);
  }
}

// 使用例
const smtpSender = new SMTPSender();
const emailService1 = new EmailService(smtpSender);
emailService1.sendEmail('user@example.com', 'Hello', 'Hello World');

// 送信方法を変更しても、EmailServiceは変更不要 ✅
const sendGridSender = new SendGridSender();
const emailService2 = new EmailService(sendGridSender);
emailService2.sendEmail('user@example.com', 'Hello', 'Hello World');
```

---

## 例3: テストでの活用

```javascript
// ✅ 良い例: テストでモックを使える

// 抽象（インターフェース）
class UserRepository {
  findById(id) {
    throw new Error('findById must be implemented');
  }

  save(user) {
    throw new Error('save must be implemented');
  }
}

// 実装（低レベルのモジュール）
class DatabaseUserRepository extends UserRepository {
  constructor(database) {
    super();
    this.database = database;
  }

  findById(id) {
    // データベースから取得
    return this.database.query(`SELECT * FROM users WHERE id = ${id}`);
  }

  save(user) {
    // データベースに保存
    this.database.query(`INSERT INTO users ...`);
  }
}

// 高レベルのモジュール
class UserService {
  constructor(userRepository) {
    // 抽象（UserRepositoryインターフェース）に依存している ✅
    this.userRepository = userRepository;
  }

  getUser(id) {
    return this.userRepository.findById(id);
  }

  createUser(userData) {
    const user = { ...userData, id: Date.now() };
    this.userRepository.save(user);
    return user;
  }
}

// テスト用のモック（低レベルのモジュール）
class MockUserRepository extends UserRepository {
  constructor() {
    super();
    this.users = [];
  }

  findById(id) {
    return this.users.find(u => u.id === id);
  }

  save(user) {
    this.users.push(user);
  }
}

// テスト
describe('UserService', () => {
  it('should get user by id', () => {
    // 実際のデータベースは不要 ✅
    const mockRepo = new MockUserRepository();
    mockRepo.save({ id: 1, name: 'John' });

    const userService = new UserService(mockRepo);
    const user = userService.getUser(1);

    expect(user.name).toBe('John');
  });
});
```

---

## 依存性注入のパターン

### 1. コンストラクタインジェクション

```javascript
// コンストラクタで依存性を注入
class Service {
  constructor(dependency) {
    this.dependency = dependency;
  }
}

const dependency = new Dependency();
const service = new Service(dependency);
```

### 2. セッターインジェクション

```javascript
// セッターメソッドで依存性を注入
class Service {
  setDependency(dependency) {
    this.dependency = dependency;
  }
}

const service = new Service();
service.setDependency(new Dependency());
```

### 3. インターフェースインジェクション

```javascript
// メソッドの引数で依存性を注入
class Service {
  doSomething(dependency) {
    dependency.method();
  }
}

const service = new Service();
service.doSomething(new Dependency());
```

---

## 実装パターン

### 1. 依存性注入コンテナ（DI Container）

```javascript
// シンプルなDIコンテナの例
class DIContainer {
  constructor() {
    this.services = {};
  }

  register(name, factory) {
    this.services[name] = factory;
  }

  resolve(name) {
    const factory = this.services[name];
    if (!factory) {
      throw new Error(`Service ${name} not found`);
    }
    return factory(this);
  }
}

// 使用例
const container = new DIContainer();

container.register('database', () => new MySQLDatabase());
container.register('userRepository', (container) => {
  return new DatabaseUserRepository(container.resolve('database'));
});
container.register('userService', (container) => {
  return new UserService(container.resolve('userRepository'));
});

const userService = container.resolve('userService');
```

### 2. ファクトリーパターン

```javascript
// ファクトリーで依存性を管理
class UserServiceFactory {
  static create(databaseType = 'mysql') {
    let database;
    if (databaseType === 'mysql') {
      database = new MySQLDatabase();
    } else if (databaseType === 'postgresql') {
      database = new PostgreSQLDatabase();
    }

    const userRepository = new DatabaseUserRepository(database);
    return new UserService(userRepository);
  }
}

// 使用例
const userService = UserServiceFactory.create('mysql');
```

---

## よくある間違い

### 1. 抽象が具体的すぎる

```javascript
// ❌ 悪い例: 抽象が具体的すぎる
class MySQLDatabaseInterface {
  connectToMySQL() { }  // MySQL固有のメソッド
  queryMySQL(sql) { }   // MySQL固有のメソッド
}
```

```javascript
// ✅ 良い例: 抽象は一般的に
class Database {
  connect() { }
  query(sql) { }
}
```

### 2. 依存性を内部で作成

```javascript
// ❌ 悪い例: 内部でインスタンスを作成
class Service {
  constructor() {
    this.dependency = new ConcreteDependency();  // ❌
  }
}
```

```javascript
// ✅ 良い例: 外部から注入
class Service {
  constructor(dependency) {
    this.dependency = dependency;  // ✅
  }
}
```

---

## 判断基準

### DIPを適用すべきか判断する質問

1. **高レベルのモジュールが低レベルのモジュールに直接依存しているか？**
   - 依存している → DIPを適用
   - 依存していない → 現状のままで良い

2. **テストが困難か？**
   - 困難 → DIPを適用
   - 容易 → 現状のままで良い

3. **実装の詳細を変更する場合、高レベルのモジュールも変更が必要か？**
   - 必要 → DIPを適用
   - 不要 → 現状のままで良い

---

## 適用のヒント

### 1. newキーワードに注意

```javascript
// newキーワードで直接インスタンスを作成している場合、依存性を注入することを検討
class Service {
  constructor() {
    this.dependency = new ConcreteDependency();  // ← 注意
  }
}
```

### 2. 抽象化のタイミング

- **最初から抽象化する必要はない** - YAGNI原則を考慮
- **変更が必要になったときに抽象化する** - リファクタリングのタイミングで

### 3. 依存性の方向を確認

```
❌ 悪い: 高レベル → 低レベル
✅ 良い: 高レベル → 抽象 ← 低レベル
```

---

## まとめ

### 重要なポイント

1. **高レベルのモジュールは抽象に依存** - 実装の詳細に依存しない
2. **低レベルのモジュールも抽象に依存** - インターフェースを実装する
3. **依存性を注入する** - 外部から依存性を提供する
4. **テストしやすくする** - モックやスタブを使いやすくする

### チェックリスト

- [ ] 高レベルのモジュールが低レベルのモジュールに直接依存していないか？
- [ ] 抽象（インターフェース）を定義しているか？
- [ ] 依存性を外部から注入しているか？
- [ ] テストでモックを使えるか？

---

## 関連原則

- **Open/Closed Principle** - DIPを守ることで、OCPも守りやすくなる
- **Interface Segregation Principle** - 適切なインターフェース設計がDIPを守る助けになる
- **Dependency Injection** - DIPを実現するためのテクニック

## 関連ノート

- [[04_疎結合・インターフェース・DIP・DIの整理]] — 疎結合・インターフェース・DIP・DI の関係（43_モジュール設計）
- [[02_依存関係の管理]] — モジュール単位での DIP の実現（43_モジュール設計）
- [[01依存性逆転]] / [[02_依存関係逆転の原則]] — アーキテクチャ視点（41_アーキテクチャ）
- [[01_依存性注入]] / [[03_制御の反転とComposition Root]] — DI の詳細（41_アーキテクチャ）
- [[04_インターフェースと抽象化]]

---

## 参考

- Robert C. Martin, "Clean Architecture"
- Martin Fowler, "Inversion of Control Containers and the Dependency Injection pattern"
- "Design Patterns: Elements of Reusable Object-Oriented Software" by Gang of Four

