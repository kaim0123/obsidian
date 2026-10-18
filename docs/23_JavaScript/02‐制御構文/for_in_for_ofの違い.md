# `for...in` と `for...of` の違い

## 結論

- **`for...in`** … **キー（プロパティ名）** を列挙する。**オブジェクト用**
- **`for...of`** … **値** を列挙する。**配列などイテラブル用**

配列に `for...in` を使うと事故を起こしやすいため、**配列なら `for...of`、オブジェクトなら `Object.entries + for...of` または `for...in + hasOwn`** と覚えましょう。

## 具体例で違いを見る

```js
const arr = ["a", "b", "c"];

for (const i in arr) {
  console.log(i);       // "0", "1", "2"（キー＝インデックス、しかも文字列！）
}

for (const v of arr) {
  console.log(v);       // "a", "b", "c"（値）
}
```

`for...in` のループ変数は **文字列** なので、計算に使うと事故ります。

```js
for (const i in arr) {
  console.log(i + 1);   // "01", "11", "21"（文字列連結）
}
```

## オブジェクトに対して

```js
const user = { name: "太郎", age: 20 };

for (const key in user) {
  console.log(key, user[key]);
  // "name" "太郎"
  // "age" 20
}

// for...of はオブジェクトに直接は使えない
for (const v of user) {} // TypeError: user is not iterable
```

オブジェクトをループするには `for...in`、または `Object.keys/values/entries` を使って配列化してから `for...of` を使います。

```js
for (const [k, v] of Object.entries(user)) {
  console.log(k, v);
}
```

後者のほうが **配列とループ方法が統一できて読みやすい** ので、モダンな書き方として推奨されます。

## `for...in` の危険性：プロトタイプチェーン

`for...in` は **プロトタイプチェーン上のプロパティも列挙します**。

```js
const parent = { inherited: 1 };
const child = Object.create(parent);
child.own = 2;

for (const key in child) {
  console.log(key); // "own", "inherited" ← 親のもプチリ列挙される
}
```

これを防ぐには `Object.hasOwn`（または古い環境では `hasOwnProperty`）でフィルタします。

```js
for (const key in child) {
  if (!Object.hasOwn(child, key)) continue;
  console.log(key);
}
```

あるいは最初から `Object.keys(child)` を使えばチェーンは列挙されません。

## 配列に `for...in` を使ってはいけない理由

### 理由1：インデックス以外も拾う可能性

```js
const arr = ["a", "b", "c"];
arr.custom = "extra";
Array.prototype.foo = () => "bar"; // 仮にこんな汚染があるとしたら

for (const k in arr) {
  console.log(k); // "0", "1", "2", "custom", "foo"...
}
```

誰かが `Array.prototype` を汚すと意図しないキーが出てきます。

### 理由2：順序は保証されない（歴史的経緯）

仕様的には挿入順になることが多いですが、歴史的に「実装依存」とされてきた経緯があり、配列の順番を重視するループには使わないのが安全です。

### 理由3：キーが文字列

前述のとおり `i + 1` が "01" になったりします。

## 正しい使い分け早見表

| データ | 推奨 |
|---|---|
| 配列（値だけほしい） | `for...of` |
| 配列（値とインデックス） | `arr.entries()` + `for...of` or `forEach((v, i) => ...)` |
| オブジェクト | `Object.entries(obj)` + `for...of` |
| Map | `for...of map.entries()` or `for...of map` |
| Set | `for...of set` |
| 文字列 | `for...of str`（コードポイント単位） |

### 例：配列のインデックスと値

```js
for (const [i, v] of arr.entries()) {
  console.log(i, v); // 0 "a", 1 "b", ...
}

// forEach 版
arr.forEach((v, i) => console.log(i, v));
```

### 例：Map をループ

```js
const m = new Map([["a", 1], ["b", 2]]);
for (const [k, v] of m) {
  console.log(k, v);
}
```

## break / continue

どちらのループも `break` で抜けられ、`continue` で次へ飛べます。`forEach` は **途中で抜けられない** 点が違うので、早期終了が必要なら `for...of` を使います。

```js
for (const v of arr) {
  if (v === "stop") break;
}

arr.forEach((v) => {
  if (v === "stop") return; // forEach ではこれで次の要素へ（"抜ける"ではなく"今の反復をスキップ"に近い）
});
```

## まとめ

- `for...in` はオブジェクトのキー列挙。配列では使わない
- `for...of` はイテラブル（配列・文字列・Map・Set）の値列挙
- オブジェクトは `Object.entries(obj) + for...of` が現代的で扱いやすい
- インデックスもほしい配列は `arr.entries()` または `forEach`
- プロトタイプチェーンに注意。`for...in` は `Object.hasOwn` でフィルタ

この2つを混同すると、デバッグ困難なバグになります。「数字（インデックス）が出る `for...in` は怪しい」と覚えておけば、経験的に気付けるようになります。
