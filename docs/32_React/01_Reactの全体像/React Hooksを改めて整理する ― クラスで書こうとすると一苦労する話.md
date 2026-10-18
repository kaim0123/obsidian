---
title: "React Hooksを改めて整理する ― クラスで書こうとすると一苦労する話"
source: "https://zenn.dev/shutingstar/articles/a50d4466a12a5b"
author:
published: 2026-04-13
created: 2026-05-09
description:
tags:
  - "clippings"
---

## 詳しい要約

**テーマ：useState / useEffect / useContext の役割と、クラスで書いた場合との比較**

よく使う3つの hooks を「メモ帳」「描画後のトリガー」「木の中のホワイトボード」というイメージで整理し、同じことをクラスコンポーネントで書くと行数も認知負荷も大きく増えることを示した記事。hooks のおかげで関数コンポーネントのまま状態もライフサイクルも扱える、というのが結論。

---

### hooks 以前（クラスの時代）

- 状態を持たない見た目だけのコンポーネントは関数、状態を持つものは **クラス**（`class extends React.Component`）で書くルールだった。
- `this.state`、`this.handleClick.bind(this)` など **this の世話** に手間を取られていた。

### useState ― 小さなメモ帳

- `const [wavelength, setWavelength] = useState<number>(266)` で初期値付きのメモ帳を作り、読む・書き換えるができる。
- setter で更新すると React が自動で再レンダリングする（DOM を直接操作しなくてよい）。
- クラスでは constructor・`setState`・bind が必要になる。

### useEffect ― 描画後に動くトリガー

- 「描画が終わったあとにやりたい処理」を書く場所（マウント時のデータ取得など）。
- 例：`sampleId` が変わるたびに fetch し、クリーンアップ関数で `cancelled = true` として古いリクエストの結果を捨てる。
- **依存配列** の意味：

| 第二引数 | 実行タイミング |
| --- | --- |
| `[]` | マウント時に1回だけ |
| `[sampleId]` | sampleId が変わったとき |
| 省略 | 毎レンダー（基本避ける） |

- 依存配列に何でも入れると無限ループになる点に注意。

### useContext ― props バケツリレーの解消

- Lab → Bench → Apparatus → Display と、使わない中間コンポーネントまで値を手渡しする **prop drilling** を避けられる。
- 手順：型を決める → `createContext` → Provider で囲む → `useExperiment()` のようなヘルパーで取り出す（Provider 外で使ったらエラーを投げる）。
- 中間コンポーネントは値を知らなくてよくなり、責務が軽くなる。

### クラスで全部書くと

| やりたいこと | hooks | クラス |
| --- | --- | --- |
| 状態を持つ | `useState` 1行 | constructor + setState + bind |
| マウント時に取得 | `useEffect(..., [])` | `componentDidMount` |
| props 変化で再取得 | `useEffect(..., [x])` | `componentDidUpdate` で比較 |
| 後始末 | useEffect の return | `componentWillUnmount` |
| 深い子に値を渡す | `useContext` | `Context.Consumer` のネスト |

- useEffect 1つで済む処理が3つのライフサイクルメソッドに分散し、Consumer のネストで JSX も右にずれていく。

### まとめ

- useState は小さなメモ帳、useEffect は描画後のトリガー、useContext は木の中のホワイトボード。
- 同じ処理でもクラスより hooks の方が行数・認知負荷ともに小さい。
- 一度クラスで書いてみると hooks のありがたみが実感できる。

1

## はじめに

こんにちは、YSです。  
普段は研究室で深紫外まわりのデバイスを触っていて、息抜きに Next.js と TypeScript で個人開発をしています。

最近、なんとなく書いていた React の **hooks** たちを改めて勉強し直しました。  
今回はその中でも一番お世話になっている3つ、 **useState / useEffect / useContext** を整理します。

ちなみに hooks 以前の React は、状態を持ちたければ **クラスコンポーネント** で書くしかなかったらしいです。  
過去形で言ってしまいましたが、後半でクラスでも書いてみたら、 **「いやこれは大変だ」** となったので、その話もします。

---

## クラスで書いてた時代の話（軽め）

昔の React は、ざっくりこういうルールでした:

- **状態を持たない見た目だけのコンポーネント** → 関数で書いていい
- **状態を持つコンポーネント** → クラスで書いてください

つまり「ちょっとカウントしたいだけ」でも、 `class extends React.Component` と書き、 `this.state = {...}` を書き、 `this.handleClick = this.handleClick.bind(this)` を書き…と、 **this の世話に時間を取られる** 構図でした。

hooks 登場後は、

> **関数コンポーネントのままで状態もライフサイクルも全部やれる**

ようになり、 `this` の機嫌を取らずに済むようになりました。ありがたいです。

---

## useState ― 一番よく使うやつ

`useState` は **「コンポーネントの中に小さなメモ帳を一枚置く」** ようなものです。  
データを保管できて、更新もできます。

```
"use client";

import { useState } from "react";

export function WavelengthInput() {
  // 入力中の波長 [nm]
  const [wavelength, setWavelength] = useState<number>(266);

  return (
    <div>
      <label>
        波長 (nm):
        <input
          type="number"
          value={wavelength}
          onChange={(e) => setWavelength(Number(e.target.value))}
        />
      </label>
      <p>現在の波長: {wavelength} nm</p>
      <p>
        この波長は{" "}
        {wavelength < 300 ? "深紫外領域です" : "可視〜近紫外領域です"}
      </p>
    </div>
  );
}
```

ここで起きていることは単純で、

- `useState<number>(266)` → 「266 という初期値の数値メモ帳を1枚作る」
- `wavelength` → メモ帳の中身を読む
- `setWavelength(...)` → メモ帳を書き換える

書き換えると React が **「あ、メモ帳変わったな、画面描き直すか」** と気づいて、自動で再レンダリングしてくれます。  
自分で「ここを書き換えろ！」と DOM に命令しなくていいのが楽なところです。

ちなみにこれをクラスで書こうとすると、

```
class WavelengthInput extends React.Component<{}, { wavelength: number }> {
  constructor(props: {}) {
    super(props);
    this.state = { wavelength: 266 };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ wavelength: Number(e.target.value) });
  }

  render() {
    // ...省略
  }
}
```

…という感じになり、 **`this` を bind するためだけの行が増えます** 。  
研究で言うと「測定の前にケーブルを毎回繋ぎ直す」みたいな手間で、本筋ではないところで地味に消耗します。

---

## useEffect ― レンダリング後の処理

`useEffect` は **「描画が終わったあとに何かやってほしいこと」を書く場所** です。  
たとえば「マウントされたらサーバーから測定データを取りに行く」とか、「波長が変わったら理論計算を走らせる」とか。

```
"use client";

import { useEffect, useState } from "react";

type Sample = { id: string; transmittance: number };

export function SampleViewer({ sampleId }: { sampleId: string }) {
  const [sample, setSample] = useState<Sample | null>(null);

  // sampleId が変わるたびに、対応するサンプルのデータを取りに行く
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await fetch(\`/api/samples/${sampleId}\`);
      const data: Sample = await res.json();
      if (!cancelled) setSample(data);
    })();

    return () => {
      cancelled = true; // クリーンアップ: 古いリクエストの結果を捨てる
    };
  }, [sampleId]);

  if (!sample) return <p>読み込み中…</p>;
  return (
    <div>
      <p>サンプルID: {sample.id}</p>
      <p>透過率: {sample.transmittance.toFixed(3)}</p>
    </div>
  );
}
```

`useEffect` のポイントは **第二引数（依存配列）** です。

| 第二引数 | いつ走る？ |
| --- | --- |
| `[]` （空配列） | **マウント時に1回だけ** |
| `[sampleId]` | sampleId が変わったとき |
| 省略 | **毎レンダー** ごと（基本やめておく） |

研究で言うところの **「測定タイミングをトリガーで指定する」** イメージに近いです。  
「電圧が変わったときだけ記録する」みたいな条件設定を、依存配列でやっている感覚。

ちなみに「依存配列に何でも突っ込む」と無限ループに刺さります。  
これは前回の記事（ [Next.jsでつまずいたポイント](https://zenn.dev/shutingstar/articles/6dc346d9555a78) ）でも触れたので、ここでは深追いしません。

---

## useContext ― Props バケツリレー破壊神

複数のコンポーネントを跨いで同じデータを使いたいとき、純粋な props だけでやろうとすると、

```
<Lab>
  └ <Bench>
      └ <Apparatus>
          └ <Display>   ← ここで温度を使いたい
```

みたいな状況で、 **温度を Lab → Bench → Apparatus → Display と4階建てで手渡し** する羽目になります。  
これがいわゆる **props バケツリレー（prop drilling）** で、途中のコンポーネントが「自分は温度なんて使わないのに、子に渡すためだけに引数を持っている」状態になり、まあまあ気持ち悪いです。

ここで `useContext` を使うと、 **「この値はこの木の中ならどこからでも読めますよ」** という共有スペースを作れます。

```
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// 1. 共有したい "実験設定" の型を決める
type ExperimentSettings = {
  temperatureK: number;       // 試料温度 [K]
  pumpWavelength: number;     // ポンプ光波長 [nm]
  setTemperatureK: (v: number) => void;
};

// 2. Context を作る
const ExperimentContext = createContext<ExperimentSettings | null>(null);

// 3. Provider で囲うと、その中ではどこでも読める
export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [temperatureK, setTemperatureK] = useState(300);
  const pumpWavelength = 532;

  return (
    <ExperimentContext.Provider
      value={{ temperatureK, pumpWavelength, setTemperatureK }}
    >
      {children}
    </ExperimentContext.Provider>
  );
}

// 4. 取り出す側のヘルパー
function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) throw new Error("ExperimentProvider の中で使ってください");
  return ctx;
}

// 5. 深いところにいる子コンポーネント
export function Display() {
  const { temperatureK, pumpWavelength } = useExperiment();
  return (
    <div>
      <p>温度: {temperatureK} K</p>
      <p>ポンプ波長: {pumpWavelength} nm</p>
    </div>
  );
}
```

これで `Display` は親をいくつ跨いでいても、 **自分でスッと実験設定を取り出せる** ようになります。  
途中の `Bench` や `Apparatus` は温度のことを知らなくてよく、責務が軽くなります。

研究室で例えるなら、 **「実験パラメータを部屋のホワイトボードに書いておけば、誰でも見に来られる」** みたいな感じ。  
全員に紙を配って回らなくていい、というのが嬉しいポイントです。

---

## クラスで全部書こうとすると一苦労する

ここまでの3つを **全部クラスで書く** とどうなるか、想像で書いてみました（途中で疲れたので雰囲気だけ）:

```
class SampleViewer extends React.Component<
  { sampleId: string },
  { sample: Sample | null }
> {
  private cancelled = false;

  constructor(props: { sampleId: string }) {
    super(props);
    this.state = { sample: null };
  }

  componentDidMount() {
    this.fetchSample();
  }

  componentDidUpdate(prevProps: { sampleId: string }) {
    if (prevProps.sampleId !== this.props.sampleId) {
      this.cancelled = true;        // 古いやつを無効化
      this.cancelled = false;
      this.fetchSample();
    }
  }

  componentWillUnmount() {
    this.cancelled = true;
  }

  async fetchSample() {
    const res = await fetch(\`/api/samples/${this.props.sampleId}\`);
    const data: Sample = await res.json();
    if (!this.cancelled) this.setState({ sample: data });
  }

  render() {
    // ...
  }
}
```

`useEffect` の `[sampleId]` 1行で済んでいた話が、 **`componentDidMount` / `componentDidUpdate` / `componentWillUnmount` の3カ所に分散** します。  
さらに `useContext` 相当のことをやろうとすると `Context.Consumer` のネストが入ってきて、JSX がどんどん右にズレていきます。

ぱっと比較すると:

| やりたいこと | hooks | クラス |
| --- | --- | --- |
| 状態を1個持つ | `useState` 1行 | constructor + setState + bind |
| マウント時に取得 | `useEffect(..., [])` | `componentDidMount` |
| props 変化で再取得 | `useEffect(..., [x])` | `componentDidUpdate` で if 比較 |
| アンマウント時の後始末 | useEffect の return | `componentWillUnmount` |
| 深い子に値を渡す | `useContext` | `Context.Consumer` のネスト |

**やっていることはほぼ同じなのに、行数も認知負荷も明らかに違います。**  
この差を一度クラスで体感すると、hooks のありがたみがぐっと立体的になります。

---

## おわりに

React の hooks は、書ける時間の長さに対して触れる場面が多いぶん、 **「動けばOK」で流してしまいがちな機能** だなと思います。  
今回改めて整理してみて、

- `useState` は **小さなメモ帳**
- `useEffect` は **描画のあとに動くトリガー**
- `useContext` は **木の中のホワイトボード**

くらいのイメージで持っておくと、自分の中で輪郭がハッキリした気がします。

研究では装置の状態を管理するのも、測定後に解析を走らせるのも、設定を共有するのも全部「自分でケーブルを繋いでいく」世界ですが、React 側は **hooks がだいたい面倒を見てくれます** 。  
そのぶん、こちらは「どう設計するか」に頭を使えるので、ありがたく乗っからせてもらおうと思います。

1