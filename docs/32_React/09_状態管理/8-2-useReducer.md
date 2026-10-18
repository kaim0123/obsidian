# 8-2. useReducer（複雑な更新を整理）

## 🎯 この章で学ぶこと

- useReducer とは何か、useState との違い
- 「アクション」と「リデューサー関数」の考え方
- どんなときに useReducer を選ぶか

---

## 📖 概念の説明

### useReducer とは

「**stateを更新するロジックを1つの関数（reducer）に集める**」フック。

useState は「state と setter のペア」、useReducer は「state と dispatch のペア」。

```jsx
const [state, dispatch] = useReducer(reducer, initialState);
```

- `state`：現在の値
- `dispatch`：アクションを発行する関数
- `reducer`：(state, action) → 新しいstate

### イメージ：レジ係 vs 自動販売機

- **useState**：レジ係に「+1ね」「リセットして」と直接言う
- **useReducer**：自動販売機に「TYPE: ADD」「TYPE: RESET」というボタンを押して指示を送る

ボタン（アクション）を増やすほど機能が増えるが、**操作の種類が一覧で見える**。

---

## 💻 例：useState版 → useReducer版

### useState版

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

### useReducer版

```jsx
function reducer(state, action) {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
    case 'reset':     return 0;
    default: throw new Error(`Unknown: ${action.type}`);
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset' })}>Reset</button>
    </div>
  );
}
```

`reducer` に**全ての更新ロジック**が集まっている。

---

## 💻 複雑な例：TODOアプリ

```jsx
const initialState = { todos: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'add':
      return { ...state, todos: [...state.todos, { id: Date.now(), text: action.text, done: false }] };
    case 'toggle':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t
        ),
      };
    case 'delete':
      return { ...state, todos: state.todos.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

function TodoApp() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <button onClick={() => dispatch({ type: 'add', text: '掃除' })}>追加</button>
      <ul>
        {state.todos.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done}
              onChange={() => dispatch({ type: 'toggle', id: t.id })}
            />
            {t.text}
            <button onClick={() => dispatch({ type: 'delete', id: t.id })}>×</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

stateが複雑になるほど、**ロジックを1か所に集める**メリットが出る。

---

## 🤔 useStateとuseReducer、どう選ぶ？

### useState の出番

- stateが**1〜2個**で独立している
- 更新ロジックが**シンプル**
- 学習・小規模アプリ

### useReducer の出番

- stateが**複数フィールド**（オブジェクト）
- 更新が**条件付き・複雑**
- 「次のstateは前のstateに依存する」
- ロジックを**コンポーネント外に分離**したい
- テストしやすくしたい（reducer は純関数）

---

## 💡 reducerは純関数

reducer は**副作用なし、入力が同じなら出力も同じ**な関数（純関数）。

```jsx
// ✅ 純関数
function reducer(state, action) {
  return { ...state, count: state.count + 1 };
}

// ❌ 副作用あり
function reducer(state, action) {
  fetch('/api/log', { method: 'POST' }); // ❌ ダメ
  return { ...state, count: state.count + 1 };
}
```

副作用は呼び出し元（コンポーネント）で。

---

## 💻 useReducer + Context（プチ状態管理）

複数コンポーネントで共有したいなら：

```jsx
const TodoContext = createContext();

function TodoProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <TodoContext.Provider value={{ state, dispatch }}>
      {children}
    </TodoContext.Provider>
  );
}

// 子コンポーネント
function TodoItem({ id }) {
  const { state, dispatch } = useContext(TodoContext);
  // ...
}
```

→ 詳しくは [[8-3-Context]]

---

## ❌ よくある間違い

### reducerの中で副作用

→ 上記参照。useEffect か イベントハンドラで。

### state を直接書き換える

```jsx
case 'add':
  state.todos.push(newTodo); // ❌
  return state;
```

→ ✅ 新しいオブジェクト：

```jsx
case 'add':
  return { ...state, todos: [...state.todos, newTodo] };
```

### action.type の typo

```jsx
dispatch({ type: 'incrment' }); // typo
```

→ TypeScriptで Union 型にすると防げる。

```ts
type Action = { type: 'increment' } | { type: 'decrement' };
```

---

## ✅ ベストプラクティス

1. **小さければuseState**、複雑になったら useReducer
2. **reducer は純関数**（副作用禁止）
3. **action.type は文字列定数**にする
4. TypeScript で **Action型を Union** に
5. **テストはreducerに対して書く**と楽

---

## 🔬 実践演習

「ショッピングカート」を useReducer で作る：

- 商品を追加
- 数量を増減
- 商品を削除
- 全削除

action.type は `add`/`increase`/`decrease`/`remove`/`clear`。

---

## 📝 まとめ

- useReducer = 更新ロジックを1関数に集める
- (state, action) → newState
- reducer は純関数
- 複雑になったら useState から移行

---

## 🔗 関連ページ

- [[4-1-useStateの基本]]
- [[8-1-まずはReactだけで]]
- [[8-3-Context]]
- [[11-2-useState-useReducerの型]]
