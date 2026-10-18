# `Exclude<T, U>` / `Extract<T, U>` / `NonNullable<T>`

> ユニオン型の「**特定のメンバーを除外**」「**特定のメンバーだけ抽出**」「**`null`/`undefined` を除外**」── ユニオン操作の3点セットです。`Pick`/`Omit` がオブジェクト型用なら、こちらは**ユニオン型用**。分配法則の上に成り立つ標準ユーティリティで、内部実装を知ると応用も書けます。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-Pick_Omit]]
- 次: [[04-ReturnType_Parameters]]

---

## 1. `Exclude<T, U>` ── 除外

ユニオン型 `T` から、`U` に該当するメンバーを除外する。

```typescript
type T = "a" | "b" | "c";
type WithoutA = Exclude<T, "a">;
// "b" | "c"

type Mixed = string | number | boolean;
type WithoutNumber = Exclude<Mixed, number>;
// string | boolean
```

### 内部実装

```typescript
type Exclude<T, U> = T extends U ? never : T;
```

[[04-分配法則の入口]] の分配条件型を活用。「`T` の各メンバーが `U` に代入可能なら `never`、そうでなければ残す」。

### 具体例

```typescript
// ステータスから "loading" を除く
type Status = "idle" | "loading" | "success" | "error";
type FinalStatus = Exclude<Status, "loading">;
// "idle" | "success" | "error"

// オブジェクト型のユニオンから一部除外
type Animal = Dog | Cat | Bird;
type Mammal = Exclude<Animal, Bird>;
// Dog | Cat
```

---

## 2. `Extract<T, U>` ── 抽出

ユニオン型 `T` から、`U` に該当するメンバーだけを取り出す。**`Exclude` の逆**。

```typescript
type T = "a" | "b" | "c";
type OnlyA = Extract<T, "a" | "x">;
// "a" （"x" は T にないので除外）
```

### 内部実装

```typescript
type Extract<T, U> = T extends U ? T : never;
```

### 具体例

```typescript
// 文字列だけ抽出
type Mixed = string | number | boolean;
type OnlyString = Extract<Mixed, string>;
// string

// 判別ユニオンから特定ケースを取り出す
type Action =
  | { type: "ADD"; payload: number }
  | { type: "REMOVE"; id: string }
  | { type: "RESET" };

type AddAction = Extract<Action, { type: "ADD" }>;
// { type: "ADD"; payload: number }
```

→ **判別可能ユニオンから特定のケースを取り出す**のに非常に便利。実務頻出。

### `keyof` との組み合わせ

```typescript
type T = { a: number; b: string; c: boolean };
type StringKeys = Extract<keyof T, string>;
// "a" | "b" | "c" （string のキーだけ）
```

---

## 3. `NonNullable<T>` ── `null`/`undefined` を除外

```typescript
type T = string | null | undefined;
type N = NonNullable<T>;
// string
```

### 内部実装

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
// (TS 4.8 以降は `T & {}`)
```

### 使い所

#### (1) `Array.find` の戻り値

```typescript
const found = arr.find(x => x.id === id);
// found: User | undefined

if (found) {
  const user: NonNullable<typeof found> = found;
  // user: User
}
```

#### (2) ジェネリックヘルパで null を除く

```typescript
function isNonNull<T>(v: T): v is NonNullable<T> {
  return v !== null && v !== undefined;
}

const arr: (string | null)[] = ["a", null, "b"];
const filtered = arr.filter(isNonNull);
// string[]
```

→ `filter(isNonNull)` で `null`/`undefined` を一掃しつつ型も絞れる。

#### (3) オブジェクトのフィールドから `null` を除く

```typescript
type User = { name: string | null; email: string | null };

type StrictUser = {
  [K in keyof User]: NonNullable<User[K]>;
};
// { name: string; email: string }
```

---

## 4. 3つの関係

すべて**条件型 + 分配法則**で動いている兄弟型。

```typescript
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;
type NonNullable<T> = T extends null | undefined ? never : T;
// = Exclude<T, null | undefined>
```

→ **`NonNullable` は `Exclude` の特殊版**。

---

## 5. ユニオン操作と分配法則

### 分配法則のおさらい

```typescript
type Wrap<T> = T extends any ? T[] : never;
type R = Wrap<string | number>;
// string[] | number[]
```

「裸の `T extends ...`」+ ユニオン型 → 各メンバーに分配される。詳しくは [[04-分配法則の入口]]。

### `Exclude` も同じ

```typescript
type T = "a" | "b" | "c";
type R = Exclude<T, "a">;
// → 分配:
// "a" extends "a" ? never : "a" → never
// "b" extends "a" ? never : "b" → "b"
// "c" extends "a" ? never : "c" → "c"
// → never | "b" | "c" = "b" | "c"
```

`never` がユニオンから消える性質を活かしている。

---

## 6. 実例: 状態の遷移を型で表現

```typescript
type Status = "idle" | "loading" | "success" | "error";

// 「すでに終わった状態」だけを抽出
type FinishedStatus = Extract<Status, "success" | "error">;

// 「まだ確定していない状態」を除外
type DefinedStatus = Exclude<Status, "idle">;
```

---

## 7. 実例: アクション型のフィルタ

```typescript
type Action =
  | { type: "USER_LOGIN"; payload: User }
  | { type: "USER_LOGOUT" }
  | { type: "POST_CREATE"; payload: Post }
  | { type: "POST_DELETE"; id: string };

// USER_ から始まる action だけ
type UserAction = Extract<Action, { type: `USER_${string}` }>;
// { type: "USER_LOGIN"; payload: User } | { type: "USER_LOGOUT" }
```

テンプレートリテラル型と組み合わせると強力。

---

## 8. 実例: イベントハンドラの payload

```typescript
type EventMap = {
  click: { x: number; y: number };
  hover: { target: string };
  submit: { values: Record<string, string> };
};

type EventName = keyof EventMap;

function on<E extends EventName>(event: E, handler: (e: EventMap[E]) => void) {
  // ...
}

// 特定イベントの payload 型
type ClickPayload = EventMap["click"]; // { x: number; y: number }

// 全イベントの payload を抽出
type AllPayloads = EventMap[EventName]; // 全 payload のユニオン
```

---

## 9. 実例: フォームエラー

```typescript
type FormErrors = {
  email?: string;
  password?: string;
  age?: string;
};

type FieldName = keyof FormErrors;
// "email" | "password" | "age"

type DefinedErrorKey<T> = {
  [K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];
// 値が必ず存在するキーだけ抽出（応用）
```

---

## 10. 落とし穴

### (1) `Extract` で何もマッチしないと `never`

```typescript
type T = "a" | "b";
type E = Extract<T, "x">; // never
```

→ 何も抽出されないと `never`。意図と違うときは設計ミス。

### (2) `Exclude` で全部除外すると `never`

```typescript
type T = "a" | "b";
type E = Exclude<T, "a" | "b">; // never
```

### (3) `NonNullable` が `null` を含むユニオンに分配される

```typescript
type T = string | null | undefined;
type N = NonNullable<T>; // string
```

→ 通常通りの挙動だが、ネストには効かない:

```typescript
type Nested = { x: string | null };
type N = NonNullable<Nested>; // { x: string | null } （変わらない）
// → マップ型と組み合わせる必要あり
```

### (4) オブジェクト型に `Exclude` してもプロパティは消えない

```typescript
type T = { a: number; b: string };
type E = Exclude<T, { a: number }>; // never
//        ↑ オブジェクト型では「メンバー全体」が U に該当するか判定
```

→ オブジェクトのプロパティ操作は `Pick`/`Omit` を使う。

### (5) ユニオン型でない `T` に分配は起きない

```typescript
type T = string;
type E = Exclude<T, string>; // never
```

そりゃそう。

---

## 11. 応用: `Exclude` で標準型を再実装

`Omit` は内部で `Exclude` を使っている:

```typescript
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

→ `keyof T` のユニオンから `K` を除外し、それを `Pick`。

この発想で**自作の応用型**が書ける:

```typescript
// オブジェクトから「特定の型を持つフィールド」だけ抽出
type FilterByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type User = { name: string; age: number; email: string };
type StringFields = FilterByType<User, string>;
// { name: string; email: string }
```

---

## 12. 早見表

| 標準型 | 効果 | 内部実装 |
|---|---|---|
| `Exclude<T, U>` | T から U を除外 | `T extends U ? never : T` |
| `Extract<T, U>` | T から U を抽出 | `T extends U ? T : never` |
| `NonNullable<T>` | null/undefined を除外 | `T extends null \| undefined ? never : T` |

---

## 13. 使い分けクイックリファレンス

| やりたいこと | 使う型 |
|---|---|
| 「これらを除外」 | `Exclude<T, U>` |
| 「これらだけ取り出す」 | `Extract<T, U>` |
| `null`/`undefined` を除外 | `NonNullable<T>` |
| オブジェクトから一部キー除外 | `Omit<T, K>`（`Exclude` 内部利用） |
| オブジェクトから一部キー抽出 | `Pick<T, K>` |
| 配列から null を除外 | `arr.filter(isNonNull)` |
| 判別ユニオンから1ケース抽出 | `Extract<T, { type: "X" }>` |

---

## 14. アンチパターン

### (1) `Exclude` で除外したつもりが `never` になっている

```typescript
type T = "a" | "b";
type E = Exclude<T, "a" | "b">; // never （全部除外）
```

→ 意図を確認、もしくは設計を見直す。

### (2) `Extract` で複数候補を `|` で渡したが意図と違う

```typescript
type T = "a" | "b" | "c";
type E = Extract<T, "a" | "x">; // "a" （"x" は T にない）
```

→ 取り出したいメンバーが**確実に T に含まれているか**確認。

### (3) `NonNullable` をシャローで使う

```typescript
type T = { x: string | null };
type N = NonNullable<T>; // { x: string | null } （変わらず）
```

→ ネストには効かない。マップ型を併用。

### (4) オブジェクト型に `Exclude` を使う

```typescript
type T = { a: number; b: string };
type R = Exclude<T, { a: number }>; // never
```

→ オブジェクトには `Omit` を使う。

---

## 15. まとめ

- **`Exclude<T, U>`**: ユニオン型から U に該当するメンバーを除外
- **`Extract<T, U>`**: ユニオン型から U に該当するメンバーだけ抽出
- **`NonNullable<T>`**: `null` / `undefined` を除外（`Exclude` の特殊版）
- すべて**条件型 + 分配法則**で動く
- 判別可能ユニオンから**特定ケースを取り出す**のに `Extract` が便利
- オブジェクト型操作は `Pick`/`Omit`、ユニオン操作はこれら3つ

> ユニオン型を「**集合**」として捉え、引いたり抜き出したりする操作 ── これが `Exclude` / `Extract` / `NonNullable`。標準でこの3つがあるおかげで、わざわざ条件型を書かずに済んでいます。

---

## 関連
- [[02-Pick_Omit]]
- [[04-ReturnType_Parameters]]
- [[06-自作ユーティリティ型入門]]
- [[01-ユニオン型と合成]]
- [[04-分配法則の入口]]
