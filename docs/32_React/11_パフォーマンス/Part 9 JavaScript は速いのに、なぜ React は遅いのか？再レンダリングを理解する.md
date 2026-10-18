---
title: "[Frontend Performance - Part 9] JavaScript は速いのに、なぜ React は遅いのか？再レンダリングを理解する"
source: "https://qiita.com/tuanphan/items/b4e3330337f767a47a83"
author:
  - "[[tuanphan]]"
published: 2026-05-04
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 0. はじめに：JavaScriptは速いのにReactが遅い理由 1. Reactの再レンダリングとは何か？ 2. 再レンダリングが..."
tags:
  - "clippings"
---
[![ChatGPT Image May 4, 2026, 10_39_07 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/387a86da-0103-4b5c-ba97-d10be57a43f8.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F387a86da-0103-4b5c-ba97-d10be57a43f8.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=8842b3c3b8664e6e02e463f481f32ea3)

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 0\. はじめに：JavaScriptは速いのにReactが遅い理由

JavaScript自体は非常に高速です。10,000件の配列フィルタリングも数ミリ秒で完了します。

しかし、Reactアプリケーションでは、 **たった1文字の入力で画面全体がカクつく** 経験をしたことはありませんか？

その原因は、 **Reactの「再レンダリング（Re-render）」の仕組み** にあります。

> **Reactはデフォルトで「親コンポーネントが再レンダリングされると、すべての子コンポーネントも再レンダリングする」という動作をします。**

これが連鎖すると、一見無関係なコンポーネントまで再実行され、パフォーマンスが劣化します。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__7897a333dc7e7986e9123ca0e5d086d9" frameborder="0" height="791"></iframe>

---

## 1\. Reactの再レンダリングとは何か？

**再レンダリング** とは、コンポーネント関数を再実行し、 **仮想DOM（Virtual DOM）** を再計算するプロセスです。

**❌ よくある誤解**

| 誤解 | 正しい理解 |
| --- | --- |
| 再レンダリング ＝ 実際のDOM更新 | **違う** 。再レンダリングは仮想DOMの再計算に過ぎない。実際のDOM更新は差分がある時だけ。 |
| stateが変わらなければ再レンダリングされない | **違う** 。親が再レンダリングされれば、子も再レンダリングされる（デフォルト動作）。 |
| `React.memo` ですべて解決する | **違う** 。 `memo` はpropsの浅い比較のみ。Contextや内部stateは防げない。 |

**✅ 重要なポイント**

```typescript
// ❌ 同じ値でも setState を呼ぶのは避ける（Reactは再レンダリングをスキップできるが、確実ではない）
const [count, setCount] = useState(0);
setCount(0);

// ✅ 変更がある時だけ更新する
setCount(prev => prev === newValue ? prev : newValue);
```

---

## 2\. 再レンダリングが発生する3つの原因

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__f9b9d36c470eb240c55e27a102962c6d" frameborder="0" height="501"></iframe>

| 原因 | 説明 | 例 |
| --- | --- | --- |
| **State 変更** | `setState` または `dispatch` が呼ばれると、そのコンポーネントが再レンダリング対象になる。 | `setTodos([...todos, newTodo])` |
| **親コンポーネントの再レンダリング** | Reactのデフォルト動作。親が再レンダリングされると、子（と孫）もすべて再レンダリングされる。 | 親の `filter` state 変更 → 子の `TodoList` も再レンダリング |
| **Context の値変更** | `Provider` の `value` が変わると、そのContextを購読する全コンポーネントが再レンダリングされる。 | `ThemeProvider` のテーマ切り替え → 多くのコンポーネントが再レンダリング |

> ⚠️ **参照の落とし穴**  
> オブジェクトや関数を毎レンダリングで新しく作成すると、中身が同じでも「変更された」とReactは判断します。これが不要な再レンダリングを引き起こします。

```typescript
// ❌ 毎回新しい関数（参照が変わる）
<Child onClick={() => console.log('click')} />

// ✅ useCallback で参照を安定化
const handleClick = useCallback(() => console.log('click'), []);
<Child onClick={handleClick} />
```

---

## 3\. 再レンダリングのデフォルト動作：親がレンダリングされると子もレンダリングされる

> **これはReactを理解する上で最も重要なルールの一つです。**

Reactはパフォーマンスと単純性のバランスを取るため、デフォルトで「親が再レンダリングされたら、すべての子も再レンダリングする」という戦略を取っています。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__56378bc788a9c442bc61386d78b2c834" frameborder="0" height="347"></iframe>

**結果**: たった1つのstate変更が、数十のコンポーネントの再実行を引き起こす可能性があります。

---

## 4\. 再レンダリングのコスト – なぜカクつきが起きるのか

1回の再レンダリングは通常非常に軽量です（<1ms）。しかし、連鎖すると問題になります。

**例**: 親1 + 子10 + 孫50 = 合計61コンポーネント  
各コンポーネントの再レンダリングに2msかかると → **122ms** → ブラウザの1フレーム（16ms）を大きく超える。

結果: **カクつき、コマ落ち、入力遅延** が発生します。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__2c1376e693dad96c78ce547412298225" frameborder="0" height="373"></iframe>

---

## 5\. 不要な再レンダリングを可視化する方法

**方法1: React DevTools (ハイライト表示)**

**設定手順**:  
React DevTools → 歯車アイコン → General → ✅ `Highlight updates when components render.`

有効にすると、再レンダリングのたびにコンポーネントが色付きでハイライトされます。

**方法2: `why-did-you-render` ライブラリ**

```bash
npm i @welldone-software/why-did-you-render
```

```typescript
// setup.ts
import React from 'react';

if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    trackHooks: true,
    logOnDifferentValues: true,
  });
}
```

このライブラリは、props/stateが変わっていないのに再レンダリングされたコンポーネントを **コンソールに表示** します。

**方法3: `React.memo` + `console.log`**

```typescript
interface TodoItemProps {
  id: number;
  text: string;
}

const TodoItem = React.memo(({ id, text }: TodoItemProps) => {
  console.log(\`TodoItem ${id} 再レンダリング\`); // 不要な再レンダリングを検出
  return <li>{text}</li>;
});
```

---

## 6\. 最適化戦略：正しい優先順位

> **黄金律**: まず **コンポーネント構造とstateの配置** を見直す。メモ化（memo/useMemo/useCallback）は最後の手段。

| 優先度 | 戦略 | 内容 | いつ使うべきか |
| --- | --- | --- | --- |
| **1** | Stateをできるだけ下に移動 | Stateは実際に使うコンポーネントの近くに配置する。 | **常に** 最初に検討 |
| **2** | `children` パターン | 変化しにくいUI部分を `children` として渡し、親のstate変更の影響を避ける。 | 親の中にほとんど変化しない領域がある場合 |
| **3** | コンポーネント分割 | 大きなコンポーネントを小さく分割し、それぞれが独立したstateを持つようにする。 | コンポーネントが複雑で複数の役割を持つ場合 |
| **4** | `React.memo` | コンポーネントが **純粋** （結果がpropsのみに依存）で、propsが頻繁に変わらない場合。 | 上記1-3を試してもまだ問題が残る場合 |
| **5** | `useMemo` / `useCallback` | 重い計算のメモ化、またはメモ化した子に渡す関数/オブジェクトの参照安定化。 | 必要な時だけ（過剰使用は逆効果） |

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__8f4d664ade952e7bfa32947f63615107" frameborder="0" height="1065"></iframe>

---

## 7\. TypeScriptで見る実践例：Todoリスト（悪い設計 → 良い設計）

**シナリオ**  
Todoリストアプリ。フィルター（All/Active/Completed）とTodoリストを持つ。

---

**❌ 悪い例（不要な再レンダリング連鎖）**

```tsx
import React, { useState } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build app', done: false },
  ]);
  // ❌ このfilter stateはAppにある必要はない（TodoListだけが使う）
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <div>
      {/* ❌ 入力のたびにfilter変更 → App再レンダリング */}
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value as any)}
      />
      {/* ❌ TodoListも不要に再レンダリングされる */}
      <TodoList todos={todos} filter={filter} />
    </div>
  );
}

function TodoList({ todos, filter }) {
  console.log('TodoList 再レンダリング'); // filter変更のたびに表示される
  // ...
}
```

**問題点**:

- `filter` stateが `App` にあるため、入力のたびに `App` → `TodoList` と連鎖再レンダリング。
- `todos` が変わっていなくても `TodoList` が再実行される。

---

**✅ 良い例（Stateを下に移動 + memo）**

```tsx
import React, { useState, useCallback, useMemo } from 'react';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

// Appはtodosだけを管理
function App() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build app', done: false },
  ]);

  const addTodo = useCallback(() => {
    setTodos(prev => [...prev, { id: Date.now(), text: 'New', done: false }]);
  }, []);

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  }, []);

  return <TodoSection todos={todos} addTodo={addTodo} toggleTodo={toggleTodo} />;
}

// ✅ filter stateはこのコンポーネントだけが持つ
function TodoSection({ todos, addTodo, toggleTodo }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  return (
    <>
      <input
        type="text"
        value={filter}
        onChange={e => setFilter(e.target.value as any)}
      />
      <button onClick={addTodo}>追加</button>
      {/* ✅ memo化したTodoList */}
      <MemoizedTodoList todos={todos} filter={filter} toggleTodo={toggleTodo} />
    </>
  );
}

// ✅ React.memoでラップ
const MemoizedTodoList = React.memo(TodoList);

function TodoList({ todos, filter, toggleTodo }) {
  console.log('TodoList 再レンダリング → todos または filter が変わった時のみ');

  // ✅ useMemoでフィルタリング結果をメモ化
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === 'all') return true;
      if (filter === 'active') return !todo.done;
      return todo.done;
    });
  }, [todos, filter]);

  return (
    <ul>
      {filteredTodos.map(todo => (
        <MemoizedTodoItem key={todo.id} todo={todo} toggleTodo={toggleTodo} />
      ))}
    </ul>
  );
}

const MemoizedTodoItem = React.memo(TodoItem);

function TodoItem({ todo, toggleTodo }) {
  console.log(\`TodoItem ${todo.id} 再レンダリング → そのTodoが変わった時のみ\`);
  return (
    <li>
      <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
        {todo.text}
      </span>
      <button onClick={() => toggleTodo(todo.id)}>
        {todo.done ? '未完了' : '完了'}
      </button>
    </li>
  );
}
```

**改善結果**:

- フィルター入力 → `TodoSection` だけ再レンダリング（ `TodoList` は再レンダリングされない）
- Todo追加/完了 → 該当する `TodoItem` だけ再レンダリング
- UIがスムーズに動作する

---

## 8\. シニアエンジニア向けチェックリスト

**✅ State設計**

- Stateは **必要最低限の深さ** に配置している（リフトアップしすぎていない）
- 複数のコンポーネントで共有されないStateは、無理に親に持ち上げていない
- Contextは頻繁に変わる値と変わらない値を分離している

**✅ コンポーネント構成**

- `children` パターンを使って、変化しないUIを親の再レンダリングから守っている
- 大きなコンポーネントは適切に分割し、それぞれが独立した責任を持つ
- メモ化された子コンポーネントに渡す関数/オブジェクトは `useCallback` / `useMemo` で安定化している

**✅ メモ化（適切な使用）**

- `React.memo` は **純粋なコンポーネント** にのみ使用している
- `useMemo` は **計算コストの高い処理** にのみ使用している（軽い計算には不要）
- 過剰なメモ化（すべてのコンポーネントにmemo）は避けている

**✅ 監視**

- React DevToolsの「Highlight updates」を定期的に使用している
- 開発環境で `why-did-you-render` を有効にしている
- パフォーマンス問題が起きたら、まず再レンダリング回数を疑っている

---

## 9\. まとめと次回予告

**重要ポイントまとめ**

| 概念 | 説明 |
| --- | --- |
| **再レンダリング** | コンポーネント関数の再実行、仮想DOMの再計算。DOM更新とは異なる。 |
| **発生原因** | State変更、親の再レンダリング（デフォルト）、Context変更 |
| **デフォルト動作** | 親が再レンダリングされると、すべての子（および孫）も再レンダリングされる |
| **コスト** | 連鎖が大きくなると16msを超え、カクつきの原因になる |
| **最適化の優先順位** | State移動 ＞ childrenパターン ＞ 分割 ＞ memo ＞ useMemo/useCallback |

> 💡 **最終アドバイス**  
> パフォーマンス問題に直面したら、まず **構造** を見直してください。むやみに `memo` を貼る前に、stateの位置とコンポーネントの分割を検討することが、長期的に持続可能な解決策です。

---

👉 **次回予告（Part 10）**  
*\[Frontend Performance - Part 10\] memo / useMemo / useCallback の正しい使い方：React再レンダリング最適化*

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