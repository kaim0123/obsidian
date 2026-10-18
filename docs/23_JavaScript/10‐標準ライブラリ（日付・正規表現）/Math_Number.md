# Math / Number

## 概要

JavaScript で数値を扱うとき、知っておきたい組み込みは次の2つ。

- **`Math`** … 数学的な関数・定数をまとめた **静的オブジェクト**
- **`Number`** … 数値型そのもの＋関連ユーティリティ

どちらもインスタンス化せず、そのまま `Math.abs(-3)` のように使います。

## Number の基本

JavaScript の数値は **IEEE 754 倍精度浮動小数点数** で、`1`, `1.5`, `-3.14` などすべて同じ型（`number`）です。整数用の型はなく、64ビット全体で扱います。

```js
typeof 1;   // "number"
typeof 1.5; // "number"
```

BigInt（`10n`）は別型なので扱いに注意。

## Number の主なメソッド・定数

### 定数

```js
Number.MAX_SAFE_INTEGER; // 2^53 - 1 (9,007,199,254,740,991)
Number.MIN_SAFE_INTEGER; // -(2^53 - 1)
Number.EPSILON;          // 浮動小数点誤差の最小間隔 (≈2.22e-16)
Number.MAX_VALUE;        // 表現可能な最大値
Number.POSITIVE_INFINITY;
Number.NEGATIVE_INFINITY;
Number.NaN;
```

### 変換

```js
Number("123");    // 123
Number("12.5");   // 12.5
Number("abc");    // NaN
Number("");       // 0（空文字は 0！）
Number(null);     // 0
Number(undefined); // NaN
Number(true);     // 1

parseInt("12px", 10);  // 12（先頭の整数部分、基数指定推奨）
parseFloat("12.5abc"); // 12.5
```

`Number()` は全体を1つの数値として解釈、`parseInt/parseFloat` は先頭から解釈します。

### 判定

```js
Number.isFinite(1);        // true
Number.isFinite(Infinity); // false

Number.isNaN(NaN);   // true
Number.isNaN("abc"); // false（文字列は NaN ではない）
// 古い isNaN("abc") // true になってしまう。必ず Number.isNaN を使う

Number.isInteger(1);   // true
Number.isInteger(1.5); // false

Number.isSafeInteger(2 ** 53);     // false（安全な整数の範囲外）
Number.isSafeInteger(2 ** 53 - 1); // true
```

### フォーマット

```js
(1.2345).toFixed(2);    // "1.23"（小数点以下2桁）
(123456.789).toFixed(0); // "123457"
(1234).toExponential(2); // "1.23e+3"
(255).toString(16);      // "ff"（16進）
(10).toString(2);        // "1010"（2進）
```

### 小数の丸め

`toFixed` は文字列を返すので、数値演算するには `Number()` に戻す必要があります。

```js
Number((1.2345).toFixed(2)); // 1.23
```

より正確な丸めは `Math.round(n * 100) / 100` のような書き方。

## Math の主要機能

### 四捨五入・切り上げ・切り捨て

```js
Math.round(1.4);  // 1
Math.round(1.5);  // 2
Math.round(-1.5); // -1（ここ要注意：偶数丸めではない）
Math.floor(1.9);  // 1（切り捨て）
Math.ceil(1.1);   // 2（切り上げ）
Math.trunc(1.9);  // 1（小数部分を捨てる）
Math.trunc(-1.9); // -1
```

`Math.floor` と `Math.trunc` は負の数で差が出ます。

### 絶対値・符号

```js
Math.abs(-5);   // 5
Math.sign(-3);  // -1
Math.sign(0);   // 0
Math.sign(7);   // 1
```

### 最大・最小

```js
Math.max(1, 2, 3);     // 3
Math.max(...[1, 2, 3]); // 3（配列はスプレッド）
Math.min(1, 2, 3);     // 1
```

### 累乗・ルート

```js
Math.pow(2, 10);  // 1024
2 ** 10;          // 1024（指数演算子）
Math.sqrt(16);    // 4
Math.cbrt(27);    // 3
Math.hypot(3, 4); // 5（√(3²+4²)）
```

### 対数・指数

```js
Math.log(Math.E); // 1（自然対数）
Math.log2(8);     // 3
Math.log10(1000); // 3
Math.exp(1);      // e ≈ 2.718
```

### 三角関数（ラジアン）

```js
Math.sin(0);
Math.cos(Math.PI);
Math.tan(Math.PI / 4);
Math.atan2(y, x); // 角度を出す定番
```

ラジアンと度の変換：

```js
const toRad = (deg) => deg * Math.PI / 180;
const toDeg = (rad) => rad * 180 / Math.PI;
```

### 乱数

```js
Math.random(); // [0, 1) の小数
```

0以上1未満の乱数。範囲を変えたければ：

```js
// a以上b未満の整数
function randInt(a, b) {
  return Math.floor(Math.random() * (b - a)) + a;
}
```

暗号用途には使えません。セキュアな乱数は `crypto.getRandomValues()` を使います。

### 定数

```js
Math.PI;   // π
Math.E;    // e
Math.LN2;  // ln(2)
Math.LN10; // ln(10)
```

## BigInt

`Number` の安全な整数範囲を超える整数を扱う型。

```js
const big = 9007199254740993n;
big + 1n; // 9007199254740994n
```

- `number` と `BigInt` は **直接演算できません** (`1n + 1` はエラー)
- JSON.stringify も不可

ID など超大きな整数を扱うときだけ必要になります。

## よくある落とし穴

### 1. 浮動小数点誤差

```js
0.1 + 0.2; // 0.30000000000000004
```

詳しくは [[浮動小数点誤差]]。比較するときは `Math.abs(a - b) < Number.EPSILON` を使うか、整数化して扱います。

### 2. NaN の判定

```js
NaN === NaN; // false！
Number.isNaN(NaN); // true（正しい判定）
```

NaN は自分自身とも等しくないという特異性があります。

### 3. parseInt の基数

```js
parseInt("08");     // 8（現代では）
parseInt("08", 10); // 8（明示的に10進）
```

古い挙動（8進数扱い）との互換性問題を避けるため、**基数は必ず指定** しましょう。

### 4. 安全な整数の境界

```js
Number.MAX_SAFE_INTEGER; // 9007199254740991
9007199254740992 === 9007199254740993; // true！誤差で同じ値に見える
```

大きな整数 ID はBigInt か文字列で扱う。

### 5. 0や空文字を Number 化

```js
Number("");    // 0
Number(null);  // 0
Number("abc"); // NaN
```

ユーザ入力の検証に `Number()` をそのまま使うと、空文字が 0 として通ってしまいます。

## まとめ

- JavaScript の数値は全部 `number`（浮動小数点）
- `Math` は数学関数の集まり、`Math.floor` `Math.round` `Math.random` を頻繁に使う
- `Number.isNaN` / `Number.isFinite` を旧版ではなく使う
- 大きな整数は BigInt、乱数は用途によって `crypto` 系も検討
- 浮動小数点誤差は常に意識する

「ひとまず Math.floor と Math.random が書ければ日常は回る」くらいの肌感でも OK ですが、丸めと誤差の話題には繰り返し出会うので、基礎は押さえておきましょう。
