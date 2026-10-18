---
title: "[Frontend Performance - Part 10] memo / useMemo / useCallback の正しい使い方：React再レンダリング最適化"
source: "https://qiita.com/tuanphan/items/f335d42c78ce7723af11"
author:
  - "[[tuanphan]]"
published: 2026-05-05
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 1. 問題提起：「useMemoを貼りまくったのに、なぜアプリは遅いままなのか？」 2. React.memo – 親の再レンダリング..."
tags:
  - "clippings"
---
[![ChatGPT Image May 5, 2026, 10_01_18 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/49accff7-8b02-4849-adf9-ddb22abd0185.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F49accff7-8b02-4849-adf9-ddb22abd0185.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=ad21b88b8661e3b465eae09640b8b49e)

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 1\. 問題提起：「useMemoを貼りまくったのに、なぜアプリは遅いままなのか？」

こんな経験はありませんか？

- すべてのコンポーネントを `React.memo` で包んだのに、スクロールがカクつく。
- すべての関数を `useCallback` で包んだのに、パフォーマンスが良くならない。
- `useMemo` を乱用しているのに、リスト描画が遅い。

**真実** ：メモ化は魔法の解決策ではありません。むしろ、 **間違った使い方** は比較コストやメモリ消費によってアプリを **遅く** します。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__e52e27baa28f92225b3a06c5f34daeae" frameborder="0" height="639"></iframe>

Part 9 では次の優先順位を学びました：

> **Stateの局所化 ＞ childrenパターン ＞ コンポーネント分割 ＞ メモ化**

Part 10 ではこれに基づき、 **いつ** メモ化すべきか、 **いつ** 避けるべきか、そして **React Compiler** がどのように未来を変えるのかを解説します。

> 📌 Part 9 を未読の方は先に読むことをお勧めします（再レンダリングの基本と state placement）。

---

## 2\. React.memo – 親の再レンダリングからの子の保護（万能ではない）

`React.memo` は **親コンポーネントが再レンダリングされても、props が変わらなければ子の再レンダリングをスキップ** する Higher-Order Component です。

```tsx
import { memo } from 'react';

const Greeting = memo(({ name }: { name: string }) => {
  console.log('Greeting 再レンダリング');
  return <div>Hello {name}!</div>;
});
```

**⚠️ React.memo が防げないケース**

| ケース | 説明 |
| --- | --- |
| **内部 state の変更** | コンポーネント自身が `useState` を持つ → state変更で再レンダリング |
| **Context の変更** | `useContext` で購読している Context の値が変わると再レンダリング |
| **強制更新** | 稀だが発生する |
| **親の再マウント** | 親がアンマウント→再マウントされると子も再レンダリング |

> ✅ **正しい理解** ： `React.memo` は **親から来る再レンダリング** のみをスキップします。内部 state や Context は対象外です。

---

## 3\. シャロー比較の落とし穴

デフォルトの `React.memo` は **シャロー比較（shallow comparison）** を行います。つまり `Object.is` で props を比較します。

| プロパティの種類 | 動作 |
| --- | --- |
| `string`, `number`, `boolean` | 値が同じなら同じ参照 → memo 有効 |
| `{}` オブジェクトリテラル | 毎レンダリング新しいオブジェクト → 比較失敗 → 再レンダリング |
| `[]` 配列リテラル | 毎レンダリング新しい配列 → 比較失敗 → 再レンダリング |
| `() => {}` 関数リテラル | 毎レンダリング新しい関数 → 比較失敗 → 再レンダリング |

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__9d82aacc9f85475fefa888a33d290eb4" frameborder="0" height="218"></iframe>

このため `React.memo` と併用する場合は `useMemo` / `useCallback` で参照を安定化する必要があります。

---

## 4\. React.memo カスタム比較関数（上級編）

デフォルトの比較ロジックでは不十分な場合、カスタム比較関数を第2引数に渡せます。

```tsx
interface ChartProps {
  data: { id: number; values: number[] }[];
  width: number;
}

const Chart = React.memo(
  (props: ChartProps) => {
    // 重いグラフ描画処理
    return <div>...</div>;
  },
  (prevProps, nextProps) => {
    // data.id だけを比較し、values の完全比較は避ける
    return (
      prevProps.width === nextProps.width &&
      prevProps.data.length === nextProps.data.length &&
      prevProps.data.every((item, i) => item.id === nextProps.data[i].id)
    );
  }
);
```

**使用すべきケース**

- **Chart / Table / Large List** で props 構造が複雑な場合
- オブジェクトの一部だけを比較したい場合

**⚠️ 警告**

- `JSON.stringify` での比較は絶対に避ける（毎回シリアライズで逆効果）。
- 複雑な deep compare は比較コストが再レンダリングよりも高くなる可能性がある。
- カスタム比較関数は親がレンダリングされるたびに実行されるため、 **非常に高速** にすること。
- 実際には、 `useMemo` / `useCallback` で参照を安定化すればカスタム比較が必要になるケースは稀です。導入前に慎重に検討しましょう。

---

## 5\. useCallback – 関数参照の安定化（速度最適化ではない）

`useCallback` は関数をメモ化し、 **依存配列が変わらない限り同じ参照を返す** フックです。

```tsx
const handleClick = useCallback(() => {
  console.log('クリックされました');
}, []); // 依存配列が空 → 常に同じ参照
```

**useCallback の正しい理解**

| 誤解 | 真実 |
| --- | --- |
| 「関数生成のパフォーマンスを最適化する」 | 関数生成は極めて軽量（<0.001ms）。それが目的ではない。 |
| 「全ての関数を useCallback で包むべき」 | 間違い。 **メモ化された子に渡す関数** 、または **useEffect の依存配列にある関数** だけが必要。 |
| 「useCallback は常に効果的」 | 依存配列が頻繁に変わると参照も変わる → メリットなし（むしろオーバーヘッド）。 |

**useCallback を使うべき場合**

1. 関数を **`React.memo` で包まれた子コンポーネント** に渡す。
2. 関数が **`useEffect` の依存配列** に含まれる（不要な effect 再実行を防ぐ）。

```tsx
// ✅ 必要：子がメモ化されている
const MemoizedChild = memo(Child);

function Parent() {
  const onSelect = useCallback((id: string) => {
    console.log(id);
  }, []);
  return <MemoizedChild onSelect={onSelect} />;
}

// ❌ 不要：子がメモ化されていない、または単純な DOM イベント
function Parent() {
  const onClick = () => setOpen(true);
  return <button onClick={onClick}>開く</button>;
}
```

**useCallback が無意味なケース**

```tsx
// ❌ 無意味：deps が毎回変わる
const handleClick = useCallback(() => {
  setCount(count + 1);
}, [count]); // count が変わるたびに関数も変わる → メリットなし

// ✅ 改善：functional update で deps をなくす
const handleClick = useCallback(() => {
  setCount(prev => prev + 1);
}, []);
```

> メモ化された子に渡すことが目的で、依存配列が頻繁に変わる場合は `useCallback` の効果はほぼありません。

---

## 6\. useMemo – 本当に必要な場面とは？

`useMemo` は **計算結果** をメモ化します。依存配列が変わらない限り再計算しません。

**使うべき2つのケース**

**A. 高コストな計算（expensive calculation）**

```tsx
// ✅ 適切：10,000件のフィルタリング
const filteredList = useMemo(() => {
  return hugeList.filter(item => item.name.includes(keyword));
}, [hugeList, keyword]);
```

**B. オブジェクト/配列の参照安定化（メモ化子に渡すため）**

```tsx
// ✅ オブジェクト参照の安定化
const config = useMemo(() => ({
  theme: 'dark',
  size: 'large',
}), []);
return <MemoizedComponent config={config} />;

// ✅ 配列参照の安定化
const items = useMemo(() => [1, 2, 3], []);
return <MemoizedList items={items} />;
```

**使うべきでないケース（アンチパターン）**

```tsx
// ❌ 軽すぎる計算に useMemo は不要
const fullName = useMemo(() => firstName + ' ' + lastName, [firstName, lastName]);

// ❌ ただの安全策としての useMemo も不要
const doubled = useMemo(() => count * 2, [count]);
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__2716fedbbb781c079bce58d9be0afc2a" frameborder="0" height="447"></iframe>

---

## 7\. メモ化にもコストがある – 使うべきでないケース

メモ化は無料ではありません。以下のコストを認識すべきです。

| コストの種類 | 説明 |
| --- | --- |
| **メモリ** | メモ化された値/関数は保持され続ける |
| **比較コスト** | 毎レンダリング、依存配列の各要素を `===` で比較する |
| **コード複雑性** | 可読性低下、デバッグ難化、依存配列ミスのリスク増大 |
| **ステールクロージャ** | 依存配列不足により古い値を参照してしまう（次節で解説） |

**判断マトリクス**

| 状況 | 判断 |
| --- | --- |
| 小さなコンポーネント（DOM数個） | ❌ メモ化不要 |
| props が全てプリミティブでレンダリングが高速 | ❌ メモ化不要 |
| props にオブジェクト/配列があるが頻繁に変わる | ❌ メモ化しても無駄（比較負荷のみ） |
| コンポーネントが内部 state や Context を使っている | ❌ memo 効果薄い |
| 大きなコンポーネントで、 **Profiler で見てレンダリングが明らかに重い** | ✅ 検討する価値あり |
| **計測せずに最適化するな** | 📏 まずは Profiler を |

> **黄金律** ：計測なくして最適化なし。Profiler でボトルネックを特定してからメモ化を検討せよ。

---

## 8\. ステールクロージャ（Stale closure） – useCallback/useEffect の危険な落とし穴

**ステールクロージャ** とは、関数が state/props の「古い値」を閉じ込めてしまい、更新されなくなるバグです。React 開発で非常に頻繁に発生します。

```tsx
function UserProfile({ userId }: { userId: string }) {
  // ❌ 間違い：userId が変わっても handleSubmit は最初の userId を持ったまま
  const handleSubmit = useCallback(() => {
    api.submit(userId);
  }, []); // <- 依存配列に userId がない！

  return <button onClick={handleSubmit}>送信</button>;
}

// ✅ 正しい：userId を依存配列に含める
const handleSubmit = useCallback(() => {
  api.submit(userId);
}, [userId]);
```

**防止策**

1. **ESLint ルール `react-hooks/exhaustive-deps` を有効にする** – 依存配列漏れを警告します。
2. **依存配列は関数が使用するすべての値を含める** という原則を理解する。
3. **`setState` には functional update を使う** – これにより `count` などを依存配列から外せる。
4. 関数が複雑で多くの依存がある場合は、 `useReducer` やロジック分離を検討する。

---

## 9\. React DevTools Profiler で計測してから最適化せよ

**手順**

1. React DevTools を開く → **Profiler** タブ → 🔴 **Record** ボタン。
2. 遅いと感じる操作（スクロール、入力、クリック）を実行。
3. 記録停止 → **Flamegraph** と **Ranked** を分析。
- **Flamegraph** ：色が濃い（橙/黄色）ほどレンダリング時間が長い。ホバーでレンダリング原因表示。
- **Ranked** ：レンダリング時間が長い順にコンポーネントを表示。

**`why-did-you-render` との併用**

```bash
npm install @welldone-software/why-did-you-render
```

```tsx
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
```

> **注意** ：このライブラリは **開発中のみ** 使用すること。本番では無効に。  
> *ヒント* ：React Compiler 時代でも `why-did-you-render` は有効です。コンパイラが自動メモ化しても、state/context やロジック起因の不要な再レンダリングを検出するのに役立ちます。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__d568837f537e9cf85a7c5c764e321438" frameborder="0" height="195"></iframe>

---

## 10\. メモ化に頼らないパターン

メモ化は最後の手段です。まず以下のパターンを試しましょう（Part 9 で紹介）。

**A. State の局所化**

State は実際に使うコンポーネントのできるだけ近くに配置する。

**B. Children パターン**

変化しない UI 部分を `children` として渡し、親の state 変更の影響を避ける。

**C. Context 分割**

1つの大きな Context を複数の小さな Context に分割し、変更頻度の低いものと高いものを分離する。

**D. 仮想化（Virtualization）**

非常に長いリストには **TanStack Virtual** を使用する（ `react-window` よりも現代的）。

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';
```

---

## 11\. React Compiler – 自動メモ化の未来

**React Compiler** はビルド時に `props` や `state` が変わらないコンポーネント/フックを **自動的にメモ化** するツールです。このツールは **React 19 RC** で正式に紹介されました。

**React Compiler が行うこと**

- 必要なコンポーネントに自動で `React.memo` を適用。
- 必要な値や関数に自動で `useMemo` / `useCallback` を追加。
- **開発者は手動によるメモ化をほぼ書かなくて済む** 。

**2025-2026 の現状**

- Compiler は **Next.js, Remix, Webpack, Vite** などのプロジェクトで有効化可能。
- ただしコンパイラは **良いコンポーネント設計を代替しない** 。state placement, children pattern, コンポーネント分割は依然として重要。

> **インストールメモ** ：インストール手順はフレームワークや時期によって変わることがあります。必ず最新の公式ドキュメントを参照してください。

参考例（時期によって古くなっている可能性あり）：

```bash
npm install -D babel-plugin-react-compiler
```

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
});
```

---

## 12\. 重要：開発モードと本番モードの違い

React の **Strict Mode** は開発環境で副作用を検出するため、コンポーネントを **2回レンダリング** することがあります。

この動作は **開発環境のみ** であり、本番環境には影響しません。

> 📌 **開発環境での「遅さ」を本番環境のパフォーマンスと勘違いしないでください。** 本番環境でプロファイリングを行いましょう。

---

**メモ化を追加する前に自問すべきこと**

- 本当にエフェクトがループしていないか？
- state の位置は正しいか？
- コンポーネントがやりすぎていないか？

**根本原因（state placement, effect dependencies）を直すことが、メモ化を闇雲に貼るよりも重要です。**

---

## 13\. 実践リファクタリング：TypeScriptでTodoリストを最適化する

**シナリオ**

10,000件の Todo アイテムを持つリスト。リアルタイムフィルターと統計表示あり。

**悪い例：メモ化乱用 + state の位置誤り**

```tsx
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  
  const stats = useMemo(() => ({ total: todos.length }), [todos]);
  const addTodo = useCallback(() => {
    setTodos(prev => [...prev, { id: Date.now(), text: 'New', done: false }]);
  }, [todos]); // ❌ todos が変わるたび addTodo も変わる
  
  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value as any)} />
      <Stats stats={stats} />
      <TodoList todos={todos} filter={filter} addTodo={addTodo} />
    </div>
  );
}
```

**良い例：state 局所化 + 適切なメモ化**

```tsx
function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  return <TodoSection todos={todos} setTodos={setTodos} />;
}

function TodoSection({ todos, setTodos }: { todos: Todo[]; setTodos: React.Dispatch<React.SetStateAction<Todo[]>> }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  
  const addTodo = useCallback(() => {
    setTodos(prev => [...prev, { id: Date.now(), text: 'New', done: false }]);
  }, []); // ✅ 依存なし → 安定
  
  const stats = useMemo(() => ({ total: todos.length }), [todos]);
  
  return (
    <div>
      <input value={filter} onChange={e => setFilter(e.target.value as any)} />
      <Stats stats={stats} />
      <MemoizedTodoList todos={todos} filter={filter} onAdd={addTodo} />
    </div>
  );
}

const MemoizedTodoList = React.memo(TodoList);

function TodoList({ todos, filter, onAdd }: { todos: Todo[]; filter: string; onAdd: () => void }) {
  const filtered = useMemo(() => {
    if (filter === 'all') return todos;
    return todos.filter(t => (filter === 'active' ? !t.done : t.done));
  }, [todos, filter]);
  
  return (
    <>
      <button onClick={onAdd}>追加</button>
      <ul>
        {filtered.map(todo => <TodoItem key={todo.id} todo={todo} />)}
      </ul>
    </>
  );
}
```

**結果** ：

- フィルター入力 → `TodoSection` だけが再レンダリングされる（ `TodoList` は `filter` が変わるので当然再レンダリングされるが、それは **必要な再レンダリング** ）。
- `addTodo` は安定しているため、 `MemoizedTodoList` に無駄な再レンダリングを強制しない。
- 最適化の本質は「state placement + stable callback」であり、「全ての再レンダリングを防ぐ」ことではない。

---

## 14\. 経験豊富なエンジニア向けチェックリスト

**メモ化を追加する前に必ず確認**

- React DevTools Profiler で flamegraph を確認したか？
- 開発モード（Strict Mode による二重レンダリング）と本番モードを区別しているか？
- Part 9 の state 局所化 / children パターン / 分割を試したか？

**React.memo**

- コンポーネントは **純粋** か？（結果が props のみで決まる）
- props の変更頻度は低いか？
- レンダリングコストは **Profiler で見て明らかに重い** か？
- memo は親からの再レンダリングだけをスキップするもので、内部 state/Context は防げないと理解しているか？

**useCallback**

- **メモ化された子に渡す関数** 、または **useEffect の依存配列にある関数** だけに使用しているか？
- ステールクロージャをチェックしたか？ ESLint `exhaustive-deps` は有効か？
- 依存配列が **ほとんどのレンダリングで変化する** 場合、useCallback の効果はほぼないと理解しているか？

**useMemo**

- 計算コストが **Profiler で見て明らかに重い** か？
- または **オブジェクト/配列の参照安定化** が本当に必要か（メモ化子に渡す場合）？
- 軽すぎる計算には使っていないか？

**React Compiler（将来）**

- 新しいプロジェクトでは Compiler の導入を検討しているか？
- コンパイラがあっても良いアーキテクチャ設計が重要だと理解しているか？

---

## 15\. まとめと次回予告

| 機能 | 真の目的 | 使うべきタイミング |
| --- | --- | --- |
| **React.memo** | 親の再レンダリングによる子の無駄な再レンダリングをスキップ | 純粋 + レンダリング重い + props 変更頻度低い |
| **useCallback** | 関数参照の安定化（メモ化子・useEffect 用） | メモ化子に渡す関数 または useEffect 依存配列 |
| **useMemo** | 高コスト計算の回避 / オブジェクト参照安定化 | 重い計算 または メモ化子に渡すオブジェクト/配列の参照安定化に必要 |

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__ab683790e785d253ebc3cdf02e7dbac2" frameborder="0" height="1104"></iframe>

---

👉 **次回予告（Part 11）**  
*\[Frontend Performance - Part 11\] State設計最適化：無駄な再レンダリングを防ぐアーキテクチャ*

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