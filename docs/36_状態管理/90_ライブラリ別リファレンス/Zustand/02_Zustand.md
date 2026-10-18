# Zustand（ズスタンド）

## Zustandとは

**Zustand**は、軽量でシンプルな状態管理ライブラリです。Reduxのように複雑な設定が不要で、直感的に使えます。

### 基本情報

- **開発元**: pmndrs
- **リリース年**: 2018年
- **ライセンス**: MIT
- **言語**: JavaScript、TypeScript
- **公式サイト**: https://github.com/pmndrs/zustand
- **GitHub**: https://github.com/pmndrs/zustand

## Zustandの特徴

### ✅ メリット

1. **シンプル**
   - ボイラープレートコードが少ない
   - 学習コストが低い
   - 直感的に使える

2. **軽量**
   - バンドルサイズが小さい（約1KB）
   - パフォーマンスが良い

3. **TypeScript対応**
   - 型定義が標準装備
   - 型安全性が高い

4. **React不要**
   - React以外のフレームワークでも使える
   - バニラJavaScriptでも使える

5. **柔軟性**
   - 必要最小限の機能
   - カスタマイズが容易

### ⚠️ デメリット

1. **エコシステム**
   - Reduxほど豊富ではない
   - 学習リソースがやや少ない

2. **デバッグツール**
   - Redux DevToolsほど強力ではない

3. **大規模開発**
   - 非常に大規模なアプリにはReduxの方が適している場合がある

## Zustandのインストール

```bash
npm install zustand
```

## Zustandの基本例

### シンプルなストア

```javascript
import { create } from 'zustand';

// ストアの作成
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// 使用
function Counter() {
  const { count, increment, decrement, reset } = useStore();

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
      <button onClick={reset}>リセット</button>
    </div>
  );
}
```

### TODOリストの例

```javascript
import { create } from 'zustand';

const useTodoStore = create((set) => ({
  todos: [],
  addTodo: (text) =>
    set((state) => ({
      todos: [
        ...state.todos,
        {
          id: Date.now(),
          text,
          completed: false,
        },
      ],
    })),
  toggleTodo: (id) =>
    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      ),
    })),
  deleteTodo: (id) =>
    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    })),
}));

// 使用
function TodoList() {
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [input, setInput] = useState('');

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            addTodo(input);
            setInput('');
          }
        }}
      />
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### セレクターを使った最適化

```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  name: '太郎',
  increment: () => set((state) => ({ count: state.count + 1 })),
  setName: (name) => set({ name }),
}));

// 必要な部分だけを購読（再レンダリングを最適化）
function Counter() {
  // countだけを購読
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={increment}>+</button>
    </div>
  );
}

function NameDisplay() {
  // nameだけを購読
  const name = useStore((state) => state.name);

  return <p>名前: {name}</p>;
}
```

### 非同期アクション

```javascript
import { create } from 'zustand';

const useUserStore = create((set) => ({
  users: [],
  loading: false,
  error: null,
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      set({ users, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));

// 使用
function UserList() {
  const { users, loading, error, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### TypeScriptでの使用

```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### ミドルウェア

```javascript
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

const useStore = create(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      {
        name: 'counter-storage', // localStorageのキー名
      }
    ),
    {
      name: 'counter-store', // Redux DevToolsの名前
    }
  )
);
```

## Reduxとの比較

### Zustand

```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Redux

```javascript
import { createStore } from 'redux';

function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}

const store = createStore(counterReducer);
```

## まとめ

- Zustandは軽量でシンプルな状態管理ライブラリ
- ボイラープレートコードが少なく、学習コストが低い
- バンドルサイズが小さく、パフォーマンスが良い
- TypeScript対応で、型安全性が高い
- 小規模から中規模のアプリケーションに適している

**初心者の方へ**: ZustandはReduxよりも簡単に始められる状態管理ライブラリです。まずはZustandで状態管理の基本を学んでから、必要に応じてReduxを検討することをおすすめします。小規模なアプリケーションでは、Zustandで十分な場合が多いです。

