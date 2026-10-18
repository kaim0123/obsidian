# `implements` と `public` / `private` / `protected`

> クラスは「**何ができるか**」を `implements` で契約し、「**何を見せるか**」をアクセス修飾子で制御します。TypeScript ならではの `private` の挙動、`#private`（ECMAScript標準）との違い、そして「**実は `implements` を使わなくてもよくなりつつある**」現代の実情まで整理します。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[01-interfaceとtypeの使い分け]]
- 次: [[03-readonlyとgetter_setter]]

---

## 1. `implements` ── クラスが contract を満たす

`implements` は「**このクラスは指定したインターフェース/型を満たす**」と宣言する。

```typescript
interface Logger {
  log(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string) { console.log(message); }
  error(message: string) { console.error(message); }
}
```

**コンパイラが「全メソッドを実装したか」をチェック**してくれる。

### 不足があるとエラー

```typescript
class IncompleteLogger implements Logger {
  log(message: string) { console.log(message); }
  // error がない！
}
// ❌ Class 'IncompleteLogger' incorrectly implements interface 'Logger'.
```

### 複数 implements

```typescript
interface Readable { read(): string }
interface Writable { write(s: string): void }

class File implements Readable, Writable {
  read() { return "..."; }
  write(s: string) { /* ... */ }
}
```

複数のインターフェースを同時に実装可能。

### `type` でも `implements` できる

```typescript
type Logger = {
  log(msg: string): void;
};

class ConsoleLogger implements Logger {
  log(msg: string) { console.log(msg); }
}
```

→ `type` でも構わない。慣習的に `interface` が好まれるだけ。

---

## 2. `implements` の重要な制限

### `implements` は型の方向だけをチェック

```typescript
interface Foo {
  x: number;
}

class Bar implements Foo {
  x = 0;
  y = 0; // ✅ 追加プロパティはOK
}
```

「**最低限満たしているか**」のチェックなので、追加プロパティは構わない。

### `implements` は型を**変えない**

```typescript
class Bar implements Foo {
  // x は number と推論されるが…
}
```

`implements` の宣言で型が**伝播しない**。例えば、メソッド引数の型は明示しないと `any` になる:

```typescript
interface OnClick {
  handle(e: MouseEvent): void;
}

class Btn implements OnClick {
  handle(e) { } // ❌ e: any（implementsから引数型は引き継がない）
}
```

→ **メソッドの引数型は明示的に書く**必要がある。

```typescript
class Btn implements OnClick {
  handle(e: MouseEvent) { }
}
```

---

## 3. `extends` と `implements` の違い

| | `extends` | `implements` |
|---|---|---|
| 対象 | 親クラス | インターフェース/type |
| 数 | 1つだけ | 複数可 |
| 実装の継承 | する | しない |
| プロパティ初期化の継承 | する | しない |

```typescript
class Animal {
  name: string;
  constructor(name: string) { this.name = name; }
  speak() { console.log(this.name); }
}

class Dog extends Animal {
  // name もspeak() も継承される
}

class Robot implements Animal {
  // 全部自分で実装する必要がある（name の宣言、constructor、speak）
  name: string;
  constructor(name: string) { this.name = name; }
  speak() { console.log("[robot]", this.name); }
}
```

→ **継承は重い**、**implementsは契約のみ**。

---

## 4. アクセス修飾子の3種類

クラスのフィールド/メソッドに**可視性**を指定する。

### `public`（デフォルト）

どこからでもアクセス可能。書かなくてOK（暗黙のpublic）。

```typescript
class User {
  public name: string = "Alice"; // = name: string と同じ
}
```

### `private`

**そのクラスの中だけ**からアクセス可能。

```typescript
class User {
  private password: string = "";

  setPassword(p: string) {
    this.password = p; // ✅
  }
}

const u = new User();
u.password; // ❌ Property 'password' is private
```

### `protected`

**そのクラスと派生クラス**からアクセス可能。

```typescript
class Animal {
  protected name: string;
  constructor(name: string) { this.name = name; }
}

class Dog extends Animal {
  bark() {
    console.log(this.name); // ✅ 派生クラスからアクセス可
  }
}

const d = new Dog("Pochi");
d.name; // ❌ 外からはNG
```

---

## 5. TypeScript の `private` は「コンパイル時のみ」

ここが重要な落とし穴。**TypeScriptの `private` は実行時には消える**。

```typescript
class User {
  private password: string = "secret";
}

const u = new User();
console.log((u as any).password); // ✅ "secret"（取れてしまう）
```

→ **JavaScriptの仕様にはない概念**。コンパイル時のチェックだけ。

### 実行時にも本当の `private` がほしいなら: `#private`

ECMAScript 標準の **「ハッシュプライベート」** を使うと、JavaScriptレベルで本当に隠せる。

```typescript
class User {
  #password: string;

  constructor(p: string) {
    this.#password = p;
  }
}

const u = new User("secret");
(u as any)["#password"]; // undefined
(u as any).password;     // undefined
```

`#` プレフィックスのフィールドは**外から絶対にアクセス不可**。

| | TypeScript の `private` | `#private`（ECMAScript標準） |
|---|---|---|
| 実行時の隠蔽 | ❌ ない | ✅ ある |
| アクセス記法 | `this.x` | `this.#x` |
| 派生クラスから | ❌ アクセス不可 | ❌ アクセス不可 |
| ブラウザ対応 | TS が JS にコンパイル | 一部古い環境で要polyfill |
| 命名規約 | 自由 | `#` プレフィックス必須 |

→ **本当の隠蔽が必要なら `#private`**、TS的なコンパイルチェックでよければ `private`。

---

## 6. constructor での簡潔記法（パラメータプロパティ）

引数に修飾子を付けると、**そのまま同名のフィールドが作られる**。

```typescript
// ❌ 冗長
class User {
  name: string;
  age: number;
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// ✅ パラメータプロパティ
class User {
  constructor(
    public name: string,
    public age: number,
    private password: string,
    readonly id: string
  ) {}
}
```

→ コードがすっきりする。`readonly` も組み合わせ可能。

---

## 7. `readonly` 修飾子

**書き換え不可**のフィールド。

```typescript
class Point {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

const p = new Point(1, 2);
p.x = 10; // ❌ Cannot assign to 'x' because it is a read-only property.
```

`private` などと組み合わせも可能:

```typescript
class User {
  constructor(public readonly id: string) {}
}
```

詳しくは [[03-readonlyとgetter_setter]] へ。

---

## 8. `implements` を使う / 使わない

### 使うべき場面

#### (1) 複数の実装が交換可能なとき（DI / Strategy）

```typescript
interface Logger {
  log(msg: string): void;
}

class ConsoleLogger implements Logger { ... }
class FileLogger implements Logger { ... }
class NoopLogger implements Logger { ... }

function process(logger: Logger) { ... }
process(new FileLogger());  // ✅ 差し替え可能
```

→ **モック化・テスト容易性**にも貢献。

#### (2) ライブラリの contract を満たす

```typescript
class MyError extends Error implements Error { ... }
```

#### (3) チーム内で「このAPI を満たす」と明示したい

### 使わなくてよい場面

#### (1) クラスを直接型として使う場合

```typescript
class User {
  constructor(public name: string) {}
}

function f(u: User) { ... } // クラスがそのまま型として使える
```

→ `interface User` を別途定義する必要がない。

#### (2) シングルトンや 1 種類しか実装がない場合

```typescript
class Database { ... } // 唯一の実装、interfaceは不要
```

#### (3) 関数型の方が自然な場合

```typescript
type Logger = {
  log: (msg: string) => void;
};

const consoleLogger: Logger = {
  log: (msg) => console.log(msg),
};
```

→ **クラスを使わずに済むなら使わない**のが現代の主流。

---

## 9. ECMAScript と TypeScript の互換性

### ES2022 で標準化された機能

- `#private`（ハッシュプライベート）
- パブリックフィールド宣言
- static フィールド

### TS独自の機能

- アクセス修飾子（`private` / `protected` / `public`）
- パラメータプロパティ（`constructor(public x: number) {}`）
- `implements`
- `abstract`

→ **TS独自の機能はコンパイル時に消える**。ランタイムには影響しない。

---

## 10. 実務での「クラス vs 関数」

現代のTypeScript実務では、**クラスを使わない**選択肢も増えています。

| アプローチ | 例 |
|---|---|
| クラス + メソッド | OOP的、状態を持つ、継承 |
| 関数 + 型 | 関数型、純粋、テストしやすい |
| クロージャ | 関数 + 内部状態の隠蔽 |

### React: フック化でクラスは絶滅

```typescript
// ❌ 旧: クラスコンポーネント
class Counter extends React.Component { ... }

// ✅ 新: 関数コンポーネント + useState
function Counter() {
  const [count, setCount] = useState(0);
  return ...;
}
```

→ Reactでは**クラスを使わない**のがほぼ標準。

### Node.js / バックエンド: 状態を持つドメインオブジェクトには有用

```typescript
class ShoppingCart {
  private items: Item[] = [];
  add(item: Item) { ... }
  total(): number { ... }
}
```

→ ドメインモデル・複雑な状態管理にはクラスも有効。

### **判断基準**: 「状態 + 振る舞い」の塊が必要かどうか。それ以外は関数で。

---

## 11. アンチパターン

### (1) 全フィールドを `public` のまま晒す

```typescript
class User {
  password = ""; // public
}
```

→ **隠すべきものは `private` か `#`**。

### (2) `private` で隠した気になる

```typescript
class Secret {
  private key = "...";
}
new Secret() as any).key; // 取れてしまう
```

→ 本当に隠したいなら `#private`。

### (3) クラスにすべきでないものをクラスにする

```typescript
class MathUtils {
  static add(a: number, b: number) { return a + b; }
}
```

→ static のみのクラスは **モジュール（`export function add`）** で十分。

### (4) `implements` だけ書いて型補完を期待

```typescript
class Btn implements OnClick {
  handle(e) { } // e: any
}
```

→ メソッドの引数型は**明示的に**書く。

### (5) `public readonly` の組み合わせを使わない

```typescript
class Point {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// ✅ パラメータプロパティ + readonly
class Point {
  constructor(public readonly x: number, public readonly y: number) {}
}
```

---

## 12. アクセス修飾子・記法 早見表

| 書き方 | 効果 |
|---|---|
| `public x` | どこからでもアクセス可（暗黙のデフォルト） |
| `private x` | クラス内のみ（コンパイル時チェック） |
| `protected x` | クラス内 + 派生クラス |
| `#x` | クラス内のみ（実行時も保護） |
| `readonly x` | 書き換え不可 |
| `constructor(public x: number)` | 引数 + フィールド宣言 + 代入を一括 |
| `static x` | クラスインスタンスではなくクラス自体に属する |

---

## 13. まとめ

- **`implements`**: クラスが contract（インターフェース/型）を満たすことを宣言
- アクセス修飾子: **`public`** / **`private`** / **`protected`**（コンパイル時チェック）
- TS の `private` は**実行時には消える** → 本当に隠すなら **`#private`**
- **パラメータプロパティ**で constructor をすっきり書ける
- `implements` は**複数実装が交換可能**な場面で使う
- 現代のTSは**クラスを使わない**選択肢も多い（特にReact）

> クラスは「**状態 + 振る舞い + 多態性**」が必要な場面の道具。それ以外なら関数 + 型で十分。`implements` と `private` は「**契約と隠蔽**」の道具として、必要な場所だけで使うのが洗練されたスタイルです。

---

## 関連
- [[01-interfaceとtypeの使い分け]]
- [[03-readonlyとgetter_setter]]
- [[04-抽象クラスの使いどころ]]
