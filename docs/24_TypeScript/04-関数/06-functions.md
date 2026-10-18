# 関数とジェネリクス

## 目次
- [[05-classes|← 前章: クラス]]
- [[07-modules|次章: モジュールシステム →]]

## 関数の詳細

### 関数の型注釈

```typescript
// 基本的な関数型注釈
function add(a: number, b: number): number {
  return a + b;
}

// アロー関数の型注釈
const multiply = (a: number, b: number): number => {
  return a * b;
};

// 関数式の型注釈
const divide: (a: number, b: number) => number = function(a, b) {
  return a / b;
};

// 関数型の定義
type MathFunction = (a: number, b: number) => number;

const subtract: MathFunction = (a, b) => a - b;
const power: MathFunction = (a, b) => Math.pow(a, b);
```

### オプショナルパラメータとデフォルトパラメータ

```typescript
// オプショナルパラメータ
function createUser(name: string, age?: number): string {
  if (age) {
    return `User ${name} is ${age} years old`;
  }
  return `User ${name}`;
}

// デフォルトパラメータ
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}

// 複数のデフォルトパラメータ
function createConfig(
  host: string = "localhost",
  port: number = 3000,
  protocol: string = "http"
): string {
  return `${protocol}://${host}:${port}`;
}

// オプショナルとデフォルトの組み合わせ
function processData(
  data: any,
  options?: {
    format?: string;
    encoding?: string;
  },
  callback?: (result: any) => void
): void {
  const format = options?.format || "json";
  const encoding = options?.encoding || "utf8";
  
  console.log(`Processing data with format: ${format}, encoding: ${encoding}`);
  
  if (callback) {
    callback({ success: true, data });
  }
}
```

### レストパラメータ

```typescript
// レストパラメータ
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}

function createArray<T>(...items: T[]): T[] {
  return items;
}

// レストパラメータと通常のパラメータの組み合わせ
function formatMessage(prefix: string, ...messages: string[]): string {
  return `${prefix}: ${messages.join(", ")}`;
}

// タプル型でのレストパラメータ
function processTuple(...args: [string, number, boolean]): void {
  const [name, age, isActive] = args;
  console.log(`Name: ${name}, Age: ${age}, Active: ${isActive}`);
}

// 使用例
console.log(sum(1, 2, 3, 4, 5)); // 15
console.log(createArray("a", "b", "c")); // ["a", "b", "c"]
console.log(formatMessage("INFO", "User logged in", "Session created")); // "INFO: User logged in, Session created"
processTuple("Alice", 25, true); // "Name: Alice, Age: 25, Active: true"
```

### 関数オーバーロード

```typescript
// 関数オーバーロードの宣言
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;
function combine(a: string[], b: string[]): string[];
function combine(a: any, b: any): any {
  if (typeof a === "string" && typeof b === "string") {
    return a + b;
  } else if (typeof a === "number" && typeof b === "number") {
    return a + b;
  } else if (Array.isArray(a) && Array.isArray(b)) {
    return [...a, ...b];
  }
  throw new Error("Invalid arguments");
}

// 使用例
console.log(combine("Hello", "World")); // "HelloWorld"
console.log(combine(5, 3)); // 8
console.log(combine(["a", "b"], ["c", "d"])); // ["a", "b", "c", "d"]

// クラスメソッドでのオーバーロード
class Calculator {
  add(a: string, b: string): string;
  add(a: number, b: number): number;
  add(a: any, b: any): any {
    if (typeof a === "string" && typeof b === "string") {
      return a + b;
    } else if (typeof a === "number" && typeof b === "number") {
      return a + b;
    }
    throw new Error("Invalid arguments");
  }
}
```

## 高度な関数型

### 関数型の詳細

```typescript
// 基本的な関数型
type SimpleFunction = () => void;
type StringFunction = (str: string) => string;
type NumberFunction = (num: number) => number;

// 複雑な関数型
type CallbackFunction<T> = (error: Error | null, result?: T) => void;
type AsyncFunction<T> = (...args: any[]) => Promise<T>;
type EventHandler<T> = (event: T) => void;

// 関数型の使用例
const noop: SimpleFunction = () => {};
const toUpperCase: StringFunction = (str) => str.toUpperCase();
const double: NumberFunction = (num) => num * 2;

// コールバック関数の例
function fetchData(callback: CallbackFunction<string>): void {
  setTimeout(() => {
    const success = Math.random() > 0.5;
    if (success) {
      callback(null, "Data fetched successfully");
    } else {
      callback(new Error("Failed to fetch data"));
    }
  }, 1000);
}

// 使用例
fetchData((error, result) => {
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Result:", result);
  }
});
```

### 高階関数

```typescript
// 高階関数：関数を引数として受け取る関数
function map<T, U>(array: T[], transform: (item: T) => U): U[] {
  return array.map(transform);
}

function filter<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter(predicate);
}

function reduce<T, U>(array: T[], reducer: (acc: U, item: T) => U, initial: U): U {
  return array.reduce(reducer, initial);
}

// 高階関数：関数を返す関数
function createMultiplier(factor: number): (value: number) => number {
  return (value: number) => value * factor;
}

function createGreeter(greeting: string): (name: string) => string {
  return (name: string) => `${greeting}, ${name}!`;
}

// 使用例
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, x => x * 2);
const evens = filter(numbers, x => x % 2 === 0);
const sum = reduce(numbers, (acc, x) => acc + x, 0);

const double = createMultiplier(2);
const triple = createMultiplier(3);
const sayHello = createGreeter("Hello");
const sayGoodbye = createGreeter("Goodbye");

console.log(doubled); // [2, 4, 6, 8, 10]
console.log(evens); // [2, 4]
console.log(sum); // 15
console.log(double(5)); // 10
console.log(triple(5)); // 15
console.log(sayHello("Alice")); // "Hello, Alice!"
```

## ジェネリクス

### 基本的なジェネリクス

```typescript
// ジェネリック関数
function identity<T>(arg: T): T {
  return arg;
}

function firstElement<T>(array: T[]): T | undefined {
  return array[0];
}

function lastElement<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

// 複数の型パラメータ
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// 使用例
let result1 = identity<string>("hello");
let result2 = identity(42); // 型推論
let first = firstElement([1, 2, 3, 4, 5]);
let last = lastElement(["a", "b", "c"]);
let pairResult = pair("hello", 42);
let merged = merge({ name: "Alice" }, { age: 25 });
```

### ジェネリック制約

```typescript
// 基本的な制約
function getLength<T extends { length: number }>(arg: T): number {
  return arg.length;
}

// 複数の制約
function combineAndLength<T extends string | number, U extends string | number>(
  a: T,
  b: U
): number {
  return String(a).length + String(b).length;
}

// インターフェースによる制約
interface HasId {
  id: number;
}

interface HasName {
  name: string;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

function findByName<T extends HasName>(items: T[], name: string): T | undefined {
  return items.find(item => item.name === name);
}

// 使用例
console.log(getLength("hello")); // 5
console.log(getLength([1, 2, 3, 4, 5])); // 5
console.log(combineAndLength("hello", 42)); // 7

interface User {
  id: number;
  name: string;
  email: string;
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];

const userById = findById(users, 1);
const userByName = findByName(users, "Bob");
```

### デフォルト型パラメータ

```typescript
// デフォルト型パラメータ
function createArray<T = string>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

function createContainer<T = any>(value: T): { value: T } {
  return { value };
}

// 複数のデフォルト型パラメータ
function createPair<T = string, U = number>(first: T, second: U): [T, U] {
  return [first, second];
}

// 使用例
let stringArray = createArray(3, "hello");
let numberArray = createArray<number>(3, 42);
let container = createContainer("test");
let pair = createPair("hello", 42);
```

## 高度なジェネリクス

### 条件付き型

```typescript
// 条件付き型
type NonNullable<T> = T extends null | undefined ? never : T;
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 条件付き型の使用例
type T0 = NonNullable<string | number | null>; // string | number
type T1 = ReturnType<() => string>; // string
type T2 = Parameters<(a: number, b: string) => void>; // [number, string]

// 分配条件付き型
type ToArray<T> = T extends any ? T[] : never;
type T3 = ToArray<string | number>; // string[] | number[]

// 分配を防ぐ
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type T4 = ToArrayNonDist<string | number>; // (string | number)[]
```

### マップ型とジェネリクス

```typescript
// ジェネリックマップ型
type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 使用例
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
type UserName = Pick<User, "name">;
type UserWithoutId = Omit<User, "id">;
```

### ユーティリティ型

```typescript
// カスタムユーティリティ型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

// 使用例
interface ComplexObject {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
  greet(): void;
}

type DeepPartialComplex = DeepPartial<ComplexObject>;
type DeepReadonlyComplex = DeepReadonly<ComplexObject>;
type FunctionProps = FunctionPropertyNames<ComplexObject>; // "greet"
type NonFunctionProps = NonFunctionPropertyNames<ComplexObject>; // "name" | "age" | "address"
```

## 実践的な例

### APIクライアント

```typescript
// APIクライアントのジェネリック実装
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      message: response.statusText
    };
  }

  async post<T, U>(endpoint: string, body: T): Promise<ApiResponse<U>> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      message: response.statusText
    };
  }
}

// 使用例
interface User {
  id: number;
  name: string;
  email: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
}

const apiClient = new ApiClient("https://api.example.com");

// GETリクエスト
const getUser = async (id: number) => {
  const response = await apiClient.get<User>(`/users/${id}`);
  return response.data;
};

// POSTリクエスト
const createUser = async (userData: CreateUserRequest) => {
  const response = await apiClient.post<CreateUserRequest, User>("/users", userData);
  return response.data;
};
```

### イベントシステム

```typescript
// イベントシステムのジェネリック実装
type EventHandler<T = any> = (data: T) => void;

class EventEmitter {
  private events: Map<string, EventHandler[]> = new Map();

  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.events.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<T>(event: string, data: T): void {
    const handlers = this.events.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }
}

// 使用例
interface UserEvent {
  userId: number;
  action: string;
  timestamp: Date;
}

interface SystemEvent {
  level: "info" | "warning" | "error";
  message: string;
}

const eventEmitter = new EventEmitter();

// イベントハンドラーの登録
eventEmitter.on<UserEvent>("userAction", (data) => {
  console.log(`User ${data.userId} performed ${data.action} at ${data.timestamp}`);
});

eventEmitter.on<SystemEvent>("systemLog", (data) => {
  console.log(`[${data.level.toUpperCase()}] ${data.message}`);
});

// イベントの発行
eventEmitter.emit<UserEvent>("userAction", {
  userId: 123,
  action: "login",
  timestamp: new Date()
});

eventEmitter.emit<SystemEvent>("systemLog", {
  level: "info",
  message: "Application started"
});
```

## 練習問題

### 問題1
1. 基本的な関数とジェネリクスを作成してください：
   - 型注釈付きの関数
   - オプショナルパラメータとデフォルトパラメータ
   - 基本的なジェネリック関数

### 問題2
1. 高度な関数型を実装してください：
   - 高階関数
   - 関数オーバーロード
   - コールバック関数

### 問題3
1. 実践的なジェネリクスを活用してください：
   - 条件付き型
   - ユーティリティ型
   - 実用的なジェネリッククラス

## まとめ

- 関数の型注釈とオーバーロード
- オプショナルパラメータとレストパラメータ
- 高階関数とコールバック関数
- ジェネリクスの基本概念と制約
- 条件付き型とマップ型
- 実践的なジェネリクスの活用

---

**前の章**: [[05-classes|クラス]]
**次の章**: [[07-modules|モジュールシステム]] 