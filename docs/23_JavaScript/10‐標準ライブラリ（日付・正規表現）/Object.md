# Object（オブジェクト）

## オブジェクトとは

**オブジェクト（object）** は、「キー（名前）と値をペアでまとめたデータ」です。他の言語の連想配列・辞書・ハッシュマップに近いものです。

```js
const user = {
  name: "太郎",
  age: 20,
  isAdmin: false,
};

console.log(user.name); // "太郎"
console.log(user["age"]); // 20
```

キーは基本的に文字列（または Symbol）で、値は何でも入ります。

## オブジェクトの作り方

### リテラル

```js
const empty = {};
const point = { x: 1, y: 2 };
```

### コンストラクタ

```js
const obj = new Object();  // 普通は使わない
```

### Object.create：プロトタイプを指定

```js
const animal = { eat() { console.log("食べる"); } };
const dog = Object.create(animal);
dog.eat(); // "食べる"
```

親を明示的に指定してオブジェクトを作れます。詳しくは [[プロトタイプチェーン]]。

## プロパティの操作

### 取得

```js
const user = { name: "太郎", age: 20 };
user.name;         // "太郎"（ドット記法）
user["name"];      // "太郎"（ブラケット記法）

const key = "age";
user[key];         // 20（動的にアクセス）
```

### 追加・更新

```js
user.email = "taro@example.com"; // 追加
user.age = 21;                    // 更新
```

### 削除

```js
delete user.age;
```

`delete` はオブジェクトから完全に消します。

### 存在チェック

```js
"name" in user;            // true
user.hasOwnProperty("name"); // true
Object.hasOwn(user, "name"); // true（推奨）
```

`user.foo === undefined` でも判定できますが、`undefined` が値として入っている場合と区別できません。正確には `in` や `Object.hasOwn` を使います。

## Object の主要メソッド

### Object.keys / values / entries

```js
const user = { name: "太郎", age: 20 };

Object.keys(user);   // ["name", "age"]
Object.values(user); // ["太郎", 20]
Object.entries(user); // [["name", "太郎"], ["age", 20]]
```

`entries` はループに便利。

```js
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}
```

### Object.fromEntries：entries の逆

```js
Object.fromEntries([["a", 1], ["b", 2]]); // { a: 1, b: 2 }
```

Map → Object 変換などにも。

### Object.assign：マージ

```js
const a = { x: 1 };
const b = { y: 2 };
const merged = Object.assign({}, a, b); // { x: 1, y: 2 }
```

最近はスプレッド構文のほうが読みやすい。

```js
const merged = { ...a, ...b };
```

### Object.freeze / isFrozen

```js
const config = Object.freeze({ mode: "prod" });
config.mode = "dev"; // 無視される（strict では TypeError）
```

「変更させない」オブジェクトを作ります。ただし **浅い凍結** なので、ネストされたオブジェクトは変更できます。

### Object.seal

プロパティの追加・削除は禁止、値の変更は可能。`freeze` より弱め。

### Object.getPrototypeOf / setPrototypeOf

プロトタイプを取得・設定。[[プロトタイプチェーン]] を参照。

## 分割代入（Destructuring）

オブジェクトから複数の値を一気に取り出せます。

```js
const user = { name: "太郎", age: 20, email: "taro@example.com" };
const { name, age } = user;

console.log(name); // "太郎"
console.log(age);  // 20
```

### 別名を付ける

```js
const { name: userName } = user;
```

### デフォルト値

```js
const { role = "guest" } = user;
```

### ネスト

```js
const data = { user: { name: "太郎" } };
const { user: { name } } = data;
```

### 関数の引数で使う（超便利）

```js
function greet({ name, age }) {
  console.log(`${name} (${age})`);
}
greet({ name: "太郎", age: 20 });
```

## スプレッドと残余（...）

### コピー

```js
const copy = { ...user };
```

浅いコピー。ネストされたオブジェクトは共有されるので注意。

### マージ

```js
const merged = { ...defaults, ...overrides };
```

後に書いたほうが勝ちます。

### 残りを拾う

```js
const { name, ...rest } = user;
// name="太郎", rest={ age: 20, email: "..." }
```

## 短縮記法（ES2015〜）

### プロパティ名と変数名が同じとき

```js
const name = "太郎";
const age = 20;

// { name: name, age: age } の省略
const user = { name, age };
```

### メソッド記法

```js
const obj = {
  greet() {      // function() の省略
    console.log("hi");
  },
};
```

### 計算されたキー

```js
const key = "age";
const user = { [key]: 20 }; // { age: 20 }
```

## ループの仕方

```js
const user = { name: "太郎", age: 20 };

// (1) Object.keys + forEach
Object.keys(user).forEach((key) => {
  console.log(key, user[key]);
});

// (2) for...in（プロトタイプチェーンも含むので注意）
for (const key in user) {
  if (Object.hasOwn(user, key)) {
    console.log(key, user[key]);
  }
}

// (3) Object.entries + for...of（一番おすすめ）
for (const [key, value] of Object.entries(user)) {
  console.log(key, value);
}
```

## 比較：オブジェクトは参照比較

```js
{ a: 1 } === { a: 1 }; // false
const o = { a: 1 };
o === o; // true
```

内容が同じでも別物なら `false`。深い比較をしたいなら自作するか、ライブラリ（`lodash.isEqual` など）を使います。

## よくある落とし穴

### 1. 参照の共有

```js
const a = { x: 1 };
const b = a;
b.x = 99;
console.log(a.x); // 99
```

代入は参照のコピー。内容をコピーしたいなら `{ ...a }` を。詳しくは [[オブジェクト参照の罠]]。

### 2. 浅いコピーの落とし穴

```js
const a = { nested: { x: 1 } };
const b = { ...a };
b.nested.x = 99;
console.log(a.nested.x); // 99！
```

ネストまでコピーしたいなら `structuredClone(a)` または [[オブジェクトのディープコピー]] 参照。

### 3. 順序の保証

数値文字列のキーは小さい順、それ以外は挿入順。だいたい「入れた順」と思って OK ですが、完璧な順序が欲しいなら `Map` を使う（[[Map_Set]]）。

## まとめ

- オブジェクトはキーと値のペアを束ねるデータ型
- `.` や `[]` でアクセス、`delete` で削除
- `Object.keys / values / entries` で中身を取り出してループ
- 分割代入・スプレッドで可読性が劇的に上がる
- 比較は参照。コピーは `{ ...a }`、深いコピーは `structuredClone`

JavaScript ではオブジェクトが主役級の存在。これを扱う技術は開発速度に直結します。
