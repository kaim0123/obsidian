# Array（配列）

## 配列とは

**配列（Array）** は、複数の値を順番に並べて1つのデータとしてまとめたものです。番号（インデックス）は `0` から始まります。

```js
const fruits = ["apple", "banana", "orange"];
console.log(fruits[0]); // "apple"
console.log(fruits[2]); // "orange"
console.log(fruits.length); // 3
```

JavaScript の配列は「型がバラバラでもOK」「サイズは自動で伸びる」「オブジェクトの一種」という柔軟な仕様です。

## 配列を作る

```js
const a = [];                       // 空の配列
const b = [1, 2, 3];                // リテラル
const c = new Array(3);             // 長さ3の空配列（[ , , ]）
const d = Array.of(1, 2, 3);        // [1, 2, 3]
const e = Array.from("abc");        // ["a", "b", "c"]
const f = Array.from({ length: 3 }, (_, i) => i); // [0, 1, 2]
```

`Array.from` は「配列っぽいもの」（文字列・NodeList・Set・Map など）を配列に変換するときに便利です。

## 要素を追加・削除

### 末尾に追加／取り出す

```js
const arr = [1, 2];
arr.push(3);        // [1, 2, 3]
arr.push(4, 5);     // [1, 2, 3, 4, 5]
const last = arr.pop();  // last=5、arr=[1,2,3,4]
```

### 先頭に追加／取り出す

```js
const arr = [1, 2];
arr.unshift(0);     // [0, 1, 2]
const first = arr.shift(); // first=0、arr=[1,2]
```

### splice：どこでも追加・削除

```js
const arr = [1, 2, 3, 4, 5];
arr.splice(1, 2);          // 位置1から2個削除 → [1, 4, 5]
arr.splice(1, 0, "a", "b"); // 位置1に追加 → [1, "a", "b", 4, 5]
```

`splice(開始位置, 削除する数, ...追加する要素)` という形で、削除・追加両方ができます。

## よく使うメソッド（破壊しない系）

これらは **元の配列を変更せず、新しい配列を返します**。安全でおすすめ。

### map：各要素を変換

```js
const nums = [1, 2, 3];
const doubled = nums.map((n) => n * 2); // [2, 4, 6]
console.log(nums); // [1, 2, 3]（元は変わらない）
```

### filter：条件に合うものだけ残す

```js
const nums = [1, 2, 3, 4, 5];
const evens = nums.filter((n) => n % 2 === 0); // [2, 4]
```

### reduce：1つの値にまとめる（合計・集計）

```js
const nums = [1, 2, 3, 4];
const sum = nums.reduce((acc, n) => acc + n, 0); // 10
```

- `acc`（アキュムレータ）には前回の結果、`n` には現在の要素が入る
- 第2引数 `0` は初期値

### find / findIndex：条件に合う最初の要素

```js
const users = [{ id: 1 }, { id: 2 }];
const u = users.find((user) => user.id === 2);    // { id: 2 }
const i = users.findIndex((user) => user.id === 2); // 1
```

見つからないと `find` は `undefined`、`findIndex` は `-1` を返します。

### some / every：論理判定

```js
const nums = [1, 2, 3];
nums.some((n) => n > 2);  // true（1個でも該当すれば true）
nums.every((n) => n > 0); // true（すべて該当で true）
```

### includes / indexOf：含まれるか

```js
const arr = [1, 2, 3];
arr.includes(2);  // true
arr.indexOf(2);   // 1
arr.indexOf(99);  // -1
```

### slice：部分を取り出す（コピー）

```js
const arr = [1, 2, 3, 4, 5];
arr.slice(1, 3); // [2, 3]（1以上3未満）
arr.slice(-2);   // [4, 5]（後ろから）
arr.slice();     // 全体の浅いコピー
```

### concat：つなぐ

```js
[1, 2].concat([3, 4]); // [1, 2, 3, 4]
[1, 2].concat(3, 4);   // [1, 2, 3, 4]
```

最近は `...`（スプレッド）で書くほうが主流。

```js
const merged = [...arr1, ...arr2];
```

### flat / flatMap：平らにする

```js
[1, [2, 3], [4]].flat();   // [1, 2, 3, 4]
[1, [2, [3]]].flat(2);     // [1, 2, 3]（2段階まで）

[1, 2, 3].flatMap((n) => [n, n * 2]); // [1, 2, 2, 4, 3, 6]
```

## 元の配列を変更してしまうメソッド（破壊系）

使う前に「本当に元を変えていい？」と意識する必要があります。

- `push`, `pop`, `shift`, `unshift`
- `sort`, `reverse`
- `splice`
- `fill`, `copyWithin`

### sort：注意が必要

```js
[10, 2, 30].sort(); // [10, 2, 30] → [10, 2, 30]？
// 実は [10, 2, 30] → ["10","2","30"] → [10, 2, 30]
// 文字列として比較されるので変な結果になる
```

数値を正しく並べるには比較関数を渡します。

```js
[10, 2, 30].sort((a, b) => a - b); // [2, 10, 30]
```

## 反復処理

### for...of（推奨）

```js
for (const item of [1, 2, 3]) {
  console.log(item);
}
```

### forEach

```js
[1, 2, 3].forEach((item, index) => {
  console.log(index, item);
});
```

`forEach` は途中で止められない（`break` 不可）ので、途中で抜けたいなら `for...of` を使います。

### 参考：for...in は使わない

`for...in` は **オブジェクト用**。配列に使うと、インデックス以外も列挙されることがあり推奨されません。詳しくは [[for_in_for_ofの違い]]。

## 配列のコピー

浅いコピー（1階層だけ）。

```js
const a = [1, 2, 3];
const b = [...a];        // スプレッド
const c = Array.from(a); // from
const d = a.slice();     // slice
```

ネストした配列を丸ごとコピーしたい場合は `structuredClone` が便利。

```js
const deep = structuredClone([[1, 2], [3, 4]]);
```

## よくある罠

### 1. 長さを使った比較

```js
const arr = [];
if (arr) console.log("truthy"); // 空配列も truthy！
if (arr.length) console.log("has items"); // こちらで判定
```

### 2. 参照のコピー

```js
const a = [1, 2];
const b = a;
b.push(3);
console.log(a); // [1, 2, 3]（同じものを指している）
```

コピーしたいときは必ず `[...a]` などで新しい配列を作る。

### 3. 空の要素（sparse array）

```js
const arr = new Array(3); // [ , , ]
arr.map((x) => x);         // 空要素はスキップされる
```

詳しくは [[配列の空要素]]。

## まとめ

- 配列は一番よく使うデータ構造
- 非破壊メソッド（`map`/`filter`/`reduce`/`slice`/`concat`）を好んで使う
- 破壊メソッド（`push`/`sort` 等）は元が変わることを意識する
- ループは `for...of` か `forEach` が基本
- コピーは `[...a]`、深いコピーは `structuredClone`

配列操作の引き出しを増やすと、命令的な `for` ループを書く回数が減って、読みやすいコードになります。
