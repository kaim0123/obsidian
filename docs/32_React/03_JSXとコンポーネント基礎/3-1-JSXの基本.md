# 3-1. JSXの基本（式、属性、children）

## 🎯 この章で学ぶこと

- JSXとは何か、なぜ便利か
- JSXの中で「JavaScriptの値」をどう埋め込むか
- 属性（class → className など）と children の書き方

---

## 📖 概念の説明

### JSXとは

**JavaScript の中に HTML のような書き方を埋め込める拡張構文**。Reactコンポーネントの戻り値として書きます。

```jsx
const element = <h1>こんにちは</h1>;
```

これはHTMLのように見えますが、**JavaScriptの式**。ビルド時に内部で `React.createElement('h1', null, 'こんにちは')` に変換されます。

### なぜJSXを使う？

直接 `React.createElement` で書くと冗長です。

```jsx
// JSXで書くと
const ui = <button onClick={handleClick}>クリック</button>;

// JSX なしだと
const ui = React.createElement('button', { onClick: handleClick }, 'クリック');
```

JSXのほうが圧倒的に読みやすい。

---

## 💻 JSXのルール

### ルール1：必ず1つの要素を返す

```jsx
// ❌ NG
return (
  <h1>タイトル</h1>
  <p>本文</p>
);

// ✅ 親要素で囲む
return (
  <div>
    <h1>タイトル</h1>
    <p>本文</p>
  </div>
);

// ✅ Fragmentでもいい（ラッパー要素を増やしたくないとき）
return (
  <>
    <h1>タイトル</h1>
    <p>本文</p>
  </>
);
```

→ Fragment詳細は [[3-7-Fragment]]

### ルール2：閉じタグ必須

```jsx
// ❌ NG
<img src="/logo.png">
<br>

// ✅ 自己完結タグは / で閉じる
<img src="/logo.png" />
<br />
```

### ルール3：属性はキャメルケース

HTMLとは少しキーが違います。

| HTML | JSX |
| --- | --- |
| `class` | `className` |
| `for` | `htmlFor` |
| `onclick` | `onClick` |
| `tabindex` | `tabIndex` |

```jsx
<label htmlFor="email" className="form-label">メール</label>
<input id="email" onClick={handleClick} />
```

---

## 💻 JSXの中にJSの値を埋め込む

### 基本：`{ }` で囲む

```jsx
const name = '太郎';
const age = 20;

return <p>{name}さんは{age}歳です</p>;
```

`{ }` の中は **任意のJavaScript式**。

### 計算式・関数呼び出し

```jsx
const price = 1000;
const tax = 0.1;

return <p>合計: {price * (1 + tax)}円</p>;
return <p>大文字: {name.toUpperCase()}</p>;
return <p>今: {new Date().toLocaleString()}</p>;
```

### 三項演算子で条件分岐

```jsx
const isLogin = true;
return <p>{isLogin ? 'ログイン中' : 'ゲスト'}</p>;
```

### 配列を直接出す（後で詳しくは [[3-4-リストレンダリングとkey]]）

```jsx
const items = ['りんご', 'みかん', 'ぶどう'];
return (
  <ul>
    {items.map((item) => <li key={item}>{item}</li>)}
  </ul>
);
```

---

## 💻 属性に値を入れる

```jsx
const url = 'https://example.com';
const isActive = true;

// 文字列リテラル
<a href="https://example.com">リンク</a>

// 変数を使う
<a href={url}>リンク</a>

// 真偽値（ある＝true、なし＝false）
<input type="checkbox" checked={isActive} />

// インラインスタイル（オブジェクトで渡す）
<div style={{ color: 'red', fontSize: 16 }}>赤い文字</div>
```

`style` は**オブジェクト**を渡し、CSSプロパティはキャメルケース（`font-size` → `fontSize`）。

---

## 💻 children（子要素）

`children` はタグの中身です。コンポーネントを呼ぶときに、開始タグと終了タグの間に書いた要素が `children` になります。

```jsx
function Card({ children }) {
  return <div className="card">{children}</div>;
}

// 使う側
<Card>
  <h1>タイトル</h1>
  <p>本文</p>
</Card>
```

→ `Card` の中の `{children}` の場所に `<h1>` と `<p>` が入る。

---

## ❌ よくある間違い

### `{}` の中に文（statement）を書く

```jsx
// ❌ if文は式じゃないからダメ
<p>{ if (a) 'A' else 'B' }</p>

// ✅ 三項演算子（式）にする
<p>{a ? 'A' : 'B'}</p>
```

`{ }` の中は**式**だけ。`if`、`for`、`return`などの「文」は書けません。

### コメントの書き方

```jsx
// ❌ JSXの中ではJSのコメントは書けない
<div>
  // これはダメ
</div>

// ✅
<div>
  {/* JSXの中はこの形 */}
</div>
```

### nullとfalseは描画されない（空になる）

```jsx
const showError = false;
return (
  <div>
    {showError && <p>エラー</p>}
    {/* showErrorがfalseなら何も出ない */}
  </div>
);
```

詳しくは [[3-3-条件分岐レンダリング]]。

---

## ✅ ベストプラクティス

1. JSXは **「JS + HTML風」**。属性はキャメルケース
2. `{ }` の中は **式だけ**
3. 1要素しか返せないので **Fragment** か `<div>` で囲む
4. styleはオブジェクト、cssプロパティはキャメルケース
5. **コメントは `{/* ... */}`**

---

## 🔬 実践演習

```jsx
// このコンポーネントを完成させて、画面に表示させる
function Profile() {
  const user = { name: '太郎', age: 25, hobbies: ['読書', '映画'] };

  return (
    // ここを書く
  );
}
```

要件：

- 名前と年齢を1行で表示
- 趣味を `<ul>` でリスト表示
- 「成人」ならバッジを赤、未成年なら青

---

## 📝 まとめ

- JSX = JSの中にHTML風の構文を書ける
- `{ }` で式を埋め込む
- 属性はキャメルケース、必ず1要素を返す（Fragment可）
- styleはオブジェクト、コメントは `{/* */}`

---

## 📎 総合例（変数・条件・リスト・スタイル）

複数のルールを一度に使う例（旧 `04-jsx` 章の商品カードより）。

```jsx
function ProductCard({ product }) {
  const { name, price, image, inStock } = product;

  const cardStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px',
    maxWidth: '300px',
  };

  const priceStyle = {
    color: inStock ? 'green' : 'red',
    fontWeight: 'bold',
  };

  return (
    <div style={cardStyle}>
      <img src={image} alt={name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      <h3>{name}</h3>
      <p style={priceStyle}>
        {inStock ? `¥${price.toLocaleString()}` : '在庫切れ'}
      </p>
      {inStock && (
        <button style={{ backgroundColor: 'blue', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px' }}>
          カートに追加
        </button>
      )}
    </div>
  );
}

function App() {
  const products = [
    { id: 1, name: 'ノートPC', price: 80000, image: 'laptop.jpg', inStock: true },
    { id: 2, name: 'スマートフォン', price: 50000, image: 'phone.jpg', inStock: false },
    { id: 3, name: 'ヘッドフォン', price: 15000, image: 'headphones.jpg', inStock: true },
  ];

  return (
    <div>
      <h1>商品一覧</h1>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

---

## 📝 追加の練習（旧章より）

1. 変数を使って「こんにちは、[名前]さん！」と表示する JSX を書く
2. 配列 `['りんご', 'バナナ', 'オレンジ']` を `<ul>` でリスト表示する（`key` に注意 → [[3-4-リストレンダリングとkey]]）
3. `isLoggedIn` が `true` なら「ようこそ！」、`false` なら「ログインしてください」（→ [[3-3-条件分岐レンダリング]]）
4. インラインスタイルで、背景青・文字白のボタンを作る

---

## 🔗 関連ページ

- [[3-2-関数コンポーネント]]
- [[3-3-条件分岐レンダリング]]
- [[3-4-リストレンダリングとkey]]
- [[3-7-Fragment]]
