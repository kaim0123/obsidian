# 6-2. DOM 参照とフォーカス

## 📖 目次

- [[010Programming/06_Frameworks/02_React/06_useRef/目次|← 06_useRef 目次に戻る]]
- [[6-1-useRefの概要とuseStateとの違い|← 概要]]
- [[5-1-useEffectの役割|useEffect の役割]]

## 🎯 このノートで扱うこと

- `ref` 経由で DOM を取り、`focus()` などのブラウザ API を呼ぶ
- マウント直後にだけフォーカスしたいときの **`useEffect` との組み合わせ**
- （補足）**コールバック ref** のイメージ

---

## 1. ボタンで入力欄にフォーカス

```jsx
import { useRef } from 'react';

function FocusInput() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <input ref={inputRef} type="text" placeholder="名前を入力" />
      <button type="button" onClick={focusInput}>入力欄にフォーカス</button>
    </div>
  );
}
```

- マウント前やアンマウント後は `current` が `null` になり得るので、`?.`（オプショナルチェーン）で安全に呼ぶ習慣がよいです。

---

## 2. 初回表示時だけ自動フォーカス

描画が終わって DOM が存在してからでないと `focus()` は意味がありません。 **副作用**として `useEffect` に書きます。

```jsx
import { useEffect, useRef } from 'react';

function AutoFocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" placeholder="表示時に自動フォーカス" />;
}
```

---

## 3. コールバック ref（必要になったら）

要素がマウント／アンマウントされるたびに、関数 ref が呼ばれます。 **「その瞬間の DOM を一度だけ処理したい」** ときに使います。

```jsx
function CallbackRefBox() {
  return (
    <div
      ref={(el) => {
        if (el) {
          // マウント時: el はその div の DOM
          console.log('width', el.offsetWidth);
        }
      }}
    />
  );
}
```

`useRef` で十分なことが多いですが、ライブラリ連携や測定ではコールバック ref が選ばれることもあります。

---

## ⚠️ レンダー中に DOM に依存しすぎない

`inputRef.current` は **レンダー関数の実行タイミング**ではまだ古い／未設定のことがあります。 DOM に依存する操作は **イベントハンドラ**や **`useEffect`** の中に寄せると考え方が安定します。

---

## ⏭ 次のノート

- タイマー ID など DOM 以外の保持 … [[6-3-ミュータブルな値の保持と副作用]]
- 親子で ref を渡す話 … [[6-5-forwardRefとuseImperativeHandleの概要]]
