# 11-2. useState/useReducerの型（推論と明示）

## 🎯 この章で学ぶこと

- useState の型推論と明示
- useReducer の型付け
- discriminated union で action を安全に

---

## 📖 useState の型

### 推論されるケース

初期値から型が推論される：

```ts
const [count, setCount] = useState(0);     // number
const [text, setText] = useState('');       // string
const [open, setOpen] = useState(false);    // boolean
```

### 明示するケース

#### 初期値が null / undefined

```ts
const [user, setUser] = useState<User | null>(null);
// 明示しないと、type は null だけになり、setUser(user) ができない
```

#### 配列・オブジェクト

```ts
const [items, setItems] = useState<Item[]>([]);
const [user, setUser] = useState<User>({ id: 0, name: '' });
```

#### Union 型

```ts
const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
```

---

## 💻 例

```tsx
type Todo = { id: number; text: string; done: boolean };

function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');

  function addTodo(text: string) {
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);
  }
}
```

---

## 💻 useReducer の型

### 状態とアクションを型で固める

```ts
type State = { count: number };

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'add'; payload: number }
  | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    case 'add':
      return { count: state.count + action.payload }; // ← payloadも型安全
    case 'reset':
      return { count: 0 };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'add', payload: 5 })}>+5</button>
    </div>
  );
}
```

### Discriminated Union のメリット

action.type で分岐すると、TSが自動でpayloadの型を絞ってくれる。

```ts
case 'add':
  // ここでは action.payload が number と確定
  return ...;
```

---

## 💻 useReducer の型推論

reducer 関数に型を付けておけば、useReducerは自動で推論する：

```ts
const [state, dispatch] = useReducer(reducer, { count: 0 });
// state: State
// dispatch: Dispatch<Action>
```

明示するなら：

```ts
useReducer<typeof reducer>(reducer, { count: 0 });
useReducer<Reducer<State, Action>>(reducer, { count: 0 });
```

---

## 💡 関数更新の型

```ts
const [count, setCount] = useState(0);

setCount((c) => c + 1); // c: number と推論される
```

明示も可能：

```ts
setCount((c: number) => c + 1);
```

---

## 💻 useStateで lazy initialization

重い初期値計算は関数で：

```ts
const [items, setItems] = useState<Item[]>(() => {
  const stored = localStorage.getItem('items');
  return stored ? JSON.parse(stored) : [];
});
```

型は通常通り推論される。

---

## 💻 オブジェクトのstateの型

```ts
type FormState = {
  name: string;
  email: string;
  errors: { name?: string; email?: string };
};

const [form, setForm] = useState<FormState>({
  name: '',
  email: '',
  errors: {},
});

setForm((prev) => ({ ...prev, name: '太郎' }));
```

---

## 💻 useReducer + Context の型

```tsx
type State = { ... };
type Action = ... ;

const StateContext = createContext<State | undefined>(undefined);
const DispatchContext = createContext<React.Dispatch<Action> | undefined>(undefined);

function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

function useAppState() {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('Provider not found');
  return ctx;
}
```

→ undefined チェックで安全に。

---

## ❌ よくある間違い

### useState で型推論ミス

```ts
const [user, setUser] = useState(null);
// type: null だけ → setUser({ name: '...' }) でエラー
```

→ ✅ `useState<User | null>(null)`。

### Action の型を緩くする

```ts
type Action = { type: string; payload?: any };
```

→ ✅ Discriminated union で各 type ごとに payload を定義。

### state を直接書き換える

```ts
state.count = 5; // ❌
```

→ ✅ `dispatch` で更新、reducer内で新しいオブジェクト。

---

## ✅ ベストプラクティス

1. **null / 配列 / Union は明示**
2. **reducer は Discriminated Union**
3. **state を関数で初期化**して重い処理を1回だけ
4. **Context は undefined チェック**でカスタムフックに
5. **as 型アサーション**は最後の手段

---

## 🔬 実践演習

ショッピングカート用 reducer を型付け：

- state: { items: { id; name; price; quantity }[] }
- action: add / remove / increment / decrement / clear
- 各 action に必要な payload を定義

---

## 📝 まとめ

- useState は推論が基本、null/Union は明示
- useReducer は Discriminated Union で安全に
- Contextとの組み合わせは undefined チェック
- 関数更新も型推論される

---

## 🔗 関連ページ

- [[8-2-useReducer]]
- [[11-1-propsの型付け]]
- [[11-5-APIレスポンス型]]
