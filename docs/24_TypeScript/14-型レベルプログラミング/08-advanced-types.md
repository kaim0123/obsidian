# 高度な型システム

## 目次
- [[07-modules|← 前章: モジュールシステム]]
- [[09-decorators|次章: デコレータ →]]

## 高度な型操作

### 型の抽出と変換

```typescript
// 型の抽出
type ExtractType<T> = T extends (infer U)[] ? U : never;
type ExtractReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type ExtractParameterType<T> = T extends (arg: infer P) => any ? P : never;

// 使用例
type ArrayElement = ExtractType<string[]>; // string
type FunctionReturn = ExtractReturnType<() => number>; // number
type FunctionParam = ExtractParameterType<(x: string) => void>; // string

// 条件付き型の高度な使用
type IsArray<T> = T extends any[] ? true : false;
type IsFunction<T> = T extends Function ? true : false;
type IsPrimitive<T> = T extends string | number | boolean ? true : false;

// 型の変換
type ToArray<T> = T extends any ? T[] : never;
type ToOptional<T> = T extends any ? T | undefined : never;
type ToRequired<T> = T extends any ? NonNullable<T> : never;
```

### 型の組み合わせ

```typescript
// 型の交差とユニオンの操作
type Intersection<T, U> = T & U;
type Union<T, U> = T | U;

// 条件付き型での組み合わせ
type ConditionalIntersection<T, U> = T extends any ? (U extends any ? T & U : never) : never;
type ConditionalUnion<T, U> = T extends any ? (U extends any ? T | U : never) : never;

// 型の選択
type PickByType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

type OmitByType<T, U> = {
  [K in keyof T]: T[K] extends U ? never : K;
}[keyof T];

// 使用例
interface MixedObject {
  name: string;
  age: number;
  isActive: boolean;
  email: string;
}

type StringKeys = PickByType<MixedObject, string>; // "name" | "email"
type NonStringKeys = OmitByType<MixedObject, string>; // "age" | "isActive"
```

## テンプレートリテラル型の高度な使用

### 文字列操作

```typescript
// 文字列の変換
type Uppercase<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${Uppercase<R>}`
  : S;

type Lowercase<S extends string> = S extends `${infer F}${infer R}`
  ? `${Lowercase<F>}${Lowercase<R>}`
  : S;

type Capitalize<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S;

// 文字列の検証
type StartsWith<S extends string, Prefix extends string> = S extends `${Prefix}${string}` ? true : false;
type EndsWith<S extends string, Suffix extends string> = S extends `${string}${Suffix}` ? true : false;
type Contains<S extends string, Substring extends string> = S extends `${string}${Substring}${string}` ? true : false;

// 文字列の分割
type Split<S extends string, Delimiter extends string> = S extends `${infer First}${Delimiter}${infer Rest}`
  ? [First, ...Split<Rest, Delimiter>]
  : [S];

// 使用例
type Test1 = StartsWith<"Hello World", "Hello">; // true
type Test2 = EndsWith<"Hello World", "World">; // true
type Test3 = Contains<"Hello World", "lo">; // true
type Test4 = Split<"a,b,c", ",">; // ["a", "b", "c"]
```

### パスとURLの型

```typescript
// パスの型定義
type PathSegment = string;
type Path = `/${PathSegment}` | `/${PathSegment}/${PathSegment}` | `/${PathSegment}/${PathSegment}/${PathSegment}`;

// URLパラメータの抽出
type ExtractParams<T extends string> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractParams<`/${Rest}`>
  : T extends `${string}:${infer Param}`
  ? Param
  : never;

// ルートパラメータの型
type RouteParams<T extends string> = {
  [K in ExtractParams<T>]: string;
};

// 使用例
type UserRoute = "/users/:id";
type PostRoute = "/posts/:id/comments/:commentId";

type UserParams = RouteParams<UserRoute>; // { id: string }
type PostParams = RouteParams<PostRoute>; // { id: string; commentId: string }
```

## 高度なマップ型

### 条件付きマップ型

```typescript
// 条件付きプロパティ変換
type ConditionalMap<T, Condition, TrueType, FalseType> = {
  [K in keyof T]: T[K] extends Condition ? TrueType : FalseType;
};

// 型別のプロパティ変換
type TransformByType<T> = {
  [K in keyof T]: T[K] extends string
    ? Uppercase<T[K]>
    : T[K] extends number
    ? T[K]
    : T[K] extends boolean
    ? T[K]
    : never;
};

// プロパティの条件付き削除
type RemoveByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

// プロパティの条件付き選択
type SelectByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

// 使用例
interface TestObject {
  name: string;
  age: number;
  isActive: boolean;
  email: string;
  id: number;
}

type StringOnly = SelectByType<TestObject, string>; // { name: string; email: string }
type NonString = RemoveByType<TestObject, string>; // { age: number; isActive: boolean; id: number }
type UppercaseStrings = TransformByType<TestObject>; // { name: "NAME"; age: number; isActive: boolean; email: "EMAIL"; id: number }
```

### 再帰的なマップ型

```typescript
// 深いオブジェクトの変換
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

type DeepPick<T, K extends string> = {
  [P in K]: P extends keyof T
    ? T[P] extends object
      ? DeepPick<T[P], string>
      : T[P]
    : never;
};

// 使用例
interface NestedObject {
  user: {
    profile: {
      name: string;
      email?: string;
    };
    settings: {
      theme: string;
      notifications?: boolean;
    };
  };
  config: {
    api: {
      url: string;
      timeout?: number;
    };
  };
}

type PartialNested = DeepPartial<NestedObject>;
type ReadonlyNested = DeepReadonly<NestedObject>;
type RequiredNested = DeepRequired<NestedObject>;
```

## 高度な条件付き型

### 複雑な条件付き型

```typescript
// 型の階層チェック
type IsSubtype<T, U> = T extends U ? true : false;
type IsSupertype<T, U> = U extends T ? true : false;
type IsEqual<T, U> = T extends U ? (U extends T ? true : false) : false;

// 型の存在チェック
type HasProperty<T, K extends string> = K extends keyof T ? true : false;
type HasMethod<T, K extends string> = K extends keyof T
  ? T[K] extends Function ? true : false
  : false;

// 型の組み合わせチェック
type All<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends true
    ? All<Rest>
    : false
  : true;

type Any<T extends any[]> = T extends [infer First, ...infer Rest]
  ? First extends true
    ? true
    : Any<Rest>
  : false;

// 使用例
type Test1 = IsSubtype<string, string | number>; // true
type Test2 = IsSupertype<string | number, string>; // false
type Test3 = IsEqual<string, string>; // true
type Test4 = HasProperty<{ name: string }, "name">; // true
type Test5 = All<[true, true, false]>; // false
type Test6 = Any<[false, false, true]>; // true
```

### 型の推論と制約

```typescript
// 型の推論
type InferArray<T> = T extends (infer U)[] ? U : never;
type InferPromise<T> = T extends Promise<infer U> ? U : never;
type InferFunction<T> = T extends (...args: any[]) => infer R ? R : never;

// 複数の型パラメータの推論
type InferFirst<T> = T extends [infer F, ...any[]] ? F : never;
type InferLast<T> = T extends [...any[], infer L] ? L : never;
type InferRest<T> = T extends [any, ...infer R] ? R : never;

// 条件付き推論
type ConditionalInfer<T> = T extends { data: infer D; error: infer E }
  ? { data: D; error: E }
  : T extends { data: infer D }
  ? { data: D; error: never }
  : T extends { error: infer E }
  ? { data: never; error: E }
  : never;

// 使用例
type ArrayType = InferArray<string[]>; // string
type PromiseType = InferPromise<Promise<number>>; // number
type FunctionType = InferFunction<() => boolean>; // boolean
type TupleFirst = InferFirst<[string, number, boolean]>; // string
type TupleLast = InferLast<[string, number, boolean]>; // boolean
type TupleRest = InferRest<[string, number, boolean]>; // [number, boolean]
```

## ユーティリティ型の作成

### カスタムユーティリティ型

```typescript
// 型の変換ユーティリティ
type ToString<T> = T extends string ? T : string;
type ToNumber<T> = T extends number ? T : number;
type ToBoolean<T> = T extends boolean ? T : boolean;

// 型の検証ユーティリティ
type ValidateString<T> = T extends string ? T : never;
type ValidateNumber<T> = T extends number ? T : never;
type ValidateBoolean<T> = T extends boolean ? T : never;

// 型の組み合わせユーティリティ
type Merge<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
    ? T[K]
    : never;
};

type Override<T, U> = Omit<T, keyof U> & U;

type PartialOverride<T, U> = {
  [K in keyof T]: K extends keyof U ? U[K] : T[K];
};

// 使用例
interface BaseConfig {
  host: string;
  port: number;
  timeout: number;
}

interface ExtendedConfig {
  port: string; // 型を変更
  ssl: boolean; // 新しいプロパティ
}

type MergedConfig = Merge<BaseConfig, ExtendedConfig>;
type OverriddenConfig = Override<BaseConfig, ExtendedConfig>;
type PartialOverriddenConfig = PartialOverride<BaseConfig, ExtendedConfig>;
```

### 高度なユーティリティ型

```typescript
// 型の安全性ユーティリティ
type NonNullable<T> = T extends null | undefined ? never : T;
type NonNever<T> = T extends never ? never : T;
type NonAny<T> = T extends any ? never : T;

// 型の変換ユーティリティ
type ToTuple<T> = T extends any[] ? T : [T];
type ToArray<T> = T extends any[] ? T : T[];
type ToUnion<T> = T extends any[] ? T[number] : T;

// 型の検証ユーティリティ
type IsNever<T> = [T] extends [never] ? true : false;
type IsAny<T> = 0 extends (1 & T) ? true : false;
type IsUnknown<T> = unknown extends T ? (IsAny<T> extends true ? false : true) : false;

// 型の操作ユーティリティ
type Head<T> = T extends [infer H, ...any[]] ? H : never;
type Tail<T> = T extends [any, ...infer R] ? R : never;
type Last<T> = T extends [...any[], infer L] ? L : never;

// 使用例
type Test1 = NonNever<string | never>; // string
type Test2 = ToTuple<string>; // [string]
type Test3 = ToArray<string>; // string[]
type Test4 = ToUnion<[string, number]>; // string | number
type Test5 = IsNever<never>; // true
type Test6 = IsAny<any>; // true
type Test7 = Head<[string, number, boolean]>; // string
type Test8 = Tail<[string, number, boolean]>; // [number, boolean]
type Test9 = Last<[string, number, boolean]>; // boolean
```

## 実践的な型システム

### API型システム

```typescript
// APIエンドポイントの型定義
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type ApiEndpoint<TMethod extends HttpMethod, TPath extends string, TParams = {}, TBody = never, TResponse = any> = {
  method: TMethod;
  path: TPath;
  params: TParams;
  body: TBody;
  response: TResponse;
};

// APIクライアントの型安全な実装
class TypedApiClient {
  async request<T extends ApiEndpoint<any, any, any, any, any>>(
    endpoint: T
  ): Promise<T["response"]> {
    // 実装
    return {} as T["response"];
  }

  async get<T extends ApiEndpoint<"GET", any, any, never, any>>(
    endpoint: T
  ): Promise<T["response"]> {
    return this.request(endpoint);
  }

  async post<T extends ApiEndpoint<"POST", any, any, any, any>>(
    endpoint: T,
    body: T["body"]
  ): Promise<T["response"]> {
    return this.request(endpoint);
  }
}

// 使用例
type GetUserEndpoint = ApiEndpoint<
  "GET",
  "/users/:id",
  { id: string },
  never,
  { id: string; name: string; email: string }
>;

type CreateUserEndpoint = ApiEndpoint<
  "POST",
  "/users",
  {},
  { name: string; email: string },
  { id: string; name: string; email: string }
>;

const apiClient = new TypedApiClient();

// 型安全なAPI呼び出し
const user = await apiClient.get({
  method: "GET",
  path: "/users/:id",
  params: { id: "123" },
  body: undefined,
  response: { id: "123", name: "John", email: "john@example.com" }
});

const newUser = await apiClient.post({
  method: "POST",
  path: "/users",
  params: {},
  body: { name: "Jane", email: "jane@example.com" },
  response: { id: "456", name: "Jane", email: "jane@example.com" }
}, { name: "Jane", email: "jane@example.com" });
```

### イベントシステムの型

```typescript
// イベントの型定義
type EventMap = {
  "user:created": { userId: string; name: string };
  "user:updated": { userId: string; changes: Partial<{ name: string; email: string }> };
  "user:deleted": { userId: string };
  "order:placed": { orderId: string; amount: number; userId: string };
  "order:cancelled": { orderId: string; reason: string };
};

// 型安全なイベントエミッター
class TypedEventEmitter {
  private listeners = new Map<keyof EventMap, Array<(data: any) => void>>();

  on<T extends keyof EventMap>(event: T, listener: (data: EventMap[T]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  emit<T extends keyof EventMap>(event: T, data: EventMap[T]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(listener => listener(data));
    }
  }

  off<T extends keyof EventMap>(event: T, listener: (data: EventMap[T]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index !== -1) {
        eventListeners.splice(index, 1);
      }
    }
  }
}

// 使用例
const eventEmitter = new TypedEventEmitter();

// 型安全なイベントリスナー
eventEmitter.on("user:created", (data) => {
  console.log(`User created: ${data.name} (${data.userId})`);
});

eventEmitter.on("order:placed", (data) => {
  console.log(`Order placed: ${data.orderId} for $${data.amount}`);
});

// 型安全なイベント発行
eventEmitter.emit("user:created", {
  userId: "123",
  name: "John Doe"
});

eventEmitter.emit("order:placed", {
  orderId: "ORD-001",
  amount: 99.99,
  userId: "123"
});
```

## 練習問題

### 問題1
1. 高度な型操作を実装してください：
   - 型の抽出と変換
   - 条件付き型の組み合わせ
   - テンプレートリテラル型の活用

### 問題2
1. カスタムユーティリティ型を作成してください：
   - 型の変換ユーティリティ
   - 型の検証ユーティリティ
   - 再帰的なマップ型

### 問題3
1. 実践的な型システムを実装してください：
   - API型システム
   - イベントシステムの型
   - 型安全なライブラリ

## まとめ

- 高度な型操作と変換
- テンプレートリテラル型の応用
- 条件付き型の複雑な使用
- カスタムユーティリティ型の作成
- 実践的な型システムの設計
- 型安全性の向上

---

**前の章**: [[07-modules|モジュールシステム]]
**次の章**: [[09-decorators|デコレータ]] 