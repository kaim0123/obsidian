# useContext — フックの基本と API

## 🎯 このページで学ぶこと

- `useContext` が何をするフックか
- `createContext` と組み合わせたときのデータの流れ
- デフォルト値・Provider 未設定時の挙動
- クラス時代の `Context.Consumer` との関係

---

## 📖 `useContext` とは

`useContext(MyContext)` は、**直近の上位にある `MyContext.Provider` が渡している `value` を読む**フックだ。深い階層まで props を渡さずに、その Context に「購読」する。

- **引数**: `React.createContext(...)` が返した Context オブジェクト（1つ）
- **戻り値**: その Context の現在の `value`
- **呼び出し条件**: 関数コンポーネントまたはカスタムフックのトップレベル（他のフックと同じルール）

---

## 💻 最小例

```jsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext('light');

function Deep() {
  const theme = useContext(ThemeContext);
  return <p>現在のテーマ: {theme}</p>;
}

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Deep />
    </ThemeContext.Provider>
  );
}
```

`Deep` は `ThemeContext` を import するだけでテーマを取得できる。途中コンポーネントに `theme` を渡さなくてよい。

---

## 📖 Provider が無いとき

`createContext(defaultValue)` に渡した **defaultValue** は、**ツリー上に対応する Provider が無いとき**に `useContext` の戻り値になる。

```jsx
const LangContext = createContext('ja');

function Banner() {
  const lang = useContext(LangContext); // Provider が無ければ 'ja'
  return <span>{lang}</span>;
}
```

本番では「必ず Provider で包む」設計にすることが多く、その場合 default は **開発中のフェイルセーフ**（未配線にすぐ気づく）や **Storybook 単体表示**向けに使う。

---

## 📖 `Context.Consumer` との関係（読み替え）

以前はレンダープロップで同じことを書いていた。

```jsx
// 旧: Consumer
<ThemeContext.Consumer>
  {(theme) => <span>{theme}</span>}
</ThemeContext.Consumer>

// 今: useContext
function Label() {
  const theme = useContext(ThemeContext);
  return <span>{theme}</span>;
}
```

意味は同じで、**どの Provider の value か**は Context オブジェクトの同一性で決まる。

---

## ⚠️ よくある間違い

### 間違った Context を渡す

別ファイルで `createContext` を二重に定義すると、**別物の Context** になり、値が届かない。Context は **1モジュール（または共有モジュール）で1つ**にまとめる。

### フックのループや条件分岐の内側で呼ぶ

```jsx
// ❌ NG
if (flag) {
  const x = useContext(XContext);
}

// ✅ OK: トップレベルで常に呼ぶ
const x = useContext(XContext);
```

---

## 📝 まとめ

- `useContext` = 指定した Context の `value` を読む
- Provider が無い場合は `createContext` のデフォルト
- Consumer と同義だが関数コンポーネント向けに読みやすい

---

## 🔗 関連ページ

- [[8-3-Context]]
- [[02-useContext-実践パターンとカスタムフック]]
- [[03-useContext-再レンダーと最適化]]
