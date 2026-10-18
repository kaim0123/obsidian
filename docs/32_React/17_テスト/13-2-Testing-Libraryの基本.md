# 13-2. Testing Libraryの基本（ユーザー目線）

## 🎯 この章で学ぶこと

- React Testing Library（RTL）の哲学
- 主要API：`render`、`screen`、`getBy*`
- userEvent でユーザー操作を再現

---

## 📖 RTL の哲学

> 「**ユーザーが画面で見える・できる操作**」だけをテストする

実装詳細（state、props、internal）は触らない。理由：

- 実装変更でもテストが壊れない
- ユーザー視点なので意味のあるテスト
- アクセシビリティが自然に意識される

---

## 💻 基本構文

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('テスト名', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);

  // 要素を探す
  const button = screen.getByRole('button', { name: '送信' });

  // 操作する
  await user.click(button);

  // 検証する
  expect(screen.getByText('送信完了')).toBeInTheDocument();
});
```

3ステップ：

1. **render**：コンポーネントを描画
2. **screen から要素を取得**
3. **user.* で操作・assert**

---

## 💻 要素の探し方（クエリ）

### 推奨順位

1. **`getByRole`**：アクセシビリティ的にも正しい
2. `getByLabelText`：フォーム
3. `getByPlaceholderText`：プレースホルダー
4. `getByText`：テキスト
5. `getByDisplayValue`：input の現在値
6. `getByAltText`：画像
7. `getByTitle`：title属性
8. `getByTestId`：最終手段（`data-testid` 必要）

### Role を使う例

```tsx
screen.getByRole('button', { name: '送信' });
screen.getByRole('textbox', { name: 'メール' });
screen.getByRole('heading', { name: 'タイトル' });
screen.getByRole('link', { name: 'About' });
screen.getByRole('checkbox');
```

→ Role を使うとアクセシビリティテストにもなる。

### `find` / `query` / `getAll` の違い

| 種類 | 見つからないとき | 用途 |
| --- | --- | --- |
| `getBy*` | エラー | 同期、必須 |
| `queryBy*` | null返却 | 「**ない**」を確認 |
| `findBy*` | リトライ後エラー | 非同期、後で出る要素 |
| `getAllBy*` | 配列 | 複数 |

```tsx
// 「ない」を確認
expect(screen.queryByText('エラー')).not.toBeInTheDocument();

// 後で出る要素を待つ
const item = await screen.findByText('ロード完了');
```

---

## 💻 user-event で操作

```tsx
const user = userEvent.setup();

await user.click(button);             // クリック
await user.dblClick(element);          // ダブルクリック
await user.type(input, 'hello');       // 入力
await user.clear(input);                // クリア
await user.selectOptions(select, 'jp'); // セレクト
await user.upload(input, file);         // ファイル
await user.tab();                        // Tab
await user.keyboard('{Enter}');         // キー
await user.hover(element);               // ホバー
```

`user.type` は `fireEvent.change(...)` より**実際の操作に近い**（focus、keydown含む）。

---

## 💻 アサーション

```tsx
expect(element).toBeInTheDocument();
expect(element).toBeVisible();
expect(element).toBeDisabled();
expect(element).toBeChecked();
expect(element).toHaveValue('hello');
expect(element).toHaveTextContent('Hello');
expect(element).toHaveClass('active');
expect(element).toHaveAttribute('aria-label', '閉じる');
```

`@testing-library/jest-dom` で追加されるマッチャー。`setup.ts` で読み込んでおく。

---

## 💻 例：完全なテスト

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginForm from './LoginForm';

describe('LoginForm', () => {
  it('メールとパスワードを入力して送信', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText('メール'), 'test@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');
    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  it('空欄で送信するとエラー', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'ログイン' }));

    expect(screen.getByText('メールは必須です')).toBeInTheDocument();
  });
});
```

---

## 💻 setup を共通化

```tsx
function setup(ui) {
  return {
    user: userEvent.setup(),
    ...render(ui),
  };
}

it('...', async () => {
  const { user } = setup(<Component />);
  await user.click(...);
});
```

---

## ❌ よくある間違い

### `getByTestId` を多用

```tsx
<button data-testid="submit">送信</button>
screen.getByTestId('submit');
```

→ ✅ `getByRole('button', { name: '送信' })`。

### 実装詳細を testしてしまう

```tsx
expect(component.find('div.list')).toHaveLength(3); // ❌
```

→ ✅ ユーザー視点：`expect(screen.getAllByRole('listitem')).toHaveLength(3)`。

### sleep / setTimeout で待つ

```tsx
await new Promise((r) => setTimeout(r, 1000));
```

→ ✅ `await screen.findByText('完了')` で要素を待つ。

### container を直接操作

```tsx
const { container } = render(<App />);
container.querySelector('.btn');
```

→ ✅ `screen` を使う。

---

## ✅ ベストプラクティス

1. **getByRole 優先**
2. **userEvent で本物っぽく操作**
3. **findBy で非同期**を待つ
4. **screen を使う**（containerは最後の手段）
5. **describe/it で構造化**

---

## 🔬 実践演習

`Counter` コンポーネント（+1ボタン、リセット）：

- 初期表示が "0"
- +1 を押すと "1"
- リセットを押すと "0"
- 全てを RTL でテスト

---

## 📝 まとめ

- ユーザー視点でテスト
- getByRole 優先、findBy で非同期
- userEvent.setup() で本物に近い操作
- screen 経由でアクセス

---

## 🔗 関連ページ

- [[13-1-テストの種類]]
- [[13-3-モックとテストデータ]]
- [[13-4-フォーム-非同期のテスト]]
