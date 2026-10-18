# 郵便番号（3桁＋4桁）入力で、3桁入力後に次の欄へカーソルを移す（React・初心者向け）

日本の郵便番号は **上3桁・下4桁** に分かれていることが多く、フォームでは **2つの `<input>`** に分けて表示します。  
このノートでは、**上の欄に数字を3文字入れた瞬間に、下の欄へ自動でフォーカス（カーソル）を移す**仕組みを、**`useState` と `useRef`** を中心に説明します。

関連: [[00-Reactフォーム入門-HTMLとの違いと用語（図解）]] / [[01Programming/06_Frameworks/02_React/08_状態管理_目次/01-フォーム送信とReact]] / [[14-useState詳細解説]]

---

## 1. 何を実現しているか（動きのイメージ）

1. ユーザーが **1つ目の入力欄** に `123` のように **3桁** まで入力する。
2. **3桁に達したタイミング**で、プログラムが **2つ目の入力欄** を「今キーボードの入力を受け取る箱」に指定する（これが **フォーカス**）。
3. ユーザーはそのまま **4桁** を続けて打てる。

補足として、**2つ目が空のときに Backspace** を押したら **1つ目に戻る** と、入力し直しがしやすくなります（後半のコードに含めます）。

---

## 2. なぜ `useState` と `useRef` の両方が出てくるか

| 役割 | 使うもの | 理由（初心者向け） |
|------|----------|-------------------|
| **入力欄に表示する文字**を覚えておく | **`useState`** | 値が変わると React が画面を描き直して、入力欄の中身が更新されるから。 |
| **「DOMの実体（ブラウザの入力ボックス）」を指す** | **`useRef`** | 「今どの入力欄にフォーカスを当てるか」は **ブラウザが持っている入力要素** に対して命令する必要があるから。 |

一言でいうと、**見た目の文字は state**、**フォーカス移動の命令先は ref**、という分担になりやすいです。

---

## 3. `useState` とは（この例に必要な範囲）

`useState` は **コンポーネントごとの「覚えておきたい値」** を React に預けるための仕組みです。

```js
const [part1, setPart1] = useState("");
```

- **`part1`**: いまの値（読む用）。例: `"12"`。
- **`setPart1`**: 値を更新する関数（書く用）。例: `setPart1("123")`。
- **`useState("")` の `""`**: 最初の値（初期値）。空文字から始める、という意味です。

`setPart1` を呼ぶと React は「状態が変わった」と判断し、**画面の再描画**が走ります。  
その結果、`<input value={part1} />` の **表示が新しい値に追従**します（制御コンポーネント）。

---

## 4. `useRef` とは（この例に必要な範囲）

`useRef` は **再描画しても消えない「箱」** を1つ持てます。フォームではよく、**DOM要素（ここでは `<input>`）への参照**を入れます。

```js
const ref1 = useRef(null);
```

- 最初は **`null`**（まだどの要素も指していない）。
- JSX 側で `<input ref={ref1} />` と書くと、**マウント後**に `ref1.current` が **その `<input>` 要素** を指します。

`ref1.current` が指しているのは **普通の DOM** なので、例えば次が使えます。

- `ref1.current.focus()` … **その入力欄にフォーカスを移す**

---

## 5. 「3桁入ったら次へ」はどこで判定するか

`<input>` の `onChange` は、**文字が変わるたび**に呼ばれます。  
そこで **最新の文字列**を作り、**長さが3になったら** `ref2.current.focus()` を呼びます。

注意点（初心者でつまずきやすい所）:

- **フォーカス移動は「状態更新」とは別**です。`setPart1` だけではフォーカスは動きません。
- そのため **`useRef` で2つ目の `<input>` を指しておき**、`focus()` を明示します。

---

## 6. 完成コード（1ファイルに収まる例）

以下は **Vite + React** や **Create React App** など、通常の React プロジェクトにそのまま置ける書き方です（拡張子は `.jsx` 想定）。

```jsx
import { useRef, useState } from "react";

// 数字以外を取り除く（全角数字を許すなら別途正規化が必要）
function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export function PostalCodeSplitFields() {
  const [part1, setPart1] = useState(""); // 上3桁
  const [part2, setPart2] = useState(""); // 下4桁

  const firstRef = useRef(null);
  const secondRef = useRef(null);

  function onFirstChange(event) {
    const next = digitsOnly(event.target.value).slice(0, 3);
    setPart1(next);

    // 3桁に達したら次の入力へフォーカス
    if (next.length === 3) {
      secondRef.current?.focus();
    }
  }

  function onSecondChange(event) {
    const next = digitsOnly(event.target.value).slice(0, 4);
    setPart2(next);
  }

  function onSecondKeyDown(event) {
    // 2つ目が空のとき Backspace → 1つ目へ戻す（UXの小さな改善）
    if (event.key === "Backspace" && part2 === "") {
      firstRef.current?.focus();
    }
  }

  const fullPostalCode = part1 + part2;

  return (
    <div>
      <label htmlFor="postal-part1">郵便番号</label>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          id="postal-part1"
          ref={firstRef}
          value={part1}
          onChange={onFirstChange}
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={3}
          placeholder="123"
          aria-label="郵便番号の上3桁"
        />
        <span aria-hidden="true">-</span>
        <input
          ref={secondRef}
          value={part2}
          onChange={onSecondChange}
          onKeyDown={onSecondKeyDown}
          inputMode="numeric"
          maxLength={4}
          placeholder="4567"
          aria-label="郵便番号の下4桁"
        />
      </div>

      {/* 学習用: 結合結果の確認（本番では不要なことが多い） */}
      <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
        結合（ハイフンなし）: <code>{fullPostalCode || "（未入力）"}</code>
      </p>
    </div>
  );
}
```

### 使っている主な属性の意味

| 属性 | 意味 |
|------|------|
| `value` / `onChange` | React が **表示と状態を同期**するための基本形（制御コンポーネント）。 |
| `maxLength` | ブラウザ側でも長さを抑える。**最終防衛線は `slice`** の方が堅い、という考え方もあります。 |
| `inputMode="numeric"` | スマホで数字キーボードを出しやすくするヒント。 |
| `ref={firstRef}` | `firstRef.current` が **この input 要素** を指すようになる。 |
| `autoComplete="postal-code"` | ブラウザの自動入力に寄せるヒント（環境により効き方は異なります）。 |

---

## 7. 処理の流れ（短い疑似タイムライン）

1. ユーザーが1つ目に `1` → `onFirstChange` → `setPart1("1")` → 再描画。
2. 続けて `23` → 最後の変更で `next` が `"123"`。
3. `next.length === 3` が真 → `secondRef.current.focus()` → **カーソルが2つ目へ**。
4. ユーザーは2つ目に `4567` と入力 → `setPart2` が更新。

---

## 8. よくある質問（FAQ）

### Q1. `useState` だけではダメなの？

**表示の管理**は `useState` で足ります。  
ただし **フォーカス移動**は「どの DOM にフォーカスするか」という命令なので、通常 **`ref` か `focus()` を呼べる DOM 取得**が必要です。

### Q2. `document.getElementById` でもいい？

小さな画面では動きますが、React では **同じコンポーネントが複数**ついたり **条件で input が消えたり**すると破綻しやすいです。  
**そのコンポーネント内の input を確実に指す**なら `ref` が安定しやすいです。

### Q3. `focus()` を `setPart1` の直後に書いてもいい？

`setState` は **すぐに画面が更新される保証が弱い**（バッチ処理）ので、タイミングによっては期待とズレることがあります。  
この例の規模では多くは問題になりにくいですが、もし不安なら **`requestAnimationFrame` / `queueMicrotask` / `setTimeout(0)`** で `focus()` を1回ずらす、といった手法もあります（まずは今の形で十分なことが多いです）。

### Q4. ペーストで `1234567` を一気に入れたい

方針は「**1つ目の `onChange` で7桁を検知して分割**し、`setPart1` / `setPart2` して最後に2つ目へフォーカス」などです。要件が増えるほど **専用関数にまとめる**と読みやすくなります。

---

## 9. 次に学ぶなら

- **アクセシビリティ**: `aria-label` や `aria-describedby`、エラーメッセージとの紐付け。
- **送信データ**: サーバに送るときは `1234567` のように **7桁へ正規化**するのが一般的です（ハイフンの有無を統一）。
- **検証**: 郵便番号の実在チェックは別 API／マスタに寄せるのが一般的です。

---

## 10. まとめ

- **入力の中身**は **`useState`** で持ち、`value` + `onChange` で画面と同期する。
- **次の入力欄へカーソルを移す**のは **`useRef` で DOM を指して `focus()`** するのが分かりやすい。
- **3桁到達**は `onChange` 内で **文字列の長さ**を見て判定する。

この3点が、このUIパターンの中心です。
