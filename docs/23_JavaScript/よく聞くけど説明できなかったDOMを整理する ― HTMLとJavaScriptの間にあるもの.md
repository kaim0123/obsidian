---
title: "よく聞くけど説明できなかったDOMを整理する ― HTMLとJavaScriptの間にあるもの"
source: "https://zenn.dev/shutingstar/articles/ef7a24133b87de"
author:
published: 2026-05-04
created: 2026-05-09
description:
tags:
  - "clippings"
---
1

## はじめに

こんにちは、YSです。  
今回は **DOM** について整理します。

DOMという言葉は、フロントエンドを触っているとかなりよく聞きます。

- DOMを操作する
- 仮想DOM
- DOMツリー
- `document.getElementById`
- ReactはDOMを直接触らない

ただ、いざ「DOMって何ですか？」と聞かれると、意外と説明が難しいです。  
少なくとも自分は、最初うまく言語化できませんでした。

この記事では、DOMを **「HTMLをブラウザがJavaScriptから扱える形に変換したもの」** として整理してみます。

---

## まずHTMLはただの文字列

Webページは、まずHTMLとして書かれます。

```
<html>
  <body>
    <h1>就活copilot</h1>
    <p>ES管理を効率化するアプリです</p>
    <button>開始する</button>
  </body>
</html>
```

人間が見ると、

と分かります。

ただ、このHTMLは最初はただのテキストです。  
ブラウザはこの文字列を読み取り、「これは見出し」「これは段落」「これはボタン」という形で解釈します。

その結果として作られるのがDOMです。

---

## DOMとは

DOMは **Document Object Model** の略です。

ざっくり言うと、

> HTMLを、JavaScriptから操作できるオブジェクトの形にしたもの

です。

ブラウザはHTMLを読み込むと、その内容をもとにDOMツリーを作ります。

```
document
└── html
    └── body
        ├── h1
        ├── p
        └── button
```

このように、HTMLの親子関係がツリー構造として表現されます。

つまりDOMは、

> 画面そのものというより、画面を作るためにブラウザが内部で持っている構造

と考えると分かりやすいです。

---

## DOMがあると何ができるのか

DOMがあることで、JavaScriptからHTMLの要素を取得したり、内容を変えたりできます。

たとえば、次のHTMLがあるとします。

```
<h1 id="title">こんにちは</h1>
```

JavaScriptからこの要素を取得できます。

```
const title = document.getElementById("title");
```

そして、テキストを書き換えることもできます。

```
title.textContent = "こんばんは";
```

すると、画面上の表示も変わります。

```
こんにちは
↓
こんばんは
```

これは、JavaScriptがHTMLファイルそのものを書き換えているわけではありません。  
ブラウザが作ったDOM上の要素を書き換えています。

その結果、画面の表示も更新されます。

---

## HTMLとDOMは同じではない

ここが少し混乱しやすいところです。

HTMLとDOMは似ていますが、同じものではありません。

| 観点 | HTML | DOM |
| --- | --- | --- |
| 何か | 書かれた文書 | ブラウザが解釈して作る構造 |
| 形式 | 文字列・ファイル | オブジェクト・ツリー |
| 扱うもの | 開発者が書くコード | ブラウザが内部で持つ構造 |
| JavaScript操作 | 直接ではない | `document` 経由で操作できる |

HTMLは設計図に近いです。  
DOMは、その設計図をブラウザが読み込んで、実際に扱える形にしたものです。

たとえば、HTMLに多少の省略があっても、ブラウザが補完してDOMを作ることがあります。

```
<table>
  <tr>
    <td>項目</td>
  </tr>
</table>
```

このHTMLを書いたとしても、ブラウザのDOMでは `tbody` が補われることがあります。

```
<table>
  <tbody>
    <tr>
      <td>項目</td>
    </tr>
  </tbody>
</table>
```

このように、HTMLとして書いた内容と、ブラウザが実際に持っているDOMは完全に一致しないことがあります。

---

## DOM操作とは

DOM操作とは、JavaScriptからDOMを変更することです。

たとえば、以下のような操作です。

- 要素を取得する
- テキストを変更する
- classを付け替える
- 新しい要素を追加する
- 要素を削除する
- クリックイベントを登録する

例として、ボタンをクリックしたらメッセージを変える処理を書いてみます。

```
<p id="message">未送信です</p>
<button id="submitButton">送信する</button>
```

```
const message = document.getElementById("message");
const button = document.getElementById("submitButton");

button.addEventListener("click", () => {
  message.textContent = "送信しました";
});
```

ボタンをクリックすると、DOM上の `p` 要素のテキストが変わり、画面も更新されます。

これがDOM操作です。

---

## Reactを書いているとDOMを意識しにくい

ReactやNext.jsを書いていると、直接DOMを触る機会はそこまで多くありません。

たとえばReactでは、次のように状態を変えるだけで画面が更新されます。

```
import { useState } from "react";

export function SubmitMessage() {
  const [message, setMessage] = useState("未送信です");

  return (
    <>
      <p>{message}</p>
      <button onClick={() => setMessage("送信しました")}>
        送信する
      </button>
    </>
  );
}
```

このコードでは、 `document.getElementById` は出てきません。  
`textContent` も直接変更していません。

それでも画面は更新されます。

これはReactが、状態の変化に応じて「どのDOMをどう更新するか」を裏側で考えてくれているからです。

つまりReactを書いていると、

> DOMを直接操作する代わりに、状態を変えることで画面を更新する

という書き方になります。

---

## 仮想DOMとは何か

DOMと一緒によく聞く言葉に **仮想DOM** があります。

仮想DOMは、ざっくり言うと、

> 本物のDOMを直接更新する前に、JavaScript上で持っておく軽量な設計図

です。

Reactは状態が変わったとき、いきなり本物のDOMを全部作り直すわけではありません。  
まずJavaScript上で新しい画面の構造を作り、前の構造との差分を見ます。

そして、必要な部分だけ本物のDOMに反映します。

イメージとしては、

```
状態が変わる
↓
新しい仮想DOMを作る
↓
前の仮想DOMと比較する
↓
変わった部分だけ本物のDOMを更新する
```

という流れです。

細かい仕組みまで最初から理解する必要はありません。  
まずは、

> 仮想DOMは、本物のDOM更新を効率よく行うために使われる中間的な表現

くらいで押さえておくとよさそうです。

---

## DOMを一言で説明するなら

自分が説明するなら、こう言います。

> DOMは、HTMLをブラウザが読み込んで、JavaScriptから操作できるツリー構造のオブジェクトとして表したものです。

もう少し噛み砕くなら、

> HTMLは書いた文書で、DOMはブラウザがそれを解釈して作った操作可能な構造です。

という感じです。

面接や会話で聞かれたときは、ここまで言えればまず十分だと思います。

---

## まとめ

DOMは、フロントエンドでよく聞くわりに、意外と説明しづらい言葉です。

- DOMは Document Object Model の略
- HTMLをブラウザが解釈して作るツリー構造
- JavaScriptからHTML要素を操作するための入り口になる
- HTMLとDOMは似ているが同じではない
- DOM操作とは、JavaScriptからDOMの要素を取得・変更すること
- ReactではDOMを直接触る代わりに、状態を変えて画面を更新する
- 仮想DOMは、本物のDOM更新を効率よく行うための中間的な表現

まずは、

> DOM = HTMLをブラウザがJavaScriptから扱える形にしたもの

と理解しておくと、かなり見通しが良くなると思います。

1