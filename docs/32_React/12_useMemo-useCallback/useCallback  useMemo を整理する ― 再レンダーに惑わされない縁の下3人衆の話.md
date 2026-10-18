---
title: "useCallback / useMemo を整理する ― 再レンダーに惑わされない\"縁の下3人衆\"の話"
source: "https://zenn.dev/shutingstar/articles/746577b8fbd37b"
author:
published: 2026-04-16
created: 2026-05-09
description:
tags:
  - "clippings"
---

## 詳しい要約

**テーマ：useRef / useCallback / useMemo ― 再レンダーを跨いで「同じもの」を使い続けるための hooks**

useState / useEffect / useContext の続編として、派手さはないが再レンダーのすき間で働く3つの hooks をサッカーの「縁の下の3人衆」に例えて整理した記事。3つとも中身を変えても自身は再レンダーを起こさない道具で、特に useCallback / useMemo は「参照を固定したい理由」が言えるときだけ使う最適化手段、というのが結論。

---

### 全体像

| hook | 覚えておくもの | 自身が再レンダーを起こすか |
| --- | --- | --- |
| `useRef` | 書き換え可能な入れ物（値・DOM 参照） | しない |
| `useCallback` | 関数の参照（同一性） | しない |
| `useMemo` | 計算結果、オブジェクト・配列の参照 | しない |

- ただし useCallback / useMemo は依存配列が変われば返す参照も変わり、それを props や依存に使う下流は再レンダー・再実行される。

### useRef ― 画面に出さない記録係

- **DOM 要素を掴む**：`inputRef.current?.focus()` で入力欄にフォーカス。
- **再レンダーなしで値を持つ**：`setInterval` のタイマー ID を保持してキックオフ／試合終了で使い回す。
- タイマー ID を useState にすると、更新のたびに余計な再レンダーが走る。

### useCallback ― 関数の「ゼッケン番号」を固定

- 関数は毎レンダーで新しく作られるため、参照の同一性を見ている相手（`React.memo` した子や useEffect）がいると困る。
- 例：`React.memo` した `PlayerCard` に `useCallback` した `handleScore` を渡すと、試合時間だけ進めてもゴールしていない選手のカードは再レンダーされない。
- **不要な場面**：JSX 内で直接書くハンドラ、memo していない子、props にも useEffect の依存にも渡さない関数。「下流で参照等価を気にする誰かがいるか」を自問する。

### useMemo ― 計算結果とオブジェクト参照を固定

- **重い計算の抑制**：決定率ランキング（filter・map・sort）を `useMemo(..., [players])` にすれば、無関係な state 更新では再計算されない。
- **オブジェクト・配列の参照安定**：`{ shape: "4-3-3", pressing: "high" }` のようなリテラルは毎回新しいオブジェクトになるので、memo した子に渡すなら useMemo で固定する。
- `useCallback(fn, deps)` は `useMemo(() => fn, deps)` とほぼ同じで、「関数を返す useMemo のショートカット」。

### 共通の注意点

- 子が `React.memo` でなければ useCallback は不要、計算が軽ければ useMemo は不要。
- 依存配列に毎回変わる値を入れるとメモの意味がない。
- 「全部に巻けば速くなる」わけではなく、理由を説明できる箇所にだけ使う。

### まとめ

- useRef は記録係（書き換えるが画面には出さない）、useCallback はゼッケン固定（関数の参照）、useMemo はスタッツ表・フォーメーション図の使い回し（計算結果・参照）。
- useCallback / useMemo は最適化の道具であり、使う理由があるときだけ使う。

2[React](https://zenn.dev/topics/react)

[

TypeScript

](https://zenn.dev/topics/typescript)[

frontend

](https://zenn.dev/topics/frontend)[

React Hooks

](https://zenn.dev/topics/reacthooks)[

tech

](https://zenn.dev/tech-or-idea)

## はじめに

こんにちは、YSです。  
前回は [useState / useEffect / useContext](https://zenn.dev/shutingstar/articles/a50d4466a12a5b) の3人を整理しました。今回はその続編で、 **useRef / useCallback / useMemo** の3人をまとめます。

この3人、前回の3人と比べると派手さはないんですが、 **「再レンダーのスキマで仕事をする」** タイプで、いないと意外と困るやつらです。  
サッカーで言うと、ゴールを決めるわけではないけど **ボランチ・サイドバック・キーパー** みたいな「縁の下の3人衆」。今回はこのイメージで話を進めます。

コード例も、サッカー絡みで書いていきます。

---

## 全体像: この3つが守っているもの

全員に共通する役割は **「再レンダーを跨いでも同じものを使い続けたい」** というものです。

| hook | 何を覚えておく | そのhook自体が再レンダーを引き起こす？ |
| --- | --- | --- |
| `useRef` | **書き換え可能な入れ物** （値 / DOM参照） | **しない** |
| `useCallback` | **関数の参照** （同一性） | しない |
| `useMemo` | **計算結果 or オブジェクト・配列の参照** | しない |

ポイントは **「全員、中身を変えても useState のように発火しない」** こと。  
ただし `useCallback` / `useMemo` については、 **依存配列が変わった結果、返ってくる参照も変われば、その参照を props や依存に使っている下流のコンポーネント・エフェクトは再レンダー/再実行される** ことに注意。あくまで **hook 自身が発火源になるわけではない** 、という意味で「しない」と理解してください。

そして全員共通なのは「レンダーを挟んでも **同じモノを渡し続けるため** 」の道具であり、画面を動かすための `useState` とは目的が違う、という点です。

---

## 1\. useRef ― 再レンダーに流されない"記録係"

`useRef` の役割は **「書き換えたいけど、画面には影響させたくない値」** を持つこと。  
サッカーで言うと、試合中の **時計役** とか **記録係** です。スコアボードには出さないけど、手元のメモにずっと書いている役割。

### 使い方1: DOM 要素を掴む

```
"use client";

import { useRef } from "react";

export function PlayerNameInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusOnInput = () => {
    inputRef.current?.focus(); // 試合前の選手紹介みたいに、名前欄にカーソルを当てる
  };

  return (
    <>
      <input ref={inputRef} placeholder="選手名" />
      <button onClick={focusOnInput}>入力欄にフォーカス</button>
    </>
  );
}
```

### 使い方2: 書き換えたい値を持つ（再レンダー無しで）

試合時間のタイマー ID を覚えておく例:

```
"use client";

import { useRef, useState } from "react";

export function MatchClock() {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null); // タイマーIDを覚えておく

  const kickOff = () => {
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  };

  const fullTime = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div>
      <p>経過時間: {seconds} 秒</p>
      <button onClick={kickOff}>キックオフ</button>
      <button onClick={fullTime}>試合終了</button>
    </div>
  );
}
```

`timerRef.current` は **書き換えたい** （start / stop で ID を使い回す）けど、 **書き換えたからといって画面を再描画してほしいわけじゃない** 。この温度感のとき `useRef` がぴったりハマります。

もし `timerRef` を `useState` にしてしまうと、タイマーを起動するたびにその state 更新で再レンダーが走って、 **1秒ごとの画面更新と二重に走る** みたいな地味なズレが起きるので要注意。

---

## 2\. useCallback ― 関数の"ゼッケン番号"を固定する

`useCallback` は **関数の参照（同一性）を安定させる** フックです。

関数は普通に書くと **毎レンダーで新品になる** 。イメージ的には、毎試合「同じ名前の選手」だけど **毎回違うゼッケンで出てくる** 状態。  
基本は誰も気にしませんが、 **ゼッケン番号で選手を見分けている人** （= 最適化された子コンポーネントや useEffect）がいるときに困ります。

### 典型例: React.memo した子に関数を渡すとき

```
"use client";

import { memo, useCallback, useState } from "react";

type Player = { id: number; name: string; goals: number };

// React.memo で props が変わらない限り再レンダーしない子
const PlayerCard = memo(function PlayerCard({
  player,
  onScore,
}: {
  player: Player;
  onScore: (id: number) => void;
}) {
  console.log(\`${player.name} のカードを再描画\`);
  return (
    <div>
      <p>{player.name} ― {player.goals} ゴール</p>
      <button onClick={() => onScore(player.id)}>ゴール！</button>
    </div>
  );
});

export function TeamBoard() {
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: "10番", goals: 0 },
    { id: 2, name: "9番", goals: 0 },
  ]);
  const [minute, setMinute] = useState(0); // 試合時間 (このボタンで更新)

  // useCallback で参照が安定 → goals が変わった選手のカードだけ再描画
  const handleScore = useCallback((id: number) => {
    setPlayers((ps) =>
      ps.map((p) => (p.id === id ? { ...p, goals: p.goals + 1 } : p)),
    );
  }, []);

  return (
    <>
      <p>試合時間: {minute} 分</p>
      <button onClick={() => setMinute((m) => m + 1)}>1分進める</button>
      {players.map((p) => (
        <PlayerCard key={p.id} player={p} onScore={handleScore} />
      ))}
    </>
  );
}
```

「1分進める」ボタンで `minute` が変わっても、 `handleScore` の参照が同じなので、 **ゴールしていない選手のカードは再レンダーされない** 。  
`React.memo` が効く前提を、親が壊さないために `useCallback` で支えている、という構図です。

### useCallback が要らない場面

- JSX の中で直接書く `onClick={() => setX(...)}`
- 普通の（memo 化していない）子コンポーネント
- 関数を props にも useEffect 依存にも渡していない

**「この関数、下流で参照等価を気にしてる誰かいる？」** と自問して、誰もいないなら不要です。

---

## 3\. useMemo ― "計算結果"と"フォーメーション"を固定する

`useMemo` は **関数を実行した結果（戻り値）を覚えておく** フック。  
useCallback が「選手のゼッケンを固定」なら、useMemo は **「計算済みのスタッツ表」や「フォーメーション図」を使い回す** イメージです。

### 用途1: 重い計算をレンダーごとに走らせない

```
"use client";

import { useMemo, useState } from "react";

type Player = { id: number; name: string; goals: number; shots: number };

export function TeamStats({ players }: { players: Player[] }) {
  const [minute, setMinute] = useState(0);

  // 決定率ランキング (shots が 0 の選手は除外)
  const ranking = useMemo(() => {
    return [...players]
      .filter((p) => p.shots > 0)
      .map((p) => ({ ...p, rate: p.goals / p.shots }))
      .sort((a, b) => b.rate - a.rate);
  }, [players]);

  return (
    <>
      <button onClick={() => setMinute((m) => m + 1)}>{minute}分</button>
      <ol>
        {ranking.map((p) => (
          <li key={p.id}>
            {p.name}: 決定率 {(p.rate * 100).toFixed(1)}%
          </li>
        ))}
      </ol>
    </>
  );
}
```

「1分進める」で `minute` が変わっても、 **`players` が変わっていなければ `ranking` は再計算されない** 。  
無関係な state 更新のたびにソートし直すのは無駄なのでメモ化する、という話です。

### 用途2: オブジェクト・配列の参照を安定させる

useCallback の "オブジェクト版" の使い方。

```
"use client";

import { memo, useMemo, useState } from "react";

const Formation = memo(function Formation({
  config,
}: {
  config: { shape: string; pressing: "high" | "mid" | "low" };
}) {
  console.log("フォーメーション再描画");
  return <p>{config.shape} / プレス: {config.pressing}</p>;
});

export function Tactics() {
  const [minute, setMinute] = useState(0);

  // 中身が実質同じなら参照を固定する
  const config = useMemo(
    () => ({ shape: "4-3-3", pressing: "high" as const }),
    [],
  );

  return (
    <>
      <button onClick={() => setMinute((m) => m + 1)}>{minute}分</button>
      <Formation config={config} />
    </>
  );
}
```

`{...}` は書くたびに **新しいオブジェクト** になるので、 `memo` された子から見ると「毎回違う props」。これを useMemo で固定することで、試合時間だけが動くようなシーンでも、フォーメーションの表示は無駄に再描画されなくなります。

### useCallback との関係

実は **`useCallback(fn, deps)` は `useMemo(() => fn, deps)` とほぼ同じ** 。useCallback は **「関数を返す useMemo のショートカット」** と覚えておくと、2つの役割がスッキリ整理できます。

---

## 全員に共通する最大の注意点

useRef はまだしも、 **useCallback / useMemo は「最適化の道具」** 。

- 子が `React.memo` じゃない → useCallback は要らない
- 計算が軽い → useMemo は要らない
- 依存配列に毎回変わる値を入れる → メモの意味がない

「全員に巻けば速くなる」ではなく、 **それぞれに "この参照を固定したい理由" が言えるときに使う** 。  
サッカーで言うと「とりあえず全員守備的に並べれば守れる」みたいな話で、 **ポジションの意味を理解せずに配置すると逆にチームが機能しなくなる** のと似ています。

---

## おわりに

整理すると:

- `useRef` は **試合中の記録係** （書き換えたいが画面には出さない）
- `useCallback` は **選手のゼッケン固定** （関数の参照を安定させる）
- `useMemo` は **スタッツ表 / フォーメーション図の使い回し** （計算結果や参照を安定させる）

前回の useState / useEffect / useContext が "攻撃の3人" だとすれば、今回の3人は **試合全体のリズムを支える縁の下の3人** 。  
派手さはないけど、使いどころを掴むと **「ゲームが綺麗に回る」感覚** が得られるはずです。

2