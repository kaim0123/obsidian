# `typeof null` は `"object"`

## 結論

```js
typeof null; // "object"
```

これは JavaScript の **有名なバグ** で、直せない仕様として残っています。「null なのに object とは？」と最初は誰もが戸惑います。

## どういうこと？

`typeof` は値の型を文字列で返す演算子です。通常は予想通り動きます。

```js
typeof "hello";     // "string"
typeof 123;         // "number"
typeof true;        // "boolean"
typeof undefined;   // "undefined"
typeof {};          // "object"
typeof [];          // "object"（配列も object）
typeof function(){}; // "function"
typeof Symbol();    // "symbol"
typeof 10n;         // "bigint"
typeof null;        // "object" ← ここが罠
```

`null` はオブジェクトではないのに、`typeof` だと `"object"` と出ます。

## なぜこうなったのか（歴史的経緯）

JavaScript の最初の実装（1995年、Brendan Eich が約10日で作った）で、値の内部表現を「タグ（型）＋ポインタ」の形で持っていました。オブジェクトを示すタグが `000`、null はすべてのビットが 0 だったため、「`typeof null` が object になる」という挙動になってしまいました。

後に「これは直そう」という提案もありましたが、既存のコードが壊れるため却下され、 **そのまま残されることに**。仕様として書かれている「バグ」です。

## どんな影響がある？

### null チェックとして typeof を使うと失敗する

```js
if (typeof value === "object") {
  // value が null でもここに入ってしまう
  value.foo = 1; // TypeError: Cannot set properties of null
}
```

オブジェクトだと思って触ると、null のときにエラーになります。

## 正しい判定方法

### null のチェック

```js
value === null; // これだけ
```

### オブジェクト（null を除く）のチェック

```js
typeof value === "object" && value !== null;
```

または：

```js
value !== null && typeof value === "object";
```

### 配列かどうか

```js
Array.isArray(value);
```

`typeof [] === "object"` なので、配列を見分けたいときは専用メソッド。

### 関数かどうか

```js
typeof value === "function";
```

### より詳細な型判定

```js
Object.prototype.toString.call(null);     // "[object Null]"
Object.prototype.toString.call([]);       // "[object Array]"
Object.prototype.toString.call(new Date()); // "[object Date]"
```

ライブラリ的に型を細かく判別したい場合のテクニック。

## typeof が役立つ場面

typeof を諦める必要はなく、型の大分類には今も有効。

```js
function formatValue(v) {
  if (typeof v === "string") return `"${v}"`;
  if (typeof v === "number") return v.toFixed(2);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (v === null) return "null";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}
```

判定順を「null をオブジェクトより先に」するのがコツ。

## 宣言されていない変数にも安全

typeof は宣言されていない変数にも例外を出しません。

```js
typeof undeclaredVariable; // "undefined"
console.log(undeclaredVariable); // ReferenceError
```

環境依存の機能を調べるのに重宝します。

```js
if (typeof window !== "undefined") {
  // ブラウザ環境
}
```

## まとめ

- `typeof null` は `"object"` という歴史的バグ
- null チェックは `=== null` を使う
- オブジェクト判定は `typeof x === "object" && x !== null`
- 配列は `Array.isArray`
- typeof は大分類の判別や「未定義かどうか」のチェックには有効

「typeof で型が完全に分かる」と思って書くと、null 混入時にバグります。この挙動を知っているだけで、事故を1つ減らせます。
