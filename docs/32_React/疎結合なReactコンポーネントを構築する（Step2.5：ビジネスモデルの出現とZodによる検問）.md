---
title: "疎結合なReactコンポーネントを構築する（Step2.5：ビジネスモデルの出現とZodによる検問）"
source: "https://qiita.com/koji0705/items/7be0010f33d1fdc8ff15"
author:
  - "[[koji0705]]"
published: 2026-04-26
created: 2026-05-09
description: "はじめに 前回までに、API→特定の型(Domain)に置き換える処理を実施しました。 普段はZodを使って変換しているので、ちょっと気持ち悪かったので、実装を修正します。(Reactの設計の話とは直接的関係ないですが、実装しようと思います) 【設計】Zodによる「..."
tags:
  - "clippings"
---
## はじめに

[前回](https://qiita.com/koji0705/items/adb43ad1b0cb7554553e) までに、API→特定の型(Domain)に置き換える処理を実施しました。  
　普段はZodを使って変換しているので、ちょっと気持ち悪かったので、実装を修正します。(Reactの設計の話とは直接的関係ないですが、実装しようと思います)

---

## 【設計】Zodによる「データの検問所」

APIからのデータは、フロントエンドにとっては「外部からの未検証な入力」です。  
これを直接Reactの状態（State）に入れてはいけません。入り口で **safeParse（検問）** を行い、不備があればその場で食い止め、クリーンな形に整えてから内部へ流します。

<iframe src="https://qiita.com/embed-contents/mermaid#qiita-embed-content__01352928239c833f876e8c60143f41e6" frameborder="0" height="926"></iframe>
- **Fetcher (Infrastructure)：** 外部APIと通信し、 **safeParse** を行います。Goの `if err != nil` のようにエラーをハンドリングし、UIをクラッシュさせない「データの消毒」を担います。
- **Domain (Model)：** Reactを一切インポートしない純粋なTypeScriptの世界です。Zodスキーマを用いて、データの形、初期値、日本語変換などの「知能」を定義します。

---

## 【Hands-on】実装：Zodで品質と型を保証する

### 1\. ディレクトリ構成

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

4 directories, 7 files
```

### 2\. コードの実装

#### STEP 1：【知能】Domain Object ( src/domain/User.ts )

Zodスキーマを「唯一の真実（Source of Truth）」として定義します。`.default()` を使うことで、UIから `undefined` を追放します。

```typescript
import { z } from "zod";

// 1. スキーマ定義：APIが値を返さない場合のデフォルト値もここで定義
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().default("名前なし"),
  type: z.enum(["ADMIN", "GENERAL"]).default("GENERAL"),
});

// 2. 型の抽出（Zodが定義した構造から自動で型を生成）
export type User = z.infer<typeof UserSchema>;
export const UserListSchema = z.array(UserSchema);

// 3. ビジネスロジック（純粋関数）
export const getUserTypeLabel = (type: User["type"]): string => {
  return type === "ADMIN" ? "管理者" : "一般ユーザー";
};

// 4. 初期状態（Null Object）
export const EMPTY_USER: User = {
  id: 0,
  name: "読み込み中...",
  type: "GENERAL",
};
```

#### STEP 2：【検問】Fetcher ( src/infrastructure/UserFetcher.ts )

`safeParse` を使い、例外に頼らず明示的にエラーハンドリングを行います。

```typescript
import { User, UserListSchema } from "../domain/User";

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await fetch("[https://jsonplaceholder.typicode.com/users](https://jsonplaceholder.typicode.com/users)");
    if (!res.ok) throw new Error("Network error");

    const rawData = await res.json();

    // 🕵️ safeParse による検問（Goの if err != nil スタイル）
    const result = UserListSchema.safeParse(rawData);

    if (!result.success) {
      // バリデーション失敗。ログを出し、UIには安全な「空データ」を返す
      console.error("バリデーション失敗:", result.error.format());
      return []; 
    }

    // 検証済みのクリーンなデータを返す
    return result.data;
  } catch (error) {
    console.error("通信エラー:", error);
    return [];
  }
};
```

#### STEP 3：【接着剤】Custom Hook ( src/hooks/useUserSearch.ts )

Hookはもはや通信の詳細は知りません。Fetcherを呼び、結果をStateに置くだけです。

```typescript
import { useState, useEffect } from "react";
import { User } from "../domain/User";
import { fetchUsers } from "../infrastructure/UserFetcher";

export const useUserSearch = () => {
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

## この設計がもたらす「バックエンド的な快適さ」

1. **UIから undefined チェックが消える**  
	Zodの `.default()` で初期値を保証し、Fetcherの入り口で `safeParse` するため、UIコンポーネントに届くときには `undefined` は駆逐されています。
2. **実行時の型保証**  
	TypeScriptの型はコンパイル時に消えますが、Zodは「今、実際に届いたJSON」を実行時に検証します。APIの仕様変更を即座に検知し、原因不明のクラッシュを防ぎます。
3. **単体テストの圧倒的な容易さ**  
	このロジックは React を一切インポートしていません。Vitestなどを使って、ロジックだけのテストをミリ秒単位で高速に実行できます。

---

## まとめ：Reactを「詳細」に追い込む

「非同期だから `undefined` になる」のはフロントエンドの宿命ですが、それをそのままUIに流し込むのは **設計の敗北** です。

**Fetcherで検問（消毒）し、Domainで品質を保証する。**

この規律を築くことで、React（フレームワーク）は単なる「データの表示器」という、あるべき姿に戻ることができます。バックエンドでRepository層やEntity層を大切にするのと同じ感覚を、ぜひフロントエンドにも持ち込んでみてください。

### 参考文献

- [Modularizing React Applications (Martin Fowler)](https://martinfowler.com/articles/modularizing-react-apps.html)
- [Zod Documentation](https://zod.dev/)

---

### 次回予告

今の構成でも十分強力ですが、さらなる課題があります。それは「APIのデータ構造」と「画面で見せたい形」が大きく乖離し始めた時の対応です。

次回、 **第3回：【上級編】階層型フロントエンドアプリケーション** では、複数のソースを統合する **Adaptor** の構築に加え、複雑な表示ロジックを捌く **ViewModel** の導入について解説します。

[1](#comments)

コメント一覧へ移動

X（Twitter）でシェアする

Facebookでシェアする

はてなブックマークに追加する

新規登録して、もっと便利にQiitaを使ってみよう

1. あなたにマッチした記事をお届けします
2. 便利な情報をあとで効率的に読み返せます
3. ダークテーマを利用できます
[ログインすると使える機能について](https://help.qiita.com/ja/articles/qiita-login-user)