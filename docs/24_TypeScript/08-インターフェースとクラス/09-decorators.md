# デコレータ

## 目次
- [[08-advanced-types|← 前章: 高度な型システム]]
- [[10-utility-types|次章: ユーティリティ型 →]]

## デコレータの基礎

### デコレータとは

**デコレータ**はクラス、メソッド、プロパティ、パラメータにメタデータを追加したり、動作を変更したりする機能です。

```typescript
// tsconfig.jsonでデコレータを有効化
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}

// 基本的なクラスデコレータ
function logClass(constructor: Function) {
  console.log(`Class ${constructor.name} is being created`);
}

@logClass
class Example {
  constructor() {
    console.log("Example instance created");
  }
}

// デコレータファクトリ
function logClassWithMessage(message: string) {
  return function(constructor: Function) {
    console.log(`${message}: ${constructor.name}`);
  };
}

@logClassWithMessage("Creating class")
class AnotherExample {
  constructor() {
    console.log("AnotherExample instance created");
  }
}
```

### デコレータの種類

```typescript
// 1. クラスデコレータ
function classDecorator(constructor: Function) {
  console.log("Class decorator called");
}

// 2. メソッドデコレータ
function methodDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("Method decorator called");
}

// 3. プロパティデコレータ
function propertyDecorator(target: any, propertyKey: string) {
  console.log("Property decorator called");
}

// 4. パラメータデコレータ
function parameterDecorator(target: any, propertyKey: string, parameterIndex: number) {
  console.log("Parameter decorator called");
}

// 5. アクセサデコレータ
function accessorDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  console.log("Accessor decorator called");
}

@classDecorator
class DecoratedClass {
  @propertyDecorator
  name: string = "Example";

  @methodDecorator
  greet(@parameterDecorator name: string) {
    console.log(`Hello, ${name}!`);
  }

  @accessorDecorator
  get fullName(): string {
    return this.name;
  }
}
```

## クラスデコレータ

### 基本的なクラスデコレータ

```typescript
// クラス情報のログ出力
function logClassInfo(constructor: Function) {
  console.log(`Class name: ${constructor.name}`);
  console.log(`Class prototype:`, constructor.prototype);
  console.log(`Class constructor:`, constructor);
}

// クラスの封印
function sealClass(constructor: Function) {
  Object.seal(constructor);
  Object.seal(constructor.prototype);
}

// クラスの凍結
function freezeClass(constructor: Function) {
  Object.freeze(constructor);
  Object.freeze(constructor.prototype);
}

// シングルトンパターンの実装
function singleton<T extends { new (...args: any[]): {} }>(constructor: T) {
  return class extends constructor {
    private static instance: any = null;
    
    constructor(...args: any[]) {
      if (singleton.instance) {
        return singleton.instance;
      }
      super(...args);
      singleton.instance = this;
    }
  };
}

// 使用例
@logClassInfo
@sealClass
class User {
  constructor(public name: string) {}
}

@singleton
class DatabaseConnection {
  constructor() {
    console.log("Database connection created");
  }
  
  query(sql: string) {
    console.log(`Executing: ${sql}`);
  }
}

const db1 = new DatabaseConnection();
const db2 = new DatabaseConnection();
console.log(db1 === db2); // true
```

### 高度なクラスデコレータ

```typescript
// メソッドの追加
function addMethod(methodName: string, method: Function) {
  return function(constructor: Function) {
    constructor.prototype[methodName] = method;
  };
}

// プロパティの追加
function addProperty(propertyName: string, defaultValue: any) {
  return function(constructor: Function) {
    constructor.prototype[propertyName] = defaultValue;
  };
}

// バリデーション機能の追加
function validateClass() {
  return function(constructor: Function) {
    const originalConstructor = constructor;
    
    const newConstructor: any = function(...args: any[]) {
      const instance = new originalConstructor(...args);
      
      // バリデーションロジック
      const validationErrors: string[] = [];
      
      // 必須プロパティのチェック
      if (!instance.name) {
        validationErrors.push("Name is required");
      }
      
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(", ")}`);
      }
      
      return instance;
    };
    
    newConstructor.prototype = originalConstructor.prototype;
    return newConstructor;
  };
}

// 使用例
@addMethod("getInfo", function() {
  return `Name: ${this.name}, Age: ${this.age}`;
})
@addProperty("createdAt", new Date())
@validateClass()
class Person {
  constructor(public name: string, public age: number) {}
}

const person = new Person("John", 30);
console.log(person.getInfo()); // "Name: John, Age: 30"
console.log(person.createdAt); // 現在の日時
```

## メソッドデコレータ

### 基本的なメソッドデコレータ

```typescript
// メソッドの実行時間を計測
function measureTime(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    const start = performance.now();
    const result = originalMethod.apply(this, args);
    const end = performance.now();
    
    console.log(`${propertyKey} took ${end - start} milliseconds`);
    return result;
  };
  
  return descriptor;
}

// メソッドの呼び出しをログ出力
function logMethod(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    console.log(`Calling ${propertyKey} with arguments:`, args);
    const result = originalMethod.apply(this, args);
    console.log(`${propertyKey} returned:`, result);
    return result;
  };
  
  return descriptor;
}

// メソッドの結果をキャッシュ
function cache(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const cacheMap = new Map();
  
  descriptor.value = function(...args: any[]) {
    const key = JSON.stringify(args);
    
    if (cacheMap.has(key)) {
      console.log(`Cache hit for ${propertyKey}`);
      return cacheMap.get(key);
    }
    
    const result = originalMethod.apply(this, args);
    cacheMap.set(key, result);
    console.log(`Cache miss for ${propertyKey}`);
    return result;
  };
  
  return descriptor;
}

// 使用例
class Calculator {
  @measureTime
  @logMethod
  add(a: number, b: number): number {
    // 重い処理をシミュレート
    for (let i = 0; i < 1000000; i++) {
      Math.random();
    }
    return a + b;
  }
  
  @cache
  fibonacci(n: number): number {
    if (n <= 1) return n;
    return this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}

const calc = new Calculator();
calc.add(5, 3);
calc.fibonacci(10);
calc.fibonacci(10); // キャッシュから取得
```

### 高度なメソッドデコレータ

```typescript
// リトライ機能
function retry(attempts: number = 3, delay: number = 1000) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      let lastError: Error;
      
      for (let i = 0; i < attempts; i++) {
        try {
          return await originalMethod.apply(this, args);
        } catch (error) {
          lastError = error;
          console.log(`Attempt ${i + 1} failed:`, error.message);
          
          if (i < attempts - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      throw lastError!;
    };
    
    return descriptor;
  };
}

// デバウンス機能
function debounce(delay: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    let timeoutId: NodeJS.Timeout;
    
    descriptor.value = function(...args: any[]) {
      clearTimeout(timeoutId);
      
      return new Promise((resolve) => {
        timeoutId = setTimeout(() => {
          resolve(originalMethod.apply(this, args));
        }, delay);
      });
    };
    
    return descriptor;
  };
}

// スロットリング機能
function throttle(delay: number) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    let lastCall = 0;
    
    descriptor.value = function(...args: any[]) {
      const now = Date.now();
      
      if (now - lastCall >= delay) {
        lastCall = now;
        return originalMethod.apply(this, args);
      }
      
      console.log(`${propertyKey} was throttled`);
    };
    
    return descriptor;
  };
}

// 使用例
class ApiClient {
  @retry(3, 1000)
  async fetchData(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
  
  @debounce(300)
  async search(query: string): Promise<any> {
    console.log(`Searching for: ${query}`);
    return { results: [] };
  }
  
  @throttle(1000)
  logEvent(event: string): void {
    console.log(`Event logged: ${event}`);
  }
}
```

## プロパティデコレータ

### 基本的なプロパティデコレータ

```typescript
// プロパティの読み取り専用化
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false,
    configurable: false
  });
}

// プロパティのバリデーション
function validate(validator: (value: any) => boolean, message: string) {
  return function(target: any, propertyKey: string) {
    let value: any;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue: any) {
        if (!validator(newValue)) {
          throw new Error(`${propertyKey}: ${message}`);
        }
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// プロパティの監視
function watch(callback: (oldValue: any, newValue: any) => void) {
  return function(target: any, propertyKey: string) {
    let value: any;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue: any) {
        const oldValue = value;
        value = newValue;
        callback(oldValue, newValue);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// 使用例
class User {
  @readonly
  id: number = 1;
  
  @validate(
    (value: string) => value.length >= 2,
    "Name must be at least 2 characters long"
  )
  name: string = "";
  
  @validate(
    (value: number) => value >= 0 && value <= 150,
    "Age must be between 0 and 150"
  )
  age: number = 0;
  
  @watch((oldValue, newValue) => {
    console.log(`Email changed from ${oldValue} to ${newValue}`);
  })
  email: string = "";
}

const user = new User();
user.name = "John"; // OK
user.age = 25; // OK
user.email = "john@example.com"; // ログ出力

// user.id = 2; // エラー！読み取り専用
// user.name = "A"; // エラー！バリデーション失敗
// user.age = 200; // エラー！バリデーション失敗
```

### 高度なプロパティデコレータ

```typescript
// プロパティの遅延初期化
function lazy<T>(factory: () => T) {
  return function(target: any, propertyKey: string) {
    let value: T | undefined;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        if (value === undefined) {
          value = factory();
        }
        return value;
      },
      set(newValue: T) {
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// プロパティの暗号化
function encrypted(target: any, propertyKey: string) {
  let value: string;
  
  Object.defineProperty(target, propertyKey, {
    get() {
      return value ? atob(value) : "";
    },
    set(newValue: string) {
      value = newValue ? btoa(newValue) : "";
    },
    enumerable: true,
    configurable: true
  });
}

// プロパティの永続化
function persistent(target: any, propertyKey: string) {
  const storageKey = `${target.constructor.name}_${propertyKey}`;
  let value: any = localStorage.getItem(storageKey);
  
  try {
    value = value ? JSON.parse(value) : undefined;
  } catch {
    value = undefined;
  }
  
  Object.defineProperty(target, propertyKey, {
    get() {
      return value;
    },
    set(newValue: any) {
      value = newValue;
      localStorage.setItem(storageKey, JSON.stringify(newValue));
    },
    enumerable: true,
    configurable: true
  });
}

// 使用例
class Config {
  @lazy(() => {
    console.log("Computing expensive value...");
    return Math.random();
  })
  expensiveValue: number;
  
  @encrypted
  password: string = "";
  
  @persistent
  theme: string = "light";
}

const config = new Config();
console.log(config.expensiveValue); // 初回のみ計算
console.log(config.expensiveValue); // キャッシュから取得

config.password = "secret123";
console.log(config.password); // "secret123" (暗号化されて保存)

config.theme = "dark";
// localStorageに保存される
```

## パラメータデコレータ

### 基本的なパラメータデコレータ

```typescript
// パラメータの型チェック
function typeCheck(expectedType: string) {
  return function(target: any, propertyKey: string, parameterIndex: number) {
    const originalMethod = target[propertyKey];
    
    target[propertyKey] = function(...args: any[]) {
      const arg = args[parameterIndex];
      const actualType = typeof arg;
      
      if (actualType !== expectedType) {
        throw new Error(
          `Parameter ${parameterIndex} of ${propertyKey} must be of type ${expectedType}, got ${actualType}`
        );
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

// パラメータのバリデーション
function validateParam(validator: (value: any) => boolean, message: string) {
  return function(target: any, propertyKey: string, parameterIndex: number) {
    const originalMethod = target[propertyKey];
    
    target[propertyKey] = function(...args: any[]) {
      const arg = args[parameterIndex];
      
      if (!validator(arg)) {
        throw new Error(`Parameter ${parameterIndex} of ${propertyKey}: ${message}`);
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

// パラメータのデフォルト値
function defaultValue(defaultValue: any) {
  return function(target: any, propertyKey: string, parameterIndex: number) {
    const originalMethod = target[propertyKey];
    
    target[propertyKey] = function(...args: any[]) {
      if (args[parameterIndex] === undefined) {
        args[parameterIndex] = defaultValue;
      }
      
      return originalMethod.apply(this, args);
    };
  };
}

// 使用例
class MathUtils {
  add(@typeCheck("number") a: number, @typeCheck("number") b: number): number {
    return a + b;
  }
  
  divide(
    @typeCheck("number") a: number,
    @validateParam((value: number) => value !== 0, "Divisor cannot be zero") b: number
  ): number {
    return a / b;
  }
  
  multiply(
    @typeCheck("number") a: number,
    @defaultValue(1) b: number
  ): number {
    return a * b;
  }
}

const math = new MathUtils();
console.log(math.add(5, 3)); // 8
console.log(math.multiply(5)); // 5 (bはデフォルト値1)
// math.add("5", 3); // エラー！型チェック失敗
// math.divide(10, 0); // エラー！バリデーション失敗
```

## 実践的なデコレータ

### バリデーションフレームワーク

```typescript
// バリデーションルール
interface ValidationRule {
  validate(value: any): boolean;
  message: string;
}

class RequiredRule implements ValidationRule {
  validate(value: any): boolean {
    return value !== undefined && value !== null && value !== "";
  }
  
  message = "This field is required";
}

class MinLengthRule implements ValidationRule {
  constructor(private minLength: number) {}
  
  validate(value: any): boolean {
    return typeof value === "string" && value.length >= this.minLength;
  }
  
  message = `Minimum length is ${this.minLength} characters`;
}

class EmailRule implements ValidationRule {
  validate(value: any): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return typeof value === "string" && emailRegex.test(value);
  }
  
  message = "Invalid email format";
}

// バリデーションデコレータ
function validateField(rules: ValidationRule[]) {
  return function(target: any, propertyKey: string) {
    let value: any;
    
    Object.defineProperty(target, propertyKey, {
      get() {
        return value;
      },
      set(newValue: any) {
        const errors: string[] = [];
        
        for (const rule of rules) {
          if (!rule.validate(newValue)) {
            errors.push(rule.message);
          }
        }
        
        if (errors.length > 0) {
          throw new Error(`${propertyKey}: ${errors.join(", ")}`);
        }
        
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}

// 使用例
class UserForm {
  @validateField([new RequiredRule(), new MinLengthRule(2)])
  name: string = "";
  
  @validateField([new RequiredRule(), new EmailRule()])
  email: string = "";
  
  @validateField([new RequiredRule()])
  age: number = 0;
}

const form = new UserForm();

try {
  form.name = "A"; // エラー！最小長さ不足
} catch (error) {
  console.error(error.message);
}

try {
  form.email = "invalid-email"; // エラー！メール形式不正
} catch (error) {
  console.error(error.message);
}
```

### APIクライアントのデコレータ

```typescript
// HTTPメソッドデコレータ
function GET(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function(...args: any[]) {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url);
      return response.json();
    };
  };
}

function POST(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    descriptor.value = async function(data: any) {
      const url = `${this.baseUrl}${path}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      return response.json();
    };
  };
}

// 認証デコレータ
function authenticated(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args: any[]) {
    if (!this.token) {
      throw new Error("Authentication required");
    }
    
    return originalMethod.apply(this, args);
  };
}

// 使用例
class ApiClient {
  constructor(
    public baseUrl: string,
    public token?: string
  ) {}
  
  @GET("/users")
  @authenticated
  async getUsers() {
    // デコレータによって実装される
  }
  
  @POST("/users")
  @authenticated
  async createUser(data: any) {
    // デコレータによって実装される
  }
}

const api = new ApiClient("https://api.example.com", "token123");
api.getUsers().then(users => console.log(users));
```

## 練習問題

### 問題1
1. 基本的なデコレータを作成してください：
   - クラスデコレータ
   - メソッドデコレータ
   - プロパティデコレータ

### 問題2
1. 高度なデコレータを実装してください：
   - バリデーションデコレータ
   - キャッシュデコレータ
   - ログデコレータ

### 問題3
1. 実践的なデコレータを活用してください：
   - APIクライアントのデコレータ
   - バリデーションフレームワーク
   - パフォーマンス監視デコレータ

## まとめ

- デコレータの基本概念と種類
- クラス、メソッド、プロパティ、パラメータデコレータ
- デコレータファクトリとパラメータ化
- 実践的なデコレータの活用
- バリデーションとメタデータの追加
- パフォーマンスとデバッグの改善

---

**前の章**: [[08-advanced-types|高度な型システム]]
**次の章**: [[10-utility-types|ユーティリティ型]] 