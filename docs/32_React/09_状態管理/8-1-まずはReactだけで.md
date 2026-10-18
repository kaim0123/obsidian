# 8-1. まずはReactだけで（stateの持ち上げ）

## 🎯 この章で学ぶこと

- ライブラリを使わず Reactだけで状態管理する基本
- 「state lifting（状態の持ち上げ）」とは何か
- 兄弟コンポーネント間で値を共有する方法

---

## 📖 概念の説明

### state lifting（持ち上げ）

「**共通の親に state を置く**」という考え方。

例：兄弟コンポーネント A と B が同じデータを共有したい

```text
       Parent  ← ここに state を置く
       /    \
      A      B
```

A と B は親から props で受け取る。値を変えたいときは親から関数を渡す。

---

## 💻 例：温度計（兄弟で同じ値を共有）

### Before：それぞれが state を持つ → 同期できない

```jsx
function Celsius() {
  const [c, setC] = useState(0);
  return <input value={c} onChange={(e) => setC(e.target.value)} />;
}

function Fahrenheit() {
  const [f, setF] = useState(32);
  return <input value={f} onChange={(e) => setF(e.target.value)} />;
}
```

Celsius を変えても Fahrenheit に反映されない。

### After：親に持ち上げる

```jsx
function Thermometer() {
  const [c, setC] = useState(0);
  const f = c * 9 / 5 + 32;

  return (
    <div>
      <input value={c} onChange={(e) => setC(Number(e.target.value))} />
      <span>℃</span>
      <input value={f} onChange={(e) => setC((Number(e.target.value) - 32) * 5 / 9)} />
      <span>℉</span>
    </div>
  );
}
```

state を親に持ち上げ、両方が同じ値を見る。

---

## 💻 もうひとつの例：選択中アイテム

```jsx
function App() {
  const [items] = useState([
    { id: 1, name: 'りんご' },
    { id: 2, name: 'みかん' },
  ]);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <div>
      <ItemList items={items} onSelect={setSelectedId} />
      <ItemDetail item={items.find((i) => i.id === selectedId)} />
    </div>
  );
}

function ItemList({ items, onSelect }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i.id}>
          <button onClick={() => onSelect(i.id)}>{i.name}</button>
        </li>
      ))}
    </ul>
  );
}

function ItemDetail({ item }) {
  if (!item) return <p>選択してください</p>;
  return <h2>{item.name}</h2>;
}
```

`selectedId` を親が持ち、子は表示と通知だけ担当。

---

## 💡 持ち上げる位置の考え方

### ルール：「**両方が必要とする最も近い共通の親**」

```text
       App
       / \
      A   B
     /
    A1
   /
  A2 ← Aサブツリーだけが使う
```

- A2だけが使う → A2が持つ
- A1とA2が使う → A1が持つ
- AとBが使う → App が持つ

「共有が必要な範囲の一番下」に置くのが鉄則。

---

## 🤔 持ち上げすぎる弊害

```jsx
// 全部 App に持つと…
function App() {
  const [counter1, setCounter1] = useState(0);
  const [counter2, setCounter2] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  // 100個以上！
}
```

→ App が肥大化。**使う場所の近くに置く**。

---

## ❌ よくある間違い

### 子に state を持って親に伝えない

```jsx
function Form() {
  const [name, setName] = useState('');
  return <input value={name} onChange={(e) => setName(e.target.value)} />;
}

// App で送信したいのに name にアクセスできない
function App() {
  return (
    <>
      <Form />
      <button onClick={() => /* nameは？ */}>送信</button>
    </>
  );
}
```

→ `name` を App に持ち上げる：

```jsx
function App() {
  const [name, setName] = useState('');
  return (
    <>
      <Form name={name} onChange={setName} />
      <button onClick={() => save(name)}>送信</button>
    </>
  );
}

function Form({ name, onChange }) {
  return <input value={name} onChange={(e) => onChange(e.target.value)} />;
}
```

### 共通の親を経由しない

```jsx
function Parent() {
  return (
    <>
      <Brother />
      <Sister />
    </>
  );
}
// Brother から Sister へ直接値を渡す方法はない
```

→ Parent に state を持つ。

---

## ✅ ベストプラクティス

1. **使う場所の最も近い共通親**に state を置く
2. **小さく始める**。複雑になってから Context や Zustand
3. **state を分割して持つ**（巨大 state は避ける）
4. **派生値は計算で**（state にしない）
5. **コンポーネント分割**で props drilling を最小に

---

## 🔬 実践演習

`Calculator` を作る。`<NumberInput>` 2つと `<Result>` 1つ。

- Aの値とBの値を入力すると、Resultに合計が表示
- Aの値を変えるとResultも自動更新

`A` と `B` の state を共通の親に持ち上げて作る。

---

## 📝 まとめ

- まずReactだけで作れるか考える
- 共通の親に state を持つ（state lifting）
- 兄弟同士は親経由で通信
- 大きくなったら Context・状態管理ライブラリ

---

## 🔗 関連ページ

- [[4-5-props-drillingの正体]]
- [[8-2-useReducer]]
- [[8-3-Context]]
- [[8-5-状態管理ライブラリ概観]]
