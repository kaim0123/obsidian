## 第9章 Playwright Advanced Topics — 実務テクニック集

この章では、公式ドキュメントの `Test assertions` / `Writing tests` / `Test configuration` / `Trace viewer` などから、  
**実務で効いてくる一歩踏み込んだテクニック**をまとめます。

08 章までで「どのアサーションがあるか」「どう書くか」を学んだ前提で、

- タイムアウト・リトライ戦略
- ソフトアサーション・ポーリング
- テスト全体の設計との関係（フック・フィクスチャ）
- デバッグ・トレース

といったトピックを扱います。

---

## 1. タイムアウトとリトライ戦略

### 1-1. 3 つのタイムアウトを区別する

Playwright まわりのタイムアウトは、主に次の 3 種類があります。テストが「タイムアウトで失敗した」ときに、**どのタイムアウトに引っかかったのか**を区別できると、素早く原因を特定できます。

| 種類 | 何が待つか | デフォルト | 設定場所 |
|------|-----------|-----------|---------|
| **アサーションのタイムアウト** | `expect(locator).toHaveText(...)` などが条件を満たすまで | 約 5 秒 | `expect.timeout` |
| **アクションのタイムアウト** | `click()` / `fill()` / `goto()` が操作可能になるまで | 設定による | `use.actionTimeout` |
| **テスト全体のタイムアウト** | 1 つの `test(...)` 全体の実行時間 | 30 秒 | `timeout` |

```
テスト全体のタイムアウト（30秒）
├── goto()      → アクションのタイムアウト
├── click()     → アクションのタイムアウト
├── expect()    → アサーションのタイムアウト（5秒）
└── expect()    → アサーションのタイムアウト（5秒）
```

公式ドキュメントでは、これらを混同せず、**どこにボトルネックがあるのかを意識する**ことが推奨されています。

### 1-2. アサーション単位でタイムアウトを伸ばす

一時的なネットワーク遅延などで「このアサーションだけ少し長く待ちたい」という場合は、  
第二引数にオプションを渡します。

```ts
await expect(page.getByRole('alert'), { timeout: 15000 }).toContainText('処理が完了しました');
```

- デフォルト 5 秒 → この行だけ 15 秒に延長
- 常に長くするとテスト全体が重くなるので、「このケースだけ」に絞るのがポイントです。

### 1-3. コンフィグでグローバルな期待値タイムアウトを調整

`playwright.config.ts` の `expect` セクションで、デフォルト値を変えられます。

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  expect: {
    // すべての expect のデフォルトを 7 秒に変更
    // デフォルトの 5 秒では足りないが、個別に毎回書くのは面倒な場合に使う
    timeout: 7000,
  },
});
```

- API が遅めのシステムでは、ここを少しだけ伸ばすとテストが安定しやすくなります。
- ただし、**根本的な遅さの隠蔽にならないように注意**（本当に遅いならアプリ側の改善も検討する）。

> **判断基準**: 「5 秒で足りないテストが全体の半分以上ある」→ グローバルに伸ばす。「特定の 1〜2 本だけ遅い」→ その行だけ `{ timeout: 15000 }` を付ける。

### 1-4. テスト全体のタイムアウト

長い E2E シナリオの場合は、テスト自体のタイムアウトにも注意が必要です。

```ts
test('長めのシナリオ', async ({ page }) => {
  test.setTimeout(60_000); // このテストだけ 60 秒に
  // ...
});
```

`defineConfig` の `timeout` でグローバルに設定することもできますが、  
**特別に長いシナリオだけ個別設定する**ほうが原因切り分けはしやすくなります。

---

## 2. ソフトアサーションとポーリング

### 2-1. `expect.soft` — 複数の失敗をまとめて見たいとき

フォーム初期値のように、「全部チェックした上でどこが違うか一覧で見たい」ケースでは  
**ソフトアサーション**が便利です。

```ts
test('プロフィール初期値', async ({ page }) => {
  await page.goto('/profile');

  await expect.soft(page.getByLabel('名前')).toHaveValue('山田 太郎');
  await expect.soft(page.getByLabel('メールアドレス')).toHaveValue('taro@example.com');
  await expect.soft(page.getByLabel('部署')).toHaveValue('品質保証部');
});
```

- 通常の `expect` は、最初に失敗したところでテストが止まります。
- `expect.soft` は、失敗してもテストは続行し、**最後にまとめてレポート**します。

UI の微調整時など、「どこがずれているか」を一気に確認したいときに有効です。

### 2-2. `expect.poll` — ページ外の値をリトライしながら監視

API や DB の状態など、「ブラウザ外の値」を一定時間ポーリングしたい場合は `expect.poll` を使います。

```ts
await expect
  .poll(async () => {
    const response = await fetch('https://api.example.com/tasks/123/status');
    const json = await response.json();
    return json.state;
  })
  .toBe('completed');
```

ポイント:

- コールバック内の処理を、指定のタイムアウトまで繰り返し実行
- 毎回の戻り値に対して matcher（ここでは `toBe('completed')`）を適用
- 「ジョブが完了するまで待つ」などの **バックエンド連携テスト** で役立ちます。

---

## 3. フック・フィクスチャとの組み合わせ

### 3-1. フックで「前提条件のアサーション」を行う

`beforeEach` 内で「前提状態」をアサートしておくと、  
本体のテストでは「差分」だけに集中できます。

```ts
test.describe('ダッシュボード', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('ユーザー名').fill('taro');
    await page.getByLabel('パスワード').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 前提条件のアサーション
    await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
  });

  test('ウィジェットが表示される', async ({ page }) => {
    await expect(page.getByText('売上サマリー')).toBeVisible();
  });
});
```

- もしログインに失敗した場合、すべてのテストで同じ場所で落ちる → 原因が特定しやすい。
- 本体テストは「ダッシュボードの何を確認したいか」だけを書けばよい。

### 3-2. フィクスチャでアサーションロジックを隠蔽する

頻繁に出てくるアサーションは、フィクスチャやヘルパー関数に隠してしまうとテストが読みやすくなります。

```ts
// helpers/dashboard.ts
export async function expectDashboardLoaded(page: Page) {
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible();
}
```

```ts
// テスト側
import { expectDashboardLoaded } from '../helpers/dashboard';

test('ダッシュボードで売上が見える', async ({ page }) => {
  // ... ログインなど ...
  await expectDashboardLoaded(page);
  await expect(page.getByText('今月の売上')).toBeVisible();
});
```

アサーションが複雑になってきたら、「**名前を付けて 1 か所にまとめる**」のが公式ベストプラクティスとも整合する設計です。

---

## 4. 並列実行とアサーションの注意点

### 4-1. テストは互いに独立させる

Playwright Test はデフォルトでテストを並列実行します。  
そのため、次のような構造は避けるべきです。

```ts
// ❌ 悪い例: このテストが先に動く前提
test('顧客を作成する', async ({ page }) => {
  // 顧客作成
});

// ❌ 悪い例: 上のテストが作ったデータ前提
test('作成された顧客を一覧で確認する', async ({ page }) => {
  // 一覧で存在を確認
});
```

代わりに、

- 各テストで必要なデータを毎回作る
- または、`beforeEach` / フィクスチャで共通のセットアップを行う

という形にすると、アサーションも安定します。

### 4-2. 並列実行時の競合とアサーション

テストごとに別のテストユーザーを使う・DB をテストごとに分離するなど、  
**データ競合を起こさない設計**にしないと、アサーション結果がテスト順序に依存してしまいます。

公式ドキュメントの `Best practices` でも、

- 「テストデータのスコープを小さく保つ」
- 「グローバルな共有状態を前提にしない」

ことが強く推奨されています。

---

## 5. デバッグ・トレースとアサーション

### 5-1. 失敗したアサーションのメッセージを読み解く

Playwright のアサーションエラーは、たいてい次の情報を含みます。

- 期待した値 (`Expected`)
- 実際の値 (`Received`)
- どの matcher が失敗したか
- スクリーンショットやトレースへのリンク（有効にしている場合）

テストが落ちたときは、まず **「どの matcher が、どんな差分で落ちているか」** を丁寧に読むと、  
闇雲に修正するよりはるかに早く原因にたどり着けます。

### 5-2. Trace Viewer でアサーション直前の状態を見る

`trace: 'on-first-retry'` などを設定しておくと、  
失敗したテストのトレースをブラウザで再生しながら確認できます。

```ts
// playwright.config.ts の一例
export default defineConfig({
  use: {
    trace: 'on-first-retry',
  },
});
```

Trace Viewer では、

- 各 `click` / `fill` / `expect` のタイミング
- DOM スナップショット
- ネットワークログ

などが確認できるので、「**アサーション直前に画面がどうなっていたか**」を視覚的に追えます。

---

## 6. まとめ — 「書ける」から「運用できる」へ

- この章では、アサーションを中心に、Playwright を **実務で安定運用するための周辺トピック** を扱いました。
  - タイムアウト・リトライの設計
  - ソフトアサーション / ポーリング
  - フック・フィクスチャとの組み合わせ
  - 並列実行・テスト独立性
  - Trace Viewer を使ったデバッグ
- すべての詳細は、必ず **最新の公式ドキュメント**も併読しながら確認してください。

ここまでの 01〜09 章を通して、

- 「Playwright でテストを書ける」だけでなく、
- 「チームで長期的に運用できるテストスイートを設計する」

ための考え方と具体的な書き方を身につけることを目指しています。

