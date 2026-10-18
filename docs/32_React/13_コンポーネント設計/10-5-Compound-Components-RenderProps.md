# 10-5. Compound Components / Render Props（概要）

## 🎯 この章で学ぶこと

- Compound Components パターンとは
- Render Props パターンとは
- いつ使うと便利か

---

## 📖 概念の説明

### この2つは「**柔軟な API**」を作るためのパターン

「propsを増やすほど複雑になる」のを防ぎ、**HTMLライクな書き方**で柔軟に組み立てる。

---

## 💻 Compound Components（複合コンポーネント）

### 例：Tab UI

#### Bad：propsで全部指定

```jsx
<Tabs
  items={[
    { id: 'home', label: 'ホーム', content: <Home /> },
    { id: 'profile', label: 'プロフィール', content: <Profile /> },
  ]}
/>
```

`items` の中身が固定的、カスタマイズしづらい。

#### Good：Compound Components

```jsx
<Tabs defaultActive="home">
  <Tabs.List>
    <Tabs.Tab id="home">ホーム</Tabs.Tab>
    <Tabs.Tab id="profile">プロフィール</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel id="home"><Home /></Tabs.Panel>
  <Tabs.Panel id="profile"><Profile /></Tabs.Panel>
</Tabs>
```

→ HTMLライクで読みやすい、自由に並べられる、属性追加も簡単。

#### 実装

```jsx
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext();

function Tabs({ defaultActive, children }) {
  const [active, setActive] = useState(defaultActive);
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function List({ children }) {
  return <div role="tablist">{children}</div>;
};

Tabs.Tab = function Tab({ id, children }) {
  const { active, setActive } = useContext(TabsContext);
  return (
    <button
      role="tab"
      aria-selected={active === id}
      onClick={() => setActive(id)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function Panel({ id, children }) {
  const { active } = useContext(TabsContext);
  if (active !== id) return null;
  return <div role="tabpanel">{children}</div>;
};

export default Tabs;
```

`Tabs` の Context で全Childが状態を共有。

### よく見る他の例

- `<Menu>` `<Menu.Item>` `<Menu.Divider>`
- `<Select>` `<Option>`
- `<Form>` `<Field>` `<Submit>`

---

## 💻 Render Props

### 概要

「**子が関数**」になっていて、親から「中で使える値」を渡されるパターン。

```jsx
<MouseTracker>
  {({ x, y }) => <p>マウス位置: {x}, {y}</p>}
</MouseTracker>
```

### 実装

```jsx
function MouseTracker({ children }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handle(e) { setPos({ x: e.clientX, y: e.clientY }); }
    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, []);

  return children(pos); // ← 子は関数
}
```

→ 「ロジックを再利用したい」がhooksの登場で**ほぼ不要**。今はカスタムフックでやることが多い。

### 現代では：カスタムフック

```jsx
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => { ... }, []);
  return pos;
}

function App() {
  const { x, y } = useMousePosition();
  return <p>{x}, {y}</p>;
}
```

→ これで十分。Render Props はライブラリ作者が知ってる程度でOK。

---

## 💻 Compound Components の利点

| 利点 | 説明 |
| --- | --- |
| 柔軟 | 並び・追加要素が自由 |
| 直感的 | HTMLっぽい見た目 |
| 拡張しやすい | 子に何でも追加できる |
| props爆発を防ぐ | propsだらけにならない |

---

## 💻 ライブラリ例

これらは Compound Components が定番：

- **Radix UI**：`<Dialog.Root>` `<Dialog.Trigger>` `<Dialog.Content>`...
- **Headless UI**：同じ思想
- **MUI**：一部の複雑コンポーネント

---

## ❌ よくある間違い

### Compound にしすぎる

```jsx
<Form>
  <Form.Section>
    <Form.Header>
      <Form.Title>...</Form.Title>
    </Form.Header>
    <Form.Body>...</Form.Body>
  </Form.Section>
</Form>
```

→ ネストが深すぎ。**意味のある粒度**まで。

### Render Props を多用

→ コードが複雑に。Hooksに置き換えられる。

### Context の値を意識しない

```jsx
<Tabs.Tab id="home" />
{/* ここでアクティブ判定したいのに Context 外 */}
```

→ ✅ Provider 内で使う。

---

## ✅ ベストプラクティス

1. **柔軟性が必要なときだけ** Compound にする
2. **Render Props はカスタムフックで代替**できないか考える
3. **Radix UI などライブラリの API**を真似る
4. **子に flex な並びを許す**ときに有用
5. ARIA 対応もセットで

---

## 🔬 実践演習

`Accordion` を Compound Components で作る：

```jsx
<Accordion>
  <Accordion.Item id="1">
    <Accordion.Header>項目1</Accordion.Header>
    <Accordion.Body>本文1</Accordion.Body>
  </Accordion.Item>
  <Accordion.Item id="2">
    <Accordion.Header>項目2</Accordion.Header>
    <Accordion.Body>本文2</Accordion.Body>
  </Accordion.Item>
</Accordion>
```

---

## 📝 まとめ

- Compound = HTMLライクな柔軟API、Contextで連携
- Render Props は古典、今はカスタムフックで代替
- 柔軟性が必要なときだけ Compound
- Radix UI などライブラリで採用例

---

## 🔗 関連ページ

- [[10-1-UIコンポーネントとロジックの分離]]
- [[10-3-カスタムフック]]
- [[10-4-Props設計]]
- [[12-4-アクセシビリティ]]
