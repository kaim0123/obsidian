# 3-7. Fragment（不要なdivを増やさない）

## 🎯 この章で学ぶこと

- なぜ余計な `<div>` で囲むのが嫌か
- Fragment の書き方（`<></>` と `<React.Fragment>`）
- どちらを使うべきか

---

## 📖 概念の説明

### 課題：JSXは1要素しか返せない

```jsx
// ❌ 兄弟が2つあるのでエラー
function Header() {
  return (
    <h1>タイトル</h1>
    <p>サブタイトル</p>
  );
}
```

### 解決1：div で囲む

```jsx
function Header() {
  return (
    <div>
      <h1>タイトル</h1>
      <p>サブタイトル</p>
    </div>
  );
}
```

→ 動くが、**意味のない `<div>` が増える**。CSSのレイアウトが崩れたり、HTMLが汚くなる。

### 解決2：Fragment を使う

```jsx
function Header() {
  return (
    <>
      <h1>タイトル</h1>
      <p>サブタイトル</p>
    </>
  );
}
```

`<>...</>` がFragment。**HTMLには何も出さず**、複数要素をまとめられる。

---

## 💻 Fragment の書き方

### 短い書き方（`<></>`）

```jsx
return (
  <>
    <li>1番目</li>
    <li>2番目</li>
  </>
);
```

普段はこちらでOK。

### 長い書き方（`<React.Fragment>`）

```jsx
return (
  <React.Fragment>
    <li>1番目</li>
    <li>2番目</li>
  </React.Fragment>
);
```

短い書き方では**できないこと**を、長い書き方ではできる：

#### key を付けたい場合

```jsx
const items = [
  { id: 1, label: 'A', value: 'aaa' },
  { id: 2, label: 'B', value: 'bbb' },
];

return (
  <dl>
    {items.map((item) => (
      <React.Fragment key={item.id}>
        <dt>{item.label}</dt>
        <dd>{item.value}</dd>
      </React.Fragment>
    ))}
  </dl>
);
```

`<></>` は `key` 属性を付けられない。

---

## 💻 Fragmentが特に便利な場面

### テーブル行

```jsx
function TableRow({ user }) {
  return (
    <>
      <td>{user.id}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
    </>
  );
}

// 使う側
<tr><TableRow user={u} /></tr>
```

`<div>` で囲むとテーブルが壊れるが、Fragment なら大丈夫。

### Flex/Grid のレイアウト

親が `display: flex` のとき、子の構造に余計な `<div>` が混じるとレイアウトが崩れる。Fragment で出せばOK。

```jsx
// 親
<div style={{ display: 'flex' }}>
  <Sidebar />
  <Content />
</div>

// Sidebar の中（divを増やしたくない）
function Sidebar() {
  return (
    <>
      <a>メニュー1</a>
      <a>メニュー2</a>
    </>
  );
}
```

### グルーピングだけしたい

```jsx
{condition && (
  <>
    <h2>条件付きセクション</h2>
    <p>本文</p>
  </>
)}
```

---

## ❌ よくある間違い

### `<></>` に key を付けようとする

```jsx
// ❌
{items.map((item) => (
  <key={item.id}>...</>
))}
```

→ 構文エラー。**`<React.Fragment key={...}>`** にする。

### Fragment が深くネストしすぎる

```jsx
return (
  <>
    <>
      <>
        <p>...</p>
      </>
    </>
  </>
);
```

→ 不要なネストは避ける。1個で十分。

### div がCSS的に必要なのにFragmentにする

```jsx
// CSSで .card をスタイルしているのに...
<>
  <h2>...</h2>
  <p>...</p>
</>
// → スタイルが当たらない
```

→ スタイル目的の場合は `<div className="card">` を使う。

---

## ✅ ベストプラクティス

1. 何も追加要素が要らないなら **`<></>`**
2. **key が必要**なときだけ `<React.Fragment key>`
3. **CSSで囲みが必要**なら素直に `<div>`
4. **Fragment が深くネスト**してきたら、コンポーネント分割を検討
5. テーブル行・コラム並びでは特に有効

---

## 🔬 実践演習

```jsx
const data = [
  { id: 1, term: '犬', def: '哺乳類の動物' },
  { id: 2, term: '猫', def: '小型の哺乳類' },
];

// dl/dt/dd でリストを作る
// 各エントリは Fragment + key で囲む
```

---

## 📝 まとめ

- JSXは1要素しか返せない → Fragment で複数要素をまとめる
- 短い `<></>` か、key付きで `<React.Fragment>`
- スタイル目的なら `<div>` でいい
- テーブル・Flex・Gridで威力を発揮

---

## 🔬 深掘り（旧 `16-Fragment詳細解説` より）

### `import { Fragment } from 'react'`

短縮形 `<></>` のほか、名前付きの `<Fragment>...</Fragment>` も同じ意味。

```jsx
import { Fragment } from 'react';

<Fragment>
  <h1>タイトル</h1>
  <p>本文</p>
</Fragment>
```

`key` が必要なときは **短縮形では付けられない**ので、`<Fragment key={...}>`（または `<React.Fragment key={...}>`）を使う（→ 本文前半の `dl` / `dt` / `dd` の例）。

---

### リストで「1件あたり複数の兄弟」を返す

```jsx
import { Fragment } from 'react';

function ItemList({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <Fragment key={item.id}>
          <li>{item.name}</li>
          <li>{item.description}</li>
        </Fragment>
      ))}
    </ul>
  );
}
```

（構造によっては `li` のネストが妥当かどうかはマークアップを確認すること。）

---

### モーダル：オーバーレイと本体を兄弟で返す

余計な `div` を増やさず、オーバーレイとコンテンツを並べたいとき。

```jsx
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">{children}</div>
    </>
  );
}
```

---

### 複数 input をまとめて返す（フォーム）

```jsx
function AddressForm({ address, onChange }) {
  return (
    <>
      <input
        type="text"
        value={address.street}
        onChange={(e) => onChange({ ...address, street: e.target.value })}
        placeholder="番地"
      />
      <input
        type="text"
        value={address.city}
        onChange={(e) => onChange({ ...address, city: e.target.value })}
        placeholder="市区町村"
      />
    </>
  );
}
```

---

### Fragment と div の使い分け

- **Fragment**：余計なラッパーを増やしたくない、テーブルや Flex の子の構造を保ちたい
- **div**：スタイル用のラッパー、クラスを付けてレイアウトしたい

1要素しか返さないときにだけ `<>...</>` で包むのは不要。

---

### よくある間違い（補足）

- `<></>` に `key` を付けようとして構文エラー → `<Fragment key={...}>` を使う
- 不要な `<> <>` のネスト → 1段にまとめる

---

## 🔗 関連ページ

- [[3-1-JSXの基本]]
- [[3-4-リストレンダリングとkey]]
- [[10-1-UIコンポーネントとロジックの分離]]
