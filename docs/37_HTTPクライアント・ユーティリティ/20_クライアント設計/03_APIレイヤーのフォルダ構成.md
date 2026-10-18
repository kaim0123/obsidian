---
title: 03_APIレイヤーのフォルダ構成
created: 2026-09-25
tags:
  - HTTPクライアント
  - 設計
  - フロントエンド
---

# APIレイヤーのフォルダ構成

> **ひとことで言うと**：通信のコードを画面から切り離し、「共通クライアント（1つ）」→「エンドポイントごとの関数」→「画面から使うフック」の3段に分けて置く。画面は `getUser(42)` を呼ぶだけで、URL もヘッダーも知らなくてよい。

## たとえ話で理解する

家電の取扱説明書で「コンセントの電圧」を気にする人はいない。壁のコンセント（共通クライアント）→ 延長コード（APIの関数）→ 家電（画面）とつながっていて、家電側は差し込むだけ。電力会社が変わっても家電は買い替えない。

## よくある2つの置き方

### 1. 技術ごとにまとめる（小〜中規模）

```
src/
├── lib/
│   └── apiClient.ts        # 共通クライアント（baseURL・認証・エラー）
├── api/
│   ├── users.ts            # getUser, updateUser …
│   ├── orders.ts
│   └── types.ts            # 共通の型（ページング等）
└── hooks/
    └── useUser.ts          # TanStack Query でラップ
```

### 2. 機能ごとにまとめる（中〜大規模・feature-based）

```
src/
├── shared/api/
│   ├── client.ts           # 共通クライアント
│   └── errors.ts           # ApiError
└── features/
    ├── users/
    │   ├── api/
    │   │   ├── getUser.ts
    │   │   └── schemas.ts  # Zod スキーマ・型
    │   └── hooks/useUser.ts
    └── orders/
        └── api/ …
```

機能を消すときにフォルダごと消せるのが利点。フォルダ構成全体の考え方は 47_フロントエンド設計 を参照。

### 3. OpenAPI から生成する場合

```
src/
├── api/
│   ├── generated/          # 自動生成（手で編集しない・lint 対象外）
│   └── client.ts           # 生成クライアントの設定（baseURL・middleware）
└── features/…              # 生成された関数・フックを使う
```

→ [[02_OpenAPIからクライアントを生成する]]

## 各層の責任

| 層 | 知っていること | 知らなくてよいこと |
|---|---|---|
| 共通クライアント | baseURL、認証、タイムアウト、エラー整形 | どんなエンドポイントがあるか |
| APIの関数 | URL・メソッド・引数と戻り値の型 | 画面、キャッシュ |
| フック | キャッシュキー、再取得のタイミング | URL、ヘッダー |
| 画面 | 表示すること | 通信の詳細すべて |

## APIの関数の書き方

```ts
// features/users/api/getUser.ts
import { apiFetch } from "@/shared/api/client";
import { userSchema, type User } from "./schemas";

export async function getUser(id: number, signal?: AbortSignal): Promise<User> {
  const json = await apiFetch<unknown>(`/users/${id}`, { signal });
  return userSchema.parse(json); // 実行時にも形を確かめる
}
```

- **1エンドポイント＝1関数**。名前は `getX / listX / createX / updateX / deleteX` で揃える
- `signal` を受け取れるようにしておくと、TanStack Query のキャンセルと連動できる
- サーバーの形（snake_case など）と画面で使う形が違うなら、変換はこの層でやる

## 関連
- [[01_共通クライアントを1つ作る]]
- [[01_レスポンスの型とランタイム検証]]
- フックでのキャッシュ設計 → 36_状態管理/40_サーバー状態
