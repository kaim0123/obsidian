---
title: "[Frontend Performance - Part 1] ブラウザの描画処理を理解する（Rendering Pipeline入門）"
source: "https://qiita.com/tuanphan/items/6183df854b1de09b3b70"
author:
  - "[[tuanphan]]"
published: 2026-04-21
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 目次 問題提起 – 最適化しているのに遅い？ よくある悪い例 – 原因が分からないUIの遅さ 正しいアプローチ – ブラウザのパイプラインを理..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 21, 2026, 11_04_48 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/e54608a9-bdb3-4339-b414-6d86d6fe9d14.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fe54608a9-bdb3-4339-b414-6d86d6fe9d14.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=81e89a920d957e4e4e7ae1a1381512fa)

---

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 目次

## 1\. 問題提起 – 最適化しているのに遅い？

こんな経験はありませんか？

- `memo` や `useMemo` 、 `useCallback` を多用しているのにUIがカクつく
- APIは速いのに、画面の表示が遅い
- ちょっとしたstyle変更で全体が重くなる理由が分からない

ここで重要なのは：

> **問題はReactでも、純粋なJavaScriptでもありません。**

本質的な原因は、

👉 **ブラウザがどのようにUIを描画しているかを理解していないこと**

です。

Rendering Pipelineを理解していないと：

- 最適化する場所を間違える
- 指標の見方を誤る
- むしろパフォーマンスを悪化させる

可能性すらあります。

---

## 2\. よくある悪い例 – 原因が分からないUIの遅さ

一見問題なさそうなコードを見てみましょう。

```html
<ul id="list"></ul>
```

```js
const list = document.getElementById("list");

for (let i = 0; i < 1000; i++) {
  const li = document.createElement("li");
  li.innerText = \`Item ${i}\`;
  list.appendChild(li);
}
```

これは問題なく動作します。

しかし、次のような処理を追加すると：

```js
li.style.color = i % 2 === 0 ? "red" : "blue";
```

さらに悪いケース：

```js
list.style.width = \`${i}px\`;
```

👉 **UIが目に見えて遅くなります。**

### ❌ なぜ遅くなるのか？

- ループが原因ではない
- DOM APIが遅いわけでもない

原因は：

> **レイアウト計算（reflow）を何度も強制していること**

styleを変更するたびに、ブラウザはレイアウトを再計算し、  
結果的にパイプライン全体が何度も実行されます。

---

## 3\. 正しいアプローチ – ブラウザのパイプラインを理解する

ブラウザは、DOMを変更した瞬間に描画するわけではありません。

以下のステップを順番に処理します：

| ステップ | 内容 |
| --- | --- |
| 1\. HTML解析 | DOMツリーを構築 |
| 2\. CSS解析 | CSSOMツリーを構築 |
| 3\. Render Tree | DOM + CSSOMを結合し、描画対象を決定 |
| 4\. Layout | 位置・サイズを計算（reflow） |
| 5\. Paint | 色やテキストを描画 |
| 6\. Composite | レイヤーを合成して最終表示 |

---

### 🔥 重要なポイント

> **すべての変更が同じコストではない**

| 操作例 | 発生する処理 | コスト |
| --- | --- | --- |
| `color`, `background` | Paint + Composite | 中 |
| `width`, `height` | Layout + Paint + Composite | 高 |
| `transform`, `opacity` | Compositeのみ | 非常に低い |

👉 これが「 `transform` の方が滑らか」と言われる理由です。

---

## 4\. イメージで理解 – HTMLからピクセルまで

描画の流れは次のように考えると分かりやすいです：

```text
HTML  ──┐
       ├──► DOM ──┐
CSS  ──┘          ├──► Render Tree ──► Layout ──► Paint ──► Composite ──► 画面表示
```

---

### 具体例

```js
element.style.width = "200px";
```

この1行の裏では：

1. Layoutが無効化される
2. 位置・サイズを再計算
3. Paintを再実行
4. Compositeして画面に反映

👉 わずかな変更でも、 **数十msのコスト** が発生することがあります。

---

## 5\. 実践 – DevToolsで「見える化」する

パフォーマンスは「感覚」ではなく「計測」です。

### 手順

1. Chrome DevTools → **Performanceタブ**
2. **Record（●）** をクリック
3. 操作（スクロール、クリックなど）を実行
4. 停止して結果を確認

---

### 見るべきポイント

- **Layout（紫）** ：レイアウト計算
- **Paint（緑）** ：再描画
- **Script（黄色）** ：JavaScript実行

---

### 🎯 チェックすべきこと

- Layoutが何度も発生していないか？
- \*\*Long Task（50ms以上）\*\*はないか？
- 同じ領域でPaintが繰り返されていないか？

> 💡 **原則：推測ではなく計測すること**

---

## 6\. チェックリスト – 今すぐできる改善

この記事を読んだら、まず以下を試してください：

- DevToolsで実際の操作を記録し、Layoutの発生回数を確認する
- `width / height / top / left` を `transform` に置き換えられないか検討する
- ループ内での「読み取り + 書き込み」を避ける

---

### 改善例

```js
// ❌ 悪い例
for (let i = 0; i < items.length; i++) {
  items[i].style.width = i * 10 + "px";
  const height = items[i].offsetHeight; // layout強制
}
```

```js
// ✅ 改善例
const widths = [];
for (let i = 0; i < items.length; i++) {
  widths.push(i * 10 + "px");
}

for (let i = 0; i < items.length; i++) {
  items[i].style.width = widths[i];
}
// 読み取りと書き込みを分離
```

---

## 7\. まとめ & 次回予告

### 🧠 押さえておくべきポイント

1. ブラウザは段階的なパイプラインで描画している
2. 操作によってコストは大きく異なる
3. パフォーマンスとは「ブラウザの仕事を減らすこと」

---

👉 **次回予告**  
**\[Frontend Performance - Part 2\] Reflow / Repaint / Compositeの違いとは？ブラウザが重くなる瞬間を理解する）**

[0](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)