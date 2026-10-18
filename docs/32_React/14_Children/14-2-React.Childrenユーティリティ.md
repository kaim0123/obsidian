# 14-2. React.Children ユーティリティ（map / toArray / only / …）

## 🎯 この章で学ぶこと

- `React.Children.map` と普通の配列 `.map` の違い
- `toArray` / `count` / `forEach` / `only` の役割と使いどころ
- **単純ループが苦手な入力**に対処するという発想

---

## 📖 なぜ `React.Children` があるか

`children` は **必ずしも「配列」ではありません**。次のような形になり得ます。

- ひとつの要素だけ
- テキストや `null` が混じる
- フラグメントで包まれている

そのため、`children.map(...)` と書くと **「配列でないときに壊れる」**ことがあります。`React.Children` は **単一でも複数でも同じコードで処理しやすくする**ための API です。

---

## 💻 React.Children.map

実際のノードだけを順に処理し、**結果をまとめて返したい**ときの基本です。第3引数にインデックスを受けられます。

```jsx
function ListWithBullets({ children }) {
  return (
    <ul>
      {React.Children.map(children, (child, index) => (
        <li key={index}>{child}</li>
      ))}
    </ul>
  );
}
```

### key について

上の例の `key={index}` は **並び順がほぼ固定で、子が入れ替わらない**場合の簡易例です。並びが変わるリストでは、**安定したデータの ID** に基づく key を子側で持つ設計が望ましいです。key まわりの落とし穴は `14-4` にまとめています。

---

## 💻 React.Children.toArray

`children` を **常に配列ライクな形に正規化**します。フラット化はしませんが、並び順を保ちつつ処理しやすくなります。

```jsx
const items = React.Children.toArray(children);
console.log(items.length);
```

後続で `.filter` / `.map` を素直に書きたいときに便利です。**ただし**、ここでも「フラグメントの中身をどう見るか」などは通常の DOM とは違うので、`14-4` の注意とあわせて読んでください。

---

## 💻 React.Children.count

有効な子の個数が欲しいとき。`null` / `undefined` / `boolean` は数えません（レンダリングしない値を除くカウント）。

---

## 💻 React.Children.forEach

副作用のみ（ログ、検証、アクセシビリティ用の調整など）なら `.map` の代わりに `forEach` でもよいです。

---

## 💻 React.Children.only

子が **ちょうど1つの React element** でない場合にエラーにします。**ラッパーを1個だけ許可したい API** で使われます。

```jsx
function SingleChildGate({ children }) {
  const only = React.Children.only(children); // 0個や2個以上だとエラー
  return <div className="wrap">{only}</div>;
}

// OK
// <SingleChildGate><main /></SingleChildGate>
```

テキストだけの単一子など、**要素でない単一ノードの扱い**はドキュメントの条件を確認すると安全です。「1つだけ欲しい」の意味で使い分けしてください。
