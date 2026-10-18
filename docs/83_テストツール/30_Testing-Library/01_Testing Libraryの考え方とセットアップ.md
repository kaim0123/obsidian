# Testing Library の考え方とセットアップ

**Testing Library** は、UI コンポーネントを「ユーザーが使うのと同じやり方」でテストするためのユーティリティ群です。テストランナーではないので、Vitest や Jest の上で使います。この章では、Testing Library の設計思想と、パッケージ構成・Vitest でのセットアップをまとめます。React での最初の一歩は [[13-2-Testing-Libraryの基本]]（32_React）にあるので、ここではツールとしての全体像を扱います。

---

## 1. 指針

作者 Kent C. Dodds の言葉がそのまま設計方針になっています。

> The more your tests resemble the way your software is used, the more confidence they can give you.
> （テストがソフトウェアの使われ方に似ているほど、テストは信頼できる）

ここから、次のルールが導かれます。

| やること | やらないこと |
|----------|--------------|
| 画面に表示されたテキスト・ラベル・ロールで要素を探す | CSS クラス・コンポーネント名・内部の state で探す |
| クリック・入力などユーザーの操作で動かす | コンポーネントのメソッドを直接呼ぶ |
| 画面に何が表示されたかで確かめる | props や state の値を直接確かめる |

- 実装の詳細に依存しないので、**リファクタリングしてもテストが壊れにくい**（[[01_良い単体テストの条件]] の「リファクタリングへの耐性」）。
- ロールやラベルで探すため、**アクセシビリティの低いマークアップだとテストが書きにくい**。テストを書くことが、そのままアクセシビリティの改善につながります。

---

## 2. パッケージ構成

| パッケージ | 役割 |
|------------|------|
| `@testing-library/dom` | 中核。クエリ（`getByRole` など）と `waitFor` などの非同期ユーティリティ。フレームワークに依存しない |
| `@testing-library/react` | React 用。`render`・`renderHook` を提供し、内部で `dom` を使う |
| `@testing-library/vue` / `svelte` / `angular` など | 各フレームワーク用の `render` |
| `@testing-library/user-event` | 実際のユーザー操作に近いイベント列を発生させる（[[03_ユーザー操作とuser-event]]） |
| `@testing-library/jest-dom` | `toBeInTheDocument`・`toBeDisabled` など DOM 用のマッチャー。Vitest でも使える |

- React 用 v16 以降は `@testing-library/dom` を **peerDependency** として別途インストールする必要があります。

```bash
npm i -D @testing-library/react @testing-library/dom \
  @testing-library/user-event @testing-library/jest-dom jsdom
```

---

## 3. Vitest でのセットアップ

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // DOM を使うテストの環境
    setupFiles: ['./vitest.setup.ts'],
    globals: true,                 // describe / test / expect をグローバルに（任意）
  },
});
```

### vitest.setup.ts

```ts
import '@testing-library/jest-dom/vitest'; // マッチャーの登録と型の追加
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup(); // 描画したコンポーネントを毎回片付ける
});
```

- `globals: true` にしている場合、`@testing-library/react` は `afterEach` を自動で見つけて cleanup するので、上の `afterEach` は不要です。`globals: false` のときは明示的に書きます。
- TypeScript で `toBeInTheDocument` の型が出ないときは、`tsconfig.json` の `types` に `@testing-library/jest-dom` を入れる（または `/vitest` のエントリを import する）。

### 一部のテストだけ DOM 環境にする

ロジックのテストは Node 環境のほうが速いので、ファイル単位で切り替えられます。

```ts
// @vitest-environment jsdom
```

DOM 環境の選び方（jsdom / happy-dom / Browser Mode）は [[01_テストツールの全体像と選び方]] と [[06_カバレッジとUI・ブラウザモード]] を参照。

---

## 4. 基本の流れ

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

test('メールアドレスが空のままログインするとエラーが表示される', async () => {
  const user = userEvent.setup();
  render(<LoginForm />);                                           // 1. 描画

  await user.click(screen.getByRole('button', { name: 'ログイン' })); // 2. 操作

  expect(screen.getByRole('alert')).toHaveTextContent(            // 3. 確認
    'メールアドレスを入力してください',
  );
});
```

- `screen` は `document.body` 全体を対象にしたクエリの集まり。`render` の戻り値から取り出すより、`screen` を使うのが推奨です。
- Provider（Router・状態管理・QueryClient など）が必要なコンポーネントは、**カスタム render** を作って毎回包みます。

```tsx
// test/utils.tsx
const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);
export const renderWithProviders = (ui: React.ReactElement) =>
  render(ui, { wrapper: AllProviders });
```

---

## 5. カスタムフックのテスト

```ts
import { renderHook, act } from '@testing-library/react';

test('increment でカウントが増える', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

- ただし、フックは**それを使うコンポーネント経由でテストする**ほうがユーザーの使い方に近い。`renderHook` はライブラリとして公開するフックや、UI から切り離せるロジックに使います。

---

## 6. 関連項目

- [[13-2-Testing-Libraryの基本]]（32_React）：React での入門
- [[02_クエリの選び方]]
- [[03_ユーザー操作とuser-event]]
- [[04_非同期UIとよくある間違い]]

---

**次に読む** → [[02_クエリの選び方]]
