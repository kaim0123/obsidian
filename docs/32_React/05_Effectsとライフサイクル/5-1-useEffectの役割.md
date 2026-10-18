# 5-1 useEffectの役割（副作用とは）

## 🎯 この章で学ぶこと

- 「副作用（side effect）」という言葉の意味を理解できるようになります
- なぜReactには `useEffect` という専用のフックが用意されているのかが分かります
- 「外の世界とのつながり」をReactでどう扱うかをイメージできるようになります
- レンダリングと副作用がどう分離されているかを把握できます
- いつ `useEffect` を使い、いつ使うべきでないかを判断できるようになります

## 📖 概念の説明

### 副作用ってなに？

プログラミングの世界では、「**ある関数が、自分の戻り値を返す以外に外の世界に影響を与えること**」を**副作用（side effect）**と呼びます。難しそうに聞こえますが、要するに「関数の中で、外の世界をいじっている」ということです。

例えるなら、**料理人がレシピ通りに料理を作る** のが「純粋な計算」だとすると、**料理しながら横で洗濯機を回したり、宅配便の受け取りをしたりする** のが「副作用」です。料理（戻り値）とは別に、外の世界に影響を与えているわけですね。

Reactのコンポーネントは基本的に「**propsとstateを受け取って、JSX（画面）を返す関数**」です。これは「料理人がレシピ通りに料理を作る」のと同じで、**できるだけ純粋であってほしい** というのがReactの設計思想です。

しかし、現実のアプリケーションでは「外の世界」とつながらないといけない場面がたくさんあります。

- サーバーからデータを取ってくる（`fetch`）
- ブラウザの `localStorage` に保存する
- `setInterval` でタイマーを回す
- DOMを直接いじる（フォーカスを当てる、スクロール位置を取得する）
- ライブラリの初期化（地図、グラフ、エディタなど）
- WebSocketに接続する

これらはすべて「Reactの外側の世界」とのやり取りです。こうした **外の世界とのつながり** を扱うために用意されたフックが `useEffect` です。

### useEffectは「レンダリングが終わったあとに走る関数」

`useEffect` は、ざっくり言うと「**画面が描き終わったあとに実行してね、という予約**」です。

レストランの厨房をイメージしてみてください。

1. お客様が注文を出す（state変更）
2. 料理人が料理を作って、お皿に盛り付ける（レンダリング）
3. 料理を客席に出す（DOMに反映）
4. **そのあとで** 厨房を片付けたり、次の注文に備えたりする ← これが `useEffect` の仕事

このように、「**画面の描画が完了した後に、ちょっと外側の作業をしておく**」のが `useEffect` の役割です。

### なぜ `useEffect` を分ける必要があるの？

「コンポーネントの関数の中で直接 `fetch` を呼んじゃダメなの？」と思うかもしれません。実はこれ、絶対ダメです。なぜなら、

- レンダリング関数は **何回も呼ばれる** 可能性がある
- レンダリング中に副作用を起こすと、**無限ループや予期しない挙動** につながる
- Reactは将来、レンダリングを **中断したり破棄したり** する可能性がある（Concurrent機能）

ですので、副作用は **レンダリングとは別のタイミングで** 実行する必要があります。`useEffect` がその「別のタイミング」を提供してくれるわけです。

### 用語の整理

- **副作用（side effect）**：関数の戻り値以外に、外の世界へ影響を与える処理
- **純粋関数（pure function）**：同じ入力に対して必ず同じ出力を返し、副作用を起こさない関数
- **マウント（mount）**：コンポーネントが画面に最初に登場すること
- **アンマウント（unmount）**：コンポーネントが画面から消えること
- **ライフサイクル（lifecycle）**：コンポーネントが生まれてから消えるまでの一連の流れ

## 💻 コード例

### 例1：もっとも基本的な useEffect

```jsx
import { useEffect, useState } from 'react';

function Greeting() {
  const [name, setName] = useState('太郎');

  // useEffectは「副作用予約フック」
  // 第1引数：実行したい処理（関数）
  // 第2引数：依存配列（次の章で詳しく扱います）
  useEffect(() => {
    // ここはレンダリングが終わったあとに走る
    document.title = `こんにちは、${name}さん`; // ブラウザのタブのタイトルを書き換える
  }, [name]); // nameが変わるたびに再実行する

  return (
    <div>
      <p>名前：{name}</p>
      <button onClick={() => setName('花子')}>花子に変更</button>
    </div>
  );
}
```

ポイントは、`document.title = ...` が **Reactの外側（ブラウザ）の世界をいじっている** ということです。これが副作用なので、`useEffect` の中に入れる必要があります。

## 🔍 深掘り：よくあるuseEffectの使いどころ（パターン集）

「副作用＝外の世界との接続」と言われてもピンと来ないときは、まずこの3つを覚えると整理しやすいです。

### 1) 永続化（localStorageに保存する）

```jsx
import { useEffect, useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);

  // マウント時に読み込み
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  // todos が変わるたびに保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
}
```

「読み込みはマウント時だけ」「保存は値の変化に追従」なので、Effectを2つに分けると意図が明確になります。

### 2) DOM操作（フォーカスを当てる）

```jsx
import { useEffect, useRef } from 'react';

function SearchInput({ isOpen }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  return <input ref={inputRef} />;
}
```

DOMは「描画が終わるまで存在しない」ので、フォーカスのような操作はEffectに置くのが自然です。

### 3) 外部ライブラリの初期化（初期化→破棄）

```jsx
import { useEffect, useRef } from 'react';

function Chart({ data }) {
  const rootRef = useRef(null);

  useEffect(() => {
    const chart = new ChartLibrary(rootRef.current, { data });
    return () => chart.destroy();
  }, [data]);

  return <div ref={rootRef} />;
}
```

「初期化（セットアップ）」と「破棄（クリーンアップ）」がペアになる副作用は、Effectと相性が良いです（クリーンアップの詳細は次章）。

### 例2：マウント時にだけ走らせる

```jsx
import { useEffect } from 'react';

function Welcome() {
  useEffect(() => {
    // 依存配列を空にすると、マウント時に1回だけ実行される
    console.log('コンポーネントがマウントされました');
  }, []); // ← 空配列がポイント

  return <h1>ようこそ！</h1>;
}
```

「画面に登場したときに1回だけログを出したい」「初期化処理を1回だけ走らせたい」ときに使うパターンです。

### 例3：複数の useEffect を併用する

```jsx
import { useEffect, useState } from 'react';

function Dashboard({ userId }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  // ユーザー情報を取得する副作用
  useEffect(() => {
    console.log(`${userId} のデータを取得中...`);
    // ここで実際にAPIを叩くイメージ
  }, [userId]); // userIdが変わるたびに再取得

  // テーマを localStorage に保存する副作用
  useEffect(() => {
    localStorage.setItem('theme', theme); // ブラウザに保存
  }, [theme]); // themeが変わるたびに保存

  return (
    <div>
      <p>テーマ：{theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        テーマ切り替え
      </button>
    </div>
  );
}
```

**1つのコンポーネントの中に `useEffect` を複数書いてOK** です。むしろ、関心ごと（concern）ごとに分けた方が読みやすくなります。

### 例4：useEffectが不要な場面（よくある勘違い）

```jsx
// ❌ 悪い例：単なる計算を useEffect で書いてしまう
function Bad({ items }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTotal(items.reduce((sum, x) => sum + x.price, 0));
  }, [items]); // 不要！

  return <p>合計：{total}円</p>;
}

// ✅ 良い例：レンダリング中に普通に計算する
function Good({ items }) {
  const total = items.reduce((sum, x) => sum + x.price, 0); // これで十分
  return <p>合計：{total}円</p>;
}
```

「propsから計算できる値」は **state にも useEffect にも入れる必要はありません**。レンダリング中にそのまま計算してください。

## ❌ よくある間違い

### 1. 同期的なデータ変換に useEffect を使ってしまう

「propsの値を加工した結果をstateに入れたい」というケースで `useEffect` を使うのは典型的なアンチパターンです。**派生値はそのまま計算するか、`useMemo` を使いましょう**。

### 2. レンダリング中に副作用を書いてしまう

```jsx
// ❌ レンダリング中にfetchすると無限ループや警告の原因に
function Bad() {
  fetch('/api/data'); // これはダメ
  return <div>...</div>;
}
```

副作用は必ず `useEffect` の中に入れましょう。

### 3. async関数を useEffect に直接渡す

```jsx
// ❌ useEffect は async関数を受け取れません
useEffect(async () => {
  const data = await fetchData();
}, []);

// ✅ 内側で async 関数を定義して呼ぶ
useEffect(() => {
  const run = async () => {
    const data = await fetchData();
  };
  run();
}, []);
```

`useEffect` の戻り値は「クリーンアップ関数」と決まっているため、`async` が返すPromiseと衝突してしまいます。

### 4. 「マウント時だけ」のつもりで依存配列を省略する

```jsx
// ❌ 依存配列を省略すると毎レンダー走ります
useEffect(() => {
  console.log('hello');
}); // 第2引数なし

// ✅ マウント時だけなら空配列を渡す
useEffect(() => {
  console.log('hello');
}, []);
```

## ✅ ベストプラクティス

1. **「外の世界とのつながり」だけに使う**：DOM操作、API、タイマー、購読、ライブラリ初期化など。
2. **関心ごとに分ける**：1つのEffectに複数の目的を詰め込まず、目的ごとに `useEffect` を分けます。
3. **派生値には使わない**：propsやstateから計算できるものは、レンダリング中に計算します。
4. **イベントハンドラで済むなら、そちらに書く**：「ボタンを押したときに保存する」のような処理は `onClick` に書く方が素直です。
5. **依存配列を正しく書く**：使っている変数はすべて依存配列に入れる、というルールを守りましょう（ESLintの `react-hooks/exhaustive-deps` が助けてくれます）。

## 🔬 実践演習

### お題：ページタイトルを連動させる

入力フォームに名前を打つと、ブラウザのタブのタイトルが「こんにちは、〇〇さん」に変わるコンポーネントを作ってみましょう。

ヒント：

- `useState` で入力値を管理する
- `useEffect` で `document.title` を書き換える
- 依存配列に入力値を入れて、変更のたびに走らせる

### 発展課題

- 入力が空のときは「ようこそ」とだけ表示する
- 入力欄に文字数制限（例：20文字）を設けて、それを超えたら警告を `console.warn` で出す（これも副作用ですよ！）

## 📝 まとめ

- `useEffect` は「**外の世界とのつながり**」を扱うためのフックです
- 「レンダリングが終わったあと」に実行されます
- propsやstateから計算できる値には使いません
- `async` 関数は直接渡さず、内側で定義して呼びます
- 関心ごとに分けて書くのがコツです

## 🔗 関連ページ

- [[5-2-依存配列の読み方]]
- [[5-3-クリーンアップ]]
- [[5-4-StrictModeで2回動く理由]]
- [[5-5-よくあるバグ集]]
- [[../03_状態管理/3-1-useStateの基本]]
- [[../04_コンポーネント設計/4-1-責務の分離]]
