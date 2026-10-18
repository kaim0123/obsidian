# String（文字列）

## 文字列とは

**文字列（string）** は、テキストデータを扱うためのデータ型です。ダブルクォート `"` かシングルクォート `'` かバッククォート `` ` `` で囲みます。

```js
const a = "hello";
const b = 'world';
const c = `hi, ${a}`; // テンプレートリテラル
```

JavaScript の文字列は **イミュータブル（変更不可）**。元の文字列を変えるのではなく、新しい文字列を作って返すのが基本です。

## 文字列の作り方

### 連結

```js
"Hello, " + "World"; // "Hello, World"
```

### テンプレートリテラル（推奨）

バッククォートを使うと変数展開や複数行が楽に書けます。

```js
const name = "Taro";
const age = 20;
const msg = `${name} is ${age} years old.`;
// 複数行もOK
const html = `
  <div>
    <p>${name}</p>
  </div>
`;
```

### 文字列の長さ

```js
"hello".length; // 5
"あいう".length; // 3
"🍎".length;    // 2（サロゲートペア。ここ重要）
```

絵文字など一部の文字は2文字分として数えられるので、文字数を正確に数えたいなら `[...str].length` や `Intl.Segmenter` を使います。

## インデックスアクセス

```js
const s = "hello";
s[0];          // "h"
s.charAt(1);   // "e"
s.at(-1);      // "o"（後ろから。at は比較的新しい）
```

## 検索

### indexOf / lastIndexOf

```js
"hello world".indexOf("o");     // 4（最初のoの位置）
"hello world".lastIndexOf("o"); // 7
"hello".indexOf("z");            // -1（見つからない）
```

### includes / startsWith / endsWith

```js
"hello".includes("ell");   // true
"hello".startsWith("he");  // true
"hello".endsWith("lo");    // true
```

こちらのほうが `-1` 判定より意図が読みやすい。

## 切り取り

### slice：一番よく使う

```js
"hello".slice(1, 4); // "ell"（1以上4未満）
"hello".slice(-3);   // "llo"（後ろ3文字）
```

### substring

```js
"hello".substring(1, 4); // "ell"
```

`slice` とほぼ同じですが、負の値が使えない。普通は `slice` で OK。

### split：配列に分解

```js
"a,b,c".split(",");       // ["a", "b", "c"]
"hello".split("");        // ["h","e","l","l","o"]
"a, b,  c".split(/,\s*/); // ["a","b","c"]（正規表現も使える）
```

## 変換

### 大文字・小文字

```js
"Hello".toUpperCase(); // "HELLO"
"Hello".toLowerCase(); // "hello"
```

### 空白の除去

```js
"  hello  ".trim();      // "hello"
"  hello  ".trimStart(); // "hello  "
"  hello  ".trimEnd();   // "  hello"
```

### 置換

```js
"hello world".replace("world", "JS"); // "hello JS"
"aaaa".replace(/a/g, "b");            // "bbbb"（g フラグで全置換）
"aaaa".replaceAll("a", "b");          // "bbbb"（ES2021〜、これが楽）
```

### 繰り返し

```js
"ab".repeat(3); // "ababab"
```

### パディング（桁揃え）

```js
"5".padStart(3, "0");  // "005"
"abc".padEnd(6, "-");  // "abc---"
```

日付のゼロ埋めなどに便利。

## 数値との変換

### 文字列 → 数値

```js
Number("123");     // 123
Number("12.5");    // 12.5
Number("abc");     // NaN
parseInt("12px");  // 12（先頭の数字を取る）
parseFloat("12.5abc"); // 12.5
+"123";            // 123（ユーザの中でよく使うトリック）
```

### 数値 → 文字列

```js
String(123);       // "123"
(123).toString();  // "123"
(255).toString(16); // "ff"（16進）
(1.2345).toFixed(2); // "1.23"
```

## 比較

```js
"abc" === "abc"; // true
"abc" < "abd";   // true（辞書順）
```

日本語を含む比較は `localeCompare` が安全。

```js
"あ".localeCompare("い"); // -1
["c", "a", "b"].sort((a, b) => a.localeCompare(b));
```

## 正規表現との組み合わせ

詳しくは [[RegExp]] を参照。

```js
const text = "price: 1000 yen";
const m = text.match(/\d+/);     // ["1000", ...]
const all = text.match(/\d/g);   // ["1", "0", "0", "0"]
text.search(/\d+/);              // 7（位置）
text.replace(/\d+/, "9999");     // "price: 9999 yen"
```

## 文字コード・エンコード

```js
"A".charCodeAt(0);          // 65
String.fromCharCode(65);    // "A"

"🍎".codePointAt(0);         // 127822（コードポイント）
String.fromCodePoint(127822); // "🍎"

encodeURIComponent("あ");    // "%E3%81%82"（URLエンコード）
decodeURIComponent("%E3%81%82"); // "あ"
```

## テンプレートリテラルの応用：タグ付き

関数名をバッククォートの前に置くと、文字列と値の配列を受け取れます。

```js
function tag(strings, ...values) {
  console.log(strings); // テンプレの静的部分
  console.log(values);  // 埋め込み値
  return strings.raw.join("_") + values.join(",");
}

tag`Hello ${1} World ${2}`;
```

主にエスケープ処理や国際化などで使われます。初心者は存在を知っているだけで十分。

## よくある落とし穴

### 1. 文字列の変更

```js
let s = "hello";
s[0] = "H";       // 無効（エラーにすらならない）
console.log(s);   // "hello" のまま
```

正しくは `s = "H" + s.slice(1);`。

### 2. 数値っぽい文字列の比較

```js
"10" < "9";  // true（文字列比較）
10 < "9";    // false（数値比較：9 → 9）
```

型変換に注意。確実に数値比較したいなら `Number()` を通す。

### 3. 文字列連結より join

```js
let s = "";
for (const x of list) {
  s += x + ","; // 毎回新しい文字列を作る
}
// ↓ のほうが速く、末尾のカンマも残らない
const s2 = list.join(",");
```

## まとめ

- 文字列はイミュータブル。メソッドは必ず新しい文字列を返す
- テンプレートリテラル `${}` が基本。複数行も便利
- `slice`, `split`, `replace`, `trim`, `includes` はよく使う
- 数値変換は `Number()` / `parseInt()` / `toFixed()`
- 全置換は `replaceAll` か正規表現の `/g`

文字列操作は「数えるくらいなら1秒で思い出したい」メソッドが多いです。少しずつ自然に出てくるようにしましょう。
