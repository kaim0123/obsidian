---
title: "[Frontend Performance - Part 11] State設計最適化：無駄な再レンダリングを防ぐアーキテクチャ"
source: "https://qiita.com/tuanphan/items/5a8343dba7aa604f0a5b"
author:
  - "[[tuanphan]]"
published: 2026-05-05
created: 2026-05-09
description: "📝 注意 本記事はAIの補助を受けて編集しています。 内容は大規模Webアプリケーションの実務経験に基づいています。 📚 目次 1. 問題提起：なぜコードはきれいなのにUIが遅いのか？ 2. 「State Boundaries」 – stateの影響範囲を意識..."
tags:
  - "clippings"
---
[![ChatGPT Image May 5, 2026, 03_58_06 PM.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/4257107/1dac2231-157e-476f-948b-cc09b50190df.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F4257107%2F1dac2231-157e-476f-948b-cc09b50190df.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=e62d783c60ef9eb757f436c8524ba789)

---

> 📝 **注意**  
> 本記事はAIの補助を受けて編集しています。  
> 内容は大規模Webアプリケーションの実務経験に基づいています。

---

## 📚 目次

## 1\. 問題提起：なぜコードはきれいなのにUIが遅いのか？

あなたは `useMemo` 、 `useCallback` 、 `React.memo` をマスターしたはずなのに、なぜアプリはまだ遅いのでしょうか？

たった1つの小さなstateを変更しただけで、 **数十のコンポーネントが再レンダリング** される経験はありませんか？

> **問題は「状態管理のやり方」ではなく、「状態が *間違った場所* にあること」です。**

状態が高すぎる位置にあると、再レンダリングの範囲が不要に広がり、開発者はメモ化を乱用せざるを得なくなります。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__1f067b8a54149afac4b06e16f5e0fab8" frameborder="0" height="615"></iframe>

**具体例** ： `isSidebarOpen` という状態はサイドバーだけに影響するべきなのに、 `App` コンポーネントに置いてしまっている。サイドバーを開閉するたびに **アプリ全体** が再レンダリングされる。

Part 9とPart 10の知識を踏まえ、この記事では **「状態の配置」がいかに重要か** を解説します。適切な設計により、 **手動メモ化の必要性を大幅に減らす** ことができます。

---

## 2\. 「State Boundaries」 – stateの影響範囲を意識する

Dev.toのUIアーキテクト Ritu Rathin 氏の記事によると、 **State Boundaries** （状態の境界）はアーキテクトが最も理解すべき概念です。

> **State Boundaries** とは、ある状態がUIに影響を及ぼす範囲を定義するものです。

多くのReactアプリケーションで、 **不要な再レンダリングの原因はState Boundariesが広すぎること** にあります。コンポーネントの再レンダリングが多すぎる、遅すぎる、または予期せぬ動作をする場合は、まずState Boundariesを確認しましょう。

**❌ 悪い例**

```tsx
// ❌ 間違い：state user が App にある → 影響範囲が広すぎる
function App() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <>
      <Navbar user={user} />
      <Sidebar user={user} />
      <Dashboard user={user} />
      <Footer />
    </>
  );
}
```

`user` の小さな変更（アバター更新など）で、3つの大きなコンポーネントが再レンダリングされ、その子コンポーネントも巻き込まれます。

**✅ 正しい例**

```tsx
// ✅ 正しい：user は必要なコンポーネントだけに限定
function App() {
  return (
    <>
      <Navbar />        {/* user は不要 */}
      <Sidebar />       {/* user は不要 */}
      <UserSection />   {/* user はここだけ */}
      <Footer />
    </>
  );
}
```

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__d02a773cde1a70a42e7a550ae4b39222" frameborder="0" height="687"></iframe>

---

## 3\. ルール1：stateはできるだけ低い位置に置く

**基本原則** ：Stateは、それを使用するコンポーネントのできるだけ近く（可能な限り低い位置）に配置します。これを **State Colocation** と呼びます。

**例1：トグルボタン**

```tsx
// ✅ 正しい：stateをトグルコンポーネント自身に持たせる
function Toggle() {
  const [isOn, setIsOn] = useState(false);
  return <button onClick={() => setIsOn(!isOn)}>{isOn ? "ON" : "OFF"}</button>;
}
```

`isOn` というstateは、使うコンポーネントの **内部** にあります。他のコンポーネントには一切影響しません。

**例2：バリデーション付きフォーム (TypeScript)**

```tsx
interface LoginFormProps {
  onSubmit: (email: string, password: string) => void;
}

// ✅ 正しい：stateはLoginForm内部だけ
function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email.includes('@')) newErrors.email = 'メールアドレスが無効です';
    if (password.length < 6) newErrors.password = 'パスワードは6文字以上必要です';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(email, password);
  };

  return (/* JSX */);
}
```

> 📌 **原則** ：もしある値が **たった1つのコンポーネント** だけで必要なのなら、そのコンポーネントの中でstateを持つべきです。

---

## 4\. ルール2：Props drillingとその対処法

**Props drilling** とは、propsを必要としない中間コンポーネントを何層も経由して渡す現象です。

```tsx
// ❌ Props drilling – userがHeaderやNavbarを経由して渡される
function App() {
  const [user, setUser] = useState<User | null>(null);
  return <Header user={user} />;
}
function Header({ user }: { user: User | null }) {
  return <Navbar user={user} />;
}
function Navbar({ user }: { user: User | null }) {
  return <div>{user?.name}</div>; // ようやく使われる
}
```

**問題点** ： `Header` と `Navbar` は `user` が変更されるたびに再レンダリングされます。 **中間コンポーネントはpropsをただ受け流しているだけ** なのに。

**解決策1：Context**

```tsx
// ✅ Contextを使うと中間コンポーネントをスキップできる
const UserContext = createContext<User | null>(null);

function App() {
  const [user, setUser] = useState<User | null>(null);
  return (
    <UserContext.Provider value={user}>
      <Header />
    </UserContext.Provider>
  );
}
// Header は user を知らなくて良い
function Navbar() {
  const user = useContext(UserContext); // 直接取得
  return <div>{user?.name}</div>;
}
```

**解決策2：Children pattern**

```tsx
// ✅ Children pattern – 親コンポーネントはchildrenをレンダリングするだけ
function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div>
      <Sidebar isOpen={sidebarOpen} />
      <main>
        {/* children は sidebarOpen が変わっても再レンダリングされない */}
        {children}
      </main>
    </div>
  );
}
```

---

## 5\. ルール3：Context – 便利だが危険も伴う

Contextは両刃の剣です。props drillingを解決する強力な道具ですが、 **パフォーマンスの悪夢** を引き起こすこともあります。

**最大の問題** ： `useContext` を使用するすべてのコンポーネントは、 **Contextの値が変わるたびに再レンダリング** されます。たとえあなたが毎レンダリングで新しいオブジェクトを作成していても同じです。

```tsx
// ❌ 間違い：レンダリングのたびに新しいオブジェクト → 全consumerが再レンダリング
<UserContext.Provider value={{ user, setUser }}>
```

```tsx
// ✅ 正しい：useMemoで参照を安定化
const value = useMemo(() => ({ user, setUser }), [user]);
<UserContext.Provider value={value}>
```

**⚠️ 重要： `useMemo` は参照の安定化に過ぎない**

Providerのvalueを `useMemo` で包むことは、 **親コンポーネントの不要な再レンダリング** によって新しいオブジェクトが作られるのを防ぎます。これは基本的な最適化ですが、 **限界があります** 。

**もし `user` そのものが変更されたら** 、 `UserContext` を使うすべてのコンポーネントは再レンダリングされます。なぜならReactはContextの古い値と新しい値を比較するからです。 `useMemo` はオブジェクトの **参照（reference）** を安定化するだけであり、 **オブジェクトの中身が実際に変わった場合の再レンダリングは防げません** 。

そのため、頻繁に変更される状態には **Context splitting** （Context分割）または **selector-based store** （Zustand, Jotai）が重要になります。

**Context splitting – 巨大なContextの解決策**

Contextを関心ごとに分割します。

```tsx
// ✅ 正しい：関心ごとにContextを分割
const UserInfoContext = createContext<{ name: string; avatar: string } | null>(null);
const UserPreferencesContext = createContext<{ theme: 'light' | 'dark'; language: string } | null>(null);
```

アバターだけが変更された場合 → `UserInfoContext` を使うコンポーネントだけが再レンダリングされ、 `UserPreferencesContext` を使うコンポーネントは影響を受けません。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__62072d4ded4b86ffd8e88dff8b842976" frameborder="0" height="225"></iframe>

> 📌 **注意** ： `React.memo` はContextのconsumerの再レンダリングを **防げません** 。解決策は、メモ化＋Context分割＋Provider valueの安定化を組み合わせることです。

---

## 6\. 落とし穴：Lifting state up のしすぎと Derived State

**Lifting state up のしすぎ**

**Lifting state up** は、複数の子コンポーネントで状態を共有するために親に持ち上げる技法です。しかしやりすぎると：

- 影響範囲が広がる
- props drillingが発生する
- メモ化では救えない

**簡単なテスト** ：この状態は、本当に **すべての子コンポーネント** に必要なのか？それとも一部だけで良いのか？

**Derived State – 計算できるものを保存しない**

よくあるアンチパターンとして、 **他のデータから計算できるもの** をstateとして保存してしまうことがあります。これによりstale stateのリスクと複雑さが増します。

```tsx
// ❌ 間違い：fullName は derived state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(\`${firstName} ${lastName}\`);
}, [firstName, lastName]);
```

```tsx
// ✅ 正しい：レンダリング時に直接計算
const fullName = \`${firstName} ${lastName}\`;
```

**原則** ： **source of truth（唯一の真実源）** だけを保存しましょう。それから計算できるものはすべて **derived data** であり、stateにする必要はありません。

---

## 7\. UI State / Server State / Client Global State を区別する

状態管理が混乱する原因の一つは、異なる種類の状態を混同することです。

**📌 UI State (ローカルコンポーネント状態)**

- **例** ： `isModalOpen` 、 `activeTab` 、 `formInput` 、 `dropdownVisible`
- **置き場所** ：コンポーネント内部またはその近く
- **ツール** ： `useState` 、 `useReducer`

**📌 Server State (APIからのデータ)**

- **例** ：商品リスト、ユーザー情報、記事一覧
- **特徴** ：非同期、キャッシュ、再フェッチ、ミューテーションが必要
- **ツール** ：TanStack Query、SWR、RTK Query

**📌 Client Global State (広く共有される状態)**

- **例** ： `auth` 状態、 `theme` 、 `feature flags` 、共有UI状態
- **ツール** ：Zustand、Jotai、Context API（変更が少ないデータ向け）
<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__4b0a9feeaac29c7df42b5ec9b6e53d9b" frameborder="0" height="407"></iframe>

> 💡 **ヒント** ：APIデータを `useState` でloading/error込みで管理しているなら、 **TanStack Query** への移行を検討してください。ボイラープレートが70%減り、パフォーマンスも向上します。

---

## 8\. React 19における正しい状態管理ツールの選び方

Contextの数やstoreの数に「正しい数」はありません。実際のニーズに基づいて選びましょう。

| 状態の種類 | 推奨ツール | 備考 |
| --- | --- | --- |
| **ローカルUI状態** | `useState`, `useReducer` | ほとんどの状態はここから始めるべき |
| **サーバー状態** | TanStack Query, SWR | 自動キャッシュ、再フェッチ、ミューテーション |
| **変更の少ないグローバル状態** | Context API (+ splitting + memo) | `theme`, `auth`, `feature flags` |
| **変更の多いグローバル状態** | Zustand, Jotai | Contextより高性能 |
| **フォーム状態** | React Hook Form | 再レンダリング削減、バリデーション容易 |

**Zustand/JotaiがContextより高性能な理由**

Zustandはstoreを **コンポーネントツリーの外側** に保持し、コンポーネントは `useStore(selector)` で必要な部分だけを購読します。選択した値が変わったときだけ再レンダリングされます（シャロー比較）。

Jotaiは **atom** ベースの **granular subscription** メカニズムを使用し、実際に使っているatomが変わったコンポーネントだけが再レンダリングされます。

技術的には、Zustandなどのライブラリは `useSyncExternalStore` （React 18の公式フック）を使った **external store subscription model** に基づいています。これにより、Contextのように全consumerが再レンダリングされることなく、 **必要な部分だけを更新** できるのです。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__29ac99595ef5ed7011f4809f0893359e" frameborder="0" height="557"></iframe>

---

## 9\. AIと状態管理：リファクタリングを支援するが、設計は人間が決める

2026年、AIはプログラミング支援で大きく進化しましたが、その限界も理解する必要があります。

**React Compiler：メモ化の自動化**

React Compiler（旧称 "React Forget"）は **opt-in** 方式で徐々に **production-ready** になりつつあります。多くのチームが本番環境で試験的に導入しています。Compilerはビルド時に自動的にメモ化を追加し、 `useMemo` 、 `useCallback` 、 `React.memo` を手書きする必要性を減らします。

しかし、Compilerは **まだ再レンダリングや状態配置の理解を完全に不要にするものではありません** 。State Colocationや過度なLifting state upを避けるといった原則は依然として基本です。

**AIは状態設計の問題を発見するのに役立つ**

**Copilot、Cursor、Claude Code** のようなツールは次のことができます：

- props drillingを検出してstateのcolocateを提案
- 大きすぎるコンポーネントの分割を提案
- 不要なderived stateを発見

しかし、AIはまだ **ビジネスドメイン全体の理解** 、 **将来のスケーラビリティの予測** 、 **アーキテクチャの境界決定** を人間の代わりにできるほど賢くありません。

> 📌 **AIは強力なリファクタリング支援ツールですが、最終的なアーキテクチャの決定権はあなたにあります** 。

---

## 10\. 実践例：State配置の改善でDashboardを高速化する

**シナリオ**

ユーザープロフィール、商品リスト、フィルタリングサイドバーを持つダッシュボード。ユーザーからの報告：

- 検索ボックスに入力するたびに **ダッシュボード全体がカクつく**
- タブ切り替えも同様に遅い

**🔎 原因分析**

```tsx
// ❌ filter state が App（ルートコンポーネント）にある
function App() {
  const [filter, setFilter] = useState('');
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  //...
  return (
    <Header user={user} />
    <SearchBar filter={filter} setFilter={setFilter} />
    <ProductSection filter={filter} products={products} />
    <Footer />
  );
}
```

**問題** ：filter stateが `App` にある → キー入力のたびに `Header` と `Footer` まで再レンダリングされる（関係ないのに）。

**✅ 解決策：stateを必要な場所の近くに移動**

```tsx
function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  return (
    <>
      <Header user={user} />
      {/* filter state は ProductSection 内部に */}
      <ProductSection products={products} />
      <Footer />
    </>
  );
}

function ProductSection({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState(''); // ✅ 影響範囲をProductSection内に限定

  // ✅ 直接計算（productsが非常に大きく、フィルタ計算が重い場合のみuseMemoを検討）
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <SearchBar filter={filter} setFilter={setFilter} />
      <ProductList products={filteredProducts} />
    </div>
  );
}
```

**結果** ：検索ボックス入力時の再レンダリングが `ProductSection` 内だけに限定され、 `Header` と `Footer` は無駄に再レンダリングされなくなりました。UIが格段にスムーズになりました。

---

## 11\. アーキテクト向けチェックリスト

**✅ 状態の配置を評価する**

- 状態は **可能な限り低い位置** に置かれているか？（colocation）
- 小さな変更で多くの無関係なコンポーネントが再レンダリングされていないか？
- derived data（計算可能なもの）をstateにしていないか？

**✅ 状態の種類を分類する**

- UI state / Server state / Client global state を区別しているか？
- Server state は TanStack Query / SWR に移行済みか？
- 変更頻度の高いグローバル状態に Context を使っていないか？

**✅ Props drilling に対処する**

- propsをただ受け流すだけの中間コンポーネントがないか？
- もしあれば、Context または children pattern を検討する。
- 2段階以上不要にpropsを渡していないか？

**✅ Context**

- Contextのvalueは巨大なオブジェクトになっていないか？ → 分割する（splitting）
- Provider valueを `useMemo` で安定化しているか？（ただし `useMemo` は参照安定化に過ぎず、値そのものが変わった場合の再レンダリングは防げないことを理解する）
- Context consumerに `React.memo` を適用しても意味がないことを理解しているか？

**✅ AIとの付き合い方**

- AIツール（Copilot, Cursor）でprops drillingやstate colocationの機会を発見しているか？
- **AIの提案は必ず人間がレビューする** – AIは支援ツールであり、設計者はあなたです。

---

## 12\. まとめと次回予告

| ルール | 内容 |
| --- | --- |
| **State colocation** | 状態はできるだけ低く、使う場所の近くに。 |
| **Props drilling を避ける** | Context や children pattern を活用する。 |
| **Context splitting** | Contextは分割し、valueはuseMemoで安定化する。 |
| **Lifting state up はほどほどに** | 本当に必要なときだけ状態を引き上げる。 |
| **Derived state を避ける** | 計算できるものはstateにしない。 |
| **状態の種類を区別する** | UI / Server / Global client に分けて適切なツールを選ぶ。 |
| **AIは補助役** | AIはリファクタリングを支援するが、アーキテクチャは人間が決める。 |

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__84d736c52fe8dd90b5036323ba28f88e" frameborder="0" height="1038"></iframe>

---

👉 **次回予告（Part 12）** ：  
**\[Frontend Performance - Part 12\] React最適化の完成：再レンダリング・メモ化・State設計を完全制覇**

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