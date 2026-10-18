# 型システムの詳細

## 目次
- [[TypeScript 1/02-setup|← 前章: 開発環境の構築]]
- [[04-interfaces|次章: インターフェース →]]

## 高度な型システム

### ユニオン型（Union Types）

**複数の型のいずれか**を表す型

```typescript
// 基本的なユニオン型
type StringOrNumber = string | number;
let value: StringOrNumber = "hello";
value = 42; // 有効

// 関数の戻り値
function getValue(): string | number {
  return Math.random() > 0.5 ? "success" : 404;
}

// 配列のユニオン型
let mixedArray: (string | number)[] = ["hello", 42, "world", 100];

// オブジェクトのユニオン型
type SuccessResponse = {
  status: "success";
  data: any;
};

type ErrorResponse = {
  status: "error";
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function handleResponse(response: ApiResponse): void {
  if (response.status === "success") {
    console.log("Data:", response.data);
  } else {
    console.error("Error:", response.message);
  }
}
```

### 交差型（Intersection Types）

**複数の型のすべて**を満たす型

```typescript
// 基本的な交差型
type Person = {
  name: string;
  age: number;
};

type Employee = {
  id: number;
  department: string;
};

type EmployeePerson = Person & Employee;

let employee: EmployeePerson = {
  name: "John",
  age: 30,
  id: 12345,
  department: "Engineering"
};

// 関数型の交差
type Callable = {
  (): string;
};

type Newable = {
  new (): string;
};

type CallableAndNewable = Callable & Newable;

// ユーティリティ型との組み合わせ
type PartialPerson = Partial<Person>;
type RequiredPerson = Required<Person>;
type ReadonlyPerson = Readonly<Person>;
```

### リテラル型（Literal Types）

**特定の値**のみを取る型

```typescript
// 文字列リテラル型
type Direction = "north" | "south" | "east" | "west";
let direction: Direction = "north";
// direction = "up"; // エラー！

// 数値リテラル型
type DiceRoll = 1 | 2 | 3 | 4 | 5 | 6;
let roll: DiceRoll = 3;

// 真偽値リテラル型
type ToggleState = true | false;
let isEnabled: ToggleState = true;

// オブジェクトリテラル型
type Config = {
  theme: "light" | "dark";
  language: "en" | "ja" | "zh";
  notifications: boolean;
};

let config: Config = {
  theme: "dark",
  language: "ja",
  notifications: true
};
```

### 型ガード（Type Guards）

**実行時に型をチェック**する方法

```typescript
// typeof による型ガード
function processValue(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  } else {
    return value.toString();
  }
}

// instanceof による型ガード
class Animal {
  name: string;
  constructor(name: string) {
    this.name = name;
  }
}

class Dog extends Animal {
  bark(): void {
    console.log("Woof!");
  }
}

class Cat extends Animal {
  meow(): void {
    console.log("Meow!");
  }
}

function makeSound(animal: Animal): void {
  if (animal instanceof Dog) {
    animal.bark();
  } else if (animal instanceof Cat) {
    animal.meow();
  }
}

// カスタム型ガード
function isString(value: any): value is string {
  return typeof value === "string";
}

function isNumber(value: any): value is number {
  return typeof value === "number" && !isNaN(value);
}

function processData(data: any): void {
  if (isString(data)) {
    console.log("String:", data.toUpperCase());
  } else if (isNumber(data)) {
    console.log("Number:", data.toFixed(2));
  }
}

// in 演算子による型ガード
type Bird = {
  fly(): void;
  layEggs(): void;
};

type Fish = {
  swim(): void;
  layEggs(): void;
};

function move(animal: Bird | Fish): void {
  if ("fly" in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

## 条件付き型（Conditional Types）

### 基本的な条件付き型

```typescript
// 基本的な条件付き型
type NonNullable<T> = T extends null | undefined ? never : T;

type T0 = NonNullable<string | number | null>; // string | number
type T1 = NonNullable<string[] | null | undefined>; // string[]

// 条件付き型のチェーン
type TypeName<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends Function
  ? "function"
  : "object";

type T2 = TypeName<string>; // "string"
type T3 = TypeName<number>; // "number"
type T4 = TypeName<boolean>; // "boolean"
type T5 = TypeName<() => void>; // "function"
type T6 = TypeName<{ a: number }>; // "object"
```

### 分配条件付き型（Distributive Conditional Types）

```typescript
// 分配条件付き型
type ToArray<T> = T extends any ? T[] : never;

type T7 = ToArray<string | number>; // string[] | number[]

// 分配を防ぐ方法
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type T8 = ToArrayNonDist<string | number>; // (string | number)[]

// 実用的な例
type Extract<T, U> = T extends U ? T : never;
type Exclude<T, U> = T extends U ? never : T;

type T9 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T10 = Exclude<"a" | "b" | "c", "a" | "f">; // "b" | "c"
```

## マップ型（Mapped Types）

### 基本的なマップ型

```typescript
// すべてのプロパティを読み取り専用にする
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// すべてのプロパティをオプショナルにする
type Partial<T> = {
  [P in keyof T]?: T[P];
};

// すべてのプロパティを必須にする
type Required<T> = {
  [P in keyof T]-?: T[P];
};

// すべてのプロパティを読み取り専用から削除
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// 実用的な例
interface User {
  id: number;
  name: string;
  email: string;
}

type ReadonlyUser = Readonly<User>;
type PartialUser = Partial<User>;
type RequiredUser = Required<User>;
```

### 高度なマップ型

```typescript
// プロパティ名の変換
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

type Setters<T> = {
  [P in keyof T as `set${Capitalize<string & P>}`]: (value: T[P]) => void;
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// {
//   getName: () => string;
//   getAge: () => number;
// }

type PersonSetters = Setters<Person>;
// {
//   setName: (value: string) => void;
//   setAge: (value: number) => void;
// }

// 条件付きマップ型
type ConditionalProps<T> = {
  [P in keyof T]: T[P] extends string ? T[P] : never;
};

interface Mixed {
  name: string;
  age: number;
  email: string;
  id: number;
}

type StringProps = ConditionalProps<Mixed>;
// {
//   name: string;
//   age: never;
//   email: string;
//   id: never;
// }
```

## テンプレートリテラル型（Template Literal Types）

### 基本的なテンプレートリテラル型

```typescript
// 文字列の組み合わせ
type Greeting = "Hello" | "Hi" | "Good morning";
type Name = "Alice" | "Bob" | "Charlie";
type GreetingMessage = `${Greeting}, ${Name}!`;

let message: GreetingMessage = "Hello, Alice!";
// let invalidMessage: GreetingMessage = "Hello, David!"; // エラー！

// 関数名の生成
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiEndpoint = "users" | "posts" | "comments";
type ApiUrl = `/${ApiEndpoint}`;
type ApiFunction = `fetch${HttpMethod}${Capitalize<ApiEndpoint>}`;

let functionName: ApiFunction = "fetchGETUsers";
```

### 高度なテンプレートリテラル型

```typescript
// 条件付きテンプレートリテラル型
type EventName<T extends string> = `${T}Changed`;
type PropEventSource<T> = {
  on<K extends string & keyof T>(eventName: `${K}Changed`, callback: (value: T[K]) => void): void;
};

// 実用的な例
interface User {
  name: string;
  age: number;
  email: string;
}

type UserEvents = PropEventSource<User>;

let userEvents: UserEvents = {
  on(eventName, callback) {
    // イベントハンドラーの実装
  }
};

userEvents.on("nameChanged", (name) => console.log("Name changed to:", name));
userEvents.on("ageChanged", (age) => console.log("Age changed to:", age));
```

## インデックスアクセス型（Index Access Types）

### 基本的なインデックスアクセス型

```typescript
// プロパティの型を取得
interface Person {
  name: string;
  age: number;
  address: {
    street: string;
    city: string;
  };
}

type PersonName = Person["name"]; // string
type PersonAge = Person["age"]; // number
type PersonAddress = Person["address"]; // { street: string; city: string; }

// 配列の要素型を取得
type StringArray = string[];
type StringArrayElement = StringArray[number]; // string

type NumberArray = number[];
type NumberArrayElement = NumberArray[number]; // number

// タプルの要素型を取得
type Tuple = [string, number, boolean];
type TupleElement0 = Tuple[0]; // string
type TupleElement1 = Tuple[1]; // number
type TupleElement2 = Tuple[2]; // boolean
```

### 高度なインデックスアクセス型

```typescript
// 条件付きインデックスアクセス型
type ConditionalProperty<T, K extends keyof T> = T[K] extends string ? T[K] : never;

interface MixedObject {
  name: string;
  age: number;
  email: string;
  id: number;
}

type StringProperties = ConditionalProperty<MixedObject, keyof MixedObject>;
// string | never | string | never = string

// ユニオン型でのインデックスアクセス
type UnionObject = { a: string; b: number } | { a: number; b: string };
type UnionProperty = UnionObject["a"]; // string | number

// 配列のインデックスアクセス
type ArrayType = string[];
type ArrayElement = ArrayType[number]; // string

type TupleType = [string, number, boolean];
type TupleElement = TupleType[number]; // string | number | boolean
```

## 型の推論と制約

### 型推論の詳細

```typescript
// 関数の戻り値の型推論
function createUser(name: string, age: number) {
  return {
    name,
    age,
    createdAt: new Date()
  };
}

// 戻り値の型は自動的に推論される
// {
//   name: string;
//   age: number;
//   createdAt: Date;
// }

// 明示的な型注釈
function createUserTyped(name: string, age: number): {
  name: string;
  age: number;
  createdAt: Date;
} {
  return {
    name,
    age,
    createdAt: new Date()
  };
}

// 型推論の制限
function processArray<T>(array: T[]): T {
  return array[0]; // T型が推論される
}

let result = processArray([1, 2, 3]); // number型
let stringResult = processArray(["a", "b", "c"]); // string型
```

### 型制約

```typescript
// 基本的な型制約
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

let user = { name: "John", age: 30 };
let name = getProperty(user, "name"); // string型
let age = getProperty(user, "age"); // number型

// 複数の型制約
interface Lengthwise {
  length: number;
}

function logLength<T extends Lengthwise>(arg: T): T {
  console.log(arg.length);
  return arg;
}

logLength("hello"); // 文字列はlengthプロパティを持つ
logLength([1, 2, 3]); // 配列はlengthプロパティを持つ
// logLength(123); // エラー！数値はlengthプロパティを持たない

// デフォルト型パラメータ
interface DefaultType {
  id: number;
  name: string;
}

function createInstance<T extends DefaultType = DefaultType>(data: Partial<T>): T {
  return {
    id: 0,
    name: "",
    ...data
  } as T;
}
```

## 練習問題

### 問題1
1. ユニオン型と交差型を理解してください：
   - 基本的なユニオン型の作成
   - オブジェクトの交差型の実装
   - 型ガードの使用

### 問題2
1. 条件付き型とマップ型を実装してください：
   - 条件付き型による型変換
   - マップ型によるプロパティ変換
   - テンプレートリテラル型の活用

### 問題3
1. 高度な型システムを活用してください：
   - インデックスアクセス型の使用
   - 型制約の実装
   - 型推論の理解

## まとめ

- ユニオン型と交差型の使い分け
- 型ガードによる実行時型チェック
- 条件付き型とマップ型の活用
- テンプレートリテラル型の応用
- インデックスアクセス型と型制約

---

**前の章**: [[TypeScript 1/02-setup|開発環境の構築]]
**次の章**: [[04-interfaces|インターフェース]] 