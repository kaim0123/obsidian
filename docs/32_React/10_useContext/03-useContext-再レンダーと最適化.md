# useContext — 再レンダーと最適化

## 🎯 このページで学ぶこと

- `useContext` で値を読んだコンポーネントが **いつ再レンダーされるか**
- `value` の参照が毎レンダーで変わる問題と `useMemo`
- Context の分割と **State / Dispatch の分離**（`useReducer` と相性）

---

## 📖 再レンダーのルール（重要）

その Context について **Provider の `value` が前回との比較で変わったと React が判断したとき**、その Provider 以下で **その Context を `useContext` しているコンポーネントは再レンダー**される。

- 使っていないフィールドだけが変わっても、`value` がまとめて1オブジェクトなら **オブジェクトごと新規なら全体が更新扱い**になりやすい。
- **頻繁に変わる値**と **ほぼ変わらない値**を同じ Context に詰めると、無関係な子まで巻き込みやすい。

---

## ⚠️ 落とし穴: `value={{ ... }}` を毎回新規にする

```jsx
// ❌ Provider が再レンダーされるたびに新しいオブジェクト → Consumer が余計に動きやすい
<Context.Provider value={{ user, count }}>

// ✅ 依存が変わったときだけ同じ参照を保ちたい場合は useMemo
const value = useMemo(() => ({ user, count }), [user, count]);
return <Context.Provider value={value}>{children}</Context.Provider>;
```

`useCallback` で関数を安定させ、`useMemo` でオブジェクトを安定させる、というのが典型的だ。

---

## 💡 対策1: Context を分割する

```jsx
const UserContext = createContext();
const CountContext = createContext();
```

`count` だけが変わるコンポーネントは `CountContext` だけ購読すればよく、`UserContext` 側の更新に引きずられない。

---

## 💡 対策2: State と Dispatch を分ける

`useReducer` と組み合わせると、`dispatch` は **参照が安定**しやすい（同じ `dispatch` が続く）。**状態の表示**と**イベントでの更新**で別 Context にすると、`dispatch` だけ使う子は **state 更新で再レンダーされない**。

```jsx
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}

function IncButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'inc' })}>+</button>;
}
```

---

## 📖 それでも厳しいとき

- 一覧の各行など **きめ細かい購読**が欲しい場合は、Context だけに頼らず **外部ストア**（Zustand など）や **props のバケツリレース回避用の別設計**を検討する、というのが現実的だ（概観は `8-5-状態管理ライブラリ概観`）。

---

## 📝 まとめ

- `useContext` は **Context の value が変わると** 再レンダーの対象になりうる
- **毎回新しいオブジェクトを value に渡さない**
- **分割**と **State / Dispatch 分離**で購読範囲を狭める
- 高頻度更新は Context 以外も選択肢に入れる

---

## 🔗 関連ページ

- [[8-3-Context]]
- [[01-useContext-フックの基本とAPI]]
- [[02-useContext-実践パターンとカスタムフック]]
- [[8-2-useReducer]]
- [[8-5-状態管理ライブラリ概観]]
