# 6-1 React Routerの導入と基本

## 🎯 この章で学ぶこと

- ルーティング（routing）とは何かを理解できます
- なぜReact単体ではなく `react-router-dom` が必要なのかが分かります
- `BrowserRouter`、`Routes`、`Route`、`Link` の役割を覚えられます
- 基本的なページ切り替えを自分で実装できるようになります
- `useNavigate` でプログラム的にページを移動する方法を知ります

## 📖 概念の説明

### ルーティングって何？

**ルーティング（routing）** とは、URLに応じて表示する画面を切り替える仕組みのことです。

例えるなら、**会社の受付** のようなものです。お客さんが「営業部にお願いします」と言えば営業部のフロアへ、「経理部に」と言えば経理部のフロアへ案内する。URLが「どこに行きたいか」、ルーターが「案内係」です。

たとえば次のようなURLがあったとします。

- `/` → ホームページ
- `/about` → 会社紹介ページ
- `/users/123` → ユーザー詳細ページ
- `/login` → ログインページ

「URL → 表示すべきコンポーネント」のマッピングを定義するのがルーターの仕事です。

### なぜReactだけでは足りないの？

Reactは「画面を作る」ためのライブラリです。URLとの連動は **Reactの守備範囲外** なので、別のライブラリが必要になります。それが **react-router-dom** です。

似たライブラリには TanStack Router、Wouter などもありますが、最もメジャーなのが react-router-dom（v6 / v7）です。本章ではv6の文法を扱います。

### SPA（Single Page Application）とルーター

通常のWebサイトは、ページを移動するたびにサーバーにHTMLを取りに行きます（マルチページ）。一方、Reactで作るアプリは **SPA（Single Page Application）** と呼ばれ、最初に1度だけHTMLを読み込んで、あとはJavaScriptで画面を切り替えます。

この「JavaScriptで画面を切り替える」のがルーターの役目です。URLは変わりますが、サーバーへの再リクエストはありません。**ブラウザバックも進むも効くし、URLをコピペしてシェアもできる** のが特徴です。

### 主な登場人物（v6）

| 名前 | 役割 |
|---|---|
| `BrowserRouter` | アプリ全体をルーティング対応にする外殻 |
| `Routes` | 複数の `Route` をまとめる箱 |
| `Route` | 1つのURLパターンと1つのコンポーネントを結びつける |
| `Link` | クリックでページ移動する `<a>` の代わり |
| `useNavigate` | コードからページ移動するためのフック |
| `useParams` | URLの動的な部分を取得するフック |

### 用語の整理

- **ルート（route）**：「URLパターン と 表示コンポーネント」の対応
- **パス（path）**：URLの `/` 以降の文字列。`/users/123` のような形
- **ナビゲーション（navigation）**：ページの移動
- **SPA**：1ページで動的に画面を切り替えるアプリ

## 💻 コード例

### 例1：インストール

```bash
npm install react-router-dom
```

### 例2：もっとも基本的な構成

```jsx
// main.jsx（または index.jsx）
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
```

`BrowserRouter` でアプリ全体を包むことで、ルーティング機能が使えるようになります。

```jsx
// App.jsx
import { Routes, Route, Link } from 'react-router-dom';

function Home() { return <h1>ホーム</h1>; }
function About() { return <h1>会社紹介</h1>; }
function Contact() { return <h1>お問い合わせ</h1>; }

export default function App() {
  return (
    <div>
      {/* ナビゲーションリンク */}
      <nav>
        <Link to="/">ホーム</Link>{' | '}
        <Link to="/about">会社紹介</Link>{' | '}
        <Link to="/contact">お問い合わせ</Link>
      </nav>

      {/* ルートの定義 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
}
```

ポイント：

- `<Link to="/about">` は `<a href="/about">` の代わり。**ページがリロードされず**、SPAらしい高速な切り替えになります。
- `<Routes>` の中の `<Route>` のうち、現在のURLにマッチした1つだけがレンダリングされます。
- `element` propsには **JSX要素を渡す**（コンポーネント自体ではなく `<Home />` のように）。

### 例3：プログラム的にページ移動する

```jsx
import { useNavigate } from 'react-router-dom';

function LoginButton() {
  const navigate = useNavigate(); // ナビゲーション関数を取得

  const handleLogin = async () => {
    await api.login();
    navigate('/dashboard'); // ログイン成功後にダッシュボードへ
  };

  return <button onClick={handleLogin}>ログイン</button>;
}
```

`navigate('/somewhere')` でページ移動できます。第2引数で詳細指定も可能。

```jsx
navigate('/dashboard', { replace: true }); // 履歴を置き換え（戻るボタンで戻れない）
navigate(-1); // 1つ前に戻る（ブラウザバックと同じ）
navigate(1);  // 1つ進む
```

### 例4：ルートと現在の画面の関係

```jsx
function App() {
  return (
    <BrowserRouter>
      {/* ヘッダーは常に表示 */}
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>

      {/* フッターも常に表示 */}
      <Footer />
    </BrowserRouter>
  );
}
```

`<Routes>` の **外** に書いたコンポーネントは、URLが変わっても表示され続けます。共通レイアウトを作るときに使うパターンです（次章で詳しく）。

### 例5：active な Link をハイライトする（NavLink）

```jsx
import { NavLink } from 'react-router-dom';

<NavLink
  to="/about"
  className={({ isActive }) => isActive ? 'active' : ''}
>
  会社紹介
</NavLink>
```

`NavLink` は `Link` の上位互換で、現在のURLとマッチしているときに自動でクラスを付けてくれます。

## ❌ よくある間違い

### 1. `<a href="/about">` を使ってしまう

```jsx
// ❌ ページがリロードされる
<a href="/about">会社紹介</a>

// ✅ Linkを使う
<Link to="/about">会社紹介</Link>
```

`<a>` だとブラウザがフルロードしてしまい、SPAの利点が消えます。

### 2. `BrowserRouter` で囲み忘れる

`useNavigate` などのフックは `BrowserRouter` の中でしか使えません。「`useNavigate is not a function` のようなエラー」が出たら、まずここを疑います。

### 3. `Routes` と `Route` の違いを混同する

```jsx
// ❌ Routeを直接子要素にする
<Route path="/" element={<Home />} />

// ✅ Routesで包む
<Routes>
  <Route path="/" element={<Home />} />
</Routes>
```

v6からは `<Routes>` で囲むのが必須です。

### 4. `element` にコンポーネント自体を渡す

```jsx
// ❌
<Route path="/" element={Home} />

// ✅ JSX要素を渡す
<Route path="/" element={<Home />} />
```

### 5. `BrowserRouter` の中に `Routes` を書かずにフックを使う

`useParams`、`useNavigate`、`useLocation` などは、すべて `BrowserRouter` ツリーの内側でないと使えません。

## ✅ ベストプラクティス

1. **`Link` を必ず使う**：`<a>` はSPA外への外部リンクだけにします。
2. **`BrowserRouter` はアプリの一番外側に**：`main.jsx` 等のエントリーポイントで設定するのが定石。
3. **`NavLink` でアクティブ状態を表現**：CSSで現在地を強調できます。
4. **ルート定義は1箇所にまとめる**：`App.jsx` か専用の `routes.jsx` で。
5. **`useNavigate` の濫用に注意**：ボタンクリックでの遷移は `Link` で十分なことが多いです。

## 🔬 実践演習

### お題：3ページのサイトを作る

`/`、`/about`、`/contact` の3ページを持つ簡単なサイトを作ってみましょう。

ヒント：

- `BrowserRouter` でアプリを包む
- `Routes` と `Route` でURLとコンポーネントを対応づける
- `Link` でナビゲーションを作る

### 発展課題

- ログインボタンを作って、押すと `useNavigate` で `/dashboard` に飛ぶようにしてみましょう
- 現在のページのリンクだけ太字になるように `NavLink` でスタイルを当てましょう

## 📝 まとめ

- ルーティングは「URL → 表示コンポーネント」の対応です
- React単体ではできず、`react-router-dom` を使います
- `BrowserRouter` で囲み、`Routes`/`Route` で定義、`Link`/`useNavigate` で移動します
- `<a href>` ではなく `<Link>` を使うことでSPAらしい高速切り替えになります

## 🔗 関連ページ

- [[6-2-パラメータ-クエリ-ネストルート]]
- [[6-3-レイアウトとページ分割]]
- [[6-4-404-リダイレクト-保護ルート]]
- [[6-5-URLと連動する状態]]
- [[サンプル-ブログアプリ]]
- [[15-5-React-Routerデプロイ問題]]
