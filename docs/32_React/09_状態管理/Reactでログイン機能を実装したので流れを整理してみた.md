---
title: "Reactでログイン機能を実装したので流れを整理してみた"
source: "https://qiita.com/yuki_saito/items/ce4ae28294c209e00234"
author:
  - "[[yuki_saito]]"
published: 2026-04-16
created: 2026-05-09
description: "はじめに スケジュールを立てる能力を育てるアプリを開発しました。 ログインが面を実装したのだが、それの実装に四苦八苦したので、備忘録として書いておきます。 使用ファイル ログインに使っているファイルは以下です。 src/components/pages/Login...."
tags:
  - "clippings"
---

## 詳しい要約

**テーマ：React + Supabase でのログイン機能の実装の流れ**

スケジュール管理アプリで実装したログイン機能を、ログイン画面（Login.tsx）と認証状態を共有する AuthContext を中心に、コードの意味を順に解説した備忘録。Supabase の認証処理を関数に切り出し、Context でアプリ全体に認証状態を配り、未ログイン時は保護ルートで /login にリダイレクトする構成。

---

### 使用ファイルの構成

| ファイル | 役割 |
| --- | --- |
| `pages/Login.tsx` | ログイン画面。フォーム入力と `loginUser` 呼び出し |
| `supabaseFunction.tsx` | `loginUser` と `getSession`（Supabase 認証の実処理） |
| `supabase.tsx` | Supabase クライアント生成 |
| `hooks/AuthContext.tsx` | セッション取得・認証状態監視・`useAuth` 提供 |
| `router/Router.tsx` / `ProtectedRoute.tsx` | /login ルート定義 / 未ログイン時に /login へリダイレクト |
| `main.tsx` | `AuthProvider` でアプリ全体をラップ |
| `AppHeader.tsx` | `signOut` によるログアウトと /login への遷移 |

- `.env` に `VITE_SUPABASE_URL` と `VITE_SUPABASE_ANON_KEY` を定義。

### Login.tsx：ログイン処理

- `type LoginProps` で email・password を string 型で定義し、`React.FC` で関数コンポーネントを宣言。
- `handleLogin` は `await loginUser(email, password)` の結果を見て、エラーならアラートを出して中断、成功なら `useNavigate()` で `/` に遷移。
- react-hook-form の `handleSubmit` で、バリデーション成功時だけ `handleLogin` を呼ぶ。

### AuthContext.tsx：認証状態の共有

- `AuthState` 型：**session**（未ログインは null）/ **user** / **loading**（初回セッション取得中か）。
- `createContext<AuthState | null>(null)` で、props を渡さずにアプリ全体で認証情報を共有する準備をする。
- `AuthProvider` が `<App />` を包み、Context 経由で認証情報を配る。
- `useEffect(..., [])` の中で：
  1. `supabase.auth.getSession()` で現在のセッションを取得して state に保存。
  2. `onAuthStateChange` で認証状態の変化を監視し、最新の session に更新（使わない `_event` はアンダースコア付き）。
  3. クリーンアップで `subscription.unsubscribe()` し、リークを防ぐ。
- `useAuth` フックで `useContext(AuthContext)` を取り出し、Provider 外で使われたら明示的にエラーを投げる。

### まとめ

- ログイン処理（Supabase 呼び出し）と認証状態の共有（Context）を分けて実装している。
- `getSession` で初期状態を取り、`onAuthStateChange` で変化を監視、アンマウント時に購読解除する。
- 専用フック `useAuth` で Context を安全に取り出す。

## はじめに

スケジュールを立てる能力を育てるアプリを開発しました。  
ログインが面を実装したのだが、それの実装に四苦八苦したので、備忘録として書いておきます。

## 使用ファイル

ログインに使っているファイルは以下です。

- `src/components/pages/Login.tsx`  
	ログイン画面本体。フォーム入力と loginUser 呼び出しを担当
- `src/supabase/supabaseFunction/supabaseFunction.tsx`  
	loginUser と getSession を定義。Supabase認証の実処理
- `src/supabase/supabase.tsx`  
	Supabaseクライアント生成
- `src/hooks/AuthContext.tsx`  
	セッション取得、認証状態監視、useAuth を提供
- `src/router/Router.tsx`  
	/login ルート定義
- `src/router/ProtectedRoute.tsx`  
	未ログイン時に /login へリダイレクト
- `src/main.tsx`  
	AuthProvider でアプリ全体をラップ
- `src/components/ui/AppHeader.tsx`  
	ログアウト処理 (signOut) と /login への遷移

**設定**

- `.env`  
	VITE\_SUPABASE\_URL, VITE\_SUPABASE\_ANON\_KEY を定義

## 解説

## src/components/pages/Login.tsx

ログイン画面の本体です。コンポーネント化を行なっており、こちらにHTMLなどを記載してます。実際のコードは以下  
以下重要な部分をピックアップしました。

### 型の宣言

```tsx
type LoginProps = {
  email?: string;
  password?: string;
};
```

`type` を使って、メールアドレス、パスワードの型を指定します。型は全てstring型になります。

### コンポーネントの宣言

```tsx
const Login: React.FC = () => {
return(....)
}
```

`Login` という名前の関数コンポーネントを作るという宣言をしています。 `React.FC` は「これは React の関数コンポーネントですよ」という型です。

### ログイン処理

```tsx
const navigate = useNavigate();

  // Supabase の認証関数を呼び出し、成功時だけホーム画面へ移動する。
  // ログイン機能の実装。失敗したら、処理を中断してアラートを表示する。
  const handleLogin = async (email: string, password: string) => {
    const loginResult = await loginUser(email, password);

    if (loginResult.error) {
      alert(\`ログインに失敗しました: ${loginResult.error.message}\`);
      return;
    } else {
      console.log('ログイン成功:', loginResult.data);
      navigate('/');
    }
  };

  // react-hook-form の handleSubmit が、バリデーション成功時だけコールバックを実行する。
  // ログインが成功したら、"/"に遷移する。
  const onSubmit = handleSubmit((data) => {
    handleLogin(data.email!, data.password!);
  });
```

このコードはログインフォームを送信したときに認証して、成功したらトップページへ移動する処理です。

#### 画面の移行に使う関数を取得

```tsx
const navigate = useNavigate();
```

#### ログイン処理を任せる関数の作成

```tsx
const handleLogin = async (email: string, password: string) => {
  const loginResult = await loginUser(email, password);

  if (loginResult.error) {
    alert(\`ログインに失敗しました: ${loginResult.error.message}\`);
    return;
  } else {
    console.log('ログイン成功:', loginResult.data);
    navigate('/');
  }
};
```

`handleLogin` は引数に `email` と `password` を受け取り、ログインの処理（ `loginUser` ）を実行します。 `await` を使うことでログインの処理（ `loginUser` ）が終わるのを待ちます。  
ログインの処理が実行されたら、 `loginResult` に結果が返ってきます。もし失敗した場合は、「ログインに失敗しました」のアラートを出します。

### フォーム送信時に動く処理

```tsx
const onSubmit = handleSubmit((data) => {
  handleLogin(data.email!, data.password!);
});
```

画面の送信ボタンが押された時に動く処理です。 `form` で送信された値を `data` で受け取り、 `handleLogin` に渡し、実行する。

## src/hooks/AuthContext.tsx

セッション取得、認証状態監視、useAuth を提供してます。

### 型の宣言

```tsx
// 認証状態としてアプリ全体で参照したい値を定義
type AuthState = {
  // 現在のセッション情報（未ログイン時は null）
  session: Session | null;
  // 現在ログイン中のユーザー情報（未ログイン時は null）
  user: User | null;
  // 初回セッション取得中かどうか
  loading: boolean;
};
```

3つの型を宣言しています。現在のセッション状態(ログインしてるかどうか)を判断する `sessstion` 、現在ログインしてるユーザー情報 `user` 、ロード画面などに使う `loading` の3つです。

### 認証情報を共有する準備

```tsx
const AuthContext = createContext<AuthState | null>(null);
```

認証情報をアプリ全体で共有するための変数を作っています。  
`createContext(...)` が `Context` を作る関数です。 `Context` は親コンポーネントから子や孫コンポーネントまで、props を毎回渡さなくても値を共有できる仕組みです。これによって認証情報がアプリ全体で共有できます。　型の宣言で `AuthState` or `null` が入ることを明示し、初期値にnullを入れます。

### AuthProviderコンポーネント

```tsx
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
```

このコンポーネントは、外側から受け取った children を包み込みます。使い方は以下です。  
`src/main.tsx` に記載してます。

```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

`<App />` はアプリ全体が入ってます。これを包むことで、認証情報をcontext経由で配ります。

#### useEffect(() => {... }, \[\])

コンポーネントが最初、表示されたときに、1回だけ時移行します。

セッションの内容をまずは取得します。

```tsx
supabase.auth.getSession().then(({ data, error }) => {
  if (!error) setSession(data.session ?? null);
  setLoading(false);
});
```

例えばユーザーがすでにログイン済みであれば、 `data.session` に値が入り、未ログインなら `data.session` は `null` です。  
エラーがなければ、session を state に保存しています。

次にこれは 今後の認証状態の変化を監視する登録処理 です。

```tsx
const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
   setSession(nextSession);
   setLoading(false);
 });
```

`onAuthStateChange` は認証状態の変化したら動きます。その際に `nextSession` に最新の情報が入り、 `setSession(nextSession);`でsesstionが最新の状態になります。  
`AuthProvider` は `<App />` を囲ってるので、アプリが動いてる時は常に監視している状態です。  
`_event` は **受け取るけど使わない値です** Supabase は通常、「何のイベントが起きたか」「新しい session は何か」の2つを渡してきます。「何のイベントが起きたか」については、ここでは使わないでアンダースコアが付けて記載してます。

最後に監視の解除を行います。

```text
// コンポーネント破棄時に購読解除してリークを防ぐ
 return () => data.subscription.unsubscribe();
```

普段の画面遷移では監視は消えないが、アプリ全体が壊れるときや、親から外されたときに消えるように処理を追加してます。

### AuthContext の中身を安全に取り出すための専用フック

```text
export const useAuth = () => {
  // Context から認証状態を取得
  const ctx = useContext(AuthContext);
  // Provider 外で使われた場合は明示的にエラーにする
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
```

`const ctx = useContext(AuthContext);`でAuthContextの中身を取得し、エラーがあったら、 `if (!ctx) throw new Error('useAuth must be used within AuthProvider');`でスローします。

## おわりに

ログインページを作ってみたのですが色々と配慮しないといけない部分があり、かなり時間がかかってしまいました。  
こうしてアウトプットすると流れがわかって、よかったです！

## 参考

[Git hubプロジェクト](https://github.com/saitoyuki0925/TimeGap)  
[アプリ画面](https://time-gap-zeta.vercel.app/)

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