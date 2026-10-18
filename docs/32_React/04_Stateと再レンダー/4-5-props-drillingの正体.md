# 4-5. props drillingの正体（何がつらいのか）

## 🎯 この章で学ぶこと

- props drilling（プロップスドリリング）とは何か
- なぜつらいのか、どんな症状になるか
- 解決の選択肢（state lifting / Context / 状態管理ライブラリ）

---

## 📖 概念の説明

### props drilling とは

「**深い階層のコンポーネントに値を届けるため、間のコンポーネント全部にpropsをバケツリレーする**」状態。

```text
App
 └─ Page
     └─ Section
         └─ List
             └─ Item     ← ここで使いたい値
```

`App` にあるユーザー情報を `Item` に渡したい。途中のすべてのコンポーネントを経由して props を引き回します。

```jsx
function App() {
  const [user, setUser] = useState(...);
  return <Page user={user} />;
}

function Page({ user }) {
  return <Section user={user} />;       // 中継するだけ
}

function Section({ user }) {
  return <List user={user} />;          // 中継するだけ
}

function List({ user }) {
  return <Item user={user} />;          // 中継するだけ
}

function Item({ user }) {
  return <p>{user.name}</p>;            // ★ここでやっと使う
}
```

→ **間のコンポーネントは user を使わないのに引き回している**。これが props drilling。

**補足:** 親が `useState` で持った値と更新関数を子へ渡すパターン自体は、[[3-2-関数コンポーネント]] で触れたコールバックとして普通に使います。問題になりやすいのは、**中間のコンポーネントが値を使わず「ただ渡すだけ」が連鎖する規模**です。

---

### なぜつらい？

1. **追加・変更が大変**：1つpropsを足すたび、間のコンポーネント全部を直す
2. **理解しづらい**：`Section` のpropsを見ても、何のために `user` があるのか分からない
3. **再利用しにくい**：`Section` を別の場所で使うとき、不要な user を渡す必要がある
4. **TypeScriptの型を毎回書く**：propsの型を中継分も書くのが面倒

---

## 💻 解決策の選択肢

### 解決1：state lifting（状態を持ち上げる）

そもそも、深い階層に流す必要があるか考える。**使う場所の近くにstateを置く**だけで解決することも多い。

```jsx
// before：上に置いていた
function App() {
  const [searchText, setSearchText] = useState('');
  return <Page searchText={searchText} setSearchText={setSearchText} />;
}

// after：使う場所の近くに移動
function SearchBar() {
  const [searchText, setSearchText] = useState('');
  // ここで完結
}
```

→ 詳しくは [[8-1-まずはReactだけで]]。

---

### 解決2：Context（コンテキスト）

「**家族の中で共有する伝言板**」のようなもの。Provider で値を提供し、useContext で受け取る。

```jsx
// 1. Context を作る
const UserContext = createContext(null);

// 2. Provider で値を流す
function App() {
  const [user, setUser] = useState({ name: '太郎' });
  return (
    <UserContext.Provider value={user}>
      <Page />
    </UserContext.Provider>
  );
}

// 3. 中間は何もしない
function Page() {
  return <Section />;
}
function Section() {
  return <Item />;
}

// 4. 必要な場所で取り出す
function Item() {
  const user = useContext(UserContext);
  return <p>{user.name}</p>;
}
```

→ 詳しくは [[8-3-Context]]。

---

### 解決3：状態管理ライブラリ

Context が増えてきたり、複雑になってきたら、**Zustand / Redux** などのライブラリを使う。

```jsx
// Zustand 例
import { create } from 'zustand';

const useUser = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

function Item() {
  const user = useUser((state) => state.user);
  return <p>{user?.name}</p>;
}
```

→ 詳しくは [[8-5-状態管理ライブラリ概観]]。

---

## 💡 どれを選ぶ？

```text
深い階層に値を渡したい？
  ├─ NO → 普通にprops でOK
  └─ YES
       ├─ 同じ画面の中なら → state lifting で十分
       ├─ アプリ全体で使う（テーマ、ログインユーザーなど）→ Context
       └─ 複雑な共有状態（カート、フォームなど）→ Zustand など
```

---

## 💻 props drilling の見分け方

### サイン

- propsが3階層以上「中継だけ」されている
- 間のコンポーネントが**そのpropsを直接使っていない**
- propsを追加するたび、複数ファイルを直す
- TypeScriptで `Pick`/`Omit` で型を取り回している

### 例：判定してみる

```jsx
function Modal({ isOpen, onClose, theme }) {
  return (
    <ModalBody theme={theme}>{/* themeを使うのはここ */}
      <CloseButton onClose={onClose} theme={theme}>
        {/* CloseButton自体はthemeを使わないのに渡している */}
      </CloseButton>
    </ModalBody>
  );
}
```

`CloseButton` が `theme` を使わずに `Button` に流すだけなら、Context化を検討。

---

## ❌ よくある間違い

### すぐにContext を使う

→ シンプルなアプリだとオーバーキル。**まずstate lifting**を試す。

### Context を1つに全部詰める

```jsx
// ❌ 巨大すぎる
<AppContext.Provider value={{ user, theme, cart, modal, ...全部 }}>
```

→ 関心ごとに分ける（UserContext、ThemeContext、CartContext...）。

### Context のせいで全コンポーネントが再レンダー

→ Context の値が変わると、それを使う全コンポーネントが再レンダーする。詳しくは [[8-3-Context]]。

---

## ✅ ベストプラクティス

1. **まずはprops で書いてみる**（深さ2-3階層なら問題なし）
2. **「中継だけ」が4階層を超えたら**、解決を検討
3. **state liftingで解決できるか**まず考える
4. アプリ共通の値（ユーザー、テーマ）は **Context**
5. 複雑な共有状態は **状態管理ライブラリ**

---

## 🔬 実践演習

3階層のコンポーネントを作って、最下層に「現在のテーマ（dark/light）」を渡してください。

1. props で渡す版
2. Context で渡す版

両方書いて、コードの読みやすさを比較してください。

---

## 📝 まとめ

- props drilling = 中継だけのpropsバケツリレー
- 追加・変更が大変、再利用しにくい
- まずはstate lifting、深いならContext、複雑なら状態管理ライブラリ
- 浅い階層なら普通のpropsで十分

---

## 🔗 関連ページ

- [[3-2-関数コンポーネント]]
- [[1-4-宣言的UI・一方向データフロー]]
- [[8-1-まずはReactだけで]]
- [[8-3-Context]]
- [[8-5-状態管理ライブラリ概観]]
