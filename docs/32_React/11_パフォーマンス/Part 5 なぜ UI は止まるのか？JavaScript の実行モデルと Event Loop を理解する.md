---
title: "[Frontend Performance - Part 5] なぜ UI は止まるのか？JavaScript の実行モデルと Event Loop を理解する"
source: "https://qiita.com/tuanphan/items/8c4a7ad8271232ae9d30"
author:
  - "[[tuanphan]]"
published: 2026-04-23
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 問題：UIがカクつく・止まるのはなぜ？ JavaScriptはシングルスレッド – その意味とは？ Call Stack – すべて..."
tags:
  - "clippings"
---
[![ChatGPT Image Apr 23, 2026, 10_30_14 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/162f03af-09fb-410f-a2f2-48a01feb76f8.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F162f03af-09fb-410f-a2f2-48a01feb76f8.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=2b69f177f4736a155ff4d241ead443ec)

---

> 📝 注意  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 1\. 問題：UIがカクつく・止まるのはなぜ？

こんな経験はありませんか？

- ボタンをクリックしたのに **数秒後にしか反応しない**
- スクロールが **ガクガクする**
- テキスト入力が **遅れる**

タスクマネージャーを見ると **CPUはそんなに忙しくない** 。

> **本当の原因：** JavaScriptが **メインスレッド** を長時間占有しているため、ブラウザがイベント処理や描画を実行できない。

---

## 2\. JavaScriptはシングルスレッド – その意味とは？

ブラウザ環境のJavaScriptは **たった一つのスレッド** = **メインスレッド** で動きます。  
このメインスレッドが **全ての仕事** を引き受けます：

- JavaScriptの実行（コールバック・Promiseなど）
- イベント処理（クリック・スクロール・入力）
- UIの描画（スタイル・レイアウト・ペイント・コンポジット）

👉 **重要な帰結：**

> JavaScriptがメインスレッドを占有している間、ブラウザはそれ以外の何もできない。  
> つまり **JSがスレッドを解放するまでUIは更新されない** 。

---

## 3\. Call Stack – すべてはここから始まる

ブラウザは **Call Stack** を使って現在実行中の関数を管理します。  
関数が呼ばれるとフレームが積まれ、終わると取り除かれます。

```javascript
function first() {
  second();
}
function second() {
  console.log('Hello');
}
first();
```

Call Stackの変化：

```text
[ first() ]
  → [ first(), second() ]
    → [ first(), second(), console.log() ]
      (console.log 終了)
    → [ first(), second() ]
  → [ first() ]
→ [ ]
```

**絶対ルール：**  
ブラウザが介入（レンダリング・イベント処理・新タスク実行）できるのは **Call Stackが完全に空になったときだけ** 。

---

## 4\. Web APIと非同期タスク

`setTimeout` 、 `fetch` 、 `addEventListener` などは **ブラウザが提供するWeb API** であり、JSコアには属しません。

```javascript
setTimeout(() => console.log('あとで実行'), 0);
```

実行の流れ：

1. `setTimeout` 呼び出し → コールバックとタイマーをWeb APIに渡す
2. タイマー完了 → コールバックが **タスクキュー（マクロタスクキュー）** に入る
3. Call Stack が空 → Event Loop がキューからコールバックを取り出し、スタックに積む

---

## 5\. Event Loop – タスクの優先スケジューラ

> **Event Loopとは「タスクの優先順位付きスケジューラ」である。**  
> JavaScriptの非同期は「並列処理」ではなく「順番待ちの制御」に過ぎない。

**全体像ダイアグラム**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__9d426323b8e37c5c4d7b3e1c6c4f75e9" frameborder="0" height="670"></iframe>

**最重要ルール（目立たせる）：**

> 🔁 **Call Stack → Microtask（全部） → レンダリング機会 → Macrotask（1つ）**  
> つまり **Microtaskは「全部」実行されるまで、次のステップに進まない** 。

---

## 6\. Microtask vs Macrotask – 非同期にも順位がある

**🟡 Macrotask（タスクキュー）**

- `setTimeout` 、 `setInterval`
- DOMイベント（click、scrollなど）
- I/O（fetch、ファイル読み取り）

**🔵 Microtask（マイクロタスクキュー）**

- `Promise.then` / `catch` / `finally`
- `queueMicrotask`
- `MutationObserver`

**黄金ルール**

> Call Stackが空になった直後、 **Microtaskキューにある全てのマイクロタスク** が、次のマクロタスクより先に実行される。  
> もしマイクロタスクが次々に新しいマイクロタスクをキューに入れると、 **マクロタスクもレンダリングも永遠に実行されない** 。

**具体例で見る実行順序**

```javascript
console.log('1. 同期コード');

setTimeout(() => console.log('4. Macrotask'), 0);

Promise.resolve()
  .then(() => console.log('2. Microtask 1'))
  .then(() => console.log('3. Microtask 2'));

// 出力：
// 1. 同期コード
// 2. Microtask 1
// 3. Microtask 2
// 4. Macrotask
```

**Mermaidによるシミュレーション**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__628123973743a2c258b75888faf18e2b" frameborder="0" height="653"></iframe>

---

## 7\. レンダリングとEvent Loop – UIはいつ描画されるのか？

ブラウザがレンダリングを実行する条件：

- Call Stack が空
- Microtask Queue が **完全に空**
- ブラウザに「チャンス」がある（通常は次のマクロタスクを取る前、または画面のリフレッシュレートに合わせたタイミング）

> **まとめ：** Microtaskキューが永遠に空にならなければ、 **レンダリングも永遠に起こらない** 。

**無限Microtaskの罠**

```javascript
function infiniteMicrotask() {
  Promise.resolve().then(infiniteMicrotask);
}
infiniteMicrotask();
```

- スタック空 → 最初のマイクロタスクが実行 → さらに新しいマイクロタスクをキューイング
- Microtaskキューが **空にならない** → Event Loopはレンダリングフェーズに進めない
- 結果：CPUはアイドルなのに **ページが完全にフリーズ**

> 💡 `while(true) {}` とは異なる（後者はCall Stackを直接占有）が、どちらもUIブロックの原因。

**フレーム予算（16ms）の話**

> 💡 **1フレーム = 約16ms（60fps）**  
> この時間内に処理が終わらないと → **フレーム落ち（jank）** が発生する。

**requestAnimationFrame はどこで動くのか？**

`requestAnimationFrame` (rAF) のコールバックは **通常のタスクキュー（マクロタスク）やマイクロタスクキューとは異なる、専用のキュー** で管理されます。

**実際の優先順位（1フレーム内）** ：

1. 1つ以上のマクロタスクを実行（それぞれの後でマイクロタスクを処理）
2. レンダリング機会が来たら、 **rAFコールバックをすべて実行** （このときも、各コールバック後にマイクロタスクが処理される）
3. その後、 **実際のレンダリング（style, layout, paint, composite）** を実行
4. 次のマクロタスクへ

> 📌 つまり：  
> **Macrotask（の一部） → Microtask → rAF → Render → 次のMacrotask**  
> という順序になります。  
> **「Microtask → rAF → Render → Macrotask」ではない** ので注意してください。

この違いはパフォーマンスチューニングで重要です。たとえばrAF内でDOMを変更しても、その変更は **同じフレーム内のレンダリング** に反映されます。

---

## 8\. UIをブロックするよくある間違い（実例付き）

**❌ 1. メインスレッドで重いループ**

```javascript
let total = 0;
for (let i = 0; i < 1e9; i++) total += i;
```

→ Call Stackが数秒間占有 → クリックも描画も応答なし。

**❌ 2. 無限Promiseチェーン（無限マイクロタスク）**

上の例と同じ。非同期に見えてレンダリングを完全にブロック。

**❌ 3. 大きすぎる同期的処理**

- 数MBのJSONを `JSON.parse`
- 10万要素の `sort`
- 1万行のリストを `innerHTML` で描画

**❌ 4. `requestAnimationFrame` で重い処理をやりすぎる**

rAFコールバックが16msを超えるとフレーム落ち。

**❌ 5. Reactで巨大リストを一気にレンダリング**

```jsx
// 悪い例：2000件を一度にレンダリング
{bigList.map(item => <ComplexItem key={item.id} />)}
```

→ 仮想DOMのdiff + commit がメインスレッドを長時間ブロック → UIカクつき。

---

## 9\. UIブロックを回避する方法 – 実戦テクニック

**✅ 1. タスクを細分化（チャンク処理）+ `setTimeout`**

```javascript
function processChunk(items, index = 0) {
  const chunkSize = 100;
  const end = Math.min(index + chunkSize, items.length);
  for (let i = index; i < end; i++) {
    // 各要素の処理
  }
  if (end < items.length) {
    setTimeout(() => processChunk(items, end), 0);
  }
}
```

> `setTimeout(fn, 0)` でメインスレッドを解放 → チャンク間にレンダリングが入る余地。

**✅ 2. 緊急度の低い処理は `requestIdleCallback`**

```javascript
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && moreWork()) {
    doOneUnit();
  }
});
```

**✅ 3. 重い処理はWeb Workerに移す**

```javascript
const worker = new Worker('heavy.js');
worker.postMessage(largeData);
worker.onmessage = (e) => console.log(e.data);
```

**✅ 4. 無限マイクロタスクを避ける**

```javascript
function safeRecursion(data) {
  if (!data.length) return;
  process(data.pop());
  queueMicrotask(() => safeRecursion(data));
}
```

**✅ 5. アニメーションは `requestAnimationFrame` を正しく使う**

- DOM/style変更はrAF内で
- rAF内の処理は10ms以内に収める（16msを守る）

---

## 10\. まとめ – パフォーマンス改善の本質

| 概念 | 役割 |
| --- | --- |
| シングルスレッド / メイン | JS・イベント・レンダリングが全て同じスレッド → こまめに譲る |
| Call Stack | 空になるまで他の仕事はできない |
| Event Loop | タスクの優先スケジューラ |
| Microtask | 優先度最高。無限に続くとレンダリング停止 |
| Macrotask | Microtask完了後に実行。間にレンダリングの余地あり |
| Render | Stack空 + Microtask空 のときに発生するチャンス |
| requestAnimationFrame | レンダリング直前（かつMicrotask後）に実行される専用コールバック |

> 💡 **パフォーマンス改善とは「処理を速くすること」ではなく、  
> 「メインスレッドを占有しない設計」をすることである。**

---

👉 **次回予告**  
**\[Frontend Performance - Part 6\] メインスレッドとブロッキング：なぜUIは止まるのか**

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