# 9-2. React.memo / useMemo / useCallback（何を防ぐか）

## 🎯 この章で学ぶこと

- 3つのメモ化の役割の違い
- 「何が同じなら再計算しないか」のルール
- いつ使うか / 使わない方がいい場面

---

## 📖 概念の説明

### 3兄弟の役割

| 名前 | 何をメモ化 | 防ぐもの |
| --- | --- | --- |
| **React.memo** | コンポーネント | propsが同じなら再レンダーしない |
| **useMemo** | 値（計算結果） | 依存が同じなら再計算しない |
| **useCallback** | 関数 | 依存が同じなら同じ関数参照 |

すべて「**前回と同じなら使い回す**」という考え方。

---

## 💻 React.memo

### 基本

```jsx
const Child = React.memo(function Child({ name }) {
  console.log('Child render');
  return <p>{name}</p>;
});

function Parent() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <Child name="太郎" />
    </>
  );
}
```

countが変わってParentが再レンダーされても、`name` が変わらないので `Child` は再レンダーされない。

### 浅い比較

`React.memo` は props を **`===` で浅く比較**。

- プリミティブ → 値が同じならOK
- オブジェクト → 参照が同じならOK（毎回新規だとアウト）

### カスタム比較

```jsx
React.memo(Component, (prev, next) => {
  return prev.id === next.id; // ID だけ見る
});
```

---

## 💻 useMemo

### 基本

```jsx
const filteredItems = useMemo(() => {
  return items.filter((item) => item.name.includes(keyword));
}, [items, keyword]);
```

`items` か `keyword` が変わらない限り、再計算しない。

### 使うべき場面

- **重い計算**（数千件のフィルタ・ソート）
- **オブジェクトを React.memo の child に渡す**ときに参照を安定化
- **依存配列に渡すオブジェクト**を安定化

### ❌ 不要な場面

```jsx
// 単純な計算は useMemo 不要
const total = useMemo(() => price * quantity, [price, quantity]); // 過剰
```

→ 計算が軽いなら直接書く。

---

## 💻 useCallback

### 基本

```jsx
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);
```

`count` が変わらない限り、毎回**同じ関数参照**を返す。

### 使うべき場面

- **React.memo の child に関数を渡す**とき
- **useEffect の依存に関数を入れる**とき

### ❌ 不要な場面

```jsx
// memo化された子に渡さない普通のonClick
<button onClick={useCallback(() => alert('hi'), [])}>
```

→ メモ化のコストの方が高い。普通に書く。

---

## 💻 組み合わせ例：リストのアイテム最適化

```jsx
const Item = React.memo(function Item({ item, onDelete }) {
  console.log(`render ${item.id}`);
  return (
    <li>
      {item.name}
      <button onClick={() => onDelete(item.id)}>削除</button>
    </li>
  );
});

function List() {
  const [items, setItems] = useState([...]);

  // ✅ useCallback で関数参照を安定化
  const handleDelete = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return (
    <ul>
      {items.map((item) => (
        <Item key={item.id} item={item} onDelete={handleDelete} />
      ))}
    </ul>
  );
}
```

`handleDelete` が安定 + `item` も同じなら、変更されないItemは再レンダーされない。

---

## 💡 メモ化の落とし穴

### 落とし穴1：依存配列を間違える

```jsx
const handler = useCallback(() => {
  doSomething(data);
}, []); // ❌ data が依存にない → 古いdataを使い続ける
```

→ ✅ 使ってる値はすべて依存に。

### 落とし穴2：オブジェクトをそのまま渡す

```jsx
const config = { mode: 'json' }; // 毎レンダー新規

<MemoChild config={config} /> // ❌ 毎回違う参照 → memo効果なし
```

→ ✅ `useMemo` で安定化 or プリミティブだけ渡す。

### 落とし穴3：何でもメモ化

```jsx
// 全部メモ化したら速くなる…？
const a = useMemo(() => 1 + 1, []); // 過剰
const b = useCallback(() => alert('hi'), []); // 過剰
```

→ メモ化自体にコスト。**重い処理 or memo化された子に渡す**ものだけ。

---

## 💡 React 19の自動メモ化（参考）

React 19で **React Compiler** が自動でメモ化してくれる予定。手動で memo/useMemo/useCallback が不要になる方向。

ただし現時点（2025年）では手動が現実的。

---

## ❌ よくある間違い

### memoでも子は再レンダーされる

```jsx
const Memoized = React.memo(Child);
// Child の子に Provider などがあると、それは別物として再レンダーされる
```

→ memoは「**自分の関数は実行しない**」だけ。子の更新条件は別。

### useMemo の中で副作用

```jsx
const value = useMemo(() => {
  fetch(...); // ❌ 副作用は useEffect で
  return ...;
}, []);
```

### React.memo を class component に

→ class には React.memo は使えない（関数コンポーネント専用）。

---

## ✅ ベストプラクティス

1. **計測してから最適化**
2. memoの組み合わせは**3つ全部使う**ことが多い
3. **依存配列を正確に**（eslint-plugin-react-hooks）
4. **小さい計算には不要**
5. React 19の自動メモ化に備える

---

## 🔬 実践演習

リストコンポーネントを最適化：

- 1000件のアイテム
- 各アイテムに削除ボタン
- 1件削除しても他は再レンダーされないように

Profilerで再レンダー回数を確認しながら進める。

---

## 📝 まとめ

- React.memo = コンポーネント、useMemo = 値、useCallback = 関数
- 「前回と同じなら使い回す」考え方
- 計測してから使う
- 依存配列を正確に

---

## 🔗 関連ページ

- [[9-1-体感が重い原因を切り分ける]]
- [[9-3-レンダリングの粒度]]
- [[9-5-計測]]
- [[5-2-依存配列の読み方]]

---

## 🔎 深掘り：useMemoで「無限ループ」を止める（参照の安定化）

### ありがちな事故：オブジェクトを毎回作って依存配列に入れる

```jsx
// ❌ 毎レンダー新しいオブジェクトになる
const mergedFilters = { ...initialFilters, ...urlFilters };

useEffect(() => {
  // フィルター処理
}, [mergedFilters]); // mergedFilters が毎回変わった扱いになり、effectが回り続ける
```

**原因**：`{ ...a, ...b }` は毎回新しいオブジェクト参照を作る → `mergedFilters !== previousMergedFilters`。

### 解決：useMemoで「同じなら同じ参照」を返す

```jsx
// ✅ mergedFilters の参照を安定させる
const mergedFilters = useMemo(() => {
  return { ...initialFilters, ...urlFilters };
}, [
  initialFilters,
  urlFilters.name,
  urlFilters.category,
  urlFilters.status,
]);

useEffect(() => {
  // フィルター処理
}, [mergedFilters]);
```

### 依存配列のコツ

- **オブジェクト丸ごとを依存に入れると再計算が増えがち**（他プロパティ変更でも走る）
- **実際に使うプロパティだけ**を依存に入れると、無駄な再計算を減らせる

---

## 🔎 深掘り：useCallbackのパターン集（依存配列ミスを減らす）

### React.memoの子に渡す関数を安定化

```jsx
const Child = React.memo(function Child({ onClick }) {
  return <button onClick={onClick}>子</button>;
});

function Parent() {
  const [count, setCount] = useState(0);

  // ✅ 関数型更新にして依存を減らす（[]でOKにしやすい）
  const handleIncrement = useCallback(() => {
    setCount((prev) => prev + 1);
  }, []);

  return (
    <>
      <p>{count}</p>
      <Child onClick={handleIncrement} />
    </>
  );
}
```

### useEffectの依存に「関数」が必要なとき

```jsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  const fetchUser = useCallback(async () => {
    const res = await fetch(`/api/users/${userId}`);
    setUser(await res.json());
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return <div>{user?.name}</div>;
}
```

### フォーム送信：依存が増えるなら「どこまで安定化したいか」を決める

```jsx
function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // formData を使うなら依存に入る（毎入力で関数は更新される）
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
  }, [formData]);

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} />
      <input name="email" value={formData.email} onChange={handleChange} />
      <textarea name="message" value={formData.message} onChange={handleChange} />
      <button type="submit">送信</button>
    </form>
  );
}
```

### よくある依存配列ミス

```jsx
const handler = useCallback(() => {
  doSomething(data);
}, []); // ❌ data が依存にない → 古い data を使い続ける
```

**原則**：関数内で参照する値は依存に入れる。入れたくないなら **関数型更新**・**引数化**・**責務分離**で依存を減らす。
