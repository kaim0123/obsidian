# JSON

## JSON とは

**JSON（JavaScript Object Notation）** は、データを文字列で表現する軽量なフォーマットです。もともと JavaScript のオブジェクトリテラルから派生したもので、今ではほぼ全言語で使える **データ交換の共通言語** になっています。

```json
{
  "name": "太郎",
  "age": 20,
  "hobbies": ["読書", "散歩"],
  "address": {
    "city": "東京"
  }
}
```

サーバとのAPI通信、設定ファイル、ログのフォーマットなど、ありとあらゆる場面で使われます。

## JSON で使える値

- 文字列 `"abc"`（必ずダブルクォート）
- 数値 `123`, `1.5`
- 真偽値 `true`, `false`
- `null`
- 配列 `[1, 2, 3]`
- オブジェクト `{ "key": value }`

**使えないもの**：`undefined`, 関数, 日付（Date）, `NaN`, `Infinity`, Symbol, BigInt, コメント。これらは JSON に変換すると消えたり文字列化されたりします。

## JavaScript の主要 API は2つ

JavaScript には標準で `JSON` という組み込みオブジェクトがあり、次の2つのメソッドが一番重要です。

- **`JSON.stringify(value)`** … JS の値を JSON 文字列に変換（シリアライズ）
- **`JSON.parse(text)`** … JSON 文字列を JS の値に変換（パース）

## JSON.stringify

### 基本

```js
const user = { name: "太郎", age: 20 };
const json = JSON.stringify(user);
console.log(json); // '{"name":"太郎","age":20}'
```

### 見やすく整形

第3引数にインデント幅を渡すと改行+インデントが入ります。

```js
JSON.stringify(user, null, 2);
// {
//   "name": "太郎",
//   "age": 20
// }
```

### フィルタリング

第2引数に配列を渡すと、そのキーだけを残します。

```js
JSON.stringify(user, ["name"]); // '{"name":"太郎"}'
```

関数を渡すと値ごとに加工できます。

```js
JSON.stringify(user, (key, value) => {
  if (key === "age") return undefined; // 除外
  return value;
});
```

### 特殊な型の扱い

```js
JSON.stringify({ a: undefined });  // '{}'（消える）
JSON.stringify({ a: () => 1 });   // '{}'（関数も消える）
JSON.stringify({ d: new Date() }); // '{"d":"2026-04-22T..."}'（文字列化）
JSON.stringify(NaN);              // 'null'
JSON.stringify(undefined);        // undefined（文字列にならない）
```

Date は ISO 文字列になりますが、戻すときには Date には戻らないので注意。

### toJSON フック

オブジェクトに `toJSON` メソッドがあると、それが優先されます。

```js
class Money {
  constructor(yen) { this.yen = yen; }
  toJSON() { return `${this.yen}円`; }
}

JSON.stringify({ price: new Money(1000) });
// '{"price":"1000円"}'
```

## JSON.parse

### 基本

```js
const json = '{"name":"太郎","age":20}';
const obj = JSON.parse(json);
console.log(obj.name); // "太郎"
```

### エラーに注意

JSON として不正な文字列は例外を投げます。

```js
JSON.parse("{name:1}"); // SyntaxError（キーにクォートがない）
```

try/catch で囲むのが安全。

```js
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
```

### reviver：値を加工しながら読む

第2引数に関数を渡すと、各値を加工できます。

```js
const json = '{"created":"2026-04-22T00:00:00Z"}';
const obj = JSON.parse(json, (key, value) => {
  if (key === "created") return new Date(value);
  return value;
});

console.log(obj.created instanceof Date); // true
```

Date 文字列を Date に戻したりするのによく使います。

## 典型的な使い方

### API からの受信

```js
const res = await fetch("/api/users");
const users = await res.json(); // 実質 JSON.parse
```

`fetch` の `res.json()` は内部で JSON パースしてくれます。

### API への送信

```js
await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "太郎" }),
});
```

### localStorage で保存

localStorage は文字列しか入らないので、JSON を挟みます。

```js
localStorage.setItem("user", JSON.stringify({ name: "太郎" }));
const user = JSON.parse(localStorage.getItem("user") || "{}");
```

### ディープコピー（簡易）

一番手軽なディープコピー法。

```js
const copy = JSON.parse(JSON.stringify(obj));
```

ただし関数・Date・undefined などを含む場合は正しくコピーできません。モダン環境では `structuredClone(obj)` のほうが推奨。詳しくは [[オブジェクトのディープコピー]]。

## よくある落とし穴

### 1. ダブルクォート必須

```json
{ 'a': 1 } // NG
{  a : 1 } // NG
{ "a": 1 } // OK
```

JS のオブジェクトリテラルと違い、JSON はダブルクォートが必須です。

### 2. 末尾のカンマ

```json
{ "a": 1, }  // NG
[ 1, 2, ]    // NG
```

JSON では末尾カンマが許されません。

### 3. コメント不可

```json
// これは書けない
```

設定ファイルにコメントを書きたい場合は **JSON5**, **JSONC**, **YAML**, **TOML** などを検討。

### 4. NaN と Infinity

```js
JSON.stringify(NaN);    // "null"
JSON.stringify(Infinity); // "null"
```

数値の特殊値は失われるので、文字列化するなど工夫が必要。

### 5. 循環参照

```js
const a = {};
a.self = a;
JSON.stringify(a); // TypeError: circular structure
```

自分を参照するオブジェクトは stringify できません。

### 6. BigInt は扱えない

```js
JSON.stringify({ n: 10n }); // TypeError
```

BigInt は stringify 対象外。事前に文字列化する必要あり。

## まとめ

- JSON は言語非依存のデータ交換フォーマット
- `JSON.stringify` で文字列化、`JSON.parse` でパース
- 第2引数（reviver/replacer）、第3引数（インデント）を使いこなすと便利
- 関数・undefined・Date などは注意
- `fetch`, `localStorage`, ディープコピーなど幅広く使う

JSON が扱えないと現代の Web 開発は回りません。中身はシンプルなので、クセだけ押さえておきましょう。
