# null / undefined / NaN の違い

## 3つの「値がない／変な値」の概念

JavaScript には「値が無い」「数値として扱えない」を表す似たような値が3つあります。

- **`undefined`** … 値が割り当てられていない（未定義）
- **`null`** … 意図的に「空」と設定した値
- **`NaN`** … 数値計算に失敗した結果（Not a Number）

似ているようで役割が違うので、しっかり区別しましょう。

## undefined

### 何もセットしていないときの「自動的な値」

```js
let x;
console.log(x); // undefined

function foo() {} // return していない
console.log(foo()); // undefined

const obj = {};
console.log(obj.missing); // undefined

const arr = [1, 2, 3];
console.log(arr[99]); // undefined
```

変数を宣言だけして値を与えないと `undefined`。存在しないプロパティや範囲外のインデックスも `undefined` になります。

### 明示的な undefined は避ける

```js
let x = undefined; // やや不自然
let y;             // こちらが自然
```

`undefined` を手で代入する必要が出てくることは少なく、多くは「まだセットされていない」状態を表すためのものです。

## null

### 「意図的に空」を示す

```js
let user = null; // あえて「ユーザはいない」と設定
user = { name: "太郎" };
user = null;     // ユーザ情報をクリア
```

プログラマが「ここは値を入れない」と能動的に選ぶときに使います。API レスポンスで「データが存在しない」ことを示すときも `null` が返ることがあります。

### undefined と null の使い分け

一般的には：

- **`undefined`** … システムが決める「まだない」
- **`null`** … プログラマが決める「空だよ」

ただし現実には厳密に守られておらず、プロジェクトによって方針が異なります。TypeScript では `strictNullChecks` でどちらを使うか決めるのが定石。

## null == undefined は true

```js
null == undefined;  // true
null === undefined; // false
null == null;       // true
undefined == undefined; // true
null == 0;          // false
null == false;      // false
```

`==`（緩い等価）では null と undefined は互いに等しいですが、それ以外の値（0, false, "" など）とは等しくありません。これを利用して「null または undefined」の判定に `== null` を使うテクニックがあります。

```js
if (value == null) {
  // value は null か undefined
}
```

ただし混乱のもとなので、 **Nullish 演算子（`??`）や明示的な `=== null || === undefined`** が好まれる傾向もあります。

## Nullish 関連の演算子（モダン）

### 論理 OR（`||`）の罠

`||` は **falsy**（0, "", null, undefined, NaN, false）を全部「空」として扱います。

```js
const count = input || 10;
// input が 0 だと 10 になってしまう（0 は falsy）
```

### Nullish Coalescing（`??`）

`??` は **null か undefined のときだけ** デフォルト値を使います。

```js
const count = input ?? 10;
// input が 0 のときは 0 のまま
// input が null/undefined のときだけ 10
```

### Optional Chaining（`?.`）

```js
const name = user?.profile?.name;
// user や profile が null/undefined でもエラーにならず undefined
```

## NaN

### Not a Number

計算の結果として **数値ではないもの** を表す特殊な値。でも `typeof` は `"number"`（これは歴史的な仕様）。

```js
Number("abc");   // NaN
0 / 0;           // NaN
Math.sqrt(-1);   // NaN
parseInt("hi");  // NaN
typeof NaN;      // "number"
```

### NaN の性質

1. **NaN は自分自身とも等しくない**

```js
NaN === NaN; // false
NaN == NaN;  // false
```

2. **判定は `Number.isNaN` を使う**

```js
Number.isNaN(NaN);    // true
Number.isNaN("abc");  // false

isNaN("abc");         // true（古い・緩い）
// 古い isNaN は「数値に変換できないもの」全部に true を返すので危険
```

3. **NaN との比較はすべて false**

```js
NaN > 0;   // false
NaN < 0;   // false
NaN === 0; // false
```

## 3つの見分け方

```js
typeof undefined;  // "undefined"
typeof null;       // "object"（有名なバグ → [[typeof_nullはobject]]）
typeof NaN;        // "number"

value === undefined;     // undefined チェック
value === null;          // null チェック
value == null;           // null または undefined
Number.isNaN(value);     // NaN チェック
```

## どう使い分けるか：実例

```js
function findUser(id) {
  // API から取得する関数
  if (!id) return null;   // 意図的に null
  // ...
}

const user = findUser(1);
if (user === null) {
  // 見つからなかった
}

function getConfig(key) {
  const config = { debug: true };
  return config[key]; // 未知のキーは undefined
}

const parsed = parseInt(input, 10);
if (Number.isNaN(parsed)) {
  // 数値に変換できなかった
}
```

## TypeScript での扱い

TypeScript では `null` と `undefined` を別の型として扱えます。

```ts
let a: string | null = null;      // null 許容
let b: string | undefined;        // undefined 許容
let c: string | null | undefined; // 両方
```

`strictNullChecks` を有効にすると、うっかり null/undefined のまま使うのを防げます。

## まとめ

| 値 | 意味 | typeof | 主な出どころ |
|---|---|---|---|
| `undefined` | 未定義 | "undefined" | 未初期化、未設定、return なし |
| `null` | 意図的に空 | "object" | プログラマが代入 |
| `NaN` | 数値にできない | "number" | 失敗した数値演算 |

- `undefined` と `null` は似てるが出どころが違う
- `NaN` は自分とも等しくない特殊な値
- チェックは型と目的に合った書き方を選ぶ
- モダンな書き方：`??` と `?.` で多くは解決する

これら3つの値に振り回されないだけで、JavaScript のバグは大きく減ります。
