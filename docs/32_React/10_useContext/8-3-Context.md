# 8-3. Context（グローバルに配る/落とし穴）

## 🎯 この章で学ぶこと

- Context API の役割と使い方
- どんな場面に向いているか（テーマ、ログイン情報など）
- 落とし穴：Context で全コンポーネントが再レンダーする問題

---

## 📖 概念の説明

### Context とは

「**コンポーネントツリー全体に値を配信できる仕組み**」。深い階層に props を引き回さなくて済む。

### 3ステップで使う

```jsx
// 1. Context を作る
const ThemeContext = createContext('light');

// 2. Provider で値を流す
<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>

// 3. 任意の場所で取り出す
const theme = useContext(ThemeContext);
```

---

## 💻 例：テーマ切り替え

```jsx
import { createContext, useContext, useState } from 'react';

// 1. Context 作成
const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

// 2. Provider コンポーネント
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 3. 利用
function Header() {
  const { theme, toggle } = useContext(ThemeContext);
  return (
    <header style={{ background: theme === 'dark' ? '#222' : '#fff' }}>
      <button onClick={toggle}>{theme} を切り替え</button>
    </header>
  );
}

// アプリ全体を Provider で包む
function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}
```

→ Header, Main, さらに深い子コンポーネントでも `useContext(ThemeContext)` で取得できる。

---

## 💡 Context が向く / 向かない

### ✅ 向くケース

- **テーマ・ロケール**（アプリ全体で1つ、変化が少ない）
- **ログイン中のユーザー情報**（ほとんど変わらない）
- **モーダル・トーストなど UI のグローバル状態**
- **依存性注入**（loggerサービス、API client）

### ❌ 向かないケース

- **頻繁に変わる大量データ**（input値、リアルタイム更新）
- **きめ細かい制御**が必要な状態

理由は次の「落とし穴」を参照。

---

## ⚠️ 落とし穴：再レンダーが多すぎる

### 問題

Context の値が変わると、**Consumer全員が再レンダー**する。

```jsx
const AppContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState();
  const [count, setCount] = useState(0);
  return (
    <AppContext.Provider value={{ user, count, setUser, setCount }}>
      {children}
    </AppContext.Provider>
  );
}
```

`count` が変わると、`user` しか使ってないコンポーネントも再レンダーされる。

### 対策1：Context を分割

```jsx
const UserContext = createContext();
const CountContext = createContext();
```

→ 関心ごとに分ける。

### 対策2：value をメモ化

```jsx
const value = useMemo(() => ({ user, setUser }), [user]);
return <UserContext.Provider value={value}>...</UserContext.Provider>;
```

`value` のオブジェクトが毎回新しいと、Consumer 全員が再レンダー。

### 対策3：Selectorパターン（Zustandへ移行）

頻繁に変わる値は Zustand などへ。

---

## 💻 値とdispatchを分ける（再レンダー削減）

```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>
        {children}
      </StateContext.Provider>
    </DispatchContext.Provider>
  );
}

// dispatch だけ使う子は state変化で再レンダーされない
function Button() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'inc' })}>+</button>;
}
```

`dispatch` は安定した参照。`state` の変化に巻き込まれない。

---

## ❌ よくある間違い

### Provider で囲み忘れ

```jsx
function Header() {
  const theme = useContext(ThemeContext); // undefined
}

// App で Provider を使ってない
```

→ ✅ 必ず外側を Provider で包む。

### default 値だけで使う

```jsx
const Ctx = createContext('hello');
// Provider なしで useContext すると 'hello' が返る
```

→ default は「未提供のとき」用。Provider で実際の値を流す。

### value にオブジェクトを毎回新規作成

```jsx
<Context.Provider value={{ user, setUser }}> // 毎回新参照
```

→ useMemo で安定化。

### 何でも Context に入れる

→ アプリが「何が変わるかわからない」状態に。**関心ごとに分割**。

---

## ✅ ベストプラクティス

1. **テーマ・認証**などまばらな状態に Context
2. **頻繁に変わる**ものは状態管理ライブラリ（Zustand）
3. **value はメモ化**
4. **state と dispatch を分ける**でも再レンダー削減
5. **Context を関心ごとに分割**

---

## 🔬 実践演習

`AuthContext` を作る：

- ログイン中のユーザー（オブジェクトまたは null）
- login(name) 関数
- logout() 関数

`Header` で「ログイン状態を表示」、`LoginButton` でログイン操作。

---

## 📝 まとめ

- Context = ツリー全体への配信
- テーマ・認証など「まばら」な状態に向く
- 全Consumer再レンダーに注意 → 分割・メモ化
- 頻繁な更新は Zustand など別ライブラリ

---

## 🔗 関連ページ

- [[010Programming/06_Frameworks/02_React/10_useContext/目次]]（`10_useContext` フォルダ内の読む順）
- [[01-useContext-フックの基本とAPI]]
- [[02-useContext-実践パターンとカスタムフック]]
- [[03-useContext-再レンダーと最適化]]
- [[4-5-props-drillingの正体]]
- [[8-2-useReducer]]
- [[8-5-状態管理ライブラリ概観]]
- [[9-2-React-memo-useMemo-useCallback]]
