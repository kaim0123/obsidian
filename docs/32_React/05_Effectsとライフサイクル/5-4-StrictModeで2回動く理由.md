# 5-4 StrictModeで2回動く理由（開発時）

## 🎯 この章で学ぶこと

- `<StrictMode>` の役割を理解できます
- 開発時にEffectが2回走るのが「バグではない」ことが分かります
- 2回走る仕組みが「クリーンアップの正しさを試すテスト」であることを納得できます
- 本番ビルドでは1回しか走らないことを知っています
- 「2回走っても大丈夫なEffect」を書けるようになります

## 📖 概念の説明

### StrictMode とは

`React.StrictMode` は **開発時だけ有効になる、Reactの「健康診断モード」** です。`create-react-app` や Vite でプロジェクトを作ると、デフォルトでこんなコードが入っています。

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

これで包まれたコンポーネント以下では、Reactが **意図的に「いろいろ厳しめに」動作させて、バグの芽を見つけてくれます**。

例えるなら、**運転免許の教習所** のようなものです。普段の道路（本番）では1回しかブレーキを踏まないところを、教習所（開発時）ではあえて2回踏ませて「ちゃんと止まれるね」と確認しているイメージです。

### 何が「2回」走るの？

StrictModeで開発しているとき、以下のことが **2回呼び出されます**。

- コンポーネント関数の本体
- `useState` の初期化関数
- `useReducer` のリデューサ
- `useEffect` のセットアップとクリーンアップ

特に目につくのが **`useEffect` の挙動** です。マウント時に、

1. Effectが走る（セットアップ）
2. クリーンアップが走る
3. もう一度Effectが走る（セットアップ）

という流れになります。`console.log('hello')` をEffectに書いてマウントすると、なぜか2回出力される、という現象がこれです。

### なぜわざわざ2回走らせるの？

**「もう一度マウントされたとしても、ちゃんと動くか？」をテストするため** です。

実際のアプリでは、ユーザーが画面を行ったり来たりしてコンポーネントが何度もマウント・アンマウントされます。そのたびにEffectが正しくクリーンアップして、正しくセットアップし直せるかが大事です。

StrictModeはマウント直後に **わざとアンマウントとマウントを再現** することで、

- クリーンアップ関数が書かれているか？
- クリーンアップが正しく動くか？
- 二重に登録されたりしないか？

をチェックしてくれます。これは **未来のあなたへの保険** だと思ってください。

### 本番ではどうなる？

**本番ビルドでは1回しか走りません。** `npm run build` でビルドした成果物では、StrictModeのチェックは無効化されます。なので、

- 開発：2回走る（テスト目的）
- 本番：1回走る（通常動作）

ということになります。「2回走るからユーザー体験に影響するのでは？」と心配する必要はありません。

### 用語の整理

- **StrictMode**：Reactが開発時に行う厳格チェックモード
- **マウント**：コンポーネントが画面に登場すること
- **アンマウント**：コンポーネントが画面から消えること
- **再マウント**：一度消えてからまた登場すること

## 💻 コード例

### 例1：2回走るのを観察する

```jsx
import { useEffect } from 'react';

function Hello() {
  useEffect(() => {
    console.log('セットアップ');
    return () => {
      console.log('クリーンアップ');
    };
  }, []);

  return <h1>Hello</h1>;
}
```

これをStrictModeで実行すると、コンソールには次のように出ます。

```
セットアップ
クリーンアップ
セットアップ
```

「あれ、なんで2回？」となるのが、この現象です。**バグではなく、仕様** です。

### 例2：2回走っても問題ないEffect（良い例）

```jsx
import { useEffect, useState } from 'react';

function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id); // ← これがあるから2回走っても安全
  }, []);

  return <div>{time.toLocaleTimeString()}</div>;
}
```

クリーンアップでタイマーを止めているので、2回走っても **タイマーが2つ並走することはありません**。

### 例3：2回走ると問題が出るEffect（悪い例）

```jsx
// ❌ クリーンアップがないと、StrictModeで重複が露見する
useEffect(() => {
  // ログを「送信」する処理
  fetch('/api/page-view', { method: 'POST' });
}, []);
```

これだとStrictMode下で **POSTリクエストが2回送られます**。本番では1回ですが、「2回走ってもOK」な書き方に直すべきだ、というシグナルです。

修正例：

```jsx
useEffect(() => {
  let active = true;
  // 何らかの方法で1回だけ送るよう保証
  if (active) {
    fetch('/api/page-view', { method: 'POST' });
  }
  return () => { active = false; };
}, []);
```

または、そもそも **イベントハンドラ** で送るべき処理かを考え直しましょう。

### 例4：StrictModeを部分的に外したい場合

```jsx
// 推奨されないが、どうしてもの場合は外側で囲わない
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(<App />); // StrictModeなし
```

ただし、**外す前に「なぜ2回走ると困るのか」を必ず考えてください**。多くの場合、コードに改善点があります。

### 例5：StrictModeの典型的な指摘

```jsx
// マウント時のフェッチ
useEffect(() => {
  fetch('/api/data')
    .then(r => r.json())
    .then(setData);
}, []);
```

これだと開発時にfetchが2回走ります。AbortControllerを入れると2回目で前のを中断できるので、StrictModeのチェックに通ります。

```jsx
useEffect(() => {
  const ctrl = new AbortController();
  fetch('/api/data', { signal: ctrl.signal })
    .then(r => r.json())
    .then(setData)
    .catch(e => { if (e.name !== 'AbortError') throw e; });
  return () => ctrl.abort();
}, []);
```

これは [[../07_データ取得/7-4-AbortControllerでキャンセル]] で詳しく扱います。

## ❌ よくある間違い

### 1. 「2回走るのは絶対に防ぐべき」と勘違い

これは仕様であり、防ぐべきは **「2回走ると壊れるEffectの書き方」** です。Effect自体を1回にしようとがんばるのではなく、「2回走っても問題ないように書く」のが正解です。

### 2. StrictModeを外して見ないふり

「2回走るのが嫌だから」とStrictModeを外すのは、**健康診断を断る** ようなものです。本番でも同じ問題が顕在化する可能性があります。

### 3. 初期化系のEffectで状態を「足し算」する

```jsx
// ❌ 2回走るとカウントが2倍になる
useEffect(() => {
  setCount(c => c + 1);
}, []);
```

「マウントしたら1足す」みたいな処理は、2回走ると壊れます。設計を見直しましょう。

### 4. POSTやログ送信を素朴にEffectに書く

```jsx
// ❌ StrictMode下で2回送られる
useEffect(() => {
  fetch('/api/log', { method: 'POST', body: JSON.stringify({ event: 'view' }) });
}, []);
```

冪等（べきとう：何回呼んでも結果が同じ）にするか、あるいは別の場所（イベントハンドラ）で送るのが理想です。

## ✅ ベストプラクティス

1. **「2回走ってもOK」なEffectを書く**：これは設計の質を上げる良い練習です。
2. **クリーンアップを必ず書く**：StrictModeはこれを矯正してくれます。
3. **冪等性を意識する**：同じ処理を何度実行しても、結果が同じになる作りを目指す。
4. **POSTや副作用の重い処理はイベントハンドラで**：Effectに書くのは「同期したい状態」だけにする。
5. **StrictModeを外さない**：たとえ気持ち悪くても、本番のバグを未然に防いでくれます。

## 🔬 実践演習

### お題：StrictModeを体感する

```jsx
useEffect(() => {
  console.log('mount');
  return () => console.log('unmount');
}, []);
```

このコードを書き、StrictModeあり・なしで挙動の違いを観察してみましょう。

### 発展課題

- マウント時にカウントを `+1` するEffectをStrictModeで動かして、なぜ2倍になるか説明してみましょう
- それを「2回走っても問題ない」形に書き換えてみましょう（ヒント：`useRef` で「初回だけ」フラグを持つなど）

## 📝 まとめ

- StrictModeは **開発時だけ** 有効な厳格モードです
- Effectが2回走るのは、クリーンアップの正しさを試すテストです
- 本番ビルドでは1回しか走りません
- 「2回走ると壊れる書き方」は本番でもいずれ問題になります
- 解決策はEffectを「冪等」にすること、クリーンアップを書くこと

## 🔗 関連ページ

- [[5-1-useEffectの役割]]
- [[5-3-クリーンアップ]]
- [[5-5-よくあるバグ集]]
- [[5-6-アンマウント後のsetState対策]]
- [[../07_データ取得/7-4-AbortControllerでキャンセル]]
