# 6-5. forwardRef と useImperativeHandle の概要（発展）

## 📖 目次

- [[010Programming/06_Frameworks/02_React/06_useRef/目次|← 06_useRef 目次に戻る]]
- [[6-2-DOM参照とフォーカス|← DOM 参照の基本]]
- [[10-3-カスタムフック|カスタムフック]]

## 🎯 なぜ出てくるか

通常、**関数コンポーネントは DOM を直接公開しません**。子の `<input>` などに親から `ref` を渡したいとき、**そのままでは ref は届かない**ことがあります（カスタムコンポーネントが「箱」になっているため）。

そこで React が用意しているのが次の API です。

- **`forwardRef`** … 親から渡された `ref` を、子コンポーネント内の具体的な DOM／子に **転送**する
- **`useImperativeHandle`** … 親に公開する参照を **一部のメソッドだけ**に絞る（「DOM 丸ごと」の代わりに `focus()` だけ等）

---

## 最小イメージ: forwardRef

```jsx
import { forwardRef, useRef } from 'react';

const FancyInput = forwardRef(function FancyInput(props, ref) {
  return <input ref={ref} {...props} />;
});

function Parent() {
  const inputRef = useRef(null);

  return (
    <>
      <FancyInput ref={inputRef} />
      <button type="button" onClick={() => inputRef.current?.focus()}>
        子の input にフォーカス
      </button>
    </>
  );
}
```

---

## useImperativeHandle の役割（ざっくり）

「親から **`inputRef.current` で DOM 全部触られてほしくない**」とき、**公開 API だけ**を定義できます（多くの場合は **制御コンポーネント**や **コールバック**で済ませる方が React 的、と言われます。imperative は例外的な用途で見かけます）。

詳しい API やベストプラクティスは公式ドキュメントやプロジェクトの方針に合わせて深掘りしてください。

---

## 🔗 関連

- DOM の基本は [[6-2-DOM参照とフォーカス]]
- コンポーネント設計 … [[10-1-UIコンポーネントとロジックの分離]] ほか、[[../13_コンポ゚ーネント設計/目次|コンポーネント設計の目次]] から章全体を辿れます。
