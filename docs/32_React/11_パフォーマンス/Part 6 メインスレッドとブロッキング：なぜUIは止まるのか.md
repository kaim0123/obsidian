---
title: "[Frontend Performance - Part 6] メインスレッドとブロッキング：なぜUIは止まるのか"
source: "https://qiita.com/tuanphan/items/20fe25fc0cda3137dba2"
author:
  - "[[tuanphan]]"
published: 2026-04-23
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 問題：「全部速いのに UI が重い」 メインスレッド – ブラウザの「一方通行」道路 メインスレッドを奪う3つの隠れた敵 実戦例：悪..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 23, 2026, 04_31_48 PM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/a232db8e-8ca5-4fa2-a0d6-4a8766e36cd0.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fa232db8e-8ca5-4fa2-a0d6-4a8766e36cd0.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=0b6a43c81cd9728ad19ea4474b4ff904)

---

> 📝 注意  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 1\. 問題：「全部速いのに UI が重い」

こんな経験はありませんか？

- キーボードを **カタカタ** 打つのに、文字が **もっさり** 表示される
- **スクロール** がガクガクして、まるで古いゲームのよう
- アニメーションが **一瞬止まって** から再開する

DevTools で調べると：

- ネットワークは空いている
- FPS は 60 から 20 に落ちている
- **メインスレッドが長時間占有** されている（パフォーマンスタブの長い赤いバー）

> **皮肉な事実：** 処理自体は 100ms しかかからなくても、その 100ms が **連続してメインスレッドを離さない** なら、ユーザーはラグを感じます。

**パート5** では Event Loop の仕組み（タスクの待ち行列）を学びました。  
**パート6** では次の問いに答えます：

> *なぜ「短いタスク」でもフレームが落ちるのか？ どうやってブラウザに「呼吸」させるのか？*

---

## 2\. メインスレッド – ブラウザの「一方通行」道路

メインスレッドは **お祭り会場への狭い通路** のようなものです。 **全ての処理** がここを通ります。

| 処理区分 | 具体例 |
| --- | --- |
| JavaScript | クリック処理、計算、API 呼び出し |
| Style | CSS セレクタの解決、スタイル計算 |
| Layout (reflow) | 各要素のサイズ・位置を確定 |
| Paint | ピクセルをレイヤーに描画 |
| Composite | レイヤーを合成して画面表示 |

**不変のルール：**

> 同時にできることは **1 つだけ** 。他の処理は待ち行列へ。

**正常なフレームのタイムライン**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__178cab8e410218d04e32a08af3f887ab" frameborder="0" height="277"></iframe>

**Long Task によるフレーム破壊**

JS が 50ms 以上占有 → Layout / Paint が待たされる → フレーム脱落。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__6bb45b4d93cc1d7d12c2e41b8dd3f7a1" frameborder="0" height="205"></iframe>

---

## 3\. メインスレッドを奪う3つの隠れた敵

**3.1. Long Task – 長すぎる処理**

**50ms 以上** メインスレッドを占有するタスク。  
原因：巨大ループ、巨大 JSON のパース、大量描画など。

```javascript
// ❌ Long Task の典型例
function processBigArray(arr) {
  for (let i = 0; i < arr.length; i++) {
    doSomething(arr[i]); // 10万回ループ → 100ms
  }
}
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__0cb0b3b2df3305194ad1a17d017ddcea" frameborder="0" height="205"></iframe>

**3.2. Layout Thrashing – レイアウト強制読み出し**

スタイル変更の **直後** に `offsetHeight` / `getBoundingClientRect()` などのレイアウト情報を **読み出す** と、ブラウザはその場でレイアウトを強制計算します。

```javascript
// ❌ Layout Thrashing
boxes.forEach(box => {
  box.style.width = '100px';          // 書き込み
  const height = box.offsetHeight;    // 読み出し → レイアウト強制
  box.style.height = height + 'px';   // さらに書き込み
});
```

読み出しのたびに **「ジャーク」** が発生し、スレッドが詰まります。

**3.3. Render Storm – 再描画の嵐**

短時間に状態変更が多すぎると、ブラウザは **レイアウト＋描画** を連続して強制されます。

```javascript
// ❌ 1万回の再描画 (React)
items.forEach(item => {
  setItems(prev => [...prev, item]); // 毎回レンダリング
});
```

---

## 4\. 実戦例：悪い例 → 良い例 → より良い例

**4.1. スクロール時に大量データを処理する**

**シナリオ：** スクロールのたびに5000件のデータを処理して UI 更新。

**❌ 悪い例 – 完全ブロック**

```javascript
function onScroll() {
  const results = heavyProcess(allItems); // 300ms
  updateUI(results);
}
```

**✅ 良い例 – `setTimeout` で譲る**

```javascript
function onScroll() {
  setTimeout(() => {
    const results = heavyProcess(allItems);
    updateUI(results);
  }, 0);
}
```

**✅✅ より良い例 – `requestIdleCallback` でチャンク処理**

```javascript
function processChunk(items, index = 0) {
  const chunk = items.slice(index, index + 100);
  doWork(chunk);
  if (index + 100 < items.length) {
    requestIdleCallback(() => processChunk(items, index + 100));
  } else {
    updateUI();
  }
}
```

**チャンク処理の流れ**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__a3db44cbc343aa880a00a1dd26d039e2" frameborder="0" height="181"></iframe>

**4.2. offsetHeight を読むとアニメーションがカクつく**

**シナリオ：** マウスに追従するボックス。

**❌ 悪い例**

```javascript
function moveBox(x, y) {
  box.style.transform = \`translate(${x}px, ${y}px)\`;
  const rect = box.getBoundingClientRect(); // レイアウト強制
  console.log(rect);
}
```

**✅ 良い例 – レイアウト読み出しを避ける**

```javascript
function moveBox(x, y) {
  box.style.transform = \`translate(${x}px, ${y}px)\`;
  // レイアウト情報は読まない（または後で読む）
}
```

**4.3. scroll イベント – フレームドロップの殺し屋**

**❌ 悪い例 – 毎回重い処理**

```javascript
window.addEventListener('scroll', () => {
  updateHeavyWidget();
});
```

**✅ 良い例 – `requestAnimationFrame` + スロットリング**

```javascript
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHeavyWidget();
      ticking = false;
    });
    ticking = true;
  }
});
```

---

## 5\. シニアエンジニアでも見落としがちな知見

**50ms ルールと Long Task API**

Google の **RAIL モデル** より：

> **全てのタスクは 50ms 以内** に収めること。超えるとユーザーは遅延を感じる。

ブラウザは Long Task を検出する API を提供しています。

```javascript
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(\`[LONG TASK] ${entry.duration}ms - ${entry.attribution?.[0]?.containerName || 'unknown'}\`);
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

これを実際のアプリで実行すると、多くの驚きがあるはずです。

**パフォーマンス ≒ 速度ではない**

> 100万件の合計を **10ms** で計算できても、その10msが **スクロール中** に発生すれば、あなたはフレームを落としました。

**正しい考え方：**

> パフォーマンスとは **ユーザー体験を損なわずに処理を完了する能力** である。

---

## 6\. 毎日使えるメインスレッド対策チェックリスト

コードレビューや自己チェックにどうぞ。

**✅ JavaScript**

- 1000件以上の同期的ループがない（チャンク処理を使う）
- 50ms 超えるタスクは細分化 or Web Worker
- バックグラウンド処理には `requestIdleCallback`
- Long Task API で定期的に監視

**✅ Rendering**

- スタイル変更の直後にレイアウト読み出しをしない（Layout Thrashing 禁止）
- DOM 更新はバッチ処理（DocumentFragment や仮想 DOM を活用）
- 不要な再描画を避ける（React: `memo`, `useMemo` ）
- アニメーションは `top` / `left` ではなく `transform` を使う

**✅ イベント**

- `scroll` / `resize` / `mousemove` は適切に間引き（debounce/throttle）
- イベントハンドラ内で重い処理を直接呼ばない
- アニメーションや描画変更は `requestAnimationFrame` 内で

**✅ アーキテクチャ**

- 長いリストは仮想化（react-window / vue-virtual-scroller）
- コード分割 – 初回ロードで全部読み込まない
- 重要でないコンポーネントは遅延ロード

---

## 7\. 最終まとめ

**パート5** では **Event Loop** （タスクの待ち行列）を学びました。  
**パート6** では **タスクがメインスレッドを占有し続けると何が起こるか** を掘り下げました。

> ✨ **成功の鍵：**  
> メインスレッドを **ブラウザで最も貴重なリソース** として扱いましょう。  
> 決して「マラソン」させてはいけません。 **短いスプリント** と **休憩** を繰り返させるのです。

👉 **次回予告**  
**\[Frontend Performance - Part 7\] Long Task を分解する：なぜ50msがUXを壊すのか？**

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