# JavaScript組み込み関数一覧

## 📋 関数カテゴリ別一覧

### 🔢 数学関数（Math）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `Math.abs()` | 絶対値を返す | `Math.abs(-5)` | `5` |
| `Math.ceil()` | 切り上げ | `Math.ceil(4.3)` | `5` |
| `Math.floor()` | 切り捨て | `Math.floor(4.7)` | `4` |
| `Math.round()` | 四捨五入 | `Math.round(4.5)` | `5` |
| `Math.max()` | 最大値を返す | `Math.max(1, 2, 3)` | `3` |
| `Math.min()` | 最小値を返す | `Math.min(1, 2, 3)` | `1` |
| `Math.pow()` | 累乗 | `Math.pow(2, 3)` | `8` |
| `Math.sqrt()` | 平方根 | `Math.sqrt(16)` | `4` |
| `Math.random()` | 0-1の乱数 | `Math.random()` | `0.123...` |
| `Math.sin()` | サイン | `Math.sin(Math.PI/2)` | `1` |
| `Math.cos()` | コサイン | `Math.cos(0)` | `1` |
| `Math.tan()` | タンジェント | `Math.tan(0)` | `0` |
| `Math.log()` | 自然対数 | `Math.log(Math.E)` | `1` |
| `Math.exp()` | 指数関数 | `Math.exp(1)` | `2.718...` |

### 📝 文字列関数（String）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `charAt()` | 指定位置の文字 | `"Hello".charAt(1)` | `"e"` |
| `charCodeAt()` | 文字コード | `"A".charCodeAt(0)` | `65` |
| `concat()` | 文字列結合 | `"Hello".concat(" World")` | `"Hello World"` |
| `indexOf()` | 文字列検索 | `"Hello".indexOf("l")` | `2` |
| `lastIndexOf()` | 後ろから検索 | `"Hello".lastIndexOf("l")` | `3` |
| `replace()` | 文字列置換 | `"Hello".replace("H", "J")` | `"Jello"` |
| `replaceAll()` | 全置換 | `"Hello".replaceAll("l", "x")` | `"Hexxo"` |
| `slice()` | 部分文字列 | `"Hello".slice(1, 4)` | `"ell"` |
| `substring()` | 部分文字列 | `"Hello".substring(1, 4)` | `"ell"` |
| `substr()` | 部分文字列 | `"Hello".substr(1, 3)` | `"ell"` |
| `toLowerCase()` | 小文字変換 | `"HELLO".toLowerCase()` | `"hello"` |
| `toUpperCase()` | 大文字変換 | `"hello".toUpperCase()` | `"HELLO"` |
| `trim()` | 空白除去 | `" Hello ".trim()` | `"Hello"` |
| `split()` | 文字列分割 | `"a,b,c".split(",")` | `["a", "b", "c"]` |
| `startsWith()` | 開始文字列判定 | `"Hello".startsWith("He")` | `true` |
| `endsWith()` | 終了文字列判定 | `"Hello".endsWith("lo")` | `true` |
| `includes()` | 包含判定 | `"Hello".includes("ell")` | `true` |
| `padStart()` | 前方埋め | `"5".padStart(3, "0")` | `"005"` |
| `padEnd()` | 後方埋め | `"5".padEnd(3, "0")` | `"500"` |

### 📊 配列関数（Array）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `push()` | 末尾に追加 | `[1,2].push(3)` | `3` |
| `pop()` | 末尾を削除 | `[1,2,3].pop()` | `3` |
| `unshift()` | 先頭に追加 | `[1,2].unshift(0)` | `3` |
| `shift()` | 先頭を削除 | `[1,2,3].shift()` | `1` |
| `splice()` | 要素の削除・追加 | `[1,2,3].splice(1,1)` | `[2]` |
| `slice()` | 部分配列 | `[1,2,3,4].slice(1,3)` | `[2,3]` |
| `concat()` | 配列結合 | `[1,2].concat([3,4])` | `[1,2,3,4]` |
| `join()` | 文字列結合 | `[1,2,3].join("-")` | `"1-2-3"` |
| `reverse()` | 逆順 | `[1,2,3].reverse()` | `[3,2,1]` |
| `sort()` | ソート | `[3,1,2].sort()` | `[1,2,3]` |
| `indexOf()` | 要素検索 | `[1,2,3].indexOf(2)` | `1` |
| `lastIndexOf()` | 後ろから検索 | `[1,2,2].lastIndexOf(2)` | `2` |
| `includes()` | 包含判定 | `[1,2,3].includes(2)` | `true` |
| `find()` | 条件検索 | `[1,2,3].find(x => x > 2)` | `3` |
| `findIndex()` | 条件検索インデックス | `[1,2,3].findIndex(x => x > 2)` | `2` |
| `filter()` | 条件フィルタ | `[1,2,3].filter(x => x > 1)` | `[2,3]` |
| `map()` | 要素変換 | `[1,2,3].map(x => x * 2)` | `[2,4,6]` |
| `reduce()` | 配列縮約 | `[1,2,3].reduce((a,b) => a+b)` | `6` |
| `forEach()` | 要素処理 | `[1,2,3].forEach(console.log)` | `undefined` |
| `every()` | 全要素条件判定 | `[1,2,3].every(x => x > 0)` | `true` |
| `some()` | 一部要素条件判定 | `[1,2,3].some(x => x > 2)` | `true` |

### 🔧 型変換関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `parseInt()` | 整数変換 | `parseInt("123")` | `123` |
| `parseFloat()` | 小数変換 | `parseFloat("123.45")` | `123.45` |
| `Number()` | 数値変換 | `Number("123")` | `123` |
| `String()` | 文字列変換 | `String(123)` | `"123"` |
| `Boolean()` | 真偽値変換 | `Boolean(1)` | `true` |
| `Array.from()` | 配列変換 | `Array.from("hello")` | `["h","e","l","l","o"]` |
| `Object.keys()` | キー配列 | `Object.keys({a:1,b:2})` | `["a","b"]` |
| `Object.values()` | 値配列 | `Object.values({a:1,b:2})` | `[1,2]` |
| `Object.entries()` | キー値ペア | `Object.entries({a:1,b:2})` | `[["a",1],["b",2]]` |

### 🕒 日時関数（Date）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `new Date()` | 現在時刻 | `new Date()` | `2024-01-01T...` |
| `getFullYear()` | 年取得 | `new Date().getFullYear()` | `2024` |
| `getMonth()` | 月取得 | `new Date().getMonth()` | `0-11` |
| `getDate()` | 日取得 | `new Date().getDate()` | `1-31` |
| `getDay()` | 曜日取得 | `new Date().getDay()` | `0-6` |
| `getHours()` | 時取得 | `new Date().getHours()` | `0-23` |
| `getMinutes()` | 分取得 | `new Date().getMinutes()` | `0-59` |
| `getSeconds()` | 秒取得 | `new Date().getSeconds()` | `0-59` |
| `getMilliseconds()` | ミリ秒取得 | `new Date().getMilliseconds()` | `0-999` |
| `getTime()` | タイムスタンプ | `new Date().getTime()` | `1704067200000` |
| `toISOString()` | ISO文字列 | `new Date().toISOString()` | `"2024-01-01T..."` |
| `toLocaleDateString()` | ローカル日付 | `new Date().toLocaleDateString()` | `"2024/1/1"` |
| `toLocaleTimeString()` | ローカル時刻 | `new Date().toLocaleTimeString()` | `"12:00:00"` |

### 🔍 検索・判定関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `isNaN()` | NaN判定 | `isNaN("hello")` | `true` |
| `isFinite()` | 有限数判定 | `isFinite(123)` | `true` |
| `Array.isArray()` | 配列判定 | `Array.isArray([1,2,3])` | `true` |
| `typeof` | 型判定 | `typeof "hello"` | `"string"` |
| `instanceof` | インスタンス判定 | `[] instanceof Array` | `true` |
| `Object.is()` | 厳密等価 | `Object.is(NaN, NaN)` | `true` |

### 🎲 乱数・暗号関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `Math.random()` | 乱数生成 | `Math.random()` | `0-1` |
| `crypto.randomUUID()` | UUID生成 | `crypto.randomUUID()` | `"uuid"` |
| `crypto.getRandomValues()` | 暗号乱数 | `crypto.getRandomValues(new Uint8Array(10))` | `Uint8Array` |

### 📦 JSON関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `JSON.stringify()` | JSON文字列化 | `JSON.stringify({a:1})` | `'{"a":1}'` |
| `JSON.parse()` | JSON解析 | `JSON.parse('{"a":1}')` | `{a:1}` |

### 🔧 エンコード・デコード関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `encodeURI()` | URIエンコード | `encodeURI("hello world")` | `"hello%20world"` |
| `decodeURI()` | URIデコード | `decodeURI("hello%20world")` | `"hello world"` |
| `encodeURIComponent()` | URIコンポーネントエンコード | `encodeURIComponent("a=b")` | `"a%3Db"` |
| `decodeURIComponent()` | URIコンポーネントデコード | `decodeURIComponent("a%3Db")` | `"a=b"` |
| `btoa()` | Base64エンコード | `btoa("hello")` | `"aGVsbG8="` |
| `atob()` | Base64デコード | `atob("aGVsbG8=")` | `"hello"` |

### 🎯 グローバル関数

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `eval()` | 文字列実行 | `eval("2 + 2")` | `4` |
| `setTimeout()` | 遅延実行 | `setTimeout(() => {}, 1000)` | `timeoutId` |
| `setInterval()` | 定期実行 | `setInterval(() => {}, 1000)` | `intervalId` |
| `clearTimeout()` | タイマー停止 | `clearTimeout(timeoutId)` | `undefined` |
| `clearInterval()` | インターバル停止 | `clearInterval(intervalId)` | `undefined` |
| `console.log()` | ログ出力 | `console.log("hello")` | `undefined` |
| `console.error()` | エラーログ | `console.error("error")` | `undefined` |
| `console.warn()` | 警告ログ | `console.warn("warning")` | `undefined` |
| `console.table()` | テーブル出力 | `console.table([{a:1,b:2}])` | `undefined` |

---

## 🔗 関連リンク

- [[01_programming/04_JavaScript基礎/01_JavaScript/01-basics|第1章：JavaScriptの基本]]
- [[01_programming/04_JavaScript基礎/01_JavaScript/02-setup|第2章：開発環境の準備]]
- [[03-variables|第3章：変数]]
- [[04-operators|第4章：演算子]]
- [[05-conditions|第5章：条件分岐]]
- [[06-loops|第6章：繰り返し処理]]
- [[07-functions|第7章：関数]]
- [[08-arrays|第8章：配列]]
- [[09-objects|第9章：オブジェクト]]
- [[10-dom|第10章：DOM操作]]
- [[11-practice|第11章：実践練習]]
- [[12-js-ecosystem|第12章：JavaScriptエコシステム]]

---

## 📝 使用上の注意

### 非推奨関数
- `eval()` - セキュリティリスクのため使用を避ける
- `document.write()` - モダンな開発では使用しない
- `with`文 - 非推奨、使用を避ける

### ブラウザ互換性
一部の関数は古いブラウザでサポートされていない場合があります：
- `Array.prototype.includes()` - IE非対応
- `String.prototype.padStart()` - IE非対応
- `Object.values()` - IE非対応
- `crypto.randomUUID()` - 比較的新しい機能

### パフォーマンス
- ループ内での`Array.prototype.includes()`は`Set`の使用を検討
- 大量の文字列操作には`StringBuilder`パターンを検討
- 配列の頻繁な変更には`ArrayBuffer`を検討

---

## 🎯 実践的な使用例

### 配列操作の組み合わせ
```javascript
// 数値配列から偶数のみを抽出して2倍にする
const numbers = [1, 2, 3, 4, 5, 6];
const result = numbers
  .filter(num => num % 2 === 0)
  .map(num => num * 2);
// result: [4, 8, 12]
```

### 文字列処理
```javascript
// 文字列の正規化と検索
const text = "  Hello World  ";
const normalized = text.trim().toLowerCase();
const hasHello = normalized.includes("hello");
// hasHello: true
```

### 日時処理
```javascript
// 現在時刻から1週間後を計算
const now = new Date();
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const formatted = nextWeek.toLocaleDateString();
```

---

**目次に戻る：** [[00-JavaScript index|JavaScriptプログラミング入門]] 