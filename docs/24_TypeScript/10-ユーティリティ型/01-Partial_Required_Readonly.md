# `Partial<T>` / `Required<T>` / `Readonly<T>`

> 「**全プロパティを optional にしたい**」「**全プロパティを必須にしたい**」「**全プロパティを書き換え不可にしたい**」── この3パターンは実務で非常に頻出。`Partial` `Required` `Readonly` は標準で用意されているので、自分で書かずに**まず思い出す**型です。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 次: [[02-Pick_Omit]]

---

## 1. `Partial<T>` ── 全プロパティを optional に

```typescript
type User = {
  id: string;
  name: string;
  email: string;
};

type PartialUser = Partial<User>;
// {
//   id?: string;
//   name?: string;
//   email?: string;
// }
```

すべてのプロパティが**省略可能**になる。

### 内部実装

```typescript
type Partial<T> = {
  [K in keyof T]?: T[K];
};
```

マップ型 + `?` 修飾子（[[04-マップ型の基本]] 参照）。

### 使い所

#### (1) 部分更新の引数型

```typescript
function updateUser(id: string, changes: Partial<User>): void {
  // changes は { name?: string; email?: string } など、一部だけ渡せる
}

updateUser("u1", { name: "Alice" });           // ✅
updateUser("u1", { email: "a@e.com" });         // ✅
updateUser("u1", { name: "Alice", email: "..." }); // ✅
```

→ **PATCH 系のAPI**でよく使う。

#### (2) フォームの初期値

```typescript
type FormValues = {
  email: string;
  password: string;
  remember: boolean;
};

const initialValues: Partial<FormValues> = {
  remember: false,
};
```

#### (3) Reactの props のデフォルト

```typescript
function Button(props: Partial<ButtonProps>) {
  const { variant = "primary", size = "md" } = props;
}
```

---

## 2. `Partial` の落とし穴

### (1) **深いネストには効かない**（シャロー）

```typescript
type Config = {
  api: { url: string; timeout: number };
};

type P = Partial<Config>;
// { api?: { url: string; timeout: number } }
//                     ↑ url や timeout は optional にならない
```

→ 深い `Partial` が必要なら自作の `DeepPartial` を:

```typescript
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
```

### (2) PATCHで `undefined` を区別したいとき

```typescript
type Update = Partial<User>;

const u: Update = { name: undefined };
```

「**プロパティを省略した**」のか「**明示的に `undefined` をセットした**」のかが区別できない。`exactOptionalPropertyTypes: true` を有効にすると区別できるようになる。

---

## 3. `Required<T>` ── 全プロパティを必須に

```typescript
type OptionalUser = {
  id?: string;
  name?: string;
  email?: string;
};

type RequiredUser = Required<OptionalUser>;
// {
//   id: string;
//   name: string;
//   email: string;
// }
```

### 内部実装

```typescript
type Required<T> = {
  [K in keyof T]-?: T[K];
};
```

`-?` で optional 修飾子を**除去**する（[[04-マップ型の基本]] の修飾子操作）。

### 使い所

#### (1) 「設定がそろった後の状態」を型に

```typescript
type ConfigInput = {
  apiUrl?: string;
  timeout?: number;
  retries?: number;
};

type ConfigResolved = Required<ConfigInput>;

function resolveConfig(input: ConfigInput): ConfigResolved {
  return {
    apiUrl: input.apiUrl ?? "https://default",
    timeout: input.timeout ?? 5000,
    retries: input.retries ?? 3,
  };
}
```

入力時は省略可、解決後は全部揃っている ── という設計。

#### (2) `Partial` と組み合わせて部分制御

```typescript
type PartialUser = Partial<User>;
type FullUser = Required<PartialUser>; // = User
```

---

## 4. `Required` の落とし穴

### (1) `null` を許容するフィールドはそのまま

```typescript
type T = { x?: string | null };
type R = Required<T>;
// { x: string | null }
//      ↑ null は残る、optional だけ外れる
```

`null` を取り除きたいなら `NonNullable` と組み合わせる:

```typescript
type R2 = { [K in keyof T]-?: NonNullable<T[K]> };
```

### (2) シャロー

`Partial` 同様、ネストには効かない。

---

## 5. `Readonly<T>` ── 全プロパティを書き換え不可に

```typescript
type User = { name: string; age: number };
type FrozenUser = Readonly<User>;
// {
//   readonly name: string;
//   readonly age: number;
// }

const u: FrozenUser = { name: "Alice", age: 30 };
u.name = "Bob"; // ❌ Cannot assign to 'name' because it is a read-only property.
```

### 内部実装

```typescript
type Readonly<T> = {
  readonly [K in keyof T]: T[K];
};
```

### 使い所

#### (1) 関数引数を「書き換えない契約」に

```typescript
function process(user: Readonly<User>) {
  user.name = "..."; // ❌
}
```

→ 「この関数は引数を変更しない」が型で表現される。

#### (2) React の Props（実は `Readonly<T>` 風）

```typescript
type Props = Readonly<{
  label: string;
  onClick: () => void;
}>;
```

React 自身も内部で props を `Readonly` 的に扱っている。

#### (3) 設定オブジェクト

```typescript
const CONFIG: Readonly<Record<string, string>> = {
  apiUrl: "https://...",
  apiKey: "...",
};

CONFIG.apiUrl = "..."; // ❌
```

不変な定数の表現に。

---

## 6. `Readonly` の落とし穴（再掲）

### (1) **シャロー**

```typescript
type Group = { members: string[] };
type R = Readonly<Group>;

const g: R = { members: [] };
g.members = [];        // ❌
g.members.push("a");   // ✅ 中身は変更可能！
```

→ 完全な不変が必要なら `DeepReadonly` を自作:

```typescript
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly<T[K]>
    : T[K];
};
```

### (2) 配列・タプルにも効く

```typescript
type R = Readonly<[string, number]>;
// readonly [string, number]

type R2 = Readonly<string[]>;
// readonly string[]
```

### (3) 実行時には消える

`Object.freeze` を使えば実行時にも防げる:

```typescript
const config = Object.freeze({ ... }) as Readonly<Config>;
```

---

## 7. 3つを組み合わせる

### `Partial` + `Required` で「必要な部分だけ必須に」

```typescript
type PartialExceptId<T> = Partial<T> & Required<Pick<T, "id">>;
// 例: { id: string; name?: string; email?: string }
```

### `Readonly` + `Partial`

```typescript
type Frozen = Readonly<Partial<User>>;
// 全プロパティが optional + readonly
```

### 連鎖適用

```typescript
type T = Required<Partial<Readonly<User>>>;
```

ただし**読みづらくなる**ので、必要な操作を1つの型エイリアスにまとめる方がよい:

```typescript
type ImmutableUser = Readonly<Required<User>>;
```

---

## 8. 実例

### 例1: PATCH エンドポイント

```typescript
type User = { id: string; name: string; email: string; age: number };

type UpdateUserBody = Partial<Omit<User, "id">>;
// { name?: string; email?: string; age?: number }

async function patchUser(id: string, body: UpdateUserBody): Promise<User> {
  return fetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(body) })
    .then(r => r.json());
}
```

### 例2: フォームの送信前チェック

```typescript
type FormValues = {
  email: string;
  password: string;
};

type ValidatedForm = Required<FormValues>;

function validate(values: Partial<FormValues>): ValidatedForm | null {
  if (!values.email || !values.password) return null;
  return { email: values.email, password: values.password };
}
```

### 例3: 不変な State

```typescript
type AppState = Readonly<{
  user: User | null;
  posts: ReadonlyArray<Post>;
  loading: boolean;
}>;

function reducer(state: AppState, action: Action): AppState {
  // state.user = null; ❌（型で防がれる）
  return { ...state, user: action.user }; // 新しい State を返す
}
```

---

## 9. 標準ユーティリティを使うべきか、自作すべきか

### 標準で十分

- `Partial<T>` `Required<T>` `Readonly<T>` のシャロー版
- 一般的な型変換

### 自作すべき場面

- **深い操作が必要**: `DeepPartial`, `DeepReadonly`
- **特殊なルール**: 「特定のフィールドだけ optional」「null を除外しつつ optional に」
- **プロジェクト固有の頻出パターン**

詳しくは [[06-自作ユーティリティ型入門]] へ。

---

## 10. 早見表

| 標準型 | 効果 | 内部実装 |
|---|---|---|
| `Partial<T>` | 全プロパティ optional | `{ [K in keyof T]?: T[K] }` |
| `Required<T>` | 全プロパティ必須 | `{ [K in keyof T]-?: T[K] }` |
| `Readonly<T>` | 全プロパティ readonly | `{ readonly [K in keyof T]: T[K] }` |

---

## 11. アンチパターン

### (1) `Partial` で全プロパティを optional にして使い続ける

```typescript
function process(u: Partial<User>) {
  console.log(u.name.toUpperCase()); // ❌ name は undefined の可能性
}
```

→ `Partial` は「**入口で受ける**」用途。**内部では Required な型に絞る**。

```typescript
function process(u: Partial<User>) {
  if (!u.name) return;
  console.log(u.name.toUpperCase()); // ✅
}
```

### (2) `Readonly` を毎回手書きで全プロパティに

```typescript
type T = {
  readonly a: string;
  readonly b: number;
  readonly c: boolean;
};

// ✅
type T = Readonly<{
  a: string;
  b: number;
  c: boolean;
}>;
```

### (3) `Required` で `null` も外せていない

```typescript
type T = { x?: string | null };
type R = Required<T>;
// { x: string | null } ← null は残る
```

→ `NonNullable` と組み合わせる必要あり。

---

## 12. まとめ

- **`Partial<T>`**: 全プロパティを optional に（PATCHや初期値で多用）
- **`Required<T>`**: 全プロパティを必須に（解決後の設定など）
- **`Readonly<T>`**: 全プロパティを書き換え不可に（不変な引数・State）
- すべて**シャロー** ── 深い操作は `DeepPartial` / `DeepReadonly` を自作
- `Readonly` は実行時には消えるので `Object.freeze` 併用も検討
- **入口で `Partial`、内部で `Required` に絞る**のが安全な設計

> この3つはユーティリティ型の**最頻出トリオ**。「全プロパティを一括で変える」処理が必要になったら、まずこの3つを思い出すクセを。

---

## 関連
- [[02-Pick_Omit]]
- [[03-Exclude_Extract_NonNullable]]
- [[06-自作ユーティリティ型入門]]
- [[04-マップ型の基本]]
- [[03-不変を前提にした型]]
