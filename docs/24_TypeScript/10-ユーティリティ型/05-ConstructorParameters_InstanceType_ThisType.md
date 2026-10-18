# `ConstructorParameters<T>` / `InstanceType<T>` / `ThisType<T>`

> クラス・コンストラクタ・`this` に関わる標準ユーティリティ。**普段はあまり使わない**けれど、ライブラリ作者・複雑なファクトリ・DIコンテナを書くときに「**これがあるんだ**」と思い出せると非常に強力です。読み物として把握しておきましょう。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[04-ReturnType_Parameters]]
- 次: [[06-自作ユーティリティ型入門]]

---

## 1. `ConstructorParameters<T>` ── コンストラクタの引数型

クラスのコンストラクタ引数をタプル型として取り出す。

```typescript
class User {
  constructor(public id: string, public name: string, public age: number) {}
}

type Args = ConstructorParameters<typeof User>;
// [id: string, name: string, age: number]
```

### 内部実装

```typescript
type ConstructorParameters<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: infer P) => any ? P : never;
```

### 使い所

#### (1) ファクトリ関数

```typescript
function createInstance<T extends new (...args: any[]) => any>(
  Cls: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Cls(...args);
}

const u = createInstance(User, "u1", "Alice", 30);
// u: User
```

→ 「**任意のクラスをインスタンス化する汎用ファクトリ**」を型安全に。

#### (2) DIコンテナ

```typescript
class Container {
  resolve<T extends new (...args: any[]) => any>(
    Cls: T,
    ...args: ConstructorParameters<T>
  ): InstanceType<T> {
    return new Cls(...args);
  }
}
```

#### (3) constructorをラップ

```typescript
function loggedConstructor<T extends new (...args: any[]) => any>(
  Cls: T
) {
  return class extends Cls {
    constructor(...args: ConstructorParameters<T>) {
      console.log("creating", Cls.name, args);
      super(...args);
    }
  };
}
```

---

## 2. `InstanceType<T>` ── クラス → インスタンス型

クラス型から、そのインスタンスの型を取り出す。

```typescript
class User {
  constructor(public name: string) {}
}

type UserInstance = InstanceType<typeof User>;
// User
```

### 内部実装

```typescript
type InstanceType<T extends abstract new (...args: any) => any> =
  T extends abstract new (...args: any) => infer R ? R : any;
```

### `User` を直接書くのと何が違う？

```typescript
type T = User;                          // 直接
type T2 = InstanceType<typeof User>;     // ユーティリティ経由
```

実は**同じ**。普段は `User` で済む。**ジェネリクスでクラス自体を受け取るとき**に意義が出る。

```typescript
function create<T extends new (...args: any[]) => any>(Cls: T): InstanceType<T> {
  return new Cls();
}

const u = create(User); // InstanceType<typeof User> = User
```

---

## 3. `ConstructorParameters` + `InstanceType` のセット

「**クラスを受け取って、引数で初期化したインスタンスを返す**」関数の定番:

```typescript
function build<T extends new (...args: any[]) => any>(
  Cls: T,
  ...args: ConstructorParameters<T>
): InstanceType<T> {
  return new Cls(...args);
}

const u = build(User, "Alice");
// u: User
```

→ ジェネリクスでクラスを抽象化するときの**必須テクニック**。

---

## 4. `ThisType<T>` ── オブジェクト型での `this` の型を制御

オブジェクトリテラルで定義したメソッドの `this` の型を**指定**する。

```typescript
type Person = {
  name: string;
  greet(): void;
};

const person: Person & ThisType<Person> = {
  name: "Alice",
  greet() {
    console.log(this.name); // ✅ this: Person と推論される
  },
};
```

### 何が嬉しいのか

通常、オブジェクトリテラル内の `this` は推論される（オブジェクト自身）が、型が複雑になると推論できないことがある。`ThisType<T>` で明示。

### 典型例: Vue 2 のオプションオブジェクト

```typescript
type VueOptions<D, M> = {
  data: () => D;
  methods: M & ThisType<D & M>;
};

const options: VueOptions<{ count: number }, { increment(): void }> = {
  data: () => ({ count: 0 }),
  methods: {
    increment() {
      this.count++; // ✅ this: { count: number } & { increment(): void }
    },
  },
};
```

→ Vue 2 の Options API の型定義などで使われている。実務で自分で書くことは稀。

---

## 5. これらの使い方の現実

### 普段の TS コードでは…

| 標準型 | 自分で書く頻度 |
|---|---|
| `ConstructorParameters<T>` | 稀（DI / ファクトリ） |
| `InstanceType<T>` | 稀（同上） |
| `ThisType<T>` | ほぼなし（ライブラリ作者向け） |

→ **アプリ開発では出番が少ない**。ただし `Cls` を引数で受け取るような汎用ヘルパでは使える。

---

## 6. 実例: クラス階層を抽象化したファクトリ

```typescript
abstract class Animal {
  abstract speak(): string;
  constructor(public name: string) {}
}

class Dog extends Animal {
  speak() { return "Woof"; }
}

class Cat extends Animal {
  speak() { return "Meow"; }
}

function adoptAnimal<T extends new (name: string) => Animal>(
  AnimalCls: T,
  name: string
): InstanceType<T> {
  return new AnimalCls(name);
}

const d = adoptAnimal(Dog, "Pochi");  // d: Dog
const c = adoptAnimal(Cat, "Tama");    // c: Cat
```

→ クラスを引数で受け取り、インスタンスの**具体的な型**を返せる。

---

## 7. 実例: シングルトン化

```typescript
function singleton<T extends new (...args: any[]) => any>(
  Cls: T
): (...args: ConstructorParameters<T>) => InstanceType<T> {
  let instance: InstanceType<T> | null = null;
  return (...args) => {
    if (!instance) instance = new Cls(...args);
    return instance;
  };
}

class Database {
  constructor(public url: string) {}
}

const getDB = singleton(Database);
const db1 = getDB("postgres://...");
const db2 = getDB("ignored"); // 同じインスタンス
```

→ 「**任意のクラスをシングルトン化**」する高階関数。

---

## 8. 落とし穴

### (1) `abstract class` は `new` できないがコンストラクタは取れる

```typescript
abstract class Foo {
  constructor(public x: number) {}
}

type Args = ConstructorParameters<typeof Foo>; // [x: number]
new Foo(1); // ❌ 抽象クラスはインスタンス化不可
```

`InstanceType` も型としては取れるが、`new` できない点に注意。

### (2) `private constructor` を持つクラス

```typescript
class Singleton {
  private constructor() {}
}

type Args = ConstructorParameters<typeof Singleton>; // 取れない（エラー）
```

→ private なら外から `new` できないので、ジェネリクスで扱えない。

### (3) `ThisType` は `noImplicitThis` と組み合わせて

`ThisType<T>` の効果を最大化するには `noImplicitThis: true`（または `strict: true`）が必要。

### (4) ジェネリッククラスの扱い

```typescript
class Container<T> {
  constructor(public value: T) {}
}

// type C = ConstructorParameters<typeof Container>; // [value: unknown]
```

→ ジェネリクスは解決される前の型になりがち。

---

## 9. 関連: モダンTSではあまり使わない理由

### (1) クラスを使わない設計が増えている

React フックのように、**クラス + 継承を回避**する設計が主流。`InstanceType` の出番も減る。

### (2) `interface` + 関数 + DIで解決

「クラスを引数で受け取る」よりも、「**ファクトリ関数を引数で受け取る**」方が柔軟:

```typescript
function create<T>(factory: () => T): T {
  return factory();
}

const u = create(() => new User("Alice"));
```

→ クラス型を直接扱う必要がなくなる。

### (3) `ThisType` は Vue 2 専用パターン

Vue 3 の Composition API では `ThisType` を使わない。React も `this` を使わない方向。

---

## 10. それでも使う場面

- **DIコンテナ**を自作する（NestJS のようなもの）
- **ORMやフレームワーク**でクラスを動的に扱う
- **ファクトリパターン**を型安全にする
- **mixin 関数**（クラスを拡張する高階関数）
- **シングルトン化**ユーティリティ

---

## 11. 早見表

| 標準型 | 効果 | 主な用途 |
|---|---|---|
| `ConstructorParameters<T>` | コンストラクタの引数型（タプル） | ファクトリ、DI |
| `InstanceType<T>` | クラス型 → インスタンス型 | ジェネリック関数の戻り値 |
| `ThisType<T>` | オブジェクト内の `this` 型を指定 | Vue 2 オプション API |

---

## 12. 「読めれば十分」 ── 知識として持っておく

これらは **「読み物」** として把握。実装パターンを覚えるより、

- 「ジェネリクスでクラス自体を受け取るときに使う」
- 「`new Cls(...args)` 系のヘルパで使う」
- 「`this` の型がオブジェクトリテラルで効かないときの最後の手段が `ThisType`」

くらいを知っていれば、必要になったときに調べて使えます。

---

## 13. まとめ

- **`ConstructorParameters<T>`**: クラスのコンストラクタ引数型（タプル）
- **`InstanceType<T>`**: クラス型 → インスタンス型
- **`ThisType<T>`**: オブジェクト内の `this` 型を明示
- **アプリ開発では出番が少ない**。ライブラリ・DI・ファクトリで活躍
- `ConstructorParameters` + `InstanceType` の**ペアで使う**のが定番
- `ThisType` は Vue 2 やオプションオブジェクトAPI 用、現代では出番が減少

> これら3つは「**TypeScript には用意があるが、普段の開発では稀**」な標準型。クラスを動的に扱う場面で「**そういえばあった**」と思い出せれば十分です。

---

## 関連
- [[04-ReturnType_Parameters]]
- [[06-自作ユーティリティ型入門]]
- [[02-implementsとアクセス修飾子]]
- [[05-thisと関数の落とし穴]]
