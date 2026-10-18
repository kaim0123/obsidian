# インターフェース

## 目次
- [[03-types|← 前章: 型システムの詳細]]
- [[05-classes|次章: クラス →]]

## インターフェースの基礎

### 基本的なインターフェース

**インターフェース**はオブジェクトの構造を定義する型です。

```typescript
// 基本的なインターフェース
interface Person {
  name: string;
  age: number;
  email?: string; // オプショナルプロパティ
}

// インターフェースの使用
let person: Person = {
  name: "John Doe",
  age: 30
  // emailはオプショナルなので省略可能
};

// 関数パラメータでの使用
function greet(person: Person): string {
  return `Hello, ${person.name}!`;
}

// 関数の戻り値での使用
function createPerson(name: string, age: number): Person {
  return {
    name,
    age
  };
}
```

### 読み取り専用プロパティ

```typescript
interface User {
  readonly id: number;
  name: string;
  readonly createdAt: Date;
}

let user: User = {
  id: 1,
  name: "Alice",
  createdAt: new Date()
};

// user.id = 2; // エラー！読み取り専用
user.name = "Bob"; // 有効
// user.createdAt = new Date(); // エラー！読み取り専用
```

### 関数型インターフェース

```typescript
// 関数型の定義
interface SearchFunc {
  (source: string, subString: string): boolean;
}

// 関数型インターフェースの実装
let mySearch: SearchFunc = function(source: string, subString: string): boolean {
  return source.indexOf(subString) > -1;
};

// パラメータ名は異なっても構わない
let anotherSearch: SearchFunc = function(src: string, sub: string): boolean {
  return src.includes(sub);
};

// アロー関数での実装
let arrowSearch: SearchFunc = (source, subString) => source.includes(subString);
```

### インデックス可能なインターフェース

```typescript
// 文字列インデックス
interface StringArray {
  [index: number]: string;
}

let myArray: StringArray = ["apple", "banana", "orange"];
let firstItem: string = myArray[0];

// 文字列キー
interface Dictionary {
  [key: string]: number;
}

let scores: Dictionary = {
  "Alice": 95,
  "Bob": 87,
  "Charlie": 92
};

// 読み取り専用インデックス
interface ReadonlyStringArray {
  readonly [index: number]: string;
}

let readonlyArray: ReadonlyStringArray = ["a", "b", "c"];
// readonlyArray[0] = "x"; // エラー！
```

## インターフェースの拡張

### インターフェースの継承

```typescript
// 基本インターフェース
interface Shape {
  color: string;
}

// インターフェースの継承
interface Square extends Shape {
  sideLength: number;
}

// 複数のインターフェースを継承
interface Circle extends Shape {
  radius: number;
}

interface ColoredCircle extends Circle {
  borderColor: string;
}

// 実装
let square: Square = {
  color: "red",
  sideLength: 10
};

let coloredCircle: ColoredCircle = {
  color: "blue",
  radius: 5,
  borderColor: "black"
};
```

### インターフェースの合成

```typescript
interface Drawable {
  draw(): void;
}

interface Scalable {
  scale(factor: number): void;
}

// 複数のインターフェースを継承
interface DrawableShape extends Shape, Drawable, Scalable {
  area(): number;
}

// 実装例
class Rectangle implements DrawableShape {
  constructor(
    public color: string,
    public width: number,
    public height: number
  ) {}

  draw(): void {
    console.log(`Drawing a ${this.color} rectangle`);
  }

  scale(factor: number): void {
    this.width *= factor;
    this.height *= factor;
  }

  area(): number {
    return this.width * this.height;
  }
}
```

## 高度なインターフェース機能

### オプショナルプロパティ

```typescript
interface Config {
  host: string;
  port: number;
  username?: string;
  password?: string;
  timeout?: number;
}

// すべてのオプショナルプロパティを省略
let config1: Config = {
  host: "localhost",
  port: 3000
};

// 一部のオプショナルプロパティを指定
let config2: Config = {
  host: "example.com",
  port: 8080,
  username: "admin",
  timeout: 5000
};
```

### 関数オーバーロード

```typescript
interface Calculator {
  add(a: number, b: number): number;
  add(a: string, b: string): string;
}

// 実装
class SimpleCalculator implements Calculator {
  add(a: number | string, b: number | string): number | string {
    if (typeof a === "number" && typeof b === "number") {
      return a + b;
    } else if (typeof a === "string" && typeof b === "string") {
      return a + b;
    }
    throw new Error("Invalid arguments");
  }
}
```

### ハイブリッド型

```typescript
// 関数とオブジェクトの両方の性質を持つ
interface Counter {
  (start: number): string;
  interval: number;
  reset(): void;
}

// 実装
function createCounter(): Counter {
  let counter = function(start: number): string {
    return `Counter started at ${start}`;
  } as Counter;
  
  counter.interval = 123;
  counter.reset = function() {
    console.log("Counter reset");
  };
  
  return counter;
}

let c = createCounter();
c(10); // "Counter started at 10"
c.reset();
c.interval = 5.0;
```

## インターフェースとクラス

### クラスでのインターフェース実装

```typescript
interface Vehicle {
  start(): void;
  stop(): void;
  getSpeed(): number;
}

class Car implements Vehicle {
  private speed: number = 0;

  start(): void {
    console.log("Car started");
    this.speed = 0;
  }

  stop(): void {
    console.log("Car stopped");
    this.speed = 0;
  }

  getSpeed(): number {
    return this.speed;
  }

  accelerate(): void {
    this.speed += 10;
  }
}

class Motorcycle implements Vehicle {
  private speed: number = 0;

  start(): void {
    console.log("Motorcycle started");
    this.speed = 0;
  }

  stop(): void {
    console.log("Motorcycle stopped");
    this.speed = 0;
  }

  getSpeed(): number {
    return this.speed;
  }

  wheelie(): void {
    console.log("Doing a wheelie!");
  }
}
```

### 静的メンバーとインターフェース

```typescript
interface Constructor {
  new (name: string): Instance;
}

interface Instance {
  name: string;
  greet(): void;
}

// コンストラクタ関数の型
interface ClockConstructor {
  new (hour: number, minute: number): ClockInterface;
}

interface ClockInterface {
  tick(): void;
}

// 実装
class DigitalClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log("beep beep");
  }
}

class AnalogClock implements ClockInterface {
  constructor(h: number, m: number) {}
  tick() {
    console.log("tick tock");
  }
}

function createClock(ctor: ClockConstructor, hour: number, minute: number): ClockInterface {
  return new ctor(hour, minute);
}

let digital = createClock(DigitalClock, 12, 17);
let analog = createClock(AnalogClock, 7, 32);
```

## インターフェースの実践的な使用

### APIレスポンスの型定義

```typescript
// APIレスポンスの型定義
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  publishedAt: Date;
}

// 使用例
async function fetchUser(id: number): Promise<ApiResponse<User>> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const data = await response.json();
    
    return {
      success: true,
      data: data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date()
    };
  }
}

async function fetchPosts(): Promise<ApiResponse<Post[]>> {
  try {
    const response = await fetch("/api/posts");
    const data = await response.json();
    
    return {
      success: true,
      data: data,
      timestamp: new Date()
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date()
    };
  }
}
```

### イベントハンドラーの型定義

```typescript
// DOMイベントの型定義
interface MouseEvent {
  clientX: number;
  clientY: number;
  button: number;
  preventDefault(): void;
}

interface KeyboardEvent {
  key: string;
  keyCode: number;
  ctrlKey: boolean;
  shiftKey: boolean;
  preventDefault(): void;
}

// イベントハンドラーの型定義
interface EventHandlers {
  onClick?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  onMouseMove?: (event: MouseEvent) => void;
}

// コンポーネントの型定義
interface Component {
  id: string;
  element: HTMLElement;
  eventHandlers: EventHandlers;
  render(): void;
  destroy(): void;
}

// 実装例
class Button implements Component {
  constructor(
    public id: string,
    public element: HTMLElement,
    public eventHandlers: EventHandlers
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (this.eventHandlers.onClick) {
      this.element.addEventListener("click", this.eventHandlers.onClick);
    }
  }

  render(): void {
    console.log(`Rendering button: ${this.id}`);
  }

  destroy(): void {
    console.log(`Destroying button: ${this.id}`);
  }
}
```

### 設定オブジェクトの型定義

```typescript
// データベース設定
interface DatabaseConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  ssl?: boolean;
  connectionTimeout?: number;
}

// アプリケーション設定
interface AppConfig {
  port: number;
  environment: "development" | "production" | "test";
  database: DatabaseConfig;
  cors?: {
    origin: string[];
    credentials: boolean;
  };
  logging?: {
    level: "debug" | "info" | "warn" | "error";
    file?: string;
  };
}

// 設定の使用
function createApp(config: AppConfig): void {
  console.log(`Starting app on port ${config.port}`);
  console.log(`Environment: ${config.environment}`);
  console.log(`Database: ${config.database.host}:${config.database.port}`);
}

// 設定オブジェクトの作成
const appConfig: AppConfig = {
  port: 3000,
  environment: "development",
  database: {
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "password",
    database: "myapp"
  },
  cors: {
    origin: ["http://localhost:3000"],
    credentials: true
  },
  logging: {
    level: "debug"
  }
};

createApp(appConfig);
```

## インターフェースと型エイリアスの比較

### 型エイリアス

```typescript
// 型エイリアスでの定義
type Person = {
  name: string;
  age: number;
  email?: string;
};

// ユニオン型
type Status = "pending" | "approved" | "rejected";

// 関数型
type SearchFunction = (source: string, subString: string) => boolean;

// プリミティブ型のエイリアス
type UserId = string;
type Timestamp = number;
```

### インターフェース vs 型エイリアス

| 特徴 | インターフェース | 型エイリアス |
|------|------------------|--------------|
| 拡張性 | 宣言のマージが可能 | 宣言のマージ不可 |
| ユニオン型 | 直接サポートなし | 直接サポート |
| プリミティブ型 | サポートなし | サポート |
| 計算型 | サポートなし | サポート |
| パフォーマンス | 軽量 | 軽量 |

### 宣言のマージ

```typescript
// インターフェースの宣言のマージ
interface User {
  name: string;
}

interface User {
  age: number;
}

// 結果: Userは name と age の両方を持つ
let user: User = {
  name: "John",
  age: 30
};

// 型エイリアスでは宣言のマージはできない
type Person = {
  name: string;
};

// エラー！重複した宣言
// type Person = {
//   age: number;
// };
```

## 練習問題

### 問題1
1. 基本的なインターフェースを作成してください：
   - オブジェクトの構造を定義するインターフェース
   - 関数型インターフェース
   - 読み取り専用プロパティ

### 問題2
1. インターフェースの拡張を実装してください：
   - インターフェースの継承
   - 複数のインターフェースの継承
   - クラスでのインターフェース実装

### 問題3
1. 実践的なインターフェースを作成してください：
   - APIレスポンスの型定義
   - イベントハンドラーの型定義
   - 設定オブジェクトの型定義

## まとめ

- インターフェースの基本概念と使用方法
- オプショナルプロパティと読み取り専用プロパティ
- インターフェースの継承と合成
- クラスでのインターフェース実装
- 実践的なインターフェースの活用
- インターフェースと型エイリアスの比較

---

**前の章**: [[03-types|型システムの詳細]]
**次の章**: [[05-classes|クラス]] 