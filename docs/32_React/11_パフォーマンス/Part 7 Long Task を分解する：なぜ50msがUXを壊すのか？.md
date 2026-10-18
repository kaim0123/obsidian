---
title: "[Frontend Performance - Part 7] Long Task を分解する：なぜ50msがUXを壊すのか？"
source: "https://qiita.com/tuanphan/items/ce891e246da988d07f40"
author:
  - "[[tuanphan]]"
published: 2026-04-24
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 問題：「処理が速いのにUXが悪い」の正体 なぜ50msがUXの境界線なのか？ Long Taskの本質：時間ではなく「占有」の問題 ..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 24, 2026, 10_16_59 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/26fe834c-8c66-40b7-a530-87a64593a5ab.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F26fe834c-8c66-40b7-a530-87a64593a5ab.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=a9fb3d40ef3501fe63a34ca5852b26e1)

---

> 📝 注意  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 1\. 問題：「処理が速いのにUXが悪い」の正体

Part 6 では **メインスレッドがブロックされるとUIがカクつく** ことを学びました。

しかし、次のような矛盾に出会うことがあります。

それなのに：

- スクロールがガクガクする
- キーボード入力が遅れる
- アニメーションがコマ落ちする

> **真実：** UXが悪いのは「処理の絶対速度」ではなく、 **タスクの配置（タイミング）** が原因です。

**1つの100msタスク** はメインスレッドを長時間占有し、UIをカクつかせます。  
一方、 **5つの20msタスク** はその間にレンダリングを挟めるため、ユーザーは遅延を感じません。

👉 **これが Part 7 の核心です。**

---

## 2\. なぜ50msがUXの境界線なのか？

Googleの **RAILモデル** では次の指標が定義されています。

| アクション | 目標応答時間 |
| --- | --- |
| クリック / タップ | < 100ms |
| スクロール / アニメーション | < 16ms |
| **アイドル処理** | **< 50ms** |

**50msという数字の根拠：**

- 1フレーム = 約16.7ms (60fps)
- 50ms ≈ 3フレーム連続でブロックされる
- 人間の知覚実験では **50msを超えると遅延を感じ始める** ことが分かっている

**視覚的な比較（修正済み）**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__eb2ab8787598d5cd05c92dfffd72d596" frameborder="0" height="349"></iframe>

👉 **ユーザーは「合計時間」ではなく「応答までの感覚」でUXを評価します。**

---

## 3\. Long Taskの本質：時間ではなく「占有」の問題

Part 6 では Long Task を **50msを超えるタスク** と定義しました。

しかし、より本質的な理解が必要です：

> **Long Taskの問題は「長さ」ではなく「メインスレッドを離さないこと」**

メインスレッドを一方通行の橋に例えましょう：

- Long Task = 橋を塞ぐ大型トラック
- 他のすべて（レンダリング、クリック、スクロール）は待たされる
<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__016bf7eed823b3530e04bc5dd0b5ca5c" frameborder="0" height="373"></iframe>

👉 **これがUIが一瞬止まり、後から「ジャンプ」する感覚の正体です。**

---

## 4\. タスク分割の基本戦略 (Task Splitting Patterns)

Long Task を解決するための4つの主要パターン。

**4.1 チャンク分割 (Chunking)**

大きなループを **小さな塊（チャンク）** に分割し、各チャンク後にスレッドを譲ります。

```javascript
// ❌ 悪い: 10,000件を一気に処理（Long Task）
function processAll(items) {
  items.forEach(heavyWork);
}

// ✅ 良い: 100件ずつ処理（チャンク）
function processChunk(items, start = 0, chunkSize = 100) {
  const end = Math.min(start + chunkSize, items.length);
  for (let i = start; i < end; i++) {
    heavyWork(items[i]);
  }
  if (end < items.length) {
    setTimeout(() => processChunk(items, end, chunkSize), 0);
  }
}
```

**チャンク処理の流れ:**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__a614488d0bb95807114f569d39a1e8c6" frameborder="0" height="703"></iframe>

**4.2 譲る (Yielding)**

メインスレッドを一時的に解放し、ブラウザに描画やイベント処理の機会を与えます。

| 方式 | 特徴 |
| --- | --- |
| `setTimeout(fn, 0)` | シンプル、確実に譲る。優先度は低め |
| `requestAnimationFrame(fn)` | 次のフレーム直前に実行。アニメーション向け |
| `requestIdleCallback(fn)` | アイドル時に実行。バックグラウンド処理向け |
| `scheduler.postTask(fn, {priority})` | 優先度を詳細制御（実験的API） |

**4.3 優先度制御 (Prioritization)**

すべてのタスクが同じ重要度ではありません。

```text
優先度 高:
- ユーザー入力（クリック、キーボード）
- アニメーション (requestAnimationFrame)
- 描画関連

優先度 低:
- ロギング
- アナリティクス送信
- プリフェッチ
```

👉 **戦略：** 優先度の低い処理は `requestIdleCallback` に追いやり、高い処理を優先する。

**4.4 メインスレッドから逃がす (Off-main-thread)**

どうしても分割できない重い処理は **Web Worker** に逃がします。

```javascript
// main.js
const worker = new Worker('heavy-worker.js');
worker.postMessage(data);
worker.onmessage = (e) => updateUI(e.data);
```

```javascript
// heavy-worker.js
self.onmessage = (e) => {
  const result = veryHeavyCalculation(e.data);
  self.postMessage(result);
};
```

---

## 5\. 実戦例：Long Task → 分割 → UX改善

**ケース1: 巨大ループのチャンク処理**

**❌ 悪い（Long Task ~100ms）**

```javascript
function processBigArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    doHeavySyncWork(arr[i]); // 10万回
  }
}
```

**✅ 良い（チャンク + setTimeout）**

```javascript
function processChunk(arr, start = 0, chunkSize = 100) {
  const end = Math.min(start + chunkSize, arr.length);
  for (let i = start; i < end; i++) {
    doHeavySyncWork(arr[i]);
  }
  if (end < arr.length) {
    setTimeout(() => processChunk(arr, end, chunkSize), 0);
  }
}
```

---

**ケース2: クリック時のUIブロック回避**

**❌ 悪い – クリック後にUIが固まる**

```javascript
button.onclick = () => {
  const result = heavyComputation(); // 80ms
  updateUI(result);
};
```

**✅ 良い – ローディング表示を先に出し、計算は後回し**

```javascript
button.onclick = () => {
  showLoadingSpinner(); // 即座に反映
  
  setTimeout(() => {
    const result = heavyComputation();
    updateUI(result);
  }, 0);
};
```

👉 **ユーザーは「すぐに反応した」と感じる。これが本当のUX改善。**

---

**ケース3: React レンダリングストームの防止**

**❌ 悪い – 1000回の再レンダリング**

```javascript
const [items, setItems] = useState([]);

function addMany(newItems) {
  newItems.forEach(item => {
    setItems(prev => [...prev, item]); // 毎回レンダリング
  });
}
```

**✅ 良い – バッチ更新で1回だけ**

```javascript
function addMany(newItems) {
  setItems(prev => [...prev, ...newItems]); // 1回だけレンダリング
}
```

React 18 では同一イベントハンドラ内の複数 `setState` は自動バッチされますが、Promise や `setTimeout` の中ではバッチされないので注意が必要です。

---

**ケース4: Web Workerで重い計算を逃がす**

**❌ 悪い – メインスレッドで計算**

```javascript
function onDataReceived(rawData) {
  const processed = heavyProcessing(rawData); // 120msブロック
  display(processed);
}
```

**✅ 良い – Workerへ委譲**

```javascript
const worker = new Worker('processor.js');
worker.onmessage = (e) => display(e.data);

function onDataReceived(rawData) {
  worker.postMessage(rawData); // 即座に戻る
}
```

**シーケンス図:**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__85f17ee5092032f6f5a2775cb51474a2" frameborder="0" height="709"></iframe>

---

## 6\. よくある誤解（上級者でもハマるポイント）

**❌ “コードが速ければ十分”**

**間違い。**  
速くても、そのタイミングが悪ければUXを壊します。

> **重要度： タイミング ＞ 速度**

**❌ “async/await ならブロックしない”**

**間違い。**  
`await heavySyncFunction()` の中で同期的に重い処理をしていれば、async でもブロックします。

```javascript
async function bad() {
  for (let i = 0; i < 1e9; i++) {} // ❌ メインスレッドをブロック
}
```

**❌ “MicrotaskはMacrotaskより常に良い”**

**そうとは限らない。**  
Microtask（ `Promise.then` ）は現在のタスクの直後に実行されるため、連続して Microtask を追加すると **レンダリングが永遠に来ない** （Part 5参照）。

**❌ “FPS 60 が出ていればOK”**

**間違い。**  
FPSは平均値。Long Task が混ざると瞬間的なジャンクが発生します。  
ユーザーは **平均ではなく「最悪の瞬間」** を覚えています。

---

## 7\. 実務で使えるチェックリスト

**✅ タスク設計**

- タスクが50msを超えていないか？（DevTools → Performance で確認）
- 超えている場合、チャンク分割できるか？
- そのタスクは本当に今すぐ必要か？ 遅延できないか？

**✅ スケジューリング**

- 重い計算の前に UI を更新して「反応した」ことを伝えているか？
- `setTimeout` や `requestIdleCallback` で適切に譲っているか？
- アニメーション関連は `requestAnimationFrame` を使っているか？

**✅ アーキテクチャ**

- 重い計算は Web Worker に移せるか？
- 状態更新はバッチ処理されているか？（レンダリングストーム防止）
- 無限 Microtask を発生させていないか？

---

## 8\. 最終まとめ

シリーズ3部作の振り返り：

| Part | テーマ | 核心 |
| --- | --- | --- |
| 5 | Event Loop | タスクの種類（micro/macro）と順序 |
| 6 | Main Thread Blocking | UIが止まる理由、Long Taskの定義 |
| **7** | **Long Task分解** | **50msルール、分割パターン、優先度制御** |

**最も重要なこと**

> **パフォーマンスチューニングの本質は「関数を速くすること」ではなく、  
> 「メインスレッドを50ms以上占有しないタイムラインを設計すること」です。**

1つの100msタスクは **UXの敵** です。  
必ず：

を組み合わせて、 **「速い」だけでなく「気持ちいい」UI** を実現しましょう。

---

👉 **次回予告**  
**\[Frontend Performance - Part 8\] JavaScriptランタイム最適化：メインスレッドをブロックさせない設計とは？**

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