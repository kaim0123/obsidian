# 14-1. children とは（特別な prop）

## 🎯 この章で学ぶこと

- `children` が何を指すか（JSX の「内側」のノード）
- 親コンポーネントから子へどう見えるか
- `children` を省略・明示の両方で渡すときの違い（型は別ノート）

---

## 📖 概念の説明

### children とは

`<Parent>…ここ…</Parent>` の **開始タグと終了タグの間** に書いた内容が、`Parent` に **`children` という prop としてひとかたまりで渡されます**。

- テキスト、要素、フラグメント、配列、`null`、`false` など、親が並べられるものなら複数でもよい。
- `children` は **予約気味の名前**で、 JSX の構造そのものから埋まる点が普通の prop と異なります。

```jsx
function Box({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

function App() {
  return (
    <Box title="例">
      <p>第一段</p>
      <p>第二段</p>
    </Box>
  );
}
```

上では `Box` に渡る `children` は、ざっくり **2つの `<p>` を含むような値**になります。

### 親が `children={…}` と書く場合

JSX の子と同じ意味で、`children` を属性として渡すこともできます。

```jsx
<Box title="例" children={<span>ひとつの子だけ</span>} />
```

複数並べたいときはフラグメントや配列がよく使われます。

```jsx
<Box title="例" children={<>ノートA<p>段落</p></>} />
```

---

## 💻 ひとつの子だけに限定したい場合

「子がちょうど1つでなければならない API」を作りたいときは、後続の **`React.Children.only`** が向いています（詳しくは `14-2`）。

---

## TypeScript での型

`ReactNode` や `PropsWithChildren` などは、`15_TypeScript_React` の **`11-4-childrenの型`** を参照してください。このノートでは実行時の挙動側にフォーカスします。
