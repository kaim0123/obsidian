# TypeScriptの基礎

## 目次
- [[00-TypeScript index|← 目次に戻る]]
- [[TypeScript 1/02-setup|次章: 開発環境の構築 →]]

## TypeScriptとは？

### 基本的な概念

**TypeScript**
- JavaScriptのスーパーセット（上位互換）
- 静的型チェック機能を追加
- コンパイル時にJavaScriptに変換
- Microsoftが開発・メンテナンス
- オープンソースプロジェクト

### JavaScriptとの関係

```javascript
// JavaScript
function add(a, b) {
  return a + b;
}

console.log(add(5, 3)); // 8
console.log(add("5", 3)); // "53" (予期しない結果)
```

```typescript
// TypeScript
function add(a: number, b: number): number {
  return a + b;
}

console.log(add(5, 3)); // 8
console.log(add("5", 3)); // コンパイルエラー！
```

### TypeScriptの利点

1. **型安全性**
   - コンパイル時にエラーを検出
   - ランタイムエラーの削減
   - 予期しない動作の防止

2. **開発効率**
   - IDEの強力なサポート
   - 自動補完とリファクタリング
   - リアルタイムエラー検出

3. **保守性**
   - コードの可読性向上
   - ドキュメントとしての型定義
   - 大規模プロジェクトでの管理

## 基本的な型システム

### プリミティブ型

```typescript
// 文字列
let name: string = "John Doe";
let message: string = `Hello, ${name}!`;

// 数値
let age: number = 25;
let price: number = 19.99;
let binary: number = 0b1010; // 2進数
let hex: number = 0xFF; // 16進数

// 真偽値
let isActive: boolean = true;
let isCompleted: boolean = false;

// null と undefined
let nullValue: null = null;
let undefinedValue: undefined = undefined;

// Symbol
let symbol: symbol = Symbol("unique");

// BigInt
let bigNumber: bigint = 100n;
```

### 型推論

```typescript
// TypeScriptは型を自動推論する
let message = "Hello World"; // string型と推論
let count = 42; // number型と推論
let isVisible = true; // boolean型と推論

// 配列の型推論
let numbers = [1, 2, 3, 4, 5]; // number[]型と推論
let names = ["Alice", "Bob", "Charlie"]; // string[]型と推論
```

### 明示的な型注釈

```typescript
// 変数の型注釈
let username: string = "john_doe";
let userAge: number = 30;
let isLoggedIn: boolean = false;

// 配列の型注釈
let scores: number[] = [85, 92, 78, 96];
let colors: Array<string> = ["red", "green", "blue"];

// オブジェクトの型注釈
let person: {
  name: string;
  age: number;
  email?: string; // オプショナルプロパティ
} = {
  name: "Jane Smith",
  age: 28
};
```

## 関数と型

### 基本的な関数

```typescript
// 関数の型注釈
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// アロー関数
const multiply = (a: number, b: number): number => {
  return a * b;
};

// 関数式
const divide: (a: number, b: number) => number = function(a, b) {
  return a / b;
};

// オプショナルパラメータ
function createUser(name: string, age?: number): string {
  if (age) {
    return `User ${name} is ${age} years old`;
  }
  return `User ${name}`;
}

// デフォルトパラメータ
function setConfig(host: string, port: number = 3000): void {
  console.log(`Server running on ${host}:${port}`);
}

// レストパラメータ
function sum(...numbers: number[]): number {
  return numbers.reduce((total, num) => total + num, 0);
}
```

### 関数の型定義

```typescript
// 関数型の定義
type MathFunction = (a: number, b: number) => number;

// 関数型の使用
const add: MathFunction = (a, b) => a + b;
const subtract: MathFunction = (a, b) => a - b;

// 関数型の配列
const operations: MathFunction[] = [add, subtract];

// コールバック関数
function processNumbers(numbers: number[], callback: (num: number) => number): number[] {
  return numbers.map(callback);
}

const doubled = processNumbers([1, 2, 3], (num) => num * 2);
```

## 配列とタプル

### 配列

```typescript
// 配列の型定義
let numbers: number[] = [1, 2, 3, 4, 5];
let strings: Array<string> = ["apple", "banana", "orange"];

// 読み取り専用配列
let readonlyNumbers: readonly number[] = [1, 2, 3];
// readonlyNumbers.push(4); // エラー！

// ユニオン型の配列
let mixed: (string | number)[] = ["hello", 42, "world", 100];

// ジェネリック配列
let genericArray: Array<string | number> = ["a", 1, "b", 2];
```

### タプル

```typescript
// タプルの定義
let coordinates: [number, number] = [10, 20];
let personInfo: [string, number, boolean] = ["John", 30, true];

// タプルの使用
function getCoordinates(): [number, number] {
  return [Math.random() * 100, Math.random() * 100];
}

let [x, y] = getCoordinates();

// オプショナル要素を持つタプル
let optionalTuple: [string, number?] = ["hello"];
let optionalTuple2: [string, number?] = ["hello", 42];

// レスト要素を持つタプル
let restTuple: [string, ...number[]] = ["scores", 85, 92, 78];
```

## オブジェクト型

### 基本的なオブジェクト

```typescript
// オブジェクトの型定義
let user: {
  name: string;
  age: number;
  email?: string;
} = {
  name: "Alice",
  age: 25
};

// 読み取り専用プロパティ
let config: {
  readonly apiUrl: string;
  readonly timeout: number;
} = {
  apiUrl: "https://api.example.com",
  timeout: 5000
};

// インデックスシグネチャ
let dictionary: { [key: string]: number } = {
  "apple": 1,
  "banana": 2,
  "orange": 3
};

// 関数プロパティ
let calculator: {
  add: (a: number, b: number) => number;
  subtract: (a: number, b: number) => number;
} = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};
```

### 型エイリアス

```typescript
// 型エイリアスの定義
type Point = {
  x: number;
  y: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  age?: number;
};

// 型エイリアスの使用
let point: Point = { x: 10, y: 20 };
let user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

// ユニオン型
type Status = "pending" | "approved" | "rejected";
type ID = string | number;

// 交差型
type Employee = User & {
  department: string;
  salary: number;
};
```

## 制御フロー

### 条件分岐

```typescript
// if文
function checkAge(age: number): string {
  if (age >= 18) {
    return "Adult";
  } else if (age >= 13) {
    return "Teenager";
  } else {
    return "Child";
  }
}

// switch文
function getDayName(day: number): string {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case 6:
      return "Saturday";
    default:
      return "Invalid day";
  }
}
```

### ループ

```typescript
// for文
function sumArray(numbers: number[]): number {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}

// for...of文
function findMax(numbers: number[]): number {
  let max = numbers[0];
  for (const num of numbers) {
    if (num > max) {
      max = num;
    }
  }
  return max;
}

// for...in文
function getObjectKeys(obj: object): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    keys.push(key);
  }
  return keys;
}

// while文
function countDown(start: number): void {
  let count = start;
  while (count > 0) {
    console.log(count);
    count--;
  }
  console.log("Blast off!");
}
```

## エラーハンドリング

### try-catch文

```typescript
// 基本的なエラーハンドリング
function divideNumbers(a: number, b: number): number {
  try {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    return a / b;
  } catch (error) {
    console.error("Error:", error.message);
    return 0;
  }
}

// カスタムエラー
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

function validateAge(age: number): void {
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be between 0 and 150");
  }
}

// エラーハンドリングの使用
try {
  validateAge(200);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}
```

## 練習問題

### 問題1
1. 基本的な型注釈を練習してください：
   - 文字列、数値、真偽値の変数を定義
   - 配列とオブジェクトの型注釈
   - 関数の型注釈

### 問題2
1. 関数を作成してください：
   - 2つの数値を受け取って合計を返す関数
   - 文字列の配列を受け取って長さを返す関数
   - オプショナルパラメータを使用した関数

### 問題3
1. エラーハンドリングを実装してください：
   - 数値の検証関数
   - カスタムエラークラス
   - try-catch文でのエラー処理

## まとめ

- TypeScriptの基本概念とJavaScriptとの関係
- プリミティブ型と型推論の理解
- 関数と型注釈の使用方法
- 配列、タプル、オブジェクトの型定義
- 制御フローとエラーハンドリング

---

**前の章**: [[00-TypeScript index|目次]]
**次の章**: [[TypeScript 1/02-setup|開発環境の構築]] 