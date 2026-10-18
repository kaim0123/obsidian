---
title: "疎結合なReactコンポーネントを構築する（Step1：Custom Hooksによる責務の分割）"
source: "https://qiita.com/koji0705/items/c74fe71612a7e81e2693"
author:
  - "[[koji0705]]"
published: 2026-04-26
created: 2026-05-09
description: "はじめに Reactの実装は、最初責務やディレクトリ構成を意識しなくてもすんなり書いていけるのですが、プロジェクトの規模が大きくなりコードが増えていくと、次第にメンテナンスがしにくくなります。 「どんなディレクトリ構成がいいのか？」「責務はどのように分けていけばいいのか？..."
tags:
  - "clippings"
---
## はじめに

Reactの実装は、最初責務やディレクトリ構成を意識しなくてもすんなり書いていけるのですが、プロジェクトの規模が大きくなりコードが増えていくと、次第にメンテナンスがしにくくなります。

「どんなディレクトリ構成がいいのか？」「責務はどのように分けていけばいいのか？」  
これらは多くの開発者が直面する課題です。本シリーズでは、フロントエンドを単なる「見た目の層」ではなく、一つの「堅牢なアプリケーション」として設計する手法を学んでいこうと思います。

今回はその第一歩として、 **「CCustom Hooksによる責務の分割」** を解説・実装し、コンポーネントの疎結合化を目指します。

---

## 【解説】そもそもReactはどんなもの？？

### 1\. 命令型から宣言型へのパラダイムシフト

Reactを深く理解するために避けて通れないのが、 **命令型（Imperative）** と **宣言型（Declarative）** という考え方の違いです。

特にバックエンドの実装経験が豊富なエンジニアほど、UIの変化を「ボタンが押されたら、スピナを表示して、その次に入力を無効化する」といった一連のイベント駆動な「手順」として実装しがちです。実は私も、Reactを書き始めた当初はこの「手順」の思考から抜け出すのに苦労しました💦💦💦

しかし、Reactの本質はその逆、 **目的地を伝えるだけ** の「宣言型」にあります。

React公式ドキュメントでは、この違いを **タクシー** に例えて非常にわかりやすく説明しています。

[![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/599049/1e09ca8b-f5d6-490a-aa9c-8550f76ea80c.png)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2F1e09ca8b-f5d6-490a-aa9c-8550f76ea80c.png?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=712943b8a422469983f8dbe021be225d)<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__a6b31029af42fd995af7deb5c3f44a47" frameborder="0" height="112"></iframe>

- **命令型：** 運転手に「次の角を右に曲がって、その次は左、3つ目の信号を越えたら……」と一歩ずつ指示を出す（隣に乗っている人の負荷が高い）。
- **宣言型（React）：** 運転手に「目的地」を伝えるだけ。どう走るかは運転手（React）に任せる。

バックエンドのロジックが「処理の流れ」を設計するものであるのに対し、Reactの設計は **「その瞬間のデータの断面図（状態）がこれなら、画面はどうあるべきか」** という変換ルールを定義することに集中します。

### 2\. UIは「スナップショット」である

この「目的地を伝えるだけ」という仕組みを支えている概念が、 **スナップショットとしての state** です。

Reactにおいて、コンポーネントという「関数」を呼び出すことは、その瞬間のデータの状態を切り取った一枚の静止画（スナップショット）を得ることに他なりません。

> **公式の視点：**  
> 「関数から返される JSX は、その時点の UI のスナップショットのようなものです。その props、イベントハンドラ、ローカル変数はすべて、レンダー時における state を使用して計算されます。」  
> —— 出典： [スナップショットとしての state](https://ja.react.dev/learn/state-as-a-snapshot)

この考え方にシフトすると、設計の焦点は「UIをどう動かすか」から、 **「状態をどう定義し、どう分離するか」** へと移ります。

## 【設計】State management with hooks

ここまで見てきた「宣言的な設計」を、実際の物理的なファイル構成に落とし込むために、マーチン・ファウラー氏が提唱する「State management with hooks」という構造を採用します。

以下の図は、これから実装するアプリケーションの全体像です。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__ff999243109b77d9e3340f9531382020" frameborder="0" height="614"></iframe>

・ **Custom Hook（脳）** ： API通信やビジネスロジックを閉じ込めます。UIの見た目については一切知りません。  
・ **Container（接着剤）** ： 脳からデータを受け取り、体に流し込む「仲介役」です。  
・ **Presentational Component（体）** ： 渡されたデータをどう描画するかだけに集中します。

---

## 実装

では、実際に手を動かしながら学んでいこうと思います。

### 成果物

[![Step1.gif](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2Ffc08d5b0-f33e-4bc6-905c-5290c5f82d9b.gif?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=96882e89f6b7c4138bed5aa153b5af0e)](https://qiita-user-contents.imgix.net/https%3A%2F%2Fqiita-image-store.s3.ap-northeast-1.amazonaws.com%2F0%2F599049%2Ffc08d5b0-f33e-4bc6-905c-5290c5f82d9b.gif?ixlib=rb-4.0.0&auto=format&gif-q=60&q=75&s=96882e89f6b7c4138bed5aa153b5af0e)

ディレクトリ構成

```shell
~/develop/react/my-react-design$ tree src
src
├── App.tsx
├── components
│   ├── UserList.tsx
│   └── UserSearch.tsx
├── hooks
│   └── useUserSearch.ts
└── main.tsx

2 directories, 5 files
```

### 設計

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__ccf7708aa8abff77c9d80d815ef64b5f" frameborder="0" height="678"></iframe><iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__e9919a443ad8f887a543517742d13471" frameborder="0" height="531"></iframe>

```ts
import { UserSearch } from "./components/UserSearch";

function App() {
  return (
    <div className="App">
      {/* App.tsxは全体のレイアウトや、将来的なルーティング（React Router等）を受け持ちます。
        具体的なビジネスロジックや検索の仕組みは、すべて下のUserSearchの中に隠蔽されています。
      */}
      <header style={{ backgroundColor: "#282c34", padding: "20px", color: "white", textAlign: "center" }}>
        <h1>React Architecture Study</h1>
      </header>

      <main style={{ padding: "20px" }}>
        <UserSearch />
      </main>
    </div>
  );
}

export default App;
```

```ts
type User = {
  id: number;
  name: string;
};

type Props = {
  users: User[];
  query: string;
  onQueryChange: (val: string) => void;
  loading: boolean;
};

export const UserList = ({ users, query, onQueryChange, loading }: Props) => {
  if (loading) return <p>読み込み中...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <input
        type="text"
        value={query}
        placeholder="名前で検索..."
        onChange={(e) => onQueryChange(e.target.value)}
        style={{ marginBottom: "20px", padding: "8px", width: "300px" }}
      />
      <ul style={{ listStyle: "none", padding: 0 }}>
        {users.map((user) => (
          <li key={user.id} style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
            <strong>{user.name}</strong>
          </li>
        ))}
      </ul>
      {users.length === 0 && <p>該当するユーザーがいません。</p>}
    </div>
  );
};
```

```ts
import { useUserSearch } from "../hooks/useUserSearch";
import { UserList } from "./UserList";

export const UserSearch = () => {
  // ロジック（知能）を呼び出す
  const { query, setQuery, filteredUsers, loading } = useUserSearch();

  // 見た目（体）に流し込む
  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h1>ユーザー検索（Step 1）</h1>
      <UserList
        users={filteredUsers}
        query={query}
        onQueryChange={setQuery}
        loading={loading}
      />
    </div>
  );
};
```

```ts
import { useState, useEffect } from "react";

// APIから返ってくるデータの型定義
type User = {
  id: number;
  name: string;
  email: string;
};

export const useUserSearch = () => {
  const [users, setUsers] = useState<User[]>([]); // 全データ
  const [query, setQuery] = useState("");         // 検索窓の入力値
  const [loading, setLoading] = useState(true);   // ローディング状態

  // コンポーネントのマウント時に1回だけ実行
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  // データの導出（Derived State）
  // usersが変わるか、queryが変わるたびに自動で再計算される
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(query.toLowerCase())
  );

  return {
    query,
    setQuery,
    filteredUsers,
    loading,
  };
};
```

## 補足：なぜこの「分け方」が重要なのか

バックエンドエンジニアやQAの視点で見ると、この「物理的な分離」には以下の3つの大きなメリットがあります。

1. **「脳」と「体」の分離による認知負荷の低減**  
	`useUserSearch` は「どう計算するか（脳）」に、 `UserList` は「どう表示するか（体）」に専念しています。修正が必要な際、「計算ロジックならHook、表示崩れならComponent」と迷わず辿り着けます。
2. **副作用の局所化（不整合の防止）**  
	フィルタリング結果（ `filteredUsers` ）を別のStateにするのではなく、レンダリング時に「導出」しています。これにより、検索文字と表示結果がズレるという、命令型で起きがちなバグを構造的に防いでいます。
3. **単体テストのしやすさ**  
	ロジックがCustom Hookに隔離されているため、UIの複雑なDOMを操作することなく、データ取得やフィルタリングのロジックをテストしやすくなります。

---

## まとめ

設計の第一歩は、 **関心事をバラバラにして、それぞれを独立させること** です。  
まずはコンポーネントというタクシーに乗り込み、Reactという運転手に目的地を伝えるための「変換ルール」を綺麗に書き出してみましょう。

### 参考文献

- [React公式：React での UI への反応](https://ja.react.dev/learn/reacting-to-input-with-state)
- [React公式：スナップショットとしての state](https://ja.react.dev/learn/state-as-a-snapshot)
- [Modularizing React Applications (Martin Fowler)](https://martinfowler.com/articles/modularizing-react-apps.html)

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

## @koji0705のピックアップ記事

### 【フロントエンドテスト】PlaywrightでE2Eテストを実施する。

### 最近話題のターミナルGhosttyに入門してみた！

15いいね

投稿日2026年01月02日

### Google CalendarAPIを学ぶ(Step1:APIの仕様、リソースを理解する)

## 今日のトレンド記事

## AWS MCPサーバー超進化してGAしたらしい

## 【公式】レトロゲームエンジンPyxelが動く仕組み

## Copilot StudioをClaude Code化したら、Copilot Studio自身でPower Platformを構築できた話

## Qiita Conference 2026 5月27日(水)~29日(金)開催！

![](https://cdn.qiita.com/assets/public/official_campaigns/qiita_conference_2026/ogp_conference_2026-89c95b299fbfb7ac23921a4575bbabdb.jpg)

Qiita Conferenceは、AI時代のエンジニアに贈るQiita最大規模のテックカンファレンスです！

講演ゲスト（敬称略）

及川 卓也、牛尾 剛、広木 大地、西見 公宏、みのるんなど全12名のゲストが登壇！

[イベント詳細を見る](https://qiita.com/official-campaigns/conference/2026)