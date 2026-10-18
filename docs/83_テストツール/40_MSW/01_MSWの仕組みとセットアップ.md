# MSW の仕組みとセットアップ

**MSW（Mock Service Worker）** は、アプリが送る HTTP / GraphQL のリクエストを**ネットワークの手前で横取り**して、偽の応答を返すライブラリです。`fetch` や axios をモックする方法と違い、アプリのコードを一切変えずに、テスト・開発・Storybook で同じモックを使い回せます。なぜ MSW を使うかの短い紹介は [[01_MSWでAPIをモックする]]（37_HTTPクライアント・ユーティリティ）にあるので、この章では仕組みとセットアップを詳しく扱います（MSW v2 前提）。

---

## 1. どこで横取りするか

```
【他のモック方法】
  アプリ ──→ fetch をモック（vi.mock / vi.spyOn）   ← HTTP クライアントを差し替える
  アプリ ──→ axios をモック                         ← ライブラリごとにやり方が違う

【MSW】
  アプリ ──→ fetch / axios / ky … ──→ [MSW が横取り] ──✕ 本物のサーバー
                                         └→ ハンドラが偽の応答を返す
```

| 環境 | 横取りの仕組み | API |
|------|----------------|-----|
| **ブラウザ** | Service Worker がページのリクエストを受け取る | `setupWorker`（`msw/browser`） |
| **Node.js**（Vitest・Jest） | `http` / `https` / `fetch` などのモジュールに割り込む（Interceptors） | `setupServer`（`msw/node`） |
| **React Native** | Node と同じ仕組み | `setupServer`（`msw/native`） |

- アプリから見ると本物のネットワーク通信と同じなので、**HTTP クライアントを axios から fetch に替えてもテストはそのまま**動きます。
- ハンドラ（どの URL に何を返すか）は、ブラウザと Node で**共通のファイル**を使えます。

---

## 2. ファイル構成

```
src/
  mocks/
    handlers.ts    ← ハンドラの定義（共通）
    node.ts        ← テスト用（setupServer）
    browser.ts     ← 開発・Storybook 用（setupWorker）
public/
  mockServiceWorker.js  ← ブラウザ用のワーカースクリプト（生成する）
```

### handlers.ts

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: '山田' },
      { id: 2, name: '佐藤' },
    ]);
  }),
];
```

ハンドラの書き方は [[02_ハンドラの書き方]] で詳しく扱います。

---

## 3. テスト（Node）でのセットアップ

```ts
// src/mocks/node.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```ts
// vitest.setup.ts
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './src/mocks/node';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

| ライフサイクル | 何をするか | 忘れると |
|----------------|------------|----------|
| `listen()` | 横取りを始める | モックが効かず、本物に通信しに行く |
| `resetHandlers()` | テスト中に `server.use()` で足したハンドラを消す | 前のテストのエラー応答が次のテストに残る（たまに落ちるテストの原因） |
| `close()` | 横取りをやめる | 他のテストファイルに影響する |

### onUnhandledRequest

ハンドラが定義されていないリクエストが来たときの動きです。

| 値 | 動き | 使いどころ |
|----|------|------------|
| `'warn'`（デフォルト） | 警告を出して、本物に通信する | 開発中 |
| `'error'` | エラーにする | **テストではこれ推奨**。モックし忘れにすぐ気づける |
| `'bypass'` | 何もせず本物に通信する | 一部だけモックしたいとき |
| 関数 | 自分で判定する | 画像や静的ファイルは無視したい、など |

```ts
server.listen({
  onUnhandledRequest(request, print) {
    if (new URL(request.url).pathname.startsWith('/assets/')) return;
    print.error();
  },
});
```

### 相対 URL の注意

Node には「今のページの URL」がないので、`fetch('/api/users')` のような相対 URL は解決できません。jsdom 環境なら `location` があるので動きますが、Node 環境のテストでは**絶対 URL** を使うか、ベース URL を設定します。

---

## 4. ブラウザ（開発・Storybook）でのセットアップ

```bash
npx msw init public/ --save   # public/mockServiceWorker.js を生成
```

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

```ts
// src/main.tsx
async function enableMocking() {
  if (import.meta.env.MODE !== 'development') return;
  const { worker } = await import('./mocks/browser');
  return worker.start({ onUnhandledRequest: 'bypass' });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(<App />);
});
```

- `worker.start()` は Promise を返します。**アプリの描画より前に待つ**ことで、最初のリクエストから確実にモックされます。
- 本番ビルドに MSW が入らないよう、動的 import と環境の判定で切り分けます。
- ブラウザの開発者ツールの Network タブには、通常のリクエストとして表示されます（`[MSW] GET /api/users (200 OK)` のログも出ます）。

---

## 5. 他のモック方法との比較

| 方法 | 長所 | 短所 |
|------|------|------|
| `vi.mock('axios')` / `vi.spyOn(global, 'fetch')` | 手軽 | HTTP クライアントに依存する。URL・メソッド・ヘッダーの組み立てがテストされない |
| API 層の関数をモック（`vi.mock('./api')`） | 速い・単純 | API 層そのものはテストされない |
| **MSW** | 本物に近い。環境をまたいで使い回せる | セットアップが少し必要 |
| テスト用の本物の API サーバー | 一番本物に近い | 遅い・準備が重い |

---

## 6. 関連項目

- [[01_MSWでAPIをモックする]]（37）：入門
- [[02_ハンドラの書き方]]
- [[03_テストでの使い分け（Vitest・Playwright・Storybook）]]
- [[04_テストダブルの分類]]：MSW はスタブ／フェイクとして働く

---

**前へ** ← [[04_非同期UIとよくある間違い]]　｜　**次に読む** → [[02_ハンドラの書き方]]
