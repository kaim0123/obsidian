# `readonly` と getter / setter

> クラスのフィールドを「**書き換えさせない**」「**読み取り時に計算する**」「**書き込み時に検証する**」── それぞれを担うのが `readonly` と getter / setter です。便利ですが、使いすぎると複雑性のもとにもなる。**「シンプルに保つ」「真の不変が必要なら readonly を活用」「getter/setter は限定的に」**が現代的な指針です。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[02-implementsとアクセス修飾子]]
- 次: [[04-抽象クラスの使いどころ]]

---

## 1. `readonly` フィールド

クラスのフィールドに付けると **書き換え不可** になる。

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

### コンストラクタ内では代入できる

```typescript
class User {
  readonly id: string;
  constructor(id: string) {
    this.id = id; // ✅ コンストラクタ内はOK
  }
}
```

`readonly` は「**コンストラクタ後は変更不可**」という意味。

### パラメータプロパティと組み合わせ

```typescript
class Point {
  constructor(
    readonly x: number,
    readonly y: number
  ) {}
}
```

→ 短く書ける。**値オブジェクトの定番形**。

---

## 2. クラスフィールドの `readonly` を使う場面

### (1) 値オブジェクト

```typescript
class Money {
  constructor(
    readonly amount: number,
    readonly currency: string
  ) {}

  add(other: Money): Money {
    return new Money(this.amount + other.amount, this.currency);
  }
}
```

→ 不変な値オブジェクト（[[03-不変を前提にした型]] 参照）。

### (2) ID・設定値

```typescript
class User {
  readonly id: string;
  name: string;
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}
```

ID は作成時に固定したい。`name` は変えてもいいが、`id` は不変。

### (3) 依存性注入したサービス

```typescript
class OrderService {
  constructor(
    private readonly db: Database,
    private readonly logger: Logger
  ) {}
}
```

外から渡された依存は**書き換え不可**にしておくのが安全。

---

## 3. `readonly` の落とし穴（再掲）

### (1) シャロー（中身は変えられる）

```typescript
class Group {
  readonly members: string[] = [];
}

const g = new Group();
g.members = []; // ❌
g.members.push("a"); // ✅ 中身は変えられる
```

→ 完全な不変が必要なら **`readonly string[]`** にする:

```typescript
class Group {
  readonly members: readonly string[] = [];
}

g.members.push("a"); // ❌
```

### (2) コンパイル時のみ

`readonly` も `private` と同じく**実行時には消える**。本当に防ぎたければ `Object.freeze`、または getter のみ公開して内部変数は隠す。

---

## 4. getter / setter（アクセサ）

「**プロパティのように見えるが、内部はメソッド**」を作る仕組み。

### 基本構文

```typescript
class Temperature {
  private _celsius: number = 0;

  get celsius(): number {
    return this._celsius;
  }

  set celsius(value: number) {
    if (value < -273.15) throw new Error("below absolute zero");
    this._celsius = value;
  }
}

const t = new Temperature();
t.celsius = 25;       // setter が呼ばれる
console.log(t.celsius); // getter が呼ばれる → 25
```

外からは**プロパティのように使える**が、内部で計算・検証ができる。

---

## 5. getter のみ（読み取り専用）

setterを書かないと、**読み取り専用プロパティ**になる。

```typescript
class Circle {
  constructor(readonly radius: number) {}

  get area(): number {
    return Math.PI * this.radius ** 2; // 読むたびに計算
  }
}

const c = new Circle(5);
console.log(c.area); // ✅
c.area = 100;        // ❌ setterがないので書き込めない
```

→ **計算プロパティ**を表現するのに便利。

---

## 6. getter / setter の使い所

### (1) 計算プロパティ

```typescript
class Rectangle {
  constructor(public width: number, public height: number) {}
  get area(): number { return this.width * this.height; }
  get perimeter(): number { return 2 * (this.width + this.height); }
}
```

「フィールドに見えるが、毎回計算」したいとき。

### (2) バリデーション付き書き込み

```typescript
class Age {
  private _value: number = 0;

  get value(): number { return this._value; }
  set value(v: number) {
    if (v < 0 || v > 150) throw new Error("invalid age");
    this._value = v;
  }
}
```

「セットされた瞬間にチェック」したいとき。

### (3) 内部表現と外部APIを分ける

```typescript
class Distance {
  private meters: number;
  constructor(meters: number) { this.meters = meters; }

  get inMeters(): number { return this.meters; }
  get inKilometers(): number { return this.meters / 1000; }
  get inFeet(): number { return this.meters * 3.28084; }
}
```

内部は1つの値、外部は複数の見え方。

### (4) 副作用の発火（注意して使う）

```typescript
class Counter {
  private _count = 0;
  get count(): number { return this._count; }
  set count(v: number) {
    this._count = v;
    this.notify(); // 副作用
  }
  private notify() { /* ... */ }
}
```

「セットされたら通知する」ような使い方。**ただし副作用は読み手を驚かせる**ので、`setCount(v)` メソッドの方が分かりやすいことも。

---

## 7. getter / setter のデメリット

### (1) **見た目はフィールド、実体はメソッド**

```typescript
const u = new User();
u.name; // 副作用がないように見えるが、実は計算しているかも
```

→ 読み手が「軽量なアクセス」と誤解する可能性。

### (2) **デバッグしにくい**

ブレークポイントを set/get に張れるが、フィールドアクセスと見た目が同じなので追いにくい。

### (3) **JSON化で消える**

```typescript
class Circle {
  constructor(public radius: number) {}
  get area() { return Math.PI * this.radius ** 2; }
}

JSON.stringify(new Circle(5));
// '{"radius":5}'  area は含まれない
```

JSONには getter は含まれない。永続化や送信時に注意。

### (4) **継承時のオーバーライドが複雑**

派生クラスで getter/setterの一部だけオーバーライドすると挙動がややこしい。

---

## 8. getter/setter を使わない代替

### メソッドで書く

```typescript
// ❌ getter/setter
class Temperature {
  private _c: number = 0;
  get celsius(): number { return this._c; }
  set celsius(v: number) {
    if (v < -273.15) throw new Error();
    this._c = v;
  }
}

// ✅ メソッド
class Temperature {
  private _c: number = 0;
  getCelsius(): number { return this._c; }
  setCelsius(v: number): void {
    if (v < -273.15) throw new Error();
    this._c = v;
  }
}
```

メソッドの方が「**何かが起きる**」ことが明示的。

### 不変な値オブジェクト

```typescript
class Temperature {
  constructor(readonly celsius: number) {
    if (celsius < -273.15) throw new Error();
  }

  withCelsius(c: number): Temperature {
    return new Temperature(c);
  }
}
```

setterの代わりに**新しいインスタンスを返す**。`Money` パターンと同じ。

→ 不変設計と相性が良く、**現代のTSではこちらが主流**。

---

## 9. `interface` での getter / setter

`interface` でもアクセサを宣言できる:

```typescript
interface HasName {
  get name(): string;
  set name(v: string);
}

class User implements HasName {
  private _name = "";
  get name() { return this._name; }
  set name(v: string) { this._name = v; }
}
```

ただし、TypeScriptの古いバージョンでは `name: string` と書くだけで実装側が getter/setter で実装してもOKになる。**`get` / `set` を明示するメリットは薄い**。

---

## 10. `readonly` と getter only の違い

両方「読み取り専用」を表現するが、ニュアンスが違う:

| | `readonly` | getter only |
|---|---|---|
| 値が決まる時 | コンストラクタ | アクセス時に計算 |
| 内部状態の変更で変わるか | ❌ 固定 | ✅ 変わりうる |
| パフォーマンス | アクセスは速い | 毎回計算 |
| 用途 | 不変な値 | 派生プロパティ |

```typescript
// readonly: 一度決めたら変わらない
class User {
  constructor(readonly id: string) {}
}

// getter: 内部状態に依存
class Cart {
  private items: Item[] = [];
  get total(): number { return this.items.reduce(...); }
}
```

---

## 11. `static` の readonly / getter

クラス自体に属する**静的メンバー**にも `readonly` と getter が使える。

```typescript
class Config {
  static readonly version = "1.0.0";

  static get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }
}

console.log(Config.version);        // "1.0.0"
console.log(Config.isProduction);    // true / false
```

「クラス全体の定数」「環境依存の派生値」などに。

---

## 12. アンチパターン

### (1) getter/setter で重い処理

```typescript
class Foo {
  get data() {
    return fetch("/api").then(r => r.json()); // ❌ 副作用 + 非同期
  }
}
```

→ プロパティが軽量だと思った呼び出し側が裏切られる。**メソッド**にする。

### (2) setter で他のフィールドを連動

```typescript
class Form {
  private _name = "";
  set name(v: string) {
    this._name = v;
    this.validate(); // 副作用
    this.markDirty(); // 副作用
  }
}
```

→ 動作が見えにくい。**明示的なメソッド**で。

### (3) `readonly` + 配列で「変更不可」と勘違い

```typescript
class Group {
  readonly members: string[] = [];
}

const g = new Group();
g.members.push("a"); // 通る！
```

→ `readonly readonly[]` か、push 用のメソッドを `private members` にする。

### (4) getter/setter とフィールドが混在して可読性が落ちる

```typescript
class User {
  name: string = "";
  age: number = 0;
  get fullName() { ... }
  set email(v) { ... }
  email: string = ""; // setterあり、フィールドあり、混乱
}
```

→ 「**全部 readonly + メソッド**」か「**全部 public フィールド**」のように統一。

---

## 13. 実務的な指針

| 状況 | 推奨 |
|---|---|
| 不変な値オブジェクト | `readonly` フィールド |
| 派生プロパティ（軽量） | getter only |
| バリデーション付き書き込み | コンストラクタで検証 + 不変 / setter は最終手段 |
| 副作用がある書き込み | メソッド（`set` ではなく） |
| 静的定数 | `static readonly` |
| 重い処理 | メソッド（`async` / `Promise<T>` 戻り値） |

---

## 14. まとめ

- **`readonly`** = フィールドを書き換え不可（コンストラクタ後は固定）
- パラメータプロパティと組み合わせるとすっきり: `constructor(readonly x: number) {}`
- **getter** = 計算プロパティ、内部状態から派生する値
- **setter** = バリデーション付き書き込み（ただし副作用は要注意）
- 落とし穴: シャロー / 実行時に消える / JSON化で getter は含まれない
- **メソッド**で代用できるなら setter を避け、不変設計を優先

> `readonly` は「**変えない約束**」、getter/setter は「**プロパティの仮面をかぶったメソッド**」。前者はどんどん使い、後者は本当に必要な場面だけに留める ── このバランスが、読みやすいクラス設計の秘訣です。

---

## 関連
- [[02-implementsとアクセス修飾子]]
- [[04-抽象クラスの使いどころ]]
- [[03-不変を前提にした型]]
- [[01-ドメインモデルの表現]]
