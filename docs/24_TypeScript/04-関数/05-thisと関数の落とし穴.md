# `this` と関数の落とし穴

> JavaScriptの `this` は「**呼び出し方によって値が変わる**」最大の闇です。TypeScriptは型でこれを補助してくれますが、仕組みを理解していないと「なぜか undefined になる」「なぜか別のオブジェクトを参照する」というバグに必ずハマります。ここで一度、整理しておきましょう。

## 目次
- [[010Programming/目次|← 教材目次に戻る]]
- 前: [[04-オーバーロード]]

---

## 1. JavaScriptの `this` の基本

`this` は「**関数を呼び出した時点で決まる**」値です。**定義された場所ではなく、呼ばれた場所**で決まる ── これが混乱の源。

### 4つの呼び出しパターン

```typescript
// (1) メソッド呼び出し → thisは . の左側
obj.method(); // this === obj

// (2) 関数呼び出し → this は undefined（strict mode）
fn(); // this === undefined

// (3) コンストラクタ呼び出し → this は新しいインスタンス
new Foo(); // this === 新しいインスタンス

// (4) 明示指定（call/apply/bind）
fn.call(target); // this === target
```

---

## 2. 一番よくある罠: メソッドを変数に取り出すと `this` が消える

```typescript
class Counter {
  count = 0;
  increment() {
    this.count++;
  }
}

const c = new Counter();
c.increment();          // ✅ this === c

const fn = c.increment;
fn();                   // ❌ this === undefined → ランタイムエラー
```

### 何が起きているか

`c.increment` は「**関数オブジェクトへの参照**」を取り出すだけ。`this` の情報は持っていない。`fn()` で呼ぶと、呼び出し時点では `c` との関連が失われている。

### よく出る場面

```typescript
class App {
  message = "hello";
  greet() { console.log(this.message); }
}

const app = new App();

// イベントハンドラに渡す
button.addEventListener("click", app.greet); // ❌ this が button になる
```

```typescript
// setTimeout に渡す
setTimeout(app.greet, 1000); // ❌ this が undefined
```

```typescript
// 配列メソッドのコールバック
arr.forEach(app.greet); // ❌ this が undefined
```

すべて同じ原因。

---

## 3. 解決策

### (1) アロー関数でラップする

```typescript
button.addEventListener("click", () => app.greet());
setTimeout(() => app.greet(), 1000);
arr.forEach(item => app.greet());
```

アロー関数は **`this` を持たない**（外側の `this` をそのまま使う）。確実。

### (2) `bind` で `this` を固定する

```typescript
button.addEventListener("click", app.greet.bind(app));
```

`bind` は「`this` を固定した新しい関数」を返す。**呼び出すたびに新しい関数オブジェクトが作られる**ので、Reactの `useEffect` の依存配列などでは注意。

### (3) クラスフィールドでアロー関数を定義する

```typescript
class App {
  message = "hello";
  greet = () => {  // ← クラスフィールドのアロー関数
    console.log(this.message);
  };
}

const app = new App();
button.addEventListener("click", app.greet); // ✅ thisが固定される
```

各インスタンスごとに `greet` 関数が作られるので、メモリは多く使うが、安全。Reactクラスコンポーネント時代の定番パターン。

### (4) 普通のメソッドにする + 呼び出し時にラップ

```typescript
class App {
  greet() { console.log(this.message); }
}

const app = new App();
button.addEventListener("click", () => app.greet()); // ✅
```

最もシンプル。**現代では(1)が推奨**されることが多い。

---

## 4. アロー関数と通常関数の違い（`this` の挙動）

| 観点 | 通常の関数 / メソッド | アロー関数 |
|---|---|---|
| `this` | 呼び出し方で決まる | **定義時の外側の `this` を使う**（lexical） |
| `arguments` | 持つ | 持たない（rest parameters を使う） |
| `new` で呼べる | はい（コンストラクタになれる） | いいえ |
| `prototype` | 持つ | 持たない |
| `bind` で `this` 変更 | 可 | 不可（無視される） |

```typescript
class App {
  message = "hello";

  // 通常メソッド: this が呼び出し時に決まる
  greet1() { console.log(this.message); }

  // アローメソッド: this はインスタンスに固定
  greet2 = () => { console.log(this.message); };
}
```

### 使い分け

- 通常のメソッド: クラスのインスタンスメソッドとして書くのが自然
- アローメソッド: コールバックに渡すことが分かっている場面で

---

## 5. `this` の型注釈（TypeScriptの援護）

TypeScriptには「**この関数は `this` がこの型で呼ばれることを期待する**」と書ける機能があります。

```typescript
function showName(this: { name: string }) {
  console.log(this.name);
}

const obj = { name: "Alice" };
showName.call(obj);  // ✅
showName();           // ❌ this が要求と違う
```

### `this` パラメータは仮想引数

`this` は**第1引数のように見えますが、実引数ではない**（コンパイル後に消える）。型情報のためだけのもの。

### `noImplicitThis` で強制する

`tsconfig.json` で `"noImplicitThis": true`（または `"strict": true`）にすると、**`this` の型が不明な関数は警告**されます。

```typescript
function f() {
  console.log(this); // ❌ 'this' implicitly has type 'any'
}
```

→ 必ずオン推奨。

---

## 6. クラスメソッドと `this` の型

クラスのメソッドでは `this` は**そのクラスのインスタンス型**になります。

```typescript
class Foo {
  x = 1;
  method() {
    this.x; // ✅ this: Foo
  }
}
```

### 派生クラスでの `this` 型

```typescript
class Animal {
  name = "";
  setName(name: string): this {
    this.name = name;
    return this; // this の型は Animal ではなく this（派生クラスを保つ）
  }
}

class Dog extends Animal {
  bark() { console.log("woof"); }
}

const d = new Dog().setName("Pochi"); // d: Dog（Animal にダウンキャストされない）
d.bark(); // ✅
```

`this` 型をうまく使うと、メソッドチェーンが派生クラスの型を保ったまま続けられます。

---

## 7. コールバックの中で `this` を期待する関数（古いライブラリ）

jQuery などでは「**コールバック内の `this` がDOM要素**」というパターンがあります。

```typescript
$("button").on("click", function(this: HTMLElement) {
  this.style.color = "red"; // ✅ this: HTMLElement
});
```

`function` 式 + `this` 注釈で対応できます。**アロー関数では `this` が外側を指してしまう**ので、こういう場面ではアロー関数を使ってはいけない。

---

## 8. `this` 以外の関数の落とし穴

### (1) 戻り値推論で意図しないユニオンが混入

```typescript
function f(x: number) {
  if (x > 0) return "positive";
  if (x < 0) return "negative";
  // x === 0 のとき undefined を返す
}

const r = f(0); // r: "positive" | "negative" | undefined
```

→ 戻り値型を明示する。

### (2) 引数のオブジェクトをミューテートする

```typescript
function reset(user: User) {
  user.name = "";  // ❌ 呼び出し側のオブジェクトを書き換えている
}
```

→ 純粋関数を心がける（新しいオブジェクトを返す）。

```typescript
function reset(user: User): User {
  return { ...user, name: "" };
}
```

### (3) クロージャで古い値を参照する

```typescript
const handlers = [];
for (var i = 0; i < 3; i++) {
  handlers.push(() => console.log(i));  // ❌ 全部 3 になる
}
```

→ `let` を使う（ブロックスコープ）。

```typescript
for (let i = 0; i < 3; i++) {
  handlers.push(() => console.log(i));  // ✅ 0, 1, 2
}
```

### (4) `Function.prototype.toString` を JSON 化

```typescript
const obj = { f: () => 42 };
JSON.stringify(obj); // "{}" （関数は無視される）
```

JSONに関数は含まれない。意図せず関数を入れたまま送信していないか注意。

### (5) `name` プロパティ衝突

```typescript
const fn = function f() {};
fn.name; // "f"

const obj = { name: "Alice" };
obj.name; // "Alice"
```

関数オブジェクトには自動で `name` プロパティが付いている。これとオブジェクトの `name` プロパティが**型として衝突**することがある（稀）。

### (6) 即時関数（IIFE）の使い所

```typescript
// 古いスタイル: スコープ分離
(function() {
  const local = "...";
})();
```

ES Modules があれば不要。**現代のTSコードでは書かない**。

---

## 9. クラスでの `this` バインディング戦略まとめ

クラスを使うなら、以下のいずれかを**チームで統一**しておくのが安全:

| 戦略 | 書き方 | 長所 | 短所 |
|---|---|---|---|
| アローメソッド | `method = () => {}` | 自動bind、安全 | インスタンス毎にメモリ |
| 通常メソッド + 呼出時ラップ | `() => obj.method()` | 標準的 | 書き忘れリスク |
| 通常メソッド + bind | `obj.method.bind(obj)` | 1回束縛で再利用可 | 関数同一性が失われる |

Reactなら**フック化（関数コンポーネント）してクラスを使わない**のが現代の主流です。

---

## 10. まとめ

- `this` は「**呼び出し方で決まる**」── 定義場所ではない
- メソッドを取り出すと `this` が消える典型バグ ── アロー関数 / `bind` / クラスフィールドで対処
- アロー関数は **`this` を持たない**（外側のものを使う）
- TypeScriptの **`this` パラメータ**で関数の `this` 型を表現できる
- **`noImplicitThis: true`** を有効にしておく
- 関数の落とし穴: 戻り値推論 / ミューテート / クロージャ / JSON化

> `this` で時間を溶かしたくないなら、**「アロー関数を使う / クラスを避ける」**が現代では最も安全。クラスを書くときは bind 戦略をチームで決めておくこと。

---

## 関連
- [[01-引数と戻り値]]
- [[02-関数型とコールバック]]
- [[strict系オプション]]
