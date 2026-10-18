# React組み込みAPI関数一覧

Reactには、コンポーネントやフック、ユーティリティなど、さまざまな組み込み関数（API）が用意されています。ここでは主な関数をカテゴリごとにまとめ、Obsidianでテーブル表示できるように整理します。

---

## 🪝 フック（Hooks）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `useState` | 状態管理 | `const [count, setCount] = useState(0)` | `[state, setState]` |
| `useEffect` | 副作用処理 | `useEffect(() => {...}, [deps])` | `undefined` |
| `useContext` | コンテキスト利用 | `const value = useContext(MyContext)` | `contextの値` |
| `useReducer` | 複雑な状態管理 | `const [state, dispatch] = useReducer(reducer, init)` | `[state, dispatch]` |
| `useCallback` | 関数のメモ化 | `const fn = useCallback(cb, [deps])` | `メモ化関数` |
| `useMemo` | 値のメモ化 | `const value = useMemo(() => calc(), [deps])` | `メモ化値` |
| `useRef` | 参照保持 | `const ref = useRef(null)` | `refオブジェクト` |
| `useImperativeHandle` | refのカスタマイズ | `useImperativeHandle(ref, () => obj)` | `undefined` |
| `useLayoutEffect` | レイアウト後の副作用 | `useLayoutEffect(() => {...}, [deps])` | `undefined` |
| `useDebugValue` | デバッグ用ラベル | `useDebugValue(value)` | `undefined` |
| `useId` | 一意ID生成 | `const id = useId()` | `string` |
| `useTransition` | 並列UI更新 | `const [isPending, startTransition] = useTransition()` | `[boolean, function]` |
| `useDeferredValue` | 遅延値 | `const val = useDeferredValue(value)` | `値` |
| `useSyncExternalStore` | 外部ストア購読 | `useSyncExternalStore(subscribe, getSnapshot)` | `値` |
| `useInsertionEffect` | CSS挿入用副作用 | `useInsertionEffect(() => {...}, [deps])` | `undefined` |

---

## ⚛️ コンポーネント作成・ユーティリティ

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `createElement` | 要素生成 | `React.createElement('div', null, 'Hello')` | `React要素` |
| `cloneElement` | 要素の複製 | `React.cloneElement(element, props)` | `React要素` |
| `isValidElement` | React要素判定 | `React.isValidElement(obj)` | `true/false` |
| `Children.map` | 子要素のmap | `React.Children.map(props.children, fn)` | `配列` |
| `Children.forEach` | 子要素のforEach | `React.Children.forEach(props.children, fn)` | `undefined` |
| `Children.count` | 子要素の数 | `React.Children.count(props.children)` | `数値` |
| `Children.only` | 単一子要素取得 | `React.Children.only(props.children)` | `React要素` |
| `Children.toArray` | 子要素を配列化 | `React.Children.toArray(props.children)` | `配列` |
| `Fragment` | 複数要素のグループ化 | `<></>`または`<React.Fragment></React.Fragment>` | `React要素` |
| `StrictMode` | 厳格モード | `<React.StrictMode></React.StrictMode>` | `React要素` |
| `Suspense` | 遅延読み込み | `<React.Suspense fallback={...}></React.Suspense>` | `React要素` |
| `lazy` | 動的インポート | `const Comp = React.lazy(() => import('./Comp'))` | `Reactコンポーネント` |

---

## 🏷️ PropTypes（型チェック）

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `PropTypes` | 型定義 | `MyComp.propTypes = { name: PropTypes.string }` | `undefined` |

---

## 🧩 その他のAPI

| 関数名 | 説明 | 使用例 | 戻り値 |
|--------|------|--------|--------|
| `forwardRef` | ref転送 | `const Comp = React.forwardRef((props, ref) => ...)` | `Reactコンポーネント` |
| `memo` | メモ化コンポーネント | `const MemoComp = React.memo(Comp)` | `Reactコンポーネント` |
| `startTransition` | 並列UI更新開始 | `startTransition(() => {...})` | `undefined` |
| `unstable_batchedUpdates` | 複数更新のバッチ化 | `unstable_batchedUpdates(fn)` | `undefined` |

---

## 🔗 関連リンク

- [[00-React index|Reactプログラミング入門]]
- [[01Programming/06_Frameworks/02_React/00_基礎概念/01-basics|第1章：Reactとは？]]
- [[09-hooks|第9章：Hooks]]

---

## 📝 注意点

- これらのAPIはReactのバージョンによって追加・変更される場合があります。
- 一部のAPI（`unstable_`で始まるもの）は将来的に変更・削除される可能性があります。
- React RouterやReduxなどの外部ライブラリのAPIは含まれていません。

---

## 🎯 よく使うパターン例

### useState + useEffect
```jsx
import React, { useState, useEffect } from 'react';

function Example() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    document.title = `カウント: ${count}`;
  }, [count]);
  return <button onClick={() => setCount(count + 1)}>+1</button>;
}
```

### Suspense + lazy
```jsx
import React, { Suspense, lazy } from 'react';
const OtherComponent = lazy(() => import('./OtherComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OtherComponent />
    </Suspense>
  );
}
```

---

**目次に戻る：** [[00-React index|Reactプログラミング入門]] 