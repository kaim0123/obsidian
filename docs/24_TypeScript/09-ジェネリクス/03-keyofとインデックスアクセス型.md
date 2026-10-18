# `keyof` / インデックスアクセス型（`T[K]`）

> `keyof T` は「**Tのキーをユニオン型として取り出す**」、`T[K]` は「**キー K に対応する値の型を取り出す**」── この2つの組み合わせは、TypeScript の型操作の**心臓部**です。「キーと値の関係を型で表現する」ことができるようになり、ライブラリ作者レベルの型が読み書きできるようになります。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-制約とデフォルト型引数]]
- 次: [[04-マップ型の基本]]

---

## 1. `keyof` 演算子

オブジェクト型から「**全キーのユニオン型**」を取り出す。

```typescript
type User = {
  id: string;
  name: string;
  age: number;
};

type UserKeys = keyof User;
// "id" | "name" | "age"
```

### 値ではなく**型**を扱っている

```typescript
const k: UserKeys = "id";    // ✅
const k2: UserKeys = "wrong"; // ❌
```

→ オブジェクトの**キー名のリテラルユニオン型**として使える。

---

## 2. インデックスアクセス型 `T[K]`

オブジェクト型から「**キー K に対応する値の型**」を取り出す。

```typescript
type User = {
  id: string;
  name: string;
  age: number;
};

type IdType = User["id"];    // string
type NameType = User["name"]; // string
type AgeType = User["age"];   // number
```

JavaScriptの `obj["key"]` のような構文だが、ここでは**型レベル**で書く。

### ユニオンキーで複数値を取得

```typescript
type IdOrName = User["id" | "name"];
// string | string = string
```

### `keyof T` と組み合わせ

```typescript
type AllValues = User[keyof User];
// string | string | number = string | number
```

「**Tの値の型のユニオン**」が取れる。

---

## 3. ジェネリクスとの組み合わせ（最重要）

`keyof T` と `T[K]` を**ジェネリクスの制約**として使うと、強力な型関数が書ける。

### 例: 型安全な `get`

```typescript
function get<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { id: "1", name: "Alice", age: 30 };

const id = get(user, "id");      // string
const name = get(user, "name");   // string
const age = get(user, "age");      // number
const wrong = get(user, "x");      // ❌ "x" is not in keyof user
```

→ **キー名のタイポを検出 + 戻り値の型が正確**。

### 例: 型安全な `set`

```typescript
function set<T, K extends keyof T>(obj: T, key: K, value: T[K]): void {
  obj[key] = value;
}

set(user, "age", 31);     // ✅
set(user, "age", "thirty"); // ❌ string は number に代入不可
```

---

## 4. `keyof` の挙動

### プリミティブ型の `keyof`

```typescript
type A = keyof string;  // number | typeof Symbol.iterator | "toString" | "charAt" | ...
type B = keyof number;  // "toString" | "toFixed" | ...
type C = keyof boolean; // "valueOf"
```

→ プリミティブの**メソッド名**が出る。あまり使わない。

### `Record` に対する `keyof`

```typescript
type R = Record<"a" | "b", number>; // { a: number; b: number }
type K = keyof R;                     // "a" | "b"
```

### インデックスシグネチャに対する `keyof`

```typescript
type Dict = { [key: string]: number };
type K = keyof Dict; // string | number
//                       ↑ number も含まれる！
```

JavaScriptの仕様で**数値キーも文字列に変換される**ため、`number` も含まれる。覚えておく。

### `keyof any`

```typescript
type K = keyof any; // string | number | symbol
```

「**任意のキーになりうる型**」。`Record<K, V>` の `K` の制約に使われている:

```typescript
type Record<K extends keyof any, V> = { [P in K]: V };
```

---

## 5. インデックスアクセス型の応用

### 配列の要素型

```typescript
type Arr = string[];
type Item = Arr[number]; // string

const arr = [{ name: "Alice" }, { name: "Bob" }];
type Element = typeof arr[number]; // { name: string }
```

`[number]` で「**任意のインデックス**」での値型 = 配列要素型。

### タプルの要素型

```typescript
type Tuple = [string, number, boolean];
type First = Tuple[0];  // string
type Second = Tuple[1]; // number
type Any = Tuple[number]; // string | number | boolean
```

### 配列のメソッドの戻り値（応用）

```typescript
type ArrMap<T> = ReturnType<T[]["map"]>;
```

---

## 6. `typeof` との組み合わせ

値から型を取り出す `typeof` と組み合わせると、**実値から型を導出**できる。

```typescript
const config = {
  api: { url: "https://...", timeout: 5000 },
  features: ["dark", "i18n"],
} as const;

type Config = typeof config;
type ApiConfig = typeof config["api"]; // { readonly url: "https://..."; readonly timeout: 5000 }
type FeatureKeys = keyof typeof config; // "api" | "features"
```

### 例: 定数オブジェクトをユニオン型にする

```typescript
const ROLES = {
  admin: "Administrator",
  user: "Regular User",
  guest: "Guest",
} as const;

type RoleKey = keyof typeof ROLES;          // "admin" | "user" | "guest"
type RoleValue = typeof ROLES[RoleKey];      // "Administrator" | "Regular User" | "Guest"
```

→ **値から型を生成**する強力なパターン。設定オブジェクトでよく使う。

---

## 7. 実例: `pick` の自作

標準 `Pick` の動きを真似:

```typescript
function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const k of keys) result[k] = obj[k];
  return result;
}

const user = { id: "1", name: "Alice", password: "secret" };
const safe = pick(user, "id", "name");
// 型: { id: string; name: string }
```

---

## 8. 実例: フォームバリデータ

```typescript
type User = { name: string; email: string; age: number };

type Validators<T> = {
  [K in keyof T]: (value: T[K]) => boolean;
};

const userValidators: Validators<User> = {
  name: v => v.length > 0,
  email: v => /@/.test(v),
  age: v => v >= 0,
};
```

→ **各フィールドの型に応じたバリデータ**を強制。

---

## 9. 実例: イベントエミッタ

```typescript
type EventMap = {
  click: { x: number; y: number };
  hover: { target: string };
  submit: { values: Record<string, string> };
};

class EventEmitter<T extends Record<string, unknown>> {
  on<K extends keyof T>(event: K, handler: (payload: T[K]) => void) {
    // ...
  }
}

const emitter = new EventEmitter<EventMap>();

emitter.on("click", (e) => {
  e.x; // ✅
  e.y; // ✅
});

emitter.on("hover", (e) => {
  e.target; // ✅
});

emitter.on("wrong", ...); // ❌
```

→ **イベント名と payload 型の対応**が型で保証される。実務頻出パターン。

---

## 10. 実例: API ルートとレスポンス型のマッピング

```typescript
type ApiRoutes = {
  "/users": { method: "GET"; response: User[] };
  "/users/:id": { method: "GET"; response: User };
  "/users/create": { method: "POST"; body: { name: string }; response: User };
};

async function call<R extends keyof ApiRoutes>(
  route: R
): Promise<ApiRoutes[R]["response"]> {
  // ...
}

const users = await call("/users");          // User[]
const user = await call("/users/:id");        // User
const wrong = await call("/wrong-route");      // ❌
```

→ **ルートごとに正しいレスポンス型**が推論される。tRPC や OpenAPI の型生成と同じ発想。

---

## 11. `keyof` と `T[K]` の落とし穴

### (1) `keyof` で `string | number | symbol` が混入

```typescript
type Dict = { [key: string]: number };
type K = keyof Dict; // string | number （symbol は含まれず）
```

→ 必要に応じて `Extract<keyof T, string>` で `string` だけ取り出す。

### (2) 値として `keyof` を使えない

```typescript
const k: keyof User = ...; // 型としては使える
const arr = ["id", "name", "age"]; // 値レベルでは別物
```

→ 値も欲しいなら `as const` 配列とか `Object.keys` （戻り値は `string[]` で型ガード必要）を併用。

### (3) `Object.keys` の戻り値型

```typescript
const u = { name: "A", age: 30 };
Object.keys(u); // 型: string[] （keyof U にはならない）
```

JavaScriptの仕様上、オブジェクトに余分なプロパティが入っている可能性があるため `string[]`。**型を絞るには as アサーション**が必要:

```typescript
(Object.keys(u) as (keyof typeof u)[]).forEach(k => { ... });
```

### (4) インデックスアクセス型でユニオンを渡すと挙動が変わる

```typescript
type T = { a: number; b: string };
type V = T["a" | "b"]; // number | string
type V2 = T[keyof T];   // 同上
```

ユニオン → ユニオン になる（分配される）。

### (5) `T[K]` で K が広いと値型も広くなる

```typescript
type T = { a: 1; b: 2 };
type V = T[keyof T]; // 1 | 2
type V2 = T[string]; // ❌ string キーはない（インデックスシグネチャがない）
```

---

## 12. ジェネリクスでの「型レベル操作」の入り口

`keyof` と `T[K]` を組み合わせると、**型レベルで「キーと値の関係」を操作**できる。

```typescript
type Keys<T> = keyof T;
type Values<T> = T[keyof T];

type UserKeys = Keys<User>;     // "id" | "name" | "age"
type UserValues = Values<User>;  // string | number
```

これが**マップ型**（次章）の基礎。

```typescript
type Partial<T> = { [K in keyof T]?: T[K] };
type Required<T> = { [K in keyof T]-?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

すべて `keyof T` + `T[K]` で書かれている。

---

## 13. ベストプラクティス

### (1) **キーをハードコードしない**

```typescript
// ❌
function getName(u: User): string { return u.name; }

// ✅ 汎用化
function get<T, K extends keyof T>(obj: T, key: K): T[K] { ... }
```

### (2) **`as` ではなく `keyof T` で型安全に**

```typescript
// ❌
const k = "name" as keyof User;

// ✅
function get<T, K extends keyof T>(obj: T, key: K) { ... }
```

### (3) **`typeof` と組み合わせて値から型を導出**

```typescript
const COLORS = ["red", "green", "blue"] as const;
type Color = typeof COLORS[number];
```

定数を一元管理しつつ型として使える。

### (4) **マッピングが必要なら Mapped Type へ**

```typescript
type Validators<T> = {
  [K in keyof T]: (v: T[K]) => boolean;
};
```

→ [[04-マップ型の基本]] へ。

---

## 14. まとめ

- **`keyof T`**: T のキー（プロパティ名）の**ユニオン型**
- **`T[K]`**: キー K に対応する**値の型**
- **`T[keyof T]`**: T の**全値の型のユニオン**
- **配列の要素型**: `T[number]`、タプルは `T[0]`, `T[1]` ...
- ジェネリクスで `K extends keyof T` + `T[K]` の**get/setパターン**は実務頻出
- **`typeof` + `as const`** との組み合わせで値から型を導出
- 落とし穴: インデックスシグネチャは `string | number`、`Object.keys` は `string[]`

> `keyof` と `T[K]` を使いこなせるようになると、「**キーと値の対応関係**」を型で正確に表現できるようになります。これがマップ型・条件型へとつながり、TypeScript の型レベルプログラミングの世界が開けます。

---

## 関連
- [[01-ジェネリクス関数と型]]
- [[02-制約とデフォルト型引数]]
- [[04-マップ型の基本]]
- [[10-utility-types]]
