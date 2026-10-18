---
title: "[Frontend Performance - Part 3] 初期表示の遅さの正体：Critical Rendering Path入門"
source: "https://qiita.com/tuanphan/items/27e098757f4977ac99c5"
author:
  - "[[tuanphan]]"
published: 2026-04-22
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 目次 初期表示が遅い原因は何か？ Critical Rendering Pathとは？ Diagramで理解するCRP 何がレンダリングをブロ..."
tags:
  - "clippings"
---
[![Performance.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/b89477bf-fa3e-434f-986a-aa6637decb61.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fb89477bf-fa3e-434f-986a-aa6637decb61.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=599f26492bdca4bb58b6b9d29f16f4c1)

---

> 📝 注意  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 目次

## 1\. 初期表示が遅い原因は何か？

こんな経験ありませんか？

- APIは速いのにページが遅い
- HTMLはすぐ返っているのに画面が真っ白
- LighthouseでLCPが悪い

👉 これらの原因はほぼ共通です。

> ❗ **ブラウザがまだUIを描画できていない**

---

**メンタルモデル（最重要）**

> **ロード完了 ≠ 表示できる**

ユーザーが気にするのはこれだけです：

> **「いつ画面が見えるのか？」**

---

## 2\. Critical Rendering Pathとは？

\*\*Critical Rendering Path（CRP）\*\*とは、

👉 ブラウザがUIを描画するまでに必ず通る処理の流れ

です。

---

## 3\. Diagramで理解するCRP

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__5ed07c9f4f5dec552502fb8060c69c7b" frameborder="0" height="847"></iframe>

---

**この図から分かること**

> **どこかが欠けると、描画は止まる**

- CSSがない → CSSOMが作れない → レンダー不可
- JS実行中 → DOMが変わる可能性 → 一時停止

---

## 4\. 何がレンダリングをブロックしているのか？

| リソース | ブロックする？ | 理由 |
| --- | --- | --- |
| HTML | ✅ する | DOMが必要 |
| CSS | 🚨 強くブロック | CSSOMが必要 |
| JS | 🚨 状況次第 | DOM/CSS変更の可能性 |
| 画像 | ❌ しない | ただしLCPには影響 |

---

## 5\. CSS / JS blockingの正体

**🔴 CSS**

```html
<link rel="stylesheet" href="style.css">
```

**ブラウザの動き** ：

- CSS取得
- パース
- CSSOM構築

**終わるまで描画しない**

---

**🔴 JS**

```html
<script src="app.js"></script>
```

**ブラウザの動き** ：

- HTMLパース停止
- JS実行
- DOM変更の可能性

---

**⚠️ 重要なポイント**

> **最終的なスタイルが分からないと描画できない**

## 6\. FCP / LCPを正しく理解する

**🟢 FCP**

👉 最初のコンテンツが表示されるタイミング

---

**🔵 LCP**

👉 メインコンテンツが表示されるタイミング

---

**本質**

> **FCP = 何か見えた**  
> **LCP = メインが見えた**

## 7\. 実務で効く最適化

**NG例**

```html
<head>
  <link rel="stylesheet" href="big.css">
  <script src="huge-lib.js"></script>
</head>
```

👉 結果：真っ白画面

---

**✅ 改善**

**1\. Critical CSSをinline**

```html
<style>
  /* 上部表示に必要なCSS */
</style>
```

---

**2\. deferを使う**

```html
<script src="app.js" defer></script>
```

---

**3\. async（依存なし）**

```html
<script src="analytics.js" async></script>
```

---

**4\. CSS分割**

```text
critical.css → 先に
rest.css     → 後で
```

---

**5\. preload**

```html
<link rel="preload" href="hero.jpg" as="image">
```

---

**本質**

> **重要なのは「何を先に読むか」**

---

## 8\. DevToolsでデバッグ

- Performanceタブ
- Long Task（>50ms）
- Blocking script
- Network waterfall

---

> 💡 **早く読み込まれたものが、先に描画される**

---

## 9\. チェックリスト

**✅ やるべき**

---

**❌ 避ける**

- 不要なJSをheadに置く
- 巨大CSS
- フォントブロック
- CSSの多重import

---

## 10\. まとめ

**覚えるべき4つ**

1. 描画はCRPに依存
2. CSS = render blocking
3. JS = parse blocking
4. パフォーマンスは「順序」で決まる

---

👉 **次回予告**  
\*\*\[Frontend Performance - Part 4\] 描画パフォーマンス最適化：ブラウザの仕事を減らす設計とは？

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