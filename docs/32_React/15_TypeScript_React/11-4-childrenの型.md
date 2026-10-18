# 11-4. childrenの型・ReactNode

## 🎯 この章で学ぶこと

- ReactNode、ReactElement、JSX.Element の違い
- 適切な children の型
- 関数 children（render props）の型

---

## 📖 主な型

| 型 | 範囲 |
| --- | --- |
| **ReactNode** | レンダリング可能な全部（JSX、文字列、数字、null、配列、boolean） |
| **ReactElement** | JSXの結果（`<Hello />` の戻り値） |
| **JSX.Element** | ReactElementとほぼ同じ |
| **ReactChild** | ReactElement \| string \| number（古い、ReactNode推奨） |

→ **迷ったら `ReactNode`**。

---

## 💻 children の型

### 一番安全：ReactNode

```tsx
type CardProps = {
  title: string;
  children: React.ReactNode;
};

function Card({ title, children }: CardProps) {
  return (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// 使う側：何でも渡せる
<Card title="...">
  <p>本文</p>
  <button>OK</button>
  {someCondition && <Spinner />}
</Card>

<Card title="...">テキストだけ</Card>

<Card title="...">{42}</Card>

<Card title="...">{null}</Card>
```

### childrenを必須にしないなら `?`

```tsx
type Props = {
  children?: React.ReactNode;
};
```

---

## 💻 PropsWithChildren

`PropsWithChildren` は `children?: ReactNode` を自動追加：

```tsx
import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
  title: string;
}>;

// 等価：
type Props = {
  title: string;
  children?: React.ReactNode;
};
```

冗長を避けたいときに。

---

## 💻 子を1つだけ受け取る

JSXを1つだけ受け取りたい場合：

```tsx
type Props = {
  children: React.ReactElement;
};
```

ただし、**普通は ReactNode で十分**。

---

## 💻 関数 children（Render Props）

```tsx
type MouseTrackerProps = {
  children: (pos: { x: number; y: number }) => React.ReactNode;
};

function MouseTracker({ children }: MouseTrackerProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  // ...
  return <>{children(pos)}</>;
}

// 使う
<MouseTracker>
  {({ x, y }) => <p>{x}, {y}</p>}
</MouseTracker>
```

→ Render Props は今は **カスタムフックで代替**することが多い。

---

## 💻 React.Fragment や配列

```tsx
function App() {
  return (
    <>
      <h1>...</h1>
      <p>...</p>
    </>
  );
}
```

`<>` は `React.Fragment`。これも `ReactNode` の範囲内。

```tsx
const elements = items.map((i) => <Item key={i.id} />);
return elements; // ReactNode（配列もOK）
```

---

## 💻 children を加工する

```tsx
import { Children } from 'react';

function CountChildren({ children }: { children: React.ReactNode }) {
  return <p>子は {Children.count(children)} 個</p>;
}
```

`Children.count`、`Children.map`、`Children.toArray` などのユーティリティ。あまり使わないが知っておくと便利。

---

## 💻 戻り値の型：JSX.Element vs ReactNode

```tsx
function Hello(): JSX.Element {
  return <h1>Hello</h1>;
}

function Maybe(): React.ReactNode {
  if (...) return null;
  return <h1>Hello</h1>;
}
```

- 必ずJSXを返す → `JSX.Element`
- null や false を返すこともある → `ReactNode`（または明示しない・推論）

通常は **戻り値の型は明示しない**（推論に任せる）。

---

## ❌ よくある間違い

### children を string で型付け

```tsx
type Props = { children: string };
<Card>テキスト</Card>           // OK
<Card><p>本文</p></Card>        // ❌
```

→ ✅ ReactNode で。

### 必須なのに渡さない

```tsx
type Props = { children: React.ReactNode };
<Card />  // ❌ children が必須
```

→ ✅ 任意なら `?`。

### 関数 children を型付けせずに使う

```tsx
type Props = { children: any };
```

→ ✅ `(value: T) => React.ReactNode`。

---

## ✅ ベストプラクティス

1. **基本は ReactNode**
2. **任意なら `?` 付き**
3. **関数 children なら関数型**
4. **Render Props はフックで代替**を検討
5. **戻り値型は推論に任せる**

---

## 🔬 実践演習

`Tooltip` コンポーネント：

- props: text（string）、children（ReactNode）
- children にホバーすると text が出る
- 任意の child を受け取れる

```tsx
<Tooltip text="ヘルプ">
  <button>?</button>
</Tooltip>
```

---

## 📝 まとめ

- children の型は `React.ReactNode` が基本
- `PropsWithChildren` で簡潔に
- 関数children は型を関数で
- ReactElement は JSX 1つだけのとき

---

## 🔗 関連ページ

- [[10-5-Compound-Components-RenderProps]]
- [[11-1-propsの型付け]]
- [[3-7-Fragment]]
