---
title: "[Frontend Performance - Part 4] 描画パフォーマンス最適化：ブラウザの仕事を減らす設計とは？"
source: "https://qiita.com/tuanphan/items/f5e23af90951e53a78ca"
author:
  - "[[tuanphan]]"
published: 2026-04-22
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 0. はじめに 1. ブラウザの仕事を減らすとは？ 2. レイアウト計算を減らす（Reflow 削減） 3. ペイントコストを下げる..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 22, 2026, 01_28_51 PM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/9936bda8-c324-49b9-9574-898fa452caf6.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F9936bda8-c324-49b9-9574-898fa452caf6.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=e0a106a27ff73fc821227bce4917cfff)

---

> 📝 注意  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 0\. はじめに

これまでのシリーズでは、ブラウザの内部動作を段階的に見てきました。

- **Part 1**: Rendering Pipeline（描画の流れ）
- **Part 2**: Reflow / Repaint / Composite（コストの違い）
- **Part 3**: Critical Rendering Path（初期表示が遅くなる理由）

ここまでで分かることは、とてもシンプルです。

> **ブラウザは想像以上に多くの処理をしている**

それにもかかわらず、開発現場ではこう考えがちです。

- 「とりあえず JS を軽くすればいい」
- 「 `memo` 化すれば速くなるはず」

しかし、本質はそこではありません。

**本質**

> ❌ 「どうやって速くするか」ではなく  
> ✅ **「ブラウザに余計な仕事をさせないか」**

本記事では、 **描画パフォーマンス最適化の設計思想** を解説します。

---

## 1\. ブラウザの仕事を減らすとは？

ブラウザは **1 フレーム（約 16ms）** ごとに、以下の処理を行っています。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__63094582a5116584b406bb9db1434790" frameborder="0" height="120"></iframe>
- **Layout（リフロー）** ：位置・サイズの計算
- **Paint（リペイント）** ：ピクセルの描画
- **Composite（コンポジット）** ：レイヤーの合成

この処理が **16ms を超えると** ：

**フレーム落ち（jank）** が発生し、カクつきの原因になります。

---

**重要な視点**

パフォーマンス改善とは：

- ❌ 処理を「速くする」ことではない
- ✅ **処理そのものを減らすこと**

---

**基本原則**

| NG（避けるべき） | OK（推奨） |
| --- | --- |
| レイアウトを頻繁に発生させる | 更新をまとめて行う（バッチ化） |
| DOM を何度も細かく更新する | 一括更新する（class 切替など） |
| 画面全体を再描画させる | レイヤーで影響範囲を限定 |
| `top` / `left` でアニメーション | `transform` を使う |

---

## 2\. レイアウト計算を減らす（Reflow 削減）

**Reflow は最もコストが高い**

Reflow が発生すると、ブラウザは以下を再計算します：

- DOM 構造
- CSS の適用結果
- 要素の位置・サイズ

**影響範囲が広く、最も重い処理**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__9ce0bdbfd5177e2af01dcecc483e7233" frameborder="0" height="167"></iframe>

---

**よくある NG：Layout Thrashing**

JavaScript で **読み取り（read）と書き込み（write）を交互に行う** と、  
毎回強制的に Reflow が発生します。

```javascript
// ❌ 悪い例
element.style.width = '100px';     // write
console.log(element.offsetWidth);  // read → 強制リフロー
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__724af159bd1efbe9d2652ca6b55d8413" frameborder="0" height="564"></iframe>

---

**改善方法**

**1\. 読み取りと書き込みを分離**

```javascript
const width = element.offsetWidth;
const height = element.offsetHeight;

element.style.width = width + 100 + 'px';
element.style.height = height + 100 + 'px';
```

---

**2\. DOM 更新はまとめる**

```javascript
// ❌ バラバラ更新
el.style.width = '100px';
el.style.height = '100px';

// ✅ 一括更新
el.style.cssText = 'width:100px;height:100px;';
```

---

**3\. CSS Containment を使う**

```css
.card {
  contain: layout;
}
```

レイアウトの影響範囲を限定できる

---

## 3\. ペイントコストを下げる（Repaint 最適化）

Repaint は「見た目の再描画」です。

---

**重いプロパティ**

- `box-shadow`
- `border-radius`
- `filter`
- `gradient`
- `position: fixed`

広範囲に使うと負荷が大きい

---

**対策**

**1\. レイヤー分離**

```css
.animated {
  will-change: transform;
}
```

---

**2\. 重い装飾を避ける**

```css
/* ❌ */
box-shadow: 0 0 20px rgba(0,0,0,0.5);

/* ✅ */
border-bottom: 1px solid rgba(0,0,0,0.1);
```

---

## 4\. Composite だけで済ませる設計（最重要）

**理想**

> **Layout も Paint も発生させない**

**Composite のみで処理**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__b97640d2844529596f9525418e65933f" frameborder="0" height="897"></iframe>

---

**GPU で処理できるプロパティ**

- `transform`
- `opacity`

---

**NG / OK**

```css
/* ❌ */
left: 100px;

/* ✅ */
transform: translateX(100px);
```

---

**効果**

- GPU で処理される
- メインスレッドをブロックしない
- 60fps を維持しやすい

---

## 5\. レイヤー設計と GPU 活用

ブラウザは **レイヤー単位** で描画します。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__ad5658720a25b32ef446fac7a20715a8" frameborder="0" height="533"></iframe>

---

**レイヤー化**

```css
.animated {
  will-change: transform;
}
```

---

**注意**

- レイヤーはメモリを消費する
- 作りすぎると逆効果

---

## 6\. DOM 構造とレンダリングコスト

**DOM が大きいと遅くなる理由**

- Layout 計算量が増える
- Paint 範囲が広がる

---

**対策**

**1\. フラットな構造**

**2\. 仮想化（Virtualization）**

必要な分だけ DOM を生成

**3\. コンポーネント分離**

再レンダリング範囲を限定

---

## 7\. JavaScript との関係（軽く）

JavaScript 実行中は描画が止まります。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__53ddd9def01122cd4559aaf3dae71914" frameborder="0" height="562"></iframe>

---

**悪い例**

```javascript
for (let i = 0; i < 1000000000; i++) {}
```

---

**対策**

---

## 8\. まとめ

**Key Takeaways**

- パフォーマンスは設計で決まる
- 「速くする」ではなく **「無駄な処理をさせない」**

優先順位：

---

> 💡 良い設計とは、ブラウザに無駄な仕事をさせないこと

---

**👉 次回予告**  
**\[Frontend Performance - Part 5\] なぜ UI は止まるのか？JavaScript の実行モデルと Event Loop を理解する**

[1](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)