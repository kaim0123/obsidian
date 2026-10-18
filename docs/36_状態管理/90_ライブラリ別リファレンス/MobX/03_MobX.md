# MobX（モブエックス）

## MobXとは

**MobX**は、リアクティブな状態管理ライブラリです。状態の変更を自動的に追跡し、関連するコンポーネントを自動的に更新します。

### 基本情報

- **開発元**: Michel Weststrate
- **リリース年**: 2015年
- **ライセンス**: MIT
- **言語**: JavaScript、TypeScript
- **公式サイト**: https://mobx.js.org/
- **GitHub**: https://github.com/mobxjs/mobx

## MobXの特徴

### ✅ メリット

1. **リアクティブ**
   - 状態の変更を自動的に追跡
   - 関連するコンポーネントが自動的に更新される

2. **シンプル**
   - 学習コストが低い
   - ボイラープレートコードが少ない

3. **直感的**
   - 通常のJavaScriptオブジェクトのように扱える
   - デコレータ（オプション）で簡単に使える

4. **パフォーマンス**
   - 必要な部分だけを更新
   - 自動的な最適化

5. **TypeScript対応**
   - 型定義が標準装備
   - 型安全性が高い

### ⚠️ デメリット

1. **魔法のような動作**
   - 内部の動作が分かりにくい場合がある
   - デバッグが難しい場合がある

2. **エコシステム**
   - Reduxほど豊富ではない

3. **学習リソース**
   - Reduxほど多くない

## MobXのインストール

```bash
npm install mobx mobx-react-lite
# またはReact（クラスコンポーネント用）
npm install mobx mobx-react
```

## MobXの基本例

### シンプルなストア

```javascript
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

// ストアの作成
class CounterStore {
  count = 0;

  constructor() {
    makeAutoObservable(this);
  }

  increment() {
    this.count++;
  }

  decrement() {
    this.count--;
  }

  reset() {
    this.count = 0;
  }
}

const counterStore = new CounterStore();

// Reactコンポーネントでの使用
const Counter = observer(() => {
  return (
    <div>
      <p>カウント: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>+</button>
      <button onClick={() => counterStore.decrement()}>-</button>
      <button onClick={() => counterStore.reset()}>リセット</button>
    </div>
  );
});
```

### TODOリストの例

```javascript
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

class TodoStore {
  todos = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(text) {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  toggleTodo(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter((t) => t.id !== id);
  }

  get completedTodos() {
    return this.todos.filter((t) => t.completed);
  }

  get activeTodos() {
    return this.todos.filter((t) => !t.completed);
  }
}

const todoStore = new TodoStore();

// 使用
const TodoList = observer(() => {
  const [input, setInput] = useState('');

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && input.trim()) {
            todoStore.addTodo(input);
            setInput('');
          }
        }}
      />
      <ul>
        {todoStore.todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => todoStore.toggleTodo(todo.id)}
            />
            <span>{todo.text}</span>
            <button onClick={() => todoStore.deleteTodo(todo.id)}>削除</button>
          </li>
        ))}
      </ul>
      <p>完了: {todoStore.completedTodos.length}</p>
      <p>未完了: {todoStore.activeTodos.length}</p>
    </div>
  );
});
```

### 計算プロパティ（Computed）

```javascript
import { makeAutoObservable } from 'mobx';

class ShoppingCartStore {
  items = [];

  constructor() {
    makeAutoObservable(this);
  }

  addItem(item) {
    this.items.push(item);
  }

  // 計算プロパティ（自動的に再計算される）
  get total() {
    return this.items.reduce((sum, item) => sum + item.price, 0);
  }

  get itemCount() {
    return this.items.length;
  }
}
```

### 非同期アクション

```javascript
import { makeAutoObservable, runInAction } from 'mobx';

class UserStore {
  users = [];
  loading = false;
  error = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUsers() {
    this.loading = true;
    this.error = null;
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      runInAction(() => {
        this.users = users;
        this.loading = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
    }
  }
}
```

### 複数のストア

```javascript
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useContext, createContext } from 'react';

// ストアの作成
class CounterStore {
  count = 0;
  constructor() {
    makeAutoObservable(this);
  }
  increment() {
    this.count++;
  }
}

class TodoStore {
  todos = [];
  constructor() {
    makeAutoObservable(this);
  }
  addTodo(text) {
    this.todos.push({ id: Date.now(), text });
  }
}

// Contextでの使用
const CounterStoreContext = createContext();
const TodoStoreContext = createContext();

function App() {
  return (
    <CounterStoreContext.Provider value={new CounterStore()}>
      <TodoStoreContext.Provider value={new TodoStore()}>
        <Counter />
        <TodoList />
      </TodoStoreContext.Provider>
    </CounterStoreContext.Provider>
  );
}

const Counter = observer(() => {
  const counterStore = useContext(CounterStoreContext);
  return (
    <div>
      <p>カウント: {counterStore.count}</p>
      <button onClick={() => counterStore.increment()}>+</button>
    </div>
  );
});
```

### TypeScriptでの使用

```typescript
import { makeAutoObservable } from 'mobx';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

class TodoStore {
  todos: Todo[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  addTodo(text: string): void {
    this.todos.push({
      id: Date.now(),
      text,
      completed: false,
    });
  }

  get completedTodos(): Todo[] {
    return this.todos.filter((t) => t.completed);
  }
}
```

## Reduxとの比較

### MobX

```javascript
class Store {
  count = 0;
  constructor() {
    makeAutoObservable(this);
  }
  increment() {
    this.count++; // 自動的に更新される
  }
}
```

### Redux

```javascript
function reducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    default:
      return state;
  }
}
```

## まとめ

- MobXはリアクティブな状態管理ライブラリ
- 状態の変更を自動的に追跡し、関連するコンポーネントを自動的に更新
- シンプルで直感的なAPI
- ボイラープレートコードが少ない
- 計算プロパティにより、派生状態を簡単に管理できる

**初心者の方へ**: MobXはReduxよりもシンプルで、リアクティブな状態管理が可能です。通常のJavaScriptオブジェクトのように扱えるため、学習コストが低いです。ただし、内部の動作を理解することが重要です。

