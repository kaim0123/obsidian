# JavaScript応用：検索機能の設計と実践

---

## 1. 検索機能の設計パターン
- 単純検索（キーワード一致、部分一致）
- 複合条件検索（AND/OR/NOT）
- フィルタリングとソートの組み合わせ
- インクリメンタルサーチ（リアルタイム絞り込み）
- サーバー/API連携型検索

---

## 2. 配列・オブジェクトの高度な検索
- find, filter, some, every, map, reduce の応用
- ネスト構造・多次元配列の検索
- オブジェクト配列の複合条件検索
- [[08-arrays|配列の検索基礎]]
- [[09-objects|オブジェクトの検索]]

```js
// 複合条件での検索
const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Carol", age: 28, active: true }
];
const actives = users.filter(u => u.active && u.age > 26);
// [{ name: "Carol", age: 28, active: true }]
```

---

## 3. 文字列・正規表現検索の応用
- includes, indexOf, match, replace, 正規表現パターン
- 大文字小文字無視、全角半角正規化
- 複数キーワード検索
- [[js-functions|文字列・検索関数]]

```js
const text = "JavaScriptで検索機能を作る";
const found = text.match(/検索/); // ["検索"]
const multi = ["検索", "機能"].every(k => text.includes(k)); // true
```

---

## 4. インクリメンタルサーチとUX
- 入力ごとに候補を絞り込むリアルタイム検索
- デバウンス（入力後一定時間待って検索）
- 検索結果のハイライト表示
- [[React/12-practice|React実践：検索UI]]

```jsx
// デバウンス例（React）
const [query, setQuery] = useState("");
const [result, setResult] = useState([]);
useEffect(() => {
  const handler = setTimeout(() => {
    setResult(items.filter(i => i.includes(query)));
  }, 300);
  return () => clearTimeout(handler);
}, [query, items]);
```

---

## 5. 複合条件・多段フィルタリング
- 状態・カテゴリ・キーワードなど複数条件での絞り込み
- AND/OR条件の組み合わせ
- ソートとの併用
- [[11-practical-project|TypeScript実践：多段フィルタ]]

```js
const filtered = items.filter(item =>
  (!status || item.status === status) &&
  (!category || item.category === category) &&
  (!query || item.title.includes(query))
);
```

---

## 6. API/DB連携による検索
- サーバーサイドでの検索処理（REST/GraphQL）
- クエリパラメータによる検索
- DBインデックス・全文検索エンジンの活用
- [[01_programming/05_React・フロントエンド開発/11_Next.js/12-practice|Next.js実践：API検索]]
- [[03_インデックスの基本と設計|DBインデックスと最適化]]

```js
// Next.js API例
fetch(`/api/search?q=${encodeURIComponent(query)}`)
  .then(res => res.json())
  .then(data => setResult(data));
```

---

## 7. パフォーマンス最適化
- デバウンス・スロットリング
- メモ化（useMemo, キャッシュ）
- DBインデックス設計
- 大量データ時の仮想リスト表示
- [[React/12-practice|React：パフォーマンス最適化]]
- [[03_インデックスの基本と設計|DB最適化]]

---

## 8. 実践例
### ToDoアプリの検索
- タイトル・説明・カテゴリ・状態での絞り込み
- [[11-practical-project|TypeScript実践：ToDo検索]]

### ブログ・商品検索
- 複数キーワード・タグ・カテゴリ・全文検索
- [[01_programming/05_React・フロントエンド開発/11_Next.js/12-practice|Next.js：ブログ検索]]

---

## 9. 練習問題
1. 配列の中から「名前に'a'が含まれ、かつactiveなユーザー」を抽出する関数を作成せよ。
2. 入力値で商品リストをインクリメンタルサーチするReactコンポーネントを作成せよ。
3. API経由で取得したデータを複数条件でフィルタし、パフォーマンスを考慮した実装をせよ。

---

## 10. 関連リンク
- [[13-search-functions|検索機能まとめ（基礎）]]
- [[08-arrays|配列の検索]]
- [[09-objects|オブジェクトの検索]]
- [[js-functions|検索・判定関数]]
- [[React/12-practice|React実践：検索・ソートUI]]
- [[01_programming/05_React・フロントエンド開発/11_Next.js/12-practice|Next.js実践：API検索]]
- [[03_インデックスの基本と設計|DBインデックスと最適化]]

---

Obsidianでの学習効率を高めるため、各技術ごとの教材ファイルにページリンクで整理・相互参照しましょう。 