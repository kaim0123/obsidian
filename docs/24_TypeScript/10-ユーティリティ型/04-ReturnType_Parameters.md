# `ReturnType<T>` / `Parameters<T>`

> 関数の型から「**戻り値の型**」「**引数の型**」を取り出すユーティリティ。これが書けると、**「関数の型を書き直さずに派生させる」**ことができ、型と実装の二重管理から解放されます。実務では非常に出番が多く、特に `ReturnType<typeof fn>` は神テクニック。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[03-Exclude_Extract_NonNullable]]
- 次: [[05-ConstructorParameters_InstanceType_ThisType]]

---

## 1. `ReturnType<T>` ── 関数の戻り値型

```typescript
function getUser(): { id: string; name: string } {
  return { id: "1", name: "Alice" };
}

type User = ReturnType<typeof getUser>;
// { id: string; name: string }
```

→ **関数の戻り値型をそのまま型として取り出せる**。

### 内部実装

```typescript
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

`infer` で「**戻り値の型**」を取り出す条件型。詳しくは「14章」で扱います。

### 引数の型としての関数

```typescript
type SomeFn = (a: number) => string;
type R = ReturnType<SomeFn>; // string
```

`typeof` を使う必要があるのは、**関数の値**から型を取り出す場合だけ。

---

## 2. `Parameters<T>` ── 関数の引数型（タプル）

```typescript
function greet(name: string, age: number): void {
  console.log(`Hi, ${name}, ${age}`);
}

type GreetParams = Parameters<typeof greet>;
// [name: string, age: number]
```

戻り値は**タプル型**（ラベル付きタプル）。

### 内部実装

```typescript
type Parameters<T extends (...args: any) => any> =
  T extends (...args: infer P) => any ? P : never;
```

### 個別の引数を取り出す

```typescript
type FirstArg = Parameters<typeof greet>[0]; // string
type SecondArg = Parameters<typeof greet>[1]; // number
```

---

## 3. `ReturnType` の典型的な使い所

### (1) APIクライアントの戻り値型

```typescript
async function fetchUser(id: string) {
  const res = await fetch(`/api/users/${id}`);
  return res.json() as Promise<User>;
}

type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// User （Awaited で Promise を剥がす）
```

→ **関数の戻り値からそのまま型を再利用**。関数を変更すれば型も追従。

### (2) Reduxアクションクリエイタ

```typescript
const setUser = (user: User) => ({ type: "SET_USER" as const, payload: user });
const clearUser = () => ({ type: "CLEAR_USER" as const });

type Action = ReturnType<typeof setUser> | ReturnType<typeof clearUser>;
// | { type: "SET_USER"; payload: User }
// | { type: "CLEAR_USER" }
```

→ **アクションクリエイタの戻り値からアクション型を導出**。手書きの二重管理がなくなる。

### (3) Reactカスタムフック

```typescript
function useUser() {
  const [user, setUser] = useState<User | null>(null);
  return { user, setUser, refresh: () => { /* ... */ } };
}

type UseUserReturn = ReturnType<typeof useUser>;
// { user: User | null; setUser: ...; refresh: () => void }
```

→ フックの返り値を別の場所で使うときに型をDRYに。

### (4) selectorの戻り値

```typescript
const selectUserName = (state: State) => state.user?.name;
type UserName = ReturnType<typeof selectUserName>;
// string | undefined
```

---

## 4. `Parameters` の典型的な使い所

### (1) 関数のラッパー

```typescript
function logged<T extends (...args: any[]) => any>(fn: T): T {
  return ((...args: Parameters<T>) => {
    console.log("called with", args);
    return fn(...args);
  }) as T;
}

const add = (a: number, b: number) => a + b;
const addLogged = logged(add); // (a: number, b: number) => number
```

→ **任意の関数を高階関数で包む**ときに型を保つ。

### (2) 関数の一部だけ事前に渡す（部分適用）

```typescript
function partial<A extends any[], B extends any[], R>(
  fn: (...args: [...A, ...B]) => R,
  ...preset: A
): (...rest: B) => R {
  return (...rest) => fn(...preset, ...rest);
}
```

### (3) 引数の型を別の関数で再利用

```typescript
function loadUser(id: string, options: { include: string[] }) { ... }

function preloadUser(...args: Parameters<typeof loadUser>) {
  // 別の用途で同じ引数を扱う
}
```

---

## 5. `Awaited<T>` ── Promise を剥がす（補足）

`ReturnType` で取り出した戻り値が `Promise<T>` のとき、`Awaited` を併用する。

```typescript
async function loadUser(): Promise<User> { ... }

type Direct = ReturnType<typeof loadUser>;     // Promise<User>
type Resolved = Awaited<ReturnType<typeof loadUser>>; // User
```

`Awaited` は**ネストした Promise も再帰的に剥がす**:

```typescript
type T = Awaited<Promise<Promise<string>>>; // string
```

---

## 6. `typeof` との組み合わせ

`ReturnType` `Parameters` の引数は**型**。**関数の値**から取り出すには `typeof` が必要。

```typescript
function fn(x: number): string { return ""; }

type R1 = ReturnType<typeof fn>;       // string ✅
type R2 = ReturnType<fn>;               // ❌ fn は値、型ではない
```

`fn` という名前の値の型を `typeof fn` で取得 → それを `ReturnType` に渡す、という二段階。

---

## 7. ジェネリック関数の `ReturnType` の制限

ジェネリック関数の `ReturnType` は、**ジェネリクスが解決される前**の型を返す。

```typescript
function identity<T>(x: T): T { return x; }

type R = ReturnType<typeof identity>; // unknown （!）
```

→ ジェネリクスのまま `T` を保てない。具体型で呼び出した値から取る:

```typescript
const result = identity("hello");
type R = typeof result; // string
```

---

## 8. 実例: tRPC ライクな型導出

```typescript
const router = {
  user: {
    list: () => Promise.resolve([] as User[]),
    create: (input: { name: string }) => Promise.resolve({} as User),
  },
};

type Procedures = typeof router;
type ListReturn = Awaited<ReturnType<Procedures["user"]["list"]>>;
// User[]
type CreateInput = Parameters<Procedures["user"]["create"]>[0];
// { name: string }
```

→ **ルーター定義から入出力型を全部自動導出**。これが tRPC の発想の核。

---

## 9. 実例: イベントハンドラ型の取り出し

```typescript
type ButtonProps = {
  onClick: (e: MouseEvent) => void;
};

type ClickHandler = ButtonProps["onClick"];
// (e: MouseEvent) => void

type ClickEvent = Parameters<ClickHandler>[0];
// MouseEvent

type ClickReturn = ReturnType<ClickHandler>;
// void
```

→ **既存のhandler型から各部分を取り出す**。

---

## 10. 落とし穴

### (1) `ReturnType<typeof fn>` を忘れて `ReturnType<fn>` と書く

```typescript
type R = ReturnType<fn>; // ❌
type R = ReturnType<typeof fn>; // ✅
```

### (2) `Promise` を剥がし忘れる

```typescript
async function loadUser() { ... }

type R = ReturnType<typeof loadUser>; // Promise<User>
type R2 = Awaited<ReturnType<typeof loadUser>>; // User
```

### (3) ジェネリック関数で `ReturnType` が `unknown`

```typescript
function map<T, U>(fn: (x: T) => U): U[] { ... }

type R = ReturnType<typeof map>; // unknown[]
```

→ 具体型で呼んだ結果の型を取るか、自前のジェネリクスで処理。

### (4) `Parameters` の戻り値はタプル

```typescript
function fn(a: number, b: string) { ... }
type P = Parameters<typeof fn>; // [a: number, b: string]
```

`P[0]` のように個別アクセス可能。

### (5) オーバーロード関数の `Parameters` は最後のシグネチャしか取れない

```typescript
function f(x: number): string;
function f(x: string): number;
function f(x: any): any { return x; }

type P = Parameters<typeof f>; // [x: string] （最後）
type R = ReturnType<typeof f>; // number （最後）
```

→ オーバーロードを `Parameters` で扱うのは制限あり。

---

## 11. 関連ユーティリティ（Awaited / ThisParameterType / OmitThisParameter）

| 標準型 | 効果 |
|---|---|
| `Awaited<T>` | Promise の中身を取り出す（再帰） |
| `ThisParameterType<T>` | 関数の `this` パラメータ型 |
| `OmitThisParameter<T>` | `this` パラメータを除いた関数型 |

```typescript
type T = Awaited<Promise<string>>; // string

function f(this: User, x: number): string { return ""; }

type Th = ThisParameterType<typeof f>; // User
type Without = OmitThisParameter<typeof f>; // (x: number) => string
```

`this` 系は実務での出番は限定的だが、覚えておくと役立つ場面がある。

---

## 12. ベストプラクティス

### (1) **アクションクリエイタの戻り値は `as const`**

```typescript
const setUser = (u: User) => ({ type: "SET_USER" as const, payload: u });
type Action = ReturnType<typeof setUser>;
// { type: "SET_USER"; payload: User }
```

`as const` がないと `type: string` に広がってしまう。

### (2) **ライブラリ作者は `ReturnType` を露出しない**

```typescript
// ❌ ユーザに ReturnType を強制
export type Result = ReturnType<typeof internalFn>;

// ✅ 明示的に型を export
export type Result = { value: number; status: string };
```

外部からは「**この型はこういう形**」が見えるべき。`ReturnType` でブラックボックス化しない。

### (3) **APIレスポンスは `Awaited<ReturnType<...>>` で取り出す**

```typescript
type FetchResult<T> = Awaited<ReturnType<T>>;

type UserData = FetchResult<typeof fetchUser>;
```

ヘルパ型化しておくとさらに便利。

### (4) **手書きで型を二重管理しない**

```typescript
// ❌
const getUser = (): User => { ... };
type UserResult = User; // 同じ型を別名で書く

// ✅
const getUser = () => ({ id: "1", name: "Alice" });
type UserResult = ReturnType<typeof getUser>;
```

---

## 13. 早見表

| 標準型 | 用途 |
|---|---|
| `ReturnType<T>` | 関数の戻り値型 |
| `Parameters<T>` | 関数の引数型（タプル） |
| `Awaited<T>` | Promise の中身 |
| `ThisParameterType<T>` | this パラメータ |
| `OmitThisParameter<T>` | this を除いた関数型 |

---

## 14. まとめ

- **`ReturnType<typeof fn>`**: 関数の戻り値型を取り出す → 派生型に最適
- **`Parameters<typeof fn>`**: 関数の引数型をタプルとして取り出す
- **`Awaited<T>`**: Promise の中身（再帰）
- **アクションクリエイタ + `as const` + `ReturnType`** で Redux 型を自動生成
- **API/フックの戻り値**を`ReturnType`で取り出すと**手書き二重管理が消える**
- 落とし穴: `typeof` 必須 / Promise は `Awaited` で剥がす / ジェネリクスは解決前の型 / オーバーロードは最後のみ

> `ReturnType` と `Parameters` は「**実装と型の同期コスト**を消す道具」。コードを変えれば型も自動で追従するように設計すれば、保守は劇的に楽になります。

---

## 関連
- [[03-Exclude_Extract_NonNullable]]
- [[05-ConstructorParameters_InstanceType_ThisType]]
- [[03-keyofとインデックスアクセス型]]
- [[03-voidとPromiseとasync]]
