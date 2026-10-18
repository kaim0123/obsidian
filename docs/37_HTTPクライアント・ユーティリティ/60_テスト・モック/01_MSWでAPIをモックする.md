---
title: 01_MSWでAPIをモックする
created: 2026-09-25
tags:
  - HTTPクライアント
  - テスト
  - MSW
---

# MSWでAPIをモックする

> **ひとことで言うと**：MSW（Mock Service Worker）は、fetch や Axios を差し替えるのではなく、**ネットワークの手前で通信を横取りして偽の返事を返す**ライブラリ。同じモック定義を、テスト（Node.js）・ブラウザでの開発・Storybook で使い回せる。

## たとえ話で理解する

電話の練習をしたいとき、相手の電話機を改造する（`fetch` をモックする）のではなく、**交換台で「この番号にかかってきたらこう答える」と決めておく**。電話をかける側（アプリのコード）は何も変えなくていい。

## なぜ MSW か

| やり方 | 問題 |
|---|---|
| `vi.mock("axios")` で道具ごと差し替え | 道具を ky に替えるとテストが全部壊れる。インターセプターなどの共通処理がテストされない |
| 本物の開発サーバーに当てる | 遅い・データが変わる・エラーケースを再現しにくい |
| **MSW** | 共通クライアントも含めて本物のコードが動く。エラーや遅延も自在に作れる |

## 書き方（MSW v2）

```ts
// mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";

export const handlers = [
  http.get("https://api.example.com/users/:id", ({ params }) => {
    return HttpResponse.json({ id: Number(params.id), name: "Taro" });
  }),
];
```

### テスト（Vitest / Jest）

```ts
// test/setup.ts
import { setupServer } from "msw/node";
import { handlers } from "../mocks/handlers";

export const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" })); // 定義漏れを検知
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### エラーケースをそのテストだけで上書き

```ts
it("500 のときエラーメッセージを出す", async () => {
  server.use(
    http.get("https://api.example.com/users/:id", () =>
      HttpResponse.json({ message: "boom" }, { status: 500 }),
    ),
  );
  // …画面を描画して表示を確認
});
```

```ts
// タイムアウトの確認
http.get(url, async () => { await delay("infinite"); });
// ネットワークエラーの確認
http.get(url, () => HttpResponse.error());
```

### ブラウザでの開発

```ts
import { setupWorker } from "msw/browser";
export const worker = setupWorker(...handlers);
// バックエンドが未完成でも画面を作り進められる
```

## テストしておきたいケース

- 成功（通常データ・0件・大量データ）
- 400/422（項目エラーの表示）、401（トークン更新→再送）、500（リトライ→エラー表示）
- タイムアウト・ネットワークエラー
- 遅いレスポンス（ローディング表示）

Orval の `mock: true` を使えば、OpenAPI 定義からハンドラを自動生成できる（[[02_OpenAPIからクライアントを生成する]]）。

## 関連
- テスト全体の方針 → 81_テスト戦略、83_テストツール
