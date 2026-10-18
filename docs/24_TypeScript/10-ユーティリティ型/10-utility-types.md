# ユーティリティ型

## 目次
- [[09-decorators|← 前章: デコレータ]]
- [[TypeScript/11-practice|次章: 実践プロジェクト →]]

## ユーティリティ型とは

TypeScriptには、型を柔軟に操作・変換するための「ユーティリティ型」が多数用意されています。これらを活用することで、型安全性を保ちながら効率的に開発できます。

---

## 主なユーティリティ型一覧

### Partial<T>
- すべてのプロパティをオプショナル（省略可能）にする
```typescript
type User = { name: string; age: number };
type PartialUser = Partial<User>; // { name?: string; age?: number }
```

### Required<T>
- すべてのプロパティを必須にする
```typescript
type User = { name?: string; age?: number };
type RequiredUser = Required<User>; // { name: string; age: number }
```

### Readonly<T>
- すべてのプロパティを読み取り専用にする
```typescript
type User = { name: string; age: number };
type ReadonlyUser = Readonly<User>; // { readonly name: string; readonly age: number }
```

### Record<K, T>
- 指定したキーと型でオブジェクト型を生成
```typescript
type Fruit = 'apple' | 'banana' | 'orange';
type FruitStock = Record<Fruit, number>; // { apple: number; banana: number; orange: number }
```

### Pick<T, K>
- 指定したプロパティだけを抽出
```typescript
type User = { id: number; name: string; age: number };
type UserName = Pick<User, 'name'>; // { name: string }
```

### Omit<T, K>
- 指定したプロパティを除外
```typescript
type User = { id: number; name: string; age: number };
type UserWithoutId = Omit<User, 'id'>; // { name: string; age: number }
```

### Exclude<T, U>
- ユニオン型TからUを除外
```typescript
type Status = 'active' | 'inactive' | 'pending';
type NotPending = Exclude<Status, 'pending'>; // 'active' | 'inactive'
```

### Extract<T, U>
- ユニオン型TからUに該当する型だけを抽出
```typescript
type Status = 'active' | 'inactive' | 'pending';
type OnlyActive = Extract<Status, 'active'>; // 'active'
```

### NonNullable<T>
- nullとundefinedを除外
```typescript
type Value = string | number | null | undefined;
type NotNull = NonNullable<Value>; // string | number
```

### ReturnType<T>
- 関数型Tの戻り値の型を取得
```typescript
function getUser() { return { id: 1, name: 'Alice' }; }
type User = ReturnType<typeof getUser>; // { id: number; name: string }
```

### Parameters<T>
- 関数型Tの引数の型をタプルで取得
```typescript
function setUser(name: string, age: number) {}
type Args = Parameters<typeof setUser>; // [string, number]
```

### ConstructorParameters<T>
- コンストラクタの引数型をタプルで取得
```typescript
class Person {
  constructor(public name: string, public age: number) {}
}
type PersonArgs = ConstructorParameters<typeof Person>; // [string, number]
```

### InstanceType<T>
- クラスのインスタンス型を取得
```typescript
class Car {
  constructor(public model: string) {}
}
type CarInstance = InstanceType<typeof Car>; // Car
```

### ThisType<T>
- thisの型を明示的に指定
```typescript
interface Helper {
  log(): void;
}
const obj: ThisType<Helper> = {
  log() {
    console.log('Hello');
  }
};
```

---

## 応用例

### APIレスポンスの型定義
```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<{ id: number; name: string }>;
```

### フォームのバリデーション
```typescript
interface Form {
  name: string;
  email: string;
  age?: number;
}

type FormErrors = Partial<Record<keyof Form, string>>;
```

### データの部分更新
```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

type UserUpdate = Partial<Omit<User, 'id'>>;
```

---

## 練習問題

### 問題1
1. Partial, Required, Readonly, Recordを使って型を変換してください。
2. Pick, Omit, Exclude, Extractを使って型を操作してください。

### 問題2
1. ReturnType, Parameters, InstanceType, ConstructorParametersを使って関数やクラスの型を取得してください。

### 問題3
1. APIレスポンスやフォームバリデーションなど、実践的な場面でユーティリティ型を活用してください。

---

**前の章**: [[09-decorators|デコレータ]]
**次の章**: [[TypeScript/11-practice|実践プロジェクト]] 