# Redux（リダックス）

## Reduxとは

**Redux**は、アプリケーションの状態を管理するための**JavaScriptライブラリ**です。予測可能な状態管理を提供し、アプリケーションの状態を一元管理します。

### 基本情報

- **開発元**: Dan Abramov、Andrew Clark
- **リリース年**: 2015年
- **ライセンス**: MIT
- **言語**: JavaScript、TypeScript
- **公式サイト**: https://redux.js.org/
- **GitHub**: https://github.com/reduxjs/redux

## Reduxの特徴

### ✅ メリット

1. **予測可能な状態管理**
   - 単一のストアで状態を一元管理
   - 状態の変更が追跡しやすい

2. **デバッグツール**
   - Redux DevToolsで状態の変更を可視化
   - タイムトラベルデバッグが可能

3. **テストしやすい**
   - 純粋関数で構成
   - テストが書きやすい

4. **大規模アプリケーションに適している**
   - 複雑な状態管理に対応
   - チーム開発に適している

5. **豊富なエコシステム**
   - 多くのミドルウェア
   - 学習リソースが豊富

### ⚠️ デメリット

1. **学習コストが高い**
   - 多くの概念を覚える必要がある
   - ボイラープレートコードが多い

2. **小規模アプリには過剰**
   - シンプルなアプリには複雑すぎる場合がある

3. **設定が複雑**
   - 初期設定に時間がかかる

## Reduxの基本概念

### 1. Store（ストア）

アプリケーション全体の状態を保持する単一のオブジェクトです。

```javascript
import { createStore } from 'redux';

const store = createStore(reducer);
```

### 2. Action（アクション）

状態を変更するための情報を表すオブジェクトです。

```javascript
// アクションタイプ
const ADD_TODO = 'ADD_TODO';

// アクションクリエイター
function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: text
  };
}
```

### 3. Reducer（リデューサー）

現在の状態とアクションを受け取り、新しい状態を返す純粋関数です。

```javascript
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, { id: Date.now(), text: action.payload, completed: false }];
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    default:
      return state;
  }
}
```

### 4. Dispatch（ディスパッチ）

アクションをストアに送信する関数です。

```javascript
store.dispatch(addTodo('Reduxを学ぶ'));
```

### 5. Subscribe（購読）

ストアの変更を監視する関数です。

```javascript
store.subscribe(() => {
  console.log(store.getState());
});
```

## Reduxのインストール

```bash
# 基本的なRedux
npm install redux

# React用（Redux Toolkit推奨）
npm install @reduxjs/toolkit react-redux
```

## Reduxの基本例

### シンプルなカウンター

```javascript
import { createStore } from 'redux';

// アクションタイプ
const INCREMENT = 'INCREMENT';
const DECREMENT = 'DECREMENT';
const RESET = 'RESET';

// アクションクリエイター
function increment() {
  return { type: INCREMENT };
}

function decrement() {
  return { type: DECREMENT };
}

function reset() {
  return { type: RESET };
}

// リデューサー
function counterReducer(state = { count: 0 }, action) {
  switch (action.type) {
    case INCREMENT:
      return { count: state.count + 1 };
    case DECREMENT:
      return { count: state.count - 1 };
    case RESET:
      return { count: 0 };
    default:
      return state;
  }
}

// ストアの作成
const store = createStore(counterReducer);

// 使用
store.dispatch(increment());
console.log(store.getState()); // { count: 1 }

store.dispatch(decrement());
console.log(store.getState()); // { count: 0 }

store.dispatch(reset());
console.log(store.getState()); // { count: 0 }
```

### TODOリストの例

```javascript
import { createStore } from 'redux';

// アクションタイプ
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const DELETE_TODO = 'DELETE_TODO';

// アクションクリエイター
function addTodo(text) {
  return {
    type: ADD_TODO,
    payload: text
  };
}

function toggleTodo(id) {
  return {
    type: TOGGLE_TODO,
    payload: id
  };
}

function deleteTodo(id) {
  return {
    type: DELETE_TODO,
    payload: id
  };
}

// リデューサー
function todosReducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          completed: false
        }
      ];
    case TOGGLE_TODO:
      return state.map(todo =>
        todo.id === action.payload
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    case DELETE_TODO:
      return state.filter(todo => todo.id !== action.payload);
    default:
      return state;
  }
}

// ストアの作成
const store = createStore(todosReducer);

// 使用
store.dispatch(addTodo('Reduxを学ぶ'));
store.dispatch(addTodo('Reactを学ぶ'));
console.log(store.getState());

store.dispatch(toggleTodo(1));
console.log(store.getState());
```

## Redux Toolkit（推奨）

Redux Toolkitは、Reduxを使いやすくするための公式ツールです。

### Redux Toolkitを使った例

```javascript
import { createSlice, configureStore } from '@reduxjs/toolkit';

// スライスの作成
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    reset: (state) => {
      state.value = 0;
    },
  },
});

// アクションとリデューサーのエクスポート
export const { increment, decrement, reset } = counterSlice.actions;

// ストアの作成
export const store = configureStore({
  reducer: {
    counter: counterSlice.reducer,
  },
});
```

### Reactでの使用（React Redux）

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store';

function Counter() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}
```

## まとめ

- Reduxは予測可能な状態管理を提供するライブラリ
- 単一のストアで状態を一元管理
- Redux DevToolsでデバッグが容易
- Redux Toolkitを使うと、より簡単にReduxを使える
- 大規模アプリケーションに適している

**初心者の方へ**: Reduxは学習コストが高いですが、大規模なアプリケーションで状態管理が必要な場合に非常に強力です。まずはRedux Toolkitから始めることをおすすめします。小規模なアプリの場合は、ReactのuseStateやZustandなど、よりシンプルな選択肢も検討してください。

