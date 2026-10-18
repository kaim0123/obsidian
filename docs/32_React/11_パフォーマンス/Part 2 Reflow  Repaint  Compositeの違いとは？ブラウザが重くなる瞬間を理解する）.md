---
title: "[Frontend Performance - Part 2] Reflow / Repaint / Compositeの違いとは？ブラウザが重くなる瞬間を理解する）"
source: "https://qiita.com/tuanphan/items/c9c806d89284121d3401"
author:
  - "[[tuanphan]]"
published: 2026-04-21
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 目次 UIがカクつく原因は誰か？ たった3行でパフォーマンスを壊す例 Reflow / Repaint / Composite の本質 イメー..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 21, 2026, 02_40_08 PM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/b9d270e2-741a-4cdb-8361-de0cab05513f.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fb9d270e2-741a-4cdb-8361-de0cab05513f.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=aa8d63324f3b0f5080c59057b842f02c)

---

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 目次

## 1\. UIがカクつく原因は誰か？

こんな現象、経験ありませんか？

- スクロールが **ガクガクする**
- アニメーションが **滑らかじゃない**
- CPUが **急に跳ね上がる**

👉 これはビジネスロジックの問題ではありません。

> **本当の原因：**  
> ブラウザが **不要な再描画処理を大量に実行している**

---

### メンタルモデル（最重要）

> **UIが遅いのはコードが長いからではない**  
> 👉 **ブラウザがレイアウト計算をやりすぎているから**

---

## 2\. たった3行でパフォーマンスを壊す例

```js
const box = document.getElementById("box");

for (let i = 0; i < 100; i++) {
  box.style.width = i + "px";
  console.log(box.offsetHeight);
}
```

---

### ❌ 内部で起きていること

- `width` 変更 → レイアウト無効化
- `offsetHeight` 参照 → Layoutを **強制実行**
- 100回ループ → 100回Reflow

> 結果：UIがフリーズ

---

### Insight

> **DOMが遅いわけではない**  
> 👉 **Reflowこそが本当のボトルネック**

---

## 3\. Reflow / Repaint / Composite の本質

| 種類 | 内容 | コスト | 例 |
| --- | --- | --- | --- |
| 🔴 Reflow | レイアウト再計算 | ⭐⭐⭐⭐ | width / height / margin |
| 🟡 Repaint | 見た目の再描画 | ⭐⭐ | color / background |
| 🟢 Composite | レイヤー合成 | ⭐ | transform / opacity |

---

### 🧠 覚えるべきルール

> **レイアウトを触るな（必要な時だけ）**

- `top / left` ❌ → `transform` ✅
- `visibility` ❌ → `opacity` ✅

---

## 4\. イメージで理解：描画パイプライン

まず全体の流れ：

```text
DOM変更
   │
   ▼
Style計算
   │
   ▼
Layout（Reflow）
   │
   ▼
Paint（Repaint）
   │
   ▼
Composite
   │
   ▼
画面表示
```

---

### 変更による影響の違い

---

#### 🔴 Reflow（最悪パターン）

```text
Layout
 ↓
Paint
 ↓
Composite
```

👉 **全部再実行**

---

#### 🟡 Repaint

```text
Paint
 ↓
Composite
```

👉 Layoutスキップ

---

#### 🟢 Composite（最速）

```text
Compositeのみ
```

👉 GPU処理（超軽い）

---

### 🧠 まとめ図（最重要）

```text
Reflow     → Layout + Paint + Composite   ❌ 最重
Repaint    → Paint + Composite            ⚠️ 中
Composite  → Compositeのみ               ✅ 最軽
```

---

> 💡 **ブラウザは毎回全部やってるわけじゃない**  
> 👉 **変更の種類で処理が変わる**

---

## 5\. なぜReflowは「悪夢」なのか？

```js
element.style.width = "200px";
```

これだけで：

- 親要素再計算
- 子要素再配置
- 兄弟要素にも影響

---

### ドミノ効果

> 1変更 → DOM全体に波及

---

### 本質

> **Reflowは重い + 影響範囲が広い**

---

## 6\. Layout Thrashing – 絶対に避けるべきパターン

```js
// ❌ NG
items.forEach(item => {
  item.style.width = "100px";     // write
  console.log(item.offsetHeight); // read → 強制Reflow
});
```

---

### 問題

- browserが最適化できない
- 毎回Reflow

---

### ✅ 改善

```js
// writeまとめる
items.forEach(item => {
  item.style.width = "100px";
});

// readまとめる
items.forEach(item => {
  console.log(item.offsetHeight);
});
```

---

### 原則

> **read と write を分離する**

---

## 7\. DevToolsで高速にデバッグする

### 手順

1. Performanceタブ
2. Record
3. 操作
4. Stop

---

### 見るポイント

- 🟣 Layout → Reflow
- 🟢 Paint → Repaint
- 🟡 Script

---

### 🎯 確認

- Layoutが多すぎないか？
- 50ms以上のTaskはあるか？

---

> 💡 **見えないものは最適化できない**

---

## 8\. チェックリスト（すぐ使える）

### ✅ やるべき

- transformを使う
- DOM操作をまとめる
- read / write 分離
- will-changeを適切に使用

---

### ❌ 避ける

- offsetHeightをループ内で使う
- styleを細かく更新
- 不要なDOM再生成

---

## 9\. まとめ & 次回予告

### 覚えるべき4つ

1. Reflow = 最も重い
2. Repaint = 中
3. Composite = 最軽
4. パフォーマンスは「処理の種類」で決まる

---

> 🔥 **最適化とは「速くする」ことではない**  
> 👉 **重い処理を避けること**

---

## 👉 次回予告

**\[Frontend Performance - Part 3\] 初期表示の遅さの正体：Critical Rendering Path入門**

- FCP / LCPの本質
- CSS / JSのブロッキング
- 実務で効くロード最適化

---

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