# 3-4. リストレンダリングとkey（なぜ必要か）

## 🎯 この章で学ぶこと

- 配列から複数の要素を表示する書き方（map）
- `key` 属性が必要な理由
- `key` に何を指定すべきか / 避けるべきか

---

## 📖 概念の説明

### map で配列を JSX に変換

```jsx
const fruits = ['りんご', 'みかん', 'ぶどう'];

return (
  <ul>
    {fruits.map((fruit) => <li key={fruit}>{fruit}</li>)}
  </ul>
);
```

→ 表示：

```text
- りんご
- みかん
- ぶどう
```

`map` で配列の各要素を `<li>` に変換し、JSXに埋め込みます。

### `key` とは

**Reactが各要素を識別するための「目印」**。各要素に**ユニーク**な値を付けます。

```jsx
{items.map((item) => <li key={item.id}>{item.name}</li>)}
```

---

## 🤔 なぜ `key` が必要？

### Reactは差分更新する

リストを再レンダーするとき、Reactは「**どの要素が増えた・減った・移動した**」を判断する必要があります。

`key` がないと、Reactは「順番」だけで判断します。例えば：

```jsx
// 削除前
['A', 'B', 'C']
// 削除後（Bを削除）
['A', 'C']
```

`key` がないと、Reactは「3番目を削除したのか？それとも2番目を書き換えたのか？」が分かりません。最悪の場合、**stateや入力値が混乱**します。

### `key` があると：

```jsx
{items.map((item) => <Item key={item.id} item={item} />)}
```

Reactは「id=2の要素が消えた」と分かるので、無駄な再描画を避け、stateを正しく保てます。

---

## 💻 何を `key` にするか

### ✅ 良い：データのユニークID

```jsx
const users = [{ id: 1, name: '太郎' }, { id: 2, name: '花子' }];

users.map((u) => <li key={u.id}>{u.name}</li>)
```

データベースのIDなど、**変わらない・重複しない値**が最適。

### ⚠️ 注意：mapのindexはなるべく避ける

```jsx
items.map((item, index) => <li key={index}>{item}</li>)
```

これは「何もしないよりはマシ」だが、**並び替え・削除・追加で問題が出ることがある**。

#### indexで起こる事故の例

```jsx
const [items, setItems] = useState(['A', 'B', 'C']);

// 各itemに input がついていて、ユーザーが値を入れた状態
// → 先頭にDを追加すると...
items.unshift('D');

// indexをkeyにしていると、Reactは「0番目が変わった」と認識
// 結果、入力値がズレる
```

### ❌ NG：ランダムな値

```jsx
{items.map((item) => <li key={Math.random()}>{item}</li>)}
```

→ 毎回違う `key` になるので、Reactは毎回**全削除→全追加**してしまう。stateが消える。

### `key` がよく分からないとき

データにIDがなければ、ローカルで生成する：

```jsx
import { useState } from 'react';
const [items, setItems] = useState([
  { id: crypto.randomUUID(), text: '...' },
  { id: crypto.randomUUID(), text: '...' },
]);
```

---

## 💻 実践例

### 例：TODOリスト

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: '掃除', done: false },
    { id: 2, text: '買い物', done: true },
  ]);

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
            {todo.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
```

### 例：オブジェクトでの並び替え

```jsx
const [users, setUsers] = useState([
  { id: 1, name: '太郎' },
  { id: 2, name: '花子' },
  { id: 3, name: '次郎' },
]);

// 並び替え（id を保ったまま順番だけ変わる）
setUsers([...users].reverse());
```

`key={id}` のおかげで、Reactは「3つの要素が並び替わった」と正しく認識し、各要素のstate（例：input値）も保たれる。

---

## ❌ よくある間違い

### `key` を付けない（Warning）

```text
Warning: Each child in a list should have a unique "key" prop.
```

→ 必ず `key` を付ける。デバッグが大変になる。

### `key` をフラグメントの中の中身に付ける

```jsx
// ❌
{items.map((item) => (
  <>
    <li key={item.id}>{item.name}</li>
  </>
))}
```

→ ✅ `<>` ではなく `<React.Fragment key={...}>` を使う。

### 兄弟同士で `key` が重複

```jsx
{items.map((item) => <li key="static">{item}</li>)}
```

→ どれも同じ `key`。`key`は**同じmap内でユニーク**である必要がある。

### indexを安易にkeyにする

→ **並び替え・追加・削除がない場合は許容**。あるなら避ける。

---

## ✅ ベストプラクティス

1. **データのユニークID**をkeyにする（最強）
2. なければ **`crypto.randomUUID()`** で生成しておく
3. **indexは静的なリスト**でだけ
4. **map内でユニーク**であればOK（兄弟リスト同士は同じkeyでもOK）
5. **`Math.random()`は絶対NG**

---

## 🔬 実践演習

```jsx
const [items, setItems] = useState([
  { id: 1, text: '太郎' },
  { id: 2, text: '花子' },
]);

// ボタンを作って：
// - 「先頭に追加」
// - 「最後に追加」
// - 「並び替え」
// 各itemに input を追加し、入力値が並び替えで保たれるかを確認
```

---

## 📝 まとめ

- map で配列をJSXに変換
- 各要素にユニークな `key` を付ける
- IDがあればID、なければUUID。indexはほどほどに
- `key` でReactが「同じ要素か」を判定する

---

## 🔗 関連ページ

- [[3-2-関数コンポーネント]]
- [[3-3-条件分岐レンダリング]]
- [[4-4-Immutable更新]]
- [[9-4-リスト最適化]]
