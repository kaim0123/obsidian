# `this` の挙動

## this とは

`this` は関数が実行されるときに自動で決まる「この関数が属しているもの」への参照です。

JavaScript の `this` は **関数の書かれ方** ではなく **呼ばれ方** で決まります。これが初心者が最初に混乱するポイントです。

## `this` が決まるルール（基本4つ）

### 1. 普通の関数呼び出し → `undefined`（strict）または `globalThis`

```js
function foo() {
  console.log(this);
}
foo();
// strict mode: undefined
// 非 strict: window（ブラウザ）/ global（Node）
```

### 2. メソッド呼び出し → その前のオブジェクト

```js
const user = {
  name: "太郎",
  greet() {
    console.log(this.name);
  },
};
user.greet(); // "太郎"（this は user）
```

「`obj.method()` と呼んだときの `obj`」が `this` になります。

### 3. `new` で呼ばれた → 新しく作られるインスタンス

```js
function User(name) {
  this.name = name;
}
const u = new User("太郎"); // this は u
```

### 4. `call` / `apply` / `bind` で指定された値

```js
function greet() {
  console.log(this.name);
}
greet.call({ name: "次郎" }); // "次郎"
greet.apply({ name: "花子" }); // "花子"

const bound = greet.bind({ name: "一郎" });
bound(); // "一郎"
```

## メソッドを「切り離すと」this が変わる

これが一番ハマる場所。

```js
const user = {
  name: "太郎",
  greet() {
    console.log(this.name);
  },
};

const fn = user.greet; // 関数だけ取り出す
fn(); // undefined（strictでは）または window.name
```

`user.greet()` は OK ですが、一度変数に取ると「どのオブジェクトに属しているか」の情報が失われます。

### よくある再現場面

```js
setTimeout(user.greet, 100); // this は window/undefined
button.addEventListener("click", user.greet); // 同上
```

## 対策

### bind でくっつけておく

```js
setTimeout(user.greet.bind(user), 100);
```

### アロー関数で包む

アロー関数は自分で `this` を持たず、**外側の `this` を継承** します。

```js
setTimeout(() => user.greet(), 100);
```

### クラスフィールドでアロー関数にする

```js
class Counter {
  count = 0;
  increment = () => {   // アロー関数プロパティ
    this.count++;
  };
}
```

これで `new Counter().increment` を渡しても `this` がずれません。

## アロー関数と普通の関数の違い

```js
const obj = {
  name: "A",
  regular: function () { console.log(this.name); },
  arrow: () => { console.log(this.name); },
};

obj.regular(); // "A"
obj.arrow();   // undefined（this は外側の this）
```

### 基本ルール

- **メソッドとして使うなら** → 普通の関数（`function` や短縮記法）
- **コールバックで `this` を外側と揃えたいなら** → アロー関数

### よくある使い分け

```js
class Timer {
  constructor() {
    this.seconds = 0;
  }
  start() {
    setInterval(() => {
      this.seconds++; // ← アローで外側の this を保持
    }, 1000);
  }
}
```

`setInterval` の第一引数を普通の関数にすると `this` が変わってしまいますが、アロー関数なら `Timer` インスタンスの `this` を保持できます。

## イベントリスナーでの this

```js
button.addEventListener("click", function () {
  console.log(this); // クリックされた要素（button）
});

button.addEventListener("click", () => {
  console.log(this); // 外側の this（モジュールトップなら undefined）
});
```

クリックされた要素を参照したいなら `function`、外側の文脈を保ちたいならアロー。今は `event.currentTarget` を使うほうが意図が明確。

## strict mode と非 strict mode

```js
// 非 strict（古いコード）
function f() { console.log(this); }
f(); // window / global

// strict mode（モジュール内は自動でこれ）
"use strict";
function f() { console.log(this); }
f(); // undefined
```

モダンな開発環境（モジュール、TypeScript、バンドラ）はすべて strict です。`undefined` が出て初めて気づく、という罠になりがち。

## グローバルの this

- ブラウザ：`window`
- Node.js：`global` または `globalThis`
- モジュール top-level：`undefined`

どんな環境でも使える表記として **`globalThis`**（ES2020〜）が追加されました。

```js
globalThis.foo = "bar"; // 環境を問わない
```

## クラスでの this

```js
class User {
  constructor(name) { this.name = name; }
  greet() { console.log(this.name); }
}

const u = new User("太郎");
u.greet(); // "太郎"

const fn = u.greet;
fn(); // TypeError（this が undefined で name を読めない）
```

解決策：bind、アロー関数プロパティ、呼び出し側で `u.greet()` と書く。

## this の罠チェックリスト

1. `user.method` のようにメソッドを **渡している** → this 切断の可能性
2. コールバックの中で `this.xxx` を触っている → アローに変えるか、`const self = this`
3. グローバルで `this` を使おうとして `undefined` → strict mode だから
4. アロー関数でメソッドを書いた → this が期待通りでない
5. `new` し忘れた → this が undefined

## まとめ

- `this` は **呼び出され方** で決まる
- メソッドを渡すと切り離されやすい → bind / アロー / ラップ
- アロー関数は自前の this を持たない（外を引き継ぐ）
- クラスのコールバックはアロー関数プロパティが楽
- `globalThis` で環境差を吸収

`this` は JavaScript でつまずきやすい No.1 の概念ですが、「メソッドを外に出すと切れる」「アローは外の this を使う」の2点を覚えれば、9割の事故は避けられます。
