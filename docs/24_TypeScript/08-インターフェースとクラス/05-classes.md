# クラス

## 目次
- [[04-interfaces|← 前章: インターフェース]]
- [[06-functions|次章: 関数とジェネリクス →]]

## クラスの基礎

### 基本的なクラス

**クラス**はオブジェクト指向プログラミングの基本単位です。

```typescript
// 基本的なクラス定義
class Person {
  // プロパティ
  name: string;
  age: number;

  // コンストラクタ
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  // メソッド
  greet(): string {
    return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
  }

  // ゲッターメソッド
  get isAdult(): boolean {
    return this.age >= 18;
  }

  // セッターメソッド
  set birthday(newAge: number) {
    if (newAge > this.age) {
      this.age = newAge;
    }
  }
}

// クラスのインスタンス化
let person = new Person("Alice", 25);
console.log(person.greet()); // "Hello, my name is Alice and I am 25 years old."
console.log(person.isAdult); // true
person.birthday = 26;
```

### アクセス修飾子

```typescript
class BankAccount {
  // public: どこからでもアクセス可能（デフォルト）
  public accountNumber: string;
  
  // private: クラス内からのみアクセス可能
  private balance: number;
  
  // protected: クラス内とサブクラスからアクセス可能
  protected owner: string;

  constructor(accountNumber: string, owner: string, initialBalance: number = 0) {
    this.accountNumber = accountNumber;
    this.owner = owner;
    this.balance = initialBalance;
  }

  // パブリックメソッド
  public deposit(amount: number): void {
    if (amount > 0) {
      this.balance += amount;
      console.log(`Deposited ${amount}. New balance: ${this.balance}`);
    }
  }

  public withdraw(amount: number): boolean {
    if (amount > 0 && amount <= this.balance) {
      this.balance -= amount;
      console.log(`Withdrew ${amount}. New balance: ${this.balance}`);
      return true;
    }
    console.log("Insufficient funds");
    return false;
  }

  public getBalance(): number {
    return this.balance;
  }

  // プライベートメソッド
  private validateAmount(amount: number): boolean {
    return amount > 0 && amount <= this.balance;
  }
}

let account = new BankAccount("123456789", "John Doe", 1000);
account.deposit(500); // "Deposited 500. New balance: 1500"
account.withdraw(200); // "Withdrew 200. New balance: 1300"
// account.balance = 2000; // エラー！privateプロパティ
// account.validateAmount(100); // エラー！privateメソッド
```

### パラメータプロパティ

```typescript
// パラメータプロパティを使用したクラス
class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    private password: string,
    protected role: string = "user"
  ) {
    // コンストラクタ内で自動的にプロパティが初期化される
  }

  changePassword(oldPassword: string, newPassword: string): boolean {
    if (this.password === oldPassword) {
      this.password = newPassword;
      return true;
    }
    return false;
  }

  get userInfo(): string {
    return `User: ${this.name} (${this.email})`;
  }
}

let user = new User(1, "Alice", "alice@example.com", "password123");
console.log(user.userInfo); // "User: Alice (alice@example.com)"
// user.id = 2; // エラー！readonlyプロパティ
```

## 継承

### 基本的な継承

```typescript
// 基底クラス
class Animal {
  protected name: string;
  protected age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }

  public makeSound(): void {
    console.log("Some animal sound");
  }

  public getInfo(): string {
    return `${this.name} is ${this.age} years old`;
  }
}

// 派生クラス
class Dog extends Animal {
  private breed: string;

  constructor(name: string, age: number, breed: string) {
    super(name, age); // 親クラスのコンストラクタを呼び出し
    this.breed = breed;
  }

  // メソッドのオーバーライド
  public makeSound(): void {
    console.log("Woof! Woof!");
  }

  // 新しいメソッド
  public fetch(): void {
    console.log(`${this.name} is fetching the ball`);
  }

  // ゲッター
  public get dogInfo(): string {
    return `${this.getInfo()} and is a ${this.breed}`;
  }
}

class Cat extends Animal {
  private color: string;

  constructor(name: string, age: number, color: string) {
    super(name, age);
    this.color = color;
  }

  public makeSound(): void {
    console.log("Meow! Meow!");
  }

  public climb(): void {
    console.log(`${this.name} is climbing the tree`);
  }
}

// 使用例
let dog = new Dog("Buddy", 3, "Golden Retriever");
let cat = new Cat("Whiskers", 2, "Orange");

dog.makeSound(); // "Woof! Woof!"
cat.makeSound(); // "Meow! Meow!"
console.log(dog.dogInfo); // "Buddy is 3 years old and is a Golden Retriever"
```

### 抽象クラス

```typescript
// 抽象クラス
abstract class Shape {
  protected color: string;

  constructor(color: string) {
    this.color = color;
  }

  // 抽象メソッド（サブクラスで実装必須）
  abstract calculateArea(): number;
  abstract calculatePerimeter(): number;

  // 具象メソッド
  public getColor(): string {
    return this.color;
  }

  public setColor(color: string): void {
    this.color = color;
  }

  // 抽象プロパティ
  abstract get description(): string;
}

// 具象クラス
class Circle extends Shape {
  private radius: number;

  constructor(color: string, radius: number) {
    super(color);
    this.radius = radius;
  }

  public calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }

  public calculatePerimeter(): number {
    return 2 * Math.PI * this.radius;
  }

  public get description(): string {
    return `A ${this.color} circle with radius ${this.radius}`;
  }
}

class Rectangle extends Shape {
  private width: number;
  private height: number;

  constructor(color: string, width: number, height: number) {
    super(color);
    this.width = width;
    this.height = height;
  }

  public calculateArea(): number {
    return this.width * this.height;
  }

  public calculatePerimeter(): number {
    return 2 * (this.width + this.height);
  }

  public get description(): string {
    return `A ${this.color} rectangle with width ${this.width} and height ${this.height}`;
  }
}

// 使用例
let circle = new Circle("red", 5);
let rectangle = new Rectangle("blue", 4, 6);

console.log(circle.description); // "A red circle with radius 5"
console.log(circle.calculateArea()); // 78.54...
console.log(rectangle.calculatePerimeter()); // 20
```

## インターフェースの実装

### 基本的な実装

```typescript
// インターフェースの定義
interface Vehicle {
  start(): void;
  stop(): void;
  getSpeed(): number;
  accelerate(speed: number): void;
}

interface Electric {
  charge(): void;
  getBatteryLevel(): number;
}

// クラスでのインターフェース実装
class Car implements Vehicle {
  private speed: number = 0;
  private isRunning: boolean = false;

  public start(): void {
    this.isRunning = true;
    console.log("Car started");
  }

  public stop(): void {
    this.isRunning = false;
    this.speed = 0;
    console.log("Car stopped");
  }

  public getSpeed(): number {
    return this.speed;
  }

  public accelerate(speed: number): void {
    if (this.isRunning) {
      this.speed += speed;
      console.log(`Speed increased to ${this.speed}`);
    }
  }
}

// 複数のインターフェースを実装
class ElectricCar implements Vehicle, Electric {
  private speed: number = 0;
  private isRunning: boolean = false;
  private batteryLevel: number = 100;

  public start(): void {
    if (this.batteryLevel > 0) {
      this.isRunning = true;
      console.log("Electric car started");
    } else {
      console.log("Battery too low to start");
    }
  }

  public stop(): void {
    this.isRunning = false;
    this.speed = 0;
    console.log("Electric car stopped");
  }

  public getSpeed(): number {
    return this.speed;
  }

  public accelerate(speed: number): void {
    if (this.isRunning && this.batteryLevel > 0) {
      this.speed += speed;
      this.batteryLevel -= speed * 0.1; // バッテリー消費
      console.log(`Speed increased to ${this.speed}`);
    }
  }

  public charge(): void {
    this.batteryLevel = 100;
    console.log("Battery fully charged");
  }

  public getBatteryLevel(): number {
    return this.batteryLevel;
  }
}
```

## 静的メンバー

### 静的プロパティとメソッド

```typescript
class MathUtils {
  // 静的プロパティ
  static readonly PI: number = 3.14159;
  static readonly E: number = 2.71828;

  // 静的メソッド
  static add(a: number, b: number): number {
    return a + b;
  }

  static multiply(a: number, b: number): number {
    return a * b;
  }

  static factorial(n: number): number {
    if (n <= 1) return 1;
    return n * MathUtils.factorial(n - 1);
  }

  static isPrime(num: number): boolean {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }
}

// 静的メンバーの使用
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(5, 3)); // 8
console.log(MathUtils.factorial(5)); // 120
console.log(MathUtils.isPrime(17)); // true

// インスタンスからはアクセスできない
// let math = new MathUtils();
// math.PI; // エラー！
```

### シングルトンパターン

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connectionString: string;
  private isConnected: boolean = false;

  private constructor(connectionString: string) {
    this.connectionString = connectionString;
  }

  public static getInstance(connectionString?: string): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(
        connectionString || "default-connection"
      );
    }
    return DatabaseConnection.instance;
  }

  public connect(): void {
    if (!this.isConnected) {
      console.log(`Connecting to database: ${this.connectionString}`);
      this.isConnected = true;
    }
  }

  public disconnect(): void {
    if (this.isConnected) {
      console.log("Disconnecting from database");
      this.isConnected = false;
    }
  }

  public query(sql: string): void {
    if (this.isConnected) {
      console.log(`Executing query: ${sql}`);
    } else {
      console.log("Not connected to database");
    }
  }
}

// シングルトンの使用
let db1 = DatabaseConnection.getInstance("postgres://localhost:5432/mydb");
let db2 = DatabaseConnection.getInstance(); // 同じインスタンスを取得

db1.connect(); // "Connecting to database: postgres://localhost:5432/mydb"
db2.query("SELECT * FROM users"); // "Executing query: SELECT * FROM users"

console.log(db1 === db2); // true
```

## ジェネリッククラス

### 基本的なジェネリッククラス

```typescript
// ジェネリックスタッククラス
class Stack<T> {
  private items: T[] = [];

  public push(item: T): void {
    this.items.push(item);
  }

  public pop(): T | undefined {
    return this.items.pop();
  }

  public peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public clear(): void {
    this.items = [];
  }
}

// 使用例
let numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
numberStack.push(3);

console.log(numberStack.pop()); // 3
console.log(numberStack.peek()); // 2

let stringStack = new Stack<string>();
stringStack.push("hello");
stringStack.push("world");

console.log(stringStack.pop()); // "world"
```

### 制約付きジェネリッククラス

```typescript
// 制約付きジェネリッククラス
interface Comparable<T> {
  compareTo(other: T): number;
}

class SortedList<T extends Comparable<T>> {
  private items: T[] = [];

  public add(item: T): void {
    this.items.push(item);
    this.items.sort((a, b) => a.compareTo(b));
  }

  public remove(item: T): boolean {
    const index = this.items.findIndex(i => i.compareTo(item) === 0);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }

  public getItems(): T[] {
    return [...this.items];
  }
}

// 実装例
class Person implements Comparable<Person> {
  constructor(public name: string, public age: number) {}

  compareTo(other: Person): number {
    return this.age - other.age;
  }
}

let personList = new SortedList<Person>();
personList.add(new Person("Alice", 25));
personList.add(new Person("Bob", 30));
personList.add(new Person("Charlie", 20));

console.log(personList.getItems().map(p => `${p.name} (${p.age})`));
// ["Charlie (20)", "Alice (25)", "Bob (30)"]
```

## デコレータ

### クラスデコレータ

```typescript
// 基本的なクラスデコレータ
function logClass(constructor: Function) {
  console.log(`Class ${constructor.name} is being created`);
}

function seal(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

@logClass
@seal
class Example {
  constructor() {
    console.log("Example instance created");
  }
}

// デコレータファクトリ
function configurable(value: boolean) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.configurable = value;
  };
}

class Point {
  private _x: number;
  private _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  @configurable(false)
  get x() { return this._x; }

  @configurable(false)
  get y() { return this._y; }
}
```

## 練習問題

### 問題1
1. 基本的なクラスを作成してください：
   - プロパティ、コンストラクタ、メソッドを持つクラス
   - アクセス修飾子の使用
   - ゲッターとセッター

### 問題2
1. 継承を実装してください：
   - 基底クラスと派生クラス
   - メソッドのオーバーライド
   - 抽象クラスの使用

### 問題3
1. 高度なクラス機能を活用してください：
   - インターフェースの実装
   - 静的メンバー
   - ジェネリッククラス

## まとめ

- クラスの基本概念と構造
- アクセス修飾子とカプセル化
- 継承とポリモーフィズム
- 抽象クラスとインターフェース実装
- 静的メンバーとシングルトンパターン
- ジェネリッククラスとデコレータ

---

**前の章**: [[04-interfaces|インターフェース]]
**次の章**: [[06-functions|関数とジェネリクス]] 