---
title: "疎結合なReactコンポーネントを構築する（Step2：ビジネスモデルの出現)"
source: "https://qiita.com/koji0705/items/adb43ad1b0cb7554553e"
author:
  - "[[koji0705]]"
published: 2026-04-26
created: 2026-05-09
description: "はじめに 第1回では、コンポーネントからロジックを抜き出し、Custom Hookに閉じ込めることで「脳」と「体」を分離しました。 しかし、バックエンドエンジニアの皆さんは、今のHook（useUserSearch.ts）を見てこう思ったはずです。 「Hookの中に fe..."
tags:
  - "clippings"
---
## はじめに

第1回では、コンポーネントからロジックを抜き出し、Custom Hookに閉じ込めることで「脳」と「体」を分離しました。

しかし、バックエンドエンジニアの皆さんは、今のHook（ `useUserSearch.ts` ）を見てこう思ったはずです。  
「Hookの中に fetch（通信）も filter（加工）も直書きされている。これ、まだReactと密結合じゃないか？」

特に、フロントエンド特有の **「非同期による undefined 問題」** は依然として残っています。通信が完了するまでデータが `undefined` になるため、UI側で `user?.name` と書いたり、 `if (!user) return null` といった条件分岐が散らばる……。これは、バックエンドの実装経験者ほど強いストレスを感じる部分ではないでしょうか。

今回は、マーチン・ファウラー氏の提唱する **図4：ビジネスモデルの出現** に従い、Reactからロジックを完全に引き剥がす **「防波堤」** を作っていきます。

---

## 【解説】フロントエンドに「防波堤」を築く

APIから返ってくるデータは、しばしば不親切です。 `undefined` が混ざり、型はスネークケースで、日本語変換もされていない。

これを直接UI（React）に触れさせてはいけません。UIに届く前に **Fetcher** と **Domain** という2つの層で「消毒」し、完璧に整った状態で渡すのがこの設計のキモです。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__12c3fc6123a1662cd02201e0950028df" frameborder="0" height="261"></iframe>
- **Fetcher (Infrastructure)：** APIを叩き、返ってきた `undefined` 混じりのデータをデフォルト値で埋めて、綺麗な型に変換（マッピング）します。
- **Domain (Model)：** 「Enumを日本語にする」「初期状態を定義する」といった、UIの表示都合に依存しないビジネスルールを閉じ込めます。

---

## 【Hands-on】実装：Reactを「ただの表示器」にする

それでは、実際に手を動かしてリファクタリングしていきましょう。

### 1\. ディレクトリ構成

ロジック層をさらに細分化し、 `infrastructure` （Fetcher）と `domain` （Model）を新設します。

ディレクトリ構成

```text
src
├── App.tsx
├── components
│   ├── UserList.tsx
│   └── UserSearch.tsx
├── domain
│   └── User.ts
├── hooks
│   └── useUserSearch.ts
├── infrastructure
│   └── UserFetcher.ts
└── main.tsx
```

### 2\. コードの実装：初期値を保証し、undefined を殺す

#### STEP 1：【知能】Domain Object ( src/domain/User.ts )

ここでは、データが届く前の **「空の状態（初期値）」** を定義します。これにより、UIから `undefined` を追放します。

```typescript
export type UserType = "ADMIN" | "GENERAL";

export class User {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly type: UserType
  ) {}

  // 1. 日本語変換のロジック（UIコンポーネントに書かない！）
  get typeLabel(): string {
    return this.type === "ADMIN" ? "管理者" : "一般ユーザー";
  }

  // 2. 「空の状態」を定義（UIを undefined の呪いから救う）
  static empty(): User {
    return new User(0, "読み込み中...", "GENERAL");
  }

  // 3. APIレスポンスからのファクトリ（マッピングと消毒）
  static fromApi(data: any): User {
    return new User(
      data.id ?? 0,
      data.name ?? "名前なし",
      data.type ?? "GENERAL"
    );
  }
}
```

#### STEP 2：【足】Fetcher ( src/infrastructure/UserFetcher.ts )

APIとの通信をカプセル化します。Reactをインポートしないため、Node.js環境などでも再利用可能です。

```typescript
import { User } from "../domain/User";

export const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch("[https://jsonplaceholder.typicode.com/users](https://jsonplaceholder.typicode.com/users)");
  const data = await res.json();
  // APIデータをDomainモデルの配列に変換して返す
  return data.map((u: any) => User.fromApi(u));
};
```

#### STEP 3：【接着剤】Custom Hook ( src/hooks/useUserSearch.ts )

Hookの仕事は **「交通整理（オーケストレーション）」** だけになり、驚くほどスッキリします。

```typescript
import { useState, useEffect } from "react";
import { User } from "../domain/User";
import { fetchUsers } from "../infrastructure/UserFetcher";

export const useUserSearch = () => {
  // 初期値として User.empty() を使うことで、初回から「型」を保証する
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(query.toLowerCase())
  );

  return { query, setQuery, filteredUsers, loading };
};
```

---

## この設計がもたらす「快適さ」

1. **UIから undefined チェックが消える**  
	Domain層で `empty` 状態を定義したことで、通信中もUIには「空のUserオブジェクト」が渡ります。UI側で `user?.name` と書く必要はなく、常に `user.name` でアクセス可能です。
2. **ビジネスルールのカプセル化**  
	「ADMINなら管理者と表示する」というルールはDomain Objectの中にあります。表示文言を変える際、JSXを触る必要はありません。
3. **React非依存のユニットテスト**  
	`User.ts` や `UserFetcher.ts` は React を 1ミリもインポートしていません。Vitestなどの高速なツールで、ブラウザ環境をエミュレートすることなく、ロジックを100%検証できます。

---

## まとめ：Reactを「詳細」に追い込む

「非同期だから `undefined` になる」という現象はフロントエンドの宿命ですが、それをそのままUIに流し込むのは **設計の敗北** です。

**Fetcherで消毒し、Domainで初期値を保証する。**

この防波堤を築くことで、React（フレームワーク）は単なる「データの表示器」という、あるべき姿に戻ることができます。バックエンドでRepository層やEntity層を大切にするのと同じ感覚を、フロントエンドにも持ち込んでみてください。

### 参考文献

<iframe src="https://qiita.com/embed-contents/link-card#qiita-embed-content__465445b635f012c8dcedd4200beb5838" frameborder="0" height="112"></iframe>

---

### 次回予告

今の構成でも十分強力ですが、さらなる課題があります。それは「APIが本当に期待通りの型で返ってくるか？」という実行時の不安です。

次回、 **第3回：【上級編】階層型フロントエンドアプリケーション** では、複数のソースを統合する **Adaptor** の構築に加え、スキーマバリデーションライブラリ **Zod** を使った「実行時の型保証」を解説します。

「型定義」を単なるドキュメントから、外部からの不純物を一切通さない「最強の検問所」へと進化させ、究極に堅牢なフロントエンドを目指しましょう。

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