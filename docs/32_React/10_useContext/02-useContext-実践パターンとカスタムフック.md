# useContext — 実践パターンとカスタムフック

## 🎯 このページで学ぶこと

- Provider コンポーネントに状態と操作を閉じ込めるパターン
- `useTheme` のような **「Context を隠す」カスタムフック**
- 複数 Context を扱うときのファイル構成の考え方

---

## 💻 パターン1: Provider で状態と更新をまとめる

Context の `value` に **状態** と **更新関数** をまとめて渡すのが一般的だ。

```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const toggle = () =>
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const value = { theme, setTheme, toggle };
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx == null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
```

- **`createContext(null)`** にして、Provider 外では `useTheme` が明示的にエラーを出すようにすると、配線ミスに気づきやすい。
- 利用側は **`useTheme()` だけ** import すればよい（Context 名を広げなくてよい）。

---

## 💻 パターン2: 認証など「読み取り専用 + 操作」

```jsx
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (name) => setUser({ name });
  const logout = () => setUser(null);

  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx == null) throw new Error('useAuth は AuthProvider 内で使ってください');
  return ctx;
}
```

---

## 📖 複数 Context を扱うとき

関心ごとに **Context を分ける**（ユーザー・テーマ・モーダルなど）。1つの巨大な `AppContext` に全部入れると、`value` の一部が変わるたびに購読者が広く再レンダーされやすい（詳細は `03-useContext-再レンダーと最適化.md`）。

ネストは JSX が深くなりがちなので、**まとめて包むラッパー**を用意することもある。

```jsx
function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
```

---

## 📖 TypeScript（要点だけ）

Context の型を付けるときは、`createContext` の引数と `Provider` の `value` を一致させる。

```tsx
type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('ThemeProvider が必要です');
  return ctx;
}
```

---

## 📝 まとめ

- Provider 内で `useState` / `useReducer` とセットにすると扱いやすい
- **`useXxx` で Context を隠す**と import が簡潔になり、Provider 外も検知しやすい
- 巨大な1 Context より **関心ごとの分割**が保守と再レンダー両面で有利になりやすい

---

## 🔗 関連ページ

- [[01-useContext-フックの基本とAPI]]
- [[03-useContext-再レンダーと最適化]]
- [[8-3-Context]]
