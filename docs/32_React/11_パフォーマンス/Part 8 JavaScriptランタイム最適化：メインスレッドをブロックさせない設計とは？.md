---
title: "[Frontend Performance - Part 8] JavaScriptランタイム最適化：メインスレッドをブロックさせない設計とは？"
source: "https://qiita.com/tuanphan/items/d109bfd9a11bfbf2c100"
author:
  - "[[tuanphan]]"
published: 2026-05-04
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 0. はじめに：Part 5・6・7のおさらい 1. 問題の本質：なぜ「速い」だけではダメなのか 2. 基本原則：協調的譲歩（Coop..."
tags:
  - "clippings"
---
[![ChatGPT Image May 4, 2026, 08_32_31 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/b1e04300-d9a7-421a-9732-4e051af0ac66.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fb1e04300-d9a7-421a-9732-4e051af0ac66.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=86ddae121a7716c368a2458a626669a9)

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 0\. はじめに：Part 5・6・7のおさらい

本連載のこれまでを簡単に振り返ります。

- **Part 5** ： **Event Loop** の仕組み – Microtask（全て実行）→ レンダリング → Macrotask（1つ）という順序を理解しました。Microtaskが無限に続くとレンダリングが永遠に来ない危険性も学びました。
- **Part 6** ： **メインスレッドのブロッキング** – JavaScriptがメインスレッドを占有すると、UIの描画やイベント処理が止まり、カクつきや遅延が発生することを確認しました。
- **Part 7** ： **Long Taskの分解** – 50msを超えるタスクはユーザー体験を壊すため、チャンク分割や `requestIdleCallback` による譲り渡しが必要だと学びました。

> 🚀 **Part 8のゴール** ：  
> これらの知識を統合し、「 **メインスレッドを決してブロックしないJavaScriptランタイム設計** 」を実現するための実践戦略を提供します。

---

## 1\. 問題の本質：なぜ「速い」だけではダメなのか

処理速度が速くても、 **タイミング** が悪ければUXは壊れます。

例えば、80msかかる計算があったとします。この80msの間にブラウザは約 **5フレーム（16.6ms × 5）** を描画できません。結果的にユーザーは「スクロールが引っかかる」「キーボード入力が遅れる」と感じます。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__c45fc4a5ec90e8371ff4af138422d7da" frameborder="0" height="349"></iframe>

**結論** ：速さよりも「 **メインスレッドを細かく解放する設計** 」が重要です。

---

## 2\. 基本原則：協調的譲歩（Cooperative Yielding）

JavaScriptはプリエンプション（強制割り込み）をサポートしていません。つまり、 **自ら譲らない限り、いつまでもメインスレッドを占有し続けます** 。

そこで重要になるのが **協調的譲歩 (Cooperative Yielding)** です。

> 処理の途中であっても、意識的にメインスレッドを解放し、ブラウザに描画やイベント処理の機会を与える。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__fb016a74536ac0e3b33817c53d1289f6" frameborder="0" height="271"></iframe>

---

## 3\. 戦略1：Yielding（処理の譲り渡し）

**3.1. `setTimeout(fn, 0)` による基本的な譲歩**

最も簡単な方法。コールバックを **Macrotaskキュー** に入れることで、現在のタスク終了後に一旦メインスレッドを解放します。

```javascript
function processChunk(items, index = 0, chunkSize = 100) {
  const end = Math.min(index + chunkSize, items.length);
  for (let i = index; i < end; i++) {
    heavyWork(items[i]);
  }
  if (end < items.length) {
    setTimeout(() => processChunk(items, end, chunkSize), 0);
  }
}
```

**3.2. `requestIdleCallback` による高度な譲歩（推奨）**

ブラウザが **アイドル状態** のときにのみコールバックを実行します。描画やユーザーイベントを優先できるため、UXに優しいです。

```javascript
function processInIdleChunks(items, processItem, chunkSize = 20) {
  let index = 0;

  function run(deadline) {
    while (index < items.length && deadline.timeRemaining() > 0) {
      const end = Math.min(index + chunkSize, items.length);
      for (let i = index; i < end; i++) {
        processItem(items[i]);
      }
      index = end;
    }
    if (index < items.length) {
      requestIdleCallback(run);
    }
  }

  requestIdleCallback(run);
}
```

> ✅ `deadline.timeRemaining()` が0になったらその時点で中断し、次のアイドル時間に処理を継続します。

---

## 4\. 戦略2：タスクの優先順位付け

すべてのタスクを同じように扱うべきではありません。ユーザーインタラクションは最優先、アナリティクスやロギングは後回しにできます。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__bf262d63bca417fd1f70510c3ab351de" frameborder="0" height="228"></iframe>

**実装例：クリック時の優先度制御**

```javascript
button.addEventListener('click', () => {
  // まず即座にUIフィードバック（スピナー表示など）
  showLoadingSpinner();
  
  // 重い計算は次のイベントループに回す
  setTimeout(() => {
    const result = heavyComputation();
    updateUI(result);
  }, 0);
});
```

**ポイント** ：ユーザーは「即座に反応した」と感じるため、実際の処理が少し遅れてもストレスが少なくなります。

---

## 5\. 戦略3：Web Workerでメインスレッドから逃がす

どうしても分割できない重い処理（画像処理、暗号化、巨大な配列のソートなど）は、 **Web Worker** という別スレッドに任せましょう。

```javascript
// main.js
const worker = new Worker('heavy-task.js');
worker.postMessage({ data: hugeArray });

worker.onmessage = (e) => {
  console.log('結果:', e.data);
  renderResult(e.data);
};

// heavy-task.js
self.onmessage = (e) => {
  const { data } = e.data;
  // 重い同期処理
  const result = data.map(x => extremelyHeavyFunction(x));
  self.postMessage(result);
};
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__cfeb355fa9efbd4e84cfe554f4d25534" frameborder="0" height="481"></iframe>

> ⚠️ WorkerはDOMを直接操作できません。結果を受け取ったらメインスレッドで描画します。

---

## 6\. 戦略4：Scheduler API（未来の標準）

現在実験的な **Scheduler API** は、タスクの優先度を細かく指定できる次世代の仕組みです。

```javascript
// ユーザーブロッキング（最高優先度）
scheduler.postTask(() => handleClick(), { priority: 'user-blocking' });

// ユーザー可視（アニメーションなど）
scheduler.postTask(updateAnimation, { priority: 'user-visible' });

// バックグラウンド（ログ送信など）
scheduler.postTask(sendAnalytics, { priority: 'background' });

// 明示的に譲る
await scheduler.yield();
```

まだ広くは使えませんが、近い将来スタンダードになるでしょう。

---

## 7\. 実践例：50,000件のリアルタイム検索をスムーズに

**シナリオ**  
50,000件の商品データを持つ表があり、ユーザーが入力するたびにリアルタイムで絞り込み表示する。

**❌ 悪い例（メインスレッドをブロック）**

```javascript
input.addEventListener('input', (e) => {
  const keyword = e.target.value;
  const filtered = hugeList.filter(item => item.name.includes(keyword));
  renderAllItems(filtered); // 50,000件のDOM操作 → 確実に固まる
});
```

**✅ 良い例（Debounce + Web Worker + 仮想スクロール）**

```javascript
let abortController = null;
let debounceTimer = null;

input.addEventListener('input', (e) => {
  const keyword = e.target.value;
  
  // 前回のリクエストをキャンセル
  if (abortController) abortController.abort();
  abortController = new AbortController();
  
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    showSpinner();
    filterWorker.postMessage({ 
      list: hugeList, 
      keyword,
      signal: abortController.signal 
    });
  }, 300);
});

filterWorker.onmessage = (e) => {
  const filtered = e.data; // 絞り込み結果（例：5,000件）
  
  // 実際に描画するのは最初の20件だけ（仮想スクロール）
  requestAnimationFrame(() => {
    virtualScroller.update(filtered);
    hideSpinner();
  });
};
```

**結果** ：

- 入力中もカクつかない。
- フィルタリングはWorkerで実行され、メインスレッドは軽快。
- 描画は必要な分だけ（仮想スクロール）なのでDOM負荷も小さい。

---

## 8\. シニアエンジニア向けチェックリスト

**✅ ランタイム設計**

- ループが1000回を超える場合は **チャンク分割** または **Worker** を検討している。
- `while(true)` や無限の `Promise.then` 再帰がない。
- ログや解析などのバックグラウンド処理は `requestIdleCallback` に任せている。

**✅ イベント処理**

- `scroll` / `mousemove` は `requestAnimationFrame` + throttle している。
- `input` / `change` は 200ms～300ms の debounce を適用している。
- スタイル変更の直後に `offsetHeight` などのレイアウトリードをしていない（レイアウトスラッシング防止）。

**✅ Web Workerの活用**

- 大きなJSONのパース、複雑な計算、画像処理はWorkerで行っている。
- Worker非対応環境のフォールバックがある。
- `transferable objects` （ArrayBufferなど）を使ってメモリ効率を高めている。

**✅ モニタリング**

- `PerformanceObserver` でLong Taskを監視している。
- 実際のユーザー環境でのFPSやINPを測定している。
- 実験的なScheduler APIを試している（可能であれば）。

---

## 9\. まとめ

**主要戦略まとめ表**

| 戦略 | 実装方法 | 適したユースケース |
| --- | --- | --- |
| **基本的な譲歩** | `setTimeout(fn, 0)` によるチャンク | そこそこ長いが優先度の高くない処理 |
| **アイドル時譲歩** | `requestIdleCallback` | ロギング、プリフェッチ、バックグラウンド処理 |
| **優先順位付け** | debounce, throttle, rAF | ユーザーイベント、アニメーション |
| **メインスレッド除外** | Web Worker, OffscreenCanvas | 計算負荷の極めて高い処理 |
| **未来の標準** | Scheduler API（priority指定） | きめ細かい優先度制御 |

> 💡 **パフォーマンス改善の本質**  
> 「関数を速くすること」ではなく、「 **メインスレッドを長時間占有しないタイムラインを設計すること** 」です。

**50msルール** を常に意識し、長くなる処理は必ず分割・譲歩・Worker化を徹底しましょう。

---

👉 **次回予告**  
**\[Frontend Performance - Part 9\] JavaScript は速いのに、なぜ React は遅いのか？再レンダリングを理解する**

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