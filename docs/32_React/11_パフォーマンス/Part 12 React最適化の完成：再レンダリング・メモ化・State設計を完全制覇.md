---
title: "[Frontend Performance - Part 12] React最適化の完成：再レンダリング・メモ化・State設計を完全制覇"
source: "https://qiita.com/tuanphan/items/b05513ade79cef735f90"
author:
  - "[[tuanphan]]"
published: 2026-05-06
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 0. はじめに：「メモ化すればいい」という誤解を超えて 1. Reactパフォーマンスの三本柱 2. アーキテクチャがパフォーマンスを..."
tags:
  - "clippings"
---
[![ChatGPT Image May 6, 2026, 10_47_03 AM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/ca3a8db2-af0d-4c6c-b6b8-b02c39a636d0.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2Fca3a8db2-af0d-4c6c-b6b8-b02c39a636d0.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=bb5a1109c72a594380ac2903c0e77c81)

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 0\. はじめに：「メモ化すればいい」という誤解を超えて

こんな経験はありませんか？

- すべてのコンポーネントを `React.memo` で包んだのに、アプリがカクつく
- すべての関数を `useCallback` で包んだのに、パフォーマンスが改善しない
- `useMemo` を乱用しているのに、リスト描画が遅い

これはあなたのせいではありません。これはReactの最適化に関する **最も一般的な誤解** です：

> **「メモ化を追加すればアプリは速くなる」**

**真実** ：もしstateの置き場所が間違っていて、データフローの設計が悪ければ、 **メモ化を追加しても問題の根本解決にはなりません** 。

**Part 9** では **なぜコンポーネントが再レンダリングされるのか** を説明しました。  
**Part 10** では **メモ化が本当に効果を発揮するのはいつか** を示しました。  
**Part 11** では **stateをどこに置くべきか** を教えました。

**Part 12** は **新しい知識を追加するものではありません** 。  
これは **全体をまとめる地図** であり、 **体系的な方法でReactの最適化を決定する方法** を提供します。

---

## 1\. Reactパフォーマンスの三本柱

これまでの3つのパートで、次の3つの基礎知識を学びました。

**柱1：再レンダリングの理解（Part 9）**

- **コンポーネントはいつ再レンダリングされるのか？** state変更、親の再レンダリング、context変更。
- **Reactのデフォルト動作** ：親が再レンダリングされると、propsが変わっていなくても子ツリー全体が再レンダリングされる。
- **結果** ：小さな変更でも多くの無関係なコンポーネントが再レンダリングされる。

**柱2：正しいメモ化の使い方（Part 10）**

- `React.memo` ： **親からの再レンダリング** のみをスキップする。内部stateやcontextは防げない。
- `useCallback` ：関数の参照を安定化する – **メモ化された子に渡す場合に重要** 。
- `useMemo` ： **コストの高い計算** または **オブジェクト参照の安定化** にのみ使用する。
- **重要** ：メモ化には比較コストとメモリコストが伴う。

**柱3：State設計（Part 11）**

- **State colocation** ：stateはできるだけ低く、使う場所の近くに置く。
- **stateの分類** ：UI state、Server state、Client global state – それぞれに適したツールがある。
- **Contextはstate管理ではない** ：Contextは変更の少ないデータに適し、変更頻度が高い場合はZustand/Jotaiを使う。
- **props drillingを避ける** ：childrenパターンまたはContextを使用する。

これらの三本柱は **独立しているのではなく、相互に補完し合います** 。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__1602416aeedfd42b80391cdaff60b25c" frameborder="0" height="364"></iframe>

---

## 2\. アーキテクチャがパフォーマンスを決める

**2.1. React最適化の優先順位**

```text
State colocation > childrenパターン > コンポーネント分割 > メモ化
```

最初のステップを飛ばしていきなりメモ化に取り組むと、 **症状を治療しているだけで、病気を治しているわけではありません** 。

**2.2. よくある間違い**

| 間違い | 結果 |
| --- | --- |
| stateがコンポーネントツリーの高すぎる位置にある | 再レンダリングが広範囲に波及し、無関係な多くのコンポーネントに影響 |
| 巨大なオブジェクトのContextを頻繁に変更している | contextを使うすべてのコンポーネントが再レンダリング |
| 参照を安定化せずにobject/arrayを子に渡している | `React.memo` が無効になり、比較が常に失敗 |
| レンダリングごとに依存配列が変わる `useCallback` | メリットがなく、追加コストだけが発生 |
| 軽い計算（文字列結合など）に `useMemo` を使っている | メモ化のコストがメリットを上回る |

> **ContextとZustand/Jotaiのパフォーマンス比較** ：大規模なダッシュボードでは、頻繁に変更されるContext APIの値は、すべてのconsumerが同じ値にsubscribeするため、広範囲の再レンダリングを引き起こす可能性があります。ZustandやJotaiのようなライブラリは、sliceやstate atom単位でのsubscriptionメカニズムにより、再レンダリングされるコンポーネントの数を大幅に削減します。この差はコンポーネント数が増えるほど顕著になります。

**2.3. 例：stateが間違った場所にある場合**

```tsx
// 間違い：filter stateがAppにある – アプリ全体に影響
function App() {
  const [filter, setFilter] = useState('');
  const [products, setProducts] = useState([]);
  return (
    <>
      <Header />          // フィルター入力のたびに再レンダリング
      <SearchBar filter={filter} setFilter={setFilter} />
      <ProductList products={products} filter={filter} />
      <Footer />          // フィルター入力のたびに再レンダリング
    </>
  );
}

// 正しい：stateは必要な場所だけに
function App() {
  const [products, setProducts] = useState([]);
  return (
    <>
      <Header />
      <ProductSection products={products} />
      <Footer />
    </>
  );
}

function ProductSection({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState(''); // ProductSection内だけに影響
  return (
    <>
      <SearchBar filter={filter} setFilter={setFilter} />
      <ProductList products={products} filter={filter} />
    </>
  );
}
```

**結果** ：フィルター入力による再レンダリングは `ProductSection` 内だけに限定される。 `Header` と `Footer` は影響を受けない。

---

## 3\. メモ化はいつ使うべきか？（そして使うべきでない時）

**3.1. React.memo**

**使用すべき場合** ：

- コンポーネントが **純粋** （結果がpropsのみに依存する）
- propsの変更頻度が **低い**
- レンダリングコストが **React DevTools Profilerで明確に確認できるほど大きい**
- 計測して問題と確認できた場合

**重要** ： `React.memo` は **親からの再レンダリング** をスキップするが、内部stateやcontextによる再レンダリングは防げない。

```tsx
// 良い例：重いレンダリングのコンポーネントをmemo化
const ExpensiveChart = React.memo(({ data }: { data: ChartData }) => {
  return <div>{/* 複雑なグラフ描画 */}</div>;
});

// 不要な例：軽すぎるボタンにmemoはコスト増
const Button = React.memo(({ onClick, label }: { onClick: () => void; label: string }) => {
  return <button onClick={onClick}>{label}</button>;
});
```

**3.2. useCallback**

**使用すべき場合** ：

- 関数を **`React.memo` で包まれた子コンポーネント** に渡す
- 関数が **`useEffect` の依存配列** に含まれる

**使用すべきでない場合** ：

- DOMイベントハンドラ（メモ化された子がない場合）
- メリットがない場合

```tsx
// 必要：子がメモ化されている
const MemoizedChild = React.memo(Child);

function Parent() {
  const onSelect = useCallback((id: string) => {
    console.log(id);
  }, []);
  return <MemoizedChild onSelect={onSelect} />;
}

// 不要：子がメモ化されていない
function Parent() {
  const onClick = () => setOpen(true);
  return <button onClick={onClick}>開く</button>;
}
```

**3.3. useMemo**

**使用すべき場合** ：

- **コストの高い計算** （数千件のフィルタリング・ソート、大きなループ） – メモ化なしで顕著な遅延を感じられる場合
- **オブジェクト/配列の参照安定化** （メモ化された子に渡すため）

**使用すべきでない場合** ：

- 軽い計算（文字列結合、単純な四則演算）
- 「念のため」の使用

```tsx
// 適切：10,000件のフィルタリング（遅延を感じられる）
const filteredList = useMemo(() => {
  return hugeList.filter(item => item.name.includes(keyword));
}, [hugeList, keyword]);

// 適切：オブジェクト参照の安定化
const config = useMemo(() => ({ theme: 'dark' }), []);

// 不要：軽すぎる計算
const fullName = useMemo(() => firstName + ' ' + lastName, [firstName, lastName]);
```

**3.4. 再レンダリングは常に悪いわけではない**

よくある誤解：

> **「再レンダリング ＝ パフォーマンス問題」**

実際には、Reactは非常に頻繁な再レンダリングを前提に設計されています。

小さなコンポーネントでレンダリングが単純な場合、再レンダリングのコストはむしろ以下のものよりも安いことがあります：

- `React.memo` のシャロー比較コスト
- `useMemo` のキャッシュ保持コスト
- メモ化コードのデバッグの複雑さ

**重要なのは** 「再レンダリングがあるかどうか」ではなく、 **「その再レンダリングが実際にコスト高かどうか」** です。

これがReactチームが常に強調する理由です：

> **「計測してから最適化せよ。」**

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__0bab1fda183a8d838c3ca9a2984a1243" frameborder="0" height="1223"></iframe>

---

## 4\. 意思決定フレームワーク

Reactでパフォーマンス問題に遭遇したら、次の順序で進めてください。

**ステップ1：計測 – データなくして最適化なし**

- **React DevTools Profiler** を使って、どのコンポーネントが遅いか特定する。
- React DevToolsの **「Highlight updates」** を有効にして、どのコンポーネントが再レンダリングされているか視覚化する。
- `why-did-you-render` を使って、不必要な再レンダリングを検出する。

> **高度なヒント（React 19.2以降）** ：ReactにはChrome DevToolsに統合された **Performance Tracks** があり、Scheduler、コンポーネントレンダリング、サーバー活動の詳細なタイムラインを表示します。ConcurrentレンダリングやSSRの問題のデバッグに役立ちます。

**ステップ2：stateアーキテクチャを評価する**

- stateは **可能な限り低い位置** にあるか？
- propsを受け流すだけの中間コンポーネントはないか？ → Contextまたはchildrenパターン。
- **derived state** （直接計算可能なもの）をstateにしていないか？

**derived stateの例** ：

```tsx
// 冗長なstate – メモリ消費とバグの原因
const [filteredUsers, setFilteredUsers] = useState([]);
useEffect(() => {
  setFilteredUsers(users.filter(u => u.active));
}, [users]);

// 派生データ – 直接計算、別途state不要
const filteredUsers = users.filter(u => u.active);
```

> Derived stateは同期バグや不要な再レンダリングの原因になりがちです。他のstateから計算できるデータは、新しいstateとして保存するのではなく、優先的に派生させましょう。

**ステップ3：Contextを評価する**

- Contextの値は頻繁に変更されすぎていないか？
- **Context splitting** （小さなContextに分割）は可能か？
- Providerのvalueは `useMemo` で安定化されているか？

**ステップ4：stateを分類する**

- **UI state** （isModalOpen, activeTab）→ `useState` / `useReducer`
- **Server state** （APIからのデータ）→ TanStack Query / SWR
- **Client global state** （auth, theme）→ Context（変更少ない場合）/ Zustand / Jotai（変更多い場合）

**ステップ5：必要に応じてメモ化を適用する**

- `React.memo` → pure component + props変更少ない + レンダリングコスト大
- `useCallback` → メモ化された子に関数を渡す場合
- `useMemo` → コストの高い計算 または object/array参照の安定化が必要な場合

---

## 5\. React Compilerと最適化の未来

**5.1. React Compilerとは？**

**React Compiler** はReact 19で安定版がリリースされ、 **opt‑in** で利用できるビルド時ツールです。Next.js 16（バージョン15.3.1以降）で完全サポートされています。以前は「React Forget」と呼ばれていました。このツールはコードを解析し、 **コンパイル時にメモ化を自動化** します – 開発者が手動で `React.memo` 、 `useMemo` 、 `useCallback` を書く代わりに、参照の安定性やレンダリングキャッシュの最適化を自動で適用します。

Compilerはビルド設定で有効化でき（opt‑in）、すでに多くのチームが本番環境で成功裏にテストしています。

**5.2. React Compilerは何を変えるのか？**

これまでは、いつ `useMemo` / `useCallback` を使うか自分で決める必要があり、間違えやすかった。React Compilerはコンパイル時に同等の技術を自動適用し、次のことを実現します：

- 最適化可能なコンポーネントを自動判別
- 参照の安定化とJSX/値/関数のキャッシュを有利な場合に実施
- 手動メモ化の必要性を大幅に削減

**ただし、React Compilerは良いアーキテクチャを代替しない** 。

> React Compilerを使っていても、次の3つの問いは依然として極めて重要です：
> 
> 1. stateは正しい場所にあるか？
> 2. Contextは乱用されていないか？
> 3. stateは適切に分類されているか？

React Compilerは手動メモ化を減らす手助けをしますが、 **悪いstate設計を修正することはできません** 。メモ化を自動化する強力なツールですが、 **アーキテクチャ戦略は依然として人間が決定する** 必要があります。

**5.3. React Compilerを使うべきか？**

- **新規プロジェクト** ：React Compilerを最初から有効にすることを強く推奨。安定版は本番環境で使用可能。
- **既存プロジェクト** （手動で最適化済み）：Compilerはメモ化が不足している箇所を発見するのに役立つ。
- ただし、 **悪いstate設計を補うためにCompilerを使うべきではない** 。
<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__b2cc2a9007ac1a6ed300edbae9a597aa" frameborder="0" height="226"></iframe>

---

## 6\. 最後の教訓：計測してから最適化せよ

**6.1. パフォーマンスに対する正しい考え方**

- **パフォーマンス ≠ 「とにかくuseMemoを追加する」** 。
- パフォーマンスとは **「システムを設計して不必要な作業を避けること」** 。
- 時期尚早な最適化はメリットよりも害をもたらす可能性がある。

**6.2. 「計測 → 分析 → 最適化 → 検証」のプロセス**

1. **計測** ：Profilerを使ってレンダリング時間を記録する。
2. **分析** ：どのコンポーネントが遅いか、なぜ遅いかを特定する。
3. **最適化** ：適切な解決策（state colocation、メモ化など）を適用する。
4. **検証** ：再度計測し、最初のデータと比較する。

計測なしの最適化は **暗闇の中での最適化** – 自分が正しいことをしているのか間違っているのかわからない。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__248a9b13f8a354d4f99280d47b8debee" frameborder="0" height="188"></iframe>

---

## 7\. アーキテクト向けチェックリスト

**プロジェクト開始前**

- state管理戦略をチームで合意する：UI state、Server state、Client global state。
- コンポーネントツリーとstateの境界を明確に設計する。
- 適切なツールを選ぶ（Server state → TanStack Query、Client global state → Zustand/Jotai）。

**開発中**

- stateは **可能な限り低い位置** に置かれているか（colocation）。
- propsを受け流すだけの中間コンポーネントがないか。
- 不要なderived stateを避けているか（優先的に直接計算）。
- Contextは分割され、providerのvalueは `useMemo` で安定化されているか。
- `React.memo` は pure component + props変更少ない + レンダリングコスト大の場合のみ使用。
- `useCallback` はメモ化された子に関数を渡す場合のみ使用。
- `useMemo` はコストの高い計算またはオブジェクト/配列の参照安定化が必要な場合のみ使用。

**パフォーマンス問題に遭遇したとき**

- **React DevTools Profilerで計測済みか？** （未なら最適化を始めてはいけない）
- stateの位置を確認したか？（state colocation）
- props drillingを確認したか？
- UI state / Server state / Client global stateを区別したか？
- React Compilerでメモ化を自動化することを検討したか？

---

## 8\. まとめと次回予告

**主要ポイントまとめ**

| 概念 | 内容 |
| --- | --- |
| **三本柱** | 再レンダリング（Part 9）、メモ化（Part 10）、State設計（Part 11） |
| **最適化の優先順位** | State colocation > childrenパターン > 分割 > メモ化 |
| **React.memo** | 親からの再レンダリングをスキップ。内部stateやcontextは防げない |
| **useCallback** | 関数参照の安定化。メモ化された子に渡す場合のみ使用 |
| **useMemo** | コストの高い計算またはオブジェクト/配列の参照安定化にのみ使用 |
| **Derived state** | 直接計算できるものをstateに保存しない |
| **stateの分類** | UI state / Server state（TanStack Query）/ Client global state（Zustand/Jotai/Context） |
| **React Compiler** | React 19で安定版、opt‑in、コンパイル時のメモ化自動化 |
| **再レンダリングの考え方** | 再レンダリング＝常に悪いわけではない – 重要なのはコスト |
| **最適化プロセス** | 計測 → 分析 → 最適化 → 検証 |

> Reactの最適化は「フックをたくさん追加すること」ではなく、 **Reactが行う作業量を減らすこと** であり、その最も効果的な方法はメモ化ではなく **アーキテクチャ** にあります。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__9ed9ee6fcb9ed82786356995a6f443bd" frameborder="0" height="1074"></iframe>

---

👉 **次回予告**  
**\[Frontend Performance - Part 13\] 初期ロード最適化：Code SplittingとLazy Loading設計**

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