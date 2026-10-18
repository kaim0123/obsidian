# 4-4. Immutable更新（配列/オブジェクト）

## 🎯 この章で学ぶこと

- 「Immutable（イミュータブル）」とは何か
- なぜ配列・オブジェクトを直接書き換えてはいけないか
- スプレッド構文や map/filter で安全に更新する方法

---

## 📖 概念の説明

### Immutable = 「変更不可」

直訳すると「**変更しない**」。元のデータを書き換えるのではなく、**新しいデータを作って差し替える**スタイル。

### なぜ Immutable に？

Reactは**「state が変わったか」を `===` で比較**します。

```jsx
const a = { x: 1 };
a.x = 2;
// 同じ参照（===）なので Reactは「変わってない」と判定 → 再レンダーしない
```

```jsx
const a = { x: 1 };
const b = { ...a, x: 2 };
// 別の参照 → Reactは「変わった」と判定 → 再レンダー
```

つまり、**新しいオブジェクトを作って setState** する必要があります。

---

## 💻 オブジェクトの更新

### ❌ NG：直接書き換え

```jsx
const [user, setUser] = useState({ name: '太郎', age: 20 });

function handleClick() {
  user.age = 21;       // ❌ 直接変更
  setUser(user);       // 同じ参照。再レンダーされない
}
```

### ✅ スプレッドで新しいオブジェクト

```jsx
function handleClick() {
  setUser({ ...user, age: 21 });
}
```

`{ ...user, age: 21 }` は「**user の中身を全部コピーして、ageだけ21に**」。

### ネストしたオブジェクト

```jsx
const [state, setState] = useState({
  user: { name: '太郎', address: { city: '東京' } },
});

// ❌ NG
state.user.address.city = '大阪';

// ✅ ネスト分だけスプレッド
setState({
  ...state,
  user: {
    ...state.user,
    address: { ...state.user.address, city: '大阪' },
  },
});
```

ネストが深いと面倒。深い場合は **immer** を使うと楽：

```jsx
import { produce } from 'immer';

setState(produce((draft) => {
  draft.user.address.city = '大阪';
}));
```

---

## 💻 配列の更新

### 追加（最後に）

```jsx
// ❌
items.push(newItem);
setItems(items);

// ✅
setItems([...items, newItem]);
```

### 追加（最初に）

```jsx
setItems([newItem, ...items]);
```

### 削除（idで指定）

```jsx
setItems(items.filter((item) => item.id !== targetId));
```

### 更新（idで指定）

```jsx
setItems(items.map((item) =>
  item.id === targetId ? { ...item, name: '新しい名前' } : item
));
```

### 並び替え

```jsx
// ❌ sortは元配列を破壊する
items.sort();
setItems(items);

// ✅ コピーを作ってからsort
setItems([...items].sort((a, b) => a.id - b.id));
```

### reverse も同じ

```jsx
setItems([...items].reverse());
```

---

## 💻 配列メソッド：壊すか壊さないか

| メソッド | 元配列を変える？ | Reactで安全？ |
| --- | --- | --- |
| push, pop, shift, unshift | ✗ 変える | ❌ NG |
| splice | ✗ 変える | ❌ NG |
| sort, reverse | ✗ 変える | ❌ NG（コピー必須） |
| map, filter, slice, concat | ✓ 新しい配列を返す | ✅ OK |
| spread (`[...arr]`) | ✓ 新しい配列 | ✅ OK |

---

## 💻 実践例

### TODOリストの全機能

```jsx
function TodoApp() {
  const [todos, setTodos] = useState([]);

  function addTodo(text) {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
  }

  function toggleTodo(id) {
    setTodos(todos.map((todo) =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  }

  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    setTodos(todos.filter((todo) => !todo.done));
  }

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          {todo.text}
          <button onClick={() => deleteTodo(todo.id)}>削除</button>
        </li>
      ))}
    </ul>
  );
}
```

---

## 💎 immer で楽に書く

ネストが深い・複雑なら、**immer** ライブラリで「直接書き換え風」のコードがImmutable更新になる。

```bash
npm install immer
```

```jsx
import { produce } from 'immer';

const [state, setState] = useState({ items: [], total: 0 });

function addItem(item) {
  setState(produce((draft) => {
    draft.items.push(item);     // ← 普通に push してOK
    draft.total += item.price;
  }));
}
```

内部で immer が新しいオブジェクトを作ってくれる。

---

## ❌ よくある間違い

### state を直接 push / sort / 代入

→ 画面が更新されない、または予測不能なバグ。

### スプレッドが浅いコピーだと知らない

```jsx
const newState = { ...state }; // 1段だけコピー
newState.user.name = '...'; // ← もとのstate.user.nameも変わる！
```

→ ネストはネスト分スプレッド or immer。

### `Object.assign(user, {...})` を直接使う

```jsx
// ❌ user を変更している
Object.assign(user, { age: 21 });

// ✅ 新しいオブジェクト
const newUser = Object.assign({}, user, { age: 21 });
// もしくは
const newUser = { ...user, age: 21 };
```

---

## ✅ ベストプラクティス

1. **stateは絶対に直接変えない**
2. **スプレッド** `{...obj}`、`[...arr]` を覚える
3. 配列：**map/filter/concat** が安全
4. 並び替えは **`[...arr].sort()`**
5. ネストが深い・複雑なら **immer**

---

## 🔬 実践演習

```jsx
const [users, setUsers] = useState([
  { id: 1, name: '太郎', tags: ['初心者'] },
  { id: 2, name: '花子', tags: ['中級者', 'TS'] },
]);

// 以下を実装：
// 1. id=1 の name を '太郎ちゃん' に変える
// 2. id=2 の tags に 'React' を追加する
// 3. id=1 を削除する
```

---

## 📝 まとめ

- stateは直接書き換えず、新しいオブジェクト/配列を作る
- スプレッド構文 `{...}` `[...]` が基本
- map/filter/concat は安全、push/sort は要コピー
- ネストが深いなら immer

---

## 🔗 関連ページ

- [[4-1-useStateの基本]]
- [[4-2-state設計のコツ]]
- [[4-3-setStateの落とし穴]]
- [[8-2-useReducer]]
