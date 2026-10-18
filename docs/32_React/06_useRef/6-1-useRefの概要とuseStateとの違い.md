# 6-1. useRef の概要と useState との違い

## 📖 目次

- [[010Programming/06_Frameworks/02_React/06_useRef/目次|← 06_useRef 目次に戻る]]
- [[18-useRef詳細解説|← 1 ファイル版ダイジェスト]]
- [[09-hooks|Hooks の基礎（リダイレクト/各章へ）]]

## 🎯 useRef とは

`useRef` は、**再レンダリングを起こさずに値を保持したり、DOM 要素を参照したりする**ための React のフックです。

初心者向けに用途をふたつに分けると次のとおりです。

- **DOM 要素をつかむ**（`input` にフォーカス、要素のサイズ取得、スクロール など）
- **画面表示に使わない値を保持する**（タイマー ID、前回の props、処理回数 など）

---

## 🧠 useState と何が違うか

| | `useState` | `useRef` |
|---|------------|----------|
| 更新の結果 | **再レンダー**される（UI が追従しやすい） | `current` を変えても **再レンダーされない** |
| 向いているデータ | 画面に出す・フォームで制御したい値 | DOM 参照、補助的なメタ情報、購読 ID |

ざっくり言えば次の分担です。

- **画面に直接反映させたいデータ** → `useState`（または派生なら計算のみでもよい）
- **DOM 操作や「裏で持っておきたいだけ」の値** → `useRef`

---

## 🔤 基本構文（ふたつの使い方）

### 1. DOM を参照する

```jsx
import { useRef } from 'react';

function Sample() {
  const inputRef = useRef(null);

  return <input ref={inputRef} />;
}
```

- `useRef(null)` で **同じオブジェクト**をレンダー間で保持する
- `ref={inputRef}` で React が **マウント後**に `inputRef.current` に DOM を代入する
- コンポーネント側からは **`inputRef.current`** で要素にアクセスする

### 2. 値だけを保持する（ミュータブルな「箱」）

```jsx
import { useRef } from 'react';

function Sample() {
  const countRef = useRef(0);

  const handleClick = () => {
    countRef.current += 1;
    console.log(countRef.current);
  };

  return <button onClick={handleClick}>加算（ログのみ）</button>;
}
```

- 初期値は `useRef(0)` の引数
- 更新は **`ref.current = ...`**（プロパティの代入）
- **代入しても再レンダーは走らない**ので、その値をそのまま JSX に書いても更新されません（必要なら `useState` と役割を分ける）

---

## ⏭ 次のノート

- DOM を触る具体例 … [[6-2-DOM参照とフォーカス]]
- タイマーや「裏の値」の例 … [[6-3-ミュータブルな値の保持と副作用]]
