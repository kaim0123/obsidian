# Map / Set

## Map と Set とは

- **Map** … キーと値のペアを保存するデータ構造（辞書・連想配列）
- **Set** … 重複しない値を保存するデータ構造（集合）

どちらも ES2015（ES6）で追加された標準コレクションです。オブジェクトや配列でも似たことはできますが、Map/Set のほうが向いている場面が多くあります。

## Map

### Map の作り方

```js
const m = new Map();

// 初期値を渡すこともできる
const m2 = new Map([
  ["apple", 100],
  ["banana", 200],
]);
```

### 追加・取得・削除

```js
m.set("apple", 100);
m.set("banana", 200);

m.get("apple");  // 100
m.has("apple");  // true
m.delete("apple");
m.clear();       // 全部消す
m.size;          // 要素数
```

### 反復

```js
for (const [key, value] of m) {
  console.log(key, value);
}

m.forEach((value, key) => {
  console.log(key, value);
});

m.keys();   // イテレータ
m.values();
m.entries(); // [key, value] のイテレータ
```

### Map とオブジェクトの違い

| 観点 | Object | Map |
|---|---|---|
| キー | 文字列/Symbol のみ | 任意の値（オブジェクトも） |
| 順序 | 挿入順（だいたい） | 挿入順（保証） |
| サイズ | `Object.keys(obj).length` | `m.size` |
| イテレーション | 専用メソッドが必要 | `for...of` で直接 |
| プロトタイプ汚染 | `__proto__` などに注意 | ない |
| パフォーマンス | 大量追加・削除だと Map が有利 | |

### Map が向いている場面

- キーの種類がオブジェクトや数値などを含む
- 要素数が頻繁に変化する（キャッシュなど）
- 挿入順でループしたい
- 「辞書として使う」ことが明確

```js
const userCache = new Map();
userCache.set(user1, { lastSeen: Date.now() }); // キーがオブジェクト！
```

### Map → Object / Object → Map

```js
// Map → Object
const obj = Object.fromEntries(m);

// Object → Map
const m = new Map(Object.entries(obj));
```

## Set

### Set の作り方

```js
const s = new Set();
const s2 = new Set([1, 2, 3, 3, 2]); // {1, 2, 3}
```

Set は **重複を自動で排除** します。

### 追加・確認・削除

```js
s.add(1);
s.add(2);
s.add(1); // 追加されない

s.has(1); // true
s.delete(2);
s.clear();
s.size;
```

### 反復

```js
for (const value of s) {
  console.log(value);
}
s.forEach((v) => console.log(v));
```

### 典型的な使い方：重複削除

```js
const unique = [...new Set([1, 2, 2, 3, 3, 3])]; // [1, 2, 3]
```

配列の重複を1行で消せます。詳しくは [[配列の重複削除]]。

### 集合演算（Set の新メソッド、ES2025〜）

最新のブラウザ・Node では集合演算メソッドが標準化されています。

```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

a.union(b);         // {1,2,3,4}
a.intersection(b);  // {2,3}
a.difference(b);    // {1}
a.symmetricDifference(b); // {1,4}
a.isSubsetOf(b);
a.isSupersetOf(b);
a.isDisjointFrom(b);
```

古い環境ではスプレッドや `filter` で自作します。

```js
const union = new Set([...a, ...b]);
const intersection = new Set([...a].filter((x) => b.has(x)));
const difference = new Set([...a].filter((x) => !b.has(x)));
```

## WeakMap / WeakSet

**WeakMap / WeakSet** は、キーとして使うオブジェクトが他で使われなくなるとガベージコレクションで **自動的に消える** 特殊なコレクションです。

```js
const wm = new WeakMap();
let obj = {};
wm.set(obj, "data");
obj = null; // ここで WeakMap のエントリも回収可能になる
```

特徴：

- キーは **オブジェクトのみ**（プリミティブ不可）
- `size` / `forEach` / イテレータなし（列挙できない）
- メモリリーク防止や「追加情報をオブジェクトに紐付ける」用途

例：DOM要素にメタデータを紐付ける。

```js
const meta = new WeakMap();
meta.set(document.body, { scrolled: false });
```

要素が消えると自動で回収されます。

## Map/Set が向いている場面を整理

| やりたいこと | 推奨 |
|---|---|
| キーが文字列固定のシンプルな辞書 | Object |
| オブジェクトをキーにしたい | Map / WeakMap |
| 要素数が動的に増減する大きな辞書 | Map |
| 重複のないリストを作る | Set |
| 配列のユニーク化 | `[...new Set(arr)]` |
| オブジェクトに弱参照で情報を紐付けたい | WeakMap / WeakSet |

## よくある落とし穴

### 1. Map のキーは参照で一致

```js
const m = new Map();
m.set({ id: 1 }, "A");
m.get({ id: 1 }); // undefined（別オブジェクト）
```

オブジェクトキーは参照一致なので、リテラルを作り直すと当たりません。

### 2. Set に入ったオブジェクトも同じ

```js
const s = new Set();
s.add({ id: 1 });
s.has({ id: 1 }); // false
```

### 3. JSON.stringify は Map/Set を保存できない

```js
JSON.stringify(new Map([["a", 1]])); // "{}"
JSON.stringify(new Set([1, 2]));     // "{}"
```

保存したいなら配列に変換。

```js
JSON.stringify([...m.entries()]); // Map 用
JSON.stringify([...s]);           // Set 用
```

### 4. 順序を気にするなら Map 一択

Object でも大体挿入順ですが、数値キーは小さい順に並び替えられるなどの例外あり。厳密な順序が必要なら Map。

## まとめ

- **Map** = 任意の値をキーにできる辞書。順序が保証される
- **Set** = 重複のないコレクション
- Object/配列よりも Map/Set が向く場面は多い
- ユニーク化は `[...new Set(arr)]` の1行で済む
- **WeakMap/WeakSet** は自動GCされる特殊版、メモリ管理に便利
- JSON 化には一手間かかる

普段の開発では Object と Array で済ませがちですが、Map/Set を使うと意図が明確になり、パフォーマンスも向上するケースが多いです。
