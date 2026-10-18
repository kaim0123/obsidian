# テストでの使い分け（Vitest・Playwright・Storybook）

MSW の強みは、**同じハンドラを複数の環境で使い回せる**ことです。一方で、環境ごとに横取りの仕組みが違うので、セットアップや注意点も変わります。この章では、Vitest・Vitest Browser Mode・Playwright・Storybook・開発サーバーでの MSW の使い方と、どこでモックしてどこで本物を使うかの判断をまとめます。

---

## 1. 全体像

| 環境 | MSW の API | 目的 |
|------|-----------|------|
| **Vitest（jsdom / Node）** | `setupServer`（`msw/node`） | 画面単位の Integration テストで API を差し替える |
| **Vitest Browser Mode** | `setupWorker`（`msw/browser`） | 本物のブラウザで動くコンポーネントテスト |
| **Playwright（E2E）** | 基本は使わない／使うなら `page.route` か MSW の Playwright 連携 | 主要フローは本物の API、再現しにくい状況だけモック |
| **Storybook** | `msw-storybook-addon` | ストーリーごとに API の状態（成功・空・エラー）を切り替える |
| **開発サーバー** | `setupWorker` | バックエンドが未完成でも画面を作り進める |

```
          handlers.ts（共通）
         ／     │      ＼        ＼
   Vitest   Storybook   開発サーバー   （Playwright は必要な場面だけ）
```

---

## 2. Vitest（jsdom / Node）

セットアップは [[01_MSWの仕組みとセットアップ]] のとおり。テストの書き方の例です。

```ts
test('ユーザー一覧を表示する', async () => {
  render(<UserList />);
  expect(await screen.findByRole('listitem', { name: /山田/ })).toBeInTheDocument();
});

test('0件のときは空の表示を出す', async () => {
  server.use(http.get('/api/users', () => HttpResponse.json([])));
  render(<UserList />);
  expect(await screen.findByText('ユーザーがいません')).toBeInTheDocument();
});
```

### 確かめたいパターン

| 状態 | ハンドラ |
|------|----------|
| 成功 | 共通ハンドラ |
| 0件 | `HttpResponse.json([])` |
| サーバーエラー | `new HttpResponse(null, { status: 500 })` |
| ネットワークエラー | `HttpResponse.error()` |
| 認証切れ | `new HttpResponse(null, { status: 401 })` |
| 読み込み中 | `await delay('infinite')` |

### リクエストの中身を確かめる

「正しい内容を送ったか」を確かめたいときは、ハンドラの中で受け取った値を記録します。

```ts
test('入力した内容で登録 API を呼ぶ', async () => {
  let body: unknown;
  server.use(
    http.post('/api/users', async ({ request }) => {
      body = await request.json();
      return HttpResponse.json({ id: 3 }, { status: 201 });
    }),
  );
  // …フォームに入力して送信…
  await waitFor(() => expect(body).toEqual({ name: '鈴木', email: 'suzuki@example.com' }));
});
```

- ただし、**画面に何が表示されたか**で確かめられるなら、そちらを優先します（送信後に「登録しました」が出る、など）。リクエストの中身の確認は、画面から分からないときの補助です。

### TanStack Query と組み合わせるとき

- テストごとに **新しい QueryClient** を作る（キャッシュが次のテストに残らないように）。
- `retry: false` にする（エラーのテストで再試行を待ってタイムアウトしないように）。

```ts
const createTestQueryClient = () =>
  new QueryClient({ defaultOptions: { queries: { retry: false } } });
```

---

## 3. Vitest Browser Mode

本物のブラウザで動くので、Node 用の `setupServer` ではなく**ブラウザ用の `setupWorker`** を使います。`public/mockServiceWorker.js` が必要です。

```ts
// vitest.setup.browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './src/mocks/handlers';

const worker = setupWorker(...handlers);
beforeAll(() => worker.start({ quiet: true, onUnhandledRequest: 'error' }));
afterEach(() => worker.resetHandlers());
afterAll(() => worker.stop());
```

テスト内の上書きは `worker.use(...)` になります（使い方は `server.use` と同じ）。

---

## 4. Playwright（E2E）

E2E テストは「本物がつながって動くか」を確かめるのが目的なので、**基本はモックしない**のがおすすめです。モックすると、フロントとバックエンドのずれを見逃します。

モックが必要になるのは、次のような場面です。

- 決済・SMS など、本物を呼ぶと費用や副作用がある外部サービス
- サーバーエラー・タイムアウトなど、本物では再現しにくい状況
- バックエンドがまだない

### page.route（Playwright 標準）

```ts
test('決済サービスが落ちているときはエラーを表示する', async ({ page }) => {
  await page.route('**/api/payments', (route) =>
    route.fulfill({ status: 503, json: { message: 'unavailable' } }),
  );
  await page.goto('/checkout');
  await page.getByRole('button', { name: '支払う' }).click();
  await expect(page.getByRole('alert')).toContainText('しばらくしてから');
});
```

- `page.route` はブラウザの外（Playwright 側）で横取りするので、MSW の Service Worker と**同時に使うと競合**することがあります。どちらか一方にそろえます。
- MSW のハンドラを E2E でも使い回したい場合は、MSW 公式の Playwright 連携（`@msw/playwright`）を使う方法もあります。

---

## 5. Storybook

`msw-storybook-addon` を入れると、ストーリーごとにハンドラを指定できます。

```ts
// .storybook/preview.ts
import { initialize, mswLoader } from 'msw-storybook-addon';
initialize();
export const loaders = [mswLoader];
```

```ts
// UserList.stories.ts
export const Default: Story = {};
export const Empty: Story = {
  parameters: { msw: { handlers: [http.get('/api/users', () => HttpResponse.json([]))] } },
};
export const Error: Story = {
  parameters: { msw: { handlers: [http.get('/api/users', () => new HttpResponse(null, { status: 500 }))] } },
};
```

- 成功・空・エラー・読み込み中の各状態を、画面で確かめながら作れます。
- Storybook の interaction test（play 関数）や、ストーリーを Vitest で実行する仕組みと組み合わせると、**ストーリーがそのままテストになります**。

---

## 6. どこでモックし、どこで本物を使うか

| レベル | API | 理由 |
|--------|-----|------|
| Unit | モックしない（API を呼ばないロジックだけをテスト） | 通信を含めない |
| Integration（Vitest） | **MSW でモック** | 画面の振る舞いを速く・安定して確かめる |
| E2E（Playwright） | **本物**（外部の有料サービスとエラーの再現だけモック） | つながりを確かめる |
| 契約テスト | 本物の API のスキーマと照合 | モックと本物のずれを防ぐ |

- **MSW のモックが本物の API とずれていく**のが最大のリスクです。OpenAPI からハンドラや型を生成する、E2E で本物と通す、などで定期的に照合します。

---

## 7. 関連項目

- [[02_ハンドラの書き方]]
- [[04_非同期UIとよくある間違い]]
- [[05_実践パターンとベストプラクティス]]（Playwright）
- [[02_テストの形（ピラミッド・Trophy・Honeycomb）]]

---

**前へ** ← [[02_ハンドラの書き方]]　｜　**最初に戻る** → [[MOC_テストツール]]
