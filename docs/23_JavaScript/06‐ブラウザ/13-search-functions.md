# JavaScriptの検索機能まとめ

---

## 1. 検索機能とは
検索機能は、データやテキストの中から特定の条件に合致する情報を探し出す仕組みです。WebアプリやAPI、データベースなど様々な場面で利用されます。

---

## 2. JavaScriptでの基本的な検索

### 2-1. 配列の検索
- find, filter, some, every などのメソッドを活用
- [[08-arrays|配列の検索]] も参照

```js
const users = [
  { name: "Alice", age: 25 },
  { name: "Bob", age: 30 }
];
const result = users.find(user => user.name === "Alice");
```

### 2-2. 文字列の検索
- includes, indexOf, match など
```js
const text = "JavaScriptは人気の言語です";
console.log(text.includes("人気")); // true
```

### 2-3. 正規表現検索
```js
const str = "abc123";
const found = str.match(/\d+/); // ["123"]
```

---

## 3. フロントエンドでの検索UI
- インクリメンタルサーチ（入力のたびに候補を絞り込む）
- [[3-5-イベント処理|Reactのイベント（3-5）]]
- [[09-hooks|Reactのhooks]]

```jsx
const [query, setQuery] = useState("");
const filtered = items.filter(item => item.includes(query));
```

---

## 4. バックエンド/APIでの検索
- サーバーサイドでの検索処理
- [[10-database|Node.jsでのDB検索]]
- [[07-APIサーバー構築|APIサーバーでの検索]]

---

## 5. データベース検索
- SQLによる検索（SELECT文）
- [[02_SQLの基本操作（CRUD）|SQL基礎]]
- [[03_インデックスの基本と設計|インデックスと最適化]]

---

## 6. 検索機能の高度化
- 全文検索エンジン（Elasticsearch, Algolia など）
- 複数条件のフィルタ、正規表現、ランキング
- APIやDB設計の工夫

---

## 7. まとめ・関連リンク
- [[08-arrays|配列の検索]]
- [[09-objects|オブジェクトの検索]]
- [[3-5-イベント処理|Reactでの検索UI]]
- [[10-database|Node.jsでのDB検索]]
- [[02_SQLの基本操作（CRUD）|SQLによる検索]]

---

Obsidianでの学習効率を高めるため、各技術ごとの教材ファイルにページリンクで整理・相互参照しましょう。 