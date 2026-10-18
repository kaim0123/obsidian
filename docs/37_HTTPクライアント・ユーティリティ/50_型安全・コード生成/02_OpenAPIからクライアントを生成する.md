---
title: 02_OpenAPIからクライアントを生成する
created: 2026-09-25
tags:
  - HTTPクライアント
  - OpenAPI
  - 型安全
---

# OpenAPIからクライアントを生成する

> **ひとことで言うと**：バックエンドが OpenAPI（API の設計書）を出しているなら、URL・引数・レスポンスの型を**手で書き写さず、設計書から自動生成**する。APIが変わったら生成し直すだけで、合わなくなった呼び出しがコンパイルエラーとして見つかる。

## たとえ話で理解する

レストランのメニュー表（OpenAPI）を見ながら、店員が手書きで注文票を作ると写し間違える。メニュー表から**注文票を印刷する機械**を使えば、メニューが変わっても印刷し直すだけ。

## 代表的なツール（2026年）

| ツール | 生成するもの | 向いている場面 |
|---|---|---|
| **openapi-typescript + openapi-fetch** | 型だけを生成し、fetch ベースの小さなクライアント（約6KB）で呼ぶ | 軽く始めたい。生成物が型1ファイルで済む |
| **Orval** | 関数・TanStack Query / SWR のフック・Zod スキーマ・MSW モックまで生成 | React + TanStack Query で「統合層を丸ごと生成」したい |
| **Hey API（@hey-api/openapi-ts）** | SDK 関数＋プラグイン（TanStack Query・Zod など） | プラグインで必要なものだけ足したい |
| OpenAPI Generator | 多言語のクライアント | TypeScript 以外（Swift・Kotlin 等）も同じ定義から作る |

## openapi-fetch の例

```bash
npx openapi-typescript ./openapi.yaml -o ./src/api/generated/schema.d.ts
```

```ts
import createClient from "openapi-fetch";
import type { paths } from "./generated/schema";

export const client = createClient<paths>({ baseUrl: import.meta.env.VITE_API_BASE_URL });

// 共通処理は middleware で差し込む
client.use({
  onRequest({ request }) {
    request.headers.set("Authorization", `Bearer ${getAccessToken()}`);
    return request;
  },
});

const { data, error } = await client.GET("/users/{id}", {
  params: { path: { id: 42 } }, // パスもパラメータも型チェックされる
});
```

- 例外ではなく `{ data, error }` を返すスタイル
- 存在しないパスや、足りないパラメータはコンパイルエラーになる

## Orval の例（TanStack Query フックまで生成）

```ts
// orval.config.ts
import { defineConfig } from "orval";

export default defineConfig({
  api: {
    input: "./openapi.yaml",
    output: {
      target: "./src/api/generated/endpoints.ts",
      client: "react-query",
      mock: true, // MSW のハンドラも生成
    },
  },
});
```

```ts
const { data } = useGetUser(42); // 生成されたフックを使うだけ
```

## 運用のコツ

- **生成物はコミットするか、CI で毎回生成するかをチームで決める**。コミットするならレビューで API の変更が差分として見える
- 生成フォルダは手で編集しない（lint・フォーマット対象からも外す）
- baseURL・認証・エラー整形は生成物の外（`client.ts`）に置く（[[03_APIレイヤーのフォルダ構成]]）
- OpenAPI の定義が実装とずれていると意味がない。サーバー側でコードから定義を出す（または定義からサーバーの型を作る）仕組みとセットで考える → 45_API設計

## 関連
- [[01_レスポンスの型とランタイム検証]]
- [[01_MSWでAPIをモックする]]
